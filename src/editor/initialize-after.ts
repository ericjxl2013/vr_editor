import { AttributesPanel, AttributesEntity, AttributesReference, AttributesKeeper } from "./attributes";
import { ToolbarKeeper } from "./toolbar";
import { ViewportKeeper } from "./viewport/keeper";
import { EntityKeeper } from "./entity";
import { ScenesKeeper } from "./scenes";


export class InitializeAfter {


  public constructor() {

    // entity
    let entity = new EntityKeeper();

    // scenes
    new ScenesKeeper();

    // attributes
    let attributes = new AttributesKeeper();

    // toolbar
    let toolbar = new ToolbarKeeper();

    // viewport
    new ViewportKeeper();

  }


}