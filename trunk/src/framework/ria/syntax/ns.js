/** @namespace ria.__SYNTAX */
ria.__SYNTAX = ria.__SYNTAX || {};

(function () {
    "use strict";

    function buildNs(ns, name) {
        return ns ? ns + '.' + name : name;
    }

    function setPath(path, value) {
        var p = path.split(/\./);
        var root = window;
        var name = p.pop();

        while (p.length) {
            var n = p.shift();
            if (!root.hasOwnProperty(n))
                Object.defineProperty(root, n, { writable: false, configurable: false, value: {} });

            root = root[n];
        }

        if (!root.hasOwnProperty(name))
            Object.defineProperty(root, name, { writable: false, configurable: false, value: value });
    }

    ria.__SYNTAX.getFullName = function (name) {
        return buildNs(CurrentNamespace, name);
    };

    ria.__SYNTAX.define = function (name, def) {
        setPath(name, def);
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
        setPath(CurrentNamespace = name, {});
        callback();
        CurrentNamespace = old;
    }
})();