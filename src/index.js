import fs from 'fs';
import importLessVars from 'less-interop';
import create from 'lodash.create';
import isString from 'lodash.isstring';
import less from 'less';
import path from 'path';

const formatLessRenderError = (e) => {
  // Stolen from
  // https://github.com/webpack/less-loader/blob/v2.2.1/index.js#L158

  const extract = !e.extract ? '' :
    '\n near lines:\n   ' + e.extract.join('\n   ');

  const err = new Error(
    e.message + '\n @ ' + e.filename +
      ' (line ' + e.line + ', column ' + e.column + ')' +
      extract
  );

  err.hideStack = true;

  return err;
};

const importLessVarsWithImportResolution = (fileAbsPath) => {

  let lessVars;

  const lessSource = fs.readFileSync(fileAbsPath, 'utf8');

  less.parse(lessSource, {processImports: false}, (err, tree) => {
    if (err) {
      throw formatLessRenderError(err);
    }

    const importRules = // `@import` rules seem to have property `path`.
      tree.rules.filter(r => r.path);

    for (let rule of importRules) {
      const curFileDir = path.dirname(fileAbsPath);
      const importedFileAbsPath = path.join(curFileDir, rule.path.value);

      const lessVarsFromImportedFile =
        importLessVarsWithImportResolution(importedFileAbsPath);

      lessVars = create(lessVars, lessVarsFromImportedFile);
    }

    lessVars = create(lessVars, importLessVars(tree.rules));
  });

  return lessVars;

};

export default function ({ types: t }) {
  return {
    visitor: {
      Program(path, state) {

        const requiredPropsInOpts = [
          'lessFile',
          'memberExprObjName'
        ];

        for (let prop of requiredPropsInOpts) {
          if (state.opts[prop] === undefined) {
            throw new Error(
              `babel-plugin-less-interop: You have to provide option ${prop}` +
                ` in your plugin definition.`);
          }
        }

      },
      MemberExpression(path, state) {

        const lessVars =
          importLessVarsWithImportResolution(state.opts.lessFile);

        if (path.node.object.name === state.opts.memberExprObjName) {
          const propName = path.node.property.name;
          const lessValue = lessVars[propName];

          if (lessValue === undefined) {
            // TODO: What happened to this.errorWithNode?
            throw new Error(
              `babel-plugin-less-interop: Property ${propName} cannot be` +
                ` extracted from the given LESS file.`);
          }

          if (isFinite(lessValue)) {

            path.replaceWith(t.NumericLiteral(lessValue));

          } else if (isString(lessValue)) {

            path.replaceWith(t.StringLiteral(lessValue));

          }
        }

      }
    }
  }
}
