var webpack = require('webpack');

module.exports = {
  entry : {
    app : './content/script.js',
    second : './content/script2.js',
    common : []
  },
  output : {
    path : './public',
    filename : '[name].bundle.js'
  },
  plugins : [
    new webpack.optimize.CommonsChunkPlugin('common', 'common.bundle.js'),
    // new webpack.optimize.UglifyJsPlugin({
    //         compress: {
    //             warnings: false,
    //         },
    //         output: {
    //             comments: false,
    //         },
    //     })
  ]
};
