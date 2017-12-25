//=============================================================================
// MPP_OriginalMenu.js
//=============================================================================
// Copyright (c) 2015 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【MPP ver.1.0】コモンイベントによるオリジナルのサブメニュー画面が作成できます。
 * @author 木星ペンギン
 * @help ●コマンドは【並び替え】の下に追加されます。
 * 
 * ●サブメニューの処理はイベントコマンドで実行されます。
 *  ・メインのコモンイベントの処理が終了した時点で、前の画面に戻ります。
 *  ・サブのコモンイベントは処理が終了しても最初から繰り返しません。
 * 
 * ●『イベントの移動』などを実行した場合、新しくメニュー画面用のイベントが
 *   生成されます。
 *  ・座標 X:0 Y:0 にグラフィックを設定していない状態で生成されます。
 * 
 * ●『スクリプトコマンド』で SceneManager.goto(Scene_Map) と実行することで
 *   マップ画面まで戻ることが出来ます。
 *  ・サブメニューで実行中のイベントは中断されます。
 * 
 * ●『場所移動』を実行した場合、強制的にマップ画面まで戻されます。
 *  ・サブメニューで実行中のイベントは中断されます。
 *   
 * ================================
 * ●設定例
 * 
 * Command Names     # ファストトラベル,図鑑,ヘルプ
 * Main Event ID     # 1,2,3
 * Sub Event ID      # 11
 *   
 * と設定した場合、
 * 
 * コマンド名「ファストトラベル」を実行すると、コモンイベントID 1番をメインに
 * コモンイベントID 11番をサブとして並列で実行するメニューが開きます。
 * 
 * コマンド名「図鑑」を実行すると、コモンイベントID 2番をメインとして
 * 実行するメニューが開きます。
 * 
 * コマンド名「ヘルプ」を実行すると、コモンイベントID 3番をメインとして
 * 実行するメニューが開きます。
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param Command Names
 * @desc メインメニューで表示されるコマンド名の配列
 * @default ファストトラベル,図鑑,ヘルプ
 *
 * @param Main Event ID
 * @desc 実行されるメインのコモンイベントIDの配列
 * @default 1,2,3
 *
 * @param Sub Event ID
 * @desc 実行されるサブのコモンイベントIDの配列
 * @default 0,0,0
 *
 */

