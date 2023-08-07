import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

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
      const { userId, name, email } = Item;
      return res.status(200).json({ userId, name, email });
    } else {
      return res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
}

export async function createUser(req, res) {
  const { name, email, password } = req.body;
  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: uuidv4(),
      name,
      email,
      password,
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    return res.status(201).json({ message: "User created successfully", name, email });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong!" });
  }
}
