'use strict';var Xx={TAB:0,tl:1,cq:2},Yx=function(){return new lb("MediaRouter.CastStreaming.Session.Launch")},Zx=function(){return new rb("MediaRouter.CastStreaming.Session.Length")},$x=function(a){vb("MediaRouter.CastStreaming.Start.Success",a,Xx)};var ay=ab("mr.mirror.cast.LogUploader"),cy=function(a,b,c){by("raw_events.log.gz",a,b,c);return b?"https://crash.corp.google.com/samples?reportid=&q="+encodeURIComponent("UserComments='"+b+"'"):""},by=function(a,b,c,d){if(0==b.size)B(ay,"Trying to upload an empty file to Crash"),d&&d(null);else{var e=new FormData;e.append("prod","Cast");e.append("ver",chrome.runtime.getManifest().version);e.append(a,b);c&&e.append("comments",c);Lv("https://clients2.google.com/cr/report",function(f){f=f.target;var g=
null;Vv(f)?(g=Xv(f),B(ay,"Upload to Crash succeeded: "+g)):B(ay,"Upload to Crash failed. HTTP status: "+f.Ia());d&&d(g)},"POST",e,void 0,3E4)}};var dy=function(){this.g=0;dm(this)},fy=function(){ey||(ey=new dy);return ey},gy=function(){var a=fy(),b={fraction:.01,autoSubmitTimeLimitMillis:6048E5},c=b.autoSubmitTimeLimitMillis,d=Date.now();return a.g&&c&&d-a.g<c?!1:Math.random()<b.fraction};dy.prototype.Ta=function(){return"mirror.cast.LogUtils"};dy.prototype.Fb=function(){return[void 0,{lastAutoSubmitMillis:this.g}]};dy.prototype.Db=function(){var a=bm(this);this.g=a&&a.lastAutoSubmitMillis||0};var ey=null;ab("mr.mirror.cast.LogUtils");var hy={AE:"OFFER",bx:"ANSWER",mF:"PRESENTATION",XA:"GET_STATUS",aI:"STATUS_RESPONSE",SA:"GET_CAPABILITIES",By:"CAPABILITIES_RESPONSE",cH:"RPC"};var iy=function(){this.capabilities=this.status=this.g=this.error=this.rpc=this.result=this.type=this.h=this.sessionId=null},ly=function(a){try{if("string"!==typeof a)throw SyntaxError("Cannot parse non-string as JSON");var b;jy(JSON.parse(a),function(d){b=ky(d)},function(){throw Error("non-Object result from JSON parse");});return b}catch(d){var c=d instanceof SyntaxError?"JSON parse error: "+d.message:"Type coercion error: "+d.message}"string"==typeof a?a="a string: "+a:a instanceof ArrayBuffer?
(a=new Uint8Array(a),a="an ArrayBuffer whose base64 is "+btoa(String.fromCharCode.apply(null,a))):a="of invalid data type "+typeof a;throw Error(c+". Input was "+a);},ky=function(a){var b=new iy;null!=a.sessionId&&(b.sessionId=String(a.sessionId));my(a.seqNum,function(f){b.h=f},function(){throw Error('"seqNum" must be a number');});if("type"in a){for(var c=String(a.type).toUpperCase(),d=n(Object.keys(hy)),e=d.next();!e.done;e=d.next())if(hy[e.value]==c){b.type=c;break}if(!b.type)throw Error('not a known message "type"');
}"result"in a&&(b.result=String(a.result));if("rpc"in a){if("string"!==typeof a.rpc)throw Error('"rpc" must be a String containing a base64 payload');b.rpc=new Uint8Array([].concat(q(atob(a.rpc))).map(function(f){return f.charCodeAt(0)}))}jy(a.error,function(f){b.error=ny(f)},function(){throw Error('"error" must be an Object');});jy(a.answer,function(f){b.g=oy(f)},function(){throw Error('"answer" must be an Object');});jy(a.status,function(f){b.status=py(f)},function(){throw Error('"status" must be an Object');
});jy(a.capabilities,function(f){b.capabilities=qy(f)},function(){throw Error('"capabilities" must be an Object');});return b},jy=function(a,b,c){void 0!==a&&(a instanceof Object?b(a):c())},my=function(a,b,c){void 0!==a&&("number"!==typeof a?c():b(a))},ry=function(a,b,c){void 0!==a&&(a instanceof Array&&a.every(function(d){return"number"===typeof d})?b(a):c())},sy=function(a,b,c){void 0!==a&&(a instanceof Array?b(a.map(function(d){return String(d)})):c())},ty=function(){this.m=null;this.g=[];this.h=
[];this.j=this.l=this.w=null},oy=function(a){var b=new ty;my(a.udpPort,function(c){b.m=c},function(){throw Error('"answer.udpPort" must be a number');});ry(a.sendIndexes,function(c){b.g=c},function(){throw Error('"answer.sendIndexes" must be an array of numbers');});ry(a.ssrcs,function(c){b.h=c},function(){throw Error('"answer.ssrcs" must be an array of numbers');});"IV"in a&&(b.w=String(a.IV));"receiverGetStatus"in a&&(b.l="true"==String(a.receiverGetStatus).toLowerCase());"castMode"in a&&(b.j=String(a.castMode));
return b},uy=function(){this.details=this.description=this.code=null},ny=function(a){var b=new uy;my(a.code,function(c){b.code=c},function(){throw Error('"error.code" must be a number');});"description"in a&&(b.description=String(a.description));jy(a.details,function(c){b.details=c},function(){throw Error('"error.details" must be an Object');});return b},vy=function(){this.h=this.g=null},py=function(a){var b=new vy;my(a.wifiSnr,function(c){b.g=c},function(){throw Error('"status.wifiSnr" must be a number');
});ry(a.wifiSpeed,function(c){b.h=c},function(){throw Error('"status.wifiSpeed" must be an array of numbers');});return b},wy=function(){this.h=this.g=null},qy=function(a){var b=new wy;sy(a.mediaCaps,function(c){b.g=c},function(){throw Error('"capabilities.mediaCaps" must be an array');});if("keySystems"in a){a=a.keySystems;if(!(a instanceof Array))throw Error('"capabilities.keySystems" must be an array');b.h=a.map(function(c){var d;jy(c,function(e){d=xy(e)},function(){throw Error('"capabilities.keySystems" entries must be *Objects');
});return d})}return b},yy=function(){this.h=this.w=this.m=this.l=this.s=this.g=this.o=this.codecs=this.initDataTypes=this.j=null},xy=function(a){var b=new yy;"keySystemName"in a&&(b.j=String(a.keySystemName));sy(a.initDataTypes,function(c){b.initDataTypes=c},function(){throw Error('"capabilities.initDataTypes" must be an array');});sy(a.codecs,function(c){b.codecs=c},function(){throw Error('"capabilities.codecs" must be an array');});sy(a.secureCodecs,function(c){b.o=c},function(){throw Error('"capabilities.secureCodecs" must be an array');
});sy(a.audioRobustness,function(c){b.g=c},function(){throw Error('"capabilities.audioRobustness" must be an array');});sy(a.videoRobustness,function(c){b.s=c},function(){throw Error('"capabilities.videoRobustness" must be an array');});"persistentLicenseSessionSupport"in a&&(b.l=String(a.persistentLicenseSessionSupport));"persistentReleaseMessageSessionSupport"in a&&(b.m=String(a.persistentReleaseMessageSessionSupport));"persistentStateSupport"in a&&(b.w=String(a.persistentStateSupport));"distinctiveIdentifierSupport"in
a&&(b.h=String(a.distinctiveIdentifierSupport));return b};var zy=function(a){this.u=ab("mr.mirror.cast.MessageDispatcher");this.l=a;this.g=null;this.h=new Map;this.j=0},Ay=function(a,b,c){if(a.h.has(b))throw Error("Attempt to multiple-subscribe to the same response type: "+b);a.h.set(b,c);a.j=0;hb(a.u,"Added subscriber for "+b+"-type messages.");a.g||(a.g=Sw(a.l),a.g.onMessage=a.m.bind(a))},By=function(a,b){a.h.delete(b)&&hb(a.u,function(){return"Removed subscriber of "+b+"-type messages."});0==a.h.size&&a.g&&(a.g.dispose(),a.g=null)};
zy.prototype.sendMessage=function(a){return this.g?"RPC"==a.type?this.g.sendMessage(a,{namespace:"urn:x-cast:com.google.cast.remoting"}):this.g.sendMessage(a,{namespace:"urn:x-cast:com.google.cast.webrtc"}):Promise.reject(Error("Require at least one subscriber before sending messages."))};
var Cy=function(a,b,c,d,e){var f=null,g=function(){By(a,c);null!=f&&(clearTimeout(f),f=null)};try{Ay(a,c,function(h){e(h)&&g()})}catch(h){e(null,h);return}f=setTimeout(function(){g();e(null,Error("timeout"))},d);a.sendMessage(b).catch(function(h){g();e(null,h)})};
zy.prototype.m=function(a){if(a&&"string"===typeof a.namespace_&&a.namespace_.startsWith("urn:x-cast:com.google.cast.")){do{var b=void 0;try{b=ly(a.data)}catch(d){b=d.message;break}if(b.type){var c=this.h.get(b.type);if(c)try{c(b);return}catch(d){b="Error thrown during delivery. Response was: "+(JSON.stringify(b)+". Error from subscriber callback was: ")+(d.message+".")}else b="Message was ignored: "+JSON.stringify(b)}else b="Message did not include response type: "+JSON.stringify(b)}while(0);10>
this.j?this.u.J(b):hb(this.u,b);++this.j}};var Dy=function(){this.g=Promise.resolve(1)},Fy=function(a,b,c){return Ey(a,function(d){return d==b},c)},Gy=function(a,b){var c=[3,4];return Ey(a,function(d){return-1!=c.indexOf(d)},b)},Hy=function(a,b){a.g=a.g.catch(function(){return 1});return Ey(a,function(){return!0},b)},Ey=function(a,b,c){var d,e,f=new Promise(function(g,h){d=g;e=h});a.g=a.g.then(function(g){if(!b(g))return e(Error("Operation requires a different starting checkpoint than "+g)),Promise.resolve(g);var h=new Iy(g);try{var l=c(h)}catch(p){l=
Promise.reject(p)}return l.then(function(p){return d(p)},function(p){return e(p)}).then(function(){if(null===h.g)throw Error("A prior operation that started at "+(g+" did not complete."));return h.g})},function(g){e(g);throw g;});return f},Iy=function(a){this.h=a;this.g=null},Jy=function(a,b){a.g="number"===typeof b?b:a.h};var Ky=chrome.cast.streaming,Ly=ab("mr.mirror.cast.StreamingLaunchWorkflow"),Ny=function(a,b,c,d,e){this.L=a.sessionId;this.D=a.Zg;this.R=a.ee;this.j=b;this.H=c;this.K=d;this.W=My(e,"onAnswer",this.D);this.mb=My(e,"onSessionStop",this.D);this.u=Ly;this.C=new Dy;this.o=this.F=this.s=this.h=this.g=this.w=this.m=this.l=null};
Ny.prototype.start=function(a,b,c){var d=this;if(!a&&!b)return Promise.reject(Error("No tracks to stream"));var e=a instanceof Oy,f=b instanceof Oy;(e&&b&&!f||f&&a&&!e)&&Eb("Mixing remoting and non-remoting tracks");return Fy(this.C,1,function(g){d.l=a;d.m=b;d.w=c;B(d.u,function(){return"Launching streaming for "+Py(d)+" to a "+(d.R+".")});return Qy(d).then(d.G.bind(d)).then(function(h){return Ry(d,h).then(function(l){d.W();var p=Sy(d,l,h);d.g=Ty(d,d.g,p);d.h=Ty(d,d.h,p);if(!d.g&&!d.h)throw Error("Receiver did not select any offers from: "+
JSON.stringify(h));d.F=!!l.l;d.o=function(r,t){r==d.g?d.w.Fe("Audio stream (id="+r+") error: "+t):r==d.h&&d.w.Fe("Video stream (id="+r+") error: "+t)};Ky.rtpStream.onError.addListener(d.o);return Uy(d,l,p)})}).then(function(){B(d.u,function(){return"Launched streaming for "+Py(d)});d.w.og(d);Jy(g,2);return{gr:d.g,Fw:d.h}})})};
Ny.prototype.stop=function(){var a=this;return Hy(this.C,function(b){if(!a.l&&!a.m)return Jy(b,1),Promise.resolve();B(a.u,function(){return"Stopping streaming for "+Py(a)+"."});a.o&&(Ky.rtpStream.onError.removeListener(a.o),a.o=null);if(a.w){var c=a.w.eh();a.w=null}else c=Promise.resolve();return c.then(function(){a.g&&(Ky.rtpStream.stop(a.g),Ky.rtpStream.destroy(a.g),a.g=null);a.h&&(Ky.rtpStream.stop(a.h),Ky.rtpStream.destroy(a.h),a.h=null);a.s&&(Ky.udpTransport.destroy(a.s),a.s=null);a.mb();B(a.u,
function(){return"Stopped streaming for "+Py(a)+"."});a.l=null;a.m=null;Jy(b,1)})})};
var Vy=function(a,b){var c=JSON.stringify(b);return Promise.all([a.g&&new Promise(function(d){return Ky.rtpStream.getRawEvents(a.g,c,d)}),a.h&&new Promise(function(d){return Ky.rtpStream.getRawEvents(a.h,c,d)})]).catch(function(d){a.u.error("Unexpected error when calling getRawEvents()",d);return[]}).then(function(d){return new Blob(d.filter(function(e){return!!e}),{type:"application/gzip"})})},Wy=function(a){return Promise.all([a.g&&new Promise(function(b){return Ky.rtpStream.getStats(a.g,b)}),a.h&&
new Promise(function(b){return Ky.rtpStream.getStats(a.h,b)})]).catch(function(b){a.u.error("Unexpected error when calling getStats()",b);return[]}).then(function(b){return Object.assign.apply(Object,[{}].concat(q(b.filter(function(c){return!!c}))))})},Py=function(a){if(a.l&&a.m)var b="audio+video ";else if(a.l)b="audio-only ";else if(a.m)b="video-only ";else return"stopped";return a.l instanceof Oy||a.m instanceof Oy?b+"remoting":b+"streaming"},Qy=function(a){return new Promise(function(b){var c=
function(d,e,f){d&&!a.l&&(Ky.rtpStream.destroy(d),d=null);e&&!a.m&&(Ky.rtpStream.destroy(e),e=null);B(a.u,function(){return"Created Cast Streaming session: audioStreamId="+d+", videoStreamId="+e+"."});a.g=d;a.h=e;a.s=f;b()};a.l instanceof Oy||a.m instanceof Oy?Ky.session.create(null,null,c):Ky.session.create(a.l,a.m,c)})};
Ny.prototype.G=function(){for(var a=ak(),b=ak(),c=[],d=n([this.g,this.h]),e=d.next();!e.done;e=d.next())if(e=e.value)for(var f=e==this.g,g=f?127:96,h=f?Math.floor(499999*Math.random())+1:Math.floor(499999*Math.random())+500001,l=f?48E3:9E4,p=n(Ky.rtpStream.getSupportedParams(e)),r=p.next();!r.done;r=p.next())r=r.value,r.payload.payloadType=g,r.payload.maxLatency=this.j.maxLatencyMillis,r.payload.minLatency=this.j.minLatencyMillis,r.payload.animatedLatency=this.j.animatedLatencyMillis,r.payload.ssrc=
h,r.payload.clockRate=l,r.payload.aesKey=a,r.payload.aesIvMask=b,f?(r.payload.channels=2,r.payload.maxBitrate=this.j.audioBitrate,r.payload.maxFrameRate=100):(r.payload.minBitrate=this.j.minVideoBitrate,r.payload.maxBitrate=this.j.maxVideoBitrate,r.payload.maxFrameRate=this.j.maxFrameRate),c.push(new Xy(e,r));return c};
var Ty=function(a,b,c){b&&!c.some(function(d){return d.Lf==b})&&(a.u.J("Destroying RTP stream not selected by the receiver: id="+b),Ky.rtpStream.destroy(b),b=null);return b},Ry=function(a,b){return new Promise(function(c,d){for(var e=[],f=0;f<b.length;++f){var g=b[f].params,h={index:f,codecName:g.payload.codecName.toLowerCase(),rtpProfile:"cast",rtpPayloadType:g.payload.payloadType,ssrc:g.payload.ssrc,targetDelay:g.payload.animatedLatency,aesKey:g.payload.aesKey,aesIvMask:g.payload.aesIvMask,timeBase:"1/"+
g.payload.clockRate,receiverRtcpEventLog:a.j.enableLogging,rtpExtensions:["adaptive_playout_delay"]};a.j.dscpEnabled&&(h.receiverRtcpDscp=46);127==g.payload.payloadType?Object.assign(h,{type:"audio_source",bitRate:0<g.payload.maxBitrate?1E3*g.payload.maxBitrate:60*g.payload.maxFrameRate+g.payload.clockRate*g.payload.channels,sampleRate:g.payload.clockRate,channels:g.payload.channels}):Object.assign(h,{type:"video_source",renderMode:"video",maxFrameRate:Math.round(1E3*g.payload.maxFrameRate)+"/1000",
maxBitRate:1E3*g.payload.maxBitrate,resolutions:[{width:a.j.maxWidth,height:a.j.maxHeight}]});e.push(h)}var l=a.l instanceof Oy||a.m instanceof Oy?"remoting":"mirroring",p={type:"OFFER",sessionId:a.L,seqNum:on(a.H),offer:{castMode:l,receiverGetStatus:!0,supportedStreams:e}};B(a.u,function(){return"Sending OFFER message: "+JSON.stringify(p)});Cy(a.K,p,"ANSWER",1E4,function(r,t){if(null==r)d(t);else if("ok"==r.result&&r.g){if(r.h!=p.seqNum)return a.u.J("Ignoring ANSWER for OFFER with different seqNum: "+
JSON.stringify(r)),!1;((t=r.g.j)&&t!=l||!t&&"mirroring"!=l)&&a.u.error("Expected receiver to ANSWER with castMode="+l+", but got: "+t);hb(a.u,function(){return"Received ANSWER: "+JSON.stringify(r)});c(r.g)}else d(Error("Non-OK ANSWER received: "+JSON.stringify(r)));return!0})})},Sy=function(a,b,c){if(b.g.length!=b.h.length)return a.u.error("sendIndexes.length != ssrcs.length in ANSWER: "+JSON.stringify(b)),[];for(var d=[],e={},f=0;f<b.g.length;e={cf:e.cf},++f){var g=b.g[f];if(0>g||g>=c.length)return a.u.error("Receiver selected invalid index ("+
g+" < "+c.length+") in ANSWER: "+JSON.stringify(b)),[];e.cf=c[g];if(d.some(function(h){return function(l){return l.Lf==h.cf.Lf}}(e)))return a.u.error("Receiver selected same RTP stream twice in ANSWER: "+JSON.stringify(b)),[];e.cf.params.payload.feedbackSsrc=b.h[g];if(d.some(function(h){return function(l){return l.params.payload.feedbackSsrc==h.cf.params.payload.feedbackSsrc}}(e)))return a.u.error("Receiver provided same SSRC for two different RTP streams in ANSWER: "+JSON.stringify(b)),[];d.push(e.cf)}return d},
Uy=function(a,b,c){var d=null,e=function(){d&&(Ky.rtpStream.onStarted.removeListener(d),d=null)};return(new Promise(function(f,g){var h=b.m||2344;B(a.u,function(){return"Starting RTP streams to receiver at "+(a.D+":"+h)+(" for selected offers: "+JSON.stringify(c))});var l=a.s||-1;a.j.dscpEnabled&&(B(a.u,"Enabled DSCP in sender."),Ky.udpTransport.setOptions(l,{DSCP:!0}));Ky.udpTransport.setDestination(l,{address:a.D,port:h});var p=new Set(c.map(function(t){return t.Lf}));d=function(t){p.delete(t);
0==p.size&&f()};Ky.rtpStream.onStarted.addListener(d);l=n(c);for(var r=l.next();!r.done;r=l.next())r=r.value,Ky.rtpStream.toggleLogging(r.Lf,a.j.enableLogging),Ky.rtpStream.start(r.Lf,r.params);setTimeout(function(){g(Error("Timeout: RTP streams failed to start."))},1E4)})).then(e).catch(function(f){e();throw f;})},My=function(a,b,c){return a&&b in a?function(){try{a[b](c)}catch(d){Ly.error("Error from testHooks."+b,d)}}:function(){}},Xy=function(a,b){this.Lf=a;this.params=b},Oy=function(){};var Yy=ab("mr.mirror.cast.MediaRemoter"),az=function(a,b,c,d,e,f){this.o=a;this.K=Zy(b,this.o.sb);this.H=new Ny(this.o.sb,c,d,e,f);this.F=e;this.m=new Dy;this.j=new $y;this.C=new mojo.Binding(mojo.MirrorServiceRemoter,this,null);this.u=Yy;this.D=this.g=this.w=this.l=this.G=null;this.h=!0;this.s=this.L.bind(this)},dz=function(a,b,c){return Fy(a.m,1,function(d){a.G=b;a.l=c;var e=a.C.createInterfacePtrAndBind();a.C.setConnectionErrorHandler(function(){B(a.u,"Remoter mojo pipe connection error.");bz(a)});
a.g=new mojo.MirrorServiceRemotingSourcePtr;var f=qj(a.o.mediaSource||"");if(!f)throw Error("Failed to parse tab ID from source:\n          "+a.o.mediaSource);B(a.u,"Connecting remoter to browser: tabId="+f);($i.get("mr.ProviderManager")||null).onMediaRemoterCreated(f,e,mojo.makeRequest(a.g));a.g.ptr.setConnectionErrorHandler(function(){B(a.u,"RemotingSource mojo pipe connection error.");bz(a)});return cz(a).then(function(){if(a.h)a.g.onSinkAvailable(a.K);Jy(d,2)})})},bz=function(a){return Hy(a.m,
function(b){a.g&&(a.g.ptr.reset(),a.g=null);var c=a.w;a.w=null;a.l=null;a.G=null;a.C.close();chrome.settingsPrivate.onPrefsChanged.hasListener(a.s)&&chrome.settingsPrivate.onPrefsChanged.removeListener(a.s);return new Promise(function(d){window.setTimeout(function(){ez(a).then(function(){Jy(b,1);d();c&&c()})},250)})})};k=az.prototype;k.Mv=function(a){fz(this.j,a)};k.og=function(a){this.l&&this.l.og(a)};k.eh=function(){return this.l?this.l.eh():Promise.resolve()};
k.Fe=function(a,b){this.u.error("Error during streaming: "+a,b);if(this.g)this.g.onError();bz(this)};
k.start=function(){var a=this,b=!1;B(this.u,function(){b=!0;return"Starting next media remoting session."});b&&gz(this.j,function(c){return B(a.u,c)});hz(this.j);Fy(this.m,2,function(c){return(0,a.G)().then(function(d){a.w=d;Ay(a.F,"RPC",function(e){if(e.rpc){var f=a.j;e=e.rpc;f.w&&(++f.o,f.h+=e.length,f.w(e))}});Jy(c,3)}).catch(function(d){return ez(a).then(function(){Jy(c);throw d;})})}).then(function(){B(a.u,"Remoting started successfully.")}).catch(function(c){a.u.error("Failed to start remoting",
c);a.g.onError()})};k.nw=function(a,b){var c=this;return Fy(this.m,3,function(d){return c.H.start(a?new Oy:null,b?new Oy:null,c).then(function(e){iz(c.j,function(f){return c.F.sendMessage(f)},function(f){c.g.onMessageFromSink(f)});Jy(d,4);return{audio_stream_id:e.gr||-1,video_stream_id:e.Fw||-1}}).catch(function(e){return ez(c).then(function(){Jy(d);throw e;})})}).catch(function(d){c.u.error("Failed to start remoting streams",d);bz(c);return{audio_stream_id:-1,video_stream_id:-1}})};
k.stop=function(a){var b=this;Gy(this.m,function(c){b.g.onStopped(a);return ez(b).then(function(){B(b.u,"Remoting stopped.");Jy(c,5);(0,b.w)().then(function(){return Fy(b.m,5,function(d){if(b.g&&b.h)b.g.onSinkAvailable(b.K);Jy(d,2);return Promise.resolve()})}).catch(function(d){throw d;});b.w=null})}).catch(function(c){b.u.error("Failed to stop remoting: ",c);bz(b)})};
k.Fr=function(){null===this.D&&(this.D=wf(this.o.sb.Zg).then(function(a){return a.h||!1}));return this.D.then(function(a){return{rate:(a?1E7:5E6)/8}})};
var ez=function(a){return a.H.stop().then(function(){By(a.F,"RPC");jz(a.j);kz(a.j)})},cz=function(a){return new Promise(function(b){chrome.settingsPrivate.getPref("media_router.media_remoting.enabled",function(c){chrome.runtime.lastError?a.u.error("Encountered error getting media remoting pref: "+JSON.stringify(chrome.runtime.lastError)):c.type!=chrome.settingsPrivate.PrefType.BOOLEAN?a.u.error("Pref value not a boolean: "+JSON.stringify(c)):(a.h=!!c.value,B(a.u,"Initializing mediaRemotingEnabled_ with value read from pref: "+
a.h));chrome.settingsPrivate.onPrefsChanged.hasListener(a.s)||chrome.settingsPrivate.onPrefsChanged.addListener(a.s);b()})})};
az.prototype.L=function(a){if(this.g){a=n(a);for(var b=a.next();!b.done;b=a.next())if(b=b.value,"media_router.media_remoting.enabled"==b.key){if(b.type!=chrome.settingsPrivate.PrefType.BOOLEAN){this.u.error("Pref value not a boolean: "+JSON.stringify(b));break}a=!!b.value;if(this.h==a)break;this.h=a;B(this.u,"mediaRemotingEnabled_ changed to: "+this.h);if(this.h)this.g.onSinkAvailable(this.K);else this.g.onStopped(mojo.RemotingStopReason.USER_DISABLED);break}}};
var Zy=function(a,b){var c=new mojo.RemotingSinkMetadata;c.features=[];c.friendly_name=b.jw||"";c.audio_capabilities=[];c.video_capabilities=[];var d=mojo.RemotingSinkAudioCapability,e=mojo.RemotingSinkVideoCapability,f=c.audio_capabilities,g=c.video_capabilities,h=b.ee||"";(a.g||[]).forEach(function(l){switch(l){case "audio":f.push(d.CODEC_BASELINE_SET);break;case "aac":f.push(d.CODEC_AAC);break;case "opus":f.push(d.CODEC_OPUS);break;case "video":g.push(e.CODEC_BASELINE_SET);break;case "4k":g.push(e.SUPPORT_4K);
break;case "h264":g.push(e.CODEC_H264);break;case "vp8":g.push(e.CODEC_VP8);break;case "vp9":h.startsWith("Chromecast Ultra")&&g.push(e.CODEC_VP9);break;case "hevc":h.startsWith("Chromecast Ultra")&&g.push(e.CODEC_HEVC);break;default:B(Yy,"Unknown mediaCap name: "+l)}});b.ee&&"Chromecast Ultra"==b.ee&&g.push(e.SUPPORT_4K);return c};az.prototype.estimateTransmissionCapacity=az.prototype.Fr;az.prototype.stop=az.prototype.stop;az.prototype.startDataStreams=az.prototype.nw;az.prototype.start=az.prototype.start;
az.prototype.sendMessageToSink=az.prototype.Mv;
var $y=function(){this.w=this.m=this.g=null;this.D=this.h=this.o=this.j=this.s=0;this.l=null},hz=function(a){a.g=[];lz(a,performance.now())},iz=function(a,b,c){a.m=b;a.w=c;a.g?(b=a.g,a.g=null,b.forEach(function(d){return fz(a,d.data).then(d.Ov,d.Ao)})):lz(a,performance.now())},jz=function(a){if(a.g){var b=Error("Stop before delivering pending message");a.g.forEach(function(c){return c.Ao(b)});a.g=null}a.m=null;a.w=null},fz=function(a,b){if(a.m){var c=btoa(String.fromCharCode.apply(null,b));++a.s;
a.j+=b.length;return a.m({type:"RPC",rpc:c})}return a.g?new Promise(function(d,e){a.g.push({data:b,Ov:d,Ao:e})}):Promise.reject(Error("RPC pipe not started"))},gz=function(a,b){kz(a);a.l=setInterval(function(){if(a.g)var c=a.g.length+" messages are waiting to send.";else{c=performance.now();var d=(c-a.D)/1E3;d="Over the past "+d.toFixed(1)+" seconds, sent "+(a.s+" messages ("+Math.round(a.j/d)+" bytes/sec) and received ")+(a.o+" messages ("+Math.round(a.h/d)+" bytes/sec).");lz(a,c);c=d}b(c)},3E4)},
kz=function(a){null!=a.l&&(clearInterval(a.l),a.l=null)},lz=function(a,b){a.s=0;a.j=0;a.o=0;a.h=0;a.D=b};var mz=function(a){return a&&a.getAudioTracks()&&0<a.getAudioTracks().length?a.getAudioTracks()[0]:null},nz=function(a){return a&&a.getVideoTracks()&&0<a.getVideoTracks().length?a.getVideoTracks()[0]:null};var oz=function(a,b,c,d,e){this.j=new Ny(a,b,c,d,void 0===e?null:e);this.u=ab("mr.mirror.cast.MediaStreamer");this.m=new Dy;this.l=this.h=this.g=this.w=null};oz.prototype.start=function(a,b){var c=this;return Fy(this.m,1,function(d){c.w=a;c.g=mz(a);c.g&&"ended"==c.g.readyState&&(c.g=null);c.h=nz(a);c.h&&"ended"==c.h.readyState&&(c.h=null);if(!c.g&&!c.h)return Jy(d),Promise.reject(Error("No MediaStream tracks to stream."));c.l=b;return c.j.start(c.g,c.h,c.l).then(function(){return Jy(d,2)})})};
oz.prototype.stop=function(){var a=this;return Hy(this.m,function(b){return a.j.stop().then(function(){a.g=null;a.h=null;a.w=null;a.l=null;Jy(b,1)})})};var pz=function(a){return Fy(a.m,2,function(b){B(a.u,"Suspending media streaming...");return a.j.stop().then(function(){B(a.u,"Suspended media streaming.");Jy(b,3)})})};
oz.prototype.resume=function(){var a=this;return Fy(this.m,3,function(b){a.g&&"ended"==a.g.readyState&&(a.g=null);a.h&&"ended"==a.h.readyState&&(a.h=null);if(!a.g&&!a.h)return Promise.reject(Error("Cannot resume: All tracks have ended."));B(a.u,"Resuming media streaming...");return a.j.start(a.g,a.h,a.l).then(function(){B(a.u,"Resumed media streaming.");Jy(b,2)})})};var qz=function(a,b,c){this.m=a;this.l=b;this.j=c;this.u=ab("mr.mirror.cast.WifiStatusMonitor");this.g=null;this.h=[]};qz.prototype.start=function(){var a=this;null==this.g&&(hb(this.u,"Starting Wifi Status Monitoring."),this.h=[],Ay(this.j,"STATUS_RESPONSE",function(b){return rz(a,b)}),this.g=setInterval(function(){return sz(a)},12E4),sz(this))};qz.prototype.stop=function(){null!=this.g&&(hb(this.u,"Stopping Wifi Status Monitoring."),clearInterval(this.g),this.g=null,By(this.j,"STATUS_RESPONSE"))};
var rz=function(a,b){if(null!=a.g)if(b.status){var c={};null!=b.status.g&&(c.wifiSnr=b.status.g);null!=b.status.h&&(c.wifiSpeed=b.status.h[3]);0==Object.keys(c).length?a.u.J(function(){return"No status fields populated in response: "+JSON.stringify(b)}):(c.timestamp=Date.now(),30==a.h.length&&a.h.shift(),a.h.push(c),B(a.u,function(){return"Current Wifi status: "+JSON.stringify(c)}))}else a.u.J(function(){return"Ignoring response without status: "+JSON.stringify(b)})},sz=function(a){a.j.sendMessage({type:"GET_STATUS",
sessionId:a.m,seqNum:on(a.l),get_status:["wifiSnr","wifiSpeed"]})};var tz=function(a,b,c,d){this.G=b.Zg;this.K={extVersion:chrome.runtime.getManifest().version,extChannel:"public",mirrorSettings:Gj(a),sender:navigator.userAgent||"UNKNOWN",receiverProductName:b.ee};this.F=c;this.C=d;this.l=this.h=this.o=this.w=this.m=this.s=this.j=null;this.g=[]};tz.prototype.og=function(a){null!=this.h&&clearInterval(this.h);this.j=a;this.s=Date.now();this.h=setInterval(this.D.bind(this,a),9E5)};
tz.prototype.eh=function(){null!=this.h&&(clearInterval(this.h),this.h=null);if(null!=this.j){var a=this.D(this.j);this.j=null;return a}return Promise.resolve()};tz.prototype.Fe=function(a,b){null==this.m&&(this.m=Date.now(),"function"===typeof a?this.w=a():"string"===typeof a&&(this.w=a),b&&"string"===typeof b.stack&&(this.o=b.stack))};
var vz=function(a,b){return(null==a.j?Promise.resolve():a.D(a.j)).then(function(){var c=b.map(function(d){d=uz(a,d);var e=d.map(function(g){return g.events}).filter(function(g){return null!=g}),f=["["];d.map(function(g){return g.Kf}).forEach(function(g,h){0<h&&f.push(",");f.push(g)});f.push("]");return{events:new Blob(e,{type:"application/gzip"}),Kf:new Blob(f,{type:"application/json"})}});a.g=[];return c})};
tz.prototype.D=function(a){var b=this;if(null!=this.l)return this.l;var c=wf(this.G).then(function(d){d={receiverVersion:d.g,receiverConnected:d.l,receiverOnEthernet:d.h,receiverHasUpdatePending:d.j,receiverUptimeSeconds:d.m};Object.assign(d,b.K);var e=Date.now();Object.assign(d,{startTime:b.s,endTime:e,activity:Py(a),receiverWifiStatus:Array.from(b.C.h)});b.s=e;null!=b.m&&(Object.assign(d,{streamingErrorTime:b.m,streamingErrorMessage:b.w,streamingErrorCause:b.o}),b.m=null,b.w=null,b.o=null);return d});
return(this.l=Promise.all([c.then(function(d){return Vy(a,d)}),c,Wy(a)]).then(function(d){var e=n(d);d=e.next().value;var f=e.next().value;e=e.next().value;b.g.push({events:d,Kf:new Blob([JSON.stringify(Object.assign({tags:f},e))],{type:"application/json"})});b.g=uz(b,b.F);b.l=null}))||Promise.resolve()};
var uz=function(a,b){b-=2;for(var c=[],d=a.g.length-1;0<=d;--d){b-=a.g[d].Kf.size+1;if(0>b)break;c.push({events:null,Kf:a.g[d].Kf});if(null!=a.g[d].events){var e=a.g[d].events.size;b>=e&&(c[c.length-1].events=a.g[d].events,b-=e)}}return c.reverse()};var wz=function(a,b,c,d){d=void 0===d?null:d;Dj.call(this,b);var e=b.sb;this.D=e.sessionId;this.G=a;this.H=d;this.u=ab("mr.mirror.cast.Session");this.s=new Dy;this.o=new nn("mirror.cast.SeqNumGenerator");this.w=new zy(b.id);this.m=new oz(e,this.G,this.o,this.w,this.H);this.l=null;this.g=new tz(a,e,c,new qz(this.D,this.o,this.w));this.C=null};u(wz,Dj);k=wz.prototype;
k.start=function(a){var b=this;return Fy(this.s,1,function(c){var d=Yx();return b.m.start(a,b).then(function(){b.m.j.F&&(b.g.C.start(),xz(b));d.end();b.C=Zx();Jy(c,2);return b})})};k.stop=function(){var a=this;return Hy(this.s,function(b){a.C&&(a.C.end(),a.C=null);a.g.C.stop();return a.m.stop().then(function(){return a.l?bz(a.l):Promise.resolve()}).then(function(){a.l=null;Jy(b,4)})})};
k.yo=function(){var a=this,b={sessionId:this.D,seqNum:on(this.o),type:"PRESENTATION",icons:[],title:Bj(this.nc)};B(this.u,"Sending session metadata update to receiver: "+this.D);this.w.sendMessage(b).catch(function(c){a.u.J("Failed to send activity to sink: "+c.message)})};k.og=function(a){this.g.og(a)};k.eh=function(){return this.g.eh()};k.Fe=function(a,b){this.g.Fe(a,b);this.u.error(a,b);this.stop()};
var yz=function(a,b){return vz(a.g,b)},xz=function(a){zz(a).then(function(b){(b.g||[]).includes("video")?Az(a,b):a.u.J(function(){return"Receiver incapable of Media Remoting: "+JSON.stringify(b)})}).catch(function(b){a.u.J("None/Invalid capabilites response. Media Remoting disabled.",b)})},zz=function(a){return new Promise(function(b,c){var d={type:"GET_CAPABILITIES",sessionId:a.D,seqNum:on(a.o)};B(a.u,function(){return"Sending GET_CAPABILITIES message: "+JSON.stringify(d)});Cy(a.w,d,"CAPABILITIES_RESPONSE",
3E4,function(e,f){if(null==e)return c(f),!0;if("ok"!=e.result||!e.capabilities)return c(Error("Bad response: "+JSON.stringify(e))),!0;if(e.h!=d.seqNum)return B(a.u,function(){return"Ignoring CAPABILITIES_RESPONSE with different seqNum: "+JSON.stringify(e)}),!1;hb(a.u,function(){return"Received CAPABILITIES_RESPONSE: "+JSON.stringify(e)});b(e.capabilities);return!0})})},Az=function(a,b){Fy(a.s,2,function(c){var d=a.h.sb.ee||"<UNKNOWN>";if(!d.startsWith("Chromecast")&&!d.startsWith("Eureka Dongle"))return a.u.J('HACK: Media Remoting disabled because the receiver model--"'+
(d+'" according to discovery--is not a Chromecast.')),Jy(c),Promise.resolve();a.l=new az(a.h,b,a.G,a.o,a.w,a.H);return dz(a.l,a.L.bind(a),a).catch(function(e){a.u.error("Media Remoting start failed: "+e.message,e)}).then(function(){return Jy(c)})})};wz.prototype.L=function(){var a=this;return Fy(this.s,2,function(b){return new Promise(function(c,d){pz(a.m).then(function(){Jy(b,3);a.F=!0;tj(a);c(a.R.bind(a))}).catch(function(e){a.Fe("Failed to suspend MediaStreamer before starting remoting",e);d(e)})})})};
wz.prototype.R=function(){var a=this;return Fy(this.s,3,function(b){return new Promise(function(c,d){a.m.resume().then(function(){Jy(b,2);a.F=!1;tj(a);c()}).catch(function(e){a.Fe("Failed resume MediaStreamer after ending remoting mode",e);d(e)})})})};var Bz=function(){rj.call(this,"cast_streaming");this.w=this.D=this.K=this.G=this.l=null;this.Z=this.H="";this.ka=this.s=!1;this.ra=this.Ba.bind(this);this.L=this.R=this.W=this.mb=this.m=null};u(Bz,rj);k=Bz.prototype;k.pg=function(a){this.s=a||!1;this.ka=!0};k.getName=function(){return"cast_streaming"};
k.ik=function(a,b,c,d,e){var f=this;if(!this.s)return rj.prototype.ik.call(this,a,b,c,d,e);B(this.T,"Start mirroring on route "+a.id);if(!this.ka)return Fi(Error("Not initialized"));var g=new Promise(function(h,l){f.o().then(function(){if(pj(b)&&c.shouldCaptureVideo)return Xi(!1).then(function(p){f.Z=p})}).then(function(){return e?e(a).g:a}).then(function(p){f.H=b;Cz(f,p);var r=f.G.createInterfacePtrAndBind(),t=f.K.createInterfacePtrAndBind(),A=Dz(p,c);Ez(f,p,b,d);if(!f.l)throw new Ji("Error to get mirroring service host");
f.D=new mojo.MirroringCastMessageChannelPtr;f.mb=Yx();f.l.start(A,r,t,mojo.makeRequest(f.D));f.m=new Dj(a,f.j.L.bind(f.j));tj(f.m);Fz(f,p,b);f.R=function(){return h(p)};f.L=l}).catch(function(p){f.T.error("Mirroring launch error: "+p);f.Ff(void 0===p.reason?9:p.reason);l(p)})});return Gi(g)};k.zh=function(a,b){return new wz(a,b,20969472,null)};k.Wg=function(){$x(0)};k.Tg=function(){$x(1)};k.di=function(){$x(2)};k.Ug=function(){ub("MediaRouter.CastStreaming.Session.End")};
k.Ff=function(a){vb("MediaRouter.CastStreaming.Start.Failure",a,Ii)};k.Vg=function(){ub("MediaRouter.CastStreaming.Stream.End")};
k.Oi=function(a){var b=this;return this.s?Promise.resolve():(new Promise(function(c){return chrome.metricsPrivate.getIsCrashReportingEnabled(c)})).then(function(c){var d=c&&gy(),e=[9351424];d&&e.push(20969472);return yz(a,e).then(function(f){var g=f[f.length-1];f=mm(f[0].events).catch(function(h){b.T.error("Failed to persist events Blob.",h)});d&&0<g.events.size?cy(g.events,void 0,b.Tt.bind(b)):c&&by("stats.json",g.Kf,void 0,void 0);return f})})};
k.Tt=function(a){if(a){a=fy();var b=Date.now();a.g=b}};k.hk=function(a){if(this.s)return Ya();B(this.T,"Received message to upload logs for "+a);return this.g?yz(this.g,[20969472]).then(function(b){b=n(b).next().value;return 0==b.events.size?"":cy(b.events,a)}):Promise.resolve(Gz(this,a))};
var Gz=function(a,b){var c=window.localStorage.getItem("mr.temp.mirror.cast.Service.eventsBlob");if(null==c||1>c.length)c=null;else{for(var d=new Uint16Array(c.length),e=0;e<c.length;++e)d[e]=c.charCodeAt(e);c=d.buffer;d=(new Uint8Array(c,c.byteLength-1,1))[0];c=new Uint8Array(c,0,c.byteLength-(0==d?2:1));c=new Blob([c],{type:"application/gzip"})}if(null!=c&&0!=c.size)return mm(new Blob),B(a.T,"Uploading saved logs for feedback."),cy(c,b)};k=Bz.prototype;
k.onError=function(a){this.L&&(this.L(a),this.R=this.L=null,this.Ff(9));B(this.T,"Mirroring service error: "+a);this.o()};k.didStart=function(){this.R&&(this.R(),this.R=this.L=null);this.mb&&(this.mb.end(),this.mb=null);this.W=Zx();oj(this.H)?this.Wg():pj(this.H)?this.Tg():mj(this.H)&&this.di()};k.didStop=function(){this.o()};k.send=function(a){if(this.w){var b=JSON.parse(a.jsonFormatData);hb(this.T,function(){return"Sending message: "+JSON.stringify(b)});this.w.sendMessage(a.jsonFormatData,{namespace:a.messageNamespace})}};
k.Ut=function(a){if(a&&(a.namespace_===mojo.MirroringWebRtcNamespace||a.namespace_===mojo.MirroringRemotingNamespace)&&this.D){var b=new mojo.MirroringCastMessage;b.messageNamespace=a.namespace_;"string"!==typeof a.data?B(this.T,"Received non-string as JSON"):(b.jsonFormatData=a.data,this.D.send(b))}};
var Cz=function(a,b){a.G=new mojo.Binding(mojo.MirroringSessionObserver,a,null);a.K=new mojo.Binding(mojo.MirroringCastMessageChannel,a,null);a.w=Sw(b.id);a.w.onMessage=a.Ut.bind(a)},Dz=function(a,b){var c=new mojo.MirroringSessionParameters;c.receiverAddress=new mojo.IPAddress;c.receiverAddress.addressBytes=a.sb.Zg.split(".").map(function(d){return parseInt(d,10)});c.receiverModelName=a.sb.ee;a=Hz(a.mediaSource);c.targetPlayoutDelay=Iz(a);!b.shouldCaptureVideo||!b.shouldCaptureAudio||a&&"0"===a.searchParams.get("streamingCaptureAudio")?
c.type=b.shouldCaptureVideo?mojo.MirroringSessionType.VIDEO_ONLY:mojo.MirroringSessionType.AUDIO_ONLY:c.type=mojo.MirroringSessionType.AUDIO_AND_VIDEO;return c},Iz=function(a){if(!a)return null;a=Number(a.searchParams.get("streamingTargetPlayoutDelayMillis"));return isNaN(a)||0>=a?null:new mojo.TimeDelta({microseconds:1E3*a})},Hz=function(a){if(!a)return null;try{return new URL(a)}catch(b){return null}},Ez=function(a,b,c,d){a.l=new mojo.MirroringServiceHostPtr;b=b.sb.tabId||-1;oj(c)?a.j.getMirroringServiceHostForTab(b,
mojo.makeRequest(a.l)):pj(c)?a.j.getMirroringServiceHostForDesktop(-1,a.Z,mojo.makeRequest(a.l)):mj(c)?(b=new mojo.Url,b.url=c,a.j.getMirroringServiceHostForOffscreenTab(b,d||"",mojo.makeRequest(a.l))):a.l=null},Fz=function(a,b,c){oj(c)&&!chrome.tabs.onUpdated.hasListener(a.ra)&&chrome.tabs.onUpdated.addListener(a.ra);(oj(c)||mj(c))&&wj(a.m,b.sb.tabId)};Bz.prototype.Ba=function(a,b,c){lj(14);this.m&&yj(this.m,a,b,c)};
Bz.prototype.o=function(){chrome.tabs.onUpdated.removeListener(this.ra);return this.s?this.ka?this.l?(this.l.ptr.reset(),this.D=this.l=null,this.w&&this.w.dispose(),this.w=null,this.G&&(this.G.close(),this.G=null),this.K&&(this.K.close(),this.K=null),xj(this.j,this.m.h.id),this.m=null,this.Z=this.H="",this.W&&(this.W.end(),this.W=null),this.Ug(),Promise.resolve(!0)):Promise.resolve(!1):Promise.reject("Not initialized"):rj.prototype.o.call(this)};
Bz.prototype.oa=function(a,b,c,d,e,f){return this.s?Fi(Error("Mirroring service does not support updating stream")):rj.prototype.oa.call(this,a,b,c,d,e,f)};Bz.prototype.send=Bz.prototype.send;Bz.prototype.didStop=Bz.prototype.didStop;Bz.prototype.didStart=Bz.prototype.didStart;Bz.prototype.onError=Bz.prototype.onError;var Jz=new Bz;ij("mr.mirror.cast.Service",Jz);