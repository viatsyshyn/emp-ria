(function () {

    /** @class ria.__API.Exception */
    ria.__API.Exception = (function () {
        "use strict";
        function Exception() { ria.__API.init(this, Exception, Exception.prototype.$, arguments); }
        ria.__API.clazz(Exception, 'Exception', null, [], []);

        Exception.prototype.$ = function (msg, inner_) {
            this.msg = msg;
            this.stack = ria.__API.getStackTrace(Error(msg));
            this.inner_ = inner_;
        };
        ria.__API.ctor(Exception, Exception.prototype.$, [String, [Error, Exception]], ['msg', 'inner_'], []);

        Exception.prototype.toString = function () {
            var msg = this.msg + '\n  ' + this.stack.join('\n  ');

            if (this.inner_) {
                msg += '\nCaused by: ';
                if (this.inner_ instanceof Error) {
                    msg += ria.__API.getStackTrace(this.inner_);
                } else {
                    msg += this.inner_.toString();
                }
            }

            return msg;
        };
        ria.__API.method(Exception, Exception.prototype.toString, 'toString', String, [], [], []);

        Exception.prototype.getMessage = function () { return this.msg; };
        ria.__API.method(Exception, Exception.prototype.getMessage, 'getMessage', String, [], [], []);

        Exception.prototype.getStack = function () { return this.stack; };
        ria.__API.method(Exception, Exception.prototype.getStack, 'getStack', Array, [], [], []);

        ria.__API.compile(Exception);
        return Exception;
    })();
})();