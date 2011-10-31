/**
 * HexJS, a page-level module manager
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version v0.2
 * @build   111030
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT License
 * */

(function( global, doc ){
    
    var _ = {},
        _lang = {},
        _util = {},
        _hexjs = {},
        _modules = {},
        _anonymousModules = [],
        _isDebug = global.location.search.indexOf('hexjs.debug=true') > -1;
    
    _lang.toString = Object.prototype.toString;
    
    _lang.now = Date.now || function(){
        
        return new Date().getTime();
        
    };
    
    _lang.isFunction = function( obj ){
        
        return _lang.toString.call( obj ) === '[object Function]';
        //return !!( obj && obj.constructor && obj.call && obj.apply );
        
    };
    
    _lang.isArray = Array.isArray || function( obj ){
        
        return _lang.toString.call( obj ) === '[object Array]';
        
    };
    
    _lang.forEach = Array.prototype.forEach ?
        function( arr, fn ){
            
            arr.forEach( fn );
            
        } :
        function( arr, fn ){
            
            for ( var i = 0, l = arr.length; i < l; i++ ){
                fn( arr[i] );
            }
            
        };
    
    _util.extend = function( target, o ){
        
        if ( o === undefined ){
            return;
        }
        
        for ( var name in o ){
            if ( o[name] !== undefined ){
                target[name] = o[name];
            }
        }
        //return target;
        
    };
    
    
    /**
     * Ref:
     * https://github.com/jquery/jquery/blob/master/src/core.js
     * https://github.com/ded/domready/blob/master/ready.js
     * https://github.com/Cu7l4ss/DomReady-script/blob/master/DomReady.js
     * https://github.com/jakobmattsson/onDomReady/blob/master/ondomready.js
     * https://github.com/blank/domready/blob/master/domready.js
     * https://github.com/jrburke/requirejs/blob/master/domReady.js
     * */
    _.isReady = 0;
    
    _.isBind = 0;
    
    _.readyList = [];
    
    _.testEl = doc.documentElement;
    
    _.readyInit = function(){
        
        _.isReady = 1;

        if ( !doc.body ){
            setTimeout( arguments.callee, 10 );
            return;
        }
        
        for ( var i = 0, l = _.readyList.length; i < l; i++ ){
            _.readyList[i]();
        }
        
        _.readyList = [];
    };
    
    _.bindReady = function(){
        
        if ( 'complete' === doc.readyState ){
            _.readyInit();
        } else if ( doc.addEventListener ){
            doc.addEventListener( 'DOMContentLoaded', function(){
                doc.removeEventListener( 'DOMContentLoaded', arguments.callee, false );
                _.readyInit();
            }, false );
            
            global.addEventListener( 'load', _.readyInit, false );
        } else if( doc.attachEvent ){
            // In IE, ensure firing before onload, maybe late but safe also for iframes.
            doc.attachEvent( 'onreadystatechange', function(){
                if ( 'complete' === doc.readyState ) {
                    doc.detachEvent( 'onreadystatechange', arguments.callee );
                    _.readyInit();
                }
            });
            
            global.attachEvent( 'onload', _.readyInit );

            // If IE and not a frame, continually check to see if the doc is ready.
			if ( _.testEl.doScroll && global == global.top ) {
				_.doScrollCheck();
			}
        }
    };
    
    _.doScrollCheck = function(){
        
        if ( _.isReady ){
            return;
        }
        
        try {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            _.testEl.doScroll( 'left' );
        } catch(e) {
            setTimeout( _.doScrollCheck, 1 );
            return;
        }
        
        _.readyInit();
        
    };
    
    _util.ready = function( fn ){
        
        _.readyList.push( fn );
        
        if ( _.isReady ){
            fn();
        } else if ( !_.isBind ){
            _.isBind = 1;
            _.bindReady();
        }
        
    };
    
    /**
     * Ref:
     * http://jquery.glyphix.com/jquery.debug/jquery.debug.js
     * */
    _.messageList = [];
    
    _.messageBox = null;
    
    _.prepared = false;
    
    _.createMessage = function( item ){
        var li = doc.createElement('li');
        'warn' === item.type ? li.style.color = 'red' : li.style.color = '#000';
        li.innerHTML = item.message;
        _.messageBox.appendChild( li );
    };
    
    _.messagePrepare = function(){
        
        _util.ready(function(){
            var box = doc.createElement('div');
            box.id = 'hexjs-debug';
            box.style.margin = '10px 0';
            box.style.border = '1px dashed red';
            box.style.padding = '4px 8px';
            box.style.fontSize = '14px';
            box.style.lineHeight = '1.5';
            box.style.textAlign = 'left';
            doc.body.appendChild( box );
            _.messageBox = doc.createElement('ol');
            _.messageBox.style.listStyleType = 'decimal';
            box.appendChild( _.messageBox );
            _lang.forEach( _.messageList, function( item ){
                _.createMessage( item );
            } );
        });
        
        _.prepared = true;
    };
    
    _util.console = function( message, type ){
        
        var item = {
            'message': message,
            'type': type
        };
        
        !_.prepared && _.messagePrepare();
        _.messageBox ?
            _.createMessage( item ) :
            _.messageList.push( item );
        
    };
    
    /**
     * output message
     * @param {string} message
     * @param {string} message type
     * */
    var _log = function( message, type ){
        
        if ( !!global.console ){
            _log = function( message, type ){
                global.console[type]( message );
            };
        } else {
            _log = function( message, type ){
                _util.console( message, type );
            };
        }
        
        _log( message, type );
        
    };
    
    
    /**
     * module constructor
     * @param {string} module id
     * @param {object} module content
     * */
    var _Module = function( id, fn ){
        
        this.id = id;
        this.fn = fn;
        this.exports = {};
        this.once = false;
        
    };
    
    
    /**
     * define module
     * @param {string} module id
     * @param {object|function} module content, function 'init' must exist
     * */
    var define = function( id, fn ){
        
        var module,
            anonymousLength;
        
        if ( 'string' !== typeof id ){
            fn = id;
            id = '';
        }
        
        // if id already exists, return
        if ( _modules[id] ){
            _isDebug && _log( _lang.now() + ': the module "' + id + '" already exists. ', 'warn' );
            return null;
        }
        
        if ( _lang.isFunction( fn ) ){
            fn = { init: fn };
        }
        
        module = new _Module( id, fn );
        
        if ( id !== '' ){
            _modules[id] = module;
        } else {
            anonymousLength = _anonymousModules.length;
            module._idx = anonymousLength;
            _anonymousModules[anonymousLength] = module;
            return new _Fn( anonymousLength );
        }
        
    };
    
    
    /**
     * register module
     * @param {string} module id
     * @param {object} module
     * */
    var register = function( id, module ){
        
        var args = arguments,
            ids,
            isReady;
        
        if ( _lang.isArray( id ) ){
            _lang.forEach( id, function( item ){
                args.callee( item );
            } );
            return;
        }
        
        ids = id.split('~');
        
        if ( ids.length === 1 ){
            id = ids[0];
            isReady = true;
        } else {
            id = ids[1];
        }
        
        if ( !module || !( module instanceof _Module ) ){
            module = _modules[id];
        }
        
        if ( !module || module.once ){
            return null;
        }
        
        module.once = true;
        
        isReady ?
            _util.ready(function(){
                _execute( module, 'register', 'after ready' );
            }) :
            _execute( module, 'register', 'now' );
        
    };
    
    
    /**
     * fn constructor
     * @param {int} anonymous module idx
     * */
    var _Fn = function( idx ){
        
        this.idx = idx;
        
    };
    
    
    _Fn.prototype.register = function( isReady ){
        
        var id = isReady === '~' ? '~' : '';
        
        register( id, _anonymousModules[this.idx] );
        
    };
    
    
    /**
     * require module
     * @param {string} module id
     * @param {boolean} refresh or no
     * */
    var _require = function( id, refresh ){
        
        var module = _modules[id];
        
        if ( !module ){
            return;
        }

        if ( !module.once || refresh ){
            module.once = true;
            _execute( module, 'require' );
        }
        
        return module.exports;
    };
    
    
    /**
     * execute module
     * @param {object} module
     * @param {string} execute type
     * @param {string} execute status
     * */
    var _execute = function( module, type, status ){
        
        try {
            var exports = module.fn.init( _require, module.exports, module );
            
            _util.extend( module.exports, exports );
            
            if ( _isDebug ){
                if ( '' === module.id ){
                    _log( _lang.now() + ': the module anonymous_' + module._idx + ' registered. ' + status + ' execute.', 'info' );
                    return;
                }
                
                'register' === type ?
                    _log( _lang.now() + ': the module "' + module.id + '" registered. ' + status + ' execute.', 'info' ) :
                    _log( _lang.now() + ': the module "' + module.id + '" required.', 'info' );
            }
            
        } catch(e) {
            
            if ( _isDebug ){
                if ( '' === module.id ){
                    _log( _lang.now() + ': the module anonymous_' + module._idx + ' failed to register. ' + status + ' execute.', 'warn' );
                    return;
                }
                
                'register' === type ?
                    _log( _lang.now() + ': the module "' + module.id + '" failed to register.', 'warn' ) :
                    _log( _lang.now() + ': the module "' + module.id + '" failed to require.', 'warn' );
            }
            
        }
        
    };
    
    _._hexjs = global.hexjs;
    _._define = global.define;
    _._register = global.register;
    
    /**
     * no conflict
     * @param {boolean} is no conflict
     * */
    var noConflict = function( deep ){
        
        switch( deep ){
            case true:
                global.define = _._define;
                global.register = _._register;
                break;
            case false:
                global.define = define;
                global.register = register;
                break;
            case undefined:
            default:
                if ( global.hexjs === _hexjs ){
                    global.hexjs = _._hexjs;
                }
                break;
        }
        
        return _hexjs;
        
    };
    
    _hexjs.define = define;
    _hexjs.register = register;
    _hexjs.noConflict = noConflict;
    _hexjs.version = '0.2';
    
    global.hexjs = _hexjs;
    
})( this, document );
