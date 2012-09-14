"use strict";

REQUIRE('hwa.reflection.ReflectionFactory');
REQUIRE('hwax.templates.ConverterFactoriesManager');

/** @namespace hwax.templates */
NAMESPACE('hwax.templates', function () {

    /** @class hwax.templates.ModelBind */
    ANNOTATION(function ModelBind(name, converter) {});

    /**
     * @class hwax.templates.TemplateBind
     * @constructor
     * @param {String} tpl
     */
    ANNOTATION(function TemplateBind(tpl) {});

    /** @class hwax.templates.Template */
    CLASS(ABSTRACT, 'Template', [

        PUBLIC, Object, 'parent',
        PROTECTED, Function, 'modelClass',
        PROTECTED, Object, 'context', // todo: make this readonly
        PROTECTED, Object, 'tpl',
        PROTECTED, Object, 'model', // todo: make this readonly

        PUBLIC, function __constructor() {
            this.context = this.__scopesStack[0]; // this is a hack !!!
            this.modelClass = null;
            this.bindings = [];
            this.bundle = '';
            this.bind();
        },

        PRIVATE, VOID, function bind() {
            var self = hwa.reflection.ReflectionFactory(this.getClass());

            // Bind template
            if (!self.hasAnnotation(hwax.templates.TemplateBind))
                throw new Exception('Template class is not bound to template. Please use ' + hwax.templates.TemplateBind.__IDENTIFIER__);

            this.tpl = self.getAnnotation(hwax.templates.TemplateBind).tpl;

            // Bind model
            if (!self.hasAnnotation(hwax.templates.ModelBind))
                throw new Exception('Template class is not bound to model. Please use ' + hwax.templates.ModelBind.__IDENTIFIER__);

            this.modelClass = self.getAnnotation(hwax.templates.ModelBind).name;
            var model = hwa.reflection.ReflectionFactory(this.modelClass);

            var selfProperties = self.getProperties();
            var modelProperties = model.getProperties();

            for (var i = 0; i < selfProperties.length; i++) {
                var property = selfProperties[i];
                if (!property.isPublic())
                    continue;

                var bindParams = property.getAnnotation(hwax.templates.ModelBind);
                if (!bindParams)
                    continue;

                var bind = {
                    setter: property.getSetterName(),
                    getter: null,
                    converter: bindParams.converter
                };

                var modelPropertyName = bindParams.name || property.getShortName();
                for (var j = 0; j < modelProperties.length; j++) {
                    var modelProperty = modelProperties[j];
                    if (!modelProperty.isPublic())
                        continue;

                    if (modelProperty.getShortName() != modelPropertyName)
                        continue;

                    bind.getter = modelProperty.getGetterName();
                    break;
                }

                if (bind.getter === null)
                    throw Error('Property "' + modelPropertyName + '" not found in model ' + model.getName());

                if (bind.converter !== null) {
                    if (bind.converter === undefined)
                        throw Error('Expected converter class, but got undefined');

                    var ref = hwa.reflection.ReflectionFactory(bind.converter);
                    if (!ref.implementsInterface(hwax.templates.IConverter))
                        throw Error('Converter class ' + ref.getName() + ' expected to implement ' + hwax.templates.IConverter.__IDENTIFIER__);

                    bind.converter = hwax.templates.ConverterFactories.create(bind.converter);
                }

                this.bindings.push(bind);
            }
        },

        PUBLIC, VOID, function assign(model) {
            if (!(model instanceof this.modelClass))
                throw Error();

            this.model = model;

            for (var i = 0; i < this.bindings.length; i++) {
                var bind = this.bindings[i];

                var value = model[bind.getter]();
                if (bind.converter)
                    value = bind.converter.convert(value);

                this.context[bind.setter](value);
            }
        },

        PUBLIC, ABSTRACT, String, function render() {},

        PUBLIC, VOID, function renderTo(to) {
            jQuery(this.render()).appendTo(to);
        },
        PUBLIC, VOID, function renderBuffer() {
            this.bundle += this.render();
        },

        PUBLIC, String, function flushBuffer() {
            var buffer = this.bundle;
            this.bundle = '';
            return buffer;
        },
        PUBLIC, VOID, function flushBufferTo(to) {
            jQuery(this.flushBuffer()).appendTo(to);
        },

        PRIVATE, SELF, function getInstanceOfTemplate(tplClass, options) {

            var ref = hwa.reflection.ReflectionFactory(tplClass);
            if (!ref.isSubclassOf(hwax.templates.Template))
                throw new Exception('Can render model only with ' + hwax.templates.Template.__IDENTIFIER__);

            var tpl = ref.newInstance();
            tpl.setParent(DYNAMIC_CAST(this, this.getClass()));

            var properties = ref.getProperties();
            outer: for(var k in options) if (options.hasOwnProperty(k)) {
                for(var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    if (property.getShortName() == k) {
                        tpl[property.getSetterName()](options[k]);
                        continue outer;
                    }
                }

                throw new Exception('Unknown property ' + k + ' in class ' + ref.getName());
            }

            return tpl;
        },

        [Class, Function],
        PUBLIC, String, function renderWith(data, tplClass) {
            return this.renderWith(data, tplClass, {});
        },

        [Class, Function, Object],
        PUBLIC, String, function renderWith(data, tplClass, options) {
            var tpl = this.getInstanceOfTemplate(tplClass, options);
            tpl.assign(data);
            return tpl.render();
        },

        [ArrayOf(Class), Function],
        PUBLIC, String, function renderWith(collection, tplClass) {
            return this.renderWith(collection, tplClass, {});
        },

        [ArrayOf(Class), Function, Object],
        PUBLIC, String, function renderWith(collection, tplClass, options) {
            var tpl = this.getInstanceOfTemplate(tplClass, options);
            for (var i = 0; i < collection.length; i++) {
                tpl.assign(collection[i]);
                tpl.renderBuffer();
            }
            return tpl.flushBuffer();
        }
    ]);
});