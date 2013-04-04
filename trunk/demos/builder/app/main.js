/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/11/13
 * Time: 4:23 PM
 * To change this template use File | Settings | File Templates.
 */

/** @namespace empx.demos */
NS('empx.demos', function () {
    "use strict";

    /*IDENTIFIER('MyId');

    ENUM('MyEnum', {
        "Value1": 1,
        Value2: 2,
        ValueZero: 0
    });

    DELEGATE(
        [[String, String]],
        Boolean, function Comparator(_1, _2) {});

    DELEGATE(
        [[String, String]],
        Boolean, function Comparator(_1, _2) {});

    ANNOTATION(
        [[String, Function]],
        function ModelBind(prop_, converter_) {});
        */

    INTERFACE(
        'MyIfc', [
            [[String, String]],
            Boolean, function compareStr(s1, s2) {},

            [[Number, Number]],
            Boolean, function compareNum(n1, n2) {}
        ]);

    EXCEPTION(
        'MyException', []);

    /** @class empx.demos.MyClass */
    CLASS('MyClass', [
        function $() {
            BASE();
        },

        [[String, Boolean]],
        FINAL, Number, function pubMethod(a, b_) {

        }
    ]);

    /*var MyChildClass = CLASS('MyChildClass_', EXTENDS(empx.demos.MyClass), [
    ]);**/
});