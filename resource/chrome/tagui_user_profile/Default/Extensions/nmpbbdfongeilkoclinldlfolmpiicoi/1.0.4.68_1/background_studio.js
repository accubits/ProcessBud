// FIX_CONS console.info("background_studio.js Started");

__CtxChrExtBack = (function( self ) {

// Traitement de la Capture d'une Appli
// ----------------------------
self.DoCaptureAppli = function(message) {
    
    chrome.tabs.query({
        active: true,
		lastFocusedWindow: true // manuel 5 juillet 2018, prise en compte popup et, plus généralement, multi-windows
    }, function (aTabs) {
        chrome.tabs.executeScript(aTabs[0].id, {
            code: "(function(){try{CxCaptureModule.TestInjected();return 'YES';} catch(e) {return 'NO';}})();",
            allFrames: false
        },
          function (aResults) {
			  if ( aResults === undefined ) {
				  // FIX_CONS console.log( "aResults undefined in Callback for DoCaptureAppli (testing if injected)" );
                  // Pas injecté
                  // Injection et exécution
                  chrome.tabs.executeScript(aTabs[0].id, {
                      file: "CxCapture.js",
                      allFrames: true
                  }, function () {
                      self.CaptureAppli(aTabs[0].id, message);
                  });
			  }
              if (aResults[0] == "YES") {
                  // déjà injecté
                  // Exécution seulement
                  self.CaptureAppli(aTabs[0].id, message);
              }
              else {
                  // Pas injecté
                  // Injection et exécution
                  chrome.tabs.executeScript(aTabs[0].id, {
                      file: "CxCapture.js",
                      allFrames: true
                  }, function () {
                      self.CaptureAppli(aTabs[0].id, message);
                  });
              }
          });
    });


    return;
} // DoCaptureAppli

self.CaptureAppli = function(tabId, message) {
    var internalFrameId = message.MsgDatas.FRAMEID.split("_")[1];
    var chromeFrameId = parseInt(message.MsgDatas.FRAMEID.split("_")[2], 10);

    chrome.tabs.executeScript(tabId, { 
			code: "CxCaptureModule.CxCapture('" + internalFrameId + "', 'APPLI', []);", 
			allFrames: true 
		},
		function (aResults) {
		    for (var i = 0 ; i < aResults.length && aResults[i] == "" ; i++) { }
		    // FIX_CONS console.log("CAPTURE=" + aResults[i]);

		    var strHwndTarget = message.hWndSender;
		    var strMsgType = message.MsgType + "_RESP";
		    var strReponse = message.MsgDatas.TimeStamp + "," + aResults[i];
		    self.MessageToBroker(strHwndTarget, strMsgType, strReponse);
		});

    return;
}

// Récupération de toutes les Pages
// ----------------------------------
self.DoCaptureAllFrames = function(message) {
    self.DoCaptureFrame(message);
    return;
} // DoCaptureAllFrames

// Récupération d'une Page (liste arborescente de ses sous iframes)
// ----------------------------------
self.DoCaptureFrame = function(message) {
    // Injection dans le content de l'onglet COURANT, même si déjà fait
    // ATTENTION AUX TABS "chrome://*"
    // ----------------------------------------------------------------

    // On vide la liste des identificateurs de frames, qui sera rempli de manière asynchrone
    self.frameIdentifications = [];

    chrome.tabs.query({ 
			active: true,
			lastFocusedWindow: true // manuel 5 juillet 2018, prise en compte popup et, plus généralement, multi-windows			
		}, function (aTabs) {
      chrome.tabs.executeScript(aTabs[0].id, { 
				code: "(function(){try{CxCaptureModule.TestInjected();return 'YES';} catch(e) {return 'NO';}})();", 
				allFrames: false },
        function (aResults) {

			// Nouvelle version (après 08/2018)
			// CxCapture est maintenant a été injecté dans la page de chaque frame
			self.CaptureFrames(aTabs[0].id, message);

			// Injection de CxCapture si pas déjà injecté dans le content de toutes les frames
			if (aResults != undefined && aResults[0] == "YES") {
            // déjà injecté
            // Exécution seulement
			// Ancienne version (avant 08/2018)
            //self.CaptureFrames(aTabs[0].id, message);
          }
          else {
            // Pas injecté
            // Injection et exécution
            chrome.tabs.executeScript(aTabs[0].id, { 
							file: "CxCapture.js", 
							allFrames: true 
						}, function () {
			// Ancienne version (avant 08/2018)
              //self.CaptureFrames(aTabs[0].id, message);
            });
          }
        });
    });

    return;
} // DoCaptureFrame

self.CaptureFrames = function(tabId, message) {
	// Nouvelle version (après 08/2018) : on envoie un message au content, qui va l'envoyer à injected, qui va appeler CxCaptureModule.CxGetFrameset
	var windowsZoom = 1; // TODO PLO : envoyer POINTX, POINTX, X, Y, multipliés par windowsZoom

	var msgToPass = {
						"MsgType": "CaptureFrames",
						"MsgDatas": {
										'HwndTarget': message.hWndSender,
										'MsgType': message.MsgType + "_RESP",
										'TimeStamp': message.MsgDatas.TimeStamp,
										'POINTX': message.MsgDatas.POINTX,
										'POINTY': message.MsgDatas.POINTY,
										'X': message.MsgDatas.X * windowsZoom,
										'Y': message.MsgDatas.Y * windowsZoom
									}
					};

    currentTabId = tabId;
	chrome.tabs.sendMessage( currentTabId, msgToPass, {frameId: 0} );

/*	
	// Ancienne version (avant 08/2018) : On appelle CxGetFrameset définie dans CxCapture du content de la frame main
    chrome.tabs.executeScript(tabId, {
			//code: "CxCaptureModule.CxGetFrameset({'HwndTarget':'" + message.hWndSender + "', 'MsgType':'" + message.MsgType + "_RESP" + "', 'TimeStamp':'" + message.MsgDatas.TimeStamp + "', 'POINTX':'" + message.MsgDatas.POINTX + "', 'POINTY':'" + message.MsgDatas.POINTY + "', 'X':'" + message.MsgDatas.X + "', 'Y':'" + message.MsgDatas.Y + "'});", 
			code: "MessageToInjected( {'MsgType': 'CaptureFrames'} );",
			allFrames: false },
		function (aResults) {
		    // DoNothing (asynchrone). Réponse dans message FRAMECAPTURE_RESULT (background.js)
		});
*/
}

// Traitement de la Capture du DOM d'une Page
// ----------------------------
self.DoCapturePage = function(message) {
		// Conversion en boolean
		var bDoScroll = (message.MsgDatas.DOSCROLL.toLowerCase() === "true");
	
		/* CAPTURE XML et SNAPSHOT */
    var tabId = parseInt(message.MsgDatas.FRAMEID.split("_")[0], 10);

		snapshots = [];
    // FIX_CONS console.log("DoCapturePage FRAMEID " + message.MsgDatas.FRAMEID + " tabId " + tabId);

		if (bDoScroll) {
			chrome.tabs.executeScript(tabId, {
	            code: "CxSnapshotModule.CxDoScrollInit();",
	            allFrames: false
	        },
		    function (aResults) {
						// Capture avec scroll
						SnapshotAndMove(message);
					}
	    );
		}
		else {
	    chrome.tabs.get(tabId, function (tab) {
	        var options = { format: "png" };
	        chrome.tabs.captureVisibleTab(tab.windowId, options, function (dataUrl) {
	            // Memoriser le DataUrl
	            snapshots.push(dataUrl);
							// Calcul de la réponse snapshot de la partie visible
							CalcSnapshotResponse(0, 0); // Le studio sait que si width et height est à 0 c'est à lui de calculer la taille de la bitmap unique
							// Capture du XML et renvoi de la réponse XML
							DoCaptureXml(message);
					});
			});
		}

    return;
} // DoCapturePage

self.DoPreviewScreen = function(message) {
		// Conversion en boolean
		var bDoScroll = (message.MsgDatas.DOSCROLL.toLowerCase() === "true");
	
		/* CAPTURE XML et SNAPSHOT */
    var tabId = parseInt(message.MsgDatas.FRAMEID.split("_")[0], 10);

		snapshots = [];
    // FIX_CONS console.log("DoCapturePage FRAMEID " + message.MsgDatas.FRAMEID + " tabId " + tabId);

		if (bDoScroll) {
			chrome.tabs.executeScript(tabId, {
	            code: "CxSnapshotModule.CxDoScrollInit();",
	            allFrames: false
	        },
		    function (aResults) {
						// Capture avec scroll
						SnapshotAndMove(message);
			});
		}
		else {
	    chrome.tabs.get(tabId, function (tab) {
	        var options = { format: "png" };
	        chrome.tabs.captureVisibleTab(tab.windowId, options, function (dataUrl) {
	            // Memoriser le DataUrl
	            snapshots.push(dataUrl);
							// Calcul de la réponse snapshot de la partie visible
							CalcSnapshotResponse(0, 0); // Le studio sait que si width et height est à 0 c'est à lui de calculer la taille de la bitmap unique
							self.DoCaptureScreen(message);	// Send the answer
					});
			});
		}

    return;
} // DoPreviewScreen

function doSleep(millis)
 {
  var date = new Date();
  var curDate = null;
  do { curDate = new Date(); }
  while(curDate-date < millis);
}
 
// Résultats des snapshots
var snapshots = []; // tableau de snapshots (data url, avec en-tête, puis base64)
var pageWidth = 0;
var pageHeight = 0; //
var snapshotResponse = "";

function SnapshotAndMove(message) {
    var tabId = parseInt(message.MsgDatas.FRAMEID.split("_")[0], 10);
    var internalFrameId = message.MsgDatas.FRAMEID.split("_")[1];
    var chromeFrameId = parseInt(message.MsgDatas.FRAMEID.split("_")[2], 10);

		// Tempo 0.5 secondes pour être sûr que la fenêtre a été repeinte
		doSleep(500);
	
    chrome.tabs.get(tabId, function (tab) {
        var options = { format: "png" };
        chrome.tabs.captureVisibleTab(tab.windowId, options, function (dataUrl) {
            // Memoriser le DataUrl
            snapshots.push(dataUrl);

            // Move
            chrome.tabs.executeScript(tabId, {
                code: "CxSnapshotModule.CxDoScrollContinue();",
                allFrames: false
            },
            function (aResults) {
                if (aResults[0].doContinue == true) {
                    SnapshotAndMove(message);
                }
                else {
                    // On a fini les snapshots
										// On calcule pour la partie snapshots
										CalcSnapshotResponse(aResults[0].pageWidth, aResults[0].pageHeight);
										// Capture du XML et renvoi de la réponse XML
										DoCaptureXml(message);
                }
            });
        });
    });

    return;
}

function CalcSnapshotResponse(width, height) {
	// Construction de la réponse pour les snapshots
	var codage = snapshots[0].split(",")[0].split(";")[1];
  var mimeType = snapshots[0].split(",")[0].split(";")[0].split(":")[1];
  snapshotResponse += "<CAPTURE Width='" + width + "' Height='" + height + "' imageMimeType='" + mimeType + "' codage='" + codage + "'>\n";

  for (var i = 0 ; i < snapshots.length ; i++) {
      var imageData = snapshots[i].split(",")[1];
      snapshotResponse += "    <BLOC><![CDATA[" + imageData + "]]></BLOC>\n";
  }
  snapshotResponse += "</CAPTURE>";
	// Le snapshotresponse sera envoyé dans la requête DoCaptureScreen
}

var backupMessage;
var retried = 0;

function DoCaptureXml(message) {
  backupMessage = message;

  var tabId = parseInt(message.MsgDatas.FRAMEID.split("_")[0], 10);
  var internalFrameId = message.MsgDatas.FRAMEID.split("_")[1];
  var chromeFrameId = parseInt(message.MsgDatas.FRAMEID.split("_")[2], 10);

	// Capture XML
  chrome.tabs.executeScript(tabId, {
      code: "try { CxCaptureModule.CxCapture('" + internalFrameId + "', 'PAGE', '" + message.MsgDatas.FIELDSLIST + "'); } catch(e) { console.log( 'EX in CxCapture :' + e ); }",
      allFrames: true
  },
  function (aResults) {
	  try {
		  var strReponse = '';
		  var strHwndTarget = message.hWndSender;
		  var strMsgType = message.MsgType + "_RESP";
		  
		  for (var i = 0 ; i < aResults.length && aResults[i] == "" ; i++) { }
		  // FIX_CONS console.log("CAPTURE=" + aResults[i]);
		  strReponse = message.MsgDatas.TimeStamp + "," + aResults[i];

		  // Réponse XML
		  // simulate exception to test too big captures : uncomment if (retried == 0) throw "error";
		  self.MessageToBroker(strHwndTarget, strMsgType, strReponse);
	  }
	  catch(error) {
		  if (retried == 1) {
			// Even without outerHtml the capture fails. Return the error message to the studio
			retried = 0;
			strReponse = message.MsgDatas.TimeStamp + "," + "ERROR" + error.toString();
			self.MessageToBroker(strHwndTarget, strMsgType, strReponse);
		  }
		  else {
			retried = 1;
			// Retry capture without outerHTML

			// remove outerHTML from backupMessage.MsgDatas.FIELDSLIST
			var fldlst = backupMessage.MsgDatas.FIELDSLIST.split('|');
			message.MsgDatas.FIELDSLIST = '';

			for (var i=0; i<fldlst.length; i++) {
				if (fldlst[i].toLowerCase() != 'outerhtml') {
					if (message.MsgDatas.FIELDSLIST != '')
						message.MsgDatas.FIELDSLIST = message.MsgDatas.FIELDSLIST + '|';
					
					message.MsgDatas.FIELDSLIST = message.MsgDatas.FIELDSLIST + fldlst[i];
				}
			}

			DoCaptureXml(backupMessage);
		  }
	  }
  });
}

self.DoCaptureScreen = function(message) {
	/* Renvoi snapshot capturé lors du DoCapturePage précédent */
	var strHwndTarget = message.hWndSender;
	var strMsgType = message.MsgType + "_RESP";
	var strReponse = message.MsgDatas.TimeStamp + "," + snapshotResponse;

	self.MessageToBroker(strHwndTarget, strMsgType, strReponse);
	
	snapshotResponse = "";

	return;
} // DoCaptureScreen

// Traitement de la Capture du Source d'une Page
// ----------------------------
self.DoCaptureSource = function(message) {
    var tabId = parseInt(message.MsgDatas.FRAMEID.split("_")[0], 10);
    var internalFrameId = message.MsgDatas.FRAMEID.split("_")[1];
    var chromeFrameId = parseInt(message.MsgDatas.FRAMEID.split("_")[2], 10);

    chrome.tabs.executeScript(tabId, { 
			code: "CxCaptureModule.CxGetSource('" + internalFrameId + "');", 
			allFrames: true 
		},
		function (aResults) {
		    for (var i = 0 ; i < aResults.length && aResults[i] == "" ; i++) { }
		    // FIX_CONS console.log("SOURCE=" + aResults[i]);

		    var strHwndTarget = message.hWndSender;
		    var strMsgType = message.MsgType + "_RESP";
		    var strReponse = message.MsgDatas.TimeStamp + "," + aResults[i];
		    self.MessageToBroker(strHwndTarget, strMsgType, strReponse);
		});

    return;
} // DoCaptureSource

// --------------------------------------------------------------------------------------------------
// Post traitement de la navigation asynchrone dans les iframes. Constitution de la chaine résultat : GetFrameCaptureString

self.frameIdentifications = [];
var currentTabId = "";
var identString = '    ';
var crStr = "\n";

var curPointedFrame = null;
var curMinSurface = -1;
var curPointX = 0;
var curPointY = 0;
var curWinX = 0;
var curWinY = 0;

self.GetFrameCaptureString = function(frameInfos, PointX, PointY, WinX, WinY) {
	// var zoomFactor = window.devicePixelRatio;
	var zoomFactor = frameInfos.zoomFactor;
	
	curPointedFrame = null;
	curMinSurface = -1;
	//curPointX = parseInt(PointX, 10) / zoomFactor;
	//curPointY = parseInt(PointY, 10) / zoomFactor;

	curPointX = parseInt(PointX, 10);
	curPointY = parseInt(PointY, 10);
	curWinX = WinX;
	curWinY = WinY;

	self.SetPointedFrame(frameInfos);
	return "<FRAMES>" + crStr + self.GetStringFromFrameInfos(frameInfos, 1) + "</FRAMES>";
}

self.SetPointedFrame = function(curFrame) {
	// Récupération du BoundingRect
	//var left = parseInt(curFrame.posX, 10);
	//var top = parseInt(curFrame.posY, 10);
	
	var zoomFactor = curFrame.zoomFactor;
	var left = curWinX + (parseInt(curFrame.posX, 10) - curWinX) * zoomFactor;
	var top = curWinY + (parseInt(curFrame.posY, 10) - curWinY) * zoomFactor;
		
	//var width = parseInt(curFrame.width, 10);
	//var height = parseInt(curFrame.height, 10);
	
	var width = parseInt(curFrame.width, 10) * zoomFactor;
	var height = parseInt(curFrame.height, 10) * zoomFactor;

	// Test si la souris est sur la frame
	if ((curPointX >= left) && (curPointX <= left+width) && (curPointY >= top) && (curPointY <= top+height)) {
		if (curMinSurface == -1) {
			// Première frame trouvée sous le curseur
			curPointedFrame = curFrame;
			curFrame.pointed = true;
			curMinSurface = width * height;
		}
		else {
			if (width * height < curMinSurface) {
				// On a trouvé une frame plus petite sous le curseur
				curPointedFrame.pointed = false;
				curFrame.pointed = true;
				curPointedFrame = curFrame;
				curMinSurface = width * height;
			}
		}
	}
	
	// Recherche parmi les enfants
	for (var i=0 ; i<curFrame.children.length ; i++) {
		self.SetPointedFrame(curFrame.children[i]);
	}
}

self.GetStringFromFrameInfos = function(frameInfos, curIdent) {
	var strResult = "";
	var curIdentString = new Array(curIdent + 1).join( identString );

	// Recherche du frameId dans frameIdentifications
	for (var i=0;i<self.frameIdentifications.length;i++) {
		if (self.frameIdentifications[i].frameId == frameInfos.frameId) {
			frameInfos.chromeFrameId = currentTabId + "_" + frameInfos.frameId + "_" + self.frameIdentifications[i].chromeFrameId;
			break;
		}
	}

	var strPointed = "";
	if (frameInfos.pointed) strPointed = " Pointed = 'true'";
	// bouchon
	// if (frameInfos.frameId == "N0") strPointed = " Pointed = 'true'"; else strPointed = "";
	
	strResult += curIdentString + "<FRAME Id='" + frameInfos.chromeFrameId + "'" + strPointed + ">" + crStr;
	strResult += curIdentString + identString + "<TITLE><![CDATA[" + frameInfos.frameTitle + "]]></TITLE>" + crStr;
	strResult += curIdentString + identString + "<URL><![CDATA[" + frameInfos.frameURL + "]]></URL>" + crStr;
	strResult += curIdentString + identString + "<BOUNDINGRECT><![CDATA[" + frameInfos.frameBoundingRect + "]]></BOUNDINGRECT>" + crStr;
	strResult += curIdentString + identString + "<TOTALRECT><![CDATA[" + frameInfos.frameTotalWidthHeight + "]]></TOTALRECT>" + crStr;
	strResult += curIdentString + identString + "<SCROLLPOS><![CDATA[" + frameInfos.frameScrollPosition + "]]></SCROLLPOS>" + crStr;
	
	if (frameInfos.children.length > 0) {
		strResult += curIdentString + identString + "<FRAMES>" + crStr;
		
		// Enfants
		for (var j=0;j<frameInfos.children.length;j++) {
			strResult += self.GetStringFromFrameInfos(frameInfos.children[j], curIdent + 2);
		}

		strResult += curIdentString + identString + "</FRAMES>" + crStr;
	}
	
	strResult += curIdentString + "</FRAME>" + crStr;

	return strResult;
}

}(__CtxChrExtBack));	
