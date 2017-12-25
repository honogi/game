//=============================================================================
// Saba_Performance.js
//=============================================================================
/*:ja
 * @plugindesc まだテスト版です。OFFにする場合は 0 を入力してください
 * @author Sabakan
 *
 * @param notDrawAtBitmapSnap
 * @desc snap作成時に canvas を経由しないようにします。<br>■副作用:　小。画面遷移系を変更している場合はエラーになります。
 * @default 1
 *
 * @param recycleCanvas
 * @desc Canvas を使い回すことで生成コストを下げます。また、必要でないときは作成しないようにします。■副作用:　中。
 * @default 1
 *
 * @param skipSnapForBackgroundByNewGame
 * @desc ゲーム開始時にSnapForBackgroundをしないようにします。<br>■副作用:　小。ゲーム開始時に特殊な処理をしている場合は無効にしてください
 * @default 1
 *
 * @param skipSnapForBackgroundByMapChange
 * @desc マップ移動時にSnapForBackgroundをしないようにします。<br>■副作用:　小
 * @default 1
 *
 * @param usePixiSpriteToDrawWindow_Base
 * @desc PIXI.Spriteを使ってWindow_Baseを描画します。<br>■副作用:　中。Windowの描画を変更している場合は無効にしてください
 * @default 1
 *
 * @param useFilterToChangePictureTone
 * @desc PIXI のフィルタを使ってピクチャの色調を変化させます。<br>■副作用:　大。グレー効果は効かなくなります
 * @default 1
 *
 * @param reduceWindowInitializeProcess
 * @desc ウィンドウの初期化の無駄な処理を減らします<br>■副作用:　なし
 * @default 1
 *
 * @param alternateBitmapClearMethod
 * @desc Bitmap.clear() メソッドを高速な方法に切り替えます<br>■副作用:　中。Bitmap.clear()を呼ぶと、CanvasRenderingContext2Dのスタイルもクリアされます
 * @default 1
 *
 * @param usePixiSpriteToDrawIcon
 * @desc PIXI.Spriteを使ってIconを描画します。<br>■副作用:　中。アイコンのZ順に影響が出ることがあります
 * @default 1
 *
 * @param usePixiSpriteToDrawFace
 * @desc PIXI.Spriteを使ってFaceを描画します。<br>■副作用:　中。顔グラのZ順に影響が出ることがあります
 * @default 1
 *
 * @param usePixiSpriteToDrawCharacter
 * @desc PIXI.Spriteを使ってCharacterを描画します。<br>■副作用:　中。キャラグラのZ順に影響が出ることがあります
 * @default 1
 *
 * @param usePixiGraphicsToDrawMenuBg
 * @desc
 * @default 1
 *
 * @param donotCreateDummyBitmap
 * @desc
 * @default 1
 *
 * @param skipUnnecessaryRefresh
 * @desc ウィンドウの初期化の無駄な処理を減らします<br>■副作用:　なし
 * @default 1
 *
 * @param lazyInitializationBitmapAtSprite_Timer
 * @desc タイマー用の Bitmap を、必要になるまで作成しないようにします<br>■副作用:　小
 * @default 1
 *
 * @param lazyInitializationWeather
 * @desc 天気用の Bitmap を、必要になるまで作成しないようにします<br>■副作用:　小
 * @default 1
 *
 * @param lazyCreationWindow_MapName
 * @desc マップネームウィンドウを、必要になるまで作成しないようにします<br>■副作用:　小
 * @default 1
 *
 * @param lazyCreationWindow_ScrollText
 * @desc スクロールテキストウィンドウを、必要になるまで作成しないようにします<br>■副作用:　小
 * @default 1
 *
 * @param useSpriteToDrawSprite_Destination
 * @desc
 * @default 1
 *
 * @param skipWindow_CommandFirstCreateContents
 * @desc 不要な createContents をスキップします<br>■副作用:　小。通常は影響がないはずです
 * @default 1
 *
 * @param useDefaultTextColor
 * @desc pixelを調べずにテキストカラーを取得するようにします<br>■副作用:　小。テキストカラーを変更していても、それが反映されません
 * @default 1
 *
 * @param reduceLoadingGlobalInfo
 * @desc
 * @default 1
 *
 * @param notLoadingVolumeZeroAudio
 * @desc config でボリュームが 0 に設定したオーディオを読み込まないようにします<br>■副作用:　小。ボリュームを 0 から 1 以上にあげると、最初から再生されます
 * @default 1
 *
 * @help
 * ・MV1.3 WebGL モード限定です
 * ・canvas 呼び出しで固まってしまう機種に対して効果を発揮します
 */