(function() {

var parameters = PluginManager.parameters('MPP_OriginalMenu');
var MPPlugin = {
    commandNames: parameters['Command Names'].split(","),
    mainEventId: eval('[' + parameters['Main Event ID'] + ']'),
    subEventId: eval('[' + parameters['Sub Event ID'] + ']')
};

var Alias = {};

var MenuData = {
    name: null,
    events: [],
    mainInterpreter: null,
    subInterpreter: null,
    create: function() {
        if (!this.mainInterpreter) {
            this.events = [];
            this.mainInterpreter = new Game_Interpreter();
            this.subInterpreter = new Game_Interpreter();
            var index = MPPlugin.commandNames.indexOf(this.name);
            var mainId = MPPlugin.mainEventId[index];
            var event = $dataCommonEvents[mainId];
            if (event) this.mainInterpreter.setup(event.list);
            var subId = MPPlugin.subEventId[index];
            event = $dataCommonEvents[subId];
            if (event) this.subInterpreter.setup(event.list);
        }
    },
    update: function() {
        this.mainInterpreter.update();
        this.subInterpreter.update();
        this.events.forEach(function(event) {
            if (event) event.update();
        });
    },
    clear: function () {
        this.name = null;
        this.events = [];
        this.mainInterpreter = null;
        this.subInterpreter = null;
    }
};

//-----------------------------------------------------------------------------
// Game_SubMenu_Character

function Game_SubMenu_Character() {
    this.initialize.apply(this, arguments);
}

Game_SubMenu_Character.prototype = Object.create(Game_Character.prototype);
Game_SubMenu_Character.prototype.constructor = Game_SubMenu_Character;

Game_SubMenu_Character.prototype.initialize = function() {
    Game_Character.prototype.initialize.call(this);
};

Game_SubMenu_Character.prototype.canPass = function() {
    return true;
};

Game_SubMenu_Character.prototype.canPassDiagonally = function() {
    return true;
};

Game_SubMenu_Character.prototype.scrolledX = function() {
    return this._realX;
};

Game_SubMenu_Character.prototype.scrolledY = function() {
    return this._realY;
};

Game_SubMenu_Character.prototype.updateJump = function() {
    this._jumpCount--;
    this._realX = (this._realX * this._jumpCount + this._x) / (this._jumpCount + 1.0);
    this._realY = (this._realY * this._jumpCount + this._y) / (this._jumpCount + 1.0);
    this.refreshBushDepth();
    if (this._jumpCount === 0) {
        this._realX = this._x;
        this._realY = this._y;
    }
};

Game_SubMenu_Character.prototype.isOnLadder = function() {
    return false;
};

Game_SubMenu_Character.prototype.isOnBush = function() {
    return false;
};

Game_SubMenu_Character.prototype.terrainTag = function() {
    return 0;
};

Game_SubMenu_Character.prototype.regionId = function() {
    return 0;
};

Game_SubMenu_Character.prototype.moveStraight = function(d) {
    this.setMovementSuccess(this.canPass(this._x, this._y, d));
    if (this.isMovementSucceeded()) {
        this.setDirection(d);
        this._x += d === 6 ? 1 : d === 4 ? -1 : 0;
        this._y += d === 2 ? 1 : d === 8 ? -1 : 0;
        this.increaseSteps();
    } else {
        this.setDirection(d);
    }
};

Game_SubMenu_Character.prototype.moveDiagonally = function(horz, vert) {
    this.setMovementSuccess(this.canPassDiagonally(this._x, this._y, horz, vert));
    if (this.isMovementSucceeded()) {
        this._x += horz === 6 ? 1 : horz === 4 ? -1 : 0;
        this._y += vert === 2 ? 1 : vert === 8 ? -1 : 0;
        this.increaseSteps();
    }
    if (this._direction === this.reverseDir(horz)) {
        this.setDirection(horz);
    }
    if (this._direction === this.reverseDir(vert)) {
        this.setDirection(vert);
    }
};

Game_SubMenu_Character.prototype.deltaXFrom = function(x) {
    return this.x - x;
};

Game_SubMenu_Character.prototype.deltaYFrom = function(y) {
    return this.y - y;
};

//-----------------------------------------------------------------------------
// Game_Screen

//74
Alias.GaSc_realPictureId = Game_Screen.prototype.realPictureId;
Game_Screen.prototype.realPictureId = function(pictureId) {
    if (!$gameParty.inBattle() && MenuData.name) {
        return pictureId + this.maxPictures() * 2;
    } else {
        return Alias.GaSc_realPictureId.call(this, pictureId);
    }
};

//-----------------------------------------------------------------------------
// Game_Interpreter

Alias.GaIn_character = Game_Interpreter.prototype.character;
Game_Interpreter.prototype.character = function(param) {
    if (!MenuData.name) {
        return Alias.GaIn_character.call(this, param);
    } else if (param > 0) {
        if (!MenuData.events[param]) {
            MenuData.events[param] = new Game_SubMenu_Character();
        }
        return MenuData.events[param];
    } else {
        return null;
    }
};

//-----------------------------------------------------------------------------
// Window_MenuCommand

//64
Alias.WiMeCo_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function() {
    Alias.WiMeCo_addOriginalCommands.call(this);
    var names = MPPlugin.commandNames;
    for (var i = 0; i < names.length; i++) {
        this.addCommand(names[i], names[i]);
    }
};

//-----------------------------------------------------------------------------
// Spriteset_SubMenu

function Spriteset_SubMenu() {
    this.initialize.apply(this, arguments);
}

Spriteset_SubMenu.prototype = Object.create(Spriteset_Base.prototype);
Spriteset_SubMenu.prototype.constructor = Spriteset_SubMenu;

Spriteset_SubMenu.prototype.initialize = function() {
    this._characterSprites = [];
    Spriteset_Base.prototype.initialize.call(this);
    this._blackScreen.opacity = 0;
};

Spriteset_SubMenu.prototype.createPictures = function() {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    var x = (Graphics.width - width) / 2;
    var y = (Graphics.height - height) / 2;
    this._pictureContainer = new Sprite();
    this._pictureContainer.setFrame(x, y, width, height);
    for (var i = 1; i <= $gameScreen.maxPictures(); i++) {
        this._pictureContainer.addChild(new Sprite_Picture(i));
    }
    this.addChild(this._pictureContainer);
};

Spriteset_SubMenu.prototype.update = function() {
    Spriteset_Base.prototype.update.call(this);
    this.updateCharacters();
};

Spriteset_SubMenu.prototype.hideCharacters = function() {
    for (var i = 0; i < this._characterSprites.length; i++) {
        var sprite = this._characterSprites[i];
        if (sprite) sprite.hide();
    }
};

Spriteset_SubMenu.prototype.updateCharacters = function() {
    var events = MenuData.events;
    for (var i = 0; i < events.length; i++) {
        if (events[i]) {
            if (!this._characterSprites[i]) {
                var sprite = new Sprite_Character(events[i]);
                var index = this.children.indexOf(this._pictureContainer);
                this._characterSprites[i] = sprite;
                this.addChildAt(sprite, index);
            }
            this._characterSprites[i].update();
        }
    }
};


//-----------------------------------------------------------------------------
// Scene_Menu

//29
Alias.ScMe_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    Alias.ScMe_createCommandWindow.call(this);
    var names = MPPlugin.commandNames;
    for (var i = 0; i < names.length; i++) {
        this._commandWindow.setHandler(names[i], this.commandSubMenu.bind(this));
    }
};

Scene_Menu.prototype.commandSubMenu = function() {
    MenuData.name = this._commandWindow.currentSymbol();
    SceneManager.push(Scene_MppSubMenu);
};

//-----------------------------------------------------------------------------
// Scene_MppSubMenu

function Scene_MppSubMenu() {
    this.initialize.apply(this, arguments);
}

Scene_MppSubMenu.prototype = Object.create(Scene_MenuBase.prototype);
Scene_MppSubMenu.prototype.constructor = Scene_MppSubMenu;

Scene_MppSubMenu.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    this._encounterEffectDuration = 0;
    $gameScreen.eraseBattlePictures();
};

Scene_MppSubMenu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    MenuData.create();
    this.createSpriteset();
    this.createMessageWindow();
    this.createScrollTextWindow();
};

Scene_MppSubMenu.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_SubMenu();
    var index = this.children.indexOf(this._backgroundSprite);
    this.addChildAt(this._spriteset, index + 1);
};

Scene_MppSubMenu.prototype.createMessageWindow = function() {
    this._messageWindow = new Window_Message();
    this.addWindow(this._messageWindow);
    this._messageWindow.subWindows().forEach(function(window) {
        this.addWindow(window);
    }, this);
};

Scene_MppSubMenu.prototype.createScrollTextWindow = function() {
    this._scrollTextWindow = new Window_ScrollText();
    this.addWindow(this._scrollTextWindow);
};

Scene_MppSubMenu.prototype.update = function() {
    if (this.isActive()) {
        this.updateMain();
    }
    if (this.isSceneChangeOk()) {
        this.updateScene();
    } else if (SceneManager.isNextScene(Scene_Battle)) {
        Scene_Map.prototype.updateEncounterEffect.call(this);
    }
    Scene_MenuBase.prototype.update.call(this);
};

Scene_MppSubMenu.prototype.updateMain = function() {
    MenuData.update();
    if (!MenuData.mainInterpreter.isRunning()) {
        this.popScene();
        return;
    }
    $gameScreen.update();
};

Scene_MppSubMenu.prototype.stop = function() {
    Scene_MenuBase.prototype.stop.call(this);
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else if (SceneManager.isNextScene(Scene_Battle)) {
        this.launchBattle.call(this);
    }
};

Scene_MppSubMenu.prototype.isBusy = function() {
    return ((this._messageWindow && this._messageWindow.isClosing()) ||
            this._encounterEffectDuration > 0 || Scene_MenuBase.prototype.isBusy.call(this));
};

Scene_MppSubMenu.prototype.terminate = function() {
    Scene_MenuBase.prototype.terminate.call(this);
    if (SceneManager.isNextScene(Scene_Menu) || SceneManager.isNextScene(Scene_Map)) {
        MenuData.clear();
    }
    $gameScreen.clearZoom();
};

Scene_MppSubMenu.prototype.needsSlowFadeOut = function() {
    return (SceneManager.isNextScene(Scene_Title) ||
            SceneManager.isNextScene(Scene_Gameover));
};

Scene_MppSubMenu.prototype.launchBattle = function() {
    BattleManager.saveBgmAndBgs();
    Scene_Map.prototype.stopAudioOnBattleStart.call(this);
    SoundManager.playBattleStart();
    Scene_Map.prototype.startEncounterEffect.call(this);
};

Scene_MppSubMenu.prototype.isSceneChangeOk = function() {
    return this.isActive() && !$gameMessage.isBusy();
};

Scene_MppSubMenu.prototype.updateScene = function() {
    this.checkGameover();
    if (!SceneManager.isSceneChanging()) {
        this.updateTransferPlayer();
    }
};

Scene_MppSubMenu.prototype.updateTransferPlayer = function() {
    if ($gamePlayer.isTransferring()) {
        SceneManager.goto(Scene_Map);
    }
};

Scene_MppSubMenu.prototype.snapForBattleBackground = function() {
    Scene_Map.prototype.snapForBattleBackground.call(this);
};

Scene_MppSubMenu.prototype.startFlashForEncounter = function(duration) {
    Scene_Map.prototype.startFlashForEncounter.call(this, duration);
};

Scene_MppSubMenu.prototype.encounterEffectSpeed = function() {
    return Scene_Map.prototype.encounterEffectSpeed.call(this);
};

})();
