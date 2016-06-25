
var total;
function post(emails, baseUrl, progress) {
    if (!total) total = emails.length;
    //send emails
    var group = emails.splice(0,5);
    if (group) {
        var data = JSON.stringify(group);
        var req = new XMLHttpRequest();
        req.open('POST', baseUrl + '/ajax/mailer.ajax.php',true);
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        req.onreadystatechange = function() {
            if(this.readyState === 4) {
                if (emails.length === 0) {
                    //close the request chain if we are done
                    var req2 = new XMLHttpRequest();
                    req2.open('POST', baseUrl + '/ajax/mailer.ajax.php',true);
                    req2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    req2.send('action=stop');
                    progress.innerHTML = 'Finished';
                }else{
                    //update progress element
                    progress.innerHTML = parseInt(100-emails.length/total*100) + '% Complete';
                    //send request for next group of emails
                    post(emails, baseUrl, progress);
                }
            }
        };
        //data = data.replace(/&/g, 'and'); //get rid of ampersand for header
        req.send('action=mail&adds=' + encodeURIComponent(data));
    }
}

window.addEventListener('load', function () {
    var emails = document.getElementById('emails').innerHTML;
    emails = JSON.parse(emails);
    var msg = document.getElementById('msg');
    var mailer = document.getElementById('mailer');
    var progress = document.getElementById('progress');
    //is local? get base url
    var baseUrl;
    if (window.location.pathname.slice(0,5) === '/jia/') {
        baseUrl = window.location.origin + '/jia';
    }else baseUrl = window.location.origin;
    msg = msg.value;
    
    mailer.onclick = function () {
        this.setAttribute('disabled', 'true');
        progress.innerHTML = '0% Complete';
        //send initial request
        var req = new XMLHttpRequest();
        req.open('POST', baseUrl + '/ajax/mailer.ajax.php',true);
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        req.onreadystatechange = function() {
            if(req.readyState === 4 && req.response == 1) {
                //post to the ajax script with the emails in groups of 5.
                post(emails, baseUrl, progress);
            }
        };
        //req.send('action=init&msg=' + encodeURIComponent(msg));
        req.send('action=init');
    }
}, false);

