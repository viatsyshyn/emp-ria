/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 8/15/13
 * Time: 12:03 AM
 * To change this template use File | Settings | File Templates.
 */

var Exception = ria.__API.Exception;

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