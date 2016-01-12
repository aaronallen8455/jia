window.addEventListener('load', function() {
    var copyCheck = document.getElementById('copyCheck');
    var copySelect = document.getElementById('copySelect');
    var bandDiv = document.getElementById('bandDiv');
    var title = document.getElementById('title');
    var venue = document.getElementById('venue');
    var startHour = document.getElementById('startHour');
    var startMin = document.getElementById('startMin');
    var startPeriod = document.getElementById('startPeriod');
    var endHour = document.getElementById('endHour');
    var endMin = document.getElementById('endMin');
    var endPeriod = document.getElementById('endPeriod');
    var desc = document.getElementById('desc');
    
    //make the check box enable/disable the select element.
    if (copyCheck && copySelect) { //no copycheck or copyselect in edit page
        copyCheck.onchange = function() {
            if (copySelect.hasAttribute('disabled')) {
                copySelect.removeAttribute('disabled');
            }else{
                copySelect.setAttribute('disabled', true);
                //clear the form
                var inputs = document.getElementsByTagName('input');
                for (var i in inputs) {
                    if (inputs[i].type === 'submit') continue;
                    inputs[i].value = '';
                }
                desc.innerHTML = '';
                copySelect.value = 'none';
            }
        }
    
        //when selected, send event id to ajax
        copySelect.onchange = function() {
            if (this.value !== 'none') {
                var data = {id: this.value};
                data = JSON.stringify(data);
                var req = new XMLHttpRequest();
                req.open('POST','./includes/addeventajax.inc.php',true);
                req.setRequestHeader('Content-type', 'application/json');
                req.onreadystatechange = function() {
                    if(req.readyState === 4) {
                        var res = req.responseText;
                        res = JSON.parse(res);

                        //fill in element values

                        title.value = res.title;

                        venue.value = res.venue;
                        //set time values
                        var hour = res.start.slice(0,2);
                        if (parseInt(hour) > 12) {
                            hour -= 12;
                            startPeriod.value = 'pm';
                        }else startPeriod.value = 'am';
                        startHour.value = hour;
                        startMin.value = res.start.slice(-2);

                        var hour = res.end.slice(0,2);
                        if (parseInt(hour) > 12) {
                            hour -= 12;
                            endPeriod.value = 'pm';
                        }else endPeriod.value = 'am';
                        endHour.value = hour;
                        endMin.value = res.end.slice(-2);

                        desc.innerHTML = res.desc;
                        //create the list of band members
                        while (bandDiv.firstChild) {
                            bandDiv.removeChild(bandDiv.firstChild); //clear the div
                        }
                        var list = res.band.split('|');
                        for (var i=0; i<list.length; i++) {
                            var entry = list[i].split(',');
                            if (!entry[1]) entry[1] = '';
                            createMember(entry[0],entry[1],bandDiv,i);
                        }
                    }
                }
                req.send(data);
            }
        }
    }
    //function for created a band member's row
    function createMember(name, instr, div, i) {
        var memberDiv = document.createElement('div');
        memberDiv.className = 'memberDiv';
        function makeInput(_label, name, value) {
            var d = document.createElement('div');
            d.className = 'formEleDiv';
            var label = document.createElement('label');
            label.setAttribute('for', _label+i);
            label.innerHTML = _label;
            var input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('id', _label+i);
            input.setAttribute('name', name);
            input.value = value;
            d.appendChild(label);
            d.appendChild(input);
            memberDiv.appendChild(d);
            return [label, input];
        }
        //make the name and instrument inputs
        var name = makeInput('Name: ', 'band[]', name);
        var instr = makeInput('Instrument: ', 'instr[]', instr);
        //make the remove button
        var remove = document.createElement('button');
        remove.className = 'memberDel';
        remove.setAttribute('type','button');
        remove.appendChild(document.createTextNode('Remove'));
        memberDiv.appendChild(remove);
        remove.onclick = function() {
            div.removeChild(memberDiv);
        };
        div.appendChild(memberDiv);
    }
    
    //the add member button
    var addMember = document.getElementById('addMember');
    addMember.setAttribute('type', 'button'); //otherwise it submits the form
    addMember.onclick = function(e) {
        createMember('', '', bandDiv, bandDiv.children.length);
    }
    
    //the remove button for initial row
    var del = document.getElementsByClassName('memberDel');
    Array.prototype.forEach.call(del, function(x) {
        x.onclick = function() {
            bandDiv.removeChild(this.parentElement);
        };
    });
    
    
    //the calendar select element
    var cals = document.getElementsByClassName('calendarInput');
    for (var i in cals) {
        if (isNaN(i)) continue;
        //attach the calendar icon
        var image = document.createElement('img');
        image.setAttribute('src', './images/calendar.gif');
        image.width = 25;
        image.height = 25;
        cals[i].appendChild(image);
        //draw the calendar on click
        var d = new Date();
        cals[i].addEventListener('click', function(e) {
            drawCalendar(d.getFullYear(), d.getMonth(), this);
            e.stopPropagation();
        }); 
    }
    
    function drawCalendar(year, month, ele) {
        //get current date values
        var date = new Date();
        var currentYear = date.getFullYear();
        var currentMonth = date.getMonth();
        var currentDay = date.getDate();
        //create containing div and position it.
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = ele.offsetLeft -12 + 'px';
        div.style.top = ele.offsetTop-28 +'px';
        div.id = 'calendarDiv';
        //prev link
        var prev = document.createElement('a');
        prev.setAttribute('href', '#');
        prev.id = 'calendarLeft';
        prev.innerHTML = '&#10094;';
        //handler for prev/next click event
        function travCal(dir) {
            var d = new Date();
            d.setFullYear(year);
            d.setMonth(month+dir);
            close();
            drawCalendar(d.getFullYear(), d.getMonth(), ele);
        }
        prev.onclick = function(e) {
            e.preventDefault();
            travCal(-1);
        }
        
        var calendarHeading = document.createElement('span');
        calendarHeading.innerHTML = monthName(month) + ' ' + year;
        calendarHeading.id = 'calendarHeading';
        
        var next = document.createElement('a');
        next.setAttribute('href', '#');
        next.id = 'calendarRight';
        next.onclick = function(e) {
            e.preventDefault();
            travCal(1);
        }
        next.innerHTML = '&#10095;';
        
        //don't allow prev to go into the past
        if (currentMonth<month && year === currentYear)
            div.appendChild(prev);
        div.appendChild(calendarHeading);
        div.appendChild(next);
        
        var calendarTable = document.createElement('table');
        calendarTable.id = 'calendarTable';
        
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
                var _date = col - startingDay + 1 + 7*row;
                link.innerHTML = _date;
                //dont set link for days that are past
                if ((month===currentMonth && year===currentYear && _date>=currentDay) || month!==currentMonth || year!==currentYear) {
                    link.setAttribute('href', '#');
                    //click event
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        ele.parentElement.children[1].value = date.getMonth()+1 + '/' + this.innerHTML + '/' + date.getFullYear().toString().slice(-2);
                        close();
                    });
                }
                td.appendChild(link);
                
                if (link.innerHTML == currentDay && month === currentMonth && year === currentYear)
                    td.classList.add('tablecell-today');
            }
            calendarTable.appendChild(tr);
        }
        div.appendChild(calendarTable);
        div.addEventListener('click', function(e){e.stopPropagation();});
        ele.addEventListener('click', function(e){e.stopPropagation();});
        ele.parentElement.appendChild(div);
        
        //capture close click handler
        document.addEventListener('click', close, false);
        
        //close the calendar
        function close(e) {
            ele.parentElement.removeChild(div);
            document.removeEventListener('click', close, false);
        }
    }
    
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
});