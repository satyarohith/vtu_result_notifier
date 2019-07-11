function getAnnouncements(scheme = "CBCS") {
  let schemeNumber = 1;

  if (scheme === "NON-CBCS") schemeNumber = 2
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

function getResultsUpdatedDate() {

  // This regx matches dates like 28/05/2018, 28-05-2018 and 28.05.2018.
  const dateRegx = /\d{2}([.\-/])\d{2}\1\d{4}/;
  const dateString = $(`div.row div.text-center > label`).text().match(dateRegx)[0];
  const date = dateString.split('/'); // Split at `/` to seperate month, day and year.
  // Create a valid date using the above values.
  const resultsUpdatedDate = new Date(date[2], (date[1] - 1), date[0]);

  return { resultsUpdatedDate };
}

function getBEAnnouncements($) {
  const searchResults = [];
  const announcements = getAnnouncements($);

  announcements.map((announcement) => {
    if (announcement.text.includes("B.Tech") || announcement.text.includes("B.E")) {
      searchResults.push(announcement);
    }
  });

  return searchResults;
}


module.exports = {
  getAnnouncements,
  getBEAnnouncements,
  getResultsUpdatedDate
}