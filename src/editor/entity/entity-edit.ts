import { Observer } from "../../lib";

export class EntityEdit {


    public constructor() {

        var childToParent: any = {};

        var addEntity = function (entity: Observer, parent: Observer, select: boolean, ind: number, entityReferencesMap: any) {
            entityReferencesMap = entityReferencesMap || {};

            ind = ind || 0;

            childToParent[entity.get('resource_id')] = parent.get('resource_id');

            var children = entity.get('children');
            if (children.length)
                entity.set('children', []);

            // call add event
            editor.call('entities:add', entity);

            console.error(entity);

            // shareDb
            // editor.call('realtime:scene:op', {
            //     p: ['entities', entity.get('resource_id')],
            //     oi: entity.origin
            // });

            // this is necessary for the entity to be added to the tree view
            // parent.history.enabled = false;
            // parent.insert('children', entity.get('resource_id'), ind);
            // parent.history.enabled = true;

            // if (select) {
            //     setTimeout(function () {
            //         editor.call('selector:history', false);
            //         editor.call('selector:set', 'entity', [entity]);
            //         editor.once('selector:change', function () {
            //             editor.call('selector:history', true);
            //         });
            //     }, 0);
            // }

            // add children too
            // children.forEach(function (childIdOrData) {
            //     var data;

            //     // If we've been provided an id, we're re-creating children from the deletedCache
            //     if (typeof childIdOrData === 'string') {
            //         data = deletedCache[childIdOrData];
            //         if (!data) {
            //             return;
            //         }
            //         // If we've been provided an object, we're creating children for a new entity
            //     } else if (typeof childIdOrData === 'object') {
            //         data = childIdOrData;
            //     } else {
            //         throw new Error('Unhandled childIdOrData format');
            //     }

            //     var child = new Observer(data);
            //     addEntity(child, entity, undefined, undefined, entityReferencesMap);
            // });

            // Hook up any entity references which need to be pointed to this newly created entity
            // (happens when addEntity() is being called during the undoing of a deletion). In order
            // to force components to respond to the setter call even when they are running in other
            // tabs or in the Launch window, we unfortunately have to use a setTimeout() hack :(
            var guid = entity.get('resource_id');

            // First set all entity reference fields targeting this guid to null
            // updateEntityReferenceFields(entityReferencesMap, guid, null);
            // setTimeout(function () {
            //     // Then update the same fields to target the guid again
            //     updateEntityReferenceFields(entityReferencesMap, guid, guid);
            // }, 0);

            // if (entity.get('__postCreationCallback')) {
            //     entity.get('__postCreationCallback')(entity);
            // }
        };


        editor.method('entities:addEntity', addEntity);

    }
}