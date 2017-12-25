//=============================================================================
// DirectUseItem.js
//=============================================================================

/*:ja
 * @plugindesc プラグインコマンドにより、アイテムを直接使用します。
 * @author 奏ねこま（おとぶきねこま）
 *
 * @param アイテム使用の効果音を鳴らす
 * @desc プラグインコマンド実行時に、アイテム使用の効果音を鳴らす場合はtrueを指定してください。
 * @default false
 *
 * @param アイテム使用不可の効果音を鳴らす
 * @desc プラグインコマンド実行時、アイテムが使用不可だった場合に効果音を鳴らす場合はtrueを指定してください。
 * @default false
 *
 * @help
 * [プラグインコマンド]
 *
 * 　DirectUseItem <item id>
 * 　DirectUseItem <item id> <actor id>
 *
 *  <item id>には、使用するアイテムのIDを指定します。
 *  <actor id>には、アイテムを使用する対象となるアクターのIDを指定します。
 *  <actor id>を省略すると、アクターID 1番を対象とします。
 *  <item id>と<actor id>には、制御文字により変数を指定することもできます。
 *
 *  [使用例] アイテムID 3番のアイテムを使用（対象はアクターID 1番）
 * 　DirectUseItem 3
 *
 *  [使用例] アイテムID 4番のアイテムを、アクターID 2番に使用
 * 　DirectUseItem 4 2
 *
 *  [使用例] 変数#0005のIDのアイテムを、変数#0007のIDのアクターに使用
 * 　DirectUseItem \v[5] \v[7]
 *
 * [ 利用規約 ] .................................................................
 *  本プラグインの利用者は、RPGツクールMV/RPGMakerMVの正規ユーザーに限られます。
 *  商用、非商用、ゲームの内容（年齢制限など）を問わず利用可能です。
 *  ゲームへの利用の際、報告や出典元の記載等は必須ではありません。
 *  二次配布や転載、ソースコードURLやダウンロードURLへの直接リンクは禁止します。
 *  （プラグインを利用したゲームに同梱する形での結果的な配布はOKです）
 *  不具合対応以外のサポートやリクエストは受け付けておりません。
 *  本プラグインにより生じたいかなる問題においても、一切の責任を負いかねます。
 * [ 改訂履歴 ] .................................................................
 *   Version 1.00  2016/10/18  初版
 * -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *  Web Site: http://makonet.sakura.ne.jp/rpg_tkool/
 *  Twitter : https://twitter.com/koma_neko
 */

(function () {
    'use strict';

    const _PRODUCT = 'DirectUseItem';
    const _PARAMETER = PluginManager.parameters(_PRODUCT);

    const _PLAYSE_FORITEM = _PARAMETER['アイテム使用の効果音を鳴らす']     === 'true';
    const _PLAYSE_BUZZER  = _PARAMETER['アイテム使用不可の効果音を鳴らす'] === 'true';
    
    function _(f){ return f[_PRODUCT] = f[_PRODUCT] || {} }
    
    function processVariableCharacter(text) {
        if (!text) { return }
        var _text = '';
        while (text !== _text) {
            _text = text;
            text = text.replace(/\\v\[(\d+)\]/gi, function() {
                return $gameVariables.value(parseInt(arguments[1]));
            }.bind(this));
        }
        return text;
    }
    
    //=============================================================================
    // DirectUseItem
    //=============================================================================
    
    function DirectUseItem() {
        this.initialize.apply(this, arguments);
    }

    DirectUseItem.prototype = Object.create(Scene_Item.prototype);
    DirectUseItem.prototype.constructor = DirectUseItem;

    DirectUseItem.prototype.initialize = function() {
        Scene_Item.prototype.initialize.call(this);
    };

    DirectUseItem.prototype.item = function() {
        return this._item;
    };

    DirectUseItem.prototype.target = function() {
        return this._target || $gameActors.actor(1);
    };
    
    DirectUseItem.prototype.setItem = function(itemId) {
        this._item = $dataItems[itemId];
    };
    
    DirectUseItem.prototype.setTarget = function(actorId) {
        this._target = $gameActors.actor(actorId);
    };
    
    DirectUseItem.prototype.useItem = function() {
        if (this.user().canUse(this.item())) {
            _PLAYSE_FORITEM && this.playSeForItem();
            this.user().useItem(this.item());
            this.applyItem();
            this.checkCommonEvent();
            this.checkGameover();
        } else if (_PLAYSE_BUZZER) {
            SoundManager.playBuzzer();
        }
    };
    
    DirectUseItem.prototype.itemTargetActors = function() {
        var action = new Game_Action(this.user());
        action.setItemObject(this.item());
        if (!action.isForFriend()) {
            return [];
        } else if (action.isForAll()) {
            return $gameParty.members();
        } else {
            return [this.target()];
        }
    };

    //=============================================================================
    // Game_Interpreter
    //=============================================================================

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'DirectUseItem') {
            var itemId = +processVariableCharacter(args[0]) || 0;
            var actorId = +processVariableCharacter(args[1]) || 1;
            if (itemId) {
                var dui = new DirectUseItem();
                dui.setItem(itemId);
                dui.setTarget(actorId);
                dui.useItem();
            }
        }
    };
}());
