# level-join

join leveldb documents based on common nested values

# example

Given this dataset with `commit` and `output` rows:

``` json
[
  { "type": "commit", "id": 444, "hash": "6eba8e6a2927a5d8b748d422ad7e64b977ab4f94", "time": 1374904364802 },
  { "type": "output", "job": 444, "data": "beep ", "time": 1374904288007 },
  { "type": "output", "job": 444, "data": "boop.", "time": 1374904289854 },
  { "type": "commit", "id": 555, "hash": "5c825a710662cab0b8abb37132cae19d0dcf00cb", "time": 1374904278950 },
  { "type": "output", "job": 555, "data": "hello ", "time": 1374904366509 },
  { "type": "output", "job": 555, "data": "world!", "time": 1374904367169 }
]
```

we can populate the database with `db.batch()` and then join each `output`'s `job`
property with a matching `commit` `id` property. This is like a foreign key in
an SQL database, except that it can be arbitrarily nested.

``` js
var sub = require('level-sublevel');
var level = require('level');
var through = require('through');
var shasum = require('shasum');

var db = sub(level('/tmp/testdb', { valueEncoding: 'json' }));
var join = require('level-join')(db);

db.batch(require('./data.json').map(function (row) {
    var key = shasum(row);
    return { type: 'put', key: key, value: row };
}));

join.add('commit', [ 'id' ], [ 'type', 'commit' ]);
join.add('output', [ 'job' ], [ 'type', 'output' ]);

join.pipe(through(function (pair) {
    console.log(pair.commit.hash, pair.output.data);
}));
```

For each pairing of `commit` and `output` objects, the commit hash and output
data get printed:

```
5c825a710662cab0b8abb37132cae19d0dcf00cb hello 
6eba8e6a2927a5d8b748d422ad7e64b977ab4f94 boop.
5c825a710662cab0b8abb37132cae19d0dcf00cb world!
6eba8e6a2927a5d8b748d422ad7e64b977ab4f94 beep 
```

Note that the results are not grouped or sorted. A grouping and sorting module
could be of use here.

# methods

``` js
var levelJoin = require('level-join')
```

## var join = levelJoin(db)

Create a new `join` instance from a
[sublevel](https://npmjs.org/package/level-sublevel]-capable
[leveldb](https://npmjs.org/package/level) handle `db`.

`join` is an object-mode readable stream that outputs `pair` objects with keys
for each of the names that have been added with `join.add()` and values of the
matching documents.

## join.add(name, joinPath, filterPath)

Add `name` to the join using the value at the
[pathway](https://npmjs.org/package/pathway) array `joinPath`
and filtering results by the `filterPath` array that will be passed through
directly to [level-search](https://npmjs.org/package/level-search).

# install

With [npm](https://npmjs.org) do:

```
npm install level-join
```

# license

MIT
