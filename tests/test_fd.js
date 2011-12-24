/*
 *  Copyright 2011 Rackspace
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */


var FailureDetector = require('../lib/failure-detector').FailureDetector;

exports['test_obvious'] = function(test, assert) {
  var d = new FailureDetector();

  for (var i = 1; i < 100; i ++ ) {
    d.report(Date.now() + i * 1000);
  }

  // mean should be almost exactly one second
  // console.log("mean = ", d._mean);
  assert.ok(999 <=  d._mean && d._mean <= 1001);

  // should be pretty certain everything is fine.
  // console.log("phi = ", d.phi());
  assert.ok(d.phi() <= 0.01);


  assert.ok(d.phi(Date.now() + 120 * 1000) > 9.0);
  assert.ok(d.phi(Date.now() + 120 * 1000) < 9.2);

  assert.ok(d.phi(Date.now() + 200 * 1000) > 40);
  assert.ok(d.phi(Date.now() + 200 * 1000) < 50);

  test.finish();
};

exports['test_from_cassandra'] = function(test, assert) {
  var d = new FailureDetector(4);
  d.report(111);
  d.report(222);
  d.report(333);
  d.report(444);
  d.report(555);

  var expected = 0.4342;
  var actual = d.phi(666);
  // console.log("mean = ", d._mean);
  // console.log("phi = ", actual);
  assert.ok(expected - 0.01 <= actual && actual <= expected + 0.01);

  //oh noes, a much higher timestamp, something went wrong!
  expected = 9.566;
  actual = d.phi(3000);
  // console.log("mean = ", d._mean);
  // console.log("phi = ", actual);
  assert.ok(expected - 0.01 <= actual && actual <= expected + 0.01);
  test.finish();
};

