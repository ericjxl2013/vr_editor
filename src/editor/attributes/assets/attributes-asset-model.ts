import { Observer } from "../../../lib";
import { Label, Button, Progress, ImageField } from "../../../ui";

export class AttributesAssetModel {

    public constructor() {

        var pickMaterial = function (assetId: string, fn: Function) {
            var asset = editor.call('assets:get', assetId);
            editor.call('picker:asset', {
                type: 'material',
                currentAsset: asset
            });

            var evtPick: Nullable<EventHandle> = editor.once('picker:asset', function (asset: Observer) {
                fn(asset.get('id'));
                evtPick = null;
            });

            editor.once('picker:asset:close', function () {
                if (evtPick) {
                    evtPick.unbind();
                    evtPick = null;
                }
            });
        };

        var panelNodes: any = null;

        editor.method('attributes:asset:model:nodesPanel', function () {
            return panelNodes;
        });

        var panelToggles = {
            'meta': true,
            'pipeline': true,
            'nodes': false
        };


        editor.on('attributes:inspect[asset]', function (assets: Observer[]) {
            for (var i = 0; i < assets.length; i++) {
                // 选中的assets中有不是model的，则返回
                if (assets[i].get('type') !== 'model' || assets[i].get('source'))
                    return;
            }

            // 多个model时，不用加载
            if (assets.length > 1)
                editor.call('attributes:header', assets.length + ' Models');

            var events: EventHandle[] = [];

            var nodesTemplate: Nullable<Function>;

            var _loading = 0;
            var _hash = '';
            var _nodes: Nullable<string[]> = null;

            // if (assets.length === 1 && assets[0]._loading && assets[0]._hash !== assets[0].get('file.hash')) {
            //     assets[0]._loading = 0;
            //     assets[0]._nodes = null;
            // }

            if (assets.length === 1) {
                _loading = 0;
                _nodes = null;
            }

            // load model
            var loadingData = false;
            var loadData = function () {
                if (assets.length !== 1 || _loading)
                    return;

                _hash = assets[0].get('file.hash');
                _loading = 1;
                // assets[0]._uv1 = false;
                _nodes = null;
                loading.hidden = false;

                // TODO: load entrance
                // Ajax
                //     .get('{{url.home}}' + assets[0].get('file.url'))
                //     .on('load', function (status: number, data: any) {
                //         _loading = 2;

                //         autoUnwrap.enabled = true;

                //         _nodes = [];
                //         for (var i = 0; i < data.model.meshInstances.length; i++)
                //             _nodes[i] = data.model.nodes[data.model.meshInstances[i].node].name;

                //         if (nodesTemplate)
                //             nodesTemplate();

                //         loading.progress = 1;
                //     })
                //     .on('progress', function (progress: number) {
                //         loading.progress = 0.1 + progress * 0.8;
                //     })
                //     .on('error', function () {
                //         loading.failed = true;

                //         var error = new Label('failed loading detailed data');
                //         error.text = 'failed loading data';
                //         error.style!.display = 'block';
                //         error.style!.textAlign = 'center';
                //         error.style!.fontWeight = '100';
                //         error.style!.fontSize = '12px';
                //         error.style!.color = '#f66';
                //         editor.call('attributes.rootPanel').append(error);

                //         loading.progress = 1;
                //     });

                loading.progress = 0.1;
            };

            // loading
            var loading: Progress;
            if (assets.length === 1) {
                loading = editor.call('attributes:addField', {
                    type: 'progress'
                });
                loading.on('progress:100', function () {
                    loading.hidden = true;
                });
                if (_loading)
                    loading.hidden = true;

                if (assets[0].has('file.url') && !_loading)
                    loadData();

                events.push(assets[0].on('file.hash:set', function (value: any) {
                    // do this in a timeout so that all the fields of the file entry
                    // have a chance to be initialized - this is mainly a problem if you
                    // select a model asset that has not finished importing yet
                    setTimeout(function () {
                        _loading = 0;
                        loadData();
                    });
                }));
            }


            var panelMeta = editor.call('attributes:addPanel', {
                name: 'Meta'
            });
            panelMeta.class.add('component');
            panelMeta.foldable = true;
            panelMeta.folded = panelToggles['meta'];
            panelMeta.on('fold', function () {
                panelToggles['meta'] = true;
            });
            panelMeta.on('unfold', function () {
                panelToggles['meta'] = false;
            });

            var btnGetMeta = new Button('Calculate Meta');
            btnGetMeta.class!.add('calculate-meta', 'large-with-icon');
            var btnGetMetaVisibility = function () {
                var visible = false;
                for (var i = 0; i < assets.length; i++) {
                    if (!visible && (!assets[i].get('meta') || !assets[i].has('meta.vertices')))
                        visible = true;
                }
                btnGetMeta.hidden = !visible;
            };
            btnGetMeta.on('click', function () {
                if (!editor.call('permissions:write'))
                    return;

                for (var i = 0; i < assets.length; i++) {
                    if (assets[i].get('meta') && assets[i].has('meta.vertices'))
                        continue;

                    editor.call('realtime:send', 'pipeline', {
                        name: 'meta',
                        id: assets[i].get('uniqueId')
                    });
                }
                btnGetMeta.enabled = false;
            });
            panelMeta.append(btnGetMeta);

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

            var recalculateMeta = function (key: string) {
                var value = 0;
                var noValue = true;
                for (var i = 0; i < assets.length; i++) {
                    if (!assets[i].has('meta.' + key))
                        continue;
                    value += assets[i].get('meta.' + key);
                    noValue = false;
                }
                if (noValue)
                    metaFields[key].field.parent.hidden = true;
                else
                    metaFields[key].field.parent.hidden = false;
                metaFields[key].field.value = noValue ? '' : value.toLocaleString();
            };

            var metaFields: any = {
                vertices: {
                    title: 'Vertices',
                },
                triangles: {
                    title: 'Triangles',
                },
                meshes: {
                    title: 'Meshes',
                },
                meshInstances: {
                    title: 'Mesh Instances',
                },
                nodes: {
                    title: 'Nodes',
                },
                skins: {
                    title: 'Skins',
                }
            };

            var keys = Object.keys(metaFields);

            var addMetaField = function (key: string) {
                metaFields[key].field = editor.call('attributes:addField', {
                    parent: panelMeta,
                    name: metaFields[key].title
                });
                recalculateMeta(key);

                for (var a = 0; a < assets.length; a++) {
                    events.push(assets[a].on('meta:unset', function () {
                        recalculateMeta(key);
                    }));
                    events.push(assets[a].on('meta:set', function () {
                        recalculateMeta(key);
                    }));
                    events.push(assets[a].on('meta.' + key + ':set', function () {
                        recalculateMeta(key);
                    }));
                    events.push(assets[a].on('meta.' + key + ':unset', function () {
                        recalculateMeta(key);
                    }));
                }
            };

            for (var i = 0; i < keys.length; i++) {
                if (!metaFields.hasOwnProperty(keys[i]))
                    continue;

                addMetaField(keys[i]);
            }

            var calculateAttributes = function () {
                var attributes: { [key: string]: number } = {};
                for (var i = 0; i < assets.length; i++) {
                    var attr = assets[i].get('meta.attributes');
                    if (!attr)
                        continue;

                    var keys = Object.keys(attr);
                    for (var n = 0; n < keys.length; n++) {
                        if (!attr.hasOwnProperty(keys[n]))
                            continue;

                        attributes[keys[n]] = attributes[keys[n]] || 0;
                        attributes[keys[n]]++;
                    }
                }

                var attributesValue = '';
                var keys = Object.keys(attributes);
                for (var i = 0; i < keys.length; i++) {
                    if (!attributes.hasOwnProperty(keys[i]))
                        continue;

                    if (attributesValue)
                        attributesValue += ', ';

                    attributesValue += keys[i];

                    if (attributes[keys[i]] !== assets.length)
                        attributesValue += '*';
                }

                fieldMetaAttributes.value = attributesValue;
                fieldMetaAttributes.parent.hidden = !attributesValue;
            };


            var fieldMetaAttributes = editor.call('attributes:addField', {
                parent: panelMeta,
                name: 'Attributes'
            });
            calculateAttributes();
            for (var i = 0; i < assets.length; i++)
                events.push(assets[i].on('meta:set', calculateAttributes));


            var panelPipeline = editor.call('attributes:addPanel', {
                name: 'Pipeline'
            });
            panelPipeline.class.add('component');
            panelPipeline.foldable = true;
            panelPipeline.folded = panelToggles['pipeline'];
            panelPipeline.on('fold', function () {
                panelToggles['pipeline'] = true;
            });
            panelPipeline.on('unfold', function () {
                panelToggles['pipeline'] = false;
            });


            var uv1Options = ['unavailable', 'available', 'various'];
            var checkUV1 = function () {
                var uv1 = assets[0].has('meta.attributes.texCoord1') ? 1 : 0;
                for (var i = 1; i < assets.length; i++) {
                    var t1 = assets[i].get('meta.attributes.texCoord1');

                    if ((t1 ? 1 : 0) !== uv1) {
                        uv1 = 2;
                        break;
                    }
                }
                fieldUV1.value = uv1Options[uv1];
            }

            var fieldUV1 = editor.call('attributes:addField', {
                parent: panelPipeline,
                name: 'UV1'
            });
            checkUV1();

            for (var i = 0; i < assets.length; i++) {
                events.push(assets[i].on('meta.attributes.texCoord1:set', checkUV1));
                events.push(assets[i].on('meta.attributes.texCoord1:unset', checkUV1));
            }

            // padding
            var fieldPadding = editor.call('attributes:addField', {
                parent: panelPipeline,
                name: 'Padding',
                type: 'number',
                value: 2.0,
                precision: 2
            });
            fieldPadding.style.width = '32px';

            // TODO
            // estimate good padding
            // padding = (2 / getResolutionFromArea(assetArea)) * 1024

            // unwrap
            var autoUnwrap = new Button('Auto-Unwrap');
            autoUnwrap.on('click', function () {
                if (!editor.call('permissions:write'))
                    return;

                for (var i = 0; i < assets.length; i++) {
                    editor.call('assets:model:unwrap', assets[i], {
                        padding: fieldPadding.value
                    });
                }

                unwrapState();
            });
            autoUnwrap.class!.add('generate-uv1');
            fieldPadding.parent.append(autoUnwrap);

            // unwrap progress
            var fieldUnwrapProgress = editor.call('attributes:addField', {
                parent: panelPipeline,
                name: 'Unwrapping',
            });
            var field = fieldUnwrapProgress;
            fieldUnwrapProgress = fieldUnwrapProgress.parent;
            field.destroy();
            fieldUnwrapProgress.hidden = editor.call('assets:model:unwrapping', assets[0])

            // unwrap progress
            var progressUnwrap = new Progress();
            progressUnwrap.class!.add('field-progress');
            fieldUnwrapProgress.append(progressUnwrap);

            // unwrap cancel
            var autoUnwrapCancel = new Button('取消');
            autoUnwrapCancel.on('click', function () {
                if (!editor.call('permissions:write'))
                    return;

                for (var i = 0; i < assets.length; i++)
                    editor.call('assets:model:unwrap:cancel', assets[i]);

                unwrapState();
            });
            autoUnwrapCancel.class!.add('generate-uv1');
            fieldUnwrapProgress.append(autoUnwrapCancel);

            var unwrapState = function () {
                var worker = editor.call('assets:model:unwrapping', assets[0]);
                fieldUnwrapProgress.hidden = !worker;
                fieldPadding.parent.hidden = !fieldUnwrapProgress.hidden;

                if (worker)
                    progressUnwrap.progress = worker.progress / 100;
            };
            unwrapState();

            events.push(editor.on('assets:model:unwrap', function (asset: Observer) {
                if (assets.indexOf(asset) === -1)
                    return;

                unwrapState();
            }));
            events.push(editor.on('assets:model:unwrap:progress:' + assets[0].get('id'), function (progress: number) {
                progressUnwrap.progress = progress / 100;
            }));


            if (assets.length === 1 && assets[0].has('data.mapping') && assets[0].get('data.mapping').length) {
                var root = editor.call('attributes.rootPanel');

                var previewContainer = document.createElement('div');
                previewContainer.classList.add('asset-preview-container');

                // preview
                var preview = document.createElement('canvas');
                var ctx = preview.getContext('2d');
                preview.width = 256;
                preview.height = 256;
                preview.classList.add('asset-preview', 'flipY');
                previewContainer.appendChild(preview);

                var sx = 0, sy = 0, x = 0, y = 0, nx = 0, ny = 0;
                var dragging = false;
                var previewRotation = [-15, 45];

                preview.addEventListener('mousedown', function (evt) {
                    if (evt.button !== 0)
                        return;

                    evt.preventDefault();
                    evt.stopPropagation();

                    sx = x = evt.clientX;
                    sy = y = evt.clientY;

                    dragging = true;
                }, false);

                var onMouseMove = function (evt: MouseEvent) {
                    if (!dragging)
                        return;

                    nx = x - evt.clientX;
                    ny = y - evt.clientY;
                    x = evt.clientX;
                    y = evt.clientY;

                    queueRender();
                };

                var onMouseUp = function (evt: MouseEvent) {
                    if (!dragging)
                        return;

                    if ((Math.abs(sx - x) + Math.abs(sy - y)) < 8) {
                        if (root.element.classList.contains('large')) {
                            root.element.classList.remove('large');
                        } else {
                            root.element.classList.add('large');
                        }
                    }

                    previewRotation[0] = Math.max(-90, Math.min(90, previewRotation[0] + ((sy - y) * 0.3)));
                    previewRotation[1] += (sx - x) * 0.3;
                    sx = sy = x = y = 0;

                    dragging = false;

                    queueRender();
                };

                window.addEventListener('mousemove', onMouseMove, false);
                window.addEventListener('mouseup', onMouseUp, false);

                root.class.add('asset-preview');
                root.element.insertBefore(previewContainer, root.innerElement);

                // rendering preview
                var renderQueued: boolean;

                var renderPreview = function () {
                    if (renderQueued)
                        renderQueued = false;

                    // render
                    editor.call('preview:render', assets[0], previewContainer.clientWidth, previewContainer.clientHeight, preview, {
                        rotation: [Math.max(-90, Math.min(90, previewRotation[0] + (sy - y) * 0.3)), previewRotation[1] + (sx - x) * 0.3]
                    });
                };
                renderPreview();

                // queue up the rendering to prevent too oftern renders
                var queueRender = function () {
                    if (renderQueued) return;
                    renderQueued = true;
                    requestAnimationFrame(renderPreview);
                };

                // render on resize
                var evtPanelResize = root.on('resize', queueRender);
                var evtSceneSettings = editor.on('preview:scene:changed', queueRender);

                // model resource loaded
                var watcher = editor.call('assets:model:watch', {
                    asset: assets[0],
                    autoLoad: true,
                    callback: queueRender
                });

                // nodes panel
                panelNodes = editor.call('attributes:addPanel', {
                    name: 'Mesh Instances'
                });
                panelNodes.class.add('component');
                panelNodes.foldable = true;
                panelNodes.folded = panelToggles['nodes'];
                panelNodes.on('fold', function () {
                    panelToggles['nodes'] = true;
                });
                panelNodes.on('unfold', function () {
                    panelToggles['nodes'] = false;
                });

                // reference
                editor.call('attributes:reference:attach', 'asset:model:meshInstances', panelNodes, panelNodes.headerElement);

                var nodeItems: ImageField[] = [];

                var addField = function (ind: number) {
                    // TODO: call engine
                    var app = editor.call('viewport:app');
                    if (!app) return; // webgl not available

                    var engineAsset = app.assets.get(assets[0].get('id'));
                    var valueBefore: any = null;

                    nodeItems[ind] = editor.call('attributes:addField', {
                        parent: panelNodes,
                        type: 'asset',
                        kind: 'material',
                        name: '[' + ind + '] node',
                        link: assets[0],
                        path: 'data.mapping.' + ind + '.material',
                        over: function (type: string, data: any) {
                            valueBefore = assets[0].get('data.mapping.' + ind + '.material') || null;
                            if (engineAsset) {
                                engineAsset.data.mapping[ind].material = parseInt(data.id, 10);
                                engineAsset.fire('change', engineAsset, 'data', engineAsset.data, engineAsset.data);
                                editor.call('viewport:render');
                            }
                        },
                        leave: function () {
                            if (valueBefore) {
                                engineAsset.data.mapping[ind].material = valueBefore;
                                engineAsset.fire('change', engineAsset, 'data', engineAsset.data, engineAsset.data);
                                editor.call('viewport:render');
                            }
                        }
                    });

                    nodeItems[ind].parent!.class!.add('node-' + ind);

                    nodeItems[ind].parent!.on('click', function () {
                        nodeItems[ind].parent!.class!.remove('active');
                    });

                    nodeItems[ind].on('beforechange', function (id: string) {
                        nodeItems[ind].once('change', function () {
                            var history = assets[0].history.enabled;
                            assets[0].history.enabled = false;

                            var previous = assets[0].get('meta.userMapping.' + ind);
                            if (!assets[0].get('meta')) {
                                assets[0].set('meta', {
                                    userMapping: {}
                                });
                            } else {
                                if (!assets[0].has('meta.userMapping'))
                                    assets[0].set('meta.userMapping', {});
                            }

                            assets[0].set('meta.userMapping.' + ind, true);

                            assets[0].history.enabled = history;

                            var lastHistoryAction = editor.call('history:list')[editor.call('history:current')];
                            var undo = lastHistoryAction.undo;
                            var redo = lastHistoryAction.redo;

                            lastHistoryAction.undo = function () {
                                undo();

                                var item = editor.call('assets:get', assets[0].get('id'));
                                if (!item) return;

                                var history = item.history.enabled;
                                item.history.enabled = false;

                                if (!previous) {
                                    item.unset('meta.userMapping.' + ind);

                                    if (Object.keys(item.get('meta.userMapping')).length === 0) {
                                        item.unset('meta.userMapping');
                                    }
                                }

                                item.history.enabled = history;
                            };

                            lastHistoryAction.redo = function () {
                                redo();

                                var item = editor.call('assets:get', assets[0].get('id'));
                                if (!item) return;

                                var history = item.history.enabled;
                                item.history.enabled = false;

                                if (!item.get('meta')) {
                                    item.set('meta', {
                                        userMapping: {}
                                    });
                                } else {
                                    if (!item.has('meta.userMapping'))
                                        item.set('meta.userMapping', {});
                                }

                                item.set('meta.userMapping.' + ind, true);

                                item.history.enabled = history;
                            };
                        });
                    });
                };

                // create node fields
                var mapping = assets[0].get('data.mapping');
                for (var i = 0; i < mapping.length; i++) {
                    addField(i);
                }

                panelNodes.on('destroy', function () {
                    root.class.remove('asset-preview', 'animate');

                    editor.call('assets:model:unwatch', assets[0], watcher);

                    evtSceneSettings.unbind();
                    evtPanelResize.unbind();

                    if (previewContainer.parentNode)
                        previewContainer.parentNode.removeChild(previewContainer);

                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);

                    panelNodes = null;
                });

                // hide preview when asset info is hidden
                events.push(editor.once('attributes:assets:toggleInfo', function (toggle: boolean) {
                    panelMeta.hidden = true;
                    panelPipeline.hidden = true;

                    root.class.remove('asset-preview', 'animate');
                    if (previewContainer.parentNode)
                        previewContainer.parentNode.removeChild(previewContainer);
                }));

                // template nodes
                nodesTemplate = function () {
                    if (!panelNodes)
                        return;

                    panelNodes.header = 'Mesh Instances [' + _nodes!.length + ']'

                    for (var i = 0; i < _nodes!.length; i++) {
                        if (!nodeItems[i])
                            continue;

                        // nodeItems[i]._label.text = '[' + i + '] ' + _nodes![i];
                    }
                };

                if (_nodes)
                    // already loaded
                    nodesTemplate();
            }

            panelMeta.once('destroy', function () {
                for (var i = 0; i < events.length; i++)
                    events[i].unbind();
            });
        });



    }


}