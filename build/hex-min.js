// HexJS v0.4 http://hexjs.edgarhoo.org/ MIT
(function(c,f){var k={},s={},A=[],G=c.location.search.indexOf("hexjs.debug=true")>-1,d={}.toString,E=Date.now||function(){return new Date().getTime();},l=function(M){return d.call(M)==="[object Function]";},q=Array.isArray||function(M){return d.call(M)==="[object Array]";},b=Array.prototype.forEach?function(M,N){M.forEach(N);}:function(M,P){for(var O=0,N=M.length;O<N;O++){P(M[O]);}},K=0,J=0,j=[],v=f.documentElement,y=function(){K=1;if(!f.body){setTimeout(arguments.callee,10);return;}for(var N=0,M=j.length;N<M;N++){j[N]();}j=[];},p=function(){if("complete"===f.readyState){y();}else{if(f.addEventListener){f.addEventListener("DOMContentLoaded",function(){f.removeEventListener("DOMContentLoaded",arguments.callee,false);y();},false);c.addEventListener("load",y,false);}else{if(f.attachEvent){f.attachEvent("onreadystatechange",function(){if("complete"===f.readyState){f.detachEvent("onreadystatechange",arguments.callee);y();}});c.attachEvent("onload",y);if(v.doScroll&&c==c.top){r();}}}}},r=function(){if(K){return;}try{v.doScroll("left");}catch(M){setTimeout(r,1);return;}y();},e=function(M){j.push(M);if(K){M();}else{if(!J){J=1;p();}}},F=[],x=null,w=false,H=function(N){var M=f.createElement("li");"warn"===N.type?M.style.color="red":M.style.color="#000";M.innerHTML=N.message;x.appendChild(M);},m=function(){e(function(){var M=f.createElement("div");M.id="hexjs-debug";M.style.margin="10px 0";M.style.border="1px dashed red";M.style.padding="4px 8px";M.style.fontSize="14px";M.style.lineHeight="1.5";M.style.textAlign="left";f.body.appendChild(M);x=f.createElement("ol");x.style.listStyleType="decimal";M.appendChild(x);b(F,function(N){H(N);});});w=true;},I=function(O,M){var N={message:O,type:M};!w&&m();x?H(N):F.push(N);};var h=G?(!!c.console&&c.console.warn?function(N,M){M=M||"info";c.console[M](N);}:function(N,M){tpye=M||"info";I(N,M);}):function(){};var t=function(N,M){this.id=N;this.factory=M;this.exports={};this.once=false;};var D=function(P,M){var O,N;if("string"!==typeof P){M=P;P="";}if(s[P]){h(E()+': the module "'+P+'" already exists. ',"warn");return null;}if(l(M)){M={init:M};}O=new t(P,M);if(P!==""){s[P]=O;}else{N=A.length;O._idx=N;A[N]=O;return new B(N);}};var z=function(Q,O){var M=arguments,P,N;if(q(Q)){b(Q,function(R){z.call(null,R);});return;}P=Q.split("~");if(P.length===1){Q=P[0];N=true;}else{Q=P[1];}if(!O||!(O instanceof t)){O=s[Q];}if(!O){Q!==""&&h(E()+': the module "'+Q+'" does not exist. ',"warn");return null;}if(O.once){Q!==""&&h(E()+': the module "'+Q+'" already registered. ',"warn");return null;}O.once=true;N?e(function(){C(O,"register","after ready");}):C(O,"register","now");};var i=function(M){z.call(null,M);};var B=function(M){this.idx=M;};B.prototype.register=function(M){var N=M==="~"?"~":"";z.call(null,N,A[this.idx]);};var L=function(O,N){var M=s[O];if(!M){return;}if(!M.once||N){M.once=true;C(M,"require");}return M.exports;};var a=function(){function M(O,N){return L.call(null,O,N);}return M;};var C=function(P,Q,M){try{if(l(P.factory.init)){var N=P.factory.init(a(),P.exports,P);if(N!==undefined){P.exports=N;}}else{if(P.factory!==undefined){P.exports=P.factory;}}if(G){var O=E();if(""===P.id){h(O+": the module anonymous_"+P._idx+" registered. "+M+" execute.");return;}"register"===Q?h(O+': the module "'+P.id+'" registered. '+M+" execute."):h(O+': the module "'+P.id+'" required.');}}catch(R){if(G){var O=E();if(""===P.id){h(O+": the module anonymous_"+P._idx+' failed to register. The message: "'+R.message+'".',"warn");return;}"register"===Q?h(O+': the module "'+P.id+'" failed to register. The message: "'+R.message+'".',"warn"):h(O+': the module "'+P.id+'" failed to require. The message: "'+R.message+'".',"warn");}}};var u=c.hexjs,n=c.define,o=c.register;var g=function(M){switch(M){case true:c.define=n;c.register=o;break;case false:c.define=D;c.register=i;break;case undefined:default:if(c.hexjs===k){c.hexjs=u;}}return k;};k.define=D;k.register=i;k.log=h;k.noConflict=g;k.version="0.4";c.hexjs=k;})(this,document);
