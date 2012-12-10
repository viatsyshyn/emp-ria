/**
 * Created with JetBrains WebStorm.
 * User: paladin
 * Date: 12/10/12
 * Time: 11:49 AM
 * To change this template use File | Settings | File Templates.
 */

(function () {
    // load ria.require
    ria.__BOOTSTRAP.REQUIRE('ria/require/loader.js');
    ria.__BOOTSTRAP.REQUIRE('ria/require/require.js');

    var cfg = ria.__CFG['#require'];
    var plugins = cfg.plugins;
    while (plugins.length > 0) {
        ria.__BOOTSTRAP.REQUIRE(plugins.shift());
    }

    console.info('ria.require.js bootstrapped.');
})();