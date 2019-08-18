//=============================================================================
// MPP_SelfVariable.js
//=============================================================================
// Copyright (c) 2017 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.2】各イベントにセルフ変数を追加します。
 * @author 木星ペンギン
 *
 * @help ●プラグインパラメータにて設定した番号の変数が、
 * 　イベントごとのセルフ変数を参照します。
 * 
 *   数値を設定する際、n-m と表記することでnからmまでの数値を指定できます。
 *   (例 : 1-4,8 => 1,2,3,4,8)
 * 
 * ●[変数の操作]を行うと、実行中のイベントのセルフ変数が操作されます。
 * 
 * ●イベントの[出現条件]ではセルフ変数が参照されます。
 * 
 * ●コモンイベントでセルフ変数を操作した場合、以下のようになります。
 *  ▽マップのイベントから[コモンイベントの呼び出し]を行った場合
 *   各イベントのセルフ変数が参照されます。
 *   
 *  ▽コモンイベントを自動実行or並列実行した場合
 *   コモンイベントごとのセルフ変数が参照されます。
 * 
 * ●トループのバトルイベントにはセルフ変数が適用されません。
 *   通常の変数と同じ扱いとなります。
 * 
 * ●通常のイベントでも、並列処理の場合は以下のコマンドでは使用できません。
 * 　（並列処理でなければ使用できます）
 *  ・文章の表示（制御文字）
 *  ・選択肢の表示（制御文字）
 *  ・数値入力の処理
 *  ・アイテム選択の処理
 *  ・文章のスクロール表示（制御文字）
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param Variables
 * @desc セルフ変数にする変数番号の配列
 * @default 
 *
 */

(function() {

var MPPlugin = {};
MPPlugin.params = PluginManager.parameters('MPP_SelfVariable');

MPPlugin.convertParam = function(name) {
    var param = this.params[name];
    var result = [];
    if (param) {
        var data = param.split(',');
        for (var i = 0; i < data.length; i++) {
            if (/(\d+)\s*-\s*(\d+)/.test(data[i])) {
                for (var n = Number(RegExp.$1); n <= Number(RegExp.$2); n++) {
                    result.push(n);
                }
            } else {
                result.push(Number(data[i]));
            }
        }
    }
    return result;
};

MPPlugin.Variables = MPPlugin.convertParam('Variables');

var Alias = {};

//-----------------------------------------------------------------------------
// Game_Variables

//15
Alias.GaVa_clear = Game_Variables.prototype.clear;
Game_Variables.prototype.clear = function() {
    Alias.GaVa_clear.call(this);
    this._selfVariables = {};
    this._mapId = 0;
    this._eventId = 0;
};

//19
Alias.GaVa_value = Game_Variables.prototype.value;
Game_Variables.prototype.value = function(variableId) {
    if (this._eventId > 0 && MPPlugin.Variables.contains(variableId)) {
        var key = [this._mapId, this._eventId, variableId];
        return this._selfVariables[key] || 0;
    } else {
        return Alias.GaVa_value.call(this, variableId);
    }
};

//23
Alias.GaVa_setValue = Game_Variables.prototype.setValue;
Game_Variables.prototype.setValue = function(variableId, value) {
    if (this._eventId > 0 && MPPlugin.Variables.contains(variableId)) {
        if (typeof value === 'number') {
            value = Math.floor(value);
        }
        var key = [this._mapId, this._eventId, variableId];
        this._selfVariables[key] = value;
        this.onChange();
    } else {
        Alias.GaVa_setValue.call(this, variableId, value);
    }
};

Game_Variables.prototype.reserveEvent = function(mapId, eventId) {
    this._mapId = mapId;
    this._eventId = eventId;
};

//-----------------------------------------------------------------------------
// Game_Event

//188
Alias.GaEv_findProperPageIndex = Game_Event.prototype.findProperPageIndex;
Game_Event.prototype.findProperPageIndex = function() {
    $gameVariables.reserveEvent(this._mapId, this._eventId);
    return Alias.GaEv_findProperPageIndex.call(this);
};

//-----------------------------------------------------------------------------
// Game_CommonEvent

//24
Alias.GaCoEv_refresh = Game_CommonEvent.prototype.refresh;
Game_CommonEvent.prototype.refresh = function() {
    Alias.GaCoEv_refresh.call(this);
    if (this._interpreter) {
        this._interpreter._commonEventId = this._commonEventId;
    }
};

//-----------------------------------------------------------------------------
// Game_Interpreter

//55
Alias.GaIn_setupReservedCommonEvent = Game_Interpreter.prototype.setupReservedCommonEvent;
Game_Interpreter.prototype.setupReservedCommonEvent = function() {
    this._commonEventId = $gameTemp._commonEventId;
    return Alias.GaIn_setupReservedCommonEvent.call(this);
};

//68
Alias.GaIn_update = Game_Interpreter.prototype.update;
Game_Interpreter.prototype.update = function() {
    this.reserveSelfVar();
    Alias.GaIn_update.call(this);
};

//608
Alias.GaIn_setupChild = Game_Interpreter.prototype.setupChild;
Game_Interpreter.prototype.setupChild = function(list, eventId) {
    Alias.GaIn_setupChild.call(this, list, eventId);
    this._childInterpreter._commonEventId = this._commonEventId;
};

Game_Interpreter.prototype.reserveSelfVar = function() {
    if (this._commonEventId) {
        $gameVariables.reserveEvent(-1, this._commonEventId);
    } else {
        $gameVariables.reserveEvent(this._mapId, this._eventId);
    }
};



})();
