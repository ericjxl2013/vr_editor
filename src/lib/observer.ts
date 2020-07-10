import { Events } from "./events";

/**
 * json数据解析工具；
 * 要求：
 *  1.保存原始json数据；
 *  2.存储信息，根据路径快速索引到对应数据，包括数组，包括嵌套的对象，保持原始数据类型不变；
 *  3.插入、删除、clone数据；
 * 
 */
export class Observer extends Events {

  public get className(): string {
    return "Observer";
  }

  public origin: any;

  private SEPARATOR: string = '.';


  private _destroyed: boolean;
  public _path: string;
  // TODO
  public _keys: string[]; // 记录对象的key、value值；


  public _data: { [key: string]: any }; // 采用此对象，完整记录所有值；



  public _parent: any; // 当前父物体
  // public _parentPath: string;
  private _parentField: any;
  private _parentKey: any;

  private _silent: boolean;

  public history!: History;
  private sync!: History;

  public node: any;

  // entity, assets, components: script, 一般components, selector, history
  public constructor(data: any, options?: any) {
    super();

    this.origin = data;






    this._destroyed = false;
    this._path = "";
    this._keys = [];
    this._data = {};

    // array paths where duplicate entries are allowed - normally
    // we check if an array already has a value before inserting it
    // but if the array path is in here we'll allow it
    // this._pathsWithDuplicates = null;
    // if (options.pathsWithDuplicates) {
    //     this._pathsWithDuplicates = {};
    //     for (let i = 0; i < options.pathsWithDuplicates.length; i++) {
    //         this._pathsWithDuplicates[options.pathsWithDuplicates[i]] = true;
    //     }
    // }

    this.patchData(data);

    // for (let ke in this._data) {
    //   debug.log("key: " + ke);
    //   debug.log(this._data[ke]);
    // }

    // this._parent = options.parent || null;
    // this._parentPath = options.parentPath || "";
    // this._parentField = options.parentField || null;
    // this._parentKey = options.parentKey || null;

    this._silent = false;
  }

  public patchData(data: any): void {
    if (typeof data !== "object") {
      debug.warn(this.className + ': 不是正确的json对象，打印：\n' + data);
      return;
    }

    for (let key in data) {
      if (typeof data[key] === "object") {
        // 对象属性
        // debug.log('对象属性：' + key);
        // debug.log(data[key]);
        // this._prepare(this, key, data[key]);
        this.parserObject(key, key, data[key]);
      } else {
        // 一般属性
        // debug.log('一般属性：' + key);
        // debug.log(data[key]);
        this.set(key, data[key]);
        // this.set(key, data[key]);
      }
    }
  }


  public set(path: string, value: any): void {
    this._data[path] = value;
  }


  public parserObject(prefix: string, key: string, value: any): void {
    // 先保存一份
    this.set(prefix, value);

    let path: string;
    let type: string = typeof value;

    if (type === "object" && value instanceof Array) {
      for (let i = 0; i < value.length; i++) {
        path = prefix + this.SEPARATOR + i.toString();
        this.set(path, value[i]);
        // 数组元素还是对象的情况暂时不处理
      }
    } else if (type === "object" && value instanceof Object) {

      for (let key2 in value) {
        if (typeof value[key2] === "object") {
          // 递归解析
          this.parserObject(prefix + this.SEPARATOR + key2, key2, value[key2]);
        } else {
          path = prefix + this.SEPARATOR + key2;
          this.set(path, value[key2]);
        }
      }
    } else {
      // 目前看，null和undefined会经过这里
      // debug.warn(this.className + '.parserObject, 为止数据类型:' + value);
    }
  }


  public has(path: string): boolean {
    return this._data[path] ? true : false;
  }

  public get(path: string): any {
    return this._data[path];
  }




  public propagate(evt: any) {
    let that = this;
    return function (path: string, arg1: any, arg2: any, arg3: any) {
      if (!that._parent) return;

      let key = that._parentKey;
      if (!key && that._parentField instanceof Array) {
        key = that._parentField.indexOf(that);

        if (key === -1) return;
      }

      // path = that._parentPath + "." + key + "." + path;

      let state;
      if (that._silent) state = that._parent.silence();

      that._parent.emit(path + ":" + evt, arg1, arg2, arg3);
      that._parent.emit("*:" + evt, path, arg1, arg2, arg3);

      if (that._silent) that._parent.silenceRestore(state);
    };
  }

