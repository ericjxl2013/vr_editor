import { Panel } from '../ui';
import { VeryEngine } from '../engine';

export class Layout {

  private ignoreClasses: RegExp = /(ui-list-item)|(ui-button)|(ui-text-field)|(ui-number-field)/i;
  private ignoreElements: RegExp = /(input)|(textarea)/i;


  public constructor() {
    let self = this;
    // prevent drag'n'select
    window.addEventListener('mousedown', function (evt) {
      // don't prevent for certain cases
      if (evt.target) {
        if (self.ignoreClasses.test((<HTMLElement>evt.target).className)) {
          return;
        } else if (self.ignoreElements.test((<HTMLElement>evt.target).tagName)) {
          return;
        } else if ((<HTMLElement>evt.target).classList.contains('selectable')) {
          return;
        }
      }

      // blur inputs
      if (window.getSelection) {
        let focusNode = window.getSelection()!.focusNode;
        if (focusNode) {
          if ((<HTMLElement>focusNode).tagName === 'INPUT') {
            (<HTMLElement>focusNode).blur();
          } else if (focusNode.firstChild && (<HTMLElement>focusNode.firstChild).tagName === 'INPUT') {
            (<HTMLElement>focusNode.firstChild).blur();
          }
        }
      }

      // prevent default will prevent blur, dragstart and selection
      evt.preventDefault();
    }, false);
  }

