// CxAppChrome.js : Pilote Chrome "In Page"
// Manuel février-mars 2016
// Version 0.2 début travaux ITEMS
// Version 0.3 première reprise complète du monstrueux "CxWebFindElements" de WEB3 SAUF <SET/>
// Version 0.4 première version qui marche UN PEU et qui gère OCCURS/SET/ANCESTOR MAIS PAS FINI
// Version 0.5 OCCURS/SET/ANCESTOR normalement terminé. Refonte de la gestion des ACTION/ACTION2
// Version 0.6 Gestion de pas mal d'Action/Action2 et prise en compte de CaptData (NON cached)
// Version 0.7 fin août 2016 : corrections finels sur Ancestor
// ---------------------------------------------------------------------------------------------

// Module patern, tel qu'expliqué, par exemple ici:
// http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
// Ici on utilise le patern "Augmentation"

// NORMALISATION VALEURS DE RETOUR
// ===============================
// Les APIs du pilote RENDENT SYSTEMATIQUEMENT UN Booléen. NON négotiable,
// pour des raisons de fiabilité, performances, cohérences
// Si une API rend false, "all bets are Off", gros problème, rien d'autre
// à faire que de remonter UNE ERREUR.
// Une API qui cherche un Item Running va RENDRE TRUE si l'item n'existe pas
// mais qu'aucune ERREUR ne s'est produite pendant la recherche.
// Les véritables valeurs de retour SONT DONC RENVOYÉES EN METTANT À JOUR
// UN OBJET PASSÉ EN PARAMÈTRE.
// Reste à préciser : comment on renvoit des "informations" sur l'erreur...
// =========================================================================
// QUOI                                                                
// **TODO noeud <ONLOAD>
// **TODO recherche directe par id quand possible (+ namedItem ?)
// **TODO Perf ++ en LAISSANT TOMBER le check si un attribut
//        existe avant de demander sa valeur, ce qui EST CODÉ
//        pour faire la différence entre Attribut existe avec
//        chaîne vide VS attribut innexistant ????
// **TODO CRIT_NUM
// **
// =========================================================================


