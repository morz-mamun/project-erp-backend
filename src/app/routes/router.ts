import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { SuperAdminRoutes } from "../modules/superAdmin/superAdmin.routes";
import { CompanyRoutes } from "../modules/company/company.routes";
import { ProductRoutes } from "../modules/product/product.routes";
import { InventoryRoutes } from "../modules/inventory/inventory.routes";
import { SalesRoutes } from "../modules/sales/sales.routes";
import { CustomerRoutes } from "../modules/customer/customer.routes";
import { RoleRequestRoutes } from "../modules/roleRequest/roleRequest.routes";
import { GlobalSettingsRoutes } from "../modules/globalSettings/globalSettings.routes";

const appRoutes = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/super-admin",
    route: SuperAdminRoutes,
  },
  {
    path: "/global-settings",
    route: GlobalSettingsRoutes,
  },
  {
    path: "/companies",
    route: CompanyRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/inventory",
    route: InventoryRoutes,
  },
  {
    path: "/sales",
    route: SalesRoutes,
  },
  {
    path: "/customers",
    route: CustomerRoutes,
  },
  {
    path: "/role-requests",
    route: RoleRequestRoutes,
  },
];

moduleRoutes.forEach((route) => appRoutes.use(route?.path, route?.route));

export default appRoutes;
