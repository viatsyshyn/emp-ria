/**
 * Created with JetBrains WebStorm.
 * User: paladin
 * Date: 12/10/12
 * Time: 5:17 AM
 * To change this template use File | Settings | File Templates.
 */

(function () {
    var cfg = ria.__CFG['#mvc'] || {};

    if (!cfg.appClass)
        throw Error('__CFG.#mvc.appClass option is required.');

    // TODO: REQUIRE mvc load/require/asset plugins

    // TODO: add bootstrapped callback and load cfg.appClass

    ria.__BOOTSTRAP.onBootstrapped(function () {
        "use strict";
        ria.__REQUIRE.requireSymbol(cfg.appClass);
    })


})();