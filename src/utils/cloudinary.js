import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { logger } from "../index.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        } else {
            const response = await cloudinary.uploader.upload(
                localFilePath,
                {
                    resource_type: "auto",
                },
                (error, result) => {
                    if(error){
                        logger.error(`Error in uploading file: ${error}`);
                    }
                    if(result){
                        logger.info(`File uploaded successfully: ${result}`);
                    }
                },
            );
            await fs.promises.unlink(localFilePath);
            logger.info(`Successfully uploaded and deleted file: ${localFilePath}`);
            return response;
        }
    } catch (error) {
        try {
            await fs.promises.unlink(localFilePath); // Ensure the local file is deleted even if the upload fails
            logger.info(`Successfully deleted file after upload failure: ${localFilePath}`);
        } catch (unlinkError) {
            logger.error(`Error deleting file after upload failure: ${unlinkError}`);
        }
        logger.error(`Error in uploading file: ${error}`);
        return null;
    }
};

function getPublicIdFromUrl(url) {
    const matches = url.match(/\/v\d+\/([^/]+)\.\w+$/);
    if (matches && matches[1]) {
        return matches[1];
    }
    return null;
}

const deleteOnCloudinary = async (filePath) => {
    try {
        const publicId = getPublicIdFromUrl(filePath);
        // Assuming cloudinary is properly configured somewhere in your code.
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });
        if (response.result === "ok") {
            logger.info("File deleted successfully", response);
            return response;
        } else {
            logger.error("File deletion failed. Cloudinary response:", response);
            return null;
        }
    } catch (error) {
        // Handle specific errors or log the general error.
        if (error.http_code === 404) {
            logger.info("File not found on Cloudinary");
        } else {
            logger.error("Error deleting file on Cloudinary", error);
        }
        return null;
    }
};
// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) { console.log(result); });

export { uploadOnCloudinary, deleteOnCloudinary };
