/**
 * HexJS, a page-level module manager
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version v0.3.1
 * @build   120309
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT License
 * 
 * @base    fdev-v4, http://static.c.aliimg.com/js/lib/fdev-v4/core/fdev-min.js
 * */

(function( $, global ){
    
    var _ = {},
        
        _hexjs = {},
        _modules = {},
        _anonymousModules = [],
        _isDebug = global.location.search.indexOf('hexjs.debug=true') > -1;
        

    _._hexjs = global.hexjs;
    _._define = global.define;
    _._register = global.register;


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
                $.use( 'util-debug', function(){
                    $.log( message );
                } );
            };
        }
        
        _log( message, type );
        
    };
    
    
    /**
     * module constructor
     * @param {string} module id
     * @param {object} module factory
     * */
    var _Module = function( id, factory ){
        
        this.id = id;
        this.factory = factory;
        this.exports = {};
        this.clone = function(){};
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
        if ( _modules[id] ){
            _isDebug && _log( $.now() + ': the module "' + id + '" already exists. ', 'warn' );
            return null;
        }
        
        if ( $.isFunction( factory ) ){
            factory = { init: factory };
        }
        
        module = new _Module( id, factory );
        
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
    var _register = function( id, module ){
        
        var args = arguments,
            ids,
            isReady;
        
        if ( $.isArray( id ) ){
            $.each( id, function( i, item ){
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
        
        if ( !module || !(module instanceof _Module) ){
            module = _modules[id];
        }
        
        if ( !module || module.once ){
            _isDebug && id !== '' && _log( $.now() + ': the module "' + id + '" already registered. ', 'warn' );
            return null;
        }
        
        module.once = true;
        
        isReady ?
            $(function(){
                _execute( module, 'register', 'after ready' );
            }) :
            _execute( module, 'register', 'now' );
        
    };
    
    
    var register = function( id ){
        
        _register.call( null, id );
        
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
        
        _register.call( null, id, _anonymousModules[this.idx] );
        
    };
    
    
    /**
     * require module
     * @param {string} module id
     * @param {boolean} refresh or no
     * */
    var __require = function( id, refresh ){
        
        var module = _modules[id];
        
        if ( !module ){
            return;
        }

        if ( !module.once || refresh ){
            module.once = true;
            _execute( module, 'require' );
        }
        
        return new module.clone();
    };
    
    
    var _Require = function(){
        
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
    var _execute = function( module, type, status ){
        
        try {
            if ( $.isFunction( module.factory.init ) ){
                var exports = module.factory.init( _Require(), module.exports, module );
                exports === undefined || $.extend( module.exports, exports );
            } else if ( module.factory !== undefined ) {
                module.exports = module.factory;
            }
            
            module.clone.prototype = module.exports;
            
            if ( _isDebug ){
                var now = $.now();
                if ( '' === module.id ){
                    _log( now + ': the module anonymous_' + module._idx + ' registered. ' + status + ' execute.', 'info' );
                    return;
                }
                
                'register' === type ?
                    _log( now + ': the module "' + module.id + '" registered. ' + status + ' execute.', 'info' ) :
                    _log( now + ': the module "' + module.id + '" required.', 'info' );
            }
            
        } catch(e) {
            
            if ( _isDebug ){
                var now = $.now();
                if ( '' === module.id ){
                    _log( now + ': the module anonymous_' + module._idx + ' failed to register. The message: "' + e.message + '".', 'warn' );
                    return;
                }
                
                'register' === type ?
                    _log( now + ': the module "' + module.id + '" failed to register. The message: "' + e.message + '".', 'warn' ) :
                    _log( now + ': the module "' + module.id + '" failed to require. The message: "' + e.message + '".', 'warn' );
            }
            
        }
        
    };
    
    
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
    _hexjs.version = '0.3.1';
    
    global.hexjs = _hexjs;
    
})( jQuery, this );
