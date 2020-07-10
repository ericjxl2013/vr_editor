import { AttributesPanel, AttributesEntity, AttributesReference, AttributesKeeper } from "./attributes";
import { ToolbarKeeper } from "./toolbar";
import { ViewportKeeper } from "./viewport/keeper";
import { EntityKeeper } from "./entity";


export class InitializeAfter {


  public constructor() {

    // entity
    let entity = new EntityKeeper();

    // attributes
    let attributes = new AttributesKeeper();

    // toolbar
    let toolbar = new ToolbarKeeper();

    // viewport
    new ViewportKeeper();

  }


}