const fs                = require("fs");
const path              = require("path");
const WriteFilePlugin   = require("write-file-webpack-plugin");
const HtmlWepackPlugin  = require("html-webpack-plugin");

function getProductionBaseUrl(api, pluginOptions) {
  var baseUrl = pluginOptions.baseUrl;

  if (typeof baseUrl !== "undefined") {
    return baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  }

  const assetsPath = api.resolve("assets");
  const themesIndex = assetsPath.lastIndexOf("themes");
  const pathAbsolute = assetsPath.substring(themesIndex).replace(/\\/g, "/");

  return "/" + pathAbsolute+"/";
}

function resolveProperty(obj, p) {
  return p.split(".").reduce(function (p, k) {
    return p && p[k];
  }, obj);
}

module.exports = (api, options) => {
  var isProduction = process.env.NODE_ENV !== "development";

  console.log("[VueSTORM] Environment:", process.env.NODE_ENV);

  if(isProduction){
    var pluginOptions = resolveProperty(options, "pluginOptions.vuestorm") || {
      baseUrl: undefined,
    };

    options.publicPath = getProductionBaseUrl(api, pluginOptions);
    options.outputDir = "assets";

    api.chainWebpack(function (config) {
      config.plugin("html").use(HtmlWepackPlugin, [
        {
          minify: {
            removeComments: true,
          },
          filename: "../pages/index.htm",
          template: "src/index.htm",
        },
      ]);
    });
  }

  if (!isProduction) {
    api.configureWebpack((config) => {
      config.devServer = {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
      config.plugins.push(new WriteFilePlugin({ test: /\.htm$/ }));
    });
  }
};
