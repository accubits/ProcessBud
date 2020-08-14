/**
* ====== Enumerations and constants ======
* \\
* The global object 'e' gathers all constants and enumerations which can be used within functions and languagctx.
* 
*
*/

/**
* Enumeration object 
* @class ctx
* @path ctx
*/
var ctx = {};

/**
* Standard action list
* @description
* __Ex.:__
<code javascript> if (action === ctx.action.ACTIVATE) {...} </code>
* @enumeration ctx.action
* @enum {string}
* @path ctx.action
* @readonly
*/
ctx.action = {
    ACTIVATE: 'ACTIVATE',
    GETVALUE: 'GETVALUE',
    SETFOCUS: 'SETFOCUS',
    SETVALUE: 'SETVALUE'
};

/**
* Standard error list
* @description
* __Ex.:__
<code javascript> return ctx.error.OK; </code>
* @enumeration ctx.error
* @enum {number}
* @path ctx.error
* @readonly
*/
ctx.error = {
	OK : 0,
	Fail : -10042
}

///**
//* Event collection
//* @class event
//* @path ctx.event
//* @readonly
//*/
ctx.event = {}

/**
 * Technical event for an application
 * @description
 * __Ex.:__
<code javascript>
GLOBAL.events.START.on(function (ev) {function(ev) { ... });
</code>
* @enumeration ctx.event.application
* @enum {string}
* @path ctx.event.application
* @readonly
*/
ctx.event.application = {
	START : 'START',
	INIT : 'INIT',
	QUIT : 'QUIT',
	END : 'END'
}

/**
* Technical event for an item
* @description
* __Note:__ a TRACK_EVENT should habe been set on the item to trigger the event
*
* __Ex.:__
<code javascript>
LinkedIn.pHomctx.btDetails.events.COMMAND.on(function(ev) { ... });
</code>
* @enumeration ctx.event.item
* @enum {string}
* @path ctx.event.item
* @readonly
*/
ctx.event.item = {
	SETFOCUS : 'SETFOCUS',
	KILLFOCUS : 'KILLFOCUS',
	ENABLE : 'ENABLE',
	DISABLE : 'DISABLE',
	COMMAND : 'COMMAND',
	UPDATE : 'UPDATE',
	SCROLL : 'SCROLL',
	CLICK : 'CLICK',
	RCLICK : 'RCLICK',
	DBLCLICK : 'DBLCLICK',
	DBLCLK : 'DBLCLK',
	RDBLCLICK : 'RDBLCLICK'
}

/**
* Technical event for a page
* @description
* __Ex.:__
<code javascript>
LinkedIn.pHomctx.events.LOAD.on(function(ev) { ... });
</code>
* @enumeration ctx.event.page
* @enum {string}
* @path ctx.event.page
* @readonly
*/
ctx.event.page = {
	LOAD : 'LOAD',
	UNLOAD : 'UNLOAD',
	ACTIVATE : 'ACTIVATE',
	ENABLE : 'ENABLE',
	DISABLE : 'DISABLE',
	SHOW : 'SHOW',
	HIDE : 'HIDE',
	UPDATE : 'UPDATE',
	SCROLL : 'SCROLL',
	SIZE : 'SIZE',
	RESIZE : 'RESIZE',
	MENUPOPUP : 'MENUPOPUP',
	CHANGE : 'CHANGE'
}

/**
* File encoding (Ascii, UTF-8, ...)
* @description
* __Ex.:__
<code javascript>
var file = '...';
var txt = ctx.fso.filctx.read(file, ctx.fileEncoding.UTF8);
</code>
* @enumeration ctx.fileEncoding
* @enum {string}
* @path ctx.fileEncoding
* @readonly
*/
ctx.fileEncoding = {
	ASCII : 'Windows-1252',
	UTF8 : 'utf-8',
	UTF16 : 'utf-16'
}

