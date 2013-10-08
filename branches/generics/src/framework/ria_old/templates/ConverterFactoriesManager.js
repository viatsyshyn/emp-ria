"use strict";

REQUIRE('hwa.reflection.ReflectionFactory');

REQUIRE('hwax.templates.IConverter');
REQUIRE('hwax.templates.IConverterFactory');

/** @namespace hwax.templates */
NAMESPACE('hwax.templates', function () {

    /** @class hwax.templates.ConverterFactoriesManager */
    CLASS('ConverterFactoriesManager', [
        PRIVATE, Object, 'map',

        PUBLIC, function __constructor() {
            this.map = {};
        },

        [hwax.templates.IConverterFactory],
        PUBLIC, VOID, function register(factory) {
            if (this.map[factory.getHashCode()])
                throw new Exception('Factory ' + factory.__IDENTIFIER__ + ' already registered');

            this.map[factory.getHashCode()] = factory;
        },

        [hwax.templates.IConverterFactory],
        PUBLIC, VOID, function unregister(factory) {
            if (!this.map[factory.getHashCode()])
                throw new Exception('Factory ' + factory.__IDENTIFIER__ + ' not registered registered');

            delete this.map[factory.getHashCode()];
        },

        [Function],
        PUBLIC, hwax.templates.IConverter, function create(converterClass) {
            for (var key in this.map) {
                var factory = this.map[key];
                if (factory.canCreate(converterClass))
                    return factory.create(converterClass);
            }

            throw new Exception('No factory agreed to create ' + converterClass.__IDENTIFIER__);
        }
    ]);

    hwax.templates.ConverterFactories = new hwax.templates.ConverterFactoriesManager();
});