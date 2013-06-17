(function () {
    "use strict";

    ria.__REQUIRE.addAssetAlias('ria.templates.TemplateBind');

    var isLoaderReady = false;
    var loadQueue = [];
    ria.__REQUIRE.requireSymbol('ria.ajax.Task')
        .addReadyCallback(function () {
            isLoaderReady = true;
            setTimeout(function () {
                loadQueue.forEach(function (_) { doLoad.apply(this, _); });
            }, 1);
        });

    function doLoad(src, callback) {
        new ria.ajax.Task(src)
            .method(ria.ajax.Method.GET)
            .run()
                .then(function(content) {
                    var fn = jade.compile(content, {self: true, compileDebug: true, filename: src});
                    callback(fn, null);
                })
                .catchError(function (error) {
                    callback(null, error);
                        });
    }

    ria.__REQUIRE.addLoader(
        function filter(path) {
            return /\.jade$/.test(path);
        },

        function loader(src, callback) {
            if (isLoaderReady)
                doLoad(src, callback);
            else
                loadQueue.push([src, callback]);
        }
    )
})();