/**
* Special keyboard keys (Shift, Ctrl, F1, F2, ...)
* @description
* __Ex.:__
<code javascript>
// send Ctrl+F12 shortcut
TestHllApi.pSchedulctx.keyStroke(ctx.key.Ctrl + ctx.key.F12); 
</code>
* @enumeration ctx.key
* @enum {string}
* @path ctx.key
* @readonly
*/
ctx.key = {
	Add : '_Add_',
	Alt : '_Alt_',
	Attn : '_Attn_',
	Back : '_Back_',
	BackTab : '_BackTab_',
	Clear : '_Clear_',
	ContextMenu : '_ContextMenu_',
	Ctrl : '_Ctrl_',
	Decimal : '_Decimal_',
	Del : '_Del_',
	Divide : '_Divide_',
	Down : '_Down_',
	End : '_End_',
	Enter : '_Enter_',
	Erase : '_Erase_',
	Esc : '_Esc_',
	F1 : '_F1_',                             
	F2 : '_F2_',
	F3 : '_F3_',
	F4 : '_F4_',
	F5 : '_F5_',
	F6 : '_F6_',
	F7 : '_F7_',
	F8 : '_F8_',
	F9 : '_F9_',
	F10 : '_F10_',
	F11 : '_F11_',
	F12 : '_F12_',
	F13 : '_F13_',
	F14 : '_F14_',
	F15 : '_F15_',
	F16 : '_F16_',
	F17 : '_F17_',
	F18 : '_F18_',
	F19 : '_F19_',
	F20 : '_F20_',
	F21 : '_F21_',
	F22 : '_F22_',
	F23 : '_F23_',
	F24 : '_F24_',
	Home : '_Home_',
	Insert : '_Insert_',
	Left : '_Left_',
	Multiply : '_Multiply_',
	NumEnter : '_NumEnter_',
	PA1 : '_PA1_',                             
	PA2 : '_PA2_',                             
	PA3 : '_PA3_',                             
	PageDown : '_PageDown_',
	PageUp : '_PageUp_',
	Pause : '_Pause_',
	PrintScreen : '_PrintScreen_',
	Reset : '_Reset_',
	Right : '_Right_',
	ScrollLock : '_ScrollLock_',
	Shift : '_Shift_',
	Space : ' ',
	Substract : '_Substract_',
	Tab : '_Tab_',
	Up : '_Up_'
}

/**
* Standard message types
* @enumeration ctx.message
* @enum {string}
* @path ctx.message
* @readonly
*/
ctx.message = {
	Action: 'ACTION',
	Action2: 'ACTION2',
	BootstrapInjectDone: 'BOOTSTRAP_INJECT_DONE',
	ContentReady: 'CONTENT_READY',
	Couplage: "COUPLAGE",
	CapturePage: "CAPTURE_PAGE",
	CaptureScreen: "CAPTURE_SCREEN",
	CaptureSource: "CAPTURE_SOURCE",
	CaptureAppli: "CAPTURE_APPLI",
	PreviewScreen: "PREVIEW_SCREEN",
	Decouplage: "DECOUPLAGE",
	CaptureAllFrames: "GETALLPAGES",
	CaptureFrame: "GETONEPAGE",
	FrameCaptureResult: 'FRAMECAPTURE_RESULT',
	FrameIdentification: 'FRAME_IDENTIFICATION',
	Event: 'CTX_EVENT',
	PilotInjectDone: 'PILOTE_INJECT_DONE',
	Response: 'CTX_RESPONSE',
	WinUnload: 'WIN_UNLOAD'
};

/**
* Text scan type
* @enumeration ctx.TextScanType
* @enum {number}
* @path ctx.TextScanType
* @readonly
*/
ctx.TextScanType = { 
	FULL:0, 
	PART:1, 
	BEGINS:2, 
	ENDS:3, 
	EMPTY:4, 
	ANY:5, 
	REGEX:6 
};

/**
* Track events
* @enumeration ctx.TrackEvents
* @enum {number}
* @path ctx.TrackEvents
* @readonly
*/
ctx.TrackEvents  = { 
	SETFOCUS:1, 
	KILLFOCUS:2, 
	COMMAND:4, 
	RESIZE:8, 
	CLICK:16, 
	CHANGE:32 
};

/**
* Html type
* @enumeration ctx.TypeHtmlValue
* @enum {number}
* @path ctx.TypeHtmlValue
* @readonly
*/
ctx.TypeHtmlValue = { 
	NO_HTML:0, 
	OUTER_HTML:1, 
	INNER_HTML:2 
};
	
/**
* @class ctx.frameClass
* @struct
* @constructor
*/
ctx.frameClass = function() {
	this.type = 'ctxt_msg';
	this.direction = 'req';
	this.chromeFrameId = '';
	this.parentId = 'Extension';
	this.parentWindow = null;
	this.frameId = '';
	this.frameTitle = '';
	this.frameURL = '';
	this.frameBoundingRect = '';
	this.frameTotalWidthHeight = '';
	this.frameScrollPosition = '';
	this.frameNumber = '';
	this.pointed = false;
	this.posX = 0;
	this.posY = 0;
	this.width = 0;
	this.height = 0;
	this.frameNumberOfChildren= '';
  this.timeOutHandle= null;
	this.children = [];
};

