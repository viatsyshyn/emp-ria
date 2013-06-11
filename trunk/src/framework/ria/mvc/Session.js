REQUIRE('ria.mvc.ISession');

NAMESPACE('ria.mvc', function () {

    /** @class ria.mvc.Session */
    CLASS(
        'Session', IMPLEMENTS(ria.mvc.ISession), [

            function $() {
                this.items = {};
            },

            [[String, Object]],
            Object, function get(key, def_) {
                return this.items.hasOwnProperty(key) ? this.items[key] : def_;
            },

            [[String, Object, Boolean]],
            VOID, function set(key, value, isPersistent_) {
                this.items[key] = value;
            },

            [[String]],
            VOID, function remove(key) {
                delete this.items[key];
            }
        ]);
});