  public init(): void {
    // main container
    let root: Panel = new Panel();
    root.element!.id = 'ui-root';
    root.flex = true;
    root.flexDirection = 'column';
    root.flexWrap = 'nowrap';
    root.scroll = true;
    document.body.appendChild(root.element!);
    // expose
    editor.method('layout.root', function () { return root; });
    VeryEngine.rootPanel = root;

    // top panel TODO: top干嘛用？
    let top = new Panel();
    top.style!.backgroundColor = '#5f6f72';
    top.style!.cursor = 'pointer';
    top.element!.id = 'ui-top';
    top.flexShrink = '0';
    top.once('click', function () {
      top.destroy();
      // TODO
      top.style!.marginTop = '';
    });
    root.append(top);

    // middle panel
    let middle = new Panel();
    middle.element!.id = 'ui-middle';
    middle.flexible = true;
    middle.flexGrow = '1';
    root.append(middle);

    // bottom panel (status)
    let bottom = new Panel();
    bottom.element!.id = 'ui-bottom';
    bottom.flexShrink = '0';
    root.append(bottom);
    // expose
    editor.method('layout.bottom', function () { return bottom; });

    // toolbar panel (left)
    let toolbar = new Panel();
    toolbar.element!.id = 'ui-toolbar';
    toolbar.flexShrink = '0';
    toolbar.style!.width = '45px';
    middle.append(toolbar);
    // expose
    editor.method('layout.toolbar', function () { return toolbar; });
    VeryEngine.toolbarPanel = toolbar;

    // hierarchy
    let hierarchyPanel = new Panel('树形结构窗口');
    hierarchyPanel.enabled = true;
    hierarchyPanel.class!.add('hierarchy');
    hierarchyPanel.flexShrink = '0';
    let hierarchyPanelSize = editor.call('localStorage:get', 'editor:layout:hierarchy:width') || '256px';
    hierarchyPanel.style!.width = hierarchyPanelSize;
    hierarchyPanel.innerElement!.style.width = hierarchyPanelSize;
    hierarchyPanel.foldable = true;
    hierarchyPanel.folded = editor.call('localStorage:get', 'editor:layout:hierarchy:fold') || false;
    hierarchyPanel.horizontal = true;
    hierarchyPanel.scroll = true;
    hierarchyPanel.resizable = 'right';
    hierarchyPanel.resizeMin = 196;
    hierarchyPanel.resizeMax = 512;

    hierarchyPanel.on('resize', function () {
      editor.call('localStorage:set', 'editor:layout:hierarchy:width', hierarchyPanel.style!.width);
    });
    hierarchyPanel.on('fold', function () {
      editor.call('localStorage:set', 'editor:layout:hierarchy:fold', true);
    });
    hierarchyPanel.on('unfold', function () {
      editor.call('localStorage:set', 'editor:layout:hierarchy:fold', false);
    });

    middle.append(hierarchyPanel);
    // expose
    editor.method('layout.left', function () { return hierarchyPanel; });
    editor.on('permissions:writeState', function (state: boolean) {
      hierarchyPanel.enabled = state;
    });
    if (window.innerWidth <= 480) {
      hierarchyPanel.folded = true;
    }
    VeryEngine.hierarchyPanel = hierarchyPanel;

    // center panel
    let center = new Panel();
    center.flexible = true;
    center.flexGrow = '1';
    center.flexDirection = 'column';
    middle.append(center);

    // viewport panel
    let viewport = new Panel();
    viewport.flexible = true;
    viewport.flexGrow = '1';
    viewport.class!.add('viewport');
    center.append(viewport);
    // expose
    editor.method('layout.viewport', function () { return viewport; });
    VeryEngine.viewPanel = viewport;

    // assets panel
    let assetsPanel = new Panel('资源窗口');
    assetsPanel.class!.add('assets');
    assetsPanel.foldable = true;
    assetsPanel.folded = editor.call('localStorage:get', 'editor:layout:assets:fold') || false;
    assetsPanel.flexShrink = '0';
    assetsPanel.innerElement!.style.height = editor.call('localStorage:get', 'editor:layout:assets:height') || '212px';
    assetsPanel.scroll = true;
    assetsPanel.resizable = 'top';
    assetsPanel.resizeMin = 106;
    assetsPanel.resizeMax = 106 * 6;
    assetsPanel.headerSize = -1;

    assetsPanel.on('resize', function () {
      editor.call('localStorage:set', 'editor:layout:assets:height', assetsPanel.innerElement!.style.height);
    });
    assetsPanel.on('fold', function () {
      editor.call('localStorage:set', 'editor:layout:assets:fold', true);
    });
    assetsPanel.on('unfold', function () {
      editor.call('localStorage:set', 'editor:layout:assets:fold', false);
    });

    center.append(assetsPanel);
    // expose
    editor.method('layout.assets', function () { return assetsPanel; });
    if (window.innerHeight <= 480) {
      assetsPanel.folded = true;
    }
    VeryEngine.assetPanel = assetsPanel;


    // attributes panel
    let attributesPanel = new Panel('属性窗口');
    attributesPanel.enabled = true;
    attributesPanel.class!.add('attributes');
    attributesPanel.flexShrink = '0';
    let attributesPanelWidth = editor.call('localStorage:get', 'editor:layout:attributes:width') || '320px';
    attributesPanel.style!.width = attributesPanelWidth;
    attributesPanel.innerElement!.style.width = attributesPanelWidth;
    attributesPanel.horizontal = true;
    attributesPanel.foldable = true;
    attributesPanel.folded = editor.call('localStorage:get', 'editor:layout:attributes:fold') || false;
    attributesPanel.scroll = true;
    attributesPanel.resizable = 'left';
    attributesPanel.resizeMin = 256;
    attributesPanel.resizeMax = 512;

    attributesPanel.on('resize', function () {
      editor.call('localStorage:set', 'editor:layout:attributes:width', attributesPanel.innerElement!.style.width);
    });
    attributesPanel.on('fold', function () {
      editor.call('localStorage:set', 'editor:layout:attributes:fold', true);
    });
    attributesPanel.on('unfold', function () {
      editor.call('localStorage:set', 'editor:layout:attributes:fold', false);
    });

    middle.append(attributesPanel);
    // expose
    editor.method('layout.right', function () { return attributesPanel; });
    editor.on('permissions:writeState', function (state: boolean) {
      attributesPanel.enabled = state;
    });
    if (window.innerWidth <= 720) {
      attributesPanel.folded = true;
    }
    VeryEngine.attributesPanel = attributesPanel;
  }


}