var bootstrap = require('../../../src/framework/ria/_bootstrap.node.js')._bootstrap,
    path = require('path'),
    root = path.resolve(path.dirname(module.filename), '.'),
    riaRoot = path.resolve(path.dirname(module.filename), '../../../');

bootstrap({
    "prettyStackTraces": true,
    "checkedMode": true,
    "enablePipelineMethodCall": true,
    "AssertWithExceptions": false,
    //"stackTraceJs": "lib/stacktrace.js",

    "#require": {
        "plugins": [],
        "appRoot": root + '/',
        "appCodeDir": "~/app/",
        "libs": {
            "lib/": riaRoot + "/src/framework/",
            "ria":  riaRoot + "/src/framework/"
        }
    },

    "#node": {
        "appClass": "demo.DemoApplication",
        "settings": {
            "emp.player": "c01t",
            "emp.session": "123456789098756432123645",
            "xmpp.enabled": true,
            "xmpp.service": "/service/",
            "emp.locale": "uk-UA",
            "vk.appId": 12345678,
            "vk.likeTag": "vk-like"
        }
    }
});