import { Observer } from "../../lib";

export class AssetsFs {

    public constructor() {

        var getIds = function (assets: Observer[]) {
            if (!(assets instanceof Array))
                assets = [assets];

            var ids = [];
            for (var i = 0; i < assets.length; i++)
                ids.push(parseInt(assets[i].get('uniqueId'), 10));

            return ids;
        };

        editor.method('assets:fs:delete', function (assets: Observer[]) {
            editor.call('realtime:send', 'fs', {
                op: 'delete',
                ids: getIds(assets)
            });
        });

        editor.method('assets:fs:move', function (assets: Observer[], assetTo: Observer) {
            editor.call('realtime:send', 'fs', {
                op: 'move',
                ids: getIds(assets),
                to: assetTo ? parseInt(assetTo.get('uniqueId'), 10) : null
            });
        });

        editor.method('assets:fs:duplicate', function (assets: Observer[]) {
            editor.call('realtime:send', 'fs', {
                op: 'duplicate',
                ids: getIds(assets)
            });
        });
    }

}