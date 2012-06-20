(function () {
    "use strict";

    function toString() { return this.__IDENTIFIER__; }

    function addNamespaceMeta(nsObj, name, root) {
        Object.defineProperties(nsObj, {
            __IDENTIFIER__: {
                value: (root.__IDENTIFIER__
                        ? [root.__IDENTIFIER__, name].join('.')
                        : name),

                writable: false,
                configurable: false,
                enumerable: false
            },

            toString: {
                value: toString,
                writable: false,
                configurable: false,
                enumerable: false
            }
        })
    }

    addNamespaceMeta(hwa, 'hwa', window);

    /*function copy (destination, source) {
        for(var k in source)
            if (source.hasOwnProperty(k))
                destination[k] = source[k];
    }*/

    var currentNamespace = window;
    function addNamespace(path, cb) {
        var p = path.split(/\./);
        var name = p.pop();
        var root = currentNamespace;
        var oldRoot = root;

        while (p.length) {
            var n = p.shift();
            if (!root[n]) {
                Object.defineProperty(root, n, {
                    value: {},
                    writable: false,
                    configurable: false,
                    enumerable: true
                });

                addNamespaceMeta(root[n], n, root);
            }

            root = root[n];
        }

        if (!root[name])
            Object.defineProperty(root, name, {
                value: {},
                writable: false,
                configurable: false,
                enumerable: true
            });

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
        Object.defineProperty(def, '__IDENTIFIER__', {
            value: (ns ? [ns, name].join('.'): name),
            writable: false,
            configurable: false,
            enumerable: false
        });

        Object.defineProperty(getCurrentNamespace(), name, {
            value: def,
            writable: false,
            configurable: false,
            enumerable: true
        });
    }

    hwa.__API.defineNamespace = addNamespace;
    hwa.__API.getCurrentNamespace = getCurrentNamespace;
    hwa.__API.addToNamespace = addDefinition;
})();