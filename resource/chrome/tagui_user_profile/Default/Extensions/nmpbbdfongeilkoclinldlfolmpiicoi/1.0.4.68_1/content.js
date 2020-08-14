// content.js
// --------------------------------------------------------------------------
// Script, un par frame, injecté en mode "isolated content" au document_start
// indépendement du fait que Contextor "RunTime" et/ou "Studio" est (sont) en
// train de tourner ou pas
//
// Manuel 11/02/2016
//
// version 0.1 : début mise en place architecture injection/communication
// ----------------------------------------------------------------------

// Module patern, blablabla, sauf que PERSONNE pour l'utiliser
// vu qu'AUCUN code ne peut appeler depuis l'extérieur... donc
// invocation de fonction anonyme, et pas de properties, tant qu'on y est !
// Du coup, quel est l'intérêt du truc, sachant qu'en plus il NE peut PAS
// y avoir collision de nom (isolated) ? (perf de résolution de nom scoped ?)
// --------------------------------------------------------------------------
"use strict";

// -------------------------------------------------------------------------------------
// Documentation sur format des "messages" échangés entre Injected.js et content.js
//    * un  message est un objet
//    * un message a TOUJOURS une propriété nommée "MsgType": chaîne de caractère
//    * un message a TOUJOURS une propriété nommée "MsgDatas"; dépend du type de message
// -------------------------------------------------------------------------------------

// Ajout manuel 7 mars 2016 : beaucoup des messages on une TROISIÈME property : hWndSender
// qui fait l'aller retour pour être capable de répondre à CtxtRun OU Studio
// ---------------------------------------------------------------------------------------

var MyContentFrameID = '';
var MyContentFrameRelativeBoundingRect = '';

