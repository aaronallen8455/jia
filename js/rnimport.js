window.addEventListener('load', function () {
    //get elements
    var checkHeader = document.getElementById('checkHeader');
    var titleHeader = document.getElementById('titleHeader');
    var submit = document.getElementsByName('submit2')[0];
    //groups
    var inputs = document.getElementsByTagName('input');
    var textInputs = document.querySelectorAll('input[type=text]');
    var checkInputs = document.querySelectorAll('input[type=checkbox]');

    //validate title input
    var globalErrors = [];
    for (var i=0; i<textInputs.length; i++) {
        textInputs[i].addEventListener('change', function () {
            if (this.value.length > 80 || this.value.length < 3) {
                this.classList.add('error');
                globalErrors.push(this);
                if (this !== titleHeader)
                    submit.disabled = true;
            }else{
                this.classList.remove('error');
                //remove from errors
                if (globalErrors.indexOf(this) !== -1)
                    globalErrors.splice(globalErrors.indexOf(this),1);
                //if no errors, enable submit
                if (globalErrors.length === 0) submit.disabled = false;
            }
        });
    }

    //check header and title header set values for entire column
    titleHeader.onchange = function () {
        if (globalErrors.indexOf(this) === -1) {
            for (var i=0; i<textInputs.length; i++) {
                textInputs[i].value = this.value;
            }
        }
    };
    checkHeader.onchange = function () {
        for (var i=0; i<checkInputs.length; i++) {
            checkInputs[i].checked = this.checked;
        }
    };

    //if no events are checked, disable submit button
    for (var i=0; i<checkInputs.length; i++) {
        checkInputs[i].addEventListener('change', function () {
            var numChecked = 0;
            for (var p=0; p<checkInputs.length; p++) {
                if (checkInputs[p] !== checkHeader) {
                    if (checkInputs[p].checked) {
                        numChecked++;
                        break;
                    }
                }
            }

            if (numChecked === 0) {
                globalErrors.push('noChecks');
            } else if(globalErrors.indexOf('noChecks') !== -1) {
                globalErrors.splice(globalErrors.indexOf('noChecks'), 1);
            }

            if (globalErrors.length)
                submit.disabled = true;
            else submit.disabled = false;
        })
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