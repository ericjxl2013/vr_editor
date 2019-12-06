import { GameObject } from "./gameobject";

export class MiddleContainer {

    public gameObjects: GameObject[] = [];


    public constructor() {

    }


    public addGameObject(object: GameObject): void {
        this.gameObjects.push();
        
    }

}