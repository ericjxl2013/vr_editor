import { VeryEngine } from "../../engine";
import { Observer } from "../../lib";

export class AssetsUpload {

    public constructor() {

        // 当前任务记录
        var uploadJobs = 0;
        var userSettings: any = editor.call('settings:projectUser');
        // var legacyScripts = editor.call('settings:project').get('useLegacyScripts');
        var legacyScripts = false;

        var targetExtensions: { [key: string]: boolean } = {
            'jpg': true,
            'jpeg': true,
            'png': true,
            'gif': true,
            'css': true,
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
            'atlas': true
        };

        var typeToExt: { [key: string]: string[] } = {
            'scene': ['fbx', 'dae', 'obj', '3ds'],
            'text': ['txt', 'xml', 'atlas'],
            'html': ['html'],
            'css': ['css'],
            'json': ['json'],
            'texture': ['tif', 'tga', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'dds', 'hdr', 'exr'],
            'audio': ['wav', 'mp3', 'mp4', 'ogg', 'm4a'],
            'shader': ['glsl', 'frag', 'vert'],
            'script': ['js'],
            'font': ['ttf', 'ttc', 'otf', 'dfont']
        };


        var extToType: { [key: string]: string } = {};
        for (var type in typeToExt) {
            for (var i = 0; i < typeToExt[type].length; i++) {
                extToType[typeToExt[type][i]] = type;
            }
        }


        editor.method('assets:canUploadFiles', function (files: any) {
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

        var appendCommon = function (form: FormData, args: any) {
            // NOTE
            // non-file form data should be above file,
            // to make it parsed on back-end first

            // branch id
            // form.append('branchId', "config.self.branch.id");

            //

            // parent folder
            if (args.parent) {
                if (args.parent instanceof Observer) {
                    form.append('parent', args.parent.get('id'));
                } else {
                    var id = parseInt(args.parent, 10);
                    if (!isNaN(id))
                        form.append('parent', id + '');
                }
            }

            // conversion pipeline specific parameters
            var settings = editor.call('settings:projectUser');
            switch (args.type) {
                case 'texture':
                case 'textureatlas':
                    form.append('pow2', settings.get('editor.pipeline.texturePot'));
                    form.append('searchRelatedAssets', settings.get('editor.pipeline.searchRelatedAssets'));
                    break;
                case 'scene':
                    form.append('searchRelatedAssets', settings.get('editor.pipeline.searchRelatedAssets'));
                    form.append('overwriteModel', settings.get('editor.pipeline.overwriteModel'));
                    form.append('overwriteAnimation', settings.get('editor.pipeline.overwriteAnimation'));
                    form.append('overwriteMaterial', settings.get('editor.pipeline.overwriteMaterial'));
                    form.append('overwriteTexture', settings.get('editor.pipeline.overwriteTexture'));
                    form.append('pow2', settings.get('editor.pipeline.texturePot'));
                    form.append('preserveMapping', settings.get('editor.pipeline.preserveMapping'));
                    break;
                case 'font':
                    break;
                default:
                    break;
            }

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

        var create = function (args: any) {
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

        var update = function (assetId: string, args: any) {
            var form = new FormData();
            form = appendCommon(form, args);
            return form;
        };


        editor.method('assets:uploadFile', function (args: any, fn?: Function) {
            var method = 'POST';
            var url = '/api/assets';
            var form = null;
            if (args.asset) {
                var assetId = args.asset.get('id');
                method = 'PUT';
                url = '/api/assets/' + assetId;
                form = update(assetId, args);
            } else {
                form = create(args);
            }

            var job = ++uploadJobs;
            editor.call('status:job', 'asset-upload:' + job, 0);

            var data = {
                url: url,
                method: method,
                auth: true,
                data: form,
                ignoreContentType: true,
                headers: {
                    Accept: 'application/json'
                }
            };

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

        editor.method('assets:upload:files', function (files: FileList) {
            if (!editor.call('assets:canUploadFiles', files)) {
                // var msg = 'Disk allowance exceeded. <a href="/upgrade" target="_blank">UPGRADE</a> to get more disk space.';
                // editor.call('status:error', msg);
                return;
            }

            var currentFolder = editor.call('assets:panel:currentFolder');

            // 遍历每一个文件
            for (var i = 0; i < files.length; i++) {
                var path: string[] = [];

                if (currentFolder && currentFolder.get)
                    path = currentFolder.get('path').concat(parseInt(currentFolder.get('id'), 10));

                console.error(path);

                var source = false;
                var ext1: string[] = files[i].name.split('.');
                if (ext1.length === 1)
                    continue;

                var ext: string = ext1[ext1.length - 1].toLowerCase();

                if (legacyScripts && ext === 'js') {
                    editor.call('assets:upload:script', files[i]);
                } else {
                    var type = extToType[ext] || 'binary';

                    var source = type !== 'binary' && !targetExtensions[ext];

                    // check if we need to convert textures to texture atlases
                    // if (type === 'texture' && userSettings.get('editor.pipeline.textureDefaultToAtlas')) {
                    //     type = 'textureatlas';
                    // }

                    // can we overwrite another asset?
                    var sourceAsset = null;
                    var candidates = editor.call('assets:find', function (item: Observer) {
                        // check files in current folder only
                        if (!item.get('path').equals(path))
                            return false;

                        // try locate source when dropping on its targets
                        if (source && !item.get('source') && item.get('source_asset_id')) {
                            var itemSource = editor.call('assets:get', item.get('source_asset_id'));
                            if (itemSource && itemSource.get('type') === type && itemSource.get('name').toLowerCase() === files[i].name.toLowerCase()) {
                                sourceAsset = itemSource;
                                return false;
                            }
                        }


                        if (item.get('source') === source && item.get('name').toLowerCase() === files[i].name.toLowerCase()) {
                            // we want the same type or try to replace a texture atlas with the same name if one exists
                            if (item.get('type') === type || (type === 'texture' && item.get('type') === 'textureatlas')) {
                                return true;
                            }
                        }

                        return false;
                    });

                    // candidates contains [index, asset] entries. Each entry
                    // represents an asset that could be overwritten by the uploaded asset.
                    // Use the first candidate by default (or undefined if the array is empty).
                    // If we are uploading a texture try to find a textureatlas candidate and
                    // if one exists then overwrite the textureatlas instead.
                    var asset = candidates[0];
                    if (type === 'texture') {
                        for (var j = 0; j < candidates.length; j++) {
                            if (candidates[j][1].get('type') === 'textureatlas') {
                                asset = candidates[j];
                                type = 'textureatlas';
                                break;
                            }
                        }
                    }

                    var data = null;
                    if (ext === 'js') {
                        data = {
                            order: 100,
                            scripts: {}
                        };
                    }

                    editor.call('assets:uploadFile', {
                        asset: asset ? asset[1] : sourceAsset,
                        file: files[i],
                        type: type,
                        name: files[i].name,
                        parent: editor.call('assets:panel:currentFolder'),
                        pipeline: true,
                        data: data,
                        meta: asset ? asset[1].get('meta') : null
                    }, function (err: Error, data: any) {
                        if (err || ext !== 'js') return;

                        var onceAssetLoad = function (asset: Observer) {
                            var url = asset.get('file.url');
                            if (url) {
                                editor.call('scripts:parse', asset);
                            } else {
                                asset.once('file.url:set', function () {
                                    editor.call('scripts:parse', asset);
                                });
                            }
                        };

                        var asset = editor.call('assets:get', data.id);
                        if (asset) {
                            onceAssetLoad(asset);
                        } else {
                            editor.once('assets:add[' + data.id + ']', onceAssetLoad);
                        }
                    });
                }
            }
        });



        // 上传文件或文件夹，文件上传入口
        editor.method('assets:upload:picker', function (args: any) {
            args = args || {};

            var parent = args.parent || editor.call('assets:panel:currentFolder');

            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            // fileInput.accept = '';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            fileInput.style.verticalAlign = 'middle';
            fileInput.style.textAlign = 'center';
            VeryEngine.assets.append(fileInput);

            var onChange = function () {
                editor.call('assets:upload:files', fileInput.files);
                // 上传文件以后，开始做一些处理
                // 解析.babylon文件，初步处理以后上传给服务器

                var fl = fileInput.files!.length;
                var i = 0;

                while (i < fl) {
                    // localize file var in the loop
                    var file = fileInput.files![i];
                    console.log('name: ' + file.name);
                    console.warn('type: ' + file.type);
                    console.warn('size: ' + file.size);
                    // console.warn('lastModified: ' + file.lastModified);
                    i++;
                }

                fileInput.value = '';
                fileInput.removeEventListener('change', onChange);
                fileInput.parentNode!.removeChild(fileInput);
            };

            fileInput.addEventListener('change', onChange, false);
            fileInput.click();

        });
    }

}