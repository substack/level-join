var sub = require('level-sublevel');
var level = require('level-test')();
var through = require('through');
var shasum = require('shasum');
var test = require('tape');

var db = sub(level('testing', { valueEncoding: 'json' }));
var join = require('../')(db);

test('setup', function (t) {
    db.batch(require('./data.json').map(function (row) {
        var key = shasum(row);
        return { type: 'put', key: key, value: row };
    }), function () { t.end() });
});

test('join', function (t) {
    join.add('commit', [ 'id' ], [ 'type', 'commit' ]);
    join.add('output', [ 'job' ], [ 'type', 'output' ]);

    t.plan(1);
    var results = [];
    
    join.pipe(through(write, end));
    
    function write (pair) {
        var hash = pair.commit.hash;
        if (!results[hash]) results[hash] = [];
        results[hash].push(pair.output.data);
    }
    function end () {
        t.deepEqual(results, {
            '5c825a710662cab0b8abb37132cae19d0dcf00cb': [ 'hello', 'world!' ],
            '6eba8e6a2927a5d8b748d422ad7e64b977ab4f94' : [ 'beep', 'boop.' ]
        });
    }
});
