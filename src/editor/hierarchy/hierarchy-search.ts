import { List, TextField, Element, TreeItem, ListItem } from "../../ui";
import { VeryEngine } from "../../engine";

export class HierarchySearch {

  public results: List;

  public search: TextField;

  public searchClear: HTMLElement;

  public changing: boolean = false;

  public itemsIndex: { [key: string]: TreeItem } = {};

  public lastSearch: string = '';


  public constructor() {

    let self = this;

    // 结果列表
    this.results = new List();
    this.results.element!.tabIndex = 0;
    this.results.hidden = true;
    this.results.class!.add('search-results');
    VeryEngine.hierarchyPanel.append(this.results);
    this.initResult();

    // 搜索区域控制
    this.search = new TextField('搜索');
    this.initSearchField();

    // 搜索结果clear控制
    this.searchClear = document.createElement('div');
    this.searchClear.innerHTML = '&#57650;';
    this.searchClear.classList.add('clear');
    this.search.element!.appendChild(this.searchClear);

    this.searchClear.addEventListener('click', function () {
      self.search.value = '';
    }, false);



  }


  public initResult(): void {

    let self = this;

    // clear on escape
    this.results.element!.addEventListener('keydown', function (evt) {
      if (evt.keyCode === 27) { // esc
        self.searchClear.click();

      } else if (evt.keyCode === 13) { // enter，TODO: 回车键选择
        if (!self.results.selected) {
          // let firstElement = self.results.element!.firstElementChild;
          // if (firstElement && (<HTMLElement>firstElement).ui && (<HTMLElement>firstElement).ui.entity)
          //   editor.call('selector:set', 'entity', [firstElement.ui.entity]);
        }
        self.search.value = '';

      } else if (evt.keyCode === 40) {  // down
        self.selectNext();
        evt.stopPropagation();
      } else if (evt.keyCode === 38) {  // up
        self.selectPrev();
        evt.stopPropagation();
      }
    }, false);


    // deselecting
    this.results.unbind('deselect', this.results._onDeselect);
    this.results._onDeselect = function (item) {
      let ind = this.selected.indexOf(item);
      if (ind !== -1) this.selected.splice(ind, 1);

      if (this._changing)
        return;

      if (List._ctrl && List._ctrl()) {

      } else {
        this._changing = true;

        let items = editor.call('selector:type') === 'entity' && editor.call('selector:items') || [];

        // TODO: 
        console.log('_onDeselect');
        // let inSelected = items.indexOf(item.entity) !== -1;

        // if (items.length >= 2 && inSelected) {
        //   let selected = this.selected;
        //   for (let i = 0; i < selected.length; i++)
        //     selected[i].selected = false;

        //   item.selected = true;
        // }

        this._changing = false;
      }

      this.emit('change');
    };
    this.results.on('deselect', this.results._onDeselect);

    // results selection change
    this.results.on('change', function () {
      if (self.changing)
        return;

      if (self.results.selected) {
        editor.call('selector:set', 'entity', self.results.selected.map(function (item) {
          console.log('entity change');
          return;
          // TODO
          // return item.entity;
        }));
      } else {
        editor.call('selector:clear');
      }
    });

    // selector change
    editor.on('selector:change', function (type: string, items: TreeItem[]) {
      if (self.changing)
        return;

      self.changing = true;

      if (type === 'entity') {
        self.results.selected = [];

        // TODO
        for (let i = 0; i < items.length; i++) {
          // let item = self.itemsIndex[items[i].get('resource_id')];
          // if (!item) continue;
          // item.selected = true;.
        }
      } else {
        self.results.selected = [];
      }

      self.changing = false;
    });
  }

  public initSearchField(): void {

    let self = this;

    this.search.blurOnEnter = false;
    this.search.keyChange = true;
    this.search.class!.add('search');
    this.search.renderChanges = false;
    VeryEngine.hierarchyPanel.element!.insertBefore(this.search.element!, VeryEngine.hierarchyPanel.innerElement);

    this.search.element!.addEventListener('keydown', function (evt: KeyboardEvent) {
      if (evt.keyCode === 27) {
        searchClear.click();

      } else if (evt.keyCode === 13) {
        if (!self.results.selected.length) {
          // TODO
          // let firstElement = self.results.element!.firstElementChild;
          // if (firstElement && (<HTMLElement>firstElement).ui && (<HTMLElement>firstElement).ui.entity)
          //   editor.call('selector:set', 'entity', [(<HTMLElement>firstElement).ui.entity]);
        }
        self.search.value = '';

      } else if (evt.keyCode === 40) { // down
        editor.call('hotkey:updateModifierKeys', evt);
        self.selectNext();
        evt.stopPropagation();
        evt.preventDefault();

      } else if (evt.keyCode === 38) { // up
        editor.call('hotkey:updateModifierKeys', evt);
        self.selectPrev();
        evt.stopPropagation();
        evt.preventDefault();

      } else if (evt.keyCode === 65 && evt.ctrlKey) { // ctrl + a
        let toSelect = [];
        let items = self.results.element!.querySelectorAll('.ui-list-item');
        for (let i = 0; i < items.length; i++) {
          toSelect.push((<HTMLElement>items[i]).ui);
        }
        // TODO
        console.log('全选');
        // self.results.selected = toSelect;
        evt.stopPropagation();
        evt.preventDefault();
      }
    }, false);


    this.search.on('change', function (value: string) {
      value = value.trim();

      if (self.lastSearch === value) return;
      self.lastSearch = value;

      if (value) {
        self.search.class!.add('not-empty');
      } else {
        self.search.class!.remove('not-empty');
      }

      self.performSearch();
    });


    let searchClear = document.createElement('div');
    searchClear.innerHTML = '&#57650;';
    searchClear.classList.add('clear');
    this.search.element!.appendChild(searchClear);

    searchClear.addEventListener('click', function () {
      self.search.value = '';
    }, false);


  }


