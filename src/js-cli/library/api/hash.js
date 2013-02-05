/**
 * Created with JetBrains WebStorm.
 * User: paladin
 * Date: 2/5/13
 * Time: 7:55 PM
 * To change this template use File | Settings | File Templates.
 */

var Hash = function () {
    "use strict";

    return {
        crc32: function (path) {
            return Number((new com.empstudio.HashUtils(path)).crc32());
        }
    }
}();
