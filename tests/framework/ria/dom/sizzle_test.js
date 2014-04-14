/**
 * Created by C01t on 4/14/14.
 */

REQUIRE('ria.dom.SizzleDom');

(function (ria, stubs) {
    "use strict";

    AsyncTestCase("SizzleTestCase").prototype = {
        setUp: function () {
            ria.dom.Dom.SET_IMPL(ria.dom.SizzleDom);
        },


        testInstantiate: function() {
            jstestdriver.appendHtml('<div id="testInstantiate"></div>', window.document);

            var dom = ria.dom.Dom('#testInstantiate');

            assertInstanceOf(ria.dom.Dom, dom);
            assertInstanceOf(ria.dom.SizzleDom, dom);

            assertEquals(1, dom.valueOf().length);
        },

        testFind: function() {
            jstestdriver.appendHtml('<div id="testFind">' +
                '<div class="to-find"></div>' +
                '<div class="to-find other class"></div>' +
                '<div class="not-to-find"></div>' +
                '<div class="hidden"></div>' +
            '</div>', window.document);

            var dom = ria.dom.Dom('#testFind');

            var result = dom.find('.to-find');

            assertEquals(2, result.valueOf().length);

            result.forEach(function ($dom) {
                assertTrue($dom.hasClass('to-find'));
            });

            var result2 = dom.find('.non-existent');

            assertEquals(0, result2.valueOf().length);
        },

        testOn: function (queue) {
            jstestdriver.appendHtml('<div id="testOn"></div>', window.document);

            var dom = ria.dom.Dom('#testOn');

            queue.call('Setup callbacks', function(callbacks) {
                dom.on('click', callbacks.add(function ($node, event) {
                    assertEquals('testOn', $node.getAttr('id'));
                }));
            });

            setTimeout(function () {
                jstestdriver.console.log('trigger click');

                dom.triggerEvent(ria.dom.Events.CLICK());
            }, 1000);
        },

        testOnSelector: function (queue) {
            jstestdriver.appendHtml('<div id="testOnSelector">' +
                '<div class="to-click expected-click" id="trigger-1"></div>' +
                '<div class="to-click expected-click" id="trigger-2"></div>' +
                '<div class="not-to-click" id="trigger-3"></div>' +
                '<div class="other expected-click" id="trigger-4"></div>' +
            '</div>', window.document);

            var dom = ria.dom.Dom('#testOnSelector');

            queue.call('Setup callbacks', function(callbacks) {
                dom.on('click', '.to-click, .other', callbacks.add(function ($node, event) {
                    assertTrue($node.hasClass('expected-click'));
                }));

                dom.on('click', '.not-to-click', callbacks.addErrback('this should not happen'));


                var cb = callbacks.add(function ($node, event) {
                    jstestdriver.console.log('clicked 1');
                    assertTrue($node.hasClass('expected-click'));
                }, 2);

                dom.on('click', '.other', cb);
                dom.on('click', '.to-click', cb);
            });

            setTimeout(function () {
                jstestdriver.console.log('trigger click 1');
                ria.dom.Dom('#trigger-1').triggerEvent(ria.dom.Events.CLICK());
            }, 500);

            setTimeout(function () {
                jstestdriver.console.log('trigger click 2');
                ria.dom.Dom('#trigger-4').triggerEvent(ria.dom.Events.CLICK());
            }, 1000);

            setTimeout(function () {
                jstestdriver.console.log('trigger click 4');
                ria.dom.Dom('#trigger-2').triggerEvent(ria.dom.Events.CLICK());
            }, 1500);
        },

        testOff: function (queue) {
            jstestdriver.appendHtml('<div id="testOff">' +
                '<div class="to-click expected-click" id="trigger-1"></div>' +
                '<div class="to-click expected-click" id="trigger-2"></div>' +
                '<div class="not-to-click" id="trigger-3"></div>' +
                '<div class="other expected-click" id="trigger-4"></div>' +
            '</div>', window.document);


            var dom = ria.dom.Dom('#testOff');

            queue.call('Setup callbacks', function(callbacks) {
                var cb = callbacks.add(function ($node, event) {
                    jstestdriver.console.log('clicked 1');
                    assertFalse($node.hasClass('other'));
                    assertTrue($node.hasClass('expected-click'));
                }, 2);

                dom.on('click', '.other', cb);
                dom.on('click', '.to-click', cb);

                dom.off('click', '.other', cb);

                var cb2 = callbacks.add(function ($node, event) {
                    jstestdriver.console.log('clicked 2');
                    assertFalse($node.hasClass('other'));
                    assertTrue($node.hasClass('expected-click'));
                }, 2);

                dom.on('focus', '.to-click', cb2);
                dom.on('click', '.to-click', cb2);

                dom.off('focus', '.to-click', cb2);

            });

            setTimeout(function () {
                jstestdriver.console.log('trigger click 1');
                ria.dom.Dom('#trigger-1').triggerEvent(ria.dom.Events.CLICK());
            }, 500);

            setTimeout(function () {
                jstestdriver.console.log('trigger click 2');
                ria.dom.Dom('#trigger-4').triggerEvent(ria.dom.Events.CLICK());
            }, 1000);

            setTimeout(function () {
                jstestdriver.console.log('trigger click 3');
                ria.dom.Dom('#trigger-3').triggerEvent(ria.dom.Events.CLICK());
            }, 1250);

            setTimeout(function () {
                jstestdriver.console.log('trigger click 4');
                ria.dom.Dom('#trigger-2').triggerEvent(ria.dom.Events.CLICK());
            }, 1500);
        },

        testAppendTo: function (queue) {

            jstestdriver.appendHtml('<div id="source" class="pos0"></div>' +
                '<div id="source2" class="pos1"></div>' +
                '<div id="target"></div>', window.document);

            var dom = ria.dom.Dom('#source');

            queue.call('Move dom', function (callbacks) {
                assertEquals(0, ria.dom.Dom('#target').find('> *').valueOf().length);

                dom.appendTo('#target');

                setTimeout(callbacks.noop(), 50);
            });

            queue.call('Test move', function (callbacks) {
                assertEquals(1, ria.dom.Dom('#target').find('> *').valueOf().length);

                setTimeout(callbacks.noop(), 50);
            });

            queue.call('Attach to non-existent target', function (callbacks) {
                _RELEASE && dom.appendTo('#non-existent');

                setTimeout(callbacks.noop(), 50);
            });

            queue.call('Attach non existent to target', function (callbacks) {
                ria.dom.Dom('#non-existent').appendTo('#target');

                setTimeout(callbacks.noop(), 50);
            });

            queue.call('Move 2', function (callbacks) {
                assertEquals(1, ria.dom.Dom('#target').find('> *').valueOf().length);

                ria.dom.Dom('#source2').appendTo('#target');

                setTimeout(callbacks.noop(), 50);
            });

            queue.call('Test move 2', function (callbacks) {
                var children = ria.dom.Dom('#target').find('> *');

                assertEquals(2, children.valueOf().length);

                var index = 0;
                children.forEach(function ($node) {
                    assertTrue('Has class "pos' + index + '"', $node.hasClass('pos' + index));
                    index++;
                });

                setTimeout(callbacks.noop(), 50);
            });
        }
    };
})(ria);