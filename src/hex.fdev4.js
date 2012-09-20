/**
 * HexJS, a page-level module manager
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version v0.8
 * @build   120920
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT License
 * 
 * @base    fdev-v4, http://style.china.alibaba.com/fdevlib/js/fdev-v4/core/fdev-min.js
 * */

(function( $, global ){
    
    'use strict';
    
    var hexjs = {},
        modules = {},
        anonymousModules = [],
        isDebug = false,
        logSource = 'HexJS',
        logLevel = 'none',
        catchError = null,
        
    isFunction = $.isFunction,
    isArray = $.isArray,
    each = $.each,
    now = $.now,
    noop = function(){};


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
                $.use( 'util-debug', function(){
                    $.log( message );
                } );
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
            isReady;
        
        if ( isArray( id ) ){
            each( id, function( i, item ){
                _register.call( null, item );
            } );
            return;
        }
        
        ids =  id.indexOf('~') === 0 ? id.split('~') : [id];
        
        if ( ids.length === 1 ){
            id = ids[0];
            isReady = true;
        } else {
            id = ids[1];
        }
        
        if ( !module || !(module instanceof Module) ){
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
        
        isReady ?
            $(function(){
                execute( module, 'register' );
            }) :
            execute( module, 'register' );
        
    };
    
    
    var register = function( id ){
        
        _register.call( null, id );
        
    };
    
    /**
     * fn constructor
     * @param {int} anonymous module idx
     * */
    var Anonymous = function( idx ){
        
        this.idx = idx;
        
    };
    
    
    Anonymous.prototype.register = function( isReady ){
        
        var id = isReady === '~' ? '~' : '';
        
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
     * @param {string} execute status
     * */
    var execute = function( module, type, status ){
        var message = '';
        
        try {
            if ( isFunction( module.factory.init ) ){
                var list = dependencies( module ),
                    exports = module.factory.init.apply( module.factory, list );
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
            
            if ( logLevel !== 'none' ){
                message = '' === module.id ?
                    'the module anonymous_' + module._idx + ' failed to register.':
                    'the module "' + module.id + '" failed to ' + ( 'register' === type ? 'register' : 'initialize' ) + '.';
                message += ' The message: "' + e.message + '".';
                
                logWarn( message );
            } else {
                catchError && catchError.call( null, e, module );
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
            each( deps, function( i, id ){
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
                break;
        }
        
        return hexjs;
        
    };
    
    
    /**
     * config
     * @param {object} config
     * */
    var config = function(o){
        
        if ( o.logLevel ){
            logLevel = o.logLevel;
            
            switch( logLevel ){
                case 'debug':
                    isDebug = true;
                    log = createLog();
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
        
        if ( isFunction( o.catchError ) ){
            catchError = o.catchError;
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
    hexjs.version = '0.8';
    
    hexjs.sdk = {
        modules: modules,
        _anonymous: anonymousModules
    };
    
    global.hexjs = hexjs;
    
})( jQuery, this );
