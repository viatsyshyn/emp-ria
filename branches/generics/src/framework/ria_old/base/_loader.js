/**
 * _loader module
 *
 * Uses similar to require.js mechanics, but callbacks are
 * called only if all dependencies' callbacks are successful
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@emp-game.com
 * @date 03.05.11
 * @fileoverview _loader module
 */

(function (ria) {
    "use strict";

    var staticContent = {};
    //noinspection JSUnusedGlobalSymbols
    var customLoaders = {
        json: function (uri, callback) {
            Loader.staticContentTransport(uri, function(state, content) {
                if (!state)
                    callback(state, false);

                try {
                    callback(state, JSON.parse(content));
                } catch (e) {
                    setTimeout(function () { throw e; }, 1);
                    callback(state, false);
                }
            })
        },

        html: function (uri, callback) {
            Loader.staticContentTransport(uri, callback);
        }
    };

    var Loader = {
        transport: ria.__API.transports.ScriptTagTransport,
        staticContentTransport: ria.__API.transports.AjaxTransport,

        load: function (src, callback) {
            var uri = src + (/\?/.test(src) ? '&' : '?') + '_=' + Math.random().toString(36).substr(2);
            ria.__API._loader.isReady = false;

            for(var ext in customLoaders) if (customLoaders.hasOwnProperty(ext)) {
                if (new RegExp('\\.' + ext + '$').test(src)) {
                    return customLoaders[ext](uri, function(state, content) {
                        if (!state)
                            callback(src, false);

                        try {
                            staticContent[src] = content;
                            callback(src, true);
                        } catch (e) {
                            setTimeout(function () { throw e; }, 1);
                            callback(src, false);
                        }
                    });
                }
            }

            return this.transport(src, callback.bind(ria.global, src));
        },

        resolve: function resolve(name) {
            return name.match(/^http:\/\//) ? name : ria.BASE_MODULE_URL + name;
        },

        getStaticContent: function (src) {
            return staticContent[src];
        },

        setStaticContent: function (src, content) {
            staticContent[src] = content;
        },

        addCustomLoader: function (ext, loader) {
            customLoaders[ext] = loader;
        }
    };

    var HTTP_PATH_REGEX = /(https?:\/\/[^\/]+\/[^:]*)/;

    function getCallerRootModuleId() {
        try {
            //noinspection ExceptionCaughtLocallyJS
            throw Error();
        } catch(e) {
            var stack = e.stack.toString().split(/\n/ig);
            var s = stack.pop();
            while (stack.length > 0 && (!s || !s.match(HTTP_PATH_REGEX)))
                s = stack.pop();

            var matches = s.match(HTTP_PATH_REGEX) || [];
            return matches.pop().split(/\?/).shift();
        }
    }

    var ModuleState = {
        NotLoaded: undefined,
        Loading: 1,
        Loaded: 2,
        Executed: 3,
        Error: 255
    };

    /**
     * @constructor
     * @param {String} id
     */
    function ModuleDescriptor(id) {
        this.id = id;
        this.deps = [];
        this.cbs = [];
        this.state = ModuleState.NotLoaded;
    }

    ModuleDescriptor.prototype.addDependency = function addDependency(dep) {
        ModuleDescriptor.ensureNoCycles(dep, this);

        if (dep.isNotLoaded() && !dep.isLoading() && !dep.hasError()) {
            dep.state = ModuleState.Loading;
            Loader.load(dep.id, processDeps);
        }

        if (this.isReady())
            this.state = ModuleState.Loaded;

        this.deps.push(dep);
    };

    ModuleDescriptor.prototype.addReadyCallback = function addReadyCallback(fn) {
        if (this.isReady()) {
            fn(); return ;
        }

        this.cbs.push(fn);
    };

    ModuleDescriptor.prototype.isReady = function isReady() {
        if (this.state == ModuleState.Loaded && this.cbs.length < 1 && this.deps.length < 1)
            this.state = ModuleState.Executed;

        return this.state === ModuleState.Executed;
    };

    ModuleDescriptor.prototype.isNotLoaded = function isNotLoaded() {
        return this.state === ModuleState.NotLoaded;
    };

    ModuleDescriptor.prototype.isLoading = function isLoading() {
        return this.state === ModuleState.Loading;
    };

    ModuleDescriptor.prototype.hasError = function hasError() {
        return this.state == ModuleState.Error;
    };

    ModuleDescriptor.prototype.process = function process() {
        if (this.isLoading() || this.isNotLoaded())
            return false;

        if (this.isReady())
            return true;

        if (this.hasError())
            return false;

        var all_executed = true;
        for(var index = 0 ; index < this.deps.length; index++)
            all_executed = this.deps[index].process() && all_executed;

        if (all_executed) {
            this.state = ModuleState.Error;
            for(var i = 0; i < this.cbs.length; i++)
                this.cbs[i]();

            this.state = ModuleState.Executed;
        }

        return this.isReady();
    };

    (function () {
        var modulesMap = {};
        
        /**
         * @param {String} module
         * @returns ModuleDescriptor
         */
        ModuleDescriptor.getById = function getById(module) {
            if (modulesMap.hasOwnProperty(module))
                return modulesMap[module];

            return modulesMap[module] = new ModuleDescriptor(module);
        };

        ModuleDescriptor.each = function each(cb) {
            for(var k in modulesMap)
                if (modulesMap.hasOwnProperty(k))
                    cb(k, modulesMap[k]);    
        };

        ModuleDescriptor.ensureNoCycles = function ensureNoCycles(root, child) {
            var deps = [child.id];

            function process(root, depth) {
                deps[depth] = root.id;
                if (root == child)
                    return true;

                for (var i = 0; i < root.deps.length; i++)
                    if (process(root.deps[i], depth + 1))
                        return true;

                return false;
            }

            if (process(root, 1)) {
                root.state = ModuleState.Error;
                child.state = ModuleState.Error;
                throw new Error('Cycle dependency detected: ' + deps.join(' -> '))
            }
        };
    })();

    function processDeps(module, loaded) {
        if (loaded === false)
            throw Error('Error loading: ' + module);

        if (module)
            ModuleDescriptor.getById(module).state = ModuleState.Loaded;

        var is_all_executed = true;
        ModuleDescriptor.each(function (id, module) {
            is_all_executed = module.process() && is_all_executed;
        });

        if (is_all_executed) {
            ria.__API._loader.isReady = true;
            ria.ready(ria.__EMPTY);
        }
    }

    //noinspection JSUnusedGlobalSymbols
    ria.__API._loader = {
        getCallerModuleDescriptor: function () {
            var root = ModuleDescriptor.getById(getCallerRootModuleId());
            if ((root.isLoading() || root.isNotLoaded()))
                root.state = ModuleState.Loaded;

            return root;
        },
        getFullModuleId: Loader.resolve,
        getModuleDescriptor: function(name) {
            return ModuleDescriptor.getById(name);
        },
        setCustomTransport: function(transport) {
            Loader.transport = transport;
        },
        setCustomStaticTransport: function(transport) {
            Loader.staticContentTransport = transport;
        },
        getStaticContent: function (id) {
            return Loader.getStaticContent(id);
        },
        setStaticContent: function (id, content) {
            return Loader.setStaticContent(id, content);
        },
        addCustomLoader: function (ext, loader) {
            return Loader.addCustomLoader(ext, loader);
        }
    };
})(ria, ria.global);