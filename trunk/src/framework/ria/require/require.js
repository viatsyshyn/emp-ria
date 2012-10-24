ria = ria || {};
ria.__REQUIRE = ria.__REQUIRE || {};

(function () {
    "use strict";

    function defer(fn, args, scope) {
        setTimeout(function () { fn.apply(scope || this, args || []); }, 1);
    }

    function Module(uri) {
        var callbacks = [];
        var deps = [];
        var loaded = null;
        var resolved = false;

        ria.__REQUIRE.load(uri)
            .done(function (content) {
                loaded = true;
                defer(updateTree);
            })
            .error(function (error) {
                loaded = false;
                throw ria.__API.Exception('Error loading URL "' + uri + '"', error);
            });

        return {
            done: [].push.bind(callbacks),
            require: [].push.bind(deps)
        }
    }

    var modulesCache = {};
    function getModule(uri) {
        if (!modulesCache.hasOwnProperty(uri))
            modulesCache[uri] = Module(uri);

        return modulesCache[uri];
    }

    function updateTree() {

    }

    ria.__REQUIRE.requireSymbol = function (symbol) {

    };

    ria.__REQUIRE.requireAsset = function (uri) {

    };
})();
