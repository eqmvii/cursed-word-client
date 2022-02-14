// vue.config.js file to be place in the root of your repository for GitHub Pages deploy
// Instructions from https://cli.vuejs.org/guide/deployment.html#platform-guides

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/cursed-word-client/'
    : '/'
}
