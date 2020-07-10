(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
///// <reference path="./dts/babylon.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
// import { VE_Objects, VE_Manager } from "../veryengine/veryEngine";
// import { BabylonEngine, Time } from "../veryengine/babylon";
var Game = /** @class */ (function () {
    // private _camera!: BABYLON.FreeCamera;
    function Game(canvasElement, fps) {
        this._showFps = true;
        this._canvas = canvasElement;
        VR.BabylonEngine.Canvas = this._canvas;
        this._fps = fps;
        // this._engine = new BABYLON.Engine(this._canvas, true);
        this._table = document.getElementById("VeryTable");
    }
    /**
     * 创建场景，并且启动
     */
    Game.prototype.createScene = function (path1, path2, datas) {
        // TODO：场景管理
        var _this = this;
        // 1、模型可能是glTF或者babylonjs；
        // 2、scene数据需要考虑
        // Project:
        //	project-settings;
        //	scenes:
        //		Scene1:
        //			GameObjects
        // 测试中
        // 
        // 假设有运行中的engine，先停止，重新初始化
        if (this._engine) {
            // TODO: 对象中相关数据dispose
            VR.VE_Manager.dispose();
            // console.log(VE_Manager.projects.projects);
            this._engine.dispose();
        }
        this._engine = new BABYLON.Engine(this._canvas, true);
        VR.BabylonEngine.Engine = this._engine;
        // Resize
        var engine = this._engine;
        window.addEventListener("resize", function () {
            engine.resize();
        });
        this._scene = new BABYLON.Scene(this._engine);
        VR.BabylonEngine.Scene = this._scene;
        VR.Time.start();
        // TODO: 设定相机
        var camera = new BABYLON.ArcRotateCamera("MainCamera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), this._scene);
        camera.setPosition(new BABYLON.Vector3(20, 200, 400));
        camera.attachControl(this._canvas, true);
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.99;
        camera.lowerRadiusLimit = 150;
        // let inputMap: { [key: string]: boolean } = {};
        // TODO: 加载过度动画开
        engine.hideLoadingUI();
        // engine.displayLoadingUI();
        // TODO: 加载scene.babylon场景文件，当前为默认
        BABYLON.SceneLoader.Append(path1, path2, this._scene, function (scene) {
            // do something with the scene
            // 加载过度动画关
            // engine.hideLoadingUI();
            // Keyboard events
            // var blue = scene.getMeshByName('blue')!;
            // scene.actionManager = new BABYLON.ActionManager(scene);
            // scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            // 	inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            // }));
            // scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            // 	inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            // }));
            // // Game/Render loop
            // scene.onBeforeRenderObservable.add(() => {
            // 	if (inputMap["w"] || inputMap["ArrowUp"]) {
            // 		blue.position.z -= 100 * engine.getDeltaTime() / 1000;
            // 	}
            // 	if (inputMap["a"] || inputMap["ArrowLeft"]) {
            // 		blue.position.x += 100 * engine.getDeltaTime() / 1000;
            // 	}
            // 	if (inputMap["s"] || inputMap["ArrowDown"]) {
            // 		blue.position.z += 100 * engine.getDeltaTime() / 1000;
            // 	}
            // 	if (inputMap["d"] || inputMap["ArrowRight"]) {
            // 		blue.position.x -= 100 * engine.getDeltaTime() / 1000;
            // 	}
            // })
            // // sphere
            // var sphere = scene.getMeshByName('sphere')!;
            // sphere.actionManager = new BABYLON.ActionManager(scene);
            // sphere.actionManager.registerAction(new BABYLON.SetValueAction(
            // 	{ trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: blue },
            // 	sphere, "scaling", new BABYLON.Vector3(2, 2, 2)));
            // sphere.actionManager.registerAction(new BABYLON.SetValueAction(
            // 	{ trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: blue }
            // 	, sphere, "scaling", new BABYLON.Vector3(1, 1, 1)));
            //     let p1 = scene.getMeshByName('Object023');
            //     scene.getMeshByName('Object022')!.setParent(p1);
            //     scene.getMeshByName('Object035')!.setParent(p1);
            //     let p2 = scene.getMeshByName('Object042');
            //     scene.getMeshByName('Object040')!.setParent(p2);
            //     scene.getMeshByName('Object043')!.setParent(p2);
            //     let p3 = scene.getMeshByName('Object047');
            //     scene.getMeshByName('Object044')!.setParent(p3);
            //     scene.getMeshByName('Object045')!.setParent(p3);
            //     let p4 = scene.getMeshByName('Object051');
            //     scene.getMeshByName('Object048')!.setParent(p4);
            //     scene.getMeshByName('Object049')!.setParent(p4);
            //     p1!.name = "叶片1";
            //     p2!.name = "叶片2";
            //     p3!.name = "叶片3";
            //     p4!.name = "叶片4";
            // TODO: 表格加载测试，应在所有模型加载完以后再初始化引擎
            // console.log(hot1.getData());
            var entrance = new VR.VeryEngine();
            var projectName = "测试项目";
            console.log(datas);
            // console.log(`空行数：${hot1.countEmptyRows()}`);
            try {
                entrance.init(datas, projectName);
            }
            catch (e) { // TODO: 可能会影响效率
                console.error(e);
            }
            var objects = VR.VE_Manager.objects(projectName);
            // 全局渲染帧循环
            scene.onBeforeRenderObservable.add(function () {
                // 添加帧函数
                // VR.Time._sum();
                // 触发响应循环
                for (var i = 0; i < objects.count; i++) {
                    var objectID = objects.getObjectID(i);
                    objects.getVeryObject(objectID).update();
                }
            });
            scene.onKeyboardObservable.add(function (kbInfo) {
                if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                    console.log(kbInfo.event.key);
                }
            });
        }, null, function (scene, message, exception) {
            console.error(message);
            console.error(exception);
        });
        this._engine.runRenderLoop(function () {
            // if (this._canvas.width !== this._canvas.clientWidth) {
            //     this._engine.resize();
            // }
            if (_this._scene) {
                if (_this._scene.activeCamera) {
                    _this._scene.render();
                }
            }
            // if (this._showFps) {
            // 	this.updateFpsPos();
            // }
        });
        // return this;
        // this.expandControl();
        // const lightPos = new BABYLON.Vector3(0, 1, 0);
        // new BABYLON.HemisphericLight('hemlight', lightPos, this._scene);
        // const sphereOpts = { segments: 16, diameter: 1 };
        // let sphere = BABYLON.MeshBuilder.CreateSphere(
        // 	'mainsphere',
        // 	sphereOpts,
        // 	this._scene
        // );
        // sphere.position.y = 1;
        // const groundOpts = { width: 6, height: 6, subdivisions: 2 };
        // BABYLON.MeshBuilder.CreateGround('mainground', groundOpts, this._scene);
        return this;
    };
    /**
     * 启动渲染循环；
     */
    Game.prototype.animate = function () {
        var _this = this;
        this._engine.runRenderLoop(function () {
            // if (this._canvas.width !== this._canvas.clientWidth) {
            //     this._engine.resize();
            // }
            if (_this._scene) {
                _this._scene.render();
            }
            if (_this._showFps) {
                _this.updateFpsPos();
            }
        });
        return this;
    };
    /**
     * 属性编辑器UI界面控制；
     */
    Game.prototype.toggleDebug = function () {
        if (this._engine) {
            // Always showing the debug layer, because you can close it by itself
            var scene = this._engine.scenes[0];
            if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
            }
            else {
                // 此处修改了babylon.d.ts文件
                scene.debugLayer.show({ embedMode: true });
            }
        }
        return this;
    };
    /**
     * 更新fps显示及显示位置
     */
    Game.prototype.updateFpsPos = function () {
        if (this._fps) {
            // this._fps.style.right = document.body.clientWidth - (this._table.clientWidth + this._canvas.clientWidth) + "px";
            this._fps.innerHTML = this._engine.getFps().toFixed() + " fps";
        }
    };
    return Game;
}());
exports.Game = Game;
},{}],2:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./game"), exports);
__exportStar(require("./scenes"), exports);
},{"./game":1,"./scenes":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scenes = void 0;
var Scenes = /** @class */ (function () {
    function Scenes() {
        // connect to server
        // load project data
        // analysis data
        // load original model
        // load scene object from original model
    }
    return Scenes;
}());
exports.Scenes = Scenes;
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var game_1 = require("./game");
var game;
var initFlag = false;
var dataLoaded = false;
var dataLoaded2 = false;
var path1 = "";
var path2 = "";
var datas;
/**
 * 初始化入口；
 */
function initGame() {
    var canvas = document.getElementById("renderCanvas");
    var fpsLabel = document.getElementById("fpsLabel");
    if (canvas !== null && fpsLabel !== null) {
        game = new game_1.Game(canvas, fpsLabel);
        game.createScene(path1, path2, datas).animate(); // 链式调用
    }
}
function runBtn() {
    if (game) {
        game.createScene(path1, path2, datas).animate();
    }
}
function toggleDebug() {
    if (game) {
        game.toggleDebug();
    }
}
function init() {
    // 等待表格数据加载完成
    if (dataLoaded && dataLoaded2) {
        initGame();
    }
    else {
        setTimeout(init, 500);
    }
}
function loadScene() {
    var projectID = window.location.pathname.substring(9);
    var sceneData;
    axios.post('/api/getScenes', { projectID: projectID })
        .then(function (response) {
        var data = response.data;
        if (data.code === "0000") {
            var lastScene = data.data.last;
            sceneData = data.data.scenes[lastScene];
            console.log(sceneData);
            document.title = sceneData.name + " | 发布项目";
            path1 = sceneData.path1;
            path2 = sceneData.path2;
            console.log("path1: " + sceneData.path1);
            console.log("path2: " + sceneData.path2);
            dataLoaded2 = true;
        }
        else {
            console.error(data.message);
        }
        // ep.emit('settings', response.data);
    })
        .catch(function (error) {
        console.error(error);
    });
}
loadScene();
function loadData() {
    // 获取表格数据
    var path = window.location.href;
    var paramsData = {};
    paramsData["name"] = "新表格.table";
    axios
        .get("/api/table/acquire", {
        params: paramsData,
    })
        .then(function (response) {
        var data = response.data;
        // console.log(data);
        if (data.code === "0000") {
            // 先将json转化为字符串
            var tempData = JSON.stringify(data.data);
            // 对字符串再进行反转义
            tempData = escape2Html(tempData);
            // 转化为json后，赋值给表格
            // hot1.loadData(JSON.parse(tempData).table);
            // console.log(JSON.parse(tempData).table);
            datas = JSON.parse(tempData).table;
            dataLoaded = true;
        }
        else {
            // Do nothing
            console.log("load not right: " + data.message);
        }
    })
        .catch(function (error) {
        console.log("load error: " + error);
    });
}
loadData();
//HTML标签转义（< -> &lt;）
function html2Escape(sHtml) {
    var temp = document.createElement("div");
    temp.textContent != null
        ? (temp.textContent = sHtml)
        : (temp.innerText = sHtml);
    var output = temp.innerHTML;
    temp = null;
    return output;
}
//HTML标签反转义（&lt; -> <）
function escape2Html(str) {
    var temp = document.createElement("div");
    temp.innerHTML = str;
    var output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}
// 关联按钮
// document.getElementById("runButton")!.addEventListener("click", runBtn);
// // 关联按钮
// document.getElementById("debugButton")!.addEventListener("click", toggleDebug);
// 启动引擎
// 第一次启动时，先异步加载数据后再初始化，后期可以直接点击按钮进行加载；
init();
// loadData2()
//   .then(function (hot: HandTable) {
//     console.log(hot.getData());
//   }
//   );
},{"./game":2}]},{},[4])

//# sourceMappingURL=publish.js.map
