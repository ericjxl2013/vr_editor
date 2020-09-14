export class Config{

    public static projectID: string = 'projectID';
    public static projectName: string;
    public static scenesData: any;
    public static sceneIndex: number = 0;
    public static sceneID: string = 'sceneID';
    public static sceneName: string;
    public static lastScene: string;
    public static userID: string;
    public static username: string;

    public static assetsData: any;

    public static isSceneDirty: boolean = false;

    // TODO: 暂时只允许加载一个表格
    public static tableAssetsID: string = '';


    public constructor () {

    }

}