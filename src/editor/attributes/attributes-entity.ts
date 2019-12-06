import { Panel } from '../../ui';
import { Observer } from '../../lib';

export class AttributesEntity {


  public panelComponents: Panel;

  public items: any;


  public inspectEvents: EventHandle[] = [];


  public constructor() {
    this.panelComponents = editor.call('attributes:addPanel');

    /* ***scene结构***
     * 1. 自定义结构，关联assets数据，避免数据冗余下载；
     * 2. 
    */

    /* ***game结构***
     * 1. game与scene非常类似，但是不应该是同一个；
     * 2. 想办法从scene中复制出一个一模一样的场景，直接运行，与原始scene脱离连接关系；
     * 3. 摄像机等组件自定义更新；
     * 4. 运行时，game和scene如何协同，类似unity运行过程中编辑；
    */

    /* ***assets结构***
     * 1. 多种资源，如模型、图片、声音等；
     * 2. 使用自定义格式；
    */

    /***原始数据：
     * 1.babylon;
     *  （1）babylon用于完整的scene描述，所以包含了许多不必要的信息，需要删除，比如灯光、相机等；
     *  （2）用户可能分多次上传模型，假设上传的是babylon怎么办？后续使用时，可能只需要部分模型，在unity中，是把整个模型丢进scene里面，然后从scene里面拖动预制件到Project，创建出新的数据结构；
     *  （3）加载模型，使用babylon的现有函数，支持.babylon、.gltf、stl、obj；
     * 2.glTF;
     * 3.fbx;
     * 4.obj/stl;

    */

    this.init();

  }


  private init(): void {

    let self = this;


    let inspectEvents = [];

    /** 
    // link data to fields when inspecting
    editor.on('attributes:inspect[entity]', function (entities: Observer[]) {
      if (entities.length > 1) {
        editor.call('attributes:header', entities.length + ' Entities');
      } else {
        editor.call('attributes:header', 'Entity');
      }

      if (!self.items)
        self.initialize();

      let root = editor.call('attributes.rootPanel');

      if (!self.items.panel.parent)
        root.append(self.items.panel);

      if (!self.items.panelComponents.parent)
        root.append(self.items.panelComponents);

      // disable renderChanges
      for (let i = 0; i < argsFieldsChanges.length; i++)
        argsFieldsChanges[i].renderChanges = false;

      // link fields
      for (let i = 0; i < argsList.length; i++) {
        argsList[i].link = entities;
        argsList[i].linkField();
      }

      // enable renderChanges
      for (let i = 0; i < argsFieldsChanges.length; i++)
        argsFieldsChanges[i].renderChanges = true;

      // disable fields if needed
      self.toggleFields(entities);

      self.onInspect(entities);
    });
    */

    editor.on('attributes:clear', function () {
      self.onUninspect();
    });

  }




  private initialize(): void {

  }


  private toggleFields(selectedEntities: Observer[]): void {
    let self = this;
    let disablePositionXY = false;
    let disableRotation = false;
    let disableScale = false;

    for (let i = 0, len = selectedEntities.length; i < len; i++) {
      let entity = selectedEntities[i];

      // disable rotation / scale for 2D screens
      // if (entity.get('components.screen.screenSpace')) {
      //   disableRotation = true;
      //   disableScale = true;
      // }

      // disable position on the x/y axis for elements that are part of a layout group
      if (editor.call('entities:layout:isUnderControlOfLayoutGroup', entity)) {
        disablePositionXY = true;
      }
    }

    self.items.fieldPosition[0].enabled = !disablePositionXY;
    self.items.fieldPosition[1].enabled = !disablePositionXY;

    for (let i = 0; i < 3; i++) {
      self.items.fieldRotation[i].enabled = !disableRotation;
      self.items.fieldScale[i].enabled = !disableScale;

      self.items.fieldRotation[i].renderChanges = !disableRotation;
      self.items.fieldScale[i].renderChanges = !disableScale;
    }

  };


  private onInspect(entities: Observer[]): void {
    let self = this;

    this.onUninspect();

    let addEvents = function (entity: Observer) {
      self.inspectEvents.push(entity.on('*:set', function (path: string) {
        if (/components.screen.screenSpace/.test(path) ||
          /^parent/.test(path) ||
          /components.layoutchild.excludeFromLayout/.test(path)) {
          toggleFieldsIfNeeded(entity);
        }
      }));
    };

    let toggleFieldsIfNeeded = function (entity: Observer) {
      if (editor.call('selector:has', entity))
        self.toggleFields(editor.call('selector:items'));
    };


    for (let i = 0, len = entities.length; i < len; i++) {
      addEvents(entities[i]);
    }
  };

  private onUninspect(): void {
    let self = this;
    for (let i = 0; i < self.inspectEvents.length; i++) {
      self.inspectEvents[i].unbind();
    }
    self.inspectEvents.length = 0;
  };

}


export class AttributesFieldArgs {


  public panel!: Panel;




}