import { Observer } from "../../lib";

export class AssetsRename {

    public constructor() {

        var changeName = function (assetId: string, assetName: string) {
            var form = new FormData();
            form.append('name', assetName);
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