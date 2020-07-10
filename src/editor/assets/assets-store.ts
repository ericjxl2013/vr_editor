import { Button } from "../../ui";
import { VeryEngine } from "../../engine";

export class AssetsStore {

    public constructor() {

        var assetsPanel = VeryEngine.assets;

        var btnStore = new Button('资源库');
        btnStore.class!.add('store');
        assetsPanel.header.append(btnStore);

        btnStore.on('click', function () {
            window.open('http://www.veryengine.cn/', '_blank');
        });
    }
}