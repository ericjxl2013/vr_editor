const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
var locker = require("./lock");

const renameFile = function (oldpath, newpath) {
    return new Promise((resovle, reject) => {
        fs.rename(oldpath, newpath, (err) => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

const createUuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        var r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

function getRealTime(str) {
    if (str < 10) {
        return "0" + str;
    }
    return str;
}

function createdAtTime() {
    var now = new Date();
    var Y = now.getFullYear();
    var m = getRealTime(now.getMonth() + 1);
    var d = getRealTime(now.getDate());
    var H = getRealTime(now.getHours());
    var i = getRealTime(now.getMinutes());
    // var s = getRealTime(now.getSeconds());
    return Y + "-" + m + "-" + d + " " + H + ":" + i;
}

//封装readfile为Promise
const readFile = function (url) {
    return new Promise((resovle, reject) => {
        // 设置编码格式
        fs.readFile(url, "utf8", (err, data) => {
            if (err) reject(err);
            resovle(data);
        });
    });
};

const writeFile = function (url, data) {
    return new Promise((resovle, reject) => {
        fs.writeFile(url, data, "utf8", (err) => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

const existsFile = (url) => {
    return new Promise((resovle, reject) => {
        fs.exists(url, (exists) => {
            resovle(exists);
        });
    });
};

const mkDir = (url) => {
    return new Promise((resovle, reject) => {
        fs.mkdir(url, (err) => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

const copyFile = (src, dest) => {
    return new Promise((resovle, reject) => {
        fs.copyFile(src, dest, (err) => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

exports.upload = async (ctx, next) => {
    const form = formidable({ multiples: false });
    // console.log(ctx.request.body);
    // console.log(form);
    // console.log(ctx.req);
    var file;
    var projectID;
    var assetFields;

    await new Promise((resolve, reject) => {
        form.uploadDir = "dist/assets";
        form.hash = "sha1";
        form.parse(ctx.req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            // console.log(files);
            console.log(fields);
            file = files["file"];
            projectID = fields.projectID;
            assetFields = fields;
            // if(file) {
            //     form.uploadDir = "dist/projects/" + projectID + "/assets";
            // }
            // if (file) {
            //     console.log(file);
            //     var newpath = "dist/assets/" + file.name;
            //     //改名
            //     var oldpath = file.path;
            //     await renameFile(oldpath, newpath);
            //     // console.log(file.size);
            //     // console.log(file.type);
            // } else {
            // }

            // ctx.set("Content-Type", "application/json");
            // ctx.status = 200;
            // ctx.state = { fields, files };
            // ctx.body = JSON.stringify(ctx.state, null, 2);
            resolve();
        });
    });
    var filename;
    var assetData = {};
    if (file) {
        if (file.length === undefined) {
            var newpath = "dist/projects/" + projectID + "/assets/" + file.name;
            //改名
            var oldpath = file.path;
            filename = file.name;
            await renameFile(oldpath, newpath);

            var assetID = new Date().getTime().toString();
            assetID = file.hash;
            var createdAt = createdAtTime();
            assetData = {
                id: assetID,
                type: assetFields.type,
                createdAt: createdAt,
                modifiedAt: createdAt,
                name: assetFields.name,
                preload: assetFields.preload,
                parent: null,
                scope: {
                    type: "project",
                    id: projectID,
                },
                file: {
                    filename: file.name,
                    size: file.size,
                    url: "/projects/" + projectID + "/assets/" + file.name,
                    projectID: projectID,
                    hash: file.hash,
                },
                path: [],
            };

            if (assetFields.type === "texture") {
                assetData["thumbnails"] =
                    "/projects/" + projectID + "/assets/" + file.name;
            }

            // TODO: 异步读写文件，文件信息出错
            var assetFile = fs.readFileSync(
                "dist/projects/" + projectID + "/assets.json"
            );
            assetFile = JSON.parse(assetFile);
            if (assetFile[assetID] === undefined) {
                assetFile[assetID] = assetData;
            }
            fs.writeFileSync(
                "dist/projects/" + projectID + "/assets.json",
                JSON.stringify(assetFile)
            );
        } else {
            for (var i = 0; i < file.length; i++) {
                var newpath =
                    "dist/projects/" + projectID + "/assets/" + file[i].name;
                //改名
                var oldpath = file[i].path;
                filename = file[i].name;
                await renameFile(oldpath, newpath);
            }
        }
    } else {
        if (assetFields.type === "folder") {
        }
    }

    // await next();
    return ctx.send(assetData);
};

exports.addScene = async (ctx, next) => {
    var data = ctx.request.body;
    var projectID = data.projectID;
    var newData = data.entities;
    var oldData = await readFile("dist/projects/" + projectID + "/scenes.json");
    oldData = JSON.parse(oldData);
    for (var key in newData) {
        oldData.scenes[0].entities[key] = newData[key];
    }
    if(data.path1 && data.path2) {
        oldData.scenes[0].path1 = data.path1;
        oldData.scenes[0].path2 = data.path2;
    }
    await writeFile("dist/projects/" + projectID + "/scenes.json", JSON.stringify(oldData));
    return ctx.send(oldData);
};
