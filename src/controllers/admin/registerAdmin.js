import { Admin } from "../../models/users/admin.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendEmail } from "../../utils/nodemailer.js";
import { rediesClient } from "../../utils/redies.js";
import { logger } from "../../index.js";

export const registerAdmin = asyncHandler(async (req, res) => {
    try {
        const { name, email, adminId, password, phone } = req.body;

        if (!name || !email || !adminId || !password || !phone) {
            throw new ApiError(400, "All fields are required");
        }

        const existingAdmin = await Admin.findOne({
            email,
        });

        if (existingAdmin) {
            throw new ApiError(409, "User with this email already exists");
        }

        const user = await Admin.create({
            name,
            email,
            password,
            phone,
            adminId,
        });

        const emailSubject = "Admin Registration";
        const emailText = `Hii ${name}, You have successfully registered as an admin`;
        const bodyHTML = `
            <div style="font-family: Arial, sans-serif;">
                <h1 style="font-size: 24px; color: black; font-weight: bold;">Admin Registration</h1>
                <p style="font-size: 16px; color: black; font-weight: bold;">You have successfully registered as an admin</p>
                <p style="font-size: 16px; color: black; font-weight: bold;">Please login with your email and password to access the application</p>
                <div>
                        <p style="font-size: 16px; color: black; font-weight: bold;">Email : <span style="color:green;">${email}</span></p>
                        <p style="font-size: 16px; color: black; font-weight: bold;">Password : <span style="color:green;">${password}</span></p>
                </div>
                <p style="font-size: 16px; color: red; font-weight: bold;">Thank you for your cooperation.</p>

                <p>If you have any questions, feel free to contact us at <a href="mailto:gyanaranjansahoo509@gmail.com">gyanaranjansahoo509@gmail.com</a></p>
            </div>
        `;

        res.status(201).json(
            new ApiResponse(201, user, "User created successfully")
        );

        sendEmail(email, emailSubject, emailText, bodyHTML);
    } catch (error) {
        logger.error(`Error in registering admin: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const loginAdmin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw new ApiError(400, "Invalid email or password");
        }
        const isPasswordCorrect = await admin.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid email or password");
        }

        const cachedAccessToken = await rediesClient.get(String(admin._id));
        
        if (cachedAccessToken) {
            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        user: admin,
                        accessToken: cachedAccessToken,
                        refreshToken: admin.refreshToken,
                    },
                    "Admin logged in successfully"
                )
            );
        }

        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save();

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    user: admin,
                    accessToken,
                    refreshToken,
                },
                "Admin logged in successfully"
            )
        );

        const emailSubject = "Admin Login";
        const emailText = `Hii ${admin.name}, You have successfully logged in as an admin`;
        const bodyHTML = `
            <div style="font-family: Arial, sans-serif;">
                <h1 style="font-size: 24px; color: black; font-weight: bold;">Admin Login</h1>
                <p style="font-size: 16px; color: black; font-weight: bold;">You have successfully logged in as an admin</p>
                <p style="font-size: 16px; color: black; font-weight: bold;">Thank you for your cooperation.</p>
                <p>If you have not logged in yourself, please report us at <a href="mailto:gyanaranjansahoo509@gmail.com">gyanaranjansahoo509@gmail.com</a></p>
            </div>
        `;
        
        await rediesClient.setEx(String(admin._id), 30000, accessToken);

        sendEmail(email, emailSubject, emailText, bodyHTML);

    
    } catch (error) {
        logger.error(`Error in registering admin: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});


export const getAdminDashboard = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const admin = await Admin.findById(userId).select("-password -refreshToken -__v");
        if (!admin) {
            throw new ApiError(404, "Admin not found");
        }
        return res.status(200).json(
            new ApiResponse(
                200,
                admin,
                "Admin logged in successfully"
            )
        );
    } catch (error) {
        logger.error(`Error in getting admin dashboard: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});