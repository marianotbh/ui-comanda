const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	entry: {
		core: path.resolve(__dirname, "core/index.ts"),
		app: path.resolve(__dirname, "src/index.ts")
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "build")
	},
	devtool: "eval-source-map",
	devServer: {
		contentBase: path.resolve(__dirname, "public"),
		hot: true,
		port: 3000,
		publicPath: "/"
	},
	optimization: {
		nodeEnv: "dev"
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader"
			},
			{
				test: /\.html$/,
				loader: "html-loader"
			},
			{
				test: /\.(css|scss)$/,
				loader: [MiniCSSExtractPlugin.loader, "css-loader", "sass-loader"]
			},
			{
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "./assets/fonts/",
							publicPath: "./assets/fonts"
						}
					}
				]
			},
			{
				test: /\.(png|jpg|gif)(\?v=\d+\.\d+\.\d+)?$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "./assets/img/",
							publicPath: "./assets/img"
						}
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			template: "public/index.html"
		}),
		new MiniCSSExtractPlugin({
			filename: "styles.bundle.css"
		}),
		new CleanWebpackPlugin()
	],
	resolve: {
		modules: ["node_modules"],
		extensions: [".ts", ".tsx", ".js", ".css", ".scss"],
		alias: {
			core: path.resolve(__dirname, "core"),
			src: path.resolve(__dirname, "src"),
			modules: path.join(__dirname, "node_modules")
		}
	}
};
