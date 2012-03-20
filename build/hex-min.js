// HexJS v0.3.2 http://hexjs.edgarhoo.org/ MIT
(function(m,t){var q={},j={},l={},o={},f={},r=[],k=m.location.search.indexOf("hexjs.debug=true")>-1,p={}.toString;q._hexjs=m.hexjs;q._define=m.define;q._register=m.register;j.now=Date.now||function(){return new Date().getTime();};j.isFunction=function(u){return p.call(u)==="[object Function]";};j.isArray=Array.isArray||function(u){return p.call(u)==="[object Array]";};j.forEach=Array.prototype.forEach?function(u,v){u.forEach(v);}:function(u,x){for(var w=0,v=u.length;w<v;w++){x(u[w]);}};l.extend=function(v,w){if(w===undefined){return;}for(var u in w){if(w[u]!==undefined){v[u]=w[u];}}};q.isReady=0;q.isBind=0;q.readyList=[];q.testEl=t.documentElement;q.readyInit=function(){q.isReady=1;if(!t.body){setTimeout(arguments.callee,10);return;}for(var v=0,u=q.readyList.length;v<u;v++){q.readyList[v]();}q.readyList=[];};q.bindReady=function(){if("complete"===t.readyState){q.readyInit();}else{if(t.addEventListener){t.addEventListener("DOMContentLoaded",function(){t.removeEventListener("DOMContentLoaded",arguments.callee,false);q.readyInit();},false);m.addEventListener("load",q.readyInit,false);}else{if(t.attachEvent){t.attachEvent("onreadystatechange",function(){if("complete"===t.readyState){t.detachEvent("onreadystatechange",arguments.callee);q.readyInit();}});m.attachEvent("onload",q.readyInit);if(q.testEl.doScroll&&m==m.top){q.doScrollCheck();}}}}};q.doScrollCheck=function(){if(q.isReady){return;}try{q.testEl.doScroll("left");}catch(u){setTimeout(q.doScrollCheck,1);return;}q.readyInit();};l.ready=function(u){q.readyList.push(u);if(q.isReady){u();}else{if(!q.isBind){q.isBind=1;q.bindReady();}}};q.messageList=[];q.messageBox=null;q.prepared=false;q.createMessage=function(v){var u=t.createElement("li");"warn"===v.type?u.style.color="red":u.style.color="#000";u.innerHTML=v.message;q.messageBox.appendChild(u);};q.messagePrepare=function(){l.ready(function(){var u=t.createElement("div");u.id="hexjs-debug";u.style.margin="10px 0";u.style.border="1px dashed red";u.style.padding="4px 8px";u.style.fontSize="14px";u.style.lineHeight="1.5";u.style.textAlign="left";t.body.appendChild(u);q.messageBox=t.createElement("ol");q.messageBox.style.listStyleType="decimal";u.appendChild(q.messageBox);j.forEach(q.messageList,function(v){q.createMessage(v);});});q.prepared=true;};l.console=function(w,u){var v={message:w,type:u};!q.prepared&&q.messagePrepare();q.messageBox?q.createMessage(v):q.messageList.push(v);};var i=function(v,u){if(!!m.console&&m.console.info){i=function(x,w){m.console[w](x);};}else{i=function(x,w){l.console(x,w);};}i(v,u);};var h=function(v,u){this.id=v;this.factory=u;this.exports={};this.clone=function(){};this.once=false;};var d=function(x,u){var w,v;if("string"!==typeof x){u=x;x="";}if(f[x]){k&&i(j.now()+': the module "'+x+'" already exists. ',"warn");return null;}if(j.isFunction(u)){u={init:u};}w=new h(x,u);if(x!==""){f[x]=w;}else{v=r.length;w._idx=v;r[v]=w;return new b(v);}};var e=function(y,w){var u=arguments,x,v;if(j.isArray(y)){j.forEach(y,function(z){u.callee(z);});return;}x=y.split("~");if(x.length===1){y=x[0];v=true;}else{y=x[1];}if(!w||!(w instanceof h)){w=f[y];}if(!w){k&&y!==""&&i(j.now()+': the module "'+y+'" does not exist. ',"warn");return null;}if(w.once){k&&y!==""&&i(j.now()+': the module "'+y+'" already registered. ',"warn");return null;}w.once=true;v?l.ready(function(){n(w,"register","after ready");}):n(w,"register","now");};var c=function(u){e.call(null,u);};var b=function(u){this.idx=u;};b.prototype.register=function(u){var v=u==="~"?"~":"";e.call(null,v,r[this.idx]);};var a=function(w,v){var u=f[w];if(!u){return;}if(!u.once||v){u.once=true;n(u,"require");}return new u.clone();};var g=function(){function u(w,v){return a.call(null,w,v);}return u;};var n=function(x,y,u){try{if(j.isFunction(x.factory.init)){var v=x.factory.init(g(),x.exports,x);l.extend(x.exports,v);}else{if(x.factory!==undefined){x.exports=x.factory;}}x.clone.prototype=x.exports;if(k){var w=j.now();if(""===x.id){i(w+": the module anonymous_"+x._idx+" registered. "+u+" execute.","info");return;}"register"===y?i(w+': the module "'+x.id+'" registered. '+u+" execute.","info"):i(w+': the module "'+x.id+'" required.',"info");}}catch(z){if(k){var w=j.now();if(""===x.id){i(w+": the module anonymous_"+x._idx+' failed to register. The message: "'+z.message+'".',"warn");return;}"register"===y?i(w+': the module "'+x.id+'" failed to register. The message: "'+z.message+'".',"warn"):i(w+': the module "'+x.id+'" failed to require. The message: "'+z.message+'".',"warn");}}};var s=function(u){switch(u){case true:m.define=q._define;m.register=q._register;break;case false:m.define=d;m.register=c;break;case undefined:default:if(m.hexjs===o){m.hexjs=q._hexjs;}break;}return o;};o.define=d;o.register=c;o.noConflict=s;o.version="0.3.1";m.hexjs=o;})(this,document);
