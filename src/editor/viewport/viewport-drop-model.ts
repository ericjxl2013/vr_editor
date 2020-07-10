import { Observer } from "../../lib";
import { VeryEngine } from "../../engine";
import { GizmosManager } from "../toolbar";

export class ViewportDropModel {


    public constructor() {


        editor.method("loadTempModel", (babylon_data: Observer) => {
            console.log("加载模型");
            console.log(babylon_data);
            var rootUrl = babylon_data.get("file.url");
            var modelName = babylon_data.get("file.filename");
            rootUrl = rootUrl.substring(0, rootUrl.length - modelName.length);

            BABYLON.SceneLoader.Append(rootUrl, modelName, VeryEngine.viewScene, function (scene) {

                // console.log("************mesh个数：" + scene.meshes.length);
                for (let i = 0; i < scene.meshes.length; i++) {
                    let mesh = scene.meshes[i];
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;
                    let parentID: string = "";
                    if (mesh.parent !== null) {
                        parentID = mesh.parent!.id;
                    }

                    var childs = mesh.getChildren();
                    var myChildren = [];

                    for (let k = 0; k < childs.length; k++) {
                        myChildren.push(childs[k].id);
                    }

                    let data = {
                        name: mesh.name,
                        resource_id: mesh.id,
                        parent: parentID,
                        position: [mesh.position.x, mesh.position.y, mesh.position.z],
                        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                        scale: [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z],
                        children: myChildren,
                        enabled: mesh.isEnabled(),
                        tags: [],
                        root: false,
                        type: "Mesh",
                        asset: rootUrl,
                        asset2: modelName
                    }
                    // console.log(scene.meshes[i].id + " : " + scene.meshes[i].name);
                    // console.error(data);
                    editor.call("entity:new:babylon", data);
                }

                for (let i = 0; i < scene.transformNodes.length; i++) {
                    let node = scene.transformNodes[i];
                    let parentID: string = "";
                    if (node.parent !== null) {
                        parentID = node.parent!.id;
                    }

                    let data = {
                        name: node.name,
                        resource_id: node.id,
                        parent: parentID,
                        position: [node.position.x, node.position.y, node.position.z],
                        rotation: [node.rotation.x, node.rotation.y, node.rotation.z],
                        scale: [node.scaling.x, node.scaling.y, node.scaling.z],
                        children: myChildren,
                        enabled: node.isEnabled(),
                        tags: [],
                        root: false,
                        type: "TransformNode",
                        asset: rootUrl,
                        asset2: modelName
                    }
                    // console.log(scene.meshes[i].id + " : " + scene.meshes[i].name);
                    editor.call("entity:new:babylon", data);
                }

                // console.error("加载");

                editor.emit('entities:load', true);

                // console.log("************node个数：" + scene.transformNodes.length);
                // for(let i = 0; i < scene.transformNodes.length; i++) {
                //     console.log(scene.transformNodes[i].id + " : " + scene.transformNodes[i].name);
                // }
                // console.log("************root个数：" + scene.rootNodes.length);
                // for(let i = 0; i < scene.rootNodes.length; i++) {
                //     console.log(scene.rootNodes[i].id + " : " + scene.rootNodes[i].name);
                // }


                scene.onPointerObservable.add(pointerInfo => {
                    switch (pointerInfo.type) {
                        case BABYLON.PointerEventTypes.POINTERDOWN:
                            // console.log("down");
                            if (pointerInfo!.pickInfo!.pickedMesh != null) {
                                editor.call("pick", pointerInfo!.pickInfo!.pickedMesh);
                            } else {
                                editor.call("pick", null);
                            }
                            // console.log(pointerInfo!.pickInfo!.pickedMesh);
                            break;
                    }


                });
            });

            // 默认加载

            // editor.method("entity:new:mesh", )

        });


        editor.method("pick", (mesh: Nullable<BABYLON.AbstractMesh>) => {
            if (mesh === null) {
                GizmosManager.clear();
            } else {
                GizmosManager.attach(mesh);
                var entity = editor.call('entities:get', mesh.id);
                if (entity) {
                    editor.call('selector:set', 'entity', [entity]);
                } else {
                    console.error("失败");
                }

            }

        });


        editor.method("loadTempModel2", (rootUrl: string, modelName: string) => {

            BABYLON.SceneLoader.Append(rootUrl, modelName, VeryEngine.viewScene, function (scene) {
                // console.error("加载2");

                // console.log("************mesh个数：" + scene.meshes.length);
                for (let i = 0; i < scene.meshes.length; i++) {
                    let mesh = scene.meshes[i];
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;

                    var entity = editor.call('entities:get', mesh.id);
                    if (entity) {
                        entity.node = mesh;
                    }
                    // let parentID: string = "";
                    // if (mesh.parent !== null) {
                    //     parentID = mesh.parent!.id;
                    // }

                    // var childs = mesh.getChildren();
                    // var myChildren = [];

                    // for (let k = 0; k < childs.length; k++) {
                    //     myChildren.push(childs[k].id);
                    // }

                    // let data = {
                    //     name: mesh.name,
                    //     resource_id: mesh.id,
                    //     parent: parentID,
                    //     position: [mesh.position.x, mesh.position.y, mesh.position.z],
                    //     rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                    //     scale: [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z],
                    //     children: myChildren,
                    //     enabled: mesh.isEnabled(),
                    //     tags: [],
                    //     root: false,
                    //     type: "Mesh",
                    //     asset: rootUrl,
                    //     asset2: modelName
                    // }
                    // // console.log(scene.meshes[i].id + " : " + scene.meshes[i].name);
                    // // console.error(data);
                    // editor.call("entity:new:babylon", data);
                }

                for (let i = 0; i < scene.transformNodes.length; i++) {
                    let node = scene.transformNodes[i];
                    let parentID: string = "";
                    if (node.parent !== null) {
                        parentID = node.parent!.id;
                    }

                    var entity = editor.call('entities:get', node.id);
                    if (entity) {
                        entity.node = node;
                    }
                    // let data = {
                    //     name: node.name,
                    //     resource_id: node.id,
                    //     parent: parentID,
                    //     position: [node.position.x, node.position.y, node.position.z],
                    //     rotation: [node.rotation.x, node.rotation.y, node.rotation.z],
                    //     scale: [node.scaling.x, node.scaling.y, node.scaling.z],
                    //     children: myChildren,
                    //     enabled: node.isEnabled(),
                    //     tags: [],
                    //     root: false,
                    //     type: "TransformNode",
                    //     asset: rootUrl,
                    //     asset2: modelName
                    // }
                    // // console.log(scene.meshes[i].id + " : " + scene.meshes[i].name);
                    // editor.call("entity:new:babylon", data);
                }


                // editor.emit('entities:load', true);

                // console.log("************node个数：" + scene.transformNodes.length);
                // for(let i = 0; i < scene.transformNodes.length; i++) {
                //     console.log(scene.transformNodes[i].id + " : " + scene.transformNodes[i].name);
                // }
                // console.log("************root个数：" + scene.rootNodes.length);
                // for(let i = 0; i < scene.rootNodes.length; i++) {
                //     console.log(scene.rootNodes[i].id + " : " + scene.rootNodes[i].name);
                // }


                scene.onPointerObservable.add(pointerInfo => {
                    switch (pointerInfo.type) {
                        case BABYLON.PointerEventTypes.POINTERDOWN:
                            // console.log("down");
                            if (pointerInfo!.pickInfo!.pickedMesh != null) {
                                editor.call("pick", pointerInfo!.pickInfo!.pickedMesh);
                            } else {
                                editor.call("pick", null);
                            }
                            // console.log(pointerInfo!.pickInfo!.pickedMesh);
                            break;
                    }


                });
            });



        });

    }
}