#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
const cheerio = require('cheerio');
const toml = require('toml');
const {dim, green} = require('chalk');
const equal = require('fast-deep-equal');
const {isToday, isPast} = require('date-fns');
const generateHTML = require('./generatehtml');

let config;
let runcount = 0;
let announcementsSnapshot;

const logTime = () =>
  `${dim(String(new Date().toLocaleDateString()))} ${green(
    new Date().toLocaleTimeString()
  )}`;

try {
  const configPath = path.normalize(`${process.cwd()}/vrn.toml`);
  config = toml.parse(fs.readFileSync(configPath, 'utf8'));
  if (
    !(typeof config.interval === 'number') ||
    !(typeof config.sendgrid === 'string') ||
    !(typeof config.mail === 'object') ||
    !(typeof config.results_url === 'string') ||
    !(typeof config.scheme === 'string')
  ) {
    console.log(
      `${logTime()} The vrn.toml file isn't properly configured. Please refer: https://git.io/fj13W`
    );
    process.exit(1);
  }
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(
      'Please create a vrn.toml config file at the root of current working directory.'
    );
    console.log('Refer: https://git.io/fj13W');
  } else {
    throw error;
  }

  process.exit(1);
}

async function sendEmail(message) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(config.sendgrid);

  await sgMail.send(message, true);
}

function getAnnouncements($, scheme = 'CBCS') {
  let schemeNumber;
  /* eslint-disable curly */
  if (scheme === 'CBCS') schemeNumber = 1;
  else if (scheme === 'NON-CBCS') schemeNumber = 2;
  else if (scheme === 'REVAL CBCS') schemeNumber = 3;
  else if (scheme === 'REVAL NON-CBCS') schemeNumber = 4;
  /* eslint-enable curly */

  const announcements = [];

  $(`div.lgm-${schemeNumber} > div.logmod__form`)
    .find('div > div.panel-heading')
    .each((_index, element) => {
      announcements.push({
        text: $(element)
          .find('b')
          .text(),
        url: `${config.results_url}/${
          $(element)
            .attr('onclick')
            // eslint-disable-next-line quotes
            .split("'")[1]
        }`
      });
    });

  return announcements;
}

function getResultsUpdatedDate($) {
  // This regx matches dates like 28/05/2018, 28-05-2018 and 28.05.2018.
  const dateRegx = /\d{2}([.\-/])\d{2}\1\d{4}/;
  const dateString = $('div.row div.text-center > label')
    .text()
    .match(dateRegx)[0];
  const date = dateString.split('/'); // Split at `/` to seperate month, day and year.
  // Create a valid date using the above values.
  const resultsUpdatedDate = new Date(date[2], date[1] - 1, date[0]);

  return resultsUpdatedDate;
}

function getBEAnnouncements($, scheme) {
  const searchResults = [];
  const announcements = getAnnouncements($, scheme);

  announcements.forEach(announcement => {
    if (
      announcement.text.includes('B.Tech') ||
      announcement.text.includes('B.E')
    ) {
      searchResults.push(announcement);
    }
  });

  return searchResults;
}

async function main() {
  try {
    const {data: html} = await axios.get(config.results_url, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    const $ = cheerio.load(html);

    const resultsUpdatedDate = getResultsUpdatedDate($);

    if (isPast(resultsUpdatedDate) && !announcementsSnapshot) {
      announcementsSnapshot = getBEAnnouncements($, config.scheme);
      console.log(`${logTime()} Saved a snapshot of the old announcements.`);
      console.log(`${logTime()} Snapshot:`, announcementsSnapshot);
    } else if (isToday(resultsUpdatedDate)) {
      const announcements = getBEAnnouncements($, config.scheme);

      if (!equal(announcementsSnapshot, announcements)) {
        console.log(`${logTime()} Seems like we got some new announcements.`);
        console.log(`${logTime()} New Announcements:`, announcements);
        console.log(`${logTime()} Old Announcements:`, announcementsSnapshot);

        const message = {
          to: config.mail.to,
          from: config.mail.from,
          subject: config.mail.subject,
          html: generateHTML(announcements)
        };

        await sendEmail(message);
        console.log(`${logTime()} Email sent. Shutting the program...`);
        process.exit();
      }
    }
  } catch (error) {
    console.error(`${logTime()} ${error.message}`);
  }
}

console.log(`${logTime()} Program started...`);
setInterval(async () => {
  await main();
  runcount++;
  console.log(
    `${logTime()} I visited ${config.results_url} for ${runcount} times.`
  );
}, config.interval * 1000 * 60);
