var db = require('level')(__dirname + '/db');


var join = require('../')(db, [ 'type', 'commit' ], [ 'type', 'output' ]);
join('id', 'job').pipe(dst);

var join = require('../')(db);
join({
    id: [ 'type', 'commit' ],
    job: [ 'type', 'output' ]
}).pipe(dst);

var join = require('../')(db);
join(
    [ 'id', [ 'type', 'commit' ] ],
    [ 'job', [ 'type', 'output' ] ]
).pipe(dst);
