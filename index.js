/**
 * VRN - VTU Result Notifier
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const toml = require('toml');
const equal = require('fast-deep-equal');
const { isToday, isPast } = require('date-fns')
const generateHTML = require('./generatehtml');
const { getResultsUpdatedDate, getBEAnnouncements } = require('./lib')

const configPath = path.normalize(`${__dirname}/vrn.toml`);
const config = toml.parse(fs.readFileSync(configPath, 'utf8'));

const RESULTS_URL = "http://results.vtu.ac.in";

async function sendEmail(message) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(config.sendgrid);

  await sgMail.send(message, true);
}

async function main() {
  try {
    const { data: html } = await axios.get(RESULTS_URL);
    const $ = cheerio.load(html);
    let ancmtSnapshot;

    const resultsUpdatedDate = getResultsUpdatedDate($);

    if (isPast(resultsUpdatedDate) && !ancmtSnapshot) {
      ancmtSnapshot = getBEAnnouncements($);
      console.log('Saved a snapshot of the old result.');
    } else if (isToday(resultsUpdatedDate)) {
      const announcements = getBEAnnouncements($);
      if (!equal(ancmtSnapshot, announcements)) {
        const message = {
          to: config.mail.to,
          from: config.mail.from,
          subject: config.mail.subject,
          html: generateHTML(announcements)
        };

        await sendEmail(message);
        console.log('Sent email.')
      }
    }
  } catch (error) {
    console.error(error);
  }
}

let runcount = 0;
setInterval(async () => {
  await main();
  runcount++;
  console.log(`I ran for ${runcount} times`);
}, (config.interval * 1000 * 60));