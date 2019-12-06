import { Observer } from '../../lib/observer';
import { ObserverList } from '../../lib';


export class Selector {

  public enabled: boolean = true;

  public selector: ObserverList;

  public evtChange: boolean;

  public constructor() {
    this.selector = new ObserverList();

    this.evtChange = false;

    this.init();
  }


  private init(): void {

    let self = this;

    // 某个面板选中item
    editor.method('selector:add', (type: string, item: Observer) => {

      if (!self.enabled)
        return;

      if (self.selector.has(item))
        return;

        // console.warn('selector add入口');

      if (self.selector.length > 0 && self.selector.type !== type)
        self.selector.clear();

      self.selector.type = type;
      self.selector.add(item);
    });

    // deselecting item
    editor.method('selector:remove', (type: string, item: Observer) => {

      // console.warn('selector:remove 移除');

      if (!self.enabled)
        return;

      if (!self.selector.has(item))
        return;

      self.selector.remove(item);
    });

    // observer-list中有添加item
    this.selector.on('add', (item: Observer) => {
      // add index TODO
      // this.setIndex(self.selector.type, item);

      // console.warn('selector list 中 add item');

      editor.emit('selector:add', item, self.selector.type);

      if (!self.evtChange) {
        self.evtChange = true;
        setTimeout(self.evtChangeFn.bind(self), 0);
      }
    });


    // removing
    this.selector.on('remove', (item: Observer) => {
      editor.emit('selector:remove', item, self.selector.type);

      // remove index
      // this.removeIndex(self.selector.type, item);

      if (self.selector.length === 0)
        self.selector.type = '';

      if (!self.evtChange) {
        self.evtChange = true;
        setTimeout(self.evtChangeFn.bind(self), 0);
      }
    });


  }

  private keyByType(type: string): string {
    switch (type) {
      case 'entity':
        return 'resource_id';
      case 'asset':
        return 'id';
    }
    return '';
  }


  // private setIndex(type: string, item: Observer): void {
  //   var key = this.keyByType(type);
  //   if (!key) return;

  //   if (!index[type])
  //     index[type] = {};

  //   index[type][item.get[key]] = item.once('destroy', function () {
  //     var state = editor.call('selector:history');
  //     if (state)
  //       editor.call('selector:history', false);

  //     selector.remove(item);
  //     delete index[type][item.get[key]];

  //     if (state)
  //       editor.call('selector:history', true);
  //   });
  // }


  private evtChangeFn(): void {
    this.evtChange = false;
    console.log('selector change 事件');
    editor.emit('selector:change', this.selector.type, this.selector.array());
  }


}