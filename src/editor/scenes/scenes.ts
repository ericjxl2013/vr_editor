import { Config } from "../global";

export class Scenes {

    public constructor() {


        editor.method('make:scene:dirty', () => {
            if (!document.title.startsWith('*')) {
                document.title = '*' + document.title;
            }
            Config.isSceneDirty = true;
        });

        editor.method('make:scene:clear', () => {
            Config.isSceneDirty = false;
            if (document.title.startsWith('*')) {
                document.title = document.title.substring(1);
            }
        });






        // Create a scene and pass result to callback
        // editor.method('scenes:new', function (name: string, callback: Function) {
        //     var data = {
        //         projectId: config.project.id,
        //         branchId: config.self.branch.id
        //     };

        //     if (name) data.name = name;

        //     Ajax({
        //         url: '{{url.api}}/scenes',
        //         auth: true,
        //         method: 'POST',
        //         data: data
        //     })
        //         .on('load', function (status: boolean, data: any) {
        //             if (callback)
        //                 callback(data);
        //         });
        // });


    }


}