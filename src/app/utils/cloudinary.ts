import { v2 as cloudinary } from "cloudinary";
import { IProductImage } from "../modules/product/product.interface";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
): Promise<IProductImage> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        },
      )
      .end(file.buffer);
  });
};
