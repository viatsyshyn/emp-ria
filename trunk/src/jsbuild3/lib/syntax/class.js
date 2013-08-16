/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/12/13
 * Time: 9:49 AM
 * To change this template use File | Settings | File Templates.
 */

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

function ClassCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call && node.expression.print_to_string() == 'CLASS') {

        //console.info(node.args);

        var tkz = new ria.__SYNTAX.Tokenizer(node.args);

        var def = ria.__SYNTAX.parseClassDef(tkz);

        //ria.__SYNTAX.validateClassDecl(def);

        console.info('found class ' + def.name + ' in ' + ns);

        var parts = ns.split('.');
        parts.push(def.name);
        return make_node(UglifyJS.AST_Assign, node, {
            left: AccessNS(parts, null, node),
            operator: '=',
            right: make_node(UglifyJS.AST_Call, node, {
                expression: make_node(UglifyJS.AST_Function, node, {
                    argnames: [],
                    body: []
                })
            })
        });
    }
}

compilers.push(ClassCompiler);