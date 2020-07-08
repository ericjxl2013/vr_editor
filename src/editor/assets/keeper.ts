import { AssetsPanel } from "./assets-panel";
import { AssetsPanelControl } from "./assets-panel-control";
import { AssetsFilter } from "./assets-filter";
import { AssetsUpload } from "./assets-upload";
import { AssetsStore } from "./assets-store";
import { AssetsContextMenu } from "./assets-context-menu";
import { TestAssets } from "./test";
import { Assets } from "./assets";
import { AssetsCreateFolder } from "./assets-create-folder";
import { AssetsSync } from "./assets-sync";
import { AssetsDrop } from "./assets-drop";
import { AssetsCreateTable } from "./assets-create-table";

export class  AssetsKeeper {


    constructor() {
        let assets = new Assets();

        let syncAssets = new AssetsSync();
        let assetPanel = new AssetsPanel();
        let panelControl = new AssetsPanelControl();
        let filter = new AssetsFilter();

        let createFolder = new AssetsCreateFolder();
        let contextMenu = new AssetsContextMenu();

        let createTable = new AssetsCreateTable();

        let upload = new AssetsUpload();

        let drop = new AssetsDrop();

        let library = new AssetsStore();



        // let test = new TestAssets();

        
        
    }


}