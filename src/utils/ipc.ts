import IPC from "node-ipc";
import Randomstring from "randomstring";

type msgHandler = (msg: message, reply?: (msg: message) => any) => any;

interface message {
  type: string;
  payload: any;
}

type ipcMessage = ipcMessageQueryReply | ipcMessageQuery | ipcMessageMsg;

interface ipcMessageQueryReply extends ipcMessageBase {
  msgType: "query-reply";
  id: string;
}

interface ipcMessageQuery extends ipcMessageBase {
  msgType: "query";
  id: string;
}

interface ipcMessageMsg extends ipcMessageBase {
  msgType: "message";
}

interface ipcMessageBase {
  source: string;
  msgType: "query" | "query-reply" | "message";
  message: message;
}

class ipcManager {
  private handlers: { [key: string]: msgHandler };
  private ipc: typeof IPC;
  private keepalive: NodeJS.Timer;
  private awaitingReply: { [key: string]: { res: Function; timeout: NodeJS.Timer } };
  public id: string;
  constructor(id: string) {
    this.id = id;
    this.keepalive = setInterval(() => {}, 1 << 30);
    this.handlers = {};
    this.ipc = IPC;
    this.ipc.config.appspace = "transplace-defender:";
    this.ipc.config.id = id;
    this.ipc.config.silent = true;
    this.awaitingReply = {};

    let msgHandler = this._handleMessage.bind(this);

    let tIpc = this.ipc;

    this.ipc.serve(() => {
      tIpc.server.on("message", msgHandler);
    });
    this.ipc.server.start();
  }

  private _handleMessage(ipcPayload: ipcMessage) {
    if (ipcPayload.msgType == "message") {
      let msg = ipcPayload.message;
      let type = msg.type;
      if (this.handlers[type]) {
        this.handlers[type]!(msg.payload);
      }
      return;
    }
    if (ipcPayload.msgType == "query") {
      let msg = ipcPayload.message;
      let type = msg.type;
      if (this.handlers[type]) {
        let wrapper: { target: string; id: string; ipc: ipcManager } = {
          target: ipcPayload.source,
          id: ipcPayload.id,
          ipc: this,
        };

        function fn(this: typeof wrapper, msg: message) {
          let payload: ipcMessage = {
            source: this.ipc.id,
            msgType: "query-reply",
            id: this.id,
            message: msg,
          };
          this.ipc.dispatch(this.target, payload);
        }

        let boundfn = fn.bind(wrapper);

        this.handlers[ipcPayload.message.type]!(msg, boundfn);
      }
      return;
    }
    if (ipcPayload.msgType == "query-reply") {
      if (this.awaitingReply[ipcPayload.id]) {
        clearTimeout(this.awaitingReply[ipcPayload.id]!.timeout);
        this.awaitingReply[ipcPayload.id]!.res(ipcPayload.message);
      }
      return;
    }
  }

  public close() {
    clearInterval(this.keepalive);
  }

  public async query(target: string, message: message, timeout?: number): Promise<message | undefined> {
    let fn = (res: Function) => {
      let id = Randomstring.generate(32);

      if (!timeout || timeout < 1000) {
        timeout = 1000;
      }

      let timeoutFn = function (this: ipcManager) {
        delete this.awaitingReply[id];
        res(false);
      };

      this.awaitingReply[id] = { res: res, timeout: setTimeout(timeoutFn.bind(this), timeout) };

      let ipcPayload: ipcMessage = {
        source: this.id,
        msgType: "query",
        message: message,
        id: id,
      };

      this.dispatch(target, ipcPayload);
    };

    return new Promise(fn.bind(this));
  }

  private async dispatch(target: string, ipcPayload: ipcMessage) {
    if (!this.ipc.of[target]) {
      // connect to ipc server
      let tIpc = this.ipc;
      await new Promise<void>((res, rej) => {
        let timeout = setTimeout(() => {
          rej("timed out");
        }, 2000);

        tIpc.connectTo(target, () => {
          clearTimeout(timeout);
          res();
        });
      }).catch((err) => {
        console.error(
          `Could not connect to ipc server: ${target} while attempting to deliver message: ${ipcPayload}. \nError: \n${err}`
        );
        return;
      });
    }

    // dispatch message to ipc
    this.ipc.of[target]!.emit("message", ipcPayload);
  }

  public async send(target: string, message: message) {
    let ipcpayload: ipcMessage = { message: message, msgType: "message", source: this.id };
    this.dispatch(target, ipcpayload);
  }

  public addListener(type: string, handler: msgHandler) {
    if (this.handlers[type]) console.warn(`Overwrote existing ipc listener of type: ${type}`);
    this.handlers[type] = handler;
  }
}

export { ipcManager, msgHandler, message };
export default ipcManager;
