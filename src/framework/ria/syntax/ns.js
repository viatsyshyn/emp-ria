
/** @namespace ria.__SYNTAX */
ria = ria || {};
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    function buildNs(ns, name) {
        return ns ? ns + '.' + name : name;
    }

    function ensurePath(path) {
        var p = path.split(/\./);
        var root = window;

        while (p.length) {
            var n = p.shift();
            if (!root.hasOwnProperty(n))
                Object.defineProperty(root, n, { writable: false, configurable: false, value: {} });

            root = root[n];
        }
    }

    ria.__SYNTAX.getFullName = function (name) {
        return buildNs(CurrentNamespace, name);
    };

    ria.__SYNTAX.define = function (name, def) {
        // TODO: define object in ns
    };

    var CurrentNamespace = null;

    /**
     * @param {String} name
     * @param {Function} callback
     * @constructor
     */
    ria.__SYNTAX.NS = function (name, callback) {
        var old = CurrentNamespace;
        //noinspection JSUnusedAssignment
        CurrentNamespace = name;
        callback();
        CurrentNamespace = old;
    }
})();