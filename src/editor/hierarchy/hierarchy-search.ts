import { List, TextField } from "../../ui";
import { VeryEngine } from "../../engine";

export class HierarchySearch {

  public results: List;

  public search: TextField;

  public constructor() {

    this.results = new List();
    this.results.element!.tabIndex = 0;
    this.results.hidden = true;
    this.results.class!.add('search-results');
    VeryEngine.hierarchyPanel.append(this.results);

    this.search = new TextField('搜索');
    this.init();
  }


  public init(): void {

    let self = this;

    var lastSearch = '';
    this.search.blurOnEnter = false;
    this.search.keyChange = true;
    this.search.class!.add('search');
    this.search.renderChanges = false;
    VeryEngine.hierarchyPanel.element!.insertBefore(this.search.element!, VeryEngine.hierarchyPanel.innerElement);



    var searchClear = document.createElement('div');
    searchClear.innerHTML = '&#57650;';
    searchClear.classList.add('clear');
    this.search.element!.appendChild(searchClear);

    searchClear.addEventListener('click', function () {
      self.search.value = '';
    }, false);


  }


}