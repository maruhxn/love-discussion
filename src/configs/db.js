import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { createChatTableSQL } from "../repository/init.js";

dotenv.config();

async function connectDB() {
  const connection = await mysql.createConnection(
    process.env.NODE_ENV === "production"
      ? process.env.MAIN_DATABASE_URL
      : process.env.NODE_ENV === "development"
      ? process.env.DEV_DATABASE_URL
      : process.env.TEST_DATABASE_URL
  );
  await connection.query(createChatTableSQL);
  console.log("Connected to DB!");
  return connection;
}

const db = await connectDB();

export default db;
