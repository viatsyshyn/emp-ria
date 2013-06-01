(function (ria) {
    "use strict";

    AsyncTestCase("FutureTestCase").prototype = {
        testThen: function (queue) {

            var completer = new ria.async.Completer;

            queue.call('Setup thens', function(callbacks) {

                completer.getFuture()
                    .then(callbacks.add(function (data) {
                        assertEquals(1, data);
                        return data + 1
                    }))
                    .then(callbacks.add(function (data) {
                        assertEquals(2, data);
                        return data * 2;
                    }))
                    .then(callbacks.add(function (data) {
                        assertEquals(4, data);
                    }));
            });

            completer.complete(1);
        },

        testCatchError: function (queue) {

            var completer = new ria.async.Completer;

            queue.call('Setup thens', function(callbacks) {

                completer.getFuture()
                    .then(callbacks.add(function (data) {
                        assertEquals(1, data);
                        return data + 1
                    }))
                    .then(function (data) {
                        throw data * 2;
                    })
                    .catchError(callbacks.add(function (error) {
                        assertEquals(4, error);
                        return error + 2
                    }))
                    .then(function (data) {
                        throw new Exception('test');
                    })
                    .catchException(Exception, callbacks.add(function (error) {
                        assertEquals('test', error.getMessage());
                    }))
                ;
            });

            completer.complete(1);
        },

        testComplete: function (queue) {
            var completer = new ria.async.Completer;

            var is = false;

            queue.call('Setup thens', function(callbacks) {

                completer.getFuture()
                    .then(callbacks.add(function (data) {
                        assertEquals(1, data);
                        return data + 1
                    }))
                    .then(function (data) {
                        throw data * 2;
                    })
                    .complete(callbacks.noop())
                    .catchError(callbacks.add(function (error) {
                        assertEquals(4, error);
                        return error + 2
                    }))
                    .then(function (data) {
                        throw new Exception('test');
                    })
                    .complete(callbacks.noop())
                    .complete(function () { is = true; })
                ;
            });

            queue.call('Assert about the system', function() {
                assertTrue(is);
            });

            completer.complete(1);
        },

        testBreak: function (queue) {
            var completer = new ria.async.Completer;

            var is = false;
            var is2 = false;

            queue.call('Setup thens', function(callbacks) {

                completer.getFuture()
                    .then(callbacks.add(function (data) {
                        assertEquals(1, data);
                        return data + 1
                    }))
                    .then(function (data) {
                        this.BREAK();
                    })
                    .complete(callbacks.noop())
                    .catchError(function (error) {
                        is2 = true;
                        return 2
                    })
                    .then(function (data) {
                        is2 = true;
                    })
                    .complete(function () { is = true; })
                    .complete(callbacks.noop())
                ;
            });

            queue.call('Assert about the system', function() {
                assertTrue(is);
                assertFalse(is2);
            });

            completer.complete(1);
        }
    };

})(ria);