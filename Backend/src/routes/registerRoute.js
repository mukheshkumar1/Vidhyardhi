import express from "express";
import { deleteRegistration, getAllRegistrations, register } from "../controllers/register.controller.js";
import {isAdmin} from "../middleware/isAdmin.js";
const router = express.Router();

router.post("/", register);
router.get("/", isAdmin , getAllRegistrations);
router.delete("/:id", deleteRegistration);
export default router;