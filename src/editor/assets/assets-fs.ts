import { Observer } from '../../lib';
import { Config } from '../global';
import { AjaxRequest, Ajax } from '../utility';

export class AssetsFs {

    public constructor() {

        var getIds = function (assets: Observer[]) {
            if (!(assets instanceof Array))
                assets = [assets];

            var ids = [];
            for (var i = 0; i < assets.length; i++)
                ids.push(assets[i].get('id'));

            return ids;
        };

        editor.method('assets:fs:delete', function (assets: Observer[]) {
            editor.call('realtime:send', 'fs', {
                op: 'delete',
                ids: getIds(assets)
            });
        });

        editor.method('assets:fs:move', function (assets: Observer[], assetTo: Observer) {
            console.warn('assets:fs:move');
            console.warn(assets);
            console.warn(assetTo);
            let ids = getIds(assets);
            let to = assetTo ? assetTo.get('id') : '';
            editor.call('realtime:send', 'fs', {
                op: 'move',
                ids: ids,
                to: to
            });

            var form = new FormData();
            form.append('move', ids.join(','));
            // form.append('from', ids);
            form.append('to', to);
            form.append('projectID', Config.projectID);
            (<AjaxRequest>new Ajax({
                url: '/api/upload/assets/' + ids[0],
                auth: true,
                data: form,
                method: 'PUT',
                ignoreContentType: true,
                notJson: true
            }))
                .on('load', (status: any, data: any) => {
                    // console.log('status: ' + status);
                    data = JSON.parse(data);
                    // console.log(data);
                    // console.log(data.code);
                    if (data.code === '0000') {
                        // TODO: 不够通用
                        console.log(data.data);
                        let keys = Object.keys(data.data);
                        for (let i = 0, len = keys.length; i < len; i++) {
                            let asset = editor.call('assets:get', keys[i]);
                            console.warn(asset);
                            if (asset) {
                                asset.set('path', data.data[keys[i]]);
                            }
                        }

                        // let asset = editor.call('assets:get', data.data.id);
                        // // console.log(asset);
                        // if (asset) {
                        //     asset.set('name', data.data.name);
                        // }
                        // var asset = new Observer(data.data);
                        // editor.call('assets:add', asset);
                    }
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