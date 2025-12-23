import mongoose from "mongoose";
import { configuration } from "../app/config/config";
import SuperAdmin from "../app/modules/superAdmin/superAdmin.model";
import { UserRole } from "../app/utils/enum/userRole";

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(configuration.mongo.url);
    console.log("DB Connected for seeding...");

    const existingSuperAdmin = await SuperAdmin.findOne({
      role: UserRole.SUPER_ADMIN,
    });

    if (existingSuperAdmin) {
      console.log("Super Admin already exists!");
      console.log("Email:", existingSuperAdmin.email);
    } else {
      const superAdmin = await SuperAdmin.create({
        name: "System Super Admin",
        email: configuration.superAdmin.email,
        password: configuration.superAdmin.password,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });
      console.log("Super Admin created successfully!");
      console.log("Email:", superAdmin.email);
    }
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seedSuperAdmin();
