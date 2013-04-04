/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 3/3/13
 * Time: 10:22 PM
 * To change this template use File | Settings | File Templates.
 */

(function() {
    "use strict";

    var ClassMeta = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
        'Class', [
            function $() {},
            Function, function getClass() {},
            String, function getHashCode() {},
            [[ria.__API.Class]],
            Boolean, function equals(other) {}
        ]]));

    ria.__SYNTAX.Registry.registry('Class', ClassMeta);

    var ExceptionMeta = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([
        'Exception', [
            [[String, Object]],
            function $(msg, inner_) {},

            String, function toString() {},
            String, function getMessage() {},
            Array, function getStack() {}
        ]]));

    ria.__SYNTAX.Registry.registry('Exception', ExceptionMeta);
})();