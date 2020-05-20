import { Panel, Progress, Tree, TreeItem, Grid, Label, Tooltip, GridItem, Menu, MenuItem, TopElementContainer, TopElementPanel } from "../../ui";
import { VeryEngine } from "../../engine";
import { Observer, ObserverList } from "../../lib";
import { Tools } from "../utility";

export class AssetsPanel {

    public constructor() {

        let self = this;

        var root: TopElementContainer = VeryEngine.root;
        var assetsPanel: TopElementPanel = VeryEngine.assets;
        var dragging: boolean = false;
        var draggingData: any = {};


        var legacyScripts: boolean = false;
        var selector = {
            type: '',
            items: new Array<Observer>(),
            prev: {
                type: '',
                items: new Array<Observer>()
            }
        };
        var searching = false;


        let overlay: TopElementContainer = new TopElementContainer({
            flex: true
        });
        overlay.class!.add('progress-overlay');
        assetsPanel.append(overlay);

        var loading = new Progress();
        loading.progress = 0.01;
        loading.on('progress:100', function () {
            overlay.hidden = true;
        });
        overlay.append(loading);
        // TODO：隐藏
        overlay.hidden = true;

        editor.method('assets:progress', function (progress: number) {
            loading.progress = progress;
        });

        // folders panel
        var folders = new Panel();
        folders.class!.add('folders');
        folders.flexShrink = '0';
        folders.style!.width = '200px';
        folders.innerElement!.style.width = '200px';
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
        var files = new Panel();
        files.class!.add('files');
        files.flexGrow = "1";
        files.foldable = false;
        files.horizontal = true;
        files.scroll = true;
        assetsPanel.append(files);


        // grid
        var grid = new Grid();
        // grid.enabled = false;
        grid.class!.add('assets');
        files.append(grid);
        VeryEngine.assetsGrid = grid;

        // tree
        var tree = new Tree();
        // tree.enabled = false;
        tree.draggable = false;
        tree.class!.add('assets');
        folders.append(tree);

        // tree root，Assets根目录
        var treeRoot = new TreeItem({
            text: '/'
        });
        tree.append(treeRoot);
        // tree.element!.appendChild(treeRoot.element!);
        // tree.emit('append', treeRoot);
        treeRoot.open = true;
        treeRoot.class!.add('current');
        treeRoot.on('select', function () {
            treeRoot.selected = false;
        });

        // tree width resizing
        var resizeQueued = false;
        var resizeTree = function () {
            resizeQueued = false;
            tree.element!.style.width = '';
            tree.element!.style.width = (folders.innerElement!.scrollWidth - 5) + 'px';
        };
        var resizeQueue = function () {
            if (resizeQueued) return;
            resizeQueued = true;
            requestAnimationFrame(resizeTree);
        };
        folders.on('resize', resizeQueue);
        tree.on('open', resizeQueue);
        tree.on('close', resizeQueue);
        setInterval(resizeQueue, 1000);

        var gridScripts: GridItem;
        var treeScripts: TreeItem;
        var createLegacyScriptFolder = function () {
            gridScripts = new GridItem();
            gridScripts.class!.add('type-folder', 'scripts');
            grid.append(gridScripts);

            gridScripts.tree = treeScripts = new TreeItem({
                text: 'scripts'
            });
            gridScripts.tree.class!.add('scripts');
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
            gridScripts.element!.addEventListener('dblclick', function () {
                tree.clear();
                editor.call('assets:filter:search', '');
                editor.call('assets:panel:currentFolder', 'scripts');
                // change back selection

                if (selector.prev.type)
                    editor.call('selector:set', selector.prev.type, selector.prev.items);
            }, false);

            var thumbnail = gridScripts.thumbnail = document.createElement('div');
            thumbnail.classList.add('thumbnail', 'placeholder');
            gridScripts.element!.appendChild(thumbnail);

            var icon = document.createElement('div');
            icon.classList.add('icon');
            gridScripts.element!.appendChild(icon);

            var label = gridScripts.labelElement = document.createElement('div');
            label.classList.add('label');
            label.textContent = 'scripts';
            gridScripts.element!.appendChild(label);

            // context menu
            var menu = new Menu();
            root.append(menu);

            // script
            var menuScript = new MenuItem({
                text: 'New Script',
                value: 'script',
                icon: '&#57864;'
            });
            menuScript.on('select', function () {
                editor.call('sourcefiles:new');
            });
            menu.append(menuScript);

            editor.on('repositories:load', function (repositories: Observer) {
                if (repositories.get('current') !== 'directory')
                    menuScript.disabled = true;
            });
            var onContextMenu = function (evt: MouseEvent) {
                evt.stopPropagation();
                evt.preventDefault();

                if (!editor.call('permissions:write'))
                    return;

                menu.position(evt.clientX + 1, evt.clientY);
                menu.open = true;
            };
            gridScripts.element!.addEventListener('contextmenu', onContextMenu, false);
            treeScripts.elementTitle.addEventListener('contextmenu', onContextMenu, false);

            resizeQueue();
        };
        if (legacyScripts)
            createLegacyScriptFolder();


        var currentFolder: Observer | string | null = null;  // assets -> Observer
        editor.method('assets:panel:currentFolder', function (asset: Observer | string | null): Observer | string | null {
            if (asset === undefined)
                return currentFolder;

            if (asset === currentFolder)
                return null;

            // current folder style remove
            if (currentFolder && typeof (currentFolder) !== 'string' && assetsIndex[currentFolder.get('id')]) {
                assetsIndex[currentFolder.get('id')].tree.class!.remove('current');
            } else {
                if (currentFolder === null) {
                    treeRoot.class!.remove('current');
                } else if (treeScripts && currentFolder === 'scripts') {
                    treeScripts.class!.remove('current');
                }
            }

            currentFolder = asset;

            // current folder style add
            if (currentFolder && typeof (currentFolder) !== 'string') {
                assetsIndex[currentFolder.get('id')].tree.class!.add('current');

                // open tree up
                var path = currentFolder.get('path');
                for (var i = 0; i < path.length; i++) {
                    if (!assetsIndex[path[i]] || !assetsIndex[path[i]].tree)
                        continue;

                    assetsIndex[path[i]].tree.open = true;
                }
            } else if (currentFolder === null) {
                treeRoot.class!.add('current');
            } else if (treeScripts && currentFolder === 'scripts') {
                treeScripts.class!.add('current');
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
                } else {
                    editor.call('assets:panel:currentFolder', editor.call('assets:get', path[path.length - 1]));
                }
            }
        });

