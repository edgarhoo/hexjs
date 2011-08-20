/**
 * @fileview HexJS test
 * @author Edgar
 * @build 110814
 * */
 
/**
 * @module hexjs-test
 * */

hexjs.define( 'hexjs-test', function( require, exports, module ){
    
    var $result = jQuery('#test-result');
    
    var createItem = function( inner, color ){
        return jQuery('<li style="color:'+color+'"/>').html(inner).appendTo($result);
    };
    
    exports.print = function( msg, fn ){
        if ( !!msg ){
            createItem( fn + ' pass.', 'green' );
        } else {
            createItem( fn + ' fail.', 'red' );
        }
    };
    
} );


/**
 * @module register-ready
 * */
hexjs.define( 'register-ready', function( require, exports, module ){
    require('hexjs-test').print( true, 'register-ready' );
} );


/**
 * @module register-now
 * */
hexjs.define( 'register-now', function( require, exports, module ){
    exports.isNow = !jQuery('#test-result').length;
} );


/**
 * @module register-multi
 * */
hexjs.define( 'register-multi-a', function( require, exports, module ){
    require('hexjs-test').print( true, 'register-multi-a' );
} );
hexjs.define( 'register-multi-b', function( require, exports, module ){
    require('hexjs-test').print( true, 'register-multi-b' );
} );
hexjs.define( 'register-multi-c', function( require, exports, module ){
    console.info('register-multi-b pass.');
} );


/**
 * @module require
 * */
hexjs.define( 'require', function( require, exports, module ){
    return require('hexjs-test')
} );

/**
 * @module require-refresh
 * */
hexjs.define( 'require-refresh-pre', function( require, exports, module ){
    var variable = 1;
    exports.plus = function(){
        variable++;
        return variable;
    };
} );
hexjs.define( 'require-refresh', function( require, exports, module ){
    exports.variable = require('require-refresh-pre').plus();
} );

/**
 * @module exports
 * */
hexjs.define( 'exports', function( require, exports, module ){
    exports.variable = 'exports';
} );


/**
 * @module return
 * */
hexjs.define( 'return', function( require, exports, module ){
    return {
        variable: 'return'
    }
} );


/**
 * @module return-cover-exports
 * */
hexjs.define( 'return-cover-exports', function( require, exports, module ){
    exports.variable = 'exports';
    return {
        variable: 'return-cover-exports'
    }
} );


/**
 * @module module-exports
 * */
hexjs.define( 'module-exports', function( require, exports, module ){
    module.exports =  {
        variable: 'module-exports'
    }
} );


/**
 * @module incoming-object
 * */
hexjs.define( 'incoming-object', {
    init: function( require, exports, module ){
        exports.variable = this._variable;
    },
    _variable: 'incoming-object'
    
} );


/**
 * @module module-id
 * */
hexjs.define( 'module-id', function( require, exports, module ){
    exports.id = module.id;
} );


/**
 * @module module-constructor
 * */
hexjs.define( 'module-constructor', function( require, exports, module ){
    var M = module.constructor;
    
    M.prototype.getId = function(){
        return module.id;
    };
} );


