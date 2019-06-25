(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var Editor = /** @class */ (function (_super) {
    __extends(Editor, _super);
    function Editor() {
        var _this = _super.call(this) || this;
        // 某个name对应的某个事件，name与Function是1对1的关系；
        _this._hooks = {};
        return _this;
    }
    /**
     * 添加全局函数，函数名与函数本体一一对象，不能重名；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    Editor.prototype.method = function (name, fn) {
        if (this._hooks[name] !== undefined) {
            throw new Error("can't override hook: " + name);
        }
        this._hooks[name] = fn;
    };
    ;
    /**
     * 移除某个函数；
     * @param name 函数名；
     */
    Editor.prototype.methodRemove = function (name) {
        delete this._hooks[name];
    };
    ;
    /**
     * 执行某个函数；
     * @param name 函数名；
     */
    Editor.prototype.call = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this._hooks[name]) {
            var args = Array.prototype.slice.call(arguments, 1);
            try {
                return this._hooks[name].apply(null, args);
            }
            catch (ex) {
                console.error("%c%s %c(editor.method error)", "color: #06f", name, "color: #f00");
                console.error(ex.stack);
            }
        }
        return null;
    };
    ;
    return Editor;
}(lib_1.Events));
exports.Editor = Editor;
},{"../lib":14}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var Hierarchy = /** @class */ (function () {
    function Hierarchy() {
        this.controls = new ui_1.Panel();
        this.controls.class.add('hierarchy-controls');
        this.controls.parent = engine_1.VeryEngine.hierarchyPanel;
        engine_1.VeryEngine.hierarchyPanel.headerAppend(this.controls);
        console.log('hierarchy-controls');
    }
    Hierarchy.prototype.init = function () {
        // left control
    };
    return Hierarchy;
}());
exports.Hierarchy = Hierarchy;
},{"../../engine":10,"../../ui":20}],3:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./hierarchy"));
},{"./hierarchy":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hotkeys = /** @class */ (function () {
    function Hotkeys() {
    }
    Hotkeys.ctrl = false;
    Hotkeys.shift = false;
    Hotkeys.alt = false;
    return Hotkeys;
}());
exports.Hotkeys = Hotkeys;
},{}],5:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./editor"));
__export(require("./layout"));
__export(require("./viewport"));
__export(require("./hierarchy"));
__export(require("./hotkeys"));
},{"./editor":1,"./hierarchy":3,"./hotkeys":4,"./layout":6,"./viewport":7}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../ui");
var engine_1 = require("../engine");
var Layout = /** @class */ (function () {
    function Layout() {
        this.ignoreClasses = /(ui-list-item)|(ui-button)|(ui-text-field)|(ui-number-field)/i;
        this.ignoreElements = /(input)|(textarea)/i;
        var self = this;
        // prevent drag'n'select
        window.addEventListener('mousedown', function (evt) {
            // don't prevent for certain cases
            if (evt.target) {
                if (self.ignoreClasses.test(evt.target.className)) {
                    return;
                }
                else if (self.ignoreElements.test(evt.target.tagName)) {
                    return;
                }
                else if (evt.target.classList.contains('selectable')) {
                    return;
                }
            }
            // blur inputs
            if (window.getSelection) {
                var focusNode = window.getSelection().focusNode;
                if (focusNode) {
                    if (focusNode.tagName === 'INPUT') {
                        focusNode.blur();
                    }
                    else if (focusNode.firstChild && focusNode.firstChild.tagName === 'INPUT') {
                        focusNode.firstChild.blur();
                    }
                }
            }
            // prevent default will prevent blur, dragstart and selection
            evt.preventDefault();
        }, false);
    }
    Layout.prototype.init = function () {
        // main container
        var root = new ui_1.Panel();
        root.element.id = 'ui-root';
        root.flex = true;
        root.flexDirection = 'column';
        root.flexWrap = 'nowrap';
        root.scroll = true;
        document.body.appendChild(root.element);
        // expose
        editor.method('layout.root', function () { return root; });
        engine_1.VeryEngine.rootPanel = root;
        // top panel TODO: top干嘛用？
        var top = new ui_1.Panel();
        top.style.backgroundColor = '#5f6f72';
        top.style.cursor = 'pointer';
        top.element.id = 'ui-top';
        top.flexShrink = '0';
        top.once('click', function () {
            top.destroy();
            // TODO
            top.style.marginTop = '';
        });
        root.append(top);
        // middle panel
        var middle = new ui_1.Panel();
        middle.element.id = 'ui-middle';
        middle.flexible = true;
        middle.flexGrow = '1';
        root.append(middle);
        // bottom panel (status)
        var bottom = new ui_1.Panel();
        bottom.element.id = 'ui-bottom';
        bottom.flexShrink = '0';
        root.append(bottom);
        // expose
        editor.method('layout.bottom', function () { return bottom; });
        // toolbar panel (left)
        var toolbar = new ui_1.Panel();
        toolbar.element.id = 'ui-toolbar';
        toolbar.flexShrink = '0';
        toolbar.style.width = '45px';
        middle.append(toolbar);
        // expose
        editor.method('layout.toolbar', function () { return toolbar; });
        engine_1.VeryEngine.toolbarPanel = toolbar;
        // hierarchy
        var hierarchyPanel = new ui_1.Panel('层级窗口');
        hierarchyPanel.enabled = false;
        hierarchyPanel.class.add('hierarchy');
        hierarchyPanel.flexShrink = '0';
        var hierarchyPanelSize = editor.call('localStorage:get', 'editor:layout:hierarchy:width') || '256px';
        hierarchyPanel.style.width = hierarchyPanelSize;
        hierarchyPanel.innerElement.style.width = hierarchyPanelSize;
        hierarchyPanel.foldable = true;
        hierarchyPanel.folded = editor.call('localStorage:get', 'editor:layout:hierarchy:fold') || false;
        hierarchyPanel.horizontal = true;
        hierarchyPanel.scroll = true;
        hierarchyPanel.resizable = 'right';
        hierarchyPanel.resizeMin = 196;
        hierarchyPanel.resizeMax = 512;
        hierarchyPanel.on('resize', function () {
            editor.call('localStorage:set', 'editor:layout:hierarchy:width', hierarchyPanel.style.width);
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
        editor.on('permissions:writeState', function (state) {
            hierarchyPanel.enabled = state;
        });
        if (window.innerWidth <= 480) {
            hierarchyPanel.folded = true;
        }
        engine_1.VeryEngine.hierarchyPanel = hierarchyPanel;
        // center panel
        var center = new ui_1.Panel();
        center.flexible = true;
        center.flexGrow = '1';
        center.flexDirection = 'column';
        middle.append(center);
        // viewport panel
        var viewport = new ui_1.Panel();
        viewport.flexible = true;
        viewport.flexGrow = '1';
        viewport.class.add('viewport');
        center.append(viewport);
        // expose
        editor.method('layout.viewport', function () { return viewport; });
        engine_1.VeryEngine.viewPanel = viewport;
        // assets panel
        var assetsPanel = new ui_1.Panel('资源窗口');
        assetsPanel.class.add('assets');
        assetsPanel.foldable = true;
        assetsPanel.folded = editor.call('localStorage:get', 'editor:layout:assets:fold') || false;
        assetsPanel.flexShrink = '0';
        assetsPanel.innerElement.style.height = editor.call('localStorage:get', 'editor:layout:assets:height') || '212px';
        assetsPanel.scroll = true;
        assetsPanel.resizable = 'top';
        assetsPanel.resizeMin = 106;
        assetsPanel.resizeMax = 106 * 6;
        assetsPanel.headerSize = -1;
        assetsPanel.on('resize', function () {
            editor.call('localStorage:set', 'editor:layout:assets:height', assetsPanel.innerElement.style.height);
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
        engine_1.VeryEngine.assetPanel = assetsPanel;
        // attributes panel
        var attributesPanel = new ui_1.Panel('属性窗口');
        attributesPanel.enabled = false;
        attributesPanel.class.add('attributes');
        attributesPanel.flexShrink = '0';
        var attributesPanelWidth = editor.call('localStorage:get', 'editor:layout:attributes:width') || '320px';
        attributesPanel.style.width = attributesPanelWidth;
        attributesPanel.innerElement.style.width = attributesPanelWidth;
        attributesPanel.horizontal = true;
        attributesPanel.foldable = true;
        attributesPanel.folded = editor.call('localStorage:get', 'editor:layout:attributes:fold') || false;
        attributesPanel.scroll = true;
        attributesPanel.resizable = 'left';
        attributesPanel.resizeMin = 256;
        attributesPanel.resizeMax = 512;
        attributesPanel.on('resize', function () {
            editor.call('localStorage:set', 'editor:layout:attributes:width', attributesPanel.innerElement.style.width);
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
        editor.on('permissions:writeState', function (state) {
            attributesPanel.enabled = state;
        });
        if (window.innerWidth <= 720) {
            attributesPanel.folded = true;
        }
        engine_1.VeryEngine.attributesPanel = attributesPanel;
    };
    return Layout;
}());
exports.Layout = Layout;
},{"../engine":10,"../ui":20}],7:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./viewport"));
},{"./viewport":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var Viewport = /** @class */ (function () {
    function Viewport() {
        var _this = this;
        var self = this;
        this.canvas = new ui_1.Canvas('canvas-3d');
        engine_1.VeryEngine.viewCanvas = this.canvas;
        this._canvas = this.canvas.element;
        // add canvas
        editor.call('layout.viewport').prepend(this.canvas);
        // get canvas
        editor.method('viewport:canvas', function () {
            return self.canvas;
        });
        // update viewpot 视窗大小
        setInterval(function () {
            var rect = engine_1.VeryEngine.viewPanel.element.getBoundingClientRect();
            self.canvas.resize(Math.floor(rect.width), Math.floor(rect.height));
        }, 1000 / 60);
        this._engine = new BABYLON.Engine(this._canvas, true);
        var engine = this._engine;
        window.addEventListener("resize", function () {
            engine.resize();
        });
        this._scene = new BABYLON.Scene(this._engine);
        // TODO: 设定相机
        var camera = new BABYLON.ArcRotateCamera("MainCamera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), this._scene);
        camera.setPosition(new BABYLON.Vector3(20, 200, 400));
        camera.attachControl(this._canvas, true);
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.99;
        camera.lowerRadiusLimit = 150;
        // 加载过度动画开
        engine.displayLoadingUI();
        var inputMap = {};
        // TODO: 加载scene.babylon场景文件，当前为默认
        BABYLON.SceneLoader.Append("./scene/", "scene.babylon", this._scene, function (scene) {
            // do something with the scene
            // 加载过度动画关
            engine.hideLoadingUI();
            // Keyboard events
            var blue = scene.getMeshByName('blue');
            scene.actionManager = new BABYLON.ActionManager(scene);
            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
                inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            }));
            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
                inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            }));
            // // Game/Render loop
            scene.onBeforeRenderObservable.add(function () {
                if (inputMap["w"] || inputMap["ArrowUp"]) {
                    blue.position.z -= 100 * engine.getDeltaTime() / 1000;
                }
                if (inputMap["a"] || inputMap["ArrowLeft"]) {
                    blue.position.x += 100 * engine.getDeltaTime() / 1000;
                }
                if (inputMap["s"] || inputMap["ArrowDown"]) {
                    blue.position.z += 100 * engine.getDeltaTime() / 1000;
                }
                if (inputMap["d"] || inputMap["ArrowRight"]) {
                    blue.position.x -= 100 * engine.getDeltaTime() / 1000;
                }
            });
            // // sphere
            var sphere = scene.getMeshByName('sphere');
            sphere.actionManager = new BABYLON.ActionManager(scene);
            sphere.actionManager.registerAction(new BABYLON.SetValueAction({ trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: blue }, sphere, "scaling", new BABYLON.Vector3(2, 2, 2)));
            sphere.actionManager.registerAction(new BABYLON.SetValueAction({ trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: blue }, sphere, "scaling", new BABYLON.Vector3(1, 1, 1)));
        });
        this._engine.runRenderLoop(function () {
            if (_this._canvas.width !== _this._canvas.clientWidth) {
                _this._engine.resize();
            }
            if (_this._scene) {
                _this._scene.render();
            }
            // if (this._showFps) {
            // 	this.updateFpsPos();
            // }
        });
        // return this;
    }
    return Viewport;
}());
exports.Viewport = Viewport;
},{"../../engine":10,"../../ui":20}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BabylonEngine = /** @class */ (function () {
    function BabylonEngine() {
    }
    return BabylonEngine;
}());
exports.BabylonEngine = BabylonEngine;
},{}],10:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./babylon-engine"));
__export(require("./very-engine"));
},{"./babylon-engine":9,"./very-engine":11}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VeryEngine = /** @class */ (function () {
    function VeryEngine() {
    }
    return VeryEngine;
}());
exports.VeryEngine = VeryEngine;
},{}],12:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./lib"));
__export(require("./editor"));
__export(require("./ui"));
__export(require("./engine"));
},{"./editor":5,"./engine":10,"./lib":14,"./ui":20}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Events = /** @class */ (function () {
    function Events() {
        this._suspendEvents = false;
        // 某个name对应的事件数组，name与Function是1对多的关系；
        this._events = {};
    }
    Object.defineProperty(Events.prototype, "suspendEvents", {
        get: function () {
            return this._suspendEvents;
        },
        set: function (val) {
            this._suspendEvents = val;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 添加事件数组，若name相同，则在数组末尾继续添加；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    Events.prototype.on = function (name, fn) {
        var events = this._events[name];
        if (events === undefined) {
            this._events[name] = [fn];
        }
        else {
            if (events.indexOf(fn) == -1) {
                events.push(fn);
            }
        }
        return new EventHandle(this, name, fn);
    };
    /**
     * emit后只执行一次；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    Events.prototype.once = function (name, fn) {
        var self = this;
        var evt = this.on(name, function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            fn.call(self, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
            evt.unbind();
        });
        return evt;
    };
    /**
     * 执行事件；
     * @param name 函数名；
     * @param arg0 函数参数1，可选；
     * @param arg1 函数参数2，可选；
     * @param arg2 函数参数3，可选；
     * @param arg3 函数参数4，可选；
     * @param arg4 函数参数5，可选；
     * @param arg5 函数参数6，可选；
     * @param arg6 函数参数7，可选；
     * @param arg7 函数参数8，可选；
     */
    Events.prototype.emit = function (name, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        if (this._suspendEvents)
            return this;
        var events = this._events[name];
        if (!events)
            return this;
        // 返回新数组
        events = events.slice(0);
        for (var i = 0; i < events.length; i++) {
            if (!events[i])
                continue;
            try {
                events[i].call(this, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
            }
            catch (ex) {
                console.info("%c%s %c(event error)", "color: #06f", name, "color: #f00");
                console.log(ex.stack);
            }
        }
        return this;
    };
    ;
    /**
     * 取消Events事件绑定，若name为空，则清空events；
     * @param name 函数名；
     * @param fn 函数本体；
     */
    Events.prototype.unbind = function (name, fn) {
        if (name) {
            var events = this._events[name];
            if (!events)
                return this;
            if (fn) {
                var i = events.indexOf(fn);
                if (i !== -1) {
                    if (events.length === 1) {
                        delete this._events[name];
                    }
                    else {
                        events.splice(i, 1);
                    }
                }
            }
            else {
                delete this._events[name];
            }
        }
        else {
            this._events = {};
        }
        return this;
    };
    ;
    return Events;
}());
exports.Events = Events;
var EventHandle = /** @class */ (function () {
    function EventHandle(owner, name, fn) {
        this.owner = owner;
        this.name = name;
        this.fn = fn;
    }
    EventHandle.prototype.unbind = function () {
        if (!this.owner)
            return;
        this.owner.unbind(this.name, this.fn);
        this.owner = null;
        this.name = null;
        this.fn = null;
    };
    EventHandle.prototype.call = function () {
        if (!this.fn)
            return;
        this.fn.call(this.owner, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
    };
    EventHandle.prototype.on = function (name, fn) {
        return this.owner.on(name, fn);
    };
    return EventHandle;
}());
exports.EventHandle = EventHandle;
},{}],14:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./events"));
},{"./events":13}],15:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var editor_1 = require("./editor");
var engine_1 = require("./engine");
__export(require("./index"));
// 添加到全局变量
window.editor = new editor_1.Editor();
// 整体布局
var layout = new editor_1.Layout();
layout.init();
// 编辑视窗
var viewport = new editor_1.Viewport();
engine_1.VeryEngine.viewport = viewport;
// 层级菜单
var hierarchy = new editor_1.Hierarchy();
/* TEST
editor.once('load', () => {
  console.log('once');
});

editor.on('array', () => {
  console.log('1');
});
editor.on('array', () => {
  console.log('2');
});
editor.on('array', () => {
  console.log('3');
});

editor.on('array', (args0: any, args1: any) => {
  console.log(args0 + ' +++ ' +  args1);
});

editor.method('method', (a: any) => {
  console.log(a);
});


editor.emit('load');
editor.emit('load');

editor.emit('array', 'abc', 'dfg');
editor.emit('array');

editor.call('method', 123);
*/
// let parent: HTMLElement = document.getElementById('test')!;
// console.log('children');
// console.log(parent);
// console.log(parent.childNodes);
// for(let i: number = 0; i < parent.children.length; i++) {
//   (<HTMLElement>(parent.children[i])).ui = new Element();
//   console.warn((<HTMLElement>(parent.children[i])).ui === undefined);
//   console.log((<HTMLElement>(parent.children[i])).ui);
//   (<HTMLElement>(parent.children[i])).ui.destroy();
//   console.log(parent.children[i] instanceof HTMLElement);
// }
// console.log('childNodes');
// for(let i: number = 0; i < parent.childNodes.length; i++) {
//   console.log(parent.childNodes[i] instanceof HTMLElement);
// }
},{"./editor":5,"./engine":10,"./index":12}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var element_1 = require("./element");
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button(text) {
        var _this = _super.call(this) || this;
        _this._text = text ? text : '';
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-button');
        _this.element.innerHTML = _this._text;
        _this.element.ui = _this;
        _this.element.tabIndex = 0;
        // space > click
        _this.element.addEventListener('keydown', _this._onKeyDown, false);
        _this.on('click', _this._onClick);
        return _this;
    }
    Object.defineProperty(Button.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (val) {
            if (this._text === val)
                return;
            this._text = val;
            this.element.innerHTML = this._text;
        },
        enumerable: true,
        configurable: true
    });
    Button.prototype._onKeyDown = function (evt) {
        if (evt.keyCode === 27)
            return evt.target.blur();
        if (evt.keyCode !== 32 || this.disabled)
            return;
        evt.stopPropagation();
        evt.preventDefault();
        this.emit('click');
    };
    Button.prototype._onClick = function () {
        this.element.blur();
    };
    ;
    // TODO
    Button.prototype._onLinkChange = function (value) {
        this.element.value = value;
    };
    ;
    return Button;
}(element_1.Element));
exports.Button = Button;
},{"./element":19}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var element_1 = require("./element");
var Canvas = /** @class */ (function (_super) {
    __extends(Canvas, _super);
    function Canvas(id) {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('canvas');
        _this.element.classList.add('ui-canvas');
        if (id !== undefined)
            _this.element.id = id;
        _this.element.onselectstart = _this.onselectstart;
        return _this;
    }
    Object.defineProperty(Canvas.prototype, "width", {
        get: function () {
            return this.element ? this.element.width : 0;
        },
        set: function (val) {
            if (!this.element)
                return;
            if (this.element.width === val)
                return;
            this.element.width = val;
            this.emit("resize", this.element.width, this.element.height);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Canvas.prototype, "height", {
        get: function () {
            return this.element ? this.element.height : 0;
        },
        set: function (val) {
            if (!this.element)
                return;
            if (this.element.height === val)
                return;
            this.element.height = val;
            this.emit("resize", this.element.width, this.element.height);
        },
        enumerable: true,
        configurable: true
    });
    Canvas.prototype.onselectstart = function () {
        return false;
    };
    ;
    Canvas.prototype.resize = function (width, height) {
        if (this.element.width === width && this.element.height === height)
            return;
        this.element.width = width;
        this.element.height = height;
        this.emit("resize", this.element.width, this.element.height);
    };
    ;
    return Canvas;
}(element_1.Element));
exports.Canvas = Canvas;
},{"./element":19}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var element_1 = require("./element");
var ContainerElement = /** @class */ (function (_super) {
    __extends(ContainerElement, _super);
    function ContainerElement() {
        var _this = _super.call(this) || this;
        _this._innerElement = null;
        _this._observerChanged = false;
        _this._observerOptions = {
            childList: true,
            attributes: true,
            characterData: false,
            subtree: true,
            attributeOldValue: false,
            characterDataOldValue: false
        };
        var self = _this;
        var observerTimeout = function () {
            self._observerChanged = false;
            self.emit('nodesChanged');
            // console.warn('nodesChanged');
        };
        _this._observer = new MutationObserver(function () {
            if (self._observerChanged)
                return;
            self._observerChanged = true;
            setTimeout(observerTimeout, 0);
        });
        return _this;
    }
    Object.defineProperty(ContainerElement.prototype, "innerElement", {
        get: function () {
            return this._innerElement;
        },
        set: function (val) {
            if (this._innerElement) {
                this._observer.disconnect();
            }
            this._innerElement = val;
            this._observer.observe(this._innerElement, this._observerOptions);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContainerElement.prototype, "flexible", {
        get: function () {
            return this.element ? this.element.classList.contains('flexible') : false;
        },
        set: function (val) {
            if (!this.element || this.element.classList.contains('flexible') === val)
                return;
            if (val) {
                this.element.classList.add('flexible');
            }
            else {
                this.element.classList.remove('flexible');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContainerElement.prototype, "flex", {
        get: function () {
            return this.element ? this.element.classList.contains('flex') : false;
        },
        set: function (val) {
            if (!this.element || this.element.classList.contains('flex') === val)
                return;
            if (val) {
                this.element.classList.add('flex');
            }
            else {
                this.element.classList.remove('flex');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContainerElement.prototype, "flexDirection", {
        get: function () {
            return this._innerElement ? (this._innerElement.style.flexDirection || '') : '';
        },
        set: function (val) {
            if (this._innerElement) {
                this._innerElement.style.flexDirection = val;
                this._innerElement.style.webkitFlexDirection = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContainerElement.prototype, "flexWrap", {
        get: function () {
            return this._innerElement ? (this._innerElement.style.flexWrap || '') : '';
        },
        set: function (val) {
            if (this._innerElement) {
                this._innerElement.style.flexWrap = val;
                this._innerElement.style.webkitFlexWrap = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContainerElement.prototype, "flexGrow", {
        get: function () {
            return this.element ? (this.element.style.flexGrow || '') : '';
        },
        set: function (val) {
            if (!!val)
                this.flex = true;
            if (this.element) {
                this.element.style.flexGrow = val;
                this.element.style.webkitFlexGrow = val;
            }
            if (this._innerElement) {
                this._innerElement.style.flexGrow = val;
                this._innerElement.style.webkitFlexGrow = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContainerElement.prototype, "flexShrink", {
        get: function () {
            return this.element ? (this.element.style.flexShrink || '') : '';
        },
        set: function (val) {
            if (!!val)
                this.flex = true;
            if (this.element) {
                this.element.style.flexShrink = val;
                this.element.style.webkitFlexShrink = val;
            }
            if (this._innerElement) {
                this._innerElement.style.flexShrink = val;
                this._innerElement.style.webkitFlexShrink = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContainerElement.prototype, "scroll", {
        get: function () {
            return this.class ? this.class.contains('scrollable') : false;
        },
        set: function (val) {
            if (this.class)
                this.class.add('scrollable');
        },
        enumerable: true,
        configurable: true
    });
    ContainerElement.prototype.append = function (element) {
        var html = element instanceof HTMLElement;
        var node = html ? element : element.element;
        this._innerElement.appendChild(node);
        if (!html) {
            element.parent = this;
            this.emit('append', element);
        }
    };
    ContainerElement.prototype.appendBefore = function (element, reference) {
        var html = (element instanceof HTMLElement);
        var node = html ? element : element.element;
        if (reference instanceof element_1.Element)
            reference = reference.element;
        this._innerElement.insertBefore(node, reference);
        if (!html) {
            element.parent = this;
            this.emit('append', element);
        }
    };
    ;
    ContainerElement.prototype.appendAfter = function (element, reference) {
        var html = (element instanceof HTMLElement);
        var node = html ? element : element.element;
        if (reference instanceof element_1.Element)
            reference = reference.element;
        if (reference) {
            this._innerElement.insertBefore(node, reference.nextSibling);
        }
        else {
            this._innerElement.appendChild(node);
        }
        if (!html) {
            element.parent = this;
            this.emit('append', element);
        }
    };
    ;
    ContainerElement.prototype.prepend = function (element) {
        var first = this._innerElement.firstChild;
        var html = (element instanceof HTMLElement);
        var node = html ? element : element.element;
        if (first) {
            this._innerElement.insertBefore(node, first);
        }
        else {
            this._innerElement.appendChild(node);
        }
        if (!html) {
            element.parent = this;
            this.emit('append', element);
        }
    };
    ;
    ContainerElement.prototype.remove = function (element) {
        var html = (element instanceof HTMLElement);
        var node = html ? element : element.element;
        if (!node.parentElement || node.parentElement !== this._innerElement)
            return;
        this._innerElement.removeChild(node);
        if (!html) {
            element.parent = null;
            this.emit('remove', element);
        }
    };
    ;
    // TODO：怕不对
    ContainerElement.prototype.clear = function () {
        var node;
        this._observer.disconnect();
        var i = this._innerElement.children.length;
        while (i--) {
            node = (this._innerElement.children[i]);
            if (!node.ui)
                continue;
            node.ui.destroy();
        }
        this._innerElement.innerHTML = '';
        this._observer.observe(this._innerElement, this._observerOptions);
    };
    ;
    return ContainerElement;
}(element_1.Element));
exports.ContainerElement = ContainerElement;
},{"./element":19}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var Element = /** @class */ (function (_super) {
    __extends(Element, _super);
    function Element() {
        var _this = _super.call(this) || this;
        _this._parent = null;
        _this._destroyed = false;
        // TODO
        _this._link = null;
        /*
          on get set .schema.has .schema.get .history .history.combine .entity
        */
        _this._linkOnSet = null;
        _this._linkOnUnset = null;
        _this.path = '';
        _this.renderChanges = false;
        // TODO
        // // render changes only from next ticks
        // setTimeout(function() {
        //   if (self.renderChanges === null) self.renderChanges = true;
        // }, 0);
        _this.disabledClick = false;
        _this._disabled = false;
        _this._disabledParent = false;
        _this._evtParentDestroy = null;
        _this._evtParentDisable = null;
        _this._evtParentEnable = null;
        // HTMLElement 
        _this._element = null;
        return _this;
        // this._element!.addEventListener('click', )
    }
    Object.defineProperty(Element.prototype, "element", {
        // public innerElement: Nullable<HTMLElement> = null;
        get: function () {
            return this._element;
        },
        set: function (val) {
            if (this._element)
                return;
            this._element = val;
            this._element.ui = this;
            if (!this._element)
                return;
            var self = this;
            // click 事件
            this._element.addEventListener('click', function (evt) {
                if (self.disabled && !self.disabledClick)
                    return;
                self.emit("click", evt);
            }, false);
            // hover 事件
            this._element.addEventListener('mouseover', function (evt) {
                self.emit('hover', evt);
            }, false);
            // blur 事件，mouse out
            this._element.addEventListener('mouseout', function (evt) {
                self.emit('blur', evt);
            }, false);
            // if (!this.innerElement) this.innerElement = this._element;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (val) {
            if (this._parent) {
                this._parent = null;
                this._evtParentDestroy.unbind();
                this._evtParentDisable.unbind();
                this._evtParentEnable.unbind();
            }
            if (val) {
                this._parent = val;
                this._evtParentDestroy = this._parent.once("destroy", this._parentDestroy);
                this._evtParentDisable = this._parent.on("disable", this._parentDisable);
                this._evtParentEnable = this._parent.on("enable", this._parentEnable);
                if (this._disabledParent !== this._parent.disabled) {
                    this._disabledParent = this._parent.disabled;
                    if (this._disabledParent) {
                        this.class.add("disabled");
                        this.emit("disable");
                    }
                    else {
                        this.class.remove("disabled");
                        this.emit("enable");
                    }
                }
            }
            this.emit("parent");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "disabled", {
        get: function () {
            return this._disabled || this._disabledParent;
        },
        set: function (val) {
            if (this._disabled === val)
                return;
            this._disabled = !!val;
            this.emit(this._disabled || this._disabledParent ? 'disable' : 'enable');
            if (this._disabled || this._disabledParent) {
                if (this.class)
                    this.class.add('disabled');
            }
            else {
                if (this.class)
                    this.class.remove('disabled');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "disabledSelf", {
        get: function () {
            return this._disabled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "enabled", {
        get: function () {
            return !this._disabled;
        },
        set: function (val) {
            this.disabled = !val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "hidden", {
        get: function () {
            return this._element ? this._element.classList.contains('hidden') : false;
        },
        set: function (val) {
            if (!this._element)
                return;
            if (this._element.classList.contains('hidden') === !!val)
                return;
            if (val) {
                this._element.classList.add('hidden');
                this.emit('hide');
            }
            else {
                this._element.classList.remove('hidden');
                this.emit('show');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "value", {
        // TODO
        get: function () {
            if (!this._link)
                return null;
            return this._link.get(this.path);
        },
        set: function (val) {
            if (!this._link)
                return;
            this._link.set(this.path, val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "class", {
        /* DOM Element */
        get: function () {
            if (this._element) {
                return this._element.classList;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "style", {
        get: function () {
            if (this._element) {
                return this._element.style;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "flexGrow", {
        // flex-grow 属性用于设置或检索弹性盒子的扩展比率，用作css动画效果
        get: function () {
            return this._element ? (this._element.style.flexGrow || '') : '';
        },
        set: function (val) {
            if (this._element) {
                this._element.style.flexGrow = val;
                this._element.style.webkitFlexGrow = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "flexShrink", {
        // flex-shrink 属性规定项目将相对于同一容器内其他灵活的项目进行收缩的量，用作css动画效果
        get: function () {
            return this._element ? (this._element.style.flexShrink || '') : '';
        },
        set: function (val) {
            if (this._element) {
                this._element.style.flexShrink = val;
                this._element.style.webkitFlexShrink = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    // 设置元素闪烁效果
    Element.prototype.flash = function () {
        if (this.class) {
            this.class.add('flash');
            setTimeout(this._onFlashDelay, 200);
        }
    };
    Element.prototype._onFlashDelay = function () {
        if (this.class) {
            this.class.remove('flash');
        }
    };
    Element.prototype.link = function (link, path) {
        var self = this;
        if (this._link)
            this.unlink();
        this._link = link;
        this.path = path;
        this.emit("link", path);
        // add :set link
        if (this._onLinkChange) {
            var renderChanges = this.renderChanges;
            this.renderChanges = false;
            this._linkOnSet = this._link.on(this.path + ":set", function (value) {
                self._onLinkChange(value);
            });
            this._linkOnUnset = this._link.on(this.path + ":unset", function (value) {
                self._onLinkChange(value);
            });
            this._onLinkChange(this._link.get(this.path));
            this.renderChanges = renderChanges;
        }
    };
    ;
    Element.prototype.unlink = function () {
        if (!this._link)
            return;
        this.emit("unlink", this.path);
        // remove :set link
        if (this._linkOnSet) {
            this._linkOnSet.unbind();
            this._linkOnSet = null;
            this._linkOnUnset.unbind();
            this._linkOnUnset = null;
        }
        this._link = null;
        this.path = "";
    };
    ;
    Element.prototype._onLinkChange = function (value) {
    };
    Element.prototype.destroy = function () {
        if (this._destroyed)
            return;
        this._destroyed = true;
        if (this._parent) {
            this._evtParentDestroy.unbind();
            this._evtParentDisable.unbind();
            this._evtParentEnable.unbind();
            this._parent = null;
        }
        if (this._element && this._element.parentNode) {
            this._element.parentNode.removeChild(this._element);
        }
        this.unlink();
        this.emit('destroy');
        this.unbind();
        console.error('destroy');
    };
    ;
    Element.prototype._parentDestroy = function () {
        this.destroy();
    };
    ;
    Element.prototype._parentDisable = function () {
        if (this._disabledParent)
            return;
        this._disabledParent = true;
        if (!this._disabled) {
            this.emit("disable");
            this.class.add("disabled");
        }
    };
    ;
    Element.prototype._parentEnable = function () {
        if (!this._disabledParent)
            return;
        this._disabledParent = false;
        if (!this._disabled) {
            this.emit("enable");
            this.class.remove("disabled");
        }
    };
    ;
    return Element;
}(lib_1.Events));
exports.Element = Element;
},{"../lib":14}],20:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./link"));
__export(require("./element"));
__export(require("./container-element"));
__export(require("./panel"));
__export(require("./canvas"));
__export(require("./button"));
__export(require("./label"));
__export(require("./text-field"));
__export(require("./tree"));
__export(require("./tree-item"));
},{"./button":16,"./canvas":17,"./container-element":18,"./element":19,"./label":21,"./link":22,"./panel":23,"./text-field":24,"./tree":26,"./tree-item":25}],21:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var element_1 = require("./element");
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label(text, placeholder, unsafe) {
        var _this = _super.call(this) || this;
        _this._text = text ? text : '';
        _this._unsafe = unsafe ? unsafe : false;
        _this.element = document.createElement('span');
        _this.element.classList.add('ui-label');
        if (_this._text)
            _this._setText(_this._text);
        _this.on('change', _this._onChange);
        if (placeholder) {
            _this.placeholder = placeholder;
        }
        return _this;
    }
    Object.defineProperty(Label.prototype, "text", {
        get: function () {
            if (this._link) {
                return this._link.get(this.path);
            }
            else {
                return this._text;
            }
        },
        set: function (val) {
            if (this._link) {
                // TODO 
                this._link.set(this.path, val);
                val = this._link.get(this.path);
                this._setText(val);
            }
            else {
                if (this._text === val)
                    return;
                if (val === undefined || val === null) {
                    this._text = '';
                }
                else {
                    this._text = val;
                }
                this._setText(this._text);
                this.emit('change', val);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "placeholder", {
        get: function () {
            return this.element.getAttribute('placeholder') || '';
        },
        set: function (val) {
            this.element.setAttribute('placeholder', val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "value", {
        get: function () {
            return this.text;
        },
        set: function (val) {
            this.text = val;
        },
        enumerable: true,
        configurable: true
    });
    Label.prototype._setText = function (text) {
        if (this._unsafe) {
            this.element.innerHTML = text;
        }
        else {
            this.element.textContent = text;
        }
    };
    Label.prototype._onChange = function () {
        if (!this.renderChanges)
            return;
        this.flash();
    };
    ;
    Label.prototype._onLinkChange = function (value) {
        this.text = value;
        this.emit('change', value);
    };
    ;
    return Label;
}(element_1.Element));
exports.Label = Label;
},{"./element":19}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO
var Link = /** @class */ (function () {
    function Link(ele) {
        this._value = {};
        this._element = ele;
    }
    Link.prototype.get = function (path) {
        return this._value[path];
    };
    // TODO
    Link.prototype.set = function (path, value) {
        this._value[path] = value;
    };
    Link.prototype.on = function (name, fn) {
        return this._element.on(name, fn);
    };
    return Link;
}());
exports.Link = Link;
},{}],23:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var container_element_1 = require("./container-element");
var Panel = /** @class */ (function (_super) {
    __extends(Panel, _super);
    function Panel(title) {
        var _this = _super.call(this) || this;
        _this.headerElement = null;
        _this.headerElementTitle = null;
        _this._handleElement = null;
        _this._resizeData = { end: 0 };
        _this._resizeLimits = {
            min: 0,
            max: Infinity
        };
        _this._handle = '';
        _this.headerSize = 0;
        _this._resizeTouchId = -100;
        _this.title = '';
        var self = _this;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-panel', 'noHeader', 'noAnimation');
        // this.on('nodesChanged', this._onNodesChanged);
        // content
        _this.innerElement = document.createElement('div');
        _this.innerElement.ui = _this;
        _this.innerElement.classList.add('content');
        _this.element.appendChild(_this.innerElement);
        if (title) {
            _this.title = title;
            _this.header = title;
        }
        // this.innerElement.addEventListener('scroll', this._onScroll, false);
        _this._resizeEvtMove = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            self._resizeMove(evt.clientX, evt.clientY);
        };
        _this._resizeEvtEnd = function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            self._resizeEnd();
        };
        _this._resizeEvtTouchMove = function (evt) {
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var touch = evt.changedTouches[i];
                if (touch.identifier !== self._resizeTouchId)
                    continue;
                evt.preventDefault();
                evt.stopPropagation();
                self._resizeMove(touch.clientX, touch.clientY);
                return;
            }
        };
        _this._resizeEvtTouchEnd = function (evt) {
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var touch = evt.changedTouches[i];
                if (touch.identifier !== self._resizeTouchId)
                    continue;
                self._resizeTouchId = -100;
                evt.preventDefault();
                evt.stopPropagation();
                self._resizeEnd();
                return;
            }
        };
        // HACK
        // skip 2 frames before enabling transitions
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                self.class.remove('noAnimation');
            });
        });
        // on parent change
        _this.on('parent', _this._onParent);
        return _this;
    }
    Object.defineProperty(Panel.prototype, "folded", {
        get: function () {
            return this.class ? this.class.contains('foldable') && this.class.contains('folded') : false;
        },
        set: function (val) {
            if (this.hidden)
                return;
            if (this.class.contains('folded') === !!val)
                return;
            if (this.headerElement && this.headerSize === 0)
                this.headerSize = this.headerElement.clientHeight;
            if (val) {
                this.class.add('folded');
                if (this.class.contains('foldable'))
                    this.emit('fold');
            }
            else {
                this.class.remove('folded');
                if (this.class.contains('foldable'))
                    this.emit('unfold');
            }
            this._reflow();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panel.prototype, "horizontal", {
        get: function () {
            return this.class ? this.class.contains('horizontal') : false;
        },
        set: function (val) {
            if (val) {
                this.class.add('horizontal');
            }
            else {
                this.class.remove('horizontal');
            }
            this._reflow();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panel.prototype, "resizable", {
        get: function () {
            return this._handle;
        },
        set: function (val) {
            if (this._handle === val)
                return;
            var oldHandle = this._handle;
            this._handle = val;
            if (this._handle !== '') {
                if (!this._handleElement) {
                    this._handleElement = document.createElement('div');
                    this._handleElement.ui = this;
                    this._handleElement.classList.add('handle');
                    this._handleElement.addEventListener('mousedown', this._resizeStart.bind(this), false);
                    this._handleElement.addEventListener('touchstart', this._resizeStart.bind(this), false);
                }
                if (this._handleElement.parentNode)
                    this.element.removeChild(this._handleElement);
                // TODO
                // append in right place
                this.element.appendChild(this._handleElement);
                this.class.add('resizable', 'resizable-' + this._handle);
            }
            else {
                if (this._handleElement)
                    this.element.removeChild(this._handleElement);
                this.class.remove('resizable', 'resizable-' + oldHandle);
            }
            this._reflow();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panel.prototype, "resizeMin", {
        get: function () {
            return this._resizeLimits.min;
        },
        set: function (val) {
            this._resizeLimits.min = Math.max(0, Math.min(this._resizeLimits.max, val));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panel.prototype, "resizeMax", {
        get: function () {
            return this._resizeLimits.max;
        },
        set: function (val) {
            this._resizeLimits.max = Math.max(this._resizeLimits.min, val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panel.prototype, "foldable", {
        get: function () {
            return this.class ? this.class.contains('foldable') : false;
        },
        set: function (val) {
            if (val) {
                this.class.add('foldable');
                if (this.class.contains('folded'))
                    this.emit('fold');
            }
            else {
                this.class.remove('foldable');
                if (this.class.contains('folded'))
                    this.emit('unfold');
            }
            this._reflow();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panel.prototype, "header", {
        get: function () {
            return this.headerElementTitle ? (this.headerElementTitle.textContent || '') : '';
        },
        set: function (val) {
            if (!this.headerElement && val) {
                this.headerElement = document.createElement('header');
                this.headerElement.classList.add('ui-header');
                this.headerElementTitle = document.createElement('span');
                this.headerElementTitle.classList.add('title');
                this.headerElementTitle.textContent = val;
                this.headerElement.appendChild(this.headerElementTitle);
                var first = this.element.firstChild;
                if (first) {
                    this.element.insertBefore(this.headerElement, first);
                }
                else {
                    this.element.appendChild(this.headerElement);
                }
                this.class.remove('noHeader');
                var self_1 = this;
                // folding
                this.headerElement.addEventListener('click', function (evt) {
                    if (!self_1.foldable || (evt.target !== self_1.headerElement && evt.target !== self_1.headerElementTitle))
                        return;
                    self_1.folded = !self_1.folded;
                }, false);
            }
            else if (this.headerElement && !val) {
                if (this.headerElement.parentNode) {
                    this.headerElement.parentNode.removeChild(this.headerElement);
                }
                this.headerElement = null;
                this.headerElementTitle = null;
                this.class.add('noHeader');
            }
            else {
                this.headerElementTitle.textContent = val || '';
                this.class.remove('noHeader');
            }
        },
        enumerable: true,
        configurable: true
    });
    Panel.prototype._resizeMove = function (x, y) {
        if (this._resizeData.end === 0) {
            this._resizeData = {
                x: x,
                y: y,
                width: this.innerElement.clientWidth,
                height: this.innerElement.clientHeight,
                end: 1
            };
        }
        else {
            if (this._handle === 'left' || this._handle === 'right') {
                // horizontal
                var offsetX = this._resizeData.x - x;
                if (this._handle === 'right')
                    offsetX = -offsetX;
                var width = Math.max(this._resizeLimits.min, Math.min(this._resizeLimits.max, (this._resizeData.width + offsetX)));
                this.style.width = (width + 4) + 'px';
                this.innerElement.style.width = (width + 4) + 'px';
            }
            else {
                // vertical
                var offsetY = this._resizeData.y - y;
                if (this._handle === 'bottom')
                    offsetY = -offsetY;
                var height = Math.max(this._resizeLimits.min, Math.min(this._resizeLimits.max, (this._resizeData.height + offsetY)));
                this.style.height = (height + (this.headerSize === -1 ? 0 : this.headerSize || 32)) + 'px';
                this.innerElement.style.height = height + 'px';
            }
        }
        this.emit('resize');
    };
    ;
    Panel.prototype._resizeEnd = function () {
        window.removeEventListener('mousemove', this._resizeEvtMove, false);
        window.removeEventListener('mouseup', this._resizeEvtEnd, false);
        // window.removeEventListener('touchmove', this._resizeEvtTouchMove, false);
        // window.removeEventListener('touchend', this._resizeEvtTouchEnd, false);
        this.class.remove('noAnimation', 'resizing');
        this._resizeData.end = 0;
    };
    ;
    Panel.prototype._resizeStart = function (evt) {
        if (this._handle === '')
            return;
        if (evt.changedTouches) {
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var touch = evt.changedTouches[i];
                if (touch.target !== this.element)
                    continue;
                this._resizeTouchId = touch.identifier;
            }
        }
        this.class.add('noAnimation', 'resizing');
        this._resizeData.end = 0;
        window.addEventListener('mousemove', this._resizeEvtMove, false);
        window.addEventListener('mouseup', this._resizeEvtEnd, false);
        window.addEventListener('touchmove', this._resizeEvtTouchMove, false);
        window.addEventListener('touchend', this._resizeEvtTouchEnd, false);
        evt.preventDefault();
        evt.stopPropagation();
    };
    ;
    Panel.prototype._onParent = function () {
        // HACK
        // wait till DOM parses, then reflow
        requestAnimationFrame(this._reflow.bind(this));
    };
    ;
    Panel.prototype._reflow = function () {
        if (this.hidden)
            return;
        if (this.folded) {
            if (this.horizontal) {
                this.style.height = '';
                this.style.width = (this.headerSize || 32) + 'px';
            }
            else {
                this.style.height = (this.headerSize || 32) + 'px';
            }
        }
        else if (this.foldable) {
            if (this.horizontal) {
                this.style.height = '';
                this.style.width = this.innerElement.clientWidth + 'px';
            }
            else {
                this.style.height = ((this.headerSize || 32) + this.innerElement.clientHeight) + 'px';
            }
        }
    };
    ;
    Panel.prototype._onNodesChanged = function () {
        if (!this.foldable || this.folded || this.horizontal || this.hidden)
            return;
        this.style.height = (Math.max(0, (this.headerSize || 32)) + this.innerElement.clientHeight) + 'px';
    };
    ;
    Panel.prototype.headerAppend = function (element) {
        if (!this.headerElement)
            return;
        var html = (element instanceof HTMLElement);
        var node = html ? element : element.element;
        this.headerElement.insertBefore(node, this.headerElementTitle);
        if (!html)
            element.parent = this;
    };
    ;
    // TODO
    Panel.prototype._onScroll = function (evt) {
        this.emit('scroll', evt);
    };
    ;
    return Panel;
}(container_element_1.ContainerElement));
exports.Panel = Panel;
},{"./container-element":18}],24:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var element_1 = require("./element");
var TextField = /** @class */ (function (_super) {
    __extends(TextField, _super);
    function TextField(placeholder, value) {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-text-field');
        _this.elementInput = document.createElement('input');
        _this.elementInput.ui = _this;
        _this.elementInput.classList.add('field');
        _this.elementInput.type = 'text';
        _this.elementInput.tabIndex = 0;
        _this.elementInput.addEventListener('focus', _this._onInputFocus.bind(_this), false);
        _this.elementInput.addEventListener('blur', _this._onInputBlur.bind(_this), false);
        _this.element.appendChild(_this.elementInput);
        if (value !== undefined)
            _this.value = value;
        _this.elementInput.addEventListener('change', _this._onChange.bind(_this), false);
        _this.elementInput.addEventListener('keydown', _this._onKeyDown.bind(_this), false);
        _this.elementInput.addEventListener('contextmenu', _this._onFullSelect.bind(_this), false);
        _this.evtKeyChange = false;
        _this.ignoreChange = false;
        _this.blurOnEnter = true;
        _this.refocusable = true;
        _this.on('disable', _this._onDisable);
        _this.on('enable', _this._onEnable);
        _this.on('change', _this._onChangeField);
        if (placeholder)
            _this.placeholder = placeholder;
        return _this;
    }
    Object.defineProperty(TextField.prototype, "value", {
        get: function () {
            if (this._link) {
                return this._link.get(this.path);
            }
            else {
                return this.elementInput.value;
            }
        },
        set: function (val) {
            if (this._link) {
                // TODO
                // if (!this._link.set(this.path, value)) {
                //   this.elementInput.value = this._link.get(this.path);
                // }
            }
            else {
                if (this.elementInput.value === val)
                    return;
                this.elementInput.value = val || '';
                this.emit('change', val);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextField.prototype, "placeholder", {
        get: function () {
            return this.element.getAttribute('placeholder') || '';
        },
        set: function (val) {
            if (!val) {
                this.element.removeAttribute('placeholder');
            }
            else {
                this.element.setAttribute('placeholder', val);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextField.prototype, "proxy", {
        get: function () {
            return this.element.getAttribute('proxy') || '';
        },
        set: function (val) {
            if (!val) {
                this.element.removeAttribute('proxy');
            }
            else {
                this.element.setAttribute('proxy', val);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextField.prototype, "keyChange", {
        get: function () {
            return this.evtKeyChange;
        },
        set: function (val) {
            if (this.evtKeyChange === !!val)
                return;
            if (val) {
                this.elementInput.addEventListener('keyup', this._onChange, false);
            }
            else {
                this.elementInput.removeEventListener('keyup', this._onChange);
            }
        },
        enumerable: true,
        configurable: true
    });
    TextField.prototype._onLinkChange = function (value) {
        this.elementInput.value = value;
        this.emit('change', value);
    };
    TextField.prototype._onChange = function () {
        if (this.ignoreChange)
            return;
        this.value = this.value || '';
        if (!this._link)
            this.emit('change', this.value);
    };
    TextField.prototype._onKeyDown = function (evt) {
        if (evt.keyCode === 27) {
            evt.target.blur();
        }
        else if (this.blurOnEnter && evt.keyCode === 13) {
            var focused = false;
            var parent_1 = this.parent;
            while (parent_1) {
                if (parent_1.element && parent_1.element.focus) {
                    parent_1.element.focus();
                    focused = true;
                    break;
                }
                parent_1 = parent_1.parent;
            }
            if (!focused)
                evt.target.blur();
        }
    };
    TextField.prototype._onFullSelect = function () {
        this.elementInput.select();
    };
    TextField.prototype.focus = function (select) {
        this.elementInput.focus();
        if (select)
            this.elementInput.select();
    };
    TextField.prototype._onInputFocus = function () {
        this.class.add('focus');
        this.emit('input:focus');
    };
    TextField.prototype._onInputBlur = function () {
        this.class.remove('focus');
        this.emit('input:blur');
    };
    TextField.prototype._onDisable = function () {
        this.elementInput.readOnly = true;
    };
    TextField.prototype._onEnable = function () {
        this.elementInput.readOnly = false;
    };
    TextField.prototype._onChangeField = function () {
        if (!this.renderChanges)
            return;
        this.flash();
    };
    return TextField;
}(element_1.Element));
exports.TextField = TextField;
},{"./element":19}],25:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var element_1 = require("./element");
var tree_1 = require("./tree");
var text_field_1 = require("./text-field");
var TreeItem = /** @class */ (function (_super) {
    __extends(TreeItem, _super);
    function TreeItem(args) {
        var _this = _super.call(this) || this;
        _this._dragId = -1;
        _this._onDragStart = function (evt) {
            var htmlEle = evt.target;
            if (!htmlEle.ui.tree.draggable) {
                evt.stopPropagation();
                evt.preventDefault();
                return;
            }
            htmlEle.ui._dragging = true;
            if (htmlEle.ui._dragRelease)
                window.removeEventListener('mouseup', htmlEle.ui._dragRelease);
            htmlEle.ui._dragRelease = htmlEle.ui._onMouseUp;
            window.addEventListener('mouseup', htmlEle.ui._dragRelease, false);
            evt.stopPropagation();
            evt.preventDefault();
            htmlEle.ui.emit('dragstart');
        };
        var self = _this;
        args = args || {};
        _this.tree = null;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-tree-item');
        if (args.classList) {
            args.classList.forEach(function (className) {
                self.element.classList.add(className);
            }, _this);
        }
        _this.elementTitle = document.createElement('div');
        _this.elementTitle.classList.add('title');
        _this.elementTitle.draggable = true;
        _this.elementTitle.tabIndex = 0;
        _this.elementTitle.ui = _this;
        _this.element.appendChild(_this.elementTitle);
        _this.elementIcon = document.createElement('span');
        _this.elementIcon.classList.add('icon');
        _this.elementTitle.appendChild(_this.elementIcon);
        _this.elementText = document.createElement('span');
        _this.elementText.textContent = args.text || '';
        _this.elementText.classList.add('text');
        _this.elementTitle.appendChild(_this.elementText);
        _this._children = 0;
        _this.selectable = true;
        _this._onMouseUp = function (evt) {
            window.removeEventListener('mouseup', self._dragRelease);
            self._dragRelease = null;
            evt.preventDefault();
            evt.stopPropagation();
            self._dragging = false;
            self.emit('dragend');
        };
        _this.elementTitle.addEventListener('click', _this._onClick, false);
        _this.elementTitle.addEventListener('dblclick', _this._onDblClick, false);
        _this._dragRelease = null;
        _this._dragging = false;
        _this._allowDrop = (args.allowDrop !== undefined ? !!args.allowDrop : true);
        _this.elementTitle.addEventListener('mousedown', _this._onMouseDown, false);
        _this.elementTitle.addEventListener('dragstart', _this._onDragStart, false);
        _this.elementTitle.addEventListener('mouseover', _this._onMouseOver, false);
        _this.on('destroy', _this._onDestroy);
        _this.on('append', _this._onAppend);
        _this.on('remove', _this._onRemove);
        _this.on('select', _this._onSelect);
        _this.on('deselect', _this._onDeselect);
        _this.elementTitle.addEventListener('keydown', _this._onKeyDown, false);
        return _this;
    }
    Object.defineProperty(TreeItem.prototype, "selected", {
        get: function () {
            return this.class.contains('selected');
        },
        set: function (val) {
            if (this.class.contains('selected') === !!val)
                return;
            if (val) {
                this.class.add('selected');
                this.emit('select');
                if (this.tree)
                    this.tree.emit('select', this);
            }
            else {
                this.class.remove('selected');
                this.emit('deselect');
                if (this.tree)
                    this.tree.emit('deselect', this);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeItem.prototype, "text", {
        get: function () {
            return this.elementText.textContent || '';
        },
        set: function (val) {
            if (this.elementText.textContent === val)
                return;
            this.elementText.textContent = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeItem.prototype, "open", {
        get: function () {
            return this.class.contains('open');
        },
        set: function (val) {
            if (this.class.contains('open') === !!val)
                return;
            if (val) {
                this.class.add('open');
                this.emit('open');
                this.tree.emit('open', this);
            }
            else {
                this.class.remove('open');
                this.emit('close');
                this.tree.emit('close', this);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeItem.prototype, "prev", {
        get: function () {
            if (this.element.previousElementSibling && this.element.previousElementSibling.ui && this.element.previousElementSibling.ui instanceof TreeItem) {
                return this.element.previousElementSibling.ui;
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeItem.prototype, "next", {
        get: function () {
            if (this.element.nextElementSibling && this.element.nextElementSibling.ui && this.element.nextElementSibling.ui instanceof TreeItem) {
                return this.element.nextElementSibling.ui;
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeItem.prototype, "allowDrop", {
        get: function () {
            return this._allowDrop;
        },
        set: function (val) {
            this._allowDrop = val;
        },
        enumerable: true,
        configurable: true
    });
    // TODO
    TreeItem.prototype.child = function (index) {
        return this.element.children[index + 1];
    };
    ;
    TreeItem.prototype._onClick = function (evt) {
        var htmlEle = evt.target;
        if (evt.button !== 0 || !htmlEle.ui.selectable)
            return;
        var rect = htmlEle.getBoundingClientRect();
        if (htmlEle.ui._children && (evt.clientX - rect.left) < 0) {
            htmlEle.ui.open = !htmlEle.ui.open;
        }
        else {
            htmlEle.ui.tree._onItemClick(htmlEle.ui);
            evt.stopPropagation();
        }
    };
    ;
    TreeItem.prototype._onDblClick = function (evt) {
        var htmlEle = evt.target;
        if (!htmlEle.ui.tree.allowRenaming || evt.button !== 0)
            return;
        evt.stopPropagation();
        var rect = htmlEle.getBoundingClientRect();
        if (htmlEle.ui._children && (evt.clientX - rect.left) < 0) {
            return;
        }
        else {
            htmlEle.ui._onRename(true);
        }
    };
    ;
    TreeItem.prototype._onMouseDown = function (evt) {
        var htmlEle = evt.target;
        if (!htmlEle.ui.tree.draggable)
            return;
        evt.stopPropagation();
    };
    ;
    TreeItem.prototype._onMouseOver = function (evt) {
        var htmlEle = evt.target;
        evt.stopPropagation();
        htmlEle.ui.emit('mouseover', evt);
    };
    ;
    TreeItem.prototype._onSelect = function () {
        this.elementTitle.focus();
    };
    ;
    TreeItem.prototype._onDeselect = function () {
        this.elementTitle.blur();
    };
    ;
    TreeItem.prototype._onKeyDown = function (evt) {
        var htmlEle = evt.target;
        var currentItem = htmlEle.ui;
        if ((evt.target && htmlEle.tagName.toLowerCase() === 'input'))
            return;
        if ([9, 38, 40, 37, 39].indexOf(evt.keyCode) === -1)
            return;
        evt.preventDefault();
        evt.stopPropagation();
        var selectedItem = null;
        var item = null;
        switch (evt.keyCode) {
            case 9: // tab
                break;
            case 40: // down
                var downItem = currentItem.element.nextElementSibling;
                if (downItem)
                    item = downItem.ui;
                if (currentItem._children && currentItem.open) {
                    var first = currentItem.element.firstElementChild.nextElementSibling;
                    if (first && first.ui) {
                        selectedItem = first.ui;
                        // first.ui.selected = true;
                    }
                    else if (item) {
                        selectedItem = item;
                        // item.selected = true;
                    }
                }
                else if (item) {
                    selectedItem = item;
                    // item.selected = true;
                }
                else if (currentItem.parent && currentItem.parent instanceof TreeItem) {
                    var parent_1 = currentItem.parent;
                    var findNext = function (from) {
                        var next = from.next;
                        if (next) {
                            selectedItem = next;
                            // next.selected = true;
                        }
                        else if (from.parent instanceof TreeItem) {
                            return from.parent;
                        }
                        return null;
                    };
                    parent_1 = findNext(parent_1);
                    while (parent_1) {
                        parent_1 = findNext(parent_1);
                    }
                }
                break;
            case 38: // up
                var itemUp = currentItem.element.previousElementSibling;
                if (itemUp)
                    item = itemUp.ui;
                if (item) {
                    if (item._children && item.open && item !== currentItem.parent) {
                        var lastItem = item.element.lastElementChild;
                        var last = null;
                        if (lastItem && lastItem.ui)
                            last = lastItem.ui;
                        if (last) {
                            var findLast = function (inside) {
                                if (inside._children && inside.open) {
                                    if (inside.element.lastElementChild && inside.element.lastElementChild.ui) {
                                        return inside.element.lastElementChild.ui;
                                    }
                                    return null;
                                }
                                else {
                                    return null;
                                }
                            };
                            var found = false;
                            while (!found) {
                                var deeper = findLast(last);
                                if (deeper) {
                                    last = deeper;
                                }
                                else {
                                    found = true;
                                }
                            }
                            selectedItem = last;
                            // last.selected = true;
                        }
                        else {
                            selectedItem = item;
                            // item.selected = true;
                        }
                    }
                    else {
                        selectedItem = item;
                        // item.selected = true;
                    }
                }
                else if (currentItem.parent && currentItem.parent instanceof TreeItem) {
                    selectedItem = currentItem.parent;
                    // this.ui.parent.selected = true;
                }
                break;
            case 37: // left (close)
                if (currentItem.parent !== currentItem.tree && currentItem.open)
                    currentItem.open = false;
                break;
            case 39: // right (open)
                if (currentItem._children && !currentItem.open)
                    currentItem.open = true;
                break;
        }
        if (selectedItem) {
            if (!(tree_1.Tree._ctrl && tree_1.Tree._ctrl()) && !(tree_1.Tree._shift && tree_1.Tree._shift()))
                currentItem.tree.clear();
            selectedItem.selected = true;
        }
    };
    // TODO,关联En
    TreeItem.prototype._onRename = function (select) {
        if (select) {
            this.tree.clear();
            this.tree._onItemClick(this);
        }
        var self = this;
        this.class.add('rename');
        // add remaning field
        var field = new text_field_1.TextField();
        field.parent = this;
        field.renderChanges = false;
        field.value = this.text;
        field.elementInput.readOnly = !this.tree.allowRenaming;
        field.elementInput.addEventListener('blur', function () {
            field.destroy();
            self.class.remove('rename');
        }, false);
        field.on('click', function (evt) {
            evt.stopPropagation();
        });
        field.element.addEventListener('dblclick', function (evt) {
            evt.stopPropagation();
        });
        field.on('change', function (value) {
            value = value.trim();
            if (value) {
                // TODO
                // if (self.entity) {
                //   self.entity.set('name', value);
                // }
                self.emit('rename', value);
            }
            field.destroy();
            self.class.remove('rename');
        });
        this.elementTitle.appendChild(field.element);
        field.elementInput.focus();
        field.elementInput.select();
    };
    TreeItem.prototype._onDestroy = function () {
        this.elementTitle.removeEventListener('click', this._onClick);
        this.elementTitle.removeEventListener('dblclick', this._onDblClick);
        this.elementTitle.removeEventListener('mousedown', this._onMouseDown);
        this.elementTitle.removeEventListener('dragstart', this._onDragStart);
        this.elementTitle.removeEventListener('mouseover', this._onMouseOver);
        this.elementTitle.removeEventListener('keydown', this._onKeyDown);
    };
    TreeItem.prototype._onAppend = function (item) {
        if (this.parent)
            this.parent.emit('append', item);
    };
    TreeItem.prototype._onRemove = function (item) {
        if (this.parent)
            this.parent.emit('remove', item);
    };
    TreeItem.prototype.focus = function () {
        this.elementTitle.focus();
    };
    TreeItem.prototype.append = function (item) {
        if (this._children === 1) {
            this.element.children[1].classList.remove('single');
        }
        item.parent = this;
        this.element.appendChild(item.element);
        this._children++;
        if (this._children === 1) {
            item.class.add('single');
            this.class.add('container');
        }
        else if (this._children > 1) {
            item.class.remove('single');
        }
        var appendChildren = function (treeItem) {
            treeItem.emit('append', treeItem);
            if (treeItem._children) {
                for (var i = 1; i < treeItem.element.children.length; i++) {
                    appendChildren(treeItem.element.children[i].ui);
                }
            }
        };
        appendChildren(item);
    };
    TreeItem.prototype.appendBefore = function (item, referenceItem) {
        if (this._children === 1) {
            this.element.children[1].classList.remove('single');
        }
        item.parent = this;
        this.element.insertBefore(item.element, referenceItem.element);
        this._children++;
        if (this._children === 1) {
            item.class.add('single');
            this.class.add('container');
        }
        else if (this._children > 1) {
            item.class.remove('single');
        }
        var appendChildren = function (treeItem) {
            treeItem.emit('append', treeItem);
            if (treeItem._children) {
                for (var i = 1; i < treeItem.element.children.length; i++) {
                    appendChildren(treeItem.element.children[i].ui);
                }
            }
        };
        appendChildren(item);
    };
    TreeItem.prototype.appendAfter = function (item, referenceItem) {
        item.parent = this;
        // might be last
        if (!referenceItem)
            this.append(item);
        this.element.insertBefore(item.element, referenceItem.element.nextElementSibling);
        this._children++;
        if (this._children === 1) {
            item.class.add('single');
            this.class.add('container');
        }
        else if (this._children === 2) {
            this.element.children[1].classList.remove('single');
        }
        var appendChildren = function (treeItem) {
            treeItem.emit('append', treeItem);
            if (treeItem._children) {
                for (var i = 1; i < treeItem.element.children.length; i++) {
                    appendChildren(treeItem.element.children[i].ui);
                }
            }
        };
        appendChildren(item);
    };
    TreeItem.prototype.remove = function (item) {
        if (!this._children || !this.element.contains(item.element))
            return;
        this.element.removeChild(item.element);
        this._children--;
        if (this._children === 0) {
            this.class.remove('container');
        }
        else if (this._children === 1 && this.element.children.length > 2) {
            this.element.children[1].classList.add('single');
        }
        var removeChildren = function (treeItem) {
            treeItem.emit('remove', treeItem);
            if (treeItem._children) {
                for (var i = 1; i < treeItem.element.children.length; i++) {
                    if (treeItem.element.children[i].ui && treeItem.element.children[i].ui instanceof TreeItem) {
                        removeChildren(treeItem.element.children[i].ui);
                    }
                }
            }
        };
        removeChildren(item);
    };
    return TreeItem;
}(element_1.Element));
exports.TreeItem = TreeItem;
},{"./element":19,"./text-field":24,"./tree":26}],26:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var container_element_1 = require("./container-element");
var tree_item_1 = require("./tree-item");
var editor_1 = require("../editor");
var Tree = /** @class */ (function (_super) {
    __extends(Tree, _super);
    function Tree() {
        var _this = _super.call(this) || this;
        _this._dragItems = [];
        _this._selected = [];
        _this.allowRenaming = true;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-tree');
        _this.elementDrag = document.createElement('div');
        _this.elementDrag.classList.add('drag-handle');
        _this.element.appendChild(_this.elementDrag);
        var self = _this;
        _this.elementDrag.addEventListener('mousemove', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            self._onDragMove(evt);
        });
        _this.element.addEventListener('mouseleave', function (evt) {
            self._onDragOut();
        });
        _this.draggable = true;
        _this._dragging = false;
        _this._dragItems = [];
        _this._dragOver = null;
        _this._dragArea = 'inside';
        _this._evtDragMove = null;
        _this.reordering = true;
        _this.dragInstant = true;
        _this._selected = [];
        return _this;
    }
    Object.defineProperty(Tree.prototype, "selected", {
        get: function () {
            return this._selected.slice(0);
        },
        enumerable: true,
        configurable: true
    });
    Tree._ctrl = function () {
        return editor_1.Hotkeys.ctrl;
    };
    Tree._shift = function () {
        return editor_1.Hotkeys.shift;
    };
    Tree.prototype._onDragMove = function (evt) {
        if (!this.draggable)
            return;
        this._hoverCalculate(evt);
        this.emit('dragmove', evt);
    };
    Tree.prototype._hoverCalculate = function (evt) {
        if (!this.draggable || !this._dragOver)
            return;
        var rect = this.elementDrag.getBoundingClientRect();
        var area = Math.floor((evt.clientY - rect.top) / rect.height * 5);
        var oldArea = this._dragArea;
        var oldDragOver = this._dragOver;
        if (this._dragOver.parent === this) {
            var parent_1 = false;
            for (var i = 0; i < this._dragItems.length; i++) {
                if (this._dragItems[i].parent === this._dragOver) {
                    parent_1 = true;
                    this._dragOver = null;
                    break;
                }
            }
            if (!parent_1)
                this._dragArea = 'inside';
        }
        else {
            // check if we are trying to drag item inside any of its children
            var invalid = false;
            for (var i = 0; i < this._dragItems.length; i++) {
                var parent_2 = this._dragOver.parent;
                while (parent_2) {
                    if (parent_2 === this._dragItems[i]) {
                        invalid = true;
                        break;
                    }
                    parent_2 = parent_2.parent;
                }
            }
            if (invalid) {
                this._dragOver = null;
            }
            else if (this.reordering && area <= 1 && this._dragItems.indexOf(this._dragOver.prev) === -1) {
                this._dragArea = 'before';
            }
            else if (this.reordering && area >= 4 && this._dragItems.indexOf(this._dragOver.next) === -1 && (this._dragOver._children === 0 || !this._dragOver.open)) {
                this._dragArea = 'after';
            }
            else {
                var parent_3 = false;
                if (this.reordering && this._dragOver.open) {
                    for (var i = 0; i < this._dragItems.length; i++) {
                        if (this._dragItems[i].parent === this._dragOver) {
                            parent_3 = true;
                            this._dragArea = 'before';
                            break;
                        }
                    }
                }
                if (!parent_3)
                    this._dragArea = 'inside';
            }
        }
        if (oldArea !== this._dragArea || oldDragOver !== this._dragOver)
            this._updateDragHandle();
    };
    Tree.prototype._onItemClick = function (item) {
        if (Tree._ctrl && Tree._ctrl()) {
            // 按住ctrl键，针对某个item，按第1次选中，按第2次取消选中
            item.selected = !item.selected;
        }
        else if (Tree._shift && Tree._shift() && this._selected.length) {
            // shift按住以后，往上往下都可进行选择，不断添加选择项，不减少
            var from = this._selected[this._selected.length - 1];
            var to = item;
            var up = [];
            var down = [];
            var prev = function (refItem) {
                if (!refItem)
                    return null;
                var result = null;
                var prevItem = refItem.element.previousElementSibling;
                var item = null;
                if (prevItem)
                    item = prevItem.ui;
                if (item) {
                    if (refItem.parent && refItem.parent === item && refItem.parent instanceof tree_item_1.TreeItem) {
                        result = refItem.parent;
                    }
                    else if (item.open && item._children) { // 没有open貌似就没有选中
                        // element above is open, find last available element
                        var lastItem = item.element.lastElementChild;
                        var last = null;
                        if (lastItem && lastItem.ui)
                            last = lastItem.ui;
                        if (last) {
                            var findLast = function (inside) {
                                if (inside && inside.open && inside._children) {
                                    if (inside.element.lastElementChild && inside.element.lastChild.ui) {
                                        return inside.element.lastChild.ui;
                                    }
                                    else {
                                        return null;
                                    }
                                }
                                else {
                                    return null;
                                }
                            };
                            var found = false;
                            while (!found) {
                                var deeper = findLast(last);
                                if (deeper) {
                                    last = deeper;
                                }
                                else {
                                    found = true;
                                }
                            }
                            result = last;
                        }
                        else {
                            result = item;
                        }
                    }
                    else {
                        result = item;
                    }
                }
                return result;
            };
            var next = function (refItem) {
                var result = null;
                var nextItem = refItem.element.nextElementSibling;
                var item = null;
                if (nextItem)
                    item = nextItem.ui;
                if (refItem.open && refItem._children) {
                    // select a child
                    var first = refItem.element.firstElementChild.nextElementSibling;
                    if (first && first.ui) {
                        result = first.ui;
                    }
                    else if (item) {
                        result = item;
                    }
                }
                else if (item) {
                    // select next item
                    result = item;
                }
                else if (refItem.parent && refItem.parent instanceof tree_item_1.TreeItem) {
                    // no next element, go to parent
                    var parent_4 = refItem.parent;
                    var findNext = function (from) {
                        var next = from.next;
                        if (next) {
                            result = next;
                        }
                        else if (from.parent instanceof tree_item_1.TreeItem) {
                            return from.parent;
                        }
                        return null;
                    };
                    parent_4 = findNext(parent_4);
                    while (parent_4) {
                        parent_4 = findNext(parent_4);
                    }
                }
                return result;
            };
            var done = false;
            var path = [];
            var lookUp = true;
            var lookDown = true;
            var lookingUp = true;
            // TODO
            while (!done && !path) {
                lookingUp = !lookingUp;
                var item_1 = null;
                var lookFrom = from;
                if ((!lookDown || lookingUp) && lookUp) {
                    // up
                    if (up.length)
                        lookFrom = up[up.length - 1];
                    item_1 = prev(lookFrom);
                    if (item_1) {
                        up.push(item_1);
                        if (item_1 === to) {
                            done = true;
                            path = up;
                            break;
                        }
                    }
                    else {
                        lookUp = false;
                    }
                }
                else if (lookDown) {
                    // down
                    if (down.length)
                        lookFrom = down[down.length - 1];
                    item_1 = next(lookFrom);
                    if (item_1) {
                        down.push(item_1);
                        if (item_1 === to) {
                            done = true;
                            path = down;
                            break;
                        }
                    }
                    else {
                        lookDown = false;
                    }
                }
                else {
                    done = true;
                }
            }
            if (path) {
                for (var i = 0; i < path.length; i++) {
                    path[i].selected = true;
                }
            }
        }
        else {
            var selected = item.selected && ((this._selected.indexOf(item) === -1) || (this._selected.length === 1 && this._selected[0] === item));
            this.clear();
            if (!selected)
                item.selected = true;
        }
    };
    Tree.prototype._onSelect = function (item) {
        this._selected.push(item);
    };
    Tree.prototype._onDeselect = function (item) {
        var index = this._selected.indexOf(item);
        if (index === -1)
            return;
        this._selected.splice(index, 1);
    };
    Tree.prototype._onDragStart = function (item) {
        if (!this.draggable || this._dragging)
            return;
        this._dragItems = [];
        if (this._selected && this._selected.length > 1 && this._selected.indexOf(item) !== -1) {
            var items = [];
            var index = {};
            var defaultLevel = -1;
            // build index
            for (var i = 0; i < this._selected.length; i++) {
                // cant drag parent
                if (this._selected[i].parent === this)
                    return;
                this._selected[i]._dragId = i + 1;
                index[this._selected[i]._dragId] = this._selected[i];
            }
            for (var i = 0; i < this._selected.length; i++) {
                var s = this._selected[i];
                var level = 0;
                var child = false;
                var parent_5 = this._selected[i].parent;
                if (!parent_5 || !(parent_5 instanceof tree_item_1.TreeItem))
                    parent_5 = null;
                while (parent_5) {
                    if (parent_5._dragId && index[parent_5._dragId]) {
                        // child, to be ignored
                        child = true;
                        break;
                    }
                    parent_5 = parent_5.parent;
                    if (!(parent_5 instanceof tree_item_1.TreeItem)) {
                        parent_5 = null;
                        break;
                    }
                    level++;
                }
                if (!child) {
                    if (defaultLevel === -1) {
                        defaultLevel = level;
                    }
                    else if (defaultLevel !== level) {
                        // multi-level drag no allowed
                        return;
                    }
                    items.push(this._selected[i]);
                }
            }
            // clean ids
            for (var i = 0; i < this._selected.length; i++)
                this._selected[i]._dragId = -1;
            this._dragItems = items;
            // sort items by their number of apperance in hierarchy
            if (items.length > 1) {
                var commonParent_1 = null;
                // find common parent
                var findCommonParent = function (items) {
                    var parents = [];
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].parent && items[i].parent instanceof tree_item_1.TreeItem) {
                            if (parents.indexOf(items[i].parent) === -1)
                                parents.push(items[i].parent);
                        }
                    }
                    if (parents.length === 1) {
                        commonParent_1 = parents[0];
                    }
                    return parents;
                };
                var parents = items;
                while (!commonParent_1 && parents)
                    parents = findCommonParent(parents);
                var _loop_1 = function (i) {
                    var ind = 0;
                    var countChildren = function (item) {
                        if (!item._children) {
                            return 0;
                        }
                        else {
                            var count = 0;
                            var children = item.element.children;
                            for (var i_1 = 0; i_1 < children.length; i_1++) {
                                if (children[i_1].ui && children[i_1].ui instanceof tree_item_1.TreeItem)
                                    count += countChildren(children[i_1].ui) + 1;
                            }
                            return count;
                        }
                    };
                    var scanUpForIndex = function (item) {
                        ind++;
                        var sibling = item.element.previousElementSibling;
                        var siblingItem = null;
                        if (sibling && sibling.ui && sibling.ui instanceof tree_item_1.TreeItem) {
                            siblingItem = sibling.ui;
                        }
                        if (siblingItem) {
                            ind += countChildren(siblingItem);
                            return siblingItem;
                        }
                        else if (item.parent === commonParent_1) {
                            return null;
                        }
                        else {
                            if (item.parent instanceof tree_item_1.TreeItem) {
                                return item.parent;
                            }
                            else {
                                return null;
                            }
                        }
                    };
                    var prev = scanUpForIndex(items[i]);
                    while (prev)
                        prev = scanUpForIndex(prev);
                    items[i]._dragId = ind;
                };
                // calculate ind number
                for (var i = 0; i < items.length; i++) {
                    _loop_1(i);
                }
                items.sort(function (a, b) {
                    return a._dragId - b._dragId;
                });
            }
        }
        else {
            // single drag
            this._dragItems = [item];
        }
        if (this._dragItems.length) {
            this._dragging = true;
            this.class.add('dragging');
            for (var i = 0; i < this._dragItems.length; i++) {
                this._dragItems[i].class.add('dragged');
            }
            this._updateDragHandle();
            this.emit('dragstart');
        }
    };
    Tree.prototype._onDragOver = function (item, evt) {
        if (!this.draggable || !this._dragging || (this._dragItems.indexOf(item) !== -1 && !this._dragOver) || this._dragOver === item)
            return;
        var dragOver = null;
        if (item.allowDrop) {
            if (this._dragItems.indexOf(item) === -1)
                dragOver = item;
            if (this._dragOver === null && dragOver)
                this.emit('dragin');
        }
        this._dragOver = dragOver;
        this._updateDragHandle();
        this._onDragMove(evt);
    };
    Tree.prototype._onDragEnd = function () {
        if (!this.draggable || !this._dragging)
            return;
        // TODO
        var reparentedItems = [];
        this._dragging = false;
        this.class.remove('dragging');
        var lastDraggedItem = this._dragOver;
        for (var i = 0; i < this._dragItems.length; i++) {
            this._dragItems[i].class.remove('dragged');
            if (this._dragOver && this._dragOver !== this._dragItems[i]) {
                var oldParent = this._dragItems[i].parent;
                if (oldParent !== this._dragOver || this._dragArea !== 'inside') {
                    var newParent = null;
                    if (this.dragInstant) {
                        if (this._dragItems[i].parent)
                            (this._dragItems[i].parent).remove(this._dragItems[i]);
                    }
                    if (this._dragArea === 'before') {
                        newParent = this._dragOver.parent;
                        if (this.dragInstant)
                            this._dragOver.parent.appendBefore(this._dragItems[i], this._dragOver);
                    }
                    else if (this._dragArea === 'inside') {
                        newParent = this._dragOver;
                        if (this.dragInstant) {
                            this._dragOver.open = true;
                            this._dragOver.append(this._dragItems[i]);
                        }
                    }
                    else if (this._dragArea === 'after') {
                        newParent = this._dragOver.parent;
                        if (this.dragInstant) {
                            this._dragOver.parent.appendAfter(this._dragItems[i], lastDraggedItem);
                            lastDraggedItem = this._dragItems[i];
                        }
                    }
                    reparentedItems.push({
                        item: this._dragItems[i],
                        old: oldParent,
                        new: newParent
                    });
                }
            }
        }
        this.emit('reparent', reparentedItems);
        this._dragItems = [];
        if (this._dragOver)
            this._dragOver = null;
        this.emit('dragend');
    };
    Tree.prototype._onDragOut = function () {
        if (!this.draggable || !this._dragging || !this._dragOver)
            return;
        this._dragOver = null;
        this._updateDragHandle();
        this.emit('dragout');
    };
    Tree.prototype._updateDragHandle = function () {
        if (!this.draggable || !this._dragging)
            return;
        if (!this._dragOver) {
            this.elementDrag.classList.add('hidden');
        }
        else {
            var rect = this._dragOver.elementTitle.getBoundingClientRect();
            this.elementDrag.classList.remove('before', 'inside', 'after', 'hidden');
            this.elementDrag.classList.add(this._dragArea);
            this.elementDrag.style.top = rect.top + 'px';
            this.elementDrag.style.left = rect.left + 'px';
            this.elementDrag.style.width = (rect.width - 4) + 'px';
        }
    };
    Tree.prototype._onAppend = function (item) {
        item.tree = this;
        var self = this;
        item.on('dragstart', function () {
            // can't drag root  TODO
            if (item.parent === self)
                return;
            self._onDragStart(item);
        });
        item.on('mouseover', function (evt) {
            self._onDragOver(item, evt);
        });
        item.on('dragend', function () {
            self._onDragEnd();
        });
    };
    Tree.prototype._onRemove = function (item) {
        item.tree = null;
        item.unbind('dragstart');
        item.unbind('mouseover');
        item.unbind('dragend');
    };
    Tree.prototype.clear = function () {
        if (!this._selected.length)
            return;
        var i = this._selected.length;
        while (i--) {
            this._selected[i].selected = false;
        }
        this._selected = [];
    };
    return Tree;
}(container_element_1.ContainerElement));
exports.Tree = Tree;
},{"../editor":5,"./container-element":18,"./tree-item":25}]},{},[15])

//# sourceMappingURL=vreditor.js.map
