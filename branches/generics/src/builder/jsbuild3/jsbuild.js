/**
 * Created with JetBrains WebStorm.
 * User: paladin
 * Date: 2/10/13
 * Time: 12:19 PM
 * To change this template use File | Settings | File Templates.
 */

Env.load('jsbuild3/uglifyjs.js');

(function (global) {
    var fileHandlers = {};
    var depsCollectors = [];
    var astPreProcessors = [];
    var astPostProcessors = [];

    var JsBuild = {
        /**
         * @param {String} ext
         * @param {Function} handler
         */
        setFileHandler:function (ext, handler) { fileHandlers[ext] = handler; },

        /**
         * @param {Function} collector
         */
        addDepsCollector:function (collector) { depsCollectors.unshift(collector); },

        /**
         * @param {Function} processor
         */
        addAstPreProcessor:function (processor) { astPreProcessors.unshift(processor); },

        /**
         * @param {Function} processor
         */
        addAstPostProcessor:function (processor) { astPostProcessors.unshift(processor); },

        /**
         *
         * @param {String} path
         * @param {Configuration} config
         * @param memoization
         * @return CodeBlockDescriptor
         */
        loadModule:function (path, config, memoization) {
            if (memoization.hasOwnProperty(path))
                return memoization[path];

            var ext = File.getExtension(path);
            if (!fileHandlers.hasOwnProperty(ext))
                throw Error('Can not load "' + path + '". No file handler found for ' + ext);

            if (!File.exists(path))
                throw Error('Can not find path "' + path + '"');

            try {
                var content = fileHandlers[ext](File.readFile(path), config, path);
            } catch (e) {
                throw Error('Can not load content of "' + path + '" due: ' + e);
            }

            try {
                var ast = UglifyJs.parse(content);
            } catch (e) {
                throw Error('Can not parse content of "' + path + '" due: ' + e);
            }

            var deps = [];
            depsCollectors.forEach(function (collector) {
                deps = [].concat.apply(deps, collector(ast, config, path));
            });

            deps = deps.map(function (dep) {
                return JsBuild.loadModule(dep, config, memoization);
            });

            return memoization[path] = new CodeBlockDescriptor(path, ast, deps);
        },

        /**
         *
         * @param {String} path
         * @param {Configuration} config
         * @returns string
         */
        compile:function (path, config) {
            var code = this.loadModule(path, config, {});

            var ast = code.getGluedAst();
            astPreProcessors.forEach(function (processor) { ast = processor(ast, config) || ast; });

            var uglifyjsParams = config.getPluginConfiguration('uglifyjs');
            if (uglifyjsParams.mangle === true)
                ast = UglifyJs.ast_mangle(ast, !!uglifyjsParams.mangle_toplevel);
            if (uglifyjsParams.squeeze === true)
                ast = UglifyJs.ast_squeeze(ast, uglifyjsParams.squeeze_options || {});
            if (uglifyjsParams.squeeze_more === true)
                ast = UglifyJs.ast_squeeze_more(ast);

            astPostProcessors.forEach(function (processor) { ast = processor(ast, config) || ast; });
            return UglifyJs.gen_code(ast, uglifyjsParams.pretty || false);
        },

        filterFunctionCallStatement: function (ast, fnName, handler) {
            ast[1] = ast[1].filter(function(ast) {
                if (ast[0] == 'stat' && ast[1][0] == 'call' && ast[1][1][0] == 'name' && ast[1][1][1] == fnName)
                    return !handler(ast);
                return true;
            });
            return ast;
        }
    };

    JsBuild.setFileHandler('js', function JsFileHandler(content, config) { return content; });

    JsBuild.addAstPreProcessor(function (ast, config) {
        ast[1] = ast[1].filter(function(ast) { return !(ast[0] == 'stat' && ast[1][0] == 'string' && ast[1][1] == 'use strict'); });
        return ast;
    });

    global.JsBuild = JsBuild;

})(this);
