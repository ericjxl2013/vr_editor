const fs = require("fs");

//封装readfile为Promise
const readFile = function(url) {
    return new Promise((resovle, reject) => {
        // 设置编码格式
        fs.readFile(url, "utf8", (err, data) => {
            if (err) reject(err);
            resovle(data);
        });
    });
};

const writeFile = function(url, data) {
    return new Promise((resovle, reject) => {
        fs.writeFile(url, data, "utf8", err => {
            if (err) reject(err);
            resovle("success");
        });
    });
};

// TODO: 发送请求时，需要携带项目信息
exports.settings = async (ctx, next) => {
    // 把settings json文件发过去
    var data;
    try {
        data = await readFile("dist/12345/settings.json");
    } catch {
        return ctx.sendError("0002", "No Such File");
    }
    if (data) {
        // console.log('data: ' + data);
        return ctx.send(JSON.parse(data));
    } else {
        console.log("settings文件为空");
        return ctx.sendError("0002", "Empty");
    }
    // if (!fs.existsSync("dist/editor/project/")) {
    //     console.log("文件不存在");
    //     return ctx.send("file not exists");
    // } else {

    // }
};

exports.assets = async (ctx, next) => {
    // 把settings json文件发过去
    var data;
    try {
        data = await readFile("dist/12345/assets.json");
    } catch {
        return ctx.sendError("0002", "No Such File");
    }
    if (data) {
        // console.log('data: ' + data);
        return ctx.send(JSON.parse(data));
    } else {
        console.log("assets文件为空");
        return ctx.sendError("0002", "Empty");
    }
};

exports.scenes = async (ctx, next) => {
    // 把settings json文件发过去
    var data;
    try {
        data = await readFile("dist/12345/scenes.json");
    } catch {
        return ctx.sendError("0002", "No Such File");
    }
    if (data) {
        // console.log('data: ' + data);
        return ctx.send(JSON.parse(data));
    } else {
        console.log("scenes文件为空");
        return ctx.sendError("0002", "Empty");
    }
};

exports.getScene = async (ctx, next) => {
    // 把scene json文件发过去
    var data;
    try {
        data = await readFile("dist/12345/" + ctx.request.body.scene + ".json");
    } catch {
        return ctx.sendError("0002", "No Such File");
    }
    if (data) {
        // console.log('data: ' + data);
        return ctx.send(JSON.parse(data));
    } else {
        console.log("scene文件为空");
        return ctx.sendError("0002", "Empty");
    }
};