var Saba;
(function (Saba) {

var parameters = PluginManager.parameters('Saba_Performance');


if (parseInt(parameters['notDrawAtBitmapSnap'])) {
    /**
     * snap作成時に canvas を経由しない。
     * メニューのオープンが速くなる。
     */
    var renderTexture;
    Bitmap.snap = function(stage) {
        var width = Graphics.width;
        var height = Graphics.height;
        // var bitmap = new Bitmap(width, height);
        if (! renderTexture) {
            renderTexture = PIXI.RenderTexture.create(width, height);
        }
        if (stage) {
            Graphics._renderer.render(stage, renderTexture);
            stage.worldTransform.identity();
            return new PIXI.Sprite(new PIXI.Texture(renderTexture));
            // context.drawImage(canvas, 0, 0);
        } else {
            //TODO: Ivan: what if stage is not present?
        }
        return null;
    };
    /**
     * Bitmap.blur が使えなくなるのでフィルタで代用
     */
    Scene_MenuBase.prototype.createBackground = function() {
        this._backgroundSprite = SceneManager.backgroundBitmap();
        var blurFilter = new PIXI.filters.BlurFilter(1);
        this._backgroundSprite.filters = [blurFilter];
        var destroy = this._backgroundSprite.destroy;
        this._backgroundSprite.destroy = function(options) {
            // DO nothing
            this.filters = null;
        };
        this.addChild(this._backgroundSprite);
    };
    SceneManager.snapForBackground = function() {
        this._backgroundBitmap = this.snap();
        // this._backgroundBitmap.blur();
    };
    Spriteset_Battle.prototype.createBackground = function() {
        if (SceneManager.backgroundBitmap()) {
            this._baseSprite.addChild(SceneManager.backgroundBitmap());
        }
    };
}



if (parseInt(parameters['recycleCanvas'])) {
    /**
     * 一度作成した canvas を使い回すことで、初期化のコストを減らす。
     * ゲームの起動、シーン遷移などが速くなる。
     */
    SceneManager.changeScene = function() {
        if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
            if (this._scene) {
                this._scene.terminate();
                this._scene.returnCanvas();
                this._previousClass = this._scene.constructor;
                this._previousScene = this._scene;
            }
            this._scene = this._nextScene;
            if (this._scene) {
                this._scene.create();
                this._nextScene = null;
                this._sceneStarted = false;
                this.onSceneCreate();
            }
            if (this._exiting) {
                this.terminate();
            }
            if (this._previousScene) {
                this._previousScene.destroy({children: true, texture: true});
                this._previousScene.visible = false;
                this._previousScene = null;
            }
        }
    };
    SceneManager.renderScene = function() {
        if (this.isCurrentSceneStarted()) {
            Graphics.render(this._scene);
        } else if (this._scene) {
            this.onSceneLoading();
        }
    };
    Scene_Base.prototype.returnCanvas = function() {
        returnChildCanvas(this._windowLayer);
        returnChildCanvas(this);
        if (this._spriteset) {
            returnChildCanvas(this._spriteset);
            returnChildCanvas(this._spriteset._battleField);
        }
    };
    function returnChildCanvas(parent) {
        if (! parent) {
            return;
        }
        for (var i = 0; i < parent.children.length; i++) {
            var child = parent.children[i];
            if (child.returnCanvas) {
                child.returnCanvas();
            }
        }
    }
    Window.prototype.returnCanvas = function() {
        if (this.contents && this.contents.returnCanvas) {
            this.contents.returnCanvas();
        }
    };
    Sprite.prototype.returnCanvas = function(options) {
        if (this.bitmap && this.bitmap.returnCanvas) {
            this.bitmap.returnCanvas();
        }
    };
    var canvasCacheMap = {};
    function getCanvasCache(width, height) {
        var key = width + '_' + height;
        canvasCacheMap[key] = canvasCacheMap[key] || [];
        if (canvasCacheMap[key].length > 0) {
            return canvasCacheMap[key].pop();
        }
        var canvasCache = {};
        canvasCache._canvas = document.createElement('canvas');
        canvasCache._context = canvasCache._canvas.getContext('2d');

        canvasCache._canvas.width = width;
        canvasCache._canvas.height = height;

        return canvasCache;
    }
    function putCanvasCache(bitmap) {
        var canvasCache = {};
        canvasCache._canvas = bitmap._canvas;
        canvasCache._context = bitmap._context;
        var key = bitmap._canvas.width + '_' + bitmap._canvas.height;
        canvasCacheMap[key] = canvasCacheMap[key] || [];
        canvasCacheMap[key].push(canvasCache);
    }
    Bitmap.prototype.returnCanvas = function() {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        if (! this._context) {
            return;
        }
        //this._baseTexture.destroy();
        putCanvasCache(this);
    };
    Bitmap.prototype.initialize = function(width, height) {
        if (width !== undefined) {
            width = Math.max(width || 0, 1);
            height = Math.max(height || 0, 1);
            var cache = getCanvasCache(width, height);
            this._canvas = cache._canvas;
            this._context = cache._context;

            this._baseTexture = new PIXI.BaseTexture(this._canvas);
        } else {
            // 幅を指定しない場合は canvas を作成しない
            this._baseTexture = new PIXI.BaseTexture(null);
            this._canvas = {};  // dummy
            this._canvas.width = Math.max(width || 0, 1);
            this._canvas.height = Math.max(height || 0, 1);
            this._baseTexture.source = this._canvas;
        }
        this._baseTexture.mipmap = false;
        this._baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this._image = null;
        this._url = '';
        this._paintOpacity = 255;
        this._smooth = false;
        this._loadListeners = [];
        this._isLoading = false;
        this._hasError = false;

        /**
         * Cache entry, for images. In all cases _url is the same as cacheEntry.key
         * @type CacheEntry
         */
        this.cacheEntry = null;

        /**
         * The face name of the font.
         *
         * @property fontFace
         * @type String
         */
        this.fontFace = 'GameFont';

        /**
         * The size of the font in pixels.
         *
         * @property fontSize
         * @type Number
         */
        this.fontSize = 28;

        /**
         * Whether the font is italic.
         *
         * @property fontItalic
         * @type Boolean
         */
        this.fontItalic = false;

        /**
         * The color of the text in CSS format.
         *
         * @property textColor
         * @type String
         */
        this.textColor = '#ffffff';

        /**
         * The color of the outline of the text in CSS format.
         *
         * @property outlineColor
         * @type String
         */
        this.outlineColor = 'rgba(0, 0, 0, 0.5)';

        /**
         * The width of the outline of the text.
         *
         * @property outlineWidth
         * @type Number
         */
        this.outlineWidth = 4;
    };
    Bitmap.prototype._onLoad = function() {
        if(Decrypter.hasEncryptedImages) {
            window.URL.revokeObjectURL(this._image.src);
        }
        this._isLoading = false;
        this._baseTexture.loadSource(this._image);
        this._canvas = this._image;

        this.resize(this._image.width, this._image.height);
        this._baseTexture.emit('loaded', this._baseTexture);
        // this._context.drawImage(this._image, 0, 0);
        this._setDirty();
        this._callLoadListeners();
    };
    var _Bitmap_rotateHue = Bitmap.prototype.rotateHue;
    Bitmap.prototype.rotateHue = function(offset) {
        if (offset && this.width > 0 && this.height > 0) {
            if (! this._context) {
                // この時だけ仕方なく描画。
                var cache = getCanvasCache();
                this._canvas = cache._canvas;
                this._context = cache._context;
                this.resize(this._image.width, this._image.height);
                this._context.drawImage(this._image, 0, 0);
            }
        }
        _Bitmap_rotateHue.call(this, offset);
    };
    Object.defineProperty(Sprite.prototype, 'bitmap', {
        set: function(value) {
            if (this._bitmap !== value) {
                if (this._bitmap) {
                    this._bitmap.returnCanvas();
                    this._bitmap._loadListeners = [];
                }
                this._bitmap = value;
                if (this._bitmap) {
                    this.setFrame(0, 0, 0, 0);
                    this._bitmap.addLoadListener(this._onBitmapLoad.bind(this));
                } else {
                    this.texture.frame = Rectangle.emptyRectangle;
                }
            }
        },
        configurable: true
    });
    var _Sprite_destroy = Sprite.prototype.destroy;
    Sprite.prototype.destroy = function (options)
    {
        if (this._bitmap && this._bitmap.destroy) {
            // recycle
            this._bitmap.destroy();
        }
        _Sprite_destroy.call(this, options);
    };
    Bitmap.prototype.getPixel = function(x, y) {
        if (! this._context) {
            // この時だけ仕方なく描画。
            var cache = getCanvasCache();
            this._canvas = cache._canvas;
            this._context = cache._context;
            this.resize(this._image.width, this._image.height);
            this._context.drawImage(this._image, 0, 0);
        }
        var data = this._context.getImageData(x, y, 1, 1).data;
        var result = '#';
        for (var i = 0; i < 3; i++) {
            result += data[i].toString(16).padZero(2);
        }
        return result;
    };
    ImageManager.loadEmptyBitmap = function() {
        var empty = this.cache.getItem('empty');
        if (!empty) {
            empty = new Bitmap(1);
            this.cache.setItem('empty', empty);
        }
        return empty;
    };
    Sprite.prototype._createTinter = function(w, h) {
        if (!this._canvas2) {
            this._canvas2 = document.createElement('canvas');
            this._context = this._canvas2.getContext('2d');
        }

        this._canvas2.width = w;
        this._canvas2.height = h;

        if (!this._tintTexture) {
            this._tintTexture = new PIXI.BaseTexture(this._canvas2);
        }

        this._tintTexture.width = w;
        this._tintTexture.height = h;
        this._tintTexture.scaleMode = this._bitmap.baseTexture.scaleMode;
    };
}


if (parseInt(parameters['skipSnapForBackgroundByNewGame'])) {
    /**
     * Scene_Title から newGame の選択時は、snapForBackground が不必要
     */
    Scene_Title.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        if (!SceneManager.isNextScene(Scene_Map)) {
            SceneManager.snapForBackground();
        }
    };
}

