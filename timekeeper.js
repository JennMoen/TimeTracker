var config = {
  apiKey: "AIzaSyAXM30Ds4RVLwVVKPTuYqQq09vlTJ_mNSA",
  authDomain: "timekeeper-77233.firebaseapp.com",
  databaseURL: "https://timekeeper-77233.firebaseio.com",
  projectId: "timekeeper-77233",
  storageBucket: "timekeeper-77233.appspot.com",
  messagingSenderId: "545789233524"
};

firebase.initializeApp(config);

var timekeeper = firebase.database();

//don't want to show the div with the countdown info until they click start
//BUTTON FUNCTIONALITY IS SCREWY WITH MULTIPLE STOPS/RESTARTS
$("#stop").hide();
$("#clear").hide();
$("#log").hide();
$("#submit").hide();
$("#progbar").hide();

//function to pass to timer
var counter = 0;
function count() {
  counter++;
  $("#clock").html(timeConverter(counter));
}

var timer;
//add functionality for starting a timer
$("#start").click(function() {
  counter = 0;
  $("#timerZone").show();
  $("#stop").show();
  timer = setInterval(count, 1000);
});

//functionality for stopping the timer
$("#stop").click(function() {
  clearInterval(timer);
  $("#clear").show();
  $("#log").show();
  $("#stop").hide();
});

//give the option of clearing in case you don't want to log your time
$("#clear").click(function() {
  clearInterval(timer);
  $("#clock").empty();
  $("#clear").hide();
  $("#log").hide();
  $("#submit").hide();
});

//so far I'm just pushing times to an array and then the user can submit their total at once
var times = [];
var timeUnit = {};
$("#log").click(function() {
  $("#submit").show();
  var time = $("#clock").html();
  times.push(time);
  var day = moment().format("dddd MMM YYYY");
  timeUnit = {
    times: times,
    day: day,
    total: ""
  };
  $("#timeTable > tbody").append(
    "<tr><td>" + day + "</td><td>" + time + "</td></tr>"
  );

  return timeUnit;
});

//clear your time table if you need to
$("#clearTable").on("click", function() {
  times = [];
  $("#timeTable >tbody").empty();
});

//once you're done logging your various times you can push them all to the database as one entry
//times get totaled up and calculated as a total percentage of 8 hour work day
$("#submit").on("click", function() {
  var times = timeUnit["times"];
  var converted = times.map(time => {
    return stringToInt(time);
  });
  var reducer = (acc, curVal) => acc + curVal;
  var x = converted.reduce(reducer);
  var hrs = x / 3600;
  var progress = Math.round(hrs / 8 * 100);
  $("#dailyTotal").html(
    `You logged ${timeConverter(
      x
    )} total time today which is ${progress}% of your 8 hour goal!`
  );
  timeUnit["total"] = timeConverter(x);
  timekeeper.ref().push(timeUnit);
  $("#timerZone").hide();
  $("#progress").attr("aria-valuenow", progress.toString());
  $("#progress").attr("style", `width: ${progress}%`);
  $("#progbar").show();
});

//grab times from the db and add them to your table
timekeeper.ref().on("child_added", function(snap) {
  var day = snap.val().day;
  var total = snap.val().total;

  $("#timeTable2 > tbody").append(
    "<tr><td>" + day + "</td><td>" + total + "</td></tr>"
  );
});

//function to convert the stringified time back into an int value so I can add the array of times
function stringToInt(s) {
  var hours;
  var minutes;
  var seconds;
  var total;

  var sections = s.split(":");

  hours = parseInt(sections[0]) * 3600;
  minutes = parseInt(sections[1]) * 60;
  seconds = parseInt(sections[2]);
  total = hours + minutes + seconds;

  return total;
}

//function for converting an int into time format
function timeConverter(t) {
  var hours = Math.floor(t / 3600);
  var minutes = Math.floor(t / 60 - hours * 60);
  var seconds = t - hours * 3600 - minutes * 60;

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  if (minutes === 0) {
    minutes = "00";
  } else if (minutes < 10) {
    minutes = "0" + minutes;
  }

  if (hours === 0) {
    hours = "00";
  } else if (minutes < 1) {
    hours = "0" + hours;
  }

  return hours + ":" + minutes + ":" + seconds;
}
