/**
 * @license RequireJS Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */

/*jslint nomen: false, strict: false */
/*global define: false */

Logger = (function (print) {
    var logger = {
        TRACE: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        level: 0,
        logPrefix: "",

        trace: function (message) {
            if (this.level <= this.TRACE) {
                this._print('TRACE: ', [].slice.call(arguments).join(''));
            }
        },

        info: function (message) {
            if (this.level <= this.INFO) {
                this._print('INFO: ', [].slice.call(arguments).join(''));
            }
        },

        warn: function (message) {
            if (this.level <= this.WARN) {
                this._print('WARN: ', [].slice.call(arguments).join(''));
            }
        },

        error: function (message) {
            if (this.level <= this.ERROR) {
                this._print('ERROR: ', [].slice.call(arguments).join(''));
            }
        },

        _print: function (message) {
            this._sysPrint((this.logPrefix ? (this.logPrefix + ' ') : ""), [].slice.call(arguments).join(''));
        },

        _sysPrint: function (message) {
            print([].slice.call(arguments).join(''));
        }
    };

    return logger;
})(Env.print);
