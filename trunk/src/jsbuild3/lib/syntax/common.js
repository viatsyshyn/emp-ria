/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 8/15/13
 * Time: 12:03 AM
 * To change this template use File | Settings | File Templates.
 */

var globalNsRoots = [];

var Exception = ria.__API.Exception;

function AccessNS(parts, top, node) {
    if (typeof parts === 'string')
        parts = parts.split('.');

    if (parts.length < 1)
        return top;

    var name = parts.shift();

    return AccessNS(parts, top
        ? make_node(UglifyJS.AST_Dot, node, {expression: top, property: name})
        : make_node(UglifyJS.AST_SymbolVar, node, { name: name }), node);
}

function TraverseNS(parts, top, right) {
    if (parts.length < 1)
        return top;

    var name = parts.shift();

    right = right
        ? make_node(UglifyJS.AST_Dot, null, { expression: right, property: name })
        : make_node(UglifyJS.AST_SymbolRef, null, { name: name });

    if (!top && globalNsRoots.indexOf(name) < 0)
        globalNsRoots.push(name);

    return TraverseNS(
        parts,
        make_node(UglifyJS.AST_Assign, null, {
            left: top
                ? make_node(UglifyJS.AST_Dot, null, {expression: top, property: name})
                : make_node(UglifyJS.AST_SymbolVar, null, { name: name }),
            operator: "=",
            right: make_node(UglifyJS.AST_Binary, null, {
                left: right,
                operator: '||',
                right: make_node(UglifyJS.AST_Object, null, {properties:[]})
            })
        }),
        right);
}

function XxxOfCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call) {
        var name = node.expression.print_to_string();
        if (['ArrayOf', 'ClassOf', 'ImplementerOf'].indexOf(name) >= 0) {
            return make_node(UglifyJS.AST_Call, node, {
                expression: AccessNS('ria.__API.' + name, null, node),
                args: node.args
            })
        }
    }
}

compilers.push(XxxOfCompiler);