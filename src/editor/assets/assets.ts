import { Panel, Progress } from "../../ui";
import { VeryEngine } from "../../engine";

export class Assets {

  


  public constructor() {

    let assetsOverlay: Panel = new Panel();
    assetsOverlay.class!.add('overlay');
    VeryEngine.assetPanel.append(assetsOverlay);

    let p: Progress = new Progress();
    p.on('progress:100', function () {
      assetsOverlay.hidden = true;
    });
    assetsOverlay.append(p);
    p.hidden = false;
    p.progress = 1;

    

  }




}