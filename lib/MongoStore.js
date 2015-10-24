'use strict';

var _get = require('babel-runtime/helpers/get').default;

var _inherits = require('babel-runtime/helpers/inherits').default;

var _createClass = require('babel-runtime/helpers/create-class').default;

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _Promise = require('babel-runtime/core-js/promise').default;

var _Object$assign = require('babel-runtime/core-js/object/assign').default;

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _liwiLibAbstractStore = require('liwi/lib/AbstractStore');

var _liwiLibAbstractStore2 = _interopRequireDefault(_liwiLibAbstractStore);

var _Cursor = require('./Cursor');

var _Cursor2 = _interopRequireDefault(_Cursor);

var _mongodb = require('mongodb');

const regexpObjectId = /^[a-f\d]{24}$/i;
/** @class MongoStore */
let MongoStore = (function (_AbstractStore) {
    _inherits(MongoStore, _AbstractStore);

    function MongoStore() {
        _classCallCheck(this, MongoStore);

        _get(Object.getPrototypeOf(MongoStore.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(MongoStore, [{
        key: 'initialize',
        /** @memberof MongoStore 
        * @instance 
        * @method initialize */value: function initialize() {
            var _this = this;

            this.manager.VO.keyPath = '_id';
            return new _Promise(function (resolve, reject) {
                if (!_this.manager.VO.name || _this.manager.VO.name.toLowerCase() === 'function') {
                    throw new Error('Unable to find model name ' + _this.manager.VO.name + ', ' + _this.manager.name);
                }

                _this.db.connection.collection(_this.manager.VO.name, { w: 1 }, function (err, collection) {
                    if (err) {
                        return reject(err);
                    }

                    _this.collection = collection;
                    resolve();
                });
            });
        }
    }, {
        key: 'store',
        /** @memberof MongoStore 
        * @instance 
        * @method store */value: function store() {
            return this.collection;
        }
    }, {
        key: 'toId',
        /** @memberof MongoStore 
        * @instance 
        * @method toId 
        * @param id */value: function toId(id) {
            if (id instanceof _mongodb.ObjectID) {
                return id;
            }

            if (typeof id === 'string' && id.length === 24 && regexpObjectId.test(id)) {
                return new _mongodb.ObjectID(id);
            }

            return id;
        }
    }, {
        key: 'createMongoId',
        /** @memberof MongoStore 
        * @instance 
        * @method createMongoId 
        * @param vo */value: function createMongoId(vo) {
            if (!vo.id) {
                vo.data._id = new _mongodb.ObjectID();
            }
        }
    }, {
        key: 'insert',
        /** @memberof MongoStore 
        * @instance 
        * @method insert 
        * @param options */value: function insert(options) {
            var _this2 = this;

            return new _Promise(function (resolve, reject) {
                _this2.collection.insert(options.data, options, function (err, item) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(item);
                });
            });
        }
    }, {
        key: 'update',
        /** @memberof MongoStore 
        * @instance 
        * @method update 
        * @param options */value: function update(options) {
            var _this3 = this;

            return new _Promise(function (resolve, reject) {
                var data = !options.partialUpdate ? options.data : { $set: options.data };
                _this3.collection.update(options.criteria, data, options, function (err, result) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(result.n);
                });
            });
        }
    }, {
        key: 'remove',
        /** @memberof MongoStore 
        * @instance 
        * @method remove 
        * @param options */value: function remove(options) {
            var _this4 = this;

            return new _Promise(function (resolve, reject) {
                _this4.collection.remove(options.criteria, options, function (err, result) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(result.n);
                });
            });
        }

        /** @see http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#findone 
        * @memberof MongoStore 
        * @instance 
        * @method findOne 
        * @param query 
        * @param options */
    }, {
        key: 'findOne',
        value: function findOne(query, options) {
            var _this5 = this;

            return new _Promise(function (resolve, reject) {
                // selector, options, callback?
                // options= limit,sort,fields,skip,hint,tailable,tailableRetryInterval,returnKey,maxScan,min,max,comment,raw
                _this5.collection.findOne(query, options, function (err, result) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(result);
                });
            });
        }

        /** @see http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#find 
        * @memberof MongoStore 
        * @instance 
        * @method cursor 
        * @param query 
        * @param options */
    }, {
        key: 'cursor',
        value: function cursor(query, options) {
            var _this6 = this;

            return new _Promise(function (resolve, reject) {
                // selector, options, callback?
                // options= limit,sort,fields,skip,hint,tailable,returnKey,maxScan,min,max,comment,raw
                _this6.collection.find(query, options, function (err, cursor) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(new _Cursor2.default(cursor, _this6, query));
                });
            });
        }
    }]);

    return MongoStore;
})(_liwiLibAbstractStore2.default);

exports.default = MongoStore;

MongoStore.ObjectID = _mongodb.ObjectID;

MongoStore.initialize = /** @function 
                        * @param db */function (db) {
    return new _Promise(function (resolve, reject) {
        var options = _Object$assign({
            host: 'localhost',
            port: '27017'
        }, db.options);
        var connectionString = 'mongodb://' + (options.user ? options.user + ':' + options.password + '@' : '') + options.host + ':' + options.port + '/' + db.dbName;
        _mongodb.MongoClient.connect(connectionString, /** @function 
                                                       * @param err 
                                                       * @param connection */function (err, connection) {
            if (err) {
                console.error('connection error:', err);
                return reject(err);
            }

            db.connection = connection;
            resolve();
        });
    });
};

MongoStore.close = /** @function 
                   * @param db */function (db) {
    db.connection.close();
};
module.exports = exports.default;
//# sourceMappingURL=MongoStore.js.map