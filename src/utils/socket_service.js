/*
* 服务端与客户端约定通信字段
* {
*   action:         'getData' || 'fullScreen' || 'changeTheme',
*   dataType:       'sellerData...',
*   chartName:      'seller...',
*   actionValue:    'true || false || chalk || vintage',
* }
* */

export default class WebSocketService{
    /*
    * 单例设计模式
    * */
    // 实例
    static instance=null;
    static get Instance(){
        if(!this.instance){
            this.instance=new WebSocketService();
        }
        return this.instance;
    }

    // 连接服务端的WebSocket对象
    ws=null;

    // 存储客户端注册的回调函数
    callBackStorage={};

    // 注册回调函数
    registerCallBack(dataType,callBack){
        this.callBackStorage[dataType]=callBack;
    }
    // 注消回调函数
    unRegisterCallBack(dataType,callBack){
        this.callBackStorage[dataType]=null;
    }

    // 标识是否连接成功
    connected=false;
    // 记录重新发送数据的次数
    sendRetryCount=0;
    // 记录尝试重新连接的次数
    connectRetryCount=0;

    // 定义向客户端发送数据的方法
    send(data){
        if(this.connected){
            // 重置重新发送数据的次数
            this.sendRetryCount=0;
            this.ws.send(JSON.stringify(data));
        }else{
            // 累加重新发送数据的次数
            this.sendRetryCount++;
            // 尝试重新发送数据
            setTimeout(()=>{
                this.send(data);
            },this.sendRetryCount*500);
        }
    }

    // 定义连接服务端的方法
    connect(){
        if(!window.WebSocket){
            return console.log('当前浏览器不支持WebSocket!');
        }
        // this.ws=new WebSocket('ws://localhost:9999');
        this.ws=new WebSocket('ws://47.103.216.204:9999');
        // 连接成功
        this.ws.addEventListener('open',()=>{
            console.log('连接服务端成功...');
            // 改变连接状态
            this.connected=true;
            // 重置重新连接的次数
            this.connectRetryCount=0;
        });
        // 连接失败
        this.ws.addEventListener('close',()=>{
            console.log('连接服务端失败...');
            // 改变连接状态
            this.connected=false;
            // 累加重新连接的次数
            this.connectRetryCount++;
            // 尝试重新连接服务端
            setTimeout(()=>{
                this.connect();
            },this.connectRetryCount*500);
        });
        // 获取服务端返回的数据
        this.ws.addEventListener('message',msg=>{
            const returnData=JSON.parse(msg.data);
            const dataType=returnData.dataType;
            // 按照约定的通信字段进行分析
            if(this.callBackStorage[dataType]){
                const action=returnData.action;
                switch(action){
                    case 'getData':
                        const realData=JSON.parse(returnData.data);
                        this.callBackStorage[dataType].call(this,realData);
                        break;
                    case 'fullScreen':
                        this.callBackStorage[dataType].call(this,returnData);
                        break;
                    case 'changeTheme':
                        this.callBackStorage[dataType].call(this,returnData);
                        break;
                }
            }
        });
    }
}