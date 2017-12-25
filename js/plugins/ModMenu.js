//=============================================================================
// ModMenu.js
//=============================================================================
  
/*:
 * @plugindesc Modificable menu screen layout
 * @author Bodka
   
 * @help v 1.4 Added some command, bugfix
   
 * @param  --Menu status--
   
 * @param Menu Status x
 * @desc Set orizontal position of the Menu Status. 
 * @default 0
   
 * @param Menu Status y
 * @desc Set vertical position of the Menu Status.
 * @default 0
 
 * @param Menu Status x Text
 * @desc Possible value Left, Center, Right, After command, Disabled. If Disabled take Menu Command x value(number). Default Disabled
 * @default Disabled

 * @param Menu Status y Text
 * @desc Possible value Top, Center, Bottom, Disabled. If Disabled take Menu Command y value(number). Default Disabled
 * @default Disabled
 
 * @param Menu Status Width
 * @desc Set Menu status width. If 0 take default settings.
 * @default 0
   
 * @param Menu Status Height
 * @desc Set Menu status height. If 0 take default settings.
 * @default 0
   
 * @param Menu Status ActorBox Height
 * @desc Set height of actor box in the menu status. If 0 take default settings.
 * @default 0
   
 * @param --Menu Command--  
   
 * @param Menu Command Width
 * @desc Set Menu command width. Default 240
 * @default 240
    
 * @param Menu Command Height
 * @desc Set menu command height. Default 0 
 * @default 0
   
 * @param Menu Command y
 * @desc Set menu command window vertical position. Default 0
 * @default 0
   
 * @param Menu Command x
 * @desc Set menu command window orizontal position. Default 0
 * @default 0
 
 * @param Menu Command x Text
 * @desc Possible value Left, Center, Right, Disabled. If Disabled take Menu Command x value(number). Default Disabled
 * @default Disabled

 * @param Menu Command y Text
 * @desc Possible value Top, Center, Bottom, Disabled. If Disabled take Menu Command y value(number). Default Disabled
 * @default Disabled
   
 * @param Menu Command Row Displayed
 * @desc Set menu command window row displayed. Menu command heigth must be 0. Default 8.
 * @default 8
   
 * @param --Gold window--
   
 * @param Gold Window x
 * @desc Set Gold window orizontal position. Default 0
 * @default 0
  
 * @param Gold Window y
 * @desc Set Gold window vertical position. Default 0 
 * @default 0
 
 * @param Gold Window x Text
 * @desc Possible value Left, Center, Right, Disabled. If Disabled take Menu Command x value(number). Default Disabled
 * @default Disabled

 * @param Gold Window y Text
 * @desc Possible value Top, Center, Bottom, Disabled. If Disabled take Menu Command y value(number). Default Disabled
 * @default Disabled
 
 * @param Gold Window width
 * @desc Set width of the gold window. If 0 default settings. Default 0
 * @default 0
 
 * @param --Location window--

 * @param Location Window x
 * @desc Set Gold window orizontal position. Default 0
 * @default 0
  
 * @param Location Window y
 * @desc Set Gold window vertical position. Default 0 
 * @default 0 
 
 * @param Location Window x Text
 * @desc Possible value Left, Center, Right, Disabled. If Disabled take Menu Command x value(number). Default Disabled
 * @default Left
 
 * @param Location Window y Text
 * @desc Possible value Top, Center, Bottom, Before Gold, Disabled. If Disabled take Menu Command y value(number). Default Disabled
 * @default Before Gold
 
 * @param Location Window Width
 * @desc Set Location window width. If 0 take default settings. Default 0. 
 * @default 0 
 
 * @param Location Window Height
 * @desc Set Location Window height. If 0 take default settings. Default 0
 * @default 0 
 
 * @param --Show window--
 
 * @param Show Status Window
 * @desc Show or hide status window in the menu.True for enable. Case sensitive. Default True
 * @default True
   
 * @param Show Gold Window
 * @desc Show or hide the gold window in the menu status(Case sensitive). True or False. Default True.
 * @default True
   
 * @param Show Location Window
 * @desc Show or hide the location window in the menu status(Case sensitive). True or False. Default True.
 * @default False
 
 * @param --Show actor face--
 
 * @param Show Actor Face Menu
 * @desc Show or hide the actor face in the Menu status. True or False. Default True.
 * @default True
 
 * @param Show Actor Face Status Info
 * @desc Show or hide the actor face in the status tab. True or False. Default True.
 * @default True
 
 * @param --Show Command in menu--  
   
 * @param Show Item in menu
 * @desc Show Item Command in the menu command.True of False, Case sensitive. Default True
 * @default True
   
 * @param Show Skill in menu
 * @desc Show Skill Command in the menu command.True of False, Case sensitive. Default True
 * @default True
   
 * @param Show Equip in menu
 * @desc Show Equip Command in the menu command.True of False, Case sensitive. Default True
 * @default True
   
 * @param Show Status in menu
 * @desc Show Status Command in the menu command.True of False, Case sensitive. Default True
 * @default True
   
 * @param Show Formation in menu
 * @desc Show Formation Command in the menu command.True of False, Case sensitive. Default True
 * @default True
   
 * @param Show Options in menu
 * @desc Show Options Command in the menu command.True of False, Case sensitive. Default True
 * @default True
   
 * @param Show Save in menu
 * @desc Show Save Command in the menu command.True of False, Case sensitive. Default True
 * @default True
   
 * @param Show Game End in menu
 * @desc Show Game End Command in the menu command.True of False, Case sensitive. Default True
 * @default True

 */
  
