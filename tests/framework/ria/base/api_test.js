(function () {
    "use strict";

    /**
     * @constructor
     * @param {Number} [x_]
     */
    window.empx.domx.MyClass = function (x_) {};

    //noinspection FunctionWithInconsistentReturnsJS
    /**
     * @param {Number} x
     * @param {String} [y_]
     * @return {Boolean}
     * @this empx.domx.MyClass
     * @public
     */
    window.empx.domx.MyClass.prototype.test = function (x, y_) { };
})();

(function (window, __API, undefined) {"use strict"; __API.ns('empx.domx'); /** @namespace empx.domx */
  var MyClass = __API.ctor('empx.domx.MyClass');
  MyClass.prototype.$ = __API.method(MyClass, '$', __API.Public, undefined, [Number], function (x) { __API.base(this, MyClass, '$', []); /* default parent ctor */ });
  __API.compile(MyClass, window.empx.domx);
})(ria.window, ria.__API);
