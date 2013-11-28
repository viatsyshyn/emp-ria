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
            function $(dom_) {
                BASE(dom_);
            },

            /* Search tree */

            [[String]],
            OVERRIDE, SELF, function find(selector) {
                return new SELF(Sizzle(selector, this._dom[0]));
            },

            [[String]],
            OVERRIDE, Boolean, function is(selector) {
                return this._dom.some(function (el) {
                    return Sizzle.matchesSelector(el, selector);
                });
            }
        ]);

    ria.dom.Dom.SET_IMPL(ria.dom.SizzleDom);
});