/**
* @class ctx.brokerInfoClass
* @struct
* @constructor
*/
ctx.brokerInfoClass = function() {
	this.HwndTarget = 0; // TODO : HwndTarget or HWND !!
	this.MsgType = '';
	this.TimeStamp = '';
	this.POINTX = 0; // TODO : POINTX or PointX !!
	this.POINTY = 0; // TODO : POINTY or PointY !!
	this.X = 0;
	this.Y = 0;
	this.CX = 0;
	this.CY = 0;
};

/**
* @class ctx.pageInfoClass
* @struct
* @constructor
*/
ctx.pageInfoClass = function() {
	/** @type {number} */ this.TabId = -1;
	/** @type {number} */ this.FrameId = -1;
	/** @type {string} */ this.PageName = '';
}

/**
* @class ctx.elementResult
* @struct
* @constructor
*/
ctx.elementResult = function() {
	/** @type {Object} */ this.oTheElement = null;
	/** @type {Array<Object>} */ this.aChildElements = [];
}


/**
* @class ctx.returnValueClass
* @struct
* @constructor
*/
ctx.returnValueClass = function() {
	/** @type {Object} */ this.oTheElement = null;
	/** @type {string} */ this.strValue = '';
	/** @type {boolean} */ this.bRunning = false;
}

/**
* @class ctx.itemInfoClass
* @struct
* @constructor
*/
ctx.itemInfoClass = function() {
	/** @type {string} */ this.FullItemName = '';
	/** @type {string} */ this.NakedItemName = '';
	/** @type {ctx.descriptor.Item} */ this.Description = null;
	/** @type {boolean} */ this.bNbOccurs = false;
	/** @type {boolean} */ this.bInnerHtml = false;
	/** @type {boolean} */ this.bOuterHtml = false;
	/** @type {boolean} */ this.bListAsked = false;
	/** @type {boolean} */ this.bItemAuto = false;
	/** @type {boolean} */ this.bKeyStroke = false;
	/** @type {Array<number>} */ this.aIndexes = [];
	/** @type {Array<Object>} */ this.aElements = [];
	/** @type {ctx.returnValueClass} */ this.ReturnValue = new ctx.returnValueClass();
}

ctx.messageClass = {}

/**
* Base message class 
* @class ctx.messageClass.Base
* @constructor
*/
ctx.messageClass.Base = function (type) {
	/** @type {number} */ this.hWndSender = 0;
	/** @type {string} */ this.MsgType = type;
	/** @type {*} */ this.Result = '';
	/** @type {number} */ this.Code = ctx.error.OK;
  /** @type {Object} */ this.MsgDatas = { }
};

/**
* Base action message class 
* @class ctx.messageClass.ActionBase
* @extends {ctx.messageClass.Base}
* @constructor
*/
ctx.messageClass.ActionBase = function (type) {
	ctx.messageClass.Base.call( this, type );
  this.MsgDatas = {
		IsChrome: true,
		ActionName: '',
		RequestID: 0
	}
};


/**
* Message class for 'ACTION'
* @class ctx.messageClass.Action
* @extends {ctx.messageClass.ActionBase}
* @constructor
*/
ctx.messageClass.Action = function () {
	ctx.messageClass.ActionBase.call( this, ctx.message.Action );
  this.MsgDatas = { 
		ActionName: '',
		RequestID: 0,
		DestName: '',
		Datas : '',
		nAppliInstanceID : -1,
		nPageInstanceID : -1,
		bFakeIndex : false             // cas de m_lIndex à -1 : générer autant de [0] que nécessaire
	}                                    // m_lInstanceItem ==> POUBELLE (facile à rajouter)
};

/**
* Message class for 'ACTION2'
* @class ctx.messageClass.Action2
* @extends {ctx.messageClass.ActionBase}
* @constructor
*/
ctx.messageClass.Action2 = function () {
	ctx.messageClass.ActionBase.call( this, ctx.message.Action2 );
  this.MsgDatas = { 
		ActionName: '',
		RequestID: 0,
		Parm1: '',
		Parm2: '',
		Parm3: '',
		Parm4: '',
		Datas : '',
		nAppliInstanceID : -1,
		nPageInstanceID : -1
	}
};

/**
* Message class for 'CaptureAppli'
* @class ctx.messageClass.CaptureAppli
* @extends {ctx.messageClass.Base}
* @constructor
*/
ctx.messageClass.CaptureAppli = function () {
	ctx.messageClass.Base.call( this, ctx.message.CaptureAppli );
  this.MsgDatas = {
		FRAMEID: ''
	};
};

