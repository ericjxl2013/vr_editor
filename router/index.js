const router = require("koa-router")();
const table = require("../controller/tableManager.js");
const mock = require("../controller/mock-controller.js");
// const send = require('koa-send');

// router.get('/js/', async ctx => {
// 	console.log('./public' + ctx.path);
// 	return send(ctx, './public' + ctx.path);
// });

router.get("/data/table/acquire", table.acquire);
router.post("/data/table/commit", table.commit);

// 加载资源测试
router.get("/api/settings", mock.settings);
router.get("/api/assets", mock.assets);
router.get("/api/scenes", mock.scenes);
router.post("/api/getScene", mock.getScene);

router.get("/api/jiawu", mock.jiawu);

// router.get('/', async ctx => {
// 	return send(ctx, './public/index.html');
// });

module.exports = router;
