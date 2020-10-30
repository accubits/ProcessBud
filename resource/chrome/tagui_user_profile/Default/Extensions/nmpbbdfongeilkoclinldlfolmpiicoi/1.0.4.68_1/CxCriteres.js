// CxCriteres.js : implémentation des classes de gestions de critères
// Manuel février 2016
// Version 0.2
//
// CE CODE EST MAINTENANT DU TYPE "UN ESSAI POUR VOIR". Au 24/02/2016
// IL N'EST PLUS INJECTÉ MAIS SERT DE DOCUMENTATION AUX CONCEPTS
// UTILISÉS PAR LES GESTION DE CRITÈRES 
// ------------------------------------------------------------------

// ******************************************************************************
// HUM.... Ce code DOIT être injecté dans la page (pour raison de performance ???
// OU BIEN NON, PEUT PARFAITEMENT TOURNER SEULEMENT DANS CONTENT.JS ???
// SI DANS PAGE, use strict INTERDIT !!!
// ******************************************************************************

// Hé oui, dommage
/******
"use strict";
*******/

// 3 Critères terminaux possibles : Texte, Numérique et Booléen
// 3 Crtières non terminaux (conditionnels) possibles : AND, OR et NOT
// -------------------------------------------------------------------
//
// Diagramme d'héritage de la hiérachie de Classe
//
//                                      -------------
//                                      | CxCritere |
//                                      -------------
//                                       /         \
//                                      /           \
//                                     /             \
//                                    /               \
//            ------------------     /                 \    --------------
//            | CxCritTerminal |----                    ----| CxCritCond |
//            ------------------                            --------------
//           /        |         \                          /      |       \
//          /         |          \                        /       |        \
//         /          |           \                      /        |         \
//        /           |            \                    /         |          \
// ------------  -----------   ------------      -----------  ----------  -----------
// |CxCritText|  |CxCritNum|   |CxCritBool|      |CxCritAnd|  |CxCritOr|  |CxCritNot|
// ------------  -----------   ------------      -----------  ----------  -----------
//
// Remarque : dans la version C++, CCxCritere_NOT dérive directement de CCxCritere, mais
// c'est plus simble de dire que NOT c'est un COND avec un seule élément dans le tableau
// -------------------------------------------------------------------------------------

// **********************************************
// L'idiome OOP utilisé ici est celui de  Mozilla
// **********************************************

// Module patern, tel qu'expliqué, par exemple ici:
// http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
// Ici on utilise le patern "Augmentation"

