REQUIRE('hwa.mvc.IService');
REQUIRE('hwa.mvc.IContextable');
REQUIRE('hwa.mvc.ServiceName');

REQUIRE('hwa.reflection.ReflectionFactory');

/** @namespace hwa.mvc */
NAMESPACE('hwa.mvc', function () {
    "use strict";

    /**
     * @class hwa.mvc.Service
     * @implements hwa.mvc.IService
     * @implements hwa.mvc.IContextable
     * @abstract
     */
    CLASS(ABSTRACT, 'Service', IMPLEMENTS(hwa.mvc.IService, hwa.mvc.IContextable), [

        PUBLIC, function __constructor() {
            this.context = null;
        },

        [Override],
        PUBLIC, String, function getName() {
            var ref = hwa.reflection.ReflectionFactory(this.getClass());
            return ref.getAnnotation(hwa.mvc.ServiceName)[0]
                    || this.getClass().getName().replace('Service', '');
        },

        [Override],
        [Object],
        PUBLIC, VOID, function setContext(context) {
            this.context = context;
        },

        PUBLIC, hwa.mvc.IContext, function getContext() {
            return this.context;
        }
    ]);
});