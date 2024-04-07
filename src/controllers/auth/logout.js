import { Admin } from "../../models/users/admin.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const logoutUser = asyncHandler(async(req,res)=>{
    try {
        if(req.user.type === "individual"){
            await Individual.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        refreshToken: undefined,
                    }
                },
                {
                    new: true,
                }
            )
        }else if(req.user.type === "organization"){
            await Organization.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        refreshToken: undefined,
                    }
                },
                {
                    new: true,
                }
            )
        }else{
            await Admin.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        refreshToken: undefined,
                    }
                },
                {
                    new: true,
                }
            )
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new ApiResponse(200,{},"User logged out !!!"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            mesage: error?.message || "Internal Server Error"
        })
    }
})

export default logoutUser