window.addEventListener('load', function() {
    var nav = document.querySelectorAll('.nav')[0];
    var toggle = document.getElementById('menuToggle');
    toggle.onclick = function() {
        if (nav.classList.contains('menuVisibility')) {
            nav.classList.remove('menuVisibility');

        }else nav.classList.add('menuVisibility');
    };
    //clicking outside the menu closes it
    document.addEventListener('click', function(e) {
        if (e.target === toggle || e.target === nav || e.target.parentNode.parentNode === nav) return;
        if (!nav.classList.contains('menuVisibility')) {
            nav.classList.add('menuVisibility');
        }
    }, false);

    
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
            //initialize scroll here so that menu does not scroll up when we visit the #cal anchor
            if (scroll === undefined) scroll = newPos;
            if (newPos <= toggle.offsetHeight*3) {
                //we need to prevent slideUp from executing when we are at the top of the page
                toggle.style.top = '0px';
                scroll = undefined;
                isRunning = false;
                return;
            }
            if (Math.abs(scroll - newPos) >= toggle.offsetHeight) {
                if (newPos > scroll) {
                    //scrolling down, hide menu
                    if (!isRunning && nav.classList.contains('menuVisibility')) {
                        function slideUp() {
                            if (toggle.offsetTop > -toggle.offsetHeight && isRunning) {
                                toggle.style.top = toggle.offsetTop - 2 + 'px';
                                window.requestAnimationFrame(slideUp);
                            }else{
                                isRunning = false;
                            }
                        }
                        if (toggle.offsetTop >= -toggle.offsetHeight) {
                            isRunning = true;
                            slideUp();
                        }
                    }
                }else{
                    //scrolling up, show menu
                    //dont scroll up if menu is open
                    if (!isRunning) {
                        isRunning = true;
                        function slideDown() {
                            if (toggle.offsetTop < 0) {
                                toggle.style.top = toggle.offsetTop + 2 + 'px';
                                window.requestAnimationFrame(slideDown);
                            }else{
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
        if (window.getComputedStyle(toggle).display === 'block') {
            nav.style.position = 'fixed';
            document.addEventListener('scroll', menuScrollHandler, false);
        }
        else {
            nav.style.position = 'static';
            document.removeEventListener('scroll', menuScrollHandler, false);
        }
    }, false);



});

// decided to use css instead but this is cool
function MenuLink(element) {
    var self = this;

    this.element = element;
    this.status = 'idle'; // 'forward' to change to target color, 'back' to change back to base color
    this.baseColor = [0,0,0]; // RGB of base color
    this.targetColor = [255,0,255]; // RGB of target color
    this.currentColor = this.baseColor.slice(0);
    this.duration = 10; // time in ms of animation
    this.rgbIncrements = (function () {
        var redShift = Math.round((self.targetColor[0] - self.baseColor[0]) / self.duration),
            greenShift = Math.round((self.targetColor[1] - self.baseColor[1]) / self.duration),
            blueShift = Math.round((self.targetColor[2] - self.baseColor[2]) / self.duration);

        return [redShift, greenShift, blueShift];
    })();

    function mouseOverHandler (e) {

        self.status = 'forward';

        // animate until we reach the target color or the animation is aborted
        window.requestAnimationFrame(animate);

        function animate() {
            // increment each color channel
            self.currentColor.forEach(function (x, i, a) {
                a[i] += self.rgbIncrements[i];
            });

            // check for completion
            if (
                (
                    (self.rgbIncrements[0] < 0 && self.currentColor[0] <= self.targetColor[0])
                    || (self.rgbIncrements[0] > 0 && self.currentColor[0] >= self.targetColor[0])
                ) || (
                    (self.rgbIncrements[1] < 0 && self.currentColor[1] <= self.targetColor[1])
                    || (self.rgbIncrements[1] > 0 && self.currentColor[1] >= self.targetColor[1])
                ) || (
                    (self.rgbIncrements[2] < 0 && self.currentColor[2] <= self.targetColor[2])
                    || (self.rgbIncrements[2] > 0 && self.currentColor[2] >= self.targetColor[2])
                )
            ) {
                if (self.status === 'forward')
                    self.status = 'idle'; // stop animating

                self.currentColor = self.targetColor.slice(0); // set to target color
            }

            // set color
            self.element.style.color = 'rgb(' + self.currentColor[0] + ', ' + self.currentColor[1] + ', ' + self.currentColor[2] + ')';

            // loop if incomplete
            if (self.status === 'forward')
                window.requestAnimationFrame(animate);
        }
    }

    function mouseOutHandler (e) {

        self.status = 'back';

        // animate until we reach the target color or the animation is aborted
        window.requestAnimationFrame(animate);

        function animate() {
            // increment each color channel
            self.currentColor.forEach(function (x, i, a) {
                a[i] -= self.rgbIncrements[i];
            });

            // check for completion
            if (
                (
                    (self.rgbIncrements[0] < 0 && self.currentColor[0] >= self.baseColor[0])
                    || (self.rgbIncrements[0] > 0 && self.currentColor[0] <= self.baseColor[0])
                ) || (
                    (self.rgbIncrements[1] < 0 && self.currentColor[1] >= self.baseColor[1])
                    || (self.rgbIncrements[1] > 0 && self.currentColor[1] <= self.baseColor[1])
                ) || (
                    (self.rgbIncrements[2] < 0 && self.currentColor[2] >= self.baseColor[2])
                    || (self.rgbIncrements[2] > 0 && self.currentColor[2] <= self.baseColor[2])
                )
            ) {
                if (self.status === 'back')
                    self.status = 'idle'; // stop animating

                self.currentColor = self.targetColor.slice(0); // set to target color
            }

            // set color
            self.element.style.color = 'rgb(' + self.currentColor[0] + ', ' + self.currentColor[1] + ', ' + self.currentColor[2] + ')';

            // loop if incomplete
            if (self.status === 'back')
                window.requestAnimationFrame(animate);
        }
    }

    this.element.addEventListener('mouseover', mouseOverHandler);

    this.element.addEventListener('mouseout', mouseOutHandler);
}


