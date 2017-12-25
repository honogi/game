(function(){
    'use strict';
    
    (function(o, p) {
        var f = o[p]; o[p] = function(source, sx, sy, sw, sh, dx, dy, dw, dh) {
            var bitmap = (!this.width) ? this : (!source.width) ? source : null;
            if (bitmap) {
                bitmap.addLoadListener(function(){
                    this.blt(source, sx, sy, sw, sh, dx, dy, dw, dh);
                }.bind(this));
                return;
            }
            f.apply(this, arguments);
        };
    }(Bitmap.prototype, 'blt'));
}());
