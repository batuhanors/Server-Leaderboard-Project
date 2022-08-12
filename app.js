const express = require("express");
//Redis nodejs client init
const Redis = require("ioredis");
//MongoDB extension mongoose init
const mongoose = require("mongoose");
//Using Cluster module for multi-threaded performance
const cluster = require("cluster");
const os = require("os");

const port = process.env.PORT || 3051;
const redis = new Redis({
  host: "localhost",
  port: 6379,
});
const app = express();

const cpuNum = os.cpus().length;

app.get("/", (req, res) => {
  res.send("Hello World");
  //kill this filthy worker
  cluster.worker.kill();
});

if (cluster.isMaster) {
  for (let i = 0; i < cpuNum; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} met his maker...`);
    //replacing another worker with the deceased one
    cluster.fork();
  });
} else {
  //Connecting to the MongoDB ATLAS
  mongoose
    .connect(
      "mongodb+srv://batuhanors:M7nHUx1O0bWQ6cfH@cluster0.wy8t7za.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("Connection to the database is successful!"))
    .catch((err) => console.log(err));

  app.listen(port, () => {
    console.log(`The server has started on http://localhost:${port}`);
  });
}
