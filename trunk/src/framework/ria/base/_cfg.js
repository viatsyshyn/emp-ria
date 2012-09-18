/**
 * Created with JetBrains WebStorm.
 * User: Volodymyr
 * Date: 18.09.12
 * Time: 10:34
 * To change this template use File | Settings | File Templates.
 */

var ria = {};

/** @namespace ria.__CFG */
ria.__CFG = {
//#ifdef DEBUG
    prettyStackTraces: true,
    checkedMode: true
//#endif
};

//#ifdef DEBUG
    Object.defineProperty(ria, '__CFG', {writable: false});
//#endif