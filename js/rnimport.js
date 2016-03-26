window.addEventListener('load', function () {
    //get elements
    var checkHeader = document.getElementById('checkHeader');
    var titleHeader = document.getElementById('titleHeader');
    var submit = document.getElementsByName('submit2')[0];
    //groups
    var inputs = document.getElementsByTagName('input');
    //get default title value
    var defaultTitle = document.getElementsByName('title[0]').value;

    //validate title input
    var globalErrors = [];
    for (var i=0; i<inputs.length; i++) {
        if (inputs[i].getAttribute('type') === 'text') {
            inputs[i].addEventListener('change', function () {
                if (this.value.length > 80 || this.value.length < 3) {
                    this.classList.add('error');
                    globalErrors.push(this);
                    if (this !== titleHeader)
                        submit.disabled = true;
                }else{
                    this.classList.remove('error');
                    //remove from errors
                    globalErrors.splice(globalErrors.indexOf(this),1);
                    //if no errors, enable submit
                    if (globalErrors.length === 0) submit.disabled = false;
                }
            });
        }
    }

    //check header and title header set values for entire column
    titleHeader.onchange = function () {
        if (globalErrors.indexOf(this) === -1) {
            for (var i=0; i<inputs.length; i++) {
                if (inputs[i].getAttribute('type') === 'text') {
                    inputs[i].value = this.value;
                }
            }
        }
    };
    checkHeader.onchange = function () {
        for (var i=0; i<inputs.length; i++) {
            if (inputs[i].getAttribute('type') === 'checkbox') {
                inputs[i].checked = this.checked;
            }
        }
    };

    //if no events are checked, disable submit button
    for (var i=0; i<inputs.length; i++) {
        if (inputs[i].getAttribute('type') === 'checkbox') {
            inputs[i].addEventListener('change', function () {
                var numChecked = 0;
                for (var p=0; p<inputs.length; p++) {
                    if (inputs[p].getAttribute('type') === 'checkbox' && inputs[p] !== checkHeader) {
                        if (inputs[p].checked)
                            numChecked++;
                    }
                }

                if (numChecked === 0) {
                    globalErrors.push('noChecks');
                } else globalErrors.splice(globalErrors.indexOf('noChecks'), 1);

                if (globalErrors.length)
                    submit.disabled = true;
                else submit.disabled = false;
            })
        }
    }

    //prevent Enter from submitting form
    for (var i=0; i<inputs.length; i++) {
        inputs[i].onkeydown = function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                return false;
            }
        }
    }
});