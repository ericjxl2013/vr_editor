import { Button, Tooltip } from "../../ui";

export class ToolbarGizmos {

    public constructor() {

        var root = editor.call('layout.root');
        var toolbar = editor.call('layout.toolbar');

        var activeGizmo: Nullable<Button> = null;
        var gizmoButtons: { [key: string]: Button } = {};

        // create gizmo type buttons
        [{
            icon: '&#57617;',
            tooltip: 'Translate',
            op: 'translate'
        }, {
            icon: '&#57619;',
            tooltip: 'Rotate',
            op: 'rotate'
        }, {
            icon: '&#57618;',
            tooltip: 'Scale',
            op: 'scale'
        }, {
            icon: '&#57666;',
            tooltip: 'Resize Element Component',
            op: 'resize'
        }].forEach(function (item, index) {
            var button = new Button(item.icon);
            // button.hidden = !editor.call('permissions:write');
            button.op = item.op;
            button.class!.add('pc-icon');

            gizmoButtons[item.op] = button;

            button.on('click', function () {
                if (activeGizmo!.op === button.op)
                    return;

                activeGizmo!.class!.remove('active');
                activeGizmo!.tooltip!.class!.add('innactive');
                activeGizmo = button;
                activeGizmo!.class!.add('active');
                activeGizmo!.tooltip!.class!.remove('innactive');

                editor.call('gizmo:type', button.op);
            });

            toolbar.append(button);

            button.tooltip = Tooltip.attach({
                target: button.element!,
                text: item.tooltip,
                align: 'left',
                root: root
            });

            if (item.op === 'translate') {
                activeGizmo = button;
                button.class!.add('active');
            } else {
                button.tooltip.class!.add('innactive');
            }
        });


        // coordinate system
        var buttonWorld = new Button('&#57624;');
        // buttonWorld.hidden = !editor.call('permissions:write');
        buttonWorld.class!.add('pc-icon', 'active');
        toolbar.append(buttonWorld);

        buttonWorld.on('click', function () {
            if (buttonWorld.class!.contains('active')) {
                buttonWorld.class!.remove('active');
                tooltipWorld.html = 'World / <span style="color:#fff">Local</span>';
            } else {
                buttonWorld.class!.add('active');
                tooltipWorld.html = '<span style="color:#fff">World</span> / Local';
            }
            editor.call('gizmo:coordSystem', buttonWorld.class!.contains('active') ? 'world' : 'local');
        });

        var tooltipWorld = Tooltip.attach({
            target: buttonWorld.element!,
            align: 'left',
            root: root
        });
        tooltipWorld.html = '<span style="color:#fff">World</span> / Local';
        tooltipWorld.class!.add('innactive');


        // toggle grid snap
        var buttonSnap = new Button('&#57622;');
        // buttonSnap.hidden = !editor.call('permissions:write');
        buttonSnap.class!.add('pc-icon');
        buttonSnap.on('click', function () {
            if (buttonSnap.class!.contains('active')) {
                buttonSnap.class!.remove('active');
                tooltipSnap.class!.add('innactive');
            } else {
                buttonSnap.class!.add('active');
                tooltipSnap.class!.remove('innactive');
            }
            editor.call('gizmo:snap', buttonSnap.class!.contains('active'));
        });
        toolbar.append(buttonSnap);

        var tooltipSnap = Tooltip.attach({
            target: buttonSnap.element!,
            text: 'Snap',
            align: 'left',
            root: root
        });
        tooltipSnap.class!.add('innactive');


        editor.on('permissions:writeState', function (state: boolean) {
            for (var key in gizmoButtons) {
                // gizmoButtons[key].hidden = !state;
            }

            // buttonWorld.hidden = !state;
            // buttonSnap.hidden = !state;
        });


        // focus on entity
        var buttonFocus = new Button('&#57623;');
        buttonFocus.disabled = true;
        buttonFocus.class!.add('pc-icon');
        buttonFocus.on('click', function () {
            editor.call('viewport:focus');
        });
        toolbar.append(buttonFocus);

        editor.on('attributes:clear', function () {
            buttonFocus.disabled = true;
            tooltipFocus.class!.add('innactive');
        });
        editor.on('attributes:inspect[*]', function (type: string) {
            buttonFocus.disabled = type !== 'entity';
            if (type === 'entity') {
                tooltipFocus.class!.remove('innactive');
            } else {
                tooltipFocus.class!.add('innactive');
            }
        });

        var tooltipFocus = Tooltip.attach({
            target: buttonFocus.element!,
            text: 'Focus',
            align: 'left',
            root: root
        });
        tooltipFocus.class!.add('innactive');



    }

}