        editor.on('drop:active', function (state: boolean, type: string, data: any) {
            dragging = state;

            if (!dragging) {
                grid.dragOver = undefined;
                gridDropBorder.classList.remove('active');
                treeDropBorder.classList.remove('active');
            }
        });

        editor.on('drop:set', function (type: string, data: any) {
            draggingData = data;
        });

        

        // IDrop
        var dropRef = editor.call('drop:target', {
            ref: folders.element,
            hole: true,
            passThrough: true,
            filter: function (type: string, data: any) {
                return type.startsWith('asset');
            },
            drop: function (type: string, data: any) {
                if (!type || grid.dragOver === undefined || !type.startsWith('asset'))
                    return;

                var items = editor.call('selector:items');
                var assets: any = [];

                var addAsset = function (id: string) {
                    var asset = editor.call('assets:get', id);

                    // deselect moved asset
                    if (items.indexOf(asset) !== -1)
                        editor.call('selector:remove', asset);

                    assets.push(asset);
                };

                if (data.ids) {
                    for (var i = 0; i < data.ids.length; i++)
                        addAsset(data.ids[i]);
                } else {
                    addAsset(data.id);
                }
                editor.call('assets:fs:move', assets, grid.dragOver);
            }
        });
        dropRef.element.classList.add('assets-drop-area');

