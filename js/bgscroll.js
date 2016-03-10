window.addEventListener('load', function() {
    //get the elements with bg images
    //var header = document.querySelector('.splashWide');
    var headerNarrow = document.querySelector('.splashNarrow');
    var calHeader = document.querySelector('.calHeader');
    var useNarrow = window.getComputedStyle(headerNarrow).display !== 'none';

    var bgSlideWide = document.getElementById('bgSlideWide');
    var bgSlideNarrow = document.getElementById('bgSlideNarrow');
    var bgSlideCal = document.getElementById('bgSlideCal');
    defineImgHeight(bgSlideWide);
    defineImgHeight(bgSlideNarrow);
    defineImgHeight(bgSlideCal);

    function bgSlideHandler(ele, scrollY) {
        //get element center
        if (ele._top > halfWay*2+scrollY) return;
        var winCenter = scrollY + halfWay;
        ele.style.top = ((winCenter - ele.center)* .2 - ele.heightDiff)  + 'px';
    }
    window.addEventListener('scroll', function() {
        window.requestAnimationFrame(function(){
            var scrollY = window.scrollY;
            if (!useNarrow)
                bgSlideHandler(bgSlideWide, scrollY);
            else
                bgSlideHandler(bgSlideNarrow, scrollY);
            bgSlideHandler(bgSlideCal, scrollY);
        });

    });



    //defineImgHeight(header);
    //defineImgHeight(calHeader);
    //defineImgHeight(headerNarrow);

    var halfWay = window.innerHeight/2;

    function defineImgHeight(ele) {
        //get imgHeight
        var css = window.getComputedStyle(ele).backgroundImage;
        var url = css.slice(5,-2);
        var image = new Image();
        image.src = url;
        //ele.imgHeight = (image.height - ele.offsetHeight)/2;
        ele.imgHeight = image.height/2;
        //make element same size as image
        ele.style.height = image.height + 'px';
        image = null;
        //get document coord for top
        ele._top = getTop(ele);
        //half of height
        ele.halfHeight = ele.offsetHeight/2;
        //container height
        ele.containerHeight = ele.parentElement.offsetHeight/2;
        //image height - container height
        ele.heightDiff = ele.imgHeight - ele.containerHeight;
        //center
        ele.center = ele._top + ele.containerHeight;
    }

    function getTop(ele) {
        if (ele.parentElement) {
            return ele.offsetTop + getTop(ele.parentElement);
        }else{
            return ele.offsetTop;
        }
    }

    /*function scrollHandler(element, halfWay, scrollY) {
        var top = element._top - scrollY;
        if (top > halfWay*2) return;
        var eleCenter = element.halfHeight + top;
        var offset = top - element.imgHeight + (halfWay-eleCenter)*rate;
        return (element.style.backgroundPosition = '50% ' + offset + 'px');
    }
    var rate = -1.25/450 * screen.availHeight + 3.1667;//screen.availHeight/4200;

    var scrollY = window.scrollY;
    scrollHandler(header, halfWay, scrollY);
    scrollHandler(calHeader, halfWay, scrollY);
    scrollHandler(headerNarrow, halfWay, scrollY);


    window.onscroll = function() {
        window.requestAnimationFrame(function() {
            //only get the scrollY once for all three
            var scrollY = window.scrollY;
            scrollHandler(calHeader, halfWay, scrollY);
            if (!useNarrow)
                scrollHandler(header, halfWay, scrollY);
            else
                scrollHandler(headerNarrow, halfWay, scrollY);
        });
    };*/
    //allow window size to change without weird behavior
    window.addEventListener('resize', function() {
        var scrollY = window.scrollY;
        //scrollHandler(header, halfWay, scrollY);
        //scrollHandler(calHeader, halfWay, scrollY);
        //scrollHandler(headerNarrow, halfWay, scrollY);
        //re-calc img measurement
        //defineImgHeight(header);
        //defineImgHeight(calHeader);
        //defineImgHeight(headerNarrow);
        defineImgHeight(bgSlideWide);
        defineImgHeight(bgSlideNarrow);
        defineImgHeight(bgSlideCal);

        bgSlideHandler(bgSlideWide, scrollY);
        bgSlideHandler(bgSlideNarrow, scrollY);
        bgSlideHandler(bgSlideCal, scrollY);

        //re-calc window height
        halfWay = window.innerHeight/2;
        //see if narrow is being used
        useNarrow = window.getComputedStyle(headerNarrow).display !== 'none';
    }, false);

    bgSlideHandler(bgSlideWide, scrollY);
    bgSlideHandler(bgSlideNarrow, scrollY);
    bgSlideHandler(bgSlideCal, scrollY);
});