import { Observer } from '../../lib';
import { GUID } from '../utility';

export class EntityCreate {


    public constructor() {

        var createNewEntityData = function (defaultData: any, parentResourceId: string) {
            var entityData = {
                name: defaultData.name || '空物体',
                tags: [],
                enabled: true,
                resource_id: defaultData.resource_id || GUID.create(),
                parent: parentResourceId,
                children: Array<string>(),
                position: defaultData.position || [0, 0, 0],
                rotation: defaultData.rotation || [0, 0, 0],
                scale: defaultData.scale || [1, 1, 1],
                // components: defaultData.components || {},
                // __postCreationCallback: defaultData.postCreationCallback,
                root: false,
                type: defaultData.type,
                asset: defaultData.asset || ''
            };

            // if (defaultData.children) {
            //     for (var i = 0; i < defaultData.children.length; i++) {
            //         var childEntityData = createNewEntityData(defaultData.children[i], entityData.resource_id);
            //         entityData.children.push(childEntityData);
            //     }
            // }

            return entityData;
        };


        editor.method('entity:new:babylon', (defaultData: any) => {
            defaultData = defaultData || {};
            // var parent = defaultData.parent;
            // var parent = editor.call('entities:root');

            // if (parent === '' || parent === undefined) {
            //     parent = editor.call('entities:root').get('resource_id');
            // }

            // console.log(editor.call('entities:root'));
            // console.log(defaultData.parent);
            // console.log(defaultData);

            // var data = createNewEntityData(defaultData, parent.get('resource_id'));

            // create new Entity data
            var entity = new Observer(defaultData);

            editor.call('entities:add', entity);
            // editor.call('entities:addEntity', entity, parent, !defaultData.noSelect);

            return entity;
        });

        editor.method('entities:new', function (defaultData: any) {
            // get root if parent is null
            defaultData = defaultData || {};
            // var parent = defaultData.parent || editor.call('entities:root');
            
            // TODO: 一堆mesh过来，有的创建了，有的没创建怎么办
            var parent = editor.call('entities:get', defaultData.parent) || editor.call('entities:root');

            // var data = createNewEntityData(defaultData, parent.get('resource_id'));

            var selectorType: string, selectorItems: Observer[];

            if (!defaultData.noHistory) {
                selectorType = editor.call('selector:type');
                selectorItems = editor.call('selector:items');
                if (selectorType === 'entity') {
                    for (var i = 0; i < selectorItems.length; i++)
                        selectorItems[i] = selectorItems[i].get('resource_id');
                }
            }

            // create new Entity data
            console.error(defaultData);
            var entity = new Observer(defaultData);
            
            editor.call('entities:addEntity', entity, parent, !defaultData.noSelect);
            console.error(entity);
            // history
            if (!defaultData.noHistory) {
                var resourceId = entity.get('resource_id');
                var parentId = parent.get('resource_id');

                editor.call('history:add', {
                    name: 'new entity ' + resourceId,
                    undo: function () {
                        var entity = editor.call('entities:get', resourceId);
                        if (!entity)
                            return;

                        editor.call('entities:removeEntity', entity);

                        if (selectorType === 'entity' && selectorItems.length) {
                            var items = [];
                            for (var i = 0; i < selectorItems.length; i++) {
                                var item = editor.call('entities:get', selectorItems[i]);
                                if (item)
                                    items.push(item);
                            }

                            if (items.length) {
                                editor.call('selector:history', false);
                                editor.call('selector:set', selectorType, items);
                                editor.once('selector:change', function () {
                                    editor.call('selector:history', true);
                                });
                            }
                        }
                    },
                    redo: function () {
                        var parent = editor.call('entities:get', parentId);
                        if (!parent)
                            return;

                        // var entity = new Observer(data);
                        var entity = new Observer(defaultData);
                        editor.call('entities:addEntity', entity, parent, true);
                    }
                });
            }

            return entity;
        });

    }



}