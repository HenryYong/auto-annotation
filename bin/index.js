#!/usr/bin/env node
'use strict';

var path = require('path')
var fs = require('fs')
var argv = require('yargs').argv
var ora = require('ora')
var spinner = ora('Loading...').start();
var setting = require('./../utils/setting.js')
var lang = require('./../lang')
console.log('lang', lang)
// console.log('setting', setting)

function prezero (num) {
    if (num < 10) {
        return '0' + num
    }

    return num
}

function getFilesByPath ($path) {
    var arr = [],
        dir = fs.readdirSync($path),
        link = $path + '/'

    dir.length && dir.map(function (item) {
        var _path = link + item
        if (fs.statSync(_path).isDirectory()) {
            arr = arr.concat(getFilesByPath(_path))
        } else {
            var pathObj = path.parse(_path)

            arr.push({
                path: _path,
                filename: pathObj.name,
                ext: pathObj.ext.substring(1)
            })
        }
    })

    return arr
}

function assembleAnnotation (obj) {
    var delimiter = '-'
    var _lang = lang[obj.ext]
    console.log(_lang, obj.ext)
    if (!_lang) return

    var annotation = _lang.start + '\n'
    var time = fs.statSync(obj.path).birthtime || +new Date()
    var ctime = new Date(time)

    var ctimeUTC = ctime.getFullYear() + delimiter + prezero(ctime.getMonth() + 1) + delimiter + prezero(ctime.getDate()) + ' ' + prezero(ctime.getHours()) + ':' + prezero(ctime.getMinutes()) + ':' + prezero(ctime.getSeconds())

    setting.filename = obj.filename
    setting.time = 'Created @ ' + ctimeUTC

    for (var key in setting) {
        annotation += _lang.middle + '  ' + setting[key] + '\n'
    }

    annotation += _lang.end + '\n\n'

    return annotation
}

function writeAnnotation (obj) {
    var annotation = assembleAnnotation(obj)

    return new Promise(function (resolve, reject) {
        if (!annotation) {
            resolve()
        } else {
            fs.readFile(obj.path, 'utf-8', function (err, file) {
                if (err) throw err

                // add annotation only if there is no annotation at the beginning of the file
                if (file.indexOf(lang[obj.ext].start) !== 0) {
                    fs.writeFile(obj.path, annotation + file, function (err) {
                        if (err) throw err
                        resolve()
                    })
                }

                resolve()
            })
        }
    })
}

var exec = function exec() {
    var _ = argv._;
    var path = _.length ? _[0] : process.cwd()
    var files = getFilesByPath(path)

    files.length && files.map(function (item, index) {
        writeAnnotation(item).then(function () {
            if (index === files.length - 1) {
                setTimeout(function () {
                    spinner.stop()
                    console.log('Finished')
                }, 500)
            }
        })
    })
};

exec();
