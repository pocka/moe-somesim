// postcss-loader can't load config in package.json
// when module came from node_modules...
// why do webpack-contrib's loaders have awful UX?

const pkg = require('./package.json')

module.exports = pkg.postcss
