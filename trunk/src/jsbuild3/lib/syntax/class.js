/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/12/13
 * Time: 9:49 AM
 * To change this template use File | Settings | File Templates.
 */

function isProtected(name) {
    //console.info(name + 'is protected ' + (/^.+_$/.test(name) ? 'true' : 'false'));
    return /^.+_$/.test(name);
}

function ToAst(fn) {
    try {
        return UglifyJS.parse('function anonymous() { ' + fn.toString() + ' }').body[0].body[0];
    } catch (e) {
        console.error('Error parsing: "' + fn + '", Error : ' + e.message);
        throw e;
    }
}

function processAnnotation(_) {
    if (_.raw instanceof UglifyJS.AST_Call)
        return _.raw

    return make_node(UglifyJS.AST_Call, _.raw, {
        expression: _.raw,
        args: []
    })
}

function ClassCtor() {
    return (ClassCtor.$$ || ria.__API.init)(this, ClassCtor, ClassCtor.prototype.$, [].slice.call(arguments));
}

function CompileSELF(node, clazz) {
    return node.transform(new UglifyJS.TreeTransformer(function (node, descend) {
        if (node instanceof UglifyJS.AST_SymbolVar || node instanceof UglifyJS.AST_SymbolRef) {
            var name = node.name;
            if ('SELF' === name) {
                return AccessNS(clazz, null, node);
            }
        }
    }))
}

function ProcessSELF(token, clazz) {
    if (token instanceof ria.__SYNTAX.Tokenizer.SelfToken)
        return AccessNS(clazz);

    if (token instanceof ria.__SYNTAX.Tokenizer.VoidToken)
        return make_node(UglifyJS.AST_Null);

    //console.info(token.__proto__.constructor.name);

    return CompileSELF(token.raw, clazz);
}

function CompileBASE(node, baseClazz, method, clazz) {
    var found = false;

    var result = node.transform(new UglifyJS.TreeTransformer(function (node, descend) {
        if (node instanceof UglifyJS.AST_Call && node.expression.print_to_string() == 'BASE') {
            found = true;
            return make_node(UglifyJS.AST_Call, node, {
                expression: AccessNS(baseClazz + '.prototype.' + method + '.call', null, node),
                args: [make_node(UglifyJS.AST_This, node)].concat(node.args)
            })
        }
    }));

    if (!found && clazz)
        console.warn('Class "' + clazz + '" not calls BASE() in $');

    return result;
}

function ClassCompilerBase(ns, node, descend, baseClass, KEYWORD) {
    if (node instanceof UglifyJS.AST_Call && node.expression.print_to_string() == KEYWORD) {

        //console.info(node.args);

        var tkz = new ria.__SYNTAX.Tokenizer(node.args);

        var def = ria.__SYNTAX.parseClassDef(tkz);

        //ria.__SYNTAX.validateClassDecl(def);

        //console.info('found class ' + def.name + ' in ' + ns);

        var processedMethods = [];
        var parts = ns.split('.');
        parts.push(def.name);
        return make_node(UglifyJS.AST_Assign, node, {
            left: AccessNS(parts, null, node),
            operator: '=',
            right: make_node(UglifyJS.AST_Call, node, {
                expression: make_node(UglifyJS.AST_Function, node, {
                    argnames: [],
                    body: [].concat(
                        [ToAst(ClassCtor)],
                        [make_node(UglifyJS.AST_SimpleStatement, node, {
                            body: make_node(UglifyJS.AST_Call, node, {
                                expression: AccessNS('ria.__API.class', null, node),
                                args: [
                                    AccessNS('ClassCtor'),
                                    make_node(UglifyJS.AST_String, node, {value: ns + '.' + def.name}),
                                    def.base ? def.base.raw : AccessNS('ria.__API.Class'),
                                    make_node(UglifyJS.AST_Array, node, {elements: def.ifcs.raw}),
                                    make_node(UglifyJS.AST_Array, node, {elements: def.annotations.map(processAnnotation) }),
                                    make_node(def.flags.isAbstract ? UglifyJS.AST_True : UglifyJS.AST_False, node)
                                ]
                            })
                        })],
                        //compile factory is any
                        [make_node(UglifyJS.AST_SimpleStatement, node, {
                            body: function () {
                                var $$Def = def.methods.filter(function (_) { return _.name == '$$'; }).pop();
                                processedMethods.push('$$');
                                return make_node(UglifyJS.AST_Assign, node, {
                                    left: AccessNS('ClassCtor.$$'),
                                    operator: '=',
                                    right: $$Def ? $$Def.body.raw : make_node(UglifyJS.AST_Null, node)
                                })
                            }()
                        })],
                        //TODO: compile statics,
                        //TODO: compile ctor
                        function () {
                            var ctorDef = def.methods.filter(function (_) { return _.name == '$' }).pop();
                            processedMethods.push('$');
                            var argsNames = ctorDef ? ctorDef.argsNames : [],
                                argsTypes = ctorDef ? ctorDef.argsTypes : [],
                                body = ctorDef ? ctorDef.body.raw : ToAst('function $() { BASE(); }');
                            return [
                                make_node(UglifyJS.AST_SimpleStatement, node, {
                                    body: make_node(UglifyJS.AST_Assign, node, {
                                        left: AccessNS('ClassCtor.prototype.$', null, node),
                                        operator: '=',
                                        // TODO: insert properties initializations
                                        right: CompileBASE(CompileSELF(body, 'ClassCtor'),
                                            // TODO: detect TRUE base class
                                            def.base ? def.base.raw.print_to_string() : baseClass,
                                            '$', parts.join('.'))
                                    })
                                }),
                                make_node(UglifyJS.AST_SimpleStatement, node, {
                                    body: make_node(UglifyJS.AST_Call, node, {
                                        expression: AccessNS('ria.__API.ctor', null, node),
                                        args: [
                                            AccessNS('ClassCtor', null, node),
                                            AccessNS('ClassCtor.prototype.$', null, node),
                                            make_node(UglifyJS.AST_Array, node, {
                                                elements: argsTypes.map(function (_) { return ProcessSELF(_, 'ClassCtor') })
                                            }),
                                            make_node(UglifyJS.AST_Array, node, {
                                                elements: argsNames.map(function (_) { return make_node(UglifyJS.AST_String, node, {value: _}) })
                                            })
                                        ]
                                    })
                                })
                            ];
                        }(),
                        //TODO: compile properties,
                        def.properties
                            .map(function (property) {
                                var getterName = property.getGetterName();
                                var setterName = property.getSetterName();

                                var getterDef = def.methods.filter(function (_) { return _.name == getterName }).pop();
                                processedMethods.push(getterName);
                                var setterDef = def.methods.filter(function (_) { return _.name == setterName }).pop();
                                processedMethods.push(setterName);

                                var getterBody = getterDef ? getterDef.body.raw : ToAst('function getter() { return this["' + property.name + '"];}'),
                                    setterBody = setterDef ? setterDef.body.raw : ToAst('function setter(value) { this["' + property.name + '"] = value;}');

                                return [
                                    make_node(UglifyJS.AST_SimpleStatement, node, {
                                        body: make_node(UglifyJS.AST_Assign, node, {
                                            left: AccessNS('ClassCtor.prototype.' + getterName, null, node),
                                            operator: '=',
                                            // TODO: insert properties initializations
                                            right: CompileBASE(CompileSELF(getterBody, 'ClassCtor'),
                                                // TODO: detect TRUE base class
                                                def.base ? def.base.raw.print_to_string() : baseClass,
                                                getterName)
                                        })
                                    }),

                                    property.flags.isReadonly ? null : make_node(UglifyJS.AST_SimpleStatement, node, {
                                        body: make_node(UglifyJS.AST_Assign, node, {
                                            left: AccessNS('ClassCtor.prototype.' + setterName, null, node),
                                            operator: '=',
                                            // TODO: insert properties initializations
                                            right: CompileBASE(CompileSELF(setterBody, 'ClassCtor'),
                                                // TODO: detect TRUE base class
                                                def.base ? def.base.raw.print_to_string() : baseClass,
                                                setterName)
                                        })
                                    }),

                                    make_node(UglifyJS.AST_SimpleStatement, node, {
                                        body: make_node(UglifyJS.AST_Call, node, {
                                            expression: AccessNS('ria.__API.property', null, node),
                                            args: [
                                                AccessNS('ClassCtor', null, node),
                                                make_node(UglifyJS.AST_String, node, {value: property.name}),
                                                property.type ? ProcessSELF(property.type, 'ClassCtor') : make_node(UglifyJS.AST_Null),
                                                make_node(UglifyJS.AST_Array, node, {elements: property.annotations.map(processAnnotation) }),
                                                AccessNS('ClassCtor.prototype.' + getterName, null, node),
                                                property.flags.isReadonly ? make_node(UglifyJS.AST_Null) : AccessNS('ClassCtor.prototype.' + setterName, null, node)
                                            ]
                                        })
                                    })
                                ];
                            })
                            .reduce(function (node, _) { return _.concat(node); }, [])
                            .filter(function (_) { return _ != null; }),
                        //TODO: compile methods,
                        def.methods
                            .filter(function (_) { return processedMethods.indexOf(_.name) < 0 })
                            .map(function (method) {
                                return [
                                    make_node(UglifyJS.AST_SimpleStatement, node, {
                                        body: make_node(UglifyJS.AST_Assign, node, {
                                            left: AccessNS('ClassCtor.prototype.' + method.name, null, node),
                                            operator: '=',
                                            right: CompileBASE(CompileSELF(method.body.raw, 'ClassCtor'),
                                                // TODO: detect TRUE base class
                                                def.base ? def.base.raw.print_to_string() : baseClass,
                                                method.name)
                                        })
                                    }),
                                    isProtected(method.name) ? null : make_node(UglifyJS.AST_SimpleStatement, node, {
                                        body: make_node(UglifyJS.AST_Call, node, {
                                            expression: AccessNS('ria.__API.method', null, node),
                                            args: [
                                                AccessNS('ClassCtor', null, node),
                                                AccessNS('ClassCtor.prototype.' + method.name, null, node),
                                                make_node(UglifyJS.AST_String, node, {value: method.name}),
                                                method.retType ? ProcessSELF(method.retType, 'ClassCtor') : make_node(UglifyJS.AST_Null),
                                                make_node(UglifyJS.AST_Array, node, {
                                                    elements: method.argsTypes.map(function (_) { return ProcessSELF(_, 'ClassCtor') })
                                                }),
                                                make_node(UglifyJS.AST_Array, node, {
                                                    elements: method.argsNames.map(function (_) {
                                                        return make_node(UglifyJS.AST_String, node, {value: _})
                                                    })
                                                }),
                                                make_node(UglifyJS.AST_Array, node, {elements: method.annotations.map(processAnnotation) })
                                            ]
                                        })
                                    })
                                ];
                            })
                            .reduce(function (node, _) { return _.concat(node); }, [])
                            .filter(function (_) { return _ != null; }),
                        [ToAst('ria.__API.compile(ClassCtor)')],
                        [ToAst('return ClassCtor')]
                    )
                })
                //expression: UglifyJS.parse(ClassCompilerImpl.toString().replace('NS-HERE', ns)).body[0],
                //args: node.args
            })
        });
    }
}

function ClassCompiler(ns, node, descend, base) {
    return ClassCompilerBase(ns, node, descend, 'ria.__API.Class', 'CLASS');
}

compilers.push(ClassCompiler);