import { Panel, Button, Tooltip, Tree, TreeItem } from '../../ui';
import { VeryEngine } from '../../engine';
import { HierarchySearch } from './hierarchy-search';
import { HierarchyMenu } from './hierarchy-menu';
import { HierarchyContextMenu } from './hierarchy-context-menu';

export class HierarchyPanel {


  public hierarchyMain: Panel;

  public constructor() {
    this.hierarchyMain = new Panel();
    this.hierarchyMain.class!.add('hierarchy-controls');
    this.hierarchyMain.parent = VeryEngine.hierarchyPanel;
    VeryEngine.hierarchyPanel.headerAppend(this.hierarchyMain);
    // console.log('hierarchy-controls');

    // controls delete (Button)
    let btnDelete: Button = new Button('&#57636;');
    btnDelete.class!.add('delete');
    btnDelete.style!.fontWeight = '200';
    btnDelete.on('click', function () {
      let type = editor.call('selector:type');
      if (type !== 'entity')
        return;
      editor.call('entities:delete', editor.call('selector:items'));
    });
    this.hierarchyMain.append(btnDelete);

    let tooltipDelete = Tooltip.attach({
      target: btnDelete.element!,
      text: '删除',
      align: 'top',
      root: VeryEngine.rootPanel
    });
    tooltipDelete.class!.add('innactive');

    // controls duplicate
    let btnDuplicate: Button = new Button('&#57638;');
    btnDuplicate.disabled = true;
    btnDuplicate.class!.add('duplicate');
    btnDuplicate.on('click', function () {
      let type = editor.call('selector:type');
      let items = editor.call('selector:items');

      if (type === 'entity' && items.length)
        editor.call('entities:duplicate', items);
    });
    this.hierarchyMain.append(btnDuplicate);

    let tooltipDuplicate = Tooltip.attach({
      target: btnDuplicate.element!,
      text: '复制',
      align: 'top',
      root: VeryEngine.rootPanel
    });
    tooltipDuplicate.class!.add('innactive');

    // TODO: Menu
    // let menuEntities = ui.Menu.fromData(editor.call('menu:entities:new'));
    // root.append(menuEntities);

    // controls add
    let btnAdd: Button = new Button('&#57632;');
    btnAdd.class!.add('add');
    btnAdd.on('click', function () {
      // menuEntities.open = true;
      // let rect = btnAdd.element.getBoundingClientRect();
      // menuEntities.position(rect.left, rect.top);
    });
    this.hierarchyMain.append(btnAdd);

    Tooltip.attach({
      target: btnAdd.element!,
      text: '添加',
      align: 'top',
      root: VeryEngine.rootPanel
    });

    this.init();

  }

  public init(): void {
    // left control
    // hierarchy index
    let uiItemIndex = {};
    let awaitingParent = {};
    let panel: Panel = VeryEngine.hierarchyPanel;

    let hierarchy: Tree = new Tree();
    VeryEngine.hierarchyTree = hierarchy;

    // TODO: hierarchy权限管理，有些人可看不可编辑；
    // hierarchy.allowRenaming = editor.call('permissions:write');
    hierarchy.draggable = hierarchy.allowRenaming;
    hierarchy.class!.add('hierarchy');
    panel.append(hierarchy);

    let resizeQueued = false;
    let resizeTree = function () {
      resizeQueued = false;
      hierarchy.element!.style.width = '';
      hierarchy.element!.style.width = (panel.innerElement!.scrollWidth - 5) + 'px';
    };
    let resizeQueue = function () {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(resizeTree);
    };
    panel.on('resize', resizeQueue);
    hierarchy.on('open', resizeQueue);
    hierarchy.on('close', resizeQueue);
    setInterval(resizeQueue, 1000);

    // return hierarchy
    editor.method('entities:hierarchy', function () {
      return hierarchy;
    });

    // list item selected
    hierarchy.on('select', function (item: TreeItem) {
      // open items till parent
      let parent = item.parent;
      while (parent && parent instanceof TreeItem) {
        parent.open = true;
        parent = parent.parent;
      }
      // focus
      item.elementTitle.focus();
      // add selection
      // TODO
      console.log('hierarchy 面板选中entity');

      // TODO: 当前entity为undefined
      editor.call('selector:add', 'entity', item.entity);
    });

    // list item deselected
    hierarchy.on('deselect', function (item: TreeItem) {
      // TODO:
      // console.log('selector:remove entity');
      editor.call('selector:remove', item.entity);
    });

    // scrolling on drag
    let dragScroll = 0;
    let dragTimer: NodeJS.Timer | null = null;;
    let dragLastEvt;
    let dragEvt = function (evt: MouseEvent) {
      if (!hierarchy._dragging) {
        clearInterval(Number(dragTimer));
        window.removeEventListener('mousemove', dragEvt);
        return;
      }
      let rect = panel.innerElement!.getBoundingClientRect();

      if ((evt.clientY - rect.top) < 32 && panel.innerElement!.scrollTop > 0) {
        dragScroll = -1;
      } else if ((rect.bottom - evt.clientY) < 32 && (panel.innerElement!.scrollHeight - (rect.height + panel.innerElement!.scrollTop)) > 0) {
        dragScroll = 1;
      } else {
        dragScroll = 0;
      }
    };

    hierarchy.on('dragstart', function () {
      dragTimer = setInterval(function () {
        if (dragScroll === 0)
          return;

        panel.innerElement!.scrollTop += dragScroll * 8;
        hierarchy._dragOver = null;
        hierarchy._updateDragHandle();
      }, 1000 / 60);

      dragScroll = 0;
      window.addEventListener('mousemove', dragEvt, false);

      // TODO:
      console.log('get drag TreeItem entity resourceId');
      // let resourceId = hierarchy._dragItems[0].entity.get('resource_id');
      // editor.call('drop:set', 'entity', { resource_id: resourceId });
      // editor.call('drop:activate', true);
    });

    hierarchy.on('dragend', function () {
      editor.call('drop:activate', false);
      editor.call('drop:set');
    });

    // TODO
    // let target = editor.call('drop:target', {
    //   ref: panel.innerElement,
    //   type: 'entity',
    //   hole: true,
    //   passThrough: true
    // });
    // target.element.style.outline = 'none';

    let classList = ['tree-item-entity', 'entity-id-' + 'ids-to-be-done', 'c-model'];
    // if (isRoot) {
    //   classList.push('tree-item-root');
    // }

    let rootElement = new TreeItem({
      text: 'Scene',
      classList: classList
    });
    rootElement.class!.remove('c-model');
    hierarchy.element!.appendChild(rootElement.element!);
    hierarchy.emit('append', rootElement);

    for (let i: number = 0; i < 10; i++) {
      let element1 = new TreeItem({
        text: '物体名' + (i + 1),
        classList: classList
      });
      editor.emit('entities:add', element1);
      hierarchy.emit('append', element1);
      rootElement.append(element1);

      for (let k = 0; k < 5; k++) {
        let element2 = new TreeItem({
          text: '子物体名' + (k + 1),
          classList: classList
        });
        editor.emit('entities:add', element2);
        hierarchy.emit('append', element2);
        element1.append(element2);
        for (let x = 0; x < 5; x++) {
          let element3 = new TreeItem({
            text: '二级子物体' + (x + 1),
            classList: classList
          });
          editor.emit('entities:add', element3);
          hierarchy.emit('append', element3);

          element2.append(element3);

        }
      }
    }

    // element.append();

  }

}