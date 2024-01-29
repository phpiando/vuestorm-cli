const fs = require("fs");
const path = require("path");
const WriteFilePlugin = require("write-file-webpack-plugin");

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
  var isProduction = process.env.NODE_ENV === "production";

  if(isProduction){
    var pluginOptions = resolveProperty(options, "pluginOptions.vuestorm") || {
      baseUrl: undefined,
    };

    options.publicPath = getProductionBaseUrl(api, pluginOptions);
    options.outputDir = "assets";

    api.chainWebpack(function (config) {
      config.plugin("html").tap(function (args) {
        Object.assign(args[0], {
          minify: Object.assign(args[0].minify || {}, {
            removeComments: true,
          }),
          filename: "../pages/index.htm",
          template: "src/index.htm",
        });

        return args;
      });
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