/**
* Message class for 'CapturePage'
* @class ctx.messageClass.CapturePage
* @extends {ctx.messageClass.Base}
* @constructor
*/
ctx.messageClass.CapturePage = function () {
	ctx.messageClass.Base.call( this, ctx.message.CapturePage);
  this.MsgDatas = {
        FRAMEID: '',
        FIELDSLIST: '',
				DOSCROLL: 'false'
	};
};

/**
* Message class for 'CaptureFrame'
* @class ctx.messageClass.CaptureFrame
* @extends {ctx.messageClass.Base}
* @param {string} [type]
* @constructor
*/
ctx.messageClass.CaptureFrame = function (type) {
	ctx.messageClass.Base.call( this, type || ctx.message.CaptureFrame );
  this.MsgDatas = new ctx.brokerInfoClass();
};

/**
* Message class for 'FrameCaptureResult'
* @class ctx.messageClass.FrameCaptureResult
* @extends {ctx.messageClass.Base}
* @constructor
*/
ctx.messageClass.FrameCaptureResult = function () {
	ctx.messageClass.Base.call( this, ctx.message.FrameCaptureResult );
  this.MsgDatas = new ctx.frameClass();
	this.FromBrokerInfos = new ctx.brokerInfoClass();
};

/**
* Message class for 'FrameIdentification'
* @class ctx.messageClass.FrameIdentification
* @extends {ctx.messageClass.Base}
* @param {string} [frameId]
* @constructor
*/
ctx.messageClass.FrameIdentification = function (frameId) {
	ctx.messageClass.Base.call( this, ctx.message.FrameIdentification );
  this.MsgDatas = {
		FrameId: frameId
	};
};

ctx.descriptor = {}

/**
* Base descriptor class 
* @class ctx.descriptor.Base
* @constructor
*/
ctx.descriptor.Base = function () {
};

/**
* Tag descriptor
* @class ctx.descriptor.Tag
* @constructor
*/
ctx.descriptor.Tag = function () {
	/** {string} */ this.TagName = '';
	/** {boolean} */ this.bDirectChildren = false;
	/** {number} */ this.Range = 0;
	/** {boolean} */ this.bOccurs = false;
	/** {boolean} */ this.bSet = false;
	/** {Object} */ this.oAttrCrit = {};
};

/**
* Item descriptor
* @class ctx.descriptor.Item
* @constructor
*/
ctx.descriptor.Item = function () {
	/** {string} */ this.ItemName = '';
	/** {boolean} */ this.bMustExist = false;
	/** {boolean} */ this.bMustNotExist = false;
	/** {boolean} */ this.bCaptData = false;
	/** {boolean} */ this.bCached = false;
	/** {string} */ this.TypObj = '';
	/** {string} */ this.Ancestor = '';
	/** {string} */ this.SetValueMethod = '';
	/** {string} */ this.GetValueMethod = '';
	/** {Object} */ this.aTags = [];
	/** {number} */ this.uiNotifs = 0;
// **MAYDO
//    caching du DescItem de l'ancestor
};

/**
* Page descriptor
* @class ctx.descriptor.Page
* @constructor
*/
ctx.descriptor.Page = function () {
	/** {string} */ this.PageName = '';
	/** {Object} */ this.oPageCrit = {};
	/** {Array<ctx.descriptor.Item>} */ this.aDescItems = [];
	/** {boolean} */ this.bMustExistItems = false;
	/** {boolean} */ this.bMustNotExistItems = false;
	/** {boolean} */ this.bCaptDataItemsCached = false;
	/** {boolean} */ this.bItemsAutosEventDatas = false;
	/** {number} */ this.uiNotifs = 0;
	/** {boolean} */ this.bSizeCrit = false;
	/** {string} */ this.OnLoadScript = '';
};
 
/**
* Application descriptor
* @class ctx.descriptor.Appli
* @constructor
*/
ctx.descriptor.Appli = function () {
	/** {string} */ this.AppliName = '';
	/** {string} */ this.ShortName = '';
	/** {Array<ctx.descriptor.Page>} */ this.aDescPages = [];
	/** {Object} */ this.oAppliCrit = {};
	/** {number} */ this.iTypeInstanceID = 0; // (0: Process, 1: Thread) sauf que LOL Chrome
	/** {number} */ this.uiAsyncDelay = 0;
};
 
