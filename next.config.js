const withLess = require("@zeit/next-less");
const withCss = require("@zeit/next-css");
const withPlugins = require("next-compose-plugins");
const cssLoaderGetLocalIdent = require("css-loader/lib/getLocalIdent.js");
const path = require('path');

module.exports = withPlugins([withLess,withCss], {
  lessLoaderOptions : {//如果是antd就需要，antd-mobile不需要
    javascriptEnabled : true
  },
  cssModules: true,
  cssLoaderOptions: {
    camelCase: true,
    localIdentName: "[local]___[hash:base64:5]",
    getLocalIdent: (context, localIdentName, localName, options) => {
      let hz = context.resourcePath.replace(context.rootContext, "");
      if (/node_modules/.test(hz)) {
        return localName;
      } else {
        return cssLoaderGetLocalIdent(
          context,
          localIdentName,
          localName,
          options
        );
      }
    }
  },
  webpack(config){
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': path.resolve(__dirname, 'components'),
      '@/pages': path.resolve(__dirname, 'pages'),
      '@/store': path.resolve(__dirname, 'store'),
      '@/types': path.resolve(__dirname, 'types'),
    }
    if(config.externals){
      const includes = [/antd/];
      config.externals = config.externals.map(external => {
        if (typeof external !== 'function') return external;
        return (ctx, req, cb) => {
          return includes.find(include =>
            req.startsWith('.')
              ? include.test(path.resolve(ctx, req))
              : include.test(req)
          )
            ? cb()
            : external(ctx, req, cb);
        };
      });
    }
    return config;
  }
});