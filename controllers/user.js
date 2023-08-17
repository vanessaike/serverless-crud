import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { throwError } from "../utils/error-handling";
import { errorHandling } from "../utils/error-handling";

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

class UserController {
  createUser = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
      // Validating inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throwError(
          "Invalid input. Check if your e-mail is valid, if your password is at least 6 characters long or if the username contains only letters.",
          400
        );
      }
      // Validating if user already exists
      const existingUser = await this.userExists(email);
      if (existingUser) {
        throwError("E-mail already exists. Please, try again.", 400);
      }
      // Creating a new user in case it doesn't exist yet
      const userId = uuidv4();
      const hashedPw = await bcrypt.hash(password, 12);
      const params = {
        TableName: USERS_TABLE,
        Item: {
          userId,
          username,
          email,
          password: hashedPw,
        },
      };

      await dynamoDbClient.put(params).promise();
      return res.status(201).json({ message: "User created successfully", userId, username, email });
    } catch (error) {
      errorHandling(error, next);
    }
  };

  getUser = async (req, res, next) => {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        userId: req.params.userId,
      },
    };

    try {
      const { Item } = await dynamoDbClient.get(params).promise();
      if (Item) {
        const { userId, username, email } = Item;
        return res.status(200).json({ userId, username, email });
      } else {
        throwError("User not found", 404);
      }
    } catch (error) {
      errorHandling(error, next);
    }
  };

  updateUser = async (req, res, next) => {
    const { userId, username, password } = req.body;
    const hashedPw = await bcrypt.hash(password, 12);
    const params = {
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
      UpdateExpression: "set username = :username, password = :password",
      ExpressionAttributeValues: {
        ":username": username,
        ":password": hashedPw,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      // Validating inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throwError(
          "Invalid input. Check if your password is at least 6 characters long or if the username contains only letters.",
          400
        );
      }
      // Update if user doesn't exist
      const data = await dynamoDbClient.update(params).promise();
      const { username, email, userId } = data.Attributes;
      return res.status(200).json({ message: "User updated successfully!", user: { userId, username, email } });
    } catch (error) {
      errorHandling(error, next);
    }
  };

  deleteUser = async (req, res, next) => {
    const { userId } = req.body;
    const params = {
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
    };

    try {
      await dynamoDbClient.delete(params).promise();
      return res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
      errorHandling(error, next);
    }
  };

  userExists = async (email) => {
    const checkUserParams = {
      TableName: USERS_TABLE,
      ProjectionExpression: "userId",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    };
    const existingUser = await dynamoDbClient.scan(checkUserParams).promise();
    if (existingUser.Items.length >= 1) return true;
  };
}

export default UserController;
