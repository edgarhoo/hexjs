/**
 * HexJS
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version alpha
 * @build   110812
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT
 * 
 * @base    fdev-v4, http://static.c.aliimg.com/js/lib/fdev-v4/core/fdev-min.js
 * */

(function( $, global ){
    
    var _hexjs = {},
        _modules = {},
        _anonymousModules = [],
        _isLog = !!$.log;
    
    
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
        
        if ( 'string' !== typeof id ){
            fn = id;
            id = '';
        }
        
        // if id already exists, return
        if ( _modules[id] ){
            _isLog && $.log( $.now() + ': the module ' + id + ' already exists. ' );
            return;
        }
        
        if ( $.isFunction(fn) ){
            fn = { init: fn };
        }
        
        var module = new _Module( id, fn );
        
        if ( id !== '' ){
            _modules[id] = module;
        } else {
            _anonymousModules[_anonymousModules.length] = module;
            return new _Fn( _anonymousModules.length - 1 );
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
        
        if ( module.once ){
            return;
        }
        
        module.once = true;
        
        isReady ? $(document).ready(function(){ _execution( module, 'ready' ); }) : _execution( module, 'now' );
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
     * execution module
     * @param {object} module
     * @param {string} running status
     * */
    var _execution = function( module, status ){
        try {
            module.fn.init( _require );
            if ( module.id === '' ){
                _isLog && $.log( $.now() + ': the module anonymous registered. ' + status + ' execution.' );
                return;
            }
            _isLog && $.log( $.now() + ': the module ' + module.id + ' registered. ' + status + ' execution.' );
        } catch(e) {
            _isLog && $.log( $.now() + ': warn the module ' + module.id + ' failed to register.' );
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
            _isLog && $.log( $.now() + ': the module ' + module.id + ' required.' );
        } catch(e) {
            _isLog && $.log( $.now() + ': warn: the module ' + module.id + ' failed to require.' );
        }
    };
    
    
    _hexjs.define = define;
    _hexjs.register = register;
    
    global.hexjs = _hexjs;
    
})( jQuery, this );
