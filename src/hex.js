/**
 * HexJS, a page-level module manager
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version v0.7
 * @build   120815
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT License
 * */

(function( global, doc ){
    
    'use strict';
    
    var hexjs = {},
        modules = {},
        anonymousModules = [],
        isDebug = false,
        logSource = 'HexJS',
        //isDebug = global.location.search.indexOf('hexjs.debug=true') > -1,
    
    toString = {}.toString,
    
    now = Date.now || function(){
        
        return new Date().getTime();
        
    },
    
    isFunction = function( obj ){
        
        return toString.call( obj ) === '[object Function]';
        //return !!( obj && obj.constructor && obj.call && obj.apply );
        
    },
    
    isArray = Array.isArray || function( obj ){
        
        return toString.call( obj ) === '[object Array]';
        
    },
    
    forEach = Array.prototype.forEach ?
        function( arr, fn ){
            
            arr.forEach( fn );
            
        } :
        function( arr, fn ){
            
            for ( var i = 0, l = arr.length; i < l; i++ ){
                fn( arr[i] );
            }
            
        },
    
    noop = function(){},
    
    /**
     * Ref:
     * https://github.com/jquery/jquery/blob/master/src/core.js
     * https://github.com/ded/domready/blob/master/ready.js
     * https://github.com/Cu7l4ss/DomReady-script/blob/master/DomReady.js
     * https://github.com/jakobmattsson/onDomReady/blob/master/ondomready.js
     * https://github.com/blank/domready/blob/master/domready.js
     * https://github.com/jrburke/requirejs/blob/master/domReady.js
     * */
    _isReady = 0,
    
    _isBind = 0,
    
    _readyList = [],
    
    _testEl = doc.documentElement,
    
    _readyInit = function(){
        
        _isReady = 1;

        if ( !doc.body ){
            setTimeout( arguments.callee, 10 );
            return;
        }
        
        for ( var i = 0, l = _readyList.length; i < l; i++ ){
            _readyList[i]();
        }
        
        _readyList = [];
    },
    
    _bindReady = function(){
        
        if ( 'complete' === doc.readyState ){
            _readyInit();
        } else if ( doc.addEventListener ){
            
            var remove = function(){
                doc.removeEventListener( 'DOMContentLoaded', remove, false );
                _readyInit();
            };
            
            doc.addEventListener( 'DOMContentLoaded', remove, false );
            
            global.addEventListener( 'load', _readyInit, false );
        } else if( doc.attachEvent ){
            
            var detach = function(){
                if ( 'complete' === doc.readyState ) {
                    doc.detachEvent( 'onreadystatechange', detach );
                    _readyInit();
                }
            };
            
            // In IE, ensure firing before onload, maybe late but safe also for iframes.
            doc.attachEvent( 'onreadystatechange', detach );
            
            global.attachEvent( 'onload', _readyInit );

            // If IE and not a frame, continually check to see if the doc is ready.
			if ( _testEl.doScroll && global == global.top ) {
				_doScrollCheck();
			}
        }
    },
    
    _doScrollCheck = function(){
        
        if ( _isReady ){
            return;
        }
        
        try {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            _testEl.doScroll( 'left' );
        } catch(e) {
            setTimeout( _doScrollCheck, 1 );
            return;
        }
        
        _readyInit();
        
    },
    
    ready = function( fn ){
        
        _readyList.push( fn );
        
        if ( _isReady ){
            fn();
        } else if ( !_isBind ){
            _isBind = 1;
            _bindReady();
        }
        
    },
    
    
    /**
     * Ref:
     * http://jquery.glyphix.com/jquery.debug/jquery.debug.js
     * */
    _messageList = [],
    
    _messageBox = null,
    
    _prepared = false,
    
    _createMessage = function( item ){
        var li = doc.createElement('li');
        'warn' === item.type ? li.style.color = 'red' : li.style.color = '#000';
        li.innerHTML = item.message;
        _messageBox.appendChild( li );
    },
    
    _messagePrepare = function(){
        
        ready(function(){
            var box = doc.createElement('div');
            box.id = 'hexjs-debug';
            box.style.margin = '10px 0';
            box.style.border = '1px dashed red';
            box.style.padding = '4px 8px';
            box.style.fontSize = '14px';
            box.style.lineHeight = '1.5';
            box.style.textAlign = 'left';
            doc.body.appendChild( box );
            _messageBox = doc.createElement('ol');
            _messageBox.style.listStyleType = 'decimal';
            box.appendChild( _messageBox );
            forEach( _messageList, function( item ){
                _createMessage( item );
            } );
        });
        
        _prepared = true;
    },
    
    _console = function( message, type ){
        
        var item = {
            'message': message,
            'type': type
        };
        
        !_prepared && _messagePrepare();
        _messageBox ?
            _createMessage( item ) :
            _messageList.push( item );
        
    };
    
    
    /**
     * log
     * */
    var log = noop,
    
    logInfo = function( message, type ){
        message = ( logSource ? '[' + logSource + ']: ' : '' ) + now() + ': ' + message;
        log( message, type || 'info' );
    },
    
    logWarn = function( message ){
        logInfo( message, 'warn' );
    };
    
    
    /**
     * create log
     * */
    var createLog = function(){
        return !!global.console && global.console.warn ? 
            function( message, type ){
                type = type || 'info';
                global.console[type]( message );
            } :
            function( message, type ){
                tpye = type || 'info';
                _console( message, type );
            };
    };
    
    
    /**
     * module constructor
     * @param {string} module id
     * @param {array} module's dependencies
     * @param {object} module factory
     * */
    var Module = function( id, deps, factory ){
        
        this.id = id;
        this.deps = deps || [];
        this.factory = factory;
        this.exports = {};
        this.once = false;
        this.visits = 0;
        
    };
    
    
    /**
     * define module
     * @param {string} module id
     * @param {array} module's dependencies
     * @param {object|function} module factory
     * */
    var define = function( id, deps, factory ){
        
        var module,
            anonymousLength,
            argsLength = arguments.length;
        
        if ( argsLength === 1 ){
            factory = id;
            id = '';
        } else if ( argsLength === 2 ){
            factory = deps;
            deps = [];
            if ( 'string' !== typeof id ){
                deps = id;
                id = '';
            }
        }
        
        //if ( !factory ){
        //    if ( deps ){
        //        factory = deps;
        //    } else {
        //        factory = id;
        //        id = '';
        //    }
            
        //    if ( 'string' !== typeof id ){
        //        deps = id;
        //        id = '';
        //    } else {
        //        deps = [];
        //    }
        //}
        
        // if id already exists, return
        if ( modules[id] ){
            isDebug && logWarn( 'the module "' + id + '" already exists.' );
            return null;
        }
        
        if ( isFunction( factory ) ){
            factory = { init: factory };
        }
        
        module = new Module( id, deps, factory );
        
        if ( id !== '' ){
            modules[id] = module;
        } else {
            anonymousLength = anonymousModules.length;
            module._idx = anonymousLength;
            anonymousModules[anonymousLength] = module;
            return new Anonymous( anonymousLength );
        }
        
    };
    
    
    /**
     * register module
     * @param {string} module id
     * @param {object} module
     * */
    var _register = function( id, module ){
        
        var args = arguments,
            ids,
            isAfterReady;
        
        if ( isArray( id ) ){
            forEach( id, function( item ){
                _register.call( null, item );
                //args.callee( item );
            } );
            return;
        }
        
        ids =  id.indexOf('~') === 0 ? id.split('~') : [id];
        
        if ( ids.length === 1 ){
            id = ids[0];
            isAfterReady = true;
        } else {
            id = ids[1];
        }
        
        if ( !module || !( module instanceof Module ) ){
            module = modules[id];
        }
        
        if ( !module ){
            isDebug && id !== '' && logWarn( 'the module "' + id + '" does not exist.' );
            return null;
        }
        
        if ( module.once ){
            isDebug && id !== '' && logWarn( 'the module "' + id + '" already registered.' );
            return null;
        }
        
        module.once = true;
        
        isAfterReady ?
            ready(function(){
                execute( module, 'register' );
            }) :
            execute( module, 'register' );
        
    };
    
    
    var register = function( id ){
        
        _register.call( null, id );
        
    };
    
    
    /**
     * Anonymous constructor
     * @param {int} anonymous module idx
     * */
    var Anonymous = function( idx ){
        
        this.idx = idx;
        
    };
    
    
    Anonymous.prototype.register = function( isAfterReady ){
        
        var id = isAfterReady === '~' ? '~' : '';
        
        _register.call( null, id, anonymousModules[this.idx] );
        
    };
    
    
    /**
     * require module
     * @param {string} module id
     * @param {boolean} refresh or no
     * */
    var __require = function( id, refresh ){
        
        var module = modules[id];
        
        if ( !module ){
            return;
        }
        
        if ( !module.once || refresh ){
            module.once = true;
            execute( module, 'require' );
        }
        
        module.visits++;
        if ( isDebug && module.visits > 1 ){
            logInfo( 'the module "' + module.id + '" required [' + module.visits + '].' );
        }
        
        return module.exports;
        
    };
    
    
    var Require = function(){
        
        function _require( id, refresh ){
            return __require.call( null, id, refresh );
        }
        
        return _require;
        
    };
    
    
    /**
     * execute module
     * @param {object} module
     * @param {string} execute type
     * */
    var execute = function( module, type ){
        var message = '';
        
        try {
            if ( isFunction( module.factory.init ) ){
                var list = dependencies( module ),
                    exports = module.factory.init.apply( module.factory, list );
                //var exports = module.factory.init( Require(), module.exports, module );
                if ( exports !== undefined ){
                    module.exports = exports;
                }
            } else if ( module.factory !== undefined ) {
                module.exports = module.factory;
            }
            
            if ( isDebug ){
                message = '' === module.id ?
                    'the module anonymous_' + module._idx + ' registered.' :
                    'the module "' + module.id + '" ' + ( 'register' === type ? 'registered' : 'initialized' ) + '.';

                logInfo( message );
            }
            
        } catch(e) {
            
            if ( isDebug ){
                message = '' === module.id ?
                    'the module anonymous_' + module._idx + ' failed to register.':
                    'the module "' + module.id + '" failed to ' + ( 'register' === type ? 'register' : 'initialize' ) + '.';
                message += ' The message: "' + e.message + '".';
                
                logWarn( message );
            }
            
        }
        
    };
    
    
    /**
     * get dependencies list
     * @param {object} module
     * */
    var dependencies = function( module ){
        
        var list = [],
            deps = module.deps;
        
        if ( isArray( deps ) ){
            forEach( deps, function( id ){
                var mid;
                
                switch ( id ){
                    case 'require':
                        mid = Require();
                        break;
                    case 'exports':
                        mid = module.exports;
                        break;
                    case 'module':
                        mid = module;
                        break;
                    default:
                        mid = __require.call( null, id );
                        break;
                }
                
                list.push( mid );
            } );
        }
        
        list.push( Require() );
        list.push( module.exports );
        list.push( module );
        
        return list;
    };
    
    
    var __hexjs = global.hexjs,
        __define = global.define,
        __register = global.register;
    
    
    /**
     * no conflict
     * @param {boolean} is no conflict
     * */
    var noConflict = function( deep ){
        
        switch( deep ){
            case true:
                global.define = __define;
                global.register = __register;
                break;
            case false:
                global.define = define;
                global.register = register;
                break;
            case undefined:
            default:
                if ( global.hexjs === hexjs ){
                    global.hexjs = __hexjs;
                }
        }
        
        return hexjs;
        
    };
    
    
    /**
     * config
     * @param {object} config
     * */
    var config = function(o){
        var logLevel = o.logLevel;
        if ( logLevel ){
            //logLevel = ['debug','log'].indexOf(logLevel) > -1 ? logLevel : 'none';
            switch( logLevel ){
                case 'debug':
                    log = createLog();
                    isDebug = true;
                    //hexjs._modules = modules;
                    //hexjs._anonymous = anonymousModules;
                    break;
                case 'log':
                    isDebug = false;
                    log = createLog();
                    break;
                default:
                    isDebug = false;
                    log = noop;
            }
            
            hexjs.log = log;
        }
        
        if ( o.logSource ){
            logSource = o.logSource;
        }
    };
    
    
    config({
        logLevel: function(){
            var search = global.location.search,
                logLevel = 'none';
            if ( search.indexOf('hexjs.debug=true') > -1 ){
                logLevel = 'debug';
            }
            if ( search.indexOf('hexjs.debug=log') > -1 ){
                logLevel = 'log';
            }
            return logLevel;
        }()
    });
    
    
    hexjs.define = define;
    hexjs.register = register;
    hexjs.config = config;
    hexjs.noConflict = noConflict;
    hexjs.version = '0.7';
    
    hexjs.sdk = {
        modules: modules,
        _anonymous: anonymousModules
    };
    
    global.hexjs = hexjs;
    
})( this, document );
