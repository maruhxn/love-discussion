import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { createChatTableSQL } from "../repository/sql.js";

dotenv.config();

async function connectDB() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  // await connection.query(dropChatTableSQL);
  await connection.query(createChatTableSQL);
  console.log("Connected to PlanetScale!");
  return connection;
}

const db = await connectDB();

export default db;
