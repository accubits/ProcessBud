/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
'use strict';var k,aa=function(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}},ba="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;a[b]=c.value;return a},ca=function(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");
},da=ca(this),ea=function(a,b){if(b)a:{var c=da;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&ba(c,a,{configurable:!0,writable:!0,value:b})}};
ea("Symbol",function(a){if(a)return a;var b=function(e,f){this.g=e;ba(this,"description",{configurable:!0,writable:!0,value:f})};b.prototype.toString=function(){return this.g};var c=0,d=function(e){if(this instanceof d)throw new TypeError("Symbol is not a constructor");return new b("jscomp_symbol_"+(e||"")+"_"+c++,e)};return d});
ea("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");for(var b="Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "),c=0;c<b.length;c++){var d=da[b[c]];"function"===typeof d&&"function"!=typeof d.prototype[a]&&ba(d.prototype,a,{configurable:!0,writable:!0,value:function(){return fa(aa(this))}})}return a});
var fa=function(a){a={next:a};a[Symbol.iterator]=function(){return this};return a},l=function(a){return a.raw=a},ia=function(a,b){a.raw=b;return a},n=function(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return b?b.call(a):{next:aa(a)}},p=function(a){if(!(a instanceof Array)){a=n(a);for(var b,c=[];!(b=a.next()).done;)c.push(b.value);a=c}return a},ja="function"==typeof Object.create?Object.create:function(a){var b=function(){};b.prototype=a;return new b},ka;
if("function"==typeof Object.setPrototypeOf)ka=Object.setPrototypeOf;else{var la;a:{var ma={a:!0},na={};try{na.__proto__=ma;la=na.a;break a}catch(a){}la=!1}ka=la?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}
var oa=ka,t=function(a,b){a.prototype=ja(b.prototype);a.prototype.constructor=a;if(oa)oa(a,b);else for(var c in b)if("prototype"!=c)if(Object.defineProperties){var d=Object.getOwnPropertyDescriptor(b,c);d&&Object.defineProperty(a,c,d)}else a[c]=b[c];a.Eb=b.prototype},pa=function(){this.o=!1;this.m=null;this.h=void 0;this.g=1;this.l=this.D=0;this.C=this.j=null},qa=function(a){if(a.o)throw new TypeError("Generator is already running");a.o=!0};pa.prototype.u=function(a){this.h=a};
var ra=function(a,b){a.j={Rc:b,xn:!0};a.g=a.D||a.l};pa.prototype.return=function(a){this.j={return:a};this.g=this.l};var u=function(a,b,c){a.g=c;return{value:b}};pa.prototype.fb=function(a){this.g=a};
var sa=function(a,b,c){a.D=b;void 0!=c&&(a.l=c)},ta=function(a,b){a.g=b;a.D=0},ua=function(a){a.D=0;var b=a.j.Rc;a.j=null;return b},va=function(a){var b=a.C.splice(0)[0];(b=a.j=a.j||b)?b.xn?a.g=a.D||a.l:void 0!=b.fb&&a.l<b.fb?(a.g=b.fb,a.j=null):a.g=a.l:a.g=0},wa=function(a){this.g=new pa;this.h=a},za=function(a,b){qa(a.g);var c=a.g.m;if(c)return xa(a,"return"in c?c["return"]:function(d){return{value:d,done:!0}},b,a.g.return);a.g.return(b);return ya(a)},xa=function(a,b,c,d){try{var e=b.call(a.g.m,
c);if(!(e instanceof Object))throw new TypeError("Iterator result "+e+" is not an object");if(!e.done)return a.g.o=!1,e;var f=e.value}catch(g){return a.g.m=null,ra(a.g,g),ya(a)}a.g.m=null;d.call(a.g,f);return ya(a)},ya=function(a){for(;a.g.g;)try{var b=a.h(a.g);if(b)return a.g.o=!1,{value:b.value,done:!1}}catch(c){a.g.h=void 0,ra(a.g,c)}a.g.o=!1;if(a.g.j){b=a.g.j;a.g.j=null;if(b.xn)throw b.Rc;return{value:b.return,done:!0}}return{value:void 0,done:!0}},Aa=function(a){this.next=function(b){qa(a.g);
a.g.m?b=xa(a,a.g.m.next,b,a.g.u):(a.g.u(b),b=ya(a));return b};this.throw=function(b){qa(a.g);a.g.m?b=xa(a,a.g.m["throw"],b,a.g.u):(ra(a.g,b),b=ya(a));return b};this.return=function(b){return za(a,b)};this[Symbol.iterator]=function(){return this}},Ba=function(a,b){b=new Aa(new wa(b));oa&&a.prototype&&oa(b,a.prototype);return b},Ca=function(a){function b(d){return a.next(d)}function c(d){return a.throw(d)}return new Promise(function(d,e){function f(g){g.done?d(g.value):Promise.resolve(g.value).then(b,
c).then(f,e)}f(a.next())})},Da=function(a){return Ca(new Aa(new wa(a)))},Ea=Ea||{},Fa=this||self,Ia=function(a){if(a&&a!=Fa)return Ga(a.document);null===Ha&&(Ha=Ga(Fa.document));return Ha},Ja=/^[\w+/_-]+[=]{0,2}$/,Ha=null,Ga=function(a){return(a=a.querySelector&&a.querySelector("script[nonce]"))&&(a=a.nonce||a.getAttribute("nonce"))&&Ja.test(a)?a:""},Ka=function(a,b){a=a.split(".");b=b||Fa;for(var c=0;c<a.length;c++)if(b=b[a[c]],null==b)return null;return b},La=function(){},Ma=function(a){a.Lj=void 0;
a.Rb=function(){return a.Lj?a.Lj:a.Lj=new a}},Oa=function(a){var b=typeof a;return"object"!=b?b:a?Array.isArray(a)?"array":b:"null"},Pa=function(a){var b=Oa(a);return"array"==b||"object"==b&&"number"==typeof a.length},Qa=function(a){return"function"==Oa(a)},Ra=function(a){var b=typeof a;return"object"==b&&null!=a||"function"==b},Ua=function(a){return Object.prototype.hasOwnProperty.call(a,Sa)&&a[Sa]||(a[Sa]=++Ta)},Va=function(a){null!==a&&"removeAttribute"in a&&a.removeAttribute(Sa);try{delete a[Sa]}catch(b){}},
Sa="closure_uid_"+(1E9*Math.random()>>>0),Ta=0,Wa=function(a,b,c){return a.call.apply(a.bind,arguments)},Xa=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}},Ya=function(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?Ya=Wa:Ya=Xa;return Ya.apply(null,
arguments)},Za=function(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}},$a=Date.now,v=function(a,b){a=a.split(".");var c=Fa;a[0]in c||"undefined"==typeof c.execScript||c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)a.length||void 0===b?c[d]&&c[d]!==Object.prototype[d]?c=c[d]:c=c[d]={}:c[d]=b},w=function(a,b){function c(){}c.prototype=b.prototype;a.Eb=b.prototype;a.prototype=new c;a.prototype.constructor=
a},ab=function(a){return a};var chrome=chrome||window.chrome||{};chrome.cast=chrome.cast||{};chrome.cast.media=chrome.cast.media||{};var mojo={};var bb=function(){return Promise.reject(Error("Not implemented"))};var cb=function(a){this.g=a},eb=function(a){var b=db.get(a);b||(b=new cb(a),db.set(a,b));return b},hb=function(a){a.level>=fb&&gb.forEach(function(b){return b(a)})};cb.prototype.log=function(a,b,c){if(!(a<fb)){"function"==typeof b&&(b=b());b=b.replace(ib,"[Redacted URL]");b=b.replace(jb,"[Redacted domain/email]");b=b.replace(kb,function(e,f,g){return f+":<"+g.substr(-4)+">"});var d={N:this.g,level:a,time:Date.now(),message:b,Rc:c};gb.forEach(function(e){return e(d)})}};
cb.prototype.error=function(a,b){this.log(3,a,b)};cb.prototype.K=function(a,b){this.log(2,a,b)};cb.prototype.info=function(a,b){this.log(1,a,b)};var lb=function(a,b,c){a.log(0,b,c)},nb=function(a){a=mb.indexOf(a);return-1==a?0:a},ob=function(a){return 600>=a?0:850>=a?1:950>=a?2:3},gb=[],db=new Map,mb=["FINE","INFO","WARNING","SEVERE"],jb=/(([\w.+-]+@)|((www|m|mail|ftp)[.]))[\w.-]+[.][\w-]{2,4}/gi,ib=/(data:|https?:\/\/)\S+/gi,kb=/(dial|cast):<([a-zA-Z0-9]+)>/gi,fb=1;var pb=function(a){this.g=a;this.h=Date.now()},qb=function(a,b){null!=b&&(a+="_"+b);return a};pb.prototype.end=function(a){var b=Date.now()-this.h;rb(qb(this.g,a),b)};var rb=function(a,b){0>b&&(tb.K("Timing analytics event with negative time"),b=0);1E4<b&&(b=1E4);try{chrome.metricsPrivate.recordTime(a,b)}catch(c){tb.K("Failed to record time "+b+" in "+a)}},tb=eb("mr.Timing"),ub=function(a){pb.call(this,a)};t(ub,pb);
ub.prototype.end=function(a){var b=Date.now()-this.h;a=qb(this.g,a);if(0>b)vb.K("Timing analytics event with negative time");else{1E4>b&&(b=1E4);18E4<b&&(b=18E4);try{chrome.metricsPrivate.recordMediumTime(a,b)}catch(c){vb.K("Failed to record time "+b+" in "+a)}}};var vb=eb("mr.MediumTiming"),wb=function(a){pb.call(this,a)};t(wb,pb);
wb.prototype.end=function(a){var b=Date.now()-this.h;a=qb(this.g,a);if(0>b)xb.K("Timing analytics event with negative time");else{18E4>b&&(b=18E4);36E5<b&&(b=36E5);try{chrome.metricsPrivate.recordLongTime(a,b)}catch(c){xb.K("Failed to record time "+b+" in "+a)}}};
var xb=eb("mr.LongTiming"),yb=eb("mr.Analytics"),zb=function(a){try{chrome.metricsPrivate.recordUserAction(a)}catch(b){yb.K("Failed to record event "+a)}},Ab=function(a,b,c){var d,e=0,f;for(f in c)e++,c[f]==b&&(d=f);if(d){c={metricName:a,type:"histogram-linear",min:1,max:e,buckets:e+1};try{chrome.metricsPrivate.recordValue(c,b)}catch(g){yb.K("Failed to record enum value "+d+" ("+b+") in "+a,g)}}else yb.error("Unknown analytics value, "+b+" for histogram, "+a,Error())},Bb=0,Cb={UNKNOWN:Bb,uK:1,ON_SINKS_REMOVED:2,
SG:3,QG:4,PG:5},Db=null,Eb=function(a){null!=Db&&(clearTimeout(Db),Db=null);Bb=a;Db=setTimeout(function(){},250)};var Fb=function(){var a=this;this.promise=new Promise(function(b,c){a.h=b;a.g=c})};Fb.prototype.resolve=function(a){this.h(a)};Fb.prototype.reject=function(a){this.g(a)};var Gb=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,Gb);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))};w(Gb,Error);Gb.prototype.name="CustomError";var Hb;var Ib=function(a,b){a=a.split("%s");for(var c="",d=a.length-1,e=0;e<d;e++)c+=a[e]+(e<b.length?b[e]:"%s");Gb.call(this,c+a[d])};w(Ib,Gb);Ib.prototype.name="AssertionError";
var Jb=function(a,b,c,d){var e="Assertion failed";if(c){e+=": "+c;var f=d}else a&&(e+=": "+a,f=b);throw new Ib(""+e,f||[]);},Kb=function(a,b,c){a||Jb("",null,b,Array.prototype.slice.call(arguments,2))},Lb=function(a,b,c){null==a&&Jb("Expected to exist: %s.",[a],b,Array.prototype.slice.call(arguments,2));return a},Mb=function(a,b){throw new Ib("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));};var Nb=function(a){return a[a.length-1]},Ob=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if("string"===typeof a)return"string"!==typeof b||1!=b.length?-1:a.indexOf(b,0);for(var c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Pb=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e="string"===typeof a?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Qb=function(a,b){for(var c=
"string"===typeof a?a.split(""):a,d=a.length-1;0<=d;--d)d in c&&b.call(void 0,c[d],d,a)},Rb=Array.prototype.filter?function(a,b,c){return Array.prototype.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,g="string"===typeof a?a.split(""):a,h=0;h<d;h++)if(h in g){var m=g[h];b.call(c,m,h,a)&&(e[f++]=m)}return e},Sb=Array.prototype.map?function(a,b,c){return Array.prototype.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f="string"===typeof a?a.split(""):a,g=0;g<d;g++)g in
f&&(e[g]=b.call(c,f[g],g,a));return e},Tb=Array.prototype.reduce?function(a,b,c){return Array.prototype.reduce.call(a,b,c)}:function(a,b,c){var d=c;Pb(a,function(e,f){d=b.call(void 0,d,e,f,a)});return d},Ub=Array.prototype.some?function(a,b){return Array.prototype.some.call(a,b,void 0)}:function(a,b){for(var c=a.length,d="string"===typeof a?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a))return!0;return!1},Vb=Array.prototype.every?function(a,b,c){return Array.prototype.every.call(a,b,
c)}:function(a,b,c){for(var d=a.length,e="string"===typeof a?a.split(""):a,f=0;f<d;f++)if(f in e&&!b.call(c,e[f],f,a))return!1;return!0},Xb=function(a,b){b=Wb(a,b,void 0);return 0>b?null:"string"===typeof a?a.charAt(b):a[b]},Wb=function(a,b,c){for(var d=a.length,e="string"===typeof a?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return f;return-1},Yb=function(a,b){a:{for(var c="string"===typeof a?a.split(""):a,d=a.length-1;0<=d;d--)if(d in c&&b.call(void 0,c[d],d,a)){b=d;break a}b=-1}return 0>
b?null:"string"===typeof a?a.charAt(b):a[b]},Zb=function(a,b){return 0<=Ob(a,b)},$b=function(a){if(!Array.isArray(a))for(var b=a.length-1;0<=b;b--)delete a[b];a.length=0},ac=function(a,b){Zb(a,b)||a.push(b)},cc=function(a,b,c){var d;2==arguments.length||0>(d=Ob(a,c))?a.push(b):bc(a,d,0,b)},ec=function(a,b){b=Ob(a,b);var c;(c=0<=b)&&dc(a,b);return c},dc=function(a,b){return 1==Array.prototype.splice.call(a,b,1).length},fc=function(a,b){b=Wb(a,b,void 0);return 0<=b?(dc(a,b),!0):!1},gc=function(a,b){var c=
0;Qb(a,function(d,e){b.call(void 0,d,e,a)&&dc(a,e)&&c++})},hc=function(a){return Array.prototype.concat.apply([],arguments)},ic=function(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]},jc=function(a,b){for(var c=1;c<arguments.length;c++){var d=arguments[c];if(Pa(d)){var e=a.length||0,f=d.length||0;a.length=e+f;for(var g=0;g<f;g++)a[e+g]=d[g]}else a.push(d)}},bc=function(a,b,c,d){Array.prototype.splice.apply(a,kc(arguments,1))},kc=function(a,b,c){return 2>=arguments.length?
Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)},lc=function(a,b){b=b||a;for(var c={},d=0,e=0;e<a.length;){var f=a[e++];var g=f;g=Ra(g)?"o"+Ua(g):(typeof g).charAt(0)+g;Object.prototype.hasOwnProperty.call(c,g)||(c[g]=!0,b[d++]=f)}b.length=d},mc=function(a,b){for(var c=0,d=a.length,e;c<d;){var f=c+(d-c>>>1);var g=b.call(void 0,a[f],f,a);0<g?c=f+1:(d=f,e=!g)}return e?c:-c-1},oc=function(a,b){a.sort(b||nc)},pc=function(a,b){var c=nc;oc(a,function(d,e){return c(b(d),b(e))})},qc=function(a){pc(a,
function(b){return b.t})},sc=function(a,b,c){if(!Pa(a)||!Pa(b)||a.length!=b.length)return!1;var d=a.length;c=c||rc;for(var e=0;e<d;e++)if(!c(a[e],b[e]))return!1;return!0},nc=function(a,b){return a>b?1:a<b?-1:0},rc=function(a,b){return a===b},tc=function(a,b){var c={};Pb(a,function(d,e){c[b.call(void 0,d,e,a)]=d});return c},uc=function(a,b){return hc.apply([],Sb(a,b,void 0))};var vc=function(a){return function(){return a}},wc=function(){return!0},xc=function(){return null},yc=function(a){return a},zc=function(a){return function(){throw Error(a);}},Ac=function(a){var b=b||0;return function(){return a.apply(this,Array.prototype.slice.call(arguments,0,b))}},Bc=function(a){return function(){return!a.apply(this,arguments)}};var Cc=function(a,b,c){for(var d in a)b.call(c,a[d],d,a)},Dc=function(a,b){var c={},d;for(d in a)c[d]=b.call(void 0,a[d],d,a);return c},Ec=function(a,b){for(var c in a)if(b.call(void 0,a[c],c,a))return!0;return!1},Fc=function(a){var b=0,c;for(c in a)b++;return b},Gc=function(a){for(var b in a)return b},Hc=function(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b},Ic=function(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b},Jc=function(a,b){return null!==a&&b in a},Kc=function(a,b){for(var c in a)if(a[c]==
b)return!0;return!1},Lc=function(a){for(var b in a)return!1;return!0},Mc=function(a){for(var b in a)delete a[b]},Nc=function(a){var b={},c;for(c in a)b[c]=a[c];return b},Oc=function(a){var b=Oa(a);if("object"==b||"array"==b){if(Qa(a.clone))return a.clone();b="array"==b?[]:{};for(var c in a)b[c]=Oc(a[c]);return b}return a},Pc=function(a){var b={},c;for(c in a)b[a[c]]=c;return b},Qc="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),Rc=function(a,
b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<Qc.length;f++)c=Qc[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}},Sc=function(a){var b=arguments.length;if(1==b&&Array.isArray(arguments[0]))return Sc.apply(null,arguments[0]);for(var c={},d=0;d<b;d++)c[arguments[d]]=!0;return c};var Tc,Uc=function(){if(void 0===Tc){var a=null,b=Fa.trustedTypes;if(b&&b.createPolicy){try{a=b.createPolicy("goog#html",{createHTML:ab,createScript:ab,createScriptURL:ab})}catch(c){Fa.console&&Fa.console.error(c.message)}Tc=a}else Tc=a}return Tc};var Xc=function(a,b){this.g=a===Vc&&b||"";this.h=Wc};Xc.prototype.vd=!0;Xc.prototype.dd=function(){return this.g};Xc.prototype.toString=function(){return"Const{"+this.g+"}"};var Yc=function(a){if(a instanceof Xc&&a.constructor===Xc&&a.h===Wc)return a.g;Mb("expected object of type Const, got '"+a+"'");return"type_error:Const"},Wc={},Vc={};var Zc={},$c=function(a,b){this.g=b===Zc?a:"";this.vd=!0};$c.prototype.dd=function(){return this.g.toString()};var ad=function(a){if(a instanceof $c&&a.constructor===$c)return a.g;Mb("expected object of type SafeScript, got '"+a+"' of type "+Oa(a));return"type_error:SafeScript"};$c.prototype.toString=function(){return"SafeScript{"+this.g+"}"};var bd=/[A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02b8\u0300-\u0590\u0900-\u1fff\u200e\u2c00-\ud801\ud804-\ud839\ud83c-\udbff\uf900-\ufb1c\ufe00-\ufe6f\ufefd-\uffff]/,cd=/^[^A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02b8\u0300-\u0590\u0900-\u1fff\u200e\u2c00-\ud801\ud804-\ud839\ud83c-\udbff\uf900-\ufb1c\ufe00-\ufe6f\ufefd-\uffff]*[\u0591-\u06ef\u06fa-\u08ff\u200f\ud802-\ud803\ud83a-\ud83b\ufb1d-\ufdff\ufe70-\ufefc]/,dd=/^http:\/\/.*/,ed=/\s+/,fd=/[\d\u06f0-\u06f9]/;var hd=function(a,b){this.g=b===gd?a:""};k=hd.prototype;k.vd=!0;k.dd=function(){return this.g.toString()};k.Kj=!0;k.Cj=function(){return 1};k.toString=function(){return"TrustedResourceUrl{"+this.g+"}"};
var id=function(a){if(a instanceof hd&&a.constructor===hd)return a.g;Mb("expected object of type TrustedResourceUrl, got '"+a+"' of type "+Oa(a));return"type_error:TrustedResourceUrl"},nd=function(){var a={build:324163804},b=Yc(new Xc(Vc,"https://www.gstatic.com/hangouts_echo_detector/release/%{build}/echo_detector_v2_wasm.js"));if(!jd.test(b))throw Error("Invalid TrustedResourceUrl format: "+b);var c=b.replace(kd,function(d,e){if(!Object.prototype.hasOwnProperty.call(a,e))throw Error('Found marker, "'+
e+'", in format string, "'+b+'", but no valid label mapping found in args: '+JSON.stringify(a));d=a[e];return d instanceof Xc?Yc(d):encodeURIComponent(String(d))});return ld(c)},kd=/%{(\w+)}/g,jd=/^((https:)?\/\/[0-9a-z.:[\]-]+\/|\/[^/\\]|[^:/\\%]+\/|[^:/\\%]*[?#]|about:blank#)/i,gd={},ld=function(a){var b=Uc();a=b?b.createScriptURL(a):a;return new hd(a,gd)};var od=function(a,b){return 0==a.lastIndexOf(b,0)},pd=function(a,b){return a.toLowerCase()==b.toLowerCase()},qd=function(a){return/^[\s\xa0]*$/.test(a)},rd=String.prototype.trim?function(a){return a.trim()}:function(a){return/^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]},sd=function(a,b){a=String(a).toLowerCase();b=String(b).toLowerCase();return a<b?-1:a==b?0:1},Ad=function(a,b){if(b)a=a.replace(td,"&amp;").replace(ud,"&lt;").replace(vd,"&gt;").replace(wd,"&quot;").replace(xd,"&#39;").replace(yd,"&#0;");
else{if(!zd.test(a))return a;-1!=a.indexOf("&")&&(a=a.replace(td,"&amp;"));-1!=a.indexOf("<")&&(a=a.replace(ud,"&lt;"));-1!=a.indexOf(">")&&(a=a.replace(vd,"&gt;"));-1!=a.indexOf('"')&&(a=a.replace(wd,"&quot;"));-1!=a.indexOf("'")&&(a=a.replace(xd,"&#39;"));-1!=a.indexOf("\x00")&&(a=a.replace(yd,"&#0;"))}return a},td=/&/g,ud=/</g,vd=/>/g,wd=/"/g,xd=/'/g,yd=/\x00/g,zd=/[\x00&<>"']/,Cd=function(a,b){var c=0;a=rd(String(a)).split(".");b=rd(String(b)).split(".");for(var d=Math.max(a.length,b.length),
e=0;0==c&&e<d;e++){var f=a[e]||"",g=b[e]||"";do{f=/(\d*)(\D*)(.*)/.exec(f)||["","","",""];g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];if(0==f[0].length&&0==g[0].length)break;c=Bd(0==f[1].length?0:parseInt(f[1],10),0==g[1].length?0:parseInt(g[1],10))||Bd(0==f[2].length,0==g[2].length)||Bd(f[2],g[2]);f=f[3];g=g[3]}while(0==c)}return c},Bd=function(a,b){return a<b?-1:a>b?1:0};var Ed=function(a,b){this.g=b===Dd?a:""};k=Ed.prototype;k.vd=!0;k.dd=function(){return this.g.toString()};k.Kj=!0;k.Cj=function(){return 1};k.toString=function(){return"SafeUrl{"+this.g+"}"};
var Fd=function(a){if(a instanceof Ed&&a.constructor===Ed)return a.g;Mb("expected object of type SafeUrl, got '"+a+"' of type "+Oa(a));return"type_error:SafeUrl"},Gd=/^(?:audio\/(?:3gpp2|3gpp|aac|L16|midi|mp3|mp4|mpeg|oga|ogg|opus|x-m4a|x-matroska|x-wav|wav|webm)|font\/\w+|image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp|x-icon)|text\/csv|video\/(?:mpeg|mp4|ogg|webm|quicktime|x-matroska))(?:;\w+=(?:\w+|"[\w;,= ]+"))*$/i,Hd=/^data:(.*);base64,[a-z0-9+\/]+=*$/i,Id=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i,
Kd=function(a){if(!(a instanceof Ed))if(a="object"==typeof a&&a.vd?a.dd():String(a),Id.test(a))a=new Ed(a,Dd);else{a=String(a);a=a.replace(/(%0A|%0D)/g,"");var b=a.match(Hd);a=b&&Gd.test(b[1])?new Ed(a,Dd):null}return a||Jd},Dd={},Jd=new Ed("about:invalid#zClosurez",Dd);var Md=function(a,b){this.g=b===Ld?a:""};Md.prototype.vd=!0;Md.prototype.dd=function(){return this.g};Md.prototype.toString=function(){return"SafeStyle{"+this.g+"}"};
var Nd=function(a){if(a instanceof Md&&a.constructor===Md)return a.g;Mb("expected object of type SafeStyle, got '"+a+"' of type "+Oa(a));return"type_error:SafeStyle"},Ld={},Od=new Md("",Ld),Qd=function(a){if(a instanceof Ed)return'url("'+Fd(a).replace(/</g,"%3c").replace(/[\\"]/g,"\\$&")+'")';a=a instanceof Xc?Yc(a):Pd(String(a));if(/[{;}]/.test(a))throw new Ib("Value does not allow [{;}], got: %s.",[a]);return a},Pd=function(a){var b=a.replace(Rd,"$1").replace(Rd,"$1").replace(Sd,"url");if(Td.test(b)){if(Ud.test(a))return Mb("String value disallows comments, got: "+
a),"zClosurez";for(var c=b=!0,d=0;d<a.length;d++){var e=a.charAt(d);"'"==e&&c?b=!b:'"'==e&&b&&(c=!c)}if(!b||!c)return Mb("String value requires balanced quotes, got: "+a),"zClosurez";if(!Vd(a))return Mb("String value requires balanced square brackets and one identifier per pair of brackets, got: "+a),"zClosurez"}else return Mb("String value allows only [-,.\"'%_!# a-zA-Z0-9\\[\\]] and simple functions, got: "+a),"zClosurez";return Wd(a)},Vd=function(a){for(var b=!0,c=/^[-_a-zA-Z0-9]$/,d=0;d<a.length;d++){var e=
a.charAt(d);if("]"==e){if(b)return!1;b=!0}else if("["==e){if(!b)return!1;b=!1}else if(!b&&!c.test(e))return!1}return b},Td=/^[-,."'%_!# a-zA-Z0-9\[\]]+$/,Sd=/\b(url\([ \t\n]*)('[ -&(-\[\]-~]*'|"[ !#-\[\]-~]*"|[!#-&*-\[\]-~]*)([ \t\n]*\))/g,Rd=/\b(calc|cubic-bezier|fit-content|hsl|hsla|linear-gradient|matrix|minmax|repeat|rgb|rgba|(rotate|scale|translate)(X|Y|Z|3d)?)\([-+*/0-9a-z.%\[\], ]+\)/g,Ud=/\/\*/,Wd=function(a){return a.replace(Sd,function(b,c,d,e){var f="";d=d.replace(/^(['"])(.*)\1$/,function(g,
h,m){f=h;return m});b=Kd(d).dd();return c+f+b+f+e})};var Xd={},Yd=function(a,b){this.g=b===Xd?a:"";this.vd=!0},Zd=function(a,b){if(-1!=a.indexOf("<"))throw Error("Selector does not allow '<', got: "+a);var c=a.replace(/('|")((?!\1)[^\r\n\f\\]|\\[\s\S])*\1/g,"");if(!/^[-_a-zA-Z0-9#.:* ,>+~[\]()=^$|]+$/.test(c))throw Error("Selector allows only [-_a-zA-Z0-9#.:* ,>+~[\\]()=^$|] and strings, got: "+a);a:{for(var d={"(":")","[":"]"},e=[],f=0;f<c.length;f++){var g=c[f];if(d[g])e.push(d[g]);else if(Kc(d,g)&&e.pop()!=g){c=!1;break a}}c=0==e.length}if(!c)throw Error("() and [] in selector must be balanced, got: "+
a);if(!(b instanceof Md)){c="";for(var h in b)if(Object.prototype.hasOwnProperty.call(b,h)){if(!/^[-_a-zA-Z0-9]+$/.test(h))throw Error("Name allows only [-_a-zA-Z0-9], got: "+h);d=b[h];null!=d&&(d=Array.isArray(d)?Sb(d,Qd).join(" "):Qd(d),c+=h+":"+d+";")}b=c?new Md(c,Ld):Od}a=a+"{"+Nd(b).replace(/</g,"\\3C ")+"}";return new Yd(a,Xd)},ae=function(a){var b="",c=function(d){Array.isArray(d)?Pb(d,c):b+=$d(d)};Pb(arguments,c);return new Yd(b,Xd)};Yd.prototype.dd=function(){return this.g};
var $d=function(a){if(a instanceof Yd&&a.constructor===Yd)return a.g;Mb("expected object of type SafeStyleSheet, got '"+a+"' of type "+Oa(a));return"type_error:SafeStyleSheet"};Yd.prototype.toString=function(){return"SafeStyleSheet{"+this.g+"}"};var be=new Yd("",Xd);var ce;a:{var de=Fa.navigator;if(de){var ee=de.userAgent;if(ee){ce=ee;break a}}ce=""}var fe=function(a){return-1!=ce.indexOf(a)},ge=function(a){for(var b=/(\w[\w ]+)\/([^\s]+)\s*(?:\((.*?)\))?/g,c=[],d;d=b.exec(a);)c.push([d[1],d[2],d[3]||void 0]);return c};var he=function(){return fe("Trident")||fe("MSIE")},ie=function(){return fe("Firefox")||fe("FxiOS")},je=function(){return(fe("Chrome")||fe("CriOS"))&&!fe("Edge")},le=function(){function a(e){e=Xb(e,d);return c[e]||""}var b=ce;if(he())return ke(b);b=ge(b);var c={};Pb(b,function(e){c[e[0]]=e[1]});var d=Za(Jc,c);return fe("Opera")?a(["Version","Opera"]):fe("Edge")?a(["Edge"]):fe("Edg/")?a(["Edg"]):je()?a(["Chrome","CriOS","HeadlessChrome"]):(b=b[2])&&b[1]||""},ke=function(a){var b=/rv: *([\d\.]*)/.exec(a);
if(b&&b[1])return b[1];b="";var c=/MSIE +([\d\.]+)/.exec(a);if(c&&c[1])if(a=/Trident\/(\d.\d)/.exec(a),"7.0"==c[1])if(a&&a[1])switch(a[1]){case "4.0":b="8.0";break;case "5.0":b="9.0";break;case "6.0":b="10.0";break;case "7.0":b="11.0"}else b="7.0";else b=c[1];return b};var ne=function(a,b,c){this.g=c===me?a:"";this.Cg=b};k=ne.prototype;k.Kj=!0;k.Cj=function(){return this.Cg};k.vd=!0;k.dd=function(){return this.g.toString()};k.toString=function(){return"SafeHtml{"+this.g+"}"};
var oe=function(a){if(a instanceof ne&&a.constructor===ne)return a.g;Mb("expected object of type SafeHtml, got '"+a+"' of type "+Oa(a));return"type_error:SafeHtml"},qe=function(a){if(a instanceof ne)return a;var b="object"==typeof a,c=null;b&&a.Kj&&(c=a.Cj());return pe(Ad(b&&a.vd?a.dd():String(a)),c)},me={},pe=function(a,b){var c=Uc();a=c?c.createHTML(a):a;return new ne(a,b,me)},re=new ne(Fa.trustedTypes&&Fa.trustedTypes.emptyHTML||"",0,me);var se={MATH:!0,SCRIPT:!0,STYLE:!0,SVG:!0,TEMPLATE:!0},te=function(a){var b=!1,c;return function(){b||(c=a(),b=!0);return c}}(function(){if("undefined"===typeof document)return!1;var a=document.createElement("div"),b=document.createElement("div");b.appendChild(document.createElement("div"));a.appendChild(b);if(!a.firstChild)return!1;b=a.firstChild.firstChild;a.innerHTML=oe(re);return!b.parentElement}),ue=function(a,b){if(te())for(;a.lastChild;)a.removeChild(a.lastChild);a.innerHTML=oe(b)},ve=function(a,
b){if(se[a.tagName.toUpperCase()])throw Error("goog.dom.safe.setInnerHtml cannot be used to set content of "+a.tagName+".");ue(a,b)},we=function(a,b){a:{try{var c=a&&a.ownerDocument,d=c&&(c.defaultView||c.parentWindow);d=d||Fa;if(d.Element&&d.Location){var e=d;break a}}catch(g){}e=null}if(e&&"undefined"!=typeof e.HTMLScriptElement&&(!a||!(a instanceof e.HTMLScriptElement)&&(a instanceof e.Location||a instanceof e.Element))){if(Ra(a))try{var f=a.constructor.displayName||a.constructor.name||Object.prototype.toString.call(a)}catch(g){f=
"<object could not be stringified>"}else f=void 0===a?"undefined":null===a?"null":typeof a;Mb("Argument is not a %s (or a non-Element, non-Location mock); got: %s","HTMLScriptElement",f)}a.src=id(b);(b=Ia(a.ownerDocument&&a.ownerDocument.defaultView))&&a.setAttribute("nonce",b)};var xe=function(a){return a=Ad(a,void 0)},ye=String.prototype.repeat?function(a,b){return a.repeat(b)}:function(a,b){return Array(b+1).join(a)},ze=function(a,b){a=String(a);var c=a.indexOf(".");-1==c&&(c=a.length);return ye("0",Math.max(0,b-c))+a},Ae=function(a){return null==a?"":String(a)},Be=function(a){return Array.prototype.join.call(arguments,"")},Ce=function(){return Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^$a()).toString(36)},De=function(a,
b,c){a=a.split(b);for(var d=[];0<c&&a.length;)d.push(a.shift()),c--;a.length&&d.push(a.join(b));return d};var Ee=function(){return fe("iPhone")&&!fe("iPod")&&!fe("iPad")},Fe=function(){return Ee()||fe("iPad")||fe("iPod")},Ge=function(){return fe("Macintosh")};var He=function(a){He[" "](a);return a};He[" "]=La;var Ie=function(a,b){try{return He(a[b]),!0}catch(c){}return!1},Je=function(a,b,c,d){d=d?d(b):b;return Object.prototype.hasOwnProperty.call(a,d)?a[d]:a[d]=c(b)};var Ke=function(){return Fa.navigator||null},Le=fe("Opera"),Me=he(),Ne=fe("Edge"),Oe=fe("Gecko")&&!(-1!=ce.toLowerCase().indexOf("webkit")&&!fe("Edge"))&&!(fe("Trident")||fe("MSIE"))&&!fe("Edge"),Pe=-1!=ce.toLowerCase().indexOf("webkit")&&!fe("Edge"),Qe=Pe&&fe("Mobile"),Re,Se=Ke();Re=Se&&Se.platform||"";var Te=Ge(),Ue=fe("Windows"),Ve=fe("Linux")||fe("CrOS"),We=fe("Android"),Xe=Ee(),Ye=fe("iPad"),Ze=fe("iPod"),$e=function(){var a=Fa.document;return a?a.documentMode:void 0},af;
a:{var bf="",cf=function(){var a=ce;if(Oe)return/rv:([^\);]+)(\)|;)/.exec(a);if(Ne)return/Edge\/([\d\.]+)/.exec(a);if(Me)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(Pe)return/WebKit\/(\S+)/.exec(a);if(Le)return/(?:Version)[ \/]?(\S+)/.exec(a)}();cf&&(bf=cf?cf[1]:"");if(Me){var df=$e();if(null!=df&&df>parseFloat(bf)){af=String(df);break a}}af=bf}var ef=af,ff={},gf=function(a){return Je(ff,a,function(){return 0<=Cd(ef,a)})},hf;
if(Fa.document&&Me){var jf=$e();hf=jf?jf:parseInt(ef,10)||void 0}else hf=void 0;var kf=hf;var lf=ie(),mf=Ee()||fe("iPod"),nf=fe("iPad"),of=fe("Android")&&!(je()||ie()||fe("Opera")||fe("Silk")),pf=je(),qf=fe("Safari")&&!(je()||fe("Coast")||fe("Opera")||fe("Edge")||fe("Edg/")||fe("OPR")||ie()||fe("Silk")||fe("Android"))&&!Fe();var rf=function(a,b){return a+Math.random()*(b-a)};var sf=function(a,b,c){this.u=a;this.j=b;this.o=c;this.m=0;this.l=!1;this.g=this.h=null};sf.prototype.start=function(){if(null!=this.g)throw Error("Cannot call Retry.start more than once.");this.g=new Fb;this.D();return this.g.promise};sf.prototype.D=function(){var a=this;this.h=null;this.l||(this.m++,this.u().then(function(b){tf(a);a.g.resolve(b)},function(b){a.m>=a.o?(tf(a),a.g.reject(b)):(a.h=setTimeout(a.D.bind(a),a.j),a.j*=2)}))};
sf.prototype.abort=function(a){tf(this);this.g.reject(void 0===a?Error("abort"):a)};var tf=function(a){null!=a.h&&(clearTimeout(a.h),a.h=null);a.l=!0};var uf=function(a){this.j=a;this.g=0;this.h=[]};uf.prototype.send=function(a,b,c,d){var e=void 0===d?{}:d;d=void 0===e.timeoutMillis?this.j:e.timeoutMillis;var f=void 0===e.Mv?1:e.Mv,g=void 0===e.headers?null:e.headers;e=void 0===e.responseType?"":e.responseType;a={Ab:new Fb,url:a,method:b,headers:g,responseType:e,body:c,timeoutMillis:d,ho:f};1>this.g?vf(this,a):this.h.push(a);return a.Ab.promise};
var wf=function(a){if(0<a.h.length&&1>a.g){var b=a.h.shift();vf(a,b)}},vf=function(a,b){a.g++;b.ho--;xf(b).then(function(c){b.Ab.resolve(c);a.g--;wf(a)},function(c){0==b.ho?b.Ab.reject(c):a.h.push(b);a.g--;wf(a)})},xf=function(a){return new Promise(function(b,c){var d=new XMLHttpRequest;d.onreadystatechange=function(){d.readyState==XMLHttpRequest.DONE&&b(d)};d.timeout=a.timeoutMillis;d.ontimeout=function(){c(Error("Timed out"))};d.open(a.method,a.url,!0);null==a.headers?d.setRequestHeader("Content-Type",
"application/x-www-form-urlencoded;charset=utf-8"):a.headers.forEach(function(e){return d.setRequestHeader(e[0],e[1])});d.responseType=a.responseType;d.send(a.body)})};var zf=function(a,b,c){null==yf&&(yf=new uf(3E5));var d="https://crash.corp.google.com/samples?reportid=&q="+encodeURIComponent("UserComments='"+b+"'"),e="http://"+a+":8008/setup/send_log_report";yf.send(e,"POST",JSON.stringify({uuid:b}),{headers:[["Content-Type","application/json"]]}).then(function(f){200==f.status?c("ok",d):c("error","Unable to POST to "+e+", error = "+f.status)},function(f){c("error",String(f))});return d},Cf=function(a){var b=new Af;if("string"!==typeof a)return Promise.resolve(b);
null==Bf&&(Bf=new uf(3E3));return Bf.send("http://"+a+":8008/setup/eureka_info","GET",void 0,{responseType:"text"}).then(function(c){c=JSON.parse(c.responseText);"cast_build_revision"in c?b.g=String(c.cast_build_revision):"build_version"in c&&(b.g=String(c.build_version));"connected"in c&&(b.l="true"==String(c.connected));"ethernet_connected"in c&&(b.h="true"==String(c.ethernet_connected));"has_update"in c&&(b.j="true"==String(c.has_update));"uptime"in c&&(c=Number(c.uptime),Number.isFinite(c)&&(b.m=
c))}).catch(function(c){eb("mr.DongleUtils").K("Unable to fetch/parse setup info.",c)}).then(function(){return b})},Af=function(){this.m=this.j=this.h=this.l=this.g=null},yf=null,Bf=null;var Df=function(a,b,c){this.source=a;this.type=b;this.message=c};var Ef=function(a){var b=[],c=[],d={},e=function(f,g){var h=g+"  ";try{if(void 0===f)b.push("undefined");else if(null===f)b.push("NULL");else if("string"===typeof f)b.push('"'+f.replace(/\n/g,"\n"+g)+'"');else if(Qa(f))b.push(String(f).replace(/\n/g,"\n"+g));else if(Ra(f)){f[Sa]||c.push(f);var m=Ua(f);if(d[m])b.push("*** reference loop detected (id="+m+") ***");else{d[m]=!0;b.push("{");for(var q in f)Qa(f[q])||(b.push("\n"),b.push(h),b.push(q+" = "),e(f[q],h));b.push("\n"+g+"}");delete d[m]}}else b.push(f)}catch(r){b.push("*** "+
r+" ***")}};e(a,"");for(a=0;a<c.length;a++)Va(c[a]);return b.join("")},Ff=function(a,b){a instanceof Error||(a=Error(a),Error.captureStackTrace&&Error.captureStackTrace(a,Ff));a.stack||(a.stack=Gf(Ff));if(b){for(var c=0;a["message"+c];)++c;a["message"+c]=String(b)}return a},If=function(a){var b=Hf(If);if(b)return b;b=[];for(var c=arguments.callee.caller,d=0;c&&(!a||d<a);){b.push(Jf(c));b.push("()\n");try{c=c.caller}catch(e){b.push("[exception trying to get caller]\n");break}d++;if(50<=d){b.push("[...long stack...]");
break}}a&&d>=a?b.push("[...reached max depth limit...]"):b.push("[end]");return b.join("")},Hf=function(a){var b=Error();if(Error.captureStackTrace)return Error.captureStackTrace(b,a),String(b.stack);try{throw b;}catch(c){b=c}return(a=b.stack)?String(a):null},Gf=function(a){var b;(b=Hf(a||Gf))||(b=Kf(a||arguments.callee.caller,[]));return b},Kf=function(a,b){var c=[];if(Zb(b,a))c.push("[...circular reference...]");else if(a&&50>b.length){c.push(Jf(a)+"(");for(var d=a.arguments,e=0;d&&e<d.length;e++){0<
e&&c.push(", ");var f=d[e];switch(typeof f){case "object":f=f?"object":"null";break;case "string":break;case "number":f=String(f);break;case "boolean":f=f?"true":"false";break;case "function":f=(f=Jf(f))?f:"[fn]";break;default:f=typeof f}40<f.length&&(f=f.substr(0,40)+"...");c.push(f)}b.push(a);c.push(")\n");try{c.push(Kf(a.caller,b))}catch(g){c.push("[exception trying to get caller]\n")}}else a?c.push("[...long stack...]"):c.push("[end]");return c.join("")},Jf=function(a){if(Lf[a])return Lf[a];a=
String(a);if(!Lf[a]){var b=/function\s+([^\(]+)/m.exec(a);Lf[a]=b?b[1]:"[Anonymous]"}return Lf[a]},Lf={},Mf=Object.freeze||function(a){return a};var Nf=function(a,b,c){this.reset(a,b,c,void 0,void 0)};Nf.prototype.g=null;var Of=0;Nf.prototype.reset=function(a,b,c,d,e){"number"==typeof e||Of++;this.m=d||$a();this.h=a;this.l=b;this.j=c;delete this.g};Nf.prototype.getMessage=function(){return this.l};var Pf=function(a){this.m=a;this.g=this.l=this.h=this.j=null},Qf=function(a,b){this.name=a;this.value=b};Qf.prototype.toString=function(){return this.name};var Rf=new Qf("SEVERE",1E3),Sf=new Qf("WARNING",900),Tf=new Qf("INFO",800),Uf=new Qf("CONFIG",700),Vf=new Qf("FINE",500),Wf=new Qf("FINER",400),Xf=new Qf("ALL",0);Pf.prototype.getName=function(){return this.m};Pf.prototype.getChildren=function(){this.l||(this.l={});return this.l};
var Yf=function(a){if(a.h)return a.h;if(a.j)return Yf(a.j);Mb("Root logger has no level set.");return null};k=Pf.prototype;k.log=function(a,b,c){a.value>=Yf(this).value&&(Qa(b)&&(b=b()),a=new Nf(a,String(b),this.m),c&&(a.g=c),Zf(this,a))};k.sa=function(a,b){this.log(Rf,a,b)};k.K=function(a,b){this.log(Sf,a,b)};k.info=function(a,b){this.log(Tf,a,b)};k.config=function(a,b){this.log(Uf,a,b)};k.logRecord=function(a){a.h.value>=Yf(this).value&&Zf(this,a)};
var Zf=function(a,b){for(;a;){var c,d=a,e=b;if(d.g)for(var f=0;c=d.g[f];f++)c(e);a=a.j}},$f={},ag=null,bg=function(){ag||(ag=new Pf(""),$f[""]=ag,ag.h=Uf)},cg=function(a){bg();var b;if(!(b=$f[a])){b=new Pf(a);var c=a.lastIndexOf("."),d=a.substr(c+1);c=cg(a.substr(0,c));c.getChildren()[d]=b;b.j=c;$f[a]=b}return b};var dg=function(a,b,c,d){a&&a.log(b,c,d)},eg=function(a,b,c){a&&a.sa(b,c)},fg=function(a,b,c){a&&a.K(b,c)},gg=function(a,b){a&&a.info(b,void 0)},hg=function(a,b){a&&a.log(Vf,b,void 0)};try{(new self.OffscreenCanvas(0,0)).getContext("2d")}catch(a){}var ig=!Oe&&!Me||Me&&9<=Number(kf)||Oe&&gf("1.9.1");var jg=function(a,b){this.width=a;this.height=b};k=jg.prototype;k.clone=function(){return new jg(this.width,this.height)};k.toString=function(){return"("+this.width+" x "+this.height+")"};k.aspectRatio=function(){return this.width/this.height};k.Jc=function(){return!(this.width*this.height)};k.ceil=function(){this.width=Math.ceil(this.width);this.height=Math.ceil(this.height);return this};k.floor=function(){this.width=Math.floor(this.width);this.height=Math.floor(this.height);return this};
k.round=function(){this.width=Math.round(this.width);this.height=Math.round(this.height);return this};var lg=function(a){return a?new kg(9==a.nodeType?a:a.ownerDocument||a.document):Hb||(Hb=new kg)},og=function(a,b){Cc(b,function(c,d){c&&"object"==typeof c&&c.vd&&(c=c.dd());"style"==d?a.style.cssText=c:"class"==d?a.className=c:"for"==d?a.htmlFor=c:mg.hasOwnProperty(d)?a.setAttribute(mg[d],c):od(d,"aria-")||od(d,"data-")?a.setAttribute(d,c):a[d]=c})},mg={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",
role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"},pg=function(a){a=a.document;a="CSS1Compat"==a.compatMode?a.documentElement:a.body;return new jg(a.clientWidth,a.clientHeight)},rg=function(a){return a?qg(a):window},qg=function(a){return a.parentWindow||a.defaultView},sg=function(a,b){b=String(b);"application/xhtml+xml"===a.contentType&&(b=b.toLowerCase());return a.createElement(b)},tg=function(a){for(var b;b=a.firstChild;)a.removeChild(b)},ug=function(a){return a&&
a.parentNode?a.parentNode.removeChild(a):null},vg=function(a,b){if("textContent"in a)a.textContent=b;else if(3==a.nodeType)a.data=String(b);else if(a.firstChild&&3==a.firstChild.nodeType){for(;a.lastChild!=a.firstChild;)a.removeChild(a.lastChild);a.firstChild.data=String(b)}else tg(a),a.appendChild((9==a.nodeType?a:a.ownerDocument||a.document).createTextNode(String(b)))},kg=function(a){this.g=a||Fa.document||document};kg.prototype.setProperties=og;var wg=function(a,b){return sg(a.g,b)};k=kg.prototype;
k.appendChild=function(a,b){a.appendChild(b)};k.du=ug;k.getChildren=function(a){return ig&&void 0!=a.children?a.children:Rb(a.childNodes,function(b){return 1==b.nodeType})};k.isElement=function(a){return Ra(a)&&1==a.nodeType};k.contains=function(a,b){if(!a||!b)return!1;if(a.contains&&1==b.nodeType)return a==b||a.contains(b);if("undefined"!=typeof a.compareDocumentPosition)return a==b||!!(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b.parentNode;return b==a};var xg=function(a){this.g="number"==typeof a?0<a?1:0>a?-1:null:null==a?null:a?-1:1};