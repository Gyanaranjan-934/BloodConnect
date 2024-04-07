import { User } from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from '../../utils/ApiError.js'
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Individual } from "../../models/users/user.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Admin } from "../../models/users/admin.model.js";


const changeCurrentPassword = asyncHandler(async(req, res)=>{
    try {
        const {oldPassword, newPassword} = req.body;
    
        const userType = req.user?.type;
        const userId = req.user?._id;
    
        let user = null;
    
        if(userType === "individual"){
            user = await Individual.findById(userId);
        }else if(userType === "organization"){
            user = await Organization.findById(userId);
        }else if(userType === "admin"){
            user = await Admin.findById(userId);
        }
    
        const isPasswordsCorrect = await user.isPasswordCorrect(oldPassword);
    
        if(!isPasswordsCorrect){
            throw new ApiError(400,"Invalid old password");
        }
    
        user.password = newPassword;
    
        await user.save({validateBeforeSave: true});
    
        return res.status(200).json(new ApiResponse(200,{},"Your password has been updated successfully"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            mesage: error?.message || "Internal Server Error"
        })
    }
})

export default changeCurrentPassword