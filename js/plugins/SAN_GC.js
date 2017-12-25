//=============================================================================
// SAN_GC.js
//=============================================================================
// Copyright (c) 2016 Sanshiro
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc ガベージコレクター 1.0.0
 * 使用済の画像オブジェクトのメモリを開放します。
 * @author サンシロ https://twitter.com/rev2nym
 * @version 1.0.0 2016/12/09 正規版公開
 * 
 * @param MaxChacheMemorySizeMB
 * @desc 画像キャッシュのメモリ使用量の上限です。[MB]
 * 少なすぎると画像が正常に表示されなくなる場合があります。
 * @default 200
 * 
 * @param NonChacheMemorySizeMB
 * @desc 画像キャッシュ外の画像のメモリ使用量の上限です。[MB]
 * 競合発生時にこの数値を増やすと緩和できる可能性があります。
 * @default 0
 * 
 * @param ShowStats
 * @desc メモリ使用状況のコンソール表示の有効フラグです。
 * "ON"で有効化します。
 * @default OFF
 * 
 * @help
 * ■概要
 * 使用済の画像オブジェクト（Bitmapオブジェクト）のメモリを
 * 開放（ガベージコレクト/GC）します。
 * 
 * 画像キャッシュ外の使用済の画像オブジェクトのメモリはすべて解放されます。
 * また画像キャッシュのメモリ使用量が設定した上限値を超過した場合
 * 画像キャッシュ内の画像オブジェクトのメモリをアクセスの古い順から
 * 超過した分だけ解放します。
 * 使用中の画像オブジェクトのメモリは解放されません。
 * 
 * ■ガベージコレクト実行タイミング
 * 以下に示すタイミングで設定メモリ量を超過している場合
 * ガベージコレクトが実行されます。
 * ・シーンの開始時
 * ・マップシーンの場所移動時
 * ・バトルシーンのターン終了時
 * 
 * ■画像キャッシュのメモリ使用量上限の設定
 * 画像キャッシュのメモリ使用量の上限をプラグインパラメータにより設定します。
 * 設定値が小さすぎると画像が正常に表示されなくなる場合があります。
 * また大きすぎるとガベージコレクトの処理にかかる時間が増加します。
 * 100～300[MB]程度の設定を推奨します。
 * 
 * ■画像キャッシュ外のメモリ使用量上限の設定
 * 画像キャッシュ外かつ未表示の画像オブジェクトのメモリ使用量の上限を
 * プラグインパラメータにより設定できます。
 * この数値を設定するとキャッシュ外の画像オブジェクトを
 * 設定したメモリ量だけ解放せずに保持するようになります。
 * 
 * このプラグインによる画像オブジェクトのメモリ解放により
 * 他プラグインとの競合が発生した際に設定してください。
 * 設定により競合が緩和される可能性があります。
 * 
 * ■参考情報・謝辞
 * このプラグイン「SAN_GC」はliply氏によるプラグイン「liply_GC」と
 * 以下の解説記事の情報をもとに作成されました。
 * 
 * ・liplyのブロマガ
 *   RPGツクールMVのモバイルブラウザにおける
 *   描画・メモリの解説（メモリパッチ付き）
 *   http://ch.nicovideo.jp/liply/blomaga/ar1124914
 *   ※「liply_GC」のダウンロードURLは解説記事中にあり
 * 
 * 「liply_GC」の一部引用、及び「SAN_GC」を公開することを
 * 快諾してくださったliply氏に感謝します。
 * また、このプラグインを試用、報告してくださった皆様に感謝します。
 * ありがとうございます＞＜。
 * 
 * ■利用規約
 * MITライセンスのもと、商用利用、改変、再配布が可能です。
 * ただし冒頭のコメントは削除や改変をしないでください。
 * 
 * これを利用したことによるいかなる損害にも作者は責任を負いません。
 * サポートは期待しないでください＞＜。
 */

var Imported = Imported || {};
Imported.SAN_GC = true;

var Sanshiro = Sanshiro || {};
Sanshiro.GC = Sanshiro.GC || {};
Sanshiro.GC.version = '1.0.0';