if (parseInt(parameters['skipSnapForBackgroundByMapChange'])) {
    /**
     * マップ切り替え時は SceneManager.snapForBackground を呼ばないようにした
     */
    Scene_Map.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        if (!SceneManager.isNextScene(Scene_Battle) && !SceneManager.isNextScene(Scene_Map)) {
            this._spriteset.update();
            this._mapNameWindow.hide();
            SceneManager.snapForBackground();
        }
        $gameScreen.clearZoom();
    };
}

if (parseInt(parameters['usePixiSpriteToDrawWindow_Base'])) {
    /**
     * Window の描画は drawImage が何度も走るので PIXI.Sprite で代用
     */
    Window.prototype._refreshBack = function() {
        var m = this._margin;
        var w = this._width - m * 2;
        var h = this._height - m * 2;
        // var bitmap = new Bitmap(w, h);
        // this._windowBackSprite.bitmap = bitmap;
        this._windowBackSprite.setFrame(0, 0, w, h);
        this._windowBackSprite.move(m, m);

        this._windowBackSprite._toneFilter = new ToneFilter();

        if (w > 0 && h > 0 && this._windowskin) {
            var baseTexture = this.getBaseTexture();
            for (var i = 0, j = this._windowBackSprite.children.length; i < j; ++i)
            {
                this._windowBackSprite.children[i].destroy({children: true, texture: true});
            }
            this._windowBackSprite.removeChildren();

            var p = 96;
            var texture = new PIXI.Texture(baseTexture);
            texture.frame = new PIXI.Rectangle(0, 0, p, p);
            var backSprite = new PIXI.Sprite(texture);
            backSprite.width = w;
            backSprite.height = h;
            this._windowBackSprite.addChild(backSprite);
            // bitmap.blt(this._windowskin, 0, 0, p, p, 0, 0, w, h);

            var tileTexture = null;

            for (var y = 0; y < h; y += p) {
                for (var x = 0; x < w; x += p) {
                    var ww = p;
                    var hh = p;
                    if (x + ww > w) {
                        ww = w - x;
                    }
                    if (y + hh > h) {
                        hh = h - y;
                    }
                    var tileSprite;
                    if (p != hh || p != ww) {
                        var tileTexture2 = new PIXI.Texture(baseTexture);
                        tileTexture2.frame = new PIXI.Rectangle(0, p, ww, hh);
                        tileSprite = new PIXI.Sprite(tileTexture2);
                    } else {
                        if (! tileTexture) {
                            tileTexture = new PIXI.Texture(baseTexture);
                            tileTexture.frame = new PIXI.Rectangle(0, p, p, p);
                        }
                        tileSprite = new PIXI.Sprite(tileTexture);
                    }
                    tileSprite.width = ww;
                    tileSprite.height = hh;
                    tileSprite.position.x = x;
                    tileSprite.position.y = y;
                    this._windowBackSprite.addChild(tileSprite);
                    // bitmap.blt(this._windowskin, 0, p, p, p, x, y, p, p);
                }
            }
            var tone = this._colorTone;
            this._windowBackSprite._toneFilter.reset();
            this._windowBackSprite._toneFilter.adjustTone(tone[0], tone[1], tone[2]);
            //bitmap.adjustTone(tone[0], tone[1], tone[2]);
        }
    
    };
    Window.prototype.getBaseTexture = function() {
        var baseTexture = PIXI.utils.BaseTextureCache[this._windowskin._image.src];
        if (! baseTexture) {
            baseTexture = new PIXI.BaseTexture(this._windowskin._image, PIXI.SCALE_MODES.DEFAULT);
            baseTexture.imageUrl = this._windowskin._image.src;
            PIXI.utils.BaseTextureCache[this._windowskin._image.src] = baseTexture;
        }
        return baseTexture;
    };
    Window.prototype._refreshFrame = function() {
        var w = this._width;
        var h = this._height;
        var m = 24;
        // var bitmap = new Bitmap(w, h);

        // this._windowFrameSprite.bitmap = bitmap;
        this._windowFrameSprite.setFrame(0, 0, w, h);

        if (w > 0 && h > 0 && this._windowskin) {
            // var skin = this._windowskin;
            var baseTexture = this.getBaseTexture();

            var parent = this._windowFrameSprite;
            for (var i = 0, j = parent.children.length; i < j; ++i)
            {
                parent.children[i].destroy({texture: true});
            }
            parent.removeChildren();
            var p = 96;
            var q = 96;
            this._addPixiSprite(parent, baseTexture, p+m, 0+0, p-m*2, m, m, 0, w-m*2, m);
            this._addPixiSprite(parent, baseTexture, p+m, 0+q-m, p-m*2, m, m, h-m, w-m*2, m);
            this._addPixiSprite(parent, baseTexture, p+0, 0+m, m, p-m*2, 0, m, m, h-m*2);
            this._addPixiSprite(parent, baseTexture, p+q-m, 0+m, m, p-m*2, w-m, m, m, h-m*2);
            this._addPixiSprite(parent, baseTexture, p+0, 0+0, m, m, 0, 0, m, m);
            this._addPixiSprite(parent, baseTexture, p+q-m, 0+0, m, m, w-m, 0, m, m);
            this._addPixiSprite(parent, baseTexture, p+0, 0+q-m, m, m, 0, h-m, m, m);
            this._addPixiSprite(parent, baseTexture, p+q-m, 0+q-m, m, m, w-m, h-m, m, m);

            // bitmap.blt(skin, p+m, 0+0, p-m*2, m, m, 0, w-m*2, m);
            // bitmap.blt(skin, p+m, 0+q-m, p-m*2, m, m, h-m, w-m*2, m);
            // bitmap.blt(skin, p+0, 0+m, m, p-m*2, 0, m, m, h-m*2);
            // bitmap.blt(skin, p+q-m, 0+m, m, p-m*2, w-m, m, m, h-m*2);
            // bitmap.blt(skin, p+0, 0+0, m, m, 0, 0, m, m);
            // bitmap.blt(skin, p+q-m, 0+0, m, m, w-m, 0, m, m);
            // bitmap.blt(skin, p+0, 0+q-m, m, m, 0, h-m, m, m);
            // bitmap.blt(skin, p+q-m, 0+q-m, m, m, w-m, h-m, m, m);
        }
    };
    Window.prototype._addPixiSprite = function(parent, baseTexture, sx, sy, sw, sh, dx, dy, dw, dh) {
        var texture = new PIXI.Texture(baseTexture);
        texture.frame = new PIXI.Rectangle(sx, sy, sw, sh);
        var sprite = new PIXI.Sprite(texture);
        sprite.width = dw;
        sprite.height = dh;
        sprite.position.x = dx;
        sprite.position.y = dy;
        parent.addChild(sprite);
    };
    Window.prototype._refreshCursor = function() {
        var pad = this._padding;
        var x = this._cursorRect.x + pad - this.origin.x;
        var y = this._cursorRect.y + pad - this.origin.y;
        var w = this._cursorRect.width;
        var h = this._cursorRect.height;
        var m = 4;
        var x2 = Math.max(x, pad);
        var y2 = Math.max(y, pad);
        var ox = x - x2;
        var oy = y - y2;
        var w2 = Math.min(w, this._width - pad - x2);
        var h2 = Math.min(h, this._height - pad - y2);
        // var bitmap = new Bitmap(w2, h2);

        // this._windowCursorSprite.bitmap = bitmap;
        this._windowCursorSprite.setFrame(0, 0, w2, h2);
        this._windowCursorSprite.move(x2, y2);
        var parent = this._windowCursorSprite;
        for (var i = 0, j = parent.children.length; i < j; ++i)
        {
            parent.children[i].destroy({texture: true});
        }
        parent.removeChildren();

        if (w > 0 && h > 0 && this._windowskin) {
            // var skin = this._windowskin;
            var p = 96;
            var q = 48;

            var baseTexture = this.getBaseTexture();

            this._addPixiSprite(parent, baseTexture, p+m, p+m, q-m*2, q-m*2, ox+m, oy+m, w-m*2, h-m*2);
            this._addPixiSprite(parent, baseTexture, p+m, p+0, q-m*2, m, ox+m, oy+0, w-m*2, m);
            this._addPixiSprite(parent, baseTexture, p+m, p+q-m, q-m*2, m, ox+m, oy+h-m, w-m*2, m);
            this._addPixiSprite(parent, baseTexture, p+0, p+m, m, q-m*2, ox+0, oy+m, m, h-m*2);
            this._addPixiSprite(parent, baseTexture, p+q-m, p+m, m, q-m*2, ox+w-m, oy+m, m, h-m*2);
            this._addPixiSprite(parent, baseTexture, p+0, p+0, m, m, ox+0, oy+0, m, m);
            this._addPixiSprite(parent, baseTexture, p+q-m, p+0, m, m, ox+w-m, oy+0, m, m);
            this._addPixiSprite(parent, baseTexture, p+0, p+q-m, m, m, ox+0, oy+h-m, m, m);
            this._addPixiSprite(parent, baseTexture, p+q-m, p+q-m, m, m, ox+w-m, oy+h-m, m, m);

            // bitmap.blt(skin, p+m, p+m, q-m*2, q-m*2, ox+m, oy+m, w-m*2, h-m*2);
            // bitmap.blt(skin, p+m, p+0, q-m*2, m, ox+m, oy+0, w-m*2, m);
            // bitmap.blt(skin, p+m, p+q-m, q-m*2, m, ox+m, oy+h-m, w-m*2, m);
            // bitmap.blt(skin, p+0, p+m, m, q-m*2, ox+0, oy+m, m, h-m*2);
            // bitmap.blt(skin, p+q-m, p+m, m, q-m*2, ox+w-m, oy+m, m, h-m*2);
            // bitmap.blt(skin, p+0, p+0, m, m, ox+0, oy+0, m, m);
            // bitmap.blt(skin, p+q-m, p+0, m, m, ox+w-m, oy+0, m, m);
            // bitmap.blt(skin, p+0, p+q-m, m, m, ox+0, oy+h-m, m, m);
            // bitmap.blt(skin, p+q-m, p+q-m, m, m, ox+w-m, oy+h-m, m, m);
        }
    };
}

