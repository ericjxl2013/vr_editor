import { Panel, Label, Progress, Element, TextField, Button, TextAreaField, Slider, NumberField, Checkbox, ColorField, ImageField, Code, SelectField, TopElementPanel } from "../../ui";
import { VeryEngine } from "../../engine";
import { Observer, EventHandle } from "../../lib";

export class AttributesPanel {


    public root: TopElementPanel;

    // private inspectedItems: EventHandle[] = [];

    public title: string = '属性面板';

    public constructor() {
        this.root = VeryEngine.attributes;

        this.init();

    }

    private init(): void {
        let self = this;

        // clearing
        editor.method('attributes:clear', this.clearPanel);

        // set header
        editor.method('attributes:header', (text: string) => {
            self.root.headerText = text;
        });

        // return root panel
        editor.method('attributes.rootPanel', function () {
            return self.root;
        });

        // add panel
        editor.method('attributes:addPanel', function (args: AddPanelArgs) {
            args = args || {};

            // panel
            let panel = new Panel(args.name || '');
            // parent
            (args.parent || self.root).append(panel);

            // folding
            panel.foldable = args.foldable || args.folded || false;
            panel.folded = args.folded || false;

            return panel;
        });

        // TODO
        var historyState = function (item: any, state: boolean) {
            if (item.history !== undefined) {
                if (typeof (item.history) === 'boolean') {
                    item.history = state;
                } else {
                    item.history.enabled = state;
                }
            } else {
                if (item._parent && item._parent.history !== undefined) {
                    item._parent.history.enabled = state;
                }
            }
        };

        // get the right path from args
        var pathAt = function (args: any, index: number) {
            return args.paths ? args.paths[index] : args.path;
        };

        editor.method('attributes:linkField', function (args: any) {
            var changeField, changeFieldQueue;
            args.field._changing = false;
            var events: any = [];

            if (!(args.link instanceof Array))
                args.link = [args.link];

            var update = function () {
                var different = false;
                var path = pathAt(args, 0);
                var value = args.link[0].has(path) ? args.link[0].get(path) : undefined;
                if (args.type === 'rgb') {
                    if (value) {
                        for (var i = 1; i < args.link.length; i++) {
                            path = pathAt(args, i);
                            if (!value.equals(args.link[i].get(path))) {
                                value = null;
                                different = true;
                                break;
                            }
                        }
                    }
                    if (value) {
                        value = value.map(function (v: number) {
                            return Math.floor(v * 255);
                        });
                    }
                } else if (args.type === 'asset') {
                    var countUndefined = value === undefined ? 1 : 0;
                    for (var i = 1; i < args.link.length; i++) {
                        path = pathAt(args, i);
                        if (!args.link[i].has(path)) {
                            countUndefined++;
                            continue;
                        }

                        var val = args.link[i].get(path);

                        if ((value || 0) !== (args.link[i].get(path) || 0)) {
                            if (value !== undefined) {
                                value = args.enum ? '' : null;
                                different = true;
                                break;
                            }
                        }

                        value = val;
                    }

                    if (countUndefined && countUndefined != args.link.length) {
                        args.field.class.add('star');
                        if (! /^\* /.test(args.field._title.text))
                            args.field._title.text = '* ' + args.field._title.text;
                    } else {
                        args.field.class.remove('star');
                        if (/^\* /.test(args.field._title.text))
                            args.field._title.text = args.field._title.text.substring(2);
                    }

                    if (different) {
                        args.field.class.add('null');
                        args.field._title.text = 'various';
                    } else {
                        args.field.class.remove('null');
                    }
                } else if (args.type === 'entity' || !args.type) {
                    for (var i = 1; i < args.link.length; i++) {
                        path = pathAt(args, i);
                        if (value !== args.link[i].get(path)) {
                            value = 'various';
                            different = true;
                            break;
                        }
                    }
                    if (different) {
                        args.field.class.add('null');
                        args.field.text = 'various';
                    } else {
                        args.field.class.remove('null');
                    }
                } else {
                    var valueFound = false;
                    for (var i = 0; i < args.link.length; i++) {
                        path = pathAt(args, i);
                        if (!args.link[i].has(path))
                            continue;

                        if (!valueFound) {
                            valueFound = true;
                            value = args.link[i].get(path);
                        } else {
                            var v = args.link[i].get(path);
                            if ((value || 0) !== (v || 0)) {
                                value = args.enum ? '' : null;
                                different = true;
                                break;
                            }
                        }
                    }
                }

                args.field._changing = true;
                args.field.value = value;

                if (args.type === 'checkbox')
                    args.field._onLinkChange(value);

                args.field._changing = false;

                if (args.enum) {
                    var opt = args.field.optionElements[''];
                    if (opt) opt.style.display = value !== '' ? 'none' : '';
                } else {
                    args.field.proxy = value == null ? '...' : null;
                }
            };

            changeField = function (value: any) {
                if (args.field._changing)
                    return;

                // TODO
                if (args.enum) {
                    // var opt = this.optionElements[''];
                    // if (opt) opt.style.display = value !== '' ? 'none' : '';
                } else {
                    // this.proxy = value === null ? '...' : null;
                }

                if (args.trim)
                    value = value.trim();

                if (args.type === 'rgb') {
                    value = value.map(function (v: number) {
                        return v / 255;
                    });
                } else if (args.type === 'asset') {
                    args.field.class.remove('null');
                }

                var items: any = [];

                // set link value
                args.field._changing = true;
                if (args.type === "string" && args.trim)
                    args.field.value = value;

                for (var i = 0; i < args.link.length; i++) {
                    var path = pathAt(args, i);
                    if (!args.link[i].has(path)) continue;

                    items.push({
                        get: args.link[i].history !== undefined ? args.link[i].history._getItemFn : null,
                        item: args.link[i],
                        value: args.link[i].has(path) ? args.link[i].get(path) : undefined
                    });

                    historyState(args.link[i], false);
                    args.link[i].set(path, value);
                    historyState(args.link[i], true);
                }
                args.field._changing = false;

                // history
                if (args.type !== 'rgb' && !args.slider && !args.stopHistory) {
                    editor.call('history:add', {
                        name: pathAt(args, 0),
                        undo: function () {
                            var different = false;
                            for (var i = 0; i < items.length; i++) {
                                var path = pathAt(args, i);
                                var item;
                                if (items[i].get) {
                                    item = items[i].get();
                                    if (!item)
                                        continue;
                                } else {
                                    item = items[i].item;
                                }

                                if (!different && items[0].value !== items[i].value)
                                    different = true;

                                historyState(item, false);
                                if (items[i].value === undefined)
                                    item.unset(path);
                                else
                                    item.set(path, items[i].value);
                                historyState(item, true);
                            }

                            if (different) {
                                args.field.class.add('null');
                            } else {
                                args.field.class.remove('null');
                            }
                        },
                        redo: function () {
                            for (var i = 0; i < items.length; i++) {
                                var path = pathAt(args, i);
                                var item;
                                if (items[i].get) {
                                    item = items[i].get();
                                    if (!item)
                                        continue;
                                } else {
                                    item = items[i].item;
                                }

                                historyState(item, false);
                                if (value === undefined)
                                    item.unset(path);
                                else
                                    item.set(path, value);
                                item.set(path, value);
                                historyState(item, true);
                            }

                            args.field.class.remove('null');
                        }
                    });
                }
            };

            changeFieldQueue = function () {
                if (args.field._changing)
                    return;

                args.field._changing = true;
                setTimeout(function () {
                    args.field._changing = false;
                    update();
                }, 0);
            };

            var historyStart: any, historyEnd: any;

            if (args.type === 'rgb' || args.slider) {
                historyStart = function () {
                    var items = [];

                    for (var i = 0; i < args.link.length; i++) {
                        var v = args.link[i].get(pathAt(args, i));
                        if (v instanceof Array)
                            v = v.slice(0);

                        items.push({
                            get: args.link[i].history !== undefined ? args.link[i].history._getItemFn : null,
                            item: args.link[i],
                            value: v
                        });
                    }

                    return items;
                };

                historyEnd = function (items: any, value: any) {
                    // history
                    editor.call('history:add', {
                        name: pathAt(args, 0),
                        undo: function () {
                            for (var i = 0; i < items.length; i++) {
                                var item;
                                if (items[i].get) {
                                    item = items[i].get();
                                    if (!item)
                                        continue;
                                } else {
                                    item = items[i].item;
                                }

                                historyState(item, false);
                                item.set(pathAt(args, i), items[i].value);
                                historyState(item, true);
                            }
                        },
                        redo: function () {
                            for (var i = 0; i < items.length; i++) {
                                var item;
                                if (items[i].get) {
                                    item = items[i].get();
                                    if (!item)
                                        continue;
                                } else {
                                    item = items[i].item;
                                }

                                historyState(item, false);
                                item.set(pathAt(args, i), value);
                                historyState(item, true);
                            }
                        }
                    });
                };
            }

            if (args.type === 'rgb') {
                var colorPickerOn = false;
                events.push(args.field.on('click', function () {
                    colorPickerOn = true;

                    // set picker color
                    editor.call('picker:color', args.field.value);

                    var items: any = [];

                    // picking starts
                    var evtColorPickStart = editor.on('picker:color:start', function () {
                        items = historyStart();
                    });

                    // picked color
                    var evtColorPick = editor.on('picker:color', function (color: any) {
                        args.field.value = color;
                    });

                    var evtColorPickEnd = editor.on('picker:color:end', function () {
                        historyEnd(items.slice(0), args.field.value.map(function (v: number) {
                            return v / 255;
                        }));
                    });

                    // position picker
                    var rectPicker = editor.call('picker:color:rect');
                    var rectField = args.field.element.getBoundingClientRect();
                    editor.call('picker:color:position', rectField.left - rectPicker.width, rectField.top);

                    // color changed, update picker
                    var evtColorToPicker = args.field.on('change', function () {
                        // TODO
                        // editor.call('picker:color:set', this.value);
                    });

                    // picker closed
                    editor.once('picker:color:close', function () {
                        evtColorPick.unbind();
                        evtColorPickStart.unbind();
                        evtColorPickEnd.unbind();
                        evtColorToPicker.unbind();
                        colorPickerOn = false;
                        args.field.element.focus();
                    });
                }));

                // close picker if field destroyed
                args.field.once('destroy', function () {
                    if (colorPickerOn)
                        editor.call('picker:color:close');
                });
            } else if (args.slider) {
                var sliderRecords: any;

                events.push(args.field.on('start', function () {
                    sliderRecords = historyStart();
                }));

                events.push(args.field.on('end', function () {
                    historyEnd(sliderRecords.slice(0), args.field.value);
                }));
            }

            update();
            events.push(args.field.on('change', changeField));

            for (var i = 0; i < args.link.length; i++) {
                events.push(args.link[i].on(pathAt(args, i) + ':set', changeFieldQueue));
                events.push(args.link[i].on(pathAt(args, i) + ':unset', changeFieldQueue));
            }

            events.push(args.field.once('destroy', function () {
                for (var i = 0; i < events.length; i++)
                    events[i].unbind();
            }));

            return events;
        });

        // add field
        editor.method('attributes:addField', function (args: any) {
            var panel = args.panel;

            if (!panel) {
                panel = new Panel();
                panel.flexWrap = 'nowrap';
                panel.WebkitFlexWrap = 'nowrap';
                panel.style.display = '';

                if (args.type) {
                    panel.class.add('field-' + args.type);
                } else {
                    panel.class.add('field');
                }

                (args.parent || self.root).append(panel);
            }

            if (args.name) {
                var label = new Label(args.name);
                label.class!.add('label-field');
                panel._label = label;
                panel.append(label);

                if (args.reference) {
                    var tooltip = label.tooltip = editor.call('attributes:reference', {
                        element: label.element,
                        title: args.reference.title,
                        subTitle: args.reference.subTitle,
                        description: args.reference.description
                    });

                    tooltip.attach({
                        target: label,
                        element: label.element
                    });
                }
            }

            var field: any;

            args.linkEvents = [];

            // if we provide multiple paths for a single Observer then turn args.link into an array
            if (args.paths && args.paths instanceof Array && args.link && !(args.link instanceof Array)) {
                var link = args.link;
                args.link = [];
                for (var i = 0; i < args.paths.length; i++) {
                    args.link.push(link);
                }
            }

            var linkField = args.linkField = function () {
                if (args.link) {
                    var link = function (field: any, path?: any) {
                        var data = {
                            field: field,
                            type: args.type,
                            slider: args.slider,
                            enum: args.enum,
                            link: args.link,
                            trim: args.trim,
                            name: args.name,
                            stopHistory: args.stopHistory,
                            paths: new Array<any>(),
                            path: ''
                        };

                        if (!path) {
                            path = args.paths || args.path;
                        }

                        if (path instanceof Array) {
                            data.paths = path;
                        } else {
                            data.path = path;
                        }

                        args.linkEvents = args.linkEvents.concat(editor.call('attributes:linkField', data));

                        // Give the field a uniquely addressable css class that we can target from Selenium
                        if (field.element && typeof path === 'string') {
                            field.element.classList.add('field-path-' + path.replace(/\./g, '-'));
                        }
                    };

                    if (field instanceof Array) {
                        for (var i = 0; i < field.length; i++) {
                            var paths = args.paths;

                            if (paths) {
                                paths = paths.map(function (p: string) {
                                    return p + '.' + i.toString();
                                });
                            }

                            link(field[i], paths || (args.path + '.' + i));
                        }
                    } else {
                        link(field);
                    }
                }
            };

            var unlinkField = args.unlinkField = function () {
                for (var i = 0; i < args.linkEvents.length; i++)
                    args.linkEvents[i].unbind();

                args.linkEvents = [];
            };


            switch (args.type) {
                case 'string':
                    if (args.enum) {
                        field = new SelectField({
                            options: args.enum
                        });
                    } else {
                        field = new TextField();
                    }

                    field.value = args.value || '';
                    field.flexGrow = 1;

                    if (args.placeholder)
                        field.placeholder = args.placeholder;

                    linkField();

                    panel.append(field);
                    break;

                case 'text':
                    field = new TextAreaField();

                    field.value = args.value || '';
                    field.flexGrow = 1;

                    if (args.placeholder)
                        field.placeholder = args.placeholder;

                    linkField();

                    panel.append(field);
                    break;

                case 'number':
                    if (args.enum) {
                        field = new SelectField({
                            options: args.enum,
                            type: 'number'
                        });
                    } else if (args.slider) {
                        field = new Slider();
                    } else {
                        field = new NumberField();
                    }

                    field.value = args.value || 0;
                    field.flexGrow = 1;

                    if (args.allowNull) {
                        field.allowNull = true;
                    }

                    if (args.placeholder)
                        field.placeholder = args.placeholder;

                    if (args.precision != null)
                        field.precision = args.precision;

                    if (args.step != null)
                        field.step = args.step;

                    if (args.min != null)
                        field.min = args.min;

                    if (args.max != null)
                        field.max = args.max;

                    linkField();

                    panel.append(field);
                    break;

                case 'checkbox':
                    if (args.enum) {
                        field = new SelectField({
                            options: args.enum,
                            type: 'boolean'
                        });
                        field.flexGrow = 1;
                    } else {
                        field = new Checkbox();
                    }

                    field.value = args.value || 0;
                    field.class.add('tick');

                    linkField();

                    panel.append(field);
                    break;

                default:
                    field = new Label();
                    field.flexGrow = '1';
                    field.text = args.value || '';
                    field.class.add('selectable');

                    if (args.placeholder)
                        field.placeholder = args.placeholder;

                    linkField();

                    panel.append(field);
                    break;

            }

            if (args.className && field instanceof Element) {
                field.class!.add(args.className);
            }

            return field;
        });




        var inspectedItems: any[] = [];


        editor.on('attributes:clear', function () {
            for (let i = 0; i < inspectedItems.length; i++) {
                inspectedItems[i].unbind();
            }
            inspectedItems = [];
        });

        editor.method('attributes:inspect', function (type: string, item: Observer) {
            self.clearPanel();

            // clear if destroyed
            inspectedItems.push(item.once('destroy', function () {
                editor.call('attributes:clear');
            }));

            self.root.headerText = type;

            editor.emit('attributes:inspect[' + type + ']', [item]);
            editor.emit('attributes:inspect[*]', type, [item]);
        });


        editor.on('selector:change', function (type: string, items: Observer[]) {
            self.clearPanel();

            console.warn('selector:change：type --- ' + type + '* length --- ' + items.length);

            // nothing selected
            if (items.length === 0) {
                let label = new Label('请选择物体或资源');
                label.style!.display = 'block';
                label.style!.textAlign = 'center';
                label.style!.width = '100%';
                // label.style!.height = '22px';
                self.root.append(label);
                self.root.headerText = self.title;
                return;
            }

            // clear if destroyed
            for (let i = 0; i < items.length; i++) {
                // TODO：当前item为空
                console.error(items[i]);
                inspectedItems.push(items[i].once('destroy', function () {
                    editor.call('attributes:clear');
                }));
            }

            self.root.headerText = type;

            console.error(type);
            console.error(items);

            editor.emit('attributes:inspect[' + type + ']', items);
            editor.emit('attributes:inspect[*]', type, items);
        });

        // 初始时，默认没有选中物体
        editor.emit('selector:change', null, []);

    }


    public clearPanel(): void {
        editor.emit('attributes:beforeClear');
        this.root.clear();
        editor.emit('attributes:clear');
    }




}


export interface AddPanelArgs {
    name?: string;
    parent?: Panel;
    foldable?: boolean;
    folded?: boolean;
}