  private selectNext(): void {
    let children = this.results.element!.children;

    // could be nothing or only one item to select
    if (!children.length || !children.length)
      return;

    let toSelect = null;
    let items = this.results.element!.querySelectorAll('.ui-list-item.selected');
    let multi: boolean = List._ctrl() || List._shift();

    if (items.length) {
      let last = items[items.length - 1];
      let next = last.nextElementSibling;
      if (next) {
        // select next
        toSelect = (<HTMLElement>next).ui;
      } else {
        // loop through
        if (!multi) toSelect = (<HTMLElement>children[0]).ui;
      }
    } else {
      // select first
      toSelect = (<HTMLElement>children[0]).ui;
    }

    if (toSelect) {
      if (!multi) this.results.selected = [];
      // TODO
      // toSelect.selected = true;
    }
  }

  private selectPrev(): void {
    let children = this.results.element!.children;

    // could be nothing or only one item to select
    if (!children || !children.length)
      return;

    let toSelect = null;
    let items = this.results.element!.querySelectorAll('.ui-list-item.selected');
    let multi: boolean = List._ctrl() || List._shift();

    if (items.length) {
      let first = items[0];
      let prev = first.previousElementSibling;
      if (prev) {
        // select previous
        toSelect = (<HTMLElement>prev).ui;
      } else {
        // loop through
        if (!multi) toSelect = (<HTMLElement>children[children.length - 1]).ui;
      }
    } else {
      // select last
      toSelect = (<HTMLElement>children[children.length - 1]).ui;
    }

    if (toSelect) {
      if (!multi) this.results.selected = [];
      // TODO
      // toSelect.selected = true;
    }
  };

  private performSearch() {
    let query = this.lastSearch;

    // clear results list
    this.results.clear();
    this.itemsIndex = {};

    if (query) {
      let result = editor.call('entities:fuzzy-search', query);

      VeryEngine.hierarchyTree.hidden = true;
      this.results.hidden = false;

      let selected = [];
      if (editor.call('selector:type') === 'entity')
        selected = editor.call('selector:items');

      // TODO
      for (let i = 0; i < result.length; i++) {
        // let item = this.addItem(result[i]);

        // this.itemsIndex[result[i].get('resource_id')] = item;

        // if (selected.indexOf(result[i]) !== -1)
        //   item.selected = true;

        // this.results.append(item);
      }
    } else {
      this.results.hidden = true;
      VeryEngine.hierarchyTree.hidden = false;
    }
  };


  // private addItem(entity) {
  //   let events = [];

  //   let item = new ListItem({
  //     text: entity.get('name')
  //   });
  //   item.disabledClick = true;
  //   item.entity = entity;

  //   if (entity.get('children').length)
  //     item.class.add('container');

  //   // relate to tree item
  //   let treeItem = editor.call('entities:panel:get', entity.get('resource_id'));

  //   item.disabled = treeItem.disabled;

  //   let onStateChange = function () {
  //     item.disabled = treeItem.disabled;
  //   };

  //   events.push(treeItem.on('enable', onStateChange));
  //   events.push(treeItem.on('disable', onStateChange));

  //   let onNameSet = function (name) {
  //     item.text = name;
  //   };
  //   events.push(entity.on('name:set', onNameSet));

  //   // icon
  //   let components = Object.keys(entity.get('components'));
  //   for (let c = 0; c < components.length; c++)
  //     item.class.add('c-' + components[c]);

  //   let onContextMenu = function (evt) {
  //     let openned = editor.call('entities:contextmenu:open', entity, evt.clientX, evt.clientY);

  //     if (openned) {
  //       evt.preventDefault();
  //       evt.stopPropagation();
  //     }
  //   };

  //   let onDblClick = function (evt) {
  //     search.value = '';
  //     editor.call('selector:set', 'entity', [entity]);

  //     evt.stopPropagation();
  //     evt.preventDefault();
  //   };

  //   item.element.addEventListener('contextmenu', onContextMenu);
  //   item.element.addEventListener('dblclick', onDblClick);

  //   events.push(item.once('destroy', function () {
  //     for (let i = 0; i < events.length; i++)
  //       events[i].unbind();
  //     events = null;

  //     item.element.removeEventListener('contextmenu', onContextMenu);
  //     item.element.removeEventListener('dblclick', onDblClick);
  //   }));

  //   events.push(treeItem.once('destroy', function () {
  //     // if entity removed, perform search again
  //     performSearch();
  //   }));

  //   return item;
  // };


}