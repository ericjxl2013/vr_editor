import { Panel, MenuItem, Menu, MenuItemArgs, TreeItem } from "../../ui";
import { Entity } from "../entity";

export class HierarchyContextMenu {

  public root: Panel;
  public clickableSubmenus: boolean;
  public menu!: Menu;
  public customMenuItems: MenuItemArgs[] = [];
  public entity!: Entity;
  public items = [];


  public constructor() {
    this.root = editor.call('layout.root');

    this.clickableSubmenus = /clickableContextSubmenus=true/.test(location.search);

    this.initMenu();
    this.initFunction();

  }


  private initMenu(): void {
    let that = this;
    var menuData: { [key: string]: ContextMenuArgs } = {};

    menuData['new-entity'] = {
      title: 'New Entity',
      className: 'menu-item-new-entity',
      // filter: function () {
      //   return that.items.length === 1;
      // },
      // select: function () {
      //   editor.call('entities:new', { parent: that.items[0] });
      // },
      // 
      // items: editor.call('menu:entities:new', function () { return that.items[0]; })
    };

    menuData['add-component'] = {
      title: 'Add Component',
      className: 'menu-item-add-component',
      // items: editor.call('menu:entities:add-component')
      items: {
        'add-new-entity': {
          title: 'Entity',
          className: 'menu-item-add-entity',
          icon: '&#57632;'
        },
        'audio-sub-menu': {
          title: 'Audio',
          className: 'menu-item-audio-sub-menu',
          icon: editor.call('components:logos')['sound'],
          items: {
            'add-new-entity2': {
              title: '测试1',
              className: 'menu-item-add-entity2',
              icon: '&#57632;'
            },
            'audio-sub-menu2': {
              title: '测试2',
              className: 'menu-item-audio-sub-menu2',
              icon: editor.call('components:logos')['sound']
            } 
          }
        }
      }
    };

    menuData['enable'] = {
      title: 'Enable',
      className: 'menu-item-enable',
      icon: '&#57651;',
      // hide: function () {
      //   if (that.items.length === 1) {
      //     return that.items[0].get('enabled');
      //   } else {
      //     var enabled = that.items[0].get('enabled');
      //     for (var i = 1; i < that.items.length; i++) {
      //       if (enabled !== that.items[i].get('enabled'))
      //         return false;
      //     }
      //     return enabled;
      //   }
      // },
      // select: function () {
      //   setField('enabled', true);
      // }
    };

    menuData['disable'] = {
      title: 'Disable',
      className: 'menu-item-disable',
      icon: '&#57650;',
      // hide: function () {
      //   if (that.items.length === 1) {
      //     return !that.items[0].get('enabled');
      //   } else {
      //     var disabled = that.items[0].get('enabled');
      //     for (var i = 1; i < that.items.length; i++) {
      //       if (disabled !== that.items[i].get('enabled'))
      //         return false;
      //     }
      //     return !disabled;
      //   }
      // },
      // select: function () {
      //   setField('enabled', false);
      // }
    };

    menuData['copy'] = {
      title: 'Copy',
      className: 'menu-item-copy',
      icon: '&#58193;',
      // select: function () {
      //   editor.call('entities:copy', that.items);
      // }
    };

    menuData['paste'] = {
      title: 'Paste',
      className: 'menu-item-paste',
      icon: '&#58184;',
      // filter: function () {
      //   return that.items.length <= 1 && !editor.call('entities:clipboard:empty');
      // },
      // select: function () {
      //   editor.call('entities:paste', that.entity);
      // }
    };

    menuData['duplicate'] = {
      title: 'Duplicate',
      className: 'menu-item-duplicate',
      icon: '&#57638;',
      // filter: function () {
      //   var items = getSelection();

      //   if (items.indexOf(editor.call('entities:root')) !== -1)
      //     return false;

      //   return items.length > 0;
      // },
      // select: function () {
      //   editor.call('entities:duplicate', getSelection());
      // }
    };

    menuData['delete'] = {
      title: 'Delete',
      className: 'menu-item-delete',
      icon: '&#57636;',
      // filter: function () {
      //   var root = editor.call('entities:root');
      //   for (var i = 0; i < that.items.length; i++) {
      //     if (that.items[i] === root)
      //       return false;
      //   }
      //   return true;
      // },
      // select: function () {
      //   editor.call('entities:delete', that.items);
      // }
    };

    // menu
    this.menu = Menu.fromData(menuData, { clickableSubmenus: this.clickableSubmenus });
    this.root.append(this.menu);

    // this.menu.on('open', function () {
    //   var selection = getSelection();

    //   for (var i = 0; i < that.customMenuItems.length; i++) {
    //     if (!that.customMenuItems[i].filter)
    //       continue;

    //     that.customMenuItems[i].hidden = !that.customMenuItems[i].filter(selection);
    //   }
    // });

  }


  private getSelection() {
    var selection = editor.call('selector:items');

    if (selection.indexOf(this.entity) !== -1) {
      return selection;
    } else {
      return [this.entity];
    }
  }


  private initFunction(): void {

    let that = this;

    // TODO
    // editor.method('entities:contextmenu:add', function (data: MenuItemArgs) {
    //   var item = new MenuItem({
    //     text: data.text,
    //     icon: data.icon,
    //     value: data.value,
    //     hasChildren: !!(data.items && Object.keys(data.items).length > 0),
    //     clickableSubmenus: that.clickableSubmenus
    //   });

    //   item.on('select', function () {
    //     data.select.call(item, getSelection());
    //   });

    //   var parent = data.parent || that.menu;
    //   parent.append(item);

    //   if (data.filter)
    //     item.filter = data.filter;

    //   that.customMenuItems.push(item);

    //   return item;
    // });

    editor.method('entities:contextmenu:open', function (item: TreeItem, x: number, y: number, ignoreSelection: boolean) {
      // TODO
      // if (!that.menu || !editor.call('permissions:write')) return;
      if (!that.menu) return;
      // that.entity = item;

      // if (ignoreSelection) {
      //   items = [];
      // } else {
      //   items = getSelection();
      // }

      that.menu.open = true;
      that.menu.position(x + 1, y);

      return true;
    });

    // get the entity that was right-clicked when opening the context menu
    editor.method('entities:contextmenu:entity', function () {
      return that.entity;
    });

    // for each entity added
    editor.on('entities:add', function (item: TreeItem) {
      // get tree item
      // var treeItem = editor.call('entities:panel:get', item.get('resource_id'));
      // if (!treeItem) return;
      // attach contextmenu event

      item.element!.addEventListener('contextmenu', function (evt: MouseEvent) {
        // console.log("context click: " + item.element!.innerText);
        let openned = editor.call('entities:contextmenu:open', item, evt.clientX, evt.clientY);

        if (openned) {
          evt.preventDefault();
          evt.stopPropagation();
        }
      });
    });

  }

}


export interface ContextMenuArgs {
  title?: string;
  className?: string;
  icon?: string;
  filter?: () => boolean;
  hide?: () => boolean;
  select?: () => void;
  items?: any;
}