import { Entity } from "./entity";
import { GameObject, MiddleContainer } from "../middleware";
import { Observer } from "../../lib";

export class Entities {
    public lists: Entity[] = [];
    private _indexed: { [key: string]: Entity } = {};

    private container: MiddleContainer;

    public constructor() {
        this.container = new MiddleContainer();
    }

    // 1.建立基本的数据格式；
    // 2.串联hierarchy，包括基本的菜单；
    // 3.尝试建立property；
    // 4.串联Assets结构与UI；

    public addRaw(entity_data: any): void {
        console.log('***entity-data***');
        console.log(entity_data);
        let gameObject = this.createGameObject(entity_data);


        // add component

        // children

        // parent



        this.container.addGameObject(gameObject);
    }

    private createGameObject(entity: any): GameObject {
        // TODO: 解析是node还是mesh
        // 设置name
        let instance = new GameObject(entity.name);
        // 设置guid
        instance.guid = entity.resource_id;
        
        // 设置位置
        // 设置角度
        // 设置比例值
        // 设置enable ? 不存在的情况
        instance.setActive(entity.enabled);
        // 设置visiable

        // 设置tags

        return instance;
    }

    public add(item: Entity): void { }

    public has(item: Entity): boolean {
        return false;
    }

    public set(index: string, item: Entity): void { }

    public get(index: string): Nullable<Entity> {
        return this._indexed[index];
    }

    public indexOf(item: Entity): number {
        return this.lists.indexOf(item);
    }
}
