REQUIRE('ria.templates.Exception');
REQUIRE('ria.templates.IConverterFactory');

REQUIRE('ria.reflection.ReflectionFactory');

NAMESPACE('ria.templates', function () {

    /** @class ria.templates.ConverterFactoriesManager */
    CLASS(
        'ConverterFactoriesManager', [
            function $() {
                this._map = {};
                this._cache = {};
            },

            [[ria.templates.IConverterFactory]],
            VOID, function register(factory) {
                var hashCode = factory.getHashCode();
                if (this._map.hasOwnProperty(hashCode))
                    throw new ria.templates.Exception('Factory ' + ria.__API.getIdentifierOfValue(factory) + ' already registered');

                this._map[hashCode] = factory;
            },

            [[ria.templates.IConverterFactory]],
            PUBLIC, VOID, function unregister(factory) {
                var hashCode = factory.getHashCode();
                if (!this._map.hasOwnProperty(hashCode))
                    throw new ria.templates.Exception('Factory ' + ria.__API.getIdentifierOfValue(factory) + ' not registered');

                delete this._map[factory.getHashCode()];
            },

            [[Function]],
            ria.templates.IConverter, function create(converterClass) {
                var name = ria.__API.getIdentifierOfType(converterClass);
                if (this._cache.hasOwnProperty(name))
                    return this._cache[name];

                for (var key in this._map) {
                    var factory = this._map[key];
                    if (factory.canCreate(converterClass))
                        return this._cache[name] = factory.create(converterClass);
                }

                throw new Exception('No factory agreed to create convertor ' + name);
            }
        ]);

    /** @class ria.templates.ConverterFactories */
    ria.templates.ConverterFactories = new ria.templates.ConverterFactoriesManager;
});