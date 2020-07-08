import { AttributesPanel, AttributesEntity, AttributesReference, AttributesKeeper } from "./attributes";
import { ToolbarKeeper } from "./toolbar";
import { ViewportKeeper } from "./viewport/keeper";


export class InitializeAfter {


  public constructor() {

    // attributes
    let attributes = new AttributesKeeper();

    // toolbar
    let toolbar = new ToolbarKeeper();

    // viewport
    new ViewportKeeper();

  }


}