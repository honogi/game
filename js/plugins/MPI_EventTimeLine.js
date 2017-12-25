//===========================================================================
// MPI_EventTimeLine.js
//===========================================================================

/*:
 * @plugindesc イベントの実行状況を、画面下部にタイムライン表示します。
 * @author 奏ねこま（おとぶき ねこま）
 *
 * @param 文字サイズ
 * @desc タイムラインの文字サイズを指定してください。
 * @default 14
 *
 * @param 行の高さ
 * @desc タイムラインの1行の高さを指定してください。
 * @default 20
 *
 * @param 不透明度
 * @desc タイムラインの不透明度を指定してください。[0-255]
 * @default 128
 *
 * @param マップイベント色
 * @desc マップイベントのタイムラインのバーの色を指定してください。色名指定と、#で始まる16進数指定が可能です。
 * @default green
 *
 * @param コモンイベント色
 * @desc コモンイベントのタイムラインのバーの色を指定してください。色名指定と、#で始まる16進数指定が可能です。
 * @default yellow
 *
 * @param バトルイベント色
 * @desc バトルイベントのタイムラインのバーの色を指定してください。色名指定と、#で始まる16進数指定が可能です。
 * @default red
 *
 * @param デフォルト表示
 * @desc タイムラインをデフォルトで表示する（F7キーを押さなくても表示する）場合は true を指定してください。[true/false]
 * @default false
 *
 * @param テスト実行のみ
 * @desc タイムラインをテスト実行時のみ表示する場合は true を指定してください。[true/false]
 * @default true
 *
 * @help
 * [ 使用方法 ] ...
 *  プラグインを導入し、ゲーム実行中にF7キーを押してください。
 *
 * [ プラグインコマンド ] ...
 *  プラグインコマンドはありません。
 *
 * [ 利用規約 ] ................................................................
 *  ・本プラグインの利用は、RPGツクールMV/RPGMakerMVの正規ユーザーに限られます。
 *  ・商用、非商用、有償、無償、一般向け、成人向けを問わず、利用可能です。
 *  ・利用の際、連絡や報告は必要ありません。また、製作者名の記載等も不要です。
 *  ・プラグインを導入した作品に同梱する形以外での再配布、転載はご遠慮ください。
 *  ・不具合対応以外のサポートやリクエストは、基本的に受け付けておりません。
 *  ・本プラグインにより生じたいかなる問題についても、一切の責任を負いかねます。
 * [ 改訂履歴 ] ................................................................
 *   Version 1.00  2016/12/23  First edition.
 * -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
 *  Web Site: http://makonet.sakura.ne.jp/rpg_tkool/
 *  Twitter : https://twitter.com/koma_neko
 *  Copylight (c) 2016 Nekoma Otobuki
 */

var Imported = Imported || {};
Imported.MPI_EventTimeLine = true;

var Makonet = Makonet || {};
Makonet.ETL = {};