if (parseInt(parameters['useFilterToChangePictureTone'])) {
    /**
     * 色調の変化の度に drawImage が走るのでフィルタで代用
     */
    Sprite.prototype.setColorTone = function(tone) {
        if (!(tone instanceof Array)) {
            throw new Error('Argument must be an array');
        }
        if (!this._colorTone.equals(tone)) {
            if (! this._toneFilter) {
                this._toneFilter = new ToneFilter();
                this.filters = [this._toneFilter];
            }
            this._colorTone = tone.clone();
            this._toneFilter.reset();
            this._toneFilter.adjustTone(tone[0], tone[1], tone[2]);
        }
    };
}

if (parseInt(parameters['reduceWindowInitializeProcess'])) {
    /**
     * ウィンドウの初期化で3回 _refreshAllParts が走るので1回にまとめた
     */
    var _Window_Base_initialize = Window_Base.prototype.initialize;
    Window_Base.prototype.initialize = function(x, y, width, height) {
        this._initializing = true;
        _Window_Base_initialize.call(this, x, y, width, height);
        this._initializing = false;
        this._refreshAllParts();
    };
    var _Window__refreshAllParts = Window.prototype._refreshAllParts;
    Window.prototype._refreshAllParts = function() {
        if (this._initializing) {
            return;
        }
        _Window__refreshAllParts.call(this);
    };
}

