import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE;

export async function getUser(req, res) {
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
      return res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
}

export async function createUser(req, res) {
  const { username, email, password } = req.body;

  try {
    // Validating inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input. Check if your e-mail is valid or if your password is at least 6 characters long.",
      });
    }

    // Validating if user already exists
    const checkUserParams = {
      TableName: USERS_TABLE,
      ProjectionExpression: "userId",
      FilterExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
    };
    const existingUser = await dynamoDbClient.scan(checkUserParams).promise();
    if (existingUser.Items.length >= 1) {
      return res.status(400).json({ message: "E-mail already exists. Please, try again." });
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
    console.log(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
}

export async function deleteUser(req, res) {
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
    console.log(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
}

export async function updateUser(req, res) {
  const { userId, username, email, password } = req.body;
  const hashedPw = await bcrypt.hash(password, 12);
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId,
    },
    UpdateExpression: "set username = :username, email = :email, password = :password",
    ExpressionAttributeValues: {
      ":username": username,
      ":email": email,
      ":password": hashedPw,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    // Validating inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input. Check if your e-mail is valid or if your password is at least 6 characters long.",
      });
    }
    const data = await dynamoDbClient.update(params).promise();
    const { username, email, userId } = data.Attributes;
    return res.status(200).json({ message: "User updated successfully!", user: { userId, username, email } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
}
