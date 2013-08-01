var sub = require('level-sublevel');
var level = require('level-test')();
var through = require('through');
var shasum = require('shasum');

var db = sub(level('testing', { valueEncoding: 'json' }));
var join = require('../')(db);

db.batch(require('./data.json').map(function (row) {
    var key = shasum(row);
    return { type: 'put', key: key, value: row };
}));

join.add('commit', [ 'id' ], [ 'type', 'commit' ]);
join.add('output', [ 'job' ], [ 'type', 'output' ]);

join.pipe(through(function (pair) {
    console.log(pair.commit.hash, pair.output.data);
}));
