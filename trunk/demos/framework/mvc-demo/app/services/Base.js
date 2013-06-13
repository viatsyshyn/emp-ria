REQUIRE('ria.serialize.JsonSerializer');

REQUIRE('ria.ajax.JsonGetTask');

NAMESPACE('app.services', function () {

    /** @class app.services.DataException */
    EXCEPTION(
        'DataException', [
            function $(msg, inner_) {
                BASE(msg, inner_);
            }
        ]);

    // Single instance
    var Serializer = new ria.serialize.JsonSerializer;

    /** @class app.services.Base */
    CLASS(
        'Base', [
            [[String, Object]],
            ria.async.Future, function get(uri, clazz) {
                return new ria.ajax.JsonGetTask(uri)
                    .run()
                    .then(function (data) {
                        return Serializer.deserialize(data, clazz);
                    });
            }
        ]);
});
