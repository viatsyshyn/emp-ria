/** @namespace ria.__API */
ria = ria || {};
ria.__API = ria.__API || {};

(function () {
    "use strict";

    ria.__API.Exception = (function () {
        function Exception() { ria.__API.init(this, Exception, Exception.prototype.$, arguments); }
        ria.__API.clazz(Exception, 'Exception', null, [], []);

        Exception.prototype.$ = function (msg, inner_) {
            //#ifdef DEBUG
            ria.__API.checkArg('msg', String, msg);
            ria.__API.checkArg('inner_', [Error, Exception], inner_ || null);
            //#endif
            this.msg = Error(msg);
            this.inner_ = inner_;
        };
        ria.__API.ctor(Exception, Exception.prototype.$, [], [], []);

        Exception.prototype.toString = function () {
            var msg = this.msg.stack ? this.msg.stack : this.msg.toString();

            if (this.inner_) {
                msg += '\nCaused by: ';
                if (this.inner_ instanceof Error && this.inner_.stack) {
                    msg += this.inner_.stack;
                } else {
                    msg += this.inner_.toString();
                }
            }

            return msg;
        };
        ria.__API.method(Exception, Exception.prototype.toString, 'toString', Function, [], [], []);

        ria.__API.compile(Exception);
        return Exception;
    })
})();