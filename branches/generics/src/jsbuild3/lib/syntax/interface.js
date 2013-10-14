/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/12/13
 * Time: 12:03 PM
 * To change this template use File | Settings | File Templates.
 */

"use strict";

function InterfaceCompiler(ns, node, descend) {
    if (node instanceof UglifyJS.AST_Call && node.expression.print_to_string() == 'INTERFACE') {
        var tkz = new ria.__SYNTAX.Tokenizer(node.args);

        var def = ria.__SYNTAX.parseClassDef(tkz);

        //ria.__SYNTAX.validateInterfaceDecl(def);

        //console.info('Found interface ' + def.name + ' in ' + ns);

        var items = def.methods.map(function (_) {
            return new UglifyJS.AST_Array({elements: [
                new UglifyJS.AST_String({value:_.name}),
                _.retType.raw || make_node(UglifyJS.AST_Null, null, {}),
                new UglifyJS.AST_Array({elements: _.argsTypes.map(function (_) { return _.raw; })}),
                new UglifyJS.AST_Array({elements: _.argsNames.map(function (_) { return new UglifyJS.AST_String({ value: _})})})
            ]})
        });

        return make_node(UglifyJS.AST_Assign, node, {
            left: getNameTraversed(ns.split('.'), def.name),
            operator: '=',
            right: make_node(UglifyJS.AST_Call, node, {
                expression: make_node(UglifyJS.AST_Function, node, {
                    argnames: [],
                    body: [].concat(
                            [def.genericTypes.length ? CompileGenericTypes(def.genericTypes, node) : null],
                            [make_node(UglifyJS.AST_Var, node, {
                                definitions: [make_node(UglifyJS.AST_VarDef, null, {
                                    name: make_node(UglifyJS.AST_SymbolRef, node, {name: 'ifc'}),
                                    value: new UglifyJS.AST_Call({
                                        expression: getNameTraversed('ria.__API'.split('.'), 'ifc'),
                                        args: [
                                            make_node(UglifyJS.AST_Function, node, {argnames: [], body: []}),
                                            new UglifyJS.AST_String({value: ns + '.' + def.name}),
                                            new UglifyJS.AST_Array({elements: items}),
                                            make_node(UglifyJS.AST_Array, null, {elements: def.genericTypes ? def.genericTypes.map(function (_) { return new UglifyJS.AST_SymbolVar({ name: _[0].value })}) : []})
                                        ]
                                    })
                                })]
                            })],
                            [ToAst('ifc.OF = ria.__API.OF')],
                            [ToAst('return ifc')]
                        ).filter(function (_) { return _ })
                    }),
                args: []
            })
        });
    }
}

compilers.push(InterfaceCompiler);