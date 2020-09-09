const router = require("koa-router")();
const table = require("../controller/tableManager.js");
const mock = require("../controller/mock-controller.js");
const mockUpload = require("../controller/mock-upload.js");
const mockTable = require("../controller/mock-table");
// const send = require('koa-send');

// router.get('/js/', async ctx => {
// 	console.log('./public' + ctx.path);
// 	return send(ctx, './public' + ctx.path);
// });

router.get("/data/table/acquire", table.acquire);
router.post("/data/table/commit", table.commit);

// 加载资源测试
// router.get("/api/settings", mock.settings);
// router.get("/api/assets", mock.assets);
// router.get("/api/scenes", mock.scenes);
// router.post("/api/getScene", mock.getScene);
// router.get("/api/jiawu", mock.jiawu);

// mock数据进行测试
router.get("/api/projects", mock.projects);
router.post("/api/createProject", mock.createProject);

router.post("/api/getProject", mock.getProject);
router.post("/api/getAssets", mock.getAssets);
router.post("/api/getScenes", mock.getScenes);

// upload
router.post("/api/upload", mockUpload.upload);

// upload change
router.put("/api/upload/assets/:id", mockUpload.changeAssets)


router.post("/api/addScene", mockUpload.addScene);

// table
router.get("/api/table/acquire", mockTable.acquire);
router.post("/api/table/commit", mockTable.commit);

module.exports = router;
