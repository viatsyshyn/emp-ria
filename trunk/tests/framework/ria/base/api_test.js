(function (ria) {
    "use strict";

    TestCase("APITestCase").prototype = {
        testExtend: function () {
            function Base() {}
            function Child() {}

            ria.__API.extend(Child, Base);

            assertInstanceOf(Base, new Child());
        }
    };

})(ria);