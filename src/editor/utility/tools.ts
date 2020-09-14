// import { WebRequest } from '../middleware/offline/webrequest';
import { VeryEngine } from '../../engine';
import { SHA1 } from './sha1';

export class Tools {

    public static BaseUrl = '';



    constructor() {

    }

    public static eulerAngleToRadian(val: BABYLON.Vector3): BABYLON.Vector3 {
        let para: number = Math.PI / 180;
        return val.multiplyByFloats(para, para, para);
    }

    public static radianToEulerAngle(val: BABYLON.Vector3): BABYLON.Vector3 {
        let para: number = 180 / Math.PI;
        return val.multiplyByFloats(para, para, para);
    }

    public static vector3ToArray(val: BABYLON.Vector3): number[] {
        return [val.x, val.y, val.z];
    }

    public static sha1(val: any): string {
        return SHA1.SHA1(val);
    }

    public static GetFilename(path: string): string {
        var index = path.lastIndexOf('/');
        if (index < 0) {
            return path;
        }

        return path.substring(index + 1);
    }

    public static GetFolderPath(uri: string, returnUnchangedIfNoSlash = false): string {
        var index = uri.lastIndexOf('/');
        if (index < 0) {
            if (returnUnchangedIfNoSlash) {
                return uri;
            }
            return '';
        }
        return uri.substring(0, index + 1);
    }


    // TODO
    public static Error(message: string): void {
        debug.error(message);
    }

