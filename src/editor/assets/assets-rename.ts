import { Observer } from '../../lib';
import { AjaxRequest, Ajax } from '../utility';
import { Config } from '../global';

export class AssetsRename {

    public constructor() {

        var changeName = function (assetId: string, assetName: string) {
            var form = new FormData();
            form.append('rename', assetName);
            form.append('projectID', Config.projectID);
            (<AjaxRequest>new Ajax({
                url: '/api/upload/assets/' + assetId,
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
                        // TODO: 不够通用，如果是图片等资源，路径也改变
                        // console.log(data.data);
                        let asset = editor.call('assets:get', data.data.id);
                        // console.log(asset);
                        if(asset) {
                            asset.set('name', data.data.name);
                        }
                        // var asset = new Observer(data.data);
                        // editor.call('assets:add', asset);

                    }
                });
            // branch id
            // form.append('branchId', 'config.self.branch.id');
            // Ajax({
            //     url: '{{url.api}}/assets/' + assetId,
            //     auth: true,
            //     data: form,
            //     method: 'PUT',
            //     ignoreContentType: true,
            //     notJson: true
            // }).on('error', function (err: Error, data: any) {
            //     console.error(err + data);
            //     editor.call('status:error', 'Couldn\'t update the name: ' + data);
            // });
        }

        editor.method('assets:rename', function (asset: Observer, newName: string) {
            var oldName = asset.get('name');
            var id = asset.get('id');
            editor.call('history:add', {
                name: 'asset rename',
                undo: function () {
                    if (editor.call('assets:get', id)) {
                        changeName(id, oldName);
                    }
                },
                redo: function () {
                    if (editor.call('assets:get', id)) {
                        changeName(id, newName);
                    }
                }
            });

            changeName(id, newName);
        });


    }

}