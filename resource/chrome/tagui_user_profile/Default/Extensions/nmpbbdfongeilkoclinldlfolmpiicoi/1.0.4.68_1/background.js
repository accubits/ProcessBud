// background.js
// ----------------------------------------------------------------------
// Script unique de l'extension, complètement indépendant
// des fenêtres, onglets et autres frames.
//
// Manuel 02/2016
//
// version 0.1 : début mise en place architecture dialogue avec broker
// version 0.2 : réception OK de demande de "REQUEST" (studio) et "COUPLAGE" 
// version 0.3 : "COUPLAGE" brodcasté aux 'content'
// version 0.4 : Envoi message vers Contextor
// version 0.5 : gestion END
// -------------------------------------------------------------------------

// On pourrait utiliser le "module patern", en particulier s'il s'avère qu'il
// y a en fait PLUSIEURS scripts utilisés dans le contexte "background", mais
// pour l'instant, NON (et ça repose !)
// --------------------------------------------------------------------------

"use strict";
// FIX_CONS console.info("background.js Started");

// __CtxChrExtBack : namespace global du connecteur pour la partie Background
var __CtxChrExtBack = (function( ) {

	// instanciation du singleton
	// --------------------------
	var self = {};
	
	var PerfStartBase = performance.timing.navigationStart;
	
	var oManifest = chrome.runtime.getManifest(); // pour connaître Browser
	var bIsChrome = false;
	var strDescription = oManifest.description;
	if ( strDescription.indexOf( "Chrome" ) !== -1 ) bIsChrome = true;
	// FIX_CONS console.info( "Browser is " + ( bIsChrome ? "" : "NOT " ) + "Chrome" );
	
	var bCouplageDone = false;
	var oCouplageMsgDatas = null;
	var strHwndWeb3 = "";
	var nNextNewInstanceAppliID = ( bIsChrome ? +10001 : +20001 );
	var nNextNewInstancePageID = ( bIsChrome ? +1000 : +5000 );
	var oAssocTabs = {}; // "tableau" associatif (sur tab.id) des tabs connus
	                     // chaque Objet "TAB" contient :
						 //   * un "tableau" associatif (sur frameId) des frames connues, nommé oAssocFrames
						 //     Chaque Objet "Frame" contient :
						 //        * un "tableau" associatif (sur PageName) des pages connues, nommé oAssocPages
						 //          Chaque Objet "Page" contient :
						 //            * une property donnant l'instance ID de la page, nommée nPageInstanceID
						 //            * une property donnant le nom d'appli, nommée AppliName
						 //        * une property donnant le nombre de page connue dans la Frame, genre ASSERT(acount == 1),
						 //          nommée PageCount
						 //   * un "tableau" associatif (sur AppliName) des appli "still living", nommés oAssocLivingApplis
						 //     Chaque Objet (Living Appli) est à son tour un tableau associatif de Frames ID.
						 //   * une property donnant l'instance unique de toutes les applis du Tab, nommée nAppliInstanceID
						 //   * une property nommée bIsTabRemoved, pour faire END au premier UNLOAD
						 
	var oAssocTabsLivingAppli = {}; // "tableau" associatif (sur tab.id) des tabs connus avec couples AppliName/AppliInstID

	// lancement du broker. Après étude/tests (15/11/2016) je décide de garder des noms
	// de canaux spécifiques à chauque Browser CAR :
	//    1) la nouvelle extension "multi-browser" doit continuer à marcher avec un vieux MSI 3.1.1
	//    2) Chrome signale une erreur sur le nom du canal en asynchrone ! (par appel de la CallBack onDisconnect)
	//    3) Firefox signale une erreur sur le nom de canal par une exception, synchrone donc...
	//    4) Il est certainement possible de gérer tout ça avec divers code paths et flags, mais NON !
	// -----------------------------------------------------------------------------------------------------------
	var strChannelName = ( bIsChrome ?
	                       "contextor.chrome.extension.broker.messaging" :
						   "contextor.firefox.extension.broker.messaging" );
	// FIX_CONS console.info( "About to Connect to Broker with Name " + strChannelName );
	var BrokerPort;
	try {
		BrokerPort = chrome.runtime.connectNative( strChannelName );
	} catch ( e ) {
		// FIX_CONS console.error( "Exception in chrome.runtime.connectNative" + e );
	} // end try..catch
	// FIX_CONS console.info( "chrome.runtime.connectNative called" );

	var CTXLV = Object.freeze( { INFO:0, WARN:1, ERRO:2 } );
	//var CHROME_ERROR = -10042;
	//var CHROME_OK = 0;

	// Envoi au "Trace Viewer" via le Broker
	// **MAYDO : gérer les Traces Levles en cours (être prévenus par le Broker)
	// **MAYDO : doubler avec Console
	// ------------------------------------------------------------------------
	self.Trace = function( nLevel, strMessage ) {
		var strMsgType = "TRACE";
		var strHwnd; // LOL
		switch ( nLevel ) {
			case CTXLV.INFO: strHwnd = "0"; break;
			case CTXLV.WARN: strHwnd = "1"; break;
			case CTXLV.ERRO: strHwnd = "2"; break;
			default: // FIX_CONS console.error( "**CTXB Trace: Bad Level " + nLevel ); return;
		} // end switch
		self.MessageToBroker( strHwnd, strMsgType, strMessage );
	}

	// **TODO build a uniqueID, le faire porter par les message, et poubelliser dans 2 cas
	//     * dans content: poubelle si même ID, silent redo si ID <>
	//     * dans background (id porté par TOUT message entrant) : poubelle si <>
	// manuel 15/04/2016 : ajout d'une chaîne version dans les datas : les datas
	// deviennent MAINTENANT un OBJET au format suivant:
	// {
	//   "aDescApplis : [ blabla blabla ]
	//   "strEngineVersion": "3.1.1.0",
	// }
	self.DoCouplage = function( message ) {
		if ( bCouplageDone ) {
			// FIX_CONS console.warn( "**CTXB DoCouplage : Already coupled. Redo" );
			self.Trace( CTXLV.WARN, "**CTXB DoCouplage : Already coupled. Redo" );
		} // endif
		bCouplageDone = true;
		oCouplageMsgDatas = message.MsgDatas;
		strHwndWeb3 = message.hWndSender;
		oAssocTabs = {}; // Hum... (ben SI! manuel 01/03/2016)
		oAssocTabsLivingAppli = {};
		/**** Super verbeux *****
		// FIX_CONS console.log( "**CTXB: COUPLAGE JSON DUMP: %s", JSON.stringify( message.MsgDatas ) );
		**********/
		// passer le bouzin aux contents
		// Deux méthodes possibles :
		//   1) Maintenir une liste des "contents" qui se sont signalés
		//      au start, ce qui implique ménage au end et trafics tout
		//      le temps, même quand contextor pas lancé...
		//   2) juste "énumérer" les tabs, broadcaster, et BASTA.
		// Obviously, méthode 2 super plus sympa (pour l'instant, 24/02/2016)
		// ------------------------------------------------------------------
		chrome.tabs.query( {}, function( tabs ) {
			// un tableau de tous les tabs
			// ---------------------------
			for ( var index = 0; index < tabs.length; ++index ) {
				var OneTab = tabs[ index ];
				if ( OneTab.url.startsWith( "chrome://" ) ) continue;
				self.SendMessageToOneTab( OneTab, message );
			} // end for
		});
		
		// envoi message VERSION lors du couplage
		try {
			/*** Maintenant fait à l'init
			var manifest = chrome.runtime.getManifest();
			***/
			var MsgDatas = { 
				EventName : 'VERSION',
				AppliName : ( bIsChrome ? 'CxAppChrome' : 'CxAppFireFox3' ),
				AppliInstance : 0,
				PageName  : oManifest.version,
				PageInstance  : 0,
				ItemName  : "",
				ObjectData: ""
			};
			var strFlatMessage = self.BuildFlatMessage( MsgDatas.AppliName, MsgDatas.EventName, MsgDatas.PageName,
		                                       MsgDatas.ItemName, 0, MsgDatas.AppliInstance, MsgDatas.PageInstance, MsgDatas.ObjectData );
			self.MessageToBroker( message.hWndSender, ctx.message.Event, strFlatMessage );
		} catch (ex) {	}		
		return;
	} // DoCouplage

	self.DoDeCouplage = function( message ) {
		if ( bCouplageDone === false ) {
			// FIX_CONS console.warn( "**CTXB DoDeCouplage : NOT coupled. Aborting" );
			return;
		} // endif
		bCouplageDone = false;
		oCouplageMsgDatas = null;
		if ( strHwndWeb3 != message.hWndSender ) {
			// FIX_CONS console.warn( "**CTXB DoDeCouplage : coupled to ANOTHER HWND. Resuming" );		
		} // endif
		strHwndWeb3 = "";
		oAssocTabs = {};
		oAssocTabsLivingAppli = {};
		// prévenir les contents
		// ---------------------
		chrome.tabs.query( {}, function( tabs ) {
			// un tableau de tous les tabs
			// ---------------------------
			for ( var index = 0; index < tabs.length; ++index ) {
				var OneTab = tabs[ index ];
				if ( OneTab.url.startsWith( "chrome://" ) ) continue;
				self.SendMessageToOneTab( OneTab, message );
			} // end for
		});
		return;
	} // DoDeCouplage

	self.SendMessageToOneTab = function( OneTab, message ) {
		// FIX_CONS console.info( "**CTXB: SendMessageToOneTab : Sending %s to tab id %d, URL %s", message.MsgType, OneTab.id, OneTab.url );
		chrome.tabs.sendMessage( OneTab.id, message );
	}
	
	self.SendMessageToOneFrameInOneTab = function( OneTab, frameId, message ) {
		// FIX_CONS console.info( "**CTXB: SendMessageToOneFrameInOneTab : Sending %s to tab id %d, Frame %d, URL %s",
		// FIX_CONS              message.MsgType, OneTab.id, frameId, OneTab.url );
		chrome.tabs.sendMessage( OneTab.id, message, {frameId: frameId} );
	}
	
	// Variante juste avec l'identifiant du TAB, quand on n'a mémorisé que lui
	self.SendMessageToOneFrameInOneTabId = function( PageInfos, message ) {
		// FIX_CONS console.info( "**CTXB: SendMessageToOneFrameInOneTabId : Sending %s to tab id %d, Frame %d", message.MsgType, PageInfos.TabId, PageInfos.FrameId );
		chrome.tabs.sendMessage( PageInfos.TabId, message, {frameId: PageInfos.FrameId} );
	}

	/**
	* @param {number} nAppliInstanceID
	* @param {number} nPageInstanceID
	* @param {ctx.pageInfoClass} PageInfos
	*/
	self.FindPageInfosByIDs = function( nAppliInstanceID, nPageInstanceID, PageInfos ) {
		
		for( var strTabId in oAssocTabs ) {
			if ( oAssocTabs[ strTabId ].nAppliInstanceID !== nAppliInstanceID ) continue;
			var oOneTab = oAssocTabs[ strTabId ];		
			// parcours des frames
			// -------------------
			for( var strFrameId in oOneTab.oAssocFrames ) {
				var OneFrame = oOneTab.oAssocFrames[ strFrameId ];
				// parcours des pages : c'est en gros inutile de supposer du
				// multi-page dans une frame, sauf que je laisse ça comme ça
				// pour peut être un jour les pages "filles"
				// ---------------------------------------------------------
				for( var strPageName in OneFrame.oAssocPages ) {
					var OnePage = OneFrame.oAssocPages[ strPageName ];
					// THE TEST
					// --------
					if ( OnePage.nPageInstanceID === nPageInstanceID ) {
						PageInfos.PageName = strPageName;
						PageInfos.TabId = parseInt(strTabId, 10);
						PageInfos.FrameId = parseInt(strFrameId, 10);
						return true;
					} // endif
				} // end for
			} // end for
		} // endif
		
		// NOT FOUND
		// ---------
		return false;
		
	} // FindPageByIDs


	/***************************************************
	* Method DoResponse
	* @method self.DoResponse
	* @param {ctx.messageClass.ActionBase} oMsg
	* @return {boolean}
	******************************************************/
	self.DoResponse = function( oMsg ) {
		
		// Message en gros comme d'habitude SAUF que la partie
		// DATAS est composée de QUATRE parties : le rappel du verbe,
		// un RequestID, un code retour numérique PUIS les vraies datas
		// ------------------------------------------------------------
		if (oMsg.Result === undefined) oMsg.Result = '';
		if (oMsg.Code === undefined) oMsg.Code = ctx.error.OK;
		var strDatas = (typeof oMsg.Result === 'object' ? JSON.stringify(oMsg.Result) : oMsg.Result);
		strDatas = oMsg.MsgDatas.ActionName + "," + oMsg.MsgDatas.RequestID + "," + oMsg.Code + "," + strDatas;
		self.MessageToBroker( oMsg.hWndSender, ctx.message.Response, strDatas );
		return true;
	}
	
	/***************************************************
	* Method AnswerError
	* @method AnswerError
	* @param {string} strError
	* @param {ctx.messageClass.ActionBase} oMsg
	* @param {string} [strItemName]
	******************************************************/
	self.AnswerError = function(strError, oMsg, strItemName) {
		var strResult = "Error Chrome [" + oMsg.MsgDatas.ActionName + "] " + oMsg.MsgDatas.PageName + (strItemName ? "." + strItemName : "") + ": " + strError;
		oMsg.Code = ctx.error.Fail;
		oMsg.Result = strResult;
		self.DoResponse(oMsg);
		return false;
	}

	self.Do = {};

	/***************************************************
	* @method Do.ACTIVATE
	* @param {ctx.messageClass.Action} msgAction
	* @param {ctx.pageInfoClass} PageInfos
	* @return {boolean}
	******************************************************/
	self.Do.ACTIVATE = function( msgAction, PageInfos ) {
		try {
			chrome.tabs.update(PageInfos.TabId, { active: true }, function (tab) {
				try {
					chrome.windows.update( tab.windowId, { "focused":true }, function () {
						self.DoResponse( msgAction );
					});
				} catch (ex) {
					return self.AnswerError(msgAction.MsgDatas.ActionName + " failed: " + ex.message, msgAction, "");
				}
			});
		} catch (ex) {
			return self.AnswerError(msgAction.MsgDatas.ActionName + " failed: " + ex.message, msgAction, "");
		}
		return true;
	}

	/***************************************************
	* @method Do.CLOSE
	* @param {ctx.messageClass.Action2} msgAction2
	* @param {ctx.pageInfoClass} PageInfos
	* @return {boolean}
	******************************************************/
	self.Do.CLOSE = function( msgAction2, PageInfos ) {
		try {
			chrome.tabs.remove(PageInfos.TabId, function () {
				self.DoResponse( msgAction2 );
			})
		} catch (ex) {
	    return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
		}
		return true;
	}

	/***************************************************
	* @method Do.CUSTOMIZE
	* @param {ctx.messageClass.Action2} msgAction2
	* @param {ctx.pageInfoClass} PageInfos
	* @return {boolean}
	******************************************************/
	self.Do.CUSTOMIZE = function( msgAction2, PageInfos ) {
		try {
			var object = msgAction2.MsgDatas.Parm1 || "";
			var method = msgAction2.MsgDatas.Parm2 || "";
			var sOptions = msgAction2.MsgDatas.Parm3 || "{}";
			if ((typeof object !== 'string') || (!chrome[object]))
		    return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: invalid object", msgAction2, "");
			if ((typeof object !== 'string') || (typeof chrome[object][method] !== 'function'))
		    return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: invalid method", msgAction2, "");
			var options = JSON.parse(sOptions);
			if (typeof options !== 'object')
		    return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: invalid parameters", msgAction2, "");
			var hasCallback = false;
			var args = [];
			for (var id in options) {
				if (String(options[id]).toLowerCase() == '_tabid_') {
					args.push(PageInfos.TabId)
				} else if (String(options[id]).toLowerCase() == '_callback_') {
					hasCallback = true;
					args.push(function() { return self.DoResponse( msgAction2 ); })
				} else {
					args.push(options[id]);
				}
			}
			// call the method
			chrome[object][method].apply(this, args);
			if (!hasCallback) {
				return self.DoResponse( msgAction2 ); 
			}
		} catch (ex) {
	    return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
		}
		return true;
	}

	/***************************************************
	* @method Do.SETPOS
	* @param {ctx.messageClass.Action2} msgAction2
	* @param {ctx.pageInfoClass} PageInfos
	* @return {boolean}
	******************************************************/
	self.Do.SETPOS = function( msgAction2, PageInfos ) {
		try {
			var X = parseInt(msgAction2.MsgDatas.Parm1, 10);
			var Y = parseInt(msgAction2.MsgDatas.Parm2, 10);
			var CX = parseInt(msgAction2.MsgDatas.Parm3, 10);
			var CY = parseInt(msgAction2.MsgDatas.Parm4, 10);
			chrome.tabs.get(PageInfos.TabId, function(tab) {
				try {
					var oParams = {};
					if ( isNaN( X )  === false ) oParams.left   = X;
					if ( isNaN( Y )  === false ) oParams.top    = Y;
					if ( isNaN( CX ) === false ) oParams.width  = CX;
					if ( isNaN( CY ) === false ) oParams.height = CY;
					chrome.windows.update(tab.windowId, oParams, function () {
						self.DoResponse( msgAction2 );
					});
				} catch (ex) {
					self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
				}
			});
		} catch (ex) {
			return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
		}
		return true;
	}

	/***************************************************
	* @method Do.SETSTYLEWIN
	* @param {ctx.messageClass.Action2} msgAction2
	* @param {ctx.pageInfoClass} PageInfos
	* @return {boolean}
	******************************************************/
	self.Do.SETSTYLEWIN = function( msgAction2, PageInfos ) {
		try {
			var DaNewState;
			if ( msgAction2.MsgDatas.Parm1 === "WS_MAXIMIZE" ) {
				DaNewState = "maximized";
			} else if ( msgAction2.MsgDatas.Parm1 === "WS_MINIMIZE" ) {
				DaNewState = "minimized";
			} else {
				return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: Bad Parameter", msgAction2, "");
			}
			chrome.tabs.get(PageInfos.TabId, function(tab) {
				try {
					chrome.windows.update( tab.windowId, { "state":DaNewState }, function () {
						self.DoResponse( msgAction2 );
					});
				} catch (ex) {
					self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
				}
			});
		} catch (ex) {
			return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
		}
		return true;
	}

	///***************************************************
	//* @method Do.SETTEXT
	//* @param {ctx.messageClass.Action2} msgAction2
	//* @param {ctx.pageInfoClass} PageInfos
	//* @return {boolean}
	//******************************************************/
	//self.Do.SETTEXT = function( msgAction2, PageInfos ) {
	//	try {
	//		var text = msgAction2.MsgDatas.Parm1;
	//  	chrome.tabs.update(PageInfos.TabId, { 
	//				title: text
	//			}, function () {
	//				DoResponse( msgAction2 );
	//			}
	//		);
	//	} catch (ex) {
	//    return AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
	//	}
	//}

	/***************************************************
	* @method Do.TOPMOST
	* @param {ctx.messageClass.Action2} msgAction2
	* @param {ctx.pageInfoClass} PageInfos
	* @return {boolean}
	******************************************************/
	self.Do.TOPMOST = function( msgAction2, PageInfos ) {
		try {
			/** @type {boolean} */ var topmost = (msgAction2.MsgDatas.Parm1 == "NO" ? false : true);
			// première version : reprise de la logique de VISIBLE. Nota : la mise à
			// jour de la propriété "alwaysOnTop" de l'Objet "Window" NE fonctionne PAS
			// ------------------------------------------------------------------------
			chrome.tabs.update(PageInfos.TabId, { active: true }, function (tab) {
				try {
					if ( typeof tab.title === "undefined" ) {
						self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: Unable to get Tab Title", msgAction2, "");
						return;
					} // endif
					try {
						chrome.windows.update( tab.windowId, { "focused":true }, function () {
							msgAction2.Result = ( topmost === false ? "0" : "1" ) + tab.title + " - Google Chrome";
							self.DoResponse( msgAction2 );
						});
					} catch (ex) {
						self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
					}
				} catch (ex) {
					self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
				}
			});
		} catch (ex) {
			return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
		}
		return true;
	}

	/***************************************************
	* @method Do.VISIBLE
	* @param {ctx.messageClass.Action2} msgAction2
	* @param {ctx.pageInfoClass} PageInfos
	* @return {boolean}
	******************************************************/
	self.Do.VISIBLE = function( msgAction2, PageInfos ) {
		try {
			var show = (msgAction2.MsgDatas.Parm1 == 'NO' ? false : true);
			var target = msgAction2.MsgDatas.Parm2;
			switch (target) {
				case 'ADRESSBAR':
				case 'MENUBAR':
				case 'STATUSBAR':
				case 'TOOLBAR':
					// TODO (ouais bah je vois pas trop comment, hein ?)
					return self.AnswerError( msgAction2.MsgDatas.ActionName + " : not implemented for Target " + target, msgAction2, "");
				default: {
					// Première version manuel 11 avril 2016 ici, on ne fait que FORCER un ACTIVATE, puis on
					// répond au Broker en DONNANT en paramètre le Title de l'onglet (dans la valeur de "retour")
					// **TODO si DEUX onglets ouverts avec même TITLE dans DEUX windows différentes : **PROBLÈME**
					// -------------------------------------------------------------------------------------------
					chrome.tabs.update(PageInfos.TabId, { active: true }, function (tab) {
						try {
							if ( typeof tab.title === "undefined" ) {
								self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: Unable to get Tab Title", msgAction2, "");
								return;
							} // endif
							try {
								chrome.windows.update( tab.windowId, { "focused":true }, function () {
									msgAction2.Result = ( show === false ? "0" : "1" ) + tab.title + " - Google Chrome";
									self.DoResponse( msgAction2 );
								});
							} catch (ex) {
								self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
							}
						} catch (ex) {
							self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
						}
					});
					break;
				} // default
			} // end switch target
		} catch (ex) {
			return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
		}
		return true;
	}


	/***************************************************
	* Method DoAction
	* @method self.DoDoAction
	* @param {ctx.messageClass.ActionBase} msg
	* @return {boolean}
	******************************************************/
	self.DoAction = function( msg ) {
		
		// Extrait documentation Chrome Broker pour le message
		// Format de l'objet JavaScript

		// trouver le couple tab/frame à qui router la demande
		// ---------------------------------------------------
		var nAppliInstanceID = msg.MsgDatas.nAppliInstanceID;
		var nPageInstanceID  = msg.MsgDatas.nPageInstanceID;
		
		var PageInfos = new ctx.pageInfoClass();
		var bFound = self.FindPageInfosByIDs( nAppliInstanceID, nPageInstanceID, PageInfos );
		if ( bFound === false ) {
			// tout de suite répondre par erreur CXWEB3_ERROR_BHO_PAGENOTFOUND
			// Sauf qu'on ne va PAS s'ammuser à reprendre toute la nomenclature
			// des codes erreurs du code C++. Donc ça va être un nouveau code
			// négatif générigue, le grand, le beau, le magnifique -10042
			// ----------------------------------------------------------------
			msg.Result = "Page " + nAppliInstanceID + " NOT found for Appli " + nAppliInstanceID + " for Action " + msg.MsgDatas.ActionName;
			// FIX_CONS console.error( "**CTXB DoAction : " + msg.Result );
			self.Trace( CTXLV.ERRO, "**CTXB DoAction : " + msg.Result );
			msg.Code = ctx.error.Fail;
			return self.DoResponse( msg );
		} // endif
		
		// **TODO ENRICHISSEMENT MESSAGE AVEC UNIQUEID POUR CHECK PILOTE
		// -------------------------------------------------------------
		// Pour l'instant, ajout du PageName (reste à ajouter : AppliName et uniqueID)
		// --------------------------------------------------------------------------
		msg.MsgDatas.PageName = PageInfos.PageName;
		msg.MsgDatas.IsChrome = bIsChrome;
		
		if ( msg.MsgDatas.ActionName && (typeof self.Do[msg.MsgDatas.ActionName] === 'function') ) {
			// call the action to handle the verb
			return self.Do[msg.MsgDatas.ActionName].call(null, msg, PageInfos);
		} else {
			// GO : routage vers le couple tab/frame
			// -------------------------------------
			self.SendMessageToOneFrameInOneTabId( PageInfos, msg );
		}

		return true;
	} // DoAction

	// écoute du Broker
	// ----------------
	BrokerPort.onMessage.addListener( function( message ) {
		// **TODO check format, exception etc...
		// FIX_CONS console.info( "**CTXB Message from Broker : %s", message.MsgType );
		switch( message.MsgType ) {
			case ctx.message.Couplage:
				self.DoCouplage( message );
				break;
			case ctx.message.Decouplage:
				self.DoDeCouplage( message );
				break;
			case ctx.message.CapturePage:
				self.DoCapturePage( message );
				break;
			case ctx.message.CaptureScreen:
				self.DoCaptureScreen( message );
				break;
			case ctx.message.PreviewScreen:
				self.DoPreviewScreen( message );
				break;
			case ctx.message.CaptureSource:
				self.DoCaptureSource( message );
				break;
			case ctx.message.CaptureAppli:
				self.DoCaptureAppli( message );
				break;
			case ctx.message.CaptureAllFrames:
				self.DoCaptureAllFrames( message );
				break;
			case ctx.message.CaptureFrame:
				self.DoCaptureFrame( message );
				break;
		  case ctx.message.Action2:
		  case ctx.message.Action:
				self.DoAction( message );
				break;
			default:
				// FIX_CONS console.error( "**CTXB Unknown Message Type %s from Broker : Trashing", message.MsgType );
				self.Trace( CTXLV.ERRO, "**CTXB Unknown Message Type [" + message.MsgType + "] from Broker : Trashing" );
		} // end switch
		return;		
	});

	BrokerPort.onDisconnect.addListener( function() {
		// FIX_CONS console.info( "**CTXB Broker onDisconnect : " + chrome.runtime.lastError.message );
		BrokerPort = null;
	});

	// Surveillance des Tabs : première version 29/02/2016 : tout le temps et pour
	// toujours, donc pas de problèmes à gérer sur couplage/découplage
	// Quand on a reçu un CONTENT_READY pour un TAB invisible d'index -1 (pre-load)
	// ON A RIEN FAIT (de toute façon, ça ne sert à rien, je n'ai jamais réussi
	// à obtenir de LOAD de ces tabs invisibles, peut être parce que l'état du
	// document RESTE à "loading") Par contre, quand le tab devient finalement
	// un vrai Tab, soit il génére A NOUVEAU un CONTENT_READY, soit je reçois
	// un event onReplaced. si le "added" a bien un index >= 0, je fais comme
	// si c'était le CONTENT_READY d'origine
	// ---------------------------------------------------------------------------
	chrome.tabs.onRemoved.addListener( function( tabId, removeInfo ) {
		if ( bCouplageDone === false ) return;
		// ATTENTION : si une fermeture de TAB a lieu JUSTE après un couplage
		// ON VA DIRE ERREUR : IL FAUDRAIT UNE ÉCOUTE TAB PAR TAB ??? SUR QUEL EVENT ??? **TODO
		// FIX_CONS console.info( "**CTXB tabs.onRemoved : tabid %d, removeInfo %s", tabId, JSON.stringify( removeInfo ) );
		// je dois générer le ou les END. Problème : comment retrouver le nom d'appli ?
		// donc je dois maintenir une liste des "applis vivantes" : c'est une liste
		// de tab, avec pour chaque tab l'instanceID du TAB (et LE ou LES noms d'applis)
		// "autres END" envisageables :
		//     * UNLOAD de main frame suite à WIN_UNLOAD et non pas suite à critères : NON car potentiels AUTRES UNLOAD derrière
		//     * CHANGEMENT APPLI de main frame : OUI ==> "END" de toutes AUTRES applis de l'onglet
		// ---------------------------------------------------------------------------------------------------------------------
		// Recherche du TAB
		// ----------------
		if ( typeof oAssocTabs[ tabId ] === "undefined" ) {
			// Oui, BON. Pour l'instant, je laisse mais AUCUNE raison que je sois sensé connaître TOUS les Tabs, hein ?
			// --------------------------------------------------------------------------------------------------------
			// FIX_CONS console.warn( "**CTXB tabs.onRemoved : UNKNOWN tabid %d, removeInfo %s", tabId, JSON.stringify( removeInfo ) );
			return;
		} // endif
		var oTheTab = oAssocTabs[ tabId ];
		// Faire un UNLOAD "TECHNIQUE" NON VU PAR LE WORK MANAGER POUR purger
		// les tables internes de WEB3 dans CtxtRun.exe, AFIN QUE LES "END"
		// d'APPLIs ne soient pas purement et simplement poubellisés avec le
		// fallacieux pretexte "Appli Still Living"
		// ------------------------------------------------------------------
		for( var strFrameId in oTheTab.oAssocFrames ) {
			var OneFrame = oTheTab.oAssocFrames[ strFrameId ];
			for( var strPageName in OneFrame.oAssocPages ) {
				var OnePage = OneFrame.oAssocPages[ strPageName ];
				var strFlatMessage = self.BuildFlatMessage( OnePage.AppliName, "UNLOAD_TECH", strPageName, "",
				                                       0, oTheTab.nAppliInstanceID, OnePage.nPageInstanceID, "" );
				self.MessageToBroker( strHwndWeb3, ctx.message.Event, strFlatMessage );
				// **MAYDO : ménage page ? Bof.
			} // enf for
			// **MAYDO : ménage Frame ? Bof.
		} // end for
		
		// faire END pour chaque appli existante
		// -------------------------------------
		for( var strAppliName in oTheTab.oAssocLivingApplis ) {
			// GO !
			// ----
			var strFlatMessage = self.BuildFlatMessage( strAppliName, "END", "", "", 0, oTheTab.nAppliInstanceID, 0, "" );
			self.MessageToBroker( strHwndWeb3, ctx.message.Event, strFlatMessage );
			delete oTheTab.oAssocLivingApplis[ strAppliName ]; // bof 
		} // end for
		
		// Virer le TAB, tant qu'à faire !
		// -------------------------------
		delete oAssocTabs[ tabId ];
		
	});

	chrome.tabs.onReplaced.addListener( function( addedTabId, removedTabId ) {
		// FIX_CONS console.info( "**CTXB tabs.Replaced : addedTabId %d, removedTabId %d", addedTabId, removedTabId );
		chrome.tabs.get( addedTabId, function( Tab ) {
			// FIX_CONS console.info( "**CTXB tabs.Replaced GET CALLBACK : addedTabId %d, INDEX %d", Tab.id, Tab.index );
			if ( Tab.index >= 0 ) {
				// **MAYDO : vérifier qu'on a BIEN reçu le READY avec la version du TAB d'index négatif ?
				if ( bCouplageDone ) {
					self.SendMessageToOneTab( Tab, { "MsgType": "COUPLAGE", "MsgDatas": oCouplageMsgDatas } );
				} // endif
			} // endif
		});
		// **TODO Flager le removed. Quand un UNLOAD arrivera sur la MAIN, FAIRE END !
		// CAR IL N'Y AURA JAMAIS DE LOAD DE REMPLACEMENT ! (il aura lieu dans UN AUTRE
		// TAB. **MAYDO : forcer le chanchement de TabID dans le tableau des tabs ?
		// ---------------------------------------------------------------------------
		var oTheTab = oAssocTabs[ removedTabId ];
		if ( typeof oTheTab !== "undefined" ) oTheTab.bIsTabRemoved = true;
	});

	/**
	* @param {string} strAppliName
	* @param {string} strEventName
	* @param {string} strPageName
	* @param {string} strItemName
	* @param {number} nItemIndex, 
	* @param {number} nAppliInstanceID, 
	* @param {number} nPageInstanceID
	* @param {string|Object} strEventData
	*/
	self.BuildFlatMessage = function( strAppliName, strEventName, strPageName, strItemName,
	                           nItemIndex, nAppliInstanceID, nPageInstanceID, strEventData ) {
		var strFlatMessage; // champs séparés par des virgules
		// Les 4 chaînes
		// -------------
		strFlatMessage = strAppliName + "," + strEventName + "," + strPageName + "," + strItemName + ",";
		// Les valeurs numériques
		// ----------------------
		strFlatMessage += nItemIndex + ",";       // Item Index
		strFlatMessage += nAppliInstanceID + ","; // Instance Appli
		strFlatMessage += nPageInstanceID + ","   // Instance Page
		strFlatMessage += "0,"                    // Instance Item
		// data
		if (typeof strEventData === 'object') { strEventData = JSON.stringify(strEventData) }
		strFlatMessage += strEventData;           // Event data
		return strFlatMessage;					   
	}

	self.LogError = function( nLevel, strMessage ) {
		self.MessageToBroker( "0", "LOGERROR", strMessage );
	}

	// API d'envoi d'un message au broker
	// Étant donné que le broker voit passer les demandes
	// de couplage/découplage en provenance de Contextor, qui
	// portent, par construction d'origine, le ou les HWND émetteurs
	// côté CtxtRun.exe, et qu'il voit aussi passer les éventuelles
	// autres "request" de provenance arbitraire (mais avec aussi UN HWND)
	// on POURRAIT imaginer de laisser le broker maintenir des listes de
	// "traitement en cours avec HWND associés", mais ça me semble inutilement
	// complexe et risqué de faire ça dans le programme qui n'est juste, comme
	// son nom l'indique, qu'un "relais/pont".
	// En conséquence (manuel 20/02/2016) le broker est déchargé de ces aspects
	// et le HWND destinataire DOIT lui être fourni, et géré par l'extension POUR
	// L'INSTANT.
	// Première version à l'arrache, à revoir pour réponse ACTION et ACTION2
	// --------------------------------------------------------------------------
	/**
	* @param {string|number} strHwndTarget
	* @param {string} strMsgType
	* @param {string|Object} strMsgDatas
	*/
	self.MessageToBroker = function( strHwndTarget, strMsgType, strMsgDatas ) {
		if ( BrokerPort === null ) {
			// c'est ennuyeux
			var strErrorMsg = "**CTXB MessageToBroker : null BrokerPort for a [" + strMsgType + "] message";
			self.Trace( CTXLV.ERRO, strErrorMsg ); // FEAR THE STACKOVERFLOW :-)
			// FIX_CONS console.error( strErrorMsg );
			return;
		} // endif
		
		// FORMAT de la string UTF8
		//     hwnd en décimal + une virgule + la chaîne type message + les datas
		// ----------------------------------------------------------------------
		if ( typeof strMsgDatas === "object" ) {
			strMsgDatas = JSON.stringify(strMsgDatas);
		}
		if ( typeof strMsgDatas !== "string" ) {
			// c'est ennuyeux
			var strErrorMsg = "**CTXB MessageToBroker : strMsgDatas is NOT a string for a [" + strMsgType + "] message";
			self.Trace( CTXLV.ERRO, strErrorMsg ); // FEAR THE STACKOVERFLOW :-)
			// FIX_CONS console.error( strErrorMsg );
			return;
		} // endif
		var strMessage = strHwndTarget + ',' + strMsgType + ',' + strMsgDatas;
		// FIX_CONS console.info( "**CTXB MessageToBroker : Type %s", strMsgType ) 
		BrokerPort.postMessage( strMessage );
	}

	// écoute des 'content' version SANS port dédié
	// --------------------------------------------
	chrome.runtime.onMessage.addListener( function( message, sender ) {
		// FIX_CONS console.info( "**CTXB: Message %s received from content", message.MsgType );
		self.ProcessMessageFromContent( message, sender );
	});

	self.ProcessMessageFromContent = function( message, sender ) {
		switch ( message.MsgType ) {
			case ctx.message.FrameCaptureResult:
				// FIX_CONS console.log("Background received frameset object");
				var strReponse = self.GetFrameCaptureString(message.MsgDatas, message.FromBrokerInfos.POINTX, message.FromBrokerInfos.POINTY, message.FromBrokerInfos.X, message.FromBrokerInfos.Y);
				strReponse = message.FromBrokerInfos.TimeStamp + "," + strReponse;
				// FIX_CONS console.log(strReponse);
				self.MessageToBroker( message.FromBrokerInfos.HwndTarget, message.FromBrokerInfos.MsgType, strReponse );

				break;
				
			case ctx.message.FrameIdentification:
				// FIX_CONS console.log("Identification received :        InternalFrameId = " + message.MsgDatas.FrameId + " - ChromeFrameId = " + sender.frameId);
				self.frameIdentifications.push({"frameId":message.MsgDatas.FrameId, "chromeFrameId":sender.frameId});
				break;

		case ctx.message.ContentReady: {
				var strTabInfo = "none";
				if ( typeof sender.tab !== "undefined" ) {
					strTabInfo = "tabID = " + sender.tab.id + " Index = " + sender.tab.index;
				} // endif
				// FIX_CONS console.info( "**CTXB: ProcessMessageFromContent (Tab Info : %s), Content Ready for %s", strTabInfo, message.MsgDatas.url );
				// **TODO poubelliser les Ready en provenance de Chrome ?
				if ( bCouplageDone ) {
					if ( typeof sender.tab === "undefined" ) {
						// C'est trés ennuyeux
						// FIX_CONS console.error( "**CTXB: ProcessMessageFromContent CONTENT_READY : NO SENDER.TAB for %s", message.MsgDatas.url );
					} else {
						if ( sender.tab.index < 0 ) return; // prerenderer
						// FIX_CONS console.info( "**CTXB ProcessMessageFromContent CONTENT_READY Tab is " + JSON.stringify( sender.tab ) );
						// BON, c'est un peu dingue, mais je confirme que quand je tappe la
						// chaîne "w3schools" dans la barre d'adresse et que je fais enter
						// je vois une page s'afficher, qui est d'URL
						// https://www.google.fr/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=w3schools
						// Puis je reçois un CONTENT_READY POUR UN AUTRE TAB INVISIBLE QUI A SOIT-DISANT
						// chargé la page http://www.w3schools.com/ LOL
						// S'agit-il d'un préchargementb de page en tâche de fond ?
						// Si chrome s'amuse à faire àa pour des pages gérés, IL VA Y AVOIR UN PROBLÈME !
						// L'astuce est que le tab à la property "index à -1...
						// Problème : il semble garder cet index à -1 quand il devient visible LOL bug Chrome
						// ----------------------------------------------------------------------------------
						self.SendMessageToOneFrameInOneTab( sender.tab, sender.frameId, { "MsgType": "COUPLAGE", "MsgDatas": oCouplageMsgDatas } );
					} // endif
				} // endif
				break;
			}
			case ctx.message.Event:
				self.DoCtxtEvent( message.MsgDatas, sender );
				break;

			case ctx.message.Response:
				// ** MAYDO : check Datas flat string
				self.MessageToBroker( message.hWndSender, ctx.message.Response, message.MsgDatas );
				break;

			default: {
				// FIX_CONS console.error( "**CTXB ERROR ProcessMessageFromContent : Unknow Message Type %s", message.MsgType );
			}
		} // end switch		
		return;
	}

	// **MAYDO : faire un énumérateur avec CallBack pour ré-utilisation !!
	// -------------------------------------------------------------------
	/**
	* @param {Object} MsgDatas
	* @param {ctx.pageInfoClass} PageInfos
	*/
	self.GetPageInfos = function( MsgDatas, PageInfos ) {
		
		// Parcourir la liste des tabs
		// ATTENTION, POUR L'INSTANT, CODE SUPER
		// SENSIBLE À LA NATURE/STRUCTURE DE
		// oAssocTabs   manuel 01/03/2016
		// JE HAIS LES LANGAGES NON TYPÉS !
		// -------------------------------------
		for( var strTabId in oAssocTabs ) {
			var oOneTab = oAssocTabs[ strTabId ];
			// parcours des frames
			// -------------------
			for( var strFrameId in oOneTab.oAssocFrames ) {
				var OneFrame = oOneTab.oAssocFrames[ strFrameId ];
				// parcours des pages : c'est en gros inutile de supposer du
				// multi-page dans une frame, sauf que je laisse ça comme ça
				// pour peut être un jour les pages "filles"
				// ---------------------------------------------------------
				// **MAYDO : check page count par property OU BIEN par Object.keys(obj).length
				// ---------------------------------------------------------------------------
				for( var strPageName in OneFrame.oAssocPages ) {
					var OnePage = OneFrame.oAssocPages[ strPageName ];
					// THE TEST
					// --------
					if ( strPageName === MsgDatas.PageName &&
						OnePage.uniqueID.rawRandom === MsgDatas.uniqueID.rawRandom &&
						OnePage.uniqueID.rawPerfTick === MsgDatas.uniqueID.rawPerfTick ) {
						PageInfos.PageName = strPageName;
						PageInfos.TabId = parseInt(strTabId, 10);
						PageInfos.FrameId = parseInt(strFrameId, 10);
						return true;
					} // endif
				} // end for
			} // end for
		} // endif
		
		// rien de trouvé
		// --------------
		return false;
		
	} // GetPageInfos

	self.DoCtxtEvent = function( MsgDatas, sender ) {
		
		// **TODO ET SI PAS COUPLÉ ?
		// -------------------------
		
		// Pulsieurs problèmes :
		//   1) calcul des instances d'appli et de pages
		//   2) format de passage vers C++
		// ---------------------------------------------
		
		// Instance d'appli : en fonction des identifiants de tab et frame d'origine
		// du message, chercher l'instance d'appli qui avait été calculée au moment
		// du premier LOAD. Si rien n'est trouvé, c'est que C'EST le premier LOAD,
		// il faut donc calculer une nouvele valeur d'instance. Les instances WEB3
		// sont des PIDS ou des TIDS (donc des nombres pairs). Partir d'une BASE
		// égale à 1001, et incrémenter de 2 à chaque fois.
		// -------------------------------------------------------------------------

		// ATTENTION : même InstanceID pour DEUX apllications dans le même tab (dans
		// deux frames différentes, donc) Pas forcément le cas en Web3, pour autant que
		// WEB3 gère correctement une application uniquement en sous frame...
		// ----------------------------------------------------------------------------
		
		// **TODO : faire envoyer par le content un event spécifique UNLOAD_WINMAIN 
		// pour distinguer le cas de la disparition du document HTML. Si c'est pour 
		// la main frame (0) et si le LOAD suivant sur cette Main Frame concerne une
		// AUTRE application, alors il faut générer END de l'ancienne application.
		// Il faut donc se souvenir des "UNLOADED APP IN MAINFRAME"
		// Problème : si la nouvelle main frame N'est PAS une application du PSC, on
		// ne reçoit en fait RIEN. Il faut donc AUSSI un Event "UNKNOWN_APPLI_MAIN"
		// -------------------------------------------------------------------------
		
		var DaTabId;
		var DaFrameId;
		
		// Attention BUG CHROME UNLOAD par fermeture d'onglet SANS tab dans le sender
		// --------------------------------------------------------------------------
		if ( typeof sender.tab === "undefined" || typeof sender.frameId === "undefined" ) {
			// BON, ÇA SERA SYSTÉMATIQUEMENT LE CAS POUR UNLOAD AVEC CHROME 48.0.2564.116 m POUR TOUTES SUBFRAME QUAND
			// NAVIGATION DE LA MAINFRAME VERS UN AUTRE AUTRE PAGE, TOP KEK
			// voir https://bugs.chromium.org/p/chromium/issues/detail?id=582744
			// ON VA SE SERVIR DE L'OBJET uniqueID pour "reconsituer" tabid et frameid
			// -----------------------------------------------------------------------
			if ( MsgDatas.EventName !== ctx.event.page.UNLOAD ) {
				// FIX_CONS console.error( "**CTXB DoCtxtEvent : No tab or frameId in sender for Event %s on Appli %s for page %s", MsgDatas.EventName,
				// FIX_CONS		       MsgDatas.AppliName, MsgDatas.PageName );
				return;
			} // endif
			var PageInfos = new ctx.pageInfoClass();
			var bFound = self.GetPageInfos( MsgDatas, PageInfos );
			if ( bFound == false ) {
				// FIX_CONS console.error( "**CTXB DoCtxtEvent : CAN'T RETRIEVE PAGE INFOS when No tab in sender for Event %s on Appli %s for page %s", MsgDatas.EventName,
				// FIX_CONS		       MsgDatas.AppliName, MsgDatas.PageName );
				return; // hum
			} // endif
			DaTabId = PageInfos.TabId;
			DaFrameId = PageInfos.FrameId;
		} else {
			DaTabId = sender.tab.id;
			DaFrameId = sender.frameId;
		} // endif
		
		var TickNow = performance.now();
		// FIX_CONS console.info( "**CTXB DoCtxtEvent at " + TickNow + " : EventName %s, Tab %d, Frame %d, Appli %s Page %s",
		// FIX_CONS              MsgDatas.EventName, DaTabId, DaFrameId, MsgDatas.AppliName, MsgDatas.PageName );
				  
		// **************************************************
		// Une série de séquences RECHERCHE-CONTRÔLE-STOCKAGE
		// **************************************************

		// Connaît-on déjà ce Tab ?
		// ------------------------
		var oTheTab = { 
			oAssocFrames: {}, 
			oAssocLivingApplis: {} 
		};
		var bTabKnown = false;
		if ( typeof oAssocTabs[ DaTabId ] !== "undefined" ) {
			oTheTab = oAssocTabs[ DaTabId ];
			bTabKnown = true;
		} // endif
		
		// Si c'est un LOAD d'Appli Unknown (donc forcément sur la Frame 0)
		// je dois forcer le END de toutes les applis du TAB
		// ----------------------------------------------------------------
		if ( MsgDatas.EventName === "LOAD_UNKNOWN_APPLI" ) {
			if ( DaFrameId !== 0 ) {
				// HEIN !?!
				// --------
				// FIX_CONS console.error( "**CTXB DoCtxtEvent : %s received on Frame %d", MsgDatas.EventName, DaFrameId );
				return;
			} // endif
			// Si je ne connaissais pas l'onglet, basta
			// ----------------------------------------
			if ( bTabKnown === false ) return;
			// CLEAN-UP END TOUTES APPLIS QUI RESTAIENT DANS LE TAB
			// ----------------------------------------------------
			for ( var strLivingAppli in oTheTab.oAssocLivingApplis ) {
				var strFlatMessage = self.BuildFlatMessage( strLivingAppli, "END_FULL", "", "", 0, oTheTab.nAppliInstanceID, 0, "" );
				self.MessageToBroker( strHwndWeb3, ctx.message.Event, strFlatMessage );
				delete oTheTab.oAssocLivingApplis[ strLivingAppli ]; // tant qu'à faire
			 } // end for of
			return;
		} // endif
		
		// Contrôles : SI PAS LOAD, JE DOIS AVOIR TROUVÉ LE Tab
		// ----------------------------------------------------
		if ( bTabKnown === false && MsgDatas.EventName !== ctx.event.page.LOAD ) {
			// WTF!
			// ----
			// FIX_CONS console.error( "**CTXB DoCtxtEvent : Tab %d NOT found for Event %s for Appli %s and page %s",
			// FIX_CONS			   DaTabId, MsgDatas.EventName, MsgDatas.AppliName, MsgDatas.PageName );
			return; // Hum...
		} // endif

		// Si le TAB est nouveau (c'est alors forcément un LOAD, voir contrôle
		// ci-dessus) je dois l'ajouter à ma liste des tabs connus
		// -------------------------------------------------------------------
		if ( bTabKnown === false ) {
			oAssocTabs[ DaTabId ] = oTheTab;
		} // endif
	
		// récupération ou calcul de l'Instance ID
		// pour Appli avec mémorisation si calcul
		// ---------------------------------------
		
		// Arrivé ICI avec un AppliName à "undefined" ou
		// vide EST une bug qui DOIT être détectée
		// ---------------------------------------------
		if ((MsgDatas.AppliName === undefined) || (MsgDatas.AppliName == "")) {
			// FIX_CONS console.error( "**CTXB DoCtxtEvent : NO AppliName for Event %s from Tab %d",
			// FIX_CONS			   MsgDatas.EventName, DaTabId );
			return; // Hum...
		} // endif
		
		// 3 cas possibles :
		//   A) Event "normal", pas d'AppliInstance
		//   B) Contextor.Event avec AppliInstance === -1
		//   2) Contextor.Event avec AppliInstance !== -1
		if ( MsgDatas.AppliInstance === undefined ) {
			// cas A)
			// ------
			if ( bTabKnown === true ) {
				MsgDatas.AppliInstance = oTheTab.nAppliInstanceID;
			} else {
				MsgDatas.AppliInstance = self.GetNewInstanceAppliID();
				oTheTab.nAppliInstanceID = MsgDatas.AppliInstance;
				oTheTab.AppliName = MsgDatas.AppliName;
			} // endif
		} else {
			if ( MsgDatas.AppliInstance === -1 ) {
				// cas B)
				// ------
				if ( bTabKnown === true ) {
					MsgDatas.AppliInstance = oTheTab.nAppliInstanceID;
				} else {
					// Normalement UNREACHABLE car SEUL "LOAD" autorisé pour Tab Inconnu
					// **MAYDO // FIX_CONS console.error
				} // endif
			} else {
				// cas C) faire confiance à l'AppliInstance fournie. NOP 
			} // endif
		} // endif

		// Si la Frame EST une main Frame, ET SI c'est un LOAD, ET SI l'appli
		// est différente d'une ancienne APPLI qui était dans la même FRAME 0
		// ALORS, je dois générer le END de TOUTES APPLIS
		// Problème : il est fréquent que le UNLOAD de cette main Frame vienne
		// juste d'être traité avec succès : bilan PLUS d'applis flaguée MAIN
		// FRAME dans cet onglet. 
		// ------------------------------------------------------------------
		if ( DaFrameId === 0 &&
		     MsgDatas.EventName === ctx.event.page.LOAD ) {
			// FAIRE END DE TOUTES APPLIS DANS LE TAB SI LA FRAME
			// 0 est "remplacée"
			// Heu... même les applis en Child Frame !?! OUI !
			// -----------------------------------------------
			// recherche de l'ancienne APPLI qui était en "0"
			// ----------------------------------------------
			// FIX_CONS console.log( "**CTXB DoCtxtEvent : Searchning for Old Appli in Tab %s", JSON.stringify( oTheTab ) );
			var strOldAppliInMain = "";
			for ( var strLivingAppli in oTheTab.oAssocLivingApplis ) {
				var oTabAssocFrameIDs = oTheTab.oAssocLivingApplis[ strLivingAppli ];
				if ( typeof oTabAssocFrameIDs[ 0 ] !== "undefined" ) {
					strOldAppliInMain = strLivingAppli;
					break;
				} // endif
			 } // end for of
			 if ( strOldAppliInMain.length !== 0 && strOldAppliInMain !== MsgDatas.AppliName ) {
				 // NEW APPLI IN MAIN : FULL END
				 // ----------------------------
				for ( var strLivingAppli in oTheTab.oAssocLivingApplis ) {
					// FIX_CONS console.log( "**CTXB DoCtxtEvent : Generating END for Appli %s-%d", strLivingAppli, oTheTab.nAppliInstanceID );
					var strFlatMessage = self.BuildFlatMessage( strLivingAppli, "END_FULL", "", "", 0, oTheTab.nAppliInstanceID, 0, "" );
					self.MessageToBroker( strHwndWeb3, ctx.message.Event, strFlatMessage );
					delete oTheTab.oAssocLivingApplis[ strLivingAppli ]; // tant qu'à faire
				 } // end for of
			 } // endif
		} // endif
		
		// Sur LOAD, enrichir la liste des livings, par écrasement si déjà là
		// Manuel 14 mars 2016 : la valeur de la property n'est PLUS une
		// répétition inutile de L'instanceID de l'appli, mais un numéro de
		// frame (pour générer END sur changement d'appli en MAIN FRAME)
		// ------------------------------------------------------------------
		if ( MsgDatas.EventName === ctx.event.page.LOAD ) {
			var oTabAssocFrameIDs = oTheTab.oAssocLivingApplis[ MsgDatas.AppliName ];
			if ( typeof oTabAssocFrameIDs === "undefined" ) {
				oTheTab.oAssocLivingApplis[ MsgDatas.AppliName ] = {};
			} // endif
			oTheTab.oAssocLivingApplis[ MsgDatas.AppliName ][ DaFrameId ] = DaFrameId;
		} // endif
	
		// recherche de la frame
		// ---------------------
		var oTheFrame = { 
			PageCount: 0, 
			oAssocPages: {} 
		};
		var bFrameKnown = false;
		if ( bTabKnown === true ) {
			if ( typeof oTheTab.oAssocFrames[ DaFrameId ] !== "undefined" ) {
				oTheFrame = oTheTab.oAssocFrames[ DaFrameId ];
				bFrameKnown = true;
			} // endif
		} // endif
		
		// Contrôles : SI PAS LOAD, JE DOIS AVOIR TROUVÉ LA FRAME
		// ------------------------------------------------------
		if ( bFrameKnown === false && MsgDatas.EventName !== ctx.event.page.LOAD ) {
			// WTF!
			// ----
			// FIX_CONS console.error( "**CTXB DoCtxtEvent : Frame %d NOT found in Tab %d for Event %s for Appli %s and page %s",
			// FIX_CONS			   DaFrameId, DaTabId, MsgDatas.EventName, MsgDatas.AppliName, MsgDatas.PageName );
			return; // Hum...
		} // endif

		// Si la FRAME est nouvelle (c'est alors forcément un LOAD, voir contrôle
		// ci-dessus) je dois l'ajouter à ma liste des frames connues
		// ----------------------------------------------------------------------
		if ( bFrameKnown === false ) {
			oTheTab.oAssocFrames[ DaFrameId ] = oTheFrame;
		} // endif

		// si PageName non définie ce n'est PAS normal
		// -------------------------------------------
		if ( typeof MsgDatas.PageName === "undefined" ) {
			// FIX_CONS console.error( "**CTXB DoCtxtEvent : No PageName for Event %s for Appli %s",
			// FIX_CONS			   MsgDatas.EventName, MsgDatas.AppliName );
			return; // Hum...
		} // endif
		
		// Si PageName vide, c'est une demande d'envoi d'Event fonctionnel
		// sans page, on ne touche à rien, et la fourniture d'une instance
		// de page (à 0, -1, ou 4242) est obligatoire (elle a normalement
		// été forcée à 0 dans le pilote
		// ---------------------------------------------------------------
		if ( MsgDatas.PageName === "" ) {
			
			if ( typeof  MsgDatas.PageInstance === "undefined" ) {
				// FIX_CONS console.error( "**CTXB DoCtxtEvent : No PageInstance for Event %s for Appli %s and empty PageName",
				// FIX_CONS			   MsgDatas.EventName, MsgDatas.AppliName );
				return; // Hum...
			} // endif
			
		} else {
			
			// recherche de la Page : Hum, non 01/03/2016 Une seule page par Frame
			// SAUF LAISSER PORTE OUVERTE POUR PAGE FILLE, MAIS AVEC L'INCONVÉNIANT
			// DE COMPLIQUER CHECK MONO-PAGE
			// --------------------------------------------------------------------
			var oThePage = {};
			var bPageKnown = false;
			
			if ( typeof oTheFrame.oAssocPages[ MsgDatas.PageName ] !== "undefined" ) {
				bPageKnown = true;
				oThePage = oTheFrame.oAssocPages[ MsgDatas.PageName ];
			} // endif
			
			// Contrôle : si pas LOAD, je DOIS avoir trouvé la page
			// ----------------------------------------------------
			if ( bPageKnown === false && MsgDatas.EventName !== ctx.event.page.LOAD ) {
				// WTF!
				// ----
				// FIX_CONS console.error( "**CTXB DoCtxtEvent : Page %s NOT found in tab %d in Frame %d for Event %s for Appli %s",
				// FIX_CONS			   MsgDatas.PageName, DaTabId, DaFrameId, MsgDatas.EventName, MsgDatas.AppliName );
				return; // Hum...
			} // endif
			
			// si la page est nouvelle, (c'est alors forcément un LOAD, voir contrôle
			// ci-dessus) je dois l'ajouter à ma liste des pages connues
			// ----------------------------------------------------------------------
			if ( bPageKnown === false ) {
				if ( oTheFrame.PageCount != 0 ) {
					// FIX_CONS console.error( "**CTXB DoCtxtEvent : Frame %d already HAS Page in tab %d for Event %s for Appli %s for page %s",
					// FIX_CONS			   DaFrameId, DaTabId, MsgDatas.EventName, MsgDatas.AppliName, MsgDatas.PageName );
					return; // Hum...
				} // endif
				oThePage.uniqueID = MsgDatas.uniqueID;
				oThePage.AppliName = MsgDatas.AppliName; // mémorisation de l'appli name pour génération end
				oThePage.nAppliInstanceID = MsgDatas.AppliInstance;
				oThePage.PageName = MsgDatas.PageName; // mémorisation du page name 
				oTheFrame.oAssocPages[ MsgDatas.PageName ] = oThePage;
				oTheFrame.PageCount = 1;
			} else {
				if ( oTheFrame.PageCount != 1 ) {
					// FIX_CONS console.error( "**CTXB DoCtxtEvent : Frame %d already HAS several Pages in tab %d for Event %s for Appli %s for page %s",
					// FIX_CONS			   DaFrameId, DaTabId, MsgDatas.EventName, MsgDatas.AppliName, MsgDatas.PageName );
					return; // Hum...
				} // endif
			} // endif
			
			// récupération ou calcul de l'Instance ID
			// pour PAGE avec mémorisation si calcul
			// ---------------------------------------
			if ( MsgDatas.PageInstance === undefined ) {
				if ( bPageKnown	=== true ) {
					MsgDatas.PageInstance = oThePage.nPageInstanceID;
				} else {
					MsgDatas.PageInstance = self.GetNewInstancePageID();
					oThePage.nPageInstanceID = MsgDatas.PageInstance;
				} // endif
			} else {
				if ( MsgDatas.PageInstance !== -1 ) {
					// Heu... Plaît-il ?!? 
					// FIX_CONS console.error( "**CTXB DoCtxtEvent : PageInstance already given, but is NOT '-1' for Event %s for Appli %s for page %s",
					// FIX_CONS			   MsgDatas.EventName, MsgDatas.AppliName, MsgDatas.PageName );
					return; // Hum...
				} // endif
				MsgDatas.PageInstance = oThePage.nPageInstanceID;
			} // endif 
		} // endif
	
		// Bon, c'est bien joli mais il FAUT faire le ménage si UNLOAD
		// -----------------------------------------------------------
		if ( MsgDatas.EventName === ctx.event.page.UNLOAD ) {
			// oublier la page dans sa frame
			// -----------------------------
			delete oTheFrame.oAssocPages[ MsgDatas.PageName ];
			// oublier la frame, tant qu'à faire
			// ATTENTION FAUX LE JOUR OU PAGE FILLES
			// -------------------------------------
			oTheFrame.PageCount = 0; // cohérence déjà vérifié, plus TOP KEK instruction suivante
			
			// **TODO FIX éventuelle problème de UNLOAD des frames filles
			// en virant TOUT si frame 0 : problème : PLUS DE EVENT DATAS
			// ----------------------------------------------------------
			delete oTheTab.oAssocFrames[ DaFrameId ];
			
			// LE TAB, ben rien pour l'instant
			// -------------------------------
			
		} // endif
		
		// OK
		// --
		TickNow = performance.now();
		// FIX_CONS console.info( "**CTXB DoCtxtEvent at " + TickNow + " : OK for Event %s, Appli %s InstanceAppli %d Page %s InstancePage %d",
		// FIX_CONS              MsgDatas.EventName, MsgDatas.AppliName, MsgDatas.AppliInstance, MsgDatas.PageName, MsgDatas.PageInstance );
		
		// GO !
		// ----
		// **MAYDO typeof MsgDatas.ObjectData === "string"
		var strFlatMessage = self.BuildFlatMessage( MsgDatas.AppliName, MsgDatas.EventName, MsgDatas.PageName,
		                                       MsgDatas.ItemName, 0, MsgDatas.AppliInstance, MsgDatas.PageInstance, MsgDatas.ObjectData ); // no instance item
		self.MessageToBroker( strHwndWeb3, ctx.message.Event, strFlatMessage );
		return;
	}

	self.GetNewInstanceAppliID = function() {
		var nRetVal = nNextNewInstanceAppliID;
		nNextNewInstanceAppliID += 2;
		return nRetVal;
	}

	self.GetNewInstancePageID = function() {
		var nRetVal = nNextNewInstancePageID;
		nNextNewInstancePageID += 1;
		return nRetVal;
	}	

	return self;
	
})();	
