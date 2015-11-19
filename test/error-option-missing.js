var assert = require('assert');
var babel = require('babel-core');
var path = require('path');

module.exports = function () {
  it('error-option-missing', function () {

    try {

      babel.transform('', {
        plugins: [
          ['../dist/index.js', {
            memberExprObjName: 'LESS'
          }]
        ]
      });

    } catch (err) {

      assert(
        err.message.indexOf('babel-plugin-less-interop:' +
          ' You have to provide option lessFile in' +
          ' your plugin definition.') !== -1
      );

    }

  });
};
