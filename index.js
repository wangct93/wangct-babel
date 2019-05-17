/**
 * Created by wangct on 2018/12/22.
 */
const babel = require('@babel/core');
const path = require('path');
const appDir = process.cwd();
const resolve = (...paths) => path.resolve(appDir,...paths);
const fs = require('fs');

const util = require('wangct-server-util');

class Babel {
    constructor(option) {
        this.init(option);
    }
    init(option) {
        const state = {
            accept: ['js', 'jsx','ts','tsx'],
            option: {
                presets: ['@babel/preset-react', '@babel/preset-env'],
                plugins: [
                    ['@babel/plugin-transform-typescript', {
                        isTSX: true,
                        allExtensions: true
                    }],
                    '@babel/plugin-transform-runtime',
                    ['@babel/plugin-proposal-decorators', {legacy: true}],
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-proposal-class-properties',
                    '@babel/plugin-proposal-export-default-from',
                ]
            }
        };
        this.props = {
            ...state,
            ...option,
            output: resolve(option.output)
        };
        this.start();
    }
    start() {
        const {props} = this;
        util.copyFile({
            ...props,
            transform:(filePath,outputFilePath,callback) => {
                const extname = path.extname(filePath).substr(1);
                if(this.props.accept.includes(extname)){
                    babel.transformFile(filePath, props.option, (err, result) => {
                        if (err) {
                            callback(err);
                        } else {
                            fs.writeFile(outputFilePath.replace(/\.tsx?$/,'.js'), result.code, callback);
                        }
                    });
                }else{
                    const rs = fs.createReadStream(filePath);
                    const ws = fs.createWriteStream(outputFilePath);
                    rs.pipe(ws);
                    ws.on('close',() => {
                        callback();
                    });
                }
            }
        });
    }
}

module.exports = Babel;