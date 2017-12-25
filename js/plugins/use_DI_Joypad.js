//=============================================================================
// use_DI_Joypad.js
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
//twitter https://twitter.com/Trb_surasura
/*:
 * @plugindesc DirectInput方式のジョイパッドが使えるようになります
 * @author Trb
 * @version 1.15  2016/3/20 F5が押された時に実行する関数の位置を変更
 *          1.1   2016/3/11 F5でリロードすると動かなくなってしまう問題を修正
 *          1.001 2016/2/26 微修正
 *          1.00  2016/2/26 初版
 * 
 * @help ジョイパッドにはDirect Input方式のものとX Input方式のものがあり、
 * ツクールMVでは通常はX Input方式のジョイパッドしか使えません。
 * それをどうにかDirect Inputのジョイパッドでも使えるようにしたプラグインです。
 * 
 */
(function () {

    Input._updateGamepadState = function(gamepad) {
        var lastState = this._gamepadStates[gamepad.index] || [];
        var newState = [];
        var buttons = gamepad.buttons;
        var axes = gamepad.axes;
        var threshold = 0.5;
        newState[12] = false;//追加した部分　ここから
        newState[13] = false;//||
        newState[14] = false;//||
        newState[15] = false;//ここまで
        for (var i = 0; i < buttons.length; i++) {
            newState[i] = buttons[i].pressed;
        }
        if (axes[1] < -threshold) {
            newState[12] = true;    // up
        } else if (axes[1] > threshold) {
            newState[13] = true;    // down
        }
        if (axes[0] < -threshold) {
            newState[14] = true;    // left
        } else if (axes[0] > threshold) {
            newState[15] = true;    // right
        }
        for (var j = 0; j < newState.length; j++) {
            if (newState[j] !== lastState[j]) {
                var buttonName = this.gamepadMapper[j];
                if (buttonName) {
                    this._currentState[buttonName] = newState[j];
                }
            }
        }
        this._gamepadStates[gamepad.index] = newState;
    };



/*ここからver 1.1追加分
F5(キーコード116)を押した時にブラウザをリロードする処理を無くし、
代わりに SceneManager.goto(Scene_Boot);で ゲームの開始地点に飛びます
*/
var f5 = false;//f5を押したらtrueになる変数を用意

SceneManager.onKeyDown = function(event) {
    if (!event.ctrlKey && !event.altKey) {
        switch (event.keyCode) {
        case 116:console.log('f5');
            if (Utils.isNwjs()) {
                //location.reload(false);本来の処理はカット
                f5 = true;
            }
            break;
        case 119:   // F8
            if (Utils.isNwjs() && Utils.isOptionValid('test')) {
                require('nw.gui').Window.get().showDevTools();
            }
            break;
        }
    }
};
/*
↑のreloadの部分に SceneManager.goto を入れると
F5を押すタイミングによってエラーが出てしまうことがあったので
上では押した判定のみを取得するようにしました
*/


//F5が押されていたらSceneBootに飛ぶ処理
SceneManager.onKeyF5 = function(){
    if(f5 == true){
        f5 = false;
        SceneManager.goto(Scene_Boot);
    }
};

var SMupdatescene = SceneManager.updateScene;
SceneManager.updateScene = function() {
    SMupdatescene.call(this);
    this.onKeyF5();
};


})();