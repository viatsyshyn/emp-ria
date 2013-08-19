/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/12/13
 * Time: 9:49 AM
 * To change this template use File | Settings | File Templates.
 */

function ExceptionCompilerImpl() {
    var def = ria.__SYNTAX.parseClassDef(new ria.__SYNTAX.Tokenizer([].slice.call(arguments)));
    ria.__SYNTAX.validateException(def);
    var name = "NS-HERE." + def.name;
    return ria.__SYNTAX.compileClass(name, def);
}

function ExceptionCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call && node.expression.print_to_string() == 'EXCEPTION') {

        //console.info(node.args);

        var tkz = new ria.__SYNTAX.Tokenizer(node.args);

        var def = ria.__SYNTAX.parseClassDef(tkz);

        //ria.__SYNTAX.validateClassDecl(def);

        console.info('found exception ' + def.name + ' in ' + ns);

        var parts = ns.split('.');
        parts.push(def.name);
        return make_node(UglifyJS.AST_Assign, node, {
            left: AccessNS(parts, null, node),
            operator: '=',
            right: make_node(UglifyJS.AST_Call, node, {
                expression: UglifyJS.parse(ExceptionCompilerImpl.toString().replace('NS-HERE', ns)).body[0],
                args: node.args
            })
        });
    }
}

compilers.push(ExceptionCompiler);