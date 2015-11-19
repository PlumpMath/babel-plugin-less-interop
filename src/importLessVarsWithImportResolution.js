const formatLessRenderError = require('./formatLessRenderError');

const create = require('lodash.create');
const fs = require('fs');
const importLessVars = require('less-interop');
const less = require('less');
const path = require('path');

module.exports = function importLessVarsWithImportResolution(fileAbsPath) {

  let lessVars;

  const lessSource = fs.readFileSync(fileAbsPath, 'utf8');

  less.parse(lessSource, {processImports: false}, (err, tree) => {
    if (err) {
      throw formatLessRenderError(err);
    }

    const importRules = // `@import` rules seem to have property `path`.
      tree.rules.filter(r => r.path);

    importRules.forEach(rule => {
      const curFileDir = path.dirname(fileAbsPath);
      const importedFileAbsPath = path.join(curFileDir, rule.path.value);

      const lessVarsFromImportedFile =
        importLessVarsWithImportResolution(importedFileAbsPath);

      lessVars = create(lessVars, lessVarsFromImportedFile);
    });

    lessVars = create(lessVars, importLessVars(tree.rules));
  });

  return lessVars;

};
