REQUIRE('lib/jade.js');

(function () {
    "use strict";

    ria.__REQUIRE.addLoader(
        function filter(path) {
            return /\.jade$/.test(path);
        },

        function loader(src, callback) {
            $.ajax({ url: src, dataType: "text" })
                .done(function(content) {
                    var fn = jade.compile(content, {self: true, compileDebug: true, filename: src});
                    callback(fn, null);
                })
                .error(function (error) {
                    callback(null, error);
                });
        }
    )
})();