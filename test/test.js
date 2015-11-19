var assert = require('assert');
var babel = require('babel-core');
var fs = require('fs');
var less = require('less');
var path = require('path');

var directories = fs.readdirSync(__dirname).filter(function(file) {
  return fs.statSync(path.join(__dirname, file)).isDirectory();
});

describe('Passes', function () {

  directories.forEach(function (dir) {

    // Uncomment the following line to make just that one test run.
    // if (dir !== 'basic-number') return;

    var lessFilePath = path.join(__dirname, dir, 'index.less');

    // Skip empty subdirectories.
    try {
      fs.statSync(lessFilePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return;
      }
      throw err;
    }

    it(dir, function () {

      var afterFilePath = path.join(__dirname, dir, 'after.js');
      var beforeFilePath = path.join(__dirname, dir, 'before.js');

      var afterFileCode = fs.readFileSync(afterFilePath, {encoding: 'utf8'});
      var beforeFileCode = fs.readFileSync(beforeFilePath, {encoding: 'utf8'});

      var transpiledCode = babel.transform(beforeFileCode, {
        plugins: [
          'syntax-jsx',
          ['../dist/index.js', {
            lessFile: path.join(__dirname, dir, 'index.less')
          }]
        ]
      }).code;

      assert.deepEqual(
        transpiledCode.replace(/\s/g, ''),
        afterFileCode.replace(/\s/g, ''));

    });

  })

});
