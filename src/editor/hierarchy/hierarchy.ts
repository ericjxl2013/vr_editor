import { Panel } from '../../ui';
import { VeryEngine } from '../../engine';

export class Hierarchy {

  public controls: Panel;

  public constructor() {
    this.controls = new Panel();
    this.controls.class!.add('hierarchy-controls');
    this.controls.parent = VeryEngine.hierarchyPanel;
    VeryEngine.hierarchyPanel.headerAppend(this.controls);
    console.log('hierarchy-controls');
  }

  public init(): void {
    // left control

    


  }





}