import { Config } from './global';
import { BabylonLoader } from './middleware/loader/babylonLoader';

export class InitializeData {

    public constructor() {
        this.init();
    }

    private init(): void {
        // TODO
        Config.projectID = window.location.pathname.substring(8);
        // console.log(window.location.pathname);

        // project data
        axios.post('/api/getProject', { projectID: Config.projectID })
            .then(response => {
                var data = response.data;
                if (data.code === '0000') {
                    // console.log(data.data);
                    BabylonLoader.projectData = data.data;
                    Config.projectName = data.data.project.name;
                    Config.userID = data.data.owner.id;
                    Config.username = data.data.owner.username;
                    document.title = Config.projectName + ' - 万维引擎';
                    editor.call('toolbar.project.set', Config.projectName);


                } else {
                    console.error(data.message);
                }
                // ep.emit('settings', response.data);
            })
            .catch(
                error => {
                    console.error(error);
                }

            );

        // assets data
        axios.post('/api/getAssets', { projectID: Config.projectID })
            .then(response => {
                var data = response.data;
                if (data.code === '0000') {
                    // console.log(data.data);
                    BabylonLoader.assetsData = data.data;
                    Config.assetsData = data.data;
                    editor.call('initAssets', Config.assetsData);

                    // 加载完assets数据再加载scene数据，便于解析scene过程中使用assets数据
                    editor.call('getScenes');

                } else {
                    console.error(data.message);
                }
                // ep.emit('settings', response.data);
            })
            .catch(
                error => {
                    console.error(error);
                }

            );


        editor.method('getScenes', () => {
            // scenes data
            axios.post('/api/getScenes', { projectID: Config.projectID })
                .then(response => {
                    var data = response.data;
                    if (data.code === '0000') {
                        let lastScene: number = data.data.last;
                        Config.scenesData = data.data.scenes[lastScene];
                        Config.sceneIndex = lastScene;
                        // console.log(Config.scenesData);
                        BabylonLoader.scenesData = Config.scenesData;
                        BabylonLoader.sceneIndex = lastScene;
                        editor.emit('scene:raw', Config.scenesData);
                        editor.call('toolbar.scene.set', Config.scenesData.name);
                    } else {
                        console.error(data.message);
                    }
                    // ep.emit('settings', response.data);
                })
                .catch(
                    error => {
                        console.error(error);
                    }

                );
        });




    }

}