  // key => object
  private _prepare(target: Observer, key: string, value: any, silent?: boolean, remote?: any) {
    let self = this;
    let state: boolean[];
    let path = (target._path ? target._path + "." : "") + key;
    let type = typeof value;

    target._keys.push(key);

    if (type === "object" && value instanceof Array) {
      target._data[key] = value.slice(0); // 复制一份新的数组

      // 子一层数据
      for (let i = 0; i < target._data[key].length; i++) {
        if (typeof target._data[key][i] === "object" && target._data[key][i] !== null) {
          if (target._data[key][i] instanceof Array) {
            target._data[key][i].slice(0);
          } else {
            // observer? 这里不需要递归吗？
            target._data[key][i] = new Observer(
              target._data[key][i],
              {
                parent: this,
                parentPath: path,
                parentField: target._data[key],
                parentKey: null
              }
            );
          }
        } else {
          state = this.silence();
          this.emit(path + "." + i + ":set", target._data[key][i], null, remote);
          this.emit("*:set", path + "." + i, target._data[key][i], null, remote);
          this.silenceRestore(state);
        }
      }

      if (silent) state = this.silence();

      this.emit(path + ":set", target._data[key], null, remote);
      this.emit("*:set", path, target._data[key], null, remote);

      if (silent) this.silenceRestore(state!);
    } else if (type === "object" && value instanceof Object) {
      if (typeof target._data[key] !== "object") {
        target._data[key] = {
          _path: path,
          _keys: [],
          _data: {}
        };
      }

      for (let i in value) {
        if (typeof value[i] === "object") {
          // 递归
          this._prepare(target._data[key], i, value[i], true, remote);
        } else {
          state = this.silence();

          target._data[key]._data[i] = value[i];
          target._data[key]._keys.push(i);

          this.emit(path + "." + i + ":set", value[i], null, remote);
          this.emit("*:set", path + "." + i, value[i], null, remote);

          this.silenceRestore(state);
        }
      }

      if (silent) state = this.silence();

      // passing undefined as valueOld here
      // but we should get the old value to be consistent
      this.emit(path + ":set", value, undefined, remote);
      this.emit("*:set", path, value, undefined, remote);

      if (silent) this.silenceRestore(state!);
    } else {
      if (silent) state = this.silence();

      target._data[key] = value;

      this.emit(path + ":set", value, undefined, remote);
      this.emit("*:set", path, value, undefined, remote);

      if (silent) this.silenceRestore(state!);
    }

    return true;
  }

  public silence(): boolean[] {
    this._silent = true;

    // history hook to prevent array values to be recorded
    let historyState: boolean =
      this.history !== undefined && this.history.enabled !== undefined;
    if (historyState) this.history.enabled = false;

    // sync hook to prevent array values to be recorded as array root already did
    let syncState: boolean =
      this.sync !== undefined && this.sync.enabled !== undefined;
    if (syncState) this.sync.enabled = false;

    return [historyState, syncState];
  }

  public silenceRestore(state: boolean[]): void {
    this._silent = false;

    if (state[0]) this.history.enabled = true;

    if (state[1]) this.sync.enabled = true;
  }

  // public has(path: string): boolean {
  //   let keys = path.split(".");
  //   let node = this;
  //   for (let i = 0, len = keys.length; i < len; i++) {
  //     if (node === undefined) return false;
  //     if (node._data) {
  //       node = node._data[keys[i]];
  //     } else {
  //       // node = node[keys[i]];
  //     }
  //   }
  //   return node !== undefined;
  // }

  // public get(path: string, raw?: boolean): Nullable<Observer> {
  //   let keys = path.split('.');
  //   let node = this;
  //   for (let i = 0; i < keys.length; i++) {
  //     if (node === undefined)
  //       return null;

  //     if (node._data) {
  //       node = node._data[keys[i]];
  //     } else {
  //       // node = node[keys[i]];
  //     }
  //   }

  //   if (raw !== undefined && raw)
  //     return node;

  //   if (node === null) {
  //     return null;
  //   } else {
  //     return this.json(node);
  //   }
  // }

  // public move(path: string, indOld: number, indNew: number, silent: boolean, remote: boolean): void {
  //   let keys = path.split('.');
  //   let key = keys[keys.length - 1];
  //   let node = this;
  //   let obj = this;

  //   for (let i = 0; i < keys.length - 1; i++) {
  //     if (node instanceof Array) {
  //       node = node[parseInt(keys[i], 10)];
  //       if (node instanceof Observer) {
  //         path = keys.slice(i + 1).join('.');
  //         obj = node;
  //       }
  //     } else if (node._data && node._data.hasOwnProperty(keys[i])) {
  //       node = node._data[keys[i]];
  //     } else {
  //       return;
  //     }
  //   }

  //   if (!node._data || !node._data.hasOwnProperty(key) || !(node._data[key] instanceof Array))
  //     return;

  //   let arr = node._data[key];

  //   if (arr.length < indOld || arr.length < indNew || indOld === indNew)
  //     return;

  //   let value = arr[indOld];

  //   arr.splice(indOld, 1);

  //   if (indNew === -1)
  //     indNew = arr.length;

