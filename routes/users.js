import { Router } from "express";
import { body } from "express-validator";
import * as userController from "../controllers/user";

const router = Router();

const validation = [
  body("username").notEmpty().trim().matches(/^[A-Za-z\s]+$/),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

router.post("/create", validation, userController.createUser);
router.post("/update", validation, userController.updateUser);
router.delete("/delete", userController.deleteUser);
router.get("/:userId", userController.getUser);

export default router;
