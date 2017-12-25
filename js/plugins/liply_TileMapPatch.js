(function () {
    'use strict';
    var TileRenderer = PIXI.WebGLRenderer.__plugins.tile;
    TileRenderer.prototype.checkIndexBuffer = function(size) {
        // the total number of indices in our array, there are 6 points per quad.
        var totalIndices = size * 6;
        var indices = this.indices;
        if (totalIndices <= indices.length) {
            return;
        }
        var len = indices.length || totalIndices;
        while (len < totalIndices) {
            len <<= 1;
        }

        indices = new Uint16Array(len);
        this.indices = indices;

        // fill the indices with the quads to draw
        for (var i=0, j=0; i < len; i += 6, j += 4)
        {
            indices[i + 0] = j + 0;
            indices[i + 1] = j + 1;
            indices[i + 2] = j + 2;
            indices[i + 3] = j + 0;
            indices[i + 4] = j + 2;
            indices[i + 5] = j + 3;
        }

        this.indexBuffer.upload(indices);
    };

})();