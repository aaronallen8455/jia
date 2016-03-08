window.addEventListener('load', function() {
    var nav = document.querySelector('.nav');
    var toggle = document.getElementById('menuToggle');
    toggle.onclick = function() {
        if (nav.classList.contains('menuVisibility')) {
            nav.classList.remove('menuVisibility');
        }else nav.classList.add('menuVisibility');
    }
    
    //in mobile, menu is fixed when scrolling up but rolls up when scrolling down.
    var scroll = window.scrollY;
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
    
    function menuScrollHandler() {
        var bb = toggle.getBoundingClientRect();
        //check direction of scroll
        var newPos = window.scrollY;
        
        if (newPos > scroll && toggle.style.position !== 'absolute') {
            //scrolling down, make elements AP
            var navTop = bb.bottom - nav.parentElement.offsetTop - toggle.offsetHeight + window.scrollY;
            var toggleTop = bb.top - nav.parentElement.offsetTop - toggle.offsetHeight + window.scrollY;
            
            nav.style.position = 'absolute';
            nav.style.top = navTop + 'px';
            toggle.style.position = 'absolute';
            toggle.style.top = toggleTop + 'px';
        }else if(newPos <= scroll && nav.style.position === 'absolute') {
            //scrolling up
            //allow elements to catch up, then make fixed
            if (bb.top >= 0) {
                nav.style.position = 'fixed';
                toggle.style.position = 'fixed';
                nav.style.top = toggle.offsetHeight + 'px';
                toggle.style.top = '0px';
            }else if (window.scrollY - toggle.offsetTop > 230) {
                nav.style.position = 'absolute';
                nav.style.top = window.scrollY - nav.parentElement.offsetTop - toggle.offsetHeight + 'px';
                toggle.style.position = 'absolute';
                toggle.style.top = window.scrollY - nav.parentElement.offsetTop - toggle.offsetHeight*2 + 'px';
            }
        }
        scroll = newPos;
    }
});