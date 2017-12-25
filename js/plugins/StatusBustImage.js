//=============================================================================
// StatusBustImage.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.1 2016/08/12 キャラクターを切り替えたときにグラフィックが切り替わらない問題を修正
// 1.0.0 2016/07/19 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc StatusBustImagePlugin
 * @author triacontane
 *
 * @param BustImageX
 * @desc バストアップ画像を表示するX座標(足下原点)です。
 * @default 640
 *
 * @param BustImageY
 * @desc バストアップ画像を表示するY座標(足下原点)です。
 * @default 620
 *
 * @param UnderContents
 * @desc ONにするとステータス等の下に画像が表示されます。(ON/OFF)
 * @default ON
 *
 * @help ステータス画面にアクターごとのバストアップ画像を表示します。
 * 足下を原点として表示位置を自由に調整できます。
 *
 * アクターのメモ欄に以下の通り指定してください。
 *
 * <SBIImage:file>  # /img/pictures/file.pngが表示されます。
 *
 * さらに動画(データベースのアニメーション)を再生することもできます。
 * 画像の上に重ねてまばたき等を表現するのに使用します。
 *
 * <SBIAnimation:1> # ID[1]のアニメーションがループ再生されます。
 *
 * 装備品ごとに画像を上乗せできます。
 * アイテムのメモ欄に以下の通り指定してください。
 * <SBIImage:item>  # /img/pictures/item.pngが表示されます。
 * <SBIPosX:30>     # 装備品画像のX座標を[30]に設定します。
 * <SBIPosY:30>     # 装備品画像のY座標を[30]に設定します。
 *
 * プラグインコマンドの実行により画像や動画を変更することもできます。
 * ストーリーの進行によって差し替えたい場合に使用します。
 *
 * プラグインコマンド詳細
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 *
 * SBI_IMAGE_CHANGE 1 file2 # ID[1]のアクターの画像を
 *                          「file2.png」に差し替えます。
 * SBI_ANIME_CHANGE 1 3 # ID[1]のアクターの動画を「3」に差し替えます。
 *
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc バストアップ表示プラグイン
 * @author トリアコンタン
 *
 * @param 画像X座標
 * @desc バストアップ画像を表示するX座標(足下原点)です。
 * @default 640
 *
 * @param 画像Y座標
 * @desc バストアップ画像を表示するY座標(足下原点)です。
 * @default 620
 *
 * @param コンテンツの下に表示
 * @desc ONにするとステータス等の下に画像が表示されます。(ON/OFF)
 * @default ON
 *
 * @help ステータス画面にアクターごとのバストアップ画像を表示します。
 * 足下を原点として表示位置を自由に調整できます。
 *
 * アクターのメモ欄に以下の通り指定してください。
 *
 * <SBI画像:file>   # /img/pictures/file.pngが表示されます。
 * <SBIImage:file>  # /img/pictures/file.pngが表示されます。
 *
 * さらに動画(データベースのアニメーション)を再生することもできます。
 * 画像の上に重ねてまばたき等を表現するのに使用します。
 *
 * <SBI動画:1>      # ID[1]のアニメーションがループ再生されます。
 * <SBIAnimation:1> # ID[1]のアニメーションがループ再生されます。
 *
 * 装備品ごとに画像を上乗せできます。
 * アイテムのメモ欄に以下の通り指定してください。
 * <SBI画像:item>   # /img/pictures/item.pngが表示されます。
 * <SBIImage:item>  # /img/pictures/item.pngが表示されます。
 * <SBIPosX:30>     # 装備品画像のX座標を[30]に設定します。
 * <SBI座標X:30>    # 装備品画像のX座標を[30]に設定します。
 * <SBIPosY:30>     # 装備品画像のY座標を[30]に設定します。
 * <SBI座標Y:30>    # 装備品画像のY座標を[30]に設定します。
 *
 * プラグインコマンドの実行により画像や動画を変更することもできます。
 * ストーリーの進行によって差し替えたい場合に使用します。
 *
 * プラグインコマンド詳細
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 *
 * SBI画像差し替え 1 file2  # ID[1]のアクターの画像を
 *                          「file2.png」に差し替えます。
 * SBI_IMAGE_CHANGE 1 file2 # ID[1]のアクターの画像を
 *                          「file2.png」に差し替えます。
 * SBI動画差し替え 1 3  # ID[1]のアクターの動画を「3」に差し替えます。
 * SBI_ANIME_CHANGE 1 3 # ID[1]のアクターの動画を「3」に差し替えます。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function() {
    'use strict';
    var pluginName    = 'StatusBustImage';
    var metaTagPrefix = 'SBI';

    var getCommandName = function(command) {
        return (command || '').toUpperCase();
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON';
    };

    var getMetaValue = function(object, name) {
        var metaTagName = metaTagPrefix + (name ? name : '');
        return object.meta.hasOwnProperty(metaTagName) ? object.meta[metaTagName] : undefined;
    };

    var getMetaValues = function(object, names) {
        if (!Array.isArray(names)) return getMetaValue(object, names);
        for (var i = 0, n = names.length; i < n; i++) {
            var value = getMetaValue(object, names[i]);
            if (value !== undefined) return value;
        }
        return undefined;
    };

    var getArgNumber = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
    };

    var getArgString = function(arg, upperFlg) {
        arg = convertEscapeCharacters(arg);
        return upperFlg ? arg.toUpperCase() : arg;
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text) : text;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramBustImageX    = getParamNumber(['BustImageX', '画像X座標']);
    var paramBustImageY    = getParamNumber(['BustImageY', '画像Y座標']);
    var paramUnderContents = getParamBoolean(['UnderContents', 'コンテンツの下に表示']);

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (!command.match(new RegExp('^' + metaTagPrefix))) return;
        try {
            this.pluginCommandBustStatus(command.replace(metaTagPrefix, ''), args);
        } catch (e) {
            if ($gameTemp.isPlaytest() && Utils.isNwjs()) {
                var window = require('nw.gui').Window.get();
                if (!window.isDevToolsOpen()) {
                    var devTool = window.showDevTools();
                    devTool.moveTo(0, 0);
                    devTool.resizeTo(window.screenX + window.outerWidth, window.screenY + window.outerHeight);
                    window.focus();
                }
            }
            console.log('プラグインコマンドの実行中にエラーが発生しました。');
            console.log('- コマンド名 　: ' + command);
            console.log('- コマンド引数 : ' + args);
            console.log('- エラー原因   : ' + e.stack || e.toString());
        }
    };

    Game_Interpreter.prototype.pluginCommandBustStatus = function(command, args) {
        switch (getCommandName(command)) {
            case '_IMAGE_CHANGE' :
            case '画像差し替え' :
                var actor1 = $gameActors.actor(getArgNumber(args[0], 1));
                actor1.setBustImageName(getArgString(args[1]));
                break;
            case '_ANIME_CHANGE' :
            case '動画差し替え' :
                var actor2 = $gameActors.actor(getArgNumber(args[0], 1));
                actor2.setBustAnimationId(getArgNumber(args[1]), 0);
                break;
        }
    };

    //=============================================================================
    // Game_Actor
    //  バスト画像を設定します。
    //=============================================================================
    var _Game_Actor_initMembers      = Game_Actor.prototype.initMembers;
    Game_Actor.prototype.initMembers = function() {
        _Game_Actor_initMembers.apply(this, arguments);
        this._bustImageName   = null;
        this._bustAnimationId = null;
    };

    Game_Actor.prototype.setBustImageName = function(value) {
        this._bustImageName = value;
    };

    Game_Actor.prototype.getBustImageName = function() {
        return this._bustImageName || getMetaValues(this.actor(), ['画像', 'Image']);
    };

    Game_Actor.prototype.setBustAnimationId = function(value) {
        this._bustAnimationId = value || null;
    };

    Game_Actor.prototype.getBustAnimationId = function() {
        if (this._bustAnimationId) return this._bustAnimationId;
        var value = getMetaValues(this.actor(), ['動画', 'Animation']);
        return value ? getArgNumber(value, 1) : 0;
    };

    //=============================================================================
    // Window_Status
    //  バスト画像表示用スプライトを追加定義します。
    //=============================================================================
    var _Window_Status_initialize      = Window_Status.prototype.initialize;
    Window_Status.prototype.initialize = function() {
        this._bustSprite = null;
        _Window_Status_initialize.apply(this, arguments);
    };

    Window_Status.prototype._createAllParts = function() {
        Window.prototype._createAllParts.call(this);
        this._bustSprite = new Sprite_Bust();
        this.addChildAt(this._bustSprite, paramUnderContents ? 2 : 3);
    };

    var _Window_Status_refresh      = Window_Status.prototype.refresh;
    Window_Status.prototype.refresh = function() {
        _Window_Status_refresh.apply(this, arguments);
        if (this._actor) {
            this._bustSprite.refresh(this._actor);
        }
    };

    //=============================================================================
    // Sprite_Bust
    //  バスト画像のクラスです。
    //=============================================================================
    function Sprite_Bust() {
        this.initialize.apply(this, arguments);
    }

    Sprite_Bust.prototype             = Object.create(Sprite_Base.prototype);
    Sprite_Bust.prototype.constructor = Sprite_Bust;

    Sprite_Bust.prototype.initialize = function() {
        Sprite_Base.prototype.initialize.call(this);
        this.x        = paramBustImageX;
        this.y        = paramBustImageY;
        this.anchor.x = 0.5;
        this.anchor.y = 1.0;
        this._actor   = null;
        this._equipSprites = [];
    };

    Sprite_Bust.prototype.refresh = function(actor) {
        this._actor = actor;
        this.drawMain();
        this.drawEquips();
        this.drawAnimation();
    };

    Sprite_Bust.prototype.drawMain = function() {
        var imageFileName = this._actor.getBustImageName();
        this.bitmap = (imageFileName ? ImageManager.loadPicture(getArgString(imageFileName), 0) : null);
    };

    Sprite_Bust.prototype.drawAnimation = function() {
        this._animationId = this._actor.getBustAnimationId();
        if (this.isNeedAnimation()) {
            this.startAnimation();
        } else {
            this.stopAnimation();
        }
    };

    Sprite_Bust.prototype.drawEquips = function() {
        this.clearEquips();
        this._actor.equips().forEach(function(equip) {
            if (equip) this.makeEquipSprite(equip);
        }.bind(this));
    };

    Sprite_Bust.prototype.clearEquips = function() {
        this._equipSprites.forEach(function(sprite) {
            this.removeChild(sprite);
        }.bind(this));
        this._equipSprites = [];
    };

    Sprite_Bust.prototype.makeEquipSprite = function(equip) {
        var itemFileName = getMetaValues(equip, ['画像', 'Image']);
        if (itemFileName) {
            var sprite      = new Sprite();
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            sprite.bitmap   = ImageManager.loadPicture(getArgString(itemFileName), 0);
            var xStr        = getMetaValues(equip, ['PosX', '座標X']);
            sprite.x        = xStr ? getArgNumber(xStr) : 0;
            var yStr        = getMetaValues(equip, ['PosY', '座標Y']);
            sprite.y        = yStr ? getArgNumber(yStr) : 0;
            this.addChild(sprite);
            this._equipSprites.push(sprite);
        }
    };

    Sprite_Bust.prototype.startAnimation = function() {
        Sprite_Base.prototype.startAnimation.call(this, $dataAnimations[this._animationId], false, 0);
    };

    Sprite_Bust.prototype.update = function() {
        Sprite_Base.prototype.update.call(this);
        if (this.isNeedAnimation()) this.updateAnimation();
    };

    Sprite_Bust.prototype.updateAnimation = function() {
        if (!this.isAnyAnimationExist()) {
            this.startAnimation();
        }
    };

    Sprite_Bust.prototype.isNeedAnimation = function() {
        return this._animationId > 0;
    };

    Sprite_Bust.prototype.isAnyAnimationExist = function() {
        if (this.isAnimationPlaying()) {
            return this._animationSprites.some(function(sprite) {
                return sprite.isPlaying();
            });
        } else {
            return false;
        }
    };

    Sprite_Base.prototype.stopAnimation = function() {
        if (this._animationSprites.length > 0) {
            this._animationSprites.forEach(function(animation) {
                animation.remove();
            });
        }
        this._animationSprites = [];
    };
})();

