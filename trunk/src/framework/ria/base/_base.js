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
            checkReady();
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

    function checkReady() {
        if (isPageReady && (!ria.__API._loader || ria.__API._loader.isReady)) {
            while(readyCallbacks.length > 0)
                readyCallbacks.shift().call(global);
        }
    }

    function ready(callback) {
        readyCallbacks.push(callback);
        checkReady();
    }

    Object.defineProperties(ria, {
        /** @class ria.__API */
        __API: { value: {}, writable: false, configurable: false, enumerable: false },

        /** @class ria.global */
        global : { value: global, writable: false, configurable: false, enumerable: false },

        /** @class ria.__EMPTY */
        __EMPTY: { value: function () {}, writable: false, configurable: false, enumerable: false },

        /** @class ria.isBrowser */
        isBrowser: { value: isBrowser, writable: false, configurable: false, enumerable: false },

        /** @class ria.isWebWorker */
        isWebWorker: { value: isWorker, writable: false, configurable: false, enumerable: false },

        /** @class ria.BASE_MODULE_URL */
        BASE_MODULE_URL: { value: BASE_MODULE_URL, writable: true, configurable: false, enumerable: false },

        /** @class ria.ready */
        ready: { value: ready, writable: false, configurable: false, enumerable: false }
    });

})(ria, window || this || {});