if (parseInt(parameters['alternateBitmapClearMethod'])) {
    /**
     * Chromium の clearRect は遅い
     */
    Bitmap.prototype.clear = function() {
        this._canvas.width = this._canvas.width;    // 裏技
        this._setDirty();
        //this.clearRect(0, 0, this.width, this.height);
    };
}


if (parseInt(parameters['usePixiSpriteToDrawIcon'])) {
    /**
     * drawIcon では drawImage が行われるので PIXI.Sprite で代用
     */
    Window_Base.prototype.drawIcon = function(iconIndex, x, y) {
        var baseTexture = PIXI.utils.BaseTextureCache['system/IconSet'];
        if (! baseTexture) {
            var bitmap = ImageManager.loadSystem('IconSet');
            if (! bitmap.isReady()) {
                return;
            }
            baseTexture = new PIXI.BaseTexture(bitmap._image, PIXI.SCALE_MODES.DEFAULT);
            baseTexture.imageUrl = 'system/IconSet';
            PIXI.utils.BaseTextureCache['system/IconSet'] = baseTexture;
        }

        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;

        var texture = new PIXI.Texture(baseTexture);
        texture.frame = new PIXI.Rectangle(sx, sy, pw, ph);
        var sprite = new PIXI.Sprite(texture);
        sprite.position.x = x;
        sprite.position.y = y;
        sprite.alpha = this.contents.paintOpacity / 255.0;
        this._windowContentsSprite.addChild(sprite);

        // this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
    };
}


if (parseInt(parameters['usePixiSpriteToDrawFace'])) {
    /**
     * drawFace では drawImage が行われるので PIXI.Sprite で代用
     */
    Window_Base.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
        if (! faceName) {
            return;
        }
        width = width || Window_Base._faceWidth;
        height = height || Window_Base._faceHeight;

        var baseTexture = PIXI.utils.BaseTextureCache['face/' + faceName];
        if (! baseTexture) {
            var bitmap = ImageManager.loadFace(faceName);
            if (! bitmap.isReady()) {
                return;
            }
            baseTexture = new PIXI.BaseTexture(bitmap._image, PIXI.SCALE_MODES.DEFAULT);
            baseTexture.imageUrl = 'face/' + faceName;
            PIXI.utils.BaseTextureCache['face/' + faceName] = baseTexture;
        }

        var pw = Window_Base._faceWidth;
        var ph = Window_Base._faceHeight;
        var sw = Math.min(width, pw);
        var sh = Math.min(height, ph);
        var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
        var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
        var sx = faceIndex % 4 * pw + (pw - sw) / 2;
        var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;

        if (sx + sw > baseTexture.width || sy + sh > baseTexture.height) {
            console.error(faceName + ' グラフィックの描画領域が画像サイズをはみ出しています');
            return;
        }
        var texture = new PIXI.Texture(baseTexture);
        texture.frame = new PIXI.Rectangle(sx, sy, sw, sh);
        var sprite = new PIXI.Sprite(texture);
        sprite.position.x = dx;
        sprite.position.y = dy;
        sprite.alpha = this.contents.paintOpacity / 255.0;
        this._windowContentsSprite.addChild(sprite);

        //this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
    };
}


if (parseInt(parameters['usePixiSpriteToDrawCharacter'])) {
    /**
     * drawCharacter では drawImage が行われるので PIXI.Sprite で代用
     */
    Window_Base.prototype.drawCharacter = function(characterName, characterIndex, x, y) {
        if (! characterName) {
            return;
        }
        var baseTexture = PIXI.utils.BaseTextureCache['character/' + characterName];
        if (! baseTexture) {
            var bitmap = ImageManager.loadCharacter(characterName);
            if (! bitmap.isReady()) {
              return;
            }
            baseTexture = new PIXI.BaseTexture(bitmap._image, PIXI.SCALE_MODES.DEFAULT);
            baseTexture.imageUrl = 'character/' + characterName;
            PIXI.utils.BaseTextureCache['character/' + characterName] = baseTexture;
        }

        var big = ImageManager.isBigCharacter(characterName);
        var pw = baseTexture.width / (big ? 3 : 12);
        var ph = baseTexture.height / (big ? 4 : 8);
        var n = characterIndex;
        var sx = (n % 4 * 3 + 1) * pw;
        var sy = (Math.floor(n / 4) * 4) * ph;

        var texture = new PIXI.Texture(baseTexture);
        texture.frame = new PIXI.Rectangle(sx, sy, pw, ph);
        var sprite = new PIXI.Sprite(texture);
        sprite.position.x = x - pw / 2;
        sprite.position.y = y - ph;
        this._windowContentsSprite.addChild(sprite);

        //this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph);
    };
}


