const cluster = {
  isMaster: false,
  isWorker: false,
  workers: {},
  fork() {
    if (this.isMaster) {
      // 通过 child_process.fork 创建子进程
      const worker = new Worker(process.argv[1], { env: process.env });
      // 保存子进程
      this.workers[worker.pid] = worker;
      // 监听子进程退出事件
      worker.on("exit", () => {
        // 从 workers 中删除子进程
        delete this.workers[worker.pid];
        // 重新 fork - 进程守护
        this.fork();
      });
    }
  },
  setupMaster(options) {
    this.isMaster = true;
    if (options && options.exec) {
      process.argv[1] = options.exec;
    }
  },
  on(eventName, listener) {
    if (this.isMaster) {
      // 对子进程进行事件分发
      Object.values(this.workers).forEach((worker) => {
        worker.on(eventName, listener);
      });
    } else {
      // 当前worker进程监听事件
      process.on(eventName, listener);
    }
  },
  send(message, sendHandle, callback) {
    if (this.isMaster) {
      if (sendHandle) {
        // 指定发送到哪个子进程
        sendHandle.emit("message", message);
      } else {
        // 统一发送到所有子进程
        Object.values(this.workers).forEach((worker) => {
          worker.send(message, callback);
        });
      }
    } else {
      // 子进程发送消息给主进程
      process.send(message, sendHandle, callback);
    }
  },
};

class Worker {
  constructor(file, options) {
    // 使用 child_process.fork 创建子进程
    this.process = require("child_process").fork(file, [], options);
    // 获取子进程 pid
    this.pid = this.process.pid;
    // 监听进程消息事件
    this.process.on("message", (message) => {
      this.emit("message", message);
    });
  }
  // 封装子进程的 on 方法
  on(eventName, listener) {
    this.process.on(eventName, listener);
  }
  // 封装子进程的 send 方法
  send(message, callback) {
    this.process.send(message, callback);
  }
  // 封装子进程的 emit 方法 进行子进程kill
  emit(eventName, ...args) {
    if (eventName === "message") {
      if (typeof args[0] === "object" && args[0].cmd === "disconnect") {
        this.process.kill();
      }
    }
  }
}

module.exports = cluster;
