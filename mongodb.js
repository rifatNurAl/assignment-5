import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set in .env");

const DB_NAME = process.env.DB_NAME || "test";

let client;
let db;

async function getDb() {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(DB_NAME);

  // indexes (recommended)
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("data").createIndex({ id: 1 }, { unique: true });

  return db;
}

const logonUsers = new Map();

const findUser = async (username) => {
  const database = await getDb();
  return database.collection("users").find({ username }).toArray();
};

const getAllData = async () => {
  const database = await getDb();
  return database.collection("data").find({}).toArray();
};

const getDataById = async (id) => {
  const database = await getDb();
  const idNum = Number(id);

  const filter =
    Number.isNaN(idNum) ? { id } : { $or: [{ id }, { id: idNum }] };

  const doc = await database.collection("data").findOne(filter);
  return doc ? [doc] : [];
};

const addData = async ({ id, Firstname, Surname, userid }) => {
  const database = await getDb();
  const doc = { id, Firstname, Surname, userid };
  const res = await database.collection("data").insertOne(doc);
  return res.acknowledged;
};

const updateData = async (id, data) => {
  const database = await getDb();
  const idNum = Number(id);

  const filter =
    Number.isNaN(idNum) ? { id } : { $or: [{ id }, { id: idNum }] };

  const update = {
    $set: {
      Firstname: data.Firstname,
      Surname: data.Surname,

      first_name: data.Firstname,
      surname: data.Surname,
    },
  };

  const res = await database.collection("data").updateOne(filter, update);
  return res.matchedCount > 0;
};

const deleteData = async (id) => {
  const database = await getDb();
  const idNum = Number(id);

  const filter =
    Number.isNaN(idNum) ? { id } : { $or: [{ id }, { id: idNum }] };

  const res = await database.collection("data").deleteOne(filter);
  return res.deletedCount > 0;
};

const runProcedure = async () => {
  const database = await getDb();
  const firstUser = await database
    .collection("users")
    .find({})
    .sort({ username: 1 })
    .limit(1)
    .next();
  return firstUser;
};

export {
  addData,
  findUser,
  getAllData,
  getDataById,
  logonUsers,
  updateData,
  deleteData,
  runProcedure,
};
