const Koa = require("koa");
const app = new Koa();
const openServer = require("./server/openServer");
const send = require("koa-send");
const bodyParser = require("koa-bodyparser");
const router = require("./router/index.js");
const sendHandle = require("./middlewares/sendHandle");
const compress = require("koa-compress");

const options = { threshold: 2048 };

app.use(compress(options));

app.use(bodyParser());
app.use(sendHandle()); // 发送数据控制中间件

// 路由前处理，静态服务器功能
app.use(async (ctx, next) => {
  // console.log(ctx.path);
  // if ("/editor/project/12345" === ctx.path) {
  //   return send(ctx, "./dist/editor/index.html");
  // } else

  // 解析地址
  if (ctx.path.startsWith("/editor/project")) {
    // 静态资源
    if (ctx.path.indexOf(".") > -1) {
      // 其他静态资源
      await send(ctx, "/dist" + ctx.path);
    } else {
      // index.html
      return send(ctx, "./dist/editor/project/index.html");
    }
  } else if(ctx.path.startsWith("/api")) {
    // 动态请求，交由路由处理
    // console.log('动态请求：' + ctx.path);
    await next();
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
openServer("http://localhost:1024/editor/project/12345"); // 运行时自动打开游览器

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
