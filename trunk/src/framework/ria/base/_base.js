/**
 * _loader module
 *
 * Uses similar to require.js mechanics, but callbacks are
 * called only if all dependencies' callbacks are successful
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@hellowebapps.com
 * @date 03.05.11
 * @fileoverview _loader module
 */

var hwa = {};

(function () {
    "use strict";

    /** @namespace hwa */
    Object.defineProperties(hwa, {
        __API: {
            value: {},
            writable: false,
            configurable: false,
            enumerable: false
        }
    });

    /**
    * Global scope
    * @class hwa.global
    */
    Object.defineProperties(hwa, {
        global : {
            value: window || {},
            writable: false,
            configurable: false,
            enumerable: false
        }
    });

    Object.defineProperties(hwa, {
        emptyFn: {
            value: function () {},
            writable: false,
            configurable: false,
            enumerable: false
        }
    });
})();