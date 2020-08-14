var frameAnswerTimeout = 1000;
// FIX_CONS console.log("CxCapture injected in " + document.location.href);

var CxCaptureModule = (function () {
	var self = {};
	var identString = '    ';
	var crStr = "\n";
	
	var myFrameId = '';
	var myFrameRelativeBoundingRect = '';
	
	/** @type {ctx.frameClass} */ var frameInfos = new ctx.frameClass();
	
	var childrenAnswered = 0;
	
	// Test si on est dans le content ou dans la page (CxCapture est chargée dans les deux pour le moment
	// On ne veut brancher le listener que si on est dans la page (seul fonctionnement qui marche en Chrome et Firefox)
	try
	{
		// Doit provoquer une exception si on est dans la page
		chrome.runtime.sendMessage( {} );
	} catch(error)
	{
		// FIX_CONS console.log("Script is inside page (not in content) -> setting listener");
		// Si on atterrit là, c'est qu'on est dans la page (qui n'a pas accès aux WebExtensions)
		// On ne branche le listener que dans ce cas
		window.addEventListener("message", receiveMessage, false);
	}
	
	function CxRegisterFrame(ownId) {
		myFrameId = ownId;
		// Store myFrameID dans content (pour accès ultérieur par content lors de la capture
		document.dispatchEvent( new CustomEvent( '42CTX_FROM_PAGE', { detail: {"MsgType": "StoreMyFrameID", "MsgDatas": {"FrameID": myFrameId}} } ) );
		
		childrenAnswered = 0;

		var clientRect = document.documentElement.getBoundingClientRect();
		//frameInfos.frameBoundingRect = Math.trunc(clientRect.left) + '|' + Math.trunc(clientRect.top) + '|' + Math.trunc(clientRect.width) + '|' + Math.trunc(clientRect.height);

		if (ownId == "N0") {
			// Initialisation de la position de la top frame aux coordonnées reçues du studio
            // Pour les autres frames, les posX et posY auront été incrémentées par la frame parente
		    frameInfos.posX = parseInt(FromBrokerInfos.X, 10);
			frameInfos.posY = parseInt(FromBrokerInfos.Y, 10);
			
		    frameInfos.WinX = parseInt(FromBrokerInfos.X, 10);
			frameInfos.WinY = parseInt(FromBrokerInfos.Y, 10);

			if (isNaN(frameInfos.posX)) frameInfos.posX = 0;
			if (isNaN(frameInfos.posY)) frameInfos.posY = 0;
			
			frameInfos.TopPosX = frameInfos.posX;
			frameInfos.TopPosY = frameInfos.posY;
        }

		frameInfos.width = window.innerWidth;
		frameInfos.height = window.innerHeight;

		// Mémorisation locale des coordonnées de la frame pour la reconstitution d'un boundingrect relatif à la top frame au moment de la capture
		myFrameRelativeBoundingRect = (frameInfos.posX - frameInfos.TopPosX) + '|' + (frameInfos.posY - frameInfos.TopPosY) + '|' + frameInfos.width + '|' + frameInfos.height;

		// Mémorisation de myFrameRelativeBoundingRect dans content pour la capture
		document.dispatchEvent( new CustomEvent( '42CTX_FROM_PAGE', { detail: {"MsgType": "StoreMyRelativeBoundingRect", "MsgDatas": {"RelativeBoundingRect": myFrameRelativeBoundingRect}} } ) );

		var zoomFactor = window.devicePixelRatio;
		// Copie du zoomFactor dans le frameInfos car il vaut toujours 1 dans background !!
		frameInfos.zoomFactor = zoomFactor;
		//frameInfos.frameBoundingRect = Math.round(frameInfos.posX * zoomFactor) + '|' + Math.round(frameInfos.posY * zoomFactor) + '|' + Math.round(frameInfos.width * zoomFactor) + '|' + Math.round(frameInfos.height * zoomFactor);
		var realPosX = Math.round((frameInfos.posX - frameInfos.WinX) * zoomFactor) + frameInfos.WinX;
		var realPosY = Math.round((frameInfos.posY - frameInfos.WinY) * zoomFactor) + frameInfos.WinY;

		frameInfos.frameBoundingRect = realPosX + '|' + realPosY + '|' + Math.round(frameInfos.width * zoomFactor) + '|' + Math.round(frameInfos.height * zoomFactor);

		frameInfos.frameTotalWidthHeight = Math.trunc(clientRect.width) + '|' + Math.trunc(clientRect.height);
		frameInfos.frameScrollPosition = window.pageXOffset + '|' + window.pageYOffset;

		frameInfos.frameId = ownId;
		frameInfos.frameTitle = document.title;
		if (frameInfos.frameTitle == "") frameInfos.frameTitle = document.URL;
		frameInfos.frameURL = document.URL;

        // Nombre de frames dont cette frame va attendre une réponse
		frameInfos.frameNumberOfChildren = document.documentElement.getElementsByTagName('frame').length;
		frameInfos.frameNumberOfChildren += document.documentElement.getElementsByTagName('iframe').length;
		
		// Ancienne version (avant 08/2018)
		// Appel au background, passage du frameId. Le background va pouvoir lier le frameId au chromeFrameId
		//// FIX_CONS console.log("Identification sent : " + frameInfos.frameId + " URL : " + document.URL);
		/** @type { ctx.messageClass.FrameIdentification } */ var frameIdentification = new ctx.messageClass.FrameIdentification(frameInfos.frameId);
		//chrome.runtime.sendMessage( frameIdentification );
		
		// Nouvelle version (Après 08/2018)
		// On envoie le frameId au BackGround. Mais comme on est dans la page et plus dans le content, il faut passer par Content -> Background
		document.dispatchEvent( new CustomEvent( '42CTX_FROM_PAGE', { detail: frameIdentification } ) );	
		
		CxSendMessageToChildren(frameInfos);
	}

	function CloneFrameInfos(source) {
		var dest = {};
		dest.type = source.type;
		dest.direction = source.direction;
		dest.chromeFrameId = source.chromeFrameId;
		dest.parentId = source.parentId;
		// Correction régression frames
		// dest.parentWindow = source.parentWindow;
		dest.frameId = source.frameId;
		dest.frameTitle = source.frameTitle;
		dest.frameURL = source.frameURL;
		dest.frameBoundingRect = source.frameBoundingRect;
		dest.frameTotalWidthHeight = source.frameTotalWidthHeight;
		dest.frameScrollPosition = source.frameScrollPosition;
		dest.frameNumber = source.frameNumber;
		dest.pointed = source.pointed;
		dest.posX = source.posX;
		dest.posY = source.posY;
		dest.TopPosX = source.TopPosX;
		dest.TopPosY = source.TopPosY;
		dest.width = source.width;
		dest.height = source.height;
		dest.frameNumberOfChildren = source.frameNumberOfChildren;
		dest.timeOutHandle = source.timeOutHandle;
		dest.WinX = source.WinX;
		dest.WinY = source.WinY;
		dest.zoomFactor = source.zoomFactor;
		dest.children = [];
		
		return dest;
	}
	
	function CxSendMessageToChildren(recvFrameInfos) {
		if (recvFrameInfos.frameNumberOfChildren == 0) {
			if (recvFrameInfos.parentWindow == null) {
				// Pas de parent : on est sur une page sans frames. Renvoi du résultat
				SendCaptureResultToBackground(recvFrameInfos);
			}
			else {
				// Pas de frames filles : on remonte
				recvFrameInfos.direction = 'resp';

				// Correction régression frames
				var parentWindow = recvFrameInfos.parentWindow;
				recvFrameInfos.parentWindow = null;
				parentWindow.postMessage(recvFrameInfos, '*');
				
				//recvFrameInfos.parentWindow.postMessage(recvFrameInfos, '*');
			}
		}
		else {
			// Calcul de la liste des frames et iframes
			var iframeElements = document.documentElement.getElementsByTagName('iframe');
			var framesetElements = document.documentElement.getElementsByTagName('frame');

			// frameElements est un tableau de frames, iframes et frames (frameset) confondus
			var frameElements;
			
			if (iframeElements.length != 0 && framesetElements.length != 0)
				frameElements = iframeElements.concat(framesetElements);
			else if (iframeElements.length == 0)
				frameElements = Array.from(framesetElements);
			else
				frameElements = Array.from(iframeElements);
			
			// Passage du message aux frames filles
			for (var i=0;i<frameElements.length;i++) {
			    // var newframeInfos = JSON.parse(JSON.stringify(recvFrameInfos));
			    var newframeInfos = CloneFrameInfos(recvFrameInfos);
			    newframeInfos.parentId = recvFrameInfos.frameId;

			    newframeInfos.direction = 'req';
			    newframeInfos.frameNumber = i;

			    // Position de la sous frame
			    var frameElement = frameElements[i];
			    var frameWindow = frameElement.contentWindow;

			    var x = recvFrameInfos.posX;
			    var y = recvFrameInfos.posY;

			    var elem = frameElement;
			    while (elem != null) {
			        x += elem.offsetLeft + elem.clientLeft;
			        y += elem.offsetTop + elem.clientTop;
			        elem = elem.offsetParent;
			    }

			    newframeInfos.posX = x;
			    newframeInfos.posY = y;

			    // Attention closure : on appelle messageTimeout avec le paramètre newFrameInfos en timeout de frameAnswerTimeout
			    // Fonction appelée après frameAnswerTimeout ms, qui vérifie que la frame invoquée a répondu
                // Si pas de réponse, on considère qu'elle ne répondra jamais : on incrémente de 1 le nombre de réponse, mais on ne mémorise pas de frameInfos dans children
			    
				newframeInfos.timeOutHandle = setTimeout(function (newframeInfos) {
			        return function () {
			            messageTimeout(newframeInfos);
			        };
			    }(newframeInfos), frameAnswerTimeout);

    			// Envoi du message à la fille
				// FIX_CONS console.log('SENT ' + newframeInfos.frameId + ' -> ' + newframeInfos.frameId + 'N' + i + ' (setTimeout ' + newframeInfos.timeOutHandle + ')');
			    frameWindow.postMessage(newframeInfos, '*');
			}

		}
	}

	function messageTimeout(newFrameInfos) {
	    if (childrenAnswered != frameInfos.frameNumberOfChildren) {
            // On n'a pas eu toutes les réponses des filles

	        // La frame liée à ce timeout manque-t-elle à l'appel ?
	        var bFound = false;

	        for (var i = 0 ; i < frameInfos.children.length ; i++) {
	            if (newFrameInfos.frameNumber == frameInfos.children[i].frameNumber) {
	                bFound = true;
	                break;
	            }
	        }

	        if (!bFound) {
	            //La frame n'a pas répondu. On remonte le message quand même, frameId à vide pour ne pas mémoriser la réponse
				// FIX_CONS console.log("** WARNING ** La réponse de " + newFrameInfos.frameId + "N" + newFrameInfos.frameNumber + " n'est pas arrivée à temps pour " + newFrameInfos.frameTitle + " (" + newFrameInfos.frameURL + ")");
	            newFrameInfos.direction = "resp";
	            newFrameInfos.frameId = "";
	            window.postMessage(newFrameInfos, '*');
	        }
	    }
	}

	function SendCaptureResultToBackground(recvFrameInfos) {
		// FIX_CONS console.log('Frameset constitué. Envoi au background');

		// Ancienne version (avant 08/2018)
		/*
		chrome.runtime.sendMessage( { 
			MsgType: ctx.message.FrameCaptureResult, 
			MsgDatas: recvFrameInfos , 
			FromBrokerInfos:FromBrokerInfos
		} );
		*/
		
		// Nouvelle version (Après 08/2018)
		// On envoie le résultat de la capture au BackGround. Mais comme on est dans la page et plus dans le content, il faut passer par Content -> Background
		var frameCaptureResult = { 
			MsgType: ctx.message.FrameCaptureResult, 
			MsgDatas: recvFrameInfos , 
			FromBrokerInfos:FromBrokerInfos
		};
		
		document.dispatchEvent( new CustomEvent( '42CTX_FROM_PAGE', { detail: frameCaptureResult } ) );	

	}
	
	function receiveMessage(event)
	{
		if (event.data.type && event.data.type == 'ctxt_msg') {
			if (event.data.direction == 'req') {
				// Message descendant. Le frameInfos est celui reçu dans le message reçu du parent
				frameInfos = event.data;
				frameInfos.parentWindow = event.source;

				var newFrameId = frameInfos.frameId + 'N' + event.data.frameNumber;
				
				// Message reçu : on envoie un message à la frame mère pour qu'elle annule son timeout
				if (frameInfos.parentWindow) {
					var tmpMess = new ctx.frameClass();
					tmpMess.direction = 'acq';
					// A titre indicatif, pour affichage du log
					tmpMess.frameId = frameInfos.frameId + ' - ' + newFrameId;
					tmpMess.timeOutHandle = frameInfos.timeOutHandle;
					frameInfos.parentWindow.postMessage(tmpMess, '*');
				}
				
				// FIX_CONS console.log('RECV ' + frameInfos.frameId + ' -> ' + newFrameId);
				CxRegisterFrame(newFrameId);
			}
			else if (event.data.direction == 'acq') {
				// La fille a reçu le message : cancel du timeout
				// FIX_CONS console.log(event.data.frameId + ' : clearTimeout (' + event.data.timeOutHandle + ')');
				clearTimeout(event.data.timeOutHandle);
			}
			else {
			    // Message montant. Le frameInfos est celui stocké dans la frame
			    // On mémorise les infos de la frame qui a répondu, seulement si c'est une vraie réponse et non un timeout
			    if (event.data.frameId != "") {
			        frameInfos.children.push(event.data);
					// FIX_CONS console.log('RECV UP FROM ' + event.data.frameId);
				}

				childrenAnswered += 1;
				if (childrenAnswered == frameInfos.frameNumberOfChildren) {
					// Tous les enfants ont répondu
					if (frameInfos.parentWindow) {
						// On n'est pas à la racine, on poste la réponse au parent
						frameInfos.direction = 'resp';
						// Correction régression frames
						var parentWindow = frameInfos.parentWindow;
						frameInfos.parentWindow = null;
						parentWindow.postMessage(frameInfos, '*');
						//frameInfos.parentWindow.postMessage(frameInfos, '*');
					}
					else {
						// On est à la racine, on rappelle le background en lui passant frameInfos
						SendCaptureResultToBackground(frameInfos);
					}

                    // On vide la liste des children pour repartir d'une liste de frames filles vide au prochain appel
					frameInfos.children = [];
				}
			}
		}
	}

	var FromBrokerInfos;
	
	self.TestInjected = function() {
		return;
	}
	
	self.CxGetFrameset = function(oFromBrokerInfos) {
		FromBrokerInfos = oFromBrokerInfos;
		
		// FIX_CONS console.log('Demande de frameset reçue');
		CxRegisterFrame('N0');
		return "";
	}

	self.CxCapture = function(targetFrameId, captureType, fieldsList) {
		// FIX_CONS console.log('Page capture request for frame ' + targetFrameId + ' received by frame ' + MyContentFrameID);
		try
		{
			if (myFrameId == targetFrameId || MyContentFrameID == targetFrameId) {
				// FIX_CONS console.log('Frame is matching request. Building XML capture of the page');
			
				// captureType = "PAGE" ou "APPLI"
				// FIX_CONS console.log('Capturing frame ' + targetFrameId);
					
				var zoomFactor = window.devicePixelRatio;
				var returnValue = "";

				returnValue += "<" + captureType + " Techno=\"WEB\" ";
				returnValue += "RatioX=\"" + parseInt(zoomFactor * 100) + "\" RatioY=\"" + parseInt(zoomFactor * 100) + "\" ";
				// Correction régression screenshot sous frame : le studio attend un boundingrect (??)
				if (captureType == "PAGE" && targetFrameId != 'N0') returnValue += "BoundingRect=\"" + MyContentFrameRelativeBoundingRect + "\" ";
				returnValue += "Name=\"" + htmlEscape(document.title) + "\" ProcessName=\"CHROME\" ParamName=\"" + htmlEscape(document.URL) + "\" ParentTree=\"\">" + crStr;
				returnValue += identString + "<PROPERTIES>" + crStr;
				returnValue += identString + identString + "<DOMAIN><![CDATA[" + window.location.hostname + "]]></DOMAIN>" + crStr;
				returnValue += identString + identString + "<URL><![CDATA[" + document.URL + "]]></URL>" + crStr;
				returnValue += identString + identString + "<TITLE><![CDATA[" + document.title + "]]></TITLE>" + crStr;
				returnValue += identString + identString + "<MAINFRAME>" + (window == window.top) + "</MAINFRAME>" + crStr;
				returnValue += identString + identString + "<CX>" + htmlEscape(document.body.clientWidth) + "</CX>" + crStr;
				returnValue += identString + identString + "<CY>" + htmlEscape(document.body.clientHeight) + "</CY>" + crStr;
				returnValue += identString + "</PROPERTIES>" + crStr;

				if (captureType == "PAGE") {
						var oldX = window.scrollX;
						var oldY = window.scrollY;
					
						if (oldX != 0 || oldY != 0) {
							window.scrollTo(0,0);
						}
					
					var fieldNames = fieldsList.split('|');

					returnValue += identString + "<CHILDREN>" + crStr;
					var innerResult = CxNodeCapture(2, document.documentElement, fieldNames, new Array);
					returnValue += innerResult;
					returnValue += identString + "</CHILDREN>" + crStr;

					window.scrollTo(oldX, oldY);
				}

				returnValue += "</" + captureType + ">";
				
				// FIX_CONS console.log('Capture finished');
				return returnValue;
			}
			else {
				// FIX_CONS console.log('Frame is NOT matching request. ABORTING');
				return "";
			}
		}
		catch(error)
		{
			// FIX_CONS console.log('Error in CxCapture : ' + error.toString());
			return '<' + captureType + ' Techno="WEB"><PROPERTIES><CTX_ERROR>' + error.toString() + '</CTX_ERROR>' + '</PROPERTIES></' + captureType + '>';
		}
	}
	
	self.CxGetSource = function(targetFrameId) {
		if (myFrameId == targetFrameId || MyContentFrameID == targetFrameId) {
			var rootElement = document.documentElement;
			return rootElement.outerHTML;
		}
		else return "";
	}

	function arrayObjectIndexOf(myArray, searchTerm, property) {
	    for (var i = 0, len = myArray.length; i < len; i++) {
	        if (myArray[i][property] === searchTerm) return i;
	    }
	    return -1;
	}

	function CxNodeCapture(curIdent, curElement, fieldNames, TagRanges) {
		try {
			/**
			* @class TagRange
			* @constructor
			* @struct
			*/		
			function TagRange() {
				this.name = "";
				this.range = 0;
			}

			var result = "";
			var curIdentString = new Array(curIdent + 1).join( identString );
			var crStr = "\n";

			// --------------------------------------------------------------------
			result += curIdentString + "<ITEM>" + crStr;

			// --------------------------------------------------------------------

			// PROPERTIES
			result += curIdentString + identString + "<PROPERTIES>" + crStr;

			var reflector = new Reflector(curElement, fieldNames);
			var attribs = reflector.getProperties();

			result += curIdentString + identString + identString + "<TAG>" + htmlEscape(curElement.tagName) + "</TAG>" + crStr;
			
			// Attributs passés par le studio
			for (var attr in fieldNames) {
				if (fieldNames[attr].toUpperCase() == "RANGE") {
					var curRange = 0;

					// Cas particulier de la propriété range
					var iIndex = arrayObjectIndexOf(TagRanges, curElement.tagName.toUpperCase(), "name");

					if (iIndex == -1) {
						// Première fois qu'on voit ce tag
						var newTagRange = new TagRange(); 
						newTagRange.name = curElement.tagName.toUpperCase();
						newTagRange.range = curRange;
						TagRanges.push(newTagRange);
					}
					else {
						TagRanges[iIndex].range += 1;
						curRange = TagRanges[iIndex].range;
					}

					result += curIdentString + identString + identString + "<range>" + curRange + "</range>" + crStr;
				}
				else if (fieldNames[attr].toUpperCase() == "TEXT") {
					if (curElement.innerText != "") result += curIdentString + identString + identString + "<Text>" + htmlEscape(curElement.innerText) + "</Text>" + crStr;
				}
				else if (fieldNames[attr].toUpperCase() == "INNERHTML") {
					if (curElement.innerHTML != "") result += curIdentString + identString + identString + "<innerHTML>" + htmlEscape(curElement.innerHTML) + "</innerHTML>" + crStr;
				}
				else if (fieldNames[attr].toUpperCase() == "OUTERHTML") {
					if (curElement.outerHTML != "") result += curIdentString + identString + identString + "<OuterHTML>" + htmlEscape(curElement.outerHTML) + "</OuterHTML>" + crStr;
				}
				else if ((curElement.attributes[fieldNames[attr]] != undefined) && (tagIsOk(fieldNames[attr]))) {
					result += curIdentString + identString + identString + "<" + fieldNames[attr] + ">" + htmlEscape(curElement.attributes[fieldNames[attr]].value) + "</" + fieldNames[attr] + ">" + crStr;
				}
			}

			// Autres attrubuts trouvés par réflexion
			for (var attrib in attribs) {
				if ((curElement.attributes[attribs[attrib]] != undefined) && (tagIsOk(attribs[attrib]))) {
					result += curIdentString + identString + identString + "<" + attribs[attrib] + ">" + htmlEscape(curElement.attributes[attribs[attrib]].value) + "</" + attribs[attrib] + ">" + crStr;
				}
			}

			result += curIdentString + identString + "</PROPERTIES>" + crStr;

			// --------------------------------------------------------------------

			// CTX_PROPS
			var clientRect = curElement.getBoundingClientRect();
			var strBoundingRect = Math.trunc(clientRect.left) + "|" + Math.trunc(clientRect.top) + "|" + Math.trunc(clientRect.width) + "|" + Math.trunc(clientRect.height);
			
			var strLeafText = "";
			if (curElement.children.length == 0) strLeafText = curElement.innerText; // Seulement sur les feuilles

			var strTitle = curElement.tagName;
			if (strLeafText != "") strTitle += " - " + strLeafText;
			
			var strPrefix = "";
			switch(curElement.tagName.toUpperCase()) {
				case "BUTTON":
				case "SUBMIT":
				case "A":
				case "RADIO":
				case "CHECKBOX":
					strPrefix = "bt";
					break;
				case "INPUT":
					if ( ( (curElement.attributes["type"] != undefined) && (curElement.attributes["type"].value.toUpperCase() == "BUTTON") ) ||
					   ( (curElement.attributes["class"] != undefined) && (curElement.attributes["class"].value.toUpperCase() == "BUTTON") ) )
						strPrefix = "bt";
			}
			
			var strId = "id";
			if (curElement.attributes[attribs["id"]] == undefined) strId = "name";
			
			var strTextKey = "Text";
			
			var strParamName = "";
			if (curElement.attributes[strTextKey] != undefined) strParamName = curElement.attributes[strTextKey].value;
			
			result += curIdentString + identString + "<CTX_PROPS>" + crStr;
			result += curIdentString + identString + identString + "<BOUNDINGRECT>" + htmlEscape(strBoundingRect) + "</BOUNDINGRECT>" + crStr;
			result += curIdentString + identString + identString + "<TITLE>" + htmlEscape(strTitle) + "</TITLE>" + crStr;
			result += curIdentString + identString + identString + "<NAMEKEY>" + htmlEscape(strId) + "</NAMEKEY>" + crStr;
			result += curIdentString + identString + identString + "<CONTROLTYPE>" + htmlEscape(curElement.tagName) + "</CONTROLTYPE>" + crStr;
			result += curIdentString + identString + identString + "<PREFIX>" + htmlEscape(strPrefix) + "</PREFIX>" + crStr;
			result += curIdentString + identString + identString + "<TEXT>" + htmlEscape(strLeafText) + "</TEXT>" + crStr;
			result += curIdentString + identString + identString + "<TEXTKEY>" + htmlEscape(strTextKey) + "</TEXTKEY>" + crStr;
			result += curIdentString + identString + identString + "<PARAMNAME>" + htmlEscape(strParamName) + "</PARAMNAME>" + crStr;
			result += curIdentString + identString + identString + "<PARENTTREE></PARENTTREE>" + crStr;
			result += curIdentString + identString + identString + "<ISVISIBLE>true</ISVISIBLE>" + crStr;
			result += curIdentString + identString + "</CTX_PROPS>" + crStr;
			
			// --------------------------------------------------------------------

			// Children
			result += curIdentString + identString + "<CHILDREN>" + crStr;
			var curChildren = curElement.children;
			var childrenTagRanges = [];
			for (var iChildIndex=0 ; iChildIndex<curChildren.length ; iChildIndex++)
				result += CxNodeCapture(curIdent + 2, curChildren[iChildIndex], fieldNames, childrenTagRanges);
			result += curIdentString + identString + "</CHILDREN>" + crStr;

			// --------------------------------------------------------------------

			result += curIdentString + "</ITEM>" + crStr;
			
			return result;
		}
		catch(error) {
			// FIX_CONS console.log('Error in CxNodeCapture' + error.toString());
			return "<ITEM><PROPERTIES><ERROR>" + error.toString() + "</ERROR></PROPERTIES><CTX_PROPS><BOUNDINGRECT>0|0|0|0</BOUNDINGRECT><TITLE>ERROR1</TITLE><NAMEKEY>ERROR2</NAMEKEY><CONTROLTYPE>ITEM</CONTROLTYPE><PREFIX></PREFIX><TEXT>ERROR</TEXT><TEXTKEY>ERROR5</TEXTKEY><PARAMNAME>ERROR6</PARAMNAME><PARENTTREE></PARENTTREE><ISVISIBLE>true</ISVISIBLE></CTX_PROPS></ITEM>";
		}
	}

	/**
	* @class Reflector
	* @struct
	* @constructor
	*/
	var Reflector = function(obj, fieldNames) {
        this.getProperties = function() {
            var properties = [];
            for (var prop in obj) {
                try {
                    if (fieldNames.indexOf(prop) == -1 && (typeof obj[prop] != 'function')) {
                        properties.push(prop);
                    }
                }
                catch(ex) {}
            }

            // Ajout en dur de la propriété "class" si possible (il n'apparait pas à la réflexion...)
            try {
                if (fieldNames.indexOf('class') == -1 && obj.attributes['class'] != undefined)
                    properties.push('class');
            }
            catch (ex) { }

            return properties;
        };
	}
	
	function tagIsOk(str) {
		//if (str.toUpperCase() == "XML") return false;
		if ( (str.toUpperCase().charCodeAt(0) >= "A".charCodeAt(0)) && (str.toUpperCase().charCodeAt(0) >= "A".charCodeAt(0)) ) return true;
		if ( (str.substr(0,1) == "_") || (str.substr(0,1) == ":") ) return true;
		return false;
	}
	
	function htmlEscape(str) {
		return String(str)
				.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
	}
	
	return self;
})();