(function(SAN) {
'use strict';

//-----------------------------------------------------------------------------
// Bitmap
//
// ビットマップ

// 1ピクセルあたりの使用メモリ量[Byte]
Bitmap._pixelMemorySize = 4;

// オブジェクト初期化
var _Bitmap_initialize = Bitmap.prototype.initialize;
Bitmap.prototype.initialize = function(width, height) {
    _Bitmap_initialize.call(this, width, height);
    ImageManager._createdBitmapQueue.pushItem(this);
};

// 使用中のメモリ量
Bitmap.prototype.memorySize = function() {
    var memorySize = (
        this.canvas.width *
        this.canvas.height *
        Bitmap._pixelMemorySize
    );
    return memorySize;
};

// メモリ解放
Bitmap.prototype.free = function() {
    this.baseTexture.destroy();
    this.baseTexture.hasLoaded = false;
};

//-----------------------------------------------------------------------------
// Weather
//
// 天候

// ビットマップの作成
var _Weather__createBitmaps = Weather.prototype._createBitmaps;
Weather.prototype._createBitmaps = function() {
    this._rainBitmap  = this._weatherBitmap('rain');
    this._stormBitmap = this._weatherBitmap('storm');
    this._snowBitmap  = this._weatherBitmap('snow');
};

// 天候ビットマップ
Weather.prototype._weatherBitmap = function(type) {
    var bitmap = this._weatherBitmapFromCache(type);
    if (!bitmap) {
        bitmap = this._createWeatherBitmap(type);
        this._cacheWeatherBitmap(type, bitmap);
    }
    return bitmap;
};

// キャッシュの天候ビットマップ
Weather.prototype._weatherBitmapFromCache = function(type) {
    var cacheKey = this._weatherBitmapCacheKey(type);
    var bitmap = ImageManager.cache.getItem(cacheKey);
    return bitmap;
};

// 天候ビットマップのキャッシュキー
Weather.prototype._weatherBitmapCacheKey = function(type) {
    return 'Weather_' + type;
};

// 天候ビットマップの作成
Weather.prototype._createWeatherBitmap = function(type) {
    var bitmap = (
        type === 'rain'  ? this._createRainBitmap()  :
        type === 'storm' ? this._createStormBitmap() :
        type === 'snow'  ? this._createSnowBitmap()  :
        undefined
    );
    return bitmap;
};

// 雨ビットマップの作成
Weather.prototype._createRainBitmap = function(type) {
    var bitmap = new Bitmap(1, 60);
    bitmap.fillAll('white');
    return bitmap;
};

// 嵐ビットマップの作成
Weather.prototype._createStormBitmap = function(type) {
    var bitmap = new Bitmap(2, 100);
    bitmap.fillAll('white');
    return bitmap;
};

// 雪ビットマップの作成
Weather.prototype._createSnowBitmap = function(type) {
    var bitmap = new Bitmap(9, 9);
    bitmap.drawCircle(4, 4, 4, 'white');
    return bitmap;
};

// 天候ビットマップのキャッシュ登録
Weather.prototype._cacheWeatherBitmap = function(type, bitmap) {
    var cacheKey = this._weatherBitmapCacheKey(type);
    if (!!bitmap) {
        ImageManager.cache.setItem(cacheKey, bitmap);
        ImageManager._systemBitmapQueue.pushItem(bitmap);
    }
};

//-----------------------------------------------------------------------------
// CacheEntry
//
// キャッシュエントリー

// メモリ解放
var _CacheEntry_free = CacheEntry.prototype.free;
CacheEntry.prototype.free = function (byTTL) {
    if (!!this.cache && !!this.cache._keyQueue) {
        this.cache._keyQueue.removeItem(this.key);
    }
    _CacheEntry_free.call(this, byTTL);
};

//-----------------------------------------------------------------------------
// CacheMap
//
// キャッシュマップ

// 要素の取得
var _CacheMap_getItem = CacheMap.prototype.getItem;
CacheMap.prototype.getItem = function (key) {
    var item = _CacheMap_getItem.call(this, key);
    if (!!item) {
        this.pushKey(key);
    }
    return item;
};

// 要素の追加
var _CacheMap_setItem = CacheMap.prototype.setItem;
CacheMap.prototype.setItem = function (key, item) {
    var entry = _CacheMap_setItem.call(this, key, item);
    if (!!entry) {
        this.pushKey(key);
    }
    return entry;
};

// キーの追加
CacheMap.prototype.pushKey = function(key) {
    this._keyQueue = this._keyQueue || new CacheQueue();
    this._keyQueue.pushItem(key);
};

// 要素の除去
CacheMap.prototype.removeItem = function(item) {
    var key = this.key(item);
    if (!!key) {
        // キャッシュマップからの除去はキャッシュエントリーが行う
        var entry = this._inner[key];
        entry.free();
    }
};

// キーの取得
CacheMap.prototype.key = function(item) {
    for (var key in this._inner) {
        if (this._inner[key].item === item) {
            return key;
        }
    }
    return undefined;
};

// 全要素の取得
CacheMap.prototype.items = function() {
    var items = [];
    var keys = this._keyQueue.items();
    keys.forEach(function(key) {
        items.push(this._inner[key].item);
    }, this);
    return items;
};

//-----------------------------------------------------------------------------
// CacheQueue
//
// キャッシュキュー（重複除外キュー）

function CacheQueue() {
    this.initialize.apply(this, arguments);
}

// オブジェクト初期化
CacheQueue.prototype.initialize = function() {
    this._items = [];
};

// 要素の追加
CacheQueue.prototype.pushItem = function(item) {
    this.removeItem(item);
    this._items.push(item);
};

// 要素の除去
CacheQueue.prototype.removeItem = function(item) {
    var index = this._items.indexOf(item);
    if (index !== -1) {
        this._items.splice(index, 1);
    }
};

// 要素の取り出し
CacheQueue.prototype.shiftItem = function() {
    var bitmap = this._data.shift();
    return bitmap;
};

// 要素のリスト
CacheQueue.prototype.items = function() {
    var items = [];
    this._items.forEach(function(item) {
        items.push(item);
    });
    return items;
};

//-----------------------------------------------------------------------------
// ImageManager
//
// イメージマネージャー

// ガベージコレクト状況の表示有効化スイッチ
ImageManager._showGcStats = (
    PluginManager.parameters('SAN_GC')['ShowStats'] === 'ON'
);

// キャッシュの最大メモリ量[Byte]
ImageManager._maxChacheMemorySize = Math.max(0,
    Number(PluginManager.parameters('SAN_GC')['MaxChacheMemorySizeMB']) *
    (1024 * 1024)
);

// キャッシュ外かつ未表示の画像オブジェクトの最大メモリ量[Byte]
ImageManager._nonChacheMemorySize = Math.max(0,
    Number(PluginManager.parameters('SAN_GC')['NonChacheMemorySizeMB']) *
    (1024 * 1024)
);

// ガベージコレクト回数
ImageManager._gcCount = 0;

// 生成されたビットマップのキュー
ImageManager._createdBitmapQueue = new CacheQueue();

// システムビットマップのキュー
ImageManager._systemBitmapQueue = new CacheQueue();

// 生成されたビットマップのリスト
ImageManager.createdBitmaps = function() {
    return this._createdBitmapQueue.items();
};

// キャッシュされたビットマップのリスト
ImageManager.cachedBitmaps = function() {
    return this.cache.items();
};

// システムビットマップのリスト
ImageManager.systemBitmaps = function() {
    return this._systemBitmapQueue.items();
};

// 使用中のビットマップのリスト
ImageManager.aliveBitmaps = function() {
    return SceneManager.aliveBitmaps();
};

// 生成されたビットマップの使用中のメモリ量[Byte]
ImageManager.createdBitmapMemorySize = function() {
    var bitmaps = this.createdBitmaps();
    var memorySize = this.bitmapsMemorySize(bitmaps);
    return memorySize;
};

// キャッシュされたビットマップのメモリ量[Byte]
ImageManager.cachedBitmapMemorySize = function() {
    var bitmaps = this.cache.items();
    var memorySize = this.bitmapsMemorySize(bitmaps);
    return memorySize;
};

// ビットマップリストのメモリ量[Byte]
ImageManager.bitmapsMemorySize = function(bitmaps) {
    var memorySize = 0;
    bitmaps.forEach(function(bitmap) {
        memorySize += bitmap.memorySize();
    });
    return memorySize;
};

// ガベージコレクト
ImageManager.gc = function() {
    this.deleteNonCachedBitmaps();
    this.deleteCachedBitmaps();
    this._gcCount++;
    if (this._showGcStats) {
        this.printGcStats();
    }
};

// キャッシュされていないビットマップの削除
ImageManager.deleteNonCachedBitmaps = function () {
    var protectedBitmaps = (new Array()).concat(
        this.cachedBitmaps(),
        this.aliveBitmaps(),
        this.systemBitmaps()
    );
    var candidateBitmaps = this.createdBitmaps().filter(function(bitmap) {
        return protectedBitmaps.indexOf(bitmap) === -1;
    });
    var maxMemorySize = this._nonChacheMemorySize;
    this.deleteBitmaps(candidateBitmaps, maxMemorySize);
};

// キャッシュされたビットマップの削除
ImageManager.deleteCachedBitmaps = function () {
    var protectedBitmaps = (new Array()).concat(
        this.aliveBitmaps(),
        this.systemBitmaps()
    );
    var candidateBitmaps = this.cachedBitmaps().filter(function(bitmap) {
        return protectedBitmaps.indexOf(bitmap) === -1;
    });
    var maxMemorySize = this._maxChacheMemorySize;
    this.deleteBitmaps(candidateBitmaps, maxMemorySize);
};

// ビットマップリストによるビットマップの削除
ImageManager.deleteBitmaps = function(bitmaps, maxMemorySize) {
    var bitmapsMemorySize = this.bitmapsMemorySize(bitmaps);
    for(var i = 0; i < bitmaps.length; i++) {
        if (!!maxMemorySize &&
            bitmapsMemorySize <= maxMemorySize) {
            break;
        }
        bitmapsMemorySize -= bitmaps[i].memorySize();
        this.deleteBitmap(bitmaps[i]);
    }
};

// ビットマップの削除
ImageManager.deleteBitmap = function(bitmap) {
    this.removeBitmap(bitmap);
    bitmap.free();
};

// キャッシュとキューからビットマップを除去
ImageManager.removeBitmap = function(bitmap) {
    this._createdBitmapQueue.removeItem(bitmap);
    this._systemBitmapQueue.removeItem(bitmap);
    this.cache.removeItem(bitmap);
};

// システムビットマップのロード
var _ImageManager_loadSystem = ImageManager.loadSystem; 
ImageManager.loadSystem = function(filename, hue) {
    var bitmap = _ImageManager_loadSystem.call(this, filename, hue);
    this._systemBitmapQueue.pushItem(bitmap);
    return bitmap;
};

// エンプティビットマップのロード
var _ImageManager_loadEmptyBitmap = ImageManager.loadEmptyBitmap; 
ImageManager.loadEmptyBitmap = function() {
    var bitmap = _ImageManager_loadEmptyBitmap.call(this);
    this._systemBitmapQueue.pushItem(bitmap);
    return bitmap;
};

// 通常のビットマップのロード
var _ImageManager_loadNormalBitmap = ImageManager.loadNormalBitmap;
ImageManager.loadNormalBitmap = function(path, hue) {
    var bitmap = _ImageManager_loadNormalBitmap.call(this, path, hue);
    return bitmap;
};

// ガベージコレクト状況の表示
ImageManager.printGcStats = function() {
    console.log("======== SAN_GC ========");
    this.printGcCount();
    this.printBitmapNumber();
    this.printMemorySize();
    this.printCachedBitmapNumber();
    this.printCachedBitmapMemorySyze();
};

// ガベージコレクト回数の表示
ImageManager.printGcCount = function() {
    console.log("count : " + this._gcCount);
};

// 画像オブジェクトの個数の表示
ImageManager.printBitmapNumber = function() {
    var bitmapNumber = this.createdBitmaps().length;
    console.log("AllBitmapNum : " + bitmapNumber);
};

// 画像オブジェクトのメモリ量の表示
ImageManager.printMemorySize = function() {
    var m = (1024 * 1024);
    var memorySizeMb = Math.round(this.createdBitmapMemorySize() / m);
    console.log("AllMemSizeMB : " + memorySizeMb);
};

// キャッシュ化された画像オブジェクトの個数の表示
ImageManager.printCachedBitmapNumber = function() {
    var bitmapNumber = this.cachedBitmaps().length;
    var bitmapNumber2 = 0;
    for (var key in this.cache._inner) {
        bitmapNumber2++;
    }
    console.log("CachedBitmapNum : " + bitmapNumber + " : " + bitmapNumber2);
};

// キャッシュ化された画像オブジェクトのビットマップ数の表示
ImageManager.printCachedBitmapMemorySyze = function() {
    var m = (1024 * 1024);
    var memorySizeMb = Math.round(this.cachedBitmapMemorySize() / m);
    var memorySizeMb2 = 0;
    for (var key in this.cache._inner) {
        memorySizeMb2 += this.cache._inner[key].item.memorySize();
    }
    memorySizeMb2 = Math.round(memorySizeMb2 / m);
    console.log("CachedMemSizeMB : " + memorySizeMb + " : " + memorySizeMb2);
};

//-----------------------------------------------------------------------------
// SceneManager
//
// シーンマネージャー

// 生存中のビットマップリスト
SceneManager.aliveBitmaps = function() {
    var bitmaps = [];
    bitmaps = this.collectAliveBitmaps(this._scene, bitmaps);
    return bitmaps;
};

// 生存中のビットマップの収集
SceneManager.collectAliveBitmaps = function(parent, bitmaps) {
    if (!!parent.bitmap) {
        bitmaps.push(parent.bitmap);
    }
    if (!!parent.children) {
        parent.children.forEach(function(child) {
            this.collectAliveBitmaps(child, bitmaps);
        }, this);
    }
    return bitmaps;
};

// シーン開始時の処理
var _SceneManager_onSceneStart = SceneManager.onSceneStart;
SceneManager.onSceneStart = function() {
    _SceneManager_onSceneStart.call(this);
    ImageManager.gc();
};

//-----------------------------------------------------------------------------
// BattleManager
//
// バトルマネージャー

// ターンの終了
var _BattleManager_endTurn = BattleManager.endTurn;
BattleManager.endTurn = function() {
    _BattleManager_endTurn.call(this);
    ImageManager.gc();
};

}) (Sanshiro);
