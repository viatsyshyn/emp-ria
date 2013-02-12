/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/12/13
 * Time: 9:49 AM
 * To change this template use File | Settings | File Templates.
 */

function ClassCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call && node.expression.print_to_string() == 'CLASS') {

        var def = [].slice.call(node.args);
        var body = def.pop();
        if (!(body instanceof UglifyJS.AST_Array))
            throw Error('Array expected');

        var name = def.pop();
        if (name instanceof UglifyJS.AST_Call && name.expression.print_to_string() == 'IMPLEMENTS') {
            // TODO: process implements
            name = def.pop();
        }

        if (name instanceof UglifyJS.AST_Call && name.expression.print_to_string() == 'EXTENDS') {
            // TODO: process extends
            name = def.pop();
        }

        if (!(name instanceof UglifyJS.AST_String))
            throw Error('Expected string literal, got ' + name.print_to_string());

        // TODO: process implements
        name = name.value;

        // TODO: process annotations

        var members = [].slice.call(body.elements);
        // TODO: parse members

        console.info('found class ' + name + ' in ' + ns);

        return make_node(UglifyJS.AST_BlockStatement, node, { body: []});
    }
}

compilers.push(ClassCompiler);