var CxSnapshotModule = (function () {
    var self = {};

    var pageWidth;
    var pageHeight;
    var bFirstRow;
    var bFirstCol;
    var initialX;
    var initialY;
    var oldX;
    var oldY;

    var response = {};

    self.CxDoScrollInit = function () {
        pageWidth = window.innerWidth;
        pageHeight = window.innerHeight;
        initialX = window.scrollX;
        initialY = window.scrollY;

        window.scrollTo(0, 0);

				// Init des tailles de scrollbars, taille totale de la page, une fois pour toutes (nécessaire dans le cas de facebook qui agrandit la page au fur et à mesure)
				var scrollbarSize = getScrollBarSize();
				horizontalScrollbarHeight = scrollbarSize;
				verticalScrollbarWidth = scrollbarSize;
			
				initialScrollWidth = window.document.body.scrollWidth;
				initialScrollHeight = window.document.body.scrollHeight;
			
				if (window.innerWidth == initialScrollWidth) horizontalScrollbarHeight = 0;
				if (window.innerHeight == initialScrollHeight) verticalScrollbarWidth = 0;
			
        return;
    }

	var horizontalScrollbarHeight = 0;
	var verticalScrollbarWidth = 0;
	var initialScrollWidth = 0;
	var initialScrollHeight = 0;

	self.CxDoScrollContinue = function () {
			// Essai scroll horizontal
		oldX = window.scrollX;
		oldY = window.scrollY;
		window.scrollTo(oldX + window.innerWidth, window.scrollY);
		if ( (window.scrollX != oldX) && (window.scrollX + window.innerWidth < initialScrollWidth + verticalScrollbarWidth) ) {
			// Succès
			if (window.scrollY == 0) pageWidth += (window.scrollX - oldX)
			response.doContinue = true;
			return response;
		}
		else {
			// Echec en X. On essaie en Y
			window.scrollTo(0, oldY + window.innerHeight);
			if ( (window.scrollY != oldY) && (window.scrollY + window.innerHeight < initialScrollHeight + horizontalScrollbarHeight) ) {
				pageHeight += (window.scrollY - oldY);
				response.doContinue = true;
				return response;
			}
			else {
				// Echec en Y -> on a fini
				window.scrollTo(initialX, initialY);
				response.doContinue = false;
				response.pageWidth = pageWidth;
				response.pageHeight = pageHeight;
				return response;
			}
		}
	}

	function getScrollBarSize () {
	  var inner = document.createElement('p');
	  inner.style.width = "100%";
	  inner.style.height = "200px";

	  var outer = document.createElement('div');
	  outer.style.position = "absolute";
	  outer.style.top = "0px";
	  outer.style.left = "0px";
	  outer.style.visibility = "hidden";
	  outer.style.width = "200px";
	  outer.style.height = "150px";
	  outer.style.overflow = "hidden";
	  outer.appendChild (inner);

	  document.body.appendChild (outer);
	  var w1 = inner.offsetWidth;
	  outer.style.overflow = 'scroll';
	  var w2 = inner.offsetWidth;
	  if (w1 == w2) w2 = outer.clientWidth;

	  document.body.removeChild (outer);

	  return (w1 - w2);
	};
		
    return self;
})();