import { Element } from '../ui';
import { EventHandle } from '../lib';

// TODO
export class Link {

  private _element: Element;

  private _value: { [key: string]: any } = {};

  public constructor(ele: Element) {
    this._element = ele;
  }

  public get(path: string): any {
    return this._value[path];
  }

  public set(path: string, value: any): void {
    this._value[path] = value;
  }

  public on(name: string, fn: Function): EventHandle {
    return this._element.on(name, fn);
  }
}