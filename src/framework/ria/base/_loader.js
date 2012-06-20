/**
 * _loader module
 *
 * Uses similar to require.js mechanics, but callbacks are
 * called only if all dependencies' callbacks are successful
 *
 * @author Volodymyr Iatsyshyn
 * @email viatsyshyn@hellowebapps.com
 * @date 03.05.11
 * @fileoverview _loader module
 */

(function () {
    "use strict";

    var depsGraph = {};
    var modulesState = {};

    function ScriptTagTransport(src, callback) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute('type', 'text/javascript');
        script_tag.setAttribute('src', src);

        //script_tag.onerror = function() { callback(false, Array.prototype.slice.call(arguments)); };

        script_tag.onload = script_tag.onreadystatechange = function() {
            if(!this.readyState
                || this.readyState == "loaded"
                || this.readyState == "complete") {

                callback(true);
            }
        };

        document.getElementsByTagName('head')[0].appendChild(script_tag);
    }

    function AjaxTransport(src, callback) {
        var xhr;
        if (window.XMLHttpRequest) {
            try {
                xhr = new XMLHttpRequest();
            } catch (e){}
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e){
                try {
                    xhr = new ActiveXObject('Microsoft.XMLHTTP');
                } catch (e){}
            }
        }

        if (xhr) {
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        callback(true, this.responseText, this);
                    } else {
                        callback(false, this.status, this);
                    }
                }
            };
            xhr.open("GET", src, true);
            xhr.send(null);
        } else {
            throw Error('Ajax not enabled');
        }

        xhr = null;
    }

    var staticContent = {};
    var customLoaders = {};
    var Loader = {
        transport: ScriptTagTransport,
        staticContentTransport: AjaxTransport,

        load: function (src, callback) {
            var uri = src + (/\?/.test(src) ? '&' : '?') + '_=' + Math.random().toString(36).substr(2);
            isSystemReady = false;
            if (/\.json$/.test(src))
                return this.staticContentTransport(uri, function(state, content) {
                    if (!state)
                        callback(src, false);
                    
                    try {
                        staticContent[src] = JSON.parse(content);
                        callback(src, true);
                    } catch (e) {
                        setTimeout(function () { throw e; }, 1);
                        callback(src, false);
                    }
                });

            if (/\.html$/.test(src))
                return this.staticContentTransport(uri, function(state, content) {
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

            for(var ext in customLoaders) {
                if (customLoaders.hasOwnProperty(ext)) {
                    var regex = new RegExp('\\.' + ext + '$');
                    if (regex.test(src)) {
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
            }

            return this.transport(src, callback.bind(hwa.global, src));
        },

        resolve: function resolve(name) {
            return name.match(/$http:\/\//) ? name : hwa.BASE_MODULE_URL + name;
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
            isSystemReady = true;
            checkReady();
        }
    }

    /**
     * Resolves dependencies
     *
     * @param {Array} deps
     * @param {Function} callback
     */
    window.hwa.__API._loader = {
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

    /**
     * Empty fn
     */
    //hwa.emptyFn = function () {};

    hwa.isBrowser = !!(typeof window !== "undefined" && navigator && document);
    hwa.isWebWorker = !hwa.isBrowser && typeof importScripts !== "undefined";

    if (hwa.isBrowser) {
        var current = hwa.global.location.toString();
        for(var i = current.length; i > 0; i--) {
            if (current.charAt(i - 1) == '/') {
                hwa.BASE_MODULE_URL = current.substr(0, i);
                break;
            }
        }
    }

    /**
     * Fires callback when DOM and all dependencies are ready
     * @param {Function} callback
     */

    var readyCallbacks = [];
    var isPageReady = !hwa.isBrowser;
    var isSystemReady = true;

    /* THE FOLLOWING CODE BLOCK IS PORTED FROM jQuery 1.5.1 */
    hwa.isBrowser && (function () {
        function onLoaded() {
            isPageReady = true;
            checkReady();
        }

        // Cleanup functions for the document ready method
        var DOMContentLoaded;
        if ( document.addEventListener ) {
            DOMContentLoaded = function() {
                document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                onLoaded();
            };

        } else if ( document.attachEvent ) {
            DOMContentLoaded = function() {
                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if ( document.readyState === "complete" ) {
                    document.detachEvent( "onreadystatechange", DOMContentLoaded );
                    onLoaded();
                }
            };
        }

        // Catch cases where $(document).ready() is called after the
        // browser event has already occurred.
        if ( document.readyState === "complete" ) {
            // Handle it asynchronously to allow scripts the opportunity to delay ready
            return setTimeout(onLoaded, 1);
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if ( document.addEventListener ) {
            // Use the handy event callback
            document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

            // A fallback to window.onload, that will always work
            window.addEventListener( "load", onLoaded, false );

        // If IE event model is used
        } else if ( document.attachEvent ) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            document.attachEvent("onreadystatechange", DOMContentLoaded);

            // A fallback to window.onload, that will always work
            window.attachEvent( "onload", onLoaded );

            // If IE and not a frame
            // continually check to see if the document is ready
            /* CODE BLOCK IS COMMENTED, TODO: ENSURE THAT CODE BLOCK IS REQUIRED
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch(e) {}

            if ( document.documentElement.doScroll && toplevel ) {
                doScrollCheck();
            }*/
        }
    })();
    /* END OF PORTED BLOCK */

    function checkReady() {
        if (isPageReady && isSystemReady) {
            while(readyCallbacks.length > 0)
                readyCallbacks.shift().call(hwa.global);
        }
    }

    hwa.ready = function ready(callback) {
        if (isPageReady && isSystemReady) {
            callback();
        } else {
            readyCallbacks.push(callback);
        }
    };
})();