import { Canvas } from '../../ui';
import { VeryEngine } from '../../engine';
import { ToolbarTopControl, GizmosManager } from '../toolbar';
import { ViewportExpand } from './viewport-expand';

export class Viewport {

    public canvas!: Canvas;

    private _engine!: BABYLON.Engine;
    private _scene!: BABYLON.Scene;
    private _canvas!: HTMLCanvasElement;


    public constructor() {

        this.init();

        // console.log(VeryEngine.viewEngine._internalTexturesCache);
        // let tex = VeryEngine.viewEngine.createTexture('static/editor_logo.png', false, true, VeryEngine.viewScene);
        // console.log(VeryEngine.viewEngine._internalTexturesCache);

        let self = this;

        let engine = this._engine;


        // TODO: 设定相机
        this._scene.clearColor = new BABYLON.Color4(49 / 255, 77 / 255, 121 / 255, 1);

        var camera = new BABYLON.ArcRotateCamera('Default', 100, 50, 50, new BABYLON.Vector3(0, 0, 0), this._scene);
        camera.setPosition(new BABYLON.Vector3(0, 1, -20));
        camera.attachControl(this._canvas, true);
        // camera.lowerBetaLimit = 0.1;
        // camera.upperBetaLimit = (Math.PI / 2) * 0.99;
        // camera.lowerRadiusLimit = 150;

        // var light1 = new BABYLON.PointLight("omni", new BABYLON.Vector3(0, 50, 0), this._scene);


        // 加载过度动画开
        // engine.loadingScreen.hideLoadingUI();
        // engine.displayLoadingUI();

        // let inputMap: { [key: string]: boolean } = {};

        // TODO: 加载scene.babylon场景文件，当前为默认
        // 默认Editor场景，加载保存的某一个场景资源
        // 资源的父子关系以及模型
        /*
        BABYLON.SceneLoader.Append('./scene/', 'scene.babylon', this._scene, function (scene) {
          // do something with the scene
          // 加载过度动画关
          // engine.hideLoadingUI();
    
          // Keyboard events
          var blue = scene.getMeshByName('blue')!;
    
          scene.actionManager = new BABYLON.ActionManager(scene);
          scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == 'keydown';
          }));
          scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == 'keydown';
          }));
    
    
          // // Game/Render loop
          scene.onBeforeRenderObservable.add(() => {
    
            if (inputMap['w'] || inputMap['ArrowUp']) {
              blue.position.z -= 100 * engine.getDeltaTime() / 1000;
            }
            if (inputMap['a'] || inputMap['ArrowLeft']) {
              blue.position.x += 100 * engine.getDeltaTime() / 1000;
            }
            if (inputMap['s'] || inputMap['ArrowDown']) {
              blue.position.z += 100 * engine.getDeltaTime() / 1000;
            }
            if (inputMap['d'] || inputMap['ArrowRight']) {
              blue.position.x -= 100 * engine.getDeltaTime() / 1000;
            }
          })
    
          // sphere
          var sphere = scene.getMeshByName('sphere')!;
          sphere.actionManager = new BABYLON.ActionManager(scene);
    
          sphere.actionManager.registerAction(new BABYLON.SetValueAction(
            { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: blue },
            sphere, 'scaling', new BABYLON.Vector3(2, 2, 2)));
    
          sphere.actionManager.registerAction(new BABYLON.SetValueAction(
            { trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: blue }
            , sphere, 'scaling', new BABYLON.Vector3(1, 1, 1)));
    
          let i: number = 0;
    
          // WebSocket 测试
          // scene.onKeyboardObservable.add( kbInfo => {
          //   if(kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
          //     if(kbInfo.event.keyCode === 65) {
          //       // editor.call('send', '按下次数：' + (i++) + '!');
          //       editor.call('send', '{'data': {'a': 123, 'b': 'qwe'}}');
          //     }
          //   }
          // });
    
        });
        */


        this._engine.runRenderLoop(() => {
            if (this._canvas.width !== this._canvas.clientWidth) {
                this._engine.resize();
            }

            if (this._scene) {
                if (this._scene.activeCamera) {
                    this._scene.render();
                }
            }

            // if (this._showFps) {
            // 	this.updateFpsPos();
            // }


        });
        // return this;


        this.expandControl();
    }


    private init(): void {
        let self = this;

        this.canvas = new Canvas('canvas-viewport');
        VeryEngine.viewCanvas = this.canvas;

        this._canvas = <HTMLCanvasElement>this.canvas.element;
        VeryEngine.viewCanvasElement = this._canvas;
        // 去掉Babylon的蓝色边框
        this._canvas.style.outline = 'none';
        // add canvas
        editor.call('layout.viewport').prepend(this.canvas);

        // get canvas
        editor.method('viewport:canvas', function () {
            return self.canvas;
        });

        // update viewpot 视窗大小
        setInterval(function () {
            let rect = VeryEngine.viewportPanel.element!.getBoundingClientRect();
            self.canvas.resize(Math.floor(rect.width), Math.floor(rect.height));
        }, 100 / 6);

        // if(this._engine) this._engine.dispose();

        this._engine = new BABYLON.Engine(this._canvas, true);
        VeryEngine.viewEngine = this._engine;
        let engine = this._engine;

        window.addEventListener('resize', function () {
            engine.resize();
        });

        this._scene = new BABYLON.Scene(this._engine);
        VeryEngine.viewScene = this._scene;
        this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        GizmosManager.init(this._scene);
    }


    private expandControl(): void {
        let control: ToolbarTopControl = new ToolbarTopControl();
        let expandView: ViewportExpand = new ViewportExpand();
    }




}