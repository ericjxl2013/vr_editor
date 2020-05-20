export class AssetsCreateFolder {

    public constructor() {

        editor.method('assets:create:folder', function (args: any) {
            if (!editor.call('permissions:write'))
                return;

            args = args || {};

            var asset = {
                name: 'New Folder',
                type: 'folder',
                source: true,
                preload: false,
                data: null,
                parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
                scope: {
                    type: 'project',
                    id: 'config.project.id'
                }
            };

            editor.call('assets:create', asset);
        });
    }

}