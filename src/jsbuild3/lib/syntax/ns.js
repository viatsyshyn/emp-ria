/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/12/13
 * Time: 9:49 AM
 * To change this template use File | Settings | File Templates.
 */

function TraverseNS(parts, top, right) {
    if (parts.length < 1)
        return top;

    var name = parts.shift();

    right = right ? new UglifyJS.AST_Dot({
        expression: right,
        property: name
    }) : new UglifyJS.AST_SymbolRef({ name: name });

    return TraverseNS(parts, new UglifyJS.AST_Assign({
        left: new UglifyJS.AST_Dot({
            expression: top ? top : new UglifyJS.AST_SymbolRef({ name: 'window' }),
            property: name
        }),
        operator: "=",
        right: new UglifyJS.AST_Binary({
            left: right,
            operator: '||',
            right: new UglifyJS.AST_Object({properties:[]})
        })
    }), right);
}

function NsCompiler(node, descend) {
    if (node instanceof UglifyJS.AST_Call && node.expression.print_to_string() == 'NS') {
        var ns = node.args[0].value;

        console.log('ns called: ' + ns);

        var body = node.args[1].transform(new UglifyJS.TreeTransformer(function (node, descend) {
            return SyntaxCompile(ns, node, descend);
        }));

        var parts = ns.split(".");
        return (
            make_node(UglifyJS.AST_BlockStatement, node, {
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
            })
        );
    }
}