        var treeAppendQueue: { [key: string]: GridItem[] } = {};

        

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
            filter: function (type: string, data: any) {
                return type.startsWith('asset');
            },
            drop: function (type: string, data: any) {
                if (!type || grid.dragOver === undefined || !type.startsWith('asset'))
                    return;

                var assets: any = [];
                var items = editor.call('selector:items');

                var addAsset = function (id: string) {
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
                } else {
                    addAsset(data.id);
                }

                if (grid.dragOver.get('type') === 'folder') {
                    editor.call('assets:fs:move', assets, grid.dragOver);
                } else if (grid.dragOver.get('type') === 'bundle') {
                    var countAdded = editor.call('assets:bundles:addAssets', assets, grid.dragOver);
                    if (countAdded) {
                        var item = assetsIndex[grid.dragOver.get('id')];
                        item.class!.add('confirm-animation');
                        setTimeout(function () {
                            item.class!.remove('confirm-animation');
                        }, 800);
                    }
                }
            }
        });
        dropRef2.element.classList.add('assets-drop-area');

        editor.on('permissions:writeState', function (state: boolean) {
            tree.enabled = state;
            grid.enabled = state;
        });

        var labelNoAssets = new Label(undefined, undefined, true);
        labelNoAssets.renderChanges = false;
        labelNoAssets.class!.add('no-assets');
        labelNoAssets.hidden = true;
        files.append(labelNoAssets);

        editor.method('assets:panel:message', function (msg: string) {
            labelNoAssets.text = msg;
            labelNoAssets.hidden = !msg;
        });

        var scriptsIndex: { [key: string]: GridItem } = {};
        var assetsIndex: { [key: string]: GridItem } = {};
        var assetsChanged = false;
        // grid.assetsIndex = assetsIndex;

        var gridDropBorder = document.createElement('div');
        gridDropBorder.classList.add('assets-drop-border');
        root.append(gridDropBorder);

        var treeDropBorder = document.createElement('div');
        treeDropBorder.classList.add('assets-drop-border');
        root.append(treeDropBorder);

        var tooltipAsset = new Tooltip({
            text: 'Asset',
            align: 'top',
            hoverable: false
        });
        root.append(tooltipAsset);

        var tooltipTarget: any = null;
        var tooltipTimeout: any = null;

        var tooltipShow = function () {
            if (!tooltipTarget)
                return;

            while (tooltipTarget && tooltipTarget.nodeName !== 'LI' && !tooltipTarget.classList.contains('ui-grid-item'))
                tooltipTarget = tooltipTarget.parentNode;

            if (!tooltipTarget || !tooltipTarget.ui)
                return;

            var rect = tooltipTarget.getBoundingClientRect();
            var off = 16;

            if (rect.width < 64) off = rect.width / 2;
            tooltipAsset.flip = rect.left + off > window.innerWidth / 2;
            if (tooltipAsset.flip) {
                tooltipAsset.position(rect.right - off, rect.bottom);
            } else {
                tooltipAsset.position(rect.left + off, rect.bottom);
            }

            tooltipAsset.text = tooltipTarget.ui.asset.get('name');
            tooltipAsset.hidden = false;
        };

        var onAssetItemHover = function (evt: MouseEvent) {
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

        grid.innerElement!.addEventListener('mousewheel', function () {
            tooltipAsset.hidden = true;

            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
        }, false);

        tree.on('select', function (item: TreeItem) {
            if (assetsChanged)
                return;

            if (item.asset) {
                if (!Tree._ctrl || !Tree._ctrl()) {
                    if (currentFolder !== item.asset) {
                        item.selected = false;
                    } else {
                        editor.call('selector:set', 'asset', [item.asset]);
                    }
                } else {
                    editor.call('selector:add', 'asset', item.asset);
                }
            }

            if (!item.asset) {
                if (item === treeRoot) {
                    editor.call('assets:filter:search', '');
                    editor.call('assets:panel:currentFolder', null);
                } else if (item === treeScripts) {
                    editor.call('assets:filter:search', '');
                    editor.call('assets:panel:currentFolder', 'scripts');
                }
                return;
            }

            if (!Tree._ctrl || !Tree._ctrl()) {
                editor.call('assets:filter:search', '');
                editor.call('assets:panel:currentFolder', item.asset);
            }
        });

        tree.on('deselect', function (item: TreeItem) {
            if (assetsChanged)
                return;

            if (item.asset)
                editor.call('selector:remove', item.asset);
        });

        grid.on('select', function (item: GridItem) {

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

        grid.on('deselect', function (item: GridItem) {

            console.error('grid deselect');

            if (assetsChanged)
                return;

            if (item.asset) {
                console.error(item);
                console.error(item.asset);
                editor.call('selector:remove', item.asset);
            }
            // } else if (item.script) {
            //     editor.call('selector:remove', item.script);
            // }
        });

        editor.on('selector:change', function (type: string, items: Observer[]) {
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
                var assets: GridItem[] = [];

                for (var i = 0; i < items.length; i++) {
                    if (legacyScripts && items[i].get('type') === 'script') {
                        assets.push(scriptsIndex[items[i].get('filename')]);
                    } else {
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
            } else {
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
        var searchingElement: any = null;
        var searchingFunction: any = null;
        var searchingBatchLimit = 512;

        var searchNextBatch = function () {
            var done = 0;

            while (searchingElement && (searchingBatchLimit === 0 || done < searchingBatchLimit)) {
                var item = searchingElement.ui;

                if (item) {
                    if (item.asset) {
                        item.hidden = !searchingFunction('asset', item.asset);
                    } else if (item.script) {
                        item.hidden = !searchingFunction('script', item.script);
                    }
                    done++;
                }

                searchingElement = searchingElement.nextSibling;
            }

            if (!searchingElement) {
                searchingInProgress = false;
            } else {
                requestAnimationFrame(searchNextBatch);
            }
        };

        // filter assets in grid
        editor.method('assets:panel:filter', function (fn: Function, immediate: boolean) {
            if (!fn)
                fn = editor.call('assets:panel:filter:default');

            labelNoAssets.hidden = true;

            // 获取grid的第一个元素（所有grid的集合）
            searchingElement = grid.element!.firstChild;
            searchingFunction = fn;

            var type = editor.call('assets:filter:type');
            var search = editor.call('assets:filter:search');

            if (!search || immediate) {
                searchingBatchLimit = 0;
            } else {
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
                            assetsIndex[selector.items[0].get('id')].element!.focus();
                        } else if (script) {
                            editor.call('assets:panel:currentFolder', 'scripts');
                        } else {
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
        editor.method('assets:panel:get', function (id: string) {
            return assetsIndex[id] || scriptsIndex[id];
        });

        // 插入子文件夹，如果有的话
        var appendChildFolders = function (item: GridItem) {
            var queue = treeAppendQueue[item.asset.get('id')];
            if (!queue || !queue.length)
                return;

            for (var i = 0; i < queue.length; i++) {
                var closest = treeFindClosest(item.tree, queue[i].tree);
                if (closest === -1) {
                    item.tree!.append(queue[i].tree);
                } else {
                    item.tree!.appendBefore(queue[i].tree, <TreeItem>(item.tree.child(closest).ui));
                }
                appendChildFolders(queue[i]);
            }

            delete treeAppendQueue[item.asset.get('id')];
        };

        var treeFindClosest = function (parent: TreeItem, current: TreeItem, nameOld?: string): number {

            // 文件改变之前的名字
            nameOld = nameOld || current.text;
            // ChildNode -> 当前parent下的其他item
            var l = Array.prototype.slice.call(parent.element!.childNodes, 1);
            // if (item === treeRoot && legacyScripts)
            //   l = l.slice(1);
            if (parent === treeRoot)
                l = l.slice(1);

            var min = 0;
            var max = l.length - 1;
            var cur: number = -1;
            var a, i;
            var aN: string = '';
            var bN: string = '';

            if (l.length === 0)  // 当前没有item，直接在末尾插入item
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
                } else if (aN < bN) {
                    min = cur + 1;
                } else {
                    return cur;
                }
            }

            // if (aN.localeCompare(bN) > 0) {
            //     return cur;
            // }

            if (aN > bN) return cur;

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
                } else {
                    editor.call('selector:clear');
                }
            }
        });

        var renderQueue: any = [];
        var renderQueueIndex: { [key: string]: boolean } = {};

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

        var renderQueueAdd = function (asset: Observer) {
            var id = asset.get('id');
            if (renderQueueIndex[id])
                return;

            if (!assetsIndex[id] || !assetsIndex[id].thumbnail || !assetsIndex[id].thumbnail.render)
                return;

            renderQueueIndex[id] = true;
            renderQueue.push(id);
        };

        var renderQueueRemove = function (asset: Observer) {
            var id = parseInt(asset.get('id'), 10);
            if (!renderQueueIndex[id])
                return;

            var ind = renderQueue.indexOf(id);
            if (ind !== -1)
                renderQueue.splice(ind, 1);

            delete renderQueueIndex[id];
        };

        var showGridDropHighlight = function (item: GridItem) {
            var clip = files.element!.getBoundingClientRect();
            var rect = item.element!.getBoundingClientRect();
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


        var showTreeDropHighlight = function (item: GridItem) {
            var clip = files.element!.getBoundingClientRect();
            var rect = item.tree!.elementTitle.getBoundingClientRect();
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
        var onAddFolder = function (asset: Observer, item: GridItem) {
            item.tree = new TreeItem({
                text: asset.get('name')
            });
            item.tree.asset = asset;


            var path: string[] = asset.get('path');
            var parent;
            // console.warn(path);
            if (path.length) {
                var parentFolderId: string = path[path.length - 1];
                if (assetsIndex[parentFolderId]) {
                    parent = assetsIndex[parentFolderId].tree;
                } else {
                    if (!treeAppendQueue[parentFolderId])
                        treeAppendQueue[parentFolderId] = [];

                    treeAppendQueue[parentFolderId].push(item);
                }
            } else {
                parent = treeRoot;
            }

            // console.warn(item.text);

            if (parent) {
                var closest = treeFindClosest(parent, item.tree);
                if (closest === -1) {
                    parent.append(item.tree);
                } else {
                    parent.appendBefore(item.tree, <TreeItem>(parent.child(closest).ui));
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
                } else if (draggingData.id) {
                    // single-drag
                    if (parseInt(asset.get('id'), 10) === parseInt(draggingData.id, 10))
                        return;
                } else {
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
                } else {
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

            item.element!.addEventListener('mouseout', onMouseOut, false);
            item.tree.elementTitle.addEventListener('mouseout', onMouseOut, false);

            item.element!.addEventListener('mouseover', onMouseOver, false);
            item.tree.elementTitle.addEventListener('mouseover', onMouseOver, false);
        };

        // Called when a script asset is added
        var onAddScript = function (asset: Observer, item: GridItem, events: any) {
            events.push(editor.on('assets[' + asset.get('id') + ']:scripts:collide', function (script: any) {
                item.class!.add('scripts-collide');
            }));
            events.push(editor.on('assets[' + asset.get('id') + ']:scripts:resolve', function (script: any) {
                item.class!.remove('scripts-collide');
            }));
        };

        var onAddBundle = function (asset: Observer, item: GridItem) {
            var confirmElement = document.createElement('div');
            confirmElement.classList.add('confirm');
            confirmElement.classList.add('thumbnail');
            item.element!.appendChild(confirmElement);

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
                    if (!draggedAsset) continue;
                    if (bundleAssets.indexOf(draggedAsset.get('id')) !== -1) continue;

                    if (!draggedAsset.get('source')) {
                        var type = draggedAsset.get('type');
                        if (['folder', 'script', 'bundle'].indexOf(type) === -1) {
                            valid = true;
                            break;
                        }
                    }
                }

                if (!valid) return;

                showGridDropHighlight(item);

                grid.dragOver = asset;
            };

            var onMouseOut = function () {
                if (!dragging || grid.dragOver !== asset)
                    return;

                gridDropBorder.classList.remove('active');
                grid.dragOver = undefined;
            };

            item.element!.addEventListener('mouseout', onMouseOut, false);
            item.element!.addEventListener('mouseover', onMouseOver, false);
        };



        editor.on('assets:add', function (asset: Observer, pos: number) {


            var events: any = [];
            var item = new GridItem();
            item.asset = asset;
            item.class!.add('type-' + asset.get('type'));

            item.element!.addEventListener('mouseover', onAssetItemHover, false);
            item.element!.addEventListener('mouseout', onAssetItemBlur, false);

            asset.once('destroy', onAssetItemRemove.bind(asset));

            var onMouseDown = function (evt: MouseEvent) {
                evt.stopPropagation();
            };

            var onDragStart = function (evt: DragEvent) {
                evt.preventDefault();
                evt.stopPropagation();

                if (!editor.call('permissions:write'))
                    return;

                var type = 'asset.' + asset.get('type');
                var data = {
                    id: asset.get('id'),
                    ids: new Array<number>()
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
                item.tree!.elementTitle.addEventListener('mousedown', onMouseDown, false);
                item.tree.elementTitle.addEventListener('dragstart', onDragStart, false);
            } else if (asset.get('type') === 'script') {
                onAddScript(asset, item, events);
            } else if (asset.get('type') === 'bundle') {
                // onAddBundle(asset, item, events);
            }

            var updateTask = function () {
                var status = asset.get('task');
                item.class!.remove('task', 'failed', 'running');
                if (status && typeof (status) === 'string' && status[0] !== '{') {
                    item.class!.add('task', status);
                }
            };

            // add task status
            updateTask();
            asset.on('task:set', updateTask);

            item.element!.draggable = true;
            item.element!.addEventListener('mousedown', onMouseDown, false);
            item.element!.addEventListener('dragstart', onDragStart, false);


            assetsIndex[asset.get('id')] = item;

            // source
            if (asset.get('source'))
                item.class!.add('source');

            // TODO
            // console.log(editor.call('assets:panel:filter:default'));
            if (!editor.call('assets:panel:filter:default')('asset', asset)) {
                // console.log('assets:panel:filter:default');
                item.hidden = true;
            }


            var fileSize = asset.get('file.size');

            if (!asset.get('source')) {
                // update thumbnails change
                asset.on('thumbnails.m:set', function (value: string) {
                    if (value.startsWith('/api')) {
                        // value = value.appendQuery('t=' + asset.get('file.hash'));
                        value = Tools.appendQuery(value, 't=' + asset.get('file.hash'));
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
                item.element!.addEventListener('dblclick', function () {
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
                item.element!.addEventListener('dblclick', function () {
                    editor.call('picker:sprites', item.asset);
                }, false);
            }


            var thumbnail: any;
            var evtSceneSettings: any;
            var evtAssetChanged: any;

            if (asset.get('type') === 'material' || asset.get('type') === 'model' || asset.get('type') === 'sprite' || (asset.get('type') === 'font') && !asset.get('source')) {
                var queuedRender = false;

                thumbnail = document.createElement('img');
                // thumbnail.changed = true;
                thumbnail.width = 64;
                thumbnail.height = 64;

                if (asset.get('type') !== 'sprite') {
                    thumbnail.classList.add('flipY');
                }


                let htmlCanvas = document.createElement('canvas');
                htmlCanvas.width = 64;
                htmlCanvas.height = 64;
                htmlCanvas.style.display = 'none';
                document.body.append(htmlCanvas);

                let engine = new BABYLON.Engine(htmlCanvas, true);
                let scene = new BABYLON.Scene(engine);

                // scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.Green());
                scene.clearColor.a = 0;

                var light = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(45, 45, 0), scene);

                var camera = new BABYLON.ArcRotateCamera("PreviewCamera", 10, 10, 10, new BABYLON.Vector3(0, 0, 0), scene);
                // camera.setPosition(new BABYLON.Vector3(20, 200, 400));

                camera.attachControl(htmlCanvas, true);
                camera.lowerBetaLimit = 0.1;
                camera.upperBetaLimit = (Math.PI / 2) * 0.99;
                camera.lowerRadiusLimit = 150;

                let box = BABYLON.MeshBuilder.CreateSphere('box', { diameter: 80 }, scene);

                // engine.runRenderLoop(() => {
                //     if (scene) {
                //         scene.render();
                //     }
                // });

                scene.render();
                BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, 64, (data: string) => {
                    console.log(data);
                    thumbnail.src = data;
                });






            } else {
                thumbnail = document.createElement('div');
                // (<HTMLElement>thumbnail).widt
            }

            item.thumbnail = thumbnail;
            thumbnail.classList.add('thumbnail');
            item.element!.appendChild(thumbnail);

            if (asset.has('thumbnails') && !asset.get('source')) {
                thumbnail.style.backgroundImage = 'url("' + asset.get('thumbnails') + '")';
            } else {
                thumbnail.classList.add('placeholder');
            }

            var icon = document.createElement('div');
            icon.classList.add('icon');
            item.element!.appendChild(icon);

            var label = item.labelElement = document.createElement('div');
            label.classList.add('label');
            label.textContent = asset.get('name');
            item.element!.appendChild(label);

            var users = item.users = document.createElement('div');
            users.classList.add('users');
            item.element!.appendChild(users);

            // update name/filename change
            events.push(asset.on('name:set', function (name: string, nameOld: string) {
                // grid
                label.textContent = asset.get('name');
                // tree
                if (item.tree) {
                    item.tree.text = asset.get('name');

                    // resort element (move match alphabetical order)
                    var parent = <TreeItem>item.tree.parent;
                    item.tree.parent!.element!.removeChild(item.tree.element!);
                    var closest = treeFindClosest(parent, item.tree, nameOld);
                    if (closest === -1) {
                        parent.element!.appendChild(item.tree.element!);
                    } else {
                        parent.element!.insertBefore(item.tree.element!, parent.child(closest));
                    }

                    resizeQueue();
                }

                keepLegacyScriptsAtTop();
            }));

            events.push(asset.on('path:set', function (path: string, pathOld: string) {
                // show or hide based on filters
                item.hidden = !editor.call('assets:panel:filter:default')('asset', asset);

                if (item.tree) {
                    if (!pathOld.length || !path.length || path[path.length - 1] !== pathOld[pathOld.length - 1]) {
                        (<TreeItem>item.tree.parent!).remove(item.tree);
                        var parent;

                        if (path.length) {
                            parent = assetsIndex[path[path.length - 1]].tree;
                        } else {
                            parent = treeRoot;
                        }

                        var closest = treeFindClosest(parent, item.tree);
                        if (closest === -1) {
                            parent.append(item.tree);
                        } else {
                            parent.appendBefore(item.tree, <TreeItem>(parent.child(closest).ui));
                        }
                    }

                    if (currentFolder === asset)
                        editor.emit('assets:panel:currentFolder', currentFolder);
                }

                keepLegacyScriptsAtTop();
            }));

            if (!asset.get('source')) {
                // used event
                var evtUnused = editor.on('assets:used:' + asset.get('id'), function (state: boolean) {
                    if (state) {
                        item.class!.remove('unused');
                    } else {
                        item.class!.add('unused');
                    }
                });
                // used state
                if (!editor.call('assets:used:get', asset.get('id')))
                    item.class!.add('unused');

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
            var assets: ObserverList = editor.call('assets:raw');
            if (pos === -1 || !assets.data[pos + 1]) {
                grid.append(item);
            } else {
                grid.appendBefore(item, assetsIndex[assets.data[pos + 1].get('id')]);
            }

            resizeQueue();

            keepLegacyScriptsAtTop();

        });

        var keepLegacyScriptsAtTop = function () {
            if (!legacyScripts)
                return;

            // resort scripts folder in grid
            gridScripts.element!.parentNode!.removeChild(gridScripts.element!);
            var first = grid.element!.firstChild;
            if (first) {
                grid.element!.insertBefore(gridScripts.element!, first);
            } else {
                grid.element!.appendChild(gridScripts.element!);
            }

            // resort scripts folder in tree
            treeScripts.element!.parentNode!.removeChild(treeScripts.element!);
            var next = treeRoot.elementTitle.nextSibling;
            if (next) {
                treeRoot.element!.insertBefore(treeScripts.element!, next);
            } else {
                treeRoot.element!.appendChild(treeScripts.element!);
            }
        };

        editor.on('assets:move', function (asset: Observer, pos: number) {
            var item = assetsIndex[asset.get('id')];
            // remove
            grid.element!.removeChild(item.element!);
            // append
            if (pos === -1) {
                // to end
                grid.append(item);
            } else {
                // before another element
                grid.appendBefore(item, assetsIndex[editor.call('assets:raw').data[pos + 1].get('id')]);
            }
        });

        editor.on('assets:remove', function (asset: Observer) {
            var treeItem = assetsIndex[asset.get('id')].tree;
            if (treeItem) {
                if (treeItem.parent)
                    (<TreeItem>treeItem.parent).remove(treeItem);
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

        var addSourceFile = function (file: Observer) {
            file.set('type', 'script');

            var item = new GridItem();
            item.script = file;
            item.class!.add('type-script');
            grid.append(item);

            if (!editor.call('assets:panel:filter:default')('script', file)) {
                item.hidden = true;
            }


            scriptsIndex[file.get('filename')] = item;

            var thumbnail = document.createElement('div');
            thumbnail.classList.add('thumbnail', 'placeholder');
            item.element!.appendChild(thumbnail);

            var icon = document.createElement('div');
            icon.classList.add('icon');
            item.element!.appendChild(icon);

            var label = item.labelElement = document.createElement('div');
            label.classList.add('label');
            label.textContent = file.get('filename');
            item.element!.appendChild(label);

            var users = item.users = document.createElement('div');
            users.classList.add('users');
            item.element!.appendChild(users);

            // update name/filename change
            var evtNameSet = file.on('filename:set', function (value: string, valueOld: string) {
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
        var removeSourceFile = function (file: Observer) {
            file.destroy();
        };

        editor.on('sourcefiles:add', addSourceFile);
        editor.on('sourcefiles:remove', removeSourceFile);





    }




}