if (parseInt(parameters['usePixiSpriteToDrawIcon']) ||
    parseInt(parameters['usePixiSpriteToDrawFace']) ||
    parseInt(parameters['usePixiSpriteToDrawCharacter'])) {
    /**
     * drawXXX 系を PIXI.Sprite で代用するときに必要なもの
     */
    Bitmap.prototype.setClearHandler = function(onClear) {
        this.onClear = onClear;
    };
    var _Bitmap_clear = Bitmap.prototype.clear;
    Bitmap.prototype.clear = function() {
        _Bitmap_clear.call(this);
        if (this.onClear) {
            this.onClear();
        }
    };
    var _Window_Base_createContents = Window_Base.prototype.createContents;
    Window_Base.prototype.createContents = function() {
        _Window_Base_createContents.call(this);
        this.contents.setClearHandler(this.onClearContents.bind(this));
        this.contents.clear();
    };
    var _Window_Base_destroy = Window_Base.prototype.destroy;
    Window_Base.prototype.destroy = function(options) {
        if (this.contents && this.contents.onClear) {
            this.contents.onClear = null;
        }
        _Window_Base_destroy.call(this, options);
    };
    
    Window_Base.prototype.onClearContents = function() {
        // PIXI.Sprite を消去
        for (var i = 0, j = this._windowContentsSprite.children.length; i < j; ++i)
        {
            this._windowContentsSprite.children[i].destroy({children: true, texture: true});
        }
        this._windowContentsSprite.removeChildren();
    };
}


if (parseInt(parameters['usePixiGraphicsToDrawMenuBg'])) {
    /**
     * メニュー背景の描画を PIXI.Graphics で代用する
     */
    Window_MenuStatus.prototype.drawItemBackground = function(index) {
        if (index === this._pendingIndex) {
            var rect = this.itemRect(index);
            var color = this.pendingColor();
            var graphics = new PIXI.Graphics();
            graphics.beginFill(color, this.translucentOpacity() / 255.0);
            graphics.drawRect(rect.x, rect.y, rect.width, rect.height);
            this.addChild(graphics);
            // this.changePaintOpacity(false);
            // this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
            // this.changePaintOpacity(true);
        }
    };
}


if (parseInt(parameters['donotCreateDummyBitmap'])) {
    /**
     * _windowBackSprite の bitmap は不要なので作成しない
     */
    Window.prototype._createAllParts = function() {
        this._windowSpriteContainer = new PIXI.Container();
        this._windowBackSprite = new Sprite();
        this._windowCursorSprite = new Sprite();
        this._windowFrameSprite = new Sprite();
        this._windowContentsSprite = new Sprite();
        this._downArrowSprite = new Sprite();
        this._upArrowSprite = new Sprite();
        this._windowPauseSignSprite = new Sprite();
        // this._windowBackSprite.bitmap = new Bitmap(1, 1);
        this._windowBackSprite.alpha = 192 / 255;
        this.addChild(this._windowSpriteContainer);
        this._windowSpriteContainer.addChild(this._windowBackSprite);
        this._windowSpriteContainer.addChild(this._windowFrameSprite);
        this.addChild(this._windowCursorSprite);
        this.addChild(this._windowContentsSprite);
        this.addChild(this._downArrowSprite);
        this.addChild(this._upArrowSprite);
        this.addChild(this._windowPauseSignSprite);
    };
}



if (parseInt(parameters['skipUnnecessaryRefresh'])) {
    /**
     * 以下のウィンドウの初期化時の refresh() は不要
     */
    Window_MapName.prototype.initialize = function() {
        var wight = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, 0, 0, wight, height);
        this.opacity = 0;
        this.contentsOpacity = 0;
        this._showCount = 0;
        // this.refresh();
    };
    Window_BattleEnemy.prototype.initialize = function(x, y) {
        this._enemies = [];
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        // this.refresh();
        this.hide();
    };
}


if (parseInt(parameters['lazyInitializationBitmapAtSprite_Timer'])) {
    /**
     * タイマーを表示する必要があるまでタイマーの Bitmap を作成しない。
     */
    Sprite_Timer.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._seconds = 0;
        // this.createBitmap();
        this.update();
    };
    var _Sprite_Timer_redraw = Sprite_Timer.prototype.redraw;
    Sprite_Timer.prototype.redraw = function() {
        if (! this._bitmap) {
            this.createBitmap();
        }
        _Sprite_Timer_redraw.call(this);
    };
    var _Sprite_Timer_updatePosition = Sprite_Timer.prototype.updatePosition;
    Sprite_Timer.prototype.updatePosition = function() {
        if (! this._bitmao) {
            return;
        }
        _Sprite_Timer_updatePosition.call(this);
    };
}


if (parseInt(parameters['lazyInitializationWeather'])) {
    /**
     * 天気を表示する直前まで Bitmap を作成しない
     */
    Weather.prototype._createBitmaps = function() {
        // this._rainBitmap = new Bitmap(1, 60);
        // this._rainBitmap.fillAll('white');
        // this._stormBitmap = new Bitmap(2, 100);
        // this._stormBitmap.fillAll('white');
        // this._snowBitmap = new Bitmap(9, 9);
        // this._snowBitmap.drawCircle(4, 4, 4, 'white');
    };
    var _Weather_updateRainSprite = Weather.prototype._updateRainSprite;
    Weather.prototype._updateRainSprite = function(sprite) {
        if (! this._rainBitmap) {
            this._rainBitmap = new new Bitmap(1, 60);
            this._rainBitmap.fillAll('white');
        }
        _Weather_updateRainSprite.call(this, sprite);
    };

    var _Weather__updateStormSprite = Weather.prototype._updateStormSprite;
    Weather.prototype._updateStormSprite = function(sprite) {
        if (! this._stormBitmap) {
            this._stormBitmap = new Bitmap(2, 100);
            this._stormBitmap.fillAll('white');
        }
        _Weather__updateStormSprite.call(this, sprite);
    };

    var _Weather_updateSnowSprite = Weather.prototype._updateSnowSprite;
    Weather.prototype._updateSnowSprite = function(sprite) {
        if (! this._snowBitmap) {
            this._snowBitmap = new Bitmap(9, 9);
            this._snowBitmap.drawCircle(4, 4, 4, 'white');
        }
        _Weather_updateSnowSprite.call(this, sprite);
    };
}



