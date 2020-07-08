import { Config } from "../global";

export class AssetsCreateFolder {

    public constructor() {

        editor.method('assets:create:folder', function (args: any) {
            // if (!editor.call('permissions:write'))
            //     return;
            console.log('assets:create:folder');

            args = args || {};

            var asset = {
                name: '新建文件夹',
                type: 'folder',
                source: true,
                preload: false,
                data: null,
                parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
                scope: {
                    type: 'project',
                    id: Config.projectID
                }
            };

            console.log(asset);

            editor.call('assets:create', asset);
        });
    }

}