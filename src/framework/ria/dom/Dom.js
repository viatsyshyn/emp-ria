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

    var HTML_ATTRS = {
    };

    ASSET('lib/sizzle.js');
    var global = ('undefined' !== typeof window ? window.document : null),
        __find = Sizzle,
        __is = Sizzle.matchesSelector;

    function checkEventHandlerResult(event, result) {
        if (result === false) {
            event.stopPropagation && event.stopPropagation();
            event.cancelBubble && event.cancelBubble();
            event.preventDefault && event.preventDefault();
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

    var GID = new Date().getTime();
    /**
     * @class ria.dom.NewGID
     * @returns {String}
     */
    ria.dom.NewGID = function () {
        return 'gid-' + (GID++).toString(36);
    };

    /** @class ria.dom.Dom */
    CLASS(
        'Dom', [
            function $(dom_) {
                VALIDATE_ARG('dom_', [Node, String, ArrayOf(Node), SELF], dom_);
                this.dom_ = [global];

                if ('string' === typeof dom_) {
                    this.dom_  = this.find(dom_).valueOf();
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
                return new ria.dom.Dom(__find(selector, this.dom_[0]));
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
                VALIDATE_ARG('dom', [Node], dest);

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
            SELF, function parent(selector_) {
                if(selector_){
                    var parents = new ria.dom.Dom(selector_);
                    if(parents.count() == 0)
                        return null;
                    if(parents.count() == 1)
                        if(parents.contains(this)){
                            return parents;
                        }else{
                            return null;
                        }
                    parents.forEach(function(parent){
                        if(parent.contains(this))
                            return parent;
                    })
                }
            },

            Object, function offset() {
                if(!this.dom_[0])
                    return null;

                var box = this.dom_[0].getBoundingClientRect();
                var body = document.body;
                var docElem = document.documentElement;

                var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
                var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

                var clientTop = docElem.clientTop || body.clientTop || 0;
                var clientLeft = docElem.clientLeft || body.clientLeft || 0;

                var top  = box.top +  scrollTop - clientTop;
                var left = box.left + scrollLeft - clientLeft;

                return { top: Math.round(top), left: Math.round(left) }
            },

            Number, function height() {
                return this.dom_[0] ? this.dom_[0].getBoundingClientRect().height : null;
            },
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
            Object, function getAttr(name) {
                var node = this.dom_[0];
                return node ? node.getAttribute(HTML_ATTRS[name] || name) : null;
            },
            [[Object]],
            SELF, function setAllAttrs(obj) {},
            [[String, Object]],
            SELF, function setAttr(name, value) {
                var node = this.dom_[0];
                node ? node.setAttribute(HTML_ATTRS[name] || name, value) : null;
                return this;
            },

            /* data attributes */

            Object, function getAllData() {},
            [[String]],
            Object, function getData(name) {
                return this.getAttr('data-' + name);
            },
            [[Object]],
            SELF, function setAllData(obj) {},
            [[String, Object]],
            SELF, function setData(name, value) {},

            /* classes */

            [[String]],
            Boolean, function hasClass(clazz) {
                return (' ' + this.getAttr('class') + ' ').replace(/\s+/g, ' ').indexOf(' ' + clazz + ' ') >= 0;
            },
            [[String]],
            SELF, function addClass(clazz) {
                return this.toggleClass(clazz, true);
            },
            [[String]],
            SELF, function removeClass(clazz) {
               return this.toggleClass(clazz, false);
            },

            [[String, Boolean]],
            SELF, function toggleClass(clazz, toggleOn_) {
                var hasClass = this.hasClass(clazz);
                toggleOn_ = (toggleOn_ === undefined ? !hasClass : toggleOn_);

                if (toggleOn_ && !hasClass) {
                    this.setAttr('class', this.getAttr('class') + " " + clazz);
                    return this;
                }

                if (!toggleOn_ && hasClass) {
                    this.setAttr('class', this.getAttr('class').split(/\s+/).filter(function(_){ return _ != clazz;}).join(' '));
                    return this;
                }

                return this;
            },

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