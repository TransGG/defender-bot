import IPC from "node-ipc";

interface message {
  type: string;
  payload: any;
}

type msgHandler = (msg: message) => any;

class ipcManager {
  private handlers: { [key: string]: msgHandler };
  private ipc: typeof IPC;
  //private targets: {[key:string]:IPC}
  constructor(id: string) {
    this.handlers = {};
    this.ipc = IPC;
    this.ipc.config.appspace = "transplace-defender";
    this.ipc.config.id = id;

    let msgHandler = this._handleMessage.bind(this);

    let tIpc = this.ipc;
    this.ipc.serve(() => {
      tIpc.server.on("message", msgHandler);
    });
  }

  private _handleMessage(msg: message) {
    let type = msg.type;
    if (this.handlers[type]) {
      this.handlers[type]!(msg.payload);
    }
  }

  public async send(target: string, message: message) {
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
          `Could not connect to ipc server: ${target} while attempting to deliver message: ${message}. \nError: \n${err}`
        );
        return;
      });
    }

    // dispatch message to ipc
    this.ipc.of[target]!.emit("message", message);
  }

  public addListener(type: string, handler: msgHandler) {
    if (this.handlers[type]) console.warn(`Overwrote existing ipc listener of type: ${type}`);
    this.handlers[type] = handler;
  }
}

export { ipcManager, msgHandler, message };
export default ipcManager;
