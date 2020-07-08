import { Observer } from "../../lib";
import { VeryEngine } from "../../engine";

export class ViewportDropModel {


    public constructor() {


        editor.method("loadTempModel", (babylon_data: Observer) => {
            console.log("加载模型");
            console.log(babylon_data);
            var rootUrl = babylon_data.get("file.url");
            var modelName = babylon_data.get("file.filename");
            rootUrl = rootUrl.substring(0, rootUrl.length - modelName.length);

            BABYLON.SceneLoader.Append(rootUrl, modelName, VeryEngine.viewScene, function (scene) { 

                

            });
        });

    }

}