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

    if ('undefined' === typeof jQuery)
        throw Error('jQuery is not defined.');

    var global = ('undefined' !== typeof window ? window.document : null);

    ria.dom.Event = Object; // jQuery modifies event

    /** @class ria.dom.jQueryDom */
    CLASS(
        'jQueryDom', EXTENDS(ria.dom.Dom), [
            function $(dom_) {
                VALIDATE_ARG('dom_', [Node, String, ArrayOf(Node), SELF, jQuery], dom_);
                this._dom = jQuery(global);

                if ('string' === typeof dom_) {
                    this._dom = jQuery(dom_);
                } else if (Array.isArray(dom_)) {
                    this._dom = jQuery(dom_);
                } else if (dom_ instanceof Node) {
                    this._dom = jQuery(dom_);
                } else if (dom_ instanceof NodeList) {
                    this._dom = jQuery(dom_);
                } else if (dom_ instanceof SELF) {
                    this._dom = jQuery(dom_.valueOf());
                } else if (dom_ instanceof jQuery) {
                    this._dom = dom_;
                }
            },

            /* Search tree */

            [[String]],
            OVERRIDE, SELF, function find(selector) {
                return new ria.dom.Dom(jQuery(selector, this._dom));
            },

            /* Events */

            // TODO: need a good way of implementing off()

            OVERRIDE, SELF, function on(event, selector, handler_) {
                var old_dom = this._dom;
                this._dom = this.valueOf();
                BASE(event, selector, handler_);
                this._dom = old_dom;
                return this;
            },

            OVERRIDE, SELF, function off(event, selector, handler_) {
                var old_dom = this._dom;
                this._dom = this.valueOf();
                BASE(event, selector, handler_);
                this._dom = old_dom;
                return this;
            },

            /* append/prepend */

            OVERRIDE, SELF, function appendTo(dom) {
                VALIDATE_ARG('dom', [SELF, String, Node], dom);

                if(typeof dom == "string")
                    dom = new SELF(dom);

                var dest = dom instanceof Node ? dom : dom.valueOf().shift();
                if(dest){
                    VALIDATE_ARG('dom', [Node], dest);

                    this._dom.appendTo(dest);
                }
                return this;
            },

            OVERRIDE, SELF, function prependTo(dom) {
                VALIDATE_ARG('dom', [SELF, String, Node], dom);

                if(typeof dom == "string")
                    dom = new SELF(dom);

                var dest = dom instanceof Node ? dom : dom.valueOf().shift();
                if(dest){
                    VALIDATE_ARG('dest', [Node], dest);

                    this._dom.prependTo(dest);
                }
                return this;
            },

            /* parseHTML - make static */

            [[String]],
            OVERRIDE, SELF, function fromHTML(html) {
                this._dom = jQuery(jQuery.parseHTML(html));
                return this;
            },

            /* DOM manipulations & navigation */

            OVERRIDE, SELF, function empty() {
                this._dom.empty();
                return this;
            },

            // reference https://github.com/julienw/dollardom

            [[String]],
            OVERRIDE, SELF, function descendants(selector__) {},
            [[String]],
            OVERRIDE, SELF, function parent(selector_) {
                return new ria.dom.Dom(this._dom.parent(selector_));
            },
            [[String]],
            OVERRIDE, SELF, function next(selector_) {},
            [[String]],
            OVERRIDE, SELF, function previous(selector_) {},
            [[String]],
            OVERRIDE, SELF, function first(selector_) {},
            [[String]],
            OVERRIDE, SELF, function last(selector_) {},
            [[String]],
            OVERRIDE, Boolean, function is(selector) {
                return this._dom.is(selector);
            },
            [[Object]],
            OVERRIDE, Boolean, function contains(node) {
                VALIDATE_ARG('node', [Node, SELF, ArrayOf(Node)], node);

                var nodes = [];
                if (node instanceof Node) {
                    nodes = [node];
                } else if (Array.isArray(node)) {
                    nodes = node;
                } else if (node instanceof SELF) {
                    nodes = node.valueOf();
                }

                var res = true;
                nodes.forEach(function(node){
                    if(res && !jQuery.contains(this._dom[0], node))
                        res =  false;
                }.bind(this));
                return res;
            },

            /* attributes */

            OVERRIDE, Object, function getAllAttrs() {},
            [[String]],
            OVERRIDE, Object, function getAttr(name) {
                return this._dom.attr(name);
            },
            OVERRIDE, Object, function getValue() {
                return this._dom.val();
            },
            [[Object]],
            OVERRIDE, SELF, function setAllAttrs(obj) {},
            [[String, Object]],
            OVERRIDE, SELF, function setAttr(name, value) {
                this._dom.attr(name, value);
                return this;
            },
            [[Object]],
            OVERRIDE, SELF, function setValue(value) {
                this._dom.val(value);
                return this;
            },

            /* data attributes */

            OVERRIDE, Object, function getAllData() {},
            [[String]],
            OVERRIDE, Object, function getData(name) {
                return this._dom.data(name) || null;
            },
            [[Object]],
            OVERRIDE, SELF, function setAllData(obj) {},
            [[String, Object]],
            OVERRIDE, SELF, function setData(name, value) {},

            /* classes */

            [[String]],
            OVERRIDE, Boolean, function hasClass(clazz) {
                return this._dom.hasClass(clazz);
            },
            [[String]],
            OVERRIDE, SELF, function addClass(clazz) {
                return this.toggleClass(clazz, true);
            },
            [[String]],
            OVERRIDE, SELF, function removeClass(clazz) {
               return this.toggleClass(clazz, false);
            },

            [[String, Boolean]],
            OVERRIDE, SELF, function toggleClass(clazz, toggleOn_) {
                this._dom.toggleClass(clazz, toggleOn_);
                return this;
            },

            /* css */

            [[String]],
            OVERRIDE, Object, function getCss(property) {},
            [[String, Object]],
            OVERRIDE, SELF, function setCss(property, value) {
                this._dom.css(property, value);
                return this;
            },
            [[Object]],
            OVERRIDE, SELF, function updateCss(props) {},

            /* iterator */

            [[ria.dom.DomIterator]],
            OVERRIDE, SELF, function forEach(iterator) {
                this._dom.each(function () {
                    iterator(SELF(this));
                });
            },

            [[ria.dom.DomIterator]],
            OVERRIDE, SELF, function filter(iterator) {
                this._dom = this._dom.filter(function () {
                    return iterator(SELF(this));
                });
                return this;
            },

            OVERRIDE, Number, function count() {
                return this._dom.length;
            },

            /* raw nodes */

            OVERRIDE, ArrayOf(Node), function valueOf() {
                return ria.__API.clone(this._dom);
            }
        ]);

    ria.dom.setDomImpl(ria.dom.jQueryDom);
});