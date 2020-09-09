import { Panel, Button, Menu, MenuItem } from '../../ui';
import { Observer } from '../../lib';

export class AttributesEntity {




    public constructor() {

        var panelComponents: any;

        editor.method('attributes:entity.panelComponents', function () {
            return panelComponents;
        });

        // add component menu
        // var menuAddComponent = new Menu();
        // var components = editor.call('components:schema');
        // var list = editor.call('components:list');
        // for (var i = 0; i < list.length; i++) {
        //     menuAddComponent.append(new MenuItem({
        //         text: components[list[i]].$title,
        //         value: list[i]
        //     }));
        // }
        // menuAddComponent.on('open', function () {
        //     var items = editor.call('selector:items');

        //     var legacyAudio = editor.call('settings:project').get('useLegacyAudio');
        //     for (var i = 0; i < list.length; i++) {
        //         var different = false;
        //         var disabled = items[0].has('components.' + list[i]);

        //         for (var n = 1; n < items.length; n++) {
        //             if (disabled !== items[n].has('components.' + list[i])) {
        //                 var different = true;
        //                 break;
        //             }
        //         }
        //         menuAddComponent.findByPath([list[i]])!.disabled = different ? false : disabled;

        //         if (list[i] === 'audiosource')
        //             menuAddComponent.findByPath([list[i]])!.hidden = !legacyAudio;
        //     }
        // });
        // menuAddComponent.on('select', function (path) {
        //     var items = editor.call('selector:items');
        //     var component = path[0];
        //     editor.call('entities:addComponent', items, component);
        // });
        // editor.call('layout.root').append(menuAddComponent);





        var items: any = null;
        var argsList: any = [];
        var argsFieldsChanges: any = [];


        // initialize fields
        var initialize = function () {
            items = {};

            // panel
            var panel = items.panel = editor.call('attributes:addPanel');
            panel.class.add('component');


            // enabled
            var argsEnabled = {
                parent: panel,
                // name: 'Enabled',
                name: '激活',
                type: 'checkbox',
                path: 'enabled'
            };
            items.fieldEnabled = editor.call('attributes:addField', argsEnabled);
            // TODO: 帮助文档链接
            // editor.call('attributes:reference:attach', 'entity:enabled', items.fieldEnabled.parent.innerElement.firstChild.ui);
            argsList.push(argsEnabled);
            argsFieldsChanges.push(items.fieldEnabled);


            // name
            var argsName = {
                parent: panel,
                name: '名字',
                // name: 'Name',
                type: 'string',
                trim: true,
                path: 'name'
            };
            items.fieldName = editor.call('attributes:addField', argsName);
            items.fieldName.class.add('entity-name');
            // editor.call('attributes:reference:attach', 'entity:name', items.fieldName.parent.innerElement.firstChild.ui);
            argsList.push(argsName);
            argsFieldsChanges.push(items.fieldName);


            // tags
            // var argsTags = {
            //     parent: panel,
            //     name: 'Tags',
            //     placeholder: 'Add Tag',
            //     type: 'tags',
            //     tagType: 'string',
            //     path: 'tags'
            // };
            // items.fieldTags = editor.call('attributes:addField', argsTags);
            // // editor.call('attributes:reference:attach', 'entity:tags', items.fieldTags.parent.parent.innerElement.firstChild.ui);
            // argsList.push(argsTags);


            // position
            var argsPosition = {
                parent: panel,
                name: '位置',
                // name: 'Position',
                placeholder: ['X', 'Y', 'Z'],
                precision: 3,
                step: 0.05,
                type: 'vec3',
                path: 'position'
            };
            items.fieldPosition = editor.call('attributes:addField', argsPosition);
            // editor.call('attributes:reference:attach', 'entity:position', items.fieldPosition[0].parent.innerElement.firstChild.ui);
            argsList.push(argsPosition);
            argsFieldsChanges = argsFieldsChanges.concat(items.fieldPosition);

            // rotation
            var argsRotation = {
                parent: panel,
                name: '角度',
                // name: 'Rotation',
                placeholder: ['X', 'Y', 'Z'],
                precision: 2,
                step: 0.1,
                type: 'vec3',
                path: 'rotation'
            };
            items.fieldRotation = editor.call('attributes:addField', argsRotation);
            // editor.call('attributes:reference:attach', 'entity:rotation', items.fieldRotation[0].parent.innerElement.firstChild.ui);
            argsList.push(argsRotation);
            argsFieldsChanges = argsFieldsChanges.concat(items.fieldRotation);


            // scale
            var argsScale = {
                parent: panel,
                name: '比例',
                // name: 'Scale',
                placeholder: ['X', 'Y', 'Z'],
                precision: 3,
                step: 0.05,
                type: 'vec3',
                path: 'scale'
            };
            items.fieldScale = editor.call('attributes:addField', argsScale);
            // editor.call('attributes:reference:attach', 'entity:scale', items.fieldScale[0].parent.innerElement.firstChild.ui);
            argsList.push(argsScale);
            argsFieldsChanges = argsFieldsChanges.concat(items.fieldScale);


            // components panel
            panelComponents = items.panelComponents = editor.call('attributes:addPanel');

            // add component
            var btnAddComponent = items.btnAddComponent = new Button();

            // btnAddComponent.hidden = !editor.call('permissions:write');
            // editor.on('permissions:writeState', function (state: boolean) {
            //     btnAddComponent.hidden = !state;
            // });

            // btnAddComponent.text = 'Add Component';
            btnAddComponent.text = 'To Be Continued';
            btnAddComponent.class!.add('add-component');
            btnAddComponent.style!.textAlign = 'center';
            // btnAddComponent.on('click', function (evt: MouseEvent) {
            //     menuAddComponent.position(evt.clientX, evt.clientY);
            //     menuAddComponent.open = true;
            // });
            panel.append(btnAddComponent);
        };

        // before clearing inspector, preserve elements
        editor.on('attributes:beforeClear', function () {
            if (!items || !items.panel.parent)
                return;

            // remove panel from inspector
            items.panel.parent.remove(items.panel);

            // clear components
            items.panelComponents.parent.remove(items.panelComponents);
            items.panelComponents.clear();

            // unlink fields
            for (var i = 0; i < argsList.length; i++) {
                argsList[i].link = null;
                argsList[i].unlinkField();
            }
        });

        var inspectEvents: any = [];

        // link data to fields when inspecting
        editor.on('attributes:inspect[entity]', function (entities: Observer[]) {
            if (entities.length > 1) {
                editor.call('attributes:header', entities.length + '个物体');
            } else {
                editor.call('attributes:header', '物体属性');
            }

            if (!items)
                initialize();

            var root = editor.call('attributes.rootPanel');

            if (!items.panel.parent)
                root.append(items.panel);

            if (!items.panelComponents.parent)
                root.append(items.panelComponents);

            // disable renderChanges
            for (var i = 0; i < argsFieldsChanges.length; i++)
                argsFieldsChanges[i].renderChanges = false;

            // link fields
            for (var i = 0; i < argsList.length; i++) {
                argsList[i].link = entities;
                argsList[i].linkField();
            }

            // enable renderChanges
            for (var i = 0; i < argsFieldsChanges.length; i++)
                argsFieldsChanges[i].renderChanges = true;

            // disable fields if needed
            toggleFields(entities);

            onInspect(entities);
        });

        editor.on('attributes:clear', function () {
            onUninspect();
        });

        var toggleFields = function (selectedEntities: Observer[]) {
            var disablePositionXY = false;
            var disableRotation = false;
            var disableScale = false;

            for (var i = 0, len = selectedEntities.length; i < len; i++) {
                var entity = selectedEntities[i];

                // disable rotation / scale for 2D screens
                if (entity.get('components.screen.screenSpace')) {
                    disableRotation = true;
                    disableScale = true;
                }

                // disable position on the x/y axis for elements that are part of a layout group
                if (editor.call('entities:layout:isUnderControlOfLayoutGroup', entity)) {
                    disablePositionXY = true;
                }
            }

            items.fieldPosition[0].enabled = !disablePositionXY;
            items.fieldPosition[1].enabled = !disablePositionXY;

            for (var i = 0; i < 3; i++) {
                items.fieldRotation[i].enabled = !disableRotation;
                items.fieldScale[i].enabled = !disableScale;

                items.fieldRotation[i].renderChanges = !disableRotation;
                items.fieldScale[i].renderChanges = !disableScale;
            }

        };

        var onInspect = function (entities: Observer[]) {
            onUninspect();

            var addEvents = function (entity: Observer) {
                inspectEvents.push(entity.on('*:set', function (path: string) {
                    if (/components.screen.screenSpace/.test(path) ||
                        /^parent/.test(path) ||
                        /components.layoutchild.excludeFromLayout/.test(path)) {
                        toggleFieldsIfNeeded(entity);
                    }
                }));
            };

            var toggleFieldsIfNeeded = function (entity: Observer) {
                if (editor.call('selector:has', entity))
                    toggleFields(editor.call('selector:items'));
            };


            for (var i = 0, len = entities.length; i < len; i++) {
                addEvents(entities[i]);
            }
        };

        var onUninspect = function () {
            for (var i = 0; i < inspectEvents.length; i++) {
                inspectEvents[i].unbind();
            }

            inspectEvents.length = 0;

        };


    }

}