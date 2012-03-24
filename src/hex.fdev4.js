/**
 * HexJS, a page-level module manager
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version v0.4
 * @build   120323
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT License
 * 
 * @base    fdev-v4, http://static.c.aliimg.com/js/lib/fdev-v4/core/fdev-min.js
 * */

(function( $, global ){
    
    "use strict";
    
    var hexjs = {},
        modules = {},
        anonymousModules = [],
        isDebug = global.location.search.indexOf('hexjs.debug=true') > -1,
        
    isFunction = $.isFunction,
    isArray = $.isArray,
    each = $.each;


    /**
     * output message
     * @param {string} message
     * @param {string} message type
     * */
    var log = isDebug ? ( 
                !!global.console && global.console.warn ? 
                function( message, type ){
                    type = type || 'info';
                    global.console[type]( message );
                } :
                function( message, type ){
                    $.use( 'util-debug', function(){
                        $.log( message );
                    } );
                } ) : function(){};
    
    
    /**
     * module constructor
     * @param {string} module id
     * @param {object} module factory
     * */
    var Module = function( id, factory ){
        
        this.id = id;
        this.factory = factory;
        this.exports = {};
        this.once = false;
        
    };
    
    
    /**
     * define module
     * @param {string} module id
     * @param {object|function} module factory
     * */
    var define = function( id, factory ){
        
        var module,
            anonymousLength;
        
        if ( 'string' !== typeof id ){
            factory = id;
            id = '';
        }
        
        // if id already exists, return
        if ( modules[id] ){
            log( $.now() + ': the module "' + id + '" already exists. ', 'warn' );
            return null;
        }
        
        if ( isFunction( factory ) ){
            factory = { init: factory };
        }
        
        module = new Module( id, factory );
        
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
                //args.callee( item );
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
        
        if ( !module || !(module instanceof Module) ){
            module = modules[id];
        }
        
        if ( !module ){
            id !== '' && log( $.now() + ': the module "' + id + '" does not exist. ', 'warn' );
            return null;
        }
        
        if ( module.once ){
            id !== '' && log( $.now() + ': the module "' + id + '" already registered. ', 'warn' );
            return null;
        }
        
        module.once = true;
        
        isReady ?
            $(function(){
                execute( module, 'register', 'after ready' );
            }) :
            execute( module, 'register', 'now' );
        
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
        
        try {
            if ( isFunction( module.factory.init ) ){
                var exports = module.factory.init( Require(), module.exports, module );
                if ( exports !== undefined ){
                    module.exports = exports;
                }
            } else if ( module.factory !== undefined ) {
                module.exports = module.factory;
            }
            
            if ( isDebug ){
                var now = $.now();
                if ( '' === module.id ){
                    log( now + ': the module anonymous_' + module._idx + ' registered. ' + status + ' execute.' );
                    return;
                }
                
                'register' === type ?
                    log( now + ': the module "' + module.id + '" registered. ' + status + ' execute.' ) :
                    log( now + ': the module "' + module.id + '" required.' );
            }
            
        } catch(e) {
            
            if ( isDebug ){
                var now = $.now();
                if ( '' === module.id ){
                    log( now + ': the module anonymous_' + module._idx + ' failed to register. The message: "' + e.message + '".', 'warn' );
                    return;
                }
                
                'register' === type ?
                    log( now + ': the module "' + module.id + '" failed to register. The message: "' + e.message + '".', 'warn' ) :
                    log( now + ': the module "' + module.id + '" failed to require. The message: "' + e.message + '".', 'warn' );
            }
            
        }
        
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
    
    
    hexjs.define = define;
    hexjs.register = register;
    hexjs.log = log;
    hexjs.noConflict = noConflict;
    hexjs.version = '0.4';
    
    global.hexjs = hexjs;
    
})( jQuery, this );
