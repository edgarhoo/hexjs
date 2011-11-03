/**
 * HexJS, a page-level module manager
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version v0.2.1
 * @build   111103
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT License
 * */

(function(b,l){var n={},p={},e={},q={},f={},a=[],d=b.location.search.indexOf("hexjs.debug=true")>-1;p.toString=Object.prototype.toString;p.now=Date.now||function(){return new Date().getTime();};p.isFunction=function(r){return p.toString.call(r)==="[object Function]";};p.isArray=Array.isArray||function(r){return p.toString.call(r)==="[object Array]";};p.forEach=Array.prototype.forEach?function(r,s){r.forEach(s);}:function(r,u){for(var t=0,s=r.length;t<s;t++){u(r[t]);}};e.extend=function(s,t){if(t===undefined){return;}for(var r in t){if(t[r]!==undefined){s[r]=t[r];}}};n.isReady=0;n.isBind=0;n.readyList=[];n.testEl=l.documentElement;n.readyInit=function(){n.isReady=1;if(!l.body){setTimeout(arguments.callee,10);return;}for(var s=0,r=n.readyList.length;s<r;s++){n.readyList[s]();}n.readyList=[];};n.bindReady=function(){if("complete"===l.readyState){n.readyInit();}else{if(l.addEventListener){l.addEventListener("DOMContentLoaded",function(){l.removeEventListener("DOMContentLoaded",arguments.callee,false);n.readyInit();},false);b.addEventListener("load",n.readyInit,false);}else{if(l.attachEvent){l.attachEvent("onreadystatechange",function(){if("complete"===l.readyState){l.detachEvent("onreadystatechange",arguments.callee);n.readyInit();}});b.attachEvent("onload",n.readyInit);if(n.testEl.doScroll&&b==b.top){n.doScrollCheck();}}}}};n.doScrollCheck=function(){if(n.isReady){return;}try{n.testEl.doScroll("left");}catch(r){setTimeout(n.doScrollCheck,1);return;}n.readyInit();};e.ready=function(r){n.readyList.push(r);if(n.isReady){r();}else{if(!n.isBind){n.isBind=1;n.bindReady();}}};n.messageList=[];n.messageBox=null;n.prepared=false;n.createMessage=function(s){var r=l.createElement("li");"warn"===s.type?r.style.color="red":r.style.color="#000";r.innerHTML=s.message;n.messageBox.appendChild(r);};n.messagePrepare=function(){e.ready(function(){var r=l.createElement("div");r.id="hexjs-debug";r.style.margin="10px 0";r.style.border="1px dashed red";r.style.padding="4px 8px";r.style.fontSize="14px";r.style.lineHeight="1.5";r.style.textAlign="left";l.body.appendChild(r);n.messageBox=l.createElement("ol");n.messageBox.style.listStyleType="decimal";r.appendChild(n.messageBox);p.forEach(n.messageList,function(s){n.createMessage(s);});});n.prepared=true;};e.console=function(t,r){var s={message:t,type:r};!n.prepared&&n.messagePrepare();n.messageBox?n.createMessage(s):n.messageList.push(s);};var j=function(s,r){if(!!b.console){j=function(u,t){b.console[t](u);};}else{j=function(u,t){e.console(u,t);};}j(s,r);};var o=function(s,r){this.id=s;this.fn=r;this.exports={};this.once=false;};var g=function(u,t){var s,r;if("string"!==typeof u){t=u;u="";}if(f[u]){d&&j(p.now()+': the module "'+u+'" already exists. ',"warn");return null;}if(p.isFunction(t)){t={init:t};}s=new o(u,t);if(u!==""){f[u]=s;}else{r=a.length;s._idx=r;a[r]=s;return new i(r);}};var m=function(v,s){var r=arguments,t,u;if(p.isArray(v)){p.forEach(v,function(w){r.callee(w);});return;}t=v.split("~");if(t.length===1){v=t[0];u=true;}else{v=t[1];}if(!s||!(s instanceof o)){s=f[v];}if(!s||s.once){return null;}s.once=true;u?e.ready(function(){k(s,"register","after ready");}):k(s,"register","now");};var i=function(r){this.idx=r;};i.prototype.register=function(r){var s=r==="~"?"~":"";m(s,a[this.idx]);};var c=function(t,s){var r=f[t];if(!r){return;}if(!r.once||s){r.once=true;k(r,"require");}return r.exports;};var k=function(u,v,r){try{var s=u.fn.init(c,u.exports,u);e.extend(u.exports,s);if(d){var t=p.now();if(""===u.id){j(t+": the module anonymous_"+u._idx+" registered. "+r+" execute.","info");return;}"register"===v?j(t+': the module "'+u.id+'" registered. '+r+" execute.","info"):j(t+': the module "'+u.id+'" required.',"info");}}catch(w){if(d){var t=p.now();if(""===u.id){j(t+": the module anonymous_"+u._idx+" failed to register. "+r+" execute.","warn");return;}"register"===v?j(t+': the module "'+u.id+'" failed to register.',"warn"):j(t+': the module "'+u.id+'" failed to require.',"warn");}}};n._hexjs=b.hexjs;n._define=b.define;n._register=b.register;var h=function(r){switch(r){case true:b.define=n._define;b.register=n._register;break;case false:b.define=g;b.register=m;break;case undefined:default:if(b.hexjs===q){b.hexjs=n._hexjs;}break;}return q;};q.define=g;q.register=m;q.noConflict=h;q.version="0.2.1";b.hexjs=q;})(this,document);
