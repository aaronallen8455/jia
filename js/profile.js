window.addEventListener('load', function () {
    //resize the eventDivs vertically to make uniform sized rows.

    window.addEventListener('resize', resizeEventElements, false);
    //Event element sizer. Make row heights uniform
    function resizeEventElements() {
        var elements = document.getElementsByClassName('eventDivWrapper');
        try {
            var margin = parseInt(window.getComputedStyle(elements[0].children[0]).marginTop.slice(0,-2))*2;
        }
        catch(e) { //don't bomb if user resizes before elements are defined.
            return;
        }
        //determine how many items are in each row
        var numPerRow = 1;
        var ele = elements[0];
        while (ele.nextElementSibling.offsetTop === ele.offsetTop) {
            numPerRow++;
            ele = ele.nextElementSibling;
        }
        Array.prototype.forEach.call(elements, function(x){x.style.height = null;}); //disable the artificial height.
        if (numPerRow === 1) return; //exit if single column
        //set the height of each element to greatest in row
        for (var i=0; i<elements.length; i+=numPerRow) {
            var row = [elements[i]];
            //isolate the row
            while (row.length < numPerRow && elements[i+row.length]) {
                row.push(elements[i+row.length]);
            }
            //determine the greatest height
            row.sort(function(a,b){return b.offsetHeight - a.offsetHeight;});
            var height = row[0].offsetHeight - margin;
            //set heights equal
            row.forEach(function(x,t,a){
                //if (t === 0) return;
                a[t].style.height = parseFloat(height) + 'px';
            });
        }
    }

    resizeEventElements();

}, false);