// __CtxChrExtInj : namespace global du connecteur
// Attention de ne pas changer ce nom, il est utilisé notamment dans 'SCRIPTITEM' / 'CALLITEM'
__CtxChrExtInj = (function( self ) {

	self.ContextorElem = null; // utilisé par 'SCRIPTITEM' / 'CALLITEM'
	
	self.ContextorClass = function() {

	/***************************************************
	* Method Event
	* @method self.ContextorClass.Event
	* @param {string} strEventName
	* @param {string} strAppliName
	* @param {string} strPageName
	* @param {string} strItemName
	* @param {number} iInstanceAppli
	* @param {number} iInstancePage
	* @param {string} strDatas
	******************************************************/
		this.Event = function( strEventName, strAppliName, strPageName, strItemName, iInstanceAppli, iInstancePage, strDatas ) {
			if ( self.bCouplage === false ) return;
			if ( self.oRunningAppliDesc === null ) return;
			if ( self.oRunningPageDesc === null ) return;
			var oMsgToCtx = { 
				EventName : strEventName,
				AppliName : strAppliName || "",
				AppliInstance : iInstanceAppli || -1,
				PageName  : strPageName || "",
				PageInstance  : iInstancePage || -1,
				ItemName  : strItemName || "",
				// **TODO !?! Attention : undefined, ou vide, ou _Default_ ???
				ObjectData: (strDatas === undefined ? '' : strDatas)
			};
			
			// Si le nom de l'appli est vide, il faut mettre l'appli en cours
			// --------------------------------------------------------------
			if ( oMsgToCtx.AppliName === "" ) oMsgToCtx.AppliName = self.oRunningAppliDesc.AppliName;
			// si le nom de page est "_Empty_", alors il faut le mettre à blanc
			// par contre s'il est vide, il faut mettre le nom de la page en cours
			if ( oMsgToCtx.PageName === "_Empty_" ) {
				oMsgToCtx.PageName = "";
			} else if ( oMsgToCtx.PageName === "" ) {
				oMsgToCtx.PageName = self.oRunningPageDesc.PageName;
				oMsgToCtx.PageInstance = self.oRunningPageDesc.PageInstance;
			} // endif
			self.SendEventToContextor( oMsgToCtx );
			return;
		};
		
	/***************************************************
	* @method self.ContextorClass.Log
	* @param {number} iInstancePage
	* @param {string} strDatas
	******************************************************/
		this.Log = function( iInstancePage, strDatas ) {
			var oMsgToCtx = { 
				EventName : 'LOG',
				PageInstance  : iInstancePage,
				ObjectData: strDatas
			};
			self.SendEventToContextor( oMsgToCtx );
			return 0;
		}; 
	}
	
  //self.CHROME_ERROR = -10042;
  //self.CHROME_OK = 0;
	self.bCouplage = false;
	self.aDescApplis = null;

	// RECO RUNTIME
	// ************
	self.oRunningAppliDesc = null;
	self.oRunningPageDesc = null;
	self.bUndefined = false;
	self.uniqueID = {};
	self.strEngineVersion = "";
	
	/***************************************************
	* Method DoCouplage
	* @method self.DoCouplage
	* @param {ctx.messageClass.ActionBase} message
	* @return {boolean}
	******************************************************/
	self.DoCouplage = function( message ) {
		if ( self.bCouplage === true ) {
			self.warn( "**CTXP: DoCouplage : Already Done. Redo for " + document.URL );
		} else {
			self.info( "**CTXP: DoCouplage for " + document.URL );
		} // endif
		self.bCouplage = true;
		// manuel 15/04/2016 : ajout d'une chaîne version dans les datas : les datas
		// deviennent MAINTENANT un OBJET au format suivant:
		// {
		//   "aDescApplis : [ blabla blabla ]
		//   "strEngineVersion": "3.1.1.0",
		// }
		self.aDescApplis = message.MsgDatas.aDescApplis;
		self.strEngineVersion = message.MsgDatas.strEngineVersion;
		self.oRunningAppliDesc = null;
		self.oRunningPageDesc = null;
		self.bUndefined = false;
		/*** SUPER VERBEUX POUR DEBUG
		self.log( "**CTXP COUPLAGE JSON DUMP: " + JSON.stringify( message.MsgDatas ) );
		*****/
		window.setTimeout( self.RecoPageTick, 200 );
		return true;
	};
	
	/***************************************************
	* Method DoDeCouplage
	* @method self.DoDeCouplage
	* @param {ctx.messageClass.ActionBase} message
	* @return {boolean}
	******************************************************/
	self.DoDeCouplage = function( message ) {
		if ( self.bCouplage === false ) {
			self.warn( "**CTXP: DoDeCouplage : NOT Coupled. For " + document.URL );
		} else {
			self.info( "**CTXP: DoDeCouplage for " + document.URL );
		} // endif
		self.bCouplage = false;
		self.aDescApplis = null;
		self.oRunningAppliDesc = null;
		self.oRunningPageDesc = null;
		self.bUndefined = false;
		return true;
	};
	
	/***************************************************
	* Method LogPerf
	* @method self.LogPerf
	* @param {string} strPrefix
	* @param {string} TimeStampStart
	* @return {boolean}
	******************************************************/
	self.LogPerf = function( strPrefix, TimeStampStart ) {
		var TimeStampEnd = performance.now();
		var fPerf = TimeStampEnd - TimeStampStart;
		fPerf = fPerf.toFixed(2);
		self.log( "**CTXP LogPerf " + strPrefix + " : " + fPerf + " milliseconds" );	
		return true;
	};
	
	// **MAyDO PERF : return by index !?!
	// ----------------------------------
	/***************************************************
	* Method FindDescItemByName
	* @method self.FindDescItemByName
	* @param {ctx.descriptor.Page} oPageDesc
	* @param {string} ItemName
	* @return {ctx.descriptor.Item}
	******************************************************/
	self.FindDescItemByName = function( oPageDesc, ItemName ) {
		var nDescCount = (oPageDesc.aDescItems ? oPageDesc.aDescItems.length : 0);
		for ( var index = 0; index < nDescCount; ++index ) {
			if ( oPageDesc.aDescItems[ index ].ItemName === ItemName ) 
				return oPageDesc.aDescItems[ index ];
		} // end for
		return null;
	};
	
	// Cette fonction rend true, avec le nom d'item sans les indexes
	// dans oReturnValue.strValue OU BIEN false avec un libellé
	// d'erreur dans oReturnValue.strValue
	// --------------------------------------------------------------
	/***************************************************
	* Method TraiteItemIndex
	* @method self.TraiteItemIndex
	* @param {string} ItemName
	* @param {Array<number>} aIndexes
	* @param {ctx.returnValueClass} oReturnValue
	* @return {boolean}
	******************************************************/
	self.TraiteItemIndex = function( ItemName, aIndexes, oReturnValue ) {
		// reprise algo WEB3, comme ça, pourquoi pas, yolo
		// -----------------------------------------------
		if ( ItemName.length === 0 ) {
			oReturnValue.strValue = "Empty Item Name";
			return false;
		} // endif
		var strRemainingName = ItemName;
		while ( true ) {
			// si le dernier caractère n'est pas ']'
			// c'est fini
			// ------------------------------------
			if ( strRemainingName.lastIndexOf( ']' ) !== strRemainingName.length - 1 ) {
				break;
			} // endif
			// recherche du dernier ouvrant
			// ----------------------------
			var nLastOpeningBracket = strRemainingName.lastIndexOf( '[' )
			if ( nLastOpeningBracket === -1 ) {
				oReturnValue.strValue = "Invalid Index Syntax";
				return false;
			} // endif
			// récupération du contenu du dernier couple []
			// --------------------------------------------
			var nLengthIndex = strRemainingName.length - 1 - ( nLastOpeningBracket + 1 );
			var strOneIndex = strRemainingName.substr( nLastOpeningBracket + 1, nLengthIndex );
			// stockage
			// --------
			if ( strOneIndex === "J" ) {
				aIndexes.push( -3 );
			} else if ( strOneIndex === "N" ) {
				aIndexes.push( -2 ); // silently deprecated, traité comme -3
			} else if ( strOneIndex === "n" ) {
				aIndexes.push( -1 ); // silently deprecated, traité comme -3
			} else {
				// **TODO CHECK (genre [-32500] marche nickel, mais bon, pas normal)
				// -----------------------------------------------------------------
				aIndexes.push( parseInt( strOneIndex, 10 ) );
			} // endif
			// Supression dernier couple
			// -------------------------
			strRemainingName = strRemainingName.substr( 0, nLastOpeningBracket );
		} // end while
		aIndexes.reverse(); // quand même plutôt cool, celle là
		oReturnValue.strValue = strRemainingName;
		return true;
	};
	
	/***************************************************
	* Method ElementsCount
	* @method self.ElementsCount
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {Array<ctx.elementResult>} aElementsResult
	* @param {ctx.returnValueClass} oReturnValue
	* @return {boolean}
	******************************************************/
	self.ElementsCount = function( ItemInfos, aElementsResult, oReturnValue ) {
		var IndexCount = ItemInfos.aIndexes.length;
		if ( IndexCount === 0 ) {
			oReturnValue.strValue = "ElementsCount called with NO Indexes for " + ItemInfos.FullItemName;
			return false;
		} // endif
		// Le dernier DOIT être [n] (ou N ou J)
		// ------------------------------------
		if ( ItemInfos.aIndexes[ IndexCount - 1 ] >= 0 ) {
			oReturnValue.strValue = "ElementsCount called with invalid last Index for " + ItemInfos.FullItemName;
			return false;
		} // endif
		// Boucler sur les index à consommer, et rendre le compte d'élément pour le dernier
		// poste ou bien rendre Zéro si on ne peut satisfaire une des demandes
		// --------------------------------------------------------------------------------
		/** @type {Array<ctx.elementResult>} */ var aElementsResultToBeCounted = aElementsResult;
		for ( var indexToEat = 0; indexToEat < IndexCount - 1; ++indexToEat ) { // _NbOccurs_oToto[n] on NE boucle Pas
			var iTargetIndex = ItemInfos.aIndexes[ indexToEat ];
			// HEU... et si négatif **TODO ABORT ERROR
			if ( aElementsResultToBeCounted.length < iTargetIndex + 1 ) {
				oReturnValue.strValue = "0";
				return true;
			} // endif
			aElementsResultToBeCounted = aElementsResultToBeCounted[ iTargetIndex ].aChildElements;			
		} // endif
		oReturnValue.strValue = "" + aElementsResultToBeCounted.length;
		return true;
	};
	
	/**
	* Method GetHtmlTypeValue
	* @method self.GetHtmlTypeValue
	* @param {ctx.itemInfoClass} ItemInfos
	* @return {ctx.TypeHtmlValue}
	*/
	function GetHtmlTypeValue( ItemInfos ) {
		if ( ItemInfos.bInnerHtml === true ) return ctx.TypeHtmlValue.INNER_HTML;
		else if ( ItemInfos.bOuterHtml === true ) return ctx.TypeHtmlValue.OUTER_HTML;
		else  return ctx.TypeHtmlValue.NO_HTML;
	} // GetHtmlTypeValue
	
	/**
	* Method _ProcessOneIndexElement
	* @method _ProcessOneIndexElement
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {Array<ctx.elementResult>} aElementsResultArg
	* @param {number} IndexCountArg
	* @param {number} IndexIndexToEatArg
	* @param {ctx.returnValueClass} oReturnValue
	* @return {boolean}
	*/
	function _ProcessOneIndexElement( ItemInfos, aElementsResultArg, IndexCountArg, IndexIndexToEatArg, oReturnValue ) {
		/** @type {number} */ var nTargetIndex = ItemInfos.aIndexes[ IndexIndexToEatArg ];
		if ( nTargetIndex >= 0 ) {
			
			// Normal
			// ------
			if ( nTargetIndex < aElementsResultArg.length ) {
				// L'index EST atteignable. Est-ce le dernier index ?
				// --------------------------------------------------
				if ( IndexIndexToEatArg + 1 === IndexCountArg ) {
					// Oui, juste RENDRE l'élément
					oReturnValue.bRunning = true;
					if ( aElementsResultArg[ nTargetIndex ].aChildElements.length !== 0 ) {
						oReturnValue.strValue = "Internal Logic Error in ExtractSingleElement: Child Elements found for Last Index";
						return false;
					} // endif
					oReturnValue.oTheElement = aElementsResultArg[ nTargetIndex ].oTheElement;
					return true;
				} else {
					// Il reste des index : pivot et récursion
					// ---------------------------------------
					return _ProcessOneIndexElement( ItemInfos, aElementsResultArg[ nTargetIndex ].aChildElements,
					                                IndexCountArg, IndexIndexToEatArg + 1, oReturnValue );
				} // endif
			} else {
				// NOT RUNNING
				// -----------
				oReturnValue.bRunning = false;
				return true;
			} // endif
			
		} else {
			
			// Une demande d'index NÉGATIF arrivant dans
			// une recherche de SingleElement WTF!
			// -----------------------------------------
			oReturnValue.strValue = "Negative Index in ExtractSingleElement"
			return false;
			
		} // endif

	} // local function _ProcessOneIndexElement

	/**
	* Method ExtractSingleElement
	* @method self.ExtractSingleElement
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {Array<ctx.elementResult>} aElementsResult
	* @param {ctx.returnValueClass} oReturnValue
	* @return {boolean}
	*/
	self.ExtractSingleElement = function( ItemInfos, aElementsResult, oReturnValue ) {

		// sémantique oReturnValue = { "oTheElement": null, "bRunning": false, "strValue": "" }; (strValue pour Erreur)
		// ---------------------------------------------------------------------
		// Cette fonction reprend des morceaux significatifs de ExtractValues,
		// mais je n'ai pas, là maintenant tout de suite, d'idées géniales pour
		// mutualiser, vu les différences entre
		//    a) je cherche LES valeurs d'un vecteur de vecteurs
		//    b) je cherche L'UNIQUE élément ciblé par index dans un vecteur de vecteurs
		// Ceci dit, c'est faisable. **MAYDO, mais je ne suis pas pressé.
		// -----------------------------------------------------------------------------
		var nIndexesCount = ItemInfos.aIndexes.length;
		if ( nIndexesCount === 0 ) {
			
			// Sous-cas : aucun index précisé : rendre le premier
			// (et soit dit en passant, il ne doit y en avoir qu'un, et
			// sans fils !)
			// --------------------------------------------------------
			if ( aElementsResult.length === 0 ) return true; // Not Running pré-positionné
			oReturnValue.bRunning = true; // pour le cas où ça va marcher, LOL
			if ( aElementsResult.length > 1 ) {
				oReturnValue.strValue = "Internal Logic Error in ExtractSingleElement: more than one result";
				return false;
			} // endif
			if ( aElementsResult[0].aChildElements.length !== 0 ) {
				oReturnValue.strValue = "Internal Logic Error in ExtractSingleElement: Child Elements found";
				return false;
			} // endif
			oReturnValue.oTheElement = aElementsResult[ 0 ].oTheElement;
			return true;
			
		} else {
			
			// **TODO MUST : ON N'A PAS BESOIN DE LA RÉCURSION DANS CE CAS. ON PEUT
			// BOUCLER SUR LES INDEX ET FAIRE L'UNIQUE PIVOT DANS LA BOUCLE
			// ********************************************************************
			return _ProcessOneIndexElement( ItemInfos, aElementsResult, nIndexesCount, 0, oReturnValue );
			
		} // endif
		
	};
	
	/**
	// Il faut faire une boucle dans une boucle dans une boucle... pour un
	// nombre arbitraire de boucle. Si quelqun peut m'expliquer comment
	// faire ça SANS récursion, je suis preneur !
	// Merci de bien COMPRENDRE comment fonctionne le système de récursion
	// pour ce qui concerne l'argument oReturnValue AVANT de faire des modifs
	// -------------------------------------------------------------------------
	* Method _ProcessOneIndexValue
	* @method _ProcessOneIndexValue
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {Array<ctx.elementResult>} aElementsResultArg
	* @param {number} IndexCountArg
	* @param {number} IndexIndexToEatArg
	* @param {ctx.returnValueClass} oReturnValue
	* @return {boolean}
	*/
	function _ProcessOneIndexValue( ItemInfos, aElementsResultArg, IndexCountArg, IndexIndexToEatArg, oReturnValue ) {
		/** @type {number} */ var nTargetIndex = ItemInfos.aIndexes[ IndexIndexToEatArg ];
		if ( nTargetIndex >= 0 ) {
			
			// PAS de boucle dans cette instance
			// ---------------------------------
			if ( nTargetIndex < aElementsResultArg.length ) {
				// L'index EST atteignable. Est-ce le dernier index ?
				// --------------------------------------------------
				if ( IndexIndexToEatArg + 1 === IndexCountArg ) {
					// Oui, juste RENDRE la valeur
					var oCurrentElement = aElementsResultArg[ nTargetIndex ].oTheElement;
					oReturnValue.bRunning = true;
					if ( aElementsResultArg[ nTargetIndex ].aChildElements.length !== 0 ) {
						oReturnValue.strValue = "Internal Logic Error in ExtractValues: Child Elements found for Last Index";
						return false;
					} // endif
					var bSuccess = self.GetHtlmElemValue( oCurrentElement, GetHtmlTypeValue( ItemInfos ), oReturnValue,
					                                      ItemInfos.Description );
					if ( bSuccess === false ) return false;
					if ( ItemInfos.bListAsked === true ) {
						oReturnValue.strValue = JSON.stringify( oReturnValue.strValue );
					} // endif
					return true;
				} else {
					// Il reste des index : pivot et récursion
					// ---------------------------------------
					return _ProcessOneIndexValue( ItemInfos, aElementsResultArg[ nTargetIndex ].aChildElements,
					                        IndexCountArg, IndexIndexToEatArg + 1, oReturnValue );
				} // endif
			} else {
				// NOT RUNNING
				// -----------
				oReturnValue.bRunning = false;
				return true;
			} // endif
			
		} else {
			
			// Une boucle dans cette instance
			// ------------------------------
			oReturnValue.strValue = "[ ";
			var nCurrentResultsCount = aElementsResultArg.length;
			var bLastIndex = ( IndexIndexToEatArg + 1 === IndexCountArg );
			for ( var ElemIndex = 0; ElemIndex < nCurrentResultsCount; ++ElemIndex ) {
				var oLocalReturnValue = new ctx.returnValueClass();
				var bSuccess;
				// Est-ce le dernier index ?
				// -------------------------
				if ( bLastIndex ) {
					// Oui, juste ajouter la valeur avec JSON Escaping
					if ( aElementsResultArg[ ElemIndex ].aChildElements.length !== 0 ) {
						oReturnValue.strValue = "Internal Logic Error in ExtractValues: Child Elements found for Last Index (List)";
						return false;
					} // endif
					bSuccess = self.GetHtlmElemValue( aElementsResultArg[ ElemIndex ].oTheElement,
					                                  GetHtmlTypeValue( ItemInfos ), oLocalReturnValue, ItemInfos.Description );
					if ( bSuccess === false ) return false;
					oReturnValue.strValue += JSON.stringify( oLocalReturnValue.strValue ) + ( ( ElemIndex + 1 === nCurrentResultsCount ) ? "" : ", " );
				} else {
					// Il reste des index : pivot et récursion
					// ---------------------------------------
					bSuccess = _ProcessOneIndexValue( ItemInfos, aElementsResultArg[ ElemIndex ].aChildElements,
					                                IndexCountArg, IndexIndexToEatArg + 1, oLocalReturnValue );
					if ( bSuccess === false ) return false;
					if ( oLocalReturnValue.bRunning === false ) {
						//oReturnValue.bRunning === false;
						oReturnValue.bRunning = false;
						return true;
					} // endif
					oReturnValue.strValue += oLocalReturnValue.strValue + ( ( ElemIndex + 1 === nCurrentResultsCount ) ? "" : ", " );
				} // endif
			} // end for
			oReturnValue.strValue += " ]";
			oReturnValue.bRunning = true;
			return true;
			
		} // endif

	} // local function _ProcessOneIndexValue

	/***************************************************
	* Method ExtractValues
	* @method self.ExtractValues
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {Array<ctx.elementResult>} aElementsResult
	* @param {ctx.returnValueClass} oReturnValue
	* @return {boolean}
	******************************************************/
	self.ExtractValues = function( ItemInfos, aElementsResult, oReturnValue ) {
		
		// sémantique oReturnValue = { "strValue": "", "bRunning": false };
		// ----------------------------------------------------------------
		if ( ItemInfos.bNbOccurs === true ) {
			// _NbOccurs_ La cohérence des arguments a déjà été PLUS OU MOINS été vérifiée...
			// ET LE PSEUDO DERNIER POSTE [N] AJOUTÉ ARTIFICIELLEMENT JUSTE AVANT LA
			// RECHERCHE (faut suivre)
			// --------------------------------------------------------------------------
			var bSuccess = self.ElementsCount( ItemInfos, aElementsResult, oReturnValue );
			if ( bSuccess === false ) return false;
			oReturnValue.bRunning = true;
			return true
		} // endif
		
		var nIndexesCount = ItemInfos.aIndexes.length;
		if ( nIndexesCount === 0 ) {
			
			// Sous-cas : aucun index précisé : rendre le premier
			// (et soit dit en passant, il ne doit y en avoir qu'un, et
			// sans fils !)
			// --------------------------------------------------------
			if ( aElementsResult.length === 0 ) return true; // Not Running pré-positionné
			oReturnValue.bRunning = true; // pour le cas où ça va marcher, LOL
			if ( aElementsResult.length > 1 ) {
				oReturnValue.strValue = "Internal Logic Error in ExtractValues: more than one result";
				return false;
			} // endif
			if ( aElementsResult[0].aChildElements.length !== 0 ) {
				oReturnValue.strValue = "Internal Logic Error in ExtractValues: Child Elements found";
				return false;
			} // endif
			return self.GetHtlmElemValue( aElementsResult[ 0 ].oTheElement, GetHtmlTypeValue( ItemInfos ),
			                              oReturnValue, ItemInfos.Description );
			
		} else {
			
			return _ProcessOneIndexValue( ItemInfos, aElementsResult, nIndexesCount, 0, oReturnValue );
			
		} // endif
	
	};
	
	/***************************************************
	* Method FindItem
	* @method self.FindItem
	* @param {string} FullItemName
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {ctx.messageClass.ActionBase} oMsg
	* @param {boolean} [bExtractSingleElement] extract single element (default is true)
	* @param {boolean} [bCheckExist] if element is extracted, check if exists (default is true)
	* @return {boolean}
	******************************************************/
	self.FindItem = function( FullItemName, ItemInfos, oMsg, bExtractSingleElement, bCheckExist) {
		
		if ( self.oRunningPageDesc === null ) {
			return self.AnswerError("Can't search Item: No Running Page Descriptor", oMsg, FullItemName);
		} // endif
		
		if (bExtractSingleElement === undefined) bExtractSingleElement = true;
		if (bCheckExist === undefined) bCheckExist = true;
		FullItemName = FullItemName || "";

		// Phase 1 : analyse des caractèristiques de l'Item demandé
		// contrôles des paramètres  et remplissage d'un objet ItemInfos
		// de manière similaire à ce qui ce fait dans Web3
		// -------------------------------------------------------------
		// Phase 1-1 : ItemInfos : Préfixes et Indexes
		// -------------------------------------------
		var oError = {};
		var bSuccess = self.ExtractItemInfos(FullItemName, ItemInfos, oError);
		if (bSuccess === false) {
			return self.AnswerError(oError.strError, oMsg, FullItemName);
		} // endif

		// Phase 1-2 : Le descriptif
		// -------------------------
		ItemInfos.Description = self.FindDescItemByName( self.oRunningPageDesc, ItemInfos.NakedItemName);
		if (ItemInfos.Description === null) {
			return self.AnswerError("Unknown Item", oMsg, ItemInfos.NakedItemName);
		} // endif

		// Phase 1-3 : Contrôles de cohérences
		// -----------------------------------
		// Si une notation "Index" est présente, il doit y avoir
		// correspondance entre le nombre d'occurs déclarés et le
		// nombre d'index fourni, sauf si NbOccurs est demandé
		// auquel cas il doit y avoir un index fourni de moins
		// ------------------------------------------------------
		var nGivenIndexes = ItemInfos.aIndexes.length;
		var nOccursCount = self.CountOccursFull(self.oRunningPageDesc, ItemInfos.Description);
		if (nGivenIndexes + ((ItemInfos.bNbOccurs === true) ? 1 : 0) !== nOccursCount) {
			return self.AnswerError("Bad Index Count", oMsg, ItemInfos.FullItemName);
		} // endif

		// Il ne peut pas y avoir à la fois une demande de comptage et une demande de liste
		// --------------------------------------------------------------------------------
		if (ItemInfos.bListAsked && ItemInfos.bNbOccurs) {
			return self.AnswerError("[J] incompatible with _NbOccurs_", oMsg, ItemInfos.FullItemName);
		} // endif
		// Une demande de liste n'est possible que pour GETVALUE
		// -----------------------------------------------------
		if (ItemInfos.bListAsked === true && oMsg.MsgDatas.ActionName !== "GETVALUE") {
			return self.AnswerError("[J] only allowed with GETVALUE", oMsg, ItemInfos.FullItemName);
		} // endif
		// Il ne peut pas y avoir une demande de comptage et des demandes "html"
		// ---------------------------------------------------------------------
		if (ItemInfos.bNbOccurs && (ItemInfos.bInnerHtml || ItemInfos.bOuterHtml)) { // tiens, pas de true ici, kek
			return self.AnswerError("_Html_/_InnerHtml_ and _NbOccurs_ are incompatible", oMsg, ItemInfos.FullItemName);
		} // endif
		// Une demande de comptage n'est possible que pour GETVALUE
		// --------------------------------------------------------
		if (ItemInfos.bNbOccurs === true && oMsg.MsgDatas.ActionName !== "GETVALUE") {
			return self.AnswerError("_NbOccurs_ only allowed with GETVALUE", oMsg, ItemInfos.FullItemName);
		} // endif
		// Une demande de html n'est possible que pour GETVALUE
		// --------------------------------------------------------
		if ((ItemInfos.bInnerHtml || ItemInfos.bOuterHtml) && oMsg.MsgDatas.ActionName !== "GETVALUE") {
			return self.AnswerError("_Html_/_InnerHtml_ only allowed with GETVALUE", oMsg, ItemInfos.FullItemName);
		} // endif
		// MISSING contrôle de cohérence : "_KeyStroke_ only allowed with SETVALUE" (lol **TODO)
		// -------------------------------------------------------------------------------------

		// ---------------------------------------------
		// Phase 2 : récupération du vecteur de vecteurs
		// ---------------------------------------------
		if (ItemInfos.bNbOccurs) {
			ItemInfos.aIndexes.push(-1);
		} // endif
		var oReturnedError = { strValue: "" };
		var bRetCode = self.FindRunningItemByDesc(self.oRunningPageDesc,
												  ItemInfos.Description,          // Da Desc
												  ItemInfos.aIndexes,             // les index demandés
												  ItemInfos.aElements,
												  oReturnedError);
		if (bRetCode === false) {
			return self.AnswerError("Error " + oReturnedError.strValue + " while searching", oMsg, ItemInfos.FullItemName);
		} // endif
		
		// ----------------------------------------------------------------
		// Phase 3 : Reprise (simplifiée) du concept "CxExtractSingleElement" de WEB3
		// ----------------------------------------------------------------
		if (bExtractSingleElement) {
			ItemInfos.ReturnValue = new ctx.returnValueClass();
			if (!self.ExtractSingleElement(ItemInfos, ItemInfos.aElements, ItemInfos.ReturnValue)) {
		    return self.AnswerError(ItemInfos.ReturnValue.strValue, oMsg, ItemInfos.FullItemName);
			} // endif
			
			// ----------------------------------------------------------------
			// Phase 4 : on vérifie si l'élément existe
			// ----------------------------------------------------------------
			if (bCheckExist) {
				// Si pas d'item : ERREUR
				// ----------------------
				if ( ItemInfos.ReturnValue.bRunning === false ) {
				    return self.AnswerError("Item Not Running", oMsg, ItemInfos.FullItemName);
				} // endif	
			}
		}
			
		return true;
	}
		
	/***************************************************
	* Method ExtractItemInfos
	* @method self.ExtractItemInfos
	* @param {string} FullItemName
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {Object} oError
	* @return {boolean}
	******************************************************/
	self.ExtractItemInfos = function( FullItemName, ItemInfos, oError ) {
		
	    FullItemName = FullItemName || "";
		ItemInfos.FullItemName = FullItemName;
		ItemInfos.bNbOccurs = false;
		ItemInfos.bInnerHtml = false;
		ItemInfos.bOuterHtml = false;
		ItemInfos.aIndexes = [];
		ItemInfos.bListAsked = false;

		var ItemNameSoFar;
		
		// Traitement préfixes
		// -------------------
		if ( FullItemName.startsWith( "_NbOccurs_" ) ) {
			ItemInfos.bNbOccurs = true;
			ItemNameSoFar = FullItemName.substr( 10 );
		} else if ( FullItemName.startsWith( "_Html_" ) ) {
			ItemInfos.bOuterHtml = true;
			ItemNameSoFar = FullItemName.substr( 6 );
		} else if ( FullItemName.startsWith( "_InnerHtml_" ) ) {
			ItemInfos.bInnerHtml = true;
			ItemNameSoFar = FullItemName.substr( 11 );
		} else if (FullItemName.startsWith("_ItemAuto_")) {
		    ItemInfos.bItemAuto = true;
		    ItemNameSoFar = FullItemName.substr(10);
		} else if (FullItemName.startsWith("_KeyStroke_")) {
		    ItemInfos.bKeyStroke = true;
		    ItemNameSoFar = FullItemName.substr(11);
		} else {
			ItemNameSoFar = FullItemName;
		} // endif
			
		// Traitements Indices (indexes)
		// -----------------------------
		var oReturnValue = new ctx.returnValueClass();
		var bSuccess = self.TraiteItemIndex( ItemNameSoFar, ItemInfos.aIndexes, oReturnValue );
		if ( bSuccess === false ) {
			oError.strError = "Error '" + oReturnValue.strValue + "' in TraiteItemIndex for Item " + ItemNameSoFar;
				return false;
		} // endif
		ItemInfos.NakedItemName = oReturnValue.strValue;
		
		// Un [J] quelque part ? (nécessaire pour forcer JSON sur [J][42]
		// --------------------------------------------------------------
		if ( ItemInfos.aIndexes.length ) {
			for ( var nIndexAsked = 0, nIndexCount = ItemInfos.aIndexes.length; nIndexAsked < nIndexCount; ++nIndexAsked ) { 
				if ( ItemInfos.aIndexes[nIndexAsked] < 0 ) { 
					ItemInfos.bListAsked = true; break; 
				} 
			}
		} // endif
		
		return true;
		
	};

	/***************************************************
	* Method CountOccursInDesc
	* @method self.CountOccursInDesc
	* @param {Object} oTheDesc
	* @return {number}
	******************************************************/
	self.CountOccursInDesc = function( oTheDesc ) {
		var nRetVal = 0;
		for ( var id = 0, nTagsCount = oTheDesc.aTags.length; id < nTagsCount; ++id ) { // **TODO FOR..OF!
			if ( oTheDesc.aTags[id].bOccurs === true ) ++nRetVal;
		} // end for of
		return nRetVal;
	};

	/***************************************************
	* Method CountOccursFull
	* @method self.CountOccursFull
	* @param {ctx.descriptor.Page} oPageDesc	
	* @param {Object} oTheDesc
	* @return {number}
	******************************************************/
	self.CountOccursFull = function( oPageDesc, oTheDesc ) {
		var nRetVal = self.CountOccursInDesc( oTheDesc );
		if ( typeof oTheDesc.Ancestor !== "undefined" ) {
			var oTheAncestorDesc = self.FindDescItemByName( oPageDesc, oTheDesc.Ancestor );
			if ( oTheAncestorDesc !== null ) nRetVal += self.CountOccursFull( oPageDesc, oTheAncestorDesc );
		} // end if
		return nRetVal;
	};

	/***************************************************
	* Method FindItem
	* @method self.FindItem
	* @param {string} FullItemName
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {ctx.messageClass.ActionBase} oMsg
	* @param {boolean} [bExtractSingleElement] extract single element (default is true)
	* @param {boolean} [bCheckExist] if element is extracted, check if exists (default is true)
	* @return {boolean}
	******************************************************/
	
	
	/***************************************************
	* Method DoAction
	* @method self.DoDoAction
	* @param {ctx.messageClass.ActionBase} oMsg
	******************************************************/
	self.DoAction = function( oMsg ) {

		// Le code actuel du pilote WEB3 est plutôt "libéral" sur ce
		// qui autorisé sur les pages "_undefined_", peut être un peut
		// trop d'ailleurs, car il n'est PAS inmpossible que des CRASH
		// potentiels se cachent dans le code de recherche d'Items alors
		// que le PageDesc est un pointeur nul...
		// -----------------------------------------------------------------
	
		// **TODO CHECK CONTRÔLES COHÉRENCES BACKGROUND-INJECTED :
		//    - page name         DONE
		//    - appli name        TODO
		//    - page UniqueID     TODO (donc ajout en Message)
		// -------------------------------------------------------
		var strActualPageName = ( self.bUndefined === true ) ? "_Undefined_" : self.oRunningPageDesc.PageName;
		if ( oMsg.MsgDatas.PageName !== strActualPageName ) {
			// HEIN ?
		    return self.AnswerError("Page Name Mismatch (" + self.oRunningPageDesc.PageName + ")", oMsg, oMsg.MsgDatas.DestName);
		} // endif

		if ( oMsg.MsgDatas.ActionName && (typeof self.Do[oMsg.MsgDatas.ActionName] === 'function') ) {
			// call the action to handle the verb
			return self.Do[oMsg.MsgDatas.ActionName].call(self, oMsg);
		} else {
			// unkonwn verb
		  return self.AnswerError(oMsg.MsgDatas.ActionName + " : not implemented", oMsg, "");
		}
	}

	self.Do = {}
	
	/******************************
	*******************************
	* Messages de type ACTION
	*******************************
	*******************************/
	
	/***************************************************
	* Method ACTIVATE
	* @method self.Do.ACTIVATE
	* @param {ctx.messageClass.Action} msgAction
	******************************************************/
	self.Do.ACTIVATE = function( msgAction ) {
		// This verb is implemented in the 'Background' side
    return self.AnswerError(msgAction.MsgDatas.ActionName + " : invalid call", msgAction, "");
	}

	/***************************************************
	* Method EXISTE
	* @method self.Do.EXISTE
	* @param {ctx.messageClass.Action} msgAction
	* @return {boolean}
	******************************************************/
	self.Do.EXISTE = function( msgAction ) {
		/** @type {ctx.itemInfoClass} */ var ItemInfos = new ctx.itemInfoClass();
		if (! self.FindItem(msgAction.MsgDatas.DestName, ItemInfos, msgAction, true, false)) {
		    return false;
		} // endif
		
		// COPIER/COLLER COMMENTAIRES WEB3
		// Convention work Manager : 0, No pour n'existe pas
		//                           1, Yes pour existe
		// Bug WorkManager lRet négatif d'erreur technique ==> poubelle et "not exist"...
		// Autrement dit EXISTE avec faute de frappe dans le nom : indétectable !
		// ------------------------------------------------------------------------------
		var nRetCode;
		if ( !ItemInfos.ReturnValue.bRunning ) {
			nRetCode = 0;
		} else {
			nRetCode = 1;
		} // endif
		msgAction.Result = ( nRetCode === 1 ? "Yes" : "No" );
		return self.DoResponse( msgAction );
	}

	/***************************************************
	* Method FCTBTN
	* @method self.Do.FCTBTN
	* @param {ctx.messageClass.Action} msgAction
	* @return {boolean}
	******************************************************/
	self.Do.FCTBTN = function( msgAction ) {
		/** @type {ctx.itemInfoClass} */ var ItemInfos = new ctx.itemInfoClass();
		if (! self.FindItem(msgAction.MsgDatas.DestName, ItemInfos, msgAction)) {
		    return false;
		} // endif

		if (self.FctBtnHtlmElement( ItemInfos.ReturnValue.oTheElement, ItemInfos, ItemInfos.ReturnValue ) === false ) {
		    return self.AnswerError(ItemInfos.ReturnValue.strValue, msgAction, ItemInfos.FullItemName);
		} // endif
		
		return self.DoResponse( msgAction );
	}

	/***************************************************
	* Method GETVALUE
	* @method self.Do.GETVALUE
	* @param {ctx.messageClass.Action} msgAction
	* @return {boolean}
	******************************************************/
	self.Do.GETVALUE = function( msgAction ) {
		
		//  traitement spécifique : GETVALUE sur PseudoItem HTML
		if ( msgAction.MsgDatas.DestName === "HTML" ) {
			return self.AnswerError("GETVALUE HTML : not implemented", msgAction, "HTML");
		} // endif

		// C'est la fonction EXTRACT VALUES qui FAIT Tout
		// elle a donc 3 codes retour, faut suivre :
		//   1) le true/false classique, erreur technique ou tout s'est "bien" passé
		//   2) un true/false FONCTIONNEL : Item(s) RUNNING ou PAS RUNNING
		//   3) une chaîne :
		//        a) rendue au Work Manager si Item(s) running (avec code retour 0)
		//        b) rendue au Work Manager si Item(s) PAS running (avec code retour -∞)
	  // -----------------------------------------------------------------------------

		/** @type {ctx.itemInfoClass} */ var ItemInfos = new ctx.itemInfoClass();
		if (! self.FindItem(msgAction.MsgDatas.DestName, ItemInfos, msgAction, false, false)) {
		    return false;
		} // endif
		
		var bRetCode = self.ExtractValues(ItemInfos, ItemInfos.aElements, ItemInfos.ReturnValue);
		if ( bRetCode === false ) {
		    return self.AnswerError(ItemInfos.ReturnValue.strValue, msgAction, ItemInfos.FullItemName);
		} // endif	

		if ( ItemInfos.ReturnValue.bRunning === false ) {
		    return self.AnswerError("Item Not Running", msgAction, ItemInfos.FullItemName);
		} // endif

		msgAction.Result = ItemInfos.ReturnValue.strValue;
		return self.DoResponse( msgAction );
	}

	/***************************************************
	* Method SETFOCUS
	* @method self.Do.SETFOCUS
	* @param {ctx.messageClass.Action} msgAction
	* @return {boolean}
	******************************************************/
	self.Do.SETFOCUS = function( msgAction ) {
		/** @type {ctx.itemInfoClass} */ var ItemInfos = new ctx.itemInfoClass();
		if (! self.FindItem(msgAction.MsgDatas.DestName, ItemInfos, msgAction)) {
		    return false;
		} // endif
		ItemInfos.ReturnValue.oTheElement.focus();
		return self.DoResponse( msgAction );
	}

	/***************************************************
	* Method SETVALUE
	* @method self.Do.SETVALUE
	* @param {ctx.messageClass.Action} msgAction
	* @return {boolean}
	******************************************************/
	self.Do.SETVALUE = function( msgAction ) {
		/** @type {ctx.itemInfoClass} */ var ItemInfos = new ctx.itemInfoClass();
		if (! self.FindItem(msgAction.MsgDatas.DestName, ItemInfos, msgAction)) {
		    return false;
		} // endif
		
		if (self.SetHtlmElemValue( ItemInfos.ReturnValue.oTheElement, ItemInfos, msgAction.MsgDatas.Datas, ItemInfos.ReturnValue ) === false ) {
		    return self.AnswerError(ItemInfos.ReturnValue.strValue, msgAction, ItemInfos.FullItemName);
		} // endif
		return self.DoResponse( msgAction );
	}

	/******************************
	*******************************
	* Messages de type ACTION2
	*******************************
	*******************************/
	
	/***************************************************
	* @method self.Do.CALLITEM
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.CALLITEM = function( msgAction2 ) {
		/** @type {ctx.itemInfoClass} */ var ItemInfos = new ctx.itemInfoClass();
		if (! self.FindItem(msgAction2.MsgDatas.Parm1, ItemInfos, msgAction2)) {
		    return false;
		} // endif

		try {
			__CtxChrExtInj.ContextorElem = ItemInfos.ReturnValue.oTheElement;		
			var functionName = msgAction2.MsgDatas.Parm2;
			var params = msgAction2.MsgDatas.Parm3;
			var code  = "(function(){ return " + functionName + "(__CtxChrExtInj.ContextorElem" + (params ? ", " + params : "") + "); })();";

			try {
				res = window.eval("2");
			}
			catch (ex) {
				//eval considered not authorised
				msgAction2.Result = "";
				msgAction2.MsgDatas.Parm2 = code;
				return self.DoResponse(msgAction2, true);
			}

			msgAction2.Result = window.eval(code);
			return self.DoResponse( msgAction2 );
		} catch (ex) {
	    return self.AnswerError("eval failed: " + ex.message, msgAction2, "");
		}
	}

	/***************************************************
	* @method self.Do.CLOSE
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.CLOSE = function( msgAction2 ) {
		// This verb is implemented on the 'Background' side
    return self.AnswerError(msgAction2.MsgDatas.ActionName + " : invalid call", msgAction2, "");
	}

	/***************************************************
	* @method self.Do.EVALSCRIPT
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.EVALSCRIPT = function( msgAction2 ) {
		try {
			var code = msgAction2.MsgDatas.Parm1;
			// test if eval is authorised
			try {
				res = window.eval("2");
			}
			catch (ex) {
				//eval considered not authorised
				msgAction2.Result = "";
				return self.DoResponse(msgAction2, true);
			}

			msgAction2.Result = window.eval(code);
			return self.DoResponse( msgAction2 );
		} catch (ex) {
	    return self.AnswerError("EVALSCRIPT failed: " + ex.message, msgAction2, "");
		}
	}

	/***************************************************
	* @method self.Do.EXECSCRIPT
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.EXECSCRIPT = function( msgAction2 ) {
//		// This verb is implemented in the 'Background' side
//    return self.AnswerError(msgAction2.MsgDatas.ActionName + " : invalid call", msgAction2, "");

		try {
			var code = msgAction2.MsgDatas.Parm1;
			var res = '';
			// window.execScript may not be supported by Google Chrome
			if (typeof window.execScript === 'function') {        
				window.execScript(code, 'JavaScript');
			} else {
				// test if eval is authorised
				try{
					res = window.eval("2");
				}
				catch(ex){
					//eval considered not authorised
					if (res === undefined) { res = ''; }
					msgAction2.Result = res;
					return self.DoResponse( msgAction2, true );
				}

				res = window.eval(code);
				if (res === undefined) { res = ''; }
			}
			msgAction2.Result = res;
			return self.DoResponse( msgAction2 );
		} catch (ex) {
	    return self.AnswerError("execScript failed: " + ex.message, msgAction2, "");
		}
	}

	/***************************************************
	* @method self.Do.GETRECT
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.GETRECT = function( msgAction2 ) {
		/** @type {ctx.itemInfoClass} */ var ItemInfos = new ctx.itemInfoClass();
		// GETRECT peut conserner une page ou un item
		// Parm1 : nom item (si vide : page)

		// Manuel 15 juillet 2019 : si Le broker envoie une version de protocole
		// dans le paramètre 2, alors il faut utiliser la nouvelle technique, sinon
		// fallback sur le code legacy
		// ------------------------------------------------------------------------
		if ( msgAction2.MsgDatas.Parm2 === "" ) {

			// CODE LEGACY
			// ***********

			msgAction2.Result = {
				x: 0, // position absolue
				y: 0,
				cx: 0, // largeur
				cy: 0,
				x2: 0, // position relative au hwnd (significatif si hwnd != 0)
				y2: 0,
				hwnd: 0 // hwnd fenêtre parente : si 0, non significatif
			};
			var itemName = msgAction2.MsgDatas.Parm1;

			if (!itemName) {
				// *** concerne la page ***
				var pageHeight = document.body.clientHeight;
				if (pageHeight == 0) pageHeight = document.documentElement.clientHeight;
				msgAction2.Result = { x: 0, y: 0, cx: document.body.clientWidth, cy: pageHeight, x2: 0, y2: 0, hwnd: 0 };
			} else {
				// *** concerne l'item ***
				if (! self.FindItem(itemName, ItemInfos, msgAction2)) {
					return false;
				} // endif

				var oElement = ItemInfos.ReturnValue.oTheElement;
				if (!oElement) return false;
				var oRect = oElement.getBoundingClientRect();

				var zoomFactor = window.devicePixelRatio || 1;
				
				//msgAction2.Result = { x: oRect.left, y: oRect.top, cx: oRect.width, cy: oRect.height, x2: 0, y2: 0, hwnd: 0 };
				msgAction2.Result = { x: oRect.left * zoomFactor, y: oRect.top * zoomFactor, cx: oRect.width * zoomFactor, cy: oRect.height * zoomFactor, x2: 0, y2: 0, hwnd: 0 };
				
			}
			// FIN CODE LEGACY
			// ***************

		} else {

			// ***************************
			// ** REFONTE MANUEL JUIN 2019
			// ***************************
			msgAction2.Result = {
				x: 0,
				y: 0,
				cx: 0,
				cy: 0,
				// partie nouvelle pour calculs dans Win32 (CxChromeBroker)
				datas: {
					pixelRatio: window.devicePixelRatio,
					topWindow: {
						outerWidth: 0,
						innerWidth: 0,
						outerHeight: 0,
						innerHeight: 0,
						screenX: 0,
						screenY: 0,
						title: ''
					},
				}
			};

			var itemName = msgAction2.MsgDatas.Parm1;
			if (!itemName) {

				// concerne une Frame
				// ------------------
				msgAction2.Result.cx = document.documentElement.getBoundingClientRect().width; // ok pour Top Frame, en tout cas
				msgAction2.Result.cy = document.documentElement.clientHeight;                  // ok pour Top Frame, en tout cas

			} else {

				// concerne un item
				// ----------------

				if (! self.FindItem(itemName, ItemInfos, msgAction2)) {
					return false;
				} // endif
				var oElement = ItemInfos.ReturnValue.oTheElement;
				if (!oElement) return false;
				
				var oRect = oElement.getBoundingClientRect();

				msgAction2.Result.x  = oRect.left;
				msgAction2.Result.y  = oRect.top;
				msgAction2.Result.cx = oRect.width;
				msgAction2.Result.cy = oRect.height;

			} // endif

		} // endif

		// Envoi du message à la frame
		// Le message va être remonté jusqu'au top, qui enverra la réponse
		window.postMessage(msgAction2, "*");
		return true;
	}

	/***************************************************
	* @method self.Do.GETWINFOCUSRECT
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.GETWINFOCUSRECT = function( msgAction2 ) {
	  return self.AnswerError(msgAction2.MsgDatas.ActionName + " : not implemented", msgAction2, "");
	}

// non implémenté par Web3
//	/***************************************************
//	* @method self.Do.ISVISIBLE
//	* @param {ctx.messageClass.Action2} msgAction2
//	* @return {boolean}
//	******************************************************/
//	self.Do.ISVISIBLE = function( msgAction2 ) {
//	  return self.AnswerError(msgAction2.MsgDatas.ActionName + " : not implemented", msgAction2, "");
//	}

	/***************************************************
	* @method self.Do.NAVIGATE
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.NAVIGATE = function( msgAction2 ) {
		var url = msgAction2.MsgDatas.Parm1 || '';
		var target = msgAction2.MsgDatas.Parm2 || null;
		var data = msgAction2.MsgDatas.Parm3;
		var header = msgAction2.MsgDatas.Parm4;
// TODO : pour le moment, data et header ne sont pas gérés : à reprendre
//
// see : http://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
//
//		function post(path, params, method) {
//    method = method || "post"; // Set method to post by default if not specified.
//
//    // The rest of this code assumes you are not using a library.
//    // It can be made less wordy if you use one.
//    var form = document.createElement("form");
//    form.setAttribute("method", method);
//    form.setAttribute("action", path);
//
//    for(var key in params) {
//        if(params.hasOwnProperty(key)) {
//            var hiddenField = document.createElement("input");
//            hiddenField.setAttribute("type", "hidden");
//            hiddenField.setAttribute("name", key);
//            hiddenField.setAttribute("value", params[key]);
//
//            form.appendChild(hiddenField);
//         }
//    }
//
//    document.body.appendChild(form);
//    form.submit();
//}
//
//Example:
//
//post('/contact/', {name: 'Johnny Bravo'});

// other example : http://taswar.zeytinsoft.com/2010/07/08/javascript-http-post-data-to-new-window-or-pop-up/
//function OpenWindowWithPost(url, windowoption, name, params)
//   {
//            var form = document.createElement("form");
//            form.setAttribute("method", "post");
//            form.setAttribute("action", url);
//            form.setAttribute("target", name);
// 
//            for (var i in params) {
//                if (params.hasOwnProperty(i)) {
//                    var input = document.createElement('input');
//                    input.type = 'hidden';
//                    input.name = i;
//                    input.value = params[i];
//                    form.appendChild(input);
//                }
//            }
//            
//            document.body.appendChild(form);
//            
//            //note I am using a post.htm page since I did not want to make double request to the page 
//           //it might have some Page_Load call which might screw things up.
//            window.open("post.htm", name, windowoption);
//            
//            form.submit();
//            
//            document.body.removeChild(form);
//    }
// 
//   function NewFile()
//   {
//       var param = { 'uid' : '1234'};		    		
//      OpenWindowWithPost("NewFile.aspx", 
//      "width=730,height=345,left=100,top=100,resizable=yes,scrollbars=yes", 
//      "NewFile", param);		
//    }
		
		var ref = null;
		try {
			//ref = window.open(url, (target ? target : undefined));
			// TODO : comment gérer 'target' ??
//			if (url.indexOf(':') == -1) {
//				url = 'http://' + url;
//			}
//			window.location.href = url;
			window.location.assign(url);
			return self.DoResponse( msgAction2 );
		} catch (ex) {
	    return self.AnswerError("NAVIGATE failed: " + ex.message, msgAction2, "");
		}
	}

	/***************************************************
	* @method self.Do.SCRIPTITEM
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.SCRIPTITEM = function( msgAction2 ) {
		/** @type {ctx.itemInfoClass} */ var ItemInfos = new ctx.itemInfoClass();
		if (! self.FindItem(msgAction2.MsgDatas.Parm1, ItemInfos, msgAction2)) {
		    return false;
		} // endif

		try {
			__CtxChrExtInj.ContextorElem = ItemInfos.ReturnValue.oTheElement;		
			// TODO : comme pour Web3 : FIX à propos de Mantis 922 : virer le dernier caractère si c'est un ';'
			var code = msgAction2.MsgDatas.Parm2 || "value";
			code = "(function(){ return (__CtxChrExtInj.ContextorElem." + code + "); })();";

			try {
				res = window.eval("2");
			}
			catch (ex) {
				//eval considered not authorised
				msgAction2.Result = "";
				msgAction2.MsgDatas.Parm2 = code;
				return self.DoResponse(msgAction2, true);
			}
			
			msgAction2.Result = window.eval(code);
			return self.DoResponse( msgAction2 );
		} catch (ex) {
	    return self.AnswerError("SCRIPTITEM failed in content context: " + ex.message, msgAction2, "");
		}
	}

	/***************************************************
	* @method self.Do.SETFOCUS
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.SETPOS = function( msgAction2 ) {
		// This verb is implemented in the 'Background' side
    return self.AnswerError(msgAction2.MsgDatas.ActionName + " : invalid call", msgAction2, "");
	}

	/***************************************************
	* @method self.Do.SETSTYLE
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.SETSTYLE = function( msgAction2 ) {
		/** @type {ctx.itemInfoClass} */ var ItemInfos = new ctx.itemInfoClass();
		if (! self.FindItem(msgAction2.MsgDatas.Parm1, ItemInfos, msgAction2)) {
		    return false;
		} // endif

		try {
			var name = msgAction2.MsgDatas.Parm2;
			var value = msgAction2.MsgDatas.Parm3;
			if (name) ItemInfos.ReturnValue.oTheElement.style[name] = value;
			return self.DoResponse( msgAction2 );
		} catch (ex) {
	    return self.AnswerError("SCRIPTITEM failed: " + ex.message, msgAction2, "");
		}
	}

	/***************************************************
	* @method self.Do.SETSTYLEWIN
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.SETSTYLEWIN = function( msgAction2 ) {
		// This verb is implemented in the 'Background' side
    return self.AnswerError(msgAction2.MsgDatas.ActionName + " : invalid call", msgAction2, "");
//		try {
//			var maximize = (msgAction2.MsgDatas.Parm1 == 'WS_MAXIMIZE');
//			var minimize = (msgAction2.MsgDatas.Parm1 == 'WS_MINIMIZE');
//			if (maximize) {
//				window.maximize();			
//			} else if (minimize) {
//				window.minimize();			
//			}
//			return DoResponse( msgAction2.MsgDatas.RequestID, msgAction2.hWndSender, "", ctx.error.OK );
//		} catch (ex) {
//	    return AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
//		}
	}
	
	/***************************************************
	* @method self.Do.SETTEXT
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.SETTEXT = function( msgAction2 ) {
//		// This verb is implemented in the 'Background' side
//    return self.AnswerError(msgAction2.MsgDatas.ActionName + " : invalid call", msgAction2, "");
		try {
	  	document.title = msgAction2.MsgDatas.Parm1; 
			return self.DoResponse( msgAction2 );
		} catch (ex) {
	    return self.AnswerError(msgAction2.MsgDatas.ActionName + " failed: " + ex.message, msgAction2, "");
		}
	}


	/***************************************************
	* @method self.Do.TOPMOST
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.TOPMOST = function( msgAction2 ) {
		// This verb is implemented in the 'Background' side
    return self.AnswerError(msgAction2.MsgDatas.ActionName + " : invalid call", msgAction2, "");
	}

	/***************************************************
	* @method self.Do.VISIBLE
	* @param {ctx.messageClass.Action2} msgAction2
	* @return {boolean}
	******************************************************/
	self.Do.VISIBLE = function( msgAction2 ) {
		// This verb is implemented in the 'Background' side
    return self.AnswerError(msgAction2.MsgDatas.ActionName + " : invalid call", msgAction2, "");
	}

    // **TODO (peut être) GetValueMethod ?!?
	// refactoring 31/03/2016 : aucune raison d'avoir besoin d'un "ItemInfos"
	// dans une API couche basse. Certains appelants n'en ont pas sous la main
	// -----------------------------------------------------------------------
	/***************************************************
	* Method GetHtlmElemValue
	* @method self.GetHtlmElemValue
	* @param {Object} oElem
	* @param {ctx.TypeHtmlValue} TypeHtml
	* @param {ctx.returnValueClass} oReturnValue
	* @param {ctx.descriptor.Item} oDescItem
	* @return {boolean}
	******************************************************/
	self.GetHtlmElemValue = function ( oElem, TypeHtml, oReturnValue, oDescItem ) {
		if ( oElem === null ) {
			oReturnValue.strValue = "Internal Logic Error : null element";
			return false;
		} // endif
		if ( TypeHtml === ctx.TypeHtmlValue.INNER_HTML ) {
			oReturnValue.strValue = oElem.innerHTML;
		} else if ( TypeHtml === ctx.TypeHtmlValue.OUTER_HTML ) {
			oReturnValue.strValue = oElem.outerHTML;
		} else if ( TypeHtml === ctx.TypeHtmlValue.NO_HTML ){
			switch( oElem.tagName ) {
				case "INPUT":
					var strType = oElem[ "type" ];
					if ( typeof strType !== "undefined" ) {
						switch ( strType ) {
							case "checkbox":
							case "radio":
								oReturnValue.strValue = oElem.checked ? "1" : "0";
								return true;
						} // end switch
					} // endif
					oReturnValue.strValue = oElem.value; 
					break;
				case "OPTION":
					// La "value" d'une option, c'est : est ce qu'elle est selectée ?
					// --------------------------------------------------------------
					oReturnValue.strValue = oElem.selected ? "1" : "0";
					return true;
				case "SELECT":
					// La value d'un select, c'est la PREMIERE valeur choisie
					// Si TypObj est "Key", on rend la "texte" de l'option, sinon
					// on prend la "value" du select
					// -----------------------------------------------------------
					var bByValue = true;
					if ( typeof oDescItem.TypObj !== "undefined" && oDescItem.TypObj === "Key" ) bByValue = false;
					// dans Chrome, c'est OK de demander juste "value" même pour un "multiple"
					// -----------------------------------------------------------------------
					if ( bByValue === true ) {
						oReturnValue.strValue = oElem.value;
					} else {
						if ( oElem.selectedIndex === -1 ) oReturnValue.strValue = "";
						else oReturnValue.strValue = oElem.options[ oElem.selectedIndex ].text;
					} // endif
					return true;
				case "TEXTAREA":
					oReturnValue.strValue = oElem.value;
					return true;
				default:
					// WEB3 : default : innerText
					oReturnValue.strValue = oElem.innerText;
			} // end switch
		} else {
			oReturnValue.strValue = "Internal Logic Error : Invalid Type Html Value";
			return false;
		} // endif
		return true;
	};
	
	/***************************************************
	* Method SetHtlmElemValue
	* @method self.SetHtlmElemValue
	* @param {Object} oElem
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {string} strValue
	* @param {ctx.returnValueClass} oReturnValue
	* @return {boolean}
	******************************************************/
	self.SetHtlmElemValue = function ( oElem, ItemInfos, strValue, oReturnValue ) { // MayDo : fusionner Data in et Data out
		if ( oElem === null ) {
			oReturnValue.strValue = "Internal Logic Error : null element";
			return false;
		} // endif

//	    // SETVALUE KeyStroke
//		if (ItemInfos.bKeyStroke) {
//		    // TODO : manage ItemInfos.bKeyStroke
//		    //set Focus
//            // Send Keys
//		}
		switch( oElem.tagName ) {
			case "INPUT": 
				var strType = oElem[ "type" ];
				if ( typeof strType !== "undefined" ) {
					switch ( strType ) {
						case "checkbox":
						case "radio":
							oElem.checked = ( strValue === "1" ? true : false );
							return true;
					} // end switch
				} // endif
				// Default Input : value
				oElem.value = strValue; 
				break;
			case "SELECT":
				// check web3 sur "disabled"
				if ( typeof oElem.disabled !== "undefined" && oElem.disabled === true) {
					oReturnValue.strValue = "Element is disabled";
					return false;
				} // endif
				// Selectionner l'option qui a la valeur demandée
				var bByValue = true;
				var bFound = false;
				if ( typeof ItemInfos.Description.TypObj !== "undefined" && ItemInfos.Description.TypObj === "Key" ) bByValue = false;				
				var nOptionCount = oElem.options.length;
				for ( var index = 0; index < nOptionCount; ++index ) { // **TODO for of !!!
					var strActual = ( bByValue === true ? oElem.options[ index ].value : oElem.options[ index ].text );
					if ( strActual === strValue ) {
						oElem.selectedIndex = index;
						bFound = true;
						break;
					} // endif
				} // end for
				if ( bFound === false ) {
					oReturnValue.strValue = "select option not found";
					return false;
				} // endif
				oElem.dispatchEvent( new Event( "change", { "bubbles": true } ) );				
				break;
			case "TEXTAREA":
				oElem.value = strValue;
				oElem.dispatchEvent( new Event( "change", { "bubbles": true } ) );				
				break;
			default:
				// WEB3 : default : innerText
				oElem.innerText = strValue;
				break;
		} // end switch
		return true;
	};

	/**************************************
	* **MAYDO : ItemInfos non utilisé...
	* @method self.RecoPageTick
	* @param {Object} oElem
	* @param {ctx.itemInfoClass} ItemInfos
	* @param {ctx.returnValueClass} oReturnValue
	******************************************************/
	self.FctBtnHtlmElement = function ( oElem, ItemInfos, oReturnValue ) {
		if ( oElem === null ) {
			oReturnValue.strValue = "Internal Logic Error : null element";
			return false;
		} // endif
		var DaClickEvent = new MouseEvent( "click", { "view": window, "bubbles": true, "cancelable": false } );
		/**** expérimentation manuel
		var DaClickEvent = new MouseEvent( "click", { "detail": 1, "view": window, "bubbles": true, "cancelable": true } );
		DaClickEvent.target = oElem;
		******/
		// Heu... **MAYDO, et le cde retour du dispatch !?!
		oElem.dispatchEvent( DaClickEvent );
		return true;
	};
	
	/**************************************
	* @method self.RecoPageTick
	******************************************************/
	self.RecoPageTick = function() {
		// plus couplé, on ne fair rien, et plus de tick
		// **MAYDO : trash références descs et running
		if ( self.bCouplage === false ) return;
		// attendre quand même que le DOM soit OK
		// --------------------------------------
		// Première version, 24/02/2016 : on trash sur "loading"
		// et on est content sur n'importe quoi d'autre
		// -----------------------------------------------------
		if ( document.readyState == "loading" ) {
			// **MAYDO : quand même surveiller que ça finit par CHANGER !!!
			// et/ou que c'est ensuite stable sur "complete"
			// ------------------------------------------------------------
			window.setTimeout( self.RecoPageTick, 200 );
			return;
		} // endif
		
		var TimeStampStart = performance.now();
		
		// REPRODUCTION DE L'ALGO WEB3-IE ?
		// NON !!! manuel 25/02/2016. On est dans un contexte Chrome, Injected
		// Si on NE peut PAS trouver d'Appli,c'est NOP ET PLUS DE RECO, JAMAIS.
		// --------------------------------------------------------------------
		if ( self.oRunningAppliDesc == null ) {
			var oTickAppliDesc = self.FindAppli( self.aDescApplis );
			if ( oTickAppliDesc == null ) {
				// FORGET FOR EVER jusqu'à preuve du contraire
				// -------------------------------------------
				// self.info( "**CTXP: RecoPageTick : CAN'T Find APPLI. Will NEVER Try again" );
				// MANUEL 14 mars 2016 : Si Main Frame, signaler au background, avec un message technique
				// dédié, que c'est mort pour une APPLI qui était en mainframe dans ce TAB
				// Pleins de bug potentielles ici avec les tab multi applis, mais bon **MAYDO
				// --------------------------------------------------------------------------------------
				if ( window === window.top ) {
					self.DoLoadUnkAppli();
				} // endif
				// FIX MANUEL 30 août 2019 : on continue à essayer, à cause des critères Titre et Url, qui "changent" en Ajaxerie
				window.setTimeout( self.RecoPageTick, 500 ); // 500 pour ne pas trop charger sur page arbitraire...
				return;
			} else {
				self.info( "**CTXP: RecoPageTick : APPLI Found : " + oTickAppliDesc.AppliName );
				self.oRunningAppliDesc = oTickAppliDesc;
			} // endif
		} else {
			// Manuel 24 octobre 2019. JSAPMLIPA-4436
			// Can't detect page under second application in Chrome (1980336722, Internal Incident)
			// Il faut toujours vérifier les critères appli, car des ZOZOS S4/HANA déclarent plusieurs
			// applications sur le même domaine avec des critères de PAGES...
			// ---------------------------------------------------------------------------------------
			var oPagePropertyProvider = { 
					oHTMLElement: document.documentElement, // MAYDO, sert à rien pour une APPLI !
					PropertyGetter : self.GetPageProperty
				};
			var bCritOk = self.IsCritereOk( self.oRunningAppliDesc.oAppliCrit, oPagePropertyProvider );
			if ( bCritOk === false ) {
				if ( self.oRunningPageDesc != null || self.bUndefined == true ) {
					self.DoUnLoad();
					self.oRunningPageDesc = null;
				} // endif
				self.oRunningAppliDesc = null;
				window.setTimeout( self.RecoPageTick, 350 );
				return;
			} // endif
		} // endif
		
		// si je connais déjà une page, je dois la vérifier
		// RAPPEL : on part du principe que APPLI ne peut pas changer
		// ----------------------------------------------------------
		if ( self.oRunningPageDesc != null ) {
			
			var oPagePropertyProvider = { 
				oHTMLElement: document.documentElement, // MAYDO, sert à rien pour une PAGE !
				PropertyGetter : self.GetPageProperty };
			var bCritOk = self.IsCritereOk( self.oRunningPageDesc.oPageCrit, oPagePropertyProvider );
			if ( bCritOk == false ) {
				// critères de page (donc on se tape des MustExist) PLUS VALIDES
				// HEU.... quels critères peuvent faire UNLOAD ???
				// Réponse manuel 4 mars 2016 : CX et CY !!!
				// -------------------------------------------------------------
				self.DoUnLoad();
				self.oRunningPageDesc = null;
			} else {
				// critères OK, mais quid des MustExist et MustNotExist
				// ----------------------------------------------------
				var bMustExistOk = self.CheckPageMustExist( self.oRunningPageDesc );
				if ( bMustExistOk === true ) {
					// même appli, même page... NOP
					// ----------------------------
					if ( self.oRunningAppliDesc.uiAsyncDelay ) {
						window.setTimeout( self.RecoPageTick, self.oRunningAppliDesc.uiAsyncDelay );
					} else {
						// ne parait PAS possible : si la page était déjà reconnue
						// c'était forcément sur le tick d'avant...
						self.error( "**CTXP: RecoPageTick : No uiAsyncDelay after Same Page" );
					} // endif
					/**PERF MEME APPLI/MEME PAGE **
					self.LogPerf( "RecoPageTick", TimeStampStart );
					*******************************/
					return;
				} else {
					self.DoUnLoad();
					self.info( "**CTXP: RecoPageTick : UNLOAD Must(Not)Exist for Page " + self.oRunningPageDesc.PageName + " in Appli " +
					           self.oRunningAppliDesc.AppliName );
					self.oRunningPageDesc = null;
				} // endif MustExist OK						
			} // endif Crit Page KO
		} // endif page était reconnue
		
		var bIsMainFrame = ( window === window.top );
		
		// Si un UNLOAD était à faire, c'est fait (sauf pour _Undefined_), et
		// si la page qui était reconnue n'a pas changé on est sorti. Donc,
		// maintenant, c'est PAGE RECO TIME
		// -------------------------------------------------------------------
		if ( self.oRunningPageDesc !== null ) {
			// WTF!
			// ----
			self.error( "**CTXP: RecoPageTick : oRunningPageDesc NOT null before Search!" );
			return;
		} //endif
		var nPageCount = self.oRunningAppliDesc.aDescPages.length;
		var oPagePropertyProvider = { 
			oHTMLElement: document.documentElement, // MAYDO, sert à rien pour une PAGE !
		  PropertyGetter : self.GetPageProperty };
		var oFoudPageDesc = null;
		for ( var index = 0; index < nPageCount; ++index ) {
			var bCritOk = self.IsCritereOk( self.oRunningAppliDesc.aDescPages[index].oPageCrit, oPagePropertyProvider );
			if ( bCritOk == false ) continue;
			// OK : mais il y a peut être des MustExist ou MustNotExist
			// --------------------------------------------------------
			var bMustExistOK = self.CheckPageMustExist( self.oRunningAppliDesc.aDescPages[index] );
			if ( bMustExistOK == true ) {
				oFoudPageDesc = self.oRunningAppliDesc.aDescPages[index];
				break;
			} // endif page trouvée OK
		} // end for
		if ( oFoudPageDesc === null ) {
			if ( bIsMainFrame && self.bUndefined === false ) {
				self.info( "*CTXP: RecoPageTick : LOAD Page _Undefined_ in Appli " + self.oRunningAppliDesc.AppliName );
				self.bUndefined = true;
				self.oRunningPageDesc = null;
				self.DoLoad(); // with curent "global" values
			} // endif
			// TICK !
			// ------
			if ( self.oRunningAppliDesc.uiAsyncDelay ) {
				window.setTimeout( self.RecoPageTick, self.oRunningAppliDesc.uiAsyncDelay );
			} else {
				self.warn( "**CTXP: RecoPageTick : No uiAsyncDelay after LOAD _Undefined_ in Appli " + self.oRunningAppliDesc.AppliName );
			} // endif Tick NON nul
		} else {
			if ( self.bUndefined === true ) {
				self.DoUnLoad(); // with curent "global" values
				self.bUndefined = false;
			} // endif
			self.oRunningPageDesc = oFoudPageDesc;
			self.info( "**CTXP: RecoPageTick : LOAD for Page " + self.oRunningPageDesc.PageName + " in Appli " +
					   self.oRunningAppliDesc.AppliName );
			self.DoLoad(); // with curent "global" values
			self.SetupListeners();
			// TICK !
			// ------
			if ( self.oRunningAppliDesc.uiAsyncDelay ) {
				window.setTimeout( self.RecoPageTick, self.oRunningAppliDesc.uiAsyncDelay );
			} else {
				self.warn( "**CTXP: RecoPageTick : No uiAsyncDelay after LOAD Page " + self.oRunningPageDesc.PageName + " in Appli " +
				           self.oRunningAppliDesc.AppliName );
			} // endif Tick NON nul
		} // endif PAS DE RECO
		
		// Mesure Performance (avec éventuels LOAD/UNLOAD et autres self.warn() )
		// ----------------------------------------------------------------------
		/**PERF** SUPER VERBEUX
		self.LogPerf( "RecoPageTick", TimeStampStart );
		**PERF**/
		
	};
	
	/**************************************
	* @method self.FindAppli
	* @param {Object} aDescApplis
	******************************************************/
	self.FindAppli = function( aDescApplis ) {
		var nAppliCount = aDescApplis.length;
		var oPagePropertyProvider = { 
			oHTMLElement: document.documentElement, // MAYDO, sert à rien pour une APPLI !
		  PropertyGetter : self.GetPageProperty };
		for ( var index = 0; index < nAppliCount; ++index ) {
			var bCritOk = self.IsCritereOk( aDescApplis[index].oAppliCrit, oPagePropertyProvider );
			if ( bCritOk == false ) continue;
			return aDescApplis[index];
		} // end for
		return null;
	};
	
	// **MAYDO : API qui ne respecte PAS le principe true/false technique et retour valeurs par références
	// ---------------------------------------------------------------------------------------------------
	/**************************************
	* @method self.CheckPageMustExist
	* @param {ctx.descriptor.Page} oPageDesc
	******************************************************/
	self.CheckPageMustExist = function( oPageDesc ) {
		if ( oPageDesc.bMustExistItems === false && oPageDesc.bMustNotExistItems === false ) return true;
		// Boucler sur les Desc
		// --------------------
		var nDescCount = oPageDesc.aDescItems.length;
		for ( var index = 0; index < nDescCount; ++index ) {
			if ( oPageDesc.aDescItems[ index ].bMustExist === false && oPageDesc.aDescItems[ index ].bMustNotExist === false ) continue;
			
			/** @type {Array<ctx.elementResult>} */  var aElementsResult = [];
			// RAPPEL MUST EXIST INTERDIT SUR OCCURS EN WEB3
			/** @type {Array<number>} */ var aIndexes = [];
			var oReturnedError = { "strValue": "" };
			var bRetCode = self.FindRunningItemByDesc( oPageDesc,
													   oPageDesc.aDescItems[ index ],  // Da Desc
													   aIndexes,                       // les index demandés
													   aElementsResult,
													   oReturnedError );
			var bFound;
			if ( bRetCode === false ) {
				// problème technique dans algo
				// Du coup on dit qu'il n'existe pas
				// ---------------------------------
				bFound = false;
			} else {
				// RAPPEL MUST EXIST INTERDIT SUR OCCURS EN WEB3
				if ( aElementsResult.length !== 0 ) {
					// **MAY DO : ici ou ailleurs : programmation défensive ! ASSERT LENGTH === 1
					bFound = true;
				} else {
					bFound = false;
				} // endif
			} // endif
			// test les 2 conditions d'échec et sinon continuer
			// ------------------------------------------------
			if ( bFound === false && oPageDesc.aDescItems[ index ].bMustExist === true ) return false;
			else if ( bFound === true && oPageDesc.aDescItems[ index ].bMustNotExist === true ) return false;

		} // end for 

		// Pas sorti avant : check OK
		// --------------------------
		return true;
	};
	
	/**************************************
	* **TODO CRIT_NUM
	* @method self.IsCritTextOk
	* @param {Object} oCrit
	* @param {Object} oPropertyProvider
	******************************************************/
	self.IsCritereOk = function( oCrit, oPropertyProvider ) {
		switch( oCrit.Type ) {
			case "CRIT_TEXT":
				return self.IsCritTextOk( oCrit, oPropertyProvider );
			case "CRIT_AND":
				// premier faux : échec
				// --------------------
				var nCritCount = oCrit.aCrits.length;
				for ( var index = 0; index < nCritCount; ++index ) {
					var bCritOk = self.IsCritereOk( oCrit.aCrits[ index ], oPropertyProvider );
					if ( bCritOk == false ) return false;
				} // end for
				return true;
			case "CRIT_OR":
				// premier vrai : succés
				// ---------------------
				var nCritCount = oCrit.aCrits.length;
				for ( var index = 0; index < nCritCount; ++index ) {
					var bCritOk = self.IsCritereOk( oCrit.aCrits[ index ], oPropertyProvider );
					if ( bCritOk == true ) return true;
				} // end for
				return false;
			case "CRIT_NOT":
				return !self.IsCritereOk( oCrit.aCrits[ 0 ], oPropertyProvider );
			case "CRIT_BOOL_STATE":
				return self.IsCritBoolOk( oCrit, oPropertyProvider );
			// **MAYDO: default, toussa
		} // end switch
		return false;
	};
	
	/***************************************************
	* reprise exacte de l'algo C++ Web3, vu que c'est quand même la
	* méthode toute simple à utiliser si on veut faire la même chose !
	* **TODO trancher sur le problème de la case sensitivity !
	* @method self.IsCritTextOk
	* @param {Object} oCrit
	* @param {Object} oPropertyProvider
	******************************************************/
	self.IsCritTextOk = function( oCrit, oPropertyProvider ) {
		var strValue = oPropertyProvider.PropertyGetter( oCrit.Property );
		if ( strValue == null ) {
			// Impossible d'obtenir la valeur actuelle de la propriété
			// -------------------------------------------------------
			if ( oCrit.ScanType == ctx.TextScanType.EMPTY ) {
				// On cherchait à obtenir une valeur vide : OK
				// -------------------------------------------
				return true;
			} else if ( oCrit.ScanType == ctx.TextScanType.ANY ) {
				// On cherchait à obtenir une valeur renseignée : KO
				// -------------------------------------------------
				return false;
			} else if ( oCrit.Value.length == 0 ) {
				// demande de Christophe dans la Mantis 590 : si critère renseigné avec une chaîne vide, OK
				// ----------------------------------------------------------------------------------------
				return true;
			} else { 
				// pas de value, mais une valeur non vide demandée : KO
				// ----------------------------------------------------
				return false;
			} // endif
		} // endif
		// Bon, problème null réglé, on a une chaîne
		// -----------------------------------------
		switch( oCrit.ScanType ) {
			case ctx.TextScanType.ANY:
				// ATTENTION : _Any_ N'est PAS content
				// avec une chaîne VIDE
				// -----------------------------------
				if ( strValue.length != 0 ) return true;
				break;			
			case ctx.TextScanType.EMPTY:
				if ( strValue.length == 0 ) return true;
				break;
			case ctx.TextScanType.FULL:
				if ( oCrit.Value === strValue ) return true;
				break;
			case ctx.TextScanType.PART:
				if ( strValue.indexOf( oCrit.Value ) != -1 ) return true;
				break;
			case ctx.TextScanType.BEGINS:
				if ( strValue.startsWith( oCrit.Value ) ) return true;
				break;
			case ctx.TextScanType.ENDS:
				if ( strValue.endsWith( oCrit.Value ) ) return true;
				break;
			case ctx.TextScanType.REGEX:
				if ( strValue.search( oCrit.Value ) != -1 ) return true;
				break;
			// **TODO default, toussa
		} // end switch
		return false;
	};

	/***************************************************
	* Method IsCritBoolOk
	* @method self.IsCritBoolOk
	* @param {Object} oCrit
	* @param {Object} oPropertyProvider
	******************************************************/
	self.IsCritBoolOk = function( oCrit, oPropertyProvider ) {
		var bValue = oPropertyProvider.PropertyGetter( oCrit.Property );
		return ( bValue === oCrit.Value );
	};

	// ***************************
	// Première version SANS CACHE
	// ***************************
	/***************************************************
	* Method GetPageProperty
	* @method self.GetPageProperty
	* @param {string} strProperty
	******************************************************/
	self.GetPageProperty = function( strProperty ) {
		switch( strProperty ) {
			case "HOSTNAME":
			case "SEARCH":
				var oLocation = document.location;
				if ( strProperty == "HOSTNAME" ) return oLocation.hostname;
				else return oLocation.search;
			case "URL":
				return document.URL;
			case "REFERRER":
				return document.referrer;
			case "NAME":
				return window.name;
			case "TITLE":
				return document.title;
			case "MAINFRAME":
				return ( window === window.top );
			// **MAYDO: default, toussa
		} // end switch
		return null;
	};

	// **************************************************************
	// Première version SANS CACHE
	// **MAYDO : mettre en place return true/false et oReturnValue ?
	// ATTENTION : SÉMANTIQUE null VS empty string !!! **TODO
	// **TODO Tout simplement généraliser property ==> ["property"] ?
	// **************************************************************
	/***************************************************
	* Method GetElemProperty
	* @method self.GetElemProperty
	* @param {string} strProperty
	******************************************************/
	self.GetElemProperty = function( strProperty ) {
		switch ( strProperty ) {
			case "Text":
				return this.oHTMLElement.innerText; // **MAYDO PERF ÉPOUVANTABLES SOUS CHROME !!! voir textContent
				/* 0002856: On Google Chrome, Items are not detected
				   Les TAGS <svg> ne rendent ici pas une chaîne mais un "object"
				   Voir https://stackoverflow.com/questions/29454340/detecting-classname-of-svganimatedstring
				   Utilisation de etAttribute("class") dans le default
			case "class":
				return this.oHTMLElement.className;
				*/
			case "InnerHTML":
				return this.oHTMLElement.innerHTML;
			case "OuterHTML":
				return this.oHTMLElement.outerHTML;
			default:
				var strResult = this.oHTMLElement.getAttribute(strProperty);; // **MAYDO PERF GESTION PROP PRÉSENTE/ABSENTE
				if ( typeof strResult === "undefined" ) return null;
				// **MAYDO AUTRE TYPEOF !?!
				return strResult;
		} // end switch
	};
	
	/***************************************************
	* Method EventListener
	* @method self.EventListener
	* @param {Object} evt
	******************************************************/
	self.EventListener = function( evt ) {
		/*** expérimentation manuel
		function getAllPropertyNames( obj ) {
			var props = [];

			do {
				props= props.concat(Object.getOwnPropertyNames( obj ));
			} while ( obj = Object.getPrototypeOf( obj ) );

			return props;
			
		}
		***/		
		self.log( "**CTXP EventListener: " + evt.type + ", Target: " + evt.target.nodeName );
		/*** expérimentation manuel
		self.log( "Event Dump: " + JSON.stringify( getAllPropertyNames( evt ) ) );
		*****/
		
		// si pas/plus couplé : NOP
		// ------------------------
		if ( self.bCouplage === false ) return;
		// si pas de page gérée, NOP
		// -------------------------
		if ( self.oRunningPageDesc === null ) return;
		
		if ( self.EventListenerImpl( evt.type, evt.target ) ) return;
		
		// si rien de fait, alors essai encore avec parent si click
		// Mantis 3115
		if ( evt.type === "click" ) {
			var NewTarget = evt.target.parentElement;
			if ( NewTarget ) self.EventListenerImpl( "click", NewTarget );
		} // endif
	
	};
	
	// Méthode d'implémentation appelée par EventListener
	// Ajoutée pour pouvoir être appelée DEUX fois dans le
	// cas d'un click : une fois pour la target, et une autre
	// avec le PARENT de la target, si le premier appel n'a
	// rein fait voir Mantis 3115
	// Manuel 19 juin 2018
	self.EventListenerImpl = function( EventType, TargetElem ) {

		self.log( "**CTXP EventListenerImpl: " + EventType + ", Target: " + TargetElem.nodeName );
		
		// Recherche de l'item concerné : parcours de tous les descriptifs et
		// demandes de récupération Items quand notifs matchent l'Event.
		// Ensuite, il faut comparer l'élément de l'Event avec les candidats
		// ------------------------------------------------------------------
		var uiEventNotif;
		var strEventName;
		if ( EventType === "click" ) {
			// en web3 CLICK et COMMAND sont synonymes
			uiEventNotif = ctx.TrackEvents.CLICK | ctx.TrackEvents.COMMAND ;
			strEventName = "CLICK";
		} else if ( EventType === "focus" ) {
			uiEventNotif = ctx.TrackEvents.SETFOCUS;
			strEventName = "SETFOCUS";
		} else if ( EventType === "blur" ) {
			uiEventNotif = ctx.TrackEvents.KILLFOCUS;
			strEventName = "KILLFOCUS";
		} else if ( EventType === "change" ) {
			uiEventNotif = ctx.TrackEvents.CHANGE;
			strEventName = "CHANGE";
			// "<property>" de WEB3 n'est pas gérable sur "change" HTML5
			// Peut être faudrait-il basculer sur les nouvelles technologies
			// genre "Mutation Observer"
		} else return false; // **TODO log error
		for ( var index = 0, NbItem = self.oRunningPageDesc.aDescItems.length; index < NbItem; ++index ) {
			var uiNotifs = self.oRunningPageDesc.aDescItems[ index ].uiNotifs;
			if ( uiNotifs === 0 ) continue;
			if ( uiNotifs & uiEventNotif ) {
				// Ok, c'est peut être lui !
				// -------------------------
				var oReturnedError = { strValue: "" }; // encore un cas de new in loop :-( **MAYDO
				// pousser autant de demandes d'index que d'occurs
				// -----------------------------------------------
				/** @type {Array<number>} */ var aIndexes;
				var nOccursCount = self.CountOccursFull( self.oRunningPageDesc, self.oRunningPageDesc.aDescItems[ index ] );
				if ( nOccursCount > 0 ) {
					// WEB3 : UN SEUL NIVEAU D'INDEX AUTORISÉ ! **MAYDO
					aIndexes = new Array(nOccursCount).fill(-3); // en utiliser un out of loop avec 16 postes, **MAYDO KEK
				} else {
					aIndexes = [];
				} // endif
				var aElementResults = [];
				var bRetCode = self.FindRunningItemByDesc( self.oRunningPageDesc, self.oRunningPageDesc.aDescItems[ index ], 
														   aIndexes, 
														   aElementResults,
														   oReturnedError );
				if (bRetCode === false) {
					self.error("**CTXP FindRunningItemByDesc Failed in EventListener: " + oReturnedError.strValue); 
					continue;
				} // endif
				if ( aElementResults.length === 0 ) continue;

				// Deuxième Version, manuel 15 novembre 2018
				// Gestion des Occurs sur un seul niveau (comme Web3)
				// --------------------------------------------------
				if ( nOccursCount === 0 ) {
					
					if ( aElementResults[ 0 ].oTheElement === TargetElem ) {
						
						// on a trouvé un descriptif NON occursé qui matche l'élément HTML
						// FOUND !
						// -------
						// Envoyer l'Event au WorkManager
						// ------------------------------
						// self.info( "**CTXP: EventListener for Event " + EventType + ", target Item found: " + self.oRunningPageDesc.aDescItems[ index ].ItemName );
						// distinguer entre click et command, CLICK est prépositionné
						// web3 : si le programmeur demande les DEUX, il AURA CLICK
						// ----------------------------------------------------------
						if ( EventType === "click" ) {
							// si CLICK **non** demandé, alors COMMAND, faut suivre
							if ( ( uiNotifs & ctx.TrackEvents.CLICK ) === 0 ) strEventName = "COMMAND";
						} // endif
						var oMsgToCtx = { 
							EventName : strEventName,
							AppliName : self.oRunningAppliDesc.AppliName,
							PageName  : self.oRunningPageDesc.PageName,
							ItemName  : self.oRunningPageDesc.aDescItems[ index ].ItemName,
							ObjectData: "_Default_" 
						};
						self.SendEventToContextor( oMsgToCtx );
						return true;
					} else {
						// cet élément HTML n'est pas celui du descriptif en cours
						// -------------------------------------------------------
						continue;
					} // endif
				} else {
					// Ce descriptif EST occursé
					// Il faut chercher si un des vivants EST l'élément HTML
					// Mais on ne supporte qu'un seul niveau d'occurs...
					// -----------------------------------------------------
					if ( nOccursCount === 1 ) {
						for ( var indexLiving = 0, NbLiving = aElementResults.length; indexLiving < NbLiving; ++indexLiving ) {
							if ( aElementResults[ indexLiving ].oTheElement === TargetElem ) {
								// Copié Collé du code d'envoi ci-dessus dans le cas non occursé
								// avec juste la notation crochet pour l'index
								// -------------------------------------------------------------
								if ( EventType === "click" ) {
									// si CLICK **non** demandé, alors COMMAND, faut suivre
									if ( ( uiNotifs & ctx.TrackEvents.CLICK ) === 0 ) strEventName = "COMMAND";
								} // endif
								var oMsgToCtx = { 
									EventName : strEventName,
									AppliName : self.oRunningAppliDesc.AppliName,
									PageName  : self.oRunningPageDesc.PageName,
									ItemName  : self.oRunningPageDesc.aDescItems[ index ].ItemName + "[" + indexLiving + "]",
									ObjectData: "_Default_" 
								};
								self.SendEventToContextor( oMsgToCtx );
								return true;								
							} // endif
						} // end for
					} else {
						// multi-occurs : pas géré
						// -----------------------
						continue;
					} // endif
				} // endif
			} // endif demande de notif pour CET event
		} // end for each Desc
	
		return false;
	};
		
	/***************************************************
	* Method SetupListeners
	* @method self.SetupListeners
	******************************************************/
	self.SetupListeners = function() {
		// encore un cas où on s'appuie sur des GLOBALS. BOF!
		// **TODO : remplacer par for let of quand ES6 DISPO !
		// ---------------------------------------------------
		var bClick = false;
		var bSetFocus = false;
		var bKillFocus = false;
		var bChange = false;
		for ( var index = 0, NbItem = self.oRunningPageDesc.aDescItems.length; index < NbItem; ++index ) {
			var uiNotifs = self.oRunningPageDesc.aDescItems[ index ].uiNotifs;
			if ( uiNotifs === 0 ) continue;
			if ( uiNotifs & ( ctx.TrackEvents.CLICK | ctx.TrackEvents.COMMAND ) ) {
				bClick = true;
			} // endif
			if ( uiNotifs & ctx.TrackEvents.SETFOCUS ) {
				bSetFocus = true;
			} // endif
			if ( uiNotifs & ctx.TrackEvents.KILLFOCUS ) {
				bKillFocus = true;
			} // endif
			if ( uiNotifs & ctx.TrackEvents.CHANGE ) {
				bChange = true;
			} // endif
		} // end for
		// Pour explication sur Capture et Bubbling voir
		// http://stackoverflow.com/questions/7398290/unable-to-understand-usecapture-attribute-in-addeventlistener
		if ( bClick === true ) {
			document.addEventListener( "click", self.EventListener, false ); // BUBBLING 
			self.log( "**CTXP ProcessTrackEvents: 'click' listened" );
		} // endif
		if ( bSetFocus === true ) {
			document.addEventListener( "focus", self.EventListener, true ); 
			self.log( "**CTXP ProcessTrackEvents: 'focus' listened" );
		} // endif
		if ( bKillFocus === true ) {
			document.addEventListener( "blur", self.EventListener, true ); 
			self.log( "**CTXP ProcessTrackEvents: 'blur' listened" );
		} // endif
		if ( bChange === true ) {
			document.addEventListener( "change", self.EventListener, true ); 
			self.log( "**CTXP ProcessTrackEvents: 'change' listened" );
		} // endif
	};
	
	/***************************************************
	* Method DoLoad
	* @method self.DoLoad
	******************************************************/
	self.DoLoad = function() {
		var oMsgToCtx = { 
			EventName : ctx.event.page.LOAD,
			AppliName : self.oRunningAppliDesc.AppliName,
			PageName  : self.bUndefined ? "_Undefined_" : self.oRunningPageDesc.PageName,
			ItemName  : "",
			ObjectData: "_Default_" 
		};
		// DANS LE CAS DE LOAD : ON CALCULE UN OBJET "uniqueID"
		// ----------------------------------------------------
		var rawRandom = Math.random();
		var rawPerfTick = performance.now();
		self.uniqueID = { "rawRandom": rawRandom, "rawPerfTick": rawPerfTick };
		oMsgToCtx.uniqueID = self.uniqueID;
		self.SendEventToContextor( oMsgToCtx );
	};

	// court-circuitage de SendEventToContextor pour cause
	// de hors sujet complet à propos de appli/page/items
	// et absence regrettable de goto en JavaScript
	// ---------------------------------------------------
	/***************************************************
	* Method DoLoadUnkAppli
	* @method self.DoLoadUnkAppli
	******************************************************/
	self.DoLoadUnkAppli = function() {
		var oMsgToCtx = { 
			EventName : "LOAD_UNKNOWN_APPLI",
			AppliName : "",
			PageName  : "",
			ItemName  : "",
			ObjectData: "" };
		self.MessageToContent( { 
			MsgType: ctx.message.Event, 
			MsgDatas: oMsgToCtx 
		} );
	};
	
	/***************************************************
	* Method DoUnLoad
	* @method self.DoUnLoad
	******************************************************/
	self.DoUnLoad = function() {
		var oMsgDatas = { 
			EventName : ctx.event.page.UNLOAD,
			AppliName : self.oRunningAppliDesc.AppliName,
			PageName  : self.bUndefined ? "_Undefined_" : self.oRunningPageDesc.PageName,
			ItemName  : "",
			ObjectData: "_Default_",
			uniqueID  : self.uniqueID
		};
		self.SendEventToContextor( oMsgDatas );
	};
	
	/***************************************************
	* Method PilProcessMessageFromContent
	* @method self.PilProcessMessageFromContent
	* @param {Object} oMsgDatas
	******************************************************/
	self.SendEventToContextor = function( oMsgDatas ) {
		
		// valeur 'spéciale' '_Default_' ou vide : on calcule le champ '<_ObjectData_>'
		if ((oMsgDatas.ObjectData === '_Default_') || (oMsgDatas.ObjectData === undefined)) {
			// **MAY DO : APPEL DIRECT BACKGROUND ?
			// ------------------------------------
			// oMsgDatas contient pour l'instant une propriété "ObjectData"
			// qui est une chaîne vide. Il faut créer une partie concernant
			// la page, et une partie "items". Exemple généré par WEB3+IE
			// ------------------------------------------------------------
			/****
			<_ObjectData_>
				<Name/>
				<Title><![CDATA[Accueil - LinuxFr.org]]></Title>
				<Referrer><![CDATA[http://linuxfr.org/compte/connexion]]></Referrer>
				<HostName><![CDATA[linuxfr.org]]></HostName>
				<Search/>
				<URL><![CDATA[http://linuxfr.org/]]></URL>
				<MainFrame>true</MainFrame>
				<Process>7444</Process>
				<Thread>1540</Thread>
				<MainIEFrame>
					<HWND>0x23096e</HWND>
				</MainIEFrame>
				<Tab>
					<HWND>0x3906ce</HWND>
				</Tab>
				<ErrorNo/>
				<ErrorNoX/>
				<Error/>
				<CX>1238</CX>
				<CY>618</CY>
				<Visible/>
				<Enabled/>
				<_Items_>
					<oSearchText><![CDATA[TOTO]]></oSearchText>
				</_Items_>
			</_ObjectData_>
			*****/
			var oPagePropertyProvider = { 
				oHTMLElement: document.documentElement, // MAYDO, sert à rien pour une PAGE !
				PropertyGetter : self.GetPageProperty };
			var strPropertyValue;
			var strObjectDatas = "<_ObjectData_>";
			
			// Les 6 propriétés textes de type "critères"
			// ------------------------------------------
			strPropertyValue = oPagePropertyProvider.PropertyGetter( "NAME" );
			strObjectDatas += "<Name><![CDATA[" + ( strPropertyValue === null ? "" : strPropertyValue ) + "]]></Name>";
			strPropertyValue = oPagePropertyProvider.PropertyGetter( "TITLE" );
			strObjectDatas += "<Title><![CDATA[" + ( strPropertyValue === null ? "" : strPropertyValue ) + "]]></Title>";
			strPropertyValue = oPagePropertyProvider.PropertyGetter( "REFERRER" );
			strObjectDatas += "<Referrer><![CDATA[" + ( strPropertyValue === null ? "" : strPropertyValue ) + "]]></Referrer>";
			strPropertyValue = oPagePropertyProvider.PropertyGetter( "HOSTNAME" );
			strObjectDatas += "<HostName><![CDATA[" + ( strPropertyValue === null ? "" : strPropertyValue ) + "]]></HostName>";
			strPropertyValue = oPagePropertyProvider.PropertyGetter( "SEARCH" );
			strObjectDatas += "<Search><![CDATA[" + ( strPropertyValue === null ? "" : strPropertyValue ) + "]]></Search>";
			strPropertyValue = oPagePropertyProvider.PropertyGetter( "URL" );
			strObjectDatas += "<URL><![CDATA[" + ( strPropertyValue === null ? "" : strPropertyValue ) + "]]></URL>";
			// booleén "MainFrame"
			// -------------------
			strObjectDatas += "<MainFrame>" + ( window === window.top ? "true" : "false" ) + "</MainFrame>";
			
			// Process, Thread, HWND (MainIEFrame, Tab), ErrorNo, ErrorNoX, Error : N/A
			// ------------------------------------------------------------------------
			
			// userAgent
			// ---------
			strObjectDatas += "<UserAgent><![CDATA[" + navigator.userAgent + "]]></UserAgent>";
			
			// Largeur, Hauteur
			// ----------------
			// CSS Pixels **TODO Real Pixels !
			// -------------------------------
			strObjectDatas += "<CX>" + window.innerWidth + "</CX>";
			strObjectDatas += "<CY>" + window.innerHeight + "</CY>";
			
			// Visible et Enabled, marqués **TODO dans les sources du pilote WEB3, LOL
			// -----------------------------------------------------------------------
			strObjectDatas += "<Visible/><Enabled/>";
			
			if ( self.bUndefined === true ) {
				strObjectDatas += "<_Items_/>";
			} else {
				// Parcourir les DescItem et obtenir la value des bCaptData, en live ou en cache suivant bCached
				// RAPPEL : contrairement à une opinion répandue, le cache est indispensable dans le cas des
				// UNLOADs suite à vidage Ajax (et c'est aussi vrai sur d'autres Events, d'ailleurs)
				// ---------------------------------------------------------------------------------------------
				strObjectDatas += "<_Items_>";
				var oReturnedError = { "strValue": "" }; // une alloc en moins en loop
				var oReturnValue = new ctx.returnValueClass();   // une autre alloc en moins en loop
				for ( var indexDesc = 0, nDescCount = self.oRunningPageDesc.aDescItems.length; indexDesc < nDescCount; ++indexDesc ) {
					if ( self.oRunningPageDesc.aDescItems[ indexDesc ].bCaptData === false ) continue;
					// **TODO SYSTÈME de CACHE
					// -----------------------
					// Repport existant WEB3 :  0 Occurs : OK
					//                          1 Occurs : NOP
					//                         >1 Occurs : NOP (genre, par exemple, 2 ou bien 37)
					// ---------------------------------------
					var TheDesc = self.oRunningPageDesc.aDescItems[ indexDesc ];
					var nOccursCount = self.CountOccursFull( self.oRunningPageDesc, TheDesc );
					if ( nOccursCount !== 0 ) continue;
					/** @type {Array<number>} */ var aIndexes = [];
					/** @type {Array<ctx.elementResult>} */ var aElementsResult = [];
					var bRetCode = self.FindRunningItemByDesc( self.oRunningPageDesc, TheDesc, aIndexes, aElementsResult, oReturnedError );
					if ( bRetCode === false ) continue;
					if ( aElementsResult.length === 0 ) continue;
					bRetCode = self.GetHtlmElemValue( aElementsResult[ 0 ].oTheElement, ctx.TypeHtmlValue.NO_HTML, oReturnValue, TheDesc );
					if ( bRetCode === false ) continue;
					// WEB3 utilise CDATA (si pas de chaîne CDATA dans la value KEK)
					var bCDATAFound = ( oReturnValue.strValue.indexOf( "<![CDATA[" ) !== -1 );
					strObjectDatas += "<" + TheDesc.ItemName + ">";
					if ( bCDATAFound === false ) strObjectDatas += "<![CDATA[";
					strObjectDatas += oReturnValue.strValue;
					if ( bCDATAFound === false ) strObjectDatas += "]]>";
					strObjectDatas += "</" + TheDesc.ItemName + ">";
					
					/*** MISE EN COMMENTAIRES D'UN DÉBUT D'IMPLÉMENTATION DU CAPTDATA MONO-OCCURSÉ
					if ( nOccursCount > 1 ) continue;
					var aIndexes = [];
					if ( nOccursCount === 1 ) aIndexes.push( -3 );
					var aElementsResult = [];
					var bRetCode = self.FindRunningItemByDesc( self.oRunningPageDesc, self.oRunningPageDesc.aDescItems[ indexDesc ],
															   aIndexes, aElementsResult, oReturnedError );
					if ( bRetCode === false ) continue;
					// deux cas : 0 occurs, et boucle sur single occurs
					// On fait une boucle, et la seule différence va être sur
					// la présence d'un "index" dans le nom d'Item
					// ------------------------------------------------------
					if ( aElementsResult.length === 0 ) continue;
					var oReturnValue;
					for ( var indexElem = 0, nElemCount = aElementsResult.length; indexElem < aElementsResult.length; ++indexElem ) {
						bRetCode = self.GetHtlmElemValue( aElementsResult[ indexElem ].oTheElement, GetHtmlTypeValue( ItemInfos ), oReturnValue );
						if ( bRetCode === false ) continue;
					} // end for
					******* FIN CAPTDATA MONO-OCCURSÉ ****/
					
				} // end for chaque desc item
				strObjectDatas += "</_Items_>";
				strObjectDatas += "</_ObjectData_>";
				oMsgDatas.ObjectData = strObjectDatas;
			} // endif page undefined
		} // endif ObjectData to be generated here
		
		self.MessageToContent( { 
			MsgType: ctx.message.Event, 
			MsgDatas: oMsgDatas 
		} );
	};
	
	// **********************************************
	// Implémentation du véritable traitement des messages
	// envoyés par 'content.js'. Pour l'instant : on arrive
	// ici par redirection depuis Injected.js. L'injection
	// du pilote POURRAIT supprimer le bootstrap ?
	// -----------------------------------------------------
	/***************************************************
	* Method PilProcessMessageFromContent
	* @method self.PilProcessMessageFromContent
	* @param {ctx.messageClass.ActionBase} oMessage
	******************************************************/
	self.PilProcessMessageFromContent = function( oMessage ) {
	    switch ( oMessage.MsgType ) {
	        case ctx.message.Couplage: {
	            self.DoCouplage( oMessage );
	            break;
	        }
	        case ctx.message.Decouplage: {
	            self.DoDeCouplage( oMessage );
	            break;
	        }
	        case ctx.message.Action:
	        case ctx.message.Action2: {
				if ( self.bCouplage === false ) return;
	            self.DoAction(oMessage);
	            break;
	        }
		    // **TODO, default log
		}
	};

	// **********************************************
	// Tentative de fix pour problème UNLOAD
	// envoyés par 'injected.js'. 
	// ----------------------------------------------
	/***************************************************
	* Method PushInResult
	* @method self.PushInResult
	* @param {ctx.messageClass.ActionBase} oMessage
	******************************************************/
	self.PilProcessMessageFromBootStrap = function( oMessage ) {
		switch ( oMessage.MsgType ) {
			case ctx.message.WinUnload: {
				if ( self.bCouplage === false ) return;
				if ( self.oRunningAppliDesc === null ) return;
				if ( self.oRunningPageDesc === null && self.bUndefined === false ) return;
				self.DoUnLoad();
				break;
			}
			// **TODO, default log
		}
	};
	
	// pousse en fin de tableau, **TODO à virer car devenu "oneliner"
	// --------------------------------------------------------------
	/***************************************************
	* Method PushInResult
	* @method self.PushInResult
	* @param {Array<ctx.elementResult>} aElementsResult
	* @param {Object} oSelectedElement
	* @param {Array<ctx.elementResult>} aChilds
	******************************************************/
	self.PushInResult = function( aElementsResult, oSelectedElement, aChilds ) {
		/** @type {ctx.elementResult} */ var result = new ctx.elementResult();
		result.oTheElement = oSelectedElement;
		result.aChildElements = aChilds;
		aElementsResult.push( result );
	};

	/***************************************************
	* Method BuildTagsList
	* @method self.BuildTagsList
	* @param {ctx.descriptor.Page} oPageDesc	
	* @param {Object} oDescItem
	* @param {Object} oReturnValues
	* @return {boolean}
	******************************************************/
	self.BuildTagsList = function( oPageDesc, oDescItem, oReturnValues ) {
		
		// Fin de récursion : mettre dernier aTags en tête
		// -----------------------------------------------
		if ( typeof oDescItem.Ancestor === "undefined" ) {
			oReturnValues.aaTags[ 0 ] = oDescItem.aTags;
			return true;
		} // endif
		var oTheAncestorDesc = self.FindDescItemByName( oPageDesc, oDescItem.Ancestor );
		if ( oTheAncestorDesc === null ) {
			// Possiblement en Tick de reconnaissance de page sur MustExist
			// ------------------------------------------------------------
			oReturnValues.strValue = "Ancestor " + oDescItem.Ancestor + " : Unknown Item";
			return false;
		} // endif
		
		// récursion et ajout en fin
		// -------------------------
		var bRetCode = self.BuildTagsList( oPageDesc, oTheAncestorDesc, oReturnValues );
		if ( bRetCode === false ) return false;
		oReturnValues.aaTags.push( oDescItem.aTags );
		return true;
		
	};
	
	/***************************************************
	* Method FindRunningItemByDesc
	* @method self.FindRunningItemByDesc
	* @param {ctx.descriptor.Page} oPageDesc	
	* @param {ctx.descriptor.Item} oDescItem
	* @param {Array<number>} aIndexes
	* @param {Array<ctx.elementResult>} aElementsResult
	* @param {Object} oReturnedError
	* @return {boolean}
	******************************************************/
	self.FindRunningItemByDesc = function(
			oPageDesc,          // desc de page, on est peut être en recherche de critère de page!
			oDescItem,          // un objet descriptif d'Item
			aIndexes,           // valeur des index demandés
			aElementsResult,    // le vecteur de vecteur
			oReturnedError ) {  // message d'erreur **TODO : USAGE HORS TICK-RECO

		// Manuel 17 mars 2016 : décision importante, après grosse
		// reflexion : refonte intégrale de la logique WEB3 (qui
		// marche, mais au prix d'une trop grande complexité du code)
		// On fabrique maintenant une Liste de Liste de TAGs par
		// concaténation pur et simple des tableaux TAGs des items
		// de la chaîne
		// ----------------------------------------------------------
		var oReturnValues = { 
			aaTags: [], 
			strValue:"" 
		};
		var bRetCode = self.BuildTagsList( oPageDesc, oDescItem, oReturnValues );
		if ( bRetCode === false ) {
			oReturnedError.strValue = oReturnValues.strValue;
			return false;
		} // endif

		return self.FindRunningElements( document.documentElement, oReturnValues.aaTags, 0, 0, aIndexes, 0, aElementsResult );
		
	};
	
	// Manuel 9 mars 2016 : refonte intégrale de la fameuse fonction CxWebFindElements de WEB3
	// pour simplification de la fonction elle même ainsi que des fonctions qui exploitent
	// le résultat. Principe : suppression des PUSH (mémorisation) des éléments occursés,
	// pour ne garder QUE les feuilles terminales. Au passage, refonte de la sémantique :
	// Compatibilité brisée avec WEB3 : on NE boucle PLUS sur un TAG non occursé quand
	// la récursion a trouvé au moins un résultat !
	// ---------------------------------------------------------------------------------------
	/** *************************************************
	* Method FindRunningElements
	* @method self.FindRunningElements
	* @param {Object} elementStart
	* @param {Object} aaTags
	* @param {number} iTagsListIndex index courant dans la liste des listes de tags
	* @param {number} iTagIndex index courant dans la liste des tags courante
	* @param {Array<number>} aIndexes valeur des index demandés
	* @param {number} IndexIndexToEat Index du prochain index à consommer
	* @param {Array<ctx.elementResult>} aElementsResult  le vecteur de vecteur
	* @return {boolean}
	***************************************************** */
	self.FindRunningElements = function( elementStart,       // un élement du DOM
		aaTags,             // une liste de liste de TAG
		iTagsListIndex,     // l'index courant dans la liste des listes de tags
		iTagIndex,          // l'index courant dans la liste des tags courante
		aIndexes,           // valeur des index demandés
		IndexIndexToEat,    // Index du prochain index à consommer
		aElementsResult ) { // le vecteur de vecteur

		var aTags = aaTags[ iTagsListIndex ];
		
		// Constituer la liste des éléments pour le TAG courant
		// ----------------------------------------------------
		
		// **TODO : Officialiser qu'on ne supporte PLUS le TAG "_All_"
		// **TODO faire une API MakeCollection générique
		// -----------------------------------------------------------
		var oCollection = {};
		var iColCount = 0;
		if ( aTags[ iTagIndex ].bDirectChildren === true ) {
			
			// Cas 1 : True Children Only
			// --------------------------
			var strTagNameUpperCase = aTags[ iTagIndex ].TagName.toUpperCase();
			var bRetVal = self.MakeDirectChildCollection( elementStart, strTagNameUpperCase, oCollection );
			if ( bRetVal === false ) return false; // **TODO REALLY ?
			iColCount = oCollection.length;
			
		} else {
			
			// Cas 2 : "All" Children
			// ----------------------
			oCollection = elementStart.getElementsByTagName( aTags[ iTagIndex ].TagName );
			iColCount = oCollection.length;			
			
		} // endif
		
		if ( iColCount === 0 ) {
			// TAG, non trouvé : NOP, et Occurs, Set et autres détails n'y changent RIEN
			// C'est à l'appelant d'en tirer les conclusions qui l'arrangent !
			// -------------------------------------------------------------------------
			return true;
		} // endif

		var bIsOccursed = aTags[ iTagIndex ].bOccurs;
		var iTargetIndex;
		if ( bIsOccursed === false ) iTargetIndex = 0;
		else {
			// prog.def. sur occurs et index... problème, pour l'instant pas de moyen de retourner l'erreur
			// --------------------------------------------------------------------------------------------
			if ( IndexIndexToEat + 1 > aIndexes.length ) return false;
			else {
				iTargetIndex = aIndexes[ IndexIndexToEat ]; // sera incrémenté à l'appel, SI NÉCESSAIRE
			} // endif
		} // endif
		
		// Si j'avais plusieurs liste de Tags (ancestor), suis-je sur la dernière ?
		// (quand pas d'ancestor, la liste de liste de Tags fait juste 1 de long)
		// ------------------------------------------------------------------------
		var nTagsListCount = aaTags.length;
		var bLastInTagsList = ( ( nTagsListCount - 1 === iTagsListIndex ) ? true : false );
		
		// OPTIMISATION : si je suis sur TAG OCCURS ET SI L'Index
		// demandé N'est PAS négatif, c'est pas trop la peine d'essayer
		// si la valeur d'index est plus grande que le compte trouvé, kek
		// --------------------------------------------------------------
		if ( ( bIsOccursed === true ) && ( iTargetIndex >= 0 ) && ( iTargetIndex + 1 > iColCount ) ) return true; // iColCount === 0 return déjà fait
		
		// Boucle systématique sur CHAQUE candidat
		// S'il y une demande RANGE on force
		// articiellement la boucle pour qu'elle
		// ne fasse qu'un tour. Rappel RANGE s'applique
		// AVANT check critère ATTR
		// --------------------------------------------
		var iIndexStart = 0;
		var iIndexEnd = iColCount - 1;
		if ( aTags[ iTagIndex ].Range !== -1 ) {
			// RAPPEL : CxAppWeb3.dll en mode Control Pane
			// SIGNALAIT que Range et Occurs sont incompatibles
			// sur un TAG. Qu'est devenu ce comportement en V3 ?
			// -------------------------------------------------
			// encore faut-il qu'il y en ait assez
			// -----------------------------------
			if ( aTags[ iTagIndex ].Range >= iColCount ) { // iColCount === 0 return déjà fait
				return true;
			} else {
				iIndexStart = iIndexEnd = aTags[ iTagIndex ].Range;
			} // endif
		} // endif
		
		var bIsSET = aTags[ iTagIndex ].bSet;
		var iTagCount = aTags.length;
		var bWasFinalTag = iTagIndex === ( iTagCount - 1 ) ? true : false;
	
		var oSelectedElement;
		
		// La boucle de la MORT (genre on veut un "input", et il y en a 367 dans la page
		// Travail perf essentiel ici... (en particulier si crit ATTR sur "id" LOL)
		// -----------------------------------------------------------------------------
		for ( var iIndex = iIndexStart; iIndex <= iIndexEnd; ++iIndex ) {
			
			oSelectedElement = oCollection.item( iIndex );
			var bSetElementFound = false;
			
			// Vérification des critères du TAG
			// S'IL Y EN A !
			// --------------------------------
			if ( aTags[ iTagIndex ].oAttrCrit != null ) {
				// **MAYDO PERF : NE PAS INSTANCIER EN BOUCLE ?!!
				// ATTENTION IMPACT LE JOUR OU MISE EN PLACE DU CACHE
				// --------------------------------------------------
				var oElemPropertyProvider = { 
					oHTMLElement: oSelectedElement,
					PropertyGetter : self.GetElemProperty };
				var bCritOk = self.IsCritereOk( aTags[ iTagIndex ].oAttrCrit, oElemPropertyProvider );
				if ( bCritOk === false ) {
					// candidat suivant
					// ----------------
					continue;
				} // endif
			} // endif
			
			// ***********
			// Candidat OK
			// ***********

			// Si je suis sur un TAG avec noeud fils <SET/> je dois maintenant juste
			// valider le patern restant. Il NE peut PAS y avoir de Occurs dans la
			// suite (mais il peut y en avoir sur CE TAG). J'appelle une récursion
			// avec un Vecteur local, et je regarde le résultat du vecteur pour
			// savoir si le patern est validé pour l'élément en cours
			// ---------------------------------------------------------------------
			if ( bIsSET === true && bWasFinalTag === false ) { // ON PEUT AVOIR SET SUR LAST
				// PLUS d'occurs/consommation d'index dans la suite du patern
				// ----------------------------------------------------------
				var aRecurseIndex = [];
				/** @type {Array<ctx.elementResult>} */ var aRecurseElementsResult = [];
				var aaRecurseTags = [ aTags ]; // **TODO OPTIM CALC ONLY ONCE IN LOOP!
				var bRecursRetVal = self.FindRunningElements( oSelectedElement, aaRecurseTags, 0, iTagIndex + 1, aRecurseIndex,
				                                              0, aRecurseElementsResult );
				if ( bRecursRetVal === false ) return false;
				if ( aRecurseElementsResult.length === 0 ) {
					// cette branche du patern n'est PAS bonne
					// ---------------------------------------
					continue;
				} else {
					// critères validés
					// ----------------
					bSetElementFound = true;
				} // endif
			} // endif
			
			// Nouvelle version de l'algorithme : on ne PUSH que si terminal
			// MAIS ON NE PUSH PAS SI ON EST DANS UN aTags d'Ancestor NON occursé
			// ------------------------------------------------------------------
			if ( bWasFinalTag === true || bSetElementFound === true ) {
				if ( bLastInTagsList === true ) {
					// PUSH ! 
					// ------
					self.PushInResult( aElementsResult, oSelectedElement, [] );
					if ( bIsOccursed === false ) {
						// Si le TAG n'est pas occursé, c'est terminé
						// ------------------------------------------
						return true;
					} else {
						// Si le TAG EST occursé, il faut peut être boucler encore, si toute la
						// liste est demandée, ou si l'index demandé n'est pas encore obtenu
						// **TODO simplification
						// --------------------------------------------------------------------
						if ( iTargetIndex < 0 ) {
							continue;
						} else {
							if ( iTargetIndex === 0 ) {
								// ben je viens de le pousser
								// --------------------------
								return true;
							} else {
								// j'ai une cible précise
								// ----------------------
								if ( aElementsResult.length === ( iTargetIndex + 1 ) ) {
									// cible atteinte !
									// ----------------
									return true;
								} else {
									continue;
								} // endif target atteinte
							} // endif target 0
						} // endif target < 0
					} // endif NOT occursed
				} else {
					// c'est fini avec un des ancestors, et donc il faut
					// partir en récursion sur les listes de tags suivantes
					// ----------------------------------------------------
					// DONC NOP
					//---------
				} // endif derniere list de TAGS
			} // endif LAST TAG
			
			// ICI, si j'étais en LastTag de la dernière liste je NE suis PLUS là
			// ------------------------------------------------------------------
			// Je peux être : en LastTag d'un ancestor mais reste d'autres listes
			// OU BIEN
			// dans un tag "normal" mais pas le tout dernier
			// ---------------------------------------------
			if ( bIsOccursed === false ) {
				// CAS reste des TAGs mais actuel PAS occursé : récursion
				// bête et méchante, si j'ose dire, sauf qu'il faut savoir
				// si on doit changer de liste
				// -------------------------------------------------------
				var bRecursRetVal;
				if ( bWasFinalTag === true || bSetElementFound === true ) {
					// récursion classique avec passage à la liste suivantes
					// -----------------------------------------------------
					bRecursRetVal = self.FindRunningElements( oSelectedElement, aaTags, iTagsListIndex + 1, 0, aIndexes,
															  IndexIndexToEat, aElementsResult );
				} else {
					// récursion classique en restant dans la même liste
					// -------------------------------------------------
					bRecursRetVal = self.FindRunningElements( oSelectedElement, aaTags, iTagsListIndex, iTagIndex + 1, aIndexes,
															  IndexIndexToEat, aElementsResult );
				} // endif
				
				if ( bRecursRetVal === false ) return false;
				
				var FinalCount = aElementsResult.length;
				// pas occursé, récursion finale appelée, si pas
				// de résultat obtenu, il faut essayer une autre
				// branche, mais si au moins un résultat obtenu
				// c'est bon, je N'ai PAS à essayer d'autres
				// versions du patern
				// ----------------------------------------------
				if ( FinalCount === 0 ) continue;
				else return true;
					
			} // endif TAG PAS OCCURSÉ
			
			// ici LE TAG est occursé, sinon je ne suis plus là. Par ailleurs il reste des tags qu'ils soient
			// dans la liste courante ou dans une liste suivante
			// Si je suis le seul Occurs du patern, on fait comme si de rien n'était : Zéro Occurs
			// et UN SEUL occurs donnent le même résultat : tout à plat dans un même vecteur, mais un vecteur avec
			// un unique poste si pas d'occurs. Par contre, quand il y a plusieurs Occurs dans un patern, il faut
			// créer les pseudos-items qui servent de pivot. Cette création doit se faire quand on boucle sur un
			// occurs et qu'on sait qu'il va y en avoir d'autres derrière. Atention : quand on crée le pseudo-item
			// et qu'on constate APRÈS récursion qu'aucun fils n'a pu être produit, il faut le virer ! Le plus
			// SIMPLE (si j'ose dire) : si reste occurs, faire la récursion sur un vecteur local et ne pousser un
			// pseudo Item que si le vecteur n'est pas vu comme vide.
			// ----------------------------------------------------------------------------------------------------
			// Pour l'instant (10 mars 2016) on s'appuie sur la valeur de IndexIndexToEat par rapport à la taile
			// de aIndexes pour savoir s'il reste des occurs. CE QUI SUPPOSE UNE VÉRIFICATION RIGOUREUSE des index
			// fournis.
			// ---------------------------------------------------------------------------------------------------
			// **TODO PRGRAMMATION DÉFENSIVE SUR LA COHÉRENCE IndexIndexToEat/aIndexes
			// -----------------------------------------------------------------------
			if ( IndexIndexToEat + 1 === aIndexes.length ) {
				// je suis le dernier occurs. Récursion classique,
				// sachant s'il faut changer de liste ou pas
				// -----------------------------------------------
				var bRecursRetVal;
				if ( bWasFinalTag === true || bSetElementFound === true ) {
					// récursion classique avec passage à la liste suivantes
					// -----------------------------------------------------
					bRecursRetVal = self.FindRunningElements( oSelectedElement, aaTags, iTagsListIndex + 1, 0, aIndexes,
															  IndexIndexToEat + 1, aElementsResult ); // eat+1 sert à rien NORMALEMENT
				} else {
					// récursion classique en restant dans la même liste
					// -------------------------------------------------
					bRecursRetVal = self.FindRunningElements( oSelectedElement, aaTags, iTagsListIndex, iTagIndex + 1, aIndexes,
															  IndexIndexToEat + 1, aElementsResult ); // eat+1 sert à rien NORMALEMENT
				} // endif
				if ( bRecursRetVal === false ) return false;
			} else {
				// Il reste des occurs
				// -------------------
				/** @type {Array<ctx.elementResult>} */ var aLocalElementsResult = [];
				var bRecursRetVal;
				if ( bWasFinalTag === true || bSetElementFound === true ) {
					// récursion classique avec passage à la liste suivantes
					// -----------------------------------------------------
					bRecursRetVal = self.FindRunningElements( oSelectedElement, aaTags, iTagsListIndex + 1, 0, aIndexes,
															  IndexIndexToEat + 1, aLocalElementsResult );
				} else {
					// récursion classique en restant dans la même liste
					// -------------------------------------------------
					bRecursRetVal = self.FindRunningElements( oSelectedElement, aaTags, iTagsListIndex, iTagIndex + 1, aIndexes,
															  IndexIndexToEat + 1, aLocalElementsResult );
				} // endif
				if ( bRecursRetVal === false ) return false;
				if ( aLocalElementsResult.length !== 0 ) {
					// Push
					// ----
					self.PushInResult( aElementsResult, null, aLocalElementsResult );
				} // endif
			} // endif
				
			// simple : soit j'ai ce qu'il me faut, soit NON
			// ---------------------------------------------
			if ( iTargetIndex < 0 ) continue;
			var FinalCount = aElementsResult.length;
			if ( FinalCount === ( iTargetIndex + 1 ) ) return true;
			continue;

		} // end for 
		
		return true;
		
	};
	
	/***************************************************
	* Method Event
	* @method self.CMakeDirectChildCollection
	* @param {Object} oParentElemen
	* @param {string} strTagName
	* @param {Object} oCollection
	* @return {boolean}
	******************************************************/
	self.MakeDirectChildCollection = function( oParentElemen, strTagName, oCollection ) {
		oCollection.aElems = [];
		oCollection.length = 0;
		oCollection.item = function( index ) {
			return this.aElems[ index ];
		};
		var oSomeDirectChild = oParentElemen.firstElementChild;
		
		while ( oSomeDirectChild ) {
			if ( oSomeDirectChild.tagName === strTagName ) {
				oCollection.aElems.push( oSomeDirectChild );
				++(oCollection.length);
			} // endif
			oSomeDirectChild = oSomeDirectChild.nextElementSibling
		} // end while
		return true;
	};

	//envoie du message d'injection OK.
	self.MessageToContent( { 
			MsgType: ctx.message.PilotInjectDone 
			} );
		self.info( "**CTXP: PILOTE Injection done! for " + document.URL );
	
	return self;
	
}(__CtxChrExtInj));

// declare a global 'Contextor' object, injected in page, which implements Event and Log methods
Contextor = new __CtxChrExtInj.ContextorClass();