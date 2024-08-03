import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { loggout, login, register } from "../controllers/user.controller.js";


const router = Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/login').post(verifyJWT, loggout)



export default router