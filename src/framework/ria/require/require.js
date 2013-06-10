ria = ria || {};
ria.__REQUIRE = ria.__REQUIRE || {};

(function () {
    "use strict";

    var global = this;

    function defer(fn, args, scope) {
        setTimeout(function () { fn.apply(scope || this, args || []); }, 1);
    }

    ria.__REQUIRE.init = function (cfg, onBootstraped) {
        onBootstraped.forEach(function (_) { defer(_) } );
    };

    function resolve(path) {
        var original = path;

        if (/^([0-9a-z_$]+(\.[0-9a-z_$]+)*)$/gi.test(path))
            path = path.replace(/\./gi, '/') + '.js';

        var libs = ria.__CFG['#require'].libs;
        var appRoot = ria.__CFG['#require'].appRoot;
        var appCodeDir = ria.__CFG['#require'].appCodeDir;

        for(var prefix in libs) if (libs.hasOwnProperty(prefix)) {
            if (path.substr(0, prefix.length) == prefix) {
                path = libs[prefix] + path;
                break;
            }
        }

        path = path.replace(/^~\//gi, appRoot);
        path = path.replace(/^\.\//gi, appCodeDir);

        if (!path.match(/^\//i))
            path = appCodeDir + path;

        path = path.replace(/\/\//gi, '/');

        return path;
    }

    ria.__REQUIRE.requireAsset = function (uri) {
        var dep = ria.__REQUIRE.ModuleDescriptor.getById(resolve(uri));

        ria.__REQUIRE.ModuleDescriptor.getCurrentModule()
            .addDependency(dep);

        return dep;
    };

    ria.__REQUIRE.requireSymbol = function (symbol) {
        var uri = symbol.replace(/\./g, '/') + '.js';

        ria.__REQUIRE.ModuleDescriptor.getCurrentModule()
            .addReadyCallback(function (content) {
                var root = window;
                symbol.split('.').forEach(function (part) {
                    if (!root.hasOwnProperty(part))
                        throw Error('Symbol "' + symbol + '" not loaded.');

                    root = root[part];
                });
            });

        return ria.__REQUIRE.requireAsset(uri);
    };

    ria.__REQUIRE.addCurrentModuleCallback = function (ns, callback) {
        ria.__REQUIRE.ModuleDescriptor.getCurrentModule()
            .addReadyCallback(function () {
                ria.__SYNTAX.NS(ns, callback);
            });
    };

    /**
     * @param {String} uri
     * @return {*}
    ria.__REQUIRE.getContent = function (uri) {
        return getModule(uri).content();
    };
    */

    ria.__REQUIRE.onReady = function (cb) {
        root.addReadyCallback(cb);
    };


    var root = ria.__REQUIRE.ModuleDescriptor.getCurrentModule();

    if (root.isNotLoaded())
        root.state = 2; // this is a hack
})();