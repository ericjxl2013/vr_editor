import { Canvas } from '../../ui';
import { VeryEngine } from '../../engine';

export class Viewport {

  public canvas: Canvas;

  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  private _canvas: HTMLCanvasElement;


  public constructor() {

    let self = this;

    this.canvas = new Canvas('canvas-3d');
    VeryEngine.viewCanvas = this.canvas;

    this._canvas = <HTMLCanvasElement>this.canvas.element;
    // add canvas
    editor.call('layout.viewport').prepend(this.canvas);

    // get canvas
    editor.method('viewport:canvas', function () {
      return self.canvas;
    });

    // update viewpot 视窗大小
    setInterval(function () {
      let rect = VeryEngine.viewPanel.element!.getBoundingClientRect();
      self.canvas.resize(Math.floor(rect.width), Math.floor(rect.height));
    }, 1000 / 60);

    this._engine = new BABYLON.Engine(this._canvas, true);
    let engine = this._engine;
    window.addEventListener("resize", function () {
      engine.resize();
    });
    this._scene = new BABYLON.Scene(this._engine);

    // TODO: 设定相机
    var camera = new BABYLON.ArcRotateCamera("MainCamera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), this._scene);
    camera.setPosition(new BABYLON.Vector3(20, 200, 400));
    camera.attachControl(this._canvas, true);
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.99;
    camera.lowerRadiusLimit = 150;

    // 加载过度动画开
    engine.displayLoadingUI();

    let inputMap: { [key: string]: boolean } = {};

    // TODO: 加载scene.babylon场景文件，当前为默认
    BABYLON.SceneLoader.Append("./scene/", "scene.babylon", this._scene, function (scene) {
      // do something with the scene
      // 加载过度动画关
      engine.hideLoadingUI();

      // Keyboard events
      var blue = scene.getMeshByName('blue')!;

      scene.actionManager = new BABYLON.ActionManager(scene);
      scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      }));
      scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      }));


      // // Game/Render loop
      scene.onBeforeRenderObservable.add(() => {

        if (inputMap["w"] || inputMap["ArrowUp"]) {
          blue.position.z -= 100 * engine.getDeltaTime() / 1000;
        }
        if (inputMap["a"] || inputMap["ArrowLeft"]) {
          blue.position.x += 100 * engine.getDeltaTime() / 1000;
        }
        if (inputMap["s"] || inputMap["ArrowDown"]) {
          blue.position.z += 100 * engine.getDeltaTime() / 1000;
        }
        if (inputMap["d"] || inputMap["ArrowRight"]) {
          blue.position.x -= 100 * engine.getDeltaTime() / 1000;
        }
      })

      // // sphere
      var sphere = scene.getMeshByName('sphere')!;
      sphere.actionManager = new BABYLON.ActionManager(scene);

      sphere.actionManager.registerAction(new BABYLON.SetValueAction(
        { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: blue },
        sphere, "scaling", new BABYLON.Vector3(2, 2, 2)));

      sphere.actionManager.registerAction(new BABYLON.SetValueAction(
        { trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: blue }
        , sphere, "scaling", new BABYLON.Vector3(1, 1, 1)));

    });

    this._engine.runRenderLoop(() => {
      if (this._canvas.width !== this._canvas.clientWidth) {
        this._engine.resize();
      }

      if (this._scene) {
        this._scene.render();
      }

      // if (this._showFps) {
      // 	this.updateFpsPos();
      // }


    });
    // return this;

  }




}