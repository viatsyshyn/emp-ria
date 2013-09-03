/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 8/15/13
 * Time: 12:03 AM
 * To change this template use File | Settings | File Templates.
 */

function SymbolsCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_SymbolVar || node instanceof UglifyJS.AST_SymbolRef) {
        var name = node.name;
        if (['Class', 'Interface', 'Exception'].indexOf(name) >= 0) {
            return AccessNS('ria.__API.' + name, null, node);
        }
    }
}

compilers.push(SymbolsCompiler);

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

function SyntaxCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call) {
        var name = node.expression.print_to_string();
        if (['ANNOTATION', 'Assert', 'CLASS', 'DELEGATE', 'ENUM', 'EXCEPTION', 'IDENTIFIER', 'INTERFACE', 'IMPLEMENTS', 'EXTENDS'].indexOf(name) >= 0) {
            return make_node(UglifyJS.AST_Call, node, {
                expression: AccessNS('ria.__SYNTAX.' + name, null, node),
                args: node.args
            })
        }
    }
}

//compilers.push(SyntaxCompiler);

function NamespaceSyntaxCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call) {
        var name = node.expression.print_to_string();
        if (['NS', 'NAMESPACE'].indexOf(name) >= 0) {
            return make_node(UglifyJS.AST_Call, node, {
                expression: AccessNS('ria.__SYNTAX.' + name, null, node),
                args: node.args
            })
        }
    }
}

//compilers.push(NamespaceSyntaxCompiler);

function ValidatorCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call) {
        var name = node.expression.print_to_string();
        if (['VALIDATE_ARG', 'VALIDATE_ARGS'].indexOf(name) >= 0) {
            return make_node(UglifyJS.AST_Null, node, {})
        }
    }
}

compilers.push(ValidatorCompiler);

function ModifiersCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_SymbolVar || node instanceof UglifyJS.AST_SymbolRef) {
        var name = node.name;
        if (['OVERRIDE', 'ABSTRACT', 'VOID', 'SELF', 'FINAL', 'READONLY'].indexOf(name) >= 0) {
            return AccessNS('ria.__SYNTAX.Modifiers.' + name, null, node);
        }
    }
}

//compilers.push(ModifiersCompiler);