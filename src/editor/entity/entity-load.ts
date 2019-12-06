import { Entities } from "./entities";
import { Observer } from "../../lib";

export class EntityLoad {

    public loadedEntities: boolean = false;

    private _entities: Entities = new Entities();

    public constructor() {

    }


    public scene_raw(row_data: any): void {
        // 解析entity

        // 清空
        // editor.call('selector:clear');
        // editor.call('entities:clear');
        // editor.call('attributes:clear');

        // 加载进度条计算
        var total = Object.keys(row_data.entities).length;
        var i = 0;

        // list 挨个解析
        for (var key in row_data.entities) {
            // 是否需要加入一个中间结构
            this._entities.addRaw(row_data.entities[key]);
            let entity = new Observer(row_data.entities[key]);
            // debug.warn(entity.get('name'));
            // debug.warn(entity.get('resource_id'));
            // if (entity.has('components.rigidbody')) {
            //     debug.warn(entity.get('components.rigidbody.type'));
            // }



            // editor.call('entities:add', new Observer(data.entities[key]));
            // p.progress = (++i / total) * 0.8 + 0.1;
        }

        // p.progress = 1;

        this.loadedEntities = true;

        // 解析完成，其他面板设置
        editor.emit('entities:load');
    }


}