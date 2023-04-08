const iter = (window, callback) => {
  for (const prop in window) {
    if (window.hasOwnProperty(prop)) {
      callback(prop);
    }
  }
};
class SnapshotSandbox {
  constructor() {
    this.proxy = window;
    this.modifyProps = {};
  }
  // 激活沙箱
  active() {
    this.snapShot = {};
    iter(window, (prop) => {
      // 创建当前 window 的 snapShot
      this.snapShot[prop] = window[prop];
    });
    Object.keys(this.modifyProps).forEach((p) => {
      // 还原变更
      window[p] = this.modifyProps[p];
    });
  }
  // 退出沙箱
  inactive() {
    iter(window, (prop) => {
      if (this.snapShot[prop] !== window[prop]) {
        // 记录变更
        this.modifyProps[prop] = window[prop];
        // 还原window
        window[prop] = this.snapShot[prop];
      }
    });
  }
}

const sandbox = new SnapshotSandbox();
((window) => {
  // 激活沙箱
  //   debugger
  sandbox.active();
  window.sex = "男";
  window.age = "22";
  console.log(window.sex, window.age);
  // 退出沙箱
  sandbox.inactive();
  console.log(window.sex, window.age);
  // 激活沙箱
  sandbox.active();
  console.log(window.sex, window.age);
})(sandbox.proxy);
