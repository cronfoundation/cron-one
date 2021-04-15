const path = require('path');

const basePath = path.resolve(__dirname, '.git');

const hooks =
  process.env.NEO_ONE_PUBLISH === 'true'
    ? {}
    : {
        'pre-commit': ``,
        'post-merge': 'rush install',
        'post-rewrite': 'rush install',
      };

module.exports = {
  hooks,
};
