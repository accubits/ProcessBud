// CxDescs.js : implémentation des classes des descriptifs
// Manuel février 2016
// Version 0.2
// ------------------------------------------------------

// ******************************************************************************
// HUM.... Ce code DOIT être injecté dans la page (pour raison de performance ???
// OU BIEN NON, PEUT PARFAITEMENT TOURNER SEULEMENT DANS CONTENT.JS ???
// SI DANS PAGE, use strict INTERDIT !!!
// ******************************************************************************

// BIG PROBLEM : si on doit injecter ce code dans la page, et NON PAS seulement dans la partie
// "content" de l'extension, alors il semble que "use strict" soit fortement déconseillé à cause
// des effets de bords avec les scripts originaux de la page. MAIS le support des classes de
// ECMA-262 6th Edition n'est disponible à ce jour (8 février 2016) QUE :
//   * dans chrome 42+ avec "use strict";
//   * dans chrome 49+ quelque soit le strict
// Version Chrome ACTUELLEMENT déployée sur des PCs Windows 7 : CHROME 48...
// *********************************************************************************************

// ***********************************************************************************************
// Manuel 11 février  2016 : première étude performance : JS tourne 50% plus vite dans "injected"
// Manuel 15 novembre 2018 : ATTENTION CE SOURCE EST BIDON. Cette "documentation" n'est PAS à jour
// ***********************************************************************************************

/******
"use strict";
*******/

// Descriptif d'un TAG
// -------------------
// Propriétés :
//    string TagName
//    bool   bDirectChildren
//    int    Range
//    bool   bOccurs
//    bool   bSet
//    object oAttrCrit, may be null
// --------------------------------

// -----------------------------------
// Descriptif d'Item
// -----------------------------------
// Propriétés :
//    string ItemName
//    bool   bMustExist
//    bool   bMustNotExist
//    bool   bCaptData
//    bool   bCached
//    string TypObj, may be undefined
//    string Ancestor, may be undefined
//    string SetValueMethod, may be undefined
//    string GetValueMethod, may be undefined
//    array  aTags
//    uint   uiNotifs
// **MAYDO
//    caching du DescItem de l'ancestor
// ------------------------------------
 
 // -----------------------------------
 // Descriptif d'une PAGE
 // -----------------------------------
 // string PageName
 // object oPageCrit
 // array  aDescItems
 // bool   bMustExistItems
 // bool   bMustNotExistItems
 // bool   bCaptDataItemsCached
 // bool   bItemsAutosEventDatas
 // uint   uiNotifs
 // bool   bSizeCrit
 // string OnLoadScript, may be undefined
 // ------------------------------------
 
 // -----------------------------------
 // Descriptif d'une APPLI
 // -----------------------------------
 // string AppliName
 // string ShortName
 // int    iTypeInstanceID (0: Process, 1: Thread) sauf que LOL Chrome
 // uint   uiAsyncDelay
 // array  aDescPages
 // object oAppliCrit
 // ------------------------------------
 
// eof CxDescs.js