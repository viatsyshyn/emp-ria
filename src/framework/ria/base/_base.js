/**
 * base module
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@emp-game.com
 * @date 03.05.11
 * @fileoverview base module
 */

/** @namespace ria */
var ria = window.ria || {};

//noinspection ThisExpressionReferencesGlobalObjectJS
(function (ria, global) {
    "use strict";

    var isBrowser = !!(typeof window !== "undefined" && navigator && document),
        isWorker = !isBrowser && typeof importScripts !== "undefined",
        BASE_MODULE_URL = '',
        isPageReady = !isBrowser,
        readyCallbacks = [];

    if (isBrowser) {
        var current = location.toString();
        for(var i = current.length; i > 0; i--) {
            if (current.charAt(i - 1) == '/') {
                BASE_MODULE_URL = current.substr(0, i);
                break;
            }
        }
    }

    /* THE FOLLOWING CODE BLOCK IS PORTED FROM jQuery 1.5.1 */
    isBrowser && (function () {
        function onLoaded() {
            isPageReady = true;
            ready();
        }

        // Cleanup functions for the document ready method
        var DOMContentLoaded;
        if ( document.addEventListener ) {
            DOMContentLoaded = function() {
                document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                onLoaded();
            };

        } else if ( document.attachEvent ) {
            DOMContentLoaded = function() {
                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if ( document.readyState === "complete" ) {
                    document.detachEvent( "onreadystatechange", DOMContentLoaded );
                    onLoaded();
                }
            };
        }

        // Catch cases where $(document).ready() is called after the
        // browser event has already occurred.
        if ( document.readyState === "complete" ) {
            // Handle it asynchronously to allow scripts the opportunity to delay ready
            return setTimeout(onLoaded, 1);
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if ( document.addEventListener ) {
            // Use the handy event callback
            document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

            // A fallback to window.onload, that will always work
            window.addEventListener( "load", onLoaded, false );

            // If IE event model is used
        } else if ( document.attachEvent ) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            document.attachEvent("onreadystatechange", DOMContentLoaded);

            // A fallback to window.onload, that will always work
            window.attachEvent( "onload", onLoaded );
        }
    })();
    /* END OF PORTED BLOCK */

    function ready(callback$) {
        if (typeof callback$ === 'function') readyCallbacks.push(callback$);

        while(readyCallbacks.length > 0 && isPageReady && (!ria.__API._loader || ria.__API._loader.isReady))
            readyCallbacks.pop().call(global);
    }

    function defineConst(obj, key$, props) {
        if (props !== undefined) {
            Object.defineProperty(obj, key$, { value: props, writable: false, configurable: false, enumerable: false });
            return
        }

        for(var key in key$) if (key$.hasOwnProperty(key))
            defineConst(obj, key, key$[key]);
    }

    function defineMutable(obj, key$, props) {
        if (props !== undefined) {
            Object.defineProperty(obj, key$, { value: props, writable: true, configurable: false, enumerable: false });
            return
        }

        for(var key in key$) if (key$.hasOwnProperty(key))
            defineMutable(obj, key, key$[key]);
    }

    defineConst(ria, {
        /** @class ria.__API */
        __API: {},
        /** @class ria.global */
        global: global,
        /** @class ria.__EMPTY */
        __EMPTY: function () {},
        /** @class ria.isBrowser */
        isBrowser: isBrowser,
        /** @class ria.isWebWorker */
        isWebWorker: isWorker,
        /** @class ria.ready */
        ready: ready,
        /** @class ria.defineConst */
        defineConst: defineConst,
        /** @class ria.defineMutable */
        defineMutable: defineMutable,
        /** @class ria.inheritFrom */
        inheritFrom: function (superClass) {
            function InheritanceProxyClass() {}
            InheritanceProxyClass.prototype = superClass.prototype;
            return new InheritanceProxyClass();
        },
        /** @class ria.extend */
        extend: function (subClass, superClass) {
            subClass.prototype = ria.inheritFrom(superClass);
            subClass.prototype.constructor = subClass;
        }
    });

    defineMutable(ria, {
        /** @class ria.BASE_MODULE_URL */
        BASE_MODULE_URL: BASE_MODULE_URL
    });

})(ria, window || this || {});