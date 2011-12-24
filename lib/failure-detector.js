// Copyright Joyent, Inc. All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

/**
 * Based (roughly) on the version from Cassandra:
 * <https://svn.apache.org/repos/asf/cassandra/trunk/src/java/org/apache/cassandra/gms/FailureDetector.java>
 *
 * Which is based on the paper "The Phi Accrual Failure Detector" by Naohiro Hayashibara.
 *  <http://www.scribd.com/doc/50937976/The-Phi-Accrual-Failure-Detector>
 */


function FailureDetector(window_size, start_at) {
  // ws stands for window size.
  // How many heartbeat intervals we keep track of.
  this._window_size = window_size || 100;
  this._window = []
  this._last = start_at || Date.now();
  this._mean = -1;
  this._variance = -1;
}
exports.FailureDetector = FailureDetector;


// Call this every time a heartbeat is received.
FailureDetector.prototype.report = function(when) {
  if (!when) {
    when = Date.now();
  }

  var interval = when - this._last;
  this._window.push(interval);

  if (this._window.length > this._window_size) {
    this._window.shift();
  }

  this._last = when;

  if (this._window.length) {
    // calculate mean and variance of intervals in our window.
    // This could be done more efficiently. Whatever.
    var sum = 0;
    for (var i = 0; i < this._window.length; i++) {
      sum += this._window[i];
    }
    this._mean = sum / this._window.length;

    sum = 0;
    for (var i = 0; i < this._window.length; i++) {
      var x = this._window[i] - this._mean;
      sum += x * x;
    }
    this._variance = sum / this._window.length;
  }
};


function log10(x) {
  return Math.log(x) / Math.LN10;
}


// Use this function to determine failure.
// Using 1 as a threshold means the likeliness of mistaken failure is 10%
// Using 2 as a threshold means the likeliness of mistaken failure is 1%
// Using 3 as a threshold means the likeliness of mistaken failure is 0.1%
FailureDetector.prototype.phi = function(when) {
  var t = (when || Date.now()) - this._last;

  // We haven't yet got any data via report.
  if (this._mean == -1) {
    return -1;
  }

  // If it's only 5 seconds from the start - let's give the system some
  // slack and allow it to fuck up.
  if (this._window.length < 3) {
    if (t < 5 * 1000) {
      return 0;
    }
  }

  // Took this approximation from casandra. Don't know where they got it.
  // suspect.
  var probability = Math.pow(Math.E, -1 * t / this._mean);

  var log = (-1) * log10(probability);

  return log;
};
