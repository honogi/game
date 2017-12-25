(function () {
'use strict';

Graphics._bitmapPool = [];
Graphics.MEMORY_THRESHOLD = 100 * 1024 * 1024;

//
// Scene_Base
//
var Scene_Base_prototype_initialize = Scene_Base.prototype.initialize;
Scene_Base.prototype.initialize = function() {
    Scene_Base_prototype_initialize.call(this);
    this.__liply_sceneId = SceneManager._generateId();
};

//
// Bitmap
//
Bitmap.snap = function(stage) {
    var width = Graphics.width;
    var height = Graphics.height;
    var bitmap = new Bitmap(width, height);
    var context = bitmap._context;
    var renderTexture = PIXI.RenderTexture.create(width, height);
    if (stage) {
        Graphics._renderer.render(stage, renderTexture);
        stage.worldTransform.identity();
        var canvas = null;
        if (Graphics.isWebGL()) {
            canvas = Graphics._renderer.extract.canvas(renderTexture);
        } else {
            canvas = renderTexture.baseTexture._canvasRenderTarget.canvas;
        }
        context.drawImage(canvas, 0, 0);
    } else {
        //TODO: Ivan: what if stage is not present?
    }
    bitmap._setDirty();

    renderTexture.destroy();
    if(Graphics.isWebGL()){
        var textures = Graphics._renderer.textureManager._managedTextures;
        if(textures.indexOf(renderTexture) !== -1)
            textures.splice(textures.indexOf(renderTexture), 1);
    }
    return bitmap;
};


Bitmap.prototype.retain = function(){
    if(this.__liply_count === undefined){
        this.__liply_count = 1;
    }else{
        this.__liply_count++;
    }
};

Bitmap.prototype.release = function(){
    this.__liply_count--;
};

Bitmap.prototype.count = function(){
    return this.__liply_count || 0;
};

var Bitmap_prototype_initialize = Bitmap.prototype.initialize;
Bitmap.prototype.initialize = function(width, height){
    Bitmap_prototype_initialize.call(this, width, height);
    this.__liply_sceneId = SceneManager._scene.__liply_sceneId;

    if(Graphics.getUsedMemory() > Graphics.MEMORY_THRESHOLD){
        Graphics.reserveGc(true);
    }
    Graphics._registerBitmap(this);
};

Bitmap.prototype.free = function(){
    ImageManager.detachFromCache(this);

    this.baseTexture.destroy();
    this.baseTexture.hasLoaded = false;
    this.canvas.width = 0;
    this.__liply_broken = true;
};

/**
 * Plugin creator MUST CALL this method if created Bitmap is not directly attached to Scene.
 * Otherwise, the bitmap will be released when emergent gc is invoked, so your plugin rendering may be broken.
 */
Bitmap.prototype.using = function(){
    this.__liply_attachedToScene = true;
};


//
// ImageManager
//
var ImageManager_loadSystem = ImageManager.loadSystem;
ImageManager.loadSystem = function(filename, hue) {
    var bitmap = ImageManager_loadSystem.call(this, filename, hue);
    bitmap.retain();
    return bitmap;
};

var ImageManager_loadEmptyBitmap = ImageManager.loadEmptyBitmap;
ImageManager.loadEmptyBitmap = function(){
    var bitmap = ImageManager_loadEmptyBitmap.call(this);
    bitmap.retain();
    return bitmap;
};

ImageManager.detachFromCache = function(bitmap){
    var cacheData = this.cache._inner;

    for(var key in cacheData){
        if(cacheData.hasOwnProperty(key)){
            var item = cacheData[key].item;
            if(bitmap === item){
                delete cacheData[key];
                break;
            }
        }
    }
};


//
// Graphics
//
Graphics._registerBitmap = function(bitmap){
    this._bitmapPool.push(bitmap);
};

Graphics._miniMark = function(target, emergency){
    var this$1 = this;

    if (emergency) {
        this._bitmapPool.forEach(function (b){
            if (b.__liply_sceneId == target.__liply_sceneId && b.__liply_attachedToScene) {
                b.__liply_mark = true;
            }
        });
    } else {
        this._bitmapPool.forEach(function (b){
            if (b.__liply_sceneId == target.__liply_sceneId) {
                b.__liply_mark = true;
            }
        });
    }

    if(target && target.children) {
        target.children.forEach(function (s){
            if (s.bitmap) {
                s.bitmap.__liply_mark = true;
            }
            if(s.bitmaps){
                for(var n = 0; n < s.bitmaps.length; ++n){
                    s.bitmaps[n].__liply_mark = true;
                }
            }
            this$1._miniMark(s);
        });
    }
};

Graphics.cleanupTinter = function(target){
    var this$1 = this;

    if(target && target.children) {
        target.children.forEach(function (s){
            if(s._tintTexture) s._tintTexture.destroy();
            this$1.cleanupTinter(s);
        });
    }
};


Graphics._sweep = function(){
    var pool = this._bitmapPool;
    var alive = [];
    for(var n = 0, l = pool.length; n < l; ++n){
        var bitmap = pool[n];
        if(bitmap.__liply_mark || bitmap.count() > 0){
            alive.push(bitmap);
        }else{
            bitmap.free();
        }

        bitmap.__liply_mark = false;
    }

    return alive;
};

Graphics.getUsedMemory = function(){
    var pool = this._bitmapPool;
    var size = 0;
    for(var key in pool){
        if(pool.hasOwnProperty(key)){
            var bitmap = pool[key];
            size += bitmap.canvas.width * bitmap.canvas.height * 4;
        }
    }

    return size;
};

Graphics.getBitmapCount = function(){
    return this._bitmapPool.length;
};

Graphics.gc = function(emergency){
    var this$1 = this;

    var stack = SceneManager.getSceneStack();
    for(var n = 0; n < stack; ++n)
        this$1._miniMark(stack[n], emergency);
    this._miniMark(SceneManager.getCurrentScene(), emergency);
    this._bitmapPool = this._sweep();
};

Graphics.reserveGc = function(emergency){
    this._reserveGcFlag = true;
    this._emergencyFlag = emergency;
};

Graphics.isEmergency = function(){
    return this._emergencyFlag;
};

Graphics.performReservedGc = function(){
    if(this._reserveGcFlag){
        this._reserveGcFlag = false;
        this.gc(this._emergencyFlag);
    }
};

//
// SceneManager
//

SceneManager._generateId = (function(){
    var id = 1;
    return function (){ return id++; };
})();

SceneManager.isSceneStable = function(){
    return !this.isSceneChanging() && this.isCurrentSceneStarted();
};

SceneManager.performCleanupIfChanged = function(){
    var newScene = this._scene;
    if(this._beforeScene !== newScene){
        if(this._beforeScene) Graphics.cleanupTinter(this._beforeScene);
        this._beforeScene = newScene;
    }
};

SceneManager.getSceneStack = function(){
    return this._stack;
};

SceneManager.getCurrentScene = function(){
    return this._scene;
};

var SceneManager_goto = SceneManager.goto;
SceneManager.goto = function () {
    SceneManager_goto.apply(this, arguments);
    Graphics.reserveGc();
};

var SceneManager_push = SceneManager.push;
SceneManager.push = function () {
    SceneManager_push.apply(this, arguments);
    Graphics.reserveGc();
};

var SceneManager_pop = SceneManager.pop;
SceneManager.pop = function () {
    SceneManager_pop.apply(this, arguments);
    Graphics.reserveGc();
};

var SceneManager_updateScene = SceneManager.updateScene;
SceneManager.updateScene = function(){
    SceneManager_updateScene.call(this);
    this.performCleanupIfChanged();
    if(this.isSceneStable())Graphics.performReservedGc(this._scene);
};



var SceneManager_snapForBackground = SceneManager.snapForBackground;
SceneManager.snapForBackground = function() {
    if(this._backgroundBitmap){
        this._backgroundBitmap.free();
        this._backgroundBitmap = null;
    }

    SceneManager_snapForBackground.call(this);
};

}());