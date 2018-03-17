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

  //creating a function that I want to pass to the timer function to tell it what to do
  var counter = 0;
  function count(){
     counter++;
      $("#clock").html(timeConverter(counter));
  }

  var timer;
  var currentTime;
  //add functionality for starting a timer
  $('#start').click(function() {
      counter = 0;
        $("#timerZone").show();
        $("#stop").show();
        $("#submit").show();
      timer = setInterval(count, 1000);
  });
      
  //add functionality for stopping the timer
  var offsetTime;
  $('#stop').click(function() {
      clearInterval(timer);
      $("#clear").show();
      $("#log").show();
      $("#stop").hide();
  });

  //give the option of clearing in case you don't want to log your time
  $("#clear").click(function (){
    $("#clock").empty();
    $("#clear").hide();
    $("#log").hide();
    $("#submit").hide();
  });

 
  //so far I'm just pushing times to an array and then the user can submit their total at once
  var times=[];
  var timeUnit={};
  $('#log').click(function(){
    var time = $("#clock").html();
    times.push(time);
    var day = moment().format("dddd MMM YYYY");
    timeUnit = {
        "times": times,
        "day": day,
        "total": ""
    };    
      $("#timeTable > tbody").append("<tr><td>" + day + "</td><td>" + time + "</td></tr>")
  
      return timeUnit;
  });
 
  //once you're done logging your  various times you can push them to the database
  $("#submit").on('click', function (){
    
    var times = timeUnit["times"];
    var converted = times.map( time => {
      return stringToInt(time);
    });
    //the value in seconds comes back within the map function but the array itself is undefined on line 81
    //it worked when I returned it.  Is it because I'm using vanilla JS and scoping issues??
    console.log(converted);
    var reducer = (acc, curVal) => acc + curVal;  
    var x = converted.reduce(reducer);
    //I want to find the total number of seconds spent working and convert to a percentage of 8 hours
    var hrs = x/3600;
    var progress = Math.round((hrs/8) * 100);
    $('#dailyTotal').html(`You logged ${timeConverter(x)} total time today which is ${progress}% of your 8 hour goal!`);
    timeUnit["total"] = timeConverter(x);
    timekeeper.ref().push(timeUnit);    
    $('#timerZone').hide();
     
    $("#progress").attr("aria-valuenow", progress.toString());
    $("#progress").attr("style", `width: ${progress}%`);
    $("#progbar").show(); 
  })

  //grab times from the db and add them to your table
  timekeeper.ref().on("child_added", function(snap){
    console.log(snap.val());

    var day = snap.val().day;
    var total = timeConverter(stringToInt(snap.val().total));
    
    $("#timeTable2 > tbody").append("<tr><td>" + day + "</td><td>" + total + "</td></tr>")
  });

//need a function to convert the stringified time back into an int value, then I can convert that numer into the total time
  function stringToInt(s){
    var hours;
    var minutes;
    var seconds;
    var total;

    var sections = s.split(":");

    if (sections.length === 3){
      hours = sections[0] * 3600;
      minutes = sections[1] * 60;
      seconds = sections[2];
      total = hours + minutes + seconds;
      
    }
    else if (sections.length === 2){
      minutes = parseInt(sections[0]) * 60;
      seconds = parseInt(sections[1]);
      total = minutes + seconds;
  
    }
    return total;
  }


//need to take an int value and convert it into proper time format
//better add hours in as well in case I need them
  function timeConverter(t) {
      var hours = Math.floor(t/3600);

      var minutes = Math.floor((t / 60)-(hours * 60));
        //var minutes = Math.floor(t/60);
      //var seconds = t - (minutes * 60);
      var seconds = t - (hours * 3600) - (minutes * 60);
      
      
    
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
    
      if (minutes === 0) {
        minutes = "00";
      }
      else if (minutes < 10) {
        minutes = "0" + minutes;
      }
      //new
      if (hours === 0){
        hours = "00";
      }
      else if (minutes < 1) {
        hours = "0" + hours;
      }
      console.log(hours + ":" + minutes + ":" + seconds);
    
    
      return hours + ":" + minutes + ":" + seconds;
    }

