import { VeryEngine } from "../../engine";

export class ViewportApplication {




    public constructor() {


        editor.method("load:blue", (type: string, data: any) => {
            console.log(type);
            console.log(data);
            if (type === "Light") {
                // Lights
                var light = BABYLON.Light.Parse(data, VeryEngine.viewScene);
            } else if (type === 'Camera') {
                // Cameras
                var camera = BABYLON.Camera.Parse(data, VeryEngine.viewScene);
                // VeryEngine.viewScene.activeCamera = camera;
                console.log(camera);
            }


        });

    }



}