import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import  User  from "../models/user.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"

//GENERTE ACCESS & REFRESH TOKEN
const generateRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        console.log("Something went wrong while ")
    }
}

// REGISTER USER
const register = asyncHandler(async (req, res) => {
    const { username, fullname, email, password } = req.body;

    if ([username, fullname, email, password].some((field) => !field || field.trim() == "")) {
        throw new ApiError(401, "All fields are required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (user) {
        throw new ApiError(409, "User already exists!!!");
    }

    const createNewUser = await User.create({
        username: username.toLowerCase(),
        fullname: fullname,
        email: email,
        password: password
    });

    const newUser = await User.findById(new mongoose.Types.ObjectId(createNewUser._id)).select("-password -refreshToken");

    if (!newUser) {
        throw new ApiError(401, "Unable to register user!!!");
    }

    return res.status(200).json(new ApiResponse(200, newUser, "User registered successfully"));
});



// LOGIN USER
const login = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

     console.log("REQ.BODY", req.body);
    //Find user by email or username
    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const validatePassword = await user.isPasswordCorrect(password)

    if (!validatePassword) {
        throw new ApiError(401, "Password is incorrect")
    }
    
    //Generate and recieve access & refresh token
    const { refreshToken, accessToken } = await generateRefreshToken(user._id)
    
    //Get logged user data
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options ). cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, loggedInUser, "User loggedin successfully"))

})

//LOGOUT USER
const loggout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out successfully"))
})


// REFRESH ACCESS TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
    //get refresh token from cookie or body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Couldn't find incoming refresh token")
    }

    try {
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (!decodedToken) {
            throw new ApiError(409, "Unable to decode token")
        }

        const user = await User.findById(decodedToken?._id)

          if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
          const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
        
    } catch (error) {
        console.log("Something went wrong with refreshing access token")
    }

})



export {register, login, loggout, generateRefreshToken, refreshAccessToken}