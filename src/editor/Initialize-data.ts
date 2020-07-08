import { Config } from "./global";

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
                if (data.code === "0000") {
                    console.log(data.data);
                    Config.projectName = data.data.project.name;
                    Config.userID = data.data.owner.id;
                    Config.username = data.data.owner.username;
                    document.title = Config.projectName + " | 万维引擎";
                    editor.call("toolbar.project.set", Config.projectName);


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
                if (data.code === "0000") {
                    console.log(data.data);
                    Config.assetsData = data.data;
                    editor.call("initAssets", Config.assetsData);

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

        // scenes data
        axios.post('/api/getScenes', { projectID: Config.projectID })
            .then(response => {
                var data = response.data;
                if (data.code === "0000") {
                    console.log(data.data);
                    Config.scenesData = data.data.scenes;
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
    }

}