( function () {
	
	var PerfStartBase = performance.timing.navigationStart;
	var bInjectionBootstrapDone = false;
	var bInjectionPiloteDone = false;
	var bInjectionPilotePending = false;
	
	var bCouplageToDo = false;
	var oCouplageMsgDatas = null;	

	// FIX_CONS console.info( "**CTXC: content.js starting for %s", document.URL );
	
	// pas de prise de tête compliquée sur la synchronisation
	// On ne fait tout simplement RIEN tant que le BootStrap
	// n'est pas correctement injecté. RAPPEL : on a un BootStrap
	// pour ÉVITER de balancer TOUT le pilote dans toutes les
	// frames quand Contextor ne tourne pas. Ceci dit, on pourrait
	// aussi ne RIEN injecter du tout, tant qu'on n'a pas de couplage
	// Simplification peut être possible (manuel 24/02/2016)
	// ATTENTION : injected.js au document_start SEUL MOYEN d'avoir
	// une fonction // FIX_CONS console.log opérationnelle sur certains sites
	// --------------------------------------------------------------
	// Injection du script de boostrap "in page"
	// -----------------------------------------
	InjectFiles( ['Injected.js', 'enum.js','CxCapture.js']);

	/* 
	*Fonction utilitaire d'injection de script FICHIER dans la page.
	* La fonction peut être appele soit avec un argument de type string (le nom du fichier à injected)
	* ou bien ave cun argument de type array de string (les noms de fichier à injecter dans l'ordre).
	* L'appel avec un argument de type array[string] permet de s'assurer que les fichiers sont bien injectes 
	* dans l'ordre défini. 
	* 
	* Le problème de l'injection de enum.js pas encore finie alors qu'on execute deja le code du CxAppChrome.js 
	* (pourtant injecté après enum.js) dans la page a été observé sur FireFox. Le code actuel regle ce problème.
	* --------------------------------------------------------------
	*/ 

	function InjectFiles(fileNames) {
		//Fonction recursive. On sort des que l'argument est null ou vide.
		var fileName=null;
		if(fileNames == null || fileNames=='') return;
		
		if(typeof fileNames == "string") {
			//argument de type string, donc un seul fichier à injecter.
			fileName=fileNames;
			fileNames='';
		}
		if(typeof fileNames == "object" && fileNames[0] !=null) {
			//argument de type object et premier element du tableau pas vide
			//on recupere le premier element dans le tableau et on reduit le tableau à sa queue
			fileName=fileNames.shift();
		}
		
		//si par hazard pas de fichier à injecter, on sort.
		if(fileName==null) return;
		
		var s = document.createElement('script');
		s.src = chrome.extension.getURL(fileName);
		s.charset = "utf-8";
		s.onload = function() {
			this.parentNode.removeChild(this);
			// FIX_CONS console.log( "**CTXC: " + fileName + " injected in " + document.URL );
			//appel recursif sur le reste du tableau
		  InjectFiles(fileNames);
			
		};
		
		// Attention : document.head peut être à null au "document_start"
		// --------------------------------------------------------------
		(document.head||document.documentElement).appendChild(s);
	}
	





	/* Inject script balise with code client into page. 
	 * It is called by Execscript in content page.
	 * The goal is to replace eval in Chrome extension. When there is http header Content-Security-Policy  with « default-src » or « script-src »
	 * We can find this on mantis site. If we do not have unsafe-eval, eval is not authorized.
	 * We still have a issue as injected script cannot return a value whereas eval returns a value.
	*/
	function InjectScript(code) {
		window.__contextor_eval_result__ = undefined;
		var sc = document.createElement('script');
		sc.appendChild(window.document.createTextNode(code));

		sc.onload = function () {
			this.parentNode.removeChild(this);
		};

		// Attention : document.head peut être à null au "document_start"
		// --------------------------------------------------------------
		(document.head || document.documentElement).appendChild(sc);
	}

	/* Inject script balise with code client into page for CALLITEM or SCRIPTITEM if eval is not allowed in page. */
	function InjectScriptForItem(code, oMsg) {

		var sc = document.createElement('script');

		var ret = "var retval =" + (code) + ';\n'
                + "window.dispatchEvent( new CustomEvent( '42CTX_INJECTED_FOR_ITEM'," +'{ detail : {\n'
                + '  \'injectForItem\': true,\n'
                + '  result: (retval),\n'
                + '}}));';

		sc.appendChild(window.document.createTextNode(ret));

		function forward(e) {
			if (e.detail.injectForItem) {
				oMsg.Result = e.detail.result;
				ContentDoResponse(oMsg);
				(document.head || document.documentElement).removeChild(sc);
				window.removeEventListener('message', forward);
			}
		}
		window.addEventListener('42CTX_INJECTED_FOR_ITEM', forward, false);


		// Attention : document.head peut être à null au "document_start"
		// --------------------------------------------------------------
		(document.head || document.documentElement).appendChild(sc);
	}

	// ****************************************************************************************************
	// *********************************** COMMUNICATIONS AVEC BACKGROUND *********************************
	// ****************************************************************************************************
	
	// **************************
	// ********* ENVOI **********
	// **************************
	// Envoi des messages au BackGround SANS CANAL dédié
	// -------------------------------------------------
	function MessageToBackGround( oMessage ) {
		chrome.runtime.sendMessage( oMessage );
	}
	
	// ****************************
	// ********* ÉCOUTE ***********
	// ****************************
	// écoute message du background SANS CANAL dédié
	// ---------------------------------------------
	chrome.runtime.onMessage.addListener( function( message, sender ) {
		// FIX_CONS console.info( "**CTXC: Message received from BackGround : MsgType is %s for %s", message.MsgType, document.URL );
		ProcessMessageFromBackground( message );
	});
	
	// ****************************
	// ********* PROCESS **********
	// ****************************
	function ProcessMessageFromBackground( oMessage ) {
		switch ( oMessage.MsgType ) {
			case "CaptureFrames": {
				MessageToInjected(oMessage);
				break;
			}
			case ctx.message.Decouplage: {
				if ( bInjectionBootstrapDone === false ) {
					// HEU... Toujours en cours ?
					// --------------------------
					// FIX_CONS console.warn( "**CTXC: DECOUPLAGE without BootStrap Done. URL = %s", document.URL );
					bCouplageToDo = false;
					return;
				} // endif
				if ( bInjectionPiloteDone === false ) {
					// HEU... Toujours en cours ?
					// Ou bien TOUT SIMPLEMENT pas demandé ?
					// -------------------------------------
					// FIX_CONS console.warn( "**CTXC: DECOUPLAGE without Pilote Injected. URL = %s", document.URL );
					bCouplageToDo = false;
					return;
				} // endif
				MessageToInjected( oMessage );
				break;
			}
			case ctx.message.Couplage: {
				// FIX_CONS console.log( "**CTXC: COUPLAGE received for URL = %s", document.URL );
				if ( bInjectionBootstrapDone === false ) {
					// je demande à voir, mais peut être possible si un
					// lancement de contextor a lieu EXACTEMENT au moment d'une
					// montée d'un content
					// FIX_CONS console.warn( "**CTXC: COUPLAGE without BootStrap Done. Trashing. URL = %s", document.URL );
					return;
				}
				if ( bInjectionPiloteDone === false ) {
					// DEUX cas :
					//   1) elle est en cours, on fera le couplage quand elle sera finie
					//      MAIS QUESTION : comment se fait-il qu'elle soit en cours !?!
					//   2) On ne l'a jamais faites
					// -----------------------------------------------------------------
					if ( bInjectionPilotePending === true ) {
						// WTF !?!
						// *******
						// FIX_CONS console.error( "**CTXC: COUPLAGE with Pilote Injection PENDING! URL = %s", document.URL );
						return;
					} // endif
					// on l'a jamais faites : la lancer
					bInjectionPilotePending = true;
					bCouplageToDo = true;
					oCouplageMsgDatas = oMessage.MsgDatas;
					InjectFiles( ['enum.js','CxAppChrome.js']); 
					//InjectFiles( 'CxAppChrome.js' );
				} else {
					// on a déjà injecté le pilote, on appelle
					// directement avec les données de couplage
					// FIX_CONS console.log( "**CTXC Couplage : Pilote Already Injected. Routing for URL = %s", document.URL );
					MessageToInjected( oMessage );
				} // endif
				break;
			}
		    case ctx.message.Action:
		    case ctx.message.Action2:
				// On va dire, jusqu'à preuve du contraire, que si on reçoit
				// une demande d'action, c'est qu'on est couplé/injecté
				// ---------------------------------------------------------
				MessageToInjected( oMessage );
				break;
			default: {
				// FIX_CONS console.error( "**CTXC: ProcessMessageFromBackground Unknow Type %s for %s", oMessage.MsgType, document.URL );
			}
		} // end switch
		return;
	}
	
	// ****************************************************************************************************
	// ************************************** COMMUNICATIONS AVEC INJECTED ********************************
	// ****************************************************************************************************
	
	// **************************
	// ********* ENVOI **********
	// **************************
	// Version DISPATCHEVENT, mesuré, grossièrement,
	// le 12 février 2016 comme prenant 2/3 du temps de POSTMESSAGE
	// et le 15 février comme prenant 1/3 tu temps de ExecuteScriptlet.
	// Attention : par CONSTRUCTION (retour d'une valeur booléenne...) la
	// méthode dispatchEvent EST SYNCHRONE
	// 15-11-2016 : alignement sur code Firefox
	// **TODO vérifier que le bubbles est NÉCESSAIRE sous Firefox
	// **MAYDO ne pas utiliser oToPass si pas nécessaire, bof.
	// ------------------------------------------------------------------
	function MessageToInjected( oMsg ) {
		var oToPass;
		if ( typeof cloneInto !== 'undefined' ) {
			oToPass = cloneInto( oMsg, document.defaultView );
		} else {
			oToPass = oMsg;
		} // endif
		document.documentElement.dispatchEvent( new CustomEvent( '42CTX_FROM_CONTENT', { bubbles: true, detail: oToPass } ) );
	}
	
	// ****************************
	// ********* ÉCOUTE ***********
	// ****************************
	// installation d'un canal de communication basé sur DISPATCHEVENT
	// ---------------------------------------------------------------
	document.addEventListener( '42CTX_FROM_PAGE', function(e) {
		if ( e.detail !== undefined ) {
			ProcessMessageFromInjected( e.detail );
		} // endif			
	});
	
	// ****************************
	// ********* PROCESS **********
	// ****************************
	function ProcessMessageFromInjected( oMessage ) {
		// **MAYDO : except, log bad message
		if ( oMessage.MsgType === undefined ) return;
		if ( typeof oMessage.MsgType !== "string" ) return;
		
		switch ( oMessage.MsgType ) {
			case 'StoreMyFrameID': {
				MyContentFrameID = oMessage.MsgDatas.FrameID;
				break;
			}
			case 'StoreMyRelativeBoundingRect': {
				MyContentFrameRelativeBoundingRect = oMessage.MsgDatas.RelativeBoundingRect;
				break;
			}
			case ctx.message.FrameCaptureResult:
			case ctx.message.FrameIdentification: {
				MessageToBackGround(oMessage);
				break;
			}
			case ctx.message.BootstrapInjectDone: {
				bInjectionBootstrapDone = true;
				// FIX_CONS console.info( "**CTXC: BOOTSTRAP Injection Seen as Done in content.js for %s", document.URL );
				// ATTENTION : appel synchrone (par dispatchEvent), injection TOUJOURS en cours
				// Introduire barrière asynchrone pour TOUT TRAITEMENT à enchaîner sur "Injected"
				// Ceci dit, manuel 24/02/2016, il n'y a ici RIEN à faire avec "Injected"
				// ------------------------------------------------------------------------------
				// Prévenir le background qu'un nouvel onglet est disponible
				// Si le background n'est pas couplé, il ne va RIEN faire
				// Si le background EST couplé, il va envoyer la demande de couplage
				// ATTENTION : il a peut être DÉJÀ envoyé la demande de couplage si l'onglet
				// était déjà présent dans l'énumération (en gros : cas dans lequel Contextor
				// est démarré exactement au même moment qu'on onglet est ouvert, OU qu'une
				// nouvelle Frame démarre ...)
				// Il ne faut donc tenir AUCUN compte d'une demande de couplage reçue alors
				// que le BootStrap n'est pas prêt.
				// -------------------------------------------------------------------------
				MessageToBackGround( { 
					MsgType: ctx.message.ContentReady, 
					MsgDatas: { 
						url: document.URL 
					} 
				} );
				break;
			}
		
			case ctx.message.PilotInjectDone: {
				bInjectionPiloteDone = true;
				bInjectionPilotePending = false;
				// FIX_CONS console.info( "**CTXC: PILOTE Injection Seen as Done in content.js for %s", document.URL );

				// COUPLAGE SUITE A INJECTION PILOTE
				// ---------------------------------
				// ATTENTION : appel synchrone (par dispatchEvent), injection TOUJOURS en cours
				// Introduire barrière asynchrone pour TOUT TRAITEMENT à enchaîner
				// ----------------------------------------------------------------------------
				if ( bCouplageToDo === false ) {
					// WTF
					// ---
					// FIX_CONS console.warn( "**CTXC: PILOTE Injection Seen as Done with NO COUPLAGE TO BE DONE!" );
				} // endif
				if ( oCouplageMsgDatas === null ) {
					// WTF
					// ---
					// FIX_CONS console.warn( "**CTXC: PILOTE Injection Seen as Done with COUPLAGE DATAS TO NULL!" );
				} // endif
				window.setTimeout( function() {
					if ( bCouplageToDo === true ) {
						MessageToInjected( { "MsgType": "COUPLAGE", "MsgDatas": oCouplageMsgDatas } );
						bCouplageToDo = false;
						oCouplageMsgDatas = null;
					} // endif
				}, 0 );
				break;
			}
		
			// KISS
			case ctx.message.Event:
			case ctx.message.Response:
				if (oMessage.OriginalMessage !== undefined) {
					/* OriginalMessage is present only if we cannot run code from eval into page context
					* We try again message in content context */
					if (oMessage.OriginalMessage.MsgDatas.ActionName === "CALLITEM" || oMessage.OriginalMessage.MsgDatas.ActionName === "SCRIPTITEM") {
						SCRIPTORCALLITEM(oMessage.OriginalMessage);
					}
					else {
						EXECSCRIPT(oMessage.OriginalMessage);
					}
					return;
				}
					MessageToBackGround(oMessage);
					break;

			default: {
				// FIX_CONS console.error( "**CTXC: ProcessMessageFromInjected Unknow Type %s for %s", oMessage.MsgType, document.URL );
			}
	
		} // end switch
		return;
	}

	/***************************************************
	* @method SCRIPTORCALLITEM
	* @param {ctx.messageClass.Action2} oMsg
	* @return {boolean}
	* used to inject script into page for SCRIPTITEM or CALLITEM in case of eval is not allowed in page (security restriction) 
	******************************************************/
	function SCRIPTORCALLITEM(oMsg) {
		try {
			var code = oMsg.MsgDatas.Parm2;
			return InjectScriptForItem(code, oMsg); 
		} catch (ex) {
			ContentAnswerError("Inject script in page for " +  oMsg.MsgDatas.ActionName + " action failed: " + ex.message, oMsg, "");
		} // end try..catch
		return;
	} // endif}


	/***************************************************
	* @method EXECSCRIPT
	* @param {ctx.messageClass.Action2} oMsg
	* @return {boolean}
	******************************************************/
	function EXECSCRIPT(oMsg) {

		var strJSMethod = "";
		try {
			var code = oMsg.MsgDatas.Parm1;
			
			var res = '';
			
			if (oMsg.MsgDatas.ActionName === "EXECSCRIPT") {
				// window.execScript may not be supported by Google Chrome
				if (typeof window.execScript === 'function') {
					strJSMethod = 'execScript';
					window.execScript(code, 'JavaScript');
				} else {

					InjectScript(code); 
					//return InjectScript2(code,"2+2", oMsg);

					//res = window.eval(code);
					if (res === undefined) { res = ''; }
				} // endif
			} else {
				strJSMethod = 'evalScript';
				// ICI : EVALSCRIPT
				// ----------------
				InjectScript(code); 
				//res = window.eval(code);
				if (res === undefined) { res = ''; }
			} // endif
			oMsg.Result = res;
			ContentDoResponse(oMsg);
		} catch (ex) {
			ContentAnswerError(strJSMethod + " injection script in page content failed: " + ex.message, oMsg, "");
		} // end try..catch
		return;
	} // endif}

	function ContentDoResponse(oMsg) {
		if (oMsg.Result === undefined) oMsg.Result = '';
		if (oMsg.Code === undefined) oMsg.Code = ctx.error.OK;

		var strDatas = (typeof oMsg.Result === 'object' ? JSON.stringify(oMsg.Result) : oMsg.Result);
		var MsgDatas = oMsg.MsgDatas.ActionName + "," + oMsg.MsgDatas.RequestID + "," + oMsg.Code + "," + strDatas;
		var theMsg = {
			MsgType: 'CTX_RESPONSE',
			hWndSender: oMsg.hWndSender,
			MsgDatas: MsgDatas
		};
		MessageToBackGround(theMsg);
		return;
	}

	function ContentAnswerError(strError, oMsg, strItemName) {
		var strResult = "Error Chrome [" + oMsg.MsgDatas.ActionName + "] " + oMsg.MsgDatas.PageName + (strItemName ? "." + strItemName : "") + ": " + strError;
		//self.error("**CTXP " + strResult);
		oMsg.Code = ctx.error.Fail;
		oMsg.Result = strResult;
		ContentDoResponse(oMsg);
		return;
	}

})();	