import { Router } from "express";

import UserController from "../controllers/user";
import { createUserValidation } from "../utils/input-validation";
import { updateUserValidation } from "../utils/input-validation";

const router = Router();
const userController = new UserController();

router.post("/create", createUserValidation, userController.createUser);
router.post("/update", updateUserValidation, userController.updateUser);
router.delete("/delete", userController.deleteUser);
router.get("/:userId", userController.getUser);

export default router;
