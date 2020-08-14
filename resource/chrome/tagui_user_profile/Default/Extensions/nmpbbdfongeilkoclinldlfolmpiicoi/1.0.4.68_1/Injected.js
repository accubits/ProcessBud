// Injected.js
// -------------------------------------------------------------------------------
// Script injecté dans la page et s'exécutant donc DANS
// le véritable contexte de la page, et non pas dans le contexte
// d'isolation de "contents.js"
//
// Manuel 11/02/2016
// -------------------------------------------------------------
// Module patern, tel qu'expliqué, par exemple ici:
// http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
//
// Code minimaliste systématiquement injecté par la partie "content" de l'extension
// dans toutes les frames de tous les onglets, indépendement du fait que Contextor
// "RunTime" et/ou "Studio" est (sont) en train de tourner ou pas.
// --------------------------------------------------------------------------------
 
// Chrome 48 : "Uncaught SyntaxError: Block-scoped declarations (let, const, function, class)
//              not yet supported outside strict mode"
// ------------------------------------------------------------------------------------------

// Voir DOCUMENTATION format des messages dans 'content.js'
// ********************************************************

 var __CtxChrExtInj = ( function () { // Oui, ben c'est ça ou un GUID, donc bon hein ?
 
 	var PerfStartBase = performance.timing.navigationStart;

	// contournement pour site qui bidouille avec la console
	// voir http://stackoverflow.com/questions/35311671/is-there-a-way-to-work-around-sites-breaking-console-log/35314709
	
	// Manuel août 2016 : Chrome 32 : contournement BROKE. Étant donné que
	// twitter a également cessé de bouziller la console, je SUPPOSE que les
	// devs WEB se sont donnés le mot : on n'arrête de BIDOUILLER avec la console
	// Je fais donc de MÊME
	// --------------------------------------------------------------------------
	// FIX_CONS console.log( "**CTXI: injected.js starting in " + document.URL );
	
	/****** Voir commentaire ci-dessus
	var obj = console.__proto__.__proto__ || {};
	window.__CxConsole = Object.keys(obj).reduce(function(result, key) { 
		result[key] = console[key].bind(console); 
		return result
	}, {} );
	******/
	window.__CxConsole = window.console;
	// FIX_CONS window.__CxConsole.log( "**CTXI: cloning console.log done!" );
	
	// instanciation du singleton
	// --------------------------
	var self = {};
	
	// ****************
	// méthodes console
	// ****************
	// **MAYDO variadic pour format string : SUPER VELU !!! quel this passer à app!y ?!
	self.log = function( strToLog ) {
		window.__CxConsole.log( strToLog );
	};
	self.info = function( strToLog ) {
		window.__CxConsole.info( strToLog );
	};
	self.error = function( strToLog ) {
		window.__CxConsole.error( strToLog );
	};
	self.warn = function( strToLog ) {
		window.__CxConsole.warn( strToLog );
	};

	// Version DISPATCHEVENT, mesurée, grossièrement,
	//	le 12 février 2016 comme étant plus de 2 fois plus rapide que POSTMESSAGE
	self.MessageToContent = function( oMessage ) {
		document.dispatchEvent( new CustomEvent( '42CTX_FROM_PAGE', { detail: oMessage } ) );
	};
	
	/***************************************************
	* Method DoResponse
	* @method self.DoResponse
	* @param {ctx.messageClass.ActionBase} oMsg
	* @return {boolean}
	******************************************************/
	self.DoResponse = function ( oMsg , addOriginalMessage = false ) {
		if (oMsg.Result === undefined) oMsg.Result = '';
		if (oMsg.Code === undefined) oMsg.Code = ctx.error.OK;
		
		var strDatas = (typeof oMsg.Result === 'object' ? JSON.stringify(oMsg.Result) : oMsg.Result);
		var MsgDatas = oMsg.MsgDatas.ActionName + "," + oMsg.MsgDatas.RequestID + "," + oMsg.Code + "," + strDatas;
		var theMsg = { 
			MsgType: 'CTX_RESPONSE', 
			hWndSender: oMsg.hWndSender, 
			MsgDatas: MsgDatas ,
			OriginalMessage: addOriginalMessage? oMsg : undefined
		};
		self.MessageToContent( theMsg );
		return true;
	};
		
	/***************************************************
	* Method AnswerError
	* @method self.AnswerError
	* @param {string} strError
	* @param {ctx.messageClass.ActionBase} oMsg
	* @param {string} [strItemName]
	* @return {boolean}
	******************************************************/
	self.AnswerError = function (strError, oMsg, strItemName) {
	    var strResult = "Error Chrome [" + oMsg.MsgDatas.ActionName + "] " + oMsg.MsgDatas.PageName + (strItemName ? "." + strItemName : "") + ": " +strError;
	    self.error("**CTXP " + strResult);
			oMsg.Code = ctx.error.Fail;
			oMsg.Result = strResult;
	    self.DoResponse(oMsg);
	    return false;
	}
	
		/***************************************************
	* Method ProcessMessageFromContent
	* @param {ctx.messageClass.ActionBase} oMessage
	******************************************************/
	self.ProcessMessageFromContent = function( oMessage ) {
		// **TODO; meilleure gestion bad messages
		if ( oMessage.MsgType === undefined ) return;
		if ( typeof oMessage.MsgType !== "string" ) return;
		
		switch ( oMessage.MsgType ) {
			case "CaptureFrames": {
				CxCaptureModule.CxGetFrameset(oMessage.MsgDatas);
				break;
			}
			default: {
				if ( typeof self.PilProcessMessageFromContent === "function" ) {
					self.log( "** CTXI : About to Call Pilote for Event " + oMessage.MsgType );
					self.PilProcessMessageFromContent( oMessage );
				} else {
					self.error( "**CTXI: Message received with NO PILOTE " + JSON.stringify( oMessage ) + " in 'Injected.js' for " + document.URL );				
				}
			}
		} // end switch
		return;
	}
	
	// Mise en place de l'écoute des messages entrants
	// Firefox : il faut utiliser window
	// -----------------------------------------------
	window.addEventListener( '42CTX_FROM_CONTENT', function(e) {
		if ( e.detail !== undefined ) {
			self.ProcessMessageFromContent( e.detail );				
		} // endif			
	});
	
	// Tentative de régler le problème UNLOAD niveau injected
	// ------------------------------------------------------
	window.addEventListener( 'unload', function(event) {
		// *****************************************************
		// ceci dit énorme séries de BUGS dans Chrome 48 et 49 :
		// les console.log sur 'unload' ne FONT RIEN, DOUBLE KEK
		// (dans CERTAINS CAS, genre close sub-frame)
		// *****************************************************
		if ( typeof self.PilProcessMessageFromBootStrap === "function" ) {
			self.log( "'**CTXI: unload' EventListener called for " + document.URL );
			self.PilProcessMessageFromBootStrap( { "MsgType": "WIN_UNLOAD", "MsgDatas": {} } );
		} // endif
     }, false ); // documentation verbatim

	var RectRequest = null;

    // Ecoute des messages montants pour le GetRect
	window.addEventListener('message', function (event) {
	    if (event.data.MsgType && event.data.MsgType == 'ACTION2' && event.data.MsgDatas.ActionName == 'GETRECT') {
	        RectRequest = event.data;

			// Manuel 15 juillet 2019 : si Le broker envoie une version de protocole
			// dans le paramètre 2, alors il faut utiliser la nouvelle technique, sinon
			// fallback sur le code legacy
			// ------------------------------------------------------------------------
			if ( event.data.MsgDatas.Parm2 === "" ) {

				// CODE LEGACY
				// ***********

				if (window.parent == window) {
					var zoomFactor = window.devicePixelRatio || 1;
					
					// On est à la frame top -> ajout des coordonnées de la zone cliente de Chrome, et réponse

					var innerFactor = (event.data.MsgDatas.IsChrome ? zoomFactor:zoomFactor);
					var outerFactor = (event.data.MsgDatas.IsChrome ? 1:zoomFactor);

					var border = (window.outerWidth * outerFactor - window.innerWidth * innerFactor) / 2;
					var menuHeight = (window.outerHeight * outerFactor - window.innerHeight * innerFactor) - border * 2;

					var windowPosFactor = (event.data.MsgDatas.IsChrome ? 1:zoomFactor);

					// Bug connu
					// Firefox only !!
					// Si le navigateur a plus de la moitié de sa largeur sur le second écran, le calcul de clientAreaLeft doit être :
					// var clientAreaLeft = (window.screenX - 1600) * windowPosFactor + 1600 + border;		si 1600 est la largeur en pixels de l'écran principal
					// Le pilote ne sait pas récupérer la largeur de l'écran principal donc la résolution de ce bug doit être faite hors pilote (par le broker par exemple)
					// Très complexe et pas beau, et peu utile car firefox only et seulement sur 2nd écran.
					// Donc pas implémenté pour l'instant
					var clientAreaLeft = window.screenX * windowPosFactor + border;
					var clientAreaTop = window.screenY * windowPosFactor + border + menuHeight;

					event.data.Result.x += clientAreaLeft;
					event.data.Result.y += clientAreaTop;

					self.DoResponse(event.data);
				}
				else {
					// On s'adresse à la mère pour demander la position de la frame dans laquelle on est
					// Requête (MsgType = RectReq), Réponse (MsgType = RectAns)
					// FIX_CONS console.log(window.document.URL + " sends RectReq to parent" );
					window.parent.postMessage({ MsgType: 'RectReq', RequestID: event.data.MsgDatas.RequestID }, '*');
				}
				// FIN CODE LEGACY
				// ***************

			} else {

				// ***************************
				// ** REFONTE MANUEL JUIN 2019
				// ***************************
				if (window.parent == window) {

					// TOP FRAME
					// ---------
					event.data.Result.datas.topWindow.outerWidth  = window.outerWidth;
					event.data.Result.datas.topWindow.innerWidth  = window.innerWidth;
					event.data.Result.datas.topWindow.outerHeight = window.outerHeight;
					event.data.Result.datas.topWindow.innerHeight = window.innerHeight;
					event.data.Result.datas.topWindow.title = document.title;

					event.data.Result.datas.topWindow.screenX = window.screenX;
					event.data.Result.datas.topWindow.screenY = window.screenY;

					self.DoResponse(event.data);
				}
				else {
					// On s'adresse à la mère pour demander la position de la frame dans laquelle on est
					// Requête (MsgType = RectReq), Réponse (MsgType = RectAns)
					// FIX_CONS console.log(window.document.URL + " sends RectReq to parent" );
					window.parent.postMessage({ MsgType: 'RectReq', RequestID: event.data.MsgDatas.RequestID }, '*');
				}

			} // endif

	    }
	    else if (event.data.MsgType && event.data.MsgType == 'RectReq') {
	        // FIX_CONS console.log(window.document.URL + " receives RectReq");

	        // La frame fille a demandé sa position
	        // On envoie la position à toutes les frames, car on ne sait pas de quelle iframe vient la demande.
	        // Seule la frame concernée la prendra en compte
	        var frameElements=document.documentElement.getElementsByTagName('iframe');
	        for (var i = 0; i < frameElements.length; i++) {
	            var iLeft = 0;
	            var iTop = 0;

	            var oElem = frameElements[i];
	            do {
	                iLeft += oElem.offsetLeft + oElem.clientLeft;
	                iTop += oElem.offsetTop + oElem.clientTop;
	                oElem = oElem.offsetParent;
	            } while (oElem);
				
				// Manuel 12 juillet 2019, il faut enlever le scroll courant du parent
				// -------------------------------------------------------------------
				iLeft -= window.scrollX;
				iTop  -= window.scrollY;
				
	            // FIX_CONS console.log(window.document.URL + " sends RectAns to child frame " + i);
	            frameElements[i].contentWindow.postMessage({ MsgType: 'RectAns', FramePos: { left: iLeft, top: iTop }, RequestID: event.data.RequestID }, "*");
	        }
	    }
	    else if (event.data.MsgType && event.data.MsgType == 'RectAns') {
	        // FIX_CONS console.log(window.document.URL + " receives RectAns");

	        // La frame mère a répondu à la demande de position : on incrémente le rect et on passe le bébé à la frame mère
	        if (RectRequest && event.data.RequestID == RectRequest.MsgDatas.RequestID) {
	            // On ne réagit que si on est à l'origine de la demande
	            RectRequest.Result.x += event.data.FramePos.left;
	            RectRequest.Result.y += event.data.FramePos.top;

	            // FIX_CONS console.log(window.document.URL + " continues with parent");
	            window.parent.postMessage(RectRequest, "*");
	        }
	    }
	});

	// acquitement d'injection réussie
	// -------------------------------
	self.MessageToContent( { 
		MsgType: 'BOOTSTRAP_INJECT_DONE' // --> ctx.message.BootstrapInjectDone 
	} );
	// NEVER FORGET : message SENT
	self.log( "**CTXI: BOOTSTRAP Injection done!" );
	
	return self;
})();