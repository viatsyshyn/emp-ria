/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/12/13
 * Time: 10:01 AM
 * To change this template use File | Settings | File Templates.
 */
"use strict";

function getIdentifierImplementation(name, fullName) {
    return UglifyJS.parse(function wrapper() {
        var values = {};
        function IdName(value) {
            return values.hasOwnProperty(value) ? values[value] : (values[value] = new IdNameImpl(value));
        }
        ria.__API.identifier(IdName, 'IdFullName');

        function IdNameImpl(value) {
            this.valueOf = function () { return value; };
            this.toString = function toString() { return '[IdFullName#' + value + ']'; };
        }

        ria.__API.extend(IdNameImpl, IdName);
        return IdName;
    }.toString().replace(/IdName/g, name).replace(/IdFullName/g, fullName), {});
}

function IdentifierCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call && node.expression.print_to_string() == 'IDENTIFIER') {

        if (node.args.length != 1)
            throw Error('invalid args count');

        if (!(node.args[0] instanceof UglifyJS.AST_String))
            throw Error('Identifier name should be string literal');

        var name = node.args[0].value;

        //console.info('Found identifier ' + name + ' in ' + ns);

        return new UglifyJS.AST_Assign({
            left: getNameTraversed(ns.split('.'), name),
            operator: '=',
            right: new UglifyJS.AST_Call({
                expression: getIdentifierImplementation(name, ns + '.' + name),
                args: []
            })
        });
    }
}

compilers.push(IdentifierCompiler);

