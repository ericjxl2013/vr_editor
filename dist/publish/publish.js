(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BabylonLoader = void 0;
// import { Tools, AjaxRequest, Ajax, GUID } from "../../../editor/utility";
var lib_1 = require("../lib");
// import { VeryEngine } from "../../../engine";
// import { Config } from "../../../editor/global";
var BabylonLoader = /** @class */ (function () {
    function BabylonLoader() {
    }
    BabylonLoader.loadFromBabylonAsset = function () {
    };
    BabylonLoader.loadBabylon = function (asset) {
        var assetID = asset.get('id');
        var dataBabylon = null;
        if (BabylonLoader.babylonCacheData[assetID]) {
            dataBabylon = BabylonLoader.babylonCacheData[assetID];
            BabylonLoader.parseBabylon(assetID, dataBabylon);
            BabylonLoader.assembleBabylon(assetID, dataBabylon);
        }
        else {
            var data1 = {
                url: BabylonLoader.prefix + asset.get('id') + '/' + asset.get('name'),
                method: 'GET',
                // auth: true,
                data: null,
                ignoreContentType: true,
            };
            // 直接返回babylon json格式内容数据
            new lib_1.Ajax(data1)
                .on('load', function (status, data) {
                dataBabylon = data;
                BabylonLoader.babylonCacheData[assetID] = dataBabylon;
                BabylonLoader.parseBabylon(assetID, dataBabylon);
                BabylonLoader.assembleBabylon(assetID, dataBabylon);
            }).on('error', function (evt) {
                console.error(evt);
            });
            ;
        }
    };
    BabylonLoader.assembleBabylon = function (assetID, dataBabylon) {
        var _a;
        if (dataBabylon !== null) {
            console.warn(dataBabylon);
            console.log(dataBabylon.meshes);
            console.log(dataBabylon.materials);
            console.log(dataBabylon.lights);
            // if (dataBabylon.lights) {
            //     dataBabylon.lights.forEach((element: any) => {
            //         BabylonLoader.loadLight(element, VeryEngine.viewScene);
            //     });
            // }
            // material assemble
            if (BabylonLoader.assetsData.babylon[assetID]) {
                var mats = BabylonLoader.assetsData.babylon[assetID]['materials'];
                var newMats = [];
                for (var key in mats) {
                    if (mats[key].asset_id && BabylonLoader.assetsData.assets[mats[key].asset_id]) {
                        var newMat = BabylonLoader.assetsData.assets[mats[key].asset_id].data;
                        // 检测texture
                        if (newMat.diffuseTexture && newMat.diffuseTexture.texture_id) {
                            newMat.diffuseTexture.name = BabylonLoader.prefix + newMat.diffuseTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.diffuseTexture.texture_id].name;
                            // console.warn(newMat.diffuseTexture.name);
                        }
                        if (newMat.specularTexture && newMat.specularTexture.texture_id) {
                            newMat.specularTexture.name = BabylonLoader.prefix + newMat.specularTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.specularTexture.texture_id].name;
                        }
                        if (newMat.reflectionTexture && newMat.reflectionTexture.texture_id) {
                            newMat.reflectionTexture.name = BabylonLoader.prefix + newMat.reflectionTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.reflectionTexture.texture_id].name;
                        }
                        if (newMat.refractionTexture && newMat.refractionTexture.texture_id) {
                            newMat.refractionTexture.name = BabylonLoader.prefix + newMat.refractionTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.refractionTexture.texture_id].name;
                        }
                        if (newMat.emissiveTexture && newMat.emissiveTexture.texture_id) {
                            newMat.emissiveTexture.name = BabylonLoader.prefix + newMat.emissiveTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.emissiveTexture.texture_id].name;
                        }
                        if (newMat.bumpTexture && newMat.bumpTexture.texture_id) {
                            newMat.bumpTexture.name = BabylonLoader.prefix + newMat.bumpTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.bumpTexture.texture_id].name;
                        }
                        if (newMat.opacityTexture && newMat.opacityTexture.texture_id) {
                            newMat.opacityTexture.name = BabylonLoader.prefix + newMat.opacityTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.opacityTexture.texture_id].name;
                        }
                        if (newMat.ambientTexture && newMat.ambientTexture.texture_id) {
                            newMat.ambientTexture.name = BabylonLoader.prefix + newMat.ambientTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.ambientTexture.texture_id].name;
                        }
                        if (newMat.lightmapTexture && newMat.lightmapTexture.texture_id) {
                            newMat.lightmapTexture.name = BabylonLoader.prefix + newMat.lightmapTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.lightmapTexture.texture_id].name;
                        }
                        newMats.push(newMat);
                    }
                }
                newMats.forEach(function (element) {
                    // console.error(element);
                    BabylonLoader.loadMaterial(element, VR.BabylonEngine.Scene, '');
                });
            }
            // geometries assemble
            if (dataBabylon.geometries && dataBabylon.geometries.vertexData) {
                dataBabylon.geometries.vertexData.array.forEach(function (parsedVertexData) {
                    BabylonLoader.loadGeometry(parsedVertexData, VR.BabylonEngine.Scene, '');
                });
            }
            // transformNode assemble
            var newTransformNodes_1 = [];
            if (dataBabylon.transformNodes) {
                dataBabylon.transformNodes.forEach(function (parsedTransformNode) {
                    var node = BabylonLoader.loadTransformNode(parsedTransformNode, VR.BabylonEngine.Scene, '');
                    newTransformNodes_1.push(node);
                });
            }
            // mesh assemble
            var newMeshes_1 = [];
            var parentMeshes = [];
            var tempMeshDic_1 = {};
            var tempMeshID_1 = {};
            if (dataBabylon.meshes) {
                dataBabylon.meshes.forEach(function (element) {
                    // 若当前scene数据中已包含mesh id，则重新创建resource_id
                    if (BabylonLoader.scenesData.entities[element.id]) {
                        var newID_1 = lib_1.GUID.create();
                        var oldID_1 = element.id;
                        // element['babylon_id'] = oldID;
                        tempMeshID_1[newID_1] = oldID_1;
                        element.id = newID_1;
                        // 遍历，更改parentID
                        dataBabylon.meshes.forEach(function (element2) {
                            if (element2.parentId === oldID_1) {
                                element2.parentId = newID_1;
                                console.log('change parent id');
                            }
                        });
                    }
                    else {
                        tempMeshID_1[element.id] = element.id;
                        // element['babylon_id'] = element.id;
                    }
                    // console.error(element);
                });
                dataBabylon.meshes.forEach(function (element) {
                    var tempMesh = BabylonLoader.loadMesh(element, VR.BabylonEngine.Scene, '');
                    newMeshes_1.push(tempMesh);
                    tempMeshDic_1[element.id] = tempMesh;
                });
            }
            // parent 
            // TODO: 若不为root，则mesh这里也要设定父子关系，parent为null则为当前选中物体
            var parent_1 = null;
            var parentNode = null;
            if (editor.call('selector:type') === 'entity')
                parent_1 = editor.call('selector:items')[0];
            if (!parent_1) {
                parent_1 = editor.call('entities:root');
            }
            else {
                // console.warn(parent);
                // console.warn(parent.node);
                if (parent_1.node) {
                    parentNode = parent_1.node;
                }
            }
            var entities = [];
            var data = [];
            // TODO: 还没有考虑有transformNode数据的情况
            for (var index = 0, cache = newTransformNodes_1.length; index < cache; index++) {
                var transformNode = newTransformNodes_1[index];
                if (transformNode && transformNode._waitingParentId) {
                    transformNode.parent = VR.BabylonEngine.Scene.getLastEntryByID(transformNode._waitingParentId);
                    transformNode._waitingParentId = null;
                }
            }
            for (var i = 0, len = newMeshes_1.length; i < len; i++) {
                if (newMeshes_1[i] !== null) {
                    if (newMeshes_1[i]._waitingParentId) {
                        if (tempMeshDic_1[newMeshes_1[i]._waitingParentId]) {
                            newMeshes_1[i].parent = tempMeshDic_1[newMeshes_1[i]._waitingParentId];
                        }
                        else {
                            newMeshes_1[i].parent = parentNode;
                            parentMeshes.push(newMeshes_1[i]);
                        }
                    }
                    else {
                        newMeshes_1[i].parent = parentNode;
                        parentMeshes.push(newMeshes_1[i]);
                    }
                    newMeshes_1[i]._waitingParentId = null;
                    // console.warn(newMeshes[i]);
                }
            }
            for (var i = 0; i < parentMeshes.length; i++) {
                BabylonLoader.meshParseRecursion(parentMeshes[i], assetID, tempMeshID_1, entities, data);
            }
            editor.call('selector:history', false);
            editor.call('selector:set', 'entity', [editor.call('entities:get', (_a = parentMeshes[0]) === null || _a === void 0 ? void 0 : _a.id)]);
            editor.once('selector:change', function () {
                editor.call('selector:history', true);
            });
            editor.call('make:scene:dirty');
            // editor.emit('entities:load', true);
            // TODO
            // VeryEngine.viewScene.onPointerObservable.add(pointerInfo => {
            //     switch (pointerInfo.type) {
            //         case BABYLON.PointerEventTypes.POINTERDOWN:
            //             // console.log('down');
            //             if (pointerInfo!.pickInfo!.pickedMesh != null) {
            //                 editor.call('pick', pointerInfo!.pickInfo!.pickedMesh);
            //             } else {
            //                 editor.call('pick', null);
            //             }
            //             // console.log(pointerInfo!.pickInfo!.pickedMesh);
            //             break;
            //     }
            // });
            // });
        }
    };
    BabylonLoader.parseBabylon = function (assetID, babylonData) {
        if (babylonData) {
            var parsedData_1 = {};
            // 材质
            if (babylonData.materials) {
                parsedData_1.materials = {};
                babylonData.materials.forEach(function (material) {
                    parsedData_1.materials[material.id] = material;
                });
            }
            // geometries
            if (babylonData.geometries && babylonData.geometries.vertexData) {
                parsedData_1.geometries = {};
                babylonData.geometries.vertexData.forEach(function (geometry) {
                    parsedData_1.geometries[geometry.id] = geometry;
                });
            }
            // mesh
            if (babylonData.meshes) {
                parsedData_1.meshes = {};
                babylonData.meshes.forEach(function (mesh) {
                    parsedData_1.meshes[mesh.id] = mesh;
                });
            }
            // transformNodes
            if (babylonData.transformNodes) {
                parsedData_1.transformNodes = {};
                babylonData.transformNodes.forEach(function (transformNode) {
                    parsedData_1.transformNodes[transformNode.id] = transformNode;
                });
            }
            BabylonLoader.babylonParsedData[assetID] = parsedData_1;
        }
    };
    BabylonLoader.hasBabylobData = function (assetID) {
        return assetID in BabylonLoader.babylonCacheData;
    };
    BabylonLoader.getBabylonData = function (assetID) {
        if (assetID in BabylonLoader.babylonCacheData) {
            return BabylonLoader.babylonCacheData[assetID];
        }
        else {
            return null;
        }
    };
    BabylonLoader.hasParsedBabylonData = function (assetID) {
        return assetID in BabylonLoader.babylonParsedData;
    };
    BabylonLoader.getParsedBabylonData = function (assetID) {
        if (assetID in BabylonLoader.babylonParsedData) {
            return BabylonLoader.babylonParsedData[assetID];
        }
        else {
            return null;
        }
    };
    BabylonLoader.meshParseRecursion = function (mesh, assetID, tempMeshID, entities, data) {
        if (mesh) {
            var parentID = '';
            if (mesh.parent !== null) {
                parentID = mesh.parent.id;
            }
            else {
                var root = editor.call('entities:root');
                parentID = root.get('resource_id');
                // root.insert('children', mesh.id);
                // BabylonLoader.updateSceneData(parentID, root._data2);
                // editor.call('make:scene:dirty');
            }
            var childs = mesh.getChildren();
            var myChildren = [];
            for (var k = 0; k < childs.length; k++) {
                myChildren.push(childs[k].id);
            }
            var eulerAngle = lib_1.Tools.radianToEulerAngle(mesh.rotation);
            var entityData = {
                name: mesh.name,
                resource_id: mesh.id,
                babylon_id: tempMeshID[mesh.id],
                asset_id: assetID,
                parent: parentID,
                position: [mesh.position.x, mesh.position.y, mesh.position.z],
                rotation: [eulerAngle.x, eulerAngle.y, eulerAngle.z],
                scale: [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z],
                children: myChildren,
                enabled: mesh.isEnabled(),
                checkCollisions: mesh.checkCollisions,
                pickable: mesh.isPickable,
                isVisible: mesh.isVisible,
                tags: [],
                type: 'mesh'
            };
            var entity = editor.call('entities:new', entityData);
            entities.push(entity);
            data.push(entity.origin);
            for (var k = 0; k < childs.length; k++) {
                BabylonLoader.meshParseRecursion(childs[k], assetID, tempMeshID, entities, data);
            }
        }
    };
    BabylonLoader.addSceneData = function (resource_id, data) {
        BabylonLoader.scenesData.entities[resource_id] = data;
        BabylonLoader.scenesData['modified'] = BabylonLoader.createdAtTime();
    };
    BabylonLoader.updateSceneData = function (resource_id, data) {
        BabylonLoader.scenesData.entities[resource_id] = data;
        BabylonLoader.scenesData['modified'] = BabylonLoader.createdAtTime();
    };
    BabylonLoader.createdAtTime = function () {
        var now = new Date();
        var Y = now.getFullYear();
        var m = BabylonLoader.getRealTime(now.getMonth() + 1);
        var d = BabylonLoader.getRealTime(now.getDate());
        var H = BabylonLoader.getRealTime(now.getHours());
        var i = BabylonLoader.getRealTime(now.getMinutes());
        // var s = getRealTime(now.getSeconds());
        return Y + "-" + m + "-" + d + " " + H + ":" + i;
    };
    BabylonLoader.getRealTime = function (str) {
        if (str < 10) {
            return "0" + str;
        }
        return str.toString();
    };
    BabylonLoader.loadLight = function (parsedLight, scene) {
        // Light
        if (parsedLight !== undefined && parsedLight !== null) {
            var light = BABYLON.Light.Parse(parsedLight, scene);
            return light;
        }
        return null;
    };
    BabylonLoader.loadReflectionProbe = function (parsedReflectionProbe, scene, rootUrl) {
        // ReflectionProbe
        if (parsedReflectionProbe !== undefined && parsedReflectionProbe !== null) {
            var reflectionProbe = BABYLON.ReflectionProbe.Parse(parsedReflectionProbe, scene, rootUrl);
            return reflectionProbe;
        }
        return null;
    };
    BabylonLoader.loadAnimation = function (parsedAnimation) {
        // Animation
        if (parsedAnimation !== undefined && parsedAnimation !== null) {
            var internalClass = BABYLON._TypeStore.GetClass("BABYLON.Animation");
            if (internalClass) {
                var animation = internalClass.Parse(parsedAnimation);
                return animation;
            }
            else {
                return null;
            }
        }
        return null;
    };
    BabylonLoader.loadMaterial = function (parsedMaterial, scene, rootUrl) {
        // Material
        if (parsedMaterial !== undefined && parsedMaterial !== null) {
            var mat = BABYLON.Material.Parse(parsedMaterial, scene, rootUrl);
            return mat;
        }
        return null;
    };
    BabylonLoader.loadMultiMaterial = function (parsedMultiMaterial, scene) {
        // MultiMaterial
        if (parsedMultiMaterial !== undefined && parsedMultiMaterial !== null) {
            var mmat = BABYLON.MultiMaterial.ParseMultiMaterial(parsedMultiMaterial, scene);
            return mmat;
        }
        return null;
    };
    BabylonLoader.loadMorphTargetManager = function (managerData, scene) {
        // MorphTargetManager
        if (managerData !== undefined && managerData !== null) {
            var morphTarget = BABYLON.MorphTargetManager.Parse(managerData, scene);
            return morphTarget;
        }
        return null;
    };
    BabylonLoader.loadSkeleton = function (parsedSkeleton, scene) {
        // Skeleton
        if (parsedSkeleton !== undefined && parsedSkeleton !== null) {
            var skeleton = BABYLON.Skeleton.Parse(parsedSkeleton, scene);
            return skeleton;
        }
        return null;
    };
    BabylonLoader.loadGeometry = function (vertexData, scene, rootUrl) {
        // Geometry
        if (vertexData !== undefined && vertexData !== null) {
            var geometry = BABYLON.Geometry.Parse(vertexData, scene, rootUrl);
            return geometry;
        }
        return null;
    };
    BabylonLoader.loadTransformNode = function (parsedTransformNode, scene, rootUrl) {
        // TransformNode
        if (parsedTransformNode !== undefined && parsedTransformNode !== null) {
            var node = BABYLON.TransformNode.Parse(parsedTransformNode, scene, rootUrl);
            return node;
        }
        return null;
    };
    BabylonLoader.loadMesh = function (parsedMesh, scene, rootUrl) {
        // Mesh
        if (parsedMesh !== undefined && parsedMesh !== null) {
            var mesh = BABYLON.Mesh.Parse(parsedMesh, scene, rootUrl);
            return mesh;
        }
        return null;
    };
    BabylonLoader.loadCamera = function (parsedCamera, scene) {
        // Camera
        if (parsedCamera !== undefined && parsedCamera !== null) {
            var camera = BABYLON.Camera.Parse(parsedCamera, scene);
            return camera;
        }
        return null;
    };
    BabylonLoader.loadAnimationGroup = function (parsedAnimationGroup, scene) {
        // AnimationGroup
        if (parsedAnimationGroup !== undefined && parsedAnimationGroup !== null) {
            var animationGroup = BABYLON.AnimationGroup.Parse(parsedAnimationGroup, scene);
            return animationGroup;
        }
        return null;
    };
    BabylonLoader.setBabylonParent = function (scene) {
        var index, cache = 0;
        // Browsing all the graph to connect the dots
        for (var index_1 = 0, cache_1 = scene.cameras.length; index_1 < cache_1; index_1++) {
            var camera = scene.cameras[index_1];
            if (camera._waitingParentId) {
                camera.parent = scene.getLastEntryByID(camera._waitingParentId);
                camera._waitingParentId = null;
            }
        }
        for (index = 0, cache = scene.lights.length; index < cache; index++) {
            var light = scene.lights[index];
            if (light && light._waitingParentId) {
                light.parent = scene.getLastEntryByID(light._waitingParentId);
                light._waitingParentId = null;
            }
        }
        //加载完所有资源以后，设立父子关系，加入在自己的引擎中，这些关系有scene数据确立，可以取消此处的操作
        // Connect parents & children and parse actions
        for (index = 0, cache = scene.transformNodes.length; index < cache; index++) {
            var transformNode = scene.transformNodes[index];
            if (transformNode._waitingParentId) {
                transformNode.parent = scene.getLastEntryByID(transformNode._waitingParentId);
                transformNode._waitingParentId = null;
            }
        }
        for (index = 0, cache = scene.meshes.length; index < cache; index++) {
            var mesh = scene.meshes[index];
            if (mesh._waitingParentId) {
                mesh.parent = scene.getLastEntryByID(mesh._waitingParentId);
                mesh._waitingParentId = null;
            }
        }
        // freeze world matrix application
        // 此部分为babylon隐藏方法
        // for (index = 0, cache = scene.meshes.length; index < cache; index++) {
        //     var currentMesh = scene.meshes[index];
        //     if (currentMesh._waitingFreezeWorldMatrix) {
        //         currentMesh.freezeWorldMatrix();
        //         currentMesh._waitingFreezeWorldMatrix = null;
        //     } else {
        //         currentMesh.computeWorldMatrix(true);
        //     }
        // }
    };
    BabylonLoader.prefix = '/assets/';
    BabylonLoader.assetsData = {};
    BabylonLoader.projectData = {};
    BabylonLoader.scenesData = {};
    BabylonLoader.sceneIndex = 0;
    BabylonLoader.babylonCacheData = {};
    BabylonLoader.babylonParsedData = {};
    return BabylonLoader;
}());
exports.BabylonLoader = BabylonLoader;
},{"../lib":12}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var Config = /** @class */ (function () {
    function Config() {
    }
    Config.prefix = '/assets/';
    Config.projectID = '';
    Config.projectName = '';
    Config.projectData = {};
    Config.userID = '';
    Config.username = '';
    Config.assetsData = {};
    Config.scenesData = {};
    Config.sceneIndex = 0;
    Config.tableAssetsID = '';
    Config.tableName = '';
    Config.tableData = null;
    return Config;
}());
exports.Config = Config;
},{}],3:[function(require,module,exports){
"use strict";
///// <reference path="./dts/babylon.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var config_1 = require("./config");
var loader_1 = require("./loader");
// import { VE_Objects, VE_Manager } from "../veryengine/veryEngine";
// import { BabylonEngine, Time } from "../veryengine/babylon";
var Game = /** @class */ (function () {
    // private _camera!: BABYLON.FreeCamera;
    function Game(canvasElement, fps) {
        this._showFps = true;
        new loader_1.Loader();
        this._canvas = canvasElement;
        VR.BabylonEngine.Canvas = this._canvas;
        this._fps = fps;
        // this._engine = new BABYLON.Engine(this._canvas, true);
        this._table = document.getElementById("VeryTable");
    }
    /**
     * 创建场景，并且启动
     */
    Game.prototype.createScene = function (datas) {
        var _this = this;
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
        this._scene.clearColor = new BABYLON.Color4(116 / 255, 116 / 255, 116 / 255, 1);
        // TODO: 设定相机
        var camera = new BABYLON.ArcRotateCamera('Default', 100, 50, 50, new BABYLON.Vector3(0, 0, 0), this._scene);
        camera.setPosition(new BABYLON.Vector3(0, 1, -20));
        camera.attachControl(this._canvas, true);
        // let inputMap: { [key: string]: boolean } = {};
        // TODO: 加载过度动画开
        // engine.hideLoadingUI();
        engine.displayLoadingUI();
        // 加载资源
        // console.warn(Config.scenesData);
        editor.call('scene:raw', config_1.Config.scenesData);
        // 运行编译器
        this.startVeryEngine(this._scene, datas);
        engine.hideLoadingUI();
        // 发布版编辑器
        this._scene.onKeyboardObservable.add(function (kbInfo) {
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                if (kbInfo.event.keyCode === 81 && kbInfo.event.ctrlKey && kbInfo.event.altKey) { //Ctrl + Q
                    console.log('Ctrl + Alt + Q');
                    _this.toggleDebug();
                }
            }
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
        return this;
    };
    Game.prototype.startVeryEngine = function (scene, datas) {
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
},{"./config":2,"./loader":5}],4:[function(require,module,exports){
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
__exportStar(require("./config"), exports);
__exportStar(require("./loader"), exports);
__exportStar(require("./babylonloader"), exports);
},{"./babylonloader":1,"./config":2,"./game":3,"./loader":5,"./scenes":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = void 0;
var lib_1 = require("../lib");
var babylonloader_1 = require("./babylonloader");
var Loader = /** @class */ (function () {
    function Loader() {
        editor.method('initAssets', function (assets_data) {
            if (assets_data.assets)
                onLoad(assets_data.assets);
        });
        // 加载assets数据，data为assets数据
        var onLoad = function (data) {
            editor.call('assets:progress', 0.5);
            var count = 0;
            var assetsLength = Object.getOwnPropertyNames(data).length;
            // 加载Asset资源
            var load = function (asset_data) {
                editor.call('loadAsset', asset_data, function () {
                    count++;
                    editor.call('assets:progress', (count / assetsLength) * 0.5 + 0.5);
                    if (count >= assetsLength) {
                        editor.call('assets:progress', 1);
                        editor.emit('assets:load');
                    }
                });
            };
            for (var key in data) {
                load(data[key]);
            }
        };
        editor.method('scene:raw', function (data) {
            // editor.call('selector:clear');
            // editor.call('entities:clear');
            // editor.call('attributes:clear');
            // console.log(data);
            // console.log(data.entities);
            // var total = Object.keys(data.entities).length;
            // var i = 0;
            // list
            for (var key in data.entities) {
                var entity = new lib_1.Observer(data.entities[key]);
                // editor.call('entities:add', entity);
                // p.progress = (++i / total) * 0.8 + 0.1;
                // console.warn(entity);
                if (!data.entities[key].root) {
                    editor.call('create:scene:element', entity);
                }
            }
            // p.progress = 1;
            // loadedEntities = true;
            editor.emit('entities:load');
        });
        var childIndex = {};
        var entitiesIndex = {};
        editor.method('create:scene:element', function (entity) {
            // console.log('create scene element');
            // console.error(entity);
            if (entity.get('type') === 'light') {
                // Lights
                var light = BABYLON.Light.Parse(entity.get('data'), VR.BabylonEngine.Scene);
                if (light) {
                    entitiesIndex[entity.get('resource_id')] = light;
                    entity.node = light;
                    light.id = entity.get('resource_id');
                    childAndParent(entity, light);
                    // (<BABYLON.ShadowLight>light)
                    // console.warn(light);
                }
                else {
                    console.error('light创建失败，light原始信息：');
                    console.error(entity.get('data'));
                }
            }
            else if (entity.get('type') === 'camera') {
                // TODO: camera要特别处理
                // Cameras
                // var camera = BABYLON.Camera.Parse(entity.get('data'), VeryEngine.viewScene);
                // camera.attachControl(VeryEngine.viewCanvasElement);
                // entity.node = camera;
                // entitiesIndex[entity.get('resource_id')] = camera;
                // camera!.id = entity.get('resource_id');
                // childAndParent(entity, camera);
                // console.warn(camera);
            }
            else if (entity.get('type') === 'box') {
                // box
                var box = BABYLON.Mesh.CreateBox(entity.get('name'), 1, VR.BabylonEngine.Scene);
                entity.node = box;
                entitiesIndex[entity.get('resource_id')] = box;
                box.id = entity.get('resource_id');
                box.position = BABYLON.Vector3.FromArray(entity.get('position'));
                box.rotation = lib_1.Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                box.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                box.isEnabled(entity.get('enabled'));
                box.isPickable = entity.get('pickable');
                box.checkCollisions = entity.get('checkCollisions');
                box.isVisible = entity.get('isVisible');
                // 加载自定义关联材质
                if (entity.get('material_id')) {
                }
                childAndParent(entity, box);
                // console.warn(box);
            }
            else if (entity.get('type') === 'mesh') {
                // 模型异步加载，因为mesh需要先加载.babylon文件；
                // console.warn('scene创建mesh：' + entity.get('name'));
                editor.call('scene:mesh:create', entity);
            }
        });
        var childAndParent = function (entity, node) {
            // children
            var children = entity.get('children');
            for (var i = 0; i < children.length; i++) {
                childIndex[children[i]] = {
                    index: i,
                    parent: node
                };
                if (entitiesIndex[children[i]]) {
                    insertChild(node, entitiesIndex[children[i]], i);
                }
            }
            // parenting
            if (!entity.get('parent')) {
                // babylon root
            }
            else {
                // child
                var details = childIndex[entity.get('resource_id')];
                if (details && details.parent) {
                    insertChild(details.parent, node, details.index);
                }
            }
        };
        var insertChild = function (parent, node, index) {
            if (node !== null) {
                node.parent = parent;
            }
        };
        editor.method('scene:mesh:create', function (entity) {
            loadBabylon(entity);
        });
        var loadingBabylonFlag = {};
        var toLoadEntity = {};
        var loadBabylon = function (entity) {
            var assetID = entity.get('asset_id');
            var dataBabylon = null;
            if (babylonloader_1.BabylonLoader.hasBabylobData(assetID)) {
                dataBabylon = babylonloader_1.BabylonLoader.getParsedBabylonData(assetID);
                // BabylonLoader.assembleBabylon(assetID, dataBabylon);
                // 关联mesh
                assembleSceneMesh(entity, dataBabylon);
            }
            else {
                if (assetID in loadingBabylonFlag) {
                    toLoadEntity[assetID].push(entity);
                }
                else {
                    loadingBabylonFlag[assetID] = true;
                    toLoadEntity[assetID] = [entity];
                    // console.warn(BabylonLoader.assetsData);
                    var data1 = {
                        url: babylonloader_1.BabylonLoader.prefix + assetID + '/' + babylonloader_1.BabylonLoader.assetsData.assets[assetID].name,
                        method: 'GET',
                        // auth: true,
                        data: null,
                        ignoreContentType: true,
                    };
                    // 直接返回babylon json格式内容数据
                    new lib_1.Ajax(data1)
                        .on('load', function (status, data) {
                        dataBabylon = data;
                        babylonloader_1.BabylonLoader.babylonCacheData[assetID] = dataBabylon;
                        babylonloader_1.BabylonLoader.parseBabylon(assetID, data);
                        babylonloader_1.BabylonLoader.parseBabylon(assetID, data);
                        dataBabylon = babylonloader_1.BabylonLoader.getParsedBabylonData(assetID);
                        toLoadEntity[assetID].forEach(function (item) {
                            assembleSceneMesh(item, dataBabylon);
                        });
                        // 关联mesh
                    }).on('error', function (evt) {
                        console.error('scene数据匹配babylon mesh数据错误！');
                        console.error(evt);
                    });
                    ;
                }
            }
        };
        var assembleSceneMesh = function (entity, parsedBabylon) {
            // TODO: 暂时未考虑TransformNode数据的情况
            if (parsedBabylon) {
                var assetID = entity.get('asset_id');
                // 先从.babylon提取原始mesh数据
                var meshID = entity.get('babylon_id');
                if (parsedBabylon.meshes[meshID]) {
                    var meshData = parsedBabylon.meshes[meshID];
                    // 结合scene和babylon数据，更新mesh信息
                    meshData.position = entity.has('position') && entity.get('position') ? entity.get('position') : meshData.position;
                    var recordRotation = entity.get('rotation');
                    if (recordRotation && recordRotation.length > 0) {
                        recordRotation = lib_1.Tools.vector3ToArray(lib_1.Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(recordRotation)));
                    }
                    else {
                        recordRotation = meshData.rotation;
                    }
                    meshData.rotation = recordRotation;
                    meshData.scale = entity.has('scale') && entity.get('scale') ? entity.get('scale') : meshData.scal;
                    meshData.name = entity.has('name') && entity.get('name') ? entity.get('name') : meshData.name;
                    meshData.id = entity.has('resource_id') && entity.get('resource_id') ? entity.get('resource_id') : meshData.id;
                    meshData.isEnabled = entity.has('enabled') ? entity.get('enabled') : meshData.isEnabled;
                    meshData.isVisible = entity.has('isVisible') ? entity.get('isVisible') : meshData.isVisible;
                    // TODO：发布状态下，听数据的
                    meshData.pickable = entity.has('pickable') ? entity.get('pickable') : meshData.pickable;
                    // TODO：scene编辑条件下默认就是加载状态；
                    // meshData.pickable = true;
                    meshData.checkCollisions = entity.has('checkCollisions') ? entity.get('checkCollisions') : meshData.checkCollisions;
                    meshData.materialId = entity.has('material_id') ? entity.get('material_id') : meshData.materialId;
                    // 要注意是否为root id
                    meshData.parentId = entity.has('parent') ? entity.get('parent') : meshData.parentId;
                    // 判断是否关联了geometry
                    if (meshData.geometryId) {
                        if (VR.BabylonEngine.Scene.getGeometryByID(meshData.geometryId) === null) {
                            if (parsedBabylon.geometries && parsedBabylon.geometries[meshData.geometryId]) {
                                var vertexData = parsedBabylon.geometries[meshData.geometryId];
                                babylonloader_1.BabylonLoader.loadGeometry(vertexData, VR.BabylonEngine.Scene, '');
                            }
                        }
                    }
                    // 组装material
                    // console.error(meshData.materialId);
                    if (meshData.materialId) {
                        if (VR.BabylonEngine.Scene.getMaterialByID(meshData.materialId) === null) {
                            // console.error(BabylonLoader.assetsData.babylon[assetID]);
                            if (babylonloader_1.BabylonLoader.assetsData.babylon[assetID]) {
                                var mats = babylonloader_1.BabylonLoader.assetsData.babylon[assetID]['materials'];
                                if (mats && mats[meshData.materialId]) {
                                    var matAssetID = mats[meshData.materialId].asset_id;
                                    if (babylonloader_1.BabylonLoader.assetsData.assets[matAssetID]) {
                                        var newMat = babylonloader_1.BabylonLoader.assetsData.assets[matAssetID].data;
                                        // 检测texture
                                        if (newMat.diffuseTexture && newMat.diffuseTexture.texture_id) {
                                            newMat.diffuseTexture.name = babylonloader_1.BabylonLoader.prefix + newMat.diffuseTexture.texture_id + '/' + babylonloader_1.BabylonLoader.assetsData.assets[newMat.diffuseTexture.texture_id].name;
                                            // console.warn(newMat.diffuseTexture.name);
                                        }
                                        if (newMat.specularTexture && newMat.specularTexture.texture_id) {
                                            newMat.specularTexture.name = babylonloader_1.BabylonLoader.prefix + newMat.specularTexture.texture_id + '/' + babylonloader_1.BabylonLoader.assetsData.assets[newMat.specularTexture.texture_id].name;
                                        }
                                        if (newMat.reflectionTexture && newMat.reflectionTexture.texture_id) {
                                            newMat.reflectionTexture.name = babylonloader_1.BabylonLoader.prefix + newMat.reflectionTexture.texture_id + '/' + babylonloader_1.BabylonLoader.assetsData.assets[newMat.reflectionTexture.texture_id].name;
                                        }
                                        if (newMat.refractionTexture && newMat.refractionTexture.texture_id) {
                                            newMat.refractionTexture.name = babylonloader_1.BabylonLoader.prefix + newMat.refractionTexture.texture_id + '/' + babylonloader_1.BabylonLoader.assetsData.assets[newMat.refractionTexture.texture_id].name;
                                        }
                                        if (newMat.emissiveTexture && newMat.emissiveTexture.texture_id) {
                                            newMat.emissiveTexture.name = babylonloader_1.BabylonLoader.prefix + newMat.emissiveTexture.texture_id + '/' + babylonloader_1.BabylonLoader.assetsData.assets[newMat.emissiveTexture.texture_id].name;
                                        }
                                        if (newMat.bumpTexture && newMat.bumpTexture.texture_id) {
                                            newMat.bumpTexture.name = babylonloader_1.BabylonLoader.prefix + newMat.bumpTexture.texture_id + '/' + babylonloader_1.BabylonLoader.assetsData.assets[newMat.bumpTexture.texture_id].name;
                                        }
                                        if (newMat.opacityTexture && newMat.opacityTexture.texture_id) {
                                            newMat.opacityTexture.name = babylonloader_1.BabylonLoader.prefix + newMat.opacityTexture.texture_id + '/' + babylonloader_1.BabylonLoader.assetsData.assets[newMat.opacityTexture.texture_id].name;
                                        }
                                        if (newMat.ambientTexture && newMat.ambientTexture.texture_id) {
                                            newMat.ambientTexture.name = babylonloader_1.BabylonLoader.prefix + newMat.ambientTexture.texture_id + '/' + babylonloader_1.BabylonLoader.assetsData.assets[newMat.ambientTexture.texture_id].name;
                                        }
                                        if (newMat.lightmapTexture && newMat.lightmapTexture.texture_id) {
                                            newMat.lightmapTexture.name = babylonloader_1.BabylonLoader.prefix + newMat.lightmapTexture.texture_id + '/' + babylonloader_1.BabylonLoader.assetsData.assets[newMat.lightmapTexture.texture_id].name;
                                        }
                                        // console.error(newMat);
                                        babylonloader_1.BabylonLoader.loadMaterial(newMat, VR.BabylonEngine.Scene, '');
                                    }
                                    else {
                                        console.warn('scene mesh warn');
                                    }
                                }
                            }
                            else {
                                console.warn('scene mesh warn');
                            }
                        }
                    }
                    // 加载mesh
                    var mesh = babylonloader_1.BabylonLoader.loadMesh(meshData, VR.BabylonEngine.Scene, '');
                    entity.node = mesh;
                    entitiesIndex[entity.get('resource_id')] = mesh;
                    childAndParent(entity, mesh);
                }
                else {
                    console.warn('scene mesh warn');
                }
            }
        };
    }
    return Loader;
}());
exports.Loader = Loader;
},{"../lib":12,"./babylonloader":1}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
__exportStar(require("./lib"), exports);
__exportStar(require("./game"), exports);
},{"./game":4,"./lib":12}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjaxRequest = exports.Ajax = void 0;
var lib_1 = require("../lib");
var Ajax = /** @class */ (function () {
    function Ajax(args) {
        if (typeof (args) === 'string')
            args = { url: args };
        return new AjaxRequest(args);
    }
    Ajax.get = function (url) {
        return new AjaxRequest({ url: url });
    };
    Ajax.post = function (url, data) {
        return new AjaxRequest({
            method: 'POST',
            url: url,
            data: data
        });
    };
    Ajax.put = function (url, data) {
        return new AjaxRequest({
            method: 'PUT',
            url: url,
            data: data
        });
    };
    Ajax.delete = function (url) {
        return new AjaxRequest({
            method: 'DELETE',
            url: url
        });
    };
    Ajax.param = function (name, value) {
        Ajax.params[name] = value;
    };
    Ajax.params = {};
    return Ajax;
}());
exports.Ajax = Ajax;
var AjaxRequest = /** @class */ (function (_super) {
    __extends(AjaxRequest, _super);
    function AjaxRequest(args) {
        var _this = _super.call(this) || this;
        _this._progress = 0;
        if (!args) {
            throw new Error('ajax请求无参数，请检查！');
        }
        _this._progress = 0.0;
        _this.emit('progress', _this._progress);
        _this._xhr = new XMLHttpRequest();
        // send cookies
        if (args.cookies)
            _this._xhr.withCredentials = true;
        // events
        _this._xhr.addEventListener('load', _this._onLoad.bind(_this), false);
        // this._xhr.addEventListener('progress', this._onProgress.bind(this), false);
        _this._xhr.upload.addEventListener('progress', _this._onProgress.bind(_this), false);
        _this._xhr.addEventListener('error', _this._onError.bind(_this), false);
        _this._xhr.addEventListener('abort', _this._onAbort.bind(_this), false);
        // url
        var url = args.url;
        // query
        if (args.query && Object.keys(args.query).length) {
            if (url.indexOf('?') === -1) {
                url += '?';
            }
            var query = [];
            for (var key in args.query) {
                query.push(key + '=' + args.query[key]);
            }
            url += query.join('&');
        }
        // templating
        var parts = url.split('{{');
        if (parts.length > 1) {
            for (var i = 1; i < parts.length; i++) {
                var ends = parts[i].indexOf('}}');
                var key = parts[i].slice(0, ends);
                if (Ajax.params[key] === undefined)
                    continue;
                // replace
                parts[i] = Ajax.params[key] + parts[i].slice(ends + 2);
            }
            url = parts.join('');
        }
        // open request
        _this._xhr.open(args.method || 'GET', url, true);
        // 返回数据是否为json格式
        _this.notJson = args.notJson || false;
        // header for PUT/POST
        if (!args.ignoreContentType && (args.method === 'PUT' || args.method === 'POST' || args.method === 'DELETE'))
            _this._xhr.setRequestHeader('Content-Type', 'application/json');
        // TODO: 权限header参数
        // if (args.auth && config.accessToken) {
        //     this._xhr.setRequestHeader('Authorization', 'Bearer ' + config.accessToken);
        // }
        if (args.headers) {
            for (var key in args.headers)
                _this._xhr.setRequestHeader(key, args.headers[key]);
        }
        // stringify data if needed
        if (args.data && typeof (args.data) !== 'string' && !(args.data instanceof FormData)) {
            args.data = JSON.stringify(args.data);
        }
        // make request
        _this._xhr.send(args.data || null);
        return _this;
    }
    AjaxRequest.prototype._onLoad = function () {
        this._progress = 1.0;
        this.emit('progress', 1.0);
        if (this._xhr.status === 200 || this._xhr.status === 201) {
            if (this.notJson) {
                this.emit('load', this._xhr.status, this._xhr.responseText);
            }
            else {
                try {
                    var json = JSON.parse(this._xhr.responseText);
                }
                catch (ex) {
                    this.emit('error', this._xhr.status || 0, new Error('invalid json'));
                    return;
                }
                this.emit('load', this._xhr.status, json);
            }
        }
        else {
            try {
                var json = JSON.parse(this._xhr.responseText);
                var msg = json.message;
                if (!msg) {
                    msg = json.error || (json.response && json.response.error);
                }
                if (!msg) {
                    msg = this._xhr.responseText;
                }
                this.emit('error', this._xhr.status, msg);
            }
            catch (ex) {
                this.emit('error', this._xhr.status);
            }
        }
    };
    AjaxRequest.prototype._onError = function (evt) {
        this.emit('error', 0, evt);
    };
    AjaxRequest.prototype._onAbort = function (evt) {
        this.emit('error', 0, evt);
    };
    AjaxRequest.prototype._onProgress = function (evt) {
        if (!evt.lengthComputable)
            return;
        var progress = evt.loaded / evt.total;
        if (progress !== this._progress) {
            this._progress = progress;
            this.emit('progress', this._progress);
        }
    };
    AjaxRequest.prototype.abort = function () {
        this._xhr.abort();
    };
    return AjaxRequest;
}(lib_1.Events));
exports.AjaxRequest = AjaxRequest;
},{"../lib":12}],9:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
var events_1 = require("./events");
var Editor = /** @class */ (function (_super) {
    __extends(Editor, _super);
    function Editor() {
        var _this = _super.call(this) || this;
        // 相较于Events，同一个函数名只可代表一个函数；
        // 某个name对应的某个事件，name与Function是1对1的关系；
        _this._hooks = {};
        return _this;
    }
    /**
     * 添加全局函数，函数名与函数本体一一对应，不能重名；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    Editor.prototype.method = function (name, fn) {
        if (this._hooks[name] !== undefined) {
            throw new Error("can't override hook: " + name);
        }
        this._hooks[name] = fn;
    };
    ;
    /**
     * 移除某个函数；
     * @param name 函数名；
     */
    Editor.prototype.methodRemove = function (name) {
        delete this._hooks[name];
    };
    ;
    /**
     * 执行某个函数；
     * @param name 函数名；
     */
    Editor.prototype.call = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this._hooks[name]) {
            var args = Array.prototype.slice.call(arguments, 1);
            try {
                return this._hooks[name].apply(null, args);
            }
            catch (ex) {
                console.error("%c%s %c(editor.method error)", "color: #06f", name, "color: #f00");
                console.error(ex.stack);
            }
        }
        return null;
    };
    ;
    return Editor;
}(events_1.Events));
exports.Editor = Editor;
},{"./events":10}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandle = exports.Events = void 0;
var Events = /** @class */ (function () {
    function Events() {
        this._suspendEvents = false;
        // 某个name对应的事件数组，name与Function是1对多的关系；
        this._events = {};
    }
    Object.defineProperty(Events.prototype, "suspendEvents", {
        // 相较于Editor，同一个函数名可包含一系列函数，不仅仅是一个，且有once功能；
        get: function () {
            return this._suspendEvents;
        },
        set: function (val) {
            this._suspendEvents = val;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 添加事件数组，若name相同，则在数组末尾继续添加；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    Events.prototype.on = function (name, fn) {
        var events = this._events[name];
        if (events === undefined) {
            this._events[name] = [fn];
        }
        else {
            if (events.indexOf(fn) == -1) {
                events.push(fn);
            }
        }
        return new EventHandle(this, name, fn);
    };
    /**
     * emit后只执行一次；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    Events.prototype.once = function (name, fn) {
        var self = this;
        var evt = this.on(name, function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            fn.call(self, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
            evt.unbind();
        });
        return evt;
    };
    /**
     * 执行事件；
     * @param name 函数名；
     * @param arg0 函数参数1，可选；
     * @param arg1 函数参数2，可选；
     * @param arg2 函数参数3，可选；
     * @param arg3 函数参数4，可选；
     * @param arg4 函数参数5，可选；
     * @param arg5 函数参数6，可选；
     * @param arg6 函数参数7，可选；
     * @param arg7 函数参数8，可选；
     */
    Events.prototype.emit = function (name, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        if (this._suspendEvents)
            return this;
        var events = this._events[name];
        if (!events)
            return this;
        // 返回新数组
        events = events.slice(0);
        for (var i = 0; i < events.length; i++) {
            if (!events[i])
                continue;
            try {
                events[i].call(this, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
            }
            catch (ex) {
                console.info("%c%s %c(event error)", "color: #06f", name, "color: #f00");
                console.log(ex.stack);
            }
        }
        return this;
    };
    ;
    /**
     * 取消Events事件绑定，若name为空，则清空events；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    Events.prototype.unbind = function (name, fn) {
        if (name) {
            var events = this._events[name];
            if (!events)
                return this;
            if (fn) {
                var i = events.indexOf(fn);
                if (i !== -1) {
                    if (events.length === 1) {
                        delete this._events[name];
                    }
                    else {
                        events.splice(i, 1);
                    }
                }
            }
            else {
                delete this._events[name];
            }
        }
        else {
            this._events = {};
        }
        return this;
    };
    ;
    return Events;
}());
exports.Events = Events;
var EventHandle = /** @class */ (function () {
    function EventHandle(owner, name, fn) {
        this.owner = owner;
        this.name = name;
        this.fn = fn;
    }
    EventHandle.prototype.unbind = function () {
        if (!this.owner)
            return;
        this.owner.unbind(this.name, this.fn);
        this.owner = null;
        this.name = null;
        this.fn = null;
    };
    EventHandle.prototype.call = function () {
        if (!this.fn)
            return;
        this.fn.call(this.owner, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
    };
    EventHandle.prototype.on = function (name, fn) {
        return this.owner.on(name, fn);
    };
    return EventHandle;
}());
exports.EventHandle = EventHandle;
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUID = void 0;
var GUID = /** @class */ (function () {
    function GUID() {
    }
    /**
     * 创建GUID唯一标志，注意：采用大数法，有很小的可能性会重复，一般够用；
     */
    GUID.create = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = (c === 'x') ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    return GUID;
}());
exports.GUID = GUID;
},{}],12:[function(require,module,exports){
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
__exportStar(require("./events"), exports);
__exportStar(require("./editor"), exports);
__exportStar(require("./observer"), exports);
__exportStar(require("./tools"), exports);
__exportStar(require("./guid"), exports);
__exportStar(require("./ajax"), exports);
},{"./ajax":8,"./editor":9,"./events":10,"./guid":11,"./observer":13,"./tools":14}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observer = void 0;
var events_1 = require("./events");
//  TODO： 当前暂不考虑赋值会超出现有类型的情况，比如原来是个number，赋值为了array；
var Observer = /** @class */ (function (_super) {
    __extends(Observer, _super);
    // entity, assets, components: script, 一般components, selector, history
    function Observer(data, options) {
        var _this = _super.call(this) || this;
        _this.SEPARATOR = '.';
        _this._dataType = {}; // 暂时只判断是否为array分拆而成的类型；
        _this._dataType2 = {}; // 暂时只判断是否为array分拆而成的类型；
        // private sync!: History;
        _this.node = null;
        _this.reparenting = false;
        _this._pathsWithDuplicates = {};
        _this.origin = data;
        options = options || {};
        _this._destroyed = false;
        _this._path = '';
        _this._keys = [];
        _this._data = {};
        _this._data2 = {};
        // array paths where duplicate entries are allowed - normally
        // we check if an array already has a value before inserting it
        // but if the array path is in here we'll allow it
        if (options.pathsWithDuplicates) {
            _this._pathsWithDuplicates = {};
            for (var i = 0; i < options.pathsWithDuplicates.length; i++) {
                _this._pathsWithDuplicates[options.pathsWithDuplicates[i]] = true;
            }
        }
        _this.patchData(data);
        // for (let ke in this._data) {
        //   debug.log('key: ' + ke);
        //   debug.log(this._data[ke]);
        // }
        // this._parent = options.parent || null;
        // this._parentPath = options.parentPath || '';
        // this._parentField = options.parentField || null;
        // this._parentKey = options.parentKey || null;
        _this._silent = false;
        return _this;
    }
    Object.defineProperty(Observer.prototype, "className", {
        get: function () {
            return 'Observer';
        },
        enumerable: false,
        configurable: true
    });
    Observer.prototype.patchData = function (data) {
        if (typeof data !== 'object') {
            debug.warn(this.className + ': 不是正确的json对象，打印：\n' + data);
            return;
        }
        for (var key in data) {
            if (typeof data[key] === 'object') {
                // 对象属性
                // debug.log('对象属性：' + key);
                // debug.log(data[key]);
                // this._prepare(this, key, data[key]);
                this.parserObject(key, key, data[key]);
            }
            else {
                // 一般属性
                // debug.log('一般属性：' + key);
                // debug.log(data[key]);
                this.set(key, data[key]);
                this._dataType[key] = false;
                this._dataType2[key] = false;
                // this.set(key, data[key]);
            }
        }
    };
    // TODO: 若设置值为object，需要再parse
    Observer.prototype.set = function (path, value) {
        // console.warn(path + ' : ' + value);
        var oldValue = this._data[path];
        // console.warn(path);
        // console.warn(value);
        var keys = path.split('.');
        var parentID = '';
        for (var i = 0; i < keys.length - 1; i++) {
            if (i === 0) {
                parentID = keys[i];
            }
            else {
                parentID += this.SEPARATOR + keys[i];
            }
        }
        // 数组处理，其他形式暂不考虑
        if (keys.length > 1 && this._dataType[path]) {
            var index = parseInt(keys[keys.length - 1]);
            this._data[path] = value;
            // 上一级数组修改
            this._data[parentID][index] = value;
        }
        else {
            // if (value instanceof Array) {
            //     value = value.slice(0);
            // }
            this._data[path] = value;
            this.updateChildData(path, value);
            this._data2[path] = value;
        }
        // console.warn(this._data);
        // if (parentID && this._dataType2[parentID] && this.isNumber(keys[keys.length - 1])) {
        //     this._data2[parentID][parseInt(keys[keys.length - 1])] = value;
        // }
        this.emit(path + ':set', value, oldValue);
        this.emit('*:set', path, value, oldValue);
    };
    Observer.prototype.isNumber = function (str) {
        var n = Number(str);
        return !isNaN(n) ? true : false;
    };
    Observer.prototype.updateChildData = function (path, value) {
        if (value instanceof Array) {
            for (var key in this._data) {
                if (key.startsWith(path + this.SEPARATOR)) {
                    delete this._data[key];
                    delete this._dataType[key];
                }
            }
            var newPath = '';
            for (var i = 0; i < value.length; i++) {
                newPath = path + this.SEPARATOR + i.toString();
                this._data[newPath] = value[i];
                this._dataType[newPath] = true;
            }
        }
    };
    // TODO
    Observer.prototype.unset = function (path, value) {
        // console.log(path + ' : ' + value);
        if (!this.has(path)) {
            return false;
        }
        var oldValue = this._data[path];
        delete this._data[path];
        delete this._dataType[path];
        delete this._data2[path];
        delete this._dataType2[path];
        this.emit(path + ':set', value, oldValue);
        this.emit('*:set', path, value, oldValue);
        return true;
    };
    // 在数组的某个指定位置增加值
    Observer.prototype.insert = function (path, value, ind) {
        // console.error(path + ':insert-value: ' + value);
        // console.warn(this._data);
        if (!this.has(path) || !(this._data[path] instanceof Array)) {
            return false;
        }
        var arr = this._data[path];
        if (value instanceof Array) {
            value = value.slice(0);
        }
        // if (!this._pathsWithDuplicates || !this._pathsWithDuplicates[path]) {
        //     if (arr.indexOf(value) !== -1) {
        //         return false;
        //     }
        // }
        if (ind === undefined) {
            arr.push(value);
            ind = arr.length - 1;
        }
        else {
            arr.splice(ind, 0, value);
        }
        this.updateChildData(path, arr);
        // TODO
        // let arr2 = this._data2[path];
        // console.error(arr2);
        // if (arr2) {
        //     // if (!this._pathsWithDuplicates || !this._pathsWithDuplicates[path]) {
        //     //     if (arr2.indexOf(value) !== -1) {
        //     //         return false;
        //     //     }
        //     // }
        //     if (ind === undefined) {
        //         arr2.push(value);
        //     } else {
        //         arr2.splice(ind, 0, value);
        //     }
        // }
        // console.error(arr2);
        // console.warn(this._data);
        this.emit(path + ':insert', value, ind);
        this.emit('*:insert', path, value, ind);
        return true;
    };
    // 删除数组指定某个序号的值
    Observer.prototype.remove = function (path, ind) {
        if (!this.has(path) || !(this._data[path] instanceof Array)) {
            return false;
        }
        var arr = this._data[path];
        if (arr.length < ind)
            return false;
        var value = arr[ind];
        arr.splice(ind, 1);
        this.updateChildData(path, arr);
        // TODO
        // let arr2 = this._data2[path];
        // if (arr2 && arr2.length >= ind) {
        //     arr2.splice(ind, 1);
        // }
        this.emit(path + ':remove', value, ind);
        this.emit('*:remove', path, value, ind);
        return true;
    };
    // 删除数组中的某个value值
    Observer.prototype.removeValue = function (path, value) {
        if (!this.has(path) || !(this._data[path] instanceof Array)) {
            return false;
        }
        var arr = this._data[path];
        var ind = arr.indexOf(value);
        if (ind === -1) {
            return false;
        }
        var oldValue = arr[ind];
        arr.splice(ind, 1);
        this.updateChildData(path, arr);
        // TODO
        // let arr2 = this._data2[path];
        // if (arr2 && ind >= 0) {
        //     arr2.splice(ind, 1);
        // }
        // console.warn('删除');
        // console.warn(this._data);
        // console.warn(this._data2);
        this.emit(path + ':remove', oldValue, ind);
        this.emit('*:remove', path, oldValue, ind);
        return true;
    };
    Observer.prototype.move = function (path, indOld, indNew) {
        if (!this.has(path) || !(this._data[path] instanceof Array)) {
            return false;
        }
        var indNew2 = indNew;
        var arr = this._data[path];
        if (arr.length < indOld || arr.length < indNew || indOld === indNew)
            return false;
        var oldValue = arr[indOld];
        arr.splice(indOld, 1);
        if (indNew === -1)
            indNew = arr.length;
        arr.splice(indNew, 0, oldValue);
        this.updateChildData(path, arr);
        // TODO
        // let arr2 = this._data2[path];
        // if (arr2) {
        //     if (arr2.length < indOld || arr2.length < indNew2 || indOld === indNew2) {
        //     } else {
        //         let oldValue2 = arr2[indOld]
        //         arr2.splice(indOld, 1);
        //         if (indNew2 === -1) indNew2 = arr2.length;
        //         arr2.splice(indNew2, 0, oldValue2);
        //     }
        // }
        this.emit(path + ':move', oldValue, indNew, indOld);
        this.emit('*:move', path, oldValue, indNew, indOld);
        return true;
    };
    Observer.prototype.parserObject = function (prefix, key, value) {
        // 先保存一份
        this.set(prefix, value);
        this._dataType[prefix] = false;
        var path;
        var type = typeof value;
        if (type === 'object' && value instanceof Array) {
            this._dataType2[prefix] = true;
            for (var i = 0; i < value.length; i++) {
                path = prefix + this.SEPARATOR + i.toString();
                this.set(path, value[i]);
                this._dataType[path] = true;
                // 数组元素还是对象的情况暂时不处理
            }
        }
        else if (type === 'object' && value instanceof Object) {
            for (var key2 in value) {
                if (typeof value[key2] === 'object') {
                    // 递归解析
                    this.parserObject(prefix + this.SEPARATOR + key2, key2, value[key2]);
                }
                else {
                    path = prefix + this.SEPARATOR + key2;
                    this.set(path, value[key2]);
                    this._dataType[path] = false;
                    this._dataType2[prefix] = false;
                }
            }
        }
        else {
            // 目前看，null和undefined会经过这里
            // debug.warn(this.className + '.parserObject, 为止数据类型:' + value);
        }
    };
    Observer.prototype.has = function (path) {
        return path in this._data;
    };
    Observer.prototype.get = function (path) {
        if (path in this._data) {
            return this._data[path];
        }
        else {
            return null;
        }
    };
    Observer.prototype.propagate = function (evt) {
        var that = this;
        return function (path, arg1, arg2, arg3) {
            if (!that._parent)
                return;
            var key = that._parentKey;
            if (!key && that._parentField instanceof Array) {
                key = that._parentField.indexOf(that);
                if (key === -1)
                    return;
            }
            // path = that._parentPath + '.' + key + '.' + path;
            var state;
            if (that._silent)
                state = that._parent.silence();
            that._parent.emit(path + ':' + evt, arg1, arg2, arg3);
            that._parent.emit('*:' + evt, path, arg1, arg2, arg3);
            if (that._silent)
                that._parent.silenceRestore(state);
        };
    };
    Observer.prototype.destroy = function () {
        if (this._destroyed)
            return;
        this._destroyed = true;
        this.emit('destroy');
        this.unbind();
    };
    return Observer;
}(events_1.Events));
exports.Observer = Observer;
},{"./events":10}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tools = void 0;
var Tools = /** @class */ (function () {
    function Tools() {
    }
    Tools.eulerAngleToRadian = function (val) {
        var para = Math.PI / 180;
        return val.multiplyByFloats(para, para, para);
    };
    Tools.radianToEulerAngle = function (val) {
        var para = 180 / Math.PI;
        return val.multiplyByFloats(para, para, para);
    };
    Tools.vector3ToArray = function (val) {
        return [val.x, val.y, val.z];
    };
    return Tools;
}());
exports.Tools = Tools;
},{}],15:[function(require,module,exports){
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
var game_1 = require("./game");
var lib_1 = require("./lib");
__exportStar(require("./index"), exports);
var game;
var initFlag = false;
var dataLoaded = false;
var dataLoaded2 = false;
// let path1: string = '';
// let path2: string = '';
var datas;
// 添加到全局变量
window.editor = new lib_1.Editor();
// if (typeof String.prototype.startsWith != 'function') {
//     String.prototype.startsWith = function (prefix) {
//         return this.slice(0, prefix.length) === prefix;
//     };
// }
var projectID = window.location.pathname.substring(9);
/**
 * 初始化入口；
 */
function initGame() {
    var canvas = document.getElementById('renderCanvas');
    var fpsLabel = document.getElementById('fpsLabel');
    if (canvas !== null && fpsLabel !== null) {
        game = new game_1.Game(canvas, fpsLabel);
        game.createScene(datas).animate(); // 链式调用
    }
}
function runBtn() {
    if (game) {
        game.createScene(datas).animate();
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
function loadResources() {
    var projectID = window.location.pathname.substring(9);
    game_1.Config.projectID = projectID;
    // project data
    axios.post('/api/getProject', { projectID: game_1.Config.projectID })
        .then(function (response) {
        var data = response.data;
        if (data.code === '0000') {
            // console.log(data.data);
            game_1.Config.projectData = data.data;
            game_1.Config.projectName = data.data.project.name;
            game_1.Config.userID = data.data.owner.id;
            game_1.Config.username = data.data.owner.username;
            // 加载完assets数据再加载scene数据，便于解析scene过程中使用assets数据
            editor.call('getAssets');
            // document.title = Config.projectName + ' - 万维引擎';
            // editor.call('toolbar.project.set', Config.projectName);
        }
        else {
            console.error('load project data error: ' + data.message);
        }
    })
        .catch(function (error) {
        console.error('load project data error: ');
        console.error(error);
    });
    editor.method('getAssets', function () {
        // assets data
        axios.post('/api/getAssets', { projectID: game_1.Config.projectID })
            .then(function (response) {
            var data = response.data;
            if (data.code === '0000') {
                // console.log(data.data);
                game_1.Config.assetsData = data.data;
                game_1.BabylonLoader.assetsData = data.data;
                // editor.call('initAssets', Config.assetsData);
                // 加载完assets数据再加载scene数据，便于解析scene过程中使用assets数据
                editor.call('getScenes');
                // 加载表格判断
                if (data.data.assets) {
                    for (var key in data.data.assets) {
                        if (data.data.assets[key].type === 'table') {
                            game_1.Config.tableAssetsID = key;
                            game_1.Config.tableName = data.data.assets[key].name;
                        }
                    }
                }
                if (game_1.Config.tableAssetsID !== '') {
                    editor.call('loadTable');
                }
            }
            else {
                console.error(data.message);
            }
            // ep.emit('settings', response.data);
        })
            .catch(function (error) {
            console.error(error);
        });
    });
    editor.method('getScenes', function () {
        // scenes data
        axios.post('/api/getScenes', { projectID: game_1.Config.projectID })
            .then(function (response) {
            var data = response.data;
            if (data.code === '0000') {
                var lastScene = data.data.last;
                game_1.Config.scenesData = data.data.scenes[lastScene];
                game_1.Config.sceneIndex = lastScene;
                // console.log(Config.scenesData);
                dataLoaded2 = true;
                // editor.emit('scene:raw', Config.scenesData);
                // editor.call('toolbar.scene.set', Config.scenesData.name);
            }
            else {
                console.error(data.message);
            }
            // ep.emit('settings', response.data);
        })
            .catch(function (error) {
            console.error(error);
        });
    });
    editor.method('loadTable', function () {
        // 获取表格数据
        var path = window.location.href;
        var paramsData = {};
        paramsData['name'] = game_1.Config.tableName;
        paramsData['projectID'] = projectID;
        paramsData['id'] = game_1.Config.tableAssetsID;
        axios
            .get('/api/table/acquire', {
            params: paramsData,
        })
            .then(function (response) {
            var data = response.data;
            // console.log(data);
            if (data.code === '0000') {
                // 先将json转化为字符串
                var tempData = JSON.stringify(data.data);
                // 对字符串再进行反转义
                tempData = escape2Html(tempData);
                // 转化为json后，赋值给表格
                // hot1.loadData(JSON.parse(tempData).table);
                // console.log(JSON.parse(tempData).table);
                datas = JSON.parse(tempData).table;
                game_1.Config.tableData = datas;
                dataLoaded = true;
            }
            else {
                // Do nothing
                console.log('load not right: ' + data.message);
            }
        })
            .catch(function (error) {
            console.log('load error: ' + error);
        });
    });
}
loadResources();
function loadScene() {
    var sceneData;
    axios.post('/api/getScenes', { projectID: projectID })
        .then(function (response) {
        var data = response.data;
        if (data.code === '0000') {
            var lastScene = data.data.last;
            sceneData = data.data.scenes[lastScene];
            console.log(sceneData);
            document.title = sceneData.name + ' | 发布项目';
            // path1 = sceneData.path1;
            // path2 = sceneData.path2;
            // console.log('path1: ' + sceneData.path1);
            // console.log('path2: ' + sceneData.path2);
            // dataLoaded2 = true;
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
// loadScene();
// function loadData(): void {
// }
// loadData();
//HTML标签转义（< -> &lt;）
function html2Escape(sHtml) {
    var temp = document.createElement('div');
    temp.textContent != null
        ? (temp.textContent = sHtml)
        : (temp.innerText = sHtml);
    var output = temp.innerHTML;
    temp = null;
    return output;
}
//HTML标签反转义（&lt; -> <）
function escape2Html(str) {
    var temp = document.createElement('div');
    temp.innerHTML = str;
    var output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}
// 关联按钮
// document.getElementById('runButton')!.addEventListener('click', runBtn);
// // 关联按钮
// document.getElementById('debugButton')!.addEventListener('click', toggleDebug);
// 启动引擎
// 第一次启动时，先异步加载数据后再初始化，后期可以直接点击按钮进行加载；
init();
// loadData2()
//   .then(function (hot: HandTable) {
//     console.log(hot.getData());
//   }
//   );
},{"./game":4,"./index":7,"./lib":12}]},{},[15])

//# sourceMappingURL=publish.js.map
