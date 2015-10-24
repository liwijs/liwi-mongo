'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _Promise = require('babel-runtime/core-js/promise').default;

var _Symbol$iterator = require('babel-runtime/core-js/symbol/iterator').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _liwiLibAbstractCursor = require('liwi/lib/AbstractCursor');

var _liwiLibAbstractCursor2 = _interopRequireDefault(_liwiLibAbstractCursor);

/** @class Cursor 
* @param cursor 
* @param store 
* @param query */
let Cursor = (function (_AbstractCursor) {
    _inherits(Cursor, _AbstractCursor);

    function Cursor(cursor, store, query) {
        _classCallCheck(this, Cursor);

        _get(Object.getPrototypeOf(Cursor.prototype), 'constructor', this).call(this);
        this._cursor = cursor;
        this._store = store;
        this._query = query;
    }

    _createClass(Cursor, [{
        key: 'advance',
        /** @memberof Cursor 
        * @instance 
        * @method advance 
        * @param count */value: function advance(count) {
            this._cursor.skip(count);
            return this;
        }
    }, {
        key: 'next',
        /** @memberof Cursor 
        * @instance 
        * @method next */value: function next() {
            var _this = this;

            return new _Promise(function (resolve, reject) {
                _this._cursor.nextObject(function (err, value) {
                    if (err) {
                        return reject(err);
                    }

                    _this._result = value;
                    _this.key = value && value._id;
                    resolve(_this.key);
                });
            });
        }
    }, {
        key: 'limit',
        /** @memberof Cursor 
        * @instance 
        * @method limit 
        * @param newLimit */value: function limit(newLimit) {
            var _this2 = this;

            return new _Promise(function (resolve, reject) {
                _this2._cursor.limit(newLimit, function (err) {
                    if (err) {
                        return reject(err);
                    }

                    resolve();
                });
            });
        }
    }, {
        key: 'count',
        /** @memberof Cursor 
        * @instance 
        * @method count 
        * @param applyLimit */value: function count(applyLimit) {
            var _this3 = this;

            return new _Promise(function (resolve, reject) {
                _this3._cursor.count(applyLimit, function (err, result) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(result);
                });
            });
        }
    }, {
        key: 'result',
        /** @memberof Cursor 
        * @instance 
        * @method result */value: function result() {
            return _Promise.resolve(this._result);
        }
    }, {
        key: 'remove',
        /** @memberof Cursor 
        * @instance 
        * @method remove */value: function remove() {
            return this._store.deleteByKey(this.key);
        }
    }, {
        key: 'forEach',
        /** @memberof Cursor 
        * @instance 
        * @method forEach 
        * @param callback */value: function forEach(callback) {
            var _this4 = this;

            return this.forEachResults(function (result) {
                return callback(_this4._store.toVO(result));
            });
        }
    }, {
        key: 'forEachResults',
        /** @memberof Cursor 
        * @instance 
        * @method forEachResults 
        * @param callback */value: function forEachResults(callback) {
            var _this5 = this;

            return new _Promise(function (resolve, reject) {
                var waitFor = 0;
                _this5._cursor.each(function (err, result) {
                    if (err) {
                        return reject(err);
                    }

                    if (result === null) {
                        // end !
                        _this5.close();
                        if (waitFor === 0) {
                            resolve();
                        }

                        return;
                    }
                    try {
                        var result = callback(result);
                        if (result && typeof result.then === 'function') {
                            waitFor++;
                            result.then(function () {
                                if (--waitFor === 0) {
                                    resolve();
                                }
                            }).catch(reject);
                        }
                    } catch (err) {
                        console.log(err.stack || err.message);
                        reject(err);
                    }
                });
            });
        }
    }, {
        key: 'toArray',
        /** @memberof Cursor 
        * @instance 
        * @method toArray */value: function toArray() {
            var _this6 = this;

            return new _Promise(function (resolve, reject) {
                _this6._cursor.toArray(function (err, results) {
                    if (err) {
                        return reject(err);
                    }
                    try {
                        resolve(results.map(function (v) {
                            return _this6._store.toVO(v);
                        }));
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }
    }, {
        key: 'close',
        /** @memberof Cursor 
        * @instance 
        * @method close */value: function close() {
            if (this._cursor) {
                this._cursor.close();
                this._cursor = this._store = this._result = undefined;
            }
            return _Promise.resolve();
        }
    }, {
        key: 'query',
        /** @memberof Cursor 
        * @instance 
        * @member query */get: function get() {
            return this._query;
        }
    }]);

    return Cursor;
})(_liwiLibAbstractCursor2.default);

exports.default = Cursor;

Cursor.prototype[_Symbol$iterator] = /** @function */function () {
    var _this7 = this;

    return {
        next: function next() {
            return {
                done: _this7._cursor === undefined,
                value: _this7.next().then(function (key) {
                    if (key === null) {
                        _this7.close();
                        return undefined;
                    }
                    return _this7.vo();
                })
            };
        }
    };
};
module.exports = exports.default;
//# sourceMappingURL=Cursor.js.map