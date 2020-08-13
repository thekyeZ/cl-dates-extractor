// const pdf = require("pdfreader");
const fs = require("fs");
const pdf = require("pdf-parse");
const moment = require('moment');

const readline = require("readline");
const { google } = require("googleapis");
const connection = require("./googleCal");

const CALENDAR_ID = "sm6av7td9l9ka88k683h71vhek@group.calendar.google.com";

connection(init);
let calendarObj, authObj;

function getPDFData(data) {
  //return el.match(/((\d\d\.\d\d\.\d\d\d\d)|(\d:\d\d-\d\d\:\d\d))/gm);

  let arr = data.text.split(/[1-9]{1,2} {1}\n/gm);
  let tmp = arr
    .filter((el) => !el.includes("przerwa") && !el.includes("Scrum Lab"))
    .filter((el) => el.length);

  let dates1 = tmp
    .map((el) => {
      return extract(el.replace(/^\s*\n/gm, ""));
    })
    .filter((el) => el.length > 2);

  let dates2 = dates1
    .map((el) => {
      return new Array(Math.ceil(el.length / 2))
        .fill()
        .map((_) => el.splice(0, 2));
    })
    .flat()
    .filter((el) => !el.includes("4h") && !el.includes("2h"));

  console.log(dates2);

  dates2.forEach((element) => {
    createEvent(element);
  });
}

function extract(str) {
  return str.match(/((\d\d\.\d\d\.\d\d\d\d)|(\d:\d\d-\d\d\:\d\d)|[2|4]h)/gm);
}

function createEvent(dateArray) {
  const [date, time] = dateArray;
  const [hourStart, hourEnd] = time.split('-').map(el => el.split(':')[0]);
  const [day, month, year] = date.split('.').map(el => Number(el));
  // date.replace('.', '-').split().reverse().join();

  console.log(new Date(Date.UTC(year, month-1, day, hourStart, 0)), new Date(Date.UTC(year, month-1, day, hourEnd, 0)));
//   console.log(moment(`${date} ${hourStart}`).format());
  const event = {
    summary: "Coders Lab - zajęcia",
    start: {
      dateTime:new Date(Date.UTC(year, month-1, day, hourStart-1, 0)),
        timeZone: "Poland",
    },
    end: {
      dateTime: new Date(Date.UTC(year, month-1, day, hourEnd-1, 0)),
      timeZone: "Poland",
    },
    reminders: {
      useDefault: true,
    },
  };


  insertEvent(event);
}

function insertEvent(event) {
  calendarObj.events.insert(
    {
      auth: authObj,
      calendarId: CALENDAR_ID,
      resource: event,
    },
    function (err, event) {
      if (err) {
        console.log(
          "There was an error contacting the Calendar service: " + err,
          event
        );
        return;
      }
      console.log("Event created: %s", event);
    }
  );
}

function init(auth) {
  calendarObj = google.calendar({ version: "v3", auth });
  authObj = auth;
  console.log("Authorized with Google Calendar!");

  let dataBuffer = fs.readFileSync("1.pdf");
  pdf(dataBuffer).then(getPDFData);
}

