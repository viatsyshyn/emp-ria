ria = ria || {};
ria.__REQUIRE = ria.__REQUIRE || {};

(function () {
    "use strict";

    var global = this;

    function defer(fn, args, scope) {
        setTimeout(function () { fn.apply(scope || this, args || []); }, 1);
    }

    function Module(uri) {
        var callbacks = [];
        var deps = [];
        var loaded = null;
        var resolved = false;
        var depsResolved = 0;
        var content = null;

        ria.__REQUIRE.load(uri)
            .done(function (c) {
                console.info('Loader.done for ' + uri);
                content = c;
                loaded = true;
                updateState();
            })
            .error(function (error) {
                console.info('Loader.error for ' + uri);
                loaded = false;
                throw Error('Error loading URL "' + uri + '", Due to ' + error.toString());
            });

        function updateState() {
            console.info('updateState for ' + uri);

            if (loaded === false)
                return;

            if(!loaded || depsResolved != deps.length)
                return;

            resolved = true;
            console.info('callbacks of ' + uri);
            callbacks.forEach(function (callback) { defer(callback); });
        }

        return {
            done: function (cb) {
                if (resolved) {
                    defer(cb);
                } else {
                    callbacks.push(cb);
                }
                return this;
            }
            ,
            require: function (m) {
                deps.push(m);

                if (!resolved) {
                    m.done(function () {
                        depsResolved++;
                        defer(updateState);
                    })
                }

                return this;
            }
            ,
            content: function () {
                return content;
            }
            // ,
            // isResolved: function () { return resolved; }
        }
    }

    var modulesCache = {};
    function getModule(uri) {
        if (!modulesCache.hasOwnProperty(uri)) {
            console.info('Create module for ' + uri);
            modulesCache[uri] = Module(uri);
        }

        return modulesCache[uri];
    }

    var HTTP_PATH_REGEX = /(https?:\/\/[^\/]+\/[^:]*)/;
    function getCurrentModuleUri() {
        try {
            //noinspection ExceptionCaughtLocallyJS
            throw Error();
        } catch(e) {
            if (e.stack == null)
                throw Error('This environment is not supported (e.stack == null');

            var stack = e.stack.toString().split(/\n/ig);
            var s = stack.pop();
            while (stack.length > 0 && (!s || !s.match(HTTP_PATH_REGEX)))
                s = stack.pop();

            var matches = s.match(HTTP_PATH_REGEX) || [];
            return matches.pop().split(/\?/).shift();
        }
    }

    /*function updateModuleState(m) {

    }

    function updateTreeState() {
        for(var key in modulesCache) if (modulesCache.hasOwnProperty(key)) {
            updateModuleState(modulesCache[key]);
        }
    }*/

    ria.__REQUIRE.init = function (cfg, onBootstraped) {
        onBootstraped.forEach(function (_) { defer(_) } );
    };

    function resolve(path) {
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

        return path.replace(/\/\//gi, '/');
    }

    ria.__REQUIRE.requireAsset = function (uri) {
        var dep = getModule(resolve(uri));

        getModule(getCurrentModuleUri())
            .require(dep);

        return dep;
    };

    ria.__REQUIRE.requireSymbol = function (symbol) {
        var uri = symbol.replace(/\./g, '/') + '.js';

        return ria.__REQUIRE.requireAsset(uri)
            .done(function (content) {
                var root = window;
                symbol.split('.').forEach(function (part) {
                    if (!root.hasOwnProperty(part))
                        throw Error('Symbol "' + symbol + '" not loaded.');

                    root = root[part];
                });
            })
    };

    ria.__REQUIRE.addCurrentModuleCallback = function (ns, callback) {
        getModule(getCurrentModuleUri())
            .done(function () {
                ria.__SYNTAX.NS(ns, callback);
            });
    };

    /**
     * @param {String} uri
     * @return {*}
     */
    ria.__REQUIRE.getContent = function (uri) {
        return getModule(uri).content();
    };

})();