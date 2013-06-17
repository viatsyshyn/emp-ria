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

NAMESPACE('ria.dom', function () {
    "use strict";

    var global = this.window ? this.window.document : null;

    /** @class ria.dom.DomIterator */
    DELEGATE(
        function DomIterator(node) {});

    /** @class ria.dom.DomEventHandler */
    DELEGATE(
        function DomEventHandler(node, event) {});

    /** @class ria.dom.Dom */
    CLASS(
        'Dom', [
            function $(dom_) {
                if ('string' === typeof dom_) {
                    // todo: shortcut for new ria.dom.Dom(document).find(dom_)
                } else if (dom_ instanceof Node)

                this.dom_ = dom_ || global;
            },

            /* Search tree */

            [[String]],
            SELF, function find(selector) {
                return new SELF();
            },

            /* Events */

            [[String, [String, ria.dom.DomEventHandler], ria.dom.DomEventHandler]],
            SELF, function on(event, selector, handler_) {
                return this;
            },

            [[String, [String, ria.dom.DomEventHandler], ria.dom.DomEventHandler]],
            SELF, function off(event, selector, handler_) {
                return this;
            },

            /* append/prepend */

            [[SELF]],
            SELF, function appendTo(dom) {
                return this;
            },

            [[SELF]],
            SELF, function prependTo(dom) {
                return this;
            },

            /* parseHTML - make static */

            [[String]],
            SELF, function fromHTML(html) {
                this.dom_ = parseHTML_(html);
                return this;
            },

            /* text content */

            String, function text() {
                return '';
            },

            /* navigation */

            SELF, function parent() {
                return new SELF();
            },

            [[String]],
            ArrayOf(SELF), function children(selector_) {
                return this.find('> ' + (selector_ || '*')); // change
            },

            SELF, function siblingAfter() {

            },

            SELF, function siblingBefore() {

            },

            /**
             * forEach - iterates over dom
             * @param {Function(dom)} iterator
             * @returns {ria.dom.Dom}
             */
            [[ria.dom.DomIterator]],
            SELF, function forEach(iterator) {
                return this;
            },

            /**
             * at - returns dom node with index
             */
            [[Number]],
            SELF, function at(index) {
                return new SELF();
            },

            ArrayOf(SELF), function toArray() {
                return [this];
            }
        ]);
});