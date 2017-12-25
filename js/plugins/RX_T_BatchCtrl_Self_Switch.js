//=============================================================================
// Plugin_Name : RX_T_BatchCtrl_Self_Switch
// File_Name   : RX_T_BatchCtrl_Self_Switch.js
// Version     : 1.00
// Copylight   : 2015 TYPE74RX-T
//=============================================================================


//=============================================================================
/*:
 * @plugindesc 操作したいイベントのセルフスイッチを一括操作できるようになります。
 * @author TYPE74RX-T
 * @help セルフスイッチの一括操作
 * ============================================================================
 * * セルフスイッチの一括操作・ヘルプ
 * ============================================================================
 * 操作したいイベントのセルフスイッチを
 * 一括操作できるようになります。
 * ============================================================================
 * * 使い方
 * ============================================================================
 * イベントコマンド「スクリプト」で呼び出します。
 * 例１：イベントID1、イベントID3、イベントID5のセルフスイッチＡをオンにする場合 
 *
 * this.bc_s_sw([1, 3, 5], "A, on");
 * （Aは大文字、onが小文字、そしてカンマの後に半角スペースを開けます。）
 *
 * 例２：マップID10、イベントID2、イベントID9のセルフスイッチCをオフにする場合
 *
 * this.bc_s_sw_m(10, [2, 9], "C, off");
 * （命令文、記述方法が少し違います。）
 *
 * 【仕様】
 * ・セルフスイッチのA～Dを一括操作することはできません。
 * ・off指定する場合、「on」以外の文字列はすべてoff指定と見なされます。
 * ============================================================================
 * * ドキュメント終了 
 * ============================================================================
*/

(function() {
	
	//Game_Interpreter

	// Batch Control Self Switch(同一マップ内のみ)
	Game_Interpreter.prototype.bc_s_sw = function(ev, param) {
	    var size = Object.keys(ev).length;
	    var result = param.split(",");
	    var param1 = result[0];
	    var param2 = result[1] === " on" ? 0 : 1;
	    var key = [];
	    if(size <= 0){ return true; }
	    for (var i = 0; i < size ; i++){
	        key = [this._mapId, ev[i], param1];
	        $gameSelfSwitches.setValue(key, param2 === 0);
	    }
    	return true;
	};

	// Batch Control Self Switch(マップ指定型)
	Game_Interpreter.prototype.bc_s_sw_m = function(mapId, ev, param) {
	    var size = Object.keys(ev).length;
	    var result = param.split(",");
	    var param1 = result[0];
	    var param2 = result[1] === " on" ? 0 : 1;
	    var key = [];
	    if(size <= 0){ return true; }
	    for (var i = 0; i < size ; i++){
	        key = [mapId, ev[i], param1];
	        $gameSelfSwitches.setValue(key, param2 === 0);
	    }
    	return true;
	};

})();