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
exports.InitializeData = void 0;
var global_1 = require("./global");
var InitializeData = /** @class */ (function () {
    function InitializeData() {
        this.init();
    }
    InitializeData.prototype.init = function () {
        // TODO
        global_1.Config.projectID = window.location.pathname.substring(8);
        // console.log(window.location.pathname);
        // project data
        axios.post('/api/getProject', { projectID: global_1.Config.projectID })
            .then(function (response) {
            var data = response.data;
            if (data.code === "0000") {
                console.log(data.data);
                global_1.Config.projectName = data.data.project.name;
                global_1.Config.userID = data.data.owner.id;
                global_1.Config.username = data.data.owner.username;
                document.title = global_1.Config.projectName + " | 万维引擎";
                editor.call("toolbar.project.set", global_1.Config.projectName);
            }
            else {
                console.error(data.message);
            }
            // ep.emit('settings', response.data);
        })
            .catch(function (error) {
            console.error(error);
        });
        // assets data
        axios.post('/api/getAssets', { projectID: global_1.Config.projectID })
            .then(function (response) {
            var data = response.data;
            if (data.code === "0000") {
                console.log(data.data);
                global_1.Config.assetsData = data.data;
                editor.call("initAssets", global_1.Config.assetsData);
            }
            else {
                console.error(data.message);
            }
            // ep.emit('settings', response.data);
        })
            .catch(function (error) {
            console.error(error);
        });
        // scenes data
        axios.post('/api/getScenes', { projectID: global_1.Config.projectID })
            .then(function (response) {
            var data = response.data;
            if (data.code === "0000") {
                var lastScene = data.data.last;
                global_1.Config.scenesData = data.data.scenes[lastScene];
                console.log(global_1.Config.scenesData);
                editor.emit('scene:raw', global_1.Config.scenesData);
                editor.call("toolbar.scene.set", global_1.Config.scenesData.name);
            }
            else {
                console.error(data.message);
            }
            // ep.emit('settings', response.data);
        })
            .catch(function (error) {
            console.error(error);
        });
    };
    return InitializeData;
}());
exports.InitializeData = InitializeData;
},{"./global":37}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsContextMenu = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var AssetsContextMenu = /** @class */ (function () {
    function AssetsContextMenu() {
        var currentAsset = null;
        // var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
        var legacyScripts = false;
        var root = engine_1.VeryEngine.root;
        var customMenuItems = [];
        // menu
        var menu = new ui_1.Menu();
        root.append(menu);
        // edit
        var menuItemNewScript = new ui_1.MenuItem({
            text: 'New Script',
            icon: '&#57864;',
            value: 'script'
        });
        menuItemNewScript.on('select', function () {
            if (legacyScripts) {
                editor.call('sourcefiles:new');
            }
            else {
                editor.call('picker:script-create', function (filename) {
                    editor.call('assets:create:script', {
                        filename: filename,
                        boilerplate: true
                    });
                });
            }
        });
        menu.append(menuItemNewScript);
        // new asset
        var menuItemNew = new ui_1.MenuItem({
            text: '添加资源',
            icon: '&#57632;',
            value: 'new'
        });
        menu.append(menuItemNew);
        var downloadable = {
            'texture': 1,
            'textureatlas': 1,
            'html': 1,
            'table': 1,
            'shader': 1,
            'scene': 1,
            'json': 1,
            'audio': 1,
            'text': 1
        };
        var icons = {
            'upload': '&#57909;',
            'folder': '&#57657;',
            'table': '&#57864;',
            'cubemap': '&#57879;',
            'html': '&#57864;',
            'json': '&#57864;',
            'layers': '&#57992',
            'material': '&#57749;',
            'script': '&#57864;',
            'shader': '&#57864;',
            'text': '&#57864;',
            'texture': '&#57857;',
            'textureatlas': '&#57857;',
            'model': '&#57735;',
            'scene': '&#57735;',
            'animation': '&#57875;',
            'audio': '&#57872;',
            'bundle': '&#58384;'
        };
        var ICONS = {
            REFERENCES: '&#57622;',
            TEXTURE_ATLAS: '&#58162;',
            SPRITE_ASSET: '&#58261;',
            REPLACE: '&#57640;',
            REIMPORT: '&#57889;',
            DOWNLOAD: '&#57896;',
            EDIT: '&#57648;',
            DUPLICATE: '&#57638;',
            DELETE: '&#57636;',
            SCENE_SETTINGS: '&#57652;'
        };
        // var assets: any = {
        //     'upload': '上传',
        //     'folder': '新建文件夹',
        //     'css': '表格',
        //     'cubemap': 'CubeMap',
        //     'html': 'HTML',
        //     'json': 'JSON',
        //     'material': '材质',
        //     'script': 'Script',
        //     'shader': 'Shader',
        //     'text': 'Text'
        // };
        var assets = {
            'upload': '上传',
            'folder': '新建文件夹',
            'table': '表格',
            'material': '材质'
        };
        // if (editor.call('users:hasFlag', 'hasBundles')) {
        //     assets.bundle = 'Asset Bundle';
        // }
        var addNewMenuItem = function (key, title) {
            // new folder
            var item = new ui_1.MenuItem({
                text: title,
                icon: icons[key] || '',
                value: key
            });
            item.on('select', function () {
                var args = {};
                if (currentAsset && currentAsset.get('type') === 'folder') {
                    args.parent = currentAsset;
                }
                else if (currentAsset === undefined) {
                    args.parent = null;
                }
                if (key === 'upload') {
                    editor.call('assets:upload:picker', args);
                }
                else if (key === 'script') {
                    if (legacyScripts) {
                        editor.call('sourcefiles:new');
                    }
                    else {
                        editor.call('picker:script-create', function (filename) {
                            editor.call('assets:create:script', {
                                filename: filename,
                                boilerplate: true
                            });
                        });
                    }
                }
                else {
                    editor.call('assets:create:' + key, args);
                }
            });
            menuItemNew.append(item);
            if (key === 'script') {
                editor.on('repositories:load', function (repositories) {
                    if (repositories.get('current') !== 'directory')
                        item.disabled = true;
                });
            }
        };
        var keys = Object.keys(assets);
        for (var i = 0; i < keys.length; i++) {
            if (!assets.hasOwnProperty(keys[i]))
                continue;
            addNewMenuItem(keys[i], assets[keys[i]]);
        }
        // related
        var menuItemReferences = new ui_1.MenuItem({
            text: 'References',
            icon: ICONS.REFERENCES,
            value: 'references'
        });
        menu.append(menuItemReferences);
        // Create Atlas
        var menuItemTextureToAtlas = new ui_1.MenuItem({
            text: 'Create Texture Atlas',
            icon: ICONS.TEXTURE_ATLAS,
            value: 'texture-to-atlas'
        });
        menu.append(menuItemTextureToAtlas);
        menuItemTextureToAtlas.on('select', function () {
            editor.call('assets:textureToAtlas', currentAsset);
        });
        // Create Sprite From Atlas
        var menuItemCreateSprite = new ui_1.MenuItem({
            text: 'Create Sprite Asset',
            icon: ICONS.SPRITE_ASSET,
            value: 'atlas-to-sprite'
        });
        menu.append(menuItemCreateSprite);
        menuItemCreateSprite.on('select', function () {
            editor.call('assets:atlasToSprite', {
                asset: currentAsset
            });
        });
        // Create Sliced Sprite From Atlas
        var menuItemCreateSlicedSprite = new ui_1.MenuItem({
            text: 'Create Sliced Sprite Asset',
            icon: ICONS.SPRITE_ASSET,
            value: 'atlas-to-sliced-sprite'
        });
        menu.append(menuItemCreateSlicedSprite);
        menuItemCreateSlicedSprite.on('select', function () {
            editor.call('assets:atlasToSprite', {
                asset: currentAsset,
                sliced: true
            });
        });
        // replace
        var replaceAvailable = {
            material: true,
            texture: true,
            textureatlas: true,
            model: true,
            animation: true,
            audio: true,
            cubemap: true,
            css: true,
            html: true,
            shader: true,
            sprite: true,
            json: true,
            text: true
        };
        var menuItemReplace = new ui_1.MenuItem({
            text: '加载',
            icon: ICONS.REPLACE,
            value: 'replace'
        });
        menuItemReplace.on('select', function () {
            // console.log(currentAsset)
            // console.log(currentAsset.origin)
            editor.call("loadTempModel", currentAsset);
            // var id = parseInt(currentAsset.get('id'), 10);
            // console.log(currentAsset.get("name"));
            // editor.call('picker:asset', {
            //     type: currentAsset.get('type'),
            //     currentAsset: currentAsset
            // });
            // var evtPick: Nullable<EventHandle> = editor.once('picker:asset', function (asset: Observer) {
            //     editor.call('assets:replace', currentAsset, asset);
            //     evtPick = null;
            // });
            // editor.once('picker:asset:close', function () {
            //     if (evtPick) {
            //         evtPick.unbind();
            //         evtPick = null;
            //     }
            // });
        });
        menu.append(menuItemReplace);
        // var menuItemReplaceTextureToSprite = new MenuItem({
        //     text: 'Convert Texture To Sprite',
        //     icon: ICONS.SPRITE_ASSET,
        //     value: 'replaceTextureToSprite'
        // });
        // menuItemReplaceTextureToSprite.on('select', function () {
        //     var id = parseInt(currentAsset.get('id'), 10);
        //     editor.call('picker:asset', {
        //         type: 'sprite',
        //         currentAsset: currentAsset
        //     });
        //     var evtPick: Nullable<EventHandle> = editor.once('picker:asset', function (asset: Observer) {
        //         editor.call('assets:replaceTextureToSprite', currentAsset, asset);
        //         evtPick = null;
        //     });
        //     editor.once('picker:asset:close', function () {
        //         if (evtPick) {
        //             evtPick.unbind();
        //             evtPick = null;
        //         }
        //     });
        // });
        // menu.append(menuItemReplaceTextureToSprite);
        // extract. Used for source assets.
        var menuItemExtract = new ui_1.MenuItem({
            text: 'Re-Import',
            icon: ICONS.REIMPORT,
            value: 'extract'
        });
        menuItemExtract.on('select', function () {
            editor.call('assets:reimport', currentAsset.get('id'), currentAsset.get('type'));
        });
        menu.append(menuItemExtract);
        // re-import. Used for target assets.
        var menuItemReImport = new ui_1.MenuItem({
            text: 'Re-Import',
            icon: ICONS.REIMPORT,
            value: 're-import'
        });
        menuItemReImport.on('select', function () {
            editor.call('assets:reimport', currentAsset.get('id'), currentAsset.get('type'));
        });
        menu.append(menuItemReImport);
        // download
        var menuItemDownload = new ui_1.MenuItem({
            text: '下载',
            icon: ICONS.DOWNLOAD,
            value: 'download'
        });
        menuItemDownload.on('select', function () {
            window.open(currentAsset.get('file.url'));
        });
        menu.append(menuItemDownload);
        // edit
        var menuItemEdit = new ui_1.MenuItem({
            text: '编辑',
            icon: ICONS.EDIT,
            value: 'edit'
        });
        menuItemEdit.on('select', function () {
            // editor.call('assets:edit', currentAsset);
            console.log("编辑表格");
            editor.call("assets:open-table", currentAsset.get("name"));
        });
        menu.append(menuItemEdit);
        // duplicate
        var menuItemDuplicate = new ui_1.MenuItem({
            text: '复制',
            icon: ICONS.DUPLICATE,
            value: 'duplicate'
        });
        menuItemDuplicate.on('select', function () {
            editor.call('assets:duplicate', currentAsset);
        });
        menu.append(menuItemDuplicate);
        // delete
        var menuItemDelete = new ui_1.MenuItem({
            text: '删除',
            icon: ICONS.DELETE,
            value: 'delete'
        });
        menuItemDelete.style.fontWeight = '200';
        menuItemDelete.on('select', function () {
            var asset = currentAsset;
            var multiple = false;
            if (asset) {
                var assetType = asset.get('type');
                var type = editor.call('selector:type');
                var items;
                if (type === 'asset') {
                    items = editor.call('selector:items');
                    for (var i = 0; i < items.length; i++) {
                        // if the asset that was right-clicked is in the selection
                        // then include all the other selected items in the delete
                        // otherwise only delete the right-clicked item
                        if (assetType === 'script' && legacyScripts) {
                            if (items[i].get('filename') === asset.get('filename')) {
                                multiple = true;
                                break;
                            }
                        }
                        else if (items[i].get('id') === asset.get('id')) {
                            multiple = true;
                            break;
                        }
                    }
                }
                editor.call('assets:delete:picker', multiple ? items : [asset]);
            }
        });
        menu.append(menuItemDelete);
        // filter buttons
        menu.on('open', function () {
            menuItemNewScript.hidden = !((currentAsset === null || (currentAsset && currentAsset.get('type') === 'script')) && editor.call('assets:panel:currentFolder') === 'scripts');
            menuItemNew.hidden = !menuItemNewScript.hidden;
            if (currentAsset) {
                // download，TODO：下载菜单
                menuItemDownload.hidden = true;
                // menuItemDownload.hidden = !(
                //     (!config.project.privateAssets ||
                //         (config.project.privateAssets &&
                //             editor.call('permissions:read'))) &&
                //     currentAsset.get('type') !== 'folder' &&
                //     (currentAsset.get('source') ||
                //         downloadable[currentAsset.get('type')] ||
                //         (!legacyScripts &&
                //             currentAsset.get('type') === 'script')) &&
                //     currentAsset.get('file.url')
                // );
                // duplicate
                if (currentAsset.get('type') === 'material' ||
                    currentAsset.get('type') === 'sprite') {
                    menuItemEdit.hidden = true;
                    if (editor.call('selector:type') === 'asset') {
                        var items = editor.call('selector:items');
                        menuItemDuplicate.hidden =
                            items.length > 1 && items.indexOf(currentAsset) !== -1;
                    }
                    else {
                        menuItemDuplicate.hidden = false;
                    }
                }
                else {
                    menuItemDuplicate.hidden = true;
                }
                // edit
                if (!currentAsset.get('source') &&
                    ['html', 'table', 'json', 'text', 'script', 'shader'].indexOf(currentAsset.get('type')) !== -1) {
                    if (editor.call('selector:type') === 'asset') {
                        var items = editor.call('selector:items');
                        menuItemEdit.hidden =
                            items.length > 1 && items.indexOf(currentAsset) !== -1;
                    }
                    else {
                        menuItemEdit.hidden = false;
                    }
                }
                else {
                    menuItemEdit.hidden = true;
                }
                // create atlas
                menuItemTextureToAtlas.hidden =
                    currentAsset.get('type') !== 'texture' ||
                        currentAsset.get('source') ||
                        currentAsset.get('task') ||
                        !editor.call('permissions:write');
                // create sprite
                menuItemCreateSprite.hidden =
                    currentAsset.get('type') !== 'textureatlas' ||
                        currentAsset.get('source') ||
                        currentAsset.get('task') ||
                        !editor.call('permissions:write');
                menuItemCreateSlicedSprite.hidden = menuItemCreateSprite.hidden;
                // delete
                menuItemDelete.hidden = false;
                if (!currentAsset.get('source')) {
                    menuItemExtract.hidden = true;
                    // re-import
                    var sourceId = currentAsset.get('source_asset_id');
                    if (sourceId) {
                        var source = editor.call('assets:get', sourceId);
                        if (source) {
                            if (source.get('type') === 'scene' &&
                                (['texture', 'material'].indexOf(currentAsset.get('type')) !== -1 ||
                                    !source.get('meta'))) {
                                menuItemReImport.hidden = true;
                            }
                            else if (currentAsset.get('type') === 'animation' &&
                                !source.get('meta.animation.available')) {
                                menuItemReImport.hidden = true;
                            }
                            else if (currentAsset.get('type') === 'material' &&
                                !currentAsset.has('meta.index')) {
                                menuItemReImport.hidden = true;
                            }
                            else {
                                menuItemReImport.hidden = false;
                            }
                        }
                        else {
                            menuItemReImport.hidden = true;
                        }
                    }
                    else {
                        menuItemReImport.hidden = true;
                    }
                    // references
                    // var ref = editor.call('assets:used:index')[
                    //     currentAsset.get('id')
                    // ];
                    // if (ref && ref.count && ref.ref) {
                    //     menuItemReferences.hidden = false;
                    //     menuItemReplace.hidden = replaceAvailable[
                    //         currentAsset.get('type')
                    //     ]
                    //         ? false
                    //         : true;
                    //     menuItemReplaceTextureToSprite.hidden =
                    //         !editor.call('users:hasFlag', 'hasTextureToSprite') ||
                    //         currentAsset.get('type') !== 'texture';
                    //     while (menuItemReferences.innerElement!.firstChild)
                    //         (<HTMLElement>menuItemReferences.innerElement!.firstChild).ui.destroy();
                    //     var menuItems: any = [];
                    //     var addReferenceItem = function (type: string, id: string) {
                    //         var menuItem = new MenuItem();
                    //         var item: any = null;
                    //         if (type === 'editorSettings') {
                    //             menuItem.text = 'Scene Settings';
                    //             menuItem.icon = ICONS.SCENE_SETTINGS;
                    //             item = editor.call('settings:projectUser');
                    //             if (!item) return;
                    //         } else {
                    //             if (type === 'entity') {
                    //                 item = editor.call('entities:get', id);
                    //                 menuItem.icon = '&#57734;';
                    //             } else if (type === 'asset') {
                    //                 item = editor.call('assets:get', id);
                    //                 menuItem.icon = icons[item.get('type')] || '';
                    //             }
                    //             if (!item) return;
                    //             menuItem.text = item.get('name');
                    //         }
                    //         menuItems.push({
                    //             name: menuItem.text,
                    //             type: type,
                    //             element: menuItem
                    //         });
                    //         menuItem.on('select', function () {
                    //             editor.call('selector:set', type, [item]);
                    //             var folder = null;
                    //             var path = item.get('path') || [];
                    //             if (path.length)
                    //                 folder = editor.call(
                    //                     'assets:get',
                    //                     path[path.length - 1]
                    //                 );
                    //             editor.call('assets:panel:currentFolder', folder);
                    //             // unfold rendering tab
                    //             if (type === 'editorSettings') {
                    //                 setTimeout(function () {
                    //                     editor.call(
                    //                         'editorSettings:panel:unfold',
                    //                         'rendering'
                    //                     );
                    //                 }, 0);
                    //             }
                    //         });
                    //     };
                    //     for (var key in ref.ref)
                    //         addReferenceItem(ref.ref[key].type, key);
                    //     var typeSort: any = {
                    //         editorSettings: 1,
                    //         asset: 2,
                    //         entity: 3
                    //     };
                    //     menuItems.sort(function (a: any, b: any) {
                    //         if (a.type !== b.type) {
                    //             return typeSort[a.type] - typeSort[b.type];
                    //         } else {
                    //             if (a.name > b.name) {
                    //                 return 1;
                    //             } else if (a.name < b.name) {
                    //                 return -1;
                    //             } else {
                    //                 return 0;
                    //             }
                    //         }
                    //     });
                    //     for (var i = 0; i < menuItems.length; i++)
                    //         menuItemReferences.append(menuItems[i].element);
                    // } else {
                    //     menuItemReferences.hidden = true;
                    //     menuItemReplace.hidden = true;
                    //     menuItemReplaceTextureToSprite.hidden = true;
                    // }
                }
                else {
                    menuItemReferences.hidden = true;
                    menuItemReplace.hidden = true;
                    // menuItemReplaceTextureToSprite.hidden = true;
                    menuItemReImport.hidden = true;
                    menuItemExtract.hidden =
                        ['scene', 'texture', 'textureatlas'].indexOf(currentAsset.get('type')) === -1 || !currentAsset.get('meta');
                }
            }
            else {
                // no asset
                menuItemExtract.hidden = true;
                menuItemReImport.hidden = true;
                menuItemDownload.hidden = true;
                menuItemDuplicate.hidden = true;
                menuItemEdit.hidden = true;
                menuItemDelete.hidden = true;
                menuItemReferences.hidden = true;
                menuItemReplace.hidden = true;
                // menuItemReplaceTextureToSprite.hidden = true;
                menuItemTextureToAtlas.hidden = true;
                menuItemCreateSprite.hidden = true;
                menuItemCreateSlicedSprite.hidden = true;
            }
            for (var i = 0; i < customMenuItems.length; i++) {
                if (!customMenuItems[i].filter)
                    continue;
                customMenuItems[i].hidden = !customMenuItems[i].filter(currentAsset);
            }
        });
        // for each asset added
        editor.on('assets:add', function (asset) {
            // get grid item
            var item = editor.call('assets:panel:get', asset.get('id'));
            if (!item)
                return;
            // 右键功能
            var contextMenuHandler = function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                // if (!editor.call('permissions:write')) return;
                currentAsset = asset;
                // 打开菜单
                menu.open = true;
                menu.position(evt.clientX + 1, evt.clientY);
                // 
            };
            // grid
            item.element.addEventListener('contextmenu', contextMenuHandler, false);
            // 
            // tree, 给tree item也加上右键菜单
            if (item.tree) {
                item.tree.elementTitle.addEventListener('contextmenu', contextMenuHandler, false);
            }
        });
    }
    return AssetsContextMenu;
}());
exports.AssetsContextMenu = AssetsContextMenu;
},{"../../engine":89,"../../ui":108}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsCreateFolder = void 0;
var global_1 = require("../global");
var AssetsCreateFolder = /** @class */ (function () {
    function AssetsCreateFolder() {
        editor.method('assets:create:folder', function (args) {
            // if (!editor.call('permissions:write'))
            //     return;
            console.log('assets:create:folder');
            args = args || {};
            var asset = {
                name: '新建文件夹',
                type: 'folder',
                source: true,
                preload: false,
                data: null,
                parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
                scope: {
                    type: 'project',
                    id: global_1.Config.projectID
                }
            };
            console.log(asset);
            editor.call('assets:create', asset);
        });
    }
    return AssetsCreateFolder;
}());
exports.AssetsCreateFolder = AssetsCreateFolder;
},{"../global":37}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsCreateTable = void 0;
var global_1 = require("../global");
var AssetsCreateTable = /** @class */ (function () {
    function AssetsCreateTable() {
        editor.method('assets:create:table', function (args) {
            // if (!editor.call('permissions:write'))
            //     return;
            args = args || {};
            var asset = {
                name: '新表格.table',
                type: 'text',
                source: false,
                preload: true,
                parent: (args.parent !== undefined) ? args.parent : editor.call('assets:panel:currentFolder'),
                filename: '新表格.json',
                file: new Blob(['{ }'], { type: 'application/json' }),
                scope: {
                    type: 'project',
                    id: global_1.Config.projectID
                }
            };
            editor.call('assets:create', asset);
        });
        editor.method("assets:open-table", function (table_name) {
            console.log(table_name);
            window.open(window.location.protocol + "//" + window.location.host + "/table/" + global_1.Config.projectID + "?name=" + table_name);
        });
    }
    return AssetsCreateTable;
}());
exports.AssetsCreateTable = AssetsCreateTable;
},{"../global":37}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsDrop = void 0;
var AssetsDrop = /** @class */ (function () {
    function AssetsDrop() {
        var assetsPanel = editor.call('layout.assets');
        var dropRef = editor.call('drop:target', {
            ref: assetsPanel.element,
            type: 'files',
            drop: function (type, data) {
                if (type !== 'files')
                    return;
                editor.call('assets:upload:files', data);
            }
        });
        dropRef.element.classList.add('assets-drop-area');
    }
    return AssetsDrop;
}());
exports.AssetsDrop = AssetsDrop;
},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsFilter = void 0;
var engine_1 = require("../../engine");
var ui_1 = require("../../ui");
var AssetsFilter = /** @class */ (function () {
    function AssetsFilter() {
        var root = engine_1.VeryEngine.root;
        var assetsPanel = engine_1.VeryEngine.assets;
        // var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
        var legacyScripts = false;
        var currentFolder = null;
        var currentPath = [];
        var searchLastValue = '';
        var searchTags = null;
        // filters
        var panelFilters = new ui_1.Panel();
        panelFilters.class.add('filters');
        assetsPanel.header.append(panelFilters);
        var tagsCheck = function (asset, tags) {
            var data = asset.get('tags');
            if (!data.length)
                return false;
            // tags = pc.Tags.prototype._processArguments(tags);
            if (!data.length || !tags.length)
                return false;
            for (var i = 0; i < tags.length; i++) {
                if (tags[i].length === 1) {
                    // single occurance
                    if (data.indexOf(tags[i][0]) !== -1)
                        return true;
                }
                else {
                    // combined occurance
                    var multiple = true;
                    for (var t = 0; t < tags[i].length; t++) {
                        if (data.indexOf(tags[i][t]) !== -1)
                            continue;
                        multiple = false;
                        break;
                    }
                    if (multiple)
                        return true;
                }
            }
            return false;
        };
        var filter = function (type, item) {
            if (!item)
                return false;
            var visible = true;
            // type
            if (visible && filterField.value !== 'all') {
                if (type === 'asset') {
                    var assetType = item.get('type');
                    if (assetType === 'texture') {
                        if (item.get('source')) {
                            assetType = 'textureSource';
                        }
                        else {
                            assetType = 'textureTarget';
                        }
                    }
                    else if (assetType === 'textureatlas') {
                        if (item.get('source')) {
                            assetType = 'textureAtlasSource';
                        }
                        else {
                            assetType = 'textureAtlasTarget';
                        }
                    }
                    else if (assetType === 'font') {
                        if (item.get('source')) {
                            assetType = 'fontSource';
                        }
                        else {
                            assetType = 'fontTarget';
                        }
                    }
                    visible = assetType === filterField.value;
                }
                else if (type === 'script') {
                    visible = filterField.value === 'script';
                }
            }
            // query
            if (visible && search.value) {
                var name = (type === 'scripts') ? item : item.get(type === 'asset' ? 'name' : 'filename');
                var normalSearch = true;
                if (searchTags !== false && ((searchTags instanceof Array) || (search.value[0] === '[' && search.value.length > 2 && /^\[.+\]$/.test(search.value)))) {
                    if (searchTags === null) {
                        try {
                            var raw = search.value.slice(1, -1);
                            var bits = raw.split(',');
                            var tags = [];
                            var merge = '';
                            for (var i = 0; i < bits.length; i++) {
                                var tag = bits[i].trim();
                                if (!tag)
                                    continue;
                                if ((tag[0] === '[' && tag[tag.length - 1] !== ']') || (merge && tag[tag.length - 1] !== ']')) {
                                    merge += tag + ',';
                                    continue;
                                }
                                if (merge && tag[tag.length - 1] === ']') {
                                    tag = merge + tag;
                                    merge = '';
                                }
                                if (tag[0] === '[' && tag.length > 2 && tag[tag.length - 1] === ']') {
                                    var subRaw = tag.slice(1, -1);
                                    var subBits = subRaw.split(',');
                                    if (subBits.length === 1) {
                                        var subTag = subBits[0].trim();
                                        if (!subTag)
                                            continue;
                                        tags.push(subTag);
                                    }
                                    else {
                                        var subTags = [];
                                        for (var s = 0; s < subBits.length; s++) {
                                            var subTag = subBits[s].trim();
                                            if (!subTag)
                                                continue;
                                            subTags.push(subTag);
                                        }
                                        if (subTags.length === 0) {
                                            continue;
                                        }
                                        else if (subTags.length === 1) {
                                            tags.push(subTags[0]);
                                        }
                                        else {
                                            tags.push(subTags);
                                        }
                                    }
                                }
                                else {
                                    tags.push(tag);
                                }
                            }
                            searchTags = tags;
                            normalSearch = false;
                        }
                        catch (ex) {
                            searchTags = false;
                        }
                    }
                    else {
                        normalSearch = false;
                    }
                    if (searchTags) {
                        if (type === 'scripts' || (type === 'script' && legacyScripts)) {
                            visible = false;
                        }
                        else {
                            visible = tagsCheck(item, searchTags);
                        }
                    }
                    else {
                        normalSearch = true;
                    }
                }
                else if (search.value[0] === '*' && search.value.length > 1) {
                    try {
                        visible = (new RegExp(search.value.slice(1), 'i')).test(name);
                        normalSearch = false;
                    }
                    catch (ex) { }
                }
                if (normalSearch) {
                    visible = name.toLowerCase().indexOf(search.value.toLowerCase()) !== -1;
                    if (!visible && type === 'asset') {
                        var id = parseInt(search.value, 10);
                        if (id && id.toString() === search.value)
                            visible = parseInt(item.get('id'), 10) === id;
                    }
                }
            }
            // folder
            if (visible && !search.value) {
                if (type === 'script' || currentFolder === 'scripts') {
                    visible = currentFolder === 'scripts' && type === 'script';
                }
                else if (type === 'scripts') {
                    visible = !currentFolder && filterField.value === 'all';
                }
                else {
                    var path = item.get('path');
                    if (currentFolder === null) {
                        visible = path.length === 0;
                    }
                    else {
                        visible = (path.length === currentPath.length + 1) && path[path.length - 1] === currentFolder;
                    }
                }
            }
            return visible;
        };
        editor.method('assets:panel:filter:default', function () {
            return filter;
        });
        // options
        var filterOptions;
        if (editor.call('users:hasFlag', 'hasBundles')) {
            filterOptions = {
                options: {
                    all: 'All',
                    animation: 'Animation',
                    audio: 'Audio',
                    bundle: 'Asset Bundle',
                    binary: 'Binary',
                    cubemap: 'Cubemap',
                    css: 'Css',
                    fontTarget: 'Font',
                    fontSource: 'Font (source)',
                    json: 'Json',
                    html: 'Html',
                    material: 'Material',
                    model: 'Model',
                    scene: 'Model (source)',
                    script: 'Script',
                    shader: 'Shader',
                    sprite: 'Sprite',
                    text: 'Text',
                    textureTarget: 'Texture',
                    textureSource: 'Texture (source)',
                    textureAtlasTarget: 'Texture Atlas',
                    textureAtlasSource: 'Texture Atlas (source)'
                }
            };
        }
        else {
            filterOptions = {
                options: {
                    all: 'All',
                    animation: 'Animation',
                    audio: 'Audio',
                    binary: 'Binary',
                    cubemap: 'Cubemap',
                    css: 'Css',
                    fontTarget: 'Font',
                    fontSource: 'Font (source)',
                    json: 'Json',
                    html: 'Html',
                    material: 'Material',
                    model: 'Model',
                    scene: 'Model (source)',
                    script: 'Script',
                    shader: 'Shader',
                    sprite: 'Sprite',
                    text: 'Text',
                    textureTarget: 'Texture',
                    textureSource: 'Texture (source)',
                    textureAtlasTarget: 'Texture Atlas',
                    textureAtlasSource: 'Texture Atlas (source)'
                }
            };
        }
        var filterField = new ui_1.SelectField(filterOptions);
        filterField.class.add('options');
        filterField.value = 'all';
        filterField.renderChanges = false;
        panelFilters.append(filterField);
        filterField.on('change', function (value) {
            if (value !== 'all') {
                filterField.class.add('not-empty');
            }
            else {
                filterField.class.remove('not-empty');
            }
            editor.call('assets:panel:filter', filter);
        });
        var tooltipFilter = ui_1.Tooltip.attach({
            target: filterField.element,
            text: 'Filter Assets',
            align: 'bottom',
            root: root
        });
        filterField.on('open', function () {
            tooltipFilter.disabled = true;
        });
        filterField.on('close', function () {
            tooltipFilter.disabled = false;
        });
        editor.method('assets:filter:search', function (query) {
            if (query === undefined)
                return search.value;
            search.value = query;
            return search.value;
        });
        editor.method('assets:filter:type', function (type) {
            if (type === undefined)
                return filterField.value;
            filterField.value = type || 'all';
        });
        editor.method('assets:filter:type:disabled', function (state) {
            filterField.disabled = state;
        });
        editor.on('assets:panel:currentFolder', function (asset) {
            if (asset) {
                if (typeof (asset) === 'string') {
                    if (legacyScripts) {
                        currentFolder = 'scripts';
                    }
                    else {
                        currentFolder = null;
                    }
                    currentPath = null;
                }
                else {
                    currentFolder = asset.get('id');
                    // currentFolder = parseInt(asset.get('id'));
                    currentPath = asset.get('path');
                }
            }
            else {
                currentFolder = null;
                currentPath = null;
            }
            editor.call('assets:panel:filter', filter, true);
        });
        editor.on('assets:add', function (asset) {
            if (filterField.value === 'all' && !search.value)
                return;
            if (!filter((asset.get('type') === 'script') ? 'script' : 'asset', asset))
                editor.call('assets:panel:get', asset.get('id')).hidden = true;
            else
                editor.call('assets:panel:message', null); // clear possible no assets message
        });
        editor.on('sourcefiles:add', function (file) {
            if (filterField.value === 'all' && !search.value)
                return;
            if (!filter('script', file))
                editor.call('assets:panel:get', file.get('filename')).hidden = true;
            else
                editor.call('assets:panel:message', null); // clear possible no assets message
        });
        // search
        var search = new ui_1.TextField('搜索');
        search.blurOnEnter = false;
        search.keyChange = true;
        search.class.add('search');
        search.renderChanges = false;
        panelFilters.append(search);
        search.element.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 27)
                searchClear.click();
        }, false);
        // hotkeys
        editor.call('hotkey:register', 'assets-focus-search', {
            key: 'a',
            alt: true,
            callback: function (e) {
                if (editor.call('picker:isOpen:otherThan', 'curve'))
                    return;
                search.focus();
            }
        });
        var searchClear = document.createElement('div');
        searchClear.innerHTML = '&#57650;';
        searchClear.classList.add('clear');
        search.element.appendChild(searchClear);
        searchClear.addEventListener('click', function () {
            search.value = '';
        }, false);
        search.on('change', function (value) {
            value = value.trim();
            if (searchLastValue === value)
                return;
            searchLastValue = value;
            if (value) {
                search.class.add('not-empty');
            }
            else {
                search.class.remove('not-empty');
            }
            searchTags = null;
            editor.call('assets:panel:filter', filter);
        });
    }
    return AssetsFilter;
}());
exports.AssetsFilter = AssetsFilter;
},{"../../engine":89,"../../ui":108}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsPanelControl = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var AssetsPanelControl = /** @class */ (function () {
    function AssetsPanelControl() {
        var root = engine_1.VeryEngine.root;
        var assetsPanel = engine_1.VeryEngine.assets;
        // context menu
        var menu = new ui_1.Menu();
        root.append(menu);
        // var assets: any = {
        //     'upload': {
        //         title: '上传',
        //         icon: '&#57909;'
        //     },
        //     'folder': {
        //         title: '新建文件夹',
        //         icon: '&#57657;'
        //     },
        //     'css': {
        //         title: '表格',
        //         icon: '&#57864;'
        //     },
        //     'cubemap': {
        //         title: 'CubeMap',
        //         icon: '&#57879;'
        //     },
        //     'html': {
        //         title: 'HTML',
        //         icon: '&#57864;'
        //     },
        //     'json': {
        //         title: 'JSON',
        //         icon: '&#57864;'
        //     },
        //     'material': {
        //         title: '材质',
        //         icon: '&#57749;'
        //     },
        //     'script': {
        //         title: 'Script',
        //         icon: '&#57864;'
        //     },
        //     'shader': {
        //         title: 'Shader',
        //         icon: '&#57864;'
        //     },
        //     'text': {
        //         title: 'Text',
        //         icon: '&#57864;'
        //     }
        // };
        var assets = {
            'upload': {
                title: '上传',
                icon: '&#57909;'
            },
            'folder': {
                title: '新建文件夹',
                icon: '&#57657;'
            },
            'table': {
                title: '表格',
                icon: '&#57864;'
            },
            'material': {
                title: '材质',
                icon: '&#57749;'
            }
        };
        // if (editor.call('users:hasFlag', 'hasBundles')) {
        //     assets.bundle = {
        //         title: 'Asset Bundle',
        //         icon: '&#58384;'
        //     };
        // }
        var addNewMenuItem = function (key, data) {
            // new folder
            var item = new ui_1.MenuItem({
                text: data.title,
                icon: data.icon || '',
                value: key
            });
            item.on('select', function () {
                var args = {
                    parent: editor.call('assets:panel:currentFolder')
                };
                if (key === 'upload') {
                    editor.call('assets:upload:picker', args);
                }
                else if (key === 'script') {
                    if (editor.call('settings:project').get('useLegacyScripts')) {
                        editor.call('sourcefiles:new');
                    }
                    else {
                        editor.call('picker:script-create', function (filename) {
                            editor.call('assets:create:script', {
                                filename: filename,
                                boilerplate: true
                            });
                        });
                    }
                }
                else {
                    // console.log('assets:create:' + key);
                    // console.log(args);
                    editor.call('assets:create:' + key, args);
                }
            });
            menu.append(item);
            if (key === 'script') {
                editor.on('repositories:load', function (repositories) {
                    if (repositories.get('current') !== 'directory')
                        item.disabled = true;
                });
            }
        };
        var keys = Object.keys(assets);
        for (var i = 0; i < keys.length; i++) {
            if (!assets.hasOwnProperty(keys[i]))
                continue;
            addNewMenuItem(keys[i], assets[keys[i]]);
        }
        // controls
        var controls = new ui_1.Panel();
        // controls.enabled = false;
        controls.class.add('assets-controls');
        // controls.parent = assetsPanel;
        // assetsPanel.headerElement!.insertBefore(controls.element!, assetsPanel.headerElementTitle!.nextSibling);
        assetsPanel.header.append(controls);
        editor.on('permissions:writeState', function (state) {
            controls.enabled = state;
        });
        // add
        var btnNew = new ui_1.Button();
        // btnNew.hidden = !editor.call('permissions:write');
        btnNew.class.add('create-asset');
        btnNew.text = '&#57632;';
        btnNew.on('click', function (evt) {
            var rect = btnNew.element.getBoundingClientRect();
            menu.position(rect.right, rect.top);
            menu.open = true;
        });
        controls.append(btnNew);
        var tooltipAdd = ui_1.Tooltip.attach({
            target: btnNew.element,
            text: '添加资源',
            align: 'bottom',
            root: root
        });
        menu.on('open', function (state) {
            tooltipAdd.disabled = state;
        });
        // delete
        var btnDelete = new ui_1.Button('&#57636;');
        // btnDelete.hidden = !editor.call('permissions:write');
        btnDelete.style.fontWeight = '200';
        btnDelete.disabled = true;
        btnDelete.class.add('delete');
        btnDelete.on('click', function () {
            if (!editor.call('permissions:write'))
                return;
            var type = editor.call('selector:type');
            if (type !== 'asset')
                return;
            editor.call('assets:delete:picker', editor.call('selector:items'));
        });
        controls.append(btnDelete);
        var tooltipDelete = ui_1.Tooltip.attach({
            target: btnDelete.element,
            text: '删除资源',
            align: 'bottom',
            root: root
        });
        tooltipDelete.class.add('innactive');
        editor.on('permissions:writeState', function (state) {
            btnNew.hidden = !state;
            btnDelete.hidden = !state;
        });
        // folder up
        var btnUp = new ui_1.Button('&#58117;');
        btnUp.style.fontWeight = '200';
        btnUp.disabled = true;
        btnUp.class.add('up');
        btnUp.on('click', function () {
            var folder = editor.call('assets:panel:currentFolder');
            if (!folder)
                return;
            if (folder === 'scripts') {
                editor.call('assets:panel:currentFolder', null);
            }
            else {
                var path = folder.get('path');
                if (path.length) {
                    var parent = editor.call('assets:get', path[path.length - 1]);
                    if (parent) {
                        editor.call('assets:panel:currentFolder', parent);
                    }
                    else {
                        editor.call('assets:panel:currentFolder', null);
                    }
                }
                else {
                    editor.call('assets:panel:currentFolder', null);
                }
            }
        });
        controls.append(btnUp);
        editor.on('assets:panel:currentFolder', function (folder) {
            if (folder) {
                btnUp.disabled = false;
                tooltipUp.class.remove('innactive');
            }
            else {
                btnUp.disabled = true;
                tooltipUp.class.add('innactive');
            }
        });
        var tooltipUp = ui_1.Tooltip.attach({
            target: btnUp.element,
            text: '上一层',
            align: 'bottom',
            root: root
        });
        tooltipUp.class.add('innactive');
        var assetsGrid = engine_1.VeryEngine.assetsGrid;
        // thumbnails size
        var btnThumbSize = new ui_1.Button('&#57669;');
        btnThumbSize.style.fontWeight = '200';
        btnThumbSize.class.add('size');
        btnThumbSize.on('click', function () {
            if (assetsGrid.class.contains('small')) {
                assetsGrid.class.remove('small');
                tooltipThumbSize.html = '<span style="color:#fff">大图标</span> / 小图标';
                editor.call('localStorage:set', 'editor:assets:thumbnail:size', 'large');
            }
            else {
                assetsGrid.class.add('small');
                tooltipThumbSize.html = '大图标 / <span style="color:#fff">小图标</span>';
                editor.call('localStorage:set', 'editor:assets:thumbnail:size', 'small');
            }
        });
        controls.append(btnThumbSize);
        var tooltipThumbSize = ui_1.Tooltip.attach({
            target: btnThumbSize.element,
            align: 'bottom',
            root: root
        });
        var size = editor.call('localStorage:get', 'editor:assets:thumbnail:size');
        if (size === 'small') {
            assetsGrid.class.add('small');
            tooltipThumbSize.html = '大图标 / <span style="color:#fff">小图标</span>';
        }
        else {
            assetsGrid.class.remove('small');
            tooltipThumbSize.html = '<span style="color:#fff">大图标</span> / 小图标';
        }
        tooltipThumbSize.class.add('innactive');
        editor.on('attributes:clear', function () {
            // btnDuplicate.disabled = true;
            btnDelete.disabled = true;
            tooltipDelete.class.add('innactive');
        });
        editor.on('attributes:inspect[*]', function (type) {
            if (type.startsWith('asset')) {
                btnDelete.enabled = true;
                tooltipDelete.class.remove('innactive');
            }
            else {
                btnDelete.enabled = false;
                tooltipDelete.class.add('innactive');
            }
            // btnDuplicate.enabled = type === 'asset.material';
        });
    }
    return AssetsPanelControl;
}());
exports.AssetsPanelControl = AssetsPanelControl;
},{"../../engine":89,"../../ui":108}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsPanel = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var utility_1 = require("../utility");
var AssetsPanel = /** @class */ (function () {
    function AssetsPanel() {
        var self = this;
        var root = engine_1.VeryEngine.root;
        var assetsPanel = engine_1.VeryEngine.assets;
        var dragging = false;
        var draggingData = {};
        var legacyScripts = false;
        var selector = {
            type: '',
            items: new Array(),
            prev: {
                type: '',
                items: new Array()
            }
        };
        var searching = false;
        var overlay = new ui_1.TopElementContainer({
            flex: true
        });
        overlay.class.add('progress-overlay');
        assetsPanel.append(overlay);
        var loading = new ui_1.Progress();
        loading.progress = 0.01;
        loading.on('progress:100', function () {
            overlay.hidden = true;
        });
        overlay.append(loading);
        // TODO：隐藏
        overlay.hidden = true;
        editor.method('assets:progress', function (progress) {
            loading.progress = progress;
        });
        // folders panel
        var folders = new ui_1.Panel();
        folders.class.add('folders');
        folders.flexShrink = '0';
        folders.style.width = '200px';
        folders.innerElement.style.width = '200px';
        folders.foldable = false;
        folders.horizontal = true;
        folders.scroll = true;
        folders.resizable = 'right';
        folders.resizeMin = 100;
        folders.resizeMax = 300;
        assetsPanel.append(folders);
        editor.method('assets:panel:folders', function () {
            return folders;
        });
        // folder
        var files = new ui_1.Panel();
        files.class.add('files');
        files.flexGrow = "1";
        files.foldable = false;
        files.horizontal = true;
        files.scroll = true;
        assetsPanel.append(files);
        // grid
        var grid = new ui_1.Grid();
        // grid.enabled = false;
        grid.class.add('assets');
        files.append(grid);
        engine_1.VeryEngine.assetsGrid = grid;
        // tree
        var tree = new ui_1.Tree();
        // tree.enabled = false;
        tree.draggable = false;
        tree.class.add('assets');
        folders.append(tree);
        // tree root，Assets根目录
        var treeRoot = new ui_1.TreeItem({
            text: '/'
        });
        tree.append(treeRoot);
        // tree.element!.appendChild(treeRoot.element!);
        // tree.emit('append', treeRoot);
        treeRoot.open = true;
        treeRoot.class.add('current');
        treeRoot.on('select', function () {
            treeRoot.selected = false;
        });
        // tree width resizing
        var resizeQueued = false;
        var resizeTree = function () {
            resizeQueued = false;
            tree.element.style.width = '';
            tree.element.style.width = (folders.innerElement.scrollWidth - 5) + 'px';
        };
        var resizeQueue = function () {
            if (resizeQueued)
                return;
            resizeQueued = true;
            requestAnimationFrame(resizeTree);
        };
        folders.on('resize', resizeQueue);
        tree.on('open', resizeQueue);
        tree.on('close', resizeQueue);
        setInterval(resizeQueue, 1000);
        var gridScripts;
        var treeScripts;
        var createLegacyScriptFolder = function () {
            gridScripts = new ui_1.GridItem();
            gridScripts.class.add('type-folder', 'scripts');
            grid.append(gridScripts);
            gridScripts.tree = treeScripts = new ui_1.TreeItem({
                text: 'scripts'
            });
            gridScripts.tree.class.add('scripts');
            gridScripts.tree.on('select', function () {
                gridScripts.tree.selected = false;
            });
            treeRoot.append(gridScripts.tree);
            gridScripts.on('select', function () {
                editor.call('selector:clear');
                if (!selector.type) {
                    selector.prev.type = '';
                    selector.prev.items = [];
                }
            });
            // scripts open
            gridScripts.element.addEventListener('dblclick', function () {
                tree.clear();
                editor.call('assets:filter:search', '');
                editor.call('assets:panel:currentFolder', 'scripts');
                // change back selection
                if (selector.prev.type)
                    editor.call('selector:set', selector.prev.type, selector.prev.items);
            }, false);
            var thumbnail = gridScripts.thumbnail = document.createElement('div');
            thumbnail.classList.add('thumbnail', 'placeholder');
            gridScripts.element.appendChild(thumbnail);
            var icon = document.createElement('div');
            icon.classList.add('icon');
            gridScripts.element.appendChild(icon);
            var label = gridScripts.labelElement = document.createElement('div');
            label.classList.add('label');
            label.textContent = 'scripts';
            gridScripts.element.appendChild(label);
            // context menu
            var menu = new ui_1.Menu();
            root.append(menu);
            // script
            var menuScript = new ui_1.MenuItem({
                text: 'New Script',
                value: 'script',
                icon: '&#57864;'
            });
            menuScript.on('select', function () {
                editor.call('sourcefiles:new');
            });
            menu.append(menuScript);
            editor.on('repositories:load', function (repositories) {
                if (repositories.get('current') !== 'directory')
                    menuScript.disabled = true;
            });
            var onContextMenu = function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                // if (!editor.call('permissions:write'))
                //     return;
                menu.position(evt.clientX + 1, evt.clientY);
                menu.open = true;
            };
            gridScripts.element.addEventListener('contextmenu', onContextMenu, false);
            treeScripts.elementTitle.addEventListener('contextmenu', onContextMenu, false);
            resizeQueue();
        };
        if (legacyScripts)
            createLegacyScriptFolder();
        var currentFolder = null; // assets -> Observer
        editor.method('assets:panel:currentFolder', function (asset) {
            if (asset === undefined)
                return currentFolder;
            if (asset === currentFolder)
                return null;
            // current folder style remove
            if (currentFolder && typeof (currentFolder) !== 'string' && assetsIndex[currentFolder.get('id')]) {
                assetsIndex[currentFolder.get('id')].tree.class.remove('current');
            }
            else {
                if (currentFolder === null) {
                    treeRoot.class.remove('current');
                }
                else if (treeScripts && currentFolder === 'scripts') {
                    treeScripts.class.remove('current');
                }
            }
            currentFolder = asset;
            // current folder style add
            if (currentFolder && typeof (currentFolder) !== 'string') {
                assetsIndex[currentFolder.get('id')].tree.class.add('current');
                // open tree up
                var path = currentFolder.get('path');
                for (var i = 0; i < path.length; i++) {
                    if (!assetsIndex[path[i]] || !assetsIndex[path[i]].tree)
                        continue;
                    assetsIndex[path[i]].tree.open = true;
                }
            }
            else if (currentFolder === null) {
                treeRoot.class.add('current');
            }
            else if (treeScripts && currentFolder === 'scripts') {
                treeScripts.class.add('current');
                editor.call('assets:filter:type', 'all');
            }
            if (legacyScripts)
                gridScripts.hidden = currentFolder !== null;
            editor.emit('assets:panel:currentFolder', currentFolder);
            return currentFolder;
        });
        editor.call('hotkey:register', 'assets:fs:up', {
            key: 'backspace',
            callback: function () {
                if (!currentFolder || editor.call('selector:type') !== 'asset')
                    return;
                var path = typeof (currentFolder) === 'string' ? [] : currentFolder.get('path');
                if (path.length === 0) {
                    editor.call('assets:panel:currentFolder', null);
                }
                else {
                    editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
                }
            }
        });
        editor.on('drop:active', function (state, type, data) {
            dragging = state;
            if (!dragging) {
                grid.dragOver = undefined;
                gridDropBorder.classList.remove('active');
                treeDropBorder.classList.remove('active');
            }
        });
        editor.on('drop:set', function (type, data) {
            draggingData = data;
        });
        // IDrop
        var dropRef = editor.call('drop:target', {
            ref: folders.element,
            hole: true,
            passThrough: true,
            filter: function (type, data) {
                return type.startsWith('asset');
            },
            drop: function (type, data) {
                if (!type || grid.dragOver === undefined || !type.startsWith('asset'))
                    return;
                var items = editor.call('selector:items');
                var assets = [];
                var addAsset = function (id) {
                    var asset = editor.call('assets:get', id);
                    // deselect moved asset
                    if (items.indexOf(asset) !== -1)
                        editor.call('selector:remove', asset);
                    assets.push(asset);
                };
                if (data.ids) {
                    for (var i = 0; i < data.ids.length; i++)
                        addAsset(data.ids[i]);
                }
                else {
                    addAsset(data.id);
                }
                editor.call('assets:fs:move', assets, grid.dragOver);
            }
        });
        dropRef.element.classList.add('assets-drop-area');
        var treeAppendQueue = {};
        treeRoot.elementTitle.addEventListener('mouseover', function () {
            if (!dragging || grid.dragOver === null || (!draggingData.id && !draggingData.ids))
                return;
            // already in that folder
            var dragAsset = editor.call('assets:get', draggingData.id || draggingData.ids[0]);
            if (!dragAsset.get('path').length)
                return;
            gridDropBorder.classList.remove('active');
            var rect = treeRoot.elementTitle.getBoundingClientRect();
            treeDropBorder.classList.add('active');
            treeDropBorder.style.left = rect.left + 'px';
            treeDropBorder.style.top = rect.top + 'px';
            treeDropBorder.style.right = (window.innerWidth - rect.right) + 'px';
            treeDropBorder.style.bottom = (window.innerHeight - rect.bottom) + 'px';
            grid.dragOver = null;
        }, false);
        treeRoot.elementTitle.addEventListener('mouseout', function () {
            if (!dragging || grid.dragOver === undefined)
                return;
            gridDropBorder.classList.remove('active');
            treeDropBorder.classList.remove('active');
            grid.dragOver = undefined;
        }, false);
        var dropRef2 = editor.call('drop:target', {
            ref: files.element,
            hole: true,
            passThrough: true,
            filter: function (type, data) {
                return type.startsWith('asset');
            },
            drop: function (type, data) {
                if (!type || grid.dragOver === undefined || !type.startsWith('asset'))
                    return;
                var assets = [];
                var items = editor.call('selector:items');
                var addAsset = function (id) {
                    var asset = editor.call('assets:get', id);
                    // deselect moved asset
                    if (items.indexOf(asset) !== -1)
                        editor.call('selector:remove', asset);
                    assets.push(asset);
                };
                if (data.ids) {
                    for (var i = 0; i < data.ids.length; i++) {
                        addAsset(data.ids[i]);
                    }
                }
                else {
                    addAsset(data.id);
                }
                if (grid.dragOver.get('type') === 'folder') {
                    editor.call('assets:fs:move', assets, grid.dragOver);
                }
                else if (grid.dragOver.get('type') === 'bundle') {
                    var countAdded = editor.call('assets:bundles:addAssets', assets, grid.dragOver);
                    if (countAdded) {
                        var item = assetsIndex[grid.dragOver.get('id')];
                        item.class.add('confirm-animation');
                        setTimeout(function () {
                            item.class.remove('confirm-animation');
                        }, 800);
                    }
                }
            }
        });
        dropRef2.element.classList.add('assets-drop-area');
        editor.on('permissions:writeState', function (state) {
            tree.enabled = state;
            grid.enabled = state;
        });
        var labelNoAssets = new ui_1.Label(undefined, undefined, true);
        labelNoAssets.renderChanges = false;
        labelNoAssets.class.add('no-assets');
        labelNoAssets.hidden = true;
        files.append(labelNoAssets);
        editor.method('assets:panel:message', function (msg) {
            labelNoAssets.text = msg;
            labelNoAssets.hidden = !msg;
        });
        var scriptsIndex = {};
        var assetsIndex = {};
        var assetsChanged = false;
        // grid.assetsIndex = assetsIndex;
        var gridDropBorder = document.createElement('div');
        gridDropBorder.classList.add('assets-drop-border');
        root.append(gridDropBorder);
        var treeDropBorder = document.createElement('div');
        treeDropBorder.classList.add('assets-drop-border');
        root.append(treeDropBorder);
        var tooltipAsset = new ui_1.Tooltip({
            text: 'Asset',
            align: 'top',
            hoverable: false
        });
        root.append(tooltipAsset);
        var tooltipTarget = null;
        var tooltipTimeout = null;
        var tooltipShow = function () {
            if (!tooltipTarget)
                return;
            while (tooltipTarget && tooltipTarget.nodeName !== 'LI' && !tooltipTarget.classList.contains('ui-grid-item'))
                tooltipTarget = tooltipTarget.parentNode;
            if (!tooltipTarget || !tooltipTarget.ui)
                return;
            var rect = tooltipTarget.getBoundingClientRect();
            var off = 16;
            if (rect.width < 64)
                off = rect.width / 2;
            tooltipAsset.flip = rect.left + off > window.innerWidth / 2;
            if (tooltipAsset.flip) {
                tooltipAsset.position(rect.right - off, rect.bottom);
            }
            else {
                tooltipAsset.position(rect.left + off, rect.bottom);
            }
            tooltipAsset.text = tooltipTarget.ui.asset.get('name');
            tooltipAsset.hidden = false;
        };
        var onAssetItemHover = function (evt) {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            tooltipTarget = evt.target;
            tooltipTimeout = setTimeout(tooltipShow, 300);
        };
        var onAssetItemBlur = function () {
            tooltipAsset.hidden = true;
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
        };
        var onAssetItemRemove = function () {
            // if (!tooltipTarget || !tooltipTarget.ui || tooltipTarget.ui.asset !== this)
            //     return;
            if (!tooltipTarget || !tooltipTarget.ui)
                return;
            onAssetItemBlur();
        };
        grid.innerElement.addEventListener('mousewheel', function () {
            tooltipAsset.hidden = true;
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
        }, false);
        tree.on('select', function (item) {
            if (assetsChanged)
                return;
            if (item.asset) {
                if (!ui_1.Tree._ctrl || !ui_1.Tree._ctrl()) {
                    if (currentFolder !== item.asset) {
                        item.selected = false;
                    }
                    else {
                        editor.call('selector:set', 'asset', [item.asset]);
                    }
                }
                else {
                    editor.call('selector:add', 'asset', item.asset);
                }
            }
            if (!item.asset) {
                if (item === treeRoot) {
                    editor.call('assets:filter:search', '');
                    editor.call('assets:panel:currentFolder', null);
                }
                else if (item === treeScripts) {
                    editor.call('assets:filter:search', '');
                    editor.call('assets:panel:currentFolder', 'scripts');
                }
                return;
            }
            if (!ui_1.Tree._ctrl || !ui_1.Tree._ctrl()) {
                editor.call('assets:filter:search', '');
                editor.call('assets:panel:currentFolder', item.asset);
            }
        });
        tree.on('deselect', function (item) {
            if (assetsChanged)
                return;
            if (item.asset)
                editor.call('selector:remove', item.asset);
        });
        grid.on('select', function (item) {
            if (assetsChanged)
                return;
            if (item.asset) {
                editor.call('selector:add', 'asset', item.asset);
            }
            // TODO
            // } else if (item.script) {
            //     editor.call('selector:add', 'asset', item.script);
            // }
        });
        grid.on('deselect', function (item) {
            // console.error('grid deselect');
            if (assetsChanged)
                return;
            if (item.asset) {
                // console.error(item);
                // console.error(item.asset);
                editor.call('selector:remove', item.asset);
            }
            // } else if (item.script) {
            //     editor.call('selector:remove', item.script);
            // }
        });
        editor.on('selector:change', function (type, items) {
            assetsChanged = true;
            selector.prev.type = selector.type;
            selector.prev.items = selector.items;
            selector.type = editor.call('selector:type');
            selector.items = editor.call('selector:items');
            // console.error('type: ' + type);
            // console.error(items);
            if (type === 'asset') {
                tree.clear();
                items = items.slice(0);
                var assets = [];
                for (var i = 0; i < items.length; i++) {
                    if (legacyScripts && items[i].get('type') === 'script') {
                        assets.push(scriptsIndex[items[i].get('filename')]);
                    }
                    else {
                        assets.push(assetsIndex[items[i].get('id')]);
                        if (assets[i].tree) {
                            assets[i].tree.selected = true;
                            // open tree up
                            var path = items[i].get('path');
                            for (var n = 0; n < path.length; n++) {
                                if (!assetsIndex[path[n]] || !assetsIndex[path[n]].tree)
                                    continue;
                                assetsIndex[path[n]].tree.open = true;
                            }
                        }
                    }
                }
                grid.selected = assets;
            }
            else {
                if ((legacyScripts && !(gridScripts.selected && grid.selected.length === 1)) || selector.type !== 'asset')
                    grid.selected = [];
                tree.clear();
            }
            assetsChanged = false;
        });
        // return grid
        editor.method('assets:grid', function () {
            return grid;
        });
        var searchingInProgress = false;
        var searchingElement = null;
        var searchingFunction = null;
        var searchingBatchLimit = 512;
        var searchNextBatch = function () {
            var done = 0;
            while (searchingElement && (searchingBatchLimit === 0 || done < searchingBatchLimit)) {
                var item = searchingElement.ui;
                if (item) {
                    if (item.asset) {
                        item.hidden = !searchingFunction('asset', item.asset);
                    }
                    else if (item.script) {
                        item.hidden = !searchingFunction('script', item.script);
                    }
                    done++;
                }
                searchingElement = searchingElement.nextSibling;
            }
            if (!searchingElement) {
                searchingInProgress = false;
            }
            else {
                requestAnimationFrame(searchNextBatch);
            }
        };
        // filter assets in grid
        editor.method('assets:panel:filter', function (fn, immediate) {
            if (!fn)
                fn = editor.call('assets:panel:filter:default');
            labelNoAssets.hidden = true;
            // 获取grid的第一个元素（所有grid的集合）
            searchingElement = grid.element.firstChild;
            searchingFunction = fn;
            var type = editor.call('assets:filter:type');
            var search = editor.call('assets:filter:search');
            if (!search || immediate) {
                searchingBatchLimit = 0;
            }
            else {
                searchingBatchLimit = 512;
            }
            if (!searchingInProgress) {
                searchingInProgress = true;
                requestAnimationFrame(searchNextBatch);
            }
            // navigate to selected assets folder
            if (searching && !search) {
                searching = false;
                if (selector.type === 'asset') {
                    var script = legacyScripts && selector.items[0].get('type') === 'script';
                    var path = script ? [] : selector.items[0].get('path');
                    var multiPath = false;
                    for (var i = 1; i < selector.items.length; i++) {
                        var item = selector.items[i];
                        if (script !== (item.get('type') === 'script') || (!script && !path.equals(item.get('path')))) {
                            multiPath = true;
                            break;
                        }
                    }
                    if (!multiPath) {
                        if (path.length) {
                            editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
                            assetsIndex[selector.items[0].get('id')].element.focus();
                        }
                        else if (script) {
                            editor.call('assets:panel:currentFolder', 'scripts');
                        }
                        else {
                            editor.call('assets:panel:currentFolder', null);
                        }
                    }
                }
            }
            if (search)
                searching = true;
            if (legacyScripts)
                gridScripts.hidden = !fn('scripts', 'scripts');
        });
        // get grid item by id
        editor.method('assets:panel:get', function (id) {
            return assetsIndex[id] || scriptsIndex[id];
        });
        // 插入子文件夹，如果有的话
        var appendChildFolders = function (item) {
            var queue = treeAppendQueue[item.asset.get('id')];
            if (!queue || !queue.length)
                return;
            for (var i = 0; i < queue.length; i++) {
                var closest = treeFindClosest(item.tree, queue[i].tree);
                if (closest === -1) {
                    item.tree.append(queue[i].tree);
                }
                else {
                    item.tree.appendBefore(queue[i].tree, (item.tree.child(closest).ui));
                }
                appendChildFolders(queue[i]);
            }
            delete treeAppendQueue[item.asset.get('id')];
        };
        var treeFindClosest = function (parent, current, nameOld) {
            // 文件改变之前的名字
            nameOld = nameOld || current.text;
            // ChildNode -> 当前parent下的其他item
            var l = Array.prototype.slice.call(parent.element.childNodes, 1);
            // if (item === treeRoot && legacyScripts)
            //   l = l.slice(1);
            if (parent === treeRoot)
                l = l.slice(1);
            var min = 0;
            var max = l.length - 1;
            var cur = -1;
            var a, i;
            var aN = '';
            var bN = '';
            if (l.length === 0) // 当前没有item，直接在末尾插入item
                return -1;
            // TODO: text是什么？名字？根据名字排列顺序？
            // if (((a === current) ? nameOld.toLowerCase() : l[0].ui.text.toLowerCase()) === bN)
            //   return 0;
            while (min <= max) {
                cur = Math.floor((min + max) / 2); // 二分法
                a = l[cur];
                aN = (a === current) ? nameOld.toLowerCase() : a.ui.text.toLowerCase();
                bN = current.text.toLowerCase();
                if (aN > bN) {
                    max = cur - 1;
                }
                else if (aN < bN) {
                    min = cur + 1;
                }
                else {
                    return cur;
                }
            }
            // if (aN.localeCompare(bN) > 0) {
            //     return cur;
            // }
            if (aN > bN)
                return cur;
            if ((cur + 1) === l.length)
                return -1;
            return cur + 1;
        };
        // select all hotkey
        // ctrl + a
        editor.call('hotkey:register', 'asset:select-all', {
            ctrl: true,
            key: 'a',
            callback: function () {
                var assets = [];
                for (var key in assetsIndex) {
                    if (!assetsIndex[key].hidden)
                        assets.push(assetsIndex[key].asset);
                }
                for (var key in scriptsIndex) {
                    if (!scriptsIndex[key].hidden)
                        assets.push(scriptsIndex[key].script);
                }
                if (assets.length) {
                    editor.call('selector:set', 'asset', assets);
                }
                else {
                    editor.call('selector:clear');
                }
            }
        });
        var renderQueue = [];
        var renderQueueIndex = {};
        var renderQueueUpdate = function () {
            requestAnimationFrame(renderQueueUpdate);
            if (!renderQueue.length)
                return;
            var items = 0;
            while (items < 4 && renderQueue.length) {
                items++;
                var id = renderQueue.shift();
                delete renderQueueIndex[id];
                if (!assetsIndex[id] || !assetsIndex[id].thumbnail || !assetsIndex[id].thumbnail.render)
                    continue;
                assetsIndex[id].thumbnail.render();
            }
        };
        requestAnimationFrame(renderQueueUpdate);
        var renderQueueAdd = function (asset) {
            var id = asset.get('id');
            if (renderQueueIndex[id])
                return;
            if (!assetsIndex[id] || !assetsIndex[id].thumbnail || !assetsIndex[id].thumbnail.render)
                return;
            renderQueueIndex[id] = true;
            renderQueue.push(id);
        };
        var renderQueueRemove = function (asset) {
            var id = parseInt(asset.get('id'), 10);
            if (!renderQueueIndex[id])
                return;
            var ind = renderQueue.indexOf(id);
            if (ind !== -1)
                renderQueue.splice(ind, 1);
            delete renderQueueIndex[id];
        };
        var showGridDropHighlight = function (item) {
            var clip = files.element.getBoundingClientRect();
            var rect = item.element.getBoundingClientRect();
            var top = Math.max(rect.top, clip.top);
            var bottom = Math.min(rect.bottom, clip.bottom);
            if ((bottom - top) > 8) {
                gridDropBorder.classList.add('active');
                gridDropBorder.style.left = rect.left + 'px';
                gridDropBorder.style.top = top + 'px';
                gridDropBorder.style.right = (window.innerWidth - rect.right) + 'px';
                gridDropBorder.style.bottom = (window.innerHeight - bottom) + 'px';
            }
        };
        var showTreeDropHighlight = function (item) {
            var clip = files.element.getBoundingClientRect();
            var rect = item.tree.elementTitle.getBoundingClientRect();
            var top = Math.max(rect.top, clip.top);
            var bottom = Math.min(rect.bottom, clip.bottom);
            if (rect.height && (bottom - top) > 4) {
                treeDropBorder.classList.add('active');
                treeDropBorder.style.left = rect.left + 'px';
                treeDropBorder.style.top = top + 'px';
                treeDropBorder.style.right = (window.innerWidth - rect.right) + 'px';
                treeDropBorder.style.bottom = (window.innerHeight - bottom) + 'px';
            }
        };
        // Called when a folder asset is added
        var onAddFolder = function (asset, item) {
            item.tree = new ui_1.TreeItem({
                text: asset.get('name')
            });
            item.tree.asset = asset;
            var path = asset.get('path');
            var parent;
            // console.warn(path);
            if (path.length) {
                var parentFolderId = path[path.length - 1];
                if (assetsIndex[parentFolderId]) {
                    parent = assetsIndex[parentFolderId].tree;
                }
                else {
                    if (!treeAppendQueue[parentFolderId])
                        treeAppendQueue[parentFolderId] = [];
                    treeAppendQueue[parentFolderId].push(item);
                }
            }
            else {
                parent = treeRoot;
            }
            // console.warn(item.text);
            if (parent) {
                var closest = treeFindClosest(parent, item.tree);
                if (closest === -1) {
                    parent.append(item.tree);
                }
                else {
                    parent.appendBefore(item.tree, (parent.child(closest).ui));
                }
                appendChildFolders(item);
            }
            var onMouseOver = function () {
                if (!dragging || grid.dragOver === asset)
                    return;
                // don't allow to drag on it self
                if (draggingData.ids) {
                    // multi-drag
                    if (draggingData.ids.indexOf(parseInt(asset.get('id'), 10)) !== -1)
                        return;
                }
                else if (draggingData.id) {
                    // single-drag
                    if (parseInt(asset.get('id'), 10) === parseInt(draggingData.id, 10))
                        return;
                }
                else {
                    // script file drag
                    return;
                }
                // already in that folder
                var dragAsset = editor.call('assets:get', draggingData.id || draggingData.ids[0]);
                var path = dragAsset.get('path');
                if (path.length && path[path.length - 1] === parseInt(asset.get('id'), 10))
                    return;
                // don't allow dragging into own child
                if (draggingData.ids) {
                    // multi-drag
                    var assetPath = asset.get('path');
                    for (var i = 0; i < draggingData.ids.length; i++) {
                        if (assetPath.indexOf(draggingData.ids[i]) !== -1)
                            return;
                    }
                }
                else {
                    // single-drag
                    if (asset.get('path').indexOf(parseInt(dragAsset.get('id'), 10)) !== -1)
                        return;
                }
                showGridDropHighlight(item);
                showTreeDropHighlight(item);
                grid.dragOver = asset;
            };
            var onMouseOut = function () {
                if (!dragging || grid.dragOver !== asset)
                    return;
                gridDropBorder.classList.remove('active');
                treeDropBorder.classList.remove('active');
                grid.dragOver = undefined;
            };
            // draggable
            item.tree.elementTitle.draggable = true;
            item.element.addEventListener('mouseout', onMouseOut, false);
            item.tree.elementTitle.addEventListener('mouseout', onMouseOut, false);
            item.element.addEventListener('mouseover', onMouseOver, false);
            item.tree.elementTitle.addEventListener('mouseover', onMouseOver, false);
        };
        // Called when a script asset is added
        var onAddScript = function (asset, item, events) {
            events.push(editor.on('assets[' + asset.get('id') + ']:scripts:collide', function (script) {
                item.class.add('scripts-collide');
            }));
            events.push(editor.on('assets[' + asset.get('id') + ']:scripts:resolve', function (script) {
                item.class.remove('scripts-collide');
            }));
        };
        var onAddBundle = function (asset, item) {
            var confirmElement = document.createElement('div');
            confirmElement.classList.add('confirm');
            confirmElement.classList.add('thumbnail');
            item.element.appendChild(confirmElement);
            var onMouseOver = function () {
                if (!dragging || grid.dragOver === asset)
                    return;
                if (!draggingData.ids && !draggingData.id) {
                    // script file drag
                    return;
                }
                var assetIds = draggingData.ids ? draggingData.ids.slice() : [draggingData.id];
                // don't allow to drag on it self
                if (assetIds.indexOf(parseInt(asset.get('id'), 10)) !== -1) {
                    return;
                }
                // make sure we'fe found at least 1 valid asset
                var valid = false;
                var bundleAssets = asset.get('data.assets');
                for (var i = 0; i < assetIds.length; i++) {
                    var draggedAsset = editor.call('assets:get', assetIds[i]);
                    if (!draggedAsset)
                        continue;
                    if (bundleAssets.indexOf(draggedAsset.get('id')) !== -1)
                        continue;
                    if (!draggedAsset.get('source')) {
                        var type = draggedAsset.get('type');
                        if (['folder', 'script', 'bundle'].indexOf(type) === -1) {
                            valid = true;
                            break;
                        }
                    }
                }
                if (!valid)
                    return;
                showGridDropHighlight(item);
                grid.dragOver = asset;
            };
            var onMouseOut = function () {
                if (!dragging || grid.dragOver !== asset)
                    return;
                gridDropBorder.classList.remove('active');
                grid.dragOver = undefined;
            };
            item.element.addEventListener('mouseout', onMouseOut, false);
            item.element.addEventListener('mouseover', onMouseOver, false);
        };
        editor.on('assets:add', function (asset, pos) {
            var events = [];
            var item = new ui_1.GridItem();
            item.asset = asset;
            item.class.add('type-' + asset.get('type'));
            item.element.addEventListener('mouseover', onAssetItemHover, false);
            item.element.addEventListener('mouseout', onAssetItemBlur, false);
            asset.once('destroy', onAssetItemRemove.bind(asset));
            var onMouseDown = function (evt) {
                evt.stopPropagation();
            };
            var onDragStart = function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                // if (!editor.call('permissions:write'))
                //     return;
                var type = 'asset.' + asset.get('type');
                var data = {
                    id: asset.get('id'),
                    ids: new Array()
                };
                var selectorType = editor.call('selector:type');
                var selectorItems = editor.call('selector:items');
                if (selectorType === 'asset' && selectorItems.length > 1) {
                    var path = selectorItems[0].get('path');
                    if (selectorItems.indexOf(asset) !== -1) {
                        var ids = [];
                        for (var i = 0; i < selectorItems.length; i++) {
                            // don't allow multi-path dragging
                            if (path.length !== selectorItems[i].get('path').length || path[path.length - 1] !== selectorItems[i].get('path')[path.length - 1])
                                return;
                            ids.push(parseInt(selectorItems[i].get('id'), 10));
                        }
                        type = 'assets';
                        data = {
                            id: '',
                            ids: ids
                        };
                    }
                }
                editor.call('drop:set', type, data);
                editor.call('drop:activate', true);
            };
            if (asset.get('type') === 'folder') {
                onAddFolder(asset, item);
                item.tree.elementTitle.addEventListener('mousedown', onMouseDown, false);
                item.tree.elementTitle.addEventListener('dragstart', onDragStart, false);
            }
            else if (asset.get('type') === 'script') {
                onAddScript(asset, item, events);
            }
            else if (asset.get('type') === 'bundle') {
                // onAddBundle(asset, item, events);
            }
            var updateTask = function () {
                var status = asset.get('task');
                item.class.remove('task', 'failed', 'running');
                if (status && typeof (status) === 'string' && status[0] !== '{') {
                    item.class.add('task', status);
                }
            };
            // add task status
            updateTask();
            asset.on('task:set', updateTask);
            item.element.draggable = true;
            item.element.addEventListener('mousedown', onMouseDown, false);
            item.element.addEventListener('dragstart', onDragStart, false);
            assetsIndex[asset.get('id')] = item;
            // source
            if (asset.get('source'))
                item.class.add('source');
            // TODO：assets过滤器功能
            // console.log(editor.call('assets:panel:filter:default'));
            // if (!editor.call('assets:panel:filter:default')('asset', asset)) {
            //     // console.log('assets:panel:filter:default');
            //     item.hidden = true;
            // }
            var fileSize = asset.get('file.size');
            if (!asset.get('source')) {
                // update thumbnails change
                asset.on('thumbnails.m:set', function (value) {
                    if (value.startsWith('/api')) {
                        // value = value.appendQuery('t=' + asset.get('file.hash'));
                        value = utility_1.Tools.appendQuery(value, 't=' + asset.get('file.hash'));
                    }
                    thumbnail.style.backgroundImage = 'url(' + value + ')';
                    thumbnail.classList.remove('placeholder');
                });
                asset.on('thumbnails.m:unset', function () {
                    thumbnail.style.backgroundImage = 'none';
                    thumbnail.classList.add('placeholder');
                });
            }
            // folder open
            if (asset.get('type') === 'folder') {
                // 文件夹双击
                item.element.addEventListener('dblclick', function () {
                    tree.clear();
                    item.tree.open = true;
                    editor.call('assets:filter:search', '');
                    editor.call('assets:panel:currentFolder', item.asset);
                    // change back selection
                    if (selector.type)
                        editor.call('selector:set', selector.prev.type, selector.prev.items);
                }, false);
            }
            // open sprite editor for textureatlas and sprite assets
            if (asset.get('type') === 'sprite' || asset.get('type') === 'textureatlas') {
                item.element.addEventListener('dblclick', function () {
                    editor.call('picker:sprites', item.asset);
                }, false);
            }
            var thumbnail;
            var evtSceneSettings;
            var evtAssetChanged;
            if (asset.get('type') === 'material' || asset.get('type') === 'model' || asset.get('type') === 'sprite' || (asset.get('type') === 'font') && !asset.get('source')) {
                var queuedRender = false;
                thumbnail = document.createElement('img');
                // thumbnail.changed = true;
                thumbnail.width = 64;
                thumbnail.height = 64;
                if (asset.get('type') !== 'sprite') {
                    thumbnail.classList.add('flipY');
                }
                var htmlCanvas = document.createElement('canvas');
                htmlCanvas.width = 64;
                htmlCanvas.height = 64;
                htmlCanvas.style.display = 'none';
                document.body.append(htmlCanvas);
                var engine = new BABYLON.Engine(htmlCanvas, true);
                var scene = new BABYLON.Scene(engine);
                // scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.Green());
                scene.clearColor.a = 0;
                var light = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(45, 45, 0), scene);
                var camera = new BABYLON.ArcRotateCamera("PreviewCamera", 10, 10, 10, new BABYLON.Vector3(0, 0, 0), scene);
                // camera.setPosition(new BABYLON.Vector3(20, 200, 400));
                camera.attachControl(htmlCanvas, true);
                camera.lowerBetaLimit = 0.1;
                camera.upperBetaLimit = (Math.PI / 2) * 0.99;
                camera.lowerRadiusLimit = 150;
                var box = BABYLON.MeshBuilder.CreateSphere('box', { diameter: 80 }, scene);
                // engine.runRenderLoop(() => {
                //     if (scene) {
                //         scene.render();
                //     }
                // });
                scene.render();
                BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, 64, function (data) {
                    console.log(data);
                    thumbnail.src = data;
                });
            }
            else {
                thumbnail = document.createElement('div');
                // (<HTMLElement>thumbnail).widt
            }
            item.thumbnail = thumbnail;
            thumbnail.classList.add('thumbnail');
            item.element.appendChild(thumbnail);
            if (asset.has('thumbnails') && !asset.get('source')) {
                thumbnail.style.backgroundImage = 'url("' + asset.get('thumbnails') + '")';
            }
            else {
                thumbnail.classList.add('placeholder');
            }
            var icon = document.createElement('div');
            icon.classList.add('icon');
            item.element.appendChild(icon);
            var label = item.labelElement = document.createElement('div');
            label.classList.add('label');
            label.textContent = asset.get('name');
            item.element.appendChild(label);
            var users = item.users = document.createElement('div');
            users.classList.add('users');
            item.element.appendChild(users);
            // update name/filename change
            events.push(asset.on('name:set', function (name, nameOld) {
                // grid
                label.textContent = asset.get('name');
                // tree
                if (item.tree) {
                    item.tree.text = asset.get('name');
                    // resort element (move match alphabetical order)
                    var parent = item.tree.parent;
                    item.tree.parent.element.removeChild(item.tree.element);
                    var closest = treeFindClosest(parent, item.tree, nameOld);
                    if (closest === -1) {
                        parent.element.appendChild(item.tree.element);
                    }
                    else {
                        parent.element.insertBefore(item.tree.element, parent.child(closest));
                    }
                    resizeQueue();
                }
                keepLegacyScriptsAtTop();
            }));
            events.push(asset.on('path:set', function (path, pathOld) {
                // show or hide based on filters
                item.hidden = !editor.call('assets:panel:filter:default')('asset', asset);
                if (item.tree) {
                    if (!pathOld.length || !path.length || path[path.length - 1] !== pathOld[pathOld.length - 1]) {
                        item.tree.parent.remove(item.tree);
                        var parent;
                        if (path.length) {
                            parent = assetsIndex[path[path.length - 1]].tree;
                        }
                        else {
                            parent = treeRoot;
                        }
                        var closest = treeFindClosest(parent, item.tree);
                        if (closest === -1) {
                            parent.append(item.tree);
                        }
                        else {
                            parent.appendBefore(item.tree, (parent.child(closest).ui));
                        }
                    }
                    if (currentFolder === asset)
                        editor.emit('assets:panel:currentFolder', currentFolder);
                }
                keepLegacyScriptsAtTop();
            }));
            if (!asset.get('source')) {
                // used event
                var evtUnused = editor.on('assets:used:' + asset.get('id'), function (state) {
                    if (state) {
                        item.class.remove('unused');
                    }
                    else {
                        item.class.add('unused');
                    }
                });
                // used state
                if (!editor.call('assets:used:get', asset.get('id')))
                    item.class.add('unused');
                // clean events
                item.once('destroy', function () {
                    evtUnused.unbind();
                });
            }
            // clean events
            item.once('destroy', function () {
                editor.call('selector:remove', asset);
                for (var i = 0; i < events.length; i++)
                    events[i].unbind();
                events = null;
                delete assetsIndex[asset.get('id')];
                if (evtSceneSettings)
                    evtSceneSettings.unbind();
                if (evtAssetChanged)
                    evtAssetChanged.unbind();
            });
            // grid.append(item);
            // append to grid
            var assets = editor.call('assets:raw');
            if (pos === -1 || !assets.data[pos + 1]) {
                grid.append(item);
            }
            else {
                grid.appendBefore(item, assetsIndex[assets.data[pos + 1].get('id')]);
            }
            resizeQueue();
            keepLegacyScriptsAtTop();
        });
        var keepLegacyScriptsAtTop = function () {
            if (!legacyScripts)
                return;
            // resort scripts folder in grid
            gridScripts.element.parentNode.removeChild(gridScripts.element);
            var first = grid.element.firstChild;
            if (first) {
                grid.element.insertBefore(gridScripts.element, first);
            }
            else {
                grid.element.appendChild(gridScripts.element);
            }
            // resort scripts folder in tree
            treeScripts.element.parentNode.removeChild(treeScripts.element);
            var next = treeRoot.elementTitle.nextSibling;
            if (next) {
                treeRoot.element.insertBefore(treeScripts.element, next);
            }
            else {
                treeRoot.element.appendChild(treeScripts.element);
            }
        };
        editor.on('assets:move', function (asset, pos) {
            var item = assetsIndex[asset.get('id')];
            // remove
            grid.element.removeChild(item.element);
            // append
            if (pos === -1) {
                // to end
                grid.append(item);
            }
            else {
                // before another element
                grid.appendBefore(item, assetsIndex[editor.call('assets:raw').data[pos + 1].get('id')]);
            }
        });
        editor.on('assets:remove', function (asset) {
            var treeItem = assetsIndex[asset.get('id')].tree;
            if (treeItem) {
                if (treeItem.parent)
                    treeItem.parent.remove(treeItem);
                treeItem.destroy();
            }
            assetsIndex[asset.get('id')].destroy();
            resizeQueue();
            // reselect current directory, if selected was removed
            if (currentFolder && typeof (currentFolder) !== 'string') {
                var id = parseInt(currentFolder.get('id'), 10);
                var path = asset.get('path');
                var ind = path.indexOf(id);
                if (id === parseInt(asset.get('id'), 10) || ind !== -1) {
                    if (ind === -1)
                        ind = path.length - 1;
                    var found = false;
                    var i = ind + 1;
                    while (i--) {
                        if (assetsIndex[path[i]]) {
                            found = true;
                            editor.call('assets:panel:currentFolder', assetsIndex[path[i]].asset);
                            break;
                        }
                    }
                    if (!found)
                        editor.call('assets:panel:currentFolder', null);
                }
            }
        });
        var addSourceFile = function (file) {
            file.set('type', 'script');
            var item = new ui_1.GridItem();
            item.script = file;
            item.class.add('type-script');
            grid.append(item);
            if (!editor.call('assets:panel:filter:default')('script', file)) {
                item.hidden = true;
            }
            scriptsIndex[file.get('filename')] = item;
            var thumbnail = document.createElement('div');
            thumbnail.classList.add('thumbnail', 'placeholder');
            item.element.appendChild(thumbnail);
            var icon = document.createElement('div');
            icon.classList.add('icon');
            item.element.appendChild(icon);
            var label = item.labelElement = document.createElement('div');
            label.classList.add('label');
            label.textContent = file.get('filename');
            item.element.appendChild(label);
            var users = item.users = document.createElement('div');
            users.classList.add('users');
            item.element.appendChild(users);
            // update name/filename change
            var evtNameSet = file.on('filename:set', function (value, valueOld) {
                label.textContent = value;
                scriptsIndex[value] = item;
                delete scriptsIndex[valueOld];
            });
            item.on('destroy', function () {
                editor.call('selector:remove', file);
                evtNameSet.unbind();
                delete scriptsIndex[file.get('filename')];
            });
            file.on('destroy', function () {
                item.destroy();
            });
            editor.call('drop:item', {
                element: item.element,
                type: 'asset.script',
                data: {
                    filename: file.get('filename')
                }
            });
        };
        var removeSourceFile = function (file) {
            file.destroy();
        };
        editor.on('sourcefiles:add', addSourceFile);
        editor.on('sourcefiles:remove', removeSourceFile);
    }
    return AssetsPanel;
}());
exports.AssetsPanel = AssetsPanel;
},{"../../engine":89,"../../ui":108,"../utility":78}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsPreview = void 0;
var AssetsPreview = /** @class */ (function () {
    function AssetsPreview() {
        editor.method('preview:render', function (asset, width, height, canvas, args) {
            width = width || 1;
            height = height || 1;
            // render
            editor.call('preview:' + asset.get('type') + ':render', asset, width, height, canvas, args);
        });
    }
    return AssetsPreview;
}());
exports.AssetsPreview = AssetsPreview;
},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsStore = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var AssetsStore = /** @class */ (function () {
    function AssetsStore() {
        var assetsPanel = engine_1.VeryEngine.assets;
        var btnStore = new ui_1.Button('资源库');
        btnStore.class.add('store');
        assetsPanel.header.append(btnStore);
        btnStore.on('click', function () {
            window.open('http://www.veryengine.cn/', '_blank');
        });
    }
    return AssetsStore;
}());
exports.AssetsStore = AssetsStore;
},{"../../engine":89,"../../ui":108}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsSync = void 0;
var lib_1 = require("../../lib");
var AssetsSync = /** @class */ (function () {
    function AssetsSync() {
        editor.method("initAssets", function (assets_data) {
            onLoad(assets_data);
        });
        // Asseting, uniqueId为assets索引id
        editor.method('loadAsset', function (asset_data, callback) {
            var assetData = asset_data;
            // if (assetData.file) {
            //     // 生成资源所在url，这里并没有开始加载资源
            //     assetData.file.url = getFileUrl(assetData.id, assetData.revision, assetData.file.filename);
            //     if (assetData.file.variants) {
            //         for (var key in assetData.file.variants) {
            //             assetData.file.variants[key].url = getFileUrl(assetData.id, assetData.revision, assetData.file.variants[key].filename);
            //         }
            //     }
            // }
            var asset = new lib_1.Observer(assetData);
            editor.call('assets:add', asset);
            // console.log("load: " + asset.get("name"));
            if (callback)
                callback(asset);
        });
        // 加载assets数据，data为assets数据
        var onLoad = function (data) {
            editor.call('assets:progress', 0.5);
            var count = 0;
            var assetsLength = Object.getOwnPropertyNames(data).length;
            // 加载Asset资源
            var load = function (asset_data) {
                editor.call('loadAsset', asset_data, function () {
                    count++;
                    editor.call('assets:progress', (count / assetsLength) * 0.5 + 0.5);
                    if (count >= assetsLength) {
                        editor.call('assets:progress', 1);
                        editor.emit('assets:load');
                    }
                });
            };
            for (var key in data) {
                load(data[key]);
            }
        };
        var onAssetSelect = function (asset) {
            editor.call('selector:set', 'asset', [asset]);
            // navigate to folder too
            var path = asset.get('path');
            if (path.length) {
                editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
            }
            else {
                editor.call('assets:panel:currentFolder', null);
            }
        };
        // create asset
        editor.method('assets:create', function (data, fn, noSelect) {
            var evtAssetAdd;
            if (!noSelect) {
                editor.once('selector:change', function () {
                    if (evtAssetAdd) {
                        evtAssetAdd.unbind();
                        evtAssetAdd = null;
                    }
                });
            }
            editor.call('assets:uploadFile', data, function (err, res) {
                if (err) {
                    editor.call('status:error', err);
                    // TODO
                    // disk allowance error
                    if (fn)
                        fn(err);
                    return;
                }
                if (!noSelect) {
                    var asset = editor.call('assets:get', res.id);
                    if (asset) {
                        onAssetSelect(asset);
                    }
                    else {
                        evtAssetAdd = editor.once('assets:add[' + res.id + ']', onAssetSelect);
                    }
                }
                if (fn)
                    fn(err, res.id);
            });
        });
    }
    return AssetsSync;
}());
exports.AssetsSync = AssetsSync;
},{"../../lib":93}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsUpload = void 0;
var engine_1 = require("../../engine");
var lib_1 = require("../../lib");
var utility_1 = require("../utility");
var global_1 = require("../global");
var AssetsUpload = /** @class */ (function () {
    function AssetsUpload() {
        // 当前任务记录
        var uploadJobs = 0;
        var userSettings = editor.call('settings:projectUser');
        // var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
        var legacyScripts = false;
        var targetExtensions = {
            'jpg': true,
            'jpeg': true,
            'png': true,
            'gif': true,
            'table': true,
            'html': true,
            'json': true,
            'xml': true,
            'txt': true,
            'vert': true,
            'frag': true,
            'glsl': true,
            'mp3': true,
            'ogg': true,
            'wav': true,
            'mp4': true,
            'm4a': true,
            'js': true,
            'atlas': true,
            'babylon': true
        };
        var typeToExt = {
            'scene': ['fbx', 'dae', 'obj', '3ds', 'babylon'],
            'text': ['txt', 'xml', 'atlas', 'table'],
            'html': ['html'],
            'json': ['json'],
            'texture': ['tif', 'tga', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'dds', 'hdr', 'exr'],
            'audio': ['wav', 'mp3', 'mp4', 'ogg', 'm4a'],
            'shader': ['glsl', 'frag', 'vert'],
            'script': ['js'],
            'font': ['ttf', 'ttc', 'otf', 'dfont']
        };
        var extToType = {};
        for (var type in typeToExt) {
            for (var i = 0; i < typeToExt[type].length; i++) {
                extToType[typeToExt[type][i]] = type;
            }
        }
        editor.method('assets:canUploadFiles', function (files) {
            // check usage first
            var totalSize = 0;
            for (var i = 0; i < files.length; i++) {
                totalSize += files[i].size;
            }
            // 计算用户当前空间用量，假如要限制每个用户的空间大小，超过则不允许再上传
            // return config.owner.size + totalSize <= config.owner.diskAllowance;
            console.log('资源总容量：' + (totalSize / 1024 / 1024));
            return true;
        });
        var appendCommon = function (form, args) {
            // NOTE
            // non-file form data should be above file,
            // to make it parsed on back-end first
            // branch id
            // form.append('branchId', "config.self.branch.id");
            //
            // parent folder
            if (args.parent) {
                if (args.parent instanceof lib_1.Observer) {
                    form.append('parent', args.parent.get('id'));
                }
                else {
                    var id = parseInt(args.parent, 10);
                    if (!isNaN(id))
                        form.append('parent', id + '');
                }
            }
            // conversion pipeline specific parameters
            // var settings = editor.call('settings:projectUser');
            // switch (args.type) {
            //     case 'texture':
            //     case 'textureatlas':
            //         form.append('pow2', settings.get('editor.pipeline.texturePot'));
            //         form.append('searchRelatedAssets', settings.get('editor.pipeline.searchRelatedAssets'));
            //         break;
            //     case 'scene':
            //         form.append('searchRelatedAssets', settings.get('editor.pipeline.searchRelatedAssets'));
            //         form.append('overwriteModel', settings.get('editor.pipeline.overwriteModel'));
            //         form.append('overwriteAnimation', settings.get('editor.pipeline.overwriteAnimation'));
            //         form.append('overwriteMaterial', settings.get('editor.pipeline.overwriteMaterial'));
            //         form.append('overwriteTexture', settings.get('editor.pipeline.overwriteTexture'));
            //         form.append('pow2', settings.get('editor.pipeline.texturePot'));
            //         form.append('preserveMapping', settings.get('editor.pipeline.preserveMapping'));
            //         break;
            //     case 'font':
            //         break;
            //     default:
            //         break;
            // }
            // filename
            if (args.filename) {
                form.append('filename', args.filename);
            }
            // file
            if (args.file && args.file.size) {
                form.append('file', args.file, (args.filename || args.name));
            }
            return form;
        };
        var create = function (args) {
            var form = new FormData();
            // scope
            // form.append('projectId', config.project.id);
            // type
            if (!args.type) {
                console.error('\"type\" required for upload request');
            }
            form.append('type', args.type);
            // name
            if (args.name) {
                form.append('name', args.name);
            }
            // tags
            if (args.tags) {
                form.append('tags', args.tags.join('\n'));
            }
            // source_asset_id
            if (args.source_asset_id) {
                form.append('source_asset_id', args.source_asset_id);
            }
            // data
            if (args.data) {
                form.append('data', JSON.stringify(args.data));
            }
            // meta
            if (args.meta) {
                form.append('meta', JSON.stringify(args.meta));
            }
            // preload
            form.append('preload', args.preload === undefined ? true : args.preload);
            form = appendCommon(form, args);
            return form;
        };
        var update = function (assetId, args) {
            var form = new FormData();
            form = appendCommon(form, args);
            return form;
        };
        editor.method('assets:uploadFile', function (args, fn) {
            var method = 'POST';
            var url = '/api/upload';
            var form = null;
            if (args.asset) {
                var assetId = args.asset.get('id');
                method = 'PUT';
                url = '/api/upload/' + assetId;
                form = update(assetId, args);
            }
            else {
                form = create(args);
            }
            form.append("projectID", global_1.Config.projectID);
            var job = ++uploadJobs;
            editor.call('status:job', 'asset-upload:' + job, 0);
            var data = {
                url: url,
                method: method,
                // auth: true,
                data: form,
                ignoreContentType: true,
            };
            new utility_1.Ajax(data)
                .on("load", function (status, data) {
                console.log("status: " + status);
                console.log(data);
                if (data.code === "0000") {
                    var asset = new lib_1.Observer(data.data);
                    editor.call('assets:add', asset);
                }
            });
            // Ajax.post(url, form);
            // 上传数据，具体入口
            // Ajax(data)
            //     .on('load', function (status, data) {
            //         editor.call('status:job', 'asset-upload:' + job);
            //         if (fn) {
            //             fn(null, data);
            //         }
            //     })
            //     .on('progress', function (progress) {
            //         editor.call('status:job', 'asset-upload:' + job, progress);
            //     })
            //     .on('error', function (status, data) {
            //         if (/Disk allowance/.test(data)) {
            //             data += '. <a href="/upgrade" target="_blank">UPGRADE</a> to get more disk space.';
            //         }
            //         editor.call('status:error', data);
            //         editor.call('status:job', 'asset-upload:' + job);
            //         if (fn) {
            //             fn(data);
            //         }
            //     });
        });
        editor.method('assets:upload:files', function (files) {
            if (!editor.call('assets:canUploadFiles', files)) {
                // var msg = 'Disk allowance exceeded. <a href="/upgrade" target="_blank">UPGRADE</a> to get more disk space.';
                // editor.call('status:error', msg);
                return;
            }
            var currentFolder = editor.call('assets:panel:currentFolder');
            // 遍历每一个文件
            for (var i = 0; i < files.length; i++) {
                var path = [];
                if (currentFolder && currentFolder.get)
                    path = currentFolder.get('path').concat(parseInt(currentFolder.get('id'), 10));
                console.error(path);
                var source = false;
                var ext1 = files[i].name.split('.');
                if (ext1.length === 1)
                    continue;
                var ext = ext1[ext1.length - 1].toLowerCase();
                var type = extToType[ext] || 'binary';
                var source = type !== 'binary' && !targetExtensions[ext];
                // check if we need to convert textures to texture atlases
                // if (type === 'texture' && userSettings.get('editor.pipeline.textureDefaultToAtlas')) {
                //     type = 'textureatlas';
                // }
                // can we overwrite another asset?
                var sourceAsset = null;
                // var candidates = editor.call('assets:find', function (item: Observer) {
                //     // check files in current folder only
                //     if (!item.get('path').equals(path))
                //         return false;
                //     // try locate source when dropping on its targets
                //     if (source && !item.get('source') && item.get('source_asset_id')) {
                //         var itemSource = editor.call('assets:get', item.get('source_asset_id'));
                //         if (itemSource && itemSource.get('type') === type && itemSource.get('name').toLowerCase() === files[i].name.toLowerCase()) {
                //             sourceAsset = itemSource;
                //             return false;
                //         }
                //     }
                //     if (item.get('source') === source && item.get('name').toLowerCase() === files[i].name.toLowerCase()) {
                //         // we want the same type or try to replace a texture atlas with the same name if one exists
                //         if (item.get('type') === type || (type === 'texture' && item.get('type') === 'textureatlas')) {
                //             return true;
                //         }
                //     }
                //     return false;
                // });
                // candidates contains [index, asset] entries. Each entry
                // represents an asset that could be overwritten by the uploaded asset.
                // Use the first candidate by default (or undefined if the array is empty).
                // If we are uploading a texture try to find a textureatlas candidate and
                // if one exists then overwrite the textureatlas instead.
                // var asset = candidates[0];
                // if (type === 'texture') {
                //     for (var j = 0; j < candidates.length; j++) {
                //         if (candidates[j][1].get('type') === 'textureatlas') {
                //             asset = candidates[j];
                //             type = 'textureatlas';
                //             break;
                //         }
                //     }
                // }
                var data = null;
                if (ext === 'js') {
                    data = {
                        order: 100,
                        scripts: {}
                    };
                }
                console.log("upload");
                editor.call('assets:uploadFile', {
                    // asset: asset ? asset[1] : sourceAsset,
                    asset: null,
                    file: files[i],
                    type: type,
                    name: files[i].name,
                    parent: editor.call('assets:panel:currentFolder'),
                    pipeline: true,
                    data: data,
                    // meta: asset ? asset[1].get('meta') : null,
                    meta: null
                }, function (err, data) {
                    var onceAssetLoad = function (asset) {
                        var url = asset.get('file.url');
                        if (url) {
                            editor.call('scripts:parse', asset);
                        }
                        else {
                            asset.once('file.url:set', function () {
                                editor.call('scripts:parse', asset);
                            });
                        }
                    };
                    var asset = editor.call('assets:get', data.id);
                    if (asset) {
                        onceAssetLoad(asset);
                    }
                    else {
                        editor.once('assets:add[' + data.id + ']', onceAssetLoad);
                    }
                });
            }
        });
        // 上传文件或文件夹，文件上传入口
        editor.method('assets:upload:picker', function (args) {
            args = args || {};
            var parent = args.parent || editor.call('assets:panel:currentFolder');
            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            // 服务器需要识别此name
            fileInput.name = "file";
            // fileInput.accept = '';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            fileInput.style.verticalAlign = 'middle';
            fileInput.style.textAlign = 'center';
            engine_1.VeryEngine.assets.append(fileInput);
            var onChange = function () {
                editor.call('assets:upload:files', fileInput.files);
                // 上传文件以后，开始做一些处理
                // 解析.babylon文件，初步处理以后上传给服务器
                var fl = fileInput.files.length;
                var i = 0;
                while (i < fl) {
                    // localize file var in the loop
                    var file = fileInput.files[i];
                    console.log('name: ' + file.name);
                    console.warn('type: ' + file.type);
                    console.warn('size: ' + file.size);
                    // console.warn('lastModified: ' + file.lastModified);
                    i++;
                }
                fileInput.value = '';
                fileInput.removeEventListener('change', onChange);
                fileInput.parentNode.removeChild(fileInput);
            };
            fileInput.addEventListener('change', onChange, false);
            fileInput.click();
        });
    }
    return AssetsUpload;
}());
exports.AssetsUpload = AssetsUpload;
},{"../../engine":89,"../../lib":93,"../global":37,"../utility":78}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assets = void 0;
var lib_1 = require("../../lib");
var Assets = /** @class */ (function () {
    function Assets() {
        // var uniqueIdToItemId: any = {};
        // assets资源排序：folder资源排列在最前面，按文件夹名字排列；其他资源按name进行后续排序;
        var assets = new lib_1.ObserverList({
            index: 'id',
            sorted: function (a, b) {
                var a1 = a.get('type') === 'folder';
                var b1 = b.get('type') === 'folder';
                if (a1 !== b1) {
                    if (a1 && !b1)
                        return -1;
                    else
                        return 1;
                }
                var na = a.get('name').toLowerCase();
                var nb = b.get('name').toLowerCase();
                if (na === nb) {
                    return 0;
                }
                else if (na > nb) {
                    return 1;
                }
                else {
                    return -1;
                }
                // return a.get('name').toLowerCase().localeCompare(b.get('name').toLowerCase(), 'en');
            }
        });
        // return assets ObserverList
        editor.method('assets:raw', function () {
            return assets;
        });
        // allow adding assets
        editor.method('assets:add', function (asset) {
            // uniqueIdToItemId[asset.get('uniqueId')] = asset.get('id');
            var pos = assets.add(asset);
            if (pos === null)
                return;
            asset.on('name:set', function (name, nameOld) {
                name = name.toLowerCase();
                nameOld = nameOld.toLowerCase();
                var ind = assets.data.indexOf(asset);
                var pos = assets.positionNextClosest(asset, function (a, b) {
                    var a1 = a.get('type') === 'folder';
                    var b1 = b.get('type') === 'folder';
                    if (a1 !== b1) {
                        if (a1 && !b1)
                            return -1;
                        else
                            return 1;
                    }
                    var na = a.get('name').toLowerCase();
                    var nb = b.get('name').toLowerCase();
                    if (na === nb) {
                        return 0;
                    }
                    else if (na > nb) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                    // return a.get('name').toLowerCase().localeCompare(b.get('name').toLowerCase(), 'en');
                });
                if (pos === -1 && (ind + 1) == assets.data.length)
                    return;
                if (ind !== -1 && (ind + 1 === pos) || (ind === pos))
                    return;
                if (ind < pos)
                    pos--;
                assets.move(asset, pos);
                editor.emit('assets:move', asset, pos);
            });
            // publish added asset
            editor.emit('assets:add[' + asset.get('id') + ']', asset, pos);
            editor.emit('assets:add', asset, pos);
        });
        // allow removing assets
        editor.method('assets:remove', function (asset) {
            assets.remove(asset);
        });
        // remove all assets
        editor.method('assets:clear', function () {
            assets.clear();
            editor.emit('assets:clear');
            // uniqueIdToItemId = {};
        });
        // get asset by id
        editor.method('assets:get', function (id) {
            return assets.get(id);
        });
        // get asset by unique id
        // editor.method('assets:getUnique', function (uniqueId: string) {
        //     var id = uniqueIdToItemId[uniqueId];
        //     return id ? assets.get(id) : null;
        // });
        // find assets by function
        editor.method('assets:find', function (fn) {
            return assets.find(fn);
        });
        // find one asset by function
        editor.method('assets:findOne', function (fn) {
            return assets.findOne(fn);
        });
        editor.method('assets:map', function (fn) {
            assets.map(fn);
        });
        editor.method('assets:list', function () {
            return assets.array();
        });
        // publish remove asset
        assets.on('remove', function (asset) {
            asset.destroy();
            editor.emit('assets:remove', asset);
            editor.emit('assets:remove[' + asset.get('id') + ']');
            // delete uniqueIdToItemId[asset.get('uniqueId')];
        });
    }
    return Assets;
}());
exports.Assets = Assets;
},{"../../lib":93}],16:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./assets"), exports);
__exportStar(require("./assets-sync"), exports);
__exportStar(require("./assets-panel"), exports);
__exportStar(require("./assets-preview"), exports);
__exportStar(require("./assets-panel-control"), exports);
__exportStar(require("./assets-context-menu"), exports);
__exportStar(require("./assets-filter"), exports);
__exportStar(require("./assets-upload"), exports);
__exportStar(require("./assets-drop"), exports);
__exportStar(require("./assets-store"), exports);
__exportStar(require("./assets-create-folder"), exports);
__exportStar(require("./assets-create-table"), exports);
__exportStar(require("./keeper"), exports);
},{"./assets":15,"./assets-context-menu":4,"./assets-create-folder":5,"./assets-create-table":6,"./assets-drop":7,"./assets-filter":8,"./assets-panel":10,"./assets-panel-control":9,"./assets-preview":11,"./assets-store":12,"./assets-sync":13,"./assets-upload":14,"./keeper":17}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsKeeper = void 0;
var assets_panel_1 = require("./assets-panel");
var assets_panel_control_1 = require("./assets-panel-control");
var assets_filter_1 = require("./assets-filter");
var assets_upload_1 = require("./assets-upload");
var assets_store_1 = require("./assets-store");
var assets_context_menu_1 = require("./assets-context-menu");
var assets_1 = require("./assets");
var assets_create_folder_1 = require("./assets-create-folder");
var assets_sync_1 = require("./assets-sync");
var assets_drop_1 = require("./assets-drop");
var assets_create_table_1 = require("./assets-create-table");
var AssetsKeeper = /** @class */ (function () {
    function AssetsKeeper() {
        var assets = new assets_1.Assets();
        var syncAssets = new assets_sync_1.AssetsSync();
        var assetPanel = new assets_panel_1.AssetsPanel();
        var panelControl = new assets_panel_control_1.AssetsPanelControl();
        var filter = new assets_filter_1.AssetsFilter();
        var createFolder = new assets_create_folder_1.AssetsCreateFolder();
        var contextMenu = new assets_context_menu_1.AssetsContextMenu();
        var createTable = new assets_create_table_1.AssetsCreateTable();
        var upload = new assets_upload_1.AssetsUpload();
        var drop = new assets_drop_1.AssetsDrop();
        var library = new assets_store_1.AssetsStore();
        // let test = new TestAssets();
    }
    return AssetsKeeper;
}());
exports.AssetsKeeper = AssetsKeeper;
},{"./assets":15,"./assets-context-menu":4,"./assets-create-folder":5,"./assets-create-table":6,"./assets-drop":7,"./assets-filter":8,"./assets-panel":10,"./assets-panel-control":9,"./assets-store":12,"./assets-sync":13,"./assets-upload":14}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeAssetsTexture = void 0;
var ui_1 = require("../../../ui");
var AttributeAssetsTexture = /** @class */ (function () {
    function AttributeAssetsTexture() {
        var panelsStates = {};
        editor.on('attributes:inspect[asset]', function (assets) {
            console.error('attributes:inspect[asset]');
            console.error(assets);
            for (var i = 0; i < assets.length; i++) {
                if (assets[i].get('type') !== 'texture' && assets[i].get('type') !== 'textureatlas' || assets[i].get('source'))
                    return;
            }
            var events = [];
            var ids = [];
            for (var i = 0; i < assets.length; i++)
                ids.push(assets[i].get('id'));
            var id = ids.sort(function (a, b) {
                return a.localeCompare(b);
            }).join(',');
            var panelState = panelsStates[id];
            var panelStateNew = false;
            if (!panelState) {
                panelStateNew = true;
                panelState = panelsStates[id] = {};
                panelState['texture'] = false;
                panelState['compression'] = false;
            }
            // 多个材质，改变属性面板标题
            if (assets.length > 1) {
                var numTextures = 0;
                var numTextureAtlases = 0;
                for (var i = 0; i < assets.length; i++) {
                    if (assets[i].get('type') === 'texture') {
                        numTextures++;
                    }
                    else {
                        numTextureAtlases++;
                    }
                }
                var msg = '';
                var comma = '';
                if (numTextures) {
                    msg += numTextures + ' Texture' + (numTextures > 1 ? 's' : '');
                    comma = ', ';
                }
                if (numTextureAtlases) {
                    msg += comma + numTextureAtlases + ' Texture Atlas' + (numTextureAtlases > 1 ? 'es' : '');
                }
                editor.call('attributes:header', msg);
            }
            // properties panel
            var panel = editor.call('attributes:addPanel', {
                name: 'Texture',
                foldable: true,
                folded: panelState['texture']
            });
            panel.class.add('component');
            panel.on('fold', function () { panelState['texture'] = true; });
            panel.on('unfold', function () { panelState['texture'] = false; });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:asset', panel, panel.headerElement);
            // Calculate Meta按钮，暂时没用其实
            var btnGetMeta = new ui_1.Button('Calculate Meta');
            btnGetMeta.class.add('calculate-meta', 'large-with-icon');
            var btnGetMetaVisibility = function () {
                var visible = false;
                for (var i = 0; i < assets.length; i++) {
                    if (!visible && !assets[i].get('meta'))
                        visible = true;
                }
                btnGetMeta.hidden = !visible;
            };
            btnGetMeta.on('click', function () {
                if (!editor.call('permissions:write'))
                    return;
                for (var i = 0; i < assets.length; i++) {
                    if (assets[i].get('meta'))
                        continue;
                    editor.call('realtime:send', 'pipeline', {
                        name: 'meta',
                        id: assets[i].get('uniqueId')
                    });
                }
                btnGetMeta.enabled = false;
            });
            panel.append(btnGetMeta);
            btnGetMetaVisibility();
            for (var i = 0; i < assets.length; i++) {
                if (btnGetMeta.hidden && !assets[i].get('meta'))
                    btnGetMeta.hidden = false;
                events.push(assets[i].on('meta:set', function () {
                    btnGetMetaVisibility();
                }));
                events.push(assets[i].on('meta:unset', function () {
                    btnGetMeta.hidden = false;
                }));
            }
            // width
            var fieldWidth = editor.call('attributes:addField', {
                parent: panel,
                name: 'Width',
                link: assets,
                path: 'meta.width',
                placeholder: 'pixels'
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:width', fieldWidth.parent.innerElement.firstChild.ui);
            // height
            var fieldHeight = editor.call('attributes:addField', {
                parent: panel,
                name: 'Height',
                link: assets,
                path: 'meta.height',
                placeholder: 'pixels'
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:height', fieldHeight.parent.innerElement.firstChild.ui);
            // depth
            var fieldDepth = editor.call('attributes:addField', {
                parent: panel,
                name: 'Depth',
                link: assets,
                path: 'meta.depth',
                placeholder: 'bit'
            });
            var checkDepthField = function () {
                if (!fieldDepth.value)
                    fieldDepth.element.innerHTML = 'unknown';
            };
            checkDepthField();
            fieldDepth.on('change', checkDepthField);
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:depth', fieldDepth.parent.innerElement.firstChild.ui);
            // alpha
            var fieldAlpha = editor.call('attributes:addField', {
                parent: panel,
                name: 'Alpha',
                link: assets,
                path: 'meta.alpha'
            });
            var checkAlphaField = function () {
                if (!fieldAlpha.value)
                    fieldAlpha.element.innerHTML = 'false';
            };
            checkAlphaField();
            fieldAlpha.on('change', checkAlphaField);
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:alpha', fieldAlpha.parent.innerElement.firstChild.ui);
            // interlaced
            var fieldInterlaced = editor.call('attributes:addField', {
                parent: panel,
                name: 'Interlaced',
                link: assets,
                path: 'meta.interlaced'
            });
            var checkInterlacedField = function () {
                if (!fieldInterlaced.value)
                    fieldInterlaced.element.innerHTML = 'false';
            };
            checkInterlacedField();
            fieldInterlaced.on('change', checkInterlacedField);
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:interlaced', fieldInterlaced.parent.innerElement.firstChild.ui);
            // rgbm
            var fieldRgbm = editor.call('attributes:addField', {
                parent: panel,
                name: 'Rgbm',
                link: assets,
                path: 'data.rgbm',
                type: 'checkbox'
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:rgbm', fieldRgbm.parent.innerElement.firstChild.ui);
            // mipmaps
            var fieldMips = editor.call('attributes:addField', {
                parent: panel,
                name: 'Mipmaps',
                link: assets,
                path: 'data.mipmaps',
                type: 'checkbox'
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:mipmaps', fieldMips.parent.innerElement.firstChild.ui);
            // filtering
            var fieldFiltering = editor.call('attributes:addField', {
                parent: panel,
                name: 'Filtering',
                type: 'string',
                enum: {
                    '': '...',
                    'nearest': 'Point',
                    'linear': 'Linear'
                }
            });
            // reference
            editor.call('attributes:reference:attach', 'asset:texture:filtering', fieldFiltering.parent.innerElement.firstChild.ui);
            // preview
            if (assets.length === 1) {
                var root = editor.call('attributes.rootPanel');
                var reloadImage = function () {
                    // if (assets[0].get('file.url') && assets[0].get('file.hash')) {
                    //     image.src = assets[0].get('file.url').appendQuery('t=' + assets[0].get('file.hash'));
                    //     previewContainer.style.display = '';
                    // } else {
                    //     previewContainer.style.display = 'none';
                    // }
                    if (assets[0].get('file.url')) {
                        image.src = assets[0].get('file.url');
                        previewContainer.style.display = '';
                    }
                    else {
                        previewContainer.style.display = 'none';
                    }
                };
                var previewContainer = document.createElement('div');
                previewContainer.classList.add('asset-preview-container');
                var preview = document.createElement('div');
                preview.classList.add('asset-preview');
                var image = new Image();
                image.onload = function () {
                    root.class.add('animate');
                    preview.style.backgroundImage = 'url("' + image.src + '")';
                };
                reloadImage();
                previewContainer.appendChild(preview);
                preview.addEventListener('click', function () {
                    if (root.element.classList.contains('large')) {
                        root.element.classList.remove('large');
                    }
                    else {
                        root.element.classList.add('large');
                    }
                }, false);
                root.class.add('asset-preview');
                root.element.insertBefore(previewContainer, root.innerElement);
                var eventsPreview = [];
                eventsPreview.push(assets[0].on('file.hash:set', reloadImage));
                eventsPreview.push(assets[0].on('file.url:set', reloadImage));
                panel.on('destroy', function () {
                    for (var i = 0; i < eventsPreview.length; i++)
                        eventsPreview[i].unbind();
                    previewContainer.parentNode.removeChild(previewContainer);
                    root.class.remove('asset-preview', 'animate');
                });
            }
            panel.once('destroy', function () {
                for (var i = 0; i < events.length; i++)
                    events[i].unbind();
            });
        });
    }
    return AttributeAssetsTexture;
}());
exports.AttributeAssetsTexture = AttributeAssetsTexture;
},{"../../../ui":108}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesAssets = void 0;
var ui_1 = require("../../ui");
var AttributesAssets = /** @class */ (function () {
    function AttributesAssets() {
        var sourceRuntimeOptions = {
            '-1': 'various',
            '0': 'yes',
            '1': 'no'
        };
        var editableTypes = {
            'script': 1,
            'table': 1,
            'html': 1,
            'shader': 1,
            'text': 1,
            'json': 1
        };
        var legacyScripts = false;
        var assetsPanel = null;
        editor.on('attributes:inspect[asset]', function (assets) {
            var events = [];
            // unfold panel
            var panel = editor.call('attributes.rootPanel');
            if (panel.folded)
                panel.folded = false;
            var multi = assets.length > 1;
            var type = ((assets[0].get('source') && assets[0].get('type') !== 'folder') ? 'source ' : '') + assets[0].get('type');
            if (multi) {
                editor.call('attributes:header', assets.length + ' assets');
                for (var i = 0; i < assets.length; i++) {
                    if (type !== ((assets[0].get('source') && assets[0].get('type') !== 'folder') ? 'source ' : '') + assets[i].get('type')) {
                        type = '';
                        break;
                    }
                }
            }
            else {
                editor.call('attributes:header', type);
            }
            // panel
            var panel = editor.call('attributes:addPanel');
            panel.class.add('component');
            assetsPanel = panel;
            panel.once('destroy', function () {
                assetsPanel = null;
                for (var i = 0; i < events.length; i++)
                    events[i].unbind();
                events = null;
            });
            // 暂时不考虑
            /*
            var allBundles = editor.call('assets:bundles:list');
            var bundlesEnum = { "": "" };
            for (var i = 0; i < allBundles.length; i++) {
                bundlesEnum[allBundles[i].get('id')] = allBundles[i].get('name');
            }
            */
            if (multi) {
                var fieldFilename = editor.call('attributes:addField', {
                    parent: panel,
                    name: 'Assets',
                    value: assets.length
                });
                var scriptSelected = false;
            }
            else {
                if (legacyScripts && assets[0].get('type') === 'script') {
                    // filename
                    var fieldFilename = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Filename',
                        // type: 'string',
                        link: assets[0],
                        path: 'filename'
                    });
                    // reference
                    editor.call('attributes:reference:attach', 'asset:script:filename', fieldFilename.parent.innerElement.firstChild.ui);
                }
                else {
                    // id
                    var fieldId = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'ID',
                        link: assets[0],
                        path: 'id'
                    });
                    // reference
                    editor.call('attributes:reference:attach', 'asset:id', fieldId.parent.innerElement.firstChild.ui);
                    // name
                    var fieldName = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Name',
                        type: 'string',
                        value: assets[0].get('name')
                    });
                    events.push(assets[0].on('name:set', function (newName) {
                        fieldName.value = newName;
                    }));
                    events.push(fieldName.on('change', function (newName) {
                        if (newName !== assets[0].get('name')) {
                            editor.call('assets:rename', assets[0], newName);
                        }
                    }));
                    fieldName.class.add('asset-name');
                    // reference
                    editor.call('attributes:reference:attach', 'asset:name', fieldName.parent.innerElement.firstChild.ui);
                    if (!assets[0].get('source') && assets[0].get('type') !== 'folder') {
                        // tags
                        var fieldTags = editor.call('attributes:addField', {
                            parent: panel,
                            name: 'Tags',
                            placeholder: 'Add Tag',
                            type: 'tags',
                            tagType: 'string',
                            link: assets[0],
                            path: 'tags'
                        });
                        // reference
                        editor.call('attributes:reference:attach', 'asset:tags', fieldTags.parent.parent.innerElement.firstChild.ui);
                    }
                    // runtime
                    var runtime = sourceRuntimeOptions[assets[0].get('source') ? '1' : '0'];
                    // var runtime = sourceRuntimeOptions['0'];
                    if (assets[0].get('type') === 'folder')
                        runtime = sourceRuntimeOptions['1'];
                    var fieldRuntime = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Runtime',
                        value: runtime
                    });
                    // reference
                    editor.call('attributes:reference:attach', 'asset:runtime', fieldRuntime.parent.innerElement.firstChild.ui);
                    // taskInfo
                    var fieldFailed = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Failed',
                        link: assets[0],
                        path: 'taskInfo'
                    });
                    fieldFailed.class.add('error');
                    var checkFailed = function () {
                        fieldFailed.parent.hidden = assets[0].get('task') !== 'failed' || !assets[0].get('taskInfo');
                    };
                    checkFailed();
                    events.push(assets[0].on('task:set', checkFailed));
                    events.push(assets[0].on('taskInfo:set', checkFailed));
                    events.push(assets[0].on('taskInfo:unset', checkFailed));
                }
                // type
                var fieldType = editor.call('attributes:addField', {
                    parent: panel,
                    name: 'Type',
                    value: type
                });
                // reference
                editor.call('attributes:reference:attach', 'asset:type', fieldType.parent.innerElement.firstChild.ui);
                // reference type
                if (!assets[0].get('source'))
                    editor.call('attributes:reference:asset:' + assets[0].get('type') + ':asset:attach', fieldType);
                if (!(legacyScripts && assets[0].get('type') === 'script') && assets[0].get('type') !== 'folder' && !assets[0].get('source')) {
                    // preload
                    var fieldPreload = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Preload',
                        type: 'checkbox',
                        link: assets[0],
                        path: 'preload'
                    });
                    fieldPreload.parent.class.add('preload');
                    editor.call('attributes:reference:attach', 'asset:preload', fieldPreload.parent.innerElement.firstChild.ui);
                }
                // size
                /*
                if (assets[0].has('file') || assets[0].get('type') === 'bundle') {
                    var size = assets[0].get('type') === 'bundle' ? editor.call('assets:bundles:calculateSize', assets[0]) : assets[0].get('file.size');
                    var fieldSize = editor.call('attributes:addField', {
                        parent: panel,
                        name: 'Size',
                        value: bytesToHuman(size)
                    });

                    var evtSize = [];
                    evtSize.push(assets[0].on('file:set', function (value) {
                        fieldSize.text = bytesToHuman(value ? value.size : 0);
                    }));

                    evtSize.push(assets[0].on('file.size:set', function (value) {
                        fieldSize.text = bytesToHuman(value);
                    }));

                    if (assets[0].get('type') === 'bundle') {
                        var recalculateSize = function () {
                            fieldSize.text = bytesToHuman(editor.call('assets:bundles:calculateSize', assets[0]));
                        };

                        evtSize.push(assets[0].on('data.assets:set', recalculateSize));
                        evtSize.push(assets[0].on('data.assets:insert', recalculateSize));
                        evtSize.push(assets[0].on('data.assets:remove', recalculateSize));
                    }

                    panel.once('destroy', function () {
                        for (var i = 0; i < evtSize.length; i++) {
                            evtSize[i].unbind();
                        }
                        evtSize.length = 0;
                    });

                    // reference
                    editor.call('attributes:reference:attach', 'asset:size', fieldSize.parent.innerElement.firstChild.ui);
                }
                */
                // 下载区域按钮
                var panelButtons = new ui_1.Panel();
                panelButtons.class.add('buttons');
                panel.append(panelButtons);
                // download
                if (assets[0].get('type') !== 'folder' && !(legacyScripts && assets[0].get('type') === 'script') && assets[0].get('type') !== 'sprite') {
                    // download
                    var btnDownload = new ui_1.Button();
                    btnDownload.hidden = !editor.call('permissions:read');
                    var evtBtnDownloadPermissions = editor.on('permissions:set:' + 'id', function () {
                        btnDownload.hidden = !editor.call('permissions:read');
                    });
                    btnDownload.text = 'Download';
                    btnDownload.class.add('download-asset', 'large-with-icon');
                    btnDownload.element.addEventListener('click', function (evt) {
                        // if (btnDownload.prevent)
                        //     return;
                        // 下载
                        if (assets[0].get('source') || assets[0].get('type') === 'texture' || assets[0].get('type') === 'audio') {
                            window.open(assets[0].get('file.url'));
                        }
                        else {
                            window.open('/api/assets/' + assets[0].get('id') + '/download?branchId=' + 'id');
                        }
                    });
                    panelButtons.append(btnDownload);
                    btnDownload.once('destroy', function () {
                        evtBtnDownloadPermissions.unbind();
                    });
                }
            }
        });
        editor.on('attributes:assets:toggleInfo', function (enabled) {
            if (assetsPanel) {
                assetsPanel.hidden = !enabled;
            }
        });
        editor.method('attributes:assets:panel', function () {
            return assetsPanel;
        });
    }
    return AttributesAssets;
}());
exports.AttributesAssets = AttributesAssets;
},{"../../ui":108}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesFieldArgs = exports.AttributesEntity = void 0;
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
},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeHistory = void 0;
var AttributeHistory = /** @class */ (function () {
    function AttributeHistory() {
    }
    return AttributeHistory;
}());
exports.AttributeHistory = AttributeHistory;
},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesPanel = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var toolbar_1 = require("../toolbar");
var AttributesPanel = /** @class */ (function () {
    function AttributesPanel() {
        // private inspectedItems: EventHandle[] = [];
        this.title = '属性面板';
        this.root = engine_1.VeryEngine.attributes;
        this.init();
    }
    AttributesPanel.prototype.init = function () {
        var self = this;
        // clearing
        editor.method('attributes:clear', this.clearPanel);
        // set header
        editor.method('attributes:header', function (text) {
            self.root.headerText = text;
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
        // TODO
        var historyState = function (item, state) {
            if (item.history !== undefined) {
                if (typeof (item.history) === 'boolean') {
                    item.history = state;
                }
                else {
                    item.history.enabled = state;
                }
            }
            else {
                if (item._parent && item._parent.history !== undefined) {
                    item._parent.history.enabled = state;
                }
            }
        };
        // get the right path from args
        var pathAt = function (args, index) {
            return args.paths ? args.paths[index] : args.path;
        };
        editor.method('attributes:linkField', function (args) {
            var changeField, changeFieldQueue;
            args.field._changing = false;
            var events = [];
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
                        value = value.map(function (v) {
                            return Math.floor(v * 255);
                        });
                    }
                }
                else if (args.type === 'asset') {
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
                        if (!/^\* /.test(args.field._title.text))
                            args.field._title.text = '* ' + args.field._title.text;
                    }
                    else {
                        args.field.class.remove('star');
                        if (/^\* /.test(args.field._title.text))
                            args.field._title.text = args.field._title.text.substring(2);
                    }
                    if (different) {
                        args.field.class.add('null');
                        args.field._title.text = 'various';
                    }
                    else {
                        args.field.class.remove('null');
                    }
                }
                else if (args.type === 'entity' || !args.type) {
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
                    }
                    else {
                        args.field.class.remove('null');
                    }
                }
                else {
                    var valueFound = false;
                    for (var i = 0; i < args.link.length; i++) {
                        path = pathAt(args, i);
                        if (!args.link[i].has(path))
                            continue;
                        if (!valueFound) {
                            valueFound = true;
                            value = args.link[i].get(path);
                        }
                        else {
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
                    if (opt)
                        opt.style.display = value !== '' ? 'none' : '';
                }
                else {
                    args.field.proxy = value == null ? '...' : null;
                }
            };
            changeField = function (value) {
                if (args.field._changing)
                    return;
                // TODO
                if (args.enum) {
                    // var opt = this.optionElements[''];
                    // if (opt) opt.style.display = value !== '' ? 'none' : '';
                }
                else {
                    // this.proxy = value === null ? '...' : null;
                }
                if (args.trim)
                    value = value.trim();
                if (args.type === 'rgb') {
                    value = value.map(function (v) {
                        return v / 255;
                    });
                }
                else if (args.type === 'asset') {
                    args.field.class.remove('null');
                }
                var items = [];
                // set link value
                args.field._changing = true;
                if (args.type === "string" && args.trim)
                    args.field.value = value;
                for (var i = 0; i < args.link.length; i++) {
                    var path = pathAt(args, i);
                    if (!args.link[i].has(path))
                        continue;
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
                                }
                                else {
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
                            }
                            else {
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
                                }
                                else {
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
            var historyStart, historyEnd;
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
                historyEnd = function (items, value) {
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
                                }
                                else {
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
                                }
                                else {
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
                    var items = [];
                    // picking starts
                    var evtColorPickStart = editor.on('picker:color:start', function () {
                        items = historyStart();
                    });
                    // picked color
                    var evtColorPick = editor.on('picker:color', function (color) {
                        args.field.value = color;
                    });
                    var evtColorPickEnd = editor.on('picker:color:end', function () {
                        historyEnd(items.slice(0), args.field.value.map(function (v) {
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
            }
            else if (args.slider) {
                var sliderRecords;
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
        editor.method('attributes:addField', function (args) {
            var panel = args.panel;
            if (!panel) {
                panel = new ui_1.Panel();
                panel.flexWrap = 'nowrap';
                panel.WebkitFlexWrap = 'nowrap';
                panel.style.display = '';
                if (args.type) {
                    panel.class.add('field-' + args.type);
                }
                else {
                    panel.class.add('field');
                }
                (args.parent || self.root).append(panel);
            }
            if (args.name) {
                var label = new ui_1.Label(args.name);
                label.class.add('label-field');
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
            var field;
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
                    var link = function (field, path) {
                        var data = {
                            field: field,
                            type: args.type,
                            slider: args.slider,
                            enum: args.enum,
                            link: args.link,
                            trim: args.trim,
                            name: args.name,
                            stopHistory: args.stopHistory,
                            paths: new Array(),
                            path: ''
                        };
                        if (!path) {
                            path = args.paths || args.path;
                        }
                        if (path instanceof Array) {
                            data.paths = path;
                        }
                        else {
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
                                paths = paths.map(function (p) {
                                    return p + '.' + i.toString();
                                });
                            }
                            link(field[i], paths || (args.path + '.' + i));
                        }
                    }
                    else {
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
                        field = new ui_1.SelectField({
                            options: args.enum
                        });
                    }
                    else {
                        field = new ui_1.TextField();
                    }
                    field.value = args.value || '';
                    field.flexGrow = 1;
                    if (args.placeholder)
                        field.placeholder = args.placeholder;
                    linkField();
                    panel.append(field);
                    break;
                case 'text':
                    field = new ui_1.TextAreaField();
                    field.value = args.value || '';
                    field.flexGrow = 1;
                    if (args.placeholder)
                        field.placeholder = args.placeholder;
                    linkField();
                    panel.append(field);
                    break;
                case 'number':
                    if (args.enum) {
                        field = new ui_1.SelectField({
                            options: args.enum,
                            type: 'number'
                        });
                    }
                    else if (args.slider) {
                        field = new ui_1.Slider();
                    }
                    else {
                        field = new ui_1.NumberField();
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
                        field = new ui_1.SelectField({
                            options: args.enum,
                            type: 'boolean'
                        });
                        field.flexGrow = 1;
                    }
                    else {
                        field = new ui_1.Checkbox();
                    }
                    field.value = args.value || 0;
                    field.class.add('tick');
                    linkField();
                    panel.append(field);
                    break;
                default:
                    field = new ui_1.Label();
                    field.flexGrow = '1';
                    field.text = args.value || '';
                    field.class.add('selectable');
                    if (args.placeholder)
                        field.placeholder = args.placeholder;
                    linkField();
                    panel.append(field);
                    break;
            }
            if (args.className && field instanceof ui_1.Element) {
                field.class.add(args.className);
            }
            return field;
        });
        var inspectedItems = [];
        editor.on('attributes:clear', function () {
            for (var i = 0; i < inspectedItems.length; i++) {
                inspectedItems[i].unbind();
            }
            inspectedItems = [];
        });
        editor.method('attributes:inspect', function (type, item) {
            self.clearPanel();
            // clear if destroyed
            inspectedItems.push(item.once('destroy', function () {
                editor.call('attributes:clear');
            }));
            self.root.headerText = type;
            editor.emit('attributes:inspect[' + type + ']', [item]);
            editor.emit('attributes:inspect[*]', type, [item]);
        });
        editor.on('selector:change', function (type, items) {
            self.clearPanel();
            console.warn('selector:change：type --- ' + type + '* length --- ' + items.length);
            // nothing selected
            if (items.length === 0) {
                var label = new ui_1.Label('请选择物体或资源');
                label.style.display = 'block';
                label.style.textAlign = 'center';
                label.style.width = '100%';
                // label.style!.height = '22px';
                self.root.append(label);
                self.root.headerText = self.title;
                return;
            }
            // clear if destroyed
            for (var i = 0; i < items.length; i++) {
                // TODO：当前item为空
                console.error(items[i]);
                toolbar_1.GizmosManager.attach(items[i].node);
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
    };
    AttributesPanel.prototype.clearPanel = function () {
        editor.emit('attributes:beforeClear');
        this.root.clear();
        editor.emit('attributes:clear');
    };
    return AttributesPanel;
}());
exports.AttributesPanel = AttributesPanel;
},{"../../engine":89,"../../ui":108,"../toolbar":61}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesReference = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
// 属性参考说明Tooltip
var AttributesReference = /** @class */ (function () {
    function AttributesReference() {
        this.index = {};
        this.missing = {};
        this.root = engine_1.VeryEngine.root;
        this.attributesPanel = engine_1.VeryEngine.attributes;
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
},{"../../engine":89,"../../ui":108}],24:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./attributes-panel"), exports);
__exportStar(require("./attributes-entity"), exports);
__exportStar(require("./attributes-history"), exports);
__exportStar(require("./attributes-reference"), exports);
__exportStar(require("./attributes-assets"), exports);
__exportStar(require("./keeper"), exports);
},{"./attributes-assets":19,"./attributes-entity":20,"./attributes-history":21,"./attributes-panel":22,"./attributes-reference":23,"./keeper":25}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesKeeper = void 0;
var attributes_panel_1 = require("./attributes-panel");
var attributes_reference_1 = require("./attributes-reference");
var attributes_entity_1 = require("./attributes-entity");
var attributes_assets_1 = require("./attributes-assets");
var attributes_history_1 = require("./attributes-history");
var attributes_assets_texture_1 = require("./assets/attributes-assets-texture");
var AttributesKeeper = /** @class */ (function () {
    function AttributesKeeper() {
        var attributesPanel = new attributes_panel_1.AttributesPanel();
        var attributesHistory = new attributes_history_1.AttributeHistory();
        var attributesReference = new attributes_reference_1.AttributesReference();
        var attributesEntity = new attributes_entity_1.AttributesEntity();
        var attributesAsset = new attributes_assets_1.AttributesAssets();
        var attributesAssetsTexture = new attributes_assets_texture_1.AttributeAssetsTexture();
    }
    return AttributesKeeper;
}());
exports.AttributesKeeper = AttributesKeeper;
},{"./assets/attributes-assets-texture":18,"./attributes-assets":19,"./attributes-entity":20,"./attributes-history":21,"./attributes-panel":22,"./attributes-reference":23}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drop = void 0;
var Drop = /** @class */ (function () {
    function Drop() {
        // overlay
        var overlay = document.createElement('div');
        overlay.classList.add('drop-overlay');
        editor.call('layout.root').append(overlay);
        // var imgDrag = new Image();
        // // imgDrag.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAACWCAYAAAAfduJyAAAAFUlEQVQoU2NkYGBgYBwlRsNgJKQDAOAfAJflUZweAAAAAElFTkSuQmCC';
        // // imgDrag.style.display = 'none';
        var parts = ['top', 'right', 'bottom', 'left'];
        var partsElement = [];
        for (var i = 0; i < parts.length; i++) {
            var part = document.createElement('div');
            part.classList.add('drop-overlay-hole-part', parts[i]);
            editor.call('layout.root').append(part);
            partsElement.push(part);
        }
        // areas
        var areas = document.createElement('div');
        areas.classList.add('drop-areas');
        editor.call('layout.root').append(areas);
        var active = false;
        var currentType = '';
        var currentData = {};
        var currentElement = null;
        var dragOver = false;
        var items = [];
        var itemOver = null;
        var activate = function (state) {
            if (!editor.call('permissions:write'))
                return;
            if (active === state)
                return;
            active = state;
            if (active) {
                overlay.classList.add('active');
                areas.classList.add('active');
                editor.call('cursor:set', 'grabbing');
            }
            else {
                overlay.classList.remove('active');
                areas.classList.remove('active');
                dragOver = false;
                currentType = '';
                currentData = {};
                editor.emit('drop:set', currentType, currentData);
                editor.call('cursor:clear');
            }
            var onMouseUp = function () {
                window.removeEventListener('mouseup', onMouseUp);
                activate(false);
            };
            window.addEventListener('mouseup', onMouseUp, false);
            editor.emit('drop:active', active);
        };
        editor.method('drop:activate', activate);
        editor.method('drop:active', function () {
            return active;
        });
        // prevent drop file of redirecting
        window.addEventListener('dragenter', function (evt) {
            evt.preventDefault();
            if (!editor.call('permissions:write'))
                return;
            if (dragOver)
                return;
            dragOver = true;
            if (!currentType) {
                currentType = 'files';
                editor.emit('drop:set', currentType, currentData);
            }
            activate(true);
        }, false);
        window.addEventListener('dragover', function (evt) {
            evt.preventDefault();
            if (!editor.call('permissions:write'))
                return;
            evt.dataTransfer.dropEffect = 'move';
            if (dragOver)
                return;
            dragOver = true;
            activate(true);
        }, false);
        window.addEventListener('dragleave', function (evt) {
            evt.preventDefault();
            if (evt.clientX !== 0 || evt.clientY !== 0)
                return;
            if (!editor.call('permissions:write'))
                return;
            if (!dragOver)
                return;
            dragOver = false;
            setTimeout(function () {
                if (dragOver)
                    return;
                activate(false);
            }, 0);
        }, false);
        window.addEventListener('drop', function (evt) {
            evt.preventDefault();
            activate(false);
        }, false);
        var evtDragOver = function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.target.classList.add('over');
            if (itemOver && itemOver !== e.target)
                evtDragLeave.call(itemOver, e);
            itemOver = e.target;
            if (itemOver._ref && itemOver._ref.over && currentType) {
                var data = currentData;
                if (currentType == 'files' && e.dataTransfer)
                    data = e.dataTransfer.files;
                itemOver._ref.over(currentType, data);
            }
        };
        var evtDragLeave = function (e) {
            if (e)
                e.preventDefault();
            e.target.classList.remove('over');
            var that = e.target;
            if (that._ref && that._ref.leave && currentType)
                that._ref.leave();
            if (itemOver === e.target)
                itemOver = null;
        };
        var fixChromeFlexBox = function (item) {
            // workaround for chrome
            // for z-index + flex-grow weird reflow bug
            // need to force reflow in next frames
            // if (!window.chrome)
            //     return;
            // 不准确，这个参数用户可修改
            if (window.navigator.userAgent.indexOf('Chrome') < 0) {
                return;
            }
            // if (window.MessageEvent && !document.getBoxObjectFor)
            //     return;
            // only for those who have flexgrow
            var flex = item.style.flexGrow;
            if (flex) {
                // changing overflow triggers reflow
                var overflow = item.style.overflow;
                item.style.overflow = 'hidden';
                // need to skip 2 frames, 1 is not enough
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        // change back to what it was
                        item.style.overflow = overflow;
                    });
                });
            }
        };
        editor.method('drop:target', function (obj) {
            items.push(obj);
            obj.element = document.createElement('div');
            obj.element._ref = obj;
            obj.element.classList.add('drop-area');
            if (obj.hole)
                obj.element.classList.add('hole');
            if (obj.passThrough)
                obj.element.style.pointerEvents = 'none';
            areas.appendChild(obj.element);
            obj.evtDrop = function (e) {
                e.preventDefault();
                if (!currentType)
                    return;
                // leave event
                if (obj.element.classList.contains('over')) {
                    if (obj.leave && currentType)
                        obj.leave();
                    obj.element.classList.remove('over');
                }
                var data = currentData;
                if (currentType == 'files' && e.dataTransfer)
                    data = e.dataTransfer.files;
                if (obj.drop)
                    obj.drop(currentType, data);
            };
            obj.element.addEventListener('dragenter', evtDragOver, false);
            obj.element.addEventListener('mouseenter', evtDragOver, false);
            obj.element.addEventListener('dragleave', evtDragLeave, false);
            obj.element.addEventListener('mouseleave', evtDragLeave, false);
            var dropOn = obj.element;
            if (obj.passThrough)
                dropOn = obj.ref;
            dropOn.addEventListener('drop', obj.evtDrop, false);
            dropOn.addEventListener('mouseup', obj.evtDrop, false);
            obj.unregister = function () {
                if (!obj.element.classList.contains('drop-area'))
                    return;
                obj.element.removeEventListener('dragenter', evtDragOver);
                obj.element.removeEventListener('mouseenter', evtDragOver);
                obj.element.removeEventListener('dragleave', evtDragLeave);
                obj.element.removeEventListener('mouseleave', evtDragLeave);
                dropOn.removeEventListener('drop', obj.evtDrop);
                dropOn.removeEventListener('mouseup', obj.evtDrop);
                var ind = items.indexOf(obj);
                if (ind !== -1)
                    items.splice(ind, 1);
                if (obj.ref.classList.contains('drop-ref-highlight')) {
                    obj.ref.classList.remove('drop-ref-highlight');
                    fixChromeFlexBox(obj.ref);
                }
                obj.element.classList.remove('drop-area');
                areas.removeChild(obj.element);
            };
            return obj;
        });
        editor.method('drop:item', function (args) {
            args.element.draggable = true;
            args.element.addEventListener('mousedown', function (evt) {
                evt.stopPropagation();
            }, false);
            args.element.addEventListener('dragstart', function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                if (!editor.call('permissions:write'))
                    return;
                currentType = args.type;
                currentData = args.data;
                itemOver = null;
                editor.emit('drop:set', currentType, currentData);
                activate(true);
            }, false);
        });
        editor.method('drop:set', function (type, data) {
            currentType = type || '',
                currentData = data || {};
            editor.emit('drop:set', currentType, currentData);
        });
        editor.on('drop:active', function (state) {
            areas.style.pointerEvents = '';
            if (state) {
                var bottom = 0;
                var top = window.innerHeight;
                var left = window.innerWidth;
                var right = 0;
                for (var i = 0; i < items.length; i++) {
                    var visible = !items[i].disabled;
                    if (visible) {
                        if (items[i].filter) {
                            visible = items[i].filter(currentType, currentData);
                        }
                        else if (items[i].type !== currentType) {
                            visible = false;
                        }
                    }
                    if (visible) {
                        var rect = items[i].ref.getBoundingClientRect();
                        var depth = 4;
                        var parent = items[i].ref;
                        while (depth--) {
                            if (!rect.width || !rect.height || !parent.offsetHeight || window.getComputedStyle(parent).getPropertyValue('visibility') === 'hidden') {
                                visible = false;
                                break;
                            }
                            parent = parent.parentNode;
                        }
                    }
                    if (visible) {
                        items[i].element.style.display = 'block';
                        if (items[i].hole) {
                            items[i].element.style.left = (rect.left + 2) + 'px';
                            items[i].element.style.top = (rect.top + 2) + 'px';
                            items[i].element.style.width = (rect.width - 4) + 'px';
                            items[i].element.style.height = (rect.height - 4) + 'px';
                            overlay.classList.remove('active');
                            if (top > rect.top)
                                top = rect.top;
                            if (bottom < rect.bottom)
                                bottom = rect.bottom;
                            if (left > rect.left)
                                left = rect.left;
                            if (right < rect.right)
                                right = rect.right;
                            partsElement[0].classList.add('active');
                            partsElement[0].style.height = top + 'px';
                            partsElement[1].classList.add('active');
                            partsElement[1].style.top = top + 'px';
                            partsElement[1].style.bottom = (window.innerHeight - bottom) + 'px';
                            partsElement[1].style.width = (window.innerWidth - right) + 'px';
                            partsElement[2].classList.add('active');
                            partsElement[2].style.height = (window.innerHeight - bottom) + 'px';
                            partsElement[3].classList.add('active');
                            partsElement[3].style.top = top + 'px';
                            partsElement[3].style.bottom = (window.innerHeight - bottom) + 'px';
                            partsElement[3].style.width = left + 'px';
                            if (items[i].passThrough)
                                areas.style.pointerEvents = 'none';
                        }
                        else {
                            items[i].element.style.left = (rect.left + 1) + 'px';
                            items[i].element.style.top = (rect.top + 1) + 'px';
                            items[i].element.style.width = (rect.width - 2) + 'px';
                            items[i].element.style.height = (rect.height - 2) + 'px';
                            items[i].ref.classList.add('drop-ref-highlight');
                        }
                    }
                    else {
                        items[i].element.style.display = 'none';
                        if (items[i].ref.classList.contains('drop-ref-highlight')) {
                            items[i].ref.classList.remove('drop-ref-highlight');
                            fixChromeFlexBox(items[i].ref);
                        }
                    }
                }
            }
            else {
                for (var i = 0; i < parts.length; i++)
                    partsElement[i].classList.remove('active');
                for (var i = 0; i < items.length; i++) {
                    if (!items[i].ref.classList.contains('drop-ref-highlight'))
                        continue;
                    items[i].ref.classList.remove('drop-ref-highlight');
                    fixChromeFlexBox(items[i].ref);
                }
            }
        });
    }
    return Drop;
}());
exports.Drop = Drop;
},{}],27:[function(require,module,exports){
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
exports.Editor = void 0;
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
},{"../lib":93}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entities = void 0;
var middleware_1 = require("../middleware");
var lib_1 = require("../../lib");
var Entities = /** @class */ (function () {
    function Entities() {
        this.lists = [];
        this._indexed = {};
        this.container = new middleware_1.MiddleContainer();
        var entities = new lib_1.ObserverList({
            index: 'resource_id',
            id: 'resource_id'
        });
        var entityRoot = null;
        // on adding
        entities.on('add', function (entity) {
            editor.emit('entities:add', entity, entity === entityRoot);
        });
        // on removing
        entities.on('remove', function (entity) {
            editor.emit('entities:remove', entity);
            entity.destroy();
            // entity.entity = null;
        });
        // allow adding entity
        editor.method('entities:add', function (entity) {
            if (entity.get('root'))
                entityRoot = entity;
            entities.add(entity);
        });
        // allow remove entity
        editor.method('entities:remove', function (entity) {
            entities.remove(entity);
        });
        // remove all entities
        editor.method('entities:clear', function () {
            entities.clear();
        });
        // get entity
        editor.method('entities:get', function (resourceId) {
            return entities.get(resourceId);
        });
        // list entities
        editor.method('entities:list', function () {
            return entities.array();
        });
        // get root entity
        editor.method('entities:root', function () {
            return entityRoot;
        });
    }
    // 1.建立基本的数据格式；
    // 2.串联hierarchy，包括基本的菜单；
    // 3.尝试建立property；
    // 4.串联Assets结构与UI；
    Entities.prototype.addRaw = function (entity_data) {
        // console.log('***entity-data***');
        // console.log(entity_data);
        // 目标，创建babylon scene资源
        // Editor模式和Publish模式有何异同？
        // Editor需要有一个Observer的中间层，需要建立层级关系，需要记录增改删除操作
        // Publish可以从scene数据直接加载资源即可；
        var gameObject = this.createGameObject(entity_data);
        // add component
        // children
        // parent
        this.container.addGameObject(gameObject);
    };
    Entities.prototype.addEntity = function (entity) {
    };
    Entities.prototype.create = function (entity) {
        var type = entity.get('type');
        type = type.toLowerCase();
        if (type === 'root') {
            // 不需要生成
        }
        else if (type === 'mesh') {
            // 模型
            // 首先加载数据，生成babylon mesh数据结构
            // 提取地址，http或者其他方式加载
            // Http下载，加入回调函数处理，查看babylon默认的处理方式；
            // scenes数据如何从Assets数据中拿数据，到babylon中间件中寻找缓存
        }
        else if (type === 'empty') {
            // 空物体
        }
        else if (type === 'camera') {
            // node作为父物体
        }
        else if (type === 'light') {
            // node作为父物体
        }
        else if (type === 'particle') {
            // 貌似没有相对应的结构
        }
        else if (type === 'sprite') {
            // 貌似没有相对应的结构
        }
        // 根据要求生成GameObject
        var instance = new middleware_1.GameObject(entity.get('name'));
        return instance;
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
},{"../../lib":93,"../middleware":53}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityCreate = void 0;
var lib_1 = require("../../lib");
var utility_1 = require("../utility");
var EntityCreate = /** @class */ (function () {
    function EntityCreate() {
        var createNewEntityData = function (defaultData, parentResourceId) {
            var entityData = {
                name: defaultData.name || "空物体",
                tags: [],
                enabled: true,
                resource_id: defaultData.resource_id || utility_1.GUID.create(),
                parent: parentResourceId,
                children: Array(),
                position: defaultData.position || [0, 0, 0],
                rotation: defaultData.rotation || [0, 0, 0],
                scale: defaultData.scale || [1, 1, 1],
                // components: defaultData.components || {},
                // __postCreationCallback: defaultData.postCreationCallback,
                root: false,
                type: defaultData.type,
                asset: defaultData.asset || ""
            };
            // if (defaultData.children) {
            //     for (var i = 0; i < defaultData.children.length; i++) {
            //         var childEntityData = createNewEntityData(defaultData.children[i], entityData.resource_id);
            //         entityData.children.push(childEntityData);
            //     }
            // }
            return entityData;
        };
        editor.method("entity:new:babylon", function (defaultData) {
            defaultData = defaultData || {};
            // var parent = defaultData.parent;
            // var parent = editor.call("entities:root");
            // if (parent === "" || parent === undefined) {
            //     parent = editor.call("entities:root").get("resource_id");
            // }
            // console.log(editor.call("entities:root"));
            // console.log(defaultData.parent);
            // console.log(defaultData);
            // var data = createNewEntityData(defaultData, parent.get("resource_id"));
            // create new Entity data
            var entity = new lib_1.Observer(defaultData);
            editor.call('entities:add', entity);
            // editor.call("entities:addEntity", entity, parent, !defaultData.noSelect);
            return entity;
        });
        editor.method('entities:new', function (defaultData) {
            // get root if parent is null
            defaultData = defaultData || {};
            var parent = defaultData.parent || editor.call('entities:root');
            var data = createNewEntityData(defaultData, parent.get('resource_id'));
            var selectorType, selectorItems;
            if (!defaultData.noHistory) {
                selectorType = editor.call('selector:type');
                selectorItems = editor.call('selector:items');
                if (selectorType === 'entity') {
                    for (var i = 0; i < selectorItems.length; i++)
                        selectorItems[i] = selectorItems[i].get('resource_id');
                }
            }
            // create new Entity data
            var entity = new lib_1.Observer(data);
            editor.call('entities:addEntity', entity, parent, !defaultData.noSelect);
            // history
            if (!defaultData.noHistory) {
                var resourceId = entity.get('resource_id');
                var parentId = parent.get('resource_id');
                editor.call('history:add', {
                    name: 'new entity ' + resourceId,
                    undo: function () {
                        var entity = editor.call('entities:get', resourceId);
                        if (!entity)
                            return;
                        editor.call('entities:removeEntity', entity);
                        if (selectorType === 'entity' && selectorItems.length) {
                            var items = [];
                            for (var i = 0; i < selectorItems.length; i++) {
                                var item = editor.call('entities:get', selectorItems[i]);
                                if (item)
                                    items.push(item);
                            }
                            if (items.length) {
                                editor.call('selector:history', false);
                                editor.call('selector:set', selectorType, items);
                                editor.once('selector:change', function () {
                                    editor.call('selector:history', true);
                                });
                            }
                        }
                    },
                    redo: function () {
                        var parent = editor.call('entities:get', parentId);
                        if (!parent)
                            return;
                        var entity = new lib_1.Observer(data);
                        editor.call('entities:addEntity', entity, parent, true);
                    }
                });
            }
            return entity;
        });
    }
    return EntityCreate;
}());
exports.EntityCreate = EntityCreate;
},{"../../lib":93,"../utility":78}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityEdit = void 0;
var EntityEdit = /** @class */ (function () {
    function EntityEdit() {
        var childToParent = {};
        var addEntity = function (entity, parent, select, ind, entityReferencesMap) {
            entityReferencesMap = entityReferencesMap || {};
            ind = ind || 0;
            childToParent[entity.get('resource_id')] = parent.get('resource_id');
            var children = entity.get('children');
            if (children.length)
                entity.set('children', []);
            // call add event
            editor.call('entities:add', entity);
            console.error(entity);
            // shareDb
            // editor.call('realtime:scene:op', {
            //     p: ['entities', entity.get('resource_id')],
            //     oi: entity.origin
            // });
            // this is necessary for the entity to be added to the tree view
            // parent.history.enabled = false;
            // parent.insert('children', entity.get('resource_id'), ind);
            // parent.history.enabled = true;
            // if (select) {
            //     setTimeout(function () {
            //         editor.call('selector:history', false);
            //         editor.call('selector:set', 'entity', [entity]);
            //         editor.once('selector:change', function () {
            //             editor.call('selector:history', true);
            //         });
            //     }, 0);
            // }
            // add children too
            // children.forEach(function (childIdOrData) {
            //     var data;
            //     // If we've been provided an id, we're re-creating children from the deletedCache
            //     if (typeof childIdOrData === 'string') {
            //         data = deletedCache[childIdOrData];
            //         if (!data) {
            //             return;
            //         }
            //         // If we've been provided an object, we're creating children for a new entity
            //     } else if (typeof childIdOrData === 'object') {
            //         data = childIdOrData;
            //     } else {
            //         throw new Error('Unhandled childIdOrData format');
            //     }
            //     var child = new Observer(data);
            //     addEntity(child, entity, undefined, undefined, entityReferencesMap);
            // });
            // Hook up any entity references which need to be pointed to this newly created entity
            // (happens when addEntity() is being called during the undoing of a deletion). In order
            // to force components to respond to the setter call even when they are running in other
            // tabs or in the Launch window, we unfortunately have to use a setTimeout() hack :(
            var guid = entity.get('resource_id');
            // First set all entity reference fields targeting this guid to null
            // updateEntityReferenceFields(entityReferencesMap, guid, null);
            // setTimeout(function () {
            //     // Then update the same fields to target the guid again
            //     updateEntityReferenceFields(entityReferencesMap, guid, guid);
            // }, 0);
            // if (entity.get('__postCreationCallback')) {
            //     entity.get('__postCreationCallback')(entity);
            // }
        };
        editor.method('entities:addEntity', addEntity);
    }
    return EntityEdit;
}());
exports.EntityEdit = EntityEdit;
},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityLoad = void 0;
var lib_1 = require("../../lib");
var ui_1 = require("../../ui");
var EntityLoad = /** @class */ (function () {
    // private _entities: Entities = new Entities();
    function EntityLoad() {
        this.loadedEntities = false;
        var hierarchyOverlay = new ui_1.TopElementContainer({
            flex: true
        });
        hierarchyOverlay.class.add('progress-overlay');
        editor.call('layout.hierarchy').append(hierarchyOverlay);
        var p = new ui_1.Progress();
        p.on('progress:100', function () {
            hierarchyOverlay.hidden = true;
        });
        hierarchyOverlay.append(p);
        p.hidden = true;
        var loadedEntities = false;
        editor.method('entities:loaded', function () {
            return loadedEntities;
        });
        editor.on('scene:raw', function (data) {
            // editor.call('selector:clear');
            // editor.call('entities:clear');
            // editor.call('attributes:clear');
            // console.log(data);
            var total = Object.keys(data.entities).length;
            var i = 0;
            // list
            for (var key in data.entities) {
                editor.call('entities:add', new lib_1.Observer(data.entities[key]));
                p.progress = (++i / total) * 0.8 + 0.1;
                if (!data.entities[key].root && data.entities[key].asset === "") {
                    editor.call("load:blue", data.entities[key].type, data.entities[key].property);
                }
            }
            p.progress = 1;
            loadedEntities = true;
            editor.emit('entities:load');
        });
        editor.call('attributes:clear');
        editor.on('scene:unload', function () {
            editor.call('entities:clear');
            editor.call('attributes:clear');
        });
        editor.on('scene:beforeload', function () {
            hierarchyOverlay.hidden = false;
            p.hidden = false;
            p.progress = 0.1;
        });
    }
    return EntityLoad;
}());
exports.EntityLoad = EntityLoad;
},{"../../lib":93,"../../ui":108}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitySync = void 0;
var EntitySync = /** @class */ (function () {
    function EntitySync() {
    }
    return EntitySync;
}());
exports.EntitySync = EntitySync;
},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
var Entity = /** @class */ (function () {
    function Entity() {
    }
    Entity.prototype.get = function (str) {
    };
    return Entity;
}());
exports.Entity = Entity;
},{}],34:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./entity"), exports);
__exportStar(require("./entities"), exports);
__exportStar(require("./entity-load"), exports);
__exportStar(require("./entity-create"), exports);
__exportStar(require("./entity-sync"), exports);
__exportStar(require("./entity-edit"), exports);
__exportStar(require("./keeper"), exports);
},{"./entities":28,"./entity":33,"./entity-create":29,"./entity-edit":30,"./entity-load":31,"./entity-sync":32,"./keeper":35}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityKeeper = void 0;
var entity_load_1 = require("./entity-load");
var entities_1 = require("./entities");
var entity_create_1 = require("./entity-create");
var entity_sync_1 = require("./entity-sync");
var entity_edit_1 = require("./entity-edit");
var EntityKeeper = /** @class */ (function () {
    function EntityKeeper() {
        new entities_1.Entities();
        new entity_edit_1.EntityEdit();
        new entity_create_1.EntityCreate();
        new entity_load_1.EntityLoad();
        new entity_sync_1.EntitySync();
    }
    return EntityKeeper;
}());
exports.EntityKeeper = EntityKeeper;
},{"./entities":28,"./entity-create":29,"./entity-edit":30,"./entity-load":31,"./entity-sync":32}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var Config = /** @class */ (function () {
    function Config() {
    }
    Config.projectID = 'projectID';
    Config.sceneID = 'sceneID';
    return Config;
}());
exports.Config = Config;
},{}],37:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./config"), exports);
},{"./config":36}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchyContextMenu = void 0;
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
            var treeItem = editor.call('entities:panel:get', item.get('resource_id'));
            if (!treeItem)
                return;
            // attach contextmenu event
            treeItem.element.addEventListener('contextmenu', function (evt) {
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
},{"../../ui":108}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchyControl = void 0;
var engine_1 = require("../../engine");
var ui_1 = require("../../ui");
var HierarchyControl = /** @class */ (function () {
    function HierarchyControl() {
        var root = engine_1.VeryEngine.root;
        var panel = engine_1.VeryEngine.hierarchy;
        // 层级菜单控制菜单
        var controls = new ui_1.TopElementContainer({
            flex: true,
            flexDirection: 'row',
            alignItems: 'center',
        });
        controls.class.add('hierarchy-controls');
        // TODO: 分享项目给他人时，是否允许修改
        // controls.hidden = !editor.call('permissions:write');
        // editor.on('permissions:writeState', function (state: boolean) {
        //     controls.hidden = !state;
        // });
        panel.header.append(controls);
        // controls add
        var btnAdd = new ui_1.Button('&#57632;');
        btnAdd.class.add('add');
        btnAdd.on('click', function () {
            // menuEntities.open = true;
            // let rect = btnAdd.element.getBoundingClientRect();
            // menuEntities.position(rect.left, rect.top);
        });
        controls.append(btnAdd);
        ui_1.Tooltip.attach({
            target: btnAdd.element,
            text: '添加',
            align: 'top',
            root: root
        });
        editor.on('attributes:clear', function () {
            btnDuplicate.disabled = true;
            btnDelete.disabled = true;
            tooltipDelete.class.add('innactive');
            tooltipDuplicate.class.add('innactive');
        });
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
        controls.append(btnDuplicate);
        var tooltipDuplicate = ui_1.Tooltip.attach({
            target: btnDuplicate.element,
            text: '复制',
            align: 'top',
            root: root
        });
        tooltipDuplicate.class.add('innactive');
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
        controls.append(btnDelete);
        var tooltipDelete = ui_1.Tooltip.attach({
            target: btnDelete.element,
            text: '删除',
            align: 'top',
            root: root
        });
        tooltipDelete.class.add('innactive');
        // TODO: Menu
        // let menuEntities = ui.Menu.fromData(editor.call('menu:entities:new'));
        // root.append(menuEntities);
        // TODO: 选择到了hierarchy的scene一行
        editor.on('attributes:inspect[*]', function (type, items) {
            var root = editor.call('entities:root');
            if (type === 'entity' && items[0] !== root) {
                btnDelete.enabled = true;
                btnDuplicate.enabled = true;
                tooltipDelete.class.remove('innactive');
                tooltipDuplicate.class.remove('innactive');
            }
            else {
                btnDelete.enabled = false;
                btnDuplicate.enabled = false;
                tooltipDelete.class.add('innactive');
                tooltipDuplicate.class.add('innactive');
            }
        });
    }
    return HierarchyControl;
}());
exports.HierarchyControl = HierarchyControl;
},{"../../engine":89,"../../ui":108}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchyMenu = void 0;
var HierarchyMenu = /** @class */ (function () {
    function HierarchyMenu() {
        var componentsLogos = editor.call('components:logos');
    }
    return HierarchyMenu;
}());
exports.HierarchyMenu = HierarchyMenu;
},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchyPanel = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var global_1 = require("../global");
var HierarchyPanel = /** @class */ (function () {
    function HierarchyPanel() {
        // hierarchy index
        this.uiItemIndex = {};
        this.init();
    }
    HierarchyPanel.prototype.init = function () {
        var self = this;
        // left control
        // hierarchy index
        // let uiItemIndex: any = {};
        var awaitingParent = {};
        var panel = engine_1.VeryEngine.hierarchy;
        var hierarchy = new ui_1.Tree();
        engine_1.VeryEngine.hierarchyTree = hierarchy;
        var rootParent;
        // TODO: hierarchy权限管理，有些人可看不可编辑；
        // hierarchy.allowRenaming = editor.call('permissions:write');
        hierarchy.draggable = hierarchy.allowRenaming;
        hierarchy.class.add('hierarchy');
        panel.append(hierarchy);
        var resizeQueued = false;
        var resizeTree = function () {
            resizeQueued = false;
            hierarchy.element.style.width = '';
            hierarchy.element.style.width = (panel.content.dom.scrollWidth - 5) + 'px';
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
            var rect = panel.content.dom.getBoundingClientRect();
            if ((evt.clientY - rect.top) < 32 && panel.content.dom.scrollTop > 0) {
                dragScroll = -1;
            }
            else if ((rect.bottom - evt.clientY) < 32 && (panel.content.dom.scrollHeight - (rect.height + panel.content.dom.scrollTop)) > 0) {
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
                panel.content.dom.scrollTop += dragScroll * 8;
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
        // let rootElement = new TreeItem({
        //     text: 'Scene',
        //     classList: classList
        // });
        // rootElement.class!.remove('c-model');
        // hierarchy.element!.appendChild(rootElement.element!);
        // hierarchy.emit('append', rootElement);
        /*
        for (let i: number = 0; i < 10; i++) {
          let element1 = new TreeItem({
            text: '物体名' + (i + 1),
            classList: classList
          });
          editor.emit('entities:add', element1);
          hierarchy.emit('append', element1);
          rootElement.append(element1);
    
          for (let k = 0; k < 5; k++) {
            let element2 = new TreeItem({
              text: '子物体名' + (k + 1),
              classList: classList
            });
            editor.emit('entities:add', element2);
            hierarchy.emit('append', element2);
            element1.append(element2);
            for (let x = 0; x < 5; x++) {
              let element3 = new TreeItem({
                text: '二级子物体' + (x + 1),
                classList: classList
              });
              editor.emit('entities:add', element3);
              hierarchy.emit('append', element3);
    
              element2.append(element3);
    
            }
          }
        }
        */
        // selector add
        editor.on('selector:add', function (entity, type) {
            if (type !== 'entity')
                return;
            self.uiItemIndex[entity.get('resource_id')].selected = true;
        });
        // selector remove
        editor.on('selector:remove', function (entity, type) {
            if (type !== 'entity')
                return;
            self.uiItemIndex[entity.get('resource_id')].selected = false;
        });
        // selector change
        editor.on('selector:change', function (type, items) {
            if (type !== 'entity') {
                hierarchy.clear();
            }
            else {
                var selected = hierarchy.selected;
                var ids = {};
                // build index of selected items
                for (var i = 0; i < items.length; i++) {
                    ids[items[i].get('resource_id')] = true;
                }
                ;
                // deselect unselected items
                for (var i = 0; i < selected.length; i++) {
                    if (!ids[selected[i].entity.get('resource_id')])
                        selected[i].selected = false;
                }
            }
        });
        // entity removed
        editor.on('entities:remove', function (entity) {
            self.uiItemIndex[entity.get('resource_id')].destroy();
            resizeQueue();
        });
        // element.append();
        var componentList;
        // entity added
        editor.on('entities:add', function (entity, isRoot) {
            if (entity.get("type") === "TransformNode" || entity.get("type") === "Mesh") {
                entity.node = engine_1.VeryEngine.viewScene.getNodeByID(entity.get("resource_id"));
            }
            var classList = ['tree-item-entity', 'entity-id-' + entity.get('resource_id')];
            if (isRoot) {
                classList.push('tree-item-root');
            }
            var element = new ui_1.TreeItem({
                text: entity.get('name'),
                classList: classList
            });
            element.entity = entity;
            element.enabled = entity.get('enabled');
            if (!componentList)
                componentList = editor.call('components:list');
            // entity.reparenting = false;
            // index
            self.uiItemIndex[entity.get('resource_id')] = element;
            // name change
            entity.on('name:set', function (value) {
                element.text = value;
                resizeQueue();
            });
            entity.on('enabled:set', function (value) {
                element.enabled = value;
            });
            // entity.on('children:move', function (value, ind, indOld) {
            //     var item = uiItemIndex[value];
            //     if (!item || item.entity.reparenting)
            //         return;
            //     element.remove(item);
            //     var next = uiItemIndex[entity.get('children.' + (ind + 1))];
            //     var after = null;
            //     if (next === item) {
            //         next = null;
            //         if (ind > 0)
            //             after = uiItemIndex[entity.get('children.' + ind)]
            //     }
            //     if (item.parent)
            //         item.parent.remove(item);
            //     if (next) {
            //         element.appendBefore(item, next);
            //     } else if (after) {
            //         element.appendAfter(item, after);
            //     } else {
            //         element.append(item);
            //     }
            // });
            // remove children
            // entity.on('children:remove', function (value) {
            //     var item = uiItemIndex[value];
            //     if (!item || item.entity.reparenting)
            //         return;
            //     element.remove(item);
            // });
            // add children
            // entity.on('children:insert', function (value, ind) {
            //     var item = uiItemIndex[value];
            //     if (!item || item.entity.reparenting)
            //         return;
            //     if (item.parent)
            //         item.parent.remove(item);
            //     var next = uiItemIndex[entity.get('children.' + (ind + 1))];
            //     if (next) {
            //         element.appendBefore(item, next);
            //     } else {
            //         element.append(item);
            //     }
            // });
            // collaborators
            var users = element.users = document.createElement('span');
            users.classList.add('users');
            element.elementTitle.appendChild(users);
            // if (entity.get('root')) {
            //     // root
            //     hierarchy.append(element);
            //     element.open = true;
            // } else {
            //     if(entity.get('parent') === editor.call("entities:root").get("resource_id")) {
            //         rootParent.append(element);
            //     }
            // }
            // var children = entity.get('children');
            // if (children.length) {
            //     for (var c = 0; c < children.length; c++) {
            //         var child = self.uiItemIndex[children[c]];
            //         if (!child) {
            //             var err = 'Cannot find child entity ' + children[c];
            //             editor.call('status:error', err);
            //             console.error(err);
            //             continue;
            //         }
            //         element.append(child);
            //     }
            // }
            resizeQueue();
        });
        // append all treeItems according to child order
        editor.on('entities:load', function (upload) {
            var entities = editor.call('entities:list');
            var datas = {};
            var path1 = "";
            var path2 = "";
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (upload) {
                    datas[entity.get('resource_id')] = entity.origin;
                }
                // console.warn(entity.get('resource_id'));
                if (entity.get("asset") && entity.get("asset2")) {
                    path1 = entity.get("asset");
                    path2 = entity.get("asset2");
                }
                var element = self.uiItemIndex[entity.get('resource_id')];
                if (entity.get('root')) {
                    // root
                    hierarchy.append(element);
                    element.open = true;
                    rootParent = element;
                }
                else {
                    if (entity.get('parent') === "") {
                        rootParent.append(element);
                    }
                }
                var children = entity.get('children');
                if (children.length) {
                    for (var c = 0; c < children.length; c++) {
                        var child = self.uiItemIndex[children[c]];
                        if (!child) {
                            var err = 'Cannot find child entity ' + children[c];
                            editor.call('status:error', err);
                            console.error(err);
                            continue;
                        }
                        element.append(child);
                    }
                }
            }
            if (upload) {
                axios.post('/api/addScene', { projectID: global_1.Config.projectID, entities: datas, path1: path1, path2: path2 })
                    .then(function (response) {
                    var data = response.data;
                    if (data.code === "0000") {
                        console.log(data.data);
                    }
                    else {
                        console.error(data.message);
                    }
                })
                    .catch(function (error) {
                    console.error(error);
                });
            }
            if (path1 && path2 && !upload) {
                editor.call("loadTempModel2", path1, path2);
            }
        });
    };
    return HierarchyPanel;
}());
exports.HierarchyPanel = HierarchyPanel;
},{"../../engine":89,"../../ui":108,"../global":37}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchySearch = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var HierarchySearch = /** @class */ (function () {
    function HierarchySearch() {
        editor.method('entities:fuzzy-search', function (query) {
            var items = [];
            var entities = editor.call('entities:list');
            for (var i = 0; i < entities.length; i++)
                items.push([entities[i].get('name'), entities[i]]);
            return editor.call('search:items', items, query);
        });
        var panel = engine_1.VeryEngine.hierarchy;
        var hierarchy = editor.call('entities:hierarchy');
        var changing = false;
        var itemsIndex = {};
        // 结果列表
        var results = new ui_1.List();
        results.element.tabIndex = 0;
        results.hidden = true;
        results.class.add('search-results');
        panel.append(results);
        var lastSearch = '';
        var search = new ui_1.TextField('搜索');
        search.blurOnEnter = false;
        search.keyChange = true;
        search.class.add('search');
        search.renderChanges = false;
        panel.prepend(search);
        // panel.element!.insertBefore(search.element!, panel.innerElement);
        var searchClear = document.createElement('div');
        searchClear.innerHTML = '&#57650;';
        searchClear.classList.add('clear');
        search.element.appendChild(searchClear);
        searchClear.addEventListener('click', function () {
            search.value = '';
        }, false);
        // clear on escape
        results.element.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 27) { // esc
                searchClear.click();
            }
            else if (evt.keyCode === 13) { // enter
                // 搜索结果出现以后，按下enter键
                if (!results.selected) {
                    var firstElement = results.element.firstChild;
                    if (firstElement && firstElement.ui && firstElement.ui.entity)
                        editor.call('selector:set', 'entity', [firstElement.ui.entity]);
                }
                search.value = '';
            }
            else if (evt.keyCode === 40) { // down
                selectNext();
                evt.stopPropagation();
            }
            else if (evt.keyCode === 38) { // up
                selectPrev();
                evt.stopPropagation();
            }
        }, false);
        // deselecting
        results.unbind('deselect', results._onDeselect);
        results._onDeselect = function (item) {
            var ind = results.selected.indexOf(item);
            if (ind !== -1)
                results.selected.splice(ind, 1);
            if (this._changing)
                return;
            if (ui_1.List._ctrl && ui_1.List._ctrl()) {
            }
            else {
                this._changing = true;
                var items = editor.call('selector:type') === 'entity' && editor.call('selector:items') || [];
                var inSelected = items.indexOf(item.entity) !== -1;
                if (items.length >= 2 && inSelected) {
                    var selected = this.selected;
                    for (var i = 0; i < selected.length; i++)
                        selected[i].selected = false;
                    item.selected = true;
                }
                this._changing = false;
            }
            this.emit('change');
        };
        results.on('deselect', results._onDeselect);
        // results selection change
        results.on('change', function () {
            if (changing)
                return;
            if (results.selected) {
                editor.call('selector:set', 'entity', results.selected.map(function (item) {
                    return item.entity;
                }));
            }
            else {
                editor.call('selector:clear');
            }
        });
        // selector change
        editor.on('selector:change', function (type, items) {
            if (changing)
                return;
            changing = true;
            if (type === 'entity') {
                results.selected = [];
                for (var i = 0; i < items.length; i++) {
                    var item = itemsIndex[items[i].get('resource_id')];
                    if (!item)
                        continue;
                    item.selected = true;
                }
            }
            else {
                results.selected = [];
            }
            changing = false;
        });
        var selectNext = function () {
            // list item
            var children = results.element.children;
            // could be nothing or only one item to select
            if (!children.length)
                return;
            var toSelect = null;
            // 被选择的item
            var items = results.element.querySelectorAll('.ui-list-item.selected');
            var multi = (ui_1.List._ctrl && ui_1.List._ctrl()) || (ui_1.List._shift && ui_1.List._shift());
            if (items.length) {
                var last = items[items.length - 1];
                var next = last.nextSibling; // 下一个list item
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
                    results.selected = [];
                toSelect.selected = true;
            }
        };
        var selectPrev = function () {
            var children = results.element.children;
            // could be nothing or only one item to select
            if (!children.length)
                return;
            var toSelect = null;
            var items = results.element.querySelectorAll('.ui-list-item.selected');
            var multi = (ui_1.List._ctrl && ui_1.List._ctrl()) || (ui_1.List._shift && ui_1.List._shift());
            if (items.length) {
                var first = items[0];
                var prev = first.previousSibling;
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
                    results.selected = [];
                toSelect.selected = true;
            }
        };
        search.element.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 27) {
                searchClear.click();
            }
            else if (evt.keyCode === 13) {
                if (!results.selected.length) {
                    var firstElement = results.element.firstChild;
                    if (firstElement && firstElement.ui && firstElement.ui.entity)
                        editor.call('selector:set', 'entity', [firstElement.ui.entity]);
                }
                search.value = '';
            }
            else if (evt.keyCode === 40) { // down
                editor.call('hotkey:updateModifierKeys', evt);
                selectNext();
                evt.stopPropagation();
                evt.preventDefault();
            }
            else if (evt.keyCode === 38) { // up
                editor.call('hotkey:updateModifierKeys', evt);
                selectPrev();
                evt.stopPropagation();
                evt.preventDefault();
            }
            else if (evt.keyCode === 65 && evt.ctrlKey) { // ctrl + a
                var toSelect = [];
                var items = results.element.querySelectorAll('.ui-list-item');
                for (var i = 0; i < items.length; i++)
                    toSelect.push(items[i].ui);
                results.selected = toSelect;
                evt.stopPropagation();
                evt.preventDefault();
            }
        }, false);
        // if entity added, check if it maching query
        editor.on('entities:add', function (entity) {
            var query = search.value.trim();
            if (!query)
                return;
            var items = [[entity.get('name'), entity]];
            var result = editor.call('search:items', items, query);
            if (!result.length)
                return;
            performSearch();
        });
        var addItem = function (entity) {
            var events = [];
            var item = new ui_1.ListItem(entity.get('name'));
            item.disabledClick = true;
            item.entity = entity;
            if (entity.get('children').length)
                item.class.add('container');
            // relate to tree item
            var treeItem = editor.call('entities:panel:get', entity.get('resource_id'));
            item.disabled = treeItem.disabled;
            var onStateChange = function () {
                item.disabled = treeItem.disabled;
            };
            events.push(treeItem.on('enable', onStateChange));
            events.push(treeItem.on('disable', onStateChange));
            var onNameSet = function (name) {
                item.text = name;
            };
            // TODO
            events.push(entity.on('name:set', onNameSet));
            // icon
            var components = Object.keys(entity.get('components'));
            for (var c = 0; c < components.length; c++)
                item.class.add('c-' + components[c]);
            var onContextMenu = function (evt) {
                var openned = editor.call('entities:contextmenu:open', entity, evt.clientX, evt.clientY);
                if (openned) {
                    evt.preventDefault();
                    evt.stopPropagation();
                }
            };
            var onDblClick = function (evt) {
                search.value = '';
                editor.call('selector:set', 'entity', [entity]);
                evt.stopPropagation();
                evt.preventDefault();
            };
            item.element.addEventListener('contextmenu', onContextMenu);
            item.element.addEventListener('dblclick', onDblClick);
            events.push(item.once('destroy', function () {
                for (var i = 0; i < events.length; i++)
                    events[i].unbind();
                events = null;
                item.element.removeEventListener('contextmenu', onContextMenu);
                item.element.removeEventListener('dblclick', onDblClick);
            }));
            events.push(treeItem.once('destroy', function () {
                // if entity removed, perform search again
                performSearch();
            }));
            return item;
        };
        var performSearch = function () {
            var query = lastSearch;
            // clear results list
            results.clear();
            itemsIndex = {};
            if (query) {
                var result = editor.call('entities:fuzzy-search', query);
                hierarchy.hidden = true;
                results.hidden = false;
                var selected = [];
                if (editor.call('selector:type') === 'entity')
                    selected = editor.call('selector:items');
                for (var i = 0; i < result.length; i++) {
                    var item = addItem(result[i]);
                    itemsIndex[result[i].get('resource_id')] = item;
                    if (selected.indexOf(result[i]) !== -1)
                        item.selected = true;
                    results.append(item);
                }
            }
            else {
                results.hidden = true;
                hierarchy.hidden = false;
            }
        };
        search.on('change', function (value) {
            value = value.trim();
            if (lastSearch === value)
                return;
            lastSearch = value;
            if (value) {
                search.class.add('not-empty');
            }
            else {
                search.class.remove('not-empty');
            }
            performSearch();
        });
    }
    return HierarchySearch;
}());
exports.HierarchySearch = HierarchySearch;
},{"../../engine":89,"../../ui":108}],43:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./keeper"), exports);
__exportStar(require("./hierarchy-panel"), exports);
__exportStar(require("./hierarchy-menu"), exports);
__exportStar(require("./hierarchy-control"), exports);
__exportStar(require("./hierarchy-search"), exports);
__exportStar(require("./hierarchy-context-menu"), exports);
},{"./hierarchy-context-menu":38,"./hierarchy-control":39,"./hierarchy-menu":40,"./hierarchy-panel":41,"./hierarchy-search":42,"./keeper":44}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchyKeeper = void 0;
var hierarchy_search_1 = require("./hierarchy-search");
var hierarchy_menu_1 = require("./hierarchy-menu");
var hierarchy_context_menu_1 = require("./hierarchy-context-menu");
var hierarchy_panel_1 = require("./hierarchy-panel");
var hierarchy_control_1 = require("./hierarchy-control");
var HierarchyKeeper = /** @class */ (function () {
    // public hierarchyMain: Panel;
    function HierarchyKeeper() {
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
        // 全局菜单
        var contextMenuLogo = new hierarchy_menu_1.HierarchyMenu();
        var controlMenu = new hierarchy_control_1.HierarchyControl();
        // 搜索区域：Search Field
        var searchField = new hierarchy_search_1.HierarchySearch();
        var contextMenu = new hierarchy_context_menu_1.HierarchyContextMenu();
    }
    return HierarchyKeeper;
}());
exports.HierarchyKeeper = HierarchyKeeper;
},{"./hierarchy-context-menu":38,"./hierarchy-control":39,"./hierarchy-menu":40,"./hierarchy-panel":41,"./hierarchy-search":42}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hotkeys = void 0;
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
},{}],46:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./initialize-before"), exports);
__exportStar(require("./editor"), exports);
__exportStar(require("./layout"), exports);
__exportStar(require("./viewport"), exports);
__exportStar(require("./hierarchy"), exports);
__exportStar(require("./hotkeys"), exports);
__exportStar(require("./assets"), exports);
__exportStar(require("./toolbar"), exports);
__exportStar(require("./utility"), exports);
__exportStar(require("./entity"), exports);
__exportStar(require("./middleware"), exports);
__exportStar(require("./initialize-after"), exports);
__exportStar(require("./localstorage"), exports);
__exportStar(require("./search"), exports);
__exportStar(require("./drop"), exports);
__exportStar(require("./global"), exports);
__exportStar(require("./Initialize-data"), exports);
},{"./Initialize-data":3,"./assets":16,"./drop":26,"./editor":27,"./entity":34,"./global":37,"./hierarchy":43,"./hotkeys":45,"./initialize-after":47,"./initialize-before":48,"./layout":49,"./localstorage":50,"./middleware":53,"./search":56,"./toolbar":61,"./utility":78,"./viewport":80}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeAfter = void 0;
var attributes_1 = require("./attributes");
var toolbar_1 = require("./toolbar");
var keeper_1 = require("./viewport/keeper");
var entity_1 = require("./entity");
var InitializeAfter = /** @class */ (function () {
    function InitializeAfter() {
        // entity
        var entity = new entity_1.EntityKeeper();
        // attributes
        var attributes = new attributes_1.AttributesKeeper();
        // toolbar
        var toolbar = new toolbar_1.ToolbarKeeper();
        // viewport
        new keeper_1.ViewportKeeper();
    }
    return InitializeAfter;
}());
exports.InitializeAfter = InitializeAfter;
},{"./attributes":24,"./entity":34,"./toolbar":61,"./viewport/keeper":81}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeBefore = void 0;
var hotkeys_1 = require("./hotkeys");
var utility_1 = require("./utility");
var selector_1 = require("./selector");
var localstorage_1 = require("./localstorage");
var InitializeBefore = /** @class */ (function () {
    function InitializeBefore() {
        this.init();
    }
    InitializeBefore.prototype.init = function () {
        // axois默认请求头设置，全局通过json方式传送和接收数据
        // axios.defaults.headers.post["Content-Type"] = "application/json";
        // 全局快捷键注册
        var hotkeys = new hotkeys_1.Hotkeys();
        // localstorage
        var localstorage = new localstorage_1.LocalStorage();
        // components-logos
        var logos = new utility_1.ComponentsLogos();
        // 屏蔽浏览器默认右键菜单
        var systemContextMenu = new utility_1.ContextMenu();
        // selector 
        var selector = new selector_1.Selector();
        // Websocket
        // let io = new Realtime();
    };
    return InitializeBefore;
}());
exports.InitializeBefore = InitializeBefore;
},{"./hotkeys":45,"./localstorage":50,"./selector":57,"./utility":78}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Layout = void 0;
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
        var root = new ui_1.TopElementContainer({
            id: 'layout-root',
            grid: true
        });
        document.body.appendChild(root.dom);
        // expose
        editor.method('layout.root', function () {
            return root;
        });
        engine_1.VeryEngine.root = root;
        // toolbar (left)
        var toolbar = new ui_1.TopElementContainer({
            id: 'layout-toolbar',
            flex: true
        });
        root.append(toolbar);
        // expose
        editor.method('layout.toolbar', function () { return toolbar; });
        engine_1.VeryEngine.toolbar = toolbar;
        // hierarchy
        var hierarchyPanel = new ui_1.TopElementPanel({
            headerText: '层级菜单',
            id: 'layout-hierarchy',
            flex: true,
            enabled: false,
            width: editor.call('localStorage:get', 'editor:layout:hierarchy:width') || 256,
            panelType: 'normal',
            collapsible: true,
            collapseHorizontally: true,
            collapsed: editor.call('localStorage:get', 'editor:layout:hierarchy:collapse') || window.innerWidth <= 480,
            scrollable: true,
            resizable: 'right',
            resizeMin: 196,
            resizeMax: 512
        });
        hierarchyPanel.on('resize', function () {
            editor.call('localStorage:set', 'editor:layout:hierarchy:width', hierarchyPanel.width);
        });
        hierarchyPanel.on('collapse', function () {
            editor.call('localStorage:set', 'editor:layout:hierarchy:collapse', true);
        });
        hierarchyPanel.on('expand', function () {
            editor.call('localStorage:set', 'editor:layout:hierarchy:collapse', false);
        });
        root.append(hierarchyPanel);
        // expose
        editor.method('layout.hierarchy', function () { return hierarchyPanel; });
        editor.on('permissions:writeState', function (state) {
            hierarchyPanel.enabled = state;
        });
        engine_1.VeryEngine.hierarchy = hierarchyPanel;
        // viewport
        var viewport = new ui_1.TopElementContainer({
            id: 'layout-viewport'
        });
        viewport.class.add('viewport');
        root.append(viewport);
        // expose
        editor.method('layout.viewport', function () { return viewport; });
        engine_1.VeryEngine.viewportPanel = viewport;
        // assets
        var assetsPanel = new ui_1.TopElementPanel({
            id: 'layout-assets',
            headerText: '资源面板',
            flex: true,
            flexDirection: 'row',
            panelType: 'normal',
            collapsible: true,
            collapsed: editor.call('localStorage:get', 'editor:layout:assets:collapse') || window.innerHeight <= 480,
            height: editor.call('localStorage:get', 'editor:layout:assets:height') || 212,
            scrollable: true,
            resizable: 'top',
            resizeMin: 106,
            resizeMax: 106 * 6
        });
        assetsPanel.class.add('assets');
        assetsPanel.on('resize', function () {
            editor.call('localStorage:set', 'editor:layout:assets:height', assetsPanel.height);
        });
        assetsPanel.on('collapse', function () {
            editor.call('localStorage:set', 'editor:layout:assets:collapse', true);
        });
        assetsPanel.on('expand', function () {
            editor.call('localStorage:set', 'editor:layout:assets:collapse', false);
        });
        root.append(assetsPanel);
        // expose
        editor.method('layout.assets', function () { return assetsPanel; });
        engine_1.VeryEngine.assets = assetsPanel;
        // attributes
        var attributesPanel = new ui_1.TopElementPanel({
            id: 'layout-attributes',
            headerText: 'INSPECTOR',
            enabled: false,
            panelType: 'normal',
            width: editor.call('localStorage:get', 'editor:layout:attributes:width') || 320,
            collapsible: true,
            collapseHorizontally: true,
            collapsed: editor.call('localStorage:get', 'editor:layout:attributes:collapse') || false,
            scrollable: true,
            resizable: 'left',
            resizeMin: 256,
            resizeMax: 512
        });
        attributesPanel.class.add('attributes');
        attributesPanel.on('resize', function () {
            editor.call('localStorage:set', 'editor:layout:attributes:width', attributesPanel.width);
        });
        attributesPanel.on('collapse', function () {
            editor.call('localStorage:set', 'editor:layout:attributes:collapse', true);
        });
        attributesPanel.on('expand', function () {
            editor.call('localStorage:set', 'editor:layout:attributes:collapse', false);
        });
        root.append(attributesPanel);
        // expose
        editor.method('layout.attributes', function () { return attributesPanel; });
        editor.on('permissions:writeState', function (state) {
            attributesPanel.enabled = state;
        });
        engine_1.VeryEngine.attributes = attributesPanel;
        // status bar
        var statusBar = new ui_1.TopElementContainer({
            id: 'layout-statusbar',
            flex: true,
            flexDirection: 'row'
        });
        root.append(statusBar);
        // expose
        editor.method('layout.statusBar', function () { return statusBar; });
        engine_1.VeryEngine.statusBar = statusBar;
        if (window.innerWidth <= 720) {
            // attributesPanel.folded = true;
            console.warn('folder');
        }
    };
    return Layout;
}());
exports.Layout = Layout;
},{"../engine":89,"../ui":108}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
var LocalStorage = /** @class */ (function () {
    function LocalStorage() {
        // Get a key from the local storage
        editor.method('localStorage:get', function (key) {
            var value = localStorage.getItem(key);
            if (value) {
                try {
                    value = JSON.parse(value);
                }
                catch (e) {
                    console.error(e);
                }
            }
            return value;
        });
        // Set a key-value pair in localStorage
        editor.method('localStorage:set', function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        });
        // Returns true if the key exists in the local storage
        editor.method('localStorage:has', function (key) {
            return !!localStorage.getItem(key);
        });
    }
    return LocalStorage;
}());
exports.LocalStorage = LocalStorage;
},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = void 0;
var transform_1 = require("./transform");
var gameobject_1 = require("./gameobject");
var Component = /** @class */ (function () {
    function Component() {
    }
    Object.defineProperty(Component.prototype, "transform", {
        get: function () {
            return new transform_1.Transform();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "gameObject", {
        get: function () {
            return new gameobject_1.GameObject();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "tag", {
        get: function () {
            return '';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "camera", {
        get: function () {
            return new Component();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "light", {
        get: function () {
            return new Component();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "renderer", {
        get: function () {
            return new Component();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "collider", {
        get: function () {
            return new Component();
        },
        enumerable: false,
        configurable: true
    });
    return Component;
}());
exports.Component = Component;
},{"./gameobject":52,"./transform":55}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObject = void 0;
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "transform", {
        get: function () {
            return this._transform;
        },
        set: function (val) {
            this._transform = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "name", {
        get: function () {
            return this.transform.name;
        },
        set: function (val) {
            this.transform.name = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "guid", {
        get: function () {
            return this._guid;
        },
        set: function (val) {
            this._guid = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "isEmpty", {
        get: function () {
            return this._transform.isEmpty;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "mesh", {
        get: function () {
            return this._transform.mesh;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "tag", {
        get: function () {
            return this._tag;
        },
        set: function (val) {
            this._tag = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameObject.prototype, "isActive", {
        get: function () {
            return this.isEmpty ? false : this.transform.transformNode.isEnabled();
        },
        enumerable: false,
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
    GameObject.prototype.addMesh = function (mesh) {
        // 删除空物体
        if (this._transform.mesh === null && this._transform.transformNode) {
            this._transform.transformNode.dispose();
        }
        this._transform.mesh = mesh;
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
},{"../../engine":89,"./transform":55}],53:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./transform"), exports);
__exportStar(require("./gameobject"), exports);
__exportStar(require("./component"), exports);
__exportStar(require("./middle-container"), exports);
},{"./component":51,"./gameobject":52,"./middle-container":54,"./transform":55}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddleContainer = void 0;
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
},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transform = void 0;
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "mesh", {
        get: function () {
            return this._mesh;
        },
        set: function (val) {
            this._mesh = val;
        },
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "childCount", {
        // TO be contioued
        get: function () {
            return 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transform.prototype, "hierarchyCount", {
        get: function () {
            return 0;
        },
        enumerable: false,
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
},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Search = void 0;
var Search = /** @class */ (function () {
    function Search() {
        // calculate, how many string `a`
        // requires edits, to become string `b`
        editor.method('search:stringEditDistance', function (a, b) {
            // Levenshtein distance
            // https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
            if (a.length === 0)
                return b.length;
            if (b.length === 0)
                return a.length;
            if (a === b)
                return 0;
            var i, j;
            var matrix = [];
            for (i = 0; i <= b.length; i++)
                matrix[i] = [i];
            for (j = 0; j <= a.length; j++)
                matrix[0][j] = j;
            for (i = 1; i <= b.length; i++) {
                for (j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    }
                    else {
                        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                    }
                }
            }
            return matrix[b.length][a.length];
        });
        // calculate, how many characters string `b`
        // contains of a string `a`
        editor.method('search:charsContains', function (a, b) {
            if (a === b)
                return a.length;
            var contains = 0;
            var ind = {};
            var i;
            for (i = 0; i < b.length; i++)
                ind[b.charAt(i)] = true;
            for (i = 0; i < a.length; i++) {
                if (ind[a.charAt(i)])
                    contains++;
            }
            return contains;
        });
        // tokenize string into array of tokens
        editor.method('search:stringTokenize', function (name) {
            var tokens = [];
            // camelCase
            // upperCASE123
            var string = name.replace(/([^A-Z])([A-Z][^A-Z])/g, '$1 $2').replace(/([A-Z0-9]{2,})/g, ' $1');
            // space notation
            // dash-notation
            // underscore_notation
            var parts = string.split(/(\s|\-|_)/g);
            // filter valid tokens
            for (var i = 0; i < parts.length; i++) {
                parts[i] = parts[i].toLowerCase().trim();
                if (parts[i] && parts[i] !== '-' && parts[i] !== '_')
                    tokens.push(parts[i]);
            }
            return tokens;
        });
        var searchItems = function (items, search, args) {
            var results = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                // direct hit
                if (item.subFull !== Infinity) {
                    results.push(item);
                    if (item.edits === Infinity)
                        item.edits = 0;
                    if (item.sub === Infinity)
                        item.sub = item.subFull;
                    continue;
                }
                else if (item.name === search || item.name.indexOf(search) === 0) {
                    results.push(item);
                    if (item.edits === Infinity)
                        item.edits = 0;
                    if (item.sub === Infinity)
                        item.sub = 0;
                    continue;
                }
                // check if name contains enough of search characters
                var contains = editor.call('search:charsContains', search, item.name);
                if (contains / search.length < args.containsCharsTolerance)
                    continue;
                var editsCandidate = Infinity;
                var subCandidate = Infinity;
                // for each token
                for (var t = 0; t < item.tokens.length; t++) {
                    // direct token match
                    if (item.tokens[t] === search) {
                        editsCandidate = 0;
                        subCandidate = t;
                        break;
                    }
                    var edits = editor.call('search:stringEditDistance', search, item.tokens[t]);
                    if ((subCandidate === Infinity || edits < editsCandidate) && item.tokens[t].indexOf(search) !== -1) {
                        // search is a substring of a token
                        subCandidate = t;
                        editsCandidate = edits;
                        continue;
                    }
                    else if (subCandidate === Infinity && edits < editsCandidate) {
                        // new edits candidate, not a substring of a token
                        if ((edits / Math.max(search.length, item.tokens[t].length)) <= args.editsDistanceTolerance) {
                            // check if edits tolerance is satisfied
                            editsCandidate = edits;
                        }
                    }
                }
                // no match candidate
                if (editsCandidate === Infinity)
                    continue;
                // add new result
                results.push(item);
                item.edits = item.edits === Infinity ? editsCandidate : item.edits + editsCandidate;
                item.sub = item.sub === Infinity ? subCandidate : item.sub + subCandidate;
            }
            return results;
        };
        // perform search through items
        // items is an array with arrays of two values
        // where first value is a string to be searched by
        // and second value is an object to be found
        /*
        [
            [ 'camera', {object} ],
            [ 'New Entity', {object} ],
            [ 'Sun', {object} ]
        ]
        */
        editor.method('search:items', function (items, search, args) {
            search = (search || '').toLowerCase().trim();
            if (!search)
                return [];
            var searchTokens = editor.call('search:stringTokenize', search);
            if (!searchTokens.length)
                return [];
            args = args || {};
            args.containsCharsTolerance = args.containsCharsTolerance || 0.5;
            args.editsDistanceTolerance = args.editsDistanceTolerance || 0.5;
            var result = [];
            var records = [];
            for (var i = 0; i < items.length; i++) {
                var subInd = items[i][0].toLowerCase().trim().indexOf(search);
                records.push({
                    name: items[i][0],
                    item: items[i][1],
                    tokens: editor.call('search:stringTokenize', items[i][0]),
                    edits: Infinity,
                    subFull: (subInd !== -1) ? subInd : Infinity,
                    sub: Infinity
                });
            }
            // search each token
            for (var i = 0; i < searchTokens.length; i++)
                records = searchItems(records, searchTokens[i], args);
            // sort result first by substring? then by edits number
            records.sort(function (a, b) {
                if (a.subFull !== b.subFull) {
                    return a.subFull - b.subFull;
                }
                else if (a.sub !== b.sub) {
                    return a.sub - b.sub;
                }
                else if (a.edits !== b.edits) {
                    return a.edits - b.edits;
                }
                else {
                    return a.name.length - b.name.length;
                }
            });
            // return only items without match information
            for (var i = 0; i < records.length; i++)
                records[i] = records[i].item;
            // limit number of results
            if (args.hasOwnProperty('limitResults') && records.length > args.limitResults) {
                records = records.slice(0, args.limitResults);
            }
            return records;
        });
    }
    return Search;
}());
exports.Search = Search;
},{}],57:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./selector"), exports);
__exportStar(require("./selector-history"), exports);
},{"./selector":59,"./selector-history":58}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectorHistory = void 0;
var SelectorHistory = /** @class */ (function () {
    function SelectorHistory() {
    }
    return SelectorHistory;
}());
exports.SelectorHistory = SelectorHistory;
},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Selector = void 0;
var lib_1 = require("../../lib");
var Selector = /** @class */ (function () {
    function Selector() {
        this.enabled = true;
        this.legacyScripts = false;
        this.type = '';
        this.length = 0;
        this.selector = new lib_1.ObserverList();
        this.evtChange = false;
        this.init();
    }
    Selector.prototype.init = function () {
        var self = this;
        var index = {};
        var keyByType = function (type) {
            switch (type) {
                case 'entity':
                    return 'resource_id';
                case 'asset':
                    return 'id';
            }
            return '';
        };
        var setIndex = function (type, item) {
            var key = keyByType(type);
            if (!key)
                return;
            if (!index[type])
                index[type] = {};
            index[type][item.get(key)] = item.once('destroy', function () {
                var state = editor.call('selector:history');
                if (state)
                    editor.call('selector:history', false);
                self.selector.remove(item);
                delete index[type][item.get(key)];
                if (state)
                    editor.call('selector:history', true);
            });
        };
        var removeIndex = function (type, item) {
            if (!index[type])
                return;
            var key = keyByType(type);
            if (!key)
                return;
            var ind = index[type][item.get(key)];
            if (!ind)
                return;
            ind.unbind();
        };
        var evtChange = false;
        var evtChangeFn = function () {
            evtChange = false;
            // console.log(self.selector.type);
            // console.log(self.selector.array());
            editor.emit('selector:change', self.selector.type, self.selector.array());
        };
        // adding
        self.selector.on('add', function (item) {
            // add index
            setIndex(self.type, item);
            console.error("adddddddd: " + self.type);
            editor.emit('selector:add', item, self.type);
            if (!evtChange) {
                evtChange = true;
                setTimeout(evtChangeFn, 0);
            }
        });
        // removing
        self.selector.on('remove', function (item) {
            editor.emit('selector:remove', item, self.type);
            console.error("removeeeeeee: " + self.type);
            // remove index
            removeIndex(self.type, item);
            if (self.length === 0)
                self.type = '';
            if (!evtChange) {
                evtChange = true;
                setTimeout(evtChangeFn, 0);
            }
        });
        // selecting item (toggle)
        editor.method('selector:toggle', function (type, item) {
            if (!self.enabled)
                return;
            if (self.selector.length && self.selector.type !== type) {
                self.selector.clear();
            }
            self.selector.type = type;
            self.type = type;
            if (self.selector.has(item)) {
                self.selector.remove(item);
            }
            else {
                self.selector.add(item);
            }
        });
        // selecting list of items
        editor.method('selector:set', function (type, items) {
            if (!self.enabled)
                return;
            self.selector.clear();
            if (!type || !items.length)
                return;
            // make sure items still exist
            if (type === 'asset') {
                items = items.filter(function (item) {
                    return (self.legacyScripts && item.get('type') === 'script') || !!editor.call('assets:get', item.get('id'));
                });
            }
            else if (type === 'entity') {
                items = items.filter(function (item) {
                    return !!editor.call('entities:get', item.get('resource_id'));
                });
            }
            if (!items.length)
                return;
            // type
            self.selector.type = type;
            self.type = type;
            // remove
            // TODO: 删除不重合的部分
            // self.selector.find(function (item: Observer) {
            //     return items.indexOf(item) === -1;
            // }).forEach(function (item: Observer) {
            //     self.selector.remove(item);
            // });
            // add
            for (var i = 0; i < items.length; i++)
                self.selector.add(items[i]);
        });
        // 某个面板选中item // selecting item hierarchy选择物体
        editor.method('selector:add', function (type, item) {
            if (!self.enabled)
                return;
            if (self.selector.has(item))
                return;
            console.warn('selector add入口');
            console.warn(item);
            if (self.selector.length > 0 && self.selector.type !== type) {
                self.selector.clear();
            }
            self.selector.type = type;
            self.type = type;
            self.selector.add(item);
        });
        // deselecting item
        editor.method('selector:remove', function (item) {
            if (!self.enabled)
                return;
            if (!self.selector.has(item))
                return;
            self.selector.remove(item);
        });
        // deselecting
        editor.method('selector:clear', function () {
            if (!self.enabled)
                return;
            self.selector.clear();
        });
        // return select type
        editor.method('selector:type', function () {
            return self.selector.type;
        });
        // return selected count
        editor.method('selector:count', function () {
            return self.selector.length;
        });
        // return selected items
        editor.method('selector:items', function () {
            return self.selector.array();
        });
        // return selected items without making copy of array
        editor.method('selector:itemsRaw', function () {
            return self.selector.data;
        });
        // return if it has item
        editor.method('selector:has', function (item) {
            return self.selector.has(item);
        });
        editor.method('selector:enabled', function (state) {
            self.enabled = state;
        });
    };
    return Selector;
}());
exports.Selector = Selector;
},{"../../lib":93}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GizmosManager = void 0;
var GizmosManager = /** @class */ (function () {
    function GizmosManager() {
    }
    GizmosManager.init = function (scene) {
        this.gizmoManager = new BABYLON.GizmoManager(scene);
    };
    GizmosManager.setMode = function (m) {
        this.mode = m;
        if (this.mode == 0) {
            this.gizmoManager.positionGizmoEnabled = true;
            this.gizmoManager.rotationGizmoEnabled = false;
            this.gizmoManager.scaleGizmoEnabled = false;
        }
        else if (this.mode === 1) {
            this.gizmoManager.positionGizmoEnabled = false;
            this.gizmoManager.rotationGizmoEnabled = true;
            this.gizmoManager.scaleGizmoEnabled = false;
        }
        else {
            this.gizmoManager.positionGizmoEnabled = false;
            this.gizmoManager.rotationGizmoEnabled = false;
            this.gizmoManager.scaleGizmoEnabled = true;
        }
    };
    GizmosManager.attach = function (mesh) {
        this.gizmoManager.attachToMesh(mesh);
        this.setMode(this.mode);
    };
    GizmosManager.clear = function () {
        this.gizmoManager.attachToMesh(null);
    };
    GizmosManager.mode = 0;
    return GizmosManager;
}());
exports.GizmosManager = GizmosManager;
},{}],61:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./toolbar-top-control"), exports);
__exportStar(require("./keeper"), exports);
__exportStar(require("./toolbar-logo"), exports);
__exportStar(require("./toolbar-gizmos"), exports);
__exportStar(require("./toolbar-history"), exports);
__exportStar(require("./toolbar-help"), exports);
__exportStar(require("./toolbar-control"), exports);
__exportStar(require("./toolbar-editor-settings"), exports);
__exportStar(require("./toolbar-publish"), exports);
__exportStar(require("./toolbar-scene"), exports);
__exportStar(require("./gizmo-manager"), exports);
},{"./gizmo-manager":60,"./keeper":62,"./toolbar-control":63,"./toolbar-editor-settings":64,"./toolbar-gizmos":65,"./toolbar-help":66,"./toolbar-history":67,"./toolbar-logo":68,"./toolbar-publish":69,"./toolbar-scene":70,"./toolbar-top-control":71}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarKeeper = void 0;
var toolbar_logo_1 = require("./toolbar-logo");
var toolbar_gizmos_1 = require("./toolbar-gizmos");
var toolbar_history_1 = require("./toolbar-history");
var toolbar_help_1 = require("./toolbar-help");
var toolbar_control_1 = require("./toolbar-control");
var toolbar_editor_settings_1 = require("./toolbar-editor-settings");
var toolbar_publish_1 = require("./toolbar-publish");
var toolbar_scene_1 = require("./toolbar-scene");
var ToolbarKeeper = /** @class */ (function () {
    function ToolbarKeeper() {
        var logo = new toolbar_logo_1.ToolbarLogo();
        var gizmos = new toolbar_gizmos_1.ToolbarGizmos();
        var history = new toolbar_history_1.ToolbarHistory();
        var help = new toolbar_help_1.ToolbarHelp();
        var control = new toolbar_control_1.ToolbarControl();
        var settings = new toolbar_editor_settings_1.ToolbarEditorSettings();
        var publish = new toolbar_publish_1.ToolbarPublish();
        var scene = new toolbar_scene_1.ToolbarScene();
    }
    return ToolbarKeeper;
}());
exports.ToolbarKeeper = ToolbarKeeper;
},{"./toolbar-control":63,"./toolbar-editor-settings":64,"./toolbar-gizmos":65,"./toolbar-help":66,"./toolbar-history":67,"./toolbar-logo":68,"./toolbar-publish":69,"./toolbar-scene":70}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarControl = void 0;
var engine_1 = require("../../engine");
var ui_1 = require("../../ui");
var ToolbarControl = /** @class */ (function () {
    function ToolbarControl() {
        var toolbar = engine_1.VeryEngine.toolbar;
        var button = new ui_1.Button('&#57654;');
        button.class.add('pc-icon', 'help-controls', 'bottom');
        toolbar.append(button);
        button.on('click', function () {
            editor.call('help:controls');
        });
        editor.on('help:controls:open', function () {
            button.class.add('active');
        });
        editor.on('help:controls:close', function () {
            button.class.remove('active');
        });
        ui_1.Tooltip.attach({
            target: button.element,
            text: 'Controls',
            align: 'left',
            root: editor.call('layout.root')
        });
    }
    return ToolbarControl;
}());
exports.ToolbarControl = ToolbarControl;
},{"../../engine":89,"../../ui":108}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarEditorSettings = void 0;
var engine_1 = require("../../engine");
var ui_1 = require("../../ui");
var ToolbarEditorSettings = /** @class */ (function () {
    function ToolbarEditorSettings() {
        var toolbar = engine_1.VeryEngine.toolbar;
        // settings button
        var button = new ui_1.Button('&#57652;');
        button.class.add('pc-icon', 'editor-settings', 'bottom');
        toolbar.append(button);
        button.on('click', function () {
            editor.call('selector:set', 'editorSettings', [editor.call('settings:projectUser')]);
        });
        editor.on('attributes:clear', function () {
            button.class.remove('active');
        });
        editor.on('attributes:inspect[editorSettings]', function () {
            editor.call('attributes.rootPanel').collapsed = false;
            button.class.add('active');
        });
        editor.on('viewport:expand', function (state) {
            button.disabled = state;
        });
        ui_1.Tooltip.attach({
            target: button.element,
            text: 'Settings',
            align: 'left',
            root: editor.call('layout.root')
        });
    }
    return ToolbarEditorSettings;
}());
exports.ToolbarEditorSettings = ToolbarEditorSettings;
},{"../../engine":89,"../../ui":108}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarGizmos = void 0;
var ui_1 = require("../../ui");
var gizmo_manager_1 = require("./gizmo-manager");
var ToolbarGizmos = /** @class */ (function () {
    function ToolbarGizmos() {
        var root = editor.call('layout.root');
        var toolbar = editor.call('layout.toolbar');
        var activeGizmo = null;
        var gizmoButtons = {};
        // create gizmo type buttons
        [{
                icon: '&#57617;',
                tooltip: '移动',
                op: 'translate'
            }, {
                icon: '&#57619;',
                tooltip: '旋转',
                op: 'rotate'
            }, {
                icon: '&#57618;',
                tooltip: '缩放',
                op: 'scale'
            }, {
                icon: '&#57666;',
                tooltip: 'Resize Element Component',
                op: 'resize'
            }].forEach(function (item, index) {
            var button = new ui_1.Button(item.icon);
            // button.hidden = !editor.call('permissions:write');
            button.op = item.op;
            button.class.add('pc-icon');
            gizmoButtons[item.op] = button;
            button.on('click', function () {
                if (activeGizmo.op === button.op)
                    return;
                activeGizmo.class.remove('active');
                activeGizmo.tooltip.class.add('innactive');
                activeGizmo = button;
                activeGizmo.class.add('active');
                activeGizmo.tooltip.class.remove('innactive');
                editor.call('gizmo:type', button.op);
                if (button.op === 'translate') {
                    gizmo_manager_1.GizmosManager.setMode(0);
                }
                else if (button.op === 'rotate') {
                    gizmo_manager_1.GizmosManager.setMode(1);
                }
                else {
                    gizmo_manager_1.GizmosManager.setMode(2);
                }
            });
            toolbar.append(button);
            button.tooltip = ui_1.Tooltip.attach({
                target: button.element,
                text: item.tooltip,
                align: 'left',
                root: root
            });
            if (item.op === 'translate') {
                activeGizmo = button;
                button.class.add('active');
            }
            else {
                button.tooltip.class.add('innactive');
            }
        });
        // coordinate system
        var buttonWorld = new ui_1.Button('&#57624;');
        // buttonWorld.hidden = !editor.call('permissions:write');
        buttonWorld.class.add('pc-icon', 'active');
        toolbar.append(buttonWorld);
        buttonWorld.on('click', function () {
            if (buttonWorld.class.contains('active')) {
                buttonWorld.class.remove('active');
                tooltipWorld.html = 'World / <span style="color:#fff">Local</span>';
            }
            else {
                buttonWorld.class.add('active');
                tooltipWorld.html = '<span style="color:#fff">World</span> / Local';
            }
            editor.call('gizmo:coordSystem', buttonWorld.class.contains('active') ? 'world' : 'local');
        });
        var tooltipWorld = ui_1.Tooltip.attach({
            target: buttonWorld.element,
            align: 'left',
            root: root
        });
        tooltipWorld.html = '<span style="color:#fff">World</span> / Local';
        tooltipWorld.class.add('innactive');
        // toggle grid snap
        var buttonSnap = new ui_1.Button('&#57622;');
        // buttonSnap.hidden = !editor.call('permissions:write');
        buttonSnap.class.add('pc-icon');
        buttonSnap.on('click', function () {
            if (buttonSnap.class.contains('active')) {
                buttonSnap.class.remove('active');
                tooltipSnap.class.add('innactive');
            }
            else {
                buttonSnap.class.add('active');
                tooltipSnap.class.remove('innactive');
            }
            editor.call('gizmo:snap', buttonSnap.class.contains('active'));
        });
        toolbar.append(buttonSnap);
        var tooltipSnap = ui_1.Tooltip.attach({
            target: buttonSnap.element,
            text: 'Snap',
            align: 'left',
            root: root
        });
        tooltipSnap.class.add('innactive');
        editor.on('permissions:writeState', function (state) {
            for (var key in gizmoButtons) {
                // gizmoButtons[key].hidden = !state;
            }
            // buttonWorld.hidden = !state;
            // buttonSnap.hidden = !state;
        });
        // focus on entity
        var buttonFocus = new ui_1.Button('&#57623;');
        buttonFocus.disabled = true;
        buttonFocus.class.add('pc-icon');
        buttonFocus.on('click', function () {
            editor.call('viewport:focus');
        });
        toolbar.append(buttonFocus);
        editor.on('attributes:clear', function () {
            buttonFocus.disabled = true;
            tooltipFocus.class.add('innactive');
        });
        editor.on('attributes:inspect[*]', function (type) {
            buttonFocus.disabled = type !== 'entity';
            if (type === 'entity') {
                tooltipFocus.class.remove('innactive');
            }
            else {
                tooltipFocus.class.add('innactive');
            }
        });
        var tooltipFocus = ui_1.Tooltip.attach({
            target: buttonFocus.element,
            text: 'Focus',
            align: 'left',
            root: root
        });
        tooltipFocus.class.add('innactive');
    }
    return ToolbarGizmos;
}());
exports.ToolbarGizmos = ToolbarGizmos;
},{"../../ui":108,"./gizmo-manager":60}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarHelp = void 0;
var engine_1 = require("../../engine");
var ui_1 = require("../../ui");
var ToolbarHelp = /** @class */ (function () {
    function ToolbarHelp() {
        var toolbar = engine_1.VeryEngine.toolbar;
        var button = new ui_1.Button('&#57656;');
        button.class.add('pc-icon', 'help-howdoi', 'bottom', 'push-top');
        toolbar.append(button);
        button.on('click', function () {
            editor.call('help:howdoi:toggle');
        });
        editor.on('help:howdoi:open', function () {
            button.class.add('active');
        });
        editor.on('help:howdoi:close', function () {
            button.class.remove('active');
        });
        ui_1.Tooltip.attach({
            target: button.element,
            text: 'How do I...?',
            align: 'left',
            root: editor.call('layout.root')
        });
    }
    return ToolbarHelp;
}());
exports.ToolbarHelp = ToolbarHelp;
},{"../../engine":89,"../../ui":108}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarHistory = void 0;
var engine_1 = require("../../engine");
var ui_1 = require("../../ui");
var ToolbarHistory = /** @class */ (function () {
    function ToolbarHistory() {
        var root = engine_1.VeryEngine.root;
        var toolbar = engine_1.VeryEngine.toolbar;
        // undo
        var buttonUndo = new ui_1.Button('&#57620;');
        // buttonUndo.hidden = !editor.call('permissions:write');
        buttonUndo.class.add('pc-icon');
        buttonUndo.enabled = editor.call('history:canUndo');
        toolbar.append(buttonUndo);
        editor.on('history:canUndo', function (state) {
            buttonUndo.enabled = state;
            if (state) {
                tooltipUndo.class.remove('innactive');
            }
            else {
                tooltipUndo.class.add('innactive');
            }
        });
        buttonUndo.on('click', function () {
            editor.call('history:undo');
        });
        var tooltipUndo = ui_1.Tooltip.attach({
            target: buttonUndo.element,
            text: 'Undo',
            align: 'left',
            root: root
        });
        if (!editor.call('history:canUndo'))
            tooltipUndo.class.add('innactive');
        // redo
        var buttonRedo = new ui_1.Button('&#57621;');
        // buttonRedo.hidden = !editor.call('permissions:write');
        buttonRedo.class.add('pc-icon');
        buttonRedo.enabled = editor.call('history:canRedo');
        toolbar.append(buttonRedo);
        editor.on('history:canRedo', function (state) {
            buttonRedo.enabled = state;
            if (state) {
                tooltipRedo.class.remove('innactive');
            }
            else {
                tooltipRedo.class.add('innactive');
            }
        });
        buttonRedo.on('click', function () {
            editor.call('history:redo');
        });
        var tooltipRedo = ui_1.Tooltip.attach({
            target: buttonRedo.element,
            text: 'Redo',
            align: 'left',
            root: root
        });
        if (!editor.call('history:canUndo'))
            tooltipRedo.class.add('innactive');
        editor.on('permissions:writeState', function (state) {
            buttonUndo.hidden = buttonRedo.hidden = !state;
        });
    }
    return ToolbarHistory;
}());
exports.ToolbarHistory = ToolbarHistory;
},{"../../engine":89,"../../ui":108}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarLogo = void 0;
var ui_1 = require("../../ui");
var ToolbarLogo = /** @class */ (function () {
    function ToolbarLogo() {
        var root = editor.call('layout.root');
        var toolbar = editor.call('layout.toolbar');
        var logo = new ui_1.Button();
        logo.class.add('logo');
        logo.on('click', function () {
            // menu.open = true;
            console.log('logo click');
        });
        toolbar.append(logo);
    }
    return ToolbarLogo;
}());
exports.ToolbarLogo = ToolbarLogo;
},{"../../ui":108}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarPublish = void 0;
var engine_1 = require("../../engine");
var ui_1 = require("../../ui");
var ToolbarPublish = /** @class */ (function () {
    function ToolbarPublish() {
        var toolbar = engine_1.VeryEngine.toolbar;
        var button = new ui_1.Button('&#57911;');
        button.class.add('pc-icon', 'publish-download');
        toolbar.append(button);
        button.on('click', function () {
            editor.call('picker:publish');
        });
        editor.on('picker:publish:open', function () {
            button.class.add('active');
        });
        editor.on('picker:publish:close', function () {
            button.class.remove('active');
        });
        ui_1.Tooltip.attach({
            target: button.element,
            text: 'Publish / Download',
            align: 'left',
            root: editor.call('layout.root')
        });
    }
    return ToolbarPublish;
}());
exports.ToolbarPublish = ToolbarPublish;
},{"../../engine":89,"../../ui":108}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarScene = void 0;
var engine_1 = require("../../engine");
var ui_1 = require("../../ui");
var ToolbarScene = /** @class */ (function () {
    function ToolbarScene() {
        var root = engine_1.VeryEngine.root;
        var viewport = engine_1.VeryEngine.viewportPanel;
        var panel = new ui_1.Panel();
        panel.class.add('widget-title');
        viewport.append(panel);
        editor.method('layout.toolbar.scene', function () {
            return panel;
        });
        var projectName = new ui_1.Label();
        // TODO
        projectName.text = '当前项目名称';
        projectName.class.add('project-name');
        projectName.renderChanges = false;
        panel.append(projectName);
        projectName.on('click', function (argument) {
            // window.open('/project/' + config.project.id, '_blank');
        });
        editor.method("toolbar.project.set", function (name) {
            projectName.text = name;
        });
        ui_1.Tooltip.attach({
            target: projectName.element,
            text: 'Project',
            align: 'top',
            root: root
        });
        var sceneName = new ui_1.Label();
        // TODO
        sceneName.text = '当前Scene Name';
        sceneName.class.add('scene-name');
        sceneName.renderChanges = false;
        panel.append(sceneName);
        editor.method("toolbar.scene.set", function (name) {
            sceneName.text = name;
        });
        ui_1.Tooltip.attach({
            target: sceneName.element,
            text: 'Settings',
            align: 'top',
            root: root
        });
        editor.on('scene:name', function (name) {
            sceneName.text = name;
        });
        sceneName.on('click', function () {
            editor.call('selector:set', 'editorSettings', [editor.call('settings:projectUser')]);
        });
        editor.on('attributes:clear', function () {
            sceneName.class.remove('active');
        });
        editor.on('attributes:inspect[editorSettings]', function () {
            sceneName.class.add('active');
        });
        editor.on('scene:unload', function () {
            sceneName.text = '';
        });
        // if (!config.project.settings.useLegacyScripts) {
        //     var name = config.self.branch.name;
        //     if (name.length > 33) {
        //         name = name.substring(0, 30) + '...';
        //     }
        //     var branchButton = new ui.Label({
        //         text: name
        //     });
        //     branchButton.class.add('branch-name');
        //     panel.append(branchButton);
        //     branchButton.on('click', function () {
        //         editor.call('picker:versioncontrol');
        //     });
        //     Tooltip.attach({
        //         target: branchButton.element,
        //         text: 'Version Control',
        //         align: 'top',
        //         root: root
        //     });
        //     // hide version control picker if we are not part of the team
        //     if (!editor.call('permissions:read')) {
        //         branchButton.hidden = true;
        //     }
        //     editor.on('permissions:set', function () {
        //         branchButton.hidden = !editor.call('permissions:read');
        //     });
        // }
        var sceneList = new ui_1.Label();
        sceneList.class.add('scene-list');
        panel.append(sceneList);
        ui_1.Tooltip.attach({
            target: sceneList.element,
            text: 'Manage Scenes',
            align: 'top',
            root: root
        });
        sceneList.on('click', function () {
            editor.call('picker:scene');
        });
        editor.on('picker:scene:open', function () {
            sceneList.class.add('active');
        });
        editor.on('picker:scene:close', function () {
            sceneList.class.remove('active');
        });
    }
    return ToolbarScene;
}());
exports.ToolbarScene = ToolbarScene;
},{"../../engine":89,"../../ui":108}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolbarTopControl = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var global_1 = require("../global");
var ToolbarTopControl = /** @class */ (function () {
    function ToolbarTopControl() {
        // panel
        var panel = new ui_1.Panel();
        panel.class.add('top-controls');
        engine_1.VeryEngine.viewportPanel.append(panel);
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
            root: engine_1.VeryEngine.root
        });
        var buttonLaunch = new ui_1.Button('&#57649;');
        buttonLaunch.class.add('icon');
        panel.append(buttonLaunch);
        buttonLaunch.on('click', function () {
            window.open(window.location.protocol + "//" + window.location.host + "/publish/" + global_1.Config.projectID);
        });
        var tooltipLaunch = ui_1.Tooltip.attach({
            target: buttonLaunch.element,
            text: '发布',
            align: 'top',
            root: engine_1.VeryEngine.root
        });
    }
    return ToolbarTopControl;
}());
exports.ToolbarTopControl = ToolbarTopControl;
},{"../../engine":89,"../../ui":108,"../global":37}],72:[function(require,module,exports){
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
exports.AjaxRequest = exports.Ajax = void 0;
var lib_1 = require("../../lib");
var Ajax = /** @class */ (function () {
    function Ajax(args) {
        if (typeof (args) === 'string')
            args = { url: args };
        return new AjaxRequest(args);
    }
    Ajax.get = function (url) {
        return new AjaxRequest({ url: url });
    };
    Ajax.post = function (url, data) {
        return new AjaxRequest({
            method: 'POST',
            url: url,
            data: data
        });
    };
    Ajax.put = function (url, data) {
        return new AjaxRequest({
            method: 'PUT',
            url: url,
            data: data
        });
    };
    Ajax.delete = function (url) {
        return new AjaxRequest({
            method: 'DELETE',
            url: url
        });
    };
    Ajax.param = function (name, value) {
        Ajax.params[name] = value;
    };
    Ajax.params = {};
    return Ajax;
}());
exports.Ajax = Ajax;
var AjaxRequest = /** @class */ (function (_super) {
    __extends(AjaxRequest, _super);
    function AjaxRequest(args) {
        var _this = _super.call(this) || this;
        _this._progress = 0;
        if (!args) {
            throw new Error('ajax请求无参数，请检查！');
        }
        _this._progress = 0.0;
        _this.emit('progress', _this._progress);
        _this._xhr = new XMLHttpRequest();
        // send cookies
        if (args.cookies)
            _this._xhr.withCredentials = true;
        // events
        _this._xhr.addEventListener('load', _this._onLoad.bind(_this), false);
        // this._xhr.addEventListener('progress', this._onProgress.bind(this), false);
        _this._xhr.upload.addEventListener('progress', _this._onProgress.bind(_this), false);
        _this._xhr.addEventListener('error', _this._onError.bind(_this), false);
        _this._xhr.addEventListener('abort', _this._onAbort.bind(_this), false);
        // url
        var url = args.url;
        // query
        if (args.query && Object.keys(args.query).length) {
            if (url.indexOf('?') === -1) {
                url += '?';
            }
            var query = [];
            for (var key in args.query) {
                query.push(key + '=' + args.query[key]);
            }
            url += query.join('&');
        }
        // templating
        var parts = url.split('{{');
        if (parts.length > 1) {
            for (var i = 1; i < parts.length; i++) {
                var ends = parts[i].indexOf('}}');
                var key = parts[i].slice(0, ends);
                if (Ajax.params[key] === undefined)
                    continue;
                // replace
                parts[i] = Ajax.params[key] + parts[i].slice(ends + 2);
            }
            url = parts.join('');
        }
        // open request
        _this._xhr.open(args.method || 'GET', url, true);
        // 返回数据是否为json格式
        _this.notJson = args.notJson || false;
        // header for PUT/POST
        if (!args.ignoreContentType && (args.method === 'PUT' || args.method === 'POST' || args.method === 'DELETE'))
            _this._xhr.setRequestHeader('Content-Type', 'application/json');
        // TODO: 权限header参数
        // if (args.auth && config.accessToken) {
        //     this._xhr.setRequestHeader('Authorization', 'Bearer ' + config.accessToken);
        // }
        if (args.headers) {
            for (var key in args.headers)
                _this._xhr.setRequestHeader(key, args.headers[key]);
        }
        // stringify data if needed
        if (args.data && typeof (args.data) !== 'string' && !(args.data instanceof FormData)) {
            args.data = JSON.stringify(args.data);
        }
        // make request
        _this._xhr.send(args.data || null);
        return _this;
    }
    AjaxRequest.prototype._onLoad = function () {
        this._progress = 1.0;
        this.emit('progress', 1.0);
        if (this._xhr.status === 200 || this._xhr.status === 201) {
            if (this.notJson) {
                this.emit('load', this._xhr.status, this._xhr.responseText);
            }
            else {
                try {
                    var json = JSON.parse(this._xhr.responseText);
                }
                catch (ex) {
                    this.emit('error', this._xhr.status || 0, new Error('invalid json'));
                    return;
                }
                this.emit('load', this._xhr.status, json);
            }
        }
        else {
            try {
                var json = JSON.parse(this._xhr.responseText);
                var msg = json.message;
                if (!msg) {
                    msg = json.error || (json.response && json.response.error);
                }
                if (!msg) {
                    msg = this._xhr.responseText;
                }
                this.emit('error', this._xhr.status, msg);
            }
            catch (ex) {
                this.emit('error', this._xhr.status);
            }
        }
    };
    AjaxRequest.prototype._onError = function (evt) {
        this.emit('error', 0, evt);
    };
    AjaxRequest.prototype._onAbort = function (evt) {
        this.emit('error', 0, evt);
    };
    AjaxRequest.prototype._onProgress = function (evt) {
        if (!evt.lengthComputable)
            return;
        var progress = evt.loaded / evt.total;
        if (progress !== this._progress) {
            this._progress = progress;
            this.emit('progress', this._progress);
        }
    };
    AjaxRequest.prototype.abort = function () {
        this._xhr.abort();
    };
    return AjaxRequest;
}(lib_1.Events));
exports.AjaxRequest = AjaxRequest;
},{"../../lib":93}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentsLogos = void 0;
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
},{}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMenu = void 0;
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
},{}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debug = void 0;
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
},{}],76:[function(require,module,exports){
(function (process,setImmediate){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventProxy = void 0;
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

},{"_process":1,"timers":2}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUID = void 0;
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
},{}],78:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./components-logos"), exports);
__exportStar(require("./context-menu"), exports);
__exportStar(require("./guid"), exports);
__exportStar(require("./eventproxy"), exports);
__exportStar(require("./debug"), exports);
__exportStar(require("./tools"), exports);
__exportStar(require("./ajax"), exports);
},{"./ajax":72,"./components-logos":73,"./context-menu":74,"./debug":75,"./eventproxy":76,"./guid":77,"./tools":79}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tools = void 0;
var engine_1 = require("../../engine");
var Tools = /** @class */ (function () {
    function Tools() {
    }
    Tools.GetFilename = function (path) {
        var index = path.lastIndexOf("/");
        if (index < 0) {
            return path;
        }
        return path.substring(index + 1);
    };
    Tools.GetFolderPath = function (uri, returnUnchangedIfNoSlash) {
        if (returnUnchangedIfNoSlash === void 0) { returnUnchangedIfNoSlash = false; }
        var index = uri.lastIndexOf("/");
        if (index < 0) {
            if (returnUnchangedIfNoSlash) {
                return uri;
            }
            return "";
        }
        return uri.substring(0, index + 1);
    };
    // TODO
    Tools.Error = function (message) {
        debug.error(message);
    };
    Tools.CleanUrl = function (url) {
        url = url.replace(/#/mg, "%23");
        return url;
    };
    Tools.loadBabylon = function () {
        // axios.defaults.responseType = 'json';
        axios.get('scene/dude.json')
            .then(function (respone) {
            console.warn(typeof respone.data);
            // console.log(respone.data.toString());
            console.log(respone.data);
            // console.log(respone.data.meshes);
            // scene数据 -> mesh -> name -> babylon.meshes array -> id ？ 貌似导出的id应该是不重合的
            // 加载blue
            Tools.loadBlue(respone.data, 'scene/');
        });
        var success = function (data, url) {
            // console.error(data);
            // console.error(data);
            // console.error(url);
        };
        // BABYLON.Tools.LoadFile('scene/scene.babylon', success);
        // console.error('length: ' + Object.keys(BABYLON.FilesInputStore.FilesToLoad).length);
        // for (let key in BABYLON.FilesInputStore.FilesToLoad) {
        //     console.error('key: ' + key);
        //     console.error(BABYLON.FilesInputStore.FilesToLoad[key]);
        // }
    };
    Tools.loadBlue = function (data, rootUrl) {
        // 根据ID加载资源 -> mesh -> material -> animations
        // 属性面板和Assets显示完整模型? -> container中包含模型，两边使用 -> 但是如果一边删除了模型，container中也没了
        // ?在new Mesh时，mesh已经添加到对应的scene，难办了，如何实现缓存？只实现数据的缓存？
        // 再搞一个中间结构缓存原始数据？
        // scene数据 -> .babylon数据缓存 -> model -> mesh | 几何 + material + texture -> 进行快速关联 -> 如何把texture提交进去
        // texture数据如何实现缓存，直接将数据交给engine中的数据结构？
        // Lights
        if (data.lights !== undefined && data.lights !== null) {
            for (var index = 0, cache = data.lights.length; index < cache; index++) {
                var parsedLight = data.lights[index];
                var light = BABYLON.Light.Parse(parsedLight, engine_1.VeryEngine.viewScene);
                if (light) {
                    // container.lights.push(light);
                    // log += (index === 0 ? "\n\tLights:" : "");
                    // log += "\n\t\t" + light.toString(fullDetails);
                }
            }
        }
        // Animations
        if (data.animations !== undefined && data.animations !== null) {
            for (var index = 0, cache = data.animations.length; index < cache; index++) {
                var parsedAnimation = data.animations[index];
                var internalClass = BABYLON._TypeStore.GetClass("BABYLON.Animation");
                if (internalClass) {
                    var animation = internalClass.Parse(parsedAnimation);
                    engine_1.VeryEngine.viewScene.animations.push(animation);
                    // container.animations.push(animation);
                    // log += (index === 0 ? "\n\tAnimations:" : "");
                    // log += "\n\t\t" + animation.toString(fullDetails);
                }
            }
        }
        // Materials
        if (data.materials !== undefined && data.materials !== null) {
            for (var index = 0, cache = data.materials.length; index < cache; index++) {
                var parsedMaterial = data.materials[index];
                var mat = BABYLON.Material.Parse(parsedMaterial, engine_1.VeryEngine.viewScene, rootUrl);
                // container.materials.push(mat);
                // log += (index === 0 ? "\n\tMaterials:" : "");
                // log += "\n\t\t" + mat.toString(fullDetails);
            }
        }
        if (data.multiMaterials !== undefined && data.multiMaterials !== null) {
            for (var index = 0, cache = data.multiMaterials.length; index < cache; index++) {
                var parsedMultiMaterial = data.multiMaterials[index];
                var mmat = BABYLON.MultiMaterial.ParseMultiMaterial(parsedMultiMaterial, engine_1.VeryEngine.viewScene);
                // container.multiMaterials.push(mmat);
                // log += (index === 0 ? "\n\tMultiMaterials:" : "");
                // log += "\n\t\t" + mmat.toString(fullDetails);
            }
        }
        // Skeletons
        if (data.skeletons !== undefined && data.skeletons !== null) {
            for (var index = 0, cache = data.skeletons.length; index < cache; index++) {
                var parsedSkeleton = data.skeletons[index];
                var skeleton = BABYLON.Skeleton.Parse(parsedSkeleton, engine_1.VeryEngine.viewScene);
                skeleton.beginAnimation("Skeleton0", true);
                // container.skeletons.push(skeleton);
                // log += (index === 0 ? "\n\tSkeletons:" : "");
                // log += "\n\t\t" + skeleton.toString(fullDetails);
            }
        }
        // Geometries
        var geometries = data.geometries;
        if (geometries !== undefined && geometries !== null) {
            var addedGeometry = new Array();
            // VertexData
            var vertexData = geometries.vertexData;
            if (vertexData !== undefined && vertexData !== null) {
                for (var index = 0, cache = vertexData.length; index < cache; index++) {
                    var parsedVertexData = vertexData[index];
                    addedGeometry.push(BABYLON.Geometry.Parse(parsedVertexData, engine_1.VeryEngine.viewScene, rootUrl));
                }
            }
            // addedGeometry.forEach((g) => {
            //     if (g) {
            //         container.geometries.push(g);
            //     }
            // });
        }
        // meshes
        if (data.meshes !== undefined && data.meshes !== null) {
            for (var index = 0, cache = data.meshes.length; index < cache; index++) {
                var parsedMesh = data.meshes[index];
                var mesh = BABYLON.Mesh.Parse(parsedMesh, engine_1.VeryEngine.viewScene, rootUrl);
                // container.meshes.push(mesh);
                // log += (index === 0 ? "\n\tMeshes:" : "");
                // log += "\n\t\t" + mesh.toString(fullDetails);
            }
        }
        // 创建之前先搞一个blob？
        // let tex = new BABYLON.Texture('scene/头像.png', VeryEngine.viewScene);
        // console.log(tex);
        console.log(engine_1.VeryEngine.viewEngine._internalTexturesCache);
        // setTimeout(() => {
        //     VeryEngine.viewScene.render();
        //     BABYLON.Tools.CreateScreenshot(VeryEngine.viewEngine, VeryEngine.viewScene.activeCamera!, 1600);
        // }, 2000);
        // 信息交换
    };
    // public static LoadFile(url: string, onSuccess: (data: string | ArrayBuffer, responseURL?: string) => void, onProgress?: (data: any) => void, useArrayBuffer?: boolean, onError?: (request?: WebRequest, exception?: any) => void): IFileRequest {
    //     url = Tools.CleanUrl(url);
    //     url = Tools.PreprocessUrl(url);
    //     // 在本地缓存中存在此文件， TODO: 还有本地上传的情况处理
    //     if (url.indexOf("file:") !== -1) {
    //         // const fileName = decodeURIComponent(url.substring(5).toLowerCase());
    //         // if (FilesInputStore.FilesToLoad[fileName]) {
    //         //     // 缓存文件
    //         //     return Tools.ReadFile(FilesInputStore.FilesToLoad[fileName], onSuccess, onProgress, useArrayBuffer);
    //         // }
    //     }
    //     const loadUrl = Tools.BaseUrl + url;
    //     let aborted = false;
    //     const fileRequest: IFileRequest = {
    //         onCompleteObservable: new Observable<IFileRequest>(),
    //         abort: () => aborted = true,
    //     };
    // }
    /**
     * name字符串合法性检查，不允许出现 “\/*<>?|"':” 等字符串，若存在，则返回false；
     * @param name 待检查的name字符串；
     */
    Tools.isLegalName = function (name) {
        // var re = /[^\u4e00-\u9fa5]/; // 中文正则
        // var pattern = new RegExp("[`\\-~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？12345678990]"); // 特殊符号
        var illegalPattern = /[\\\/*<>?|"':]/;
        if (illegalPattern.test(name)) {
            return false;
        }
        else {
            return true;
        }
    };
    /**
     * 字符串排序，特殊字符在最前头，其余按照字母顺序进行排列
     * @param a 第1个字符串；
     * @param b 第2个字符串；
     */
    Tools.stringCompare = function (a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        if (a === b) {
            return 0;
        }
        // TODO: 目前采用了js默认的比较函数，由于Safari等浏览器不支持locals参数，英文默认在中文之后，特殊字符在最前
        return a.localeCompare(b);
    };
    Tools.appendQuery = function (origin, query) {
        var separator = origin.indexOf('?') !== -1 ? '&' : '?';
        return this + separator + query;
    };
    Tools.BaseUrl = "";
    Tools.PreprocessUrl = function (url) {
        return url;
    };
    return Tools;
}());
exports.Tools = Tools;
},{"../../engine":89}],80:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./viewport"), exports);
__exportStar(require("./viewport-expand"), exports);
__exportStar(require("./viewport-application"), exports);
__exportStar(require("./viewport-instance-create"), exports);
__exportStar(require("./viewport-drop-model"), exports);
},{"./viewport":86,"./viewport-application":82,"./viewport-drop-model":83,"./viewport-expand":84,"./viewport-instance-create":85}],81:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportKeeper = void 0;
var viewport_application_1 = require("./viewport-application");
var viewport_instance_create_1 = require("./viewport-instance-create");
var viewport_drop_model_1 = require("./viewport-drop-model");
var ViewportKeeper = /** @class */ (function () {
    function ViewportKeeper() {
        new viewport_application_1.ViewportApplication();
        new viewport_instance_create_1.ViewportInstanceCreate();
        new viewport_drop_model_1.ViewportDropModel();
    }
    return ViewportKeeper;
}());
exports.ViewportKeeper = ViewportKeeper;
},{"./viewport-application":82,"./viewport-drop-model":83,"./viewport-instance-create":85}],82:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportApplication = void 0;
var engine_1 = require("../../engine");
var ViewportApplication = /** @class */ (function () {
    function ViewportApplication() {
        editor.method("load:blue", function (type, data) {
            console.log(type);
            console.log(data);
            if (type === "Light") {
                // Lights
                var light = BABYLON.Light.Parse(data, engine_1.VeryEngine.viewScene);
            }
            else if (type === 'Camera') {
                // Cameras
                var camera = BABYLON.Camera.Parse(data, engine_1.VeryEngine.viewScene);
                // VeryEngine.viewScene.activeCamera = camera;
                console.log(camera);
            }
        });
    }
    return ViewportApplication;
}());
exports.ViewportApplication = ViewportApplication;
},{"../../engine":89}],83:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportDropModel = void 0;
var engine_1 = require("../../engine");
var toolbar_1 = require("../toolbar");
var ViewportDropModel = /** @class */ (function () {
    function ViewportDropModel() {
        editor.method("loadTempModel", function (babylon_data) {
            console.log("加载模型");
            console.log(babylon_data);
            var rootUrl = babylon_data.get("file.url");
            var modelName = babylon_data.get("file.filename");
            rootUrl = rootUrl.substring(0, rootUrl.length - modelName.length);
            BABYLON.SceneLoader.Append(rootUrl, modelName, engine_1.VeryEngine.viewScene, function (scene) {
                // console.log("************mesh个数：" + scene.meshes.length);
                for (var i = 0; i < scene.meshes.length; i++) {
                    var mesh = scene.meshes[i];
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;
                    var parentID = "";
                    if (mesh.parent !== null) {
                        parentID = mesh.parent.id;
                    }
                    var childs = mesh.getChildren();
                    var myChildren = [];
                    for (var k = 0; k < childs.length; k++) {
                        myChildren.push(childs[k].id);
                    }
                    var data = {
                        name: mesh.name,
                        resource_id: mesh.id,
                        parent: parentID,
                        position: [mesh.position.x, mesh.position.y, mesh.position.z],
                        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                        scale: [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z],
                        children: myChildren,
                        enabled: mesh.isEnabled(),
                        tags: [],
                        root: false,
                        type: "Mesh",
                        asset: rootUrl,
                        asset2: modelName
                    };
                    // console.log(scene.meshes[i].id + " : " + scene.meshes[i].name);
                    // console.error(data);
                    editor.call("entity:new:babylon", data);
                }
                for (var i = 0; i < scene.transformNodes.length; i++) {
                    var node = scene.transformNodes[i];
                    var parentID = "";
                    if (node.parent !== null) {
                        parentID = node.parent.id;
                    }
                    var data = {
                        name: node.name,
                        resource_id: node.id,
                        parent: parentID,
                        position: [node.position.x, node.position.y, node.position.z],
                        rotation: [node.rotation.x, node.rotation.y, node.rotation.z],
                        scale: [node.scaling.x, node.scaling.y, node.scaling.z],
                        children: myChildren,
                        enabled: node.isEnabled(),
                        tags: [],
                        root: false,
                        type: "TransformNode",
                        asset: rootUrl,
                        asset2: modelName
                    };
                    // console.log(scene.meshes[i].id + " : " + scene.meshes[i].name);
                    editor.call("entity:new:babylon", data);
                }
                // console.error("加载");
                editor.emit('entities:load', true);
                // console.log("************node个数：" + scene.transformNodes.length);
                // for(let i = 0; i < scene.transformNodes.length; i++) {
                //     console.log(scene.transformNodes[i].id + " : " + scene.transformNodes[i].name);
                // }
                // console.log("************root个数：" + scene.rootNodes.length);
                // for(let i = 0; i < scene.rootNodes.length; i++) {
                //     console.log(scene.rootNodes[i].id + " : " + scene.rootNodes[i].name);
                // }
                scene.onPointerObservable.add(function (pointerInfo) {
                    switch (pointerInfo.type) {
                        case BABYLON.PointerEventTypes.POINTERDOWN:
                            // console.log("down");
                            if (pointerInfo.pickInfo.pickedMesh != null) {
                                editor.call("pick", pointerInfo.pickInfo.pickedMesh);
                            }
                            else {
                                editor.call("pick", null);
                            }
                            // console.log(pointerInfo!.pickInfo!.pickedMesh);
                            break;
                    }
                });
            });
            // 默认加载
            // editor.method("entity:new:mesh", )
        });
        editor.method("pick", function (mesh) {
            if (mesh === null) {
                toolbar_1.GizmosManager.clear();
            }
            else {
                toolbar_1.GizmosManager.attach(mesh);
                var entity = editor.call('entities:get', mesh.id);
                if (entity) {
                    editor.call('selector:set', 'entity', [entity]);
                }
                else {
                    console.error("失败");
                }
            }
        });
        editor.method("loadTempModel2", function (rootUrl, modelName) {
            BABYLON.SceneLoader.Append(rootUrl, modelName, engine_1.VeryEngine.viewScene, function (scene) {
                // console.error("加载2");
                // console.log("************mesh个数：" + scene.meshes.length);
                for (var i = 0; i < scene.meshes.length; i++) {
                    var mesh = scene.meshes[i];
                    mesh.checkCollisions = true;
                    mesh.isPickable = true;
                    var entity = editor.call('entities:get', mesh.id);
                    if (entity) {
                        entity.node = mesh;
                    }
                    // let parentID: string = "";
                    // if (mesh.parent !== null) {
                    //     parentID = mesh.parent!.id;
                    // }
                    // var childs = mesh.getChildren();
                    // var myChildren = [];
                    // for (let k = 0; k < childs.length; k++) {
                    //     myChildren.push(childs[k].id);
                    // }
                    // let data = {
                    //     name: mesh.name,
                    //     resource_id: mesh.id,
                    //     parent: parentID,
                    //     position: [mesh.position.x, mesh.position.y, mesh.position.z],
                    //     rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
                    //     scale: [mesh.scaling.x, mesh.scaling.y, mesh.scaling.z],
                    //     children: myChildren,
                    //     enabled: mesh.isEnabled(),
                    //     tags: [],
                    //     root: false,
                    //     type: "Mesh",
                    //     asset: rootUrl,
                    //     asset2: modelName
                    // }
                    // // console.log(scene.meshes[i].id + " : " + scene.meshes[i].name);
                    // // console.error(data);
                    // editor.call("entity:new:babylon", data);
                }
                for (var i = 0; i < scene.transformNodes.length; i++) {
                    var node = scene.transformNodes[i];
                    var parentID = "";
                    if (node.parent !== null) {
                        parentID = node.parent.id;
                    }
                    var entity = editor.call('entities:get', node.id);
                    if (entity) {
                        entity.node = node;
                    }
                    // let data = {
                    //     name: node.name,
                    //     resource_id: node.id,
                    //     parent: parentID,
                    //     position: [node.position.x, node.position.y, node.position.z],
                    //     rotation: [node.rotation.x, node.rotation.y, node.rotation.z],
                    //     scale: [node.scaling.x, node.scaling.y, node.scaling.z],
                    //     children: myChildren,
                    //     enabled: node.isEnabled(),
                    //     tags: [],
                    //     root: false,
                    //     type: "TransformNode",
                    //     asset: rootUrl,
                    //     asset2: modelName
                    // }
                    // // console.log(scene.meshes[i].id + " : " + scene.meshes[i].name);
                    // editor.call("entity:new:babylon", data);
                }
                // editor.emit('entities:load', true);
                // console.log("************node个数：" + scene.transformNodes.length);
                // for(let i = 0; i < scene.transformNodes.length; i++) {
                //     console.log(scene.transformNodes[i].id + " : " + scene.transformNodes[i].name);
                // }
                // console.log("************root个数：" + scene.rootNodes.length);
                // for(let i = 0; i < scene.rootNodes.length; i++) {
                //     console.log(scene.rootNodes[i].id + " : " + scene.rootNodes[i].name);
                // }
                scene.onPointerObservable.add(function (pointerInfo) {
                    switch (pointerInfo.type) {
                        case BABYLON.PointerEventTypes.POINTERDOWN:
                            // console.log("down");
                            if (pointerInfo.pickInfo.pickedMesh != null) {
                                editor.call("pick", pointerInfo.pickInfo.pickedMesh);
                            }
                            else {
                                editor.call("pick", null);
                            }
                            // console.log(pointerInfo!.pickInfo!.pickedMesh);
                            break;
                    }
                });
            });
        });
    }
    return ViewportDropModel;
}());
exports.ViewportDropModel = ViewportDropModel;
},{"../../engine":89,"../toolbar":61}],84:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportExpand = void 0;
var engine_1 = require("../../engine");
/*
*  viewport窗口最大化显示控制；
*/
var ViewportExpand = /** @class */ (function () {
    function ViewportExpand() {
        var panels = [];
        panels.push(engine_1.VeryEngine.hierarchy);
        panels.push(engine_1.VeryEngine.assets);
        panels.push(engine_1.VeryEngine.attributes);
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
},{"../../engine":89}],85:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportInstanceCreate = void 0;
var ViewportInstanceCreate = /** @class */ (function () {
    // 注册事件到相关脚本
    function ViewportInstanceCreate() {
    }
    ViewportInstanceCreate.prototype.addEntity = function () {
    };
    return ViewportInstanceCreate;
}());
exports.ViewportInstanceCreate = ViewportInstanceCreate;
},{}],86:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Viewport = void 0;
var ui_1 = require("../../ui");
var engine_1 = require("../../engine");
var toolbar_1 = require("../toolbar");
var viewport_expand_1 = require("./viewport-expand");
var Viewport = /** @class */ (function () {
    function Viewport() {
        var _this = this;
        this.init();
        var self = this;
        var engine = this._engine;
        // TODO: 设定相机
        var camera = new BABYLON.ArcRotateCamera("Default", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), this._scene);
        camera.setPosition(new BABYLON.Vector3(20, 200, 400));
        camera.attachControl(this._canvas, true);
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.99;
        camera.lowerRadiusLimit = 150;
        // 加载过度动画开
        // engine.loadingScreen.hideLoadingUI();
        // engine.displayLoadingUI();
        // let inputMap: { [key: string]: boolean } = {};
        // TODO: 加载scene.babylon场景文件，当前为默认
        // 默认Editor场景，加载保存的某一个场景资源
        // 资源的父子关系以及模型
        /*
        BABYLON.SceneLoader.Append("./scene/", "scene.babylon", this._scene, function (scene) {
          // do something with the scene
          // 加载过度动画关
          // engine.hideLoadingUI();
    
          // Keyboard events
          var blue = scene.getMeshByName('blue')!;
    
          scene.actionManager = new BABYLON.ActionManager(scene);
          scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
          }));
          scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
          }));
    
    
          // // Game/Render loop
          scene.onBeforeRenderObservable.add(() => {
    
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
          })
    
          // sphere
          var sphere = scene.getMeshByName('sphere')!;
          sphere.actionManager = new BABYLON.ActionManager(scene);
    
          sphere.actionManager.registerAction(new BABYLON.SetValueAction(
            { trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: blue },
            sphere, "scaling", new BABYLON.Vector3(2, 2, 2)));
    
          sphere.actionManager.registerAction(new BABYLON.SetValueAction(
            { trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: blue }
            , sphere, "scaling", new BABYLON.Vector3(1, 1, 1)));
    
          let i: number = 0;
    
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
        */
        this._engine.runRenderLoop(function () {
            if (_this._canvas.width !== _this._canvas.clientWidth) {
                _this._engine.resize();
            }
            if (_this._scene) {
                if (_this._scene.activeCamera) {
                    _this._scene.render();
                }
            }
            // if (this._showFps) {
            // 	this.updateFpsPos();
            // }
        });
        // return this;
        this.expandControl();
    }
    Viewport.prototype.init = function () {
        var self = this;
        this.canvas = new ui_1.Canvas('canvas-viewport');
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
            var rect = engine_1.VeryEngine.viewportPanel.element.getBoundingClientRect();
            self.canvas.resize(Math.floor(rect.width), Math.floor(rect.height));
        }, 100 / 6);
        // if(this._engine) this._engine.dispose();
        this._engine = new BABYLON.Engine(this._canvas, true);
        engine_1.VeryEngine.viewEngine = this._engine;
        var engine = this._engine;
        window.addEventListener("resize", function () {
            engine.resize();
        });
        this._scene = new BABYLON.Scene(this._engine);
        engine_1.VeryEngine.viewScene = this._scene;
        this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        toolbar_1.GizmosManager.init(this._scene);
    };
    Viewport.prototype.expandControl = function () {
        var control = new toolbar_1.ToolbarTopControl();
        var expandView = new viewport_expand_1.ViewportExpand();
    };
    return Viewport;
}());
exports.Viewport = Viewport;
},{"../../engine":89,"../../ui":108,"../toolbar":61,"./viewport-expand":84}],87:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
var Application = /** @class */ (function () {
    function Application() {
    }
    return Application;
}());
exports.Application = Application;
},{}],88:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BabylonEngine = void 0;
var BabylonEngine = /** @class */ (function () {
    function BabylonEngine() {
    }
    return BabylonEngine;
}());
exports.BabylonEngine = BabylonEngine;
},{}],89:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./babylon-engine"), exports);
__exportStar(require("./very-engine"), exports);
__exportStar(require("./application"), exports);
},{"./application":87,"./babylon-engine":88,"./very-engine":90}],90:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeryEngine = void 0;
var VeryEngine = /** @class */ (function () {
    // public static 
    function VeryEngine() {
    }
    return VeryEngine;
}());
exports.VeryEngine = VeryEngine;
// export veryconfig
},{}],91:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lib"), exports);
__exportStar(require("./editor"), exports);
__exportStar(require("./ui"), exports);
__exportStar(require("./engine"), exports);
},{"./editor":46,"./engine":89,"./lib":93,"./ui":108}],92:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandle = exports.Events = void 0;
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
        enumerable: false,
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
},{}],93:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./events"), exports);
__exportStar(require("./observer"), exports);
__exportStar(require("./observer-list"), exports);
},{"./events":92,"./observer":95,"./observer-list":94}],94:[function(require,module,exports){
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
exports.ObserverList = void 0;
var events_1 = require("./events");
var ObserverList = /** @class */ (function (_super) {
    __extends(ObserverList, _super);
    function ObserverList(options) {
        var _this = _super.call(this) || this;
        _this.sorted = null;
        options = options || {};
        _this.type = '';
        _this.data = [];
        _this._indexed = {};
        _this.sorted = options.sorted || null;
        _this.id = options.id || '';
        return _this;
    }
    Object.defineProperty(ObserverList.prototype, "length", {
        get: function () {
            return this.data.length;
        },
        enumerable: false,
        configurable: true
    });
    ObserverList.prototype.get = function (index) {
        if (this.id && typeof index === 'string') {
            return this._indexed[index] || null;
        }
        else {
            return typeof index === 'number' ? this.data[index] || null : null;
        }
    };
    ObserverList.prototype.set = function (index, val) {
        if (this.id) {
            this._indexed[index] = val;
        }
        else {
            if (typeof index === 'number')
                this.data[index] = val;
        }
    };
    ObserverList.prototype.indexof = function (item) {
        // if (this.id) {
        //     let index: string = item.get(this.id);
        //     return (this._indexed[index] && index) || -1;
        // } else {
        //     return this.data.indexOf(item);
        // }
        return this.data.indexOf(item);
    };
    ObserverList.prototype.position = function (b, fn) {
        var l = this.data;
        var min = 0;
        var max = l.length - 1;
        var cur;
        var a, i;
        fn = fn || this.sorted;
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
        return -1;
    };
    ;
    // 2分法求最近距离，对文件显示进行排序
    ObserverList.prototype.positionNextClosest = function (b, fn) {
        var l = this.data;
        var min = 0;
        var max = l.length - 1;
        var cur = 0;
        var a, i;
        fn = fn || this.sorted;
        if (l.length === 0)
            return -1;
        // 名字与第一个元素相同的情况
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
        if (this.id) {
            var index = item.get(this.id);
            return !!this._indexed[index];
        }
        else {
            return this.data.indexOf(item) !== -1;
        }
    };
    ;
    ObserverList.prototype.add = function (item) {
        if (this.has(item))
            return -1;
        var index = this.data.length;
        if (this.id) {
            index = item.get(this.id);
            this._indexed[index] = item;
        }
        var pos = 0;
        if (this.sorted) {
            pos = this.positionNextClosest(item, this.sorted);
            // console.error('name: ' + item.get('name') + ' ,,, pos: ' + pos.toString());
            if (pos !== -1) {
                this.data.splice(pos, 0, item);
            }
            else {
                this.data.push(item);
            }
        }
        else {
            this.data.push(item);
            pos = this.data.length - 1;
        }
        // 回调函数
        this.emit('add', item);
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
    ObserverList.prototype.remove = function (item) {
        if (!this.has(item))
            return;
        var ind = this.data.indexOf(item);
        if (this.id) {
            var index = item.get(this.id);
            delete this._indexed[index];
        }
        this.data.splice(ind, 1);
        this.emit('remove', item, ind);
    };
    ;
    ObserverList.prototype.removeByKey = function (index) {
        if (this.id) {
            var item = this._indexed[index];
            if (!item)
                return;
            var ind = this.data.indexOf(item);
            this.data.splice(ind, 1);
            delete this._indexed[index];
            this.emit('remove', item, ind);
        }
        else {
            if (this.data.length < index)
                return;
            var item = this.data[index];
            this.data.splice(index, 1);
            this.emit('remove', item, index);
        }
    };
    ;
    ObserverList.prototype.removeBy = function (fn) {
        var i = this.data.length;
        while (i--) {
            if (!fn(this.data[i]))
                continue;
            if (this.id) {
                delete this._indexed[this.data[i].get(this.id)];
            }
            this.data.splice(i, 1);
            this.emit('remove', this.data[i], i);
        }
    };
    ;
    ObserverList.prototype.clear = function () {
        var items = this.data.slice(0);
        this.data = [];
        this._indexed = {};
        var i = items.length;
        while (i--) {
            this.emit('remove', items[i], i);
        }
    };
    ;
    ObserverList.prototype.forEach = function (fn) {
        for (var i = 0; i < this.data.length; i++) {
            fn(this.data[i], (this.id && this.data[i].get(this.id)) || i);
        }
    };
    ;
    ObserverList.prototype.find = function (fn) {
        var items = [];
        for (var i = 0; i < this.data.length; i++) {
            if (!fn(this.data[i]))
                continue;
            var index = i;
            if (this.id)
                index = this.data[i].get(this.id);
            items.push([index, this.data[i]]);
        }
        return items;
    };
    ;
    ObserverList.prototype.findOne = function (fn) {
        for (var i = 0; i < this.data.length; i++) {
            if (!fn(this.data[i]))
                continue;
            var index = i;
            if (this.id)
                index = this.data[i].get(this.id);
            return [index, this.data[i]];
        }
        return null;
    };
    ;
    ObserverList.prototype.map = function (fn) {
        return this.data.map(fn);
    };
    ;
    ObserverList.prototype.sort = function (fn) {
        this.data.sort(fn);
    };
    ;
    ObserverList.prototype.array = function () {
        return this.data.slice(0);
    };
    ;
    return ObserverList;
}(events_1.Events));
exports.ObserverList = ObserverList;
},{"./events":92}],95:[function(require,module,exports){
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
exports.Observer = void 0;
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
        enumerable: false,
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
            // 目前看，null和undefined会经过这里
            // debug.warn(this.className + '.parserObject, 为止数据类型:' + value);
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
    // public patch(data: any): void {
    //   if (typeof data !== "object") {
    //     debug.warn(this.className + ': 不是正确的json对象，打印：\n' + data);
    //     return;
    //   }
    //   for (let key in data) {
    //     if (typeof data[key] === "object" && !this._data.hasOwnProperty(key)) {
    //       // 对象属性
    //       debug.log('对象属性：' + key);
    //       debug.log(data[key]);
    //       // this._prepare(this, key, data[key]);
    //     } else if (this._data[key] !== data[key]) {
    //       // 一般属性
    //       debug.log('一般属性：' + key);
    //       debug.log(data[key]);
    //       // this.set(key, data[key]);
    //     }
    //   }
    // }
    // public set2(path: string, value: any, silent?: boolean, remote?: boolean, force?: boolean): void {
    //   var keys = path.split('.');
    //   var length = keys.length;
    //   var key = keys[length - 1];
    //   var node: any = this;
    //   var nodePath = '';
    //   var obj: any = this;
    //   var state;
    //   for (var i = 0; i < length - 1; i++) {
    //     if (node instanceof Array) {
    //       // TODO: 这是啥啊？
    //       // node = node[keys[i]];
    //       if (node instanceof Observer) {
    //         path = keys.slice(i + 1).join('.');
    //         obj = node;
    //       }
    //     } else {
    //       if (i < length && typeof (node._data[keys[i]]) !== 'object') {
    //         if (node._data[keys[i]])
    //           obj.unset((node.__path ? node.__path + '.' : '') + keys[i]);
    //         node._data[keys[i]] = {
    //           _path: path,
    //           _keys: [],
    //           _data: {}
    //         };
    //         node._keys.push(keys[i]);
    //       }
    //       if (i === length - 1 && node.__path)
    //         nodePath = node.__path + '.' + keys[i];
    //       node = node._data[keys[i]];
    //     }
    //   }
    // }
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
},{"./events":92}],96:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
var editor_1 = require("./editor");
var engine_1 = require("./engine");
__exportStar(require("./index"), exports);
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
var drop = new editor_1.Drop();
var search = new editor_1.Search();
// 层级菜单
var hierarchy = new editor_1.HierarchyKeeper();
// 资源菜单
var assetsKeeper = new editor_1.AssetsKeeper();
// 初始化全局信息类
var initializeAfter = new editor_1.InitializeAfter();
// 编辑视窗
var viewport = new editor_1.Viewport();
engine_1.VeryEngine.viewport = viewport;
// 初始数据
var initializeData = new editor_1.InitializeData();
// TODO
// Tools.loadBabylon();
// 加载资源
// 关联资源
// 本地数据库测试
// VeryEngine.database = new Database();
// VeryEngine.database.connect('test', 'store', 1, ['xxx']);
// let im = new Image();
// im.src = "test.jpeg";
// im.onload = () => {
//   console.log('--------------');
//   console.log(im.name);
//   console.log(im.sizes);
// }
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
},{"./editor":46,"./engine":89,"./index":91}],97:[function(require,module,exports){
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
exports.Bubble = void 0;
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
},{"./element":104}],98:[function(require,module,exports){
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
exports.Button = void 0;
var element_1 = require("./element");
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button(text) {
        var _this = _super.call(this) || this;
        _this.tooltip = null;
        _this.op = '';
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
        enumerable: false,
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
},{"./element":104}],99:[function(require,module,exports){
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
exports.Canvas = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],100:[function(require,module,exports){
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
exports.Checkbox = void 0;
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
        enumerable: false,
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
},{"./element":104}],101:[function(require,module,exports){
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
exports.Code = void 0;
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
        enumerable: false,
        configurable: true
    });
    return Code;
}(container_element_1.ContainerElement));
exports.Code = Code;
},{"./container-element":103}],102:[function(require,module,exports){
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
exports.ColorField = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],103:[function(require,module,exports){
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
exports.ContainerElement = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        // console.log('clear');
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
},{"./element":104}],104:[function(require,module,exports){
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
exports.Element = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "disabledSelf", {
        get: function () {
            return this._disabled;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "enabled", {
        get: function () {
            return !this._disabled;
        },
        set: function (val) {
            this.disabled = !val;
        },
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "style", {
        get: function () {
            if (this._element) {
                return this._element.style;
            }
            return null;
        },
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"../lib":93}],105:[function(require,module,exports){
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
exports.GridItemArgs = exports.GridItem = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],106:[function(require,module,exports){
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
exports.Grid = void 0;
var container_element_1 = require("./container-element");
var editor_1 = require("../editor");
var Grid = /** @class */ (function (_super) {
    __extends(Grid, _super);
    function Grid(multiSelect) {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('ul');
        _this.element.tabIndex = 0;
        _this.element.classList.add('ui-grid');
        _this.innerElement = _this.element;
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
        set: function (val) {
            if (this._selecting)
                return;
            this._selecting = true;
            // deselecting
            var items = this.selected;
            for (var i = 0; i < items.length; i++) {
                if (val && val.indexOf(items[i]) !== -1)
                    continue;
                items[i].selected = false;
            }
            if (!val)
                return;
            // selecting
            for (var i = 0; i < val.length; i++) {
                if (!val[i])
                    continue;
                val[i].selected = true;
            }
            this._selecting = false;
        },
        enumerable: false,
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
},{"../editor":46,"./container-element":103}],107:[function(require,module,exports){
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
exports.ImageField = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],108:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./top/index"), exports);
__exportStar(require("./link"), exports);
__exportStar(require("./element"), exports);
__exportStar(require("./container-element"), exports);
__exportStar(require("./panel"), exports);
__exportStar(require("./canvas"), exports);
__exportStar(require("./button"), exports);
__exportStar(require("./label"), exports);
__exportStar(require("./text-field"), exports);
__exportStar(require("./textarea-field"), exports);
__exportStar(require("./tree"), exports);
__exportStar(require("./tree-item"), exports);
__exportStar(require("./list"), exports);
__exportStar(require("./list-item"), exports);
__exportStar(require("./checkbox"), exports);
__exportStar(require("./bubble"), exports);
__exportStar(require("./overlay"), exports);
__exportStar(require("./tooltip"), exports);
__exportStar(require("./progress"), exports);
__exportStar(require("./menu-item"), exports);
__exportStar(require("./menu"), exports);
__exportStar(require("./code"), exports);
__exportStar(require("./color-field"), exports);
__exportStar(require("./grid-item"), exports);
__exportStar(require("./grid"), exports);
__exportStar(require("./image-field"), exports);
__exportStar(require("./number-field"), exports);
__exportStar(require("./slider"), exports);
__exportStar(require("./select-field"), exports);
},{"./bubble":97,"./button":98,"./canvas":99,"./checkbox":100,"./code":101,"./color-field":102,"./container-element":103,"./element":104,"./grid":106,"./grid-item":105,"./image-field":107,"./label":109,"./link":110,"./list":112,"./list-item":111,"./menu":114,"./menu-item":113,"./number-field":115,"./overlay":116,"./panel":117,"./progress":118,"./select-field":119,"./slider":120,"./text-field":121,"./textarea-field":122,"./tooltip":123,"./top/index":124,"./tree":129,"./tree-item":128}],109:[function(require,module,exports){
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
exports.Label = void 0;
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "placeholder", {
        get: function () {
            return this.element.getAttribute('placeholder') || '';
        },
        set: function (val) {
            this.element.setAttribute('placeholder', val);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Label.prototype, "value", {
        get: function () {
            return this.text;
        },
        set: function (val) {
            this.text = val;
        },
        enumerable: false,
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
},{"./element":104}],110:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkSchema = exports.Link = void 0;
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
},{}],111:[function(require,module,exports){
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
exports.ListItem = void 0;
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
        _this.element.ui = _this;
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],112:[function(require,module,exports){
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
exports.List = void 0;
var container_element_1 = require("./container-element");
var editor_1 = require("../editor");
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List(selectable) {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('ul');
        _this.element.classList.add('ui-list');
        _this.innerElement = _this.element;
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
        enumerable: false,
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
        enumerable: false,
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
},{"../editor":46,"./container-element":103}],113:[function(require,module,exports){
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
exports.MenuItem = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./container-element":103}],114:[function(require,module,exports){
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
exports.Menu = void 0;
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
        _this.element.appendChild(_this.innerElement);
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
        enumerable: false,
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
},{"./container-element":103,"./menu-item":113}],115:[function(require,module,exports){
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
exports.NumberField = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],116:[function(require,module,exports){
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
exports.Overlay = void 0;
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Overlay.prototype, "rect", {
        get: function () {
            return this.innerElement.getBoundingClientRect();
        },
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./container-element":103}],117:[function(require,module,exports){
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
exports.Panel = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Panel.prototype, "resizeMin", {
        get: function () {
            return this._resizeLimits.min;
        },
        set: function (val) {
            this._resizeLimits.min = Math.max(0, Math.min(this._resizeLimits.max, val));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Panel.prototype, "resizeMax", {
        get: function () {
            return this._resizeLimits.max;
        },
        set: function (val) {
            this._resizeLimits.max = Math.max(this._resizeLimits.min, val);
        },
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./container-element":103}],118:[function(require,module,exports){
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
exports.Progress = void 0;
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Progress.prototype, "speed", {
        get: function () {
            return this._speed;
        },
        set: function (val) {
            this._speed = Math.max(0, Math.min(1, val));
        },
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],119:[function(require,module,exports){
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
exports.SelectField = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],120:[function(require,module,exports){
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
exports.Slider = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],121:[function(require,module,exports){
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
exports.TextField = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],122:[function(require,module,exports){
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
exports.TextAreaField = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./element":104}],123:[function(require,module,exports){
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
exports.Tooltip = void 0;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
},{"./container-element":103}],124:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./top-element"), exports);
__exportStar(require("./top-element-container"), exports);
__exportStar(require("./top-element-panel"), exports);
},{"./top-element":127,"./top-element-container":125,"./top-element-panel":126}],125:[function(require,module,exports){
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
exports.TopElementContainer = void 0;
var top_element_1 = require("./top-element");
var TopElementContainer = /** @class */ (function (_super) {
    __extends(TopElementContainer, _super);
    function TopElementContainer(args) {
        var _this = _super.call(this, document.createElement('div'), args) || this;
        _this.RESIZE_HANDLE_SIZE = 4;
        _this.VALID_RESIZABLE_VALUES = [
            null,
            'top',
            'right',
            'bottom',
            'left'
        ];
        _this._flex = false;
        _this._grid = false;
        _this._scrollable = false;
        _this._resizable = null;
        _this._resizeMin = 0;
        _this._resizeMax = 0;
        _this._domContent = null;
        if (!args)
            args = {};
        var dom = _this.dom;
        dom.classList.add('pcui-container');
        _this._domEventScroll = _this._onScroll.bind(_this);
        _this.domContent = dom;
        // pcui.Element.call(this, dom, args);
        // pcui.IContainer.call(this);
        // pcui.IFlex.call(this);
        // pcui.IGrid.call(this);
        // pcui.IScrollable.call(this);
        // pcui.IResizable.call(this);
        // scroll
        _this.scrollable = args.scrollable !== undefined ? args.scrollable : false;
        // flex
        _this.flex = !!args.flex;
        // grid
        var grid = !!args.grid;
        if (grid) {
            if (_this.flex) {
                console.error('Invalid pcui.Container arguments: "grid" and "flex" cannot both be true.');
                grid = false;
            }
        }
        _this.grid = grid;
        // resize related
        _this._domResizeHandle = null;
        _this._domEventResizeStart = _this._onResizeStart.bind(_this);
        _this._domEventResizeMove = _this._onResizeMove.bind(_this);
        _this._domEventResizeEnd = _this._onResizeEnd.bind(_this);
        _this._domEventResizeTouchStart = _this._onResizeTouchStart.bind(_this);
        _this._domEventResizeTouchMove = _this._onResizeTouchMove.bind(_this);
        _this._domEventResizeTouchEnd = _this._onResizeTouchEnd.bind(_this);
        _this._resizeTouchId = null;
        _this._resizeData = null;
        _this._resizeHorizontally = true;
        _this.resizable = args.resizable || null;
        _this._resizeMin = 100;
        _this._resizeMax = 300;
        if (args.resizeMin !== undefined) {
            _this.resizeMin = args.resizeMin;
        }
        if (args.resizeMax !== undefined) {
            _this.resizeMax = args.resizeMax;
        }
        return _this;
    }
    Object.defineProperty(TopElementContainer.prototype, "flex", {
        get: function () {
            return this._flex;
        },
        set: function (value) {
            if (value === this._flex)
                return;
            this._flex = value;
            if (value) {
                this.class.add('pcui-flex');
            }
            else {
                this.class.remove('pcui-flex');
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementContainer.prototype, "grid", {
        get: function () {
            return this._grid;
        },
        set: function (value) {
            if (value === this._grid)
                return;
            this._grid = value;
            if (value) {
                this.class.add('pcui-grid');
            }
            else {
                this.class.remove('pcui-grid');
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementContainer.prototype, "scrollable", {
        get: function () {
            return this._scrollable;
        },
        set: function (value) {
            if (value === this._scrollable)
                return;
            this._scrollable = value;
            if (value) {
                this.class.add('pcui-scrollable');
            }
            else {
                this.class.remove('pcui-scrollable');
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementContainer.prototype, "resizable", {
        get: function () {
            return this._resizable;
        },
        set: function (value) {
            if (value === this._resizable)
                return;
            if (this.VALID_RESIZABLE_VALUES.indexOf(value) === -1) {
                console.error('Invalid resizable value: must be one of ' + this.VALID_RESIZABLE_VALUES.join(','));
                return;
            }
            // remove old class
            if (this._resizable) {
                this.class.remove('pcui-resizable-' + this._resizable);
            }
            this._resizable = value;
            this._resizeHorizontally = (value === 'right' || value === 'left');
            if (value) {
                // add resize class and create / append resize handle
                this.class.add('pcui-resizable');
                this.class.add('pcui-resizable-' + value);
                if (!this._domResizeHandle) {
                    this._createResizeHandle();
                }
                this.dom.appendChild(this._domResizeHandle);
            }
            else {
                // remove resize class and resize handle
                this.class.remove('pcui-resizable');
                if (this._domResizeHandle) {
                    this.dom.removeChild(this._domResizeHandle);
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementContainer.prototype, "resizeMin", {
        get: function () {
            return this._resizeMin;
        },
        set: function (value) {
            this._resizeMin = Math.max(0, Math.min(value, this._resizeMax));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementContainer.prototype, "resizeMax", {
        get: function () {
            return this._resizeMax;
        },
        set: function (value) {
            this._resizeMax = Math.max(this._resizeMin, value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementContainer.prototype, "domContent", {
        get: function () {
            return this._domContent;
        },
        set: function (value) {
            if (this._domContent === value)
                return;
            if (this._domContent) {
                this._domContent.removeEventListener('scroll', this._domEventScroll);
            }
            this._domContent = value;
            if (this._domContent) {
                this._domContent.addEventListener('scroll', this._domEventScroll);
            }
        },
        enumerable: false,
        configurable: true
    });
    TopElementContainer.prototype.append = function (element) {
        var dom = this._getDomFromElement(element);
        this._domContent.appendChild(dom);
        this._onAppendChild(element);
    };
    ;
    TopElementContainer.prototype.appendBefore = function (element, referenceElement) {
        var dom = this._getDomFromElement(element);
        this._domContent.appendChild(dom);
        var referenceDom = referenceElement && this._getDomFromElement(referenceElement);
        if ((referenceDom)) {
            this._domContent.insertBefore(dom, referenceDom);
        }
        else {
            this._domContent.appendChild(dom);
        }
        this._onAppendChild(element);
    };
    ;
    TopElementContainer.prototype.appendAfter = function (element, referenceElement) {
        var dom = this._getDomFromElement(element);
        var referenceDom = referenceElement && this._getDomFromElement(referenceElement);
        var elementBefore = referenceDom ? referenceDom.nextSibling : null;
        if (elementBefore) {
            this._domContent.insertBefore(dom, elementBefore);
        }
        else {
            this._domContent.appendChild(dom);
        }
        this._onAppendChild(element);
    };
    ;
    TopElementContainer.prototype.prepend = function (element) {
        var dom = this._getDomFromElement(element);
        var first = this._domContent.firstChild;
        if (first) {
            this._domContent.insertBefore(dom, first);
        }
        else {
            this._domContent.appendChild(dom);
        }
        this._onAppendChild(element);
    };
    ;
    TopElementContainer.prototype.remove = function (element) {
        var html = (element instanceof HTMLElement);
        if (!html && element.parent !== this)
            return;
        var dom = this._getDomFromElement(element);
        this._domContent.removeChild(dom);
        if (!html)
            element.parent = null;
        this.emit('remove', element);
    };
    ;
    TopElementContainer.prototype.clear = function () {
        if (this._domContent) {
            var i = this._domContent.childNodes.length;
            while (i--) {
                var node = this._domContent.childNodes[i];
                if (node.ui) {
                    node.ui.destroy();
                }
            }
            this._domContent.innerHTML = '';
        }
    };
    ;
    TopElementContainer.prototype._getDomFromElement = function (element) {
        if (element instanceof HTMLElement)
            return element;
        else if (element instanceof top_element_1.TopElement)
            return element.dom;
        else
            return element.element;
        // if (element.dom) {
        //     return element.dom;
        // }
        // if (element.element) {
        //     // console.log('Legacy ui.Element passed to pcui.Container', this.class, element.class);
        //     return element.element;
        // }
        // return element;
    };
    ;
    TopElementContainer.prototype._onAppendChild = function (element) {
        if (element instanceof top_element_1.TopElement)
            element.parent = this;
        this.emit('append', element);
    };
    ;
    TopElementContainer.prototype._onScroll = function (evt) {
        this.emit('scroll', evt);
    };
    ;
    TopElementContainer.prototype._createResizeHandle = function () {
        var handle = document.createElement('div');
        handle.classList.add('pcui-resizable-handle');
        handle.ui = this;
        handle.addEventListener('mousedown', this._domEventResizeStart);
        handle.addEventListener('touchstart', this._domEventResizeTouchStart);
        this._domResizeHandle = handle;
    };
    ;
    TopElementContainer.prototype._onResizeStart = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        window.addEventListener('mousemove', this._domEventResizeMove);
        window.addEventListener('mouseup', this._domEventResizeEnd);
        this._resizeStart();
    };
    ;
    TopElementContainer.prototype._onResizeMove = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this._resizeMove(evt.clientX, evt.clientY);
    };
    ;
    TopElementContainer.prototype._onResizeEnd = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        window.removeEventListener('mousemove', this._domEventResizeMove);
        window.removeEventListener('mouseup', this._domEventResizeEnd);
        this._resizeEnd();
    };
    ;
    TopElementContainer.prototype._onResizeTouchStart = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.target === this._domResizeHandle) {
                this._resizeTouchId = touch.identifier;
            }
        }
        window.addEventListener('touchmove', this._domEventResizeTouchMove);
        window.addEventListener('touchend', this._domEventResizeTouchEnd);
        this._resizeStart();
    };
    ;
    TopElementContainer.prototype._onResizeTouchMove = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.identifier !== this._resizeTouchId) {
                continue;
            }
            evt.stopPropagation();
            evt.preventDefault();
            this._resizeMove(touch.clientX, touch.clientY);
            break;
        }
    };
    ;
    TopElementContainer.prototype._onResizeTouchEnd = function (evt) {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.identifier === this._resizeTouchId) {
                continue;
            }
            this._resizeTouchId = null;
            evt.preventDefault();
            evt.stopPropagation();
            window.removeEventListener('touchmove', this._domEventResizeTouchMove);
            window.removeEventListener('touchend', this._domEventResizeTouchEnd);
            this._resizeEnd();
            break;
        }
    };
    ;
    TopElementContainer.prototype._resizeStart = function () {
        this.class.add('pcui-resizable-resizing');
    };
    ;
    TopElementContainer.prototype._resizeMove = function (x, y) {
        // if we haven't initialized resizeData do so now
        if (!this._resizeData) {
            this._resizeData = {
                x: x,
                y: y,
                width: this.dom.clientWidth,
                height: this.dom.clientHeight
            };
            return;
        }
        if (this._resizeHorizontally) {
            // horizontal resizing
            var offsetX = this._resizeData.x - x;
            if (this._resizable === 'right') {
                offsetX = -offsetX;
            }
            this.width = this.RESIZE_HANDLE_SIZE + Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.width + offsetX)));
        }
        else {
            // vertical resizing
            var offsetY = this._resizeData.y - y;
            if (this._resizable === 'bottom') {
                offsetY = -offsetY;
            }
            this.height = Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.height + offsetY)));
        }
        this.emit('resize');
    };
    ;
    TopElementContainer.prototype._resizeEnd = function () {
        this._resizeData = null;
        this.class.remove('pcui-resizable-resizing');
    };
    ;
    TopElementContainer.prototype.destroy = function () {
        this.domContent = null;
        if (this._domResizeHandle) {
            this._domResizeHandle.removeEventListener('mousedown', this._domEventResizeStart);
            window.removeEventListener('mousemove', this._domEventResizeMove);
            window.removeEventListener('mouseup', this._domEventResizeEnd);
            this._domResizeHandle.removeEventListener('touchstart', this._domEventResizeTouchStart);
            window.removeEventListener('touchmove', this._domEventResizeTouchMove);
            window.removeEventListener('touchend', this._domEventResizeTouchEnd);
        }
        this._domResizeHandle = null;
        this._domEventResizeStart = null;
        this._domEventResizeMove = null;
        this._domEventResizeEnd = null;
        this._domEventResizeTouchStart = null;
        this._domEventResizeTouchMove = null;
        this._domEventResizeTouchEnd = null;
        _super.prototype.destroy.call(this);
    };
    ;
    return TopElementContainer;
}(top_element_1.TopElement));
exports.TopElementContainer = TopElementContainer;
},{"./top-element":127}],126:[function(require,module,exports){
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
exports.TopElementPanel = void 0;
var top_element_container_1 = require("./top-element-container");
var TopElementPanel = /** @class */ (function (_super) {
    __extends(TopElementPanel, _super);
    function TopElementPanel(args) {
        var _this = _super.call(this, args) || this;
        _this._headerSize = 0;
        _this._collapsible = false;
        _this._collapsed = false;
        _this._collapseHorizontally = false;
        _this._reflowTimeout = null;
        _this._widthBeforeCollapse = null;
        _this._heightBeforeCollapse = null;
        if (!args)
            args = {};
        var panelArgs = Object.assign({}, args);
        panelArgs.flex = true;
        delete panelArgs.flexDirection;
        delete panelArgs.scrollable;
        _this.class.add('pcui-panel');
        if (args.panelType) {
            _this.class.add('pcui-panel-' + args.panelType);
        }
        // do not call reflow on every update while
        // we are initializing
        _this._suspendReflow = true;
        // initialize header container
        // this._initializeHeader(args);
        // header container
        _this._containerHeader = new top_element_container_1.TopElementContainer({
            flex: true,
            flexDirection: 'row'
        });
        _this._containerHeader.class.add('pcui-panel-header');
        // header title
        _this._domHeaderTitle = document.createElement('span');
        _this._domHeaderTitle.textContent = args.headerText || '';
        _this._domHeaderTitle.classList.add('pcui-panel-header-title');
        _this._domHeaderTitle.ui = _this._containerHeader;
        _this._containerHeader.dom.appendChild(_this._domHeaderTitle);
        // use native click listener because the pcui.Element#click event is only fired
        // if the element is enabled. However we still want to catch header click events in order
        // to collapse them
        _this._containerHeader.dom.addEventListener('click', _this._onHeaderClick.bind(_this));
        _this.append(_this._containerHeader);
        // initialize content container
        // this._initializeContent(args);
        _this._containerContent = new top_element_container_1.TopElementContainer({
            flex: args.flex,
            flexDirection: args.flexDirection,
            scrollable: args.scrollable
        });
        _this._containerContent.class.add('pcui-panel-content');
        _this.appendAfter(_this._containerContent, _this._containerHeader);
        // event handlers
        _this._evtAppend = null;
        _this._evtRemove = null;
        // header size
        _this.headerSize = args.headerSize !== undefined ? args.headerSize : 32;
        // collapse related
        _this._reflowTimeout = null;
        _this._widthBeforeCollapse = null;
        _this._heightBeforeCollapse = null;
        // if we initialize the panel collapsed
        // then use the width / height passed in the arguments
        // as the size to expand to
        if (args.collapsed) {
            if (args.width) {
                _this._widthBeforeCollapse = args.width;
            }
            if (args.height) {
                _this._heightBeforeCollapse = args.height;
            }
        }
        _this.collapsible = args.collapsible || false;
        _this.collapsed = args.collapsed || false;
        _this.collapseHorizontally = args.collapseHorizontally || false;
        // set the contents container to be the content DOM element
        // from now on calling append functions on the panel will append themn
        // elements to the contents container
        _this.domContent = _this._containerContent.dom;
        // execute reflow now after all fields have been initialized
        _this._suspendReflow = false;
        _this._reflow();
        return _this;
    }
    Object.defineProperty(TopElementPanel.prototype, "collapsible", {
        get: function () {
            return this._collapsible;
        },
        set: function (value) {
            if (value === this._collapsible)
                return;
            this._collapsible = value;
            if (this._evtAppend) {
                this._evtAppend.unbind();
                this._evtAppend = null;
            }
            if (this._evtRemove) {
                this._evtRemove.unbind();
                this._evtRemove = null;
            }
            if (value) {
                // listen to append / remove events so we can change our height
                var onChange = this._onChildrenChange.bind(this);
                this._evtAppend = this._containerContent.on('append', onChange);
                this._evtRemove = this._containerContent.on('remove', onChange);
                this.class.add('pcui-collapsible');
            }
            else {
                this.class.remove('pcui-collapsible');
            }
            this._reflow();
            if (this.collapsed) {
                this.emit(value ? 'collapse' : 'expand');
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementPanel.prototype, "collapsed", {
        get: function () {
            return this._collapsed;
        },
        set: function (value) {
            if (this._collapsed === value)
                return;
            this._collapsed = value;
            if (value) {
                this.class.add('pcui-collapsed');
            }
            else {
                this.class.remove('pcui-collapsed');
            }
            this._reflow();
            if (this.collapsible) {
                this.emit(value ? 'collapse' : 'expand');
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementPanel.prototype, "collapseHorizontally", {
        get: function () {
            return this._collapseHorizontally;
        },
        set: function (value) {
            if (this._collapseHorizontally === value)
                return;
            this._collapseHorizontally = value;
            if (value) {
                this.class.add('pcui-panel-horizontal');
            }
            else {
                this.class.remove('pcui-panel-horizontal');
            }
            this._reflow();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementPanel.prototype, "content", {
        get: function () {
            return this._containerContent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementPanel.prototype, "header", {
        get: function () {
            return this._containerHeader;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementPanel.prototype, "headerText", {
        get: function () {
            return this._domHeaderTitle.textContent || '';
        },
        set: function (value) {
            this._domHeaderTitle.textContent = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElementPanel.prototype, "headerSize", {
        get: function () {
            return this._headerSize;
        },
        set: function (value) {
            this._headerSize = value;
            var style = this._containerHeader.dom.style;
            style.height = Math.max(0, value) + 'px';
            style.lineHeight = style.height;
            this._reflow();
        },
        enumerable: false,
        configurable: true
    });
    TopElementPanel.prototype._onHeaderClick = function (evt) {
        if (!this._collapsible)
            return;
        if (evt.target !== this.header.dom && evt.target !== this._domHeaderTitle)
            return;
        // toggle collapsed
        this.collapsed = !this.collapsed;
    };
    ;
    TopElementPanel.prototype._onChildrenChange = function () {
        if (!this.collapsible || this.collapsed || this._collapseHorizontally || this.hidden) {
            return;
        }
        this.height = this.headerSize + this._containerContent.dom.clientHeight;
    };
    ;
    // Collapses or expands the panel as needed
    TopElementPanel.prototype._reflow = function () {
        var self = this;
        if (this._suspendReflow) {
            return;
        }
        if (this._reflowTimeout) {
            cancelAnimationFrame(this._reflowTimeout);
            this._reflowTimeout = null;
        }
        if (this.hidden || !this.collapsible)
            return;
        if (this.collapsed && this.collapseHorizontally) {
            this._containerHeader.style.top = -this.headerSize + 'px';
        }
        else {
            this._containerHeader.style.top = '';
        }
        // we rely on the content width / height and we have to
        // wait for 1 frame before we can get the final values back
        this._reflowTimeout = requestAnimationFrame(function () {
            self._reflowTimeout = null;
            if (self.collapsed) {
                // remember size before collapse
                if (!self._widthBeforeCollapse) {
                    self._widthBeforeCollapse = self.dom.clientWidth;
                }
                if (!self._heightBeforeCollapse) {
                    self._heightBeforeCollapse = self.dom.clientHeight;
                }
                if (self._collapseHorizontally) {
                    self.height = '';
                    self.width = self.headerSize;
                }
                else {
                    self.height = self.headerSize;
                }
            }
            else {
                if (self._collapseHorizontally) {
                    self.height = '';
                    if (self._widthBeforeCollapse !== null) {
                        self.width = self._widthBeforeCollapse;
                    }
                }
                else {
                    if (self._heightBeforeCollapse !== null) {
                        self.height = self._heightBeforeCollapse;
                    }
                }
                // reset before collapse vars
                self._widthBeforeCollapse = null;
                self._heightBeforeCollapse = null;
            }
        }.bind(self));
    };
    ;
    TopElementPanel.prototype.destroy = function () {
        if (this._reflowTimeout) {
            cancelAnimationFrame(this._reflowTimeout);
            this._reflowTimeout = null;
        }
        _super.prototype.destroy.call(this);
    };
    ;
    return TopElementPanel;
}(top_element_container_1.TopElementContainer));
exports.TopElementPanel = TopElementPanel;
},{"./top-element-container":125}],127:[function(require,module,exports){
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
exports.TopElement = void 0;
var lib_1 = require("../../lib");
var TopElement = /** @class */ (function (_super) {
    __extends(TopElement, _super);
    // public get innerElement(): Nullable<HTMLElement> {
    //     return this.domContent;
    // }
    // public set innerElement(value: Nullable<HTMLElement>) {
    //     this.domContent = value;
    // }
    function TopElement(dom, args) {
        var _this = _super.call(this) || this;
        _this.SIMPLE_CSS_PROPERTIES = {
            'flexDirection': 'flex-direction',
            'flexGrow': 'flex-grow',
            'flexBasis': 'flex-basis',
            'flexShrink': 'flex-shrink',
            'flexWrap': 'flex-wrap',
            'alignItems': 'align-items',
            'justifyContent': 'justify-content'
        };
        _this._destroyed = false;
        _this._enabled = true;
        _this._hidden = false;
        _this._parent = null;
        _this._evtParentDestroy = null;
        _this._evtParentDisable = null;
        _this._evtParentEnable = null;
        if (!args)
            args = {};
        _this._destroyed = false;
        _this._enabled = true;
        _this._hidden = false;
        _this._parent = null;
        _this._domEventClick = _this._onClick.bind(_this);
        _this._domEventMouseOver = _this._onMouseOver.bind(_this);
        _this._domEventMouseOut = _this._onMouseOut.bind(_this);
        _this._evtParentDestroy = null;
        _this._evtParentDisable = null;
        _this._evtParentEnable = null;
        _this._dom = dom;
        if (args.id !== undefined) {
            _this._dom.id = args.id;
        }
        // add ui reference
        _this._dom.ui = _this;
        // add event listeners
        _this._dom.addEventListener('click', _this._domEventClick);
        _this._dom.addEventListener('mouseover', _this._domEventMouseOver);
        _this._dom.addEventListener('mouseout', _this._domEventMouseOut);
        // add element class
        _this._dom.classList.add('pcui-element');
        if (args.enabled !== undefined) {
            _this.enabled = args.enabled;
        }
        if (args.hidden !== undefined) {
            _this.hidden = args.hidden;
        }
        if (args.width !== undefined) {
            _this.width = args.width;
        }
        if (args.height !== undefined) {
            _this.height = args.height;
        }
        // copy CSS properties from args
        for (var key in args) {
            if (args[key] === undefined)
                continue;
            if (_this.SIMPLE_CSS_PROPERTIES[key] !== null) {
                _this.style.setProperty(_this.SIMPLE_CSS_PROPERTIES[key], args[key]);
            }
        }
        return _this;
    }
    Object.defineProperty(TopElement.prototype, "enabled", {
        // private domContent: Nullable<HTMLElement> = null;
        get: function () {
            return this._enabled && (!this._parent || this._parent.enabled);
        },
        set: function (value) {
            if (this._enabled === value)
                return;
            // remember if enabled in hierarchy
            var enabled = this.enabled;
            this._enabled = value;
            // only fire event if hierarchy state changed
            if (enabled !== value) {
                this._onEnabledChange(value);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElement.prototype, "dom", {
        get: function () {
            return this._dom;
        },
        set: function (value) {
            this._dom = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElement.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (value) {
            if (value === this._parent)
                return;
            var oldEnabled = this.enabled;
            if (this._parent) {
                this._evtParentDestroy.unbind();
                this._evtParentDisable.unbind();
                this._evtParentEnable.unbind();
            }
            this._parent = value;
            if (this._parent) {
                this._evtParentDestroy = this._parent.once('destroy', this._onParentDestroy.bind(this));
                this._evtParentDisable = this._parent.on('disable', this._onParentDisable.bind(this));
                this._evtParentEnable = this._parent.on('enable', this._onParentEnable.bind(this));
            }
            this.emit('parent', this._parent);
            var newEnabled = this.enabled;
            if (newEnabled !== oldEnabled) {
                this._onEnabledChange(newEnabled);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElement.prototype, "hidden", {
        get: function () {
            return this._hidden;
        },
        set: function (value) {
            if (value === this._hidden)
                return;
            this._hidden = value;
            if (value) {
                this.class.add('pcui-hidden');
            }
            else {
                this.class.remove('pcui-hidden');
            }
            this.emit(value ? 'hide' : 'show');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElement.prototype, "style", {
        get: function () {
            return this._dom.style;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElement.prototype, "class", {
        get: function () {
            return this._dom.classList;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElement.prototype, "width", {
        get: function () {
            return this._dom.clientWidth;
        },
        set: function (value) {
            if (typeof value === 'number') {
                value = value.toString() + 'px';
            }
            this.style.width = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElement.prototype, "height", {
        get: function () {
            return this._dom.clientHeight;
        },
        set: function (value) {
            if (typeof value === 'number') {
                value = value.toString() + 'px';
            }
            this.style.height = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElement.prototype, "disabled", {
        get: function () {
            return !this.enabled;
        },
        set: function (value) {
            this.enabled = !value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TopElement.prototype, "element", {
        get: function () {
            return this.dom;
        },
        set: function (value) {
            this.dom = value;
        },
        enumerable: false,
        configurable: true
    });
    TopElement.prototype.exposeCssProperty = function (name) {
        Object.defineProperty(TopElement.prototype, name, {
            get: function () {
                return this.style[name];
            },
            set: function (value) {
                this.style[name] = value;
            }
        });
    };
    TopElement.prototype.link = function (observer, path) {
        throw new Error('Not implemented');
    };
    ;
    TopElement.prototype.unlink = function () {
        throw new Error('Not implemented');
    };
    ;
    TopElement.prototype.flash = function () {
        var self = this;
        this.class.add('flash');
        setTimeout(function () {
            self.class.remove('flash');
        }.bind(self), 200);
    };
    ;
    TopElement.prototype._onClick = function (evt) {
        if (this.enabled) {
            this.emit('click', evt);
        }
    };
    ;
    TopElement.prototype._onMouseOver = function (evt) {
        this.emit('hover', evt);
    };
    ;
    TopElement.prototype._onMouseOut = function (evt) {
        this.emit('hoverend', evt);
    };
    ;
    TopElement.prototype._onEnabledChange = function (enabled) {
        if (enabled) {
            this.class.remove('pcui-disabled');
        }
        else {
            this.class.add('pcui-disabled');
        }
        this.emit(enabled ? 'enable' : 'disable');
    };
    ;
    TopElement.prototype._onParentDestroy = function () {
        this.destroy();
    };
    ;
    TopElement.prototype._onParentDisable = function () {
        if (this._enabled) {
            this._onEnabledChange(false);
        }
    };
    ;
    TopElement.prototype._onParentEnable = function () {
        if (this._enabled) {
            this._onEnabledChange(true);
        }
    };
    ;
    TopElement.prototype.destroy = function () {
        if (this._destroyed)
            return;
        this._destroyed = true;
        if (this.parent && this.parent.element) {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.parent.element);
            }
        }
        if (this._dom) {
            // remove event listeners
            this._dom.removeEventListener('click', this._domEventClick);
            this._dom.removeEventListener('mouseover', this._domEventMouseOver);
            this._dom.removeEventListener('mouseout', this._domEventMouseOut);
            // remove ui reference
            delete this._dom.ui;
            this._dom = null;
        }
        this._domEventClick = null;
        this._domEventMouseOver = null;
        this._domEventMouseOut = null;
    };
    ;
    return TopElement;
}(lib_1.Events));
exports.TopElement = TopElement;
},{"../../lib":93}],128:[function(require,module,exports){
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
exports.TreeItem = void 0;
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
        _this.element.ui = _this;
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TreeItem.prototype, "allowDrop", {
        get: function () {
            return this._allowDrop;
        },
        set: function (val) {
            this._allowDrop = val;
        },
        enumerable: false,
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
    // TODO:link to the observer 
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
},{"./element":104,"./text-field":121,"./tree":129}],129:[function(require,module,exports){
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
exports.Tree = void 0;
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
        _this.innerElement = _this.element;
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
        enumerable: false,
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
        // console.error('_onAppend');
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
},{"../editor":46,"./container-element":103,"./tree-item":128}]},{},[96])

//# sourceMappingURL=vreditor.js.map
