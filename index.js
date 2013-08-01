var Readable = require('stream').Readable;
var inherits = require('inherits');
var search = require('level-search');
var pull = require('pull-stream');

module.exports = Join;
inherits(Join, Readable);

function Join (db, opts) {
    if (!(this instanceof Join)) return new Join(db, opts);
    Readable.call(this);
    
    if (db && !db.put) {
        opts = db;
        db = opts.db;
    }
    if (!opts) opts = {};
    
    this.search = opts.search || search(db, 'index');
    this._pull = {};
    this._queue = {};
    this._keys = [];
}

Join.prototype._read = function (next) {
    console.log('_READ!');
    this._pull.id(null, function (end, data) {
        console.log(end, data);
    });
};

Join.prototype.from = function (key, keys) {
    var self = this;
    var stream = self.search.search(keys);
    self._keys.push(key);
    
    pull(stream, function (read) {
        self._pull[key] = read;
    });
};
