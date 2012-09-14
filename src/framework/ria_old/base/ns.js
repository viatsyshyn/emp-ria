(function (__API, ria, global) {
    "use strict";

    function toString() { return this.__IDENTIFIER__; }

    function addNamespaceMeta(nsObj, name, root) {
        ria.defineConst(nsObj, {
            __IDENTIFIER__: (root.__IDENTIFIER__ ? root.__IDENTIFIER__ + '.' + name : name),
            toString: toString
        })
    }

    addNamespaceMeta(ria, 'ria', global);

    var currentNamespace = window;
    function addNamespace(path, cb) {
        var p = path.split(/\./);
        var name = p.pop();
        var root = currentNamespace;
        var oldRoot = root;

        while (p.length) {
            var n = p.shift();
            if (!root[n]) {
                ria.defineConst(root, n, {});
                addNamespaceMeta(root[n], n, root);
            }

            root = root[n];
        }

        if (!root[name])
            ria.defineConst(root, name, {});

        if (root[name].__IDENTIFIER__ === undefined)
            addNamespaceMeta(root[name], name, root);

        if (cb) {
            currentNamespace = root[name];
            cb(currentNamespace);
            currentNamespace = oldRoot;
        }
    }

    function getCurrentNamespace () {
        return currentNamespace;
    }

    function addDefinition(name, def) {
        var ns = getCurrentNamespace().__IDENTIFIER__;
        ria.defineConst(def, '__IDENTIFIER__', ns ? ns + '.' + name : name);
        ria.defineConst(getCurrentNamespace(), name, def);
    }

    ria.defineConst(__API, {
        /** @class ria.__API.defineNamespace */
        defineNamespace: addNamespace,
        /** @class ria.__API.getCurrentNamespace */
        getCurrentNamespace: getCurrentNamespace,
        /** @class ria.__API.addToNamespace */
        addToNamespace: addDefinition
    })

})(ria.__API, ria, ria.global);