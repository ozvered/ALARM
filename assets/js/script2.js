$(function(){
/*
if (navigator.geolocation) {
  var timeoutVal = 10 * 1000 * 1000;
  navigator.geolocation.getCurrentPosition(
    displayPosition, 
    displayError,
    { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 }
  );
}
else {
  alert("Geolocation is not supported by this browser");
}
*/
function displayPosition(position) {
  alert("Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude);
}

function displayError(error) {
  var errors = { 
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  };
  alert("Error: " + errors[error.code]);
}

//================
 var arrComulativeDays = new Array(1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366);
  //=================================================================================================
  
  // ===================================== Kinssat / Yetziat Shabbath Handlers ======================
  
  function isGregorianLeapYear(y) 
  {
    return ((y % 400 == 0) || (y % 100 != 0 && y % 4 == 0));
  }

  /*
   * Returns the amount of days passed since the beginning of the year.
   */
  function daysSinceYearBegun(d, m, y) 
  {
    m--;
    // Add the number of days passed + 1 if the current year is a leap year.
    return arrComulativeDays[m] + d + (m > 2 && isGregorianLeapYear(y));
  }
  

  /*
   * This extremely complicated function, calculates the sunrise and sunset times.
   * Sunrise is stored at ret$[1]
   * Sunset is stored at ret$[2]
   * (ret$[0] - returns the status of the execution where 0 means success.
   */  
  function suntime(
  dy, mn, yr,
  sundeg, sunmin,
  londeg, lonmin, ew,
  latdeg, latmin, ns,
  timezone)
  {
    if (ew == "W")
      ewi = -1;
    else
      ewi = 1;
  
    if (ns == "N")
      nsi = 1;
    else
      nsi = -1;
      
  
    var success = 0;  // error code stored here.
  
    longitude = (londeg + lonmin/60.0) * ewi;
    latitude  = (latdeg + latmin/60.0) * nsi;
  
    
  
    var yday = daysSinceYearBegun(dy, mn, yr);
  
    
    var A = 1.5708; 
    var B = 3.14159; 
    var C = 4.71239; 
    var D = 6.28319;      
    var E = 0.0174533 * latitude; 
    var F = 0.0174533 * longitude; 
    var G = 0.261799 * timezone;
  
    var R = Math.cos(0.01745 * (sundeg + sunmin/60.0));
  
    var J;
  
    // twice through the loop
    //    i=0 is for sunrise
    //    i=1 is for sunset
    for (i = 0; i < 2; i++) 
      { 
    
        if(!i)
          J =  A;  // sunrise 
        else
          J = C;  // sunset
    
        var K = yday + ((J - F) / D); 
        var L = (K * .017202) - .0574039;              // Solar Mean Anomoly 
        var M = L + .0334405 * Math.sin(L);            // Solar True Longitude 
        M += 4.93289 + (3.49066E-04) * Math.sin(2 * L);
        
        // Quadrant Determination 
        if (D == 0) {
          // SHOULD NOT HAPPEN - ERROR HAS OCCURRED.  
          status = 1;
        } 
    
        while(M < 0)
          M = (M + D);
    
        while(M >= D)
          M = (M - D);
    
        if ((M / A) - Math.floor(M / A) == 0)
          M += 4.84814E-06;
    
        var P = Math.sin(M) / Math.cos(M);                   // Solar Right Ascension 
        P = Math.atan2(.91746 * P, 1); 
    
        // Quadrant Adjustment 
        if (M > C)
          P += D;
        else {
          if (M > A)
            P += B;
        } 
    
        var Q = .39782 * Math.sin(M);      // Solar Declination 
        Q = Q / Math.sqrt(-Q * Q + 1);     // This is how the original author wrote it! 
        Q = Math.atan2(Q, 1); 
    
        var S = R - (Math.sin(Q) * Math.sin(E)); 
        S = S / (Math.cos(Q) * Math.cos(E)); 
    
        if(Math.abs(S) > 1)
          status = 1;  // uh oh! no sunrise/sunset
    
        S = S / Math.sqrt(-S * S + 1); 
        S = A - Math.atan2(S, 1); 
    
        if(!i)
          S = D - S;  // sunrise
    
        var T = S + P - 0.0172028 * K - 1.73364;  // Local apparent time 
        var U = T - F;                            // Universal timer 
        var V = U + G;                            // Wall clock time 
        
        // Quadrant Determination 
        if(D == 0) {
          // SHOULD NOT HAPPEN - ERROR HAS OCCURRED.
          status = 1
        } 
        
        while(V < 0)
          V = V + D;
        while(V >= D)
          V = V - D;
        V = V * 3.81972; 
    
        if(!i)
          sunrise = V;  // sunrise
        else
          sunset = V;  // sunset
      } 

    var returnArray = new Array(status,sunrise,sunset);
  
    return returnArray;
  }
  
  /*
   * Converts the time received from the function "suntime" to a 24 hour time.
   * ret$ = "hour : minutes" 
   */
  function adjustTime(t) 
  {
    var hour;
    var min;
  
    var time = t;
  
    var hour = Math.floor(time);
  
    var min  = Math.floor((time - hour) * 60.0 + 0.5);
  
    if (min >= 60) {
       hour += 1;
       min  -= 60;
    }
    
    var ReturnTime = hour + ':' + ((min < 10) ? '0' : '') + min;
  
    return ReturnTime;
  
  }

  /*
   * This function calculates the Knissat & Yetziaat shabbath times.
   * It is currently set to calculate the time based on Jerusalem (no day light saving time)
   // Kinssat Shabbath
    var day_before = new Date(yom.getTime() - 86400000);
    db = day_before.getDate();
    mb = day_before.getMonth() + 1;
    yb = day_before.getUTCFullYear();
   */
  function calculateZmaniKinsatVeyetziatShabbath(dayG,monthG,yearG)
  {
  //'OTNIEL
    NorthOrSouth = "N";
    latd = 31;
    latm = 25;
    EastOrWest = "E";
    lngd = 35;
    lngm = 00;
    tz = 2;
    var arrZmanimRet = Array(2);
  
    var yom = new Date (yearG, monthG, dayG);
	/*
    // Check daylight saving time.
    // Daylight saving time in Israel: From the friday before the 2nd of April untill 10th of Tishrei.
    hebDate=GregToHeb(new Date (yearG, monthG, dayG));
    hebDateApril2=GregToHeb(new Date (yearG, 3, 2));

    var mdyDate = hebDate.split("/")
    var mdyDateApril2 = hebDateApril2.split("/")
    
    // If after the 2nd of April
    if ((monthG > 2) && (dayG > 1))
    {
      // If we are in the same hebrew year as the 2nd of april it means we are before the
      // 10th of Tishrei - hence Daylight saving time applies.
      if (mdyDate[2] == mdyDateApril2[2]) 
      {
        tz++;
      }
      // If we are a year after the 2nd of April, check to see if we are before the 10th
      // of Tishrei - DST still applies.
      else if ((mdyDate[2] > mdyDateApril2[2])
              && (mdyDate[0] == 1)
              && (mdyDate[1] < 10))
      {
        tz++;
      }
      
    }
	*/
    // motzei shabbat (3 small stars)
    time = suntime(dayG, monthG/*+1*/, yearG, 98, 30, lngd, lngm, EastOrWest, latd, latm, NorthOrSouth, tz);

    // If Sunset and sunrise have been calculated successfully.
    if(time[0] == 0)
    {
      // Set zman Yetsiat shabbath.
      arrZmanimRet[1] = adjustTime(time[2]);

    }
    
    // Kinssat Shabbath
    var day_before = new Date(yom.getTime() - 86400000);
    db = day_before.getDate();
    mb = day_before.getMonth()/* + 1*/;
    yb = day_before.getUTCFullYear();

    time = suntime(db, mb, yb, 90, 50, lngd, lngm, EastOrWest, latd, latm, NorthOrSouth, tz);
    // Set zman Kinssat shabbath
    arrZmanimRet[0] = adjustTime(time[2] - 22.0/60.0);
	
	time =  suntime(dayG, monthG/*+1*/, yearG, 91, 19, lngd, lngm, EastOrWest, latd, latm, NorthOrSouth, tz);
    arrZmanimRet[0] = adjustTime(time[1] );
    arrZmanimRet[1] = adjustTime(time[1]+0.5*(time[2]-time[1]) );

   
     return arrZmanimRet;
  }

  function showZmaniKinsatVeyetziatShabbath()
  {
  var i=0;
  
  var ii;
  var ZmaniShabbath = Array(2);
  
  var now = new Date();
  
  var mm = now.getMonth()
  var yyyy = now.getUTCFullYear()
  var mmyyyy = new Date()
  
  var firstDayDisplayed=getFirstDayGregorian();
  var day1=getFirstDayOfTheMonth();
  
  var prevM = getPreviousMonth();
  var nextM = getNextMonth();
  
  var prevY = mm == 0 ? currYear-- : currYear;
  var nextY = mm == 11 ? currYear++ : currYear;
    
  var maxDaysPreviousMonth = maxDays((prevM),currYear);
  var maxDaysCurrMonth=maxDays(currMonth,currYear);

  // Set all zmani shabbath for fridays of the previous month;
  for (ii=0 ; ii<day1 ; ii++){
    if ((ii % 7) == 5) // If Friday
    {
      ZmaniShabbath = 
                calculateZmaniKinsatVeyetziatShabbath(eval(firstDayDisplayed +"+"+ ii),prevM,prevY);
    
      if (toolTipCellText[ii] != "")    //event description will be displayed in a new line
          toolTipCellText[ii] += "<BR>"
      toolTipCellText[ii] += "כניסת שבת: " + ZmaniShabbath[0];

      if (toolTipCellText[ii+1] != "")    //event description will be displayed in a new line
          toolTipCellText[ii+1] += "<BR>"
      toolTipCellText[ii+1] += "צאת שבת: " + ZmaniShabbath[1];
    }
  }
  // Set all zmani shabbath for fridays of the current month;
  for (ii=day1;ii<=day1+maxDaysCurrMonth-1;ii++){
    if (ii % 7 == 5) // If Friday
    {
      ZmaniShabbath = 
                calculateZmaniKinsatVeyetziatShabbath(eval(ii-day1+1),currMonth,currYear);

      if (toolTipCellText[ii] != "")    //event description will be displayed in a new line
          toolTipCellText[ii] += "<BR>"
      toolTipCellText[ii] += "כניסת שבת: " + ZmaniShabbath[0];

      if (toolTipCellText[ii+1] != "")    //event description will be displayed in a new line
          toolTipCellText[ii+1] += "<BR>"
      toolTipCellText[ii+1] += "צאת שבת: " + ZmaniShabbath[1];
    }
  }
  // Set all zmani shabbath for fridays of the following month;
  for (ii=day1+maxDaysCurrMonth;ii<=41;ii++)
  {
    if (ii % 7 == 5) // If Friday
    {
      ZmaniShabbath = 
                calculateZmaniKinsatVeyetziatShabbath(eval(ii - maxDaysCurrMonth + 1),nextM,nextY);
      if (toolTipCellText[ii] != "")    //event description will be displayed in a new line
          toolTipCellText[ii] += "<BR>"
      toolTipCellText[ii] += "כניסת שבת: " + ZmaniShabbath[0];
    
      if (toolTipCellText[ii+1] != "")    //event description will be displayed in a new line
          toolTipCellText[ii+1] += "<BR>"      
      toolTipCellText[ii+1] += "צאת שבת: " + ZmaniShabbath[1];

    }
  }    
  }

 //======================

var max_alarms=4
, to_seconds = [3600, 60, 1];
	// Cache some selectors

	var clocks_holder,
		clock = $('#clock'),
		dialog = $('#alarm-dialog').parent(),
		alarm_set = $('#alarm-set'),
		alarm_clear = $('#alarm-clear'),
		time_is_up = $('#time-is-up').parent();

	// This will hold the number of seconds left
	// until the alarm should go off
	var after = 0,alarm_counter = -1;

	// Map digits to their names (this will be an array)
	var digit_to_name = 'zero one two three four five six seven eight nine'.split(' ');

	// This object will hold the digit elements
	var digits = {};

	// Positions for the hours, minutes, and seconds
	var positions = [
		'h1', 'h2', ':', 'm1', 'm2', ':', 's1', 's2'
	];

	// This object will hold the alarm_viewer elements
	var alarms = {};

	// Generate the digits with the needed markup,
	// and add them to the clock

	var digit_holder = clock.find('.digits');

	$.each(positions, function(){
		if(this == ':'){
			digit_holder.append('<div class="dots">');
		}
		else{

			var pos = $('<div>');

			for(var i=1; i<8; i++){
				pos.append('<span class="d' + i + '">');
			}

			// Set the digits as key:value pairs in the digits object
			digits[this] = pos;

			// Add the digit elements to the page
			digit_holder.append(pos);
		}

	});
	// Add the weekday names

	var weekday_names = 'א ב ג ד ה ו ש'.split(' '),
		weekday_holder = clock.find('.weekdays');

	$.each(weekday_names, function(){
		weekday_holder.append('<span>' + this + '</span>');
	});

	var weekdays = clock.find('.weekdays span');

//=============================
//BUILD COLLECTION OF ALARMS
var  clocks = $('#clocks');
var clocks_holder = clocks;//clocks.find('#clock');

var clock_outer=clocks_holder[0].innerHTML;
			for(var i=0; i<max_alarms; i++)buildalarm(i);
//=============================

	function 	buildalarm(i){
				clocks_holder.append(clock_outer);
				alarms[i]=clocks_holder.children(0)[i+1];
				alarms[i].id='Alarm'+(i+1);
				var a_clock= $('#'+alarms[i].id);
				var a_ampm = a_clock.find('.ampm');
				a_ampm.text(alarms[i].id);
								
				var weekdays = a_clock.find('.weekdays span');
				weekdays.click(function(){
				var dow=weekday_names.indexOf($( this ).text())
				weekdays.eq(dow).toggleClass('active');
				});
		
				var a_alarm = a_clock.find('.alarm');
				a_alarm.click(function(){
				a_alarm.toggleClass('active');
				});
	
				var a_digit_holder = a_clock.find('.digits');
				a_digit_holder.click(function(){
				var myAlarm=$( this ).parent().parent()[0].id;
				openDLG(a_clock);
				});
	}
	
	var dots = clock.find('.dots');
	dots.addClass('active');
	function 	timeInSecondsToArrDigits(timeInSeconds,timeArr){
			
			var hours = 0, minutes = 0, seconds = 0, tmp = 0;
			// There is an alarm set, calculate the remaining time

			tmp = timeInSeconds;

			hours = Math.floor(tmp/3600);
			timeArr=concatDigits(hours,timeArr)
			tmp = tmp%3600;

			minutes = Math.floor(tmp/60);
			timeArr=concatDigits(minutes,timeArr)
			tmp = tmp%60;

			seconds = tmp;
			timeArr=concatDigits(seconds,timeArr);
			return timeArr;
		}
	function 	concatDigits(intNum,digitsarr){
		if(intNum<=9)
		{
			digitsarr=digitsarr.concat('0');1
			digitsarr=digitsarr.concat(''+intNum);
		}
		else
		{
			digitsarr=digitsarr.concat((''+intNum).substring(0,1,1));
			digitsarr=digitsarr.concat((''+intNum).substring(1,2,1));
		}
		return digitsarr
	}
	function 	clearDigits(digits){
		digits.h1.attr('class', 'none');
		digits.h2.attr('class', 'none');
		digits.m1.attr('class', 'none');
		digits.m2.attr('class', 'none');
		digits.s1.attr('class', 'none');
		digits.s2.attr('class', 'none');
	}
	function 	fillDigits(digits,digitsArr){
		digits.h1.attr('class', digit_to_name[parseInt(digitsArr[0])]);
		digits.h2.attr('class', digit_to_name[parseInt(digitsArr[1])]);
		digits.m1.attr('class', digit_to_name[parseInt(digitsArr[2])]);
		digits.m2.attr('class', digit_to_name[parseInt(digitsArr[3])]);
		digits.s1.attr('class', digit_to_name[parseInt(digitsArr[4])]);
		digits.s2.attr('class', digit_to_name[parseInt(digitsArr[5])]);
	}
	function 	TimeToSec(timeArr){
			var obj={};
			var after=0;
			$.each(to_seconds, function(i){

			after += to_seconds[i] * parseInt(parseInt(timeArr[i]));
		});
	return after;
	}

	function 	build_digits_obj(digits_obj,digit_holder_selector){
	$.each(positions, function(i){
			if(this != ':')
			{
				var pos = digit_holder_selector.find('div').eq(i)
				// Set the digits as key:value pairs in the digits object
				digits_obj[this] = pos;
			}
	});

	}

	function 	readTimer(a_clock){
		var a_digit_holder = a_clock.find('.digits');
		var num=0;
		var digits={};
		build_digits_obj(digits,a_digit_holder);

		var digitsStr=digit_to_name.indexOf(digits.h1.attr('class'))+','+
		digit_to_name.indexOf(digits.h2.attr('class'))+','+
		digit_to_name.indexOf(digits.m1.attr('class'))+','+
		digit_to_name.indexOf(digits.m2.attr('class'))+','+
		digit_to_name.indexOf(digits.s1.attr('class'))+','+
		digit_to_name.indexOf(digits.s2.attr('class'))
		
		var ACTIVEweekdays = a_clock.find('.weekdays span.active').text();
		var ACTIVEalarm = a_clock.find('.alarm.active').length;
		var digitsArrr=digitsStr.split(',');
		var after=TimeToSec((digitsArrr[0]+digitsArrr[1]+','+digitsArrr[2]+digitsArrr[3]+','+digitsArrr[4]+digitsArrr[5]).split(','));
		
		return digitsStr+'~'+ACTIVEweekdays+'~'+ACTIVEalarm+'~'+after; 
	}
	// Run a timer every 0.5 second after update time to hide thedots

	function hideDots(){
	dots.removeClass('active');
	}
	// Run a timer every second and update the clock

	(function update_time(){
		var 	alarm = clock.find('.alarm'),
		ampm = clock.find('.ampm');
	var dots = clock.find('.dots');
	if(!dots.hasClass('active'))dots.addClass('active');
	setTimeout(hideDots, 500)
		// Use moment.js to output the current time as a string
		// hh is for the hours in 12-hour format,
		// mm - minutes, ss-seconds (all with leading zeroes),
		// d is for day of week and A is for AM/PM

		var now = moment().format("hhmmssdA");

		fillDigits(digits,now);
		
		var dow = now[6];
		
		// Mark the active day of the week
		weekdays.removeClass('active').eq(dow).addClass('active');

		// Set the am/pm text:
		ampm.text(now[7]+now[8]);
    var day_today = new Date();
    cd = day_today.getDate();
    cm = day_today.getMonth() + 1;
    cy = day_today.getUTCFullYear();
   var retArr=calculateZmaniKinsatVeyetziatShabbath(cd,cm,cy);
	ampm.text(retArr+"");		
		var noAlarmFlag=1,alarmsSetting=[];
		// Is there an alarm set?

		
			for(var i=0; i<max_alarms; i++)
			{
			var a_clock= $('#Alarm'+i);

			var a_counter = a_clock.find('input');
			alarm_counter=parseInt(a_counter.text());
	
			// Decrement the counter with one second
			if(alarm_counter != -1)	alarm_counter--;
			
			alarmsSetting[i]=readTimer(a_clock);
			
			var Arrsetting=alarmsSetting[i].split('~')
			var digitsStr=Arrsetting[0],ACTIVEweekdays=Arrsetting[1],ACTIVEalarm=Arrsetting[2],
			after =Arrsetting[3]
			
			if(ACTIVEweekdays!='' && ACTIVEalarm==1)//specific day allarm
				{noAlarmFlag=0;
				if(ACTIVEweekdays.indexOf(dow)>-1)
					//{common_alarm_counter=curr_alarm_counter;nearstAlarm=i;}
					{
					if(alarm_counter==-1)
						alarm_counter=renew_counter(after,alarm_counter);
					
					alarm_counter=tryRing(alarm_counter);				
					}
				}
			else if(ACTIVEweekdays=='' && ACTIVEalarm==1)//adHok allarm
				{
				if(alarm_counter==-1)
					alarm_counter=renew_counter(after,alarm_counter);
				if(alarm_counter>0){
						noAlarmFlag=0;
					}
				if(alarm_counter==0){
						a_clock.find('.alarm').removeClass('active');	
					}
				alarm_counter=tryRing(alarm_counter);	
			
				}
				a_counter.text(alarm_counter)
/*	
*/	
			}
	
			if(noAlarmFlag== 0){
				// Activate the alarm icon
				if(clock.find('.alarm.active').length==0)alarm.addClass('active');
			}	
			else
				if(clock.find('.alarm.active').length==1)alarm.removeClass('active')		;
	
		// Schedule this function to be run again in 1 sec
		setTimeout(update_time, 1000);

	})();

	function renew_counter(after,alarm_counter){
	var now = moment().format("HH,mm,ss");

	alarm_counter=after-TimeToSec(now.split(','));
	return 	alarm_counter;
	}
	function tryRing(alarm_counter){
	//if zero start ring if ringing decrement and try stop ring
		if(alarm_counter <= 0 && alarm_counter>=-15 && alarm_counter!=-1)
		{
			alarm_counter--;
			// Play the alarm sound. This will fail
			// in browsers which don't support HTML5 audio

			try{
				$('#alarm-ring')[0].play();
				beep(8,(alarm_counter*-1)%2);
				}
			catch(e){
			//alert('This browser doens''t support HTML5 audio');
			time_is_up.fadeIn();
			}
			
			alarm_counter--;
			//alarm.removeClass('active');
			//clear_alarm($('#Alarm1'));
		}
		else{//==-1 ||  <=-15
			// The stop ring so have to intizlzite to -1
			alarm_counter=-1;
		}
		return 	alarm_counter;

	
	}
	// Switch the theme

	$('#switch-theme').click(function(){
		clock.toggleClass('light dark');
	});


	// Handle setting and clearing alamrs

	$('.alarm-button').click(function(){
		
		// Show the dialog
		dialog.trigger('show');

	});

	dialog.find('.close').click(function(){
		dialog.trigger('hide')
	});

	dialog.click(function(e){

		// When the overlay is clicked, 
		// hide the dialog.

		if($(e.target).is('.overlay')){
			// This check is need to prevent
			// bubbled up events from hiding the dialog
			dialog.trigger('hide');
		}
	});


	alarm_set.click(function(){
		after = 0;
		var valid = true;
		var now_seconds=0;
		var now_arr=eval('['+moment().format('HH,mm,ss')+']');

		dialog.find('input').each(function(i){

			// Using the validity property in HTML5-enabled browsers:

			if(this.validity && !this.validity.valid){

				// The input field contains something other than a digit,
				// or a number less than the min value

				valid = false;
				this.focus();

				return false;
			}

			after += to_seconds[i] * parseInt(parseInt(this.value));

			now_seconds += to_seconds[i] * parseInt(parseInt(now_arr[i]));
			
		});

		if(!valid){
			alert('Please enter a valid number!');
			return;
		}

		/*
		if(alarm_counter < 1){
			alert('Please choose a time in the future!');
			return;	
		}
		*/
		if(after >86399){
			alert('Please choose a valid time!');
			return;	
		}

		var a_clock= $('#'+dialog.find('h2').text().split(' ')[1]);
		var a_digit_holder = a_clock.find('.digits');
		var num=0;

		var a_counter = a_clock.find('input');
		alarm_counter=after-now_seconds;
		if(alarm_counter>0)a_counter.text(alarm_counter);

		var a_digits={};
		build_digits_obj(a_digits,a_digit_holder);

		a_alarm = a_clock.find('.alarm');
		a_dots = a_clock.find('.dots');
		a_dots.addClass('active');
		a_alarm.addClass('active');
		var timeArr=[];
		timeArr=timeInSecondsToArrDigits(after,timeArr);		
		fillDigits(a_digits,timeArr);

		dialog.trigger('hide');
	});
	
	function clear_alarm(a_clock){
		var a_digit_holder = a_clock.find('.digits');
		var num=0;
		var a_digits={};
		build_digits_obj(a_digits,a_digit_holder);

		a_alarm = a_clock.find('.alarm');
		a_dots = a_clock.find('.dots');
		a_dots.removeClass('active');
		a_alarm.removeClass('active');
		clearDigits(a_digits);
	}

	alarm_clear.click(function(){
		alarm_counter = -1;
		var a_clock= $('#'+dialog.find('h2').text().split(' ')[1]);
		clear_alarm(a_clock);
		dialog.trigger('hide');
	});

	// Custom events to keep the code clean
	dialog.on('hide',function(){

		dialog.fadeOut();

	}).on('show',function(){

		openDLG($('#Alarm1'));

	});
	
	function openDLG(a_clock){
		var h2=dialog.find('h2').eq(0);
		oltAlt=h2.text().split(' ')[1];//old alarm title
		h2.text(h2.text().replace(oltAlt,a_clock[0].id));
		
		var timeArr=readTimer(a_clock).split('~')[0].split(',');
		if (timeArr[0] == '-1')timeArr=[0,0,0,0,0,0]		;
		
		// Update the input fields
		dialog.find('input').eq(0).val(timeArr[0]+timeArr[1]).end().eq(1).val(timeArr[2]+timeArr[3]).end().eq(2).val(timeArr[4]+timeArr[5]);


		dialog.fadeIn();

	}
	time_is_up.click(function(){
		time_is_up.fadeOut();
	});

});
//================
var beep = (function (duration, type) {
    var ctx = new(window.audioContext || window.webkitAudioContext);
    return function (duration, type, finishedCallback) {

        duration = +duration;
				// Only 0-4 are valid types.
        type = (type % 5) || 0;

        if (typeof finishedCallback != "function") {
            finishedCallback = function () {           
            };
        }

        var osc = ctx.createOscillator();

        osc.type = type;

        osc.connect(ctx.destination);
        osc.noteOn(0);
        setTimeout(function () {
//    		console_log(duration+','+osc.type);
            osc.noteOff(0);
            finishedCallback();
        }, duration);

    };
})();