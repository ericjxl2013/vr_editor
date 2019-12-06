(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)

},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var Assets = /** @class */ (function () {
    function Assets() {
        var assetsOverlay = new ui_1.Panel();
        assetsOverlay.class.add('overlay');
        engine_1.VeryEngine.assetPanel.append(assetsOverlay);
        var p = new ui_1.Progress();
        p.on('progress:100', function () {
            assetsOverlay.hidden = true;
        });
        assetsOverlay.append(p);
        p.hidden = false;
        p.progress = 1;
    }
    return Assets;
}());
exports.Assets = Assets;
},{"../../engine":49,"../../ui":68}],4:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./assets"));
},{"./assets":3}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AttributesEntity = /** @class */ (function () {
    function AttributesEntity() {
        this.inspectEvents = [];
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
    AttributesEntity.prototype.init = function () {
        var self = this;
        var inspectEvents = [];
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
    };
    AttributesEntity.prototype.initialize = function () {
    };
    AttributesEntity.prototype.toggleFields = function (selectedEntities) {
        var self = this;
        var disablePositionXY = false;
        var disableRotation = false;
        var disableScale = false;
        for (var i = 0, len = selectedEntities.length; i < len; i++) {
            var entity = selectedEntities[i];
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
        for (var i = 0; i < 3; i++) {
            self.items.fieldRotation[i].enabled = !disableRotation;
            self.items.fieldScale[i].enabled = !disableScale;
            self.items.fieldRotation[i].renderChanges = !disableRotation;
            self.items.fieldScale[i].renderChanges = !disableScale;
        }
    };
    ;
    AttributesEntity.prototype.onInspect = function (entities) {
        var self = this;
        this.onUninspect();
        var addEvents = function (entity) {
            self.inspectEvents.push(entity.on('*:set', function (path) {
                if (/components.screen.screenSpace/.test(path) ||
                    /^parent/.test(path) ||
                    /components.layoutchild.excludeFromLayout/.test(path)) {
                    toggleFieldsIfNeeded(entity);
                }
            }));
        };
        var toggleFieldsIfNeeded = function (entity) {
            if (editor.call('selector:has', entity))
                self.toggleFields(editor.call('selector:items'));
        };
        for (var i = 0, len = entities.length; i < len; i++) {
            addEvents(entities[i]);
        }
    };
    ;
    AttributesEntity.prototype.onUninspect = function () {
        var self = this;
        for (var i = 0; i < self.inspectEvents.length; i++) {
            self.inspectEvents[i].unbind();
        }
        self.inspectEvents.length = 0;
    };
    ;
    return AttributesEntity;
}());
exports.AttributesEntity = AttributesEntity;
var AttributesFieldArgs = /** @class */ (function () {
    function AttributesFieldArgs() {
    }
    return AttributesFieldArgs;
}());
exports.AttributesFieldArgs = AttributesFieldArgs;
},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AttributeHistory = /** @class */ (function () {
    function AttributeHistory() {
    }
    return AttributeHistory;
}());
exports.AttributeHistory = AttributeHistory;
},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var AttributesPanel = /** @class */ (function () {
    function AttributesPanel() {
        this.inspectedItems = [];
        this.title = '属性面板';
        this.root = engine_1.VeryEngine.attributesPanel;
        this.init();
    }
    AttributesPanel.prototype.init = function () {
        var self = this;
        // clearing
        editor.method('attributes:clear', this.clearPanel);
        // set header
        editor.method('attributes:header', function (text) {
            self.root.header = text;
        });
        // return root panel
        editor.method('attributes.rootPanel', function () {
            return self.root;
        });
        // add panel
        editor.method('attributes:addPanel', function (args) {
            args = args || {};
            // panel
            var panel = new ui_1.Panel(args.name || '');
            // parent
            (args.parent || self.root).append(panel);
            // folding
            panel.foldable = args.foldable || args.folded || false;
            panel.folded = args.folded || false;
            return panel;
        });
        // var historyState = function (item, state) {
        //   if (item.history !== undefined) {
        //     if (typeof (item.history) === 'boolean') {
        //       item.history = state;
        //     } else {
        //       item.history.enabled = state;
        //     }
        //   } else {
        //     if (item._parent && item._parent.history !== undefined) {
        //       item._parent.history.enabled = state;
        //     }
        //   }
        // };
        /* *
    
        // 属性面板添加field，关联相关数据
        editor.method('attributes:addField', function (args: any) {
          var panel = args.panel;
    
          if (!panel) {
            panel = new Panel();
            panel.flexWrap = 'nowrap';
            panel.WebkitFlexWrap = 'nowrap';
            panel.style!.display = '';
    
            if (args.type) {
              panel.class!.add('field-' + args.type);
            } else {
              panel.class!.add('field');
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
    
          var field: Element;
    
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
              var link = function (field: Element, path?: string | string[]) {
                var data = {
                  field: field,
                  type: args.type,
                  slider: args.slider,
                  enum: args.enum,
                  link: args.link,
                  trim: args.trim,
                  name: args.name,
                  stopHistory: args.stopHistory,
                  paths: [''],
                  path: ''
                };
    
                if (!path) {
                  path = args.paths || args.path;
                }
    
                if (path instanceof Array) {
                  data.paths = path;
                } else {
                  data.path = path || '';
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
                      return p + '.' + i;
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
              field.flexGrow = '1';
    
              if (args.placeholder) {
                if (field instanceof SelectField) {
                  (<SelectField>field).placeholder = args.placeholder;
                } else {
                  (<TextField>field).placeholder = args.placeholder;
                }
              }
    
              linkField();
    
              panel.append(field);
              break;
    
            case 'tags':
              // TODO: why isn't this in a seperate class/file???
    
              var innerPanel = new Panel();
              var tagType = args.tagType || 'string';
    
              if (args.enum) {
                field = new SelectField({
                  options: args.enum,
                  type: tagType
                });
                field.renderChanges = false;
                field.on('change', function (value: any) {
                  if (tagType === 'string') {
                    if (!value) return;
    
                    value = value.trim();
                  }
    
                  addTag(value);
                  field.value = '';
                });
    
                innerPanel.append(field);
    
              } else {
                field = new TextField();
                (<TextField>field).blurOnEnter = false;
                field.renderChanges = false;
    
                field.element!.addEventListener('keydown', function (evt) {
                  if (evt.keyCode !== 13 || !field.value)
                    return;
    
                  addTag(field.value.trim());
                  field.value = '';
                });
    
                innerPanel.append(field);
    
                var btnAdd = new Button('&#57632');
                btnAdd.flexGrow = '0';
                btnAdd.on('click', function () {
                  if (!field.value)
                    return;
    
                  addTag(field.value.trim());
                  field.value = '';
                });
                innerPanel.append(btnAdd);
              }
    
    
              var tagsPanel = new Panel();
              tagsPanel.class!.add('tags');
              tagsPanel.flex = true;
              innerPanel.append(tagsPanel);
    
              var tagItems = {};
              var tagIndex = {};
              var tagList = [];
    
              var onRemoveClick = function () {
                if (innerPanel.disabled)
                  return;
    
                removeTag(this.tag);
              };
    
              var removeTag = function (tag) {
                if (tagType === 'string' && !tag) {
                  return;
                } else if (tag === null || tag === undefined) {
                  return;
                }
    
                if (!tagIndex.hasOwnProperty(tag))
                  return;
    
                var records = [];
    
                for (var i = 0; i < args.link.length; i++) {
                  var path = pathAt(args, i);
                  if (args.link[i].get(path).indexOf(tag) === -1)
                    continue;
    
                  records.push({
                    get: args.link[i].history !== undefined ? args.link[i].history._getItemFn : null,
                    item: args.link[i],
                    path: path,
                    value: tag
                  });
    
                  historyState(args.link[i], false);
                  args.link[i].removeValue(path, tag);
                  historyState(args.link[i], true);
                }
    
                if (!args.stopHistory) {
                  editor.call('history:add', {
                    name: pathAt(args, 0),
                    undo: function () {
                      for (var i = 0; i < records.length; i++) {
                        var item;
                        if (records[i].get) {
                          item = records[i].get();
                          if (!item)
                            continue;
                        } else {
                          item = records[i].item;
                        }
    
                        historyState(item, false);
                        item.insert(records[i].path, records[i].value);
                        historyState(item, true);
                      }
                    },
                    redo: function () {
                      for (var i = 0; i < records.length; i++) {
                        var item;
                        if (records[i].get) {
                          item = records[i].get();
                          if (!item)
                            continue;
                        } else {
                          item = records[i].item;
                        }
    
                        historyState(item, false);
                        item.removeValue(records[i].path, records[i].value);
                        historyState(item, true);
                      }
                    }
                  });
                }
              };
    
              var addTag = function (tag) {
                var records = [];
    
                // convert to number if needed
                if (args.tagType === 'number') {
                  tag = parseInt(tag, 10);
                  if (isNaN(tag))
                    return;
                }
    
                for (var i = 0; i < args.link.length; i++) {
                  var path = pathAt(args, i);
                  if (args.link[i].get(path).indexOf(tag) !== -1)
                    continue;
    
                  records.push({
                    get: args.link[i].history !== undefined ? args.link[i].history._getItemFn : null,
                    item: args.link[i],
                    path: path,
                    value: tag
                  });
    
                  historyState(args.link[i], false);
                  args.link[i].insert(path, tag);
                  historyState(args.link[i], true);
                }
    
                if (!args.stopHistory) {
                  editor.call('history:add', {
                    name: pathAt(args, 0),
                    undo: function () {
                      for (var i = 0; i < records.length; i++) {
                        var item;
                        if (records[i].get) {
                          item = records[i].get();
                          if (!item)
                            continue;
                        } else {
                          item = records[i].item;
                        }
    
                        historyState(item, false);
                        item.removeValue(records[i].path, records[i].value);
                        historyState(item, true);
                      }
                    },
                    redo: function () {
                      for (var i = 0; i < records.length; i++) {
                        var item;
                        if (records[i].get) {
                          item = records[i].get();
                          if (!item)
                            continue;
                        } else {
                          item = records[i].item;
                        }
    
                        historyState(item, false);
                        item.insert(records[i].path, records[i].value);
                        historyState(item, true);
                      }
                    }
                  });
                }
              };
    
              var onInsert = function (tag) {
                if (!tagIndex.hasOwnProperty(tag)) {
                  tagIndex[tag] = 0;
                  tagList.push(tag);
                }
    
                tagIndex[tag]++;
                insertElement(tag);
              };
    
              var onRemove = function (tag) {
                if (!tagIndex[tag])
                  return;
    
                tagIndex[tag]--;
    
                if (!tagIndex[tag]) {
                  tagsPanel.innerElement.removeChild(tagItems[tag]);
                  var ind = tagList.indexOf(tag);
                  if (ind !== -1)
                    tagList.splice(ind, 1);
    
                  delete tagItems[tag];
                  delete tagIndex[tag];
                } else {
                  if (tagIndex[tag] === args.link.length) {
                    tagItems[tag].classList.remove('partial');
                  } else {
                    tagItems[tag].classList.add('partial');
                  }
                }
              };
    
              // when tag field is initialized
              var onSet = function (values) {
                for (var i = 0; i < values.length; i++) {
                  var value = values[i];
                  onInsert(value);
                }
              };
    
              var insertElement = function (tag) {
                if (!tagItems[tag]) {
                  sortTags();
    
                  var item = document.createElement('div');
                  tagItems[tag] = item;
                  item.classList.add('tag');
                  var itemText = document.createElement('span');
                  itemText.textContent = args.tagToString ? args.tagToString(tag) : tag;
                  item.appendChild(itemText);
    
                  // the original tag value before tagToString is called. Useful
                  // if the tag value is an id for example
                  item.originalValue = tag;
    
                  // attach click handler on text part of the tag - bind the listener
                  // to the tag item so that `this` refers to that tag in the listener
                  if (args.onClickTag) {
                    itemText.addEventListener('click', args.onClickTag.bind(item));
                  }
    
                  var icon = document.createElement('span');
                  icon.innerHTML = '&#57650;';
                  icon.classList.add('icon');
                  icon.tag = tag;
                  icon.addEventListener('click', onRemoveClick, false);
                  item.appendChild(icon);
    
                  var ind = tagList.indexOf(tag);
                  if (tagItems[tagList[ind + 1]]) {
                    tagsPanel.appendBefore(item, tagItems[tagList[ind + 1]]);
                  } else {
                    tagsPanel.append(item);
                  }
                }
    
                if (tagIndex[tag] === args.link.length) {
                  tagItems[tag].classList.remove('partial');
                } else {
                  tagItems[tag].classList.add('partial');
                }
              };
    
              var sortTags = function () {
                tagList.sort(function (a, b) {
                  if (args.tagToString) {
                    a = args.tagToString(a);
                    b = args.tagToString(b);
                  }
    
                  if (a > b) {
                    return 1;
                  } else if (a < b) {
                    return -1;
                  } else {
                    return 0;
                  }
                });
              };
    
              if (args.placeholder)
                field.placeholder = args.placeholder;
    
              // list
              args.linkEvents = [];
    
              args.linkField = function () {
                if (args.link) {
                  if (!(args.link instanceof Array))
                    args.link = [args.link];
    
                  for (var i = 0; i < args.link.length; i++) {
                    var path = pathAt(args, i);
                    var tags = args.link[i].get(path);
    
                    args.linkEvents.push(args.link[i].on(path + ':set', onSet));
                    args.linkEvents.push(args.link[i].on(path + ':insert', onInsert));
                    args.linkEvents.push(args.link[i].on(path + ':remove', onRemove));
    
                    if (!tags)
                      continue;
    
                    for (var t = 0; t < tags.length; t++) {
                      if (tagType === 'string' && !tags[t]) {
                        continue;
                      } else if (tags[t] === null || tags[t] === undefined) {
                        continue;
                      }
    
                      if (!tagIndex.hasOwnProperty(tags[t])) {
                        tagIndex[tags[t]] = 0;
                        tagList.push(tags[t]);
                      }
    
                      tagIndex[tags[t]]++;
                    }
                  }
                }
    
                sortTags();
    
                for (var i = 0; i < tagList.length; i++)
                  insertElement(tagList[i]);
              };
    
              args.unlinkField = function () {
                for (var i = 0; i < args.linkEvents.length; i++)
                  args.linkEvents[i].unbind();
    
                args.linkEvents = [];
    
                for (var key in tagItems)
                  tagsPanel.innerElement.removeChild(tagItems[key]);
    
                tagList = [];
                tagIndex = {};
                tagItems = {};
              };
    
              args.linkField();
    
              panel.once('destroy', args.unlinkField);
    
              panel.append(innerPanel);
              break;
    
            case 'text':
              field = new TextAreaField();
    
              field.value = args.value || '';
              field.flexGrow = '1';
    
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
              field.flexGrow = '1';
    
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
                field.flexGrow = '1';
              } else {
                field = new Checkbox();
              }
    
              field.value = args.value || 0;
              field.class!.add('tick');
    
              linkField();
    
              panel.append(field);
              break;
    
            case 'vec2':
            case 'vec3':
            case 'vec4':
              var channels = parseInt(args.type[3], 10);
              field = [];
    
              for (var i = 0; i < channels; i++) {
                field[i] = new NumberField();
                field[i].flexGrow = '1';
                field[i].style!.width = '24px';
                field[i].value = (args.value && args.value[i]) || 0;
                panel.append(field[i]);
    
                if (args.placeholder)
                  field[i].placeholder = args.placeholder[i];
    
                if (args.precision != null)
                  field[i].precision = args.precision;
    
                if (args.step != null)
                  field[i].step = args.step;
    
                if (args.min != null)
                  field[i].min = args.min;
    
                if (args.max != null)
                  field[i].max = args.max;
    
                // if (args.link)
                //     field[i].link(args.link, args.path + '.' + i);
              }
    
              linkField();
              break;
    
            case 'rgb':
              field = new ColorField();
    
              if (args.channels != null)
                field.channels = args.channels;
    
              linkField();
    
              var colorPickerOn = false;
              field.on('click', function () {
                colorPickerOn = true;
                var first = true;
    
                // set picker color
                editor.call('picker:color', field.value);
    
                // picking starts
                var evtColorPickStart = editor.on('picker:color:start', function () {
                  first = true;
                });
    
                // picked color
                var evtColorPick = editor.on('picker:color', function (color) {
                  first = false;
                  field.value = color;
                });
    
                // position picker
                var rectPicker = editor.call('picker:color:rect');
                var rectField = field.element.getBoundingClientRect();
                editor.call('picker:color:position', rectField.left - rectPicker.width, rectField.top);
    
                // color changed, update picker
                var evtColorToPicker = field.on('change', function () {
                  editor.call('picker:color:set', this.value);
                });
    
                // picker closed
                editor.once('picker:color:close', function () {
                  evtColorPick.unbind();
                  evtColorPickStart.unbind();
                  evtColorToPicker.unbind();
                  colorPickerOn = false;
                  field.element.focus();
                });
              });
    
              // close picker if field destroyed
              field.on('destroy', function () {
                if (colorPickerOn)
                  editor.call('picker:color:close');
              });
    
              panel.append(field);
              break;
    
            case 'asset':
              field = new ImageField(args.kind === 'material' || args.kind === 'model' || args.kind === 'cubemap' || args.kind === 'font' || args.kind === 'sprite');
              var evtPick;
    
              if (label) {
                label.renderChanges = false;
                field._label = label;
    
                label.style!.width = '32px';
                label.flexGrow = '1';
              }
    
    
              var panelFields = document.createElement('div');
              panelFields.classList.add('top');
    
              var panelControls = document.createElement('div');
              panelControls.classList.add('controls');
    
              var fieldTitle = field._title = new Label();
              fieldTitle.text = 'Empty';
              fieldTitle.parent = panel;
              fieldTitle.flexGrow = '1';
              fieldTitle.placeholder = '...';
    
              var btnEdit = new Button('&#57648;');
              btnEdit.disabled = true;
              btnEdit.parent = panel;
              btnEdit.flexGrow = '0';
    
              var btnRemove = new Button('&#57650;');
              btnRemove.disabled = true;
              btnRemove.parent = panel;
              btnRemove.flexGrow = '0';
    
              fieldTitle.on('click', function () {
                var asset = editor.call('assets:get', field.value);
                editor.call('picker:asset', {
                  type: args.kind,
                  currentAsset: asset
                });
    
                evtPick = editor.once('picker:asset', function (asset) {
                  var oldValues = {};
                  if (args.onSet && args.link && args.link instanceof Array) {
                    for (var i = 0; i < args.link.length; i++) {
                      var id = 0;
                      if (args.link[i]._type === 'asset') {
                        id = args.link[i].get('id');
                      } else if (args.link[i]._type === 'entity') {
                        id = args.link[i].get('resource_id');
                      } else {
                        continue;
                      }
    
                      oldValues[id] = args.link[i].get(pathAt(args, i));
                    }
                  }
    
                  field.emit('beforechange', asset.get('id'));
                  field.value = asset.get('id');
                  evtPick = null;
                  if (args.onSet) args.onSet(asset, oldValues);
                });
    
                editor.once('picker:asset:close', function () {
                  if (evtPick) {
                    evtPick.unbind();
                    evtPick = null;
                  }
                  field.element.focus();
                });
              });
    
              field.on('click', function () {
                if (!this.value)
                  return;
    
                var asset = editor.call('assets:get', this.value);
                if (!asset) return;
                editor.call('selector:set', 'asset', [asset]);
    
                if (legacyScripts && asset.get('type') === 'script') {
                  editor.call('assets:panel:currentFolder', 'scripts');
                } else {
                  var path = asset.get('path');
                  if (path.length) {
                    editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
                  } else {
                    editor.call('assets:panel:currentFolder', null);
                  }
                }
              });
              btnEdit.on('click', function () {
                field.emit('click');
              });
    
              btnRemove.on('click', function () {
                field.emit('beforechange', null);
                field.value = null;
              });
    
              var watch = null;
              var watchAsset = null;
              var renderQueued;
              var queueRender;
    
              var evtThumbnailChange;
              var updateThumbnail = function (empty) {
                var asset = editor.call('assets:get', field.value);
    
                if (watch) {
                  editor.call('assets:' + watchAsset.get('type') + ':unwatch', watchAsset, watch);
                  watchAsset = watch = null;
                }
    
                if (empty) {
                  field.image = '';
                } else if (!asset) {
                  field.image = config.url.home + '/editor/scene/img/asset-placeholder-texture.png';
                } else {
                  if (asset.has('thumbnails.m')) {
                    var src = asset.get('thumbnails.m');
                    if (src.startsWith('data:image/png;base64')) {
                      field.image = asset.get('thumbnails.m');
                    } else {
                      field.image = config.url.home + asset.get('thumbnails.m').appendQuery('t=' + asset.get('file.hash'));
                    }
                  } else {
                    field.image = '/editor/scene/img/asset-placeholder-' + asset.get('type') + '.png';
                  }
    
                  if (args.kind === 'material' || args.kind === 'model' || args.kind === 'cubemap' || args.kind == 'font' || args.kind === 'sprite') {
                    watchAsset = asset;
                    watch = editor.call('assets:' + args.kind + ':watch', {
                      asset: watchAsset,
                      autoLoad: true,
                      callback: queueRender
                    });
                  }
                }
    
                if (queueRender)
                  queueRender();
              };
    
              if (args.kind === 'material' || args.kind === 'model' || args.kind === 'font' || args.kind === 'sprite') {
                if (args.kind !== 'sprite') {
                  field.elementImage.classList.add('flipY');
                }
    
                var renderPreview = function () {
                  renderQueued = false;
    
                  if (watchAsset) {
                    // render
                    editor.call('preview:render', watchAsset, 128, 128, field.elementImage);
                  } else {
                    var ctx = field.elementImage.ctx;
                    if (!ctx)
                      ctx = field.elementImage.ctx = field.elementImage.getContext('2d');
    
                    ctx.clearRect(0, 0, field.elementImage.width, field.elementImage.height);
                  }
                };
    
                renderPreview();
    
                queueRender = function () {
                  if (renderQueued) return;
                  renderQueued = true;
                  requestAnimationFrame(renderPreview);
                };
    
                var evtSceneSettings = editor.on('preview:scene:changed', queueRender);
    
                field.once('destroy', function () {
                  evtSceneSettings.unbind();
                  evtSceneSettings = null;
    
                  if (watch) {
                    editor.call('assets:' + watchAsset.get('type') + ':unwatch', watchAsset, watch);
                    watchAsset = watch = null;
                  }
                });
              } else if (args.kind === 'cubemap') {
                field.elementImage.width = 60;
                field.elementImage.height = 60;
    
                var positions = [[30, 22], [0, 22], [15, 7], [15, 37], [15, 22], [45, 22]];
                var images = [null, null, null, null, null, null];
    
                var renderPreview = function () {
                  renderQueued = false;
    
                  var ctx = field.elementImage.ctx;
                  if (!ctx)
                    ctx = field.elementImage.ctx = field.elementImage.getContext('2d');
    
                  ctx.clearRect(0, 0, field.elementImage.width, field.elementImage.height);
    
                  if (watchAsset) {
                    for (var i = 0; i < 6; i++) {
                      var id = watchAsset.get('data.textures.' + i);
                      var image = null;
    
                      if (id) {
                        var texture = editor.call('assets:get', id);
                        if (texture) {
                          var hash = texture.get('file.hash');
                          if (images[i] && images[i].hash === hash) {
                            image = images[i];
                          } else {
                            var url = texture.get('thumbnails.s');
    
                            if (images[i])
                              images[i].onload = null;
    
                            images[i] = null;
    
                            if (url) {
                              image = images[i] = new Image();
                              image.hash = hash;
                              image.onload = queueRender;
                              image.src = url.appendQuery('t=' + hash);
                            }
                          }
                        } else if (images[i]) {
                          images[i].onload = null;
                          images[i] = null;
                        }
                      } else if (images[i]) {
                        images[i].onload = null;
                        images[i] = null;
                      }
    
                      if (image) {
                        ctx.drawImage(image, positions[i][0], positions[i][1], 15, 15);
                      } else {
                        ctx.beginPath();
                        ctx.rect(positions[i][0], positions[i][1], 15, 15);
                        ctx.fillStyle = '#000';
                        ctx.fill();
                      }
                    }
                  }
                };
    
                renderPreview();
    
                queueRender = function () {
                  if (renderQueued) return;
                  renderQueued = true;
                  requestAnimationFrame(renderPreview);
                };
    
                field.once('destroy', function () {
                  if (watch) {
                    editor.call('assets:cubemap:unwatch', watchAsset, watch);
                    watchAsset = watch = null;
                  }
                });
              }
    
              linkField();
    
              var updateField = function () {
                var value = field.value;
    
                fieldTitle.text = field.class!.contains('null') ? 'various' : 'Empty';
    
                btnEdit.disabled = !value;
                btnRemove.disabled = !value && !field.class!.contains('null');
    
                if (evtThumbnailChange) {
                  evtThumbnailChange.unbind();
                  evtThumbnailChange = null;
                }
    
                if (!value) {
                  if (field.class!.contains('star'))
                    fieldTitle.text = '* ' + fieldTitle.text;
    
                  field.empty = true;
                  updateThumbnail(true);
    
                  return;
                }
    
                field.empty = false;
    
                var asset = editor.call('assets:get', value);
    
                if (!asset)
                  return updateThumbnail();
    
                evtThumbnailChange = asset.on('file.hash.m:set', updateThumbnail);
                updateThumbnail();
    
                fieldTitle.text = asset.get('name');
    
                if (field.class!.contains('star'))
                  fieldTitle.text = '* ' + fieldTitle.text;
              };
              field.on('change', updateField);
    
              if (args.value)
                field.value = args.value;
    
              updateField();
    
              var dropRef = editor.call('drop:target', {
                ref: panel.element,
                filter: function (type, data) {
                  var rectA = root.innerElement.getBoundingClientRect();
                  var rectB = panel.element.getBoundingClientRect();
                  return data.id && (args.kind === '*' || type === 'asset.' + args.kind) && parseInt(data.id, 10) !== field.value && !editor.call('assets:get', parseInt(data.id, 10)).get('source') && rectB.top > rectA.top && rectB.bottom < rectA.bottom;
                },
                drop: function (type, data) {
                  if ((args.kind !== '*' && type !== 'asset.' + args.kind) || editor.call('assets:get', parseInt(data.id, 10)).get('source'))
                    return;
    
                  var oldValues = {};
                  if (args.onSet && args.link && args.link instanceof Array) {
                    for (var i = 0; i < args.link.length; i++) {
                      var id = 0;
                      if (args.link[i]._type === 'asset') {
                        id = args.link[i].get('id');
                      } else if (args.link[i]._type === 'entity') {
                        id = args.link[i].get('resource_id');
                      } else {
                        continue;
                      }
    
                      oldValues[id] = args.link[i].get(pathAt(args, i));
                    }
                  }
    
                  field.emit('beforechange', parseInt(data.id, 10));
                  field.value = parseInt(data.id, 10);
    
                  if (args.onSet) {
                    var asset = editor.call('assets:get', parseInt(data.id, 10));
                    if (asset) args.onSet(asset, oldValues);
                  }
                },
                over: function (type, data) {
                  if (args.over)
                    args.over(type, data);
                },
                leave: function () {
                  if (args.leave)
                    args.leave();
                }
              });
              field.on('destroy', function () {
                dropRef.unregister();
                if (evtThumbnailChange) {
                  evtThumbnailChange.unbind();
                  evtThumbnailChange = null;
                }
              });
    
              // thumbnail
              panel.append(field);
              // right side
              panel.append(panelFields);
              // controls
              panelFields.appendChild(panelControls);
              // label
              if (label) {
                panel.innerElement.removeChild(label.element);
                panelControls.appendChild(label.element);
              }
              panelControls.classList.remove('label-field');
              // edit
              panelControls.appendChild(btnEdit.element);
              // remove
              panelControls.appendChild(btnRemove.element);
    
              // title
              panelFields.appendChild(fieldTitle.element);
              break;
    
            // entity picker
            case 'entity':
              field = new Label();
              field.class!.add('add-entity');
              field.flexGrow = '1';
              field.class!.add('null');
    
              field.text = 'Select Entity';
              field.placeholder = '...';
    
              panel.append(field);
    
              var icon = document.createElement('span');
              icon.classList.add('icon');
    
              icon.addEventListener('click', function (e) {
                e.stopPropagation();
    
                if (editor.call('permissions:write'))
                  field.text = '';
              });
    
              field.on('change', function (value) {
                if (value) {
                  var entity = editor.call('entities:get', value);
                  if (!entity) {
                    field.text = null;
                    return;
                  }
    
                  field.element.innerHTML = entity.get('name');
                  field.element.appendChild(icon);
                  field.placeholder = '';
    
                  if (value !== 'various')
                    field.class.remove('null');
                } else {
                  field.element.innerHTML = 'Select Entity';
                  field.placeholder = '...';
                  field.class!.add('null');
                }
              });
    
              linkField();
    
              var getCurrentEntity = function () {
                var entity = null;
                if (args.link) {
                  if (!(args.link instanceof Array)) {
                    args.link = [args.link];
                  }
    
                  // get initial value only if it's the same for all
                  // links otherwise set it to null
                  for (var i = 0, len = args.link.length; i < len; i++) {
                    var val = args.link[i].get(pathAt(args, i));
                    if (entity !== val) {
                      if (entity) {
                        entity = null;
                        break;
                      } else {
                        entity = val;
                      }
                    }
                  }
                }
    
                return entity;
              };
    
              field.on('click', function () {
                var evtEntityPick = editor.once('picker:entity', function (entity) {
                  field.text = entity ? entity.get('resource_id') : null;
                  evtEntityPick = null;
                });
    
                var initialValue = getCurrentEntity();
    
                editor.call('picker:entity', initialValue, args.filter || null);
    
                editor.once('picker:entity:close', function () {
                  if (evtEntityPick) {
                    evtEntityPick.unbind();
                    evtEntityPick = null;
                  }
                });
              });
    
              // highlight on hover
              field.on('hover', function () {
                var entity = getCurrentEntity();
                if (!entity) return;
    
                editor.call('entities:panel:highlight', entity, true);
    
                field.once('blur', function () {
                  editor.call('entities:panel:highlight', entity, false);
                });
    
                field.once('click', function () {
                  editor.call('entities:panel:highlight', entity, false);
                });
              });
    
              var dropRef = editor.call('drop:target', {
                ref: field.element,
                filter: function (type, data) {
                  var rectA = root.innerElement.getBoundingClientRect();
                  var rectB = field.element.getBoundingClientRect();
                  return type === 'entity' && data.resource_id !== field.value && rectB.top > rectA.top && rectB.bottom < rectA.bottom;
                },
                drop: function (type, data) {
                  if (type !== 'entity')
                    return;
    
                  field.value = data.resource_id;
                },
                over: function (type, data) {
                  if (args.over)
                    args.over(type, data);
                },
                leave: function () {
                  if (args.leave)
                    args.leave();
                }
              });
              field.on('destroy', function () {
                dropRef.unregister();
              });
    
              break;
            case 'image':
              panel.flex = false;
    
              field = new Image();
              field.style!.maxWidth = '100%';
              field.style!.display = 'block';
              field.src = args.src;
    
              panel.append(field);
              break;
    
            case 'progress':
              field = new Progress();
              field.flexGrow = '1';
    
              panel.append(field);
              break;
    
            case 'code':
              field = new Code();
              field.flexGrow = '1';
    
              if (args.value)
                field.text = args.value;
    
              panel.append(field);
              break;
    
            case 'button':
              field = new Button();
              field.flexGrow = '1';
              field.text = args.text || 'Button';
              panel.append(field);
              break;
    
            case 'element':
              field = args.element;
              panel.append(field);
              break;
    
            case 'curveset':
              field = new ui.CurveField(args);
              field.flexGrow = '1';
              field.text = args.text || '';
    
              // Warning: Curve fields do not currently support multiselect
              if (args.link) {
                var link = args.link;
                if (args.link instanceof Array)
                  link = args.link[0];
    
                var path = pathAt(args, 0);
    
                field.link(link, args.canRandomize ? [path, path + '2'] : [path]);
              }
    
              var curvePickerOn = false;
    
              var toggleCurvePicker = function () {
                if (!field.class!.contains('disabled') && !curvePickerOn) {
                  editor.call('picker:curve', field.value, args);
    
                  curvePickerOn = true;
    
                  // position picker
                  var rectPicker = editor.call('picker:curve:rect');
                  var rectField = field.element.getBoundingClientRect();
                  editor.call('picker:curve:position', rectField.right - rectPicker.width, rectField.bottom);
    
                  args.keepZoom = false;
    
                  var combine = false;
    
                  var evtChangeStart = editor.on('picker:curve:change:start', function () {
                    combine = true;
                  });
    
                  var evtChangeEnd = editor.on('picker:curve:change:end', function () {
                    combine = false;
                  });
    
                  var evtPickerChanged = editor.on('picker:curve:change', function (paths, values) {
                    if (!field._link) return;
    
                    var link = field._link;
    
                    var previous = {
                      paths: [],
                      values: []
                    };
    
                    var path;
                    for (var i = 0, len = paths.length; i < len; i++) {
                      path = pathAt(args, 0); // always use 0 because we do not support multiselect
                      // use the second curve path if needed
                      if (args.canRandomize && paths[i][0] !== '0') {
                        path += '2';
                      }
    
                      path += paths[i].substring(1);
    
                      previous.paths.push(path);
                      previous.values.push(field._link.get(path));
                    }
    
    
                    var undo = function () {
                      var item = link;
                      if (link.history && link.history._getItemFn) {
                        item = link.history._getItemFn();
                      }
    
                      if (!item) return;
    
                      args.keepZoom = true;
    
                      var history = false;
                      if (item.history) {
                        history = item.history.enabled;
                        item.history.enabled = false;
                      }
    
                      for (var i = 0, len = previous.paths.length; i < len; i++) {
                        item.set(previous.paths[i], previous.values[i]);
                      }
    
                      if (item.history)
                        item.history.enabled = history;
    
                      args.keepZoom = false;
                    };
    
                    var redo = function () {
                      var item = link;
                      if (link.history && link.history._getItemFn) {
                        item = link.history._getItemFn();
                      }
    
                      if (!item) return;
    
                      args.keepZoom = true;
    
                      var history = false;
                      if (item.history) {
                        history = item.history.enabled;
                        item.history.enabled = false;
                      }
    
                      for (var i = 0, len = paths.length; i < len; i++) {
                        path = pathAt(args, 0); // always use 0 because we do not support multiselect
                        // use the second curve path if needed
                        if (args.canRandomize && paths[i][0] !== '0') {
                          path += '2';
                        }
    
                        path += paths[i].substring(1);
    
                        item.set(path, values[i]);
                      }
    
                      if (item.history)
                        item.history.enabled = history;
    
                      args.keepZoom = false;
                    };
    
                    redo();
    
                    // add custom history event
                    editor.call('history:' + (combine ? 'update' : 'add'), {
                      name: path + '.curves',
                      undo: undo,
                      redo: redo
                    });
    
                  });
    
                  var evtRefreshPicker = field.on('change', function (value) {
                    editor.call('picker:curve:set', value, args);
                  });
    
                  editor.once('picker:curve:close', function () {
                    evtRefreshPicker.unbind();
                    evtPickerChanged.unbind();
                    evtChangeStart.unbind();
                    evtChangeEnd.unbind();
                    curvePickerOn = false;
                  });
                }
              };
    
              // open curve editor on click
              field.on('click', toggleCurvePicker);
    
              // close picker if field destroyed
              field.on('destroy', function () {
                if (curvePickerOn) {
                  editor.call('picker:curve:close');
                }
              });
    
              panel.append(field);
              break;
    
            case 'gradient':
              field = new ui.CurveField(args);
              field.flexGrow = '1';
              field.text = args.text || '';
    
              if (args.link) {
                var link = args.link;
                if (args.link instanceof Array)
                  link = args.link[0];
                var path = pathAt(args, 0);
                field.link(link, [path]);
              }
    
              var gradientPickerVisible = false;
    
              var toggleGradientPicker = function () {
                if (!field.class!.contains('disabled') && !gradientPickerVisible) {
                  editor.call('picker:gradient', field.value, args);
    
                  gradientPickerVisible = true;
    
                  // position picker
                  var rectPicker = editor.call('picker:gradient:rect');
                  var rectField = field.element.getBoundingClientRect();
                  editor.call('picker:gradient:position', rectField.right - rectPicker.width, rectField.bottom);
    
                  var evtPickerChanged = editor.on('picker:curve:change', function (paths, values) {
                    if (!field._link) return;
    
                    var link = field._link;
    
                    var previous = {
                      paths: [],
                      values: []
                    };
    
                    var path;
                    for (var i = 0; i < paths.length; i++) {
                      // always use 0 because we do not support multiselect
                      path = pathAt(args, 0) + paths[i].substring(1);
                      previous.paths.push(path);
                      previous.values.push(field._link.get(path));
                    }
    
                    var undo = function () {
                      var item = link;
                      if (link.history && link.history._getItemFn) {
                        item = link.history._getItemFn();
                      }
    
                      if (!item) return;
    
                      var history = false;
                      if (item.history) {
                        history = item.history.enabled;
                        item.history.enabled = false;
                      }
    
                      for (var i = 0; i < previous.paths.length; i++) {
                        item.set(previous.paths[i], previous.values[i]);
                      }
    
                      if (item.history)
                        item.history.enabled = history;
                    };
    
                    var redo = function () {
                      var item = link;
                      if (link.history && link.history._getItemFn) {
                        item = link.history._getItemFn();
                      }
    
                      if (!item) return;
    
                      var history = false;
                      if (item.history) {
                        history = item.history.enabled;
                        item.history.enabled = false;
                      }
    
                      for (var i = 0; i < paths.length; i++) {
                        // always use 0 because we do not support multiselect
                        path = pathAt(args, 0) + paths[i].substring(1);
                        item.set(path, values[i]);
                      }
    
                      if (item.history)
                        item.history.enabled = history;
                    };
    
                    redo();
    
                    editor.call('history:' + 'add', {
                      name: path + '.curves',
                      undo: undo,
                      redo: redo
                    });
                  });
    
                  var evtRefreshPicker = field.on('change', function (value) {
                    editor.call('picker:gradient:set', value, args);
                  });
    
                  editor.once('picker:gradient:close', function () {
                    evtRefreshPicker.unbind();
                    evtPickerChanged.unbind();
                    gradientPickerVisible = false;
                  });
                }
              };
    
              // open curve editor on click
              field.on('click', toggleGradientPicker);
    
              panel.append(field);
              break;
    
            case 'array':
              field = editor.call('attributes:addArray', args);
              panel.append(field);
    
              break;
    
            default:
              field = new Label();
              field.flexGrow = '1';
              (<Label>field).text = args.value || '';
              field.class!.add('selectable');
    
              if (args.placeholder)
                (<Label>field).placeholder = args.placeholder;
    
              linkField();
    
              panel.append(field);
              break;
          }
    
          if (args.className && field instanceof Element) {
            field.class!.add(args.className);
          }
    
          return field;
        });
    
        */
        editor.on('attributes:clear', function () {
            for (var i = 0; i < self.inspectedItems.length; i++) {
                self.inspectedItems[i].unbind();
            }
            self.inspectedItems = [];
        });
        editor.method('attributes:inspect', function (type, item) {
            self.clearPanel();
            // clear if destroyed
            self.inspectedItems.push(item.once('destroy', function () {
                editor.call('attributes:clear');
            }));
            self.root.header = type;
            editor.emit('attributes:inspect[' + type + ']', [item]);
            editor.emit('attributes:inspect[*]', type, [item]);
        });
        editor.on('selector:change', function (type, items) {
            self.clearPanel();
            console.warn('选中entity长度：' + items.length);
            // nothing selected
            if (items.length === 0) {
                var label = new ui_1.Label('请选择物体或资源');
                label.style.display = 'block';
                label.style.textAlign = 'center';
                label.style.width = '100%';
                // label.style!.height = '22px';
                self.root.append(label);
                self.root.header = self.title;
                return;
            }
            // clear if destroyed
            for (var i = 0; i < items.length; i++) {
                // TODO：当前item为空
                self.inspectedItems.push(items[i].once('destroy', function () {
                    editor.call('attributes:clear');
                }));
            }
            self.root.header = type;
            editor.emit('attributes:inspect[' + type + ']', items);
            editor.emit('attributes:inspect[*]', type, items);
        });
        // 初始时，默认没有选中物体
        editor.emit('selector:change', null, []);
    };
    AttributesPanel.prototype.clearPanel = function () {
        editor.emit('attributes:beforeClear');
        this.root.clear();
        editor.emit('attributes:clear');
    };
    return AttributesPanel;
}());
exports.AttributesPanel = AttributesPanel;
},{"../../engine":49,"../../ui":68}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
// 属性参考说明Tooltip
var AttributesReference = /** @class */ (function () {
    function AttributesReference() {
        this.index = {};
        this.missing = {};
        this.root = engine_1.VeryEngine.rootPanel;
        this.attributesPanel = engine_1.VeryEngine.attributesPanel;
        this.init();
    }
    AttributesReference.prototype.init = function () {
        var self = this;
        // TODO
        editor.method('attributes:reference:add', function (args) {
            self.index[args.name] = editor.call('attributes:reference', args);
        });
        editor.method('attributes:reference:attach', function (name, target, element, panel) {
            var tooltip = self.index[name];
            if (!tooltip) {
                if (!self.missing[name]) {
                    self.missing[name] = true;
                    console.log('reference', name, 'is not defined');
                }
                return;
            }
            tooltip.attachReference({
                target: target,
                panel: panel,
                element: element || target.ui
            });
            return tooltip;
        });
        editor.method('attributes:reference:template', function (args) {
            var html = '';
            if (args.title)
                html += '<h1>' + self.sanitize(args.title) + '</h1>';
            if (args.subTitle)
                html += '<h2>' + self.sanitize(args.subTitle) + '</h2>';
            if (args.webgl2)
                html += '<div class="tag">WebGL 2.0 Only</div>';
            if (args.description) {
                var description = self.sanitize(args.description);
                description = description.replace(/\n/g, '<br />'); // new lines
                description = description.replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>'); // bold
                html += '<p>' + description + '</p>';
            }
            if (args.code)
                html += '<pre class="ui-code">' + self.sanitize(args.code) + '</pre>';
            if (args.url)
                html += '<a class="reference" href="' + self.sanitize(args.url) + '" target="_blank">API Reference</a>';
            return html;
        });
        editor.method('attributes:reference', function (args) {
            var tooltip = new ui_1.Tooltip({
                align: 'right'
            });
            tooltip.hoverable = true;
            tooltip.class.add('reference');
            tooltip.html = editor.call('attributes:reference:template', args);
            // let links = {};
            var timerHover = null;
            var timerBlur = null;
            // 重写该方法
            tooltip.attachReference = function (args) {
                var target = args.target;
                var element = args.element;
                var targetPanel = args.panel || self.attributesPanel;
                var show = function () {
                    if (!target || target.hidden)
                        return;
                    tooltip.position(targetPanel.element.getBoundingClientRect().left, element.getBoundingClientRect().top + 16);
                    tooltip.hidden = false;
                };
                var evtHide = function () {
                    if (timerHover !== null)
                        clearTimeout(timerHover);
                    if (timerBlur !== null)
                        clearTimeout(timerBlur);
                    tooltip.hidden = true;
                };
                var evtHover = function () {
                    if (timerBlur !== null)
                        clearTimeout(timerBlur);
                    timerHover = setTimeout(show, 500);
                };
                var evtBlur = function () {
                    if (timerHover !== null)
                        clearTimeout(timerHover);
                    timerBlur = setTimeout(hide, 200);
                };
                var evtClick = function () {
                    if (timerHover !== null)
                        clearTimeout(timerHover);
                    if (timerBlur !== null)
                        clearTimeout(timerBlur);
                    show();
                };
                target.on('hide', evtHide);
                target.once('destroy', function () {
                    element.removeEventListener('mouseover', evtHover);
                    element.removeEventListener('mouseout', evtBlur);
                    element.removeEventListener('click', evtClick);
                    target.unbind('hide', evtHide);
                    target = null;
                    element = null;
                    if (timerHover !== null)
                        clearTimeout(timerHover);
                    if (timerBlur !== null)
                        clearTimeout(timerBlur);
                    tooltip.hidden = true;
                });
                element.addEventListener('mouseover', evtHover, false);
                element.addEventListener('mouseout', evtBlur, false);
                element.addEventListener('click', evtClick, false);
            };
            var hide = function () {
                tooltip.hidden = true;
            };
            tooltip.on('hover', function () {
                clearTimeout(timerBlur);
            });
            self.root.append(tooltip);
            return tooltip;
        });
    };
    AttributesReference.prototype.sanitize = function (str) {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    ;
    return AttributesReference;
}());
exports.AttributesReference = AttributesReference;
},{"../../engine":49,"../../ui":68}],9:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./attributes-panel"));
__export(require("./attributes-entity"));
__export(require("./attributes-history"));
__export(require("./attributes-reference"));
},{"./attributes-entity":5,"./attributes-history":6,"./attributes-panel":7,"./attributes-reference":8}],10:[function(require,module,exports){
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
        // 相较于Events，同一个函数名只可代表一个函数；
        // 某个name对应的某个事件，name与Function是1对1的关系；
        _this._hooks = {};
        return _this;
    }
    /**
     * 添加全局函数，函数名与函数本体一一对应，不能重名；
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
},{"../lib":53}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var middleware_1 = require("../middleware");
var Entities = /** @class */ (function () {
    function Entities() {
        this.lists = [];
        this._indexed = {};
        this.container = new middleware_1.MiddleContainer();
    }
    // 1.建立基本的数据格式；
    // 2.串联hierarchy，包括基本的菜单；
    // 3.尝试建立property；
    // 4.串联Assets结构与UI；
    Entities.prototype.addRaw = function (entity_data) {
        console.log('***entity-data***');
        console.log(entity_data);
        var gameObject = this.createGameObject(entity_data);
        // add component
        // children
        // parent
        this.container.addGameObject(gameObject);
    };
    Entities.prototype.createGameObject = function (entity) {
        // TODO: 解析是node还是mesh
        // 设置name
        var instance = new middleware_1.GameObject(entity.name);
        // 设置guid
        instance.guid = entity.resource_id;
        // 设置位置
        // 设置角度
        // 设置比例值
        // 设置enable ? 不存在的情况
        instance.setActive(entity.enabled);
        // 设置visiable
        // 设置tags
        return instance;
    };
    Entities.prototype.add = function (item) { };
    Entities.prototype.has = function (item) {
        return false;
    };
    Entities.prototype.set = function (index, item) { };
    Entities.prototype.get = function (index) {
        return this._indexed[index];
    };
    Entities.prototype.indexOf = function (item) {
        return this.lists.indexOf(item);
    };
    return Entities;
}());
exports.Entities = Entities;
},{"../middleware":28}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var entities_1 = require("./entities");
var lib_1 = require("../../lib");
var EntityLoad = /** @class */ (function () {
    function EntityLoad() {
        this.loadedEntities = false;
        this._entities = new entities_1.Entities();
    }
    EntityLoad.prototype.scene_raw = function (row_data) {
        // 解析entity
        // 清空
        // editor.call('selector:clear');
        // editor.call('entities:clear');
        // editor.call('attributes:clear');
        // 加载进度条计算
        var total = Object.keys(row_data.entities).length;
        var i = 0;
        // list 挨个解析
        for (var key in row_data.entities) {
            // 是否需要加入一个中间结构
            this._entities.addRaw(row_data.entities[key]);
            var entity = new lib_1.Observer(row_data.entities[key]);
            debug.warn(entity.get('name'));
            debug.warn(entity.get('resource_id'));
            if (entity.has('components.rigidbody')) {
                debug.warn(entity.get('components.rigidbody.type'));
            }
            // editor.call('entities:add', new Observer(data.entities[key]));
            // p.progress = (++i / total) * 0.8 + 0.1;
        }
        // p.progress = 1;
        this.loadedEntities = true;
        // 解析完成，其他面板设置
        editor.emit('entities:load');
    };
    return EntityLoad;
}());
exports.EntityLoad = EntityLoad;
},{"../../lib":53,"./entities":11}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Entity = /** @class */ (function () {
    function Entity() {
    }
    Entity.prototype.get = function (str) {
    };
    return Entity;
}());
exports.Entity = Entity;
},{}],14:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./entity"));
__export(require("./entities"));
__export(require("./entity-load"));
},{"./entities":11,"./entity":13,"./entity-load":12}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var HierarchyContextMenu = /** @class */ (function () {
    function HierarchyContextMenu() {
        this.customMenuItems = [];
        this.items = [];
        this.root = editor.call('layout.root');
        this.clickableSubmenus = /clickableContextSubmenus=true/.test(location.search);
        this.initMenu();
        this.initFunction();
    }
    HierarchyContextMenu.prototype.initMenu = function () {
        var that = this;
        var menuData = {};
        menuData['new-entity'] = {
            title: 'New Entity',
            className: 'menu-item-new-entity',
        };
        menuData['add-component'] = {
            title: 'Add Component',
            className: 'menu-item-add-component',
            // items: editor.call('menu:entities:add-component')
            items: {
                'add-new-entity': {
                    title: 'Entity',
                    className: 'menu-item-add-entity',
                    icon: '&#57632;'
                },
                'audio-sub-menu': {
                    title: 'Audio',
                    className: 'menu-item-audio-sub-menu',
                    icon: editor.call('components:logos')['sound'],
                    items: {
                        'add-new-entity2': {
                            title: '测试1',
                            className: 'menu-item-add-entity2',
                            icon: '&#57632;'
                        },
                        'audio-sub-menu2': {
                            title: '测试2',
                            className: 'menu-item-audio-sub-menu2',
                            icon: editor.call('components:logos')['sound']
                        }
                    }
                }
            }
        };
        menuData['enable'] = {
            title: 'Enable',
            className: 'menu-item-enable',
            icon: '&#57651;',
        };
        menuData['disable'] = {
            title: 'Disable',
            className: 'menu-item-disable',
            icon: '&#57650;',
        };
        menuData['copy'] = {
            title: 'Copy',
            className: 'menu-item-copy',
            icon: '&#58193;',
        };
        menuData['paste'] = {
            title: 'Paste',
            className: 'menu-item-paste',
            icon: '&#58184;',
        };
        menuData['duplicate'] = {
            title: 'Duplicate',
            className: 'menu-item-duplicate',
            icon: '&#57638;',
        };
        menuData['delete'] = {
            title: 'Delete',
            className: 'menu-item-delete',
            icon: '&#57636;',
        };
        // menu
        this.menu = ui_1.Menu.fromData(menuData, { clickableSubmenus: this.clickableSubmenus });
        this.root.append(this.menu);
        // this.menu.on('open', function () {
        //   var selection = getSelection();
        //   for (var i = 0; i < that.customMenuItems.length; i++) {
        //     if (!that.customMenuItems[i].filter)
        //       continue;
        //     that.customMenuItems[i].hidden = !that.customMenuItems[i].filter(selection);
        //   }
        // });
    };
    HierarchyContextMenu.prototype.getSelection = function () {
        var selection = editor.call('selector:items');
        if (selection.indexOf(this.entity) !== -1) {
            return selection;
        }
        else {
            return [this.entity];
        }
    };
    HierarchyContextMenu.prototype.initFunction = function () {
        var that = this;
        // TODO
        // editor.method('entities:contextmenu:add', function (data: MenuItemArgs) {
        //   var item = new MenuItem({
        //     text: data.text,
        //     icon: data.icon,
        //     value: data.value,
        //     hasChildren: !!(data.items && Object.keys(data.items).length > 0),
        //     clickableSubmenus: that.clickableSubmenus
        //   });
        //   item.on('select', function () {
        //     data.select.call(item, getSelection());
        //   });
        //   var parent = data.parent || that.menu;
        //   parent.append(item);
        //   if (data.filter)
        //     item.filter = data.filter;
        //   that.customMenuItems.push(item);
        //   return item;
        // });
        editor.method('entities:contextmenu:open', function (item, x, y, ignoreSelection) {
            // TODO
            // if (!that.menu || !editor.call('permissions:write')) return;
            if (!that.menu)
                return;
            // that.entity = item;
            // if (ignoreSelection) {
            //   items = [];
            // } else {
            //   items = getSelection();
            // }
            that.menu.open = true;
            that.menu.position(x + 1, y);
            return true;
        });
        // get the entity that was right-clicked when opening the context menu
        editor.method('entities:contextmenu:entity', function () {
            return that.entity;
        });
        // for each entity added
        editor.on('entities:add', function (item) {
            // get tree item
            // var treeItem = editor.call('entities:panel:get', item.get('resource_id'));
            // if (!treeItem) return;
            // attach contextmenu event
            item.element.addEventListener('contextmenu', function (evt) {
                // console.log("context click: " + item.element!.innerText);
                var openned = editor.call('entities:contextmenu:open', item, evt.clientX, evt.clientY);
                if (openned) {
                    evt.preventDefault();
                    evt.stopPropagation();
                }
            });
        });
    };
    return HierarchyContextMenu;
}());
exports.HierarchyContextMenu = HierarchyContextMenu;
},{"../../ui":68}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HierarchyMenu = /** @class */ (function () {
    function HierarchyMenu() {
        var componentsLogos = editor.call('components:logos');
    }
    return HierarchyMenu;
}());
exports.HierarchyMenu = HierarchyMenu;
},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var HierarchyPanel = /** @class */ (function () {
    function HierarchyPanel() {
        this.hierarchyMain = new ui_1.Panel();
        this.hierarchyMain.class.add('hierarchy-controls');
        this.hierarchyMain.parent = engine_1.VeryEngine.hierarchyPanel;
        engine_1.VeryEngine.hierarchyPanel.headerAppend(this.hierarchyMain);
        // console.log('hierarchy-controls');
        // controls delete (Button)
        var btnDelete = new ui_1.Button('&#57636;');
        btnDelete.class.add('delete');
        btnDelete.style.fontWeight = '200';
        btnDelete.on('click', function () {
            var type = editor.call('selector:type');
            if (type !== 'entity')
                return;
            editor.call('entities:delete', editor.call('selector:items'));
        });
        this.hierarchyMain.append(btnDelete);
        var tooltipDelete = ui_1.Tooltip.attach({
            target: btnDelete.element,
            text: '删除',
            align: 'top',
            root: engine_1.VeryEngine.rootPanel
        });
        tooltipDelete.class.add('innactive');
        // controls duplicate
        var btnDuplicate = new ui_1.Button('&#57638;');
        btnDuplicate.disabled = true;
        btnDuplicate.class.add('duplicate');
        btnDuplicate.on('click', function () {
            var type = editor.call('selector:type');
            var items = editor.call('selector:items');
            if (type === 'entity' && items.length)
                editor.call('entities:duplicate', items);
        });
        this.hierarchyMain.append(btnDuplicate);
        var tooltipDuplicate = ui_1.Tooltip.attach({
            target: btnDuplicate.element,
            text: '复制',
            align: 'top',
            root: engine_1.VeryEngine.rootPanel
        });
        tooltipDuplicate.class.add('innactive');
        // TODO: Menu
        // let menuEntities = ui.Menu.fromData(editor.call('menu:entities:new'));
        // root.append(menuEntities);
        // controls add
        var btnAdd = new ui_1.Button('&#57632;');
        btnAdd.class.add('add');
        btnAdd.on('click', function () {
            // menuEntities.open = true;
            // let rect = btnAdd.element.getBoundingClientRect();
            // menuEntities.position(rect.left, rect.top);
        });
        this.hierarchyMain.append(btnAdd);
        ui_1.Tooltip.attach({
            target: btnAdd.element,
            text: '添加',
            align: 'top',
            root: engine_1.VeryEngine.rootPanel
        });
        this.init();
    }
    HierarchyPanel.prototype.init = function () {
        // left control
        // hierarchy index
        var uiItemIndex = {};
        var awaitingParent = {};
        var panel = engine_1.VeryEngine.hierarchyPanel;
        var hierarchy = new ui_1.Tree();
        engine_1.VeryEngine.hierarchyTree = hierarchy;
        // TODO: hierarchy权限管理，有些人可看不可编辑；
        // hierarchy.allowRenaming = editor.call('permissions:write');
        hierarchy.draggable = hierarchy.allowRenaming;
        hierarchy.class.add('hierarchy');
        panel.append(hierarchy);
        var resizeQueued = false;
        var resizeTree = function () {
            resizeQueued = false;
            hierarchy.element.style.width = '';
            hierarchy.element.style.width = (panel.innerElement.scrollWidth - 5) + 'px';
        };
        var resizeQueue = function () {
            if (resizeQueued)
                return;
            resizeQueued = true;
            requestAnimationFrame(resizeTree);
        };
        panel.on('resize', resizeQueue);
        hierarchy.on('open', resizeQueue);
        hierarchy.on('close', resizeQueue);
        setInterval(resizeQueue, 1000);
        // return hierarchy
        editor.method('entities:hierarchy', function () {
            return hierarchy;
        });
        // list item selected
        hierarchy.on('select', function (item) {
            // open items till parent
            var parent = item.parent;
            while (parent && parent instanceof ui_1.TreeItem) {
                parent.open = true;
                parent = parent.parent;
            }
            // focus
            item.elementTitle.focus();
            // add selection
            // TODO
            console.log('hierarchy 面板选中entity');
            // TODO: 当前entity为undefined
            editor.call('selector:add', 'entity', item.entity);
        });
        // list item deselected
        hierarchy.on('deselect', function (item) {
            // TODO:
            // console.log('selector:remove entity');
            editor.call('selector:remove', item.entity);
        });
        // scrolling on drag
        var dragScroll = 0;
        var dragTimer = null;
        ;
        var dragLastEvt;
        var dragEvt = function (evt) {
            if (!hierarchy._dragging) {
                clearInterval(Number(dragTimer));
                window.removeEventListener('mousemove', dragEvt);
                return;
            }
            var rect = panel.innerElement.getBoundingClientRect();
            if ((evt.clientY - rect.top) < 32 && panel.innerElement.scrollTop > 0) {
                dragScroll = -1;
            }
            else if ((rect.bottom - evt.clientY) < 32 && (panel.innerElement.scrollHeight - (rect.height + panel.innerElement.scrollTop)) > 0) {
                dragScroll = 1;
            }
            else {
                dragScroll = 0;
            }
        };
        hierarchy.on('dragstart', function () {
            dragTimer = setInterval(function () {
                if (dragScroll === 0)
                    return;
                panel.innerElement.scrollTop += dragScroll * 8;
                hierarchy._dragOver = null;
                hierarchy._updateDragHandle();
            }, 1000 / 60);
            dragScroll = 0;
            window.addEventListener('mousemove', dragEvt, false);
            // TODO:
            console.log('get drag TreeItem entity resourceId');
            // let resourceId = hierarchy._dragItems[0].entity.get('resource_id');
            // editor.call('drop:set', 'entity', { resource_id: resourceId });
            // editor.call('drop:activate', true);
        });
        hierarchy.on('dragend', function () {
            editor.call('drop:activate', false);
            editor.call('drop:set');
        });
        // TODO
        // let target = editor.call('drop:target', {
        //   ref: panel.innerElement,
        //   type: 'entity',
        //   hole: true,
        //   passThrough: true
        // });
        // target.element.style.outline = 'none';
        var classList = ['tree-item-entity', 'entity-id-' + 'ids-to-be-done', 'c-model'];
        // if (isRoot) {
        //   classList.push('tree-item-root');
        // }
        var rootElement = new ui_1.TreeItem({
            text: 'Scene',
            classList: classList
        });
        rootElement.class.remove('c-model');
        hierarchy.element.appendChild(rootElement.element);
        hierarchy.emit('append', rootElement);
        for (var i = 0; i < 10; i++) {
            var element1 = new ui_1.TreeItem({
                text: '物体名' + (i + 1),
                classList: classList
            });
            editor.emit('entities:add', element1);
            hierarchy.emit('append', element1);
            rootElement.append(element1);
            for (var k = 0; k < 5; k++) {
                var element2 = new ui_1.TreeItem({
                    text: '子物体名' + (k + 1),
                    classList: classList
                });
                editor.emit('entities:add', element2);
                hierarchy.emit('append', element2);
                element1.append(element2);
                for (var x = 0; x < 5; x++) {
                    var element3 = new ui_1.TreeItem({
                        text: '二级子物体' + (x + 1),
                        classList: classList
                    });
                    editor.emit('entities:add', element3);
                    hierarchy.emit('append', element3);
                    element2.append(element3);
                }
            }
        }
        // element.append();
    };
    return HierarchyPanel;
}());
exports.HierarchyPanel = HierarchyPanel;
},{"../../engine":49,"../../ui":68}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var HierarchySearch = /** @class */ (function () {
    function HierarchySearch() {
        this.changing = false;
        this.itemsIndex = {};
        this.lastSearch = '';
        var self = this;
        // 结果列表
        this.results = new ui_1.List();
        this.results.element.tabIndex = 0;
        this.results.hidden = true;
        this.results.class.add('search-results');
        engine_1.VeryEngine.hierarchyPanel.append(this.results);
        this.initResult();
        // 搜索区域控制
        this.search = new ui_1.TextField('搜索');
        this.initSearchField();
        // 搜索结果clear控制
        this.searchClear = document.createElement('div');
        this.searchClear.innerHTML = '&#57650;';
        this.searchClear.classList.add('clear');
        this.search.element.appendChild(this.searchClear);
        this.searchClear.addEventListener('click', function () {
            self.search.value = '';
        }, false);
    }
    HierarchySearch.prototype.initResult = function () {
        var self = this;
        // clear on escape
        this.results.element.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 27) { // esc
                self.searchClear.click();
            }
            else if (evt.keyCode === 13) { // enter，TODO: 回车键选择
                if (!self.results.selected) {
                    // let firstElement = self.results.element!.firstElementChild;
                    // if (firstElement && (<HTMLElement>firstElement).ui && (<HTMLElement>firstElement).ui.entity)
                    //   editor.call('selector:set', 'entity', [firstElement.ui.entity]);
                }
                self.search.value = '';
            }
            else if (evt.keyCode === 40) { // down
                self.selectNext();
                evt.stopPropagation();
            }
            else if (evt.keyCode === 38) { // up
                self.selectPrev();
                evt.stopPropagation();
            }
        }, false);
        // deselecting
        this.results.unbind('deselect', this.results._onDeselect);
        this.results._onDeselect = function (item) {
            var ind = this.selected.indexOf(item);
            if (ind !== -1)
                this.selected.splice(ind, 1);
            if (this._changing)
                return;
            if (ui_1.List._ctrl && ui_1.List._ctrl()) {
            }
            else {
                this._changing = true;
                var items = editor.call('selector:type') === 'entity' && editor.call('selector:items') || [];
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
            }
            else {
                editor.call('selector:clear');
            }
        });
        // selector change
        editor.on('selector:change', function (type, items) {
            if (self.changing)
                return;
            self.changing = true;
            if (type === 'entity') {
                self.results.selected = [];
                // TODO
                for (var i = 0; i < items.length; i++) {
                    // let item = self.itemsIndex[items[i].get('resource_id')];
                    // if (!item) continue;
                    // item.selected = true;.
                }
            }
            else {
                self.results.selected = [];
            }
            self.changing = false;
        });
    };
    HierarchySearch.prototype.initSearchField = function () {
        var self = this;
        this.search.blurOnEnter = false;
        this.search.keyChange = true;
        this.search.class.add('search');
        this.search.renderChanges = false;
        engine_1.VeryEngine.hierarchyPanel.element.insertBefore(this.search.element, engine_1.VeryEngine.hierarchyPanel.innerElement);
        this.search.element.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 27) {
                searchClear.click();
            }
            else if (evt.keyCode === 13) {
                if (!self.results.selected.length) {
                    // TODO
                    // let firstElement = self.results.element!.firstElementChild;
                    // if (firstElement && (<HTMLElement>firstElement).ui && (<HTMLElement>firstElement).ui.entity)
                    //   editor.call('selector:set', 'entity', [(<HTMLElement>firstElement).ui.entity]);
                }
                self.search.value = '';
            }
            else if (evt.keyCode === 40) { // down
                editor.call('hotkey:updateModifierKeys', evt);
                self.selectNext();
                evt.stopPropagation();
                evt.preventDefault();
            }
            else if (evt.keyCode === 38) { // up
                editor.call('hotkey:updateModifierKeys', evt);
                self.selectPrev();
                evt.stopPropagation();
                evt.preventDefault();
            }
            else if (evt.keyCode === 65 && evt.ctrlKey) { // ctrl + a
                var toSelect = [];
                var items = self.results.element.querySelectorAll('.ui-list-item');
                for (var i = 0; i < items.length; i++) {
                    toSelect.push(items[i].ui);
                }
                // TODO
                console.log('全选');
                // self.results.selected = toSelect;
                evt.stopPropagation();
                evt.preventDefault();
            }
        }, false);
        this.search.on('change', function (value) {
            value = value.trim();
            if (self.lastSearch === value)
                return;
            self.lastSearch = value;
            if (value) {
                self.search.class.add('not-empty');
            }
            else {
                self.search.class.remove('not-empty');
            }
            self.performSearch();
        });
        var searchClear = document.createElement('div');
        searchClear.innerHTML = '&#57650;';
        searchClear.classList.add('clear');
        this.search.element.appendChild(searchClear);
        searchClear.addEventListener('click', function () {
            self.search.value = '';
        }, false);
    };
    HierarchySearch.prototype.selectNext = function () {
        var children = this.results.element.children;
        // could be nothing or only one item to select
        if (!children.length || !children.length)
            return;
        var toSelect = null;
        var items = this.results.element.querySelectorAll('.ui-list-item.selected');
        var multi = ui_1.List._ctrl() || ui_1.List._shift();
        if (items.length) {
            var last = items[items.length - 1];
            var next = last.nextElementSibling;
            if (next) {
                // select next
                toSelect = next.ui;
            }
            else {
                // loop through
                if (!multi)
                    toSelect = children[0].ui;
            }
        }
        else {
            // select first
            toSelect = children[0].ui;
        }
        if (toSelect) {
            if (!multi)
                this.results.selected = [];
            // TODO
            // toSelect.selected = true;
        }
    };
    HierarchySearch.prototype.selectPrev = function () {
        var children = this.results.element.children;
        // could be nothing or only one item to select
        if (!children || !children.length)
            return;
        var toSelect = null;
        var items = this.results.element.querySelectorAll('.ui-list-item.selected');
        var multi = ui_1.List._ctrl() || ui_1.List._shift();
        if (items.length) {
            var first = items[0];
            var prev = first.previousElementSibling;
            if (prev) {
                // select previous
                toSelect = prev.ui;
            }
            else {
                // loop through
                if (!multi)
                    toSelect = children[children.length - 1].ui;
            }
        }
        else {
            // select last
            toSelect = children[children.length - 1].ui;
        }
        if (toSelect) {
            if (!multi)
                this.results.selected = [];
            // TODO
            // toSelect.selected = true;
        }
    };
    ;
    HierarchySearch.prototype.performSearch = function () {
        var query = this.lastSearch;
        // clear results list
        this.results.clear();
        this.itemsIndex = {};
        if (query) {
            var result = editor.call('entities:fuzzy-search', query);
            engine_1.VeryEngine.hierarchyTree.hidden = true;
            this.results.hidden = false;
            var selected = [];
            if (editor.call('selector:type') === 'entity')
                selected = editor.call('selector:items');
            // TODO
            for (var i = 0; i < result.length; i++) {
                // let item = this.addItem(result[i]);
                // this.itemsIndex[result[i].get('resource_id')] = item;
                // if (selected.indexOf(result[i]) !== -1)
                //   item.selected = true;
                // this.results.append(item);
            }
        }
        else {
            this.results.hidden = true;
            engine_1.VeryEngine.hierarchyTree.hidden = false;
        }
    };
    ;
    return HierarchySearch;
}());
exports.HierarchySearch = HierarchySearch;
},{"../../engine":49,"../../ui":68}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var hierarchy_search_1 = require("./hierarchy-search");
var hierarchy_menu_1 = require("./hierarchy-menu");
var hierarchy_context_menu_1 = require("./hierarchy-context-menu");
var hierarchy_panel_1 = require("./hierarchy-panel");
var Hierarchy = /** @class */ (function () {
    // public hierarchyMain: Panel;
    function Hierarchy() {
        // this.hierarchyMain = new Panel();
        // this.hierarchyMain.class!.add('hierarchy-controls');
        // this.hierarchyMain.parent = VeryEngine.hierarchyPanel;
        // VeryEngine.hierarchyPanel.headerAppend(this.hierarchyMain);
        // // console.log('hierarchy-controls');
        // // controls delete (Button)
        // let btnDelete: Button = new Button('&#57636;');
        // btnDelete.class!.add('delete');
        // btnDelete.style!.fontWeight = '200';
        // btnDelete.on('click', function () {
        //   let type = editor.call('selector:type');
        //   if (type !== 'entity')
        //     return;
        //   editor.call('entities:delete', editor.call('selector:items'));
        // });
        // this.hierarchyMain.append(btnDelete);
        // let tooltipDelete = Tooltip.attach({
        //   target: btnDelete.element!,
        //   text: '删除',
        //   align: 'top',
        //   root: VeryEngine.rootPanel
        // });
        // tooltipDelete.class!.add('innactive');
        // // controls duplicate
        // let btnDuplicate: Button = new Button('&#57638;');
        // btnDuplicate.disabled = true;
        // btnDuplicate.class!.add('duplicate');
        // btnDuplicate.on('click', function () {
        //   let type = editor.call('selector:type');
        //   let items = editor.call('selector:items');
        //   if (type === 'entity' && items.length)
        //     editor.call('entities:duplicate', items);
        // });
        // this.hierarchyMain.append(btnDuplicate);
        // let tooltipDuplicate = Tooltip.attach({
        //   target: btnDuplicate.element!,
        //   text: '复制',
        //   align: 'top',
        //   root: VeryEngine.rootPanel
        // });
        // tooltipDuplicate.class!.add('innactive');
        // // TODO: Menu
        // // let menuEntities = ui.Menu.fromData(editor.call('menu:entities:new'));
        // // root.append(menuEntities);
        // // controls add
        // let btnAdd: Button = new Button('&#57632;');
        // btnAdd.class!.add('add');
        // btnAdd.on('click', function () {
        //   // menuEntities.open = true;
        //   // let rect = btnAdd.element.getBoundingClientRect();
        //   // menuEntities.position(rect.left, rect.top);
        // });
        // this.hierarchyMain.append(btnAdd);
        // Tooltip.attach({
        //   target: btnAdd.element!,
        //   text: '添加',
        //   align: 'top',
        //   root: VeryEngine.rootPanel
        // });
        // hierarchy panel
        var hierarchyMainPanel = new hierarchy_panel_1.HierarchyPanel();
        var contextMenu = new hierarchy_context_menu_1.HierarchyContextMenu();
        // 搜索区域：Search Field
        var searchField = new hierarchy_search_1.HierarchySearch();
        // 全局菜单
        var contextMenuLogo = new hierarchy_menu_1.HierarchyMenu();
        // this.init();
    }
    Hierarchy.prototype.init = function () {
        // left control
        // hierarchy index
        var uiItemIndex = {};
        var awaitingParent = {};
        var panel = engine_1.VeryEngine.hierarchyPanel;
        var hierarchy = new ui_1.Tree();
        engine_1.VeryEngine.hierarchyTree = hierarchy;
        // TODO: hierarchy权限管理，有些人可看不可编辑；
        // hierarchy.allowRenaming = editor.call('permissions:write');
        hierarchy.draggable = hierarchy.allowRenaming;
        hierarchy.class.add('hierarchy');
        panel.append(hierarchy);
        var resizeQueued = false;
        var resizeTree = function () {
            resizeQueued = false;
            hierarchy.element.style.width = '';
            hierarchy.element.style.width = (panel.innerElement.scrollWidth - 5) + 'px';
        };
        var resizeQueue = function () {
            if (resizeQueued)
                return;
            resizeQueued = true;
            requestAnimationFrame(resizeTree);
        };
        panel.on('resize', resizeQueue);
        hierarchy.on('open', resizeQueue);
        hierarchy.on('close', resizeQueue);
        setInterval(resizeQueue, 1000);
        // return hierarchy
        editor.method('entities:hierarchy', function () {
            return hierarchy;
        });
        // list item selected
        hierarchy.on('select', function (item) {
            // open items till parent
            var parent = item.parent;
            while (parent && parent instanceof ui_1.TreeItem) {
                parent.open = true;
                parent = parent.parent;
            }
            // focus
            item.elementTitle.focus();
            // add selection
            // TODO
            console.log('selector:add entity');
            // editor.call('selector:add', 'entity', item.entity);
        });
        // list item deselected
        hierarchy.on('deselect', function (item) {
            // TODO:
            console.log('selector:remove entity');
            // editor.call('selector:remove', item.entity);
        });
        // scrolling on drag
        var dragScroll = 0;
        var dragTimer = null;
        ;
        var dragLastEvt;
        var dragEvt = function (evt) {
            if (!hierarchy._dragging) {
                clearInterval(Number(dragTimer));
                window.removeEventListener('mousemove', dragEvt);
                return;
            }
            var rect = panel.innerElement.getBoundingClientRect();
            if ((evt.clientY - rect.top) < 32 && panel.innerElement.scrollTop > 0) {
                dragScroll = -1;
            }
            else if ((rect.bottom - evt.clientY) < 32 && (panel.innerElement.scrollHeight - (rect.height + panel.innerElement.scrollTop)) > 0) {
                dragScroll = 1;
            }
            else {
                dragScroll = 0;
            }
        };
        hierarchy.on('dragstart', function () {
            dragTimer = setInterval(function () {
                if (dragScroll === 0)
                    return;
                panel.innerElement.scrollTop += dragScroll * 8;
                hierarchy._dragOver = null;
                hierarchy._updateDragHandle();
            }, 1000 / 60);
            dragScroll = 0;
            window.addEventListener('mousemove', dragEvt, false);
            // TODO:
            console.log('get drag TreeItem entity resourceId');
            // let resourceId = hierarchy._dragItems[0].entity.get('resource_id');
            // editor.call('drop:set', 'entity', { resource_id: resourceId });
            // editor.call('drop:activate', true);
        });
        hierarchy.on('dragend', function () {
            editor.call('drop:activate', false);
            editor.call('drop:set');
        });
        // TODO
        // let target = editor.call('drop:target', {
        //   ref: panel.innerElement,
        //   type: 'entity',
        //   hole: true,
        //   passThrough: true
        // });
        // target.element.style.outline = 'none';
        var classList = ['tree-item-entity', 'entity-id-' + 'ids-to-be-done', 'c-model'];
        // if (isRoot) {
        //   classList.push('tree-item-root');
        // }
        var rootElement = new ui_1.TreeItem({
            text: 'Scene',
            classList: classList
        });
        rootElement.class.remove('c-model');
        hierarchy.element.appendChild(rootElement.element);
        hierarchy.emit('append', rootElement);
        for (var i = 0; i < 10; i++) {
            var element1 = new ui_1.TreeItem({
                text: '物体名' + (i + 1),
                classList: classList
            });
            editor.emit('entities:add', element1);
            hierarchy.emit('append', element1);
            rootElement.append(element1);
            for (var k = 0; k < 5; k++) {
                var element2 = new ui_1.TreeItem({
                    text: '子物体名' + (k + 1),
                    classList: classList
                });
                editor.emit('entities:add', element2);
                hierarchy.emit('append', element2);
                element1.append(element2);
                for (var x = 0; x < 5; x++) {
                    var element3 = new ui_1.TreeItem({
                        text: '二级子物体' + (x + 1),
                        classList: classList
                    });
                    editor.emit('entities:add', element3);
                    hierarchy.emit('append', element3);
                    element2.append(element3);
                }
            }
        }
        // element.append();
    };
    return Hierarchy;
}());
exports.Hierarchy = Hierarchy;
},{"../../engine":49,"../../ui":68,"./hierarchy-context-menu":15,"./hierarchy-menu":16,"./hierarchy-panel":17,"./hierarchy-search":18}],20:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./hierarchy"));
__export(require("./hierarchy-search"));
__export(require("./hierarchy-menu"));
},{"./hierarchy":19,"./hierarchy-menu":16,"./hierarchy-search":18}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Hotkeys = /** @class */ (function () {
    function Hotkeys() {
        this.hotkeys = {};
        this.keyIndex = {};
        // private keysDown = {};
        this.isMac = navigator.userAgent.indexOf('Mac OS X') !== -1;
        this.keyByKeyCode = {};
        this.keyByCode = {};
        this.keyMap = {};
        this.keyMapInit();
        var self = this;
        editor.method('hotkey:register', function (name, args) {
            self.hotkeys[name] = args;
            // keys list
            var keys = [args.ctrl ? '1' : '0', args.alt ? '1' : '0', args.shift ? '1' : '0'];
            // map keyCode to key
            if (typeof (args.key) === 'number')
                args.key = self.keyByKeyCode[args.key];
            // unknown key
            if (!args.key) {
                console.error('未知的hotkeys: ' + name + ', ' + args.key);
                return;
            }
            keys.push(args.key);
            args.index = keys.join('+');
            if (!self.keyIndex[args.index])
                self.keyIndex[args.index] = [];
            self.keyIndex[args.index].push(name);
        });
        editor.method('hotkey:unregister', function (name) {
            var hotkey = self.hotkeys[name];
            if (!hotkey)
                return;
            if (self.keyIndex[hotkey.index].length === 1) {
                delete self.keyIndex[hotkey.index];
            }
            else {
                self.keyIndex[hotkey.index].splice(self.keyIndex[hotkey.index].indexOf(name), 1);
            }
            delete self.hotkeys[name];
        });
        editor.method('hotkey:shift', function () {
            return Hotkeys.shift;
        });
        editor.method('hotkey:ctrl', function () {
            return Hotkeys.ctrl;
        });
        editor.method('hotkey:alt', function () {
            return Hotkeys.alt;
        });
        var updateModifierKeys = function (evt) {
            if (evt instanceof KeyboardEvent || evt instanceof MouseEvent) {
                // console.warn(evt);
                Hotkeys.shift = evt.shiftKey;
                Hotkeys.ctrl = evt.ctrlKey || evt.metaKey;
                Hotkeys.alt = evt.altKey;
            }
        };
        editor.method('hotkey:updateModifierKeys', updateModifierKeys);
        window.addEventListener('keydown', function (evt) {
            if (evt.target) {
                var tag = evt.target.tagName;
                if (/(input)|(textarea)/i.test(tag) && !evt.target.classList.contains('hotkeys'))
                    return;
            }
            updateModifierKeys(evt);
            var key = evt.code ? self.keyByCode[evt.code] : self.keyByKeyCode[evt.keyCode];
            if (evt.keyCode === 92 || evt.keyCode === 93)
                return;
            var index = [Hotkeys.ctrl ? '1' : '0', Hotkeys.alt ? '1' : '0', Hotkeys.shift ? '1' : '0', key].join('+');
            if (self.keyIndex[index]) {
                var skipPreventDefault = false;
                for (var i = 0; i < self.keyIndex[index].length; i++) {
                    if (!skipPreventDefault && self.hotkeys[self.keyIndex[index][i]].skipPreventDefault)
                        skipPreventDefault = true;
                    self.hotkeys[self.keyIndex[index][i]].callback(evt);
                }
                if (!skipPreventDefault)
                    evt.preventDefault();
            }
        }, false);
        // Returns Ctrl or Cmd for Mac
        editor.method('hotkey:ctrl:string', function () {
            return self.isMac ? 'Cmd' : 'Ctrl';
        });
        window.addEventListener('keyup', updateModifierKeys, false);
        window.addEventListener('mousedown', updateModifierKeys, false);
        window.addEventListener('mouseup', updateModifierKeys, false);
        window.addEventListener('click', updateModifierKeys, false);
    }
    Hotkeys.prototype.keyMapInit = function () {
        this.keyMap = {
            'backspace': {
                keyCode: 8,
                code: 'Backspace'
            },
            'tab': {
                keyCode: 9,
                code: 'Tab',
            },
            'enter': {
                keyCode: 13,
                code: ['enter', 'NumpadEnter', 'Enter'],
            },
            'shift': {
                keyCode: 16,
                code: ['ShiftLeft', 'ShiftRight'],
            },
            'ctrl': {
                keyCode: 17,
                code: ['CtrlLeft', 'CtrlRight'],
            },
            'alt': {
                keyCode: 18,
                code: ['AltLeft', 'AltRight'],
            },
            'pause/break': {
                keyCode: 19,
                code: 'Pause',
            },
            'caps lock': {
                keyCode: 20,
                code: 'CapsLock',
            },
            'esc': {
                keyCode: 27,
                code: 'Escape',
            },
            'space': {
                keyCode: 32,
                code: 'Space',
            },
            'page up': {
                keyCode: 33,
                code: 'PageUp'
            },
            'page down': {
                keyCode: 34,
                code: 'PageDown'
            },
            'end': {
                keyCode: 35,
                code: 'End'
            },
            'home': {
                keyCode: 36,
                code: 'Home'
            },
            'left arrow': {
                keyCode: 37,
                code: 'ArrowLeft'
            },
            'up arrow': {
                keyCode: 38,
                code: 'ArrowUp'
            },
            'right arrow': {
                keyCode: 39,
                code: 'ArrowRight'
            },
            'down arrow': {
                keyCode: 40,
                code: 'ArrowDown'
            },
            'insert': {
                keyCode: 45,
                code: 'Insert'
            },
            'delete': {
                keyCode: 46,
                code: 'Delete'
            },
            '0': {
                keyCode: 48,
                code: 'Digit0'
            },
            '1': {
                keyCode: 49,
                code: 'Digit1'
            },
            '2': {
                keyCode: 50,
                code: 'Digit2'
            },
            '3': {
                keyCode: 51,
                code: 'Digit3'
            },
            '4': {
                keyCode: 52,
                code: 'Digit4'
            },
            '5': {
                keyCode: 53,
                code: 'Digit5'
            },
            '6': {
                keyCode: 54,
                code: 'Digit6'
            },
            '7': {
                keyCode: 55,
                code: 'Digit7'
            },
            '8': {
                keyCode: 56,
                code: 'Digit8'
            },
            '9': {
                keyCode: 57,
                code: 'Digit9'
            },
            'a': {
                keyCode: 65,
                code: 'KeyA'
            },
            'b': {
                keyCode: 66,
                code: 'KeyB'
            },
            'c': {
                keyCode: 67,
                code: 'KeyC'
            },
            'd': {
                keyCode: 68,
                code: 'KeyD'
            },
            'e': {
                keyCode: 69,
                code: 'KeyE'
            },
            'f': {
                keyCode: 70,
                code: 'KeyF'
            },
            'g': {
                keyCode: 71,
                code: 'KeyG'
            },
            'h': {
                keyCode: 72,
                code: 'KeyH'
            },
            'i': {
                keyCode: 73,
                code: 'KeyI'
            },
            'j': {
                keyCode: 74,
                code: 'KeyJ'
            },
            'k': {
                keyCode: 75,
                code: 'KeyK'
            },
            'l': {
                keyCode: 76,
                code: 'KeyL'
            },
            'm': {
                keyCode: 77,
                code: 'KeyM'
            },
            'n': {
                keyCode: 78,
                code: 'KeyN'
            },
            'o': {
                keyCode: 79,
                code: 'KeyO'
            },
            'p': {
                keyCode: 80,
                code: 'KeyP'
            },
            'q': {
                keyCode: 81,
                code: 'KeyQ'
            },
            'r': {
                keyCode: 82,
                code: 'KeyR'
            },
            's': {
                keyCode: 83,
                code: 'KeyS'
            },
            't': {
                keyCode: 84,
                code: 'KeyT'
            },
            'u': {
                keyCode: 85,
                code: 'KeyU'
            },
            'v': {
                keyCode: 86,
                code: 'KeyV'
            },
            'w': {
                keyCode: 87,
                code: 'KeyW'
            },
            'x': {
                keyCode: 88,
                code: 'KeyX'
            },
            'y': {
                keyCode: 89,
                code: 'KeyY'
            },
            'z': {
                keyCode: 90,
                code: 'KeyZ'
            },
            'left window key': {
                keyCode: 91,
                code: 'MetaLeft'
            },
            'right window key': {
                keyCode: 92,
                code: 'MetaRight'
            },
            'select key': {
                keyCode: 93,
                code: 'ContextMenu'
            },
            'numpad 0': {
                keyCode: 96,
                code: 'Numpad0'
            },
            'numpad 1': {
                keyCode: 97,
                code: 'Numpad1'
            },
            'numpad 2': {
                keyCode: 98,
                code: 'Numpad2'
            },
            'numpad 3': {
                keyCode: 99,
                code: 'Numpad3'
            },
            'numpad 4': {
                keyCode: 100,
                code: 'Numpad4'
            },
            'numpad 5': {
                keyCode: 101,
                code: 'Numpad5'
            },
            'numpad 6': {
                keyCode: 102,
                code: 'Numpad6'
            },
            'numpad 7': {
                keyCode: 103,
                code: 'Numpad7'
            },
            'numpad 8': {
                keyCode: 104,
                code: 'Numpad8'
            },
            'numpad 9': {
                keyCode: 105,
                code: 'Numpad9'
            },
            'multiply': {
                keyCode: 106,
                code: 'NumpadMultiply'
            },
            'add': {
                keyCode: 107,
                code: 'NumpadAdd'
            },
            'subtract': {
                keyCode: 109,
                code: 'NumpadSubtract'
            },
            'decimal point': {
                keyCode: 110,
                code: 'NumpadDecimal'
            },
            'divide': {
                keyCode: 111,
                code: 'NumpadDivide'
            },
            'f1': {
                keyCode: 112,
                code: 'F1'
            },
            'f2': {
                keyCode: 113,
                code: 'F2'
            },
            'f3': {
                keyCode: 114,
                code: 'F3'
            },
            'f4': {
                keyCode: 115,
                code: 'F4'
            },
            'f5': {
                keyCode: 116,
                code: 'F5'
            },
            'f6': {
                keyCode: 117,
                code: 'F6'
            },
            'f7': {
                keyCode: 118,
                code: 'F7'
            },
            'f8': {
                keyCode: 119,
                code: 'F8'
            },
            'f9': {
                keyCode: 120,
                code: 'F9'
            },
            'f10': {
                keyCode: 121,
                code: 'F10'
            },
            'f11': {
                keyCode: 122,
                code: 'F11'
            },
            'f12': {
                keyCode: 123,
                code: 'F12'
            },
            'num lock': {
                keyCode: 144,
                code: 'NumLock'
            },
            'scroll lock': {
                keyCode: 145,
                code: 'ScrollLock'
            },
            'semi-colon': {
                keyCode: 186,
                code: 'Semicolon'
            },
            'equal sign': {
                keyCode: 187,
                code: 'Equal'
            },
            'comma': {
                keyCode: 188,
                code: 'Comma'
            },
            'dash': {
                keyCode: 189,
                code: 'Minus'
            },
            'period': {
                keyCode: 190,
                code: 'Period'
            },
            'forward slash': {
                keyCode: 191,
                code: ''
            },
            'grave accent': {
                keyCode: 192,
                code: 'Backquote'
            },
            'open bracket': {
                keyCode: 219,
                code: 'BracketLeft'
            },
            'back slash': {
                keyCode: 220,
                code: ['Backslash', 'IntlBackslash']
            },
            'close bracket': {
                keyCode: 221,
                code: 'BracketRight'
            },
            'single quote': {
                keyCode: 222,
                code: 'Quote'
            },
        };
        for (var key in this.keyMap) {
            this.keyByKeyCode[this.keyMap[key].keyCode] = key;
            if (this.keyMap[key].code instanceof Array) {
                for (var i = 0; i < this.keyMap[key].code.length; i++) {
                    this.keyByCode[this.keyMap[key].code[i]] = key;
                }
            }
            else {
                this.keyByCode[(this.keyMap[key].code)] = key;
            }
        }
    };
    Hotkeys.ctrl = false;
    Hotkeys.shift = false;
    Hotkeys.alt = false;
    return Hotkeys;
}());
exports.Hotkeys = Hotkeys;
},{}],22:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./initialize-before"));
__export(require("./editor"));
__export(require("./layout"));
__export(require("./viewport"));
__export(require("./hierarchy"));
__export(require("./hotkeys"));
__export(require("./assets"));
__export(require("./toolbar"));
__export(require("./utility"));
__export(require("./entity"));
__export(require("./middleware"));
__export(require("./initialize-after"));
},{"./assets":4,"./editor":10,"./entity":14,"./hierarchy":20,"./hotkeys":21,"./initialize-after":23,"./initialize-before":24,"./layout":25,"./middleware":28,"./toolbar":34,"./utility":41,"./viewport":42}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var attributes_1 = require("./attributes");
var InitializeAfter = /** @class */ (function () {
    function InitializeAfter() {
        // attributes
        var attributesReference = new attributes_1.AttributesReference();
        var attributesPanel = new attributes_1.AttributesPanel();
        var attributesEntity = new attributes_1.AttributesEntity();
    }
    return InitializeAfter;
}());
exports.InitializeAfter = InitializeAfter;
},{"./attributes":9}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hotkeys_1 = require("./hotkeys");
var utility_1 = require("./utility");
var selector_1 = require("./selector");
var realtime_1 = require("./web/realtime");
var InitializeBefore = /** @class */ (function () {
    function InitializeBefore() {
        this.init();
    }
    InitializeBefore.prototype.init = function () {
        // axois默认请求头设置，全局通过json方式传送和接收数据
        axios.defaults.headers.post["Content-Type"] = "application/json";
        // 全局快捷键注册
        var hotkeys = new hotkeys_1.Hotkeys();
        // components-logos
        var logos = new utility_1.ComponentsLogos();
        // 屏蔽浏览器默认右键菜单
        var systemContextMenu = new utility_1.ContextMenu();
        // selector 
        var selector = new selector_1.Selector();
        // Websocket
        var io = new realtime_1.Realtime();
    };
    return InitializeBefore;
}());
exports.InitializeBefore = InitializeBefore;
},{"./hotkeys":21,"./selector":31,"./utility":41,"./web/realtime":47}],25:[function(require,module,exports){
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
        var hierarchyPanel = new ui_1.Panel('树形结构窗口');
        hierarchyPanel.enabled = true;
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
        attributesPanel.enabled = true;
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
},{"../engine":49,"../ui":68}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transform_1 = require("./transform");
var gameobject_1 = require("./gameobject");
var Component = /** @class */ (function () {
    function Component() {
    }
    Object.defineProperty(Component.prototype, "transform", {
        get: function () {
            return new transform_1.Transform();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "gameObject", {
        get: function () {
            return new gameobject_1.GameObject();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "tag", {
        get: function () {
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "camera", {
        get: function () {
            return new Component();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "light", {
        get: function () {
            return new Component();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "renderer", {
        get: function () {
            return new Component();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "collider", {
        get: function () {
            return new Component();
        },
        enumerable: true,
        configurable: true
    });
    return Component;
}());
exports.Component = Component;
},{"./gameobject":27,"./transform":30}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transform_1 = require("./transform");
var engine_1 = require("../../engine");
var GameObject = /** @class */ (function () {
    function GameObject(name, mesh, node) {
        if (mesh === void 0) { mesh = null; }
        if (node === void 0) { node = null; }
        this._guid = '';
        this._tag = '';
        if (mesh) {
            this._transform = new transform_1.Transform('', mesh);
        }
        else {
            if (node) {
                this._transform = new transform_1.Transform('', null, node);
            }
            else if (name) {
                this._transform = new transform_1.Transform(name);
            }
            else {
                this._transform = new transform_1.Transform();
            }
        }
    }
    Object.defineProperty(GameObject.prototype, "gameObject", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "transform", {
        get: function () {
            return this._transform;
        },
        set: function (val) {
            this._transform = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "name", {
        get: function () {
            return this.transform.name;
        },
        set: function (val) {
            this.transform.name = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "guid", {
        get: function () {
            return this._guid;
        },
        set: function (val) {
            this._guid = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "isEmpty", {
        get: function () {
            return this._transform.isEmpty;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "mesh", {
        get: function () {
            return this._transform.mesh;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "tag", {
        get: function () {
            return this._tag;
        },
        set: function (val) {
            this._tag = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "isActive", {
        get: function () {
            return this.isEmpty ? false : this.transform.transformNode.isEnabled();
        },
        enumerable: true,
        configurable: true
    });
    // TODO
    GameObject.Find = function (name, scene) {
        if (!scene) {
            scene = engine_1.BabylonEngine.Scene;
        }
        var node = scene.getNodeByName(name);
        if (!node) {
            return null;
        }
        else {
            if (node instanceof BABYLON.AbstractMesh) {
                return new GameObject('', node);
            }
            else if (node instanceof BABYLON.TransformNode) {
                return new GameObject('', null, node);
            }
            else {
                console.error('GameObject.Find函数查找到不支持的类型：' + node.getClassName());
                return null;
            }
        }
    };
    GameObject.FindGameObjectWithTag = function (tag) {
    };
    GameObject.FindGameObjectsWithTag = function (tag) {
    };
    // TODO
    GameObject.Destroy = function (obj) {
        if (obj) {
            obj.transform.destroy();
        }
    };
    GameObject.CreateInstance = function (game_object) {
        if (!game_object) {
            return null;
        }
        if (game_object.isEmpty) {
            return new GameObject();
        }
        else {
            if (game_object.transform.mesh) {
                var tempMesh = void 0;
                if (game_object.transform.mesh instanceof BABYLON.Mesh) {
                    tempMesh = game_object.transform.mesh.createInstance(game_object.name + '_instance');
                }
                else {
                    tempMesh = game_object.transform.mesh.sourceMesh.createInstance(game_object.name + '_instance');
                }
                return new GameObject('', tempMesh);
            }
            else {
                var newNode = game_object.transform.transformNode.clone(game_object.name + '_intance');
                return new GameObject('', null, newNode);
            }
        }
    };
    GameObject.prototype.setActive = function (value) {
    };
    GameObject.prototype.setActiveRecursively = function (value) {
    };
    GameObject.AddComponent = function () {
    };
    return GameObject;
}());
exports.GameObject = GameObject;
},{"../../engine":49,"./transform":30}],28:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./transform"));
__export(require("./gameobject"));
__export(require("./component"));
__export(require("./middle-container"));
},{"./component":26,"./gameobject":27,"./middle-container":29,"./transform":30}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MiddleContainer = /** @class */ (function () {
    function MiddleContainer() {
        this.gameObjects = [];
    }
    MiddleContainer.prototype.addGameObject = function (object) {
        this.gameObjects.push();
    };
    return MiddleContainer;
}());
exports.MiddleContainer = MiddleContainer;
},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Transform = /** @class */ (function () {
    /**
     * BabylonJS Mesh和TransformNode包装类，仿照UnityEngine数据结构；
     * @param name 物体名，默认为“空物体”；
     * @param mesh BabylonJS Mesh;
     * @param node BabylonJS TransformNode;
     */
    function Transform(name, mesh, node) {
        if (name === void 0) { name = '空物体'; }
        if (mesh === void 0) { mesh = null; }
        if (node === void 0) { node = null; }
        // public get gameObject(): GameObject {
        //   return this._gameObject;
        // }
        // private _gameObject: GameObject;
        this._transformNode = null;
        this._mesh = null;
        this._name = '';
        this._tempVec = BABYLON.Vector3.Zero();
        this._parent = null;
        this.forward = BABYLON.Vector3.Forward();
        this.localScale = new BABYLON.Vector3(1, 1, 1);
        if (mesh) {
            this._mesh = mesh;
            this._transformNode = mesh;
            this._name = mesh.name;
        }
        else {
            if (node) {
                this._mesh = null;
                this._transformNode = node;
                this._name = node.name;
            }
            else {
                // if (!name) name = '空物体';
                this._mesh = null;
                this._transformNode = new BABYLON.TransformNode(name);
                this._name = name;
            }
        }
        // 设置父物体
        if (this._transformNode) {
            var tempParent = this._transformNode.parent;
            if (tempParent) {
                if (tempParent instanceof BABYLON.AbstractMesh) {
                    this._parent = new Transform(tempParent.name, tempParent);
                }
                else {
                    this._parent = new Transform(tempParent.name, null, tempParent);
                }
            }
        }
        else {
            this._parent = null;
        }
    }
    Object.defineProperty(Transform.prototype, "transformNode", {
        get: function () {
            if (this._mesh) {
                return this._mesh;
            }
            else if (this._transformNode) {
                return this._transformNode;
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "mesh", {
        get: function () {
            return this._mesh;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "isMesh", {
        get: function () {
            if (this._mesh) {
                return true;
            }
            else {
                return false;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "isEmpty", {
        get: function () {
            if (this._transformNode || this._mesh) {
                return false;
            }
            else {
                return true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "name", {
        // public get parent(): Nullable<BABYLON.TransformNode>
        get: function () {
            return this._name;
        },
        set: function (val) {
            if (this._transformNode) {
                this._transformNode.name = val;
            }
            if (this._mesh) {
                this._mesh.name = val;
            }
            this._name = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (val) {
            if (!this.isEmpty) {
                if (val && !val.isEmpty) {
                    this._transformNode.setParent(val.transformNode);
                    this._parent = val;
                }
                else {
                    this._transformNode.setParent(null);
                    this._parent = null;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "localPosition", {
        /**
         * 获取相对坐标
         */
        get: function () {
            if (this.isEmpty) {
                return BABYLON.Vector3.Zero();
            }
            else {
                this._tempVec.copyFrom(this.transformNode.position);
                return this._tempVec;
            }
        },
        /**
         * 设置相对坐标
         */
        set: function (val) {
            if (!this.isEmpty) {
                this.transformNode.position = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "position", {
        /**
         * 获取绝对坐标
         */
        get: function () {
            if (this.isEmpty) {
                return BABYLON.Vector3.Zero();
            }
            else {
                this._tempVec.copyFrom(this.transformNode.getAbsolutePosition());
                return this._tempVec;
            }
        },
        /**
         * 设置绝对坐标
         */
        set: function (val) {
            if (!this.isEmpty) {
                this.transformNode.setAbsolutePosition(val);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "localEulerAngles", {
        /**
         * 获取相对欧拉角度
         */
        get: function () {
            if (this.isEmpty) {
                return BABYLON.Vector3.Zero();
            }
            else {
                var para = 180 / Math.PI;
                return this.transformNode.rotation.multiplyByFloats(para, para, para);
            }
        },
        /**
         * 设置相对欧拉角度
         */
        set: function (val) {
            if (!this.isEmpty) {
                var para = Math.PI / 180;
                this.transformNode.rotation = val.multiplyByFloats(para, para, para);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "localRotation", {
        /**
         * 获取相对角度（弧度）
         */
        get: function () {
            if (this.isEmpty) {
                return BABYLON.Vector3.Zero();
            }
            else {
                this._tempVec.copyFrom(this.transformNode.rotation);
                return this._tempVec;
            }
        },
        /**
         * 设置相对角度（弧度）
         */
        set: function (val) {
            if (!this.isEmpty) {
                this.transformNode.rotation = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "eulerAngles", {
        /**
         * 获取绝对欧拉角度
         */
        get: function () {
            if (this.isEmpty) {
                return BABYLON.Vector3.Zero();
            }
            else {
                var parent_1 = this.transformNode.parent;
                var para = 180 / Math.PI;
                this.transformNode.setParent(null);
                var result = this.transformNode.rotation.multiplyByFloats(para, para, para);
                this.transformNode.setParent(parent_1);
                return result;
            }
        },
        /**
         * 设置绝对欧拉角度
         */
        set: function (val) {
            if (!this.isEmpty) {
                var parent_2 = this.transformNode.parent;
                var para = Math.PI / 180;
                this.transformNode.setParent(null);
                this.transformNode.rotation = val.multiplyByFloats(para, para, para);
                this.transformNode.setParent(parent_2);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "rotation", {
        /**
         * 获取绝对角度（弧度）
         */
        get: function () {
            if (this.isEmpty) {
                return BABYLON.Vector3.Zero();
            }
            else {
                var parent_3 = this.transformNode.parent;
                this.transformNode.setParent(null);
                this._tempVec.copyFrom(this.transformNode.rotation);
                this.transformNode.setParent(parent_3);
                return this._tempVec;
            }
        },
        /**
         * 设置绝对角度（弧度）
         */
        set: function (val) {
            if (!this.isEmpty) {
                var parent_4 = this.transformNode.parent;
                this.transformNode.setParent(null);
                this.transformNode.rotation = val;
                this.transformNode.setParent(parent_4);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "childCount", {
        // TO be contioued
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "hierarchyCount", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 沿世界或局部坐标系平移；
     * @param translation 平移方向向量；
     * @param relativeTo 平移参考系，LOCAL为局部坐标，WORLD为世界坐标；
     */
    Transform.prototype.translate = function (translation, relativeTo) {
        if (this.transformNode) {
            this.transformNode.translate(translation, 1, relativeTo);
        }
    };
    /**
     * 沿着某个参考物体的局部方向向量平移，参考物体为null时，则沿世界坐标移动；
     * @param translation 参考物体的局部方向向量；
     * @param trans 平移参考物体；
     */
    Transform.prototype.translateRelativeTo = function (translation, trans) {
        if (this.transformNode) {
            var direction = translation.clone();
            if (trans && trans.transformNode) {
                direction = this.transformDirection(direction);
            }
            this.transformNode.translate(direction, 1, BABYLON.Space.WORLD);
        }
    };
    /**
     * 沿某个轴自转，可选择相对世界坐标或自身坐标；
     * @param eulerAngles 自转运动向量；
     * @param relativeTo 自转参考系；
     */
    Transform.prototype.rotate = function (eulerAngles, relativeTo) {
        if (this.transformNode) {
            var axis = BABYLON.Vector3.Zero().copyFrom(eulerAngles.normalize());
            var angle = eulerAngles.length();
            this.transformNode.rotate(axis, angle, relativeTo);
        }
    };
    /**
     * 沿世界坐标某个轴公转；
     * @param point 旋转点；
     * @param axis 旋转轴；
     * @param speed 旋转速度；
     */
    Transform.prototype.rotateAround = function (point, axis, speed) {
        if (this.transformNode) {
            this.transformNode.rotateAround(point, axis, speed);
        }
    };
    /**
     * 局部坐标位置转世界坐标位置；
     * @param local_position 局部坐标位置；
     * 返回新Vector3向量；
     */
    Transform.prototype.transformPosition = function (local_position) {
        if (this.transformNode) {
            var matrix = this.transformNode.computeWorldMatrix();
            return BABYLON.Vector3.TransformCoordinates(local_position, matrix);
        }
        else {
            return local_position;
        }
    };
    /**
     * 局部方向向量转世界方向向量，转换后保持向量长度相等；
     * @param local_direction 局部方向向量；
     * 返回新Vector3向量；
     */
    Transform.prototype.transformDirection = function (local_direction) {
        if (this.transformNode) {
            var matrix = this.transformNode.computeWorldMatrix();
            return BABYLON.Vector3.TransformCoordinates(local_direction, matrix).subtract(this.transformNode.getAbsolutePosition());
        }
        else {
            return local_direction;
        }
    };
    /**
     * 世界坐标位置转局部坐标位置；
     * @param global_position 世界坐标位置；
     * 返回新Vector3向量；
     */
    Transform.prototype.inverseTransformPosition = function (global_position) {
        if (this.transformNode) {
            var matrix = BABYLON.Matrix.Invert(this.transformNode.computeWorldMatrix());
            return BABYLON.Vector3.TransformCoordinates(global_position, matrix);
        }
        else {
            return global_position;
        }
    };
    /**
     * 世界方向向量转局部方向向量，转换后保持向量长度相等；
     * @param global_direction 世界方向向量；
     * 返回新Vector3向量；
     */
    Transform.prototype.inverseTransformDirection = function (global_direction) {
        if (this.transformNode) {
            var matrix = BABYLON.Matrix.Invert(this.transformNode.computeWorldMatrix());
            var pointA = BABYLON.Vector3.TransformCoordinates(global_direction, matrix);
            var pointOrigin = BABYLON.Vector3.TransformCoordinates(BABYLON.Vector3.Zero(), matrix);
            return pointA.subtract(pointOrigin);
        }
        else {
            return global_direction;
        }
    };
    Transform.prototype.destroy = function () {
        if (this.mesh)
            this.mesh.dispose();
        if (this.transformNode)
            this.transformNode.dispose();
    };
    // TODO
    Transform.prototype.lookAt = function (target, worldUp) {
        if (worldUp === void 0) { worldUp = BABYLON.Vector3.Up(); }
    };
    Transform.prototype.setParent = function (parent) {
    };
    Transform.prototype.detachChildren = function () {
    };
    Transform.prototype.findChild = function (name) {
    };
    Transform.prototype.isChildOf = function (name) {
        return true;
    };
    Transform.prototype.getChild = function (index) {
    };
    return Transform;
}());
exports.Transform = Transform;
},{}],31:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./selector"));
__export(require("./selector-history"));
},{"./selector":33,"./selector-history":32}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SelectorHistory = /** @class */ (function () {
    function SelectorHistory() {
    }
    return SelectorHistory;
}());
exports.SelectorHistory = SelectorHistory;
},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../../lib");
var Selector = /** @class */ (function () {
    function Selector() {
        this.enabled = true;
        this.selector = new lib_1.ObserverList();
        this.evtChange = false;
        this.init();
    }
    Selector.prototype.init = function () {
        var self = this;
        // 某个面板选中item
        editor.method('selector:add', function (type, item) {
            if (!self.enabled)
                return;
            if (self.selector.has(item))
                return;
            // console.warn('selector add入口');
            if (self.selector.length > 0 && self.selector.type !== type)
                self.selector.clear();
            self.selector.type = type;
            self.selector.add(item);
        });
        // deselecting item
        editor.method('selector:remove', function (type, item) {
            // console.warn('selector:remove 移除');
            if (!self.enabled)
                return;
            if (!self.selector.has(item))
                return;
            self.selector.remove(item);
        });
        // observer-list中有添加item
        this.selector.on('add', function (item) {
            // add index TODO
            // this.setIndex(self.selector.type, item);
            // console.warn('selector list 中 add item');
            editor.emit('selector:add', item, self.selector.type);
            if (!self.evtChange) {
                self.evtChange = true;
                setTimeout(self.evtChangeFn.bind(self), 0);
            }
        });
        // removing
        this.selector.on('remove', function (item) {
            editor.emit('selector:remove', item, self.selector.type);
            // remove index
            // this.removeIndex(self.selector.type, item);
            if (self.selector.length === 0)
                self.selector.type = '';
            if (!self.evtChange) {
                self.evtChange = true;
                setTimeout(self.evtChangeFn.bind(self), 0);
            }
        });
    };
    Selector.prototype.keyByType = function (type) {
        switch (type) {
            case 'entity':
                return 'resource_id';
            case 'asset':
                return 'id';
        }
        return '';
    };
    // private setIndex(type: string, item: Observer): void {
    //   var key = this.keyByType(type);
    //   if (!key) return;
    //   if (!index[type])
    //     index[type] = {};
    //   index[type][item.get[key]] = item.once('destroy', function () {
    //     var state = editor.call('selector:history');
    //     if (state)
    //       editor.call('selector:history', false);
    //     selector.remove(item);
    //     delete index[type][item.get[key]];
    //     if (state)
    //       editor.call('selector:history', true);
    //   });
    // }
    Selector.prototype.evtChangeFn = function () {
        this.evtChange = false;
        console.log('selector change 事件');
        editor.emit('selector:change', this.selector.type, this.selector.array());
    };
    return Selector;
}());
exports.Selector = Selector;
},{"../../lib":53}],34:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./toolbar-top-control"));
},{"./toolbar-top-control":35}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var ToolbarTopControl = /** @class */ (function () {
    function ToolbarTopControl() {
        // panel
        var panel = new ui_1.Panel();
        panel.class.add('top-controls');
        engine_1.VeryEngine.viewPanel.append(panel);
        editor.method('layout.toolbar.launch', function () {
            return panel;
        });
        // fullscreen button
        var buttonExpand = new ui_1.Button('&#57639;');
        buttonExpand.class.add('icon', 'expand');
        panel.append(buttonExpand);
        buttonExpand.on('click', function () {
            editor.call('viewport:expand');
        });
        editor.on('viewport:expand', function (state) {
            if (state) {
                tooltipExpand.text = '还原';
                buttonExpand.class.add('active');
            }
            else {
                tooltipExpand.text = '最大化';
                buttonExpand.class.remove('active');
            }
            tooltipExpand.hidden = true;
        });
        var tooltipExpand = ui_1.Tooltip.attach({
            target: buttonExpand.element,
            text: '最大化',
            align: 'top',
            root: engine_1.VeryEngine.rootPanel
        });
    }
    return ToolbarTopControl;
}());
exports.ToolbarTopControl = ToolbarTopControl;
},{"../../engine":49,"../../ui":68}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ComponentsLogos = /** @class */ (function () {
    function ComponentsLogos() {
        editor.method('components:logos', function () {
            return {
                'animation': '&#57875;',
                'audiolistener': '&#57750;',
                'audiosource': '&#57751;',
                'sound': '&#57751;',
                'camera': '&#57874;',
                'collision': '&#57735;',
                'directional': '&#57746;',
                'point': '&#57745;',
                'spot': '&#57747;',
                'light': '&#57748;',
                'model': '&#57736;',
                'particlesystem': '&#57753;',
                'rigidbody': '&#57737;',
                'script': '&#57910;',
                'screen': '&#58371;',
                'sprite': '&#58261;',
                'element': '&#58232;',
                'layoutgroup': '&#57667;',
                'layoutchild': '&#57667;',
                'scrollview': '&#58376;',
                'scrollbar': '&#58377;',
                'button': '&#58373;',
                'zone': '&#57910;',
                '2d-screen': '&#58371;',
                '3d-screen': '&#58372;',
                'text-element': '&#58374;',
                'image-element': '&#58005;',
                'group-element': '&#58375;',
                'userinterface': '&#58370;'
            };
        });
    }
    return ComponentsLogos;
}());
exports.ComponentsLogos = ComponentsLogos;
},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ContextMenu = /** @class */ (function () {
    function ContextMenu() {
        // 阻止默认鼠标右键菜单
        window.addEventListener('contextmenu', function (evt) {
            evt.preventDefault();
        }, false);
    }
    return ContextMenu;
}());
exports.ContextMenu = ContextMenu;
},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Debug = /** @class */ (function () {
    function Debug(allow) {
        if (allow === void 0) { allow = true; }
        this.allow = allow;
    }
    Debug.prototype.log = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (!this.allow)
            return;
        console.log(message, optionalParams);
    };
    Debug.prototype.warn = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (!this.allow)
            return;
        console.warn(message, optionalParams);
    };
    Debug.prototype.error = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (!this.allow)
            return;
        console.error(message, optionalParams);
    };
    return Debug;
}());
exports.Debug = Debug;
},{}],39:[function(require,module,exports){
(function (process,setImmediate){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventProxy = /** @class */ (function () {
    function EventProxy(debug) {
        this._fired = {};
        /*!
         * refs
         */
        this.SLICE = Array.prototype.slice;
        this.CONCAT = Array.prototype.concat;
        this.ALL_EVENT = '__all__';
        this.later = (typeof setImmediate !== 'undefined' && setImmediate) ||
            (typeof process !== 'undefined' && process.nextTick) || function (fn) {
            setTimeout(fn, 0);
        };
        this.debug = debug || function () { };
        this._callbacks = {};
    }
    EventProxy.prototype.addListener = function (ev, callback) {
        this.debug('Add listener for %s', ev);
        this._callbacks[ev] = this._callbacks[ev] || [];
        this._callbacks[ev].push(callback);
        return this;
    };
    EventProxy.prototype.bind = function (ev, callback) {
        return this.addListener(ev, callback);
    };
    EventProxy.prototype.on = function (ev, callback) {
        return this.addListener(ev, callback);
    };
    EventProxy.prototype.subscribe = function (ev, callback) {
        return this.addListener(ev, callback);
    };
    EventProxy.prototype.headbind = function (ev, callback) {
        this.debug('Add listener for %s', ev);
        this._callbacks[ev] = this._callbacks[ev] || [];
        this._callbacks[ev].unshift(callback);
        return this;
    };
    EventProxy.prototype.removeListener = function (eventname, callback) {
        var calls = this._callbacks;
        if (!eventname) {
            this.debug('Remove all listeners');
            this._callbacks = {};
        }
        else {
            if (!callback) {
                this.debug('Remove all listeners of %s', eventname);
                calls[eventname] = [];
            }
            else {
                var list = calls[eventname];
                if (list) {
                    var l = list.length;
                    for (var i = 0; i < l; i++) {
                        if (callback === list[i]) {
                            this.debug('Remove a listener of %s', eventname);
                            list.splice(i, 1);
                        }
                    }
                }
            }
        }
        return this;
    };
    EventProxy.prototype.unbind = function (eventname, callback) {
        return this.removeListener(eventname, callback);
    };
    EventProxy.prototype.removeAllListeners = function () {
        return this.unbind();
    };
    EventProxy.prototype.bindForAll = function (callback) {
        this.bind(this.ALL_EVENT, callback);
    };
    EventProxy.prototype.unbindForAll = function (callback) {
        this.unbind(this.ALL_EVENT, callback);
    };
    EventProxy.prototype.trigger = function (eventname, data) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var list, ev, callback, i, l;
        var both = 2;
        var calls = this._callbacks;
        this.debug('Emit event %s with data %j', eventname, data);
        // 运行当前ev和ALL
        while (both--) {
            ev = both ? eventname : this.ALL_EVENT;
            list = calls[ev];
            if (list) {
                for (i = 0, l = list.length; i < l; i++) {
                    if (!(callback = list[i])) {
                        list.splice(i, 1);
                        i--;
                        l--;
                    }
                    else {
                        var args = [];
                        var start = both ? 1 : 0;
                        for (var j = start; j < arguments.length; j++) {
                            args.push(arguments[j]);
                        }
                        callback.apply(this, args);
                    }
                }
            }
        }
        return this;
    };
    EventProxy.prototype.emit = function (eventname, data) {
        return this.trigger(eventname, data);
    };
    EventProxy.prototype.fire = function (eventname, data) {
        return this.trigger(eventname, data);
    };
    EventProxy.prototype.once = function (ev, callback) {
        var self = this;
        var wrapper = function () {
            callback.apply(self, arguments);
            self.unbind(ev, wrapper);
        };
        this.bind(ev, wrapper);
        return this;
    };
    // TODO
    // public emitLater() {
    //     var self = this;
    //     var args: any[] = [];
    //     for(var i = 0; i < arguments.length; i++) {
    //         args.push(arguments[i]);
    //     }
    //     this.later(function () {
    //         self.trigger.apply(self, args);
    //     });
    // }
    EventProxy.prototype.immediate = function (ev, callback, data) {
        this.bind(ev, callback);
        this.trigger(ev, data);
        return this;
    };
    EventProxy.prototype._assign = function (eventnames, cb, once) {
        var proxy = this;
        // var argsLength = arguments.length;
        var times = 0;
        var flag = {};
        // Check the arguments length.
        // if (argsLength < 3) {
        //     return this;
        // }
        var events = eventnames;
        var callback = cb;
        var isOnce = once;
        // Check the callback type.
        if (typeof callback !== "function") {
            return;
        }
        this.debug('Assign listener for events %j, once is %s', events, !!isOnce);
        var bind = function (key) {
            if (isOnce) {
                proxy.once(key, function (data) {
                    proxy._fired[key] = proxy._fired[key] || {};
                    proxy._fired[key].data = data;
                    if (!flag[key]) {
                        flag[key] = true;
                        times++;
                    }
                });
            }
            else {
                proxy.bind(key, function (data) {
                    proxy._fired[key] = proxy._fired[key] || {};
                    proxy._fired[key].data = data;
                    if (!flag[key]) {
                        flag[key] = true;
                        times++;
                    }
                });
            }
        };
        var length = events.length;
        for (var index = 0; index < length; index++) {
            bind(events[index]);
        }
        var _all = function (event) {
            if (times < length) {
                return;
            }
            if (!flag[event]) {
                return;
            }
            var data = [];
            for (var index = 0; index < length; index++) {
                data.push(proxy._fired[events[index]].data);
            }
            if (isOnce) {
                proxy.unbindForAll(_all);
            }
            proxy.debug('Events %j all emited with data %j', events, data);
            callback.apply(null, data);
        };
        proxy.bindForAll(_all);
    };
    EventProxy.prototype.all = function (eventname1, eventname2, callback) {
        var names = [];
        if (typeof eventname1 === 'string') {
            names.push(eventname1);
        }
        else {
            names = this.CONCAT.apply(names, eventname1);
        }
        if (typeof eventname2 === 'string') {
            names.push(eventname2);
        }
        else {
            names = this.CONCAT.apply(names, eventname2);
        }
        this._assign.apply(this, [names, callback, true]);
        return this;
    };
    EventProxy.prototype.assign = function (eventname1, eventname2, callback) {
        return this.all(eventname1, eventname2, callback);
    };
    EventProxy.prototype.fail = function (callback) {
        var that = this;
        that.once('error', function () {
            that.unbind();
            // put all arguments to the error handler
            // fail(function(err, args1, args2, ...){})
            callback.apply(null, arguments);
        });
        return this;
    };
    EventProxy.prototype.throw = function (err) {
        this.emit('error', err);
    };
    EventProxy.prototype.tail = function (eventname1, eventname2, callback) {
        var names = [];
        if (typeof eventname1 === 'string') {
            names.push(eventname1);
        }
        else {
            names = this.CONCAT.apply(names, eventname1);
        }
        if (typeof eventname2 === 'string') {
            names.push(eventname2);
        }
        else {
            names = this.CONCAT.apply(names, eventname2);
        }
        this._assign.apply(this, [names, callback, false]);
        return this;
    };
    EventProxy.prototype.assignAll = function (eventname1, eventname2, callback) {
        return this.tail(eventname1, eventname2, callback);
    };
    EventProxy.prototype.assignAlways = function (eventname1, eventname2, callback) {
        return this.tail(eventname1, eventname2, callback);
    };
    /**
     * The callback will be executed after the event be fired N times.
     * @param {String} eventname Event name.
     * @param {Number} times N times.
     * @param {Function} callback Callback, that will be called after event was fired N times.
     */
    EventProxy.prototype.after = function (eventname, times, callback) {
        if (times === 0) {
            callback.call(null, []);
            return this;
        }
        var proxy = this, firedData = [];
        this._after = this._after || {};
        var group = eventname + '_group';
        this._after[group] = {
            index: 0,
            results: []
        };
        this.debug('After emit %s times, event %s\'s listenner will execute', times, eventname);
        var all = function (name, data) {
            if (name === eventname) {
                times--;
                firedData.push(data);
                if (times < 1) {
                    proxy.debug('Event %s was emit %s, and execute the listenner', eventname, times);
                    proxy.unbindForAll(all);
                    callback.apply(null, [firedData]);
                }
            }
            if (name === group) {
                times--;
                proxy._after[group].results[data.index] = data.result;
                if (times < 1) {
                    proxy.debug('Event %s was emit %s, and execute the listenner', eventname, times);
                    proxy.unbindForAll(all);
                    callback.call(null, proxy._after[group].results);
                }
            }
        };
        proxy.bindForAll(all);
        return this;
    };
    /**
     * The `after` method's helper. Use it will return ordered results.
     * If you need manipulate result, you need callback
     * Examples:
     * ```js
     * var ep = new EventProxy();
     * ep.after('file', files.length, function (list) {
     *   // Ordered results
     * });
     * for (var i = 0; i < files.length; i++) {
     *   fs.readFile(files[i], 'utf-8', ep.group('file'));
     * }
     * ```
     * @param {String} eventname Event name, shoule keep consistent with `after`.
     * @param {Function} callback Callback function, should return the final result.
     */
    EventProxy.prototype.group = function (eventname, callback) {
        var that = this;
        var group = eventname + '_group';
        var index = that._after[group].index;
        that._after[group].index++;
        return function (err, data) {
            if (err) {
                // put all arguments to the error handler
                that.throw(err);
            }
            that.emit(group, {
                index: index,
                // callback(err, args1, args2, ...)
                result: callback ? callback.apply(null, that.SLICE.call(arguments, 1)) : data
            });
        };
    };
    /**
     * The callback will be executed after any registered event was fired. It only executed once.
     * @param {String} eventname1 Event name.
     * @param {String} eventname2 Event name.
     * @param {Function} callback The callback will get a map that has data and eventname attributes.
     */
    EventProxy.prototype.any = function (eventname1, eventname2, callback) {
        var proxy = this, events = proxy.SLICE.call(arguments, 0, -1), _eventname = events.join("_");
        proxy.debug('Add listenner for Any of events %j emit', events);
        proxy.once(_eventname, callback);
        var _bind = function (key) {
            proxy.bind(key, function (data) {
                proxy.debug('One of events %j emited, execute the listenner');
                proxy.trigger(_eventname, { "data": data, eventName: key });
            });
        };
        for (var index = 0; index < events.length; index++) {
            _bind(events[index]);
        }
    };
    /**
     * The callback will be executed when the event name not equals with assigned event.
     * @param {String} eventname Event name.
     * @param {Function} callback Callback.
     */
    EventProxy.prototype.not = function (eventname, callback) {
        var proxy = this;
        proxy.debug('Add listenner for not event %s', eventname);
        proxy.bindForAll(function (name, data) {
            if (name !== eventname) {
                proxy.debug('listenner execute of event %s emit, but not event %s.', name, eventname);
                callback(data);
            }
        });
    };
    /**
     * Success callback wrapper, will handler err for you.
     *
     * ```js
     * fs.readFile('foo.txt', ep.done('content'));
     *
     * // equal to =>
     *
     * fs.readFile('foo.txt', function (err, content) {
     *   if (err) {
     *     return ep.emit('error', err);
     *   }
     *   ep.emit('content', content);
     * });
     * ```
     *
     * ```js
     * fs.readFile('foo.txt', ep.done('content', function (content) {
     *   return content.trim();
     * }));
     *
     * // equal to =>
     *
     * fs.readFile('foo.txt', function (err, content) {
     *   if (err) {
     *     return ep.emit('error', err);
     *   }
     *   ep.emit('content', content.trim());
     * });
     * ```
     * @param {Function|String} handler, success callback or event name will be emit after callback.
     * @return {Function}
     */
    EventProxy.prototype.done = function (handler, callback) {
        var that = this;
        return function (err, data) {
            if (err) {
                // put all arguments to the error handler
                return that.emit.apply(that, ['error', err]);
            }
            // callback(err, args1, args2, ...)
            var args = that.SLICE.call(arguments, 1);
            if (typeof handler === 'string') {
                if (callback) {
                    // only replace the args when it really return a result
                    return that.emit(handler, callback.apply(null, args));
                }
                else {
                    // put all arguments to the done handler
                    //ep.done('some');
                    //ep.on('some', function(args1, args2, ...){});
                    return that.emit.apply(that, [handler, args]);
                }
            }
            // speed improve for mostly case: `callback(err, data)`
            if (arguments.length <= 2) {
                return handler(data);
            }
            // callback(err, args1, args2, ...)
            handler.apply(null, args);
        };
    };
    //     /**
    //    * make done async
    //    * @return {Function} delay done
    //    */
    //     EventProxy.prototype.doneLater = function (handler, callback) {
    //         var _doneHandler = this.done(handler, callback);
    //         return function (err, data) {
    //             var args = arguments;
    //             later(function () {
    //                 _doneHandler.apply(null, args);
    //             });
    //         };
    //     };
    /**
     * Create a new EventProxy
     * Examples:
     * ```js
     * var ep = EventProxy.create();
     * ep.assign('user', 'articles', function(user, articles) {
     *   // do something...
     * });
     * // or one line ways: Create EventProxy and Assign
     * var ep = EventProxy.create('user', 'articles', function(user, articles) {
     *   // do something...
     * });
     * ```
     * @return {EventProxy} EventProxy instance
     */
    EventProxy.create = function () {
        var ep = new EventProxy();
        return ep;
    };
    EventProxy.createWithArgs = function (eventname1, eventname2, callback) {
        var ep = new EventProxy();
        var names = [];
        if (typeof eventname1 === 'string') {
            names.push(eventname1);
        }
        else {
            names = ep.CONCAT.apply(names, eventname1);
        }
        if (typeof eventname2 === 'string') {
            names.push(eventname2);
        }
        else {
            names = ep.CONCAT.apply(names, eventname2);
        }
        ep._assign.apply(this, [names, callback, true]);
        return ep;
    };
    return EventProxy;
}());
exports.EventProxy = EventProxy;
}).call(this,require('_process'),require("timers").setImmediate)

},{"_process":1,"timers":2}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GUID = /** @class */ (function () {
    function GUID() {
    }
    /**
     * 创建GUID唯一标志，注意：采用大数法，有很小的可能性会重复，一般够用；
     */
    GUID.create = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = (c === 'x') ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    return GUID;
}());
exports.GUID = GUID;
},{}],41:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./components-logos"));
__export(require("./context-menu"));
__export(require("./guid"));
__export(require("./eventproxy"));
__export(require("./debug"));
},{"./components-logos":36,"./context-menu":37,"./debug":38,"./eventproxy":39,"./guid":40}],42:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./viewport"));
__export(require("./viewport-expand"));
__export(require("./viewport-application"));
__export(require("./viewport-instance-create"));
},{"./viewport":46,"./viewport-application":43,"./viewport-expand":44,"./viewport-instance-create":45}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ViewportApplication = /** @class */ (function () {
    function ViewportApplication() {
    }
    return ViewportApplication;
}());
exports.ViewportApplication = ViewportApplication;
},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("../../engine");
/*
*  viewport窗口最大化显示控制；
*/
var ViewportExpand = /** @class */ (function () {
    function ViewportExpand() {
        var panels = [];
        panels.push(engine_1.VeryEngine.hierarchyPanel);
        panels.push(engine_1.VeryEngine.assetPanel);
        panels.push(engine_1.VeryEngine.attributesPanel);
        var expanded = false;
        window.editor.method('viewport:expand', function (state) {
            if (state === undefined)
                state = !expanded;
            if (expanded === state)
                return;
            expanded = state;
            for (var i = 0; i < panels.length; i++)
                panels[i].hidden = expanded;
            window.editor.emit('viewport:expand', state);
        });
        window.editor.method('viewport:expand:state', function () {
            return expanded;
        });
        // expand hotkey
        window.editor.call('hotkey:register', 'viewport:expand', {
            key: 'space',
            callback: function () {
                window.editor.call('viewport:expand');
            }
        });
    }
    return ViewportExpand;
}());
exports.ViewportExpand = ViewportExpand;
},{"../../engine":49}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ViewportInstanceCreate = /** @class */ (function () {
    // 注册事件到相关脚本
    function ViewportInstanceCreate() {
    }
    ViewportInstanceCreate.prototype.addEntity = function () {
    };
    return ViewportInstanceCreate;
}());
exports.ViewportInstanceCreate = ViewportInstanceCreate;
},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var toolbar_1 = require("../toolbar");
var viewport_expand_1 = require("./viewport-expand");
var Viewport = /** @class */ (function () {
    function Viewport() {
        var _this = this;
        var self = this;
        this.canvas = new ui_1.Canvas('canvas-3d');
        engine_1.VeryEngine.viewCanvas = this.canvas;
        this._canvas = this.canvas.element;
        // 去掉Babylon的蓝色边框
        this._canvas.style.outline = 'none';
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
        }, 100 / 6);
        // if(this._engine) this._engine.dispose();
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
        // this._scen
        // 加载过度动画开
        // engine.loadingScreen.hideLoadingUI();
        // engine.displayLoadingUI();
        var inputMap = {};
        // TODO: 加载scene.babylon场景文件，当前为默认
        // 默认Editor场景，加载保存的某一个场景资源
        // 资源的父子关系以及模型
        BABYLON.SceneLoader.Append("./scene/", "scene.babylon", this._scene, function (scene) {
            // do something with the scene
            // 加载过度动画关
            // engine.hideLoadingUI();
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
            // sphere
            var sphere = scene.getMeshByName('sphere');
            sphere.actionManager = new BABYLON.ActionManager(scene);
            sphere.actionManager.registerAction(new BABYLON.SetValueAction({ trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: blue }, sphere, "scaling", new BABYLON.Vector3(2, 2, 2)));
            sphere.actionManager.registerAction(new BABYLON.SetValueAction({ trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: blue }, sphere, "scaling", new BABYLON.Vector3(1, 1, 1)));
            var i = 0;
            // WebSocket 测试
            // scene.onKeyboardObservable.add( kbInfo => {
            //   if(kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
            //     if(kbInfo.event.keyCode === 65) {
            //       // editor.call('send', '按下次数：' + (i++) + "!");
            //       editor.call('send', '{"data": {"a": 123, "b": "qwe"}}');
            //     }
            //   }
            // });
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
        this.expandControl();
    }
    Viewport.prototype.expandControl = function () {
        var control = new toolbar_1.ToolbarTopControl();
        var expandView = new viewport_expand_1.ViewportExpand();
    };
    return Viewport;
}());
exports.Viewport = Viewport;
},{"../../engine":49,"../../ui":68,"../toolbar":34,"./viewport-expand":44}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utility_1 = require("../utility");
var entity_1 = require("../entity");
var Realtime = /** @class */ (function () {
    function Realtime() {
        this.load = new entity_1.EntityLoad();
        var self = this;
        var ep = utility_1.EventProxy.create();
        ep.all('settings', ['assets', 'scenes'], function (data1, data2, data3) {
            console.log(data1);
            console.log(data2);
            // console.error(data2["data"]["18818365"]["data"]["aoMapTiling"][0]);
            console.log(data3);
        });
        ep.bind('ok', function (msg) {
            console.warn('ok');
            console.warn(msg);
        });
        axios.get('/api/settings')
            .then(function (response) {
            // console.log('response: ' + response.data);
            ep.emit('settings', response.data);
        })
            .catch(function (error) {
            console.error(error);
        });
        axios.get('/api/assets')
            .then(function (response) {
            // console.log('response: ' + response.data);
            ep.emit('assets', response.data);
            // 解析
        })
            .catch(function (error) {
            console.error(error);
        });
        axios.get('/api/scenes')
            .then(function (response) {
            // console.log('response: ' + response.data);
            ep.emit('scenes', response.data);
            self.getScene(response.data.data.scenes[0].id);
        })
            .catch(function (error) {
            console.error(error);
        });
        // var ws = new WebSocket("ws://localhost:1024");
        // ws.onopen = function (evt) {
        //   console.log("Connection open ...");
        //   ws.send("Hello WebSockets!");
        // };
        // ws.onmessage = function (evt) {
        //   console.log("Received Message: " + evt.data);
        //   ws.close();
        // };
        // ws.onclose = function (evt) {
        //   console.log("Connection closed.");
        // 
        // };
        // 打开一个WebSocket:
        // console.log('websocket');
        // var ws = new WebSocket('ws://localhost:1024/VeRyEngine');
        // // 响应onmessage事件:
        // ws.onmessage = function (msg: MessageEvent) {
        //   console.log(msg.data);
        // };
        // // 给服务器发送一个字符串:
        // ws.onopen = function (evt) {
        //   console.log("Connection open ...");
        //   ws.send(`{"str": "Hello WebSockets!"}`);
        // };
        // /**
        // * 
        // */
        // editor.method('send', (msg: string) => {
        //   ws.send(msg);
        // });
        // 获取表格数据
        // axios
        //   .get("./data/exhibits.json")
        //   .then(function (response) {
        //     that._data = response.data;
        //     that._success = true;
        //     // console.log(that._data);
        //   })
        //   .catch(function (error) {
        //     console.log("load error: " + error);
        //   });
    }
    Realtime.prototype.getScene = function (id) {
        var self = this;
        axios.post("/api/getScene", { scene: id })
            .then(function (response) {
            // console.log(response.data);
            // 加载场景，json数据
            // 如何关联到其他脚本
            debug.error(typeof response.data.data);
            debug.error(response.data.data);
            self.load.scene_raw(response.data.data);
            // for (var key in response.data.data) {
            //   if (typeof (response.data.data[key]) === 'object') {
            //     // 对象
            //     // this._prepare(this, key, data[key]);
            //     console.log("object: " + key);
            //     console.warn(response.data.data[key]);
            //   } else {
            //     // 字符串等一般属性
            //     console.log(typeof (response.data.data[key]) + ": " + key);
            //     console.warn(response.data.data[key]);
            //   }
            // }
        })
            .catch(function (error) {
            console.error(error);
        });
    };
    return Realtime;
}());
exports.Realtime = Realtime;
},{"../entity":14,"../utility":41}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BabylonEngine = /** @class */ (function () {
    function BabylonEngine() {
    }
    return BabylonEngine;
}());
exports.BabylonEngine = BabylonEngine;
},{}],49:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./babylon-engine"));
__export(require("./very-engine"));
},{"./babylon-engine":48,"./very-engine":50}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VeryEngine = /** @class */ (function () {
    function VeryEngine() {
    }
    return VeryEngine;
}());
exports.VeryEngine = VeryEngine;
},{}],51:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./lib"));
__export(require("./editor"));
__export(require("./ui"));
__export(require("./engine"));
},{"./editor":22,"./engine":49,"./lib":53,"./ui":68}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Events = /** @class */ (function () {
    function Events() {
        this._suspendEvents = false;
        // 某个name对应的事件数组，name与Function是1对多的关系；
        this._events = {};
    }
    Object.defineProperty(Events.prototype, "suspendEvents", {
        // 相较于Editor，同一个函数名可包含一系列函数，不仅仅是一个，且有once功能；
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
},{}],53:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./events"));
__export(require("./observer"));
__export(require("./observer-list"));
},{"./events":52,"./observer":55,"./observer-list":54}],54:[function(require,module,exports){
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
var events_1 = require("./events");
var ObserverList = /** @class */ (function (_super) {
    __extends(ObserverList, _super);
    function ObserverList(options) {
        var _this = _super.call(this) || this;
        options = options || {};
        _this.type = '';
        _this.data = [];
        _this._indexed = {};
        _this.sorted = options.sorted || null;
        _this.index = options.index || null;
        return _this;
    }
    Object.defineProperty(ObserverList.prototype, "length", {
        get: function () {
            return this.data.length;
        },
        enumerable: true,
        configurable: true
    });
    ObserverList.prototype.get = function (index) {
        if (this.index) {
            return this._indexed[index] || null;
        }
        else {
            return this.data[index] || null;
        }
    };
    ObserverList.prototype.set = function (index, val) {
        if (this.index) {
            this._indexed[index] = val;
        }
        else {
            this.data[index] = val;
        }
    };
    // public indexof(item: Observer): number {
    //   if (this.index) {
    //     let index: number =
    //       (item instanceof Observer && item.get(this.index)) || item[this.index];
    //     return (this._indexed[index] && index) || null;
    //   } else {
    //     let ind = this.data.indexOf(item);
    //     return ind !== -1 ? ind : null;
    //   }
    // }
    // public position = function (b: any, fn: any) {
    //   let l = this.data;
    //   let min = 0;
    //   let max = l.length - 1;
    //   let cur;
    //   let a, i;
    //   fn = fn || this.sorted;
    //   while (min <= max) {
    //     cur = Math.floor((min + max) / 2);
    //     a = l[cur];
    //     i = fn(a, b);
    //     if (i === 1) {
    //       max = cur - 1;
    //     } else if (i === -1) {
    //       min = cur + 1;
    //     } else {
    //       return cur;
    //     }
    //   }
    //   return -1;
    // };
    // 2分法求最近距离
    ObserverList.prototype.positionNextClosest = function (b, fn) {
        var l = this.data;
        var min = 0;
        var max = l.length - 1;
        var cur = 0;
        var a, i;
        fn = fn || this.sorted;
        if (l.length === 0)
            return -1;
        if (fn(l[0], b) === 0)
            return 0;
        while (min <= max) {
            cur = Math.floor((min + max) / 2);
            a = l[cur];
            i = fn(a, b);
            if (i === 1) {
                max = cur - 1;
            }
            else if (i === -1) {
                min = cur + 1;
            }
            else {
                return cur;
            }
        }
        if (fn(a, b) === 1)
            return cur;
        if (cur + 1 === l.length)
            return -1;
        return cur + 1;
    };
    ;
    ObserverList.prototype.has = function (item) {
        // if (this.index) {
        //   let index =
        //     (item instanceof Observer && item.get(this.index)) || item[this.index];
        //   return !!this._indexed[index];
        // } else {
        //   return this.data.indexOf(item) !== -1;
        // }
        return this.data.indexOf(item) !== -1;
    };
    ;
    ObserverList.prototype.add = function (item) {
        if (this.has(item))
            return -1;
        // let index = this.data.length;
        // if (this.index) {
        //   index =
        //     (item instanceof Observer && item.get(this.index)) || item[this.index];
        //   this._indexed[index] = item;
        // }
        var pos = 0;
        this.data.push(item);
        pos = this.data.length - 1;
        // if (this.sorted) {
        //   pos = this.positionNextClosest(item);
        //   if (pos !== -1) {
        //     this.data.splice(pos, 0, item);
        //   } else {
        //     this.data.push(item);
        //   }
        // } else {
        //   this.data.push(item);
        //   pos = this.data.length - 1;
        // }
        this.emit('add', item, this.data.length);
        return pos;
    };
    ;
    ObserverList.prototype.move = function (item, pos) {
        var ind = this.data.indexOf(item);
        this.data.splice(ind, 1);
        if (pos === -1) {
            this.data.push(item);
        }
        else {
            this.data.splice(pos, 0, item);
        }
    };
    ;
    // TODO
    ObserverList.prototype.remove = function (item) {
        if (!this.has(item))
            return;
        var ind = this.data.indexOf(item);
        // let index = ind;
        // if (this.index) {
        //   index =
        //     (item instanceof Observer && item.get(this.index)) || item[this.index];
        //   delete this._indexed[index];
        // }
        this.data.splice(ind, 1);
        this.emit("remove", item, ind);
    };
    ;
    ObserverList.prototype.removeByKey = function (index) {
        if (this.index) {
            var item = this._indexed[index];
            if (!item)
                return;
            var ind = this.data.indexOf(item);
            this.data.splice(ind, 1);
            delete this._indexed[index];
            this.emit("remove", item, ind);
        }
        else {
            if (this.data.length < index)
                return;
            var item = this.data[index];
            this.data.splice(index, 1);
            this.emit("remove", item, index);
        }
    };
    ;
    // public removeBy(fn: Function) {
    //   let i = this.data.length;
    //   while (i--) {
    //     if (!fn(this.data[i])) continue;
    //     if (this.index) {
    //       delete this._indexed[this.data[i][this.index]];
    //     }
    //     this.data.splice(i, 1);
    //     this.emit("remove", this.data[i], i);
    //   }
    // };
    ObserverList.prototype.clear = function () {
        var items = this.data.slice(0);
        this.data = [];
        this._indexed = {};
        var i = items.length;
        while (i--) {
            this.emit("remove", items[i], i);
        }
    };
    ;
    // public forEach(fn: Function) {
    //   for (let i = 0; i < this.data.length; i++) {
    //     fn(this.data[i], (this.index && this.data[i][this.index]) || i);
    //   }
    // };
    // public find(fn: Function) {
    //   let items = [];
    //   for (let i = 0; i < this.data.length; i++) {
    //     if (!fn(this.data[i])) continue;
    //     let index = i;
    //     if (this.index) index = this.data[i][this.index];
    //     items.push([index, this.data[i]]);
    //   }
    //   return items;
    // };
    // public findOne(fn: Function) {
    //   for (let i = 0; i < this.data.length; i++) {
    //     if (!fn(this.data[i])) continue;
    //     let index = i;
    //     if (this.index) index = this.data[i][this.index];
    //     return [index, this.data[i]];
    //   }
    //   return null;
    // };
    // public map(fn: Function) {
    //   return this.data.map(fn);
    // };
    // public sort(fn: Function) {
    //   this.data.sort(fn);
    // };
    ObserverList.prototype.array = function () {
        return this.data.slice(0);
    };
    ;
    return ObserverList;
}(events_1.Events));
exports.ObserverList = ObserverList;
},{"./events":52}],55:[function(require,module,exports){
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
var events_1 = require("./events");
/**
 * json数据解析工具；
 * 要求：
 *  1.保存原始json数据；
 *  2.存储信息，根据路径快速索引到对应数据，包括数组，包括嵌套的对象，保持原始数据类型不变；
 *  3.插入、删除、clone数据；
 *
 */
var Observer = /** @class */ (function (_super) {
    __extends(Observer, _super);
    // entity, assets, components: script, 一般components, selector, history
    function Observer(data, options) {
        var _this = _super.call(this) || this;
        _this.SEPARATOR = '.';
        _this.origin = data;
        _this._destroyed = false;
        _this._path = "";
        _this._keys = [];
        _this._data = {};
        // array paths where duplicate entries are allowed - normally
        // we check if an array already has a value before inserting it
        // but if the array path is in here we'll allow it
        // this._pathsWithDuplicates = null;
        // if (options.pathsWithDuplicates) {
        //     this._pathsWithDuplicates = {};
        //     for (let i = 0; i < options.pathsWithDuplicates.length; i++) {
        //         this._pathsWithDuplicates[options.pathsWithDuplicates[i]] = true;
        //     }
        // }
        _this.patchData(data);
        // for (let ke in this._data) {
        //   debug.log("key: " + ke);
        //   debug.log(this._data[ke]);
        // }
        // this._parent = options.parent || null;
        // this._parentPath = options.parentPath || "";
        // this._parentField = options.parentField || null;
        // this._parentKey = options.parentKey || null;
        _this._silent = false;
        return _this;
    }
    Object.defineProperty(Observer.prototype, "className", {
        get: function () {
            return "Observer";
        },
        enumerable: true,
        configurable: true
    });
    Observer.prototype.patchData = function (data) {
        if (typeof data !== "object") {
            debug.warn(this.className + ': 不是正确的json对象，打印：\n' + data);
            return;
        }
        for (var key in data) {
            if (typeof data[key] === "object") {
                // 对象属性
                // debug.log('对象属性：' + key);
                // debug.log(data[key]);
                // this._prepare(this, key, data[key]);
                this.parserObject(key, key, data[key]);
            }
            else {
                // 一般属性
                // debug.log('一般属性：' + key);
                // debug.log(data[key]);
                this.set(key, data[key]);
                // this.set(key, data[key]);
            }
        }
    };
    Observer.prototype.set = function (path, value) {
        this._data[path] = value;
    };
    Observer.prototype.parserObject = function (prefix, key, value) {
        // 先保存一份
        this.set(prefix, value);
        var path;
        var type = typeof value;
        if (type === "object" && value instanceof Array) {
            for (var i = 0; i < value.length; i++) {
                path = prefix + this.SEPARATOR + i.toString();
                this.set(path, value[i]);
                // 数组元素还是对象的情况暂时不处理
            }
        }
        else if (type === "object" && value instanceof Object) {
            for (var key2 in value) {
                if (typeof value[key2] === "object") {
                    // 递归解析
                    this.parserObject(prefix + this.SEPARATOR + key2, key2, value[key2]);
                }
                else {
                    path = prefix + this.SEPARATOR + key2;
                    this.set(path, value[key2]);
                }
            }
        }
        else {
            debug.warn(this.className + '.parserObject, 为止数据类型:' + value);
            // this.set(key, );
        }
    };
    Observer.prototype.has = function (path) {
        return this._data[path] ? true : false;
    };
    Observer.prototype.get = function (path) {
        return this._data[path];
    };
    Observer.prototype.propagate = function (evt) {
        var that = this;
        return function (path, arg1, arg2, arg3) {
            if (!that._parent)
                return;
            var key = that._parentKey;
            if (!key && that._parentField instanceof Array) {
                key = that._parentField.indexOf(that);
                if (key === -1)
                    return;
            }
            // path = that._parentPath + "." + key + "." + path;
            var state;
            if (that._silent)
                state = that._parent.silence();
            that._parent.emit(path + ":" + evt, arg1, arg2, arg3);
            that._parent.emit("*:" + evt, path, arg1, arg2, arg3);
            if (that._silent)
                that._parent.silenceRestore(state);
        };
    };
    // key => object
    Observer.prototype._prepare = function (target, key, value, silent, remote) {
        var self = this;
        var state;
        var path = (target._path ? target._path + "." : "") + key;
        var type = typeof value;
        target._keys.push(key);
        if (type === "object" && value instanceof Array) {
            target._data[key] = value.slice(0); // 复制一份新的数组
            // 子一层数据
            for (var i = 0; i < target._data[key].length; i++) {
                if (typeof target._data[key][i] === "object" && target._data[key][i] !== null) {
                    if (target._data[key][i] instanceof Array) {
                        target._data[key][i].slice(0);
                    }
                    else {
                        // observer? 这里不需要递归吗？
                        target._data[key][i] = new Observer(target._data[key][i], {
                            parent: this,
                            parentPath: path,
                            parentField: target._data[key],
                            parentKey: null
                        });
                    }
                }
                else {
                    state = this.silence();
                    this.emit(path + "." + i + ":set", target._data[key][i], null, remote);
                    this.emit("*:set", path + "." + i, target._data[key][i], null, remote);
                    this.silenceRestore(state);
                }
            }
            if (silent)
                state = this.silence();
            this.emit(path + ":set", target._data[key], null, remote);
            this.emit("*:set", path, target._data[key], null, remote);
            if (silent)
                this.silenceRestore(state);
        }
        else if (type === "object" && value instanceof Object) {
            if (typeof target._data[key] !== "object") {
                target._data[key] = {
                    _path: path,
                    _keys: [],
                    _data: {}
                };
            }
            for (var i in value) {
                if (typeof value[i] === "object") {
                    // 递归
                    this._prepare(target._data[key], i, value[i], true, remote);
                }
                else {
                    state = this.silence();
                    target._data[key]._data[i] = value[i];
                    target._data[key]._keys.push(i);
                    this.emit(path + "." + i + ":set", value[i], null, remote);
                    this.emit("*:set", path + "." + i, value[i], null, remote);
                    this.silenceRestore(state);
                }
            }
            if (silent)
                state = this.silence();
            // passing undefined as valueOld here
            // but we should get the old value to be consistent
            this.emit(path + ":set", value, undefined, remote);
            this.emit("*:set", path, value, undefined, remote);
            if (silent)
                this.silenceRestore(state);
        }
        else {
            if (silent)
                state = this.silence();
            target._data[key] = value;
            this.emit(path + ":set", value, undefined, remote);
            this.emit("*:set", path, value, undefined, remote);
            if (silent)
                this.silenceRestore(state);
        }
        return true;
    };
    Observer.prototype.silence = function () {
        this._silent = true;
        // history hook to prevent array values to be recorded
        var historyState = this.history !== undefined && this.history.enabled !== undefined;
        if (historyState)
            this.history.enabled = false;
        // sync hook to prevent array values to be recorded as array root already did
        var syncState = this.sync !== undefined && this.sync.enabled !== undefined;
        if (syncState)
            this.sync.enabled = false;
        return [historyState, syncState];
    };
    Observer.prototype.silenceRestore = function (state) {
        this._silent = false;
        if (state[0])
            this.history.enabled = true;
        if (state[1])
            this.sync.enabled = true;
    };
    // public has(path: string): boolean {
    //   let keys = path.split(".");
    //   let node = this;
    //   for (let i = 0, len = keys.length; i < len; i++) {
    //     if (node === undefined) return false;
    //     if (node._data) {
    //       node = node._data[keys[i]];
    //     } else {
    //       // node = node[keys[i]];
    //     }
    //   }
    //   return node !== undefined;
    // }
    // public get(path: string, raw?: boolean): Nullable<Observer> {
    //   let keys = path.split('.');
    //   let node = this;
    //   for (let i = 0; i < keys.length; i++) {
    //     if (node === undefined)
    //       return null;
    //     if (node._data) {
    //       node = node._data[keys[i]];
    //     } else {
    //       // node = node[keys[i]];
    //     }
    //   }
    //   if (raw !== undefined && raw)
    //     return node;
    //   if (node === null) {
    //     return null;
    //   } else {
    //     return this.json(node);
    //   }
    // }
    // public move(path: string, indOld: number, indNew: number, silent: boolean, remote: boolean): void {
    //   let keys = path.split('.');
    //   let key = keys[keys.length - 1];
    //   let node = this;
    //   let obj = this;
    //   for (let i = 0; i < keys.length - 1; i++) {
    //     if (node instanceof Array) {
    //       node = node[parseInt(keys[i], 10)];
    //       if (node instanceof Observer) {
    //         path = keys.slice(i + 1).join('.');
    //         obj = node;
    //       }
    //     } else if (node._data && node._data.hasOwnProperty(keys[i])) {
    //       node = node._data[keys[i]];
    //     } else {
    //       return;
    //     }
    //   }
    //   if (!node._data || !node._data.hasOwnProperty(key) || !(node._data[key] instanceof Array))
    //     return;
    //   let arr = node._data[key];
    //   if (arr.length < indOld || arr.length < indNew || indOld === indNew)
    //     return;
    //   let value = arr[indOld];
    //   arr.splice(indOld, 1);
    //   if (indNew === -1)
    //     indNew = arr.length;
    //   arr.splice(indNew, 0, value);
    //   if (!(value instanceof Observer))
    //     value = obj.json(value);
    //   let state: boolean[];
    //   if (silent)
    //     state = obj.silence();
    //   obj.emit(path + ':move', value, indNew, indOld, remote);
    //   obj.emit('*:move', path, value, indNew, indOld, remote);
    //   if (silent)
    //     obj.silenceRestore(state!);
    //   return;
    // };
    // 将json对象复制解析出来
    Observer.prototype.patch = function (data) {
        if (typeof data !== "object") {
            debug.warn(this.className + ': 不是正确的json对象，打印：\n' + data);
            return;
        }
        for (var key in data) {
            if (typeof data[key] === "object" && !this._data.hasOwnProperty(key)) {
                // 对象属性
                debug.log('对象属性：' + key);
                debug.log(data[key]);
                // this._prepare(this, key, data[key]);
            }
            else if (this._data[key] !== data[key]) {
                // 一般属性
                debug.log('一般属性：' + key);
                debug.log(data[key]);
                // this.set(key, data[key]);
            }
        }
    };
    Observer.prototype.set2 = function (path, value, silent, remote, force) {
        var keys = path.split('.');
        var length = keys.length;
        var key = keys[length - 1];
        var node = this;
        var nodePath = '';
        var obj = this;
        var state;
        for (var i = 0; i < length - 1; i++) {
            if (node instanceof Array) {
                // TODO: 这是啥啊？
                // node = node[keys[i]];
                if (node instanceof Observer) {
                    path = keys.slice(i + 1).join('.');
                    obj = node;
                }
            }
            else {
                if (i < length && typeof (node._data[keys[i]]) !== 'object') {
                    if (node._data[keys[i]])
                        obj.unset((node.__path ? node.__path + '.' : '') + keys[i]);
                    node._data[keys[i]] = {
                        _path: path,
                        _keys: [],
                        _data: {}
                    };
                    node._keys.push(keys[i]);
                }
                if (i === length - 1 && node.__path)
                    nodePath = node.__path + '.' + keys[i];
                node = node._data[keys[i]];
            }
        }
    };
    // public json(target?: Observer): Observer {
    //   let obj: { [key: string]: any } = {};
    //   let node = target === undefined ? this : target;
    //   let len, nlen;
    //   if (node instanceof Object && node._keys) {
    //     len = node._keys.length;
    //     for (let i = 0; i < len; i++) {
    //       let key = node._keys[i];
    //       let value = node._data[key];
    //       let type = typeof (value);
    //       if (type === 'object' && (value instanceof Array)) {
    //         obj[key] = value.slice(0);
    //         nlen = obj[key].length;
    //         for (let n = 0; n < nlen; n++) {
    //           if (typeof (obj[key][n]) === 'object')
    //             obj[key][n] = this.json(obj[key][n]);
    //         }
    //       } else if (type === 'object' && (value instanceof Object)) {
    //         obj[key] = this.json(value);
    //       } else {
    //         obj[key] = value;
    //       }
    //     }
    //   } else {
    //     if (node === null) {
    //       return null;
    //     } else if (typeof (node) === 'object' && (node instanceof Array)) {
    //       obj = node.slice(0);
    //       len = obj.length;
    //       for (let n = 0; n < len; n++) {
    //         obj[n] = this.json(obj[n]);
    //       }
    //     } else if (typeof (node) === 'object') {
    //       for (let key in node) {
    //         if (node.hasOwnProperty(key))
    //           obj[key] = node[key];
    //       }
    //     } else {
    //       obj = node;
    //     }
    //   }
    //   return obj;
    // }
    // public forEach(fn: Function, target: Observer, path: string): void {
    //   let node = target || this;
    //   path = path || '';
    //   for (let i = 0; i < node._keys.length; i++) {
    //     let key = node._keys[i];
    //     let value = node._data[key];
    //     let type = (this.schema && this.schema.has(path + key) && this.schema.get(path + key).type.name.toLowerCase()) || typeof (value);
    //     if (type === 'object' && (value instanceof Array)) {
    //       fn(path + key, 'array', value, key);
    //     } else if (type === 'object' && (value instanceof Object)) {
    //       fn(path + key, 'object', value, key);
    //       this.forEach(fn, value, path + key + '.');
    //     } else {
    //       fn(path + key, type, value, key);
    //     }
    //   }
    // };
    Observer.prototype.destroy = function () {
        if (this._destroyed)
            return;
        this._destroyed = true;
        this.emit("destroy");
        this.unbind();
    };
    return Observer;
}(events_1.Events));
exports.Observer = Observer;
},{"./events":52}],56:[function(require,module,exports){
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
// 全局注册debug类
window.debug = new editor_1.Debug();
// 初始化全局信息类
var initialize = new editor_1.InitializeBefore();
// 后期可以修改为load、start等string表示的事件，通过event来实现
// 打开project或者scene，1对多的关系，记录一下默认的scene（上一次打开的scene），一开始就打开默认的scene；
// 当前project的编辑器设置，如摄像机等，各种设置数据；
// assets数据；
// scene的数据，可能会多个，当前scene，不同scene之间还有顺序关系；
// 整体布局
var layout = new editor_1.Layout();
layout.init();
// 编辑视窗
var viewport = new editor_1.Viewport();
engine_1.VeryEngine.viewport = viewport;
// 层级菜单
var hierarchy = new editor_1.Hierarchy();
// 资源菜单
var assets = new editor_1.Assets();
// 初始化全局信息类
var initializeAfter = new editor_1.InitializeAfter();
// 加载资源
// 关联资源
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
},{"./editor":22,"./engine":49,"./index":51}],57:[function(require,module,exports){
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
var Bubble = /** @class */ (function (_super) {
    __extends(Bubble, _super);
    function Bubble(id, tabindex) {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-bubble');
        var pulseCircle = document.createElement('div');
        pulseCircle.classList.add('pulse');
        _this.element.appendChild(pulseCircle);
        var centerCircle = document.createElement('div');
        centerCircle.classList.add('center');
        _this.element.appendChild(centerCircle);
        _this.on('click', _this._onClick);
        if (id !== undefined)
            _this.element.id = id;
        if (tabindex !== undefined)
            _this.element.setAttribute('tabindex', tabindex.toString());
        return _this;
    }
    Bubble.prototype._onClick = function () {
        if (this.class.contains('active')) {
            this.deactivate();
        }
        else {
            this.activate();
        }
    };
    Bubble.prototype.activate = function () {
        this.class.add('active');
        this.emit('activate');
    };
    Bubble.prototype.deactivate = function () {
        this.class.remove('active');
        this.emit('deactivate');
    };
    Bubble.prototype.position = function (x, y) {
        var rect = this.element.getBoundingClientRect();
        var left = x || 0;
        var top = y || 0;
        this.element.style.left = (typeof left === 'number') ? left + 'px' : left;
        this.element.style.top = (typeof top === 'number') ? top + 'px' : top;
    };
    return Bubble;
}(element_1.Element));
exports.Bubble = Bubble;
},{"./element":64}],58:[function(require,module,exports){
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
        // 鼠标抬起时完成keydown，才会触发；
        _this.element.addEventListener('keydown', _this._onKeyDown.bind(_this), false);
        _this.on('click', _this._onClick);
        return _this;
        // this.element.addEventListener('mousedown', this._onClick.bind(this));
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
        // console.log('c');
        if (evt.keyCode === 27) // 27: Escape
            return evt.target.blur();
        if (evt.keyCode !== 32 || this.disabled) // 32: Space
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
},{"./element":64}],59:[function(require,module,exports){
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
},{"./element":64}],60:[function(require,module,exports){
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
var Checkbox = /** @class */ (function (_super) {
    __extends(Checkbox, _super);
    function Checkbox(text) {
        var _this = _super.call(this) || this;
        _this._text = text || '';
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-checkbox', 'noSelect');
        _this.element.tabIndex = 0;
        _this.element.addEventListener('keydown', _this._onKeyDown.bind(_this), false);
        _this.on('click', _this._onClick);
        _this.on('change', _this._onChange);
        return _this;
    }
    Object.defineProperty(Checkbox.prototype, "value", {
        get: function () {
            if (this._link) {
                return this._link.get(this.path);
            }
            else {
                return this.element.classList.contains('checked');
            }
        },
        set: function (val) {
            if (this._link) {
                this._link.set(this.path, val);
            }
            else {
                if (this.element.classList.contains('checked') !== val)
                    this._onLinkChange(val);
            }
        },
        enumerable: true,
        configurable: true
    });
    Checkbox.prototype._onClick = function () {
        this.value = !this.value;
        this.element.blur();
    };
    Checkbox.prototype._onChange = function () {
        if (!this.renderChanges)
            return;
        this.flash();
    };
    Checkbox.prototype._onKeyDown = function (evt) {
        if (evt.keyCode === 27) // Escape
            return evt.target.blur();
        // Space
        if (evt.keyCode !== 32 || this.disabled)
            return;
        evt.stopPropagation();
        evt.preventDefault();
        this.value = !this.value;
    };
    // TODO
    Checkbox.prototype._onLinkChange = function (value) {
        if (value === null) {
            this.element.classList.remove('checked');
            this.element.classList.add('null');
        }
        else if (value) {
            this.element.classList.add('checked');
            this.element.classList.remove('null');
        }
        else {
            this.element.classList.remove('checked', 'null');
        }
        this.emit('change', value);
    };
    return Checkbox;
}(element_1.Element));
exports.Checkbox = Checkbox;
},{"./element":64}],61:[function(require,module,exports){
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
var Code = /** @class */ (function (_super) {
    __extends(Code, _super);
    function Code() {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('pre');
        _this.element.classList.add('ui-code');
        return _this;
    }
    Object.defineProperty(Code.prototype, "text", {
        get: function () {
            return this.element.textContent || '';
        },
        set: function (val) {
            this.element.textContent = val;
        },
        enumerable: true,
        configurable: true
    });
    return Code;
}(container_element_1.ContainerElement));
exports.Code = Code;
},{"./container-element":63}],62:[function(require,module,exports){
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
var ColorField = /** @class */ (function (_super) {
    __extends(ColorField, _super);
    function ColorField() {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('div');
        _this.element.tabIndex = 0;
        _this.element.classList.add('ui-color-field', 'rgb');
        _this.elementColor = document.createElement('span');
        _this.elementColor.classList.add('color');
        _this.element.appendChild(_this.elementColor);
        _this._channels = 3;
        _this._values = [0, 0, 0, 0];
        // space > click
        _this.element.addEventListener('keydown', _this._onKeyDown.bind(_this), false);
        // render color back
        _this.on('change', _this._onChange);
        // link to channels
        _this.evtLinkChannels = [];
        _this.on('link', _this._onLink);
        _this.on('unlink', _this._onUnlink);
        return _this;
    }
    Object.defineProperty(ColorField.prototype, "channels", {
        get: function () {
            return this._channels;
        },
        set: function (val) {
            if (this._channels === val)
                return;
            this._channels = val;
            this.emit('channels', this._channels);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ColorField.prototype, "r", {
        get: function () {
            if (this._link) {
                return Math.floor(this._link.get(this.path + '.0') * 255);
            }
            else {
                return this._values[0];
            }
        },
        set: function (val) {
            val = Math.min(0, Math.max(255, val));
            if (this._values[0] === val)
                return;
            this._values[0] = val;
            this.emit('r', this._values[0]);
            this.emit('change', this._values.slice(0, this._channels));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ColorField.prototype, "g", {
        get: function () {
            if (this._link) {
                return Math.floor(this._link.get(this.path + '.1') * 255);
            }
            else {
                return this._values[1];
            }
        },
        set: function (val) {
            val = Math.min(0, Math.max(255, val));
            if (this._values[1] === val)
                return;
            this._values[1] = val;
            if (this._channels >= 2) {
                this.emit('g', this._values[1]);
                this.emit('change', this._values.slice(0, this._channels));
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ColorField.prototype, "b", {
        get: function () {
            if (this._link) {
                return Math.floor(this._link.get(this.path + '.2') * 255);
            }
            else {
                return this._values[2];
            }
        },
        set: function (val) {
            val = Math.min(0, Math.max(255, val));
            if (this._values[2] === val)
                return;
            this._values[2] = val;
            if (this._channels >= 3) {
                this.emit('b', this._values[2]);
                this.emit('change', this._values.slice(0, this._channels));
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ColorField.prototype, "a", {
        get: function () {
            if (this._link) {
                return Math.floor(this._link.get(this.path + '.3') * 255);
            }
            else {
                return this._values[3];
            }
        },
        set: function (val) {
            val = Math.min(0, Math.max(255, val));
            if (this._values[3] === val)
                return;
            this._values[3] = val;
            if (this._channels >= 4) {
                this.emit('a', this._values[3]);
                this.emit('change', this._values.slice(0, this._channels));
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ColorField.prototype, "hex", {
        get: function () {
            var values = this._values;
            if (this._link) {
                values = this._link.get(this.path).map(function (channel) {
                    return Math.floor(channel * 255);
                });
            }
            var hex = '';
            for (var i = 0; i < this._channels; i++) {
                hex += ('00' + values[i].toString(16)).slice(-2);
            }
            return hex;
        },
        set: function (val) {
            console.log('todo color-field: ' + val);
        },
        enumerable: true,
        configurable: true
    });
    ColorField.prototype._onKeyDown = function (evt) {
        if (evt.keyCode === 27) // ESC按键
            return this.element.blur();
        if (evt.keyCode !== 13 || this.disabled) // Enter回车键
            return;
        evt.stopPropagation();
        evt.preventDefault();
        this.emit('click');
    };
    ;
    ColorField.prototype._onChange = function (color) {
        if (this._channels === 1) {
            this.elementColor.style.backgroundColor = 'rgb(' + [this.r, this.r, this.r].join(',') + ')';
        }
        else if (this._channels === 3) {
            this.elementColor.style.backgroundColor = 'rgb(' + this._values.slice(0, 3).join(',') + ')';
        }
        else if (this._channels === 4) {
            var rgba = this._values.slice(0, 4);
            rgba[3] /= 255;
            this.elementColor.style.backgroundColor = 'rgba(' + rgba.join(',') + ')';
        }
        else {
            console.log('unknown channels', color);
        }
    };
    ;
    ColorField.prototype._onLink = function () {
        var that = this;
        for (var i = 0; i < 4; i++) {
            this.evtLinkChannels[i] = this._link.on(this.path + '.' + i + ':set', function (value) {
                that._setValue(that._link.get(that.path));
            }.bind(that));
        }
    };
    ;
    ColorField.prototype._onUnlink = function () {
        for (var i = 0; i < this.evtLinkChannels.length; i++)
            this.evtLinkChannels[i].unbind();
        this.evtLinkChannels = [];
    };
    ;
    ColorField.prototype._onLinkChange = function (value) {
        if (!value)
            return;
        this._setValue(value);
    };
    ;
    ColorField.prototype._setValue = function (value) {
        var changed = false;
        if (!value)
            return;
        if (value.length !== this._channels) {
            changed = true;
            this.channels = value.length;
        }
        for (var i = 0; i < this._channels; i++) {
            if (this._values[i] === Math.floor(value[i]))
                continue;
            changed = true;
            this._values[i] = Math.floor(value[i]);
        }
        if (changed)
            this.emit('change', this._values.slice(0, this._channels));
    };
    ;
    return ColorField;
}(element_1.Element));
exports.ColorField = ColorField;
},{"./element":64}],63:[function(require,module,exports){
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
        console.log('clear');
        var node;
        this._observer.disconnect();
        // console.log(this._innerElement);
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
},{"./element":64}],64:[function(require,module,exports){
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
        // public get selected(): boolean {
        //   return this.class!.contains('selected');
        // }
        // HTMLElement 
        _this._element = null;
        // this._element!.addEventListener('click', )
        _this._parent = null;
        return _this;
        // let self = this;
        // this._parentDestroy = function () {
        //   self.destroy();
        // };
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
},{"../lib":53}],65:[function(require,module,exports){
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
var GridItem = /** @class */ (function (_super) {
    __extends(GridItem, _super);
    function GridItem(args) {
        var _this = _super.call(this) || this;
        args = args || {};
        _this._text = args.text || '';
        _this._selectPending = false;
        _this._selected = args.selected || false;
        _this._toggleSelectOnClick = args && args.toggleSelectOnClick !== undefined ? args.toggleSelectOnClick : true;
        _this._clicked = false;
        _this.element = document.createElement('li');
        _this.element.ui = _this;
        _this.element.tabIndex = 0;
        _this.element.classList.add('ui-grid-item');
        _this.element.innerHTML = _this._text;
        // this.element.removeEventListener('click', this._evtClick);
        _this.element.addEventListener('click', _this._onClick.bind(_this), false);
        _this.on('select', _this._onSelect);
        _this.on('deselect', _this._onDeselect);
        return _this;
    }
    Object.defineProperty(GridItem.prototype, "text", {
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
    Object.defineProperty(GridItem.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        set: function (val) {
            if (this._selected === val)
                return;
            this._selectPending = val;
            if (this.parent && this._clicked)
                this.parent.emit('before' + (val ? 'Select' : 'Deselect'), this, this._clicked);
            if (this._selected === this._selectPending)
                return;
            this._selected = this._selectPending;
            if (this._selected) {
                this.element.classList.add('selected');
            }
            else {
                this.element.classList.remove('selected');
            }
            this.emit(this.selected ? 'select' : 'deselect');
            this.emit('change', this.selected);
            if (this.parent)
                this.parent.emit(this.selected ? 'select' : 'deselect', this, this._clicked);
        },
        enumerable: true,
        configurable: true
    });
    GridItem.prototype._onClick = function () {
        this.emit('click');
        this._clicked = true;
        if (this._toggleSelectOnClick) {
            this.selected = !this.selected;
        }
        else {
            this.selected = true;
        }
        this._clicked = false;
    };
    ;
    GridItem.prototype._onSelect = function () {
        this.element.focus();
    };
    ;
    GridItem.prototype._onDeselect = function () {
        this.element.blur();
    };
    ;
    return GridItem;
}(element_1.Element));
exports.GridItem = GridItem;
var GridItemArgs = /** @class */ (function () {
    function GridItemArgs() {
    }
    return GridItemArgs;
}());
exports.GridItemArgs = GridItemArgs;
},{"./element":64}],66:[function(require,module,exports){
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
var editor_1 = require("../editor");
var Grid = /** @class */ (function (_super) {
    __extends(Grid, _super);
    function Grid(multiSelect) {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('ul');
        _this.element.tabIndex = 0;
        _this.element.classList.add('ui-grid');
        _this._lastSelect = null;
        _this._selecting = false;
        _this._multiSelect = multiSelect !== undefined ? multiSelect : true;
        _this.on('select', _this._onSelect);
        _this.on('beforeDeselect', _this._onBeforeDeselect);
        _this.on('append', _this._onAppend);
        _this.on('remove', _this._onRemove);
        return _this;
    }
    Object.defineProperty(Grid.prototype, "selected", {
        get: function () {
            var items = [];
            var elements = this.element.querySelectorAll('.ui-grid-item.selected');
            for (var i = 0; i < elements.length; i++)
                items.push((elements[i].ui));
            return items;
        },
        enumerable: true,
        configurable: true
    });
    Grid._ctrl = function () {
        return editor_1.Hotkeys.ctrl;
    };
    Grid._shift = function () {
        return editor_1.Hotkeys.shift;
    };
    Grid.prototype._onAppend = function () {
    };
    Grid.prototype._onRemove = function () {
    };
    Grid.prototype._onSelect = function (item) {
        if (this._selecting)
            return;
        if (this._multiSelect && Grid._shift && Grid._shift()) {
            var children = Array.prototype.slice.call(this.element.childNodes, 0);
            // multi select from-to
            if (this._lastSelect) {
                this._selecting = true;
                var startInd = children.indexOf(this._lastSelect.element);
                var endInd = children.indexOf(item.element);
                // swap if backwards
                if (startInd > endInd) {
                    var t = startInd;
                    startInd = endInd;
                    endInd = t;
                }
                for (var i = startInd; i < endInd; i++) {
                    if (!children[i] || !children[i].ui || children[i].ui.hidden)
                        continue;
                    children[i].ui.selected = true;
                }
                this._selecting = false;
            }
            else {
                this._lastSelect = item;
            }
        }
        else if (this._multiSelect && Grid._ctrl && Grid._ctrl()) {
            // multi select
            this._lastSelect = item;
        }
        else {
            // single select
            var items = this.element.querySelectorAll('.ui-grid-item.selected');
            if (items.length > 1) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].ui === item)
                        continue;
                    items[i].ui.selected = false;
                }
            }
            this._lastSelect = item;
        }
    };
    ;
    Grid.prototype._onBeforeDeselect = function (item) {
        if (this._selecting)
            return;
        this._selecting = true;
        if (this._multiSelect && Grid._shift && Grid._shift()) {
            this._lastSelect = null;
        }
        else if (this._multiSelect && Grid._ctrl && Grid._ctrl()) {
            this._lastSelect = null;
        }
        else {
            var items = this.element.querySelectorAll('.ui-grid-item.selected');
            if (items.length > 1) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].ui === item)
                        continue;
                    items[i].ui.selected = false;
                }
                item._selectPending = true;
                this._lastSelect = item;
            }
        }
        this._selecting = false;
    };
    ;
    Grid.prototype.filter = function (fn) {
        this.forEach(function (item) {
            item.hidden = !fn(item);
        });
    };
    ;
    Grid.prototype.forEach = function (fn) {
        var child = this.element.firstChild;
        while (child) {
            if (child.ui)
                fn(child.ui);
            child = child.nextSibling;
        }
        ;
    };
    ;
    return Grid;
}(container_element_1.ContainerElement));
exports.Grid = Grid;
},{"../editor":22,"./container-element":63}],67:[function(require,module,exports){
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
var ImageField = /** @class */ (function (_super) {
    __extends(ImageField, _super);
    function ImageField(canvas) {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-image-field', 'empty');
        if (canvas) {
            _this.elementImage = document.createElement('canvas');
            _this.elementImage.width = 64;
            _this.elementImage.height = 64;
        }
        else {
            _this.elementImage = new Image();
        }
        _this.elementImage.classList.add('preview');
        _this.element.appendChild(_this.elementImage);
        _this._value = null;
        // this.element.removeEventListener('click', this._evtClick);
        _this.element.addEventListener('click', _this._onClick.bind(_this), false);
        _this.on('change', _this._onChange.bind(_this));
        // space > click
        _this.element.addEventListener('keydown', _this._onKeyDown.bind(_this), false);
        return _this;
    }
    Object.defineProperty(ImageField.prototype, "image", {
        get: function () {
            if (this.elementImage instanceof HTMLCanvasElement) {
                return '';
            }
            else {
                return this.elementImage.src;
            }
        },
        set: function (val) {
            if (this.elementImage instanceof HTMLImageElement) {
                this.elementImage.src = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageField.prototype, "empty", {
        get: function () {
            return this.class.contains('empty');
        },
        set: function (val) {
            if (this.class.contains('empty') === !!val)
                return;
            if (val) {
                this.class.add('empty');
                this.image = '';
            }
            else {
                this.class.remove('empty');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageField.prototype, "value", {
        get: function () {
            if (this._link) {
                return this._link.get(this.path);
            }
            else {
                return this._value;
            }
        },
        set: function (val) {
            val = val && parseInt(val) || null;
            if (this._link) {
                if (!this._link.set(this.path, val))
                    this._value = this._link.get(this.path);
            }
            else {
                if (this._value === val && !this.class.contains('null'))
                    return;
                this._value = val;
                this.emit('change', val);
            }
        },
        enumerable: true,
        configurable: true
    });
    ImageField.prototype._onClick = function (evt) {
        this.emit('click', evt);
    };
    ;
    ImageField.prototype._onChange = function () {
        if (!this.renderChanges)
            return;
        this.flash();
    };
    ;
    ImageField.prototype._onKeyDown = function (evt) {
        if (evt.keyCode === 27)
            return this.element.blur();
        if (evt.keyCode !== 32 || this.disabled)
            return;
        evt.stopPropagation();
        evt.preventDefault();
        this.emit('pick');
    };
    ;
    ImageField.prototype._onLinkChange = function (value) {
        this._value = value;
        this.emit('change', value);
    };
    ;
    return ImageField;
}(element_1.Element));
exports.ImageField = ImageField;
},{"./element":64}],68:[function(require,module,exports){
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
__export(require("./textarea-field"));
__export(require("./tree"));
__export(require("./tree-item"));
__export(require("./list"));
__export(require("./list-item"));
__export(require("./checkbox"));
__export(require("./bubble"));
__export(require("./overlay"));
__export(require("./tooltip"));
__export(require("./progress"));
__export(require("./menu-item"));
__export(require("./menu"));
__export(require("./code"));
__export(require("./color-field"));
__export(require("./grid-item"));
__export(require("./grid"));
__export(require("./image-field"));
__export(require("./number-field"));
__export(require("./slider"));
__export(require("./select-field"));
},{"./bubble":57,"./button":58,"./canvas":59,"./checkbox":60,"./code":61,"./color-field":62,"./container-element":63,"./element":64,"./grid":66,"./grid-item":65,"./image-field":67,"./label":69,"./link":70,"./list":72,"./list-item":71,"./menu":74,"./menu-item":73,"./number-field":75,"./overlay":76,"./panel":77,"./progress":78,"./select-field":79,"./slider":80,"./text-field":81,"./textarea-field":82,"./tooltip":83,"./tree":85,"./tree-item":84}],69:[function(require,module,exports){
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
},{"./element":64}],70:[function(require,module,exports){
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
        return true;
    };
    Link.prototype.on = function (name, fn) {
        return this._element.on(name, fn);
    };
    return Link;
}());
exports.Link = Link;
var LinkSchema = /** @class */ (function () {
    function LinkSchema() {
    }
    LinkSchema.prototype.has = function (path) {
        return true;
    };
    LinkSchema.prototype.get = function (path) {
        return true;
    };
    return LinkSchema;
}());
exports.LinkSchema = LinkSchema;
},{}],71:[function(require,module,exports){
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
var ListItem = /** @class */ (function (_super) {
    __extends(ListItem, _super);
    function ListItem(text, selected, allowDeselect) {
        var _this = _super.call(this) || this;
        _this._text = text || '';
        _this._selected = selected || false;
        _this._allowDeselect = allowDeselect || false;
        _this.element = document.createElement('li');
        _this.element.classList.add('ui-list-item');
        _this.elementText = document.createElement('span');
        _this.elementText.textContent = _this._text;
        _this.element.appendChild(_this.elementText);
        _this.on('click', _this._onClick);
        return _this;
    }
    Object.defineProperty(ListItem.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (val) {
            if (this._text === val)
                return;
            this._text = val;
            this.elementText.textContent = this._text;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListItem.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        set: function (val) {
            if (this._selected === val)
                return;
            this._selected = val;
            if (this._selected) {
                this.element.classList.add('selected');
            }
            else {
                this.element.classList.remove('selected');
            }
            this.emit(this.selected ? 'select' : 'deselect');
            if (this.parent)
                this.parent.emit(this.selected ? 'select' : 'deselect', this);
            this.emit('change', this.selected);
        },
        enumerable: true,
        configurable: true
    });
    ListItem.prototype._onClick = function () {
        if (!this.selected) {
            this.selected = true;
        }
        else if (this._allowDeselect) {
            this.selected = false;
        }
    };
    return ListItem;
}(element_1.Element));
exports.ListItem = ListItem;
},{"./element":64}],72:[function(require,module,exports){
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
var editor_1 = require("../editor");
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List(selectable) {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('ul');
        _this.element.classList.add('ui-list');
        _this._selectable = selectable || true;
        _this._changing = false;
        _this._selected = [];
        _this.on('select', _this._onSelect);
        _this.on('deselect', _this._onDeselect);
        _this.on('append', _this._onAppend);
        return _this;
    }
    Object.defineProperty(List.prototype, "selectable", {
        get: function () {
            return this._selectable;
        },
        set: function (val) {
            if (this._selectable === !!val)
                return;
            this._selectable = val;
            if (this._selectable) {
                this.class.add('selectable');
            }
            else {
                this.class.remove('selectable');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(List.prototype, "selected", {
        get: function () {
            return this._selected.slice(0);
        },
        set: function (val) {
            this._changing = true;
            // deselecting
            var items = this.selected;
            for (var i = 0; i < items.length; i++) {
                if (val.indexOf(items[i]) !== -1)
                    continue;
                items[i].selected = false;
            }
            // selecting
            for (var i = 0; i < val.length; i++) {
                val[i].selected = true;
            }
            this._changing = false;
        },
        enumerable: true,
        configurable: true
    });
    List.prototype._onSelect = function (item) {
        var ind = this._selected.indexOf(item);
        if (ind === -1)
            this._selected.push(item);
        if (this._changing)
            return;
        if (List._ctrl && List._ctrl()) {
        }
        else if (List._shift && List._shift() && this.selected.length) {
        }
        else {
            this._changing = true;
            var items = this.selected;
            if (items.length > 1) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i] === item)
                        continue;
                    items[i].selected = false;
                }
            }
            this._changing = false;
        }
        this.emit('change');
    };
    List.prototype._onDeselect = function (item) {
        var ind = this._selected.indexOf(item);
        if (ind !== -1)
            this._selected.splice(ind, 1);
        if (this._changing)
            return;
        if (List._ctrl && List._ctrl()) {
        }
        else {
            this._changing = true;
            var items = this.selected;
            if (items.length) {
                for (var i = 0; i < items.length; i++)
                    items[i].selected = false;
                item.selected = true;
            }
            this._changing = false;
        }
        this.emit('change');
    };
    List.prototype._onAppend = function (item) {
        if (!item.selected)
            return;
        var ind = this._selected.indexOf(item);
        if (ind === -1)
            this._selected.push(item);
    };
    List.prototype.clear = function () {
        this._selected = [];
        container_element_1.ContainerElement.prototype.clear.call(this);
    };
    List._ctrl = function () {
        return editor_1.Hotkeys.ctrl;
    };
    List._shift = function () {
        return editor_1.Hotkeys.shift;
    };
    return List;
}(container_element_1.ContainerElement));
exports.List = List;
},{"../editor":22,"./container-element":63}],73:[function(require,module,exports){
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
var MenuItem = /** @class */ (function (_super) {
    __extends(MenuItem, _super);
    function MenuItem(args) {
        var _this = _super.call(this) || this;
        _this._clickableSubmenus = false;
        _this._index = {};
        args = args || {};
        _this._value = args.value || '';
        _this._hasChildren = args.hasChildren || false;
        _this._clickableSubmenus = args.clickableSubmenus || false;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-menu-item');
        if (args.className) {
            _this.element.classList.add(args.className);
        }
        _this.elementTitle = document.createElement('div');
        _this.elementTitle.classList.add('title');
        _this.elementTitle.ui = _this;
        _this.element.appendChild(_this.elementTitle);
        _this.elementIcon = null;
        _this.elementText = document.createElement('span');
        _this.elementText.classList.add('text');
        _this.elementText.textContent = args.text || 'Untitled';
        _this.elementTitle.appendChild(_this.elementText);
        _this.innerElement = document.createElement('div');
        _this.innerElement.classList.add('content');
        _this.element.appendChild(_this.innerElement);
        _this._index = {};
        _this._container = false;
        _this.elementTitle.addEventListener('mouseenter', _this._onMouseEnter.bind(_this), false);
        _this.elementTitle.addEventListener('touchstart', _this._onTouchStart, false);
        _this.elementTitle.addEventListener('touchend', _this._onTouchEnd, false);
        _this.elementTitle.addEventListener('click', _this._onClick.bind(_this), false);
        _this.on('over', _this._onOver.bind(_this));
        _this.on('select-propagate', _this._onSelectPropagate.bind(_this));
        _this.on('append', _this._onAppend.bind(_this));
        if (args.icon)
            _this.icon = args.icon;
        return _this;
    }
    Object.defineProperty(MenuItem.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (val) {
            if (this._value === val)
                return;
            var valueOld = this._value;
            this._value = val;
            this.emit('value', val, valueOld);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MenuItem.prototype, "text", {
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
    Object.defineProperty(MenuItem.prototype, "icon", {
        get: function () {
            if (this.elementIcon !== null) {
                return this.elementIcon.textContent || '';
            }
            else {
                return '';
            }
        },
        set: function (val) {
            if ((!val && !this.elementIcon) || (this.elementIcon && this.elementIcon.textContent === val))
                return;
            if (!val) {
                if (this.elementIcon && this.elementIcon.parentNode)
                    this.elementIcon.parentNode.removeChild(this.elementIcon);
                this.elementIcon = null;
            }
            else {
                if (!this.elementIcon) {
                    this.elementIcon = document.createElement('span');
                    this.elementIcon.classList.add('icon');
                    this.elementTitle.insertBefore(this.elementIcon, this.elementText);
                }
                this.elementIcon.innerHTML = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    MenuItem.prototype._onMouseEnter = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var htmlEle = evt.target;
        (htmlEle.ui).parent.emit('over', [this._value]);
    };
    MenuItem.prototype._onTouchStart = function (evt) {
        var item = evt.target.ui;
        if (!item.parent || item.disabled)
            return;
        if (!item._container || item.class.contains('hover')) {
            item.emit('select', item._value, item._hasChildren);
            item.parent.emit('select-propagate', [item._value], item._hasChildren);
            item.class.remove('hover');
        }
        else {
            item.parent.emit('over', [item._value]);
        }
    };
    MenuItem.prototype._onTouchEnd = function (evt) {
        var item = evt.target.ui;
        if (!item.parent || item.disabled)
            return;
        evt.preventDefault();
        evt.stopPropagation();
    };
    MenuItem.prototype._onClick = function () {
        if (!this.parent || this.disabled)
            return;
        this.emit('select', this._value, this._hasChildren);
        this.parent.emit('select-propagate', [this._value], this._hasChildren);
        if (!this._clickableSubmenus || !this._hasChildren) {
            this.class.remove('hover');
        }
    };
    MenuItem.prototype._onOver = function (path) {
        if (!this.parent)
            return;
        path.splice(0, 0, this._value);
        this.parent.emit('over', path);
    };
    MenuItem.prototype._onSelectPropagate = function (path, selectedItemHasChildren) {
        if (!this.parent)
            return;
        path.splice(0, 0, this._value);
        this.parent.emit('select-propagate', path, selectedItemHasChildren);
        if (!this._clickableSubmenus || !selectedItemHasChildren) {
            this.class.remove('hover');
        }
    };
    MenuItem.prototype._onAppend = function (item) {
        var self = this;
        this._container = true;
        this.class.add('container');
        this._index[item.value] = item;
        item.on('value', function (value, valueOld) {
            delete self._index[valueOld];
            self._index[value] = item;
        });
        item.once('destroy', function () {
            delete self._index[item.value];
        });
    };
    return MenuItem;
}(container_element_1.ContainerElement));
exports.MenuItem = MenuItem;
},{"./container-element":63}],74:[function(require,module,exports){
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
var menu_item_1 = require("./menu-item");
var Menu = /** @class */ (function (_super) {
    __extends(Menu, _super);
    function Menu(args) {
        var _this = _super.call(this) || this;
        _this._clickableSubmenus = false;
        _this._hovered = [];
        _this._index = {};
        args = args || {};
        _this.element = document.createElement('div');
        _this.element.tabIndex = 1;
        _this.element.classList.add('ui-menu');
        _this.element.addEventListener('keydown', _this._onKeyDown.bind(_this), false);
        _this.elementOverlay = document.createElement('div');
        _this.elementOverlay.ui = _this;
        _this.elementOverlay.classList.add('overlay');
        _this.elementOverlay.addEventListener('click', _this._onClick.bind(_this), false);
        _this.elementOverlay.addEventListener('contextmenu', _this._onContextMenu.bind(_this), false);
        _this.element.appendChild(_this.elementOverlay);
        _this.innerElement = document.createElement('div');
        _this.innerElement.classList.add('inner');
        _this.elementOverlay.appendChild(_this.innerElement);
        // this._index = { };
        // this._hovered = [ ];
        _this._clickableSubmenus = args.clickableSubmenus;
        _this.on('select-propagate', _this._onSelectPropagate.bind(_this));
        _this.on('append', _this._onAppend.bind(_this));
        _this.on('over', _this._onOver.bind(_this));
        _this.on('open', _this._onOpen.bind(_this));
        return _this;
    }
    Object.defineProperty(Menu.prototype, "open", {
        get: function () {
            return this.class.contains('open');
        },
        set: function (val) {
            if (this.class.contains('open') === !!val)
                return;
            if (val) {
                this.class.add('open');
                this.element.focus();
            }
            else {
                this.class.remove('open');
            }
            this.emit('open', !!val);
        },
        enumerable: true,
        configurable: true
    });
    Menu.prototype._onClick = function () {
        this.open = false;
    };
    Menu.prototype._onContextMenu = function () {
        this.open = false;
    };
    Menu.prototype._onKeyDown = function (evt) {
        if (this.open && evt.keyCode === 27)
            this.open = false;
    };
    Menu.prototype._onAppend = function (item) {
        var self = this;
        this._index[item.value] = item;
        item.on('value', function (value, valueOld) {
            delete self._index[valueOld];
            self._index[value] = item;
        });
        item.once('destroy', function () {
            delete self._index[item.value];
        });
    };
    Menu.prototype._onOver = function (path) {
        this._updatePath(path);
    };
    Menu.prototype._onOpen = function (state) {
        if (state)
            return;
        this._updatePath([]);
    };
    Menu.prototype._onSelectPropagate = function (path, selectedItemHasChildren) {
        if (this._clickableSubmenus && selectedItemHasChildren) {
            this._updatePath(path);
        }
        else {
            this.open = false;
            this.emit(path.join('.') + ':select', path);
            this.emit('select', path);
        }
    };
    Menu.prototype.findByPath = function (path) {
        if (!(path instanceof Array))
            path = path.split('.');
        var item = null;
        for (var i = 0; i < path.length; i++) {
            if (i === 0) {
                item = this._index[path[i]];
            }
            else {
                item = item._index[path[i]];
            }
            if (!item)
                return null;
        }
        return item;
    };
    Menu.prototype._updatePath = function (path) {
        var node;
        // 把之前hover的取消
        for (var i = 0; i < this._hovered.length; i++) {
            node = this._hovered[i];
            if (!node)
                continue;
            // if (path.length <= i || path[i] !== this._hovered[i]) {
            node.class.remove('hover');
            node.innerElement.style.top = '';
            node.innerElement.style.left = '';
            node.innerElement.style.right = '';
            // }
        }
        this._hovered = [];
        // node = this;
        for (var i = 0; i < path.length; i++) {
            node = this.findByPath(path.slice(0, i + 1));
            if (!node)
                continue;
            this._hovered.push(node);
            node.class.add('hover');
            node.innerElement.style.top = '';
            node.innerElement.style.left = '';
            node.innerElement.style.right = '';
            var rect = node.innerElement.getBoundingClientRect();
            // limit to bottom / top of screen
            if (rect.bottom > window.innerHeight) {
                node.innerElement.style.top = -(rect.bottom - window.innerHeight) + 'px';
            }
            if (rect.right > window.innerWidth) {
                node.innerElement.style.left = 'auto';
                // TODO
                node.innerElement.style.right = (node.parent.element.clientWidth) + 'px';
            }
        }
    };
    Menu.prototype.position = function (x, y) {
        this.element.style.display = 'block';
        this.innerElement.style.width = '158px';
        var rect = this.innerElement.getBoundingClientRect();
        var left = (x || 0);
        var top = (y || 0);
        // limit to bottom / top of screen
        if (top + rect.height > window.innerHeight) {
            top = window.innerHeight - rect.height;
        }
        else if (top < 0) {
            top = 0;
        }
        if (left + rect.width > window.innerWidth) {
            left = window.innerWidth - rect.width;
        }
        else if (left < 0) {
            left = 0;
        }
        this.innerElement.style.left = left + 'px';
        this.innerElement.style.top = top + 'px';
        this.element.style.display = '';
    };
    Menu.prototype.createItem = function (key, data) {
        var item = new menu_item_1.MenuItem({
            text: data.title || key,
            className: data.className || null,
            value: key,
            icon: data.icon,
            hasChildren: !!(data.items && Object.keys(data.items).length > 0),
            clickableSubmenus: this._clickableSubmenus
        });
        if (data.select) {
            item.on('select', data.select);
        }
        if (data.filter) {
            this.on('open', function () {
                item.enabled = data.filter();
            });
        }
        if (data.hide) {
            this.on('open', function () {
                item.hidden = data.hide();
            });
        }
        return item;
    };
    Menu.fromData = function (data, args) {
        var menu = new Menu(args);
        var listItems = function (data, parent) {
            for (var key in data) {
                var item = menu.createItem(key, data[key]);
                parent.append(item);
                // console.warn(item.parent);
                if (data[key].items)
                    listItems(data[key].items, item);
            }
        };
        listItems(data, menu);
        return menu;
    };
    return Menu;
}(container_element_1.ContainerElement));
exports.Menu = Menu;
},{"./container-element":63,"./menu-item":73}],75:[function(require,module,exports){
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
var NumberField = /** @class */ (function (_super) {
    __extends(NumberField, _super);
    function NumberField(args) {
        var _this = _super.call(this) || this;
        _this._lastValue = -1;
        args = args || {};
        _this.precision = (args.precision !== undefined) ? args.precision : null;
        _this.step = (args.step != undefined) ? args.step : ((args.precision != null) ? 1 / Math.pow(10, args.precision) : 1);
        _this.max = (args.max !== undefined) ? args.max : null;
        _this.min = (args.min !== undefined) ? args.min : null;
        _this.allowNull = !!args.allowNull;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-number-field');
        _this.elementInput = document.createElement('input');
        _this.elementInput.ui = _this;
        _this.elementInput.tabIndex = 0;
        _this.elementInput.classList.add('field');
        _this.elementInput.type = 'text';
        _this.elementInput.addEventListener('focus', _this._onInputFocus.bind(_this), false);
        _this.elementInput.addEventListener('blur', _this._onInputBlur.bind(_this), false);
        _this.elementInput.addEventListener('keydown', _this._onKeyDown.bind(_this), false);
        _this.elementInput.addEventListener('dblclick', _this._onFullSelect.bind(_this), false);
        _this.elementInput.addEventListener('contextmenu', _this._onFullSelect.bind(_this), false);
        _this.element.appendChild(_this.elementInput);
        if (args.default !== undefined)
            _this.value = args.default;
        _this.elementInput.addEventListener('change', _this._onChange.bind(_this), false);
        // this._element.addEventListener('mousedown', this._onMouseDown.bind(this), false);
        // this._element.addEventListener('mousewheel', this._onMouseDown.bind(this), false);
        _this.blurOnEnter = true;
        _this.refocusable = true;
        _this._lastValue = _this.value;
        // this._mouseMove = null;
        _this._dragging = false;
        _this._dragDiff = 0;
        _this._dragStart = 0;
        _this.on('disable', _this._onDisable);
        _this.on('enable', _this._onEnable);
        _this.on('change', _this._onChangeField);
        if (args.placeholder)
            _this.placeholder = args.placeholder;
        return _this;
    }
    Object.defineProperty(NumberField.prototype, "value", {
        get: function () {
            if (this._link) {
                return this._link.get(this.path);
            }
            else {
                return this.elementInput.value !== '' ? parseFloat(this.elementInput.value) : -1;
            }
        },
        set: function (val) {
            if (this._link) {
                if (!this._link.set(this.path, val)) {
                    this.elementInput.value = this._link.get(this.path);
                }
            }
            else {
                if (val !== null) {
                    if (this.max !== null && this.max < val)
                        val = this.max;
                    if (this.min !== null && this.min > val)
                        val = this.min;
                }
                val = (val !== null && val !== undefined && (this.precision !== null) ? parseFloat(val.toFixed(this.precision)) : val);
                if (val === undefined)
                    val = -1;
                var different = this._lastValue !== val;
                this._lastValue = val;
                this.elementInput.value = val.toString();
                if (different) {
                    this.emit('change', val);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NumberField.prototype, "placeholder", {
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
    Object.defineProperty(NumberField.prototype, "proxy", {
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
    NumberField.prototype._onLinkChange = function (value) {
        this.elementInput.value = value || '0';
        this.emit('change', value || '0');
    };
    ;
    NumberField.prototype._onChange = function () {
        var value = parseFloat(this.elementInput.value);
        if (isNaN(value)) {
            if (this.allowNull) {
                this.value = -1;
            }
            else {
                this.elementInput.value = '0';
                this.value = 0;
            }
        }
        else {
            // this.elementInput.value = value;
            this.value = value;
        }
    };
    ;
    NumberField.prototype.focus = function (select) {
        this.elementInput.focus();
        if (select)
            this.elementInput.select();
    };
    ;
    NumberField.prototype._onInputFocus = function () {
        this.class.add('focus');
    };
    ;
    NumberField.prototype._onInputBlur = function () {
        this.class.remove('focus');
    };
    ;
    NumberField.prototype._onKeyDown = function (evt) {
        if (evt.keyCode === 27)
            return this.elementInput.blur();
        if (this.blurOnEnter && evt.keyCode === 13) {
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
                this.elementInput.blur();
            return;
        }
        if (this.disabled || [38, 40].indexOf(evt.keyCode) === -1)
            return;
        var inc = evt.keyCode === 40 ? -1 : 1;
        if (evt.shiftKey)
            inc *= 10;
        var value = this.value + (this.step || 1) * inc;
        if (this.max != null)
            value = Math.min(this.max, value);
        if (this.min != null)
            value = Math.max(this.min, value);
        if (this.precision != null)
            value = parseFloat(value.toFixed(this.precision));
        this.value = value;
        // this.ui.value = value;
    };
    ;
    NumberField.prototype._onFullSelect = function () {
        this.elementInput.select();
    };
    ;
    NumberField.prototype._onDisable = function () {
        this.elementInput.readOnly = true;
    };
    ;
    NumberField.prototype._onEnable = function () {
        this.elementInput.readOnly = false;
    };
    ;
    NumberField.prototype._onChangeField = function () {
        if (!this.renderChanges)
            return;
        this.flash();
    };
    ;
    return NumberField;
}(element_1.Element));
exports.NumberField = NumberField;
},{"./element":64}],76:[function(require,module,exports){
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
var Overlay = /** @class */ (function (_super) {
    __extends(Overlay, _super);
    function Overlay() {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-overlay', 'center');
        _this.elementOverlay = document.createElement('div');
        _this.elementOverlay.ui = _this;
        _this.elementOverlay.classList.add('overlay', 'clickable');
        _this.element.appendChild(_this.elementOverlay);
        _this.elementOverlay.addEventListener('mousedown', _this._onMouseDown.bind(_this), false);
        _this.innerElement = document.createElement('div');
        _this.innerElement.classList.add('content');
        _this.element.appendChild(_this.innerElement);
        return _this;
    }
    Object.defineProperty(Overlay.prototype, "clickable", {
        get: function () {
            return this.elementOverlay.classList.contains('clickable');
        },
        set: function (val) {
            if (val) {
                this.elementOverlay.classList.add('clickable');
            }
            else {
                this.elementOverlay.classList.remove('clickable');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Overlay.prototype, "rect", {
        get: function () {
            return this.innerElement.getBoundingClientRect();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Overlay.prototype, "center", {
        get: function () {
            return this.element.classList.contains('center');
        },
        set: function (val) {
            if (val) {
                this.element.classList.add('center');
                this.innerElement.style.left = '';
                this.innerElement.style.top = '';
            }
            else {
                this.element.classList.remove('center');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Overlay.prototype, "transparent", {
        get: function () {
            return this.element.classList.contains('transparent');
        },
        set: function (val) {
            if (val) {
                this.element.classList.add('transparent');
            }
            else {
                this.element.classList.remove('transparent');
            }
        },
        enumerable: true,
        configurable: true
    });
    Overlay.prototype._onMouseDown = function (evt) {
        if (!this.clickable)
            return;
        var self = this;
        // some field might be in focus
        document.body.blur();
        // wait till blur takes in account
        requestAnimationFrame(function () {
            // hide overlay
            self.hidden = true;
        });
        evt.preventDefault();
    };
    Overlay.prototype.position = function (x, y) {
        var area = this.elementOverlay.getBoundingClientRect();
        var rect = this.innerElement.getBoundingClientRect();
        x = Math.max(0, Math.min(area.width - rect.width, x));
        y = Math.max(0, Math.min(area.height - rect.height, y));
        this.innerElement.style.left = x + 'px';
        this.innerElement.style.top = y + 'px';
    };
    return Overlay;
}(container_element_1.ContainerElement));
exports.Overlay = Overlay;
},{"./container-element":63}],77:[function(require,module,exports){
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
},{"./container-element":63}],78:[function(require,module,exports){
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
var Progress = /** @class */ (function (_super) {
    __extends(Progress, _super);
    function Progress(progress, speed) {
        var _this = _super.call(this) || this;
        _this._progress = progress ? Math.max(0, Math.min(1, progress)) : 0;
        _this._targetProgress = _this._progress;
        _this._lastProgress = Math.floor(_this._progress * 100);
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-progress');
        _this._inner = document.createElement('div');
        _this._inner.classList.add('inner');
        _this._inner.style.width = (_this._progress * 100) + '%';
        _this.element.appendChild(_this._inner);
        _this._speed = speed || 1;
        _this._now = Date.now();
        _this._animating = false;
        _this._failed = false;
        return _this;
    }
    Object.defineProperty(Progress.prototype, "progress", {
        get: function () {
            return this._progress;
        },
        set: function (val) {
            var self = this;
            val = Math.max(0, Math.min(1, val));
            if (this._targetProgress === val)
                return;
            this._targetProgress = val;
            if (this._speed === 0 || this._speed === 1) {
                this._progress = this._targetProgress;
                this._inner.style.width = (this._progress * 100) + '%';
                var progress = Math.max(0, Math.min(100, Math.round(this._progress * 100)));
                if (progress !== this._lastProgress) {
                    this._lastProgress = progress;
                    this.emit('progress:' + progress);
                    this.emit('progress', progress);
                }
            }
            else if (!this._animating) {
                requestAnimationFrame(function () {
                    self._animate();
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Progress.prototype, "speed", {
        get: function () {
            return this._speed;
        },
        set: function (val) {
            this._speed = Math.max(0, Math.min(1, val));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Progress.prototype, "failed", {
        get: function () {
            return this._failed;
        },
        set: function (val) {
            this._failed = val;
            if (this._failed) {
                this.class.add('failed');
            }
            else {
                this.class.remove('failed');
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     *  websocket link -> best way;
     *  information format -> many kinds of information to be transformed;
     *
     *  think about the process:
     *     1. access permission check;
     *     2. a data structure of scene detail;
     *     3. a data structure for assets detail;
     *     4. keep the original file no change so there will be only one source file;
     *     5. link to any information;
     *
     *
     *
  
     *
     */
    Progress.prototype._animate = function () {
        var self = this;
        if (Math.abs(this._targetProgress - this._progress) < 0.01) {
            this._progress = this._targetProgress;
            this._animating = false;
        }
        else {
            if (!this._animating) {
                this._now = Date.now() - (1000 / 60);
                this._animating = true;
            }
            requestAnimationFrame(function () {
                self._animate();
            });
            var dt = Math.max(0.1, Math.min(3, (Date.now() - this._now) / (1000 / 60)));
            this._now = Date.now();
            this._progress = this._progress + (this._targetProgress - this._progress) * (this._speed * dt);
        }
        var progress = Math.max(0, Math.min(100, Math.round(this._progress * 100)));
        if (progress !== this._lastProgress) {
            this._lastProgress = progress;
            this.emit('progress:' + progress);
            this.emit('progress', progress);
        }
        this._inner.style.width = (this._progress * 100) + '%';
    };
    return Progress;
}(element_1.Element));
exports.Progress = Progress;
},{"./element":64}],79:[function(require,module,exports){
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
// 下拉选择列表
var SelectField = /** @class */ (function (_super) {
    __extends(SelectField, _super);
    function SelectField(args) {
        var _this = _super.call(this) || this;
        _this.evtMouseDist = [0, 0];
        // let self = this;
        args = args || {};
        _this.options = args.options || {};
        _this.optionsKeys = [];
        if (_this.options instanceof Array) {
            var options = {};
            for (var i = 0; i < _this.options.length; i++) {
                _this.optionsKeys.push(_this.options[i].v);
                options[_this.options[i].v] = _this.options[i].t;
            }
            _this.options = options;
        }
        else {
            _this.optionsKeys = Object.keys(_this.options);
        }
        _this.element = document.createElement('div');
        _this.element.tabIndex = 0;
        _this.element.classList.add('ui-select-field', 'noSelect');
        _this.elementValue = document.createElement('div');
        _this.elementValue.ui = _this;
        _this.elementValue.classList.add('value');
        _this.element.appendChild(_this.elementValue);
        _this._oldValue = null;
        _this._value = null;
        _this._type = args.type || 'string';
        _this._optionClassNamePrefix = args.optionClassNamePrefix || '';
        _this.timerClickAway = null;
        _this.evtTouchId = -9;
        _this.evtTouchSecond = false;
        _this.evtMouseDist = [0, 0];
        _this.elementValue.addEventListener('mousedown', _this._onMouseDown.bind(_this), false);
        _this.elementValue.addEventListener('touchstart', _this._onTouchStart.bind(_this), false);
        _this.elementOptions = document.createElement('ul');
        _this.element.appendChild(_this.elementOptions);
        _this.optionElements = {};
        if (args.default !== undefined && _this.options[args.default] !== undefined) {
            _this._value = _this.valueToType(args.default);
            _this._oldValue = _this._value;
        }
        _this.on('link', _this._onLink);
        _this._updateOptions();
        _this.on('change', _this._onChange.bind(_this));
        // arrows - change
        _this.element.addEventListener('keydown', _this._onKeyDown.bind(_this), false);
        if (args.placeholder)
            _this.placeholder = args.placeholder;
        return _this;
    }
    Object.defineProperty(SelectField.prototype, "value", {
        get: function () {
            if (this._link) {
                return this._link.get(this.path);
            }
            else {
                return this._value;
            }
        },
        set: function (raw) {
            var value = this.valueToType(raw);
            if (this._link) {
                this._oldValue = this._value;
                this.emit('change:before', value);
                this._link.set(this.path, value);
            }
            else {
                if ((value === null || value === undefined || raw === '') && this.optionElements[''])
                    value = '';
                if (this._oldValue === value)
                    return;
                if (value !== null && this.options[value] === undefined)
                    return;
                // deselect old one
                if (this.optionElements[this._oldValue])
                    this.optionElements[this._oldValue].classList.remove('selected');
                this._value = value;
                if (value !== '')
                    this._value = this.valueToType(this._value);
                this.emit('change:before', this._value);
                this._oldValue = this._value;
                if (this.options[this._value]) {
                    this.elementValue.textContent = this.options[this._value];
                    this.optionElements[this._value].classList.add('selected');
                }
                else {
                    this.elementValue.textContent = '';
                }
                this.emit('change', this._value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectField.prototype, "placeholder", {
        get: function () {
            return this.elementValue.getAttribute('placeholder') || '';
        },
        set: function (val) {
            if (!val) {
                this.elementValue.removeAttribute('placeholder');
            }
            else {
                this.elementValue.setAttribute('placeholder', val);
            }
        },
        enumerable: true,
        configurable: true
    });
    SelectField.prototype._onHoldSelect = function (target, x, y, evt) {
        if (target && target.uiElement && target.uiElement === this && target.classList.contains('selected'))
            return;
        if ((Math.abs(x - this.evtMouseDist[0]) + Math.abs(y - this.evtMouseDist[1])) < 8)
            return;
        if (target && target.uiElement && target.uiElement === this && evt !== undefined)
            this._onOptionSelect.call(target, evt);
        this.close();
    };
    ;
    SelectField.prototype._onMouseDown = function (evt) {
        if (this.disabled && !this.disabledClick)
            return;
        if (this.element.classList.contains('active')) {
            this.close();
        }
        else {
            evt.preventDefault();
            evt.stopPropagation();
            this.evtMouseDist[0] = evt.pageX;
            this.evtMouseDist[1] = evt.pageY;
            this.element.focus();
            this.open();
            window.addEventListener('mouseup', this.evtMouseUp.bind(this));
        }
    };
    ;
    SelectField.prototype._onTouchStart = function (evt) {
        if (this.disabled && !this.disabledClick)
            return;
        if (this.element.classList.contains('active')) {
            this.close();
        }
        else {
            evt.preventDefault();
            evt.stopPropagation();
            var touch;
            for (var i = 0; i < evt.changedTouches.length; i++) {
                if ((evt.changedTouches[i].target).uiElement !== this)
                    continue;
                touch = evt.changedTouches[i];
                break;
            }
            if (!touch)
                return;
            this.evtTouchId = touch.identifier;
            this.evtMouseDist[0] = touch.pageX;
            this.evtMouseDist[1] = touch.pageY;
            this.element.focus();
            this.open();
            window.addEventListener('touchend', this.evtTouchEnd.bind(this));
        }
    };
    ;
    SelectField.prototype._onLink = function (path) {
        if (this._link.schema && this._link.schema.has(path)) {
            var field = this._link.schema.get(path);
            var options = field.options || {};
            this._updateOptions(options);
        }
    };
    ;
    SelectField.prototype._onChange = function () {
        if (!this.renderChanges)
            return;
        this.flash();
    };
    ;
    SelectField.prototype._onKeyDown = function (evt) {
        if (evt.keyCode === 27) {
            this.close();
            evt.target.blur();
            return;
        }
        if ((this.disabled && !this.disabledClick) || [38, 40].indexOf(evt.keyCode) === -1)
            return;
        evt.stopPropagation();
        evt.preventDefault();
        var keys = Object.keys(this.options);
        var ind = keys.indexOf(this.value !== undefined ? this.value.toString() : null);
        var y = evt.keyCode === 38 ? -1 : 1;
        // already first item
        if (y === -1 && ind <= 0)
            return;
        // already last item
        if (y === 1 && ind === (keys.length - 1))
            return;
        // set new item
        this.value = keys[ind + y];
    };
    ;
    SelectField.prototype.valueToType = function (value) {
        switch (this._type) {
            case 'boolean':
                return !!value;
                break;
            case 'number':
                return parseInt(value, 10);
                break;
            case 'string':
                return '' + value;
                break;
        }
    };
    ;
    SelectField.prototype.evtMouseUp = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this._onHoldSelect(evt.target, evt.pageX, evt.pageY);
    };
    ;
    SelectField.prototype.evtTouchEnd = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.identifier !== this.evtTouchId)
                continue;
            this.evtTouchId = -9;
            evt.preventDefault();
            evt.stopPropagation();
            var target = document.elementFromPoint(touch.pageX, touch.pageY);
            this._onHoldSelect(target, touch.pageX, touch.pageY, evt);
        }
        if (this.evtTouchSecond) {
            evt.preventDefault();
            evt.stopPropagation();
            self.close();
        }
        else if (this.element.classList.contains('active')) {
            this.evtTouchSecond = true;
        }
    };
    ;
    SelectField.prototype.open = function () {
        if ((this.disabled && !this.disabledClick) || this.element.classList.contains('active'))
            return;
        this.element.classList.add('active');
        var rect = this.element.getBoundingClientRect();
        // left
        var left = Math.round(rect.left) + ((Math.round(rect.width) - this.element.clientWidth) / 2);
        // top
        var top = rect.top;
        if (this.optionElements[this._value]) {
            top -= this.optionElements[this._value].offsetTop;
            top += (Math.round(rect.height) - this.optionElements[this._value].clientHeight) / 2;
        }
        // limit to bottom / top of screen
        if (top + this.elementOptions.clientHeight > window.innerHeight) {
            top = window.innerHeight - this.elementOptions.clientHeight + 1;
        }
        else if (top < 0) {
            top = 0;
        }
        // top
        this.elementOptions.style.top = Math.max(0, top) + 'px';
        // left
        this.elementOptions.style.left = left + 'px';
        // right
        this.elementOptions.style.width = Math.round(this.element.clientWidth) + 'px';
        // bottom
        if (top <= 0 && this.elementOptions.offsetHeight >= window.innerHeight) {
            this.elementOptions.style.bottom = '0';
            this.elementOptions.style.height = 'auto';
            // scroll to item
            if (this.optionElements[this._value]) {
                var off = this.optionElements[this._value].offsetTop - rect.top;
                this.elementOptions.scrollTop = off;
            }
        }
        else {
            this.elementOptions.style.bottom = '';
            this.elementOptions.style.height = '';
        }
        var self = this;
        this.timerClickAway = setTimeout(function () {
            var looseActive = function () {
                self.element.classList.remove('active');
                self.element.blur();
                window.removeEventListener('click', looseActive);
            };
            window.addEventListener('click', looseActive);
        }, 300);
        this.emit('open');
    };
    ;
    SelectField.prototype.close = function () {
        if ((this.disabled && !this.disabledClick) || !this.element.classList.contains('active'))
            return;
        window.removeEventListener('mouseup', this.evtMouseUp.bind(this));
        window.removeEventListener('touchend', this.evtTouchEnd.bind(this));
        if (this.timerClickAway) {
            clearTimeout(this.timerClickAway);
            this.timerClickAway = null;
        }
        this.element.classList.remove('active');
        this.elementOptions.style.top = '';
        this.elementOptions.style.right = '';
        this.elementOptions.style.bottom = '';
        this.elementOptions.style.left = '';
        this.elementOptions.style.width = '';
        this.elementOptions.style.height = '';
        this.emit('close');
        this.evtTouchSecond = false;
    };
    ;
    SelectField.prototype.toggle = function () {
        if (this.element.classList.contains('active')) {
            this.close();
        }
        else {
            this.open();
        }
    };
    ;
    SelectField.prototype._updateOptions = function (options) {
        if (options !== undefined) {
            if (options instanceof Array) {
                this.options = {};
                this.optionsKeys = [];
                for (var i = 0; i < options.length; i++) {
                    this.optionsKeys.push(options[i].v);
                    this.options[options[i].v] = options[i].t;
                }
            }
            else {
                this.options = options;
                this.optionsKeys = Object.keys(options);
            }
        }
        this.optionElements = {};
        this.elementOptions.innerHTML = '';
        for (var i = 0; i < this.optionsKeys.length; i++) {
            if (!this.options.hasOwnProperty(this.optionsKeys[i]))
                continue;
            var element = document.createElement('li');
            element.textContent = this.options[this.optionsKeys[i]];
            element.uiElement = this;
            element.uiValue = this.optionsKeys[i];
            element.addEventListener('touchstart', this._onOptionSelect.bind(this));
            element.addEventListener('mouseover', this._onOptionHover.bind(this));
            element.addEventListener('mouseout', this._onOptionOut.bind(this));
            if (this._optionClassNamePrefix) {
                element.classList.add(this._optionClassNamePrefix + '-' + element.textContent.toLowerCase());
            }
            this.elementOptions.appendChild(element);
            this.optionElements[this.optionsKeys[i]] = element;
        }
    };
    ;
    SelectField.prototype._onOptionSelect = function (evt) {
        this.value = evt.target.uiValue;
    };
    ;
    SelectField.prototype._onOptionHover = function () {
        this.element.classList.add('hover');
    };
    ;
    SelectField.prototype._onOptionOut = function () {
        this.element.classList.remove('hover');
    };
    ;
    SelectField.prototype._onLinkChange = function (value) {
        if (this.optionElements[value] === undefined)
            return;
        if (this.optionElements[this._oldValue]) {
            this.optionElements[this._oldValue].classList.remove('selected');
        }
        this._value = this.valueToType(value);
        this.elementValue.textContent = this.options[value];
        this.optionElements[value].classList.add('selected');
        this.emit('change', value);
    };
    ;
    return SelectField;
}(element_1.Element));
exports.SelectField = SelectField;
},{"./element":64}],80:[function(require,module,exports){
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
var Slider = /** @class */ (function (_super) {
    __extends(Slider, _super);
    function Slider(args) {
        var _this = _super.call(this) || this;
        args = args || {};
        _this._value = 0;
        _this._lastValue = 0;
        _this.precision = (args.precision === undefined) ? 2 : args.precision;
        _this._min = (args.min === undefined) ? 0 : args.min;
        _this._max = (args.max === undefined) ? 1 : args.max;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-slider');
        _this.elementBar = document.createElement('div');
        _this.elementBar.ui = _this;
        _this.elementBar.classList.add('bar');
        _this.element.appendChild(_this.elementBar);
        _this.elementHandle = document.createElement('div');
        _this.elementHandle.ui = _this;
        _this.elementHandle.tabIndex = 0;
        _this.elementHandle.classList.add('handle');
        _this.elementBar.appendChild(_this.elementHandle);
        _this.element.addEventListener('mousedown', _this._onMouseDown.bind(_this), false);
        _this.element.addEventListener('touchstart', _this._onTouchStart.bind(_this), false);
        _this.evtTouchId = null;
        _this.on('change', _this._onChange);
        // arrows - change
        _this.element.addEventListener('keydown', _this._onKeyDown.bind(_this), false);
        return _this;
    }
    Object.defineProperty(Slider.prototype, "min", {
        get: function () {
            return this._min;
        },
        set: function (val) {
            if (this._min === val)
                return;
            this._min = val;
            this._updateHandle(this._value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Slider.prototype, "max", {
        get: function () {
            return this._max;
        },
        set: function (val) {
            if (this._max === val)
                return;
            this._max = val;
            this._updateHandle(this._value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Slider.prototype, "value", {
        get: function () {
            if (this._link) {
                return this._link.get(this.path);
            }
            else {
                return this._value;
            }
        },
        set: function (val) {
            if (this._link) {
                if (!this._link.set(this.path, val))
                    this._updateHandle(this._link.get(this.path));
            }
            else {
                if (this._max !== null && this._max < val)
                    val = this._max;
                if (this._min !== null && this._min > val)
                    val = this._min;
                // TODO
                if (val === null) {
                    this.class.add('null');
                }
                else {
                    if (typeof val !== 'number')
                        val = 0;
                    val = (val !== undefined && this.precision !== null) ? parseFloat(val.toFixed(this.precision)) : val;
                    this.class.remove('null');
                }
                this._updateHandle(val);
                this._value = val;
                if (this._lastValue !== val) {
                    this._lastValue = val;
                    this.emit('change', val);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Slider.prototype.evtMouseMove = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this._onSlideMove(evt.pageX);
    };
    ;
    Slider.prototype.evtMouseUp = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        this._onSlideEnd(evt.pageX);
    };
    ;
    Slider.prototype.evtTouchMove = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.identifier !== this.evtTouchId)
                continue;
            evt.stopPropagation();
            evt.preventDefault();
            this._onSlideMove(touch.pageX);
            break;
        }
    };
    ;
    Slider.prototype.evtTouchEnd = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.identifier !== this.evtTouchId)
                continue;
            evt.stopPropagation();
            evt.preventDefault();
            this._onSlideEnd(touch.pageX);
            this.evtTouchId = null;
            break;
        }
    };
    ;
    Slider.prototype._onChange = function () {
        if (!this.renderChanges)
            return;
        this.flash();
    };
    ;
    Slider.prototype._onKeyDown = function (evt) {
        if (evt.keyCode === 27)
            return this.elementHandle.blur();
        if (this.disabled || [37, 39].indexOf(evt.keyCode) === -1)
            return;
        evt.stopPropagation();
        evt.preventDefault();
        var x = evt.keyCode === 37 ? -1 : 1;
        if (evt.shiftKey)
            x *= 10;
        var rect = this.element.getBoundingClientRect();
        var step = (this._max - this._min) / rect.width;
        var value = Math.max(this._min, Math.min(this._max, this.value + x * step));
        value = parseFloat(value.toFixed(this.precision));
        this.renderChanges = false;
        this._updateHandle(value);
        this.value = value;
        this.renderChanges = true;
    };
    ;
    Slider.prototype._onLinkChange = function (value) {
        this._updateHandle(value);
        this._value = value;
        this.emit('change', value || 0);
    };
    ;
    Slider.prototype._updateHandle = function (value) {
        this.elementHandle.style.left = (Math.max(0, Math.min(1, ((value || 0) - this._min) / (this._max - this._min))) * 100) + '%';
    };
    ;
    Slider.prototype._onMouseDown = function (evt) {
        if (evt.button !== 0 || this.disabled)
            return;
        this._onSlideStart(evt.pageX);
    };
    ;
    Slider.prototype._onTouchStart = function (evt) {
        if (this.disabled)
            return;
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (!(touch.target).ui || (touch.target).ui !== this)
                continue;
            this.evtTouchId = touch.identifier;
            this._onSlideStart(touch.pageX);
            break;
        }
    };
    ;
    Slider.prototype._onSlideStart = function (pageX) {
        this.elementHandle.focus();
        this.renderChanges = false;
        if (this.evtTouchId === null) {
            window.addEventListener('mousemove', this.evtMouseMove.bind(this), false);
            window.addEventListener('mouseup', this.evtMouseUp.bind(this), false);
        }
        else {
            window.addEventListener('touchmove', this.evtTouchMove.bind(this), false);
            window.addEventListener('touchend', this.evtTouchEnd.bind(this), false);
        }
        this.class.add('active');
        this.emit('start', this.value);
        this._onSlideMove(pageX);
        if (this._link && this._link.history)
            this._link.history.combine = true;
    };
    ;
    Slider.prototype._onSlideMove = function (pageX) {
        var rect = this.element.getBoundingClientRect();
        var x = Math.max(0, Math.min(1, (pageX - rect.left) / rect.width));
        var range = this._max - this._min;
        var value = (x * range) + this._min;
        value = parseFloat(value.toFixed(this.precision));
        this._updateHandle(value);
        this.value = value;
    };
    ;
    Slider.prototype._onSlideEnd = function (pageX) {
        this._onSlideMove(pageX);
        this.renderChanges = true;
        this.class.remove('active');
        if (this.evtTouchId === null) {
            window.removeEventListener('mousemove', this.evtMouseMove.bind(this));
            window.removeEventListener('mouseup', this.evtMouseUp.bind(this));
        }
        else {
            window.removeEventListener('touchmove', this.evtTouchMove.bind(this));
            window.removeEventListener('touchend', this.evtTouchEnd.bind(this));
        }
        if (this._link && this._link.history)
            this._link.history.combine = false;
        this.emit('end', this.value);
    };
    ;
    return Slider;
}(element_1.Element));
exports.Slider = Slider;
},{"./element":64}],81:[function(require,module,exports){
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
                this.elementInput.addEventListener('keyup', this._onChange.bind(this), false);
            }
            else {
                this.elementInput.removeEventListener('keyup', this._onChange.bind(this));
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
},{"./element":64}],82:[function(require,module,exports){
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
var TextAreaField = /** @class */ (function (_super) {
    __extends(TextAreaField, _super);
    function TextAreaField(placeholder, value, blurOnEnter) {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-textarea-field');
        _this.elementInput = document.createElement('textarea');
        _this.elementInput.ui = _this;
        _this.elementInput.classList.add('field');
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
        _this.blurOnEnter = blurOnEnter !== undefined ? blurOnEnter : true;
        _this.refocusable = true;
        _this.on('disable', _this._onDisable);
        _this.on('enable', _this._onEnable);
        _this.on('change', _this._onChangeField);
        if (placeholder)
            _this.placeholder = placeholder;
        return _this;
    }
    Object.defineProperty(TextAreaField.prototype, "value", {
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
                this._link.set(this.path, val);
                this.elementInput.value = this._link.get(this.path);
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
    Object.defineProperty(TextAreaField.prototype, "placeholder", {
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
    Object.defineProperty(TextAreaField.prototype, "keyChange", {
        get: function () {
            return this.evtKeyChange;
        },
        set: function (val) {
            if (this.evtKeyChange === !!val)
                return;
            if (val) {
                this.elementInput.addEventListener('keyup', this._onChange.bind(this), false);
            }
            else {
                this.elementInput.removeEventListener('keyup', this._onChange.bind(this));
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TextAreaField.prototype, "proxy", {
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
    TextAreaField.prototype._onChange = function () {
        if (this.ignoreChange)
            return;
        this.value = this.value || '';
        if (!this._link)
            this.emit('change', this.value);
    };
    TextAreaField.prototype._onKeyDown = function (evt) {
        if (evt.keyCode === 27) {
            evt.target.blur();
        }
        else if (this.blurOnEnter && evt.keyCode === 13 && !evt.shiftKey) {
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
    TextAreaField.prototype._onFullSelect = function () {
        this.elementInput.select();
    };
    TextAreaField.prototype._onInputFocus = function () {
        this.class.add('focus');
        this.emit('input:focus');
    };
    TextAreaField.prototype._onInputBlur = function () {
        this.class.remove('focus');
        this.emit('input:blur');
    };
    TextAreaField.prototype._onDisable = function () {
        this.elementInput.readOnly = true;
    };
    TextAreaField.prototype._onEnable = function () {
        this.elementInput.readOnly = false;
    };
    TextAreaField.prototype._onChangeField = function () {
        if (!this.renderChanges)
            return;
        this.flash();
    };
    ;
    TextAreaField.prototype.focus = function (select) {
        this.elementInput.focus();
        if (select)
            this.elementInput.select();
    };
    TextAreaField.prototype._onLinkChange = function (value) {
        this.elementInput.value = value;
        this.emit('change', value);
    };
    return TextAreaField;
}(element_1.Element));
exports.TextAreaField = TextAreaField;
},{"./element":64}],83:[function(require,module,exports){
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
var Tooltip = /** @class */ (function (_super) {
    __extends(Tooltip, _super);
    function Tooltip(args) {
        var _this = _super.call(this) || this;
        args = args || {};
        var self = _this;
        _this.element = document.createElement('div');
        _this.element.classList.add('ui-tooltip', 'align-left');
        _this.innerElement = document.createElement('div');
        _this.innerElement.classList.add('inner');
        _this.element.appendChild(_this.innerElement);
        _this.arrow = document.createElement('div');
        _this.arrow.classList.add('arrow');
        _this.element.appendChild(_this.arrow);
        _this.hoverable = args.hoverable || false;
        _this.x = args.x || 0;
        _this.y = args.y || 0;
        _this._align = 'left';
        _this.align = args.align || 'left';
        _this.on('show', _this._reflow);
        _this.hidden = args.hidden !== undefined ? args.hidden : true;
        if (args.html) {
            _this.html = args.html;
        }
        else {
            _this.text = args.text || '';
        }
        _this.element.addEventListener('mouseover', _this._onMouseOver.bind(_this), false);
        _this.element.addEventListener('mouseleave', _this._onMouseLeave.bind(_this), false);
        return _this;
    }
    Object.defineProperty(Tooltip.prototype, "align", {
        get: function () {
            return this._align;
        },
        set: function (val) {
            if (this._align === val)
                return;
            this.class.remove('align-' + this._align);
            this._align = val;
            this.class.add('align-' + this._align);
            this._reflow();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tooltip.prototype, "html", {
        get: function () {
            return this.innerElement.innerHTML;
        },
        set: function (val) {
            if (this.innerElement.innerHTML === val)
                return;
            this.innerElement.innerHTML = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tooltip.prototype, "text", {
        get: function () {
            return this.innerElement.textContent || '';
        },
        set: function (val) {
            if (this.innerElement.textContent === val)
                return;
            this.innerElement.textContent = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tooltip.prototype, "flip", {
        get: function () {
            return this.class.contains('flip');
        },
        set: function (val) {
            if (this.class.contains('flip') === val)
                return;
            if (val) {
                this.class.add('flip');
            }
            else {
                this.class.remove('flip');
            }
            this._reflow();
        },
        enumerable: true,
        configurable: true
    });
    Tooltip.prototype._onMouseOver = function (evt) {
        if (!this.hoverable)
            return;
        this.hidden = false;
        this.emit('hover', evt);
    };
    Tooltip.prototype._onMouseLeave = function () {
        if (!this.hoverable)
            return;
        this.hidden = true;
    };
    Tooltip.prototype.position = function (x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (this.x === x && this.y === y)
            return;
        this.x = x;
        this.y = y;
        this._reflow();
    };
    Tooltip.prototype._reflow = function () {
        if (this.hidden)
            return;
        this.element.style.top = '';
        this.element.style.right = '';
        this.element.style.bottom = '';
        this.element.style.left = '';
        this.arrow.style.top = '';
        this.arrow.style.right = '';
        this.arrow.style.bottom = '';
        this.arrow.style.left = '';
        this.element.style.display = 'block';
        // alignment
        switch (this._align) {
            case 'top':
                this.element.style.top = this.y + 'px';
                if (this.flip) {
                    this.element.style.right = 'calc(100% - ' + this.x + 'px)';
                }
                else {
                    this.element.style.left = this.x + 'px';
                }
                break;
            case 'right':
                this.element.style.top = this.y + 'px';
                this.element.style.right = 'calc(100% - ' + this.x + 'px)';
                break;
            case 'bottom':
                this.element.style.bottom = 'calc(100% - ' + this.y + 'px)';
                if (this.flip) {
                    this.element.style.right = 'calc(100% - ' + this.x + 'px)';
                }
                else {
                    this.element.style.left = this.x + 'px';
                }
                break;
            case 'left':
                this.element.style.top = this.y + 'px';
                this.element.style.left = this.x + 'px';
                break;
        }
        // limit to screen bounds
        var rect = this.element.getBoundingClientRect();
        if (rect.left < 0) {
            this.element.style.left = '0px';
            this.element.style.right = '';
        }
        if (rect.top < 0) {
            this.element.style.top = '0px';
            this.element.style.bottom = '';
        }
        if (rect.right > window.innerWidth) {
            this.element.style.right = '0px';
            this.element.style.left = '';
            this.arrow.style.left = Math.floor(rect.right - window.innerWidth + 8) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            this.element.style.bottom = '0px';
            this.element.style.top = '';
            this.arrow.style.top = Math.floor(rect.bottom - window.innerHeight + 8) + 'px';
        }
        this.element.style.display = '';
    };
    Tooltip.prototype.evtHover = function () {
    };
    Tooltip.prototype.evtBlur = function () {
    };
    Tooltip.attach = function (args) {
        var data = {
            align: args.align,
            hoverable: args.hoverable
        };
        if (args.html) {
            data.html = args.html;
        }
        else {
            data.text = args.text || '';
        }
        var item = new Tooltip(data);
        item.evtHover = function () {
            var rect = args.target.getBoundingClientRect();
            var off = 16;
            switch (item.align) {
                case 'top':
                    if (rect.width < 64)
                        off = rect.width / 2;
                    item.flip = rect.left + off > window.innerWidth / 2;
                    if (item.flip) {
                        item.position(rect.right - off, rect.bottom);
                    }
                    else {
                        item.position(rect.left + off, rect.bottom);
                    }
                    break;
                case 'right':
                    if (rect.height < 64)
                        off = rect.height / 2;
                    item.flip = false;
                    item.position(rect.left, rect.top + off);
                    break;
                case 'bottom':
                    if (rect.width < 64)
                        off = rect.width / 2;
                    item.flip = rect.left + off > window.innerWidth / 2;
                    if (item.flip) {
                        item.position(rect.right - off, rect.top);
                    }
                    else {
                        item.position(rect.left + off, rect.top);
                    }
                    break;
                case 'left':
                    if (rect.height < 64)
                        off = rect.height / 2;
                    item.flip = false;
                    item.position(rect.right, rect.top + off);
                    break;
            }
            item.hidden = false;
        };
        item.evtBlur = function () {
            item.hidden = true;
        };
        args.target.addEventListener('mouseover', item.evtHover, false);
        args.target.addEventListener('mouseout', item.evtBlur, false);
        item.on('destroy', function () {
            args.target.removeEventListener('mouseover', item.evtHover);
            args.target.removeEventListener('mouseout', item.evtBlur);
        });
        args.root.append(item);
        return item;
    };
    Tooltip.prototype.attachReference = function (args) {
    };
    return Tooltip;
}(container_element_1.ContainerElement));
exports.Tooltip = Tooltip;
},{"./container-element":63}],84:[function(require,module,exports){
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
            // 可能点击title或者title子项
            if (!htmlEle.ui) {
                if (htmlEle.parentElement && (htmlEle.parentElement).ui) {
                    htmlEle = htmlEle.parentElement;
                }
                else {
                    return;
                }
            }
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
            console.log('drag start');
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
            if (this.element) {
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
        // 可能点击title或者title子项
        if (!htmlEle.ui) {
            if (htmlEle.parentElement && (htmlEle.parentElement).ui) {
                htmlEle = htmlEle.parentElement;
            }
            else {
                return;
            }
        }
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
        // 可能点击title或者title子项
        if (!htmlEle.ui) {
            if (htmlEle.parentElement && (htmlEle.parentElement).ui) {
                htmlEle = htmlEle.parentElement;
            }
            else {
                return;
            }
        }
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
        // 可能点击title或者title子项
        if (!htmlEle.ui) {
            if (htmlEle.parentElement && (htmlEle.parentElement).ui) {
                htmlEle = htmlEle.parentElement;
            }
            else {
                return;
            }
        }
        if (htmlEle.ui.tree && !htmlEle.ui.tree.draggable)
            return;
        evt.stopPropagation();
    };
    ;
    TreeItem.prototype._onMouseOver = function (evt) {
        var htmlEle = evt.target;
        // 可能点击title或者title子项
        if (!htmlEle.ui) {
            if (htmlEle.parentElement && (htmlEle.parentElement).ui) {
                htmlEle = htmlEle.parentElement;
            }
            else {
                return;
            }
        }
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
        if (!htmlEle.ui)
            return;
        var currentItem = htmlEle.ui;
        if (evt.target && htmlEle.tagName.toLowerCase() === 'input')
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
        console.log('rename');
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
},{"./element":64,"./text-field":81,"./tree":85}],85:[function(require,module,exports){
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
        _this.on('select', _this._onSelect);
        _this.on('deselect', _this._onDeselect);
        _this.on('append', _this._onAppend);
        _this.on('remove', _this._onRemove);
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
            console.log('shift按钮');
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
            while (!done) {
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
},{"../editor":22,"./container-element":63,"./tree-item":84}]},{},[56])

//# sourceMappingURL=vreditor.js.map
