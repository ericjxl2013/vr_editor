import { AssetsPanel } from "./assets-panel";
import { AssetsPanelControl } from "./assets-panel-control";
import { AssetsFilter } from "./assets-filter";
import { AssetsUpload } from "./assets-upload";
import { AssetsStore } from "./assets-store";
import { AssetsContextMenu } from "./assets-context-menu";
import { TestAssets } from "./test";
import { Assets } from "./assets";

export class  AssetsKeeper {


    constructor() {
        let assets = new Assets();

        
        let assetPanel = new AssetsPanel();
        let panelControl = new AssetsPanelControl();
        let filter = new AssetsFilter();

        let contextMenu = new AssetsContextMenu();

        let upload = new AssetsUpload();

        let library = new AssetsStore();



        let test = new TestAssets();

        
        
    }


}