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
        docElem = global.documentElement,
        __find = function (s, n) {
            return n.querySelectorAll(s);
        },
        __is = docElem ? (docElem.webkitMatchesSelector || docElem.mozMatchesSelector
            || docElem.oMatchesSelector || docElem.msMatchesSelector) : function () { return false };

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

    function firstOrDef(array, def) {
        var x = array.shift();
        return x !== undefined ? x : def;
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

    /** @class ria.dom.Keys */
    ENUM(
        'Keys', {
            BACKSPACE: 8,
            ESC: 27,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        });


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
            // $$ - instance factory
            function $$(instance, clazz, ctor, args) {
                if (DomImpl == SELF)
                    throw Error('');

                instance = DomImpl.apply(undefined, args);
                ria.__SYNTAX && ria.__SYNTAX.checkReturn(ria.dom.Dom, instance);
                return instance;
            },

            function $(dom_) {
                BASE();
                VALIDATE_ARG('dom_', [Node, String, ArrayOf(Node), SELF, NodeList], dom_);
                this._dom = [global];

                if ('string' === typeof dom_) {
                    this._dom  = this.find(dom_).valueOf();
                } else if (Array.isArray(dom_)) {
                    this._dom = dom_;
                } else if (dom_ instanceof Node) {
                    this._dom = [dom_];
                } else if (dom_ instanceof NodeList) {
                    this._dom = ria.__API.clone(dom_);
                } else if (dom_ instanceof SELF) {
                    this._dom = dom_.valueOf();
                }
            },

            /* Search tree */

            [[String]],
            SELF, function find(selector) {
                return new ria.dom.Dom(__find(selector, this._dom[0]));
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

                this._dom.forEach(function(element){
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

                        element.addEventListener(evt, h, 'change select focus blur'.search(evt) >= 0);
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

                this._dom.forEach(function(element){
                    events.forEach(function(evt){
                        if (!element.__domEvents)
                            return ;

                        var h;
                        if (h = element.__domEvents[evt + hid])
                            element.removeEventListener(evt, h, 'change select focus blur'.search(evt) >= 0);
                    })
                });
                return this;
            },

            /* append/prepend */

            SELF, function appendTo(dom) {
                VALIDATE_ARG('dom', [SELF, String, Node], dom);

                if(typeof dom == "string")
                    dom = new ria.dom.Dom(dom);

                var dest = dom instanceof Node ? dom : dom.valueOf().shift();
                VALIDATE_ARG('dom', [Node], dest);

                this._dom.forEach(function(item){
                    dest.appendChild(item);
                });
                return this;
            },

            SELF, function prependTo(dom) {
                VALIDATE_ARG('dom', [SELF, String, Node], dom);

                if(typeof dom == "string")
                    dom = new ria.dom.Dom(dom);

                var dest = dom instanceof Node ? dom : dom.valueOf().shift();
                VALIDATE_ARG('dest', [Node], dest);

                var first = dest.firstChild;
                if (!first)
                    return this.appendTo(dest);

                this._dom.forEach(function(item){
                    dest.insertBefore(item, first);
                });

                return this;
            },

            SELF, function insertBefore(dom) {
                VALIDATE_ARG('dom', [SELF, String, Node], dom);

                if(typeof dom == "string")
                    dom = new ria.dom.Dom(dom);

                var dest = dom instanceof Node ? dom : dom.valueOf().shift();
                VALIDATE_ARG('dest', [Node], dest);


                this._dom.forEach(function(item){
                    dest.parentNode.insertBefore(item, dest);
                });

                return this;
            },

            /* parseHTML - make static */

            [[String]],
            SELF, function fromHTML(html) {
                this._dom = [];

                var div = document.createElement('div');
                div.innerHTML = html;
                var count = div.childElementCount;
                for(var i=0; i<count; i++){
                    var node = div.removeChild(div.childNodes[0]);
                    node && this._dom.push(node);
                }

                return this;
            },

            /* DOM manipulations & navigation */

            SELF, function empty() {
                this._dom.forEach(function(element){ element.innerHTML = ''; });
                return this;
            },

            [[SELF]],
            SELF, function remove(node) {
                this._dom.forEach(function(element) {
                    node.valueOf().forEach(function (_) { element.removeChild(_); })
                });
                return this;
            },

            [[SELF]],
            SELF, function removeSelf() {
                this._dom.forEach(function(element){ element.parentNode.removeChild(element); });
                return this;
            },

            [[SELF]],
            Boolean, function areEquals(el){
                var val1 = this.valueOf(), val2 = el.valueOf(), len = val1.length;
                if(len != val2.valueOf().length)
                    return false;
                for(var i = 0; i < len; i++){
                    if(val1[i] != val2[i])
                        return false;
                }
                return true;
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
                    parents.forEach(function(parent) {
                        if(parent.contains(this))
                            return parent;
                    });

                    return null;
                }

                return ria.dom.Dom(this._dom.map(function (_) { return _.parentNode }));
            },

            Object, function offset() {
                if(!this._dom[0])
                    return null;

                var box = this._dom[0].getBoundingClientRect();
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
                return this._dom[0] ? this._dom[0].getBoundingClientRect().height : null;
            },
            Number, function width() {
                return this._dom[0] ? this._dom[0].getBoundingClientRect().width : null;
            },
            [[String]],
            SELF, function next(selector_) {},
            [[String]],
            SELF, function previous(selector_) {},
            [[String]],
            SELF, function first(selector_) {
                if (!selector_)
                    return this._dom[0] ? ria.dom.Dom(this._dom[0]) : null;

                throw new Exception('not implemented');
            },
            [[String]],
            SELF, function last(selector_) {},
            [[String]],
            Boolean, function is(selector) {
                return this._dom.some(function (el) {
                    return __is.call(el, selector);
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

                return this._dom.some(function (el) {
                    return nodes.some(function (_) { return el.contains(_); });
                });
            },
            Boolean, function exists() {
                return !!this._dom[0];
            },

            Object, function getValue() {
                return this._dom.map(function (_) { return _.value; }).shift() || null;
            },
            [[Object]],
            SELF, function setValue(value) {
                this._dom.forEach(function (_) { _.value = value; });
                return this;
            },
            [[Object]],
            SELF, function setFormValues(values) {
                for(var valueName in values){
                    if(values.hasOwnProperty(valueName)){
                        this.find('[name="' + valueName + '"]').setValue(values[valueName]);
                    }
                }
                return this;
            },

            [[ria.dom.Event]],
            SELF, function triggerEvent(event) {
                this.valueOf()
                    .forEach(function (element) {
                        if (document.createEvent) {
                            element.dispatchEvent(event);
                        } else {
                            var evt = document.createEventObject();
                            element.fireEvent("on" + evt.eventType, evt);
                        }
                    });
                return this;
            },

            /* attributes */

            [[String]],
            Boolean, function hasAttr(name) {
                return this._dom.some(function (_) { return _.hasAttribute(name)});
            },

            Object, function getAllAttrs() {},

            [[String]],
            Object, function getAttr(name) {
                return firstOrDef(
                    this._dom.map(function (_) { return _.getAttribute(name)}), null);
            },

            [[Object]],
            SELF, function setAllAttrs(obj) {
                var f = this.setAttr;
                Object.getOwnPropertyNames(obj).forEach(function (k) { f(k, obj[k]); });
                return this;
            },
            [[String, Object]],
            SELF, function setAttr(name, value) {
                this._dom.forEach(function (node) { node.setAttribute(name, value); });
                return this;
            },

            [[String]],
            SELF, function removeAttr(name) {
                this._dom.forEach(function (node) { node.removeAttribute(name); });
                return this;
            },

            [[String]],
            SELF, function toggleAttr(name, set_) {
                set_ = set_ === undefined ? !this.hasAttr(name) : set_;
                return set_ ? this.setAttr(name, name) : this.removeAttr(name);
            },

            /* data attributes */

            Boolean, function hasData(name) {
                return this.hasAttr('data-' + name);
            },

            Object, function getAllData() {},
            [[String]],
            Object, function getData(name) {
                return this.getAttr('data-' + name);
            },
            [[Object]],
            SELF, function setAllData(obj) {
                var f = this.setData;
                Object.getOwnPropertyNames(obj).forEach(function (_) { f(_, obj[_]); });
                return this;
            },

            [[String, Object]],
            SELF, function setData(name, value) {
                return this.setAttr('data-' + name, value);
            },

            [[String]],
            SELF, function removeData(name) {
                return this.removeAttr('data-' + name);
            },

            /* text */
            String, function getText() {
                return firstOrDef(this._dom.map(function (_) { return _.innerText; }), null);
            },

            [[String]],
            SELF, function setText(value) {
                this._dom.forEach(function (_) {_.innerText = value; });
                return this;
            },

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
            Object, function getCss(property) {
                return this._dom
                    .map(function (_) { return window.getComputedStyle(_); })
                    .map(function (style) { return !style ? null : style.getPropertyValue(property); })
                    .shift() || null;
            },

            [[String, Object]],
            SELF, function setCss(property, value) {
                this._dom.forEach(function (_) { _.style[property] = value; });
                return this;
            },
            [[Object]],
            SELF, function updateCss(props) {
                var f = this.setCss;
                Object.getOwnPropertyNames(props).forEach(function (_) { f(_, props[_]); });
                return this;
            },

            /* iterator */

            [[ria.dom.DomIterator]],
            SELF, function forEach(iterator) {
                this._dom.forEach(function (_) { iterator(ria.dom.Dom(_)); });
                return this;
            },

            [[ria.dom.DomIterator]],
            SELF, function filter(iterator) {
                return ria.dom.Dom(this._dom.filter(function (_) { return iterator(ria.dom.Dom(_)); }));
            },

            Number, function count() {
                return this._dom.length;
            },

            /* raw nodes */

            ArrayOf(Node), function valueOf() {
                return this._dom.slice();
            }
        ]);

    /** @class ria.dom.SimpleDom */
    CLASS(
        'SimpleDom', EXTENDS(ria.dom.Dom), [
            function $(dom_) {
                dom_ ? BASE(dom_) : BASE();
            }
        ]);

    var DomImpl = ria.dom.SimpleDom;

    ria.dom.setDomImpl = function (impl) {
        DomImpl = impl;
    };
});