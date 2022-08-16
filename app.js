const express = require("express");
const cors = require("cors");

//MongoDB mongoose
const mongoose = require("mongoose");
//Using Cluster module for scalability
const cluster = require("cluster");
const os = require("os");

const port = process.env.PORT || 3051;

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
    exposedHeaders: "Set-Cookie",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const cpuNum = os.cpus().length;

app.get("/", (req, res) => {
  res.send("Hello World");
  //kill this filthy worker
  cluster.worker.kill();
});

app.use("/api", require("./routes/router"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//NodeJS Cluster
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
