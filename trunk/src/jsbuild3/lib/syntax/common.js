/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 8/15/13
 * Time: 12:03 AM
 * To change this template use File | Settings | File Templates.
 */

var globalNsRoots = [];

var globalFunctions = [];

var Exception = ria.__API.Exception;

ria.__SYNTAX.PropertyDescriptor.prototype.isOfBooleanType = function () {
    return this.type.raw.print_to_string() === 'Boolean';
};

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

function SymbolsCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_SymbolVar || node instanceof UglifyJS.AST_SymbolRef) {
        var name = node.name;
        if (['Class', 'Interface', 'Exception'].indexOf(name) >= 0) {
            return AccessNS('ria.__API.' + name, null, node);
        }
    }
}

compilers.push(SymbolsCompiler);