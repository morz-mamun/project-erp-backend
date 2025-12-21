import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";

const appRoutes = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
];

moduleRoutes.forEach((route) => appRoutes.use(route?.path, route?.route));

export default appRoutes;