    public static CleanUrl(url: string): string {
        url = url.replace(/#/mg, '%23');
        return url;
    }

    public static PreprocessUrl = (url: string) => {
        return url;
    }


    public static loadBabylon(): void {
        // axios.defaults.responseType = 'json';
        axios.get('scene/dude.json')
            .then(respone => {
                console.warn(typeof respone.data);
                // console.log(respone.data.toString());
                console.log(respone.data);
                // console.log(respone.data.meshes);
                // scene数据 -> mesh -> name -> babylon.meshes array -> id ？ 貌似导出的id应该是不重合的

                // 加载blue
                Tools.loadBlue(respone.data, 'scene/');

            });

        let success = (data: string | ArrayBuffer, url: string | undefined): void => {
            // console.error(data);
            // console.error(data);
            // console.error(url);
        }

        // BABYLON.Tools.LoadFile('scene/scene.babylon', success);

        // console.error('length: ' + Object.keys(BABYLON.FilesInputStore.FilesToLoad).length);
        // for (let key in BABYLON.FilesInputStore.FilesToLoad) {
        //     console.error('key: ' + key);
        //     console.error(BABYLON.FilesInputStore.FilesToLoad[key]);
        // }
    }


    public static loadBlue(data: any, rootUrl: string): void {

        // 根据ID加载资源 -> mesh -> material -> animations
        // 属性面板和Assets显示完整模型? -> container中包含模型，两边使用 -> 但是如果一边删除了模型，container中也没了

        // ?在new Mesh时，mesh已经添加到对应的scene，难办了，如何实现缓存？只实现数据的缓存？
        // 再搞一个中间结构缓存原始数据？
        // scene数据 -> .babylon数据缓存 -> model -> mesh | 几何 + material + texture -> 进行快速关联 -> 如何把texture提交进去
        // texture数据如何实现缓存，直接将数据交给engine中的数据结构？

        // Lights
        if (data.lights !== undefined && data.lights !== null) {
            for (let index = 0, cache = data.lights.length; index < cache; index++) {
                var parsedLight = data.lights[index];
                var light = BABYLON.Light.Parse(parsedLight, VeryEngine.viewScene);
                if (light) {
                    // container.lights.push(light);
                    // log += (index === 0 ? '\n\tLights:' : '');
                    // log += '\n\t\t' + light.toString(fullDetails);
                }
            }
        }

        // Animations
        if (data.animations !== undefined && data.animations !== null) {
            for (let index = 0, cache = data.animations.length; index < cache; index++) {
                var parsedAnimation = data.animations[index];
                const internalClass = BABYLON._TypeStore.GetClass('BABYLON.Animation');
                if (internalClass) {
                    let animation = internalClass.Parse(parsedAnimation);
                    VeryEngine.viewScene.animations.push(animation);
                    // container.animations.push(animation);
                    // log += (index === 0 ? '\n\tAnimations:' : '');
                    // log += '\n\t\t' + animation.toString(fullDetails);
                }
            }
        }

        // Materials
        if (data.materials !== undefined && data.materials !== null) {
            for (let index = 0, cache = data.materials.length; index < cache; index++) {
                var parsedMaterial = data.materials[index];
                var mat = BABYLON.Material.Parse(parsedMaterial, VeryEngine.viewScene, rootUrl);
                // container.materials.push(mat);
                // log += (index === 0 ? '\n\tMaterials:' : '');
                // log += '\n\t\t' + mat.toString(fullDetails);
            }
        }

        if (data.multiMaterials !== undefined && data.multiMaterials !== null) {
            for (let index = 0, cache = data.multiMaterials.length; index < cache; index++) {
                var parsedMultiMaterial = data.multiMaterials[index];
                var mmat = BABYLON.MultiMaterial.ParseMultiMaterial(parsedMultiMaterial, VeryEngine.viewScene);
                // container.multiMaterials.push(mmat);
                // log += (index === 0 ? '\n\tMultiMaterials:' : '');
                // log += '\n\t\t' + mmat.toString(fullDetails);
            }
        }

        // Skeletons
        if (data.skeletons !== undefined && data.skeletons !== null) {
            for (let index = 0, cache = data.skeletons.length; index < cache; index++) {
                var parsedSkeleton = data.skeletons[index];
                var skeleton = BABYLON.Skeleton.Parse(parsedSkeleton, VeryEngine.viewScene);
                skeleton.beginAnimation('Skeleton0', true);
                // container.skeletons.push(skeleton);
                // log += (index === 0 ? '\n\tSkeletons:' : '');
                // log += '\n\t\t' + skeleton.toString(fullDetails);
            }
        }

        // Geometries
        var geometries = data.geometries;
        if (geometries !== undefined && geometries !== null) {
            var addedGeometry = new Array<Nullable<BABYLON.Geometry>>();

            // VertexData
            var vertexData = geometries.vertexData;
            if (vertexData !== undefined && vertexData !== null) {
                for (let index = 0, cache = vertexData.length; index < cache; index++) {
                    var parsedVertexData = vertexData[index];
                    addedGeometry.push(BABYLON.Geometry.Parse(parsedVertexData, VeryEngine.viewScene, rootUrl));
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
            for (let index = 0, cache = data.meshes.length; index < cache; index++) {
                var parsedMesh = data.meshes[index];
                var mesh = <BABYLON.AbstractMesh>BABYLON.Mesh.Parse(parsedMesh, VeryEngine.viewScene, rootUrl);
                // container.meshes.push(mesh);
                // log += (index === 0 ? '\n\tMeshes:' : '');
                // log += '\n\t\t' + mesh.toString(fullDetails);
            }
        }

        // 创建之前先搞一个blob？
        // let tex = new BABYLON.Texture('scene/头像.png', VeryEngine.viewScene);
        // console.log(tex);

        console.log(VeryEngine.viewEngine._internalTexturesCache);

        // setTimeout(() => {
        //     VeryEngine.viewScene.render();
        //     BABYLON.Tools.CreateScreenshot(VeryEngine.viewEngine, VeryEngine.viewScene.activeCamera!, 1600);
        // }, 2000);
        // 信息交换

    }

    // public static LoadFile(url: string, onSuccess: (data: string | ArrayBuffer, responseURL?: string) => void, onProgress?: (data: any) => void, useArrayBuffer?: boolean, onError?: (request?: WebRequest, exception?: any) => void): IFileRequest {
    //     url = Tools.CleanUrl(url);

    //     url = Tools.PreprocessUrl(url);

    //     // 在本地缓存中存在此文件， TODO: 还有本地上传的情况处理
    //     if (url.indexOf('file:') !== -1) {
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
     * name字符串合法性检查，不允许出现 “\/*<>?|'':” 等字符串，若存在，则返回false；
     * @param name 待检查的name字符串；
     */
    public static isLegalName(name: string): boolean {
        // var re = /[^\u4e00-\u9fa5]/; // 中文正则
        // var pattern = new RegExp('[`\\-~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？12345678990]'); // 特殊符号
        const illegalPattern = /[\\\/*<>?|'':]/;
        if (illegalPattern.test(name)) {
            return false;
        } else {
            return true;
        }
    }


    /**
     * 字符串排序，特殊字符在最前头，其余按照字母顺序进行排列
     * @param a 第1个字符串；
     * @param b 第2个字符串；
     */
    public static stringCompare(a: string, b: string): number {
        a = a.toLowerCase();
        b = b.toLowerCase();
        if (a === b) {
            return 0;
        }
        // TODO: 目前采用了js默认的比较函数，由于Safari等浏览器不支持locals参数，英文默认在中文之后，特殊字符在最前
        return a.localeCompare(b);
    }


    public static appendQuery(origin: string, query: string): string {
        let separator = origin.indexOf('?') !== -1 ? '&' : '?';
        return this + separator + query;
    }

}