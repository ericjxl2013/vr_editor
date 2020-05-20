import { AttributesPanel, AttributesEntity, AttributesReference, AttributesKeeper } from "./attributes";
import { ToolbarKeeper } from "./toolbar";


export class InitializeAfter {


  public constructor() {

    // attributes
    let attributes = new AttributesKeeper();

    // toolbar
    let toolbar = new ToolbarKeeper();

  }


}