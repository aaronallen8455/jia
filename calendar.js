window.onload = function() {
    var date = new Date();
    var currentDate = date.getDate(); //date number 1-31
    var currentDay = date.getDay(); //day of the week
    var currentMonth = date.getMonth();
    var currentYear = date.getFullYear();
    var calendarTable = document.getElementById('calendarTable');
    var calendarHeading = document.getElementById('calendarHeading'); //Displays the month and year
    var eventDisplayDiv = document.getElementById('eventDisplayDiv'); //container for the event display elements.
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
        e.preventDefault();
        lastSelected = [year, month, _date];
        drawCalendar(year, month, currentDate, lastSelected, daysSelected);
        //clear the display div
        while (eventDisplayDiv.firstChild) {
            eventDisplayDiv.removeChild(eventDisplayDiv.firstChild);
        }
        //create the day display elements
        for (var i=0; i<daysSelected; i++) {
            var odd = i%2 === 1;
            new DayDisplay(year, month, _date+i, odd);
        }
    }
    //a class for creating day display elements
    function DayDisplay(year, month, date, odd) {
        this.div = document.createElement('div');
        this.div.classList.add('eventDiv');
        if (odd) this.div.classList.add('eventDivOdd'); //odd listings have different color scheme
        eventDisplayDiv.appendChild(this.div);
        //holds the date: Sat, Dec 8th
        this.header = document.createElement('h2');
        var dater = new Date();
        dater.setFullYear(year);
        dater.setMonth(month);
        dater.setDate(date);
        this.header.innerHTML = dayName(dater.getDay()) + ', ' + monthName(dater.getMonth()) + '. ' + dater.getDate();
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
        this.contentDiv.innerHTML = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vitae posuere justo, sit amet mattis ipsum. In eget aliquam ex. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nam quis lacinia nibh, quis facilisis diam. Vivamus maximus bibendum sapien, id condimentum mi rutrum sit amet. Sed sit amet arcu turpis. Fusce et odio suscipit, accumsan risus auctor, viverra eros. Nullam feugiat tellus sed enim malesuada, nec mattis orci condimentum. Integer aliquam tortor in lacus tempor, sit amet efficitur orci convallis. Nullam ut efficitur ligula, vitae mattis magna. Aenean vulputate bibendum libero in pulvinar. Sed tincidunt enim eget ultrices scelerisque';
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
    drawCalendar(date.getFullYear(), date.getMonth(), date.getDate(), lastSelected, daysSelected);
}