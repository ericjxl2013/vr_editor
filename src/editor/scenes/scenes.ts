export class Scenes {

    public constructor() {


        // Create a scene and pass result to callback
        editor.method('scenes:new', function (name: string, callback: Function) {
            var data = {
                projectId: config.project.id,
                branchId: config.self.branch.id
            };

            if (name) data.name = name;

            Ajax({
                url: '{{url.api}}/scenes',
                auth: true,
                method: 'POST',
                data: data
            })
                .on('load', function (status: boolean, data: any) {
                    if (callback)
                        callback(data);
                });
        });


    }


}