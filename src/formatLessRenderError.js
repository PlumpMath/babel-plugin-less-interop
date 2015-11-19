module.exports = function formatLessRenderError(e) {
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