(function(){
    'use strict';

    var ETL         = Makonet.ETL;
    ETL.product     = 'MPI_EventTimeLine';
    ETL.parameters  = PluginManager.parameters(ETL.product);
    ETL.font_size   = +ETL.parameters['文字サイズ'];
    ETL.height      = +ETL.parameters['行の高さ'];
    ETL.opacity     = +ETL.parameters['不透明度'];
    ETL.color = { map: ETL.parameters['マップイベント色'],
               common: ETL.parameters['コモンイベント色'],
               battle: ETL.parameters['バトルイベント色'] };
    ETL.visible     =  ETL.parameters['デフォルト表示'] === 'true';
    ETL.test_only   =  ETL.parameters['テスト実行のみ'] === 'true';

    if (ETL.test_only && !Utils.isOptionValid('test')) { return; }

    ETL.EventData = [];
    ETL.EventList = [];
    ETL.MapEventIndex = [0];

    ETL.SpriteContainer = null;

    var _ = ETL.product;

    //==============================================================================
    // DataManager
    //==============================================================================

    (function(o, p) {
        var f = o[p]; o[p] = function(object) {
            f.apply(this, arguments);
            if (object === $dataCommonEvents) {
                $dataCommonEvents.forEach(function(event) {
                    if (event) {
                        var data = {
                            mapId: 0,
                            eventId: event.id,
                            pageNo: 0,
                            name: event.name || '(no name)'
                        };
                        data.tag = `[C-${data.eventId}] ${data.name}`;
                        ETL.EventData.push(data);
                        ETL.EventList.push(event.list);
                    }
                });
                ETL.MapEventIndex[0] = ETL.EventData.length;
            }
            if (object === $dataTroops) {
                $dataTroops.forEach(function(troop) {
                    if (troop) {
                        troop.pages.forEach(function(page, index) {
                            var data = {
                                mapId: -1,
                                eventId: troop.id,
                                pageNo: index + 1,
                                name: troop.name || '(no name)'
                            };
                            data.tag = `[B-${data.eventId}-${data.pageNo}] ${data.name}`;
                            ETL.EventData.push(data);
                            ETL.EventList.push(page.list);
                        });
                    }
                });
                ETL.MapEventIndex[0] = ETL.EventData.length;
            }
        };
    }(DataManager, 'onLoad'));

    //==============================================================================
    // Scene_Map
    //==============================================================================

    (function(o, p) {
        var f = o[p]; o[p] = function() {
            f.apply(this, arguments);
            var map_index = ETL.MapEventIndex;
            if (ETL.EventData.length > map_index[1]) {
                ETL.EventData.splice(map_index[0], map_index[1] - map_index[0]);
                ETL.EventList.splice(map_index[0], map_index[1] - map_index[0]);
                map_index[1] = ETL.EventData.length;
            }
            $dataMap.events.forEach(function(event) {
                if (event) {
                    event.pages.forEach(function(page, index) {
                        var data = {
                            mapId: $gameMap.mapId(),
                            eventId: event.id,
                            pageNo: index + 1,
                            name: event.name || '(no name)'
                        };
                        data.tag = `[M-${data.mapId}-${data.eventId}-${data.pageNo}] ${data.name}`;
                        ETL.EventData.push(data);
                        ETL.EventList.push(page.list);
                    });
                }
            });
            if (!map_index[1]) {
                map_index[1] = ETL.EventData.length;
            }
        };
    }(Scene_Map.prototype, 'onMapLoaded'));

    //==============================================================================
    // Scene_Boot
    //==============================================================================

    (function(o, p) {
        var f = o[p]; o[p] = function(){
            f.apply(this, arguments);
            var sprite = new Sprite();
            sprite.setFrame(0, 0, Graphics.width, Graphics.height);
            sprite.opacity = ETL.opacity;
            sprite.visible = ETL.visible;
            ETL.SpriteContainer = sprite;
        };
    }(Scene_Boot.prototype, 'create'));

    //==============================================================================
    // Scene_Base
    //==============================================================================

    (function(o, p) {
        var f = o[p]; o[p] = function(){
            f.apply(this, arguments);
            if (this instanceof Scene_Boot) { return; }
            this.addChild(ETL.SpriteContainer);
        };
    }(Scene_Base.prototype, 'start'));

    //==============================================================================
    // Graphics
    //==============================================================================

    (function(o, p) {
        var f = o[p]; o[p] = function(){
            f.apply(this, arguments);
            if (!event.ctrlKey && !event.altKey) {
                if (event.keyCode === 118) {    // F7
                    event.preventDefault();
                    ETL.SpriteContainer.visible = !ETL.SpriteContainer.visible;
                }
            }
        };
    }(Graphics, '_onKeyDown'));
    
    //==============================================================================
    // SceneManager
    //==============================================================================

    (function(o, p) {
        var f = o[p]; o[p] = function(){
            var visible = ETL.SpriteContainer.visible;
            ETL.SpriteContainer.visible = false;
            var bitmap = f.apply(this, arguments);
            ETL.SpriteContainer.visible = visible;
            return bitmap;
        };
    }(SceneManager, 'snap'));

    //==============================================================================
    // Game_Interpreter
    //==============================================================================

    Object.defineProperty(Game_Interpreter.prototype, _, {
        get: function(){
            return this['_'+_] = this['_'+_] || { list: null, sprite: null, active: false };
        },
        set: function(value) {
            this['_'+_] = value;
        },
        configurable: true
    });

    (function(o, p) {
        var f = o[p]; o[p] = function(list, eventId) {
            f.apply(this, arguments);
            if (this[_].list !== list) {
                this.createEventTimeLineSprite(list);
            }
        };
    }(Game_Interpreter.prototype, 'setup'));

    (function(o, p) {
        var f = o[p]; o[p] = function(){
            if (this._list) {
                if (!this[_].sprite._alive) {
                    this.createEventTimeLineSprite(this[_].list);
                } else {
                    this[_].active = true;
                }
            } else if (this[_].list) {
                this[_].list = null;
                this[_].active = false;
            }
            f.apply(this, arguments);
        };
    }(Game_Interpreter.prototype, 'update'));

    Game_Interpreter.prototype.createEventTimeLineSprite = function(list) {
        var event_index = ETL.EventList.indexOf(list);
        var tag = (event_index < 0) ? '[?](unknown event)' : ETL.EventData[event_index].tag;
        var container = ETL.SpriteContainer;
        var height = ETL.height;
        var y = container.children.reduce(function(r, sprite) {
            return (sprite._exclude && (sprite.y === r)) ? sprite.y - height : r;
        }, Graphics.height - height);
        this[_] = { list: list, active: true };
        this[_].sprite = new Sprite_EventTimeLine(tag, y, this[_]);
        container.addChild(this[_].sprite);
        container.children.sort(function(a, b){ return b.y - a.y; });
    };
    
    //==============================================================================
    // Sprite_EventTimeLine
    //==============================================================================

    function Sprite_EventTimeLine() {
        this.initialize.apply(this, arguments);
    }

    Sprite_EventTimeLine.prototype = Object.create(Sprite.prototype);
    Sprite_EventTimeLine.prototype.constructor = Sprite_EventTimeLine;

    Sprite_EventTimeLine.prototype.initialize = function(tag, y, monitor) {
        Sprite.prototype.initialize.call(this);
        this._width = Graphics.width;
        this._height = ETL.height;
        this._tag = tag;
        this._color = (tag[1] === 'M') ? ETL.color.map : (tag[1] === 'C') ? ETL.color.common : (tag[1] === 'B') ? ETL.color.battle : 'black';
        this.bitmap = new Bitmap(this._width, this._height);
        this.bitmap.fontSize = ETL.font_size;
        this.bitmap.fillRect(0, this._height / 2, this._width, this._height / 2, this._color);
        this.bitmap.drawText(tag, 0, 0, this._width, this._height);
        this.x = Graphics.width;
        this.y = y;
        this._monitor = monitor;
        this._right = this.bitmap.measureTextWidth(tag);
        this._alive = true;
        this._exclude = true;
    };

    Sprite_EventTimeLine.prototype.update = function(){
        Sprite.prototype.update.call(this);
        if (this._alive) {
            if (this._monitor.active) {
                if (this.x > 0) {
                    this.x -= 2;
                }
            } else {
                this.bitmap.clear();
                this.bitmap.fillRect(0, this._height / 2, Graphics.width - this.x, this._height / 2, this._color);
                this.bitmap.drawText(this._tag, 0, 0, this._width, this._height);
                this._alive = false;
            }
            this._monitor.active = false;
        }
        if (!this._alive) {
            this.x -= 2;
            this._exclude = Graphics.width < (this.x + this._right);
            if (this.x < -Graphics.width) {
                this.parent.removeChild(this);
            }
        }
    };
}());
