/**
 * HexJS, a page-level module manager
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version alpha
 * @build   111003
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT License
 * 
 * @base    fdev-v4, http://static.c.aliimg.com/js/lib/fdev-v4/core/fdev-min.js
 * */

(function( $, global ){
    
    var _hexjs = {},
        _modules = {},
        _anonymousModules = [],
        _isLog = !!$.util.debug || global.location.search.indexOf('hexjs.debug=true') > -1;
    
    
    /**
     * output message
     * @param {string} message
     * @param {string} message type
     * */
    var _log = function( message, type ){
        
        if ( !!global.console ){
            _log = function( message, type ){
                type = type || 'info';
                global.console[type]( message );
            };
        } else {
            _log = function( message, type ){
                $.log( message );
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
            _isLog && _log( $.now() + ': the module "' + id + '" already exists. ' );
            return null;
        }
        
        if ( $.isFunction(fn) ){
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
            return null;
        }
        
        module.once = true;
        
        isReady ?
            $(document).ready(function(){
                _execute( module, 'after ready' );
            }) :
            _execute( module, 'now' );
        
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
            _exports( module );
        }
        
        return module.exports;
    };
    
    
    /**
     * execute module
     * @param {object} module
     * @param {string} running status
     * */
    var _execute = function( module, status ){
        
        try {
            module.fn.init( _require, module.exports, module );
            
            if ( module.id === '' ){
                _isLog && _log( $.now() + ': the module anonymous_' + module._idx + ' registered. ' + status + ' execute.' );
                return;
            }
            
            _isLog && _log( $.now() + ': the module "' + module.id + '" registered. ' + status + ' execute.' );
        } catch(e) {
            _isLog && _log( $.now() + ': the module "' + module.id + '" failed to register.', 'warn' );
        }
        
    };
    
    
    /**
     * module exports
     * @param {object} module
     * */
    var _exports = function( module ){
        
        try {
            var exports = module.fn.init( _require, module.exports, module );
            
            module.exports = $.extend( module.exports, exports );
            
            _isLog && _log( $.now() + ': the module "' + module.id + '" required.' );
        } catch(e) {
            _isLog && _log( $.now() + ': the module "' + module.id + '" failed to require.', 'warn' );
        }
        
    };
    
    
    _hexjs.define = define;
    _hexjs.register = register;
    
    global.hexjs = _hexjs;
    
})( jQuery, this );
