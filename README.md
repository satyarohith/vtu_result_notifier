# VTU Result Notifier

### What should this software do?

Whenever VTU (The institute) releases a new result, VRN (VTU Result Notifier) will send an email to the subscribed consumers along with a link to check their results.

### How does it work?

When a human wants to check results, He will go to the website and see if there is a new announcement.

In the same way, we will create a bot that will go to the website on specified interval and check whether a new announcement has been made.

#### How to check if a new announcement is made?

We grab the html of the announcemnet tab and match the text for our results. For example, to check the results of BTECH 7th Sem, we just match the text with the text in the announcement tab.

#### How to send email?

We will use sendgrid to send emails. We need to grab an API key from sendgrid and use their node package to send emails.