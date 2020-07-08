import { ViewportApplication } from "./viewport-application";
import { ViewportInstanceCreate } from "./viewport-instance-create";
import { ViewportDropModel } from "./viewport-drop-model";

export class ViewportKeeper {

    public constructor() {
        new ViewportApplication();
        new ViewportInstanceCreate();
        new ViewportDropModel();
    }

}