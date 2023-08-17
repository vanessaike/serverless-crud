import serverless from "serverless-http";
import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/users";

const app = express();
app.use(bodyParser.json());

app.use("/users", userRoutes);
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message || "Internal server error.";
  const data = error.data;
  res.status(status).json({ message, status, data });
});

export const handler = serverless(app);
