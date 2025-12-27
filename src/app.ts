import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import apiInfoLogger from "./app/middlewares/apiInfoLogger";
import { securityHeaders } from "./app/middlewares/securityHeaders";
import appRoutes from "./app/routes/router";
import notFound from "./app/middlewares/notFound";
import errorHandler from "./app/middlewares/errorHandler";

// ** express app **
const app: Application = express();

// ** Security Headers (must be first) **
app.use(securityHeaders);

// ** parse request body **
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ** CORS - Improved configuration **
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
app.use(notFound);

// ** Error Handler **
app.use(errorHandler);

export default app;
