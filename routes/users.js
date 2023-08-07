import { Router } from "express";
import * as userController from "../controllers/user";

const router = Router();

router.post("/create", userController.createUser);
router.get("/:userId", userController.getUser);

export default router;
