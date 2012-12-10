/**
 * Created with JetBrains WebStorm.
 * User: paladin
 * Date: 12/9/12
 * Time: 9:44 AM
 * To change this template use File | Settings | File Templates.
 */

var ria = {};

(function () {
    ria.__BOOTSTRAP = ria.__BOOTSTRAP || {};

    var scripts = document.getElementsByTagName('script');
    for(var index = 0; index < scripts.length; index++) {
        var script = scripts[index];

        if (script.src.toString().match(/ria\/_bootstrap\.js$/i)) {
            ria.__CFG = JSON.parse(script.innerText.toString().split('=').pop());
        }
    }

    var appDir = "";
    var root = ria.__CFG["#require"].appRoot;
    if (root === undefined)
        root = window.location.pathname;

    appDir = resolve(ria.__CFG["#require"].appCodeDir || "~/app/");

    // configuring ria.require.js
    ria.__CFG["#require"].appRoot = root;
    ria.__CFG["#require"].appCodeDir = appDir;

    function resolve(path) {
        if (/^([0-9a-z_$]+(\.[0-9a-z_$]+)*)$/gi.test(path))
            path = path.replace(/\./gi, '/') + '.js';

        path = path.replace(/^~\//gi, root);
        path = path.replace(/^\.\//gi, appDir);

        if (!path.match(/^\//i))
            path = appDir + path;

        return path.replace(/\/\//gi, '/');
    }

    ria.__BOOTSTRAP.REQUIRE = REQUIRE;

    function REQUIRE(path) {
        var path_ = resolve(path);
        document.write("<" + "script src='" + path_ + "' type='text/javascript'></" + "script>");
    }

    if (!ria.__CFG._bootstraps)
        ria.__CFG._bootstraps = [];

    // configure bootstraps
    for(var k in ria.__CFG) if (ria.__CFG.hasOwnProperty(k) && /^#./i.test(k)) {
        var name = k.replace('#', 'ria/');
        if (ria.__CFG._bootstraps.indexOf(name) < 0)
            ria.__CFG._bootstraps.push(name);
    }

    Object.freeze(ria.__CFG);

    if (ria.__CFG.stackTraceJs) {
        REQUIRE(ria.__CFG.stackTraceJs);
    }

    // load ria.base
    REQUIRE('ria/base/0.common.js');
    REQUIRE('ria/base/0.pipeline.js');
    REQUIRE('ria/base/0.stacktrace.js');
    REQUIRE('ria/base/5.annotations.js');
    REQUIRE('ria/base/5.delegates.js');
    REQUIRE('ria/base/5.enum.js');
    REQUIRE('ria/base/5.identifier.js');
    REQUIRE('ria/base/6.interface.js');
    REQUIRE('ria/base/8.class.js');
    REQUIRE('ria/base/9.exception.js');

    // load ria.syntax
    REQUIRE('ria/syntax/annotations.js');
    REQUIRE('ria/syntax/assert.js');
    REQUIRE('ria/syntax/class.js');
    REQUIRE('ria/syntax/delegate.js');
    REQUIRE('ria/syntax/enum.js');
    REQUIRE('ria/syntax/exception.js');
    REQUIRE('ria/syntax/identifier.js');
    REQUIRE('ria/syntax/interface.js');
    REQUIRE('ria/syntax/ns.js');
    REQUIRE('ria/syntax/parser.js');
    REQUIRE('ria/syntax/type-hints.js');

    console.info('ria.js bootstrapped.');

    var boostraps = ria.__CFG._bootstraps;
    while(boostraps.length > 0) {
        REQUIRE(boostraps.shift() + '/_bootstrap.js');
    }
})();