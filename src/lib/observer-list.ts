import { Events } from "./events";
import { Observer } from "./observer";

export class ObserverList extends Events {

  public data: Observer[];

  public index: string;
  public sorted: boolean;
  private _indexed: { [key: number]: Observer };

  public type: string;


  public get length(): number {
    return this.data.length;
  }


  public constructor(options?: any) {
    super();

    options = options || {};

    this.type = '';
    this.data = [];
    this._indexed = {};
    this.sorted = options.sorted || null;
    this.index = options.index || null;

  }


  public get(index: number): Nullable<Observer> {
    if (this.index) {
      return this._indexed[index] || null;
    } else {
      return this.data[index] || null;
    }
  }

  public set(index: number, val: Observer): void {
    if (this.index) {
      this._indexed[index] = val;
    } else {
      this.data[index] = val;
    }
  }

  // public indexof(item: Observer): number {
  //   if (this.index) {
  //     let index: number =
  //       (item instanceof Observer && item.get(this.index)) || item[this.index];
  //     return (this._indexed[index] && index) || null;
  //   } else {
  //     let ind = this.data.indexOf(item);
  //     return ind !== -1 ? ind : null;
  //   }
  // }

  // public position = function (b: any, fn: any) {
  //   let l = this.data;
  //   let min = 0;
  //   let max = l.length - 1;
  //   let cur;
  //   let a, i;
  //   fn = fn || this.sorted;

  //   while (min <= max) {
  //     cur = Math.floor((min + max) / 2);
  //     a = l[cur];

  //     i = fn(a, b);

  //     if (i === 1) {
  //       max = cur - 1;
  //     } else if (i === -1) {
  //       min = cur + 1;
  //     } else {
  //       return cur;
  //     }
  //   }

  //   return -1;
  // };

  // 2分法求最近距离
  public positionNextClosest(b: any, fn: any): number {
    let l = this.data;
    let min = 0;
    let max = l.length - 1;
    let cur: number = 0;
    let a, i;
    fn = fn || this.sorted;

    if (l.length === 0) return -1;

    if (fn(l[0], b) === 0) return 0;

    while (min <= max) {
      cur = Math.floor((min + max) / 2);
      a = l[cur];

      i = fn(a, b);

      if (i === 1) {
        max = cur - 1;
      } else if (i === -1) {
        min = cur + 1;
      } else {
        return cur;
      }
    }

    if (fn(a, b) === 1) return cur;

    if (cur! + 1 === l.length) return -1;

    return cur! + 1;
  };


  public has(item: Observer): boolean {
    // if (this.index) {
    //   let index =
    //     (item instanceof Observer && item.get(this.index)) || item[this.index];
    //   return !!this._indexed[index];
    // } else {
    //   return this.data.indexOf(item) !== -1;
    // }
    return this.data.indexOf(item) !== -1;
  };

  public add(item: Observer): number {
    if (this.has(item)) return -1;

    // let index = this.data.length;
    // if (this.index) {
    //   index =
    //     (item instanceof Observer && item.get(this.index)) || item[this.index];
    //   this._indexed[index] = item;
    // }

    let pos = 0;

    this.data.push(item);
    pos = this.data.length - 1;

    // if (this.sorted) {
    //   pos = this.positionNextClosest(item);
    //   if (pos !== -1) {
    //     this.data.splice(pos, 0, item);
    //   } else {
    //     this.data.push(item);
    //   }
    // } else {
    //   this.data.push(item);
    //   pos = this.data.length - 1;
    // }

    this.emit('add', item, this.data.length);

    return pos;
  };

  public move(item: Observer, pos: number): void {
    let ind = this.data.indexOf(item);
    this.data.splice(ind, 1);
    if (pos === -1) {
      this.data.push(item);
    } else {
      this.data.splice(pos, 0, item);
    }
  };

  // TODO
  public remove(item: Observer): void {
    if (!this.has(item)) return;

    let ind = this.data.indexOf(item);

    // let index = ind;
    // if (this.index) {
    //   index =
    //     (item instanceof Observer && item.get(this.index)) || item[this.index];
    //   delete this._indexed[index];
    // }

    this.data.splice(ind, 1);

    this.emit("remove", item, ind);
  };

  public removeByKey(index: number): void {
    if (this.index) {
      let item = this._indexed[index];

      if (!item) return;

      let ind = this.data.indexOf(item);
      this.data.splice(ind, 1);

      delete this._indexed[index];

      this.emit("remove", item, ind);
    } else {
      if (this.data.length < index) return;

      let item = this.data[index];

      this.data.splice(index, 1);

      this.emit("remove", item, index);
    }
  };

  // public removeBy(fn: Function) {
  //   let i = this.data.length;
  //   while (i--) {
  //     if (!fn(this.data[i])) continue;

  //     if (this.index) {
  //       delete this._indexed[this.data[i][this.index]];
  //     }
  //     this.data.splice(i, 1);

  //     this.emit("remove", this.data[i], i);
  //   }
  // };

  public clear(): void {
    let items = this.data.slice(0);

    this.data = [];
    this._indexed = {};

    let i = items.length;
    while (i--) {
      this.emit("remove", items[i], i);
    }
  };

  // public forEach(fn: Function) {
  //   for (let i = 0; i < this.data.length; i++) {
  //     fn(this.data[i], (this.index && this.data[i][this.index]) || i);
  //   }
  // };

  // public find(fn: Function) {
  //   let items = [];
  //   for (let i = 0; i < this.data.length; i++) {
  //     if (!fn(this.data[i])) continue;

  //     let index = i;
  //     if (this.index) index = this.data[i][this.index];

  //     items.push([index, this.data[i]]);
  //   }
  //   return items;
  // };

  // public findOne(fn: Function) {
  //   for (let i = 0; i < this.data.length; i++) {
  //     if (!fn(this.data[i])) continue;

  //     let index = i;
  //     if (this.index) index = this.data[i][this.index];

  //     return [index, this.data[i]];
  //   }
  //   return null;
  // };

  // public map(fn: Function) {
  //   return this.data.map(fn);
  // };

  // public sort(fn: Function) {
  //   this.data.sort(fn);
  // };

  public array() {
    return this.data.slice(0);
  };

  // public json() {
  //   let items = this.array();
  //   for (let i = 0; i < items.length; i++) {
  //     if (items[i] instanceof Observer) {
  //       items[i] = items[i].json();
  //     }
  //   }
  //   return items;
  // };

}