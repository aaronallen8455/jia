window.addEventListener('load', function() {
    //get the elements with bg images
    var header = document.querySelector('.splashWide');
    //var headerNarrow = document.querySelector('.splashNarrow');
    var calHeader = document.querySelector('.calHeader');
    
    function scrollHandler(element) {
        var bb = element.getBoundingClientRect();
        //image is centered when in the middle of the screen
        var halfWay = window.innerHeight/2;
        var eleCenter = element.offsetHeight/2 + bb.top;
        element.style.backgroundPosition = '50% ' + ((eleCenter - halfWay) * .20) + 'px';
    }
    
    scrollHandler(header);
    scrollHandler(calHeader);
    //scrollHandler(headerNarrow);
    
    window.onscroll = function() {
        window.requestAnimationFrame(function() {
            scrollHandler(header);
            scrollHandler(calHeader);
            //scrollHandler(headerNarrow);
        });
    };
    //allow window size to change without weird behavior
    window.addEventListener('resize', function() {
        scrollHandler(header);
        scrollHandler(calHeader);
    }, false);
});