__CtxChrExtInj = (function( self ) {
	
	/***** DEBUT DU SCOPE D'AUGMENTATION
	*************************************/
	
// Les valeurs possibles pour le type de critère demandé à la Factory
// ------------------------------------------------------------------
ctx.CxCritType = Object.freeze( { 
	TEXT:0, 
	NUM:1, 
	BOOL:2, 
	AND:3, 
	OR:4, 
	NOT:5 
} );

/**
*  Classe de base (abstraite) d'un critère
*  Le type est surtout là pour
*  debug/assert/logging/gestion d'erreur
* @class ctx.CxCritere
* @constructor
*/
ctx.CxCritere = function( Type ) {
	this.Type = Type;
};

/**
* classe de base (abstraite) d'un critère terminal
* @class ctx.CxCritTerminal
* @extends {ctx.CxCritere}
* @constructor
*/
ctx.CxCritTerminal = function( Type, Property, Value ) {
	ctx.CxCritere.call( this, Type );
	this.Property = Property;
	this.Value    = Value;
};
ctx.CxCritTerminal.prototype = Object.create(ctx.CxCritere.prototype);
ctx.CxCritTerminal.prototype.constructor = ctx.CxCritTerminal;
	
// Les valeurs possibles pour le type de comparaison à faire pour un critère Texte
// -------------------------------------------------------------------------------
ctx.CxTextScanType = Object.freeze( { FULL:0, PART:1, BEGINS:2, ENDS:3, EMPTY:4, ANY:5, REGEX:6 } );

/**
* Classe conscrète des critères terminaux de Type "Texte"
* @class ctx.CxCritText
* @extends {ctx.CxCritTerminal}
* @struct
* @constructor
*/
ctx.CxCritText = function( Property, Value, ScanType ) {
	ctx.CxCritTerminal.call( this, ctx.CxCritType.TEXT, Property, Value );
	this.ScanType   = ScanType;
};
ctx.CxCritText.prototype = Object.create(ctx.CxCritTerminal.prototype);
ctx.CxCritText.prototype.constructor = ctx.CxCritText;

// Code de vérification d'un critère "Texte"
// -----------------------------------------
ctx.CxCritText.prototype.IsCritereOk = function( PropertyProvider ) {
	// obtenir la valeur actuelle de la property
	// -----------------------------------------
	// ** BIG TODO : ne pas préjuger de la façon d'obtenir
	//    la valeur, mais la demander à l'objet
	// var strProp = PropertyProvider.getTextProperty( this.Property );
	// ---------------------------------------------------
	var strProp = PropertyProvider[ this.Property ];
	
	// Faire la comparaison demandée
	// -----------------------------
	if ( strProp == this.Value ) return true;
	return false;
};

// classe de base (abstraite) d'un critère conditionnel
// Implémente le tableau des critères
// ----------------------------------------------------
ctx.CxCritCond = function( Type ) {
	ctx.CxCritere.call( this, Type );
	this.aCrits = [];
};	
ctx.CxCritCond.prototype = Object.create(ctx.CxCritere.prototype);
ctx.CxCritCond.prototype.constructor = ctx.CxCritCond;

// La méthode d'ajout des critères au tableau
ctx.CxCritCond.prototype.AddOneCrit = function( OneCrit ) {
	this.aCrits.push( OneCrit );
};

// classe concrète d'un critère "NOT"
// ----------------------------------
ctx.CxCritNot = function( TheCrit ) {
	ctx.CxCritCond.call( this, ctx.CxCritType.NOT );
	ctx.CxCritCond.prototype.AddOneCrit.call( this, TheCrit );
};
ctx.CxCritNot.prototype = Object.create(ctx.CxCritCond.prototype);
ctx.CxCritNot.prototype.constructor = ctx.CxCritNot;

// Code de vérification d'un critère "NOT"
// ---------------------------------------
ctx.CxCritNot.prototype.IsCritereOk = function( PropertyProvider ) {
	return !this.aCrits[0].IsCritereOk( PropertyProvider );
};

/**
* classe concrète d'un critère "AND"
* @class ctx.CxCritAnd
* @struct
* @constructor
*/
ctx.CxCritAnd = function() {
	ctx.CxCritCond.call( this, ctx.CxCritType.AND );
};
ctx.CxCritAnd.prototype = Object.create(ctx.CxCritCond.prototype);
ctx.CxCritAnd.prototype.constructor = ctx.CxCritAnd;

// Code de vérification d'un critère "AND"
// ---------------------------------------
self.CxCritAnd.prototype.IsCritereOk = function( PropertyProvider ) {
	// boucle sur liste de critères et retour false au premier échec
	var arrayLength = this.aCrits.length;
	for ( var i = 0; i < arrayLength; ++i) {
		var bOneCritOk = this.aCrits[ i ].IsCritereOk( PropertyProvider );
		if ( bOneCritOk === false ) return false;
	} // end for	
	return true;
};

/**
* classe concrète d'un critère "OR"
* @class ctx.CxCritOr
* @struct
* @constructor
*/
ctx.CxCritOr = function() {
	ctx.CxCritCond.call( this, ctx.CxCritType.OR );
};
ctx.CxCritOr.prototype = Object.create(ctx.CxCritCond.prototype);
ctx.CxCritOr.prototype.constructor = ctx.CxCritOr;

// Code de vérification d'un critère "OR"
// ---------------------------------------
self.CxCritOr.prototype.IsCritereOk = function( PropertyProvider ) {
	// boucle sur liste de critères et retour true au premier OK
	var arrayLength = this.aCrits.length;
	for ( var i = 0; i < arrayLength; ++i) {
		var bOneCritOk = this.aCrits[ i ].IsCritereOk( PropertyProvider );
		if ( bOneCritOk === true ) return true;
	} // end for	
	return false;
};

// Le point d'entrée du processus de désérialization récursive
// EST un 'object' issu de JSON PARSE pour récursion claire (sans
// typeof machin bidule)
// --------------------------------------------------------------
self.CxCritFactoryFunction = function( oFlatCrit ) {
	try {
		var oTheCrit = null;
		switch ( oFlatCrit.Type ) {
			case self.CxCritType.AND:
			case self.CxCritType.OR:  {
				if ( oFlatCrit.Type === self.CxCritType.AND ) {
					oTheCrit = new self.CxCritAnd();
				} else {
					oTheCrit = new self.CxCritOr();
				} // endif
				var arrayLength = oFlatCrit.aCrits.length;
				// **MAYDO : check au moins 2 ?
				// ----------------------------
				for ( var i = 0; i < arrayLength; ++i) {
					var oOneCrit = self.CxCritFactoryFunction( oFlatCrit.aCrits[ i ] );
					oTheCrit.AddOneCrit( oOneCrit );
				} // end for			
				return oTheCrit;
			} // AND/OR
			case self.CxCritType.TEXT: {
				// **MAYDO : check scantype (présent/absent et valeur si présent)
				// --------------------------------------------------------------
				oTheCrit = new self.CxCritText( oFlatCrit.Property, oFlatCrit.Value, oFlatCrit.ScanType );
				return oTheCrit;
			} // TEXT
			default:
				throw new Error( "Invalid Type: [" + oFlatCrit.Type + "] in CxCritFactoryFunction" )
		} // end switch
	} catch( e ) {
		self.log( "Exception in CxCritFactoryFunction : " + e.message );
	} 
}

/************************ CODE DE TEST CONSTRUCTION / SÉRIALISATION / désérialisation
 ************************************************************************************
var oOneTextCrit = new self.CxCritText( "URL", "http", self.CxTextScanType.BEGINS );
var oAnotherCrit = new self.CxCritText( "TITLE", "Accueil", self.CxTextScanType.PARTS );
var oOneCritAnd = new self.CxCritAnd();
oOneCritAnd.AddOneCrit( oOneTextCrit );
oOneCritAnd.AddOneCrit( oAnotherCrit );
var strCrit = JSON.stringify( oOneCritAnd );

self.log( "Sérialisation  de l'objet 'Crit': " + strCrit );

var oFlatCrit = JSON.parse( strCrit );
var oRealCrit = self.CxCritFactoryFunction( oFlatCrit );

strCrit = JSON.stringify( oRealCrit );
self.log( "Sérialisation2 de l'objet 'Crit': " + strCrit );

**********************************************************************************/

self.MessageToContent( "CRITERES_INJECT_DONE", {} );

	/***** FIN DU SCOPE D'AUGMENTATION
	*************************************/

return self;
}(__CtxChrExtInj));	
	
// eof CxCriteres.js