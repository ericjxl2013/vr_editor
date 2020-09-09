import { Observer } from "../../lib";

export class AssetsPreview {


    constructor() {



        editor.method('preview:render', function (asset: Observer, width: number, height: number, canvas: HTMLCanvasElement, args: any) {
            width = width || 1;
            height = height || 1;

            // render
            editor.call('preview:' + asset.get('type') + ':render', asset, width, height, canvas, args);
        });


        let matPreviewCanvas = document.createElement('canvas');
        matPreviewCanvas.width = 64;
        matPreviewCanvas.height = 64;
        matPreviewCanvas.style.display = 'none';
        document.body.append(matPreviewCanvas);

        // TODO: 需要按队列渲染，不然异步流程导致同时开的webgl context太多，会崩溃
        let engine = new BABYLON.Engine(matPreviewCanvas, true);
        let scene = new BABYLON.Scene(engine);

        // scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.Green());
        scene.clearColor.a = 0;

        var light = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(45, 45, 0), scene);

        var camera = new BABYLON.ArcRotateCamera('PreviewCamera', 10, 10, 10, new BABYLON.Vector3(0, 0, 0), scene);
        // camera.setPosition(new BABYLON.Vector3(20, 200, 400));

        camera.attachControl(matPreviewCanvas, true);
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.99;
        camera.lowerRadiusLimit = 150;

        let previewSphere = BABYLON.MeshBuilder.CreateSphere('__previewSphere', { diameter: 80 }, scene);

        let testMat = new BABYLON.StandardMaterial('__previewShere', scene);
        previewSphere.material = testMat;
        // engine.runRenderLoop(() => {
        //     if (scene) {
        //         scene.render();
        //     }
        // });
        

        // engine.dispose();

        let queueMaterialAssets: any[] = [];
        let matQueuing: boolean = false;

        let createMatPreview = () => {
            matQueuing = true;

            while(queueMaterialAssets.length > 0) {
                let queueElement = queueMaterialAssets.shift();
                // 球改一下
                // (<BABYLON.StandardMaterial>previewSphere.material).diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                scene.render();
                // TODO: 需要更新
                BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, 64, (data: string) => {
                    console.log(data);
                    queueElement[0].src = data;
                });
            }

            matQueuing = false;
        }

        editor.method('material:preview', (thumbnail: any, asset: Observer) => {
            queueMaterialAssets.push([thumbnail, asset]);
            if(!matQueuing) {
                // console.warn('入口打开material preview');
                setTimeout(createMatPreview, 0);
            } else {
                // console.warn('中间排队material preview');
            }
        });
    }



}