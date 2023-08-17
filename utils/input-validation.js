import { body } from "express-validator";

export const createUserValidation = [
  body("username")
    .notEmpty()
    .trim()
    .matches(/^[A-Za-z\s]+$/),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

export const updateUserValidation = [
  body("username")
    .notEmpty()
    .trim()
    .matches(/^[A-Za-z\s]+$/),
  body("password").isLength({ min: 6 }),
];
