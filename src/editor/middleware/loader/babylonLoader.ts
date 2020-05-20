import { Tools } from "../../../editor/utility";

export class BabylonLoader {


    constructor() {

    }

    public static load(rootUrl: string, sceneFilename: string | File = "", scene: BABYLON.Scene): any {

        const fileInfo = this._getFileInfo(rootUrl, sceneFilename);
        if (!fileInfo) {
            return null;
        }


        
    }




    private static _getFileInfo(rootUrl: string, sceneFilename: string | File): Nullable<IFileInformation> {
        let url: string;
        let name: string;
        let file: Nullable<File> = null;

        if (!sceneFilename) {
            url = rootUrl;
            name = Tools.GetFilename(rootUrl);
            rootUrl = Tools.GetFolderPath(rootUrl);
        }
        else if ((sceneFilename as File).name) {
            const sceneFile = sceneFilename as File;
            url = rootUrl + sceneFile.name;
            name = sceneFile.name;
            file = sceneFile;
        }
        else {
            const filename = sceneFilename as string;
            if (filename.substr(0, 1) === "/") {
                Tools.Error("Wrong sceneFilename parameter");
                return null;
            }

            url = rootUrl + filename;
            name = filename;
        }

        return {
            url: url,
            rootUrl: rootUrl,
            name: name,
            file: file
        };
    }


}


interface IFileInformation {
    /**
     * Gets the file url
     */
    url: string;
    /**
     * Gets the root url
     */
    rootUrl: string;
    /**
     * Gets filename
     */
    name: string;
    /**
     * Gets the file
     */
    file: Nullable<File>;
}