import fs from 'fs';
import importLessVars from 'less-interop';
import create from 'lodash.create';
import isString from 'lodash.isstring';
import less from 'less';
import path from 'path';

export default function ({ types: t }) {
  return {
    visitor: {
      MemberExpression(path, state) {

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

        let lessVars;

        const lessSource = fs.readFileSync(
          state.opts.lessFile,
          {encoding: 'utf8'});

        let parseOptions = create(state.opts.lessParseOptions || {}, {
          sync: true // This makes `less.parse` synchronous.
        });

        less.parse(lessSource, parseOptions, (err, tree) => {
          if (err) {
            throw err; // TODO: What happened to this.errorWithNode?
            // TODO: Format LESS errors
          }

          lessVars = importLessVars(tree.rules);
        });

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

          } else {
            // TODO: What happened to this.errorWithNode?
            throw new Error(
              `babel-plugin-less-interop: Unknown value type has been` +
                ` returned by less-interop: ${lessValue}`);
          }
        }

      }
    }
  }
}