if (parseInt(parameters['lazyCreationWindow_MapName'])) {
    /**
     * Window_MapName は、open() が呼ばれて、かつマップ名を表示する必要があるまで作成しない。
     * window 順がずれる可能性あり（最前面になる）
     */
    var _Scene_Map_createMapNameWindow = Scene_Map.prototype.createMapNameWindow;
    Scene_Map.prototype.createMapNameWindow = function() {
        var self = this;
        // dummy
        this._mapNameWindow = {
            hide: function() {},
            close: function() {},
            open: function() {
                if ($gameMap.displayName()) {
                    _Scene_Map_createMapNameWindow.call(self);
                    self._mapNameWindow.open();
                }
            }
        };
        // this._mapNameWindow = new Window_MapName();
        // this.addChild(this._mapNameWindow);
    };
}

if (parseInt(parameters['lazyCreationWindow_ScrollText'])) {
    /**
     * Scene_Map の Window_ScrollText は、必要になるまで作成しない。
     */
    var _Scene_Map_createScrollTextWindow = Scene_Map.prototype.createScrollTextWindow;
    Scene_Map.prototype.createScrollTextWindow = function() {
        // this._scrollTextWindow = new Window_ScrollText();
        // this.addWindow(this._scrollTextWindow);
    };
    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        if ($gameMessage.scrollMode()) {
            if (! this._scrollTextWindow) {
                _Scene_Map_createScrollTextWindow.call(this);
            }
        }
        _Scene_Map_update.call(this);
    };

    /**
     * Scene_Battle の Window_ScrollText は、必要になるまで作成しない。
     */
    var _Scene_Battle_createScrollTextWindow = Scene_Battle.prototype.createScrollTextWindow;
    Scene_Battle.prototype.createScrollTextWindow = function() {
        // this._scrollTextWindow = new Window_ScrollText();
        // this.addWindow(this._scrollTextWindow);
    };
    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        if ($gameMessage.scrollMode()) {
            if (! this._scrollTextWindow) {
                _Scene_Battle_createScrollTextWindow.call(this);
            }
        }
        _Scene_Battle_update.call(this);
    };
}

if (parseInt(parameters['useSpriteToDrawSprite_Destination'])) {
    /**
     * 行き先を表示するスプライトは PIXI.Texture を使う
     */
    Sprite_Destination.prototype.createBitmap = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();

        var bitmap = ImageManager.loadSystem('Window');
        baseTexture = new PIXI.BaseTexture(bitmap._image, PIXI.SCALE_MODES.DEFAULT);
        var texture = new PIXI.Texture(baseTexture);
        texture.frame = new PIXI.Rectangle(96, 144, 12, 12);
        this.texture = texture;

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.blendMode = Graphics.BLEND_ADD;
    };
    Sprite_Destination.prototype.updateAnimation = function() {
        this._frameCount++;
        this._frameCount %= 20;
        this.opacity = (20 - this._frameCount) * 6;
        this.scale.x = (1 + this._frameCount / 20) * 4;
        this.scale.y = this.scale.x;
    };
}


if (parseInt(parameters['skipWindow_CommandFirstCreateContents'])) {
    /**
     * Window_Command の初回の createContents は必ず無駄になるのでスキップ
     */
    var _Window_Command_createContents = Window_Command.prototype.createContents;
    Window_Command.prototype.createContents = function() {
        // this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight());
        // this.resetFontSettings();
    };
    Window_Command.prototype.refresh = function() {
        this.clearCommandList();
        this.makeCommandList();
        _Window_Command_createContents.call(this);
        Window_Selectable.prototype.refresh.call(this);
    };
}

if (parseInt(parameters['useDefaultTextColor'])) {
    /**
     * テキストカラーを定義しておくことで、pixel を調べずにテキストカラーを取得する
     * @param  {[type]} n [description]
     * @return {[type]}   [description]
     */
    Window_Base.prototype.textColor = function(n) {
        switch (n) {
        case 0: return '#ffffff';
        case 1: return '#20a0d6';
        case 2: return '#ff784c';
        case 3: return '#66cc40';
        case 4: return '#99ccff';
        case 5: return '#ccc0ff';
        case 6: return '#ffffa0';
        case 7: return '#808080';
        case 8: return '#c0c0c0';
        case 9: return '#2080cc';
        case 10: return '#ff3810';
        case 11: return '#00a010';
        case 12: return '#3e9ade';
        case 13: return '#a098ff';
        case 14: return '#ffcc20';
        case 15: return '#000000';
        case 16: return '#84aaff';
        case 17: return '#ffff40';
        case 18: return '#ff2020';
        case 19: return '#202040';
        case 20: return '#e08040';
        case 21: return '#f0c040';
        case 22: return '#4080c0';
        case 23: return '#40c0f0';
        case 24: return '#80ff80';
        case 25: return '#c08080';
        case 26: return '#8080ff';
        case 27: return '#ff80ff';
        case 28: return '#00a040';
        case 29: return '#00e060';
        case 30: return '#a060e0';
        case 31: return '#c080ff';
        }
        return '#000000';
    };
}



