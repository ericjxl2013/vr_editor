import { Config } from "../global";

export class AssetsCreateTable {


    public constructor() {
        editor.method('assets:create:table', function (args: any) {
            // if (!editor.call('permissions:write'))
            //     return;
            args = args || {};

            var asset = {
                name: '新表格.table',
                type: 'text',
                source: false,
                preload: true,
                parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
                filename: '新表格.json',
                file: new Blob(['{ }'], { type: 'application/json' }),
                scope: {
                    type: 'project',
                    id: Config.projectID
                }
            };

            editor.call('assets:create', asset);
        });

        editor.method("assets:open-table", (table_name: string) => {
            console.log(table_name);
            window.open(window.location.protocol + "//" + window.location.host + "/table?name=" + table_name);
        });

    }

}