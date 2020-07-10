const fs = require("fs");
const { FileWatcherEventKind } = require("typescript");

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

function createdAt() {
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

exports.projects = async (ctx, next) => {
    var data;
    try {
        data = await readFile("dist/database/userinfo.json");
    } catch {
        return ctx.sendError("0002", "No Such File");
    }
    if (data) {
        console.log("projects: " + data);
        var jsonData = JSON.parse(data);
        if (jsonData[global.mockUserName]) {
            // console.log(jsonData[global.mockUserName]);
            return ctx.send(jsonData[global.mockUserName]);
        } else {
            return ctx.sendError(
                "0002",
                "No Such User: " + global.mockUserName
            );
        }
    } else {
        console.log("settings文件为空");
        return ctx.sendError("0002", "Empty");
    }
};

exports.createProject = async (ctx, next) => {
    var data = ctx.request.body;
    // console.log(data);

    // 初始化项目文件
    // 判断根目录是否存在
    exists = await existsFile("dist/projects");
    if (!exists) {
        var mkdirResult = await mkDir("dist/projects");
    } else {
        // console.log("目录存在：" + "dist/projects");
    }

    // 生成项目ID，判断项目ID，若id重复，则循环生成
    exists = await existsFile("dist/database/projects.json");
    var dataFile;
    if (exists) {
        dataFile = await readFile("dist/database/projects.json");
        dataFile = JSON.parse(dataFile);
    } else {
        dataFile = {};
    }
    exists = true;
    var projectID = createUuid().substring(0, 8);
    while (exists) {
        if (dataFile[projectID] === undefined) {
            exists = false;
            dataFile[projectID] = { owner: global.mockUserID };
            // 创建项目目录
            var mkdirResult = await mkDir("dist/projects/" + projectID);
            await writeFile(
                "dist/database/projects.json",
                JSON.stringify(dataFile)
            );
        } else {
            projectID = createUuid().substring(0, 8);
        }
    }

    // 用户数据更新
    exists = await existsFile("dist/database/userinfo.json");
    if (exists) {
        dataFile = await readFile("dist/database/userinfo.json");
        dataFile = JSON.parse(dataFile);
        if (dataFile[global.mockUserName] === undefined) {
            dataFile[global.mockUserName] = { projects: [] };
        }
    } else {
        dataFile = {};
        dataFile[global.mockUserName] = { projects: [], id: global.mockUserID };
    }
    var createdTime = createdAt();
    // console.log(dataFile[global.mockUserName]);
    // console.log(dataFile[global.mockUserName]["projects"]);
    dataFile[global.mockUserName]["projects"].push({
        id: projectID,
        name: data["name"],
        createdAt: createdTime,
        icon: "",
    });
    await writeFile("dist/database/userinfo.json", JSON.stringify(dataFile));

    // 创建project数据，先复制，再修改写入
    // var copyProject = await copyFile("dist/standard/project.json", "dist/projects/" + projectID + "/project.json");
    var projectData = await readFile("dist/standard/project.json");
    projectData = JSON.parse(projectData);
    projectData["owner"] = {
        id: global.mockUserID,
        username: global.mockUserName,
    };
    projectData["project"] = { id: projectID, name: data["name"] };
    await writeFile(
        "dist/projects/" + projectID + "/project.json",
        JSON.stringify(projectData)
    );

    // 创建assets数据
    var assetsData = await readFile("dist/standard/assets.json");
    assetsData = JSON.parse(assetsData);
    await writeFile(
        "dist/projects/" + projectID + "/assets.json",
        JSON.stringify(assetsData)
    );
    await mkDir("dist/projects/" + projectID + "/assets");

    // 创建全局唯一scene id
    exists = await existsFile("dist/database/scenes.json");
    var sceneFile;
    if (exists) {
        sceneFile = await readFile("dist/database/scenes.json");
        sceneFile = JSON.parse(sceneFile);
    } else {
        sceneFile = {};
    }
    exists = true;
    var sceneID = createUuid().substring(0, 8);
    while (exists) {
        if (sceneFile[sceneID] === undefined) {
            exists = false;
            sceneFile[sceneID] = { project: projectID };
            await writeFile(
                "dist/database/scenes.json",
                JSON.stringify(sceneFile)
            );
        } else {
            sceneID = createUuid().substring(0, 8);
        }
    }
    // 创建scene数据
    var sceneData = await readFile("dist/standard/scenes.json");
    sceneData = JSON.parse(sceneData);
    sceneData["scenes"][0]["id"] = sceneID;
    sceneData["scenes"][0]["projectId"] = projectID;
    sceneData["scenes"][0]["created"] = createdTime;
    sceneData["scenes"][0]["modified"] = createdTime;
    await writeFile(
        "dist/projects/" + projectID + "/scenes.json",
        JSON.stringify(sceneData)
    );
    // 创建table数据
    var tableData = await readFile("dist/standard/tableTest.json");
    await writeFile(
        "dist/projects/" + projectID + "/tableTest.json",
        tableData
    );
    
    return ctx.send(
        dataFile[global.mockUserName]["projects"][
            dataFile[global.mockUserName]["projects"].length - 1
        ]
    );
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

exports.jiawu = async (ctx, next) => {
    // 把settings json文件发过去
    var data;
    try {
        data = await readFile("dist/12345/甲午.json");
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

exports.getProject = async (ctx, next) => {
    var data = ctx.request.body;
    // console.log("getProject: " + data);
    var projectID = data.projectID;
    var exists = await existsFile(
        "dist/projects/" + projectID + "/project.json"
    );
    if (exists) {
        var fileData = await readFile(
            "dist/projects/" + projectID + "/project.json"
        );
        return ctx.send(JSON.parse(fileData));
    } else {
        return ctx.sendError("0002", projectID + "/project.json文件无法找到！");
    }
};

exports.getAssets = async (ctx, next) => {
    var data = ctx.request.body;
    var projectID = data.projectID;
    var exists = await existsFile(
        "dist/projects/" + projectID + "/assets.json"
    );
    if (exists) {
        var fileData = await readFile(
            "dist/projects/" + projectID + "/assets.json"
        );
        return ctx.send(JSON.parse(fileData));
    } else {
        return ctx.sendError("0002", projectID + "/assets.json文件无法找到！");
    }
};

exports.getScenes = async (ctx, next) => {
    var data = ctx.request.body;
    var projectID = data.projectID;
    var exists = await existsFile(
        "dist/projects/" + projectID + "/scenes.json"
    );
    if (exists) {
        var fileData = await readFile(
            "dist/projects/" + projectID + "/scenes.json"
        );
        return ctx.send(JSON.parse(fileData));
    } else {
        return ctx.sendError("0002", projectID + "/scenes.json文件无法找到！");
    }
};
