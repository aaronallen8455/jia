window.addEventListener('load', function() {
    //when 'other' is selected, show the text input.
    var instrSel = document.getElementsByClassName('instrSelector');
    for (var i=0; i<instrSel.length; i++) {
        instrSel[i].onchange = function() {
            if (this.value === 'other') {
                var instrSelOther = document.createElement('input');
                instrSelOther.className = 'instrSelOther';
                //check if secondary instrument selection
                if (this.name.indexOf('[') !== -1) {
                    var secInstrSelectors = Array.prototype.filter.call(instrSel, function (x) {
                        return (x.name.indexOf('[') !== -1);
                    });
                    instrSelOther.setAttribute('name', 'secInstrSelOther['+secInstrSelectors.indexOf(this)+']');
                }else
                    instrSelOther.setAttribute('name', 'instrSelOther');
                instrSelOther.setAttribute('type', 'text');
                instrSelOther.setAttribute('placeholder', 'Please specify...');
                this.parentElement.appendChild(instrSelOther);
            }else{
                if (this.nextSibling && this.nextSibling.className !== 'instrSelector') {
                    this.nextSibling.remove();
                }
            }
        }
    }
/*
    if (instrSel) {
        instrSel.onchange = function(e) {
            if (this.value === 'other') {
                var instrSelOther = document.createElement('input');
                instrSelOther.id = 'instrSelOther';
                instrSelOther.setAttribute('name', 'instrSelOther');
                instrSelOther.setAttribute('type', 'text');
                instrSelOther.setAttribute('placeholder', 'Please specify...');
                instrSel.parentElement.appendChild(instrSelOther);
            }else{
                if (instrSel.nextSibling) {
                    instrSel.nextSibling.remove();
                }
            }
        }
    }*/
    //function for adding an additional link
    function createLink(name, instr, div, i) {
        if (i<6) {
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
            var name = makeInput('URL: ', 'links[]', name);
            var instr = makeInput('Short Description: ', 'title[]', instr);
            //make the remove button
            var remove = document.createElement('button');
            remove.className = 'linkDel';
            remove.setAttribute('type','button');
            remove.appendChild(document.createTextNode('Remove'));
            memberDiv.appendChild(remove);
            remove.onclick = function() {
                div.removeChild(memberDiv);
            };
            div.appendChild(memberDiv);
        }
    }
    
    function createInstr(ele) {
        var i = ele.children.length;
        if (i <= 6) {
            var instrDiv = document.createElement('div');
            instrDiv.className = 'memberDiv';
            //create instrument selector
            var instrArray = [
                'Bass', 'Trumpet', 'Piano', 'Saxophone', 'Drums', 'Trombone', 'Guitar', 'Vocal'
            ].sort();
            var span = document.createElement('span');
            span.className = 'instrSelectSpan';
            var select = document.createElement('select');
            select.className = 'instrSelector';
            select.name = 'secinstr[]';
            //append all the options
            var opt = document.createElement('option');
            opt.value = 'none';
            opt.style.fontStyle = 'italic';
            opt.innerText = 'Select One:';
            select.appendChild(opt);
            for (var p=0; p<instrArray.length; p++) {
                opt = document.createElement('option');
                opt.value = opt.innerText = instrArray[p];
                select.appendChild(opt);
            }
            opt = document.createElement('option');
            opt.value = 'other';
            opt.innerText = 'Other...';
            select.appendChild(opt);

            span.appendChild(select);
            instrDiv.appendChild(span);
            //add remove button
            var remove = document.createElement('button');
            remove.className = 'linkDel';
            remove.setAttribute('type','button');
            remove.appendChild(document.createTextNode('Remove'));
            instrDiv.appendChild(remove);
            remove.onclick = removeButtonHandler.bind(null, remove);
            ele.appendChild(instrDiv);

            //add the handler for displaying 'other' input.
            select.onchange = function () {
                if (this.value === 'other') {
                    var instrSelOther = document.createElement('input');
                    instrSelOther.className = 'instrSelOther';
                    //check if secondary instrument selection
                    if (this.name.indexOf('[') !== -1) {
                        instrSelOther.setAttribute('name', 'secInstrSelOther['+i+']');
                    }else
                        instrSelOther.setAttribute('name', 'instrSelOther');
                    instrSelOther.setAttribute('type', 'text');
                    instrSelOther.setAttribute('placeholder', 'Please specify...');
                    this.parentElement.appendChild(instrSelOther);
                }else{
                    if (this.nextSibling && this.nextSibling.className !== 'instrSelector') {
                        this.nextSibling.remove();
                    }
                }
            }
        }
    }
    
    var linksDiv = document.getElementById('linksDiv');
    
    //replace all name values with blank array
    var formEleDiv = document.getElementsByClassName('formEleDiv');
    for (var i=0; i<formEleDiv.length; i++) {
        for (var t=0; t<formEleDiv[i].children.length; t++) {
            var name = formEleDiv[i].children[t].getAttribute('name');
            //don't operate on secondary instrument 'other'
            if (name === null || name.slice(0,4) === 'secI') continue;
            if (name.search(/\[\d+\]$/) !== -1) {
                formEleDiv[i].children[t].setAttribute('name', name.replace(/\[\d+\]$/, '[]'));
            }
        }
    }
    //the add member button
    var addMember = document.getElementById('addLink');
    addMember.setAttribute('type', 'button'); //otherwise it would submits the form
    addMember.onclick = function(e) {
        createLink('', '', linksDiv, linksDiv.children.length);
    };
    
    var secInstrDiv = document.getElementById('secInstrDiv');
    
    //add secondary instrument button
    var addInstr = document.getElementById('addInstr');
    addInstr.onclick = function() {
        createInstr(secInstrDiv);
    };
    //remove button handler
    function removeButtonHandler(button) {
        button.parentNode.parentNode.removeChild(button.parentNode);
        //if secondary instr, reset the 'other' input name values to match new order.
        var secInstrSelectors = Array.prototype.filter.call(instrSel, function (x) {
            return (x.name.indexOf('[') !== -1);
        });
        for (var i=0; i<secInstrSelectors.length; i++) {
            if (secInstrSelectors[i].value === 'other') {
                var otherInput = secInstrSelectors[i].nextElementSibling;
                if (otherInput)
                    otherInput.name = 'secInstrSelOther['+i+']';
            }
        }
    }
    //the remove button for initial row
    var del = document.getElementsByClassName('linkDel');
    Array.prototype.forEach.call(del, function(x) {
        x.onclick = removeButtonHandler.bind(null, x);
    });

    //del.forEach();
    
    
});