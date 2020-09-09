import { Observer } from "src/lib";

export class ViewportEntitiesObserverBinding {



    public constructor() {
        editor.on('entities:add', function (obj: Observer) {
            // subscribe to changes
            obj.on('*:set', function (path: string, value: any) {
                var entity = obj.entity;
                if (!entity)
                    return;

                if (path === 'name') {
                    entity.name = obj.get('name');

                } else if (path.startsWith('position')) {
                    entity.transform.localPosition = new BABYLON.Vector3(obj.get('position.0'), obj.get('position.1'), obj.get('position.2'));

                } else if (path.startsWith('rotation')) {
                    entity.transform.localEulerAngles = new BABYLON.Vector3(obj.get('rotation.0'), obj.get('rotation.1'), obj.get('rotation.2'));

                } else if (path.startsWith('scale')) {
                    entity.transform.localScale = new BABYLON.Vector3(obj.get('scale.0'), obj.get('scale.1'), obj.get('scale.2'));

                } else if (path.startsWith('enabled')) {
                    entity.setActive(obj.get('enabled'));

                } else if (path.startsWith('parent')) {
                    var parent = editor.call('entities:get', obj.get('parent'));
                    // TODO
                    // if (parent && parent.entity && entity.transform.parent !== parent.entity)
                        // entity.reparent(parent.entity);
                } else if (path === 'components.model.type' && value === 'asset') {
                    // WORKAROUND
                    // entity deletes asset when switching to primitive, restore it
                    // do this in a timeout to allow the model type to change first
                    setTimeout(function () {
                        var assetId = obj.get('components.model.asset');
                        // if (assetId)
                        //     entity.model.asset = assetId;
                    });
                }

                // render
                editor.call('viewport:render');
            });

            // TODO
            var reparent = function (child: string, index: number) {
                var childEntity = editor.call('entities:get', child);
                if (childEntity && childEntity.entity && obj.entity) {
                    var oldParent = childEntity.entity.parent;

                    if (oldParent)
                        oldParent.removeChild(childEntity.entity);

                    // skip any graph nodes
                    if (index > 0) {
                        var children = obj.entity.transform.children;
                        for (var i = 0, len = children.length; i < len && index > 0; i++) {
                            if (children[i] instanceof BABYLON.Node) {
                                index--;
                            }
                        }

                        index = i;
                    }

                    // re-insert TODO
                    // obj.entity.insertChild(childEntity.entity, index);

                    // persist the positions and sizes of elements if they were previously
                    // under control of a layout group but have now been reparented
                    if (oldParent && oldParent.layoutgroup) {
                        editor.call('entities:layout:storeLayout', [childEntity.entity.getGuid()]);
                    }
                }
            };

            obj.on('children:insert', reparent);
            obj.on('children:move', reparent);

            obj.on('destroy', function () {
                if (obj.entity) {
                    obj.entity.transform.destroy();
                    editor.call('viewport:render');
                }
            });
        });

        editor.on('entities:remove', function (obj: Observer) {
            var entity = obj.entity;
            if (!entity)
                return;

            entity.transform.destroy();
            editor.call('viewport:render');
        });


    }




}