import AbstractCursor from 'liwi/lib/AbstractCursor';

export default class Cursor extends AbstractCursor {
    constructor(cursor, store, query) {
        super();
        this._cursor = cursor;
        this._store = store;
        this._query = query;
    }

    get query() {
        return this._query;
    }

    advance(count) {
        this._cursor.skip(count);
        return this;
    }

    next() {
        return new Promise((resolve, reject) => {
            this._cursor.nextObject((err, value) => {
                if (err) {
                    return reject(err);
                }

                this._result = value;
                this.key = value && value._id;
                resolve(this.key);
            });
        });
    }

    limit(newLimit) {
        return new Promise((resolve, reject) => {
            this._cursor.limit(newLimit, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    count(applyLimit) {
        return new Promise((resolve, reject) => {
            this._cursor.count(applyLimit, (err, result) => {
                if (err) {
                    return reject(err);
                }

                resolve(result);
            });
        });
    }

    result() {
        return Promise.resolve(this._result);
    }

    remove() {
        return this._store.deleteByKey(this.key);
    }

    forEach(callback) {
        return this.forEachResults((result) => {
            return callback(this._store.toVO(result));
        });
    }

    forEachResults(callback) {
        return new Promise((resolve, reject) => {
            var waitFor = 0;
            this._cursor.each((err, result) => {
                if (err) {
                    return reject(err);
                }

                if (result === null) {
                    // end !
                    this.close();
                    if (waitFor === 0) {
                        resolve();
                    }

                    return;
                }
                try {
                    var result = callback(result);
                    if (result && typeof result.then === 'function') {
                        waitFor++;
                        result.then(() => {
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

    toArray() {
        return new Promise((resolve, reject) => {
            this._cursor.toArray((err, results) => {
                if (err) {
                    return reject(err);
                }
                try {
                    resolve(results.map((v => this._store.toVO(v))));
                } catch(err) {
                    reject(err);
                }
            });
        });
    }

    close() {
        if (this._cursor) {
            this._cursor.close();
            this._cursor = this._store = this._result = undefined;
        }
        return Promise.resolve();
    }
}

Cursor.prototype[Symbol.iterator] = function() {
    return {
        next: () => {
            return {
                done: this._cursor === undefined,
                value: this.next().then((key) => {
                    if (key === null) {
                        this.close();
                        return undefined;
                    }
                    return this.vo();
                })
            };
        }
    };
};
