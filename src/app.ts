import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import apiInfoLogger from "./app/middlewares/apiInfoLogger";
import appRoutes from "./app/routes/router";
import notFound from "./app/middlewares/notFound";
import errorHandler from "./app/middlewares/errorHandler";

// ** express app **
const app: Application = express();

// ** parse request body **
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ** cors **
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN || "http://localhost:3000"],
    credentials: true,
  }),
);

// ** cookie parser **
app.use(cookieParser());

// ** API Info Logger **
app.use(apiInfoLogger);

// ** Default Routes **
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Server!");
});
app.get("/api", (req: Request, res: Response) => {
  res.send("This is the root API route!");
});

// ** API Routes **
app.use("/api", appRoutes);

// ** API Endpoint Not Found **
app.use("*", (req: Request, res: Response) => {
  notFound(req, res);
});

// ** Error Handler **
app.use(errorHandler);

export default app;
