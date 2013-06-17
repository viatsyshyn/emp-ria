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

    var global = (undefined !== typeof window ? window.document : null);

    /** @class ria.dom.DomIterator */
    DELEGATE(
        VOID, function DomIterator(node) {});

    /** @class ria.dom.DomEventHandler */
    DELEGATE(
        Boolean, function DomEventHandler(node, event) {});

    /** @class ria.dom.Dom */
    CLASS(
        'Dom', [
            function $(dom_) {
                VALIDATE_ARG('dom_', [Node, String], dom_);
                this.dom_ = [global];

                if ('string' === typeof dom_) {
                    this.find(dom_);
                } else if (dom_ instanceof Node) {
                    this.dom_ = [dom_];
                }
            },

            /* Search tree */

            [[String]],
            SELF, function find(selector) {
                this.dom_ = Sizzle(selector, this.dom_[0]);
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
                                    if(Sizzle.matchesSelector(target,selector)){
                                        handler_.call(target, e);
                                    }else{
                                        var els = __.find(selector, element);
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
                            if(selector_){
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
                    dom = __.find(dom);
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
                    dom = __.find(dom);
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

            SELF, function empty() {
                this.dom_.forEach(function(element){
                    element.innerHTML = '';
                });
                return this;
            },

            ArrayOf(Node), function valueOf() {
                return this.dom_;
            }
        ]);
});