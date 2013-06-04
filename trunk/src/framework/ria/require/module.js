/**
 * Created with JetBrains WebStorm.
 * User: C01t
 * Date: 6/4/13
 * Time: 10:38 PM
 * To change this template use File | Settings | File Templates.
 */

(function () {
    "use strict";

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
            ria.__REQUIRE.load(dep.id)
                .done(processDeps);
        }

        if (this.isReady())
            this.state = ModuleState.Loaded;

        this.deps.push(dep);
    };

    ModuleDescriptor.prototype.addReadyCallback = function addReadyCallback(fn) {
        this.cbs.push(fn);

        this.isReady() && fn();
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

        if (this.deps.every(function (_) { return _.process(); })) {
            this.state = ModuleState.Error;
            this.cbs.forEach(function (_) { _(); });
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
            return modulesMap.hasOwnProperty(module)
                ? modulesMap[module]
                : (modulesMap[module] = new ModuleDescriptor(module));
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

        var HTTP_PATH_REGEX = /(https?:\/\/[^\/]+\/[^:]*)/;
        ModuleDescriptor.getCurrentModuleUri = function () {
            try {
                //noinspection ExceptionCaughtLocallyJS
                throw Error();
            } catch(e) {
                if (e.stack == null)
                    throw Error('This environment is not supported (e.stack == null');

                var stack = e.stack.toString().split(/\n/ig);
                var s = stack.pop();
                while (stack.length > 0 && (!s || !s.match(HTTP_PATH_REGEX)))
                    s = stack.pop();

                var matches = s.match(HTTP_PATH_REGEX) || [];
                return matches.pop().split(/\?/).shift();
            }
        };

        ModuleDescriptor.getCurrentModule = function () {
            return this.getById(this.getCurrentModuleUri());
        }
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

    ria.__REQUIRE.ModuleDescriptor = ModuleDescriptor;
})();