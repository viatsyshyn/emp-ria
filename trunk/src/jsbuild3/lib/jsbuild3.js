"use strict";

var _DEBUG = false;

/**
 * @param {String} path
 * @param {CodeBlockDescriptor[]} deps
 */
function CodeBlockDescriptor(path, deps) {
    /** @var String */
    this.path = path;
    /** @var CodeBlockDescriptor[] */
    this.deps = [].slice.call(deps);
}

CodeBlockDescriptor.prototype = {
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

            return UglifyJS.parse(fs.readFileSync(module.path, "utf8"), {
                filename: module.path,
                toplevel: topLevel
            });
        }(this, topLevel));

        return topLevel;
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
        var ast = UglifyJS.parse(content);
    //} catch (e) {
        //throw Error('Can not parse content of "' + path + '" due: ' + e);
    //}

    var deps = [];
    depsCollectors.forEach(function (collector) {
        deps = [].concat.apply(deps, collector(ast, config, path));
    });

    deps = deps.map(function (dep) {
        return loadModule(dep, config, memoization);
    });

    return memoization[path] = new CodeBlockDescriptor(path, deps);
}

/**
 *
 * @param {String} path
 * @param {Configuration} config
 * @returns string
 */
function compile(path, config) {
    var code = this.loadModule(path, config, {});

    /**
     *
     * @type {AST_Toplevel}
     */
    var topLevel = code.getGluedAst();

    astPreProcessors.forEach(function (processor) { topLevel = topLevel.transform(new UglifyJS.TreeTransformer(processor)); });

    var currentBody = [].slice.call(topLevel.body);
    topLevel = make_node(UglifyJS.AST_Toplevel, topLevel, {
        body: [
            make_node(UglifyJS.AST_SimpleStatement, null, {
                body: make_node(UglifyJS.AST_Call, null, {
                    expression: make_node(UglifyJS.AST_Function, null, {
                        argnames: [],
                        body: [].concat([
                                make_node(UglifyJS.AST_Var, null, {
                                    definitions: globalNsRoots.map(function (name) {
                                        return make_node(UglifyJS.AST_VarDef, null, {
                                            name: new UglifyJS.AST_SymbolVar({ name: name })
                                        });
                                    })
                                })
                            ], currentBody)
                    }),
                    args: []
                })
            })
        ]
    })

    var uglifyjsParams = config.getPluginConfiguration('uglifyjs');

    topLevel.figure_out_scope();
    //topLevel.scope_warnings();

    /*if (uglifyjsParams.mangle) {
        topLevel.compute_char_frequency();
        topLevel.mangle(uglifyjsParams.mangle);
    }
    if (uglifyjsParams.squeeze)
        topLevel = topLevel.transform(UglifyJS.Compressor(uglifyjsParams.squeeze));*/

    astPostProcessors.forEach(function (processor) { topLevel = topLevel.transform(new UglifyJS.TreeTransformer(processor)); });

    var output = UglifyJS.OutputStream(uglifyjsParams.output || {beautify: true});

    topLevel.print(output);

    return output.get();
}

/*filterFunctionCallStatement: function (ast, fnName, handler) {
    ast[1] = ast[1].filter(function(ast) {
        if (ast[0] == 'stat' && ast[1][0] == 'call' && ast[1][1][0] == 'name' && ast[1][1][1] == fnName)
            return !handler(ast);
        return true;
    });
    return ast;
}*/

