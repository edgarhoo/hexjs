/**
 * HexJS, a page-level module manager
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version v0.2.1
 * @build   111103
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT License
 * */

(function(f,b){var m={},e={},a=[],d=b.location.search.indexOf("hexjs.debug=true")>-1;var i=function(o,n){if(!!b.console){i=function(q,p){b.console[p](q);};}else{i=function(q,p){f.use("util-debug",function(){f.log(q);});};}i(o,n);};var l=function(o,n){this.id=o;this.fn=n;this.exports={};this.once=false;};var g=function(q,p){var o,n;if("string"!==typeof q){p=q;q="";}if(e[q]){d&&i(f.now()+': the module "'+q+'" already exists. ',"warn");return null;}if(f.isFunction(p)){p={init:p};}o=new l(q,p);if(q!==""){e[q]=o;}else{n=a.length;o._idx=n;a[n]=o;return new h(n);}};var k=function(r,o){var n=arguments,p,q;if(f.isArray(r)){f.each(r,function(s,t){n.callee(t);});return;}p=r.split("~");if(p.length===1){r=p[0];q=true;}else{r=p[1];}if(!o||!(o instanceof l)){o=e[r];}if(!o||o.once){return null;}o.once=true;q?f(function(){j(o,"register","after ready");}):j(o,"register","now");};var h=function(n){this.idx=n;};h.prototype.register=function(n){var o=n==="~"?"~":"";k(o,a[this.idx]);};var c=function(p,o){var n=e[p];if(!n){return;}if(!n.once||o){n.once=true;j(n,"require");}return n.exports;};var j=function(q,r,n){try{var o=q.fn.init(c,q.exports,q);o===undefined||f.extend(q.exports,o);if(d){var p=f.now();if(""===q.id){i(p+": the module anonymous_"+q._idx+" registered. "+n+" execute.","info");return;}"register"===r?i(p+': the module "'+q.id+'" registered. '+n+" execute.","info"):i(p+': the module "'+q.id+'" required.',"info");}}catch(s){if(d){var p=f.now();if(""===q.id){i(p+": the module anonymous_"+q._idx+" failed to register. "+n+" execute.","warn");return;}"register"===r?i(p+': the module "'+q.id+'" failed to register.',"warn"):i(p+': the module "'+q.id+'" failed to require.',"warn");}}};m.define=g;m.register=k;m.version="0.2.1";b.hexjs=m;})(jQuery,this);
