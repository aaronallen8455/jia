window.addEventListener('load', function() {
    //when 'other' is selected, show the text input.
    var instrSel = document.getElementById('instr');
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
    }
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
    
    var linksDiv = document.getElementById('linksDiv');
    //the add member button
    var addMember = document.getElementById('addLink');
    addMember.setAttribute('type', 'button'); //otherwise it would submits the form
    addMember.onclick = function(e) {
        createLink('', '', linksDiv, linksDiv.children.length);
    }
    
    //the remove button for initial row
    var del = document.getElementsByClassName('linkDel');
    Array.prototype.forEach.call(del, function(x) {
        x.onclick = function() {
            linksDiv.removeChild(this.parentElement);
        };
    });
    //del.forEach();
    
    
});