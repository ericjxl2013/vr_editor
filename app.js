const Koa = require("koa");
const app = new Koa();
const openServer = require("./server/openServer");
const send = require("koa-send");
const bodyParser = require("koa-bodyparser");
const router = require("./router/index.js");
const sendHandle = require("./middlewares/sendHandle");

app.use(bodyParser());
app.use(sendHandle()); // 发送数据控制中间件

// 路由前处理，静态服务器功能
app.use(async (ctx, next) => {
  // console.log(ctx.path);
  if ("/" === ctx.path) {
    return send(ctx, "./dist/index.html");
  } else if (ctx.path.startsWith("/data")) {
    // 此种情况交由路由处理
    await next();
  } else {
    // server多添加了一个dist文件夹，index.html里面是没包含这个文件夹的，这里自动添加处理一下
    // console.log('/dist' + ctx.path);
    await send(ctx, "/dist" + ctx.path);
  }
});

// 路由请求
app.use(router.routes());

// 存储表格数据，先暂时存到txt

app.listen(3000);
console.log("listening on port 3000");
openServer("http://localhost:3000"); // 运行时自动打开游览器
