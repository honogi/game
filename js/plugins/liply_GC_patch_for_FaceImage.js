(function(){
    (function(o, p) {
        var f = o[p]; o[p] = function() {
            var bitmap = f.apply(this, arguments);
            bitmap.__liply_attachedToScene = true;
            return bitmap;
        };
    }(ImageManager, 'loadFace'));
}());
