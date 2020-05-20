import { Panel, Button, Tooltip } from "../../ui";
import { VeryEngine } from "../../engine";

export class ToolbarTopControl {




  public constructor() {

    // panel
    var panel = new Panel();
    panel.class!.add('top-controls');
    VeryEngine.viewportPanel.append(panel);

    editor.method('layout.toolbar.launch', function () {
      return panel;
    });

    // fullscreen button
    var buttonExpand = new Button('&#57639;');
    buttonExpand.class!.add('icon', 'expand');
    panel.append(buttonExpand);

    buttonExpand.on('click', function () {
      editor.call('viewport:expand');
    });

    editor.on('viewport:expand', function (state: boolean) {
      if (state) {
        tooltipExpand.text = '还原';
        buttonExpand.class!.add('active');
      } else {
        tooltipExpand.text = '最大化';
        buttonExpand.class!.remove('active');
      }

      tooltipExpand.hidden = true;
    });

    var tooltipExpand = Tooltip.attach({
      target: buttonExpand.element!,
      text: '最大化',
      align: 'top',
      root: VeryEngine.root
    });


  }


}