var db = require('level')(__dirname + '/db');
var join = require('../')(db);

var a = join.from('id', [ 'type', 'commit' ]);
var b = join.from('job', [ 'type', 'output' ]);

join(a, b).pipe(dst);
