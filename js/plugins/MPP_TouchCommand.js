//=============================================================================
// MPP_TouchCommand.js
//=============================================================================
// Copyright (c) 2015 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.0】左クリック（タッチ）時の情報を取得するイベントコマンドを追加します。
 * @author 木星ペンギン
 *
 * @help プラグインコマンド:
 *   TouchInfo type n             # type : 取得する情報タイプ
 *                                # n    : 情報を入れる変数の番号
 *   WaitTouch                    # 画面をタッチするまでウェイト
 * 
 * ●情報タイプ(type)
 *  realX  : 画面 X
 *  realY  : 画面 Y
 *  mapX   : マップのX座標
 *  mapY   : マップのY座標
 *  tag    : 地形タグ (低いレイヤーから判定して0以上のものを取得)
 *  event  : イベントID (無ければ0 / プレイヤーは対象外 / 低いID優先)
 *  reg    : リージョンID
 *  pic    : ピクチャ番号(無ければ0 / 回転には非対応 / 高い番号優先)
 *  dir4   : 画面中央からタッチした方向を取得(2,4,6,8の4方向)
 *  dir8   : 画面中央からタッチした方向を取得(1,2,3,4,6,7,8,9の8方向)
 * 
 * ●制御文字
 *  [情報を入れる変数の番号(n)]には変数が使用できます。
 *  (例:v[3]で変数3番を参照)
 * 
 * ●情報を取得する座標について
 *  TouchInfoでは最後にタッチした画面上の位置から情報を取得します。
 *  タッチしてからプラグインコマンドが実行されるまでの間に
 *  マップをスクロールしたりピクチャを移動させた場合、
 *  正確な情報が得られないことがあります。
 * 
 * ●画面をタッチするまでウェイト
 *  画面を左クリック(タッチ)するまでイベントの処理を一時停止します。
 *  右クリックやゲームパッド、キーボードからの入力では一時停止は解除されません。
 *  
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 */

(function() {
    
var Alias = {};

var TouchCommand = {
    processTouch: function(type, varId) {
        if (!type || varId === 0) return;
        var value = 0;
        var realX = TouchInput.x;
        var realY = TouchInput.y;
        var mapX = $gameMap.canvasToMapX(realX);
        var mapY = $gameMap.canvasToMapY(realY);
        switch (type) {
            case 'realX':
                value = realX;
                break;
            case 'realY':
                value = realY;
                break;
            case 'mapX':
                value = mapX;
                break;
            case 'mapY':
                value = mapY;
                break;
            case 'tag':
                value = $gameMap.terrainTag(mapX, mapY);
                break;
            case 'event':
                value = $gameMap.eventIdXy(mapX, mapY);
                break;
            case 'reg':
                value = $gameMap.regionId(mapX, mapY);
                break;
            case 'pic':
                value = this.pictureId(realX, realY);
                break;
            case 'dir4':
                var angle = (this.angle(realX, realY) + 45) % 360 / 90;
                if (angle < 1) {
                    value = 8;
                } else if (angle < 2) {
                    value = 6;
                } else if (angle < 3) {
                    value = 2;
                } else {
                    value = 4;
                }
                break;
            case 'dir8':
                var angle = (this.angle(realX, realY) + 22.5) % 360 / 45;
                if (angle < 1) {
                    value = 8;
                } else if (angle < 2) {
                    value = 9;
                } else if (angle < 3) {
                    value = 6;
                } else if (angle < 4) {
                    value = 3;
                } else if (angle < 5) {
                    value = 2;
                } else if (angle < 6) {
                    value = 1;
                } else if (angle < 7) {
                    value = 4;
                } else {
                    value = 7;
                }
                break;
        }
        $gameVariables.setValue(varId, value);
    },
    pictureId: function(x, y) {
        var pictures = SceneManager._scene._spriteset._pictureContainer.children;
        for (var i = pictures.length - 1; i >= 0; i--) {
            if (pictures[i].isPosInside(x, y)) {
                return pictures[i]._pictureId;
            }
        }
    },
    angle: function(tx, ty) {
        var cx = Graphics.width / 2;
        var cy = Graphics.height / 2;
        return (180 * Math.atan2(cy - ty, cx - tx) / Math.PI - 90).mod(360);
    }
};

//-----------------------------------------------------------------------------
// Game_Interpreter

//109
Alias.GaIn_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
Game_Interpreter.prototype.updateWaitMode = function() {
    if (this._waitMode === 'TouchTrigger') {
        if (TouchInput.isTriggered()) {
            this._waitMode = '';
            return false;
        }
        return true;
    }
    return Alias.GaIn_updateWaitMode.call(this);
};

//1722
Alias.GaIn_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Alias.GaIn_pluginCommand.call(this, command, args);
    if (command === 'TouchInfo') {
        var v = $gameVariables._data;
        TouchCommand.processTouch(args[0], eval(args[1]) || 0);
    } else if (command === 'WaitTouch') {
        this._waitMode = 'TouchTrigger';
    }
};

//-----------------------------------------------------------------------------
// Sprite_Picture

Sprite_Picture.prototype.isPosInside = function(x, y) {
    if (!this._pictureName) return false;
    var lx = this.canvasToLocalX(x);
    var ly = this.canvasToLocalY(y);
    var width = (this.width || 0) * this.scale.x;
    var height = (this.height || 0) * this.scale.y;
    var x1 = -width * this.anchor.x;
    var y1 = -height * this.anchor.y;
    var left = Math.min(x1, x1 + width);
    var top = Math.min(y1, y1 + height);
    var right = Math.max(x1, x1 + width);
    var bottom = Math.max(y1, y1 + height);
    return (lx >= left && ly >= top && lx < right && ly < bottom);
};

Sprite_Picture.prototype.canvasToLocalX = function(x) {
    var node = this;
    while (node) {
        x -= node.x;
        node = node.parent;
    }
    return x;
};

Sprite_Picture.prototype.canvasToLocalY = function(y) {
    var node = this;
    while (node) {
        y -= node.y;
        node = node.parent;
    }
    return y;
};

})();