  //   arr.splice(indNew, 0, value);

  //   if (!(value instanceof Observer))
  //     value = obj.json(value);

  //   let state: boolean[];
  //   if (silent)
  //     state = obj.silence();

  //   obj.emit(path + ':move', value, indNew, indOld, remote);
  //   obj.emit('*:move', path, value, indNew, indOld, remote);

  //   if (silent)
  //     obj.silenceRestore(state!);

  //   return;
  // };

  // 将json对象复制解析出来
  // public patch(data: any): void {
  //   if (typeof data !== "object") {
  //     debug.warn(this.className + ': 不是正确的json对象，打印：\n' + data);
  //     return;
  //   }

  //   for (let key in data) {
  //     if (typeof data[key] === "object" && !this._data.hasOwnProperty(key)) {
  //       // 对象属性
  //       debug.log('对象属性：' + key);
  //       debug.log(data[key]);
  //       // this._prepare(this, key, data[key]);
  //     } else if (this._data[key] !== data[key]) {
  //       // 一般属性
  //       debug.log('一般属性：' + key);
  //       debug.log(data[key]);
  //       // this.set(key, data[key]);
  //     }
  //   }
  // }

  // public set2(path: string, value: any, silent?: boolean, remote?: boolean, force?: boolean): void {
  //   var keys = path.split('.');
  //   var length = keys.length;
  //   var key = keys[length - 1];
  //   var node: any = this;
  //   var nodePath = '';
  //   var obj: any = this;
  //   var state;

  //   for (var i = 0; i < length - 1; i++) {
  //     if (node instanceof Array) {
  //       // TODO: 这是啥啊？
  //       // node = node[keys[i]];

  //       if (node instanceof Observer) {
  //         path = keys.slice(i + 1).join('.');
  //         obj = node;
  //       }
  //     } else {
  //       if (i < length && typeof (node._data[keys[i]]) !== 'object') {
  //         if (node._data[keys[i]])
  //           obj.unset((node.__path ? node.__path + '.' : '') + keys[i]);

  //         node._data[keys[i]] = {
  //           _path: path,
  //           _keys: [],
  //           _data: {}
  //         };
  //         node._keys.push(keys[i]);
  //       }

  //       if (i === length - 1 && node.__path)
  //         nodePath = node.__path + '.' + keys[i];

  //       node = node._data[keys[i]];
  //     }
  //   }

  // }

  // public json(target?: Observer): Observer {
  //   let obj: { [key: string]: any } = {};
  //   let node = target === undefined ? this : target;
  //   let len, nlen;

  //   if (node instanceof Object && node._keys) {
  //     len = node._keys.length;
  //     for (let i = 0; i < len; i++) {
  //       let key = node._keys[i];
  //       let value = node._data[key];
  //       let type = typeof (value);

  //       if (type === 'object' && (value instanceof Array)) {
  //         obj[key] = value.slice(0);

  //         nlen = obj[key].length;
  //         for (let n = 0; n < nlen; n++) {
  //           if (typeof (obj[key][n]) === 'object')
  //             obj[key][n] = this.json(obj[key][n]);
  //         }
  //       } else if (type === 'object' && (value instanceof Object)) {
  //         obj[key] = this.json(value);
  //       } else {
  //         obj[key] = value;
  //       }
  //     }
  //   } else {
  //     if (node === null) {
  //       return null;
  //     } else if (typeof (node) === 'object' && (node instanceof Array)) {
  //       obj = node.slice(0);

  //       len = obj.length;
  //       for (let n = 0; n < len; n++) {
  //         obj[n] = this.json(obj[n]);
  //       }
  //     } else if (typeof (node) === 'object') {
  //       for (let key in node) {
  //         if (node.hasOwnProperty(key))
  //           obj[key] = node[key];
  //       }
  //     } else {
  //       obj = node;
  //     }
  //   }
  //   return obj;
  // }

  // public forEach(fn: Function, target: Observer, path: string): void {
  //   let node = target || this;
  //   path = path || '';

  //   for (let i = 0; i < node._keys.length; i++) {
  //     let key = node._keys[i];
  //     let value = node._data[key];
  //     let type = (this.schema && this.schema.has(path + key) && this.schema.get(path + key).type.name.toLowerCase()) || typeof (value);

  //     if (type === 'object' && (value instanceof Array)) {
  //       fn(path + key, 'array', value, key);
  //     } else if (type === 'object' && (value instanceof Object)) {
  //       fn(path + key, 'object', value, key);
  //       this.forEach(fn, value, path + key + '.');
  //     } else {
  //       fn(path + key, type, value, key);
  //     }
  //   }
  // };

  public destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;
    this.emit("destroy");
    this.unbind();
  }
}

export interface History {
  enabled?: boolean;
}
