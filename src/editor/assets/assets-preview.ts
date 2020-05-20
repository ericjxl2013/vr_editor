import { Observer } from "../../lib";

export class AssetsPreview {


    constructor() {



        editor.method('preview:render', function (asset: Observer, width: number, height: number, canvas: HTMLCanvasElement, args: any) {
            width = width || 1;
            height = height || 1;

            // render
            editor.call('preview:' + asset.get('type') + ':render', asset, width, height, canvas, args);
        });
    }



}