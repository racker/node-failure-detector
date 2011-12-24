node-failure-detector
====================

node-failure-detector is a [node.js](http://nodejs.org) implementation of the Phi accrual failure detector.

This is commonly used to detect failure of a peer in a distributed system.


Example
====================

    var fd = require('failure-detector');
    var fds = {};
    
    server.on('message', function(msg) {
      var f;
      if (msg.type == "ping") {
        if (!fds[server.id]) {
          fds[server.id] = new fd.FailureDetector();
        }
        fds[server.id].report();
      }
    });
    
    setInterval(function() {
      var k;
      for (k in fds) {
        if (fds.hasOwnProperty(k)) {
          if (fds[k].phi() > 8) {
            console.error(k + ' has probably failed!');
          }
        }
      }
    }, 1000);

Installation
====================

    $ npm install failure-detector


License
====================

Original node-failure-detector code is under the MIT license, from Joyent.

Updates from Rackspace are under the [Apache license](http://www.apache.org/licenses/LICENSE-2.0.html).

