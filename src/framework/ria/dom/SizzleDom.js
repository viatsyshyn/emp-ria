/**
 * Usage:
 * window.$$ = ria.dom.Dom;
 * $$('A')
 *      .on('click', function(node, event) {
 *          return true;
 *      })
 *      .off('click', handler)
 *      .on('click', 'span', function (node, event) {
 *
 *      })
 *      .off('click', 'span', handler)
 */

REQUIRE('ria.dom.Dom');

NAMESPACE('ria.dom', function () {
    "use strict";

    if ('undefined' === typeof Sizzle)
        throw Error('Sizzle is not defined.');

    /** @class ria.dom.SizzleDom */
    CLASS(
        'SizzleDom', EXTENDS(ria.dom.Dom), [

            OVERRIDE, function $$(instance, clazz, ctor, args) {
                var genericTypes = [],
                    genericSpecs = [];

                if (!(instance instanceof clazz))
                    instance = ria.__API.getInstanceOf(clazz);

                if (_DEBUG && ria.__CFG.enablePipelineMethodCall) for(var name_ in instance) {
                    //noinspection UnnecessaryLocalVariableJS,JSUnfilteredForInLoop
                    var f_ = instance[name_];

                    // TODO: skip all ctors
                    if (typeof f_ === 'function' && !(/^\$.*/.test(name_)) && name_ !== 'constructor') {
                        instance[name_] = f_.bind(instance);
                        if (f_.__META) {
                            var fn = ria.__API.getPipelineMethodCallProxyFor(f_, f_.__META, instance, genericTypes, genericSpecs);
                            Object.defineProperty(instance, name_, { writable : false, configurable: false, value: fn });
                        }
                    }

                    if (_DEBUG && /^\$.*/.test(name_)) {
                        instance[name_] = undefined;
                    }
                }

                if (ria.__CFG.enablePipelineMethodCall && ctor.__META) {
                    ctor = ria.__API.getPipelineMethodCallProxyFor(ctor, ctor.__META, instance, genericTypes, genericSpecs);
                }

                if (_DEBUG) for(var name in clazz.__META.properties) {
                    if (clazz.__META.properties.hasOwnProperty(name)) {
                        instance[name] = null;
                    }
                }

                ctor.apply(instance, args);

                _DEBUG && Object.seal(instance);

                return instance;
            },

            function $(dom_) {
                BASE(dom_);
            },

            /* Search tree */

            OVERRIDE, function find_(selector) {
                return new SELF(Sizzle(selector, this._dom[0]));
            },

            [[String]],
            OVERRIDE, Boolean, function is(selector) {
                return this._dom.some(function (el) {
                    try {
                        return Sizzle['matchesSelector'](el, selector);
                    } catch (e) {
                        _DEBUG && console.error(e.toString());
                        return false;
                    }
                });
            }
        ]);

    ria.dom.Dom.SET_IMPL(ria.dom.SizzleDom);
});