import { VeryEngine } from '../../engine';
import { Observer } from '../../lib';
import { BabylonLoader } from '../middleware/loader/babylonLoader';
import { AjaxRequest, Ajax, Tools } from '../utility';

export class ViewportApplication {




    public constructor() {

        // entities indexes for parenting
        var childIndex: { [key: string]: any } = {};
        var entitiesIndex: { [key: string]: any } = {};
        var unknowns = {};

        editor.method('create:scene:element', (entity: Observer) => {
            // console.log('create scene element');
            // console.error(entity);
            if (entity.get('type') === 'light') {
                // Lights
                var light = BABYLON.Light.Parse(entity.get('data'), VeryEngine.viewScene);
                if (light) {
                    entitiesIndex[entity.get('resource_id')] = light;
                    entity.node = light;
                    light.id = entity.get('resource_id');
                    childAndParent(entity, light);
                    // (<BABYLON.ShadowLight>light)
                    // console.warn(light);
                } else {
                    console.error('light创建失败，light原始信息：');
                    console.error(entity.get('data'));
                }
            } else if (entity.get('type') === 'camera') {
                // TODO: camera要特别处理
                // Cameras
                // var camera = BABYLON.Camera.Parse(entity.get('data'), VeryEngine.viewScene);
                // camera.attachControl(VeryEngine.viewCanvasElement);
                // entity.node = camera;
                // entitiesIndex[entity.get('resource_id')] = camera;
                // camera!.id = entity.get('resource_id');
                // childAndParent(entity, camera);
                // console.warn(camera);
            } else if (entity.get('type') === 'box') {
                // box
                var box = BABYLON.Mesh.CreateBox(entity.get('name'), 1, VeryEngine.viewScene);
                entity.node = box;
                entitiesIndex[entity.get('resource_id')] = box;
                box.id = entity.get('resource_id');
                box.position = BABYLON.Vector3.FromArray(entity.get('position'));
                box.rotation = Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(entity.get('rotation')));
                box.scaling = BABYLON.Vector3.FromArray(entity.get('scale'));
                box.isEnabled(entity.get('enabled'));
                box.checkCollisions = entity.get('checkCollisions');
                box.isVisible = entity.get('isVisible');
                // 加载自定义关联材质
                if (entity.get('material_id')) {

                }
                childAndParent(entity, box);
                // console.warn(box);
            } else if (entity.get('type') === 'mesh') {
                // 模型异步加载，因为mesh需要先加载.babylon文件；
                // console.warn('scene创建mesh：' + entity.get('name'));
                editor.call('scene:mesh:create', entity);
            }



        });


        let childAndParent = (entity: Observer, node: Nullable<BABYLON.Node>) => {
            // children
            let children = entity.get('children');
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
            } else {
                // child
                var details = childIndex[entity.get('resource_id')];
                if (details && details.parent) {
                    insertChild(details.parent, node, details.index);
                }
            }
        }

        let insertChild = (parent: Nullable<BABYLON.Node>, node: Nullable<BABYLON.Node>, index: number) => {
            // try to insert the node at the right index
            // 但是babylon不支持直接操作children列表，_children为private类型，可以通过修改.d.ts文件获取，但是也没必要；
            if (node !== null) {
                node.parent = parent;
            }

            // for (var i = 0, len = parent._children.length; i < len; i++) {
            //     var child = parent._children[i];
            //     if (child instanceof pc.Entity && childIndex[child.getGuid()]) {
            //         // if our index is less than this child's index
            //         // then put the item here
            //         if (index < childIndex[child.getGuid()].index) {
            //             parent.insertChild(node, i);
            //             return;
            //         }
            //     }
            // }

            // // the node can be safely added to the end of the child list
            // parent.addChild(node);
        }



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
                            // BabylonLoader.parseBabylon(assetID, data);
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


        let assembleSceneMesh = (entity: Observer, parsedBabylon: any) => {
            // TODO: 暂时未考虑TransformNode数据的情况
            if (parsedBabylon) {
                let assetID: string = entity.get('asset_id');
                // 先从.babylon提取原始mesh数据
                let meshID: string = entity.get('babylon_id');
                if (parsedBabylon.meshes[meshID]) {
                    let meshData = parsedBabylon.meshes[meshID];
                    // 结合scene和babylon数据，更新mesh信息
                    meshData.position = entity.has('position') && entity.get('position') ? entity.get('position') : meshData.position;
                    let recordRotation = entity.get('rotation');
                    if(recordRotation && recordRotation.length > 0) {
                        recordRotation = Tools.vector3ToArray(Tools.eulerAngleToRadian(BABYLON.Vector3.FromArray(recordRotation)));
                    } else {
                        recordRotation = meshData.rotation;
                    }
                    meshData.rotation = recordRotation;
                    meshData.scale = entity.has('scale') && entity.get('scale') ? entity.get('scale') : meshData.scal;
                    meshData.name = entity.has('name') && entity.get('name') ? entity.get('name') : meshData.name;
                    meshData.id = entity.has('resource_id') && entity.get('resource_id') ? entity.get('resource_id') : meshData.id;
                    meshData.isEnabled = entity.has('enabled') ? entity.get('enabled') : meshData.isEnabled;
                    meshData.isVisible = entity.has('isVisible') ? entity.get('isVisible') : meshData.isVisible;
                    // meshData.pickable = entity.has('pickable') ? entity.get('pickable') : meshData.pickable;
                    // TODO：scene编辑条件下默认就是加载状态；
                    meshData.pickable = true;
                    meshData.checkCollisions = entity.has('checkCollisions') ? entity.get('checkCollisions') : meshData.checkCollisions;
                    meshData.materialId = entity.has('material_id') ? entity.get('material_id') : meshData.materialId;
                    // 要注意是否为root id
                    meshData.parentId = entity.has('parent') ? entity.get('parent') : meshData.parentId;


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
                    // console.error(meshData.materialId);
                    if (meshData.materialId) {
                        if (VeryEngine.viewScene.getMaterialByID(meshData.materialId) === null) {
                            // console.error(BabylonLoader.assetsData.babylon[assetID]);
                            if (BabylonLoader.assetsData.babylon[assetID]) {
                                let mats = BabylonLoader.assetsData.babylon[assetID]['materials'];
                                if (mats && mats[meshData.materialId]) {
                                    let matAssetID = mats[meshData.materialId].asset_id;
                                    if (BabylonLoader.assetsData.assets[matAssetID]) {
                                        let newMat = BabylonLoader.assetsData.assets[matAssetID].data;

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
                                        // console.error(newMat);
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
                    entity.node = mesh;
                    entitiesIndex[entity.get('resource_id')] = mesh;
                    childAndParent(entity, mesh);
                } else {
                    console.warn('scene mesh warn');
                }
            }
        }

    }



}