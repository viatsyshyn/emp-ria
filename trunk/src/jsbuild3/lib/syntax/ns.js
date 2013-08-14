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

    right = right ? new UglifyJS.AST_Dot({
        expression: right,
        property: name
    }) : new UglifyJS.AST_SymbolRef({ name: name });

    if (!top && globalNsRoots.indexOf(name) < 0)
        globalNsRoots.push(name);

    return TraverseNS(
        parts,
        new UglifyJS.AST_Assign({
            left: top ? new UglifyJS.AST_Dot({
                expression: top,
                property: name
            }) : new UglifyJS.AST_SymbolVar({ name: name }),
            operator: "=",
            right: new UglifyJS.AST_Binary({
                left: right,
                operator: '||',
                right: new UglifyJS.AST_Object({properties:[]})
            })
        }),
        right);
}

function NsCompiler(node, descend) {
    if (node instanceof UglifyJS.AST_Call && (node.expression.print_to_string() == 'NS' || node.expression.print_to_string() == 'NAMESPACE')) {
        var ns = node.args[0].value;

        //console.log('ns called: ' + ns);

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