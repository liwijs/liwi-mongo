import AbstractStore from 'liwi/lib/AbstractStore';
import Cursor from './Cursor';
import { MongoClient, ObjectID } from 'mongodb';

const regexpObjectId = /^[a-f\d]{24}$/i;
export default class MongoStore extends AbstractStore {
    initialize() {
        this.manager.VO.keyPath = '_id';
        return new Promise((resolve, reject) => {
            if (!this.manager.VO.name || this.manager.VO.name.toLowerCase() === 'function') {
                throw new Error('Unable to find model name ' + this.manager.VO.name +
                                        ', ' + this.manager.name);
            }

            this.db.connection.collection(this.manager.VO.name, { w: 1 }, (err, collection) => {
                if (err) {
                    return reject(err);
                }

                this.collection = collection;
                resolve();
            });
        });
    }

    store() {
        return this.collection;
    }

    toId(id) {
        if (id instanceof ObjectID) {
            return id;
        }

        if (typeof id === 'string' && id.length === 24 && regexpObjectId.test(id)) {
            return new ObjectID(id);
        }

        return id;
    }

    createMongoId(vo) {
        if (!vo.id) {
            vo.data._id = new ObjectID();
        }
    }

    insert(options) {
        return new Promise((resolve, reject) => {
            this.collection.insert(options.data, options, (err, item) => {
                if (err) {
                    return reject(err);
                }

                resolve(item);
            });
        });
    }

    update(options) {
        return new Promise((resolve, reject) => {
            var data = !options.partialUpdate ? options.data : { $set: options.data };
            this.collection.update(options.criteria, data, options, (err, result) => {
                if (err) {
                    return reject(err);
                }

                resolve(result.n);
            });
        });
    }

    remove(options) {
        return new Promise((resolve, reject) => {
            this.collection.remove(options.criteria, options, (err, result) => {
                if (err) {
                    return reject(err);
                }

                resolve(result.n);
            });
        });
    }

    /** @see http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#findone */
    findOne(query, options){
        return new Promise((resolve, reject) => {
            // selector, options, callback?
            // options= limit,sort,fields,skip,hint,tailable,tailableRetryInterval,returnKey,maxScan,min,max,comment,raw
            this.collection.findOne(query, options, (err, result) => {
                if (err) {
                    return reject(err);
                }

                resolve(result);
            });
        });
    }

    /** @see http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#find */
    cursor(query, options) {
        return new Promise((resolve, reject) => {
            // selector, options, callback?
            // options= limit,sort,fields,skip,hint,tailable,returnKey,maxScan,min,max,comment,raw
            this.collection.find(query, options, (err, cursor) => {
                if (err) {
                    return reject(err);
                }

                resolve(new Cursor(cursor, this, query));
            });
        });
    }
}

MongoStore.ObjectID = ObjectID;

MongoStore.initialize = function(db) {
    return new Promise((resolve, reject) => {
        var options = Object.assign({
            host: 'localhost',
            port: '27017',
        }, db.options);
        var connectionString = 'mongodb://' + (options.user ? options.user + ':' + options.password + '@' : '' )
                            + options.host + ':' + options.port + '/' + db.dbName;
        MongoClient.connect(connectionString, function(err, connection) {
            if (err) {
                console.error('connection error:', err);
                return reject(err);
            }

            db.connection = connection;
            resolve();
        });
    });
};

MongoStore.close = function(db) {
    db.connection.close();
};
