import { VeryEngine } from "../../engine";
import { Button, Tooltip } from "../../ui";

export class ToolbarHelp {

    public constructor() {
        var toolbar = VeryEngine.toolbar;

        var button = new Button('&#57656;');
        button.class!.add('pc-icon', 'help-howdoi', 'bottom', 'push-top');
        toolbar.append(button);

        button.on('click', function () {
            editor.call('help:howdoi:toggle');
        });

        editor.on('help:howdoi:open', function () {
            button.class!.add('active');
        });

        editor.on('help:howdoi:close', function () {
            button.class!.remove('active');
        });

        Tooltip.attach({
            target: button.element!,
            text: 'How do I...?',
            align: 'left',
            root: editor.call('layout.root')
        });

    }
}