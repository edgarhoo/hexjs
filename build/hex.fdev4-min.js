// HexJS v0.3 http://hexjs.edgarhoo.org/ MIT
(function(f,b){var o={},d={},a=[],c=b.location.search.indexOf("hexjs.debug=true")>-1;var i=function(q,p){if(!!b.console){i=function(s,r){b.console[r](s);};}else{i=function(s,r){f.use("util-debug",function(){f.log(s);});};}i(q,p);};var m=function(q,p){this.id=q;this.factory=p;this.exports={};this.clone=function(){};this.once=false;};var g=function(s,p){var r,q;if("string"!==typeof s){p=s;s="";}if(d[s]){c&&i(f.now()+': the module "'+s+'" already exists. ',"warn");return null;}if(f.isFunction(p)){p={init:p};}r=new m(s,p);if(s!==""){d[s]=r;}else{q=a.length;r._idx=q;a[q]=r;return new h(q);}};var n=function(t,q){var p=arguments,r,s;if(f.isArray(t)){f.each(t,function(u,v){p.callee(v);});return;}r=t.split("~");if(r.length===1){t=r[0];s=true;}else{t=r[1];}if(!q||!(q instanceof m)){q=d[t];}if(!q||q.once){return null;}q.once=true;s?f(function(){j(q,"register","after ready");}):j(q,"register","now");};var l=function(p){n.call(null,p);};var h=function(p){this.idx=p;};h.prototype.register=function(p){var q=p==="~"?"~":"";n.call(null,q,a[this.idx]);};var e=function(r,q){var p=d[r];if(!p){return;}if(!p.once||q){p.once=true;j(p,"require");}return new p.clone();};var k=function(){function p(r,q){return e.call(null,r,q);}return p;};var j=function(s,t,p){try{if(f.isFunction(s.factory.init)){var q=s.factory.init(k(),s.exports,s);q===undefined||f.extend(s.exports,q);}else{if(s.factory!==undefined){s.exports=s.factory;}}s.clone.prototype=s.exports;if(c){var r=f.now();if(""===s.id){i(r+": the module anonymous_"+s._idx+" registered. "+p+" execute.","info");return;}"register"===t?i(r+': the module "'+s.id+'" registered. '+p+" execute.","info"):i(r+': the module "'+s.id+'" required.',"info");}}catch(u){if(c){var r=f.now();if(""===s.id){i(r+": the module anonymous_"+s._idx+" failed to register. "+p+" execute.","warn");return;}"register"===t?i(r+': the module "'+s.id+'" failed to register.',"warn"):i(r+': the module "'+s.id+'" failed to require.',"warn");}}};o.define=g;o.register=l;o.version="0.3";b.hexjs=o;})(jQuery,this);
