import { Viewport } from "../editor";
import { Canvas, Panel, Tree, Grid, TopElementContainer, TopElementPanel } from "../ui";
import { Database } from "../editor/middleware/offline/database";

export class VeryEngine {
    public static root: TopElementContainer;
    public static toolbar: TopElementContainer;
    public static viewportPanel: TopElementContainer;
    public static statusBar: TopElementContainer;
    public static hierarchy: TopElementPanel;
    public static assets: TopElementPanel;
    public static attributes: TopElementPanel;
    



    // public static viewPanel: Panel;
    // public static rootPanel: Panel;
    public static toolbarPanel: Panel;

    public static hierarchyPanel: Panel;
    public static hierarchyTree: Tree;

    // public static assetPanel: Panel;
    public static attributesPanel: Panel;

    public static viewport: Viewport;

    public static viewCanvas: Canvas;
    public static viewEngine: BABYLON.Engine;
    public static viewScene: BABYLON.Scene;

    // assets
    public static assetsGrid: Grid;


    // TODO
    public static database: Database;


    // public static 

    public constructor() {

    }


}


// export veryconfig