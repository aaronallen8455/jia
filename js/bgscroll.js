window.addEventListener('load', function() {
    //get the elements with bg images
    var header = document.querySelector('.splashWide');
    var headerNarrow = document.querySelector('.splashNarrow');
    var calHeader = document.querySelector('.calHeader');

    //get the bg image height/width ratio
    function getSizeRatio(ele) {
        var css = window.getComputedStyle(ele).backgroundImage;
        var url = css.slice(5,-2);
        var image = new Image();
        image.src = url;
        return image.height/image.width;
    }
    //var headerRatio = getSizeRatio(header);
    //var calHeaderRatio = getSizeRatio(calHeader);
    //var headerNarrowRatio = getSizeRatio(headerNarrow);
    defineImgHeight(header);
    defineImgHeight(calHeader);
    defineImgHeight(headerNarrow);

    var halfWay = window.innerHeight/2;

    function defineImgHeight(ele) {
        //get imgHeight
        var css = window.getComputedStyle(ele).backgroundImage;
        var url = css.slice(5,-2);
        var image = new Image();
        image.src = url;
        ele.imgHeight = image.height/image.width * ele.offsetWidth / 2;
        image = null;
        //get document coord for top
        ele._top = getTop(ele);
    }

    function getTop(ele) {
        if (ele.parentElement) {
            return ele.offsetTop + getTop(ele.parentElement);
        }else{
            return ele.offsetTop;
        }
    }

    function scrollHandler(element, halfWay) {
        var top = element._top - window.scrollY;
        if (top > halfWay*2 || top < -halfWay*2) return;
        var eleCenter = element.offsetHeight/2 + top;

        element.style.backgroundPosition = '50% ' + (eleCenter-element.imgHeight + (halfWay-eleCenter) *.25) + 'px';
    }
    
    scrollHandler(header, halfWay);
    scrollHandler(calHeader, halfWay);
    scrollHandler(headerNarrow, halfWay);
    
    window.onscroll = function() {
        window.requestAnimationFrame(function() {
            scrollHandler(header, halfWay);
            scrollHandler(calHeader, halfWay);
            scrollHandler(headerNarrow, halfWay);
        });
    };
    //allow window size to change without weird behavior
    window.addEventListener('resize', function() {
        scrollHandler(header, halfWay);
        scrollHandler(calHeader, halfWay);
        scrollHandler(headerNarrow, halfWay);
        //re-calc img measurement
        defineImgHeight(header);
        defineImgHeight(calHeader);
        defineImgHeight(headerNarrow);
        //re-calc window height
        halfWay = window.innerHeight/2;
    }, false);
});