import serverless from "serverless-http";
import express from "express";
import bodyParser from "body-parser";
import router from "./routes/users";

const app = express();
app.use(bodyParser.json());

app.use("/users", router);

export const handler = serverless(app);
