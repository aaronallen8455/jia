window.onload = function() {
    var date = new Date();
    var currentDate = date.getDate(); //date number 1-31
    var currentDay = date.getDay(); //day of the week
    var currentMonth = date.getMonth();
    var currentYear = date.getFullYear();
    var calendarTable = document.getElementById('calendarTable');
    var calendarHeading = document.getElementById('calendarHeading'); //Displays the month and year
    var eventDisplayDiv = document.getElementById('eventDisplayDiv'); //container for the event display elements.
    var displayControl = document.getElementsByClassName('displayControlDiv'); //holds the next and previous links
    var lastDrawn = [currentYear, currentMonth]; //[0] last year, [1] last month drawn.
    var lastSelected = [currentYear,currentMonth,currentDate];
    var daysSelected = 7;
    
    function drawCalendar(year, month, currentDay, lastSelected, daysSelected) {
        //clear
        while (calendarTable.firstChild) {
            calendarTable.removeChild(calendarTable.firstChild);
        }
        calendarHeading.innerHTML = monthName(month) + ' ' + year;
        //Day of week headings
        var dowHeading = document.createElement('tr');
        calendarTable.appendChild(dowHeading);
        for (var i=0; i<7; i++) {
            var heading = document.createElement('td');
            var day = dayName(i)
            heading.innerHTML = day;
            dowHeading.appendChild(heading);
        }
        
        //create cells for the days
        var days = numDays(year, month);
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(1);
        var startingDay = date.getDay();
        for (var row=0; 7-startingDay+(row-1)*7<=days; row++) { //will typically be 5 rows but may need 6
            var tr = document.createElement('tr');
            for (var col=0; col<7; col++) {
                var td = document.createElement('td');
                tr.appendChild(td);
                if (row === 0 && col < startingDay)
                    continue;
                if (col - startingDay + 1 + 7*row > days)
                    continue;
                td.classList.add('tablecell-day');
                var link = document.createElement('a');
                link.setAttribute('href', '#');
                var _date = col - startingDay + 1 + 7*row;
                link.innerHTML = _date;
                //click event
                link.addEventListener('click', function(e) {
                    daySelectHandler(e,year,month,parseInt(this.innerHTML));
                });
                td.appendChild(link);
                //determine if this day is in the selected group
                if (year === lastSelected[0] || year === (lastSelected[0]+1)) { //could carry over into next year
                    if (_date >= lastSelected[2] && _date < lastSelected[2]+daysSelected && month === lastSelected[1]) {
                        td.classList.add('tablecell-selected');
                    }else if ((month === (lastSelected[1]+1)) || (month === 0 && lastSelected[1] === 11)) { //could carry over into next month
                        var carryOver = lastSelected[2]+daysSelected - numDays(lastSelected[0],lastSelected[1]);
                        if (carryOver > 0 && _date < carryOver) 
                            td.classList.add('tablecell-selected');
                    }
                }
                
                if (link.innerHTML == currentDay && month === currentMonth && year === currentYear)
                    td.classList.add('tablecell-today');
            }
            calendarTable.appendChild(tr);
        }
    }
    //onclick handler for day selection
    function daySelectHandler(e, year, month, _date) {
        if (e)
            e.preventDefault();
        lastSelected = [year, month, _date];
        drawCalendar(year, month, currentDate, lastSelected, daysSelected);
        //clear the display div
        while (eventDisplayDiv.firstChild) {
            eventDisplayDiv.removeChild(eventDisplayDiv.firstChild);
        }
        eventDisplayDiv.innerHTML = 'Fetching results...';
        var endDate = new Date();
        endDate.setFullYear(year);
        endDate.setMonth(month);
        endDate.setDate(_date+daysSelected-1);
        var msg = {start: year+'-'+('0'+(month+1)).slice(-2)+'-'+('0'+_date).slice(-2),
                  end: endDate.getFullYear()+'-'+('0'+(endDate.getMonth()+1)).slice(-2)+'-'+('0'+endDate.getDate()).slice(-2)};
        msg = JSON.stringify(msg); //the object sent to the ajax script
        //query the database
        var req = new XMLHttpRequest();
        req.open('POST','./ajax/calendar.php',true);
        req.setRequestHeader('Content-type', 'application/json');
        req.onreadystatechange = function() {
            if(req.readyState === 4) {
                eventDisplayDiv.innerHTML = ''; //remove the waiting message
                var result = req.responseText;
                //if script returned false
                if (result === 'false') {
                    eventDisplayDiv.innerHTML = 'An error occured!';
                    return false;
                }
                result = JSON.parse(result);
                //build content for each date
                /*
                var odd = 0; //keeps track of whether an element is odd numbered.
                for (var date in result) {
                    if (!result.hasOwnProperty(date)) continue;
                    var content = document.createElement('ul');//a list of all events for this date
                    var year = parseInt(date.slice(0,4));
                    var month = parseInt(date.slice(5,7))-1;
                    var day = parseInt(date.slice(8));
                    for (var ele in result[date]) {
                        if (!result[date].hasOwnProperty(ele)) continue;
                        var item = document.createElement('li');
                        var link = document.createElement('a');
                        link.setAttribute('href', './events.php?id='+ele.id);
                        item.appendChild(link);
                        content.appendChild(item);
                        //get start time values
                        var startPeriod = 'am';
                        var startHour = ele.start.slice(0,2);
                        var startMin = ele.start.slice(2);
                        startHour = parseInt(startHour);
                        if (12 - startHour > 0) {
                            startPeriod = 'pm';
                            startHour -= 12;
                        }
                        //get end time values
                        var endPeriod = 'am';
                        var endHour = ele.end.slice(0,2);
                        var endMin = ele.end.slice(2);
                        endHour = parseInt(endHour);
                        if (12 - endHour > 0) {
                            endPeriod = 'pm';
                            endHour -= 12;
                        }
                        //build the link text
                        link.innerHTML = startHour + ':' + startMin + startPeriod + ' - ' + endHour +':'+ endMin + endPeriod + ' ' + ele.title + ' @' + ele.venue;
                    }
                    new DayDisplay(year, month, day, (odd++%2===1), content);
                }
                */
                for (var i=0; i<daysSelected; i++) {
                    var odd = i%2 === 1;
                    new DayDisplay(year, month, _date+i, odd, result);
                }
            }
        }
        req.send(msg);
        //create the day display elements
        
    }
    //a class for creating day display elements
    function DayDisplay(year, month, date, odd, data) {
        this.wrapper = document.createElement('div'); //used for sizing the display element
        this.wrapper.className = 'eventDivWrapper';
        this.div = document.createElement('div');
        this.div.classList.add('eventDiv');
        if (odd) this.div.classList.add('eventDivOdd'); //odd listings have different color scheme
        this.wrapper.appendChild(this.div);
        eventDisplayDiv.appendChild(this.wrapper);
        //holds the date: Sat, Dec 8th
        this.header = document.createElement('h2');
        var dater = new Date();
        dater.setFullYear(year);
        dater.setMonth(month);
        dater.setDate(date);
        var year = dater.getFullYear();
        var month = dater.getMonth();
        var date = dater.getDate();
        this.header.innerHTML = dayName(dater.getDay()) + ', ' + monthName(month) + '. ' + date;
        //get date suffix
        var last = this.header.innerHTML.slice(-2);
        var suffix;
        if (last[0] !== '1') {
            switch (last[1]) {
                case '1':
                    suffix = 'st';
                    break;
                case '2':
                    suffix = 'nd';
                    break;
                case '3':
                    suffix = 'rd';
                    break;
                default:
                    suffix = 'th';
            }
        }else suffix = 'th';
        this.header.innerHTML += suffix;
        this.div.appendChild(this.header);
        //the content
        this.contentDiv = document.createElement('div');
        this.contentDiv.className = 'eventContent';
        this.div.appendChild(this.contentDiv);
        
        //build event list from query results
        var dateCheck = year +'-'+ ('0'+(month+1)).slice(-2) +'-'+ ('0'+(date)).slice(-2);
        if (data.hasOwnProperty(dateCheck)) {
            var content = document.createElement('ul');
            for (var i=0; i<data[dateCheck].length; i++) {
                //if (!data[dateCheck].hasOwnProperty(ele)) continue;
                var ele = data[dateCheck][i];
                var item = document.createElement('li');
                
                var link = document.createElement('a');
                link.setAttribute('href', './events.php?id='+ele.id);
                
                //get start time values
                var startPeriod = 'a';
                var startHour = ele.start.slice(0,2);
                var startMin = ele.start.slice(2);
                startHour = parseInt(startHour);
                if (startHour -12 >= 0) {
                    startPeriod = 'p';
                    if (startHour !== 12)
                        startHour -= 12;
                }
                //get end time values
                var endPeriod = 'a';
                var endHour = ele.end.slice(0,2);
                var endMin = ele.end.slice(2);
                endHour = parseInt(endHour);
                if (endHour -12 >= 0) {
                    endPeriod = 'p';
                    if (endHour !== 12)
                        endHour -= 12;
                }
                var time = document.createTextNode(startHour + ':' + startMin + startPeriod + ' - ' + endHour +':'+ endMin + endPeriod + ' ');
                item.appendChild(time);
                item.appendChild(link);
                content.appendChild(item);
                
                //build the link text
                link.innerHTML =  ele.title + ' @' + ele.venue;
            }
            this.contentDiv.appendChild(content);
        }else{
            this.contentDiv.innerHTML = '<i>No entries for this day.</i>';
        }
        
        
    }
    //go back one month
    document.getElementById('calendarLeft').onclick = function(e) {
        e.preventDefault();
        lastDrawn[1]--;
        if (lastDrawn[1] < 0) {
            lastDrawn[1] = 11;
            lastDrawn[0]--;
        }
        drawCalendar(lastDrawn[0], lastDrawn[1], currentDate, lastSelected, daysSelected);
    }
    //go forward one month
    document.getElementById('calendarRight').onclick = function(e) {
        e.preventDefault();
        lastDrawn[1]++;
        if (lastDrawn[1] > 11) {
            lastDrawn[1] = 0;
            lastDrawn[0]++;
        }
        drawCalendar(lastDrawn[0], lastDrawn[1], currentDate, lastSelected, daysSelected);
    }
    //create the next and previous links
    for (var i=0; i<displayControl.length; i++) {
        
        var next = document.createElement('a');
        next.setAttribute('href', '#');
        next.innerHTML = 'Next &#10095;';
        var pre = document.createElement('a');
        pre.setAttribute('href', '#');
        pre.innerHTML = '&#10094; Previous';
        
        displayControl[i].appendChild(pre);
        displayControl[i].appendChild(document.createTextNode(' | '));
        displayControl[i].appendChild(next);
        
        next.addEventListener('click', function(e) {
            //adjust the last selected values
            lastSelected[2] += 7;
            if (lastSelected[2]-numDays(lastSelected[0],lastSelected[1]) > 0) { //if it goes to the next month
                lastSelected[2] -= numDays(lastSelected[0],lastSelected[1]);
                lastSelected[1]++;
                if (lastSelected[1] > 11) {
                    lastSelected[1] = 0;
                    lastSelected[0]++;
                }
            }
            daySelectHandler(e, lastSelected[0], lastSelected[1], lastSelected[2]);
        });
        
        pre.addEventListener('click', function(e) {
            //adjust the last selected values
            
            lastSelected[2] -= 7;
            
            if (lastSelected[2] < 1) {
                if (lastSelected[1] === 0) {
                    lastSelected[1] = 11;
                    lastSelected[0]--;
                }else lastSelected[1]--;
                lastSelected[2] += numDays(lastSelected[0], lastSelected[1]);
            }
            
            daySelectHandler(e, lastSelected[0], lastSelected[1], lastSelected[2]);
            
        });
    }
    //getting the number of days in a month
    
    function numDays(year, month) {
        var leapYear = (year%4 === 0);
        switch (month) {
            case 0 :
            case 2 :
            case 4 :
            case 6 :
            case 7 :
            case 9 :
            case 11 :
                return 31;
            case 1 :
                return leapYear?29:28;
            case 3:
            case 5:
            case 8:
            case 10:
                return 30;
        }
    }
    //getting the name of month from int
    function monthName(int) {
        var name;
        switch (int) {
            case 0:
                name = 'Jan';
                break;
            case 1:
                name = 'Feb';
                break;
            case 2:
                name = 'Mar';
                break;
            case 3:
                name = 'Apr';
                break;
            case 4:
                name = 'May';
                break;
            case 5:
                name = 'Jun';
                break;
            case 6:
                name = 'Jul';
                break;
            case 7:
                name = 'Aug';
                break;
            case 8:
                name = 'Sep';
                break;
            case 9:
                name = 'Oct';
                break;
            case 10:
                name = 'Nov';
                break;
            case 11:
                name = 'Dec';
        }
        return name;
    }
    //get day name from int
    function dayName(int) {
        var day;
        switch (int) {
            case 0:
                day = 'Sun';
                break;
            case 1:
                day = 'Mon';
                break;
            case 2:
                day = 'Tues';
                break;
            case 3:
                day = 'Wed';
                break;
            case 4:
                day = 'Thur';
                break;
            case 5:
                day = 'Fri';
                break;
            case 6:
                day = 'Sat';
        }
        return day;
    }
    //draw initial calendar
    //drawCalendar(date.getFullYear(), date.getMonth(), date.getDate(), lastSelected, daysSelected);
    daySelectHandler(false, currentYear, currentMonth, currentDate);
}