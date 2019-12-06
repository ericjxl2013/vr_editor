import { Panel, Label, Progress, Element, TextField, Button, TextAreaField, Slider, NumberField, Checkbox, ColorField, ImageField, Code, SelectField } from "../../ui";
import { VeryEngine } from "../../engine";
import { Observer, EventHandle } from "../../lib";

export class AttributesPanel {


  public root: Panel;

  private inspectedItems: EventHandle[] = [];

  public title: string = '属性面板';

  public constructor() {
    this.root = VeryEngine.attributesPanel;

    this.init();

  }

  private init(): void {
    let self = this;

    // clearing
    editor.method('attributes:clear', this.clearPanel);

    // set header
    editor.method('attributes:header', (text: string) => {
      self.root.header = text;
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
      for (let i = 0; i < self.inspectedItems.length; i++) {
        self.inspectedItems[i].unbind();
      }
      self.inspectedItems = [];
    });

    editor.method('attributes:inspect', function (type: string, item: Observer) {
      self.clearPanel();

      // clear if destroyed
      self.inspectedItems.push(item.once('destroy', function () {
        editor.call('attributes:clear');
      }));

      self.root.header = type;
      editor.emit('attributes:inspect[' + type + ']', [item]);
      editor.emit('attributes:inspect[*]', type, [item]);
    });


    editor.on('selector:change', function (type: string, items: Observer[]) {
      self.clearPanel();

      console.warn('选中entity长度：' + items.length);

      // nothing selected
      if (items.length === 0) {
        let label = new Label('请选择物体或资源');
        label.style!.display = 'block';
        label.style!.textAlign = 'center';
        label.style!.width = '100%';
        // label.style!.height = '22px';
        self.root.append(label);

        self.root.header = self.title;

        return;
      }

      // clear if destroyed
      for (let i = 0; i < items.length; i++) {
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