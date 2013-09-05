"use strict";

var _DEBUG = false;

/**
 * @param {String} path
 * @param {CodeBlockDescriptor[]} deps
 */
function CodeBlockDescriptor(path, deps, ast) {
    /** @var String */
    this.path = path;
    /** @var CodeBlockDescriptor[] */
    this.deps = [].slice.call(deps);

    this.ast = ast;
}

CodeBlockDescriptor.prototype = {
    getAst: function () { return this.ast; },

    /**
     * @param {AST_TopLevel} topLevel
     * @returns AST_Toplevel
     */
    getGluedAst: function (topLevel) {
        var memory = {};

        /**
         * @param {CodeBlockDescriptor} module
         * @param {AST_Toplevel} topLevel
         * @returns {AST_Toplevel}
         */
        topLevel = (function topologicalSort(module, topLevel) {
            if (memory.hasOwnProperty(module.path))
                return topLevel;

            module.deps.forEach(function (dep) {
                topLevel = topologicalSort(dep, topLevel);
            });

            memory[module.path] = true;

            if (!topLevel)
                return module.getAst();

            return make_node(UglifyJS.AST_Toplevel, topLevel, {
                body: [].concat(topLevel.body, module.getAst().body)
            });

            /*return UglifyJS.parse(fs.readFileSync(module.path, "utf8"), {
                filename: module.path,
                toplevel: topLevel
            });*/

        }(this, topLevel));

        return topLevel;
    },

    prependRuntime: function (runtime) {
        this.deps = [].concat(runtime, this.deps);
    }
};

/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 2/11/13
 * Time: 3:46 PM
 * To change this template use File | Settings | File Templates.
 */


var fileHandlers = {};
var depsCollectors = [];
var astPreProcessors = [];
var astPostProcessors = [];

fileHandlers.js = function JsFileHandler(content, config) { return content; };

function make_node(ctor, orig, props) {
    if (!props) props = {};
    if (orig) {
        if (!props.start) props.start = orig.start;
        if (!props.end) props.end = orig.end;
    }
    return new ctor(props);
}

astPreProcessors.unshift(function (node, descend) {
    return SyntaxCompile(null, node, descend);
});

/*astPreProcessors.unshift(function (ast, config) {
    ast[1] = ast[1].filter(function(ast) { return !(ast[0] == 'stat' && ast[1][0] == 'string' && ast[1][1] == 'use strict'); });
    return ast;
});*/

/**
 * @param {String} ext
 * @param {Function} handler
 */
function setFileHandler(ext, handler) { fileHandlers[ext] = handler; }

/**
 * @param {Function} collector
 */
function addDepsCollector(collector) { depsCollectors.unshift(collector); }

/**
 * @param {Function} processor
 */
function addAstPreProcessor(processor) { astPreProcessors.unshift(processor); }

/**
 * @param {Function} processor
 */
function addAstPostProcessor(processor) { astPostProcessors.unshift(processor); }

/**
 *
 * @param {String} path
 * @param {Configuration} config
 * @param memoization
 * @private
 * @returns CodeBlockDescriptor
 */
function loadModule(path, config, memoization) {
    if (memoization.hasOwnProperty(path))
        return memoization[path];

    var ext = Path.extname(path).substr(1);
    if (!fileHandlers.hasOwnProperty(ext))
        throw Error('Can not load "' + path + '". No file handler found for ' + ext);

    if (!fs.existsSync(path))
        throw Error('Can not find path "' + path + '"');

    try {
        var content = fileHandlers[ext](fs.readFileSync(path, "utf8"), config, path);
    } catch (e) {
        throw Error('Can not load content of "' + path + '" due: ' + e);
    }

    //try {
        //console.info('Parsing content of "' + path + '" content: ' + content);
        var ast = UglifyJS.parse(content, {
            filename: path
        });
        //console.info('Done');
    //} catch (e) {
        //console.error('Can not parse content of "' + path + '" due: ' + e);
        //throw e;
    //}

    try {
        var deps = [];
        depsCollectors.forEach(function (collector) {
            deps = [].concat.apply(deps, collector(ast, config, path));
        });

        deps = deps.map(function (dep) {
            return loadModule(dep, config, memoization);
        });

        return memoization[path] = new CodeBlockDescriptor(path, deps, ast);
    } catch (e) {
        console.error(JSON.stringify(e));
        throw e;
    }
}

