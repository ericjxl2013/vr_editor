const router = require('koa-router')();
const table = require('../controller/tableManager.js');
// const send = require('koa-send');

// router.get('/js/', async ctx => {
// 	console.log('./public' + ctx.path);
// 	return send(ctx, './public' + ctx.path);
// });

router.get('/data/table/acquire', table.acquire);
router.post('/data/table/commit', table.commit);

// router.get('/', async ctx => {
// 	return send(ctx, './public/index.html');
// });

module.exports = router;