if (parseInt(parameters['reduceLoadingGlobalInfo'])) {
    /**
     * タイトル、セーブ画面、ロード画面で loadingGlobalInfo が何度も走るので減らす
     */
    var _Scene_File_initialize = Scene_File.prototype.initialize;
    Scene_File.prototype.initialize = function() {
        this._globalInfo = DataManager.loadGlobalInfo();
        _Scene_File_initialize.call(this);
    };
    Scene_File.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        DataManager.loadAllSavefileImages(this._globalInfo);
        this.createHelpWindow();
        this.createListWindow();
    };
    Scene_Load.prototype.firstSavefileIndex = function() {
        return DataManager.latestSavefileId(this._globalInfo) - 1;
    };

    var _Window_SavefileList_initialize  = Window_SavefileList.prototype.initialize;
    Window_SavefileList.prototype.initialize = function(x, y, width, height) {
        this._globalInfo = DataManager.loadGlobalInfo();

        _Window_SavefileList_initialize.call(this, x, y, width, height);
    };
    Window_SavefileList.prototype.drawItem = function(index) {
        var id = index + 1;
        var valid = DataManager.isThisGameFileInfo(this._globalInfo[id]);
        var info = this._globalInfo[id] ? this._globalInfo[id] : null;
        var rect = this.itemRectForText(index);
        this.resetTextColor();
        if (this._mode === 'load') {
            this.changePaintOpacity(valid);
        }
        this.drawFileId(id, rect.x, rect.y);
        if (info) {
            this.changePaintOpacity(valid);
            this.drawContents(info, rect, valid);
            this.changePaintOpacity(true);
        }
    };
    DataManager.loadAllSavefileImages = function(globalInfo) {
        if (! globalInfo) {
            globalInfo = this.loadGlobalInfo();
        }
        if (globalInfo) {
            for (var i = 1; i < globalInfo.length; i++) {
              var info = globalInfo[i];
                if (this.isThisGameFileInfo(info)) {
                    this.loadSavefileImages(info);
                }
            }
        }
    };
    DataManager.isThisGameFileInfo = function(savefile) {
        if (! savefile) {
            return false;
        }
        if (StorageManager.isLocalMode()) {
            return true;
        }
        return (savefile.globalId === this._globalId &&
                savefile.title === $dataSystem.gameTitle);
    };
    DataManager.isAnySavefileExists = function(globalInfo) {
        if (! globalInfo) {
            globalInfo = this.loadGlobalInfo();
        }
        if (globalInfo) {
            for (var i = 1; i < globalInfo.length; i++) {
                var info = globalInfo[i];
                if (this.isThisGameFileInfo(info)) {
                    return true;
                }
            }
        }
        return false;
    };
    DataManager.latestSavefileId = function(globalInfo) {
        if (! globalInfo) {
            globalInfo = this.loadGlobalInfo();
        }
        var savefileId = 1;
        var timestamp = 0;
        if (globalInfo) {
            for (var i = 1; i < globalInfo.length; i++) {
                var info = globalInfo[i];
                if (this.isThisGameFileInfo(info) && info.timestamp > timestamp) {
                    timestamp = info.timestamp;
                    savefileId = i;
                }
            }
        }
        return savefileId;
    };
    Window_TitleCommand.prototype.isContinueEnabled = function() {
        if (! this._globalInfo) {
            this._globalInfo = DataManager.loadGlobalInfo();
        }
        return DataManager.isAnySavefileExists(this._globalInfo);
    };
}


if (parseInt(parameters['notLoadingVolumeZeroAudio'])) {
    var _AudioManager_playSe = AudioManager.playSe;
    AudioManager.playSe = function(se) {
        if (this._seVolume <= 0) {
            return;
        }
        _AudioManager_playSe.call(this, se);
    };
    var _AudioManager_playStaticSe = AudioManager.playStaticSe;
    AudioManager.playStaticSe = function(se) {
        if (this._seVolume <= 0) {
            return;
        }
        _AudioManager_playStaticSe.call(this, se);
    };
    var _AudioManager_playMe2 = AudioManager.playMe;
    AudioManager.playMe = function(me, isCache) {
        if (this._meVolume <= 0) {
            return;
        }
        _AudioManager_playMe2.call(this, me, isCache);
    };
    var _AudioManager_playBgs = AudioManager.playBgs;
    AudioManager.playBgs = function(bgs, pos) {
        if (this._bgsVolume <= 0) {
            this.stopBgs();
            return;
        }
        _AudioManager_playBgs.call(this, bgs, pos);
    };
    var _AudioManager_playBgm = AudioManager.playBgm;
    AudioManager.playBgm = function(bgm, pos) {
        if (this._bgmVolume <= 0) {
            this._lastVolumeZeroBgm = bgm;
            return;
        }
        _AudioManager_playBgm.call(this, bgm, pos);
    };
    var _AudioManager_stopBgm = AudioManager.stopBgm;
    AudioManager.stopBgm = function() {
        this._lastVolumeZeroBgm = null;
        _AudioManager_stopBgm.call(this);
    };
    Object.defineProperty(AudioManager, 'bgmVolume', {
        set: function(value) {
            if (this._bgmVolume <= 0 && value > 0 && this._lastVolumeZeroBgm) {
                this._bgmVolume = value;
                this.playBgm(this._lastVolumeZeroBgm, 0);
                this._lastVolumeZeroBgm = null;
            } else {
                this._bgmVolume = value;
                this.updateBgmParameters(this._currentBgm);
            }
        },
        configurable: true
    });
}
/*
if (true) {
    Window_BattleLog.prototype.createBackBitmap = function() {
    };
    Window_BattleLog.prototype.createBackSprite = function() {
        this._backSprite = new Sprite();
        this._backSprite.y = this.y;
        this.addChildToBack(this._backSprite);
    };
    Window_BattleLog.prototype.drawBackground = function() {
        var rect = this.backRect();
        var color = this.backColor();
        
        var graphics = new PIXI.Graphics();
        var r = parseInt(color.substring(1, 3), 16);
        var g = parseInt(color.substring(3, 5), 16);
        var b = parseInt(color.substring(5, 7), 16);
        var intColor = (r << 16) | (g << 8) | b;
        graphics.beginFill(intColor, this.backPaintOpacity() / 255/0);
        graphics.drawRect(rect.x, rect.y, rect.width, rect.height);
        graphics.endFill();
        this._backSprite.addChild(graphics);
    };
}
var _Sprite_refresh = Sprite.prototype._refresh;
Sprite.prototype._refresh = function() {
    if (! this.texture) {
        return;
    }
    _Sprite_refresh.call(this);
};
*/


})(Saba || (Saba = {}));