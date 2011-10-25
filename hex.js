/**
 * HexJS, a page-level module manager
 * @author  Edgar Hoo , edgarhoo@gmail.com
 * @version v0.2
 * @build   111025
 * @uri     http://hexjs.edgarhoo.org/
 * @license MIT License
 * */

!!this.hexjs || (function( global, doc ){
    
    var _ = {},
        _hexjs = {},
        _modules = {},
        _anonymousModules = [],
        _isDebug = global.location.search.indexOf('hexjs.debug=true') > -1;
    
    _.toString = Object.prototype.toString;
    
    _.now = Date.now || function(){
        
        return new Date().getTime();
        
    };
    
    _.isFunction = function( obj ){
        
        return _.toString.call( obj ) === '[object Function]';
        //return !!( obj && obj.constructor && obj.call && obj.apply );
        
    };
    
    _.isArray = Array.isArray || function( obj ){
        
        return _.toString.call( obj ) === '[object Array]';
        
    };
    
    _.forEach = Array.prototype.forEach ?
        function( arr, fn ){
            
            arr.forEach( fn );
            
        } :
        function( arr, fn ){
            
            for ( var i = 0, l = arr.length; i < l; i++ ){
                fn( arr[i] );
            }
            
        };
    
    _.extend = function( target, o ){
        
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
    
    _.isReady = 0,
    _.isBind = 0,
    _.readyList = [],
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
        
        if ( _.isBind ){
            return;
        }
        _.isBind = 1;

        if ( 'complete' === doc.readyState ){
            _.readyInit();
        } else if ( doc.addEventListener ){
            doc.addEventListener( 'DOMContentLoaded', function(){
                doc.removeEventListener( 'DOMContentLoaded', arguments.callee, false );
                _.readyInit();
            }, false );
            
            global.addEventListener( 'onload', _.readyInit, false );
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
            _testEl.doScroll( 'left' );
        } catch(e) {
            setTimeout( _.doScrollCheck, 1 );
            return;
        }
        
        _.readyInit();
        
    };
    
    _.ready = function( fn ){
        
        _.bindReady();
        
        if ( _.isReady ){
            fn();
        } else {
            _.readyList.push( fn );
        }
        
    };
    
    /**
     * Ref.
     * 
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
        
        _.ready(function(){
            var box = doc.createElement('div');
            box.id = 'hexjs-debug';
            box.style.margin = '10px 0';
            box.style.border = '1px dashed red';
            box.style.padding = '4px 8px';
            box.style.fontSize = '14px';
            box.style.lineHeight = '1.5';
            doc.body.appendChild( box );
            _.messageBox = doc.createElement('ol');
            _.messageBox.style.listStyleType = 'decimal';
            box.appendChild( _.messageBox );
            _.forEach( _.messageList, function( item ){
                _.createMessage( item );
            } );
        });
        _.prepared = true;
    };
    _.console = function( message, type ){
        
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
    _.log = function( message, type ){
        
        if ( !!global.console ){
            _.log = function( message, type ){
                global.console[type]( message );
            };
        } else {
            _.log = function( message, type ){
                _.console( message, type );
            };
        }
        
        _.log( message, type );
        
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
            _isDebug && _.log( _.now() + ': the module "' + id + '" already exists. ', 'warn' );
            return null;
        }
        
        if ( _.isFunction( fn ) ){
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
        
        if ( _.isArray( id ) ){
            _.forEach( id, function( item ){
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
            _.ready(function(){
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
            
            _.extend( module.exports, exports );
            
            if ( '' === module.id ){
                _isDebug && _.log( _.now() + ': the module anonymous_' + module._idx + ' registered. ' + status + ' execute.', 'info' );
                return;
            }
            
            _isDebug &&
                'register' === type ?
                    _.log( _.now() + ': the module "' + module.id + '" registered. ' + status + ' execute.', 'info' ) :
                    _.log( _.now() + ': the module "' + module.id + '" required.', 'info' );
        } catch(e) {
            
            if ( '' === module.id ){
                _isDebug && _.log( _.now() + ': the module anonymous_' + module._idx + ' failed to register. ' + status + ' execute.', 'warn' );
                return;
            }
            
            _isDebug &&
                'register' === type ?
                    _.log( _.now() + ': the module "' + module.id + '" failed to register.', 'warn' ) :
                    _.log( _.now() + ': the module "' + module.id + '" failed to require.', 'warn' );
        }
        
    };
    
    
    _hexjs.define = define;
    _hexjs.register = register;
    
    global.hexjs = _hexjs;
    
})( this, document );
