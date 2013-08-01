var sub = require('level-sublevel');
var through = require('through');

var db = sub(require('level')(__dirname + '/db', { valueEncoding: 'json' }));
var join = require('../')(db);
//var search = require('level-search')(db, 'index');

db.batch(require('./data.json').map(function (row) {
    var key = Math.random().toString(16).slice(2);
    return { type: 'put', key: key, value: row };
}));

join.from('id', [ 'type', 'commit' ]);
join.from('job', [ 'type', 'output' ]);

join.pipe(through(function (pair) {
    console.log(pair[0], pair[1].data);
}));
