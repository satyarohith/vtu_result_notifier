#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const toml = require('toml');
const equal = require('fast-deep-equal');
const {isToday, isPast} = require('date-fns')
const generateHTML = require('./generatehtml');

let config;
let runcount = 0;
let announcementsSnapshot;

try {
  const configPath = path.normalize(`${process.cwd()}/vrn.toml`);
  config = toml.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  if (err.code = 'ENOENT') {
    console.error(`Please create a vrn.toml config file at the root of current working directory.`);
    console.log(`Refer: https://git.io/fj13W`)
  } else {
    throw err;
  }
  process.exit(1);
}

const RESULTS_URL = "http://results.vtu.ac.in";

async function sendEmail(message) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(config.sendgrid);

  await sgMail.send(message, true);
}

function getAnnouncements($, scheme = "CBCS") {
  let schemeNumber;

  if (scheme = "CBCS") schemeNumber = 1
  else if (scheme === "NON-CBCS") schemeNumber = 2
  else if (scheme === "REVAL CBCS") schemeNumber = 3
  else if (scheme === "REVAL NON-CBCS") schemeNumber = 4;

  const announcements = [];

  $(`div.lgm-${schemeNumber} > div.logmod__form`).find('div > div.panel-heading').each((_index, element) => {
    announcements.push({
      text: $(element).find('b').text(),
      url: `${RESULTS_URL}/${$(element).attr('onclick').split("'")[1]}`,
    });
  });

  return announcements;
}

function getResultsUpdatedDate($) {
  // This regx matches dates like 28/05/2018, 28-05-2018 and 28.05.2018.
  const dateRegx = /\d{2}([.\-/])\d{2}\1\d{4}/;
  const dateString = $(`div.row div.text-center > label`).text().match(dateRegx)[0];
  const date = dateString.split('/'); // Split at `/` to seperate month, day and year.
  // Create a valid date using the above values.
  const resultsUpdatedDate = new Date(date[2], (date[1] - 1), date[0]);

  return resultsUpdatedDate;
}

function getBEAnnouncements($, scheme) {
  const searchResults = [];
  const announcements = getAnnouncements($, scheme);

  announcements.map((announcement) => {
    if (announcement.text.includes("B.Tech") || announcement.text.includes("B.E")) {
      searchResults.push(announcement);
    }
  });

  return searchResults;
}

async function main() {
  try {
    const {data: html} = await axios.get(RESULTS_URL);
    const $ = cheerio.load(html);

    const resultsUpdatedDate = getResultsUpdatedDate($);

    if (isPast(resultsUpdatedDate) && !announcementsSnapshot) {
      announcementsSnapshot = getBEAnnouncements($, config.scheme);
      console.log('Saved a snapshot of the old announcements.');
      console.log('Snapshot:', announcementsSnapshot)
    } else if (isToday(resultsUpdatedDate)) {
      const announcements = getBEAnnouncements($, config.scheme);

      if (!equal(announcementsSnapshot, announcements)) {
        console.log('Seems like we got some new announcements.');
        console.log('New Announcements:', announcements);
        console.log('Old Announcements:', announcementsSnapshot);

        const message = {
          to: config.mail.to,
          from: config.mail.from,
          subject: config.mail.subject,
          html: generateHTML(announcements)
        };

        await sendEmail(message);
        console.log('Email sent. Shutting the program...');
        process.exit();
      }
    }
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
  }
}

console.log('Program started...')
setInterval(async () => {
  await main();
  runcount++;
  console.log(`[${new Date().toLocaleTimeString()}] I visited ${RESULTS_URL} for ${runcount} times.`);
}, (config.interval * 1000 * 60));