var parameters = PluginManager.parameters('ModMenu');
var xStatus = Number(parameters['Menu Status x']);
var yStatus = Number(parameters['Menu Status y']);
var wStatus = Number(parameters['Menu Status Width']);
var hStatus = Number(parameters['Menu Status Height']);
var actorBoxH = Number(parameters['Menu Status ActorBox Height']);
var widthCommand = Number(parameters['Menu Command Width']);
var heightCommand = Number(parameters['Menu Command Height']);
var yCommandText = String(parameters['Menu Command y Text']);
var xCommandText = String(parameters['Menu Command x Text']);
var yCommand = Number(parameters['Menu Command y']);
var xCommand = Number(parameters['Menu Command x']);
var rowCommand = Number(parameters['Menu Command Row Displayed']);
var xGold = Number(parameters['Gold Window x']);
var yGold = Number(parameters['Gold Window y']);
var widthGold = Number(parameters['Gold Window width']);
var showGoldWindow = String(parameters['Show Gold Window']);
var showItem = String(parameters['Show Item in menu']);
var showSkill = String(parameters['Show Skill in menu']);
var showEquip = String(parameters['Show Equip in menu']);
var showStatus = String(parameters['Show Status in menu']);
var showFormation = String(parameters['Show Formation in menu']);
var showOptions = String(parameters['Show Options in menu']);
var showSave = String(parameters['Show Save in menu']);
var showGameEnd = String(parameters['Show Game End in menu']);
var showStatusWindow = String(parameters['Show Status Window']);
var showLocationWindow = String(parameters['Show Location Window']);
var yGoldText = String(parameters['Gold Window y Text']);
var xGoldText = String(parameters['Gold Window x Text']);
var yStatusText = String(parameters['Menu Status y Text']);
var xStatusText = String(parameters['Menu Status x Text']);
var locationWidth = Number(parameters['Location Window Width']);
var locationHeight = Number(parameters['Location Window Height']);
var xLocation = Number(parameters['Location Window x']);
var yLocation = String(parameters['Location Window y']);
var xLocationText = String(parameters['Location Window x Text']);
var yLocationText = String(parameters['Location Window y Text']);
var bgActorX = Number(parameters['Actor Background x']);
var bgActorY = Number(parameters['Actor Background y']);
var bgActorYscale = Number(parameters['Actor Background y Scale']);
var showActorFace = String(parameters['Show Actor Face Menu']);
var showActorFaceInfo = String(parameters['Show Actor Face Status Info']);
var Scene_Menu_create = Scene_Menu.prototype.create;
 
//============================================================
// Scene_Menu
//============================================================
	
Scene_Menu.prototype.create = function() {
    Scene_Menu_create.call(this);
};

Scene_Menu.prototype.createGoldWindow = function() {
	this._goldWindow = new Window_Gold(0, 0);
	if (widthGold != 0){this._goldWindow.width = widthGold;}
    if(xGoldText != 'Disabled'){
		if (xGoldText == 'Left'){this._goldWindow.x = 0}
		else if (xGoldText == 'Center'){this._goldWindow.x = (Graphics.boxWidth / 2) - (this._goldWindow.width / 2)}
		else if (xGoldText == 'Right'){this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width}
	}
	else{this._goldWindow.x = xGold}
	if(yGoldText != 'Disabled'){
		if (yGoldText == 'Bottom'){this._goldWindow.y = Graphics.boxHeight - this._goldWindow.height}
		else if (yGoldText == 'Center'){this._goldWindow.y = (Graphics.boxHeight / 2) - (this._goldWindow.y / 2)}
		else if (yGoldText == 'Top'){this._goldWindow.y = 0}
	}
	else{this._goldWindow.y = yGold}	
	this.addWindow(this._goldWindow);
};
	
Scene_Menu.prototype.createStatusWindow = function() {
	this._statusWindow = new Window_MenuStatus(this._commandWindow.width, 0);
	if (wStatus != 0){this._statusWindow.width = wStatus};
    if (hStatus != 0){this._statusWindow.height = hStatus}; 
    if (yStatusText != 'Disabled'){
		if (yStatusText == 'Top'){this._statusWindow.y = 0}
		else if (yStatusText == 'Center'){this._statusWindow.y = (Graphics.boxHeight / 2) - (this._statusWindow.height / 2)}
		else if (yStatusText == 'Bottom'){this._statusWindow.y = Graphics.boxHeight - this._statusWindow.height}
	}
	else if (yStatus != 0){this._statusWindow.y = yStatus}
	if (xStatusText != 'Disabled'){
		if (xStatusText == 'Left'){this._statusWindow.x = 0}
		else if (xStatusText == 'Center'){this._statusWindow.x = (Graphics.boxWidth / 2) - (this._statusWindow.width / 2)}
		else if (xStatusText == 'Right'){this._statusWindow.x = Graphics.boxWidth - this._statusWindow.width}
		else if (xStatusText == 'After command'){this._statusWindow.x = this._commandWindow.width}
	}
	else if (xStatus != 0){this._statusWindow.x = xStatus}
	this.addWindow(this._statusWindow);
};    
	
Scene_Menu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
	this.createCommandWindow();
    if (showGoldWindow == 'True'){this.createGoldWindow()};
    if (showStatusWindow == 'True'){this.createStatusWindow()};
	if (showLocationWindow == 'True'){this.createLocationWindow()};
}    
	
if (heightCommand != 0 ) { 
    Window_MenuCommand.prototype.windowHeight = function() {
		return heightCommand;
}}
else{
    Window_MenuCommand.prototype.numVisibleRows = function() {
		return rowCommand;
}};
      
Scene_Menu.prototype.start = function() {
	Scene_MenuBase.prototype.start.call(this);
	if (showStatusWindow == 'True'){this._statusWindow.refresh()};
};
     
Scene_Menu.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_MenuCommand(0, 0);
    this._commandWindow.setHandler('item',      this.commandItem.bind(this));
    this._commandWindow.setHandler('skill',     this.commandPersonal.bind(this));
    this._commandWindow.setHandler('equip',     this.commandPersonal.bind(this));
    this._commandWindow.setHandler('status',    this.commandPersonal.bind(this));
    this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
    this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
    this._commandWindow.setHandler('save',      this.commandSave.bind(this));
    this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
    this._commandWindow.setHandler('cancel',    this.popScene.bind(this));
	if (widthCommand != 0){this._commandWindow.width = widthCommand}
	if (xCommandText != 'Disabled'){
        if (xCommandText == 'Right'){this._commandWindow.x = Graphics.boxWidth - this._commandWindow.width}
        else if (xCommandText == 'Center'){this._commandWindow.x = (Graphics.boxWidth / 2) - (this._commandWindow.width / 2)}
        else if (xCommandText == 'Left'){this._commandWindow.x = 0}}
	else{this._commandWindow.x = xCommand}
    if (yCommandText != 'Disabled'){
        if (yCommandText == 'Bottom'){this._commandWindow.y = Graphics.boxHeight - this._commandWindow.height}
        else if(yCommandText == 'Center'){this._commandWindow.y = (Graphics.boxHeight / 2) - (this._commandWindow.height / 2)}
        else if(yCommandText == 'Top'){this._commandWindow.y = 0}}
	else{this._commandWindow.y = yCommand};		
    this.addWindow(this._commandWindow);
};

Scene_Menu.prototype.createLocationWindow = function() {
	this._locationWindow = new Window_Location();
	if (locationWidth != 0){this._locationWindow.width = locationWidth}
	if (locationHeight != 0){this._locationWindow.height = locationHeight}
	if(xLocationText != 'Disabled'){
		if (xLocationText == 'Left'){this._locationWindow.x = 0}
		else if (xLocationText == 'Center'){this._locationWindow.x = (Graphics.boxWidth / 2) - (this._locationWindow.width / 2)}
		else if (xLocationText == 'Right'){this._locationWindow.x = Graphics.boxWidth - this._locationWindow.width}
	}
	else{this._locationWindow.x = xLocation}
	if(yLocationText != 'Disabled'){
		if (yLocationText == 'Bottom'){this._locationWindow.y = Graphics.boxHeight - this._locationWindow.height}
		else if ((yLocationText == 'Before Gold') && (showGoldWindow == 'True')){this._locationWindow.y = Graphics.boxHeight - this._locationWindow.height - this._goldWindow.height}
		else if (yLocationText == 'Center'){this._locationWindow.y = (Graphics.boxHeight / 2) - (this._locationWindow.y / 2)}
		else if (yLocationText == 'Top'){this._locationWindow.y = 0}
	}
	else{this._locationWindow.y = yLocation}	
	this.addWindow(this._locationWindow);
};	// Create location window
	
//=====================================================================
// Window_MenuCommand
//=====================================================================
  
Window_MenuCommand.prototype.makeCommandList = function() {
    this.addMainCommands();
    this.addFormationCommand();
    this.addOriginalCommands();
    if(showOptions == 'True'){this.addOptionsCommand()};
    if(showSave == 'True'){this.addSaveCommand()};
    if(showGameEnd == 'True'){this.addGameEndCommand()};
};
  
Window_MenuCommand.prototype.addMainCommands = function() {
    var enabled = this.areMainCommandsEnabled();
    if (this.needsCommand('item') && (showItem == 'True')) {
    this.addCommand(TextManager.item, 'item', enabled);
	}
    if (this.needsCommand('skill') && (showSkill == 'True')) {
        this.addCommand(TextManager.skill, 'skill', enabled);
    }
    if (this.needsCommand('equip') && (showEquip == 'True')) {
		this.addCommand(TextManager.equip, 'equip', enabled);
    }
    if (this.needsCommand('status') && (showStatus == 'True')) {
		this.addCommand(TextManager.status, 'status', enabled);
    }
};
  
Window_MenuCommand.prototype.addFormationCommand = function() {
    if (this.needsCommand('formation') && (showFormation == 'True')) {
        var enabled = this.isFormationEnabled();
		this.addCommand(TextManager.formation, 'formation', enabled);
    }
};

//=====================================================================
// Window_Location
//=====================================================================

function Window_Location() {
    this.initialize.apply(this, arguments);
}

Window_Location.prototype = Object.create(Window_Base.prototype);
Window_Location.prototype.constructor = Window_Location;

Window_Location.prototype.initialize = function() {
    var wight = this.windowWidth();
    var height = this.windowHeight();
	var x = 0;
	var y = 0;
    Window_Base.prototype.initialize.call(this, x, y, wight, height);
    this.refresh();
};

Window_Location.prototype.windowWidth = function() {
    return 360;
};

Window_Location.prototype.windowHeight = function() {
    return this.fittingHeight(1);
};

Window_Location.prototype.open = function() {
    this.refresh();
	Window_Base.prototype.open.call(this);
};

Window_Location.prototype.refresh = function() {
    this.contents.clear();
        var width = this.contentsWidth();
        this.drawText($gameMap.displayName(), 0, 0, width, 'left');
};

//=====================================================================
// Window_MenuStatus
//=====================================================================
Window_MenuStatus.prototype.itemHeight = function() {
    var clientHeight = this.height - this.padding * 2;
    if (actorBoxH == 0){return Math.floor(clientHeight / this.numVisibleRows())}
    else {return actorBoxH}
};
 
Window_MenuStatus.prototype.drawItem = function(index) {
    this.drawItemBackground(index);
    if(showActorFace == 'True'){this.drawItemImage(index);}
    this.drawItemStatus(index);
};

//=====================================================================
// Window_Status
//=====================================================================

Window_Status.prototype.drawBlock2 = function(y) {
    if (showActorFaceInfo == 'True'){this.drawActorFace(this._actor, 12, y);}
    this.drawBasicInfo(204, y);
    this.drawExpInfo(456, y);
};
