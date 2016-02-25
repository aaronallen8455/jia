window.addEventListener('load', function() {
    //UI elements
    var bg = document.getElementById('bg');
    var color = document.getElementById('color');
    var link = document.getElementById('link');
    var font = document.getElementById('font');
    [bg, color, link, font].forEach(function(x){x.onchange = updateStyle;});
    var serviceCode = document.getElementById('serviceCode');
    var userId = document.getElementById('uid').value;
    //The preview DIV
    var previewDiv = document.getElementById('preview');
    //a function to change all style settings
    function updateStyle() {
        previewDiv.style.backgroundColor = bg.value;
        previewDiv.style.color = color.value;
        previewDiv.style.fontFamily = font.value;
        var links = previewDiv.getElementsByClassName('previewLink');
        for (var i=0; i<links.length; i++) {
            links[i].style.color = link.value;
            links[i].style.textDecoration = 'underline';
        }
        //out put the code
        var code = '<div><iframe src="http://jazzinaustin.com/service/service.php?id=';
        code += userId;
        code += '&bg=' + encodeURIComponent(bg.value);
        code += '&color=' + encodeURIComponent(color.value);
        code += '&link=' + encodeURIComponent(link.value);
        code += '&font=' + encodeURIComponent(font.value);
        code += '</iframe></div>';
        serviceCode.value = code;
    }
    updateStyle();
    
});