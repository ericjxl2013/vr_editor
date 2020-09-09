import { VeryEngine } from '../../engine';
import { Observer } from '../../lib';
import { BabylonLoader } from '../middleware/loader/babylonLoader';
import { AjaxRequest, Ajax } from '../utility';

export class ViewportApplication {




    public constructor() {


        editor.method('create:scene:element', (entity: Observer) => {
            // console.log('create scene element');
            // console.error(entity);
            if (entity.get('type') === 'light') {
                // Lights
                var light = BABYLON.Light.Parse(entity.get('data'), VeryEngine.viewScene);
                entity.node = light;
                console.warn(light);
            } else if (entity.get('type') === 'camera') {
                // Cameras
                // var camera = BABYLON.Camera.Parse(entity.get('data'), VeryEngine.viewScene);
                // camera.attachControl(VeryEngine.viewCanvasElement);
                // console.warn(camera);
            } else if (entity.get('type') === 'box') {
                // box
                var box = BABYLON.MeshBuilder.CreateBox(entity.get('name'), { size: 1 }, VeryEngine.viewScene);
                entity.node = box;
                // VeryEngine.viewScene.activeCamera = camera;
                console.warn(box);
            } else if (entity.get('type') === 'mesh') {
                // 模型异步加载，因为mesh需要先加载.babylon文件；
                console.warn('scene创建mesh：' + entity.get('name'));
                editor.call('scene:mesh:create', entity);

            }




        });



        editor.method('scene:mesh:create', (entity: Observer) => {

            loadBabylon(entity);


            // // 变成异步事件
            // setTimeout(() => { }, 0);
        });


        let loadingBabylonFlag: { [key: string]: boolean } = {};
        let toLoadEntity: { [key: string]: Observer[] } = {};
        let loadBabylon = (entity: Observer) => {
            let assetID: string = entity.get('asset_id');
            let dataBabylon: any = null;

            if (BabylonLoader.hasBabylobData(assetID)) {
                dataBabylon = BabylonLoader.getParsedBabylonData(assetID);
                // BabylonLoader.assembleBabylon(assetID, dataBabylon);
                // 关联mesh
                assembleSceneMesh(entity, dataBabylon);
            } else {
                if (assetID in loadingBabylonFlag) {
                    toLoadEntity[assetID].push(entity);
                } else {
                    loadingBabylonFlag[assetID] = true;
                    toLoadEntity[assetID] = [entity];

                    var data1 = {
                        url: BabylonLoader.prefix + assetID + '/' + BabylonLoader.assetsData.assets[assetID].name,
                        method: 'GET',
                        // auth: true,
                        data: null,
                        ignoreContentType: true,
                        // headers: {
                        //     Accept: 'application/json'
                        // }
                    };
                    // 直接返回babylon json格式内容数据
                    (<AjaxRequest>new Ajax(data1))
                        .on('load', (status: any, data: any) => {

                            dataBabylon = data;
                            BabylonLoader.babylonCacheData[assetID] = dataBabylon;
                            BabylonLoader.parseBabylon(assetID, data);

                            BabylonLoader.parseBabylon(assetID, data);
                            dataBabylon = BabylonLoader.getParsedBabylonData(assetID);
                            toLoadEntity[assetID].forEach((item: Observer) => {
                                assembleSceneMesh(item, dataBabylon);
                            });
                            // 关联mesh
                        }).on('error', (evt: any) => {
                            console.error('scene数据匹配babylon mesh数据错误！');
                            console.error(evt);
                        });;
                }
            }
        }


        let assembleSceneMesh = (asset: Observer, parsedBabylon: any) => {
            // TODO: 暂时未考虑TransformNode数据的情况
            if (parsedBabylon) {
                let assetID: string = asset.get('asset_id');
                // 先从.babylon提取原始mesh数据
                let meshID: string = asset.get('babylon_id');
                if (parsedBabylon.meshes[meshID]) {
                    let meshData = parsedBabylon.meshes[meshID];
                    // 结合scene和babylon数据，更新mesh信息
                    meshData.position = asset.has('position') && asset.get('position') ? asset.get('position') : meshData.position;
                    meshData.rotation = asset.has('rotation') && asset.get('rotation') ? asset.get('rotation') : meshData.rotation;
                    meshData.scale = asset.has('scale') && asset.get('scale') ? asset.get('scale') : meshData.scal;
                    meshData.name = asset.has('name') && asset.get('name') ? asset.get('name') : meshData.name;
                    meshData.id = asset.has('resource_id') && asset.get('resource_id') ? asset.get('resource_id') : meshData.id;
                    meshData.isEnabled = asset.has('enabled') ? asset.get('enabled') : meshData.isEnabled;
                    meshData.isVisible = asset.has('isVisible') ? asset.get('isVisible') : meshData.isVisible;
                    meshData.isPickable = asset.has('isPickable') ? asset.get('isPickable') : meshData.isPickable;
                    meshData.checkCollisions = asset.has('checkCollisions') ? asset.get('checkCollisions') : meshData.checkCollisions;
                    meshData.materialId = asset.has('material_id') ? asset.get('material_id') : meshData.materialId;
                    // 要注意是否为root id
                    meshData.parentId = asset.has('parent') ? asset.get('parent') : meshData.parentId;


                    // 判断是否关联了geometry
                    if (meshData.geometryId) {
                        if (VeryEngine.viewScene.getGeometryByID(meshData.geometryId) === null) {
                            if (parsedBabylon.geometries && parsedBabylon.geometries[meshData.geometryId]) {
                                let vertexData = parsedBabylon.geometries[meshData.geometryId];
                                BabylonLoader.loadGeometry(vertexData, VeryEngine.viewScene, '');
                            }
                        }
                    }
                    // 组装material
                    console.error(meshData.materialId);
                    if (meshData.materialId) {
                        if (VeryEngine.viewScene.getMaterialByID(meshData.materialId) === null) {
                            console.error(BabylonLoader.assetsData.babylon[assetID]);
                            if (BabylonLoader.assetsData.babylon[assetID]) {
                                let mats = BabylonLoader.assetsData.babylon[assetID]['materials'];
                                if (mats && mats[meshData.materialId]) {
                                    let matAssetID = mats[meshData.materialId].asset_id;
                                    if (BabylonLoader.assetsData.assets[matAssetID]) {
                                        let newMat = BabylonLoader.assetsData.assets[matAssetID].data;
                                        
                                        // 检测texture
                                        if (newMat.diffuseTexture && newMat.diffuseTexture.texture_id) {
                                            newMat.diffuseTexture.name = BabylonLoader.prefix + newMat.diffuseTexture.texture_id + '/' + BabylonLoader.assetsData.assets[newMat.diffuseTexture.texture_id].name;
                                            console.warn(newMat.diffuseTexture.name);
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
                                        console.error(newMat);
                                        BabylonLoader.loadMaterial(newMat, VeryEngine.viewScene, '');
                                    } else {
                                        console.warn('scene mesh warn');
                                    }
                                }
                            } else {
                                console.warn('scene mesh warn');
                            }
                        }
                    }

                    // 加载mesh
                    let mesh = BabylonLoader.loadMesh(meshData, VeryEngine.viewScene, '');
                    asset.node = mesh;
                } else {
                    console.warn('scene mesh warn');
                }
            }
        }

    }



}