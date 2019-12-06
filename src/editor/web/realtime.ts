import { EventProxy } from "../utility";
import { EntityLoad } from "../entity";

export class Realtime {

  private load: EntityLoad = new EntityLoad();

  public constructor() {

    let self = this;

    let ep = EventProxy.create();
    ep.all('settings', ['assets', 'scenes'], (data1: any, data2: any, data3: any) => {
      console.log(data1);
      console.log(data2);
      // console.error(data2["data"]["18818365"]["data"]["aoMapTiling"][0]);
      console.log(data3);
    });

    ep.bind('ok', (msg: any) => {
      console.warn('ok');
      console.warn(msg);
    });

    axios.get('/api/settings')
      .then(response => {
        // console.log('response: ' + response.data);
        ep.emit('settings', response.data);
      })
      .catch(error => {
        console.error(error);
      }

      );

    axios.get('/api/assets')
      .then(response => {
        // console.log('response: ' + response.data);
        ep.emit('assets', response.data);
        // 解析

      })
      .catch(
        error => {
          console.error(error);
        }
      );

    axios.get('/api/scenes')
      .then(response => {
        // console.log('response: ' + response.data);
        ep.emit('scenes', response.data);
        self.getScene(response.data.data.scenes[0].id);
        
      })
      .catch(error => {
        console.error(error);
      }

      );

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


  public getScene(id: string): void {
    let self = this;
    axios.post("/api/getScene", { scene: id })
      .then(response => {
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
      .catch(error => {
        console.error(error);
      })
  }


}