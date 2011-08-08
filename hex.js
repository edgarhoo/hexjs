/**
 * HexJS
 * @author  edgarhoo@gmail.com, Edgar Hoo
 * @version alpha
 * @build   110808
 * */

this.hexjs = {};
(function( $, hexjs ){
    
    var _modules = {},
        _fn = {},
        _anonymousModule = null;
    
    /**
     * define module
     * @param {string} module name
     * @param {object|function} module content, function 'init' must exist
     * */
    var define = function( name, fn ){
        
        if ( 'string' !== typeof name ){
            fn = name;
            name = '';
        }
        
        // if name already exists, return
        if ( _modules[name] ){
            $.log( 'the module ' + name + ' already exists. ' );
            return;
        }
        
        if ( $.isFunction(fn) ){
            fn = { init: fn };
        }
        
        var module = {
            name: name,
            fn: fn,
            exports: {},
            once: false
        };
        
        if ( name !== '' ){
            _modules[name] = module;
        } else {
            _anonymousModule = module;
            return _fn;
        }
        
    };
    
    
    /**
     * register module
     * @param {string} module name
     * */
    var register = function( name ){
        
        var args = arguments,
            names,
            module,
            isReady;
        
        if ( $.isArray( name ) ){
            $.each( name, function( i, item ){
                args.callee( item );
            } );
            return;
        }
        
        names = name.split('~');
        
        if ( names.length === 1 ){
            name = names[0];
            isReady = true;
        } else {
            name = names[1];
        }
        
        module = _anonymousModule ? _anonymousModule : _modules[name];
        
        if ( !module || module.once ){
            return;
        }
        
        module.once = true;
        
        isReady ? $(document).ready(function(){ _run( module, 'ready' ); }) : _run( module, 'now' );
    };
    
    
    _fn.register = function( isReady ){
            var name = isReady === '~' ? '~' : '';
            register( name );
    };
    
    
    /**
     * require module
     * @param {string} module name
     * */
    var _require = function( name ){
        
        var module = _modules[name];
        if ( !module ){
            return;
        }
        if ( !module.once ){
            module.once = true;
            _exports( module );
        }
        return module.exports;
    }
    
    
    /**
     * run module
     * @param {object} module
     * @param {string} running status
     * */
    var _run = function( module, time ){
        try {
            module.fn.init( _require );
            if ( module.name === '' ){
                $.log( 'the anonymous module registered. ' + time + ' run.' );
                return;
            }
            $.log( 'the module ' + module.name + ' registered. ' + time + ' run.' );
        } catch(e) {
            $.log( 'warn the module ' + module.name + ' failed to register.' );
        }
    }
    
    
    /**
     * module exports
     * @param {object} module
     * */
    var _exports = function( module ){
        try {
            var exports = module.fn.init( _require, module.exports );
            module.exports = $.extend( module.exports, exports );
            $.log( 'the module ' + module.name + ' required.' );
        } catch(e) {
            $.log( 'warn: the module ' + module.name + ' failed to require.' );
        }
    }
    
    
    hexjs.define = define;
    hexjs.register = register;
    
})( jQuery, hexjs );
