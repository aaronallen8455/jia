window.addEventListener('load', function() {
    var nav = document.querySelectorAll('.nav')[0];
    var toggle = document.getElementById('menuToggle');
    toggle.onclick = function() {
        if (nav.classList.contains('menuVisibility')) {
            nav.classList.remove('menuVisibility');
        }else nav.classList.add('menuVisibility');
    };
    
    //in mobile, menu is fixed when scrolling up but rolls up when scrolling down.

    /*var menuScrollHandler = (function() {
        var scroll = window.scrollY;
        return function() {
            //check direction of scroll
            var newPos = window.scrollY;

            if (newPos > scroll) {
                //scrolling down, make elements slide up, if menu isn't visible
                if (nav.classList.contains('menuVisibility')) {
                    toggle.style.top = toggle.offsetTop + (scroll - newPos) + 'px';
                    nav.style.top = 40 + toggle.offsetTop + (scroll - newPos) + 'px';
                    if (toggle.offsetTop <= -toggle.offsetHeight) {
                        toggle.style.top = -toggle.offsetHeight + 'px';
                        nav.style.top = toggle.offsetHeight - toggle.offsetHeight + 'px';
                    }
                }
            }else{
                toggle.style.top = toggle.offsetTop + (scroll - newPos) + 'px';
                nav.style.top = 33 + toggle.offsetTop + (scroll - newPos) + 'px';
                if (toggle.offsetTop >= 0) {
                    toggle.style.top = '0px';
                    nav.style.top = toggle.offsetHeight + 'px';
                }
            }
            scroll = newPos;
        };
    })();*/

    var menuScrollHandler = (function() {
        var scroll = undefined;
        var isRunning = false;
        return function() {
            var newPos = window.scrollY;
            if (scroll === undefined) scroll = newPos;
            if (newPos <= toggle.offsetHeight*3) {
                toggle.style.top = '0px';
                scroll = undefined;
                isRunning = false;
                return;
            }
            if (Math.abs(scroll - newPos) >= toggle.offsetHeight) {
                if (newPos > scroll) {
                    //scrolling down, hide menu
                    if (!isRunning) {
                        //var pos = 0;
                        function slideUp() {
                            if (toggle.offsetTop > -toggle.offsetHeight && isRunning) {
                                //pos--;
                                toggle.style.top = toggle.offsetTop - 2 + 'px';
                                window.requestAnimationFrame(slideUp);
                            }else{
                                //toggle.style.top = -toggle.offsetHeight + 'px';
                                isRunning = false;
                            }
                        }
                        if (toggle.offsetTop >= -toggle.offsetHeight) {
                            isRunning = true;
                            slideUp();
                        }
                    }
                }else{
                    if (!isRunning) {
                        isRunning = true;
                        function slideDown() {
                            if (toggle.offsetTop < 0) {
                                toggle.style.top = toggle.offsetTop + 2 + 'px';
                                window.requestAnimationFrame(slideDown);
                            }else{
                                //toggle.style.top = toggle.offsetHeight + 'px';
                                isRunning = false;
                            }
                        }
                        slideDown();
                    }
                }
                scroll = newPos;
            }

        }
    })();

    if (window.getComputedStyle(toggle).display === 'block')
        document.addEventListener('scroll', menuScrollHandler, false);

    //switch between mobile and regular stopgap
    window.addEventListener('resize', function() {
        if (window.getComputedStyle(toggle).display === 'block')
            document.addEventListener('scroll', menuScrollHandler, false);
        else {
            nav.style.position = 'static';
            document.removeEventListener('scroll', menuScrollHandler, false);
        }
    }, false);



});