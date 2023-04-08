import cluster from "cluster";
import http from "http";
import os from "os";
import { Worker } from "worker_threads";

// cluster.schedulingPolicy = cluster.SCHED_NONE;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  // Fork workers.
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {
  // workers can share any TCP connection
  // cluster 可以实现监听端口共享
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end(`response from worker ${process.pid}`);
    })
    .listen(8090);

  console.log(`进程${process.pid}已启动`);
}
