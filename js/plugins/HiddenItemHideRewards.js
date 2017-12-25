//
//  隠しアイテムドロップ非表示 ver1.01
//
// author yana
//

var Imported = Imported || {};
Imported['HiddenItemHideRewards'] = 1.01;
/*:
 * @plugindesc ver1.01/隠しアイテムをドロップしても表示されなくします。
 * @author Yana
 * 
 * @help------------------------------------------------------
 * 利用規約
 * ------------------------------------------------------ 
 * 使用に制限はありません。商用、アダルト、いずれにも使用できます。
 * 二次配布も制限はしませんが、サポートは行いません。
 * 著作表示は任意です。行わなくても利用できます。
 * 要するに、特に規約はありません。
 * バグ報告や使用方法等のお問合せはネ実ツクールスレ、または、Twitterにお願いします。
 * https://twitter.com/yanatsuki_
 * 素材利用は自己責任でお願いします。
 * ------------------------------------------------------
 * 更新履歴:
 * ver1.01:
 * 貴重品まで表示が消えていたバグを修正
 * ver1.00:
 * 公開
 */

// 再定義
BattleManager.displayDropItems = function() {
    var items = this._rewards.items;
    if (items.length > 0) {
        $gameMessage.newPage();
        items.forEach(function(item) {
            if (item.itypeId < 3){
            	$gameMessage.add(TextManager.obtainItem.format(item.name));
            }
        });
    }
};