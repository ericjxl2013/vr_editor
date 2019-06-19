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
},{"../lib":5}],2:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./editor"));
},{"./editor":1}],3:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./lib"));
__export(require("./editor"));
__export(require("./ui"));
},{"./editor":2,"./lib":5,"./ui":9}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./events"));
},{"./events":4}],6:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var editor_1 = require("./editor");
__export(require("./index"));
// 添加到全局变量
window.editor = new editor_1.Editor();
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
var parent = document.getElementById('test');
console.log('children');
console.log(parent);
console.log(parent.childNodes);
for (var i = 0; i < parent.children.length; i++) {
    console.log((parent.children[i]).ui = new Element());
    console.log(parent.children[i] instanceof HTMLElement);
}
console.log('childNodes');
for (var i = 0; i < parent.childNodes.length; i++) {
    console.log(parent.childNodes[i] instanceof HTMLElement);
}
},{"./editor":2,"./index":3}],7:[function(require,module,exports){
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
        _this._observer = new MutationObserver(function () {
            if (self._observerChanged)
                return;
            self._observerChanged = true;
            setTimeout(self.observerTimeout, 0);
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
            return this._innerElement ? this._innerElement.style.flexDirection : null;
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
            return this._innerElement ? this._innerElement.style.flexWrap : null;
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
            return this.element ? this.element.style.flexGrow : null;
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
            return this.element ? this.element.style.flexShrink : null;
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
    ContainerElement.prototype.observerTimeout = function () {
        this._observerChanged = false;
        this.emit('nodesChanged');
    };
    ;
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
        if (!node.parentNode || node.parentNode !== this._innerElement)
            return;
        this._innerElement.removeChild(node);
        if (!html) {
            element.parent = null;
            this.emit('remove', element);
        }
    };
    ;
    ContainerElement.prototype.clear = function () {
        var node;
        this._observer.disconnect();
        var i = this._innerElement.childNodes.length;
        while (i--) {
            node = this._innerElement.childNodes[i];
            // if (!node.ui)
            //   continue;
            // node.ui.destroy();
        }
        this._innerElement.innerHTML = '';
        this._observer.observe(this._innerElement, this._observerOptions);
    };
    ;
    return ContainerElement;
}(element_1.Element));
exports.ContainerElement = ContainerElement;
},{"./element":8}],8:[function(require,module,exports){
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
        _this.innerElement = null;
        return _this;
        // this._element!.addEventListener('click', )
    }
    Object.defineProperty(Element.prototype, "element", {
        get: function () {
            return this._element;
        },
        set: function (val) {
            if (this._element)
                return;
            this._element = val;
            // this._element!.ui = this;
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
            if (!this.innerElement)
                this.innerElement = this._element;
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
            return this._element ? this._element.style.flexGrow : null;
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
            return this._element ? this._element.style.flexShrink : null;
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
},{"../lib":5}],9:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./link"));
__export(require("./element"));
__export(require("./container-element"));
__export(require("./panel"));
},{"./container-element":7,"./element":8,"./link":10,"./panel":11}],10:[function(require,module,exports){
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
    Link.prototype.set = function (path, value) {
        this._value[path] = value;
    };
    Link.prototype.on = function (name, fn) {
        return this._element.on(name, fn);
    };
    return Link;
}());
exports.Link = Link;
},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Panel = /** @class */ (function () {
    function Panel() {
    }
    Panel.prototype.test = function () {
    };
    return Panel;
}());
exports.Panel = Panel;
},{}]},{},[6])

//# sourceMappingURL=vreditor.js.map
