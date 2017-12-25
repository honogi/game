//=============================================================================
// CommonEventBeforeMenu.js
//=============================================================================

/*:
 * @plugindesc メニューを開く直前に、指定したコモンイベントを実行します。
 * @author 奏ねこま（おとぶきねこま）
 *
 * @param Common Event ID
 * @desc メニューを開く直前に実行するコモンイベントのIDを指定してください。
 * @default 0
 *
 * @help
 * *このプラグインには、プラグインコマンドはありません。
 *
 * [ 利用規約 ] ...................................................................
 *  本プラグインの利用者は、RPGツクールMV/RPGMakerMVの正規ユーザーに限られます。
 *  商用、非商用、ゲームの内容（年齢制限など）を問わず利用可能です。
 *  ゲームへの利用の際、報告や出典元の記載等は必須ではありません。
 *  二次配布や転載、ソースコードURLやダウンロードURLへの直接リンクは禁止します。
 *  （プラグインを利用したゲームに同梱する形での結果的な配布はOKです）
 *  不具合対応以外のサポートやリクエストは受け付けておりません。
 *  本プラグインにより生じたいかなる問題においても、一切の責任を負いかねます。
 * [ 改訂履歴 ] ...................................................................
 *   Version 1.00  2016/07/21  初版
 * -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *  Web Site: http://i.gmobb.jp/nekoma/rpg_tkool/
 *  Twitter : https://twitter.com/koma_neko
 */

(function(){
    'use strict';
    
    const _PNAME = 'CommonEventBeforeMenu';
    const _PARAMETERS = PluginManager.parameters(_PNAME);
    
    const _COMMON_EVENT_ID = +_PARAMETERS['Common Event ID'] || 0;
    
    function _(f){ return f[_PNAME] = f[_PNAME] || {} }
    
    Scene_Map.prototype.updateCallMenu = function() {
        if (this.isMenuEnabled()) {
            if (this.isMenuCalled()) {
                this.menuCalling = true;
            }
            if (this.menuCalling && !$gamePlayer.isMoving()) {
                if (_COMMON_EVENT_ID && !_(this).reserveCallMenu) {
                    _(this).reserveCallMenu = true;
                    $gameTemp.reserveCommonEvent(_COMMON_EVENT_ID);
                } else {
                    _(this).reserveCallMenu = false;
                    this.callMenu();
                }
            }
        } else {
            this.menuCalling = false;
        }
    };
}());
