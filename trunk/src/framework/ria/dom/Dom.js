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

    /** @class ria.dom.DomIterator */
    DELEGATE(
        Object, function DomIterator(node) {});

    /** @class ria.dom.DomEventHandler */
    DELEGATE(
        Boolean, function DomEventHandler(node, event) {});

    /** @class ria.dom.Dom */
    CLASS(
        'Dom', [
            function $(dom_) {
                VALIDATE_ARG('dom_', [Node, String, ArrayOf(Node)], dom_);
                this.dom_ = [global];

                if ('string' === typeof dom_) {
                    this.find(dom_);
                } else if (Array.isArray(dom_)) {
                    this.dom_ = dom_;
                } else if (dom_ instanceof Node) {
                    this.dom_ = [dom_];
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
                var events = event.split(' ');
                if(!handler_){
                    handler_ = selector;
                    selector = undefined;
                }
                this.dom_.forEach(function(element){
                    events.forEach(function(evt){
                        if(evt){
                            if(selector){
                                handler_.__domEvent = function (e){
                                    var target = e.target;
                                    if(__is(target,selector)){
                                        handler_.call(target, e);
                                    }else{
                                        var els = __find(selector, element);
                                        els.forEach(function(el){
                                            if(el.contains(target)){
                                                handler_.call(el, e);
                                            }
                                        });
                                    }
                                };

                                element.addEventListener(evt, handler_.__domEvent, false);
                            }else{
                                element.addEventListener(evt, handler_, false);
                            }
                        }
                    })
                });
                return this;
            },

            SELF, function off(event, selector, handler_) {
                VALIDATE_ARGS(['event', 'selector', 'handler_'], [String, [String, ria.dom.DomEventHandler], ria.dom.DomEventHandler], arguments);
                var events = event.split(' ');
                if(!handler_){
                    handler_ = selector;
                    selector = undefined;
                }
                this.dom_.forEach(function(element){
                    events.forEach(function(evt){
                        if(evt){
                            if(selector){
                                if(!handler_.__domEvent)
                                    throw "there should be another handler function";
                                element.removeEventListener(evt, handler_.__domEvent, false);
                            }else{
                                element.removeEventListener(evt, handler_, false);
                            }
                        }
                    })
                });
                return this;
            },

            /* append/prepend */

            [[SELF]],
            SELF, function appendTo(dom) {
                if(typeof dom == "string")
                    dom = __find(dom);
                this.dom_.forEach(function(item){
                    dom.valueOf().forEach(function(element){
                        element.appendChild(item);
                    });
                });
                return this;
            },

            [[SELF]],
            SELF, function prependTo(dom) {
                if(typeof dom == "string")
                    dom = __find(dom);
                this.dom_.forEach(function(item){
                    dom.insertBefore(item, dom.firstChild);
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
            Boolean, function is(selector_) {},

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