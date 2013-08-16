/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/12/13
 * Time: 9:49 AM
 * To change this template use File | Settings | File Templates.
 */

var globalNsRoots = [];

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

function NsCompiler(node, descend) {
    if (node instanceof UglifyJS.AST_Call && (node.expression.print_to_string() == 'NS' || node.expression.print_to_string() == 'NAMESPACE')) {
        var ns = node.args[0].value;

        var body = node.args[1].transform(new UglifyJS.TreeTransformer(function (node, descend) {
            return SyntaxCompile(ns, node, descend);
        }));

        var parts = ns.split(".");
        return (
            make_node(UglifyJS.AST_Call, node, {
                expression: make_node(UglifyJS.AST_Function, null, {
                    argnames: [],
                    body: [
                        make_node(UglifyJS.AST_SimpleStatement, null, {
                            body: TraverseNS(parts, null)
                        }),
                        make_node(UglifyJS.AST_SimpleStatement, null, {
                            body: make_node(UglifyJS.AST_Call, null, {
                                expression: node.args[1],
                                args: []
                            })
                        })
                    ]
                }),
                args: []
            })
        );
    }
}