function prepareRiaConfig() {
    (ria = ria || {}).__CFG = [].slice.call(document.getElementsByTagName('script'))
        .map(function (_) {
            return _.innerText || _.innerHTML;
        })
        .filter(function (text) {
            return text.match(/ria\.__CFG\s+=\s+\{/)
        })
        .map(function (text) {
            return JSON.parse(text.split('=').pop());
        })
        .pop();
}

function appStart() {
    new AppClass()
        .session(ria.__CFG['#mvc'].settings || {})
        .run();
}

/**
 *
 * @param {String} path
 * @param {Configuration} config
 * @returns string
 */
function compile(path, config, appClass) {
    var code = this.loadModule(resolve(path, config), config, {});

    // add runtime
    var runtime = ['0.common', '0.pipeline', '0.stacktrace', '5.annotations', '5.delegates', '5.enum', '5.identifier'
        , '6.interface', '8.class', '9.arrayof', '9.classof', '9.exception', '9.implementerof']
        .map(function (_) {
            return loadModule(resolve('ria/base/' + _ + '.js', config), config, {});
        });
    /*runtime = runtime.concat(['annotations', 'assert', 'class', 'delegate', 'enum', 'exception', 'identifier', 'interface'
        , 'ns', 'parser2', 'registry', 'type-hints', 'tokenizer', 'zzz.init']
        .map(function (_) {
            return loadModule(resolve('ria/syntax/' + _ + '.js', config), config, {});
        }));*/

    code.prependRuntime(runtime);

    /**
     *
     * @type {AST_Toplevel}
     */
    var topLevel = code.getGluedAst();

    astPreProcessors.forEach(function (processor) {
        topLevel = topLevel.transform(new UglifyJS.TreeTransformer(processor));
    });

    var currentBody = [].slice.call(topLevel.body);
    var globals = config.getGlobals();

    //console.info(UglifyJS.parse(prepareRiaConfig.toString()).body[0].body);

    topLevel = make_node(UglifyJS.AST_Toplevel, topLevel, {
        body: [
            make_node(UglifyJS.AST_SimpleStatement, topLevel, {
                body: make_node(UglifyJS.AST_Call, topLevel, {
                    expression: make_node(UglifyJS.AST_Function, topLevel, {
                        argnames: globals.map(function (_) { return make_node(UglifyJS.AST_SymbolFunarg, topLevel, {name: _}); }),
                        body: [].concat([
                                make_node(UglifyJS.AST_Var, topLevel, {
                                    definitions: globalNsRoots
                                        .filter(function (_) { return _ != 'ria'; })
                                        .map(function (name) {
                                            return make_node(UglifyJS.AST_VarDef, null, {
                                                name: make_node(UglifyJS.AST_SymbolVar, topLevel, { name: name }),
                                                value: make_node(UglifyJS.AST_Object, topLevel, {properties:[]})
                                            });
                                        })
                                }),
                                make_node(UglifyJS.AST_Var, topLevel, {
                                    definitions: [
                                        make_node(UglifyJS.AST_VarDef, null, {
                                            name: make_node(UglifyJS.AST_SymbolVar, topLevel, { name: '_DEBUG' })
                                        })
                                    ]
                                })
                            ], [
                                make_node(UglifyJS.AST_SimpleStatement, topLevel, {
                                    body: make_node(UglifyJS.AST_Call, topLevel, {
                                        expression: make_node(UglifyJS.AST_Function, topLevel, {
                                            argnames: [],
                                            body: UglifyJS.parse(prepareRiaConfig.toString()).body[0].body
                                        }),
                                        args: []
                                    })
                                })
                            ], globalFunctions, currentBody, [
                                make_node(UglifyJS.AST_SimpleStatement, topLevel, {
                                    body: make_node(UglifyJS.AST_Call, topLevel, {
                                        expression: make_node(UglifyJS.AST_Function, topLevel, {
                                            argnames: [],
                                            body: UglifyJS.parse(appStart.toString().replace('AppClass', appClass)).body[0].body
                                        }),
                                        args: []
                                    })
                                })
                            ])
                    }),
                    args: globals.map(function (_) { return make_node(UglifyJS.AST_SymbolVar, topLevel, {name: _}); })
                })
            })
        ]
    });

    var uglifyjsParams = config.getPluginConfiguration('uglifyjs');

    topLevel.figure_out_scope();
    topLevel.scope_warnings();

    if (uglifyjsParams.mangle) {
        topLevel.compute_char_frequency();
        topLevel.mangle_names(uglifyjsParams.mangle_options);
    }

    if (uglifyjsParams.squeeze) {
        topLevel = topLevel.transform(UglifyJS.Compressor(uglifyjsParams.squeeze_options));
    }

    astPostProcessors.forEach(function (processor) { topLevel = topLevel.transform(new UglifyJS.TreeTransformer(processor)); });

    var output = UglifyJS.OutputStream(uglifyjsParams.output || {beautify: uglifyjsParams.beautify});

    topLevel.print(output);

    var fileContents = [];
    config.getPrepend().forEach(function (prepend) {
        var path = resolve(prepend, config);
        console.info('Prepending: ' + path);
        fileContents.push('/** @path ' + prepend + ' */');
        fileContents.push(fs.readFileSync(path));
    });

    var content = output.get();

    var gcc = config.getPluginConfiguration("gcc");
    if (gcc) {
        fs.writeFileSync('./tmp.in.js', content, "utf-8");
        execSync(gcc.cmd + " --js tmp.in.js --js_output_file tmp.out.js");
        content = fs.readFileSync('./tmp.out.js', "utf8");
        fs.unlinkSync('./tmp.in.js');
        fs.unlinkSync('./tmp.out.js');
    }

    fileContents.push(content);

    return fileContents;
}

/*filterFunctionCallStatement: function (ast, fnName, handler) {
    ast[1] = ast[1].filter(function(ast) {
        if (ast[0] == 'stat' && ast[1][0] == 'call' && ast[1][1][0] == 'name' && ast[1][1][1] == fnName)
            return !handler(ast);
        return true;
    });
    return ast;
}*/

