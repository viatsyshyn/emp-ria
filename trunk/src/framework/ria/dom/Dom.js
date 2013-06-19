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

    var global = ('undefined' !== typeof window ? window.document : null),
        __find = Sizzle,
        __is = Sizzle.matchesSelector;

    function checkEventHandlerResult(event, result) {
        if (result === false) {
            event.stopPropagation && event.stopPropagation();
            event.cancelBubble && event.cancelBubble();
        }
    }

    function nulls(_) {
        return _ != null;
    }

    /** @class ria.dom.Event */
    ria.dom.Event = Event;

    /** @class ria.dom.DomIterator */
    DELEGATE(
        Object, function DomIterator(node) {});

    /** @class ria.dom.DomEventHandler */
    DELEGATE(
        [[Object, ria.dom.Event]],
        Boolean, function DomEventHandler(node, event) {});

    /** @class ria.dom.Dom */
    CLASS(
        'Dom', [
            function $(dom_) {
                VALIDATE_ARG('dom_', [Node, String, ArrayOf(Node), SELF], dom_);
                this.dom_ = [global];

                if ('string' === typeof dom_) {
                    this.find(dom_);
                } else if (Array.isArray(dom_)) {
                    this.dom_ = dom_;
                } else if (dom_ instanceof Node) {
                    this.dom_ = [dom_];
                } else if (dom_ instanceof SELF) {
                    this.dom_ = dom_.valueOf();
                }
            },

            /* Search tree */

            [[String]],
            SELF, function find(selector) {
                this.dom_ = __find(selector, this.dom_[0]);
                return this;
            },

            /* Events */

            SELF, function on(event, selector, handler_) {
                VALIDATE_ARGS(['event', 'selector', 'handler_'], [String, [String, ria.dom.DomEventHandler], ria.dom.DomEventHandler], arguments);
                var events = event.split(' ').filter(nulls);
                if(!handler_){
                    handler_ = selector;
                    selector = undefined;
                }

                var hid = handler_.__domEventHandlerId = handler_.__domEventHandlerId || (Math.random().toString(36).slice(2));

                this.dom_.forEach(function(element){
                    events.forEach(function(evt){

                        element.__domEvents = element.__domEvents || {};
                        if (element.__domEvents[evt + hid])
                            return ;

                        var h = element.__domEvents[evt + hid] = function (e) {
                            var target = new ria.dom.Dom(e.target);
                            if(selector === undefined)
                                return checkEventHandlerResult(e, handler_(target, e));

                            if (target.is(selector))
                                return checkEventHandlerResult(e, handler_(target, e));

                            var selectorTarget = new ria.dom.Dom(element)
                                .find(selector)
                                .filter(function (_) { return _.contains(e.target); })
                                .valueOf()
                                .pop();

                            if (selectorTarget)
                                return checkEventHandlerResult(e, handler_(new ria.dom.Dom(selectorTarget), e));
                        };

                        element.addEventListener(evt, h, false);
                    })
                });
                return this;
            },

            SELF, function off(event, selector, handler_) {
                throw Error('not supported');

                VALIDATE_ARGS(['event', 'selector', 'handler_'], [String, [String, ria.dom.DomEventHandler], ria.dom.DomEventHandler], arguments);
                var events = event.split(' ').filter(nulls);
                if(!handler_){
                    handler_ = selector;
                    selector = undefined;
                }

                var hid = handler_.__domEventHandlerId;
                if (!hid)
                    return ;

                this.dom_.forEach(function(element){
                    events.forEach(function(evt){
                        if (!element.__domEvents)
                            return ;

                        var h;
                        if (h = element.__domEvents[evt + hid])
                            element.removeEventListener(evt, h, false);
                    })
                });
                return this;
            },

            /* append/prepend */

            SELF, function appendTo(dom) {
                VALIDATE_ARG('dom', [SELF, String, Node], dom);

                if(typeof dom == "string")
                    dom = new SELF(dom);

                var dest = dom instanceof Node ? dom : dom.valueOf().shift();
                VALIDATE_ARG('dest', [Node], dest);

                this.dom_.forEach(function(item){
                    dest.appendChild(item);
                });
                return this;
            },

            SELF, function prependTo(dom) {
                VALIDATE_ARG('dom', [SELF, String, Node], dom);

                if(typeof dom == "string")
                    dom = new SELF(dom);

                var dest = dom instanceof Node ? dom : dom.valueOf().shift();
                VALIDATE_ARG('dest', [Node], dest);

                var first = dest.firstChild;
                if (!first)
                    return this.appendTo(dest);

                this.dom_.forEach(function(item){
                    dest.insertBefore(item, first);
                });

                return this;
            },

            /* parseHTML - make static */

            [[String]],
            SELF, function fromHTML(html) {
                this.dom_ = [];

                var div = document.createElement('div');
                div.innerHTML = html;
                var count = div.childElementCount;
                for(var i=0; i<count; i++){
                    var node = div.removeChild(div.childNodes[0]);
                    node && this.dom_.push(node);
                }

                return this;
            },

            /* DOM manipulations & navigation */

            SELF, function empty() {
                this.dom_.forEach(function(element){
                    element.innerHTML = '';
                });
                return this;
            },

            // reference https://github.com/julienw/dollardom

            [[String]],
            SELF, function descendants(selector__) {},
            [[String]],
            SELF, function parent(selector_) {},
            [[String]],
            SELF, function next(selector_) {},
            [[String]],
            SELF, function previous(selector_) {},
            [[String]],
            SELF, function first(selector_) {},
            [[String]],
            SELF, function last(selector_) {},
            [[String]],
            Boolean, function is(selector) {
                return this.dom_.some(function (el) {
                    return __is(el, selector);
                });
            },
            [[Object]],
            Boolean, function contains(node) {
                VALIDATE_ARG('node', [Node, SELF, ArrayOf(Node)], node);

                var nodes = [];
                if (node instanceof Node) {
                    nodes = [node];
                } else if (Array.isArray(node)) {
                    nodes = node;
                } else if (node instanceof SELF) {
                    nodes = node.valueOf();
                }

                return this.dom_.some(function (el) {
                    return nodes.some(function (_) { return el.contains(_); });
                });
            },

            /* attributes */

            Object, function getAllAttrs() {},
            [[String]],
            Object, function getAttr(name) {},
            [[Object]],
            SELF, function setAllAttrs(obj) {},
            [[String, Object]],
            SELF, function setAttr(name, value) {},

            /* data attributes */

            Object, function getAllData() {},
            [[String]],
            Object, function getData(name) {},
            [[Object]],
            SELF, function setAllData(obj) {},
            [[String, Object]],
            SELF, function setData(name, value) {},

            /* classes */

            [[String]],
            Boolean, function hasClass(clazz) {},
            [[String]],
            SELF, function addClass(clazz) {},
            [[String]],
            SELF, function removeClass(clazz) {},
            [[String, Boolean]],
            SELF, function toggleClass(clazz, toggleOn_) {},

            /* css */

            [[String]],
            Object, function getCss(property) {},
            [[String, Object]],
            VOID, function setCss(property, value) {},
            [[Object]],
            SELF, function updateCss(props) {},

            /* iterator */

            [[ria.dom.DomIterator]],
            SELF, function forEach(iterator) {
                this.dom_.forEach(function (_) {
                    iterator(SELF(_));
                });
            },

            [[ria.dom.DomIterator]],
            SELF, function filter(iterator) {
                this.dom_ = this.dom_.filter(function (_) {
                    return iterator(SELF(_));
                });
                return this;
            },

            Number, function count() {
                return this.dom_.length;
            },

            /* raw nodes */

            ArrayOf(Node), function valueOf() {
                return this.dom_.slice();
            }
        ]);
});