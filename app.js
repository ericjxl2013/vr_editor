const Koa = require("koa");
const app = new Koa();
const openServer = require("./server/openServer");
const send = require("koa-send");
const bodyParser = require("koa-bodyparser");
const router = require("./router/index.js");
const sendHandle = require("./middlewares/sendHandle");
const compress = require("koa-compress");
const formidable = require("formidable");

const fs = require("fs");

const options = { threshold: 2048 };

app.use(compress(options));

app.use(bodyParser());
app.use(sendHandle()); // 发送数据控制中间件

global.mockUserName = "ZhangSan";
global.mockUserID = "user123abc";
global.projectID = "user123abc";

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

// 路由前处理，静态服务器功能
app.use(async (ctx, next) => {
    // console.log(ctx.path);
    // if ("/editor/project/12345" === ctx.path) {
    //   return send(ctx, "./dist/editor/index.html");
    // } else

    // 解析地址
    if (ctx.path.endsWith("/overview")) {
        // index.html
        return send(ctx, "./dist/overview/index.html");
    } else if (ctx.path.startsWith("/editor")) {
        // 静态资源
        if (ctx.path.indexOf(".") > -1) {
            // 其他静态资源
            await send(ctx, "/dist" + ctx.path);
        } else {
            // 权限和资源判断
            var projectID = ctx.path.substring(8);
            global.projectID = projectID;
            var exists = await existsFile("dist/database/projects.json");
            if (exists) {
                var dataFile = await readFile("dist/database/projects.json");
                dataFile = JSON.parse(dataFile);
                if (dataFile[projectID] !== undefined) {
                    // index.html
                    return send(ctx, "./dist/editor/index.html");
                }
            }
            // 404.html
            return send(ctx, "./dist/editor/404.html");
        }
    } else if (ctx.path.startsWith("/api")) {
        // 动态请求，交由路由处理
        console.log("动态请求：" + ctx.path);
        await next();
    } else if (ctx.path.startsWith("/table")) {
        // 404.html
        return send(ctx, "./dist/editor/table.html");
    } else if (ctx.path.startsWith("/publish")) {
        // 静态资源
        if (ctx.path.indexOf(".") > -1) {
            // 其他静态资源
            await send(ctx, "/dist" + ctx.path);
        } else {
            // 权限和资源判断
            var projectID = ctx.path.substring(9);
            global.projectID = projectID;
            var exists = await existsFile("dist/database/projects.json");
            if (exists) {
                var dataFile = await readFile("dist/database/projects.json");
                dataFile = JSON.parse(dataFile);
                if (dataFile[projectID] !== undefined) {
                    // index.html
                    return send(ctx, "./dist/publish/index.html");
                }
            }
            // 404.html
            return send(ctx, "./dist/editor/404.html");
        }
    } else {
        await send(ctx, "/dist" + ctx.path);
    }

    // if (ctx.path.startsWith("/data")) {
    //   // 此种情况交由路由处理
    //   await next();
    // } else if (ctx.path.startsWith("/api")) {
    //   // 访问项目文件
    //   // 首先下载配置文件
    //   //
    // } else {
    //   // server多添加了一个dist文件夹，index.html里面是没包含这个文件夹的，这里自动添加处理一下
    //   // console.log('/dist' + ctx.path);
    //   // 直接发送原始数据
    //   await send(ctx, "/dist" + ctx.path);
    // }
});

// 路由请求
app.use(router.routes());

// 存储表格数据，先暂时存到txt

var server = app.listen(1024);
console.log("\x1B[32m", "listening on port 1024");
console.log("\x1B[37m", "******服务器已启动******");
// openServer("http://localhost:1024/editor/project/12345"); // 运行时自动打开游览器
openServer("http://localhost:1024/overview"); // 运行时自动打开游览器

// Websocket
// 导入WebSocket模块:
// const WebSocket = require("ws");
// // 引用Server类:
// const WebSocketServer = WebSocket.Server;

// // 实例化:
// const wss = new WebSocketServer({
//   server: server
// });

// wss.on("connection", function(ws) {
//   console.log("\x1B[37m", `[SERVER] connection()`);
//   ws.on("message", function(message) {
//     // 接收arrayBuffer
//     console.log(`[SERVER] Received: ${message}`);
//     console.log(`[SERVER] Json: ${JSON.parse(message)}`);
//     ws.send(`ECHO: ${message}`, err => {
//       if (err) {
//         console.log(`[SERVER] error: ${err}`);
//       }
//     });
//   });

//   ws.on("close", msg => {
//     console.log("close: " + msg);
//   });
// });
