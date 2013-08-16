/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/12/13
 * Time: 12:03 PM
 * To change this template use File | Settings | File Templates.
 */

"use strict";

function DelegateCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call && node.expression.print_to_string() == 'DELEGATE') {
        var tkz = new ria.__SYNTAX.Tokenizer(node.args);

        var method = ria.__SYNTAX.parseMember(tkz);

        ria.__SYNTAX.validateDelegateDecl(method);

        console.info('Found delegate ' + method.name + ' in ' + ns);

        return make_node(UglifyJS.AST_Assign, node, {
            left: getNameTraversed(ns.split('.'), method.name),
            operator: '=',
            right: make_node(UglifyJS.AST_Call, null, {
                expression: getNameTraversed('ria.__API'.split('.'), 'delegate'),
                args: [
                    make_node(UglifyJS.AST_String, null, {value: ns + '.' + method.name}),
                    method.retType.raw || make_node(UglifyJS.AST_Null, null, {}),
                    make_node(UglifyJS.AST_Array, null, {elements: method.argsTypes.map(function (_) { return _.raw; })}),
                    make_node(UglifyJS.AST_Array, null, {elements: method.argsNames.map(function (_) { return new UglifyJS.AST_String({ value: _})})})
                ]
            })
        });
    }
}

compilers.push(DelegateCompiler);