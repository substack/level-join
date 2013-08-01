var Readable = require('readable-stream/readable');
var inherits = require('inherits');
var search = require('level-search');
var pull = require('pull-stream');
var pathway = require('pathway');
var npair = require('n-pair');

module.exports = Join;
inherits(Join, Readable);

function Join (db, opts) {
    if (!(this instanceof Join)) return new Join(db, opts);
    Readable.call(this, { objectMode: true });
    
    if (db && !db.put) {
        opts = db;
        db = opts.db;
    }
    if (!opts) opts = {};
    
    this.search = opts.search || search(db, 'index');
    this._pull = {};
    this._names = [];
    this._pivot = {};
    this._queue = {};
    this._pending = 0;
    this._alive = {};
    this._open = 0;
}

Join.prototype._read = function () {
    var self = this;
    
    self._pending += self._names.length;
    
    self._names.forEach(function (name) {
        if (!self._alive[name]) return -- self._pending;
        var keys = self._pivot[name];
        
        self._pull[name](null, function (end, data) {
            self._pending --;
            
            if (end) {
                self._alive[name] = false;
                if (-- self._open === 0 && self._pending == 0) {
                    self.push(null);
                }
                return;
            }
            
            var pivot = pathway(data.value, keys);
            if (pivot.length === 0) return;
            var key = pivot[0];
            if (!self._queue[key]) self._queue[key] = {};
            if (!self._queue[key][name]) self._queue[key][name] = [];
            
            self._queue[key][name].push(data.value);
            
            self._eachPair(key, name, data.value, function (pair) {
                self.push(pair);
            });
        });
    });
};

Join.prototype._eachPair = function (key, name, value, cb) {
    var self = this;
    
    var sets = [];
    for (var i = 0, l = self._names.length; i < l; i++) {
        var n = self._names[i];
        if (!self._queue[key][n]) return;
        if (name !== n) sets.push(self._queue[key][n]);
    }
    sets.splice(self._names.indexOf(name), 0, [ value ]);
    
    npair(sets, function (values) {
        var pairs = {};
        for (var i = 0, l = self._names.length; i < l; i++) {
            pairs[self._names[i]] = values[i];
        }
        cb(pairs);
    });
};

Join.prototype.add = function (name, pivotKeys, filterKeys) {
    var self = this;
    var stream = self.search.search(filterKeys);
    self._names.push(name);
    self._open ++;
    self._alive[name] = true;
    self._pivot[name] = pivotKeys;
    
    pull(stream, function (read) {
        self._pull[name] = read;
    });
};
