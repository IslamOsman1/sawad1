import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'sawad';
const SETTINGS_ID = 'app-settings';

let clientPromise;
let seededPromise;

function usingMongo() {
  return Boolean(MONGODB_URI);
}

function sanitizeDocument(document) {
  if (!document || typeof document !== 'object') return document;
  const { _id, ...rest } = document;
  return rest;
}

function sanitizeArray(items = []) {
  return items.map((item) => sanitizeDocument(item));
}

async function readJsonFile() {
  const raw = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(raw);
}

async function getClient() {
  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}

async function getDatabase() {
  const client = await getClient();
  return client.db(MONGODB_DB_NAME);
}

async function seedMongoIfNeeded() {
  if (!usingMongo()) return;
  if (!seededPromise) {
    seededPromise = (async () => {
      const database = await getDatabase();
      const productsCount = await database.collection('products').countDocuments();

      if (productsCount > 0) return;

      const json = await readJsonFile();

      if (Array.isArray(json.products) && json.products.length) {
        await database
          .collection('products')
          .insertMany(json.products.map((item) => sanitizeDocument(item)));
      }

      if (Array.isArray(json.orders) && json.orders.length) {
        await database
          .collection('orders')
          .insertMany(json.orders.map((item) => sanitizeDocument(item)));
      }

      if (Array.isArray(json.customers) && json.customers.length) {
        await database
          .collection('customers')
          .insertMany(json.customers.map((item) => sanitizeDocument(item)));
      }

      if (Array.isArray(json.walletTopups) && json.walletTopups.length) {
        await database
          .collection('walletTopups')
          .insertMany(json.walletTopups.map((item) => sanitizeDocument(item)));
      }

      const walletEntries = Object.entries(json.wallets || {}).map(([id, balance]) => ({
        _id: id,
        balance: Number(balance || 0),
      }));

      if (walletEntries.length) {
        await database.collection('wallets').insertMany(walletEntries);
      }

      if (json.settings && Object.keys(json.settings).length) {
        await database.collection('settings').insertOne({
          _id: SETTINGS_ID,
          ...sanitizeDocument(json.settings),
        });
      }
    })();
  }

  await seededPromise;
}

async function readMongo() {
  await seedMongoIfNeeded();

  const database = await getDatabase();
  const [products, orders, customers, walletTopups, walletDocs, settingsDoc] =
    await Promise.all([
      database.collection('products').find({}).toArray(),
      database.collection('orders').find({}).toArray(),
      database.collection('customers').find({}).toArray(),
      database.collection('walletTopups').find({}).toArray(),
      database.collection('wallets').find({}).toArray(),
      database.collection('settings').findOne({ _id: SETTINGS_ID }),
    ]);

  return {
    products: sanitizeArray(products),
    orders: sanitizeArray(orders),
    customers: sanitizeArray(customers),
    walletTopups: sanitizeArray(walletTopups),
    wallets: walletDocs.reduce((accumulator, wallet) => {
      accumulator[String(wallet._id)] = Number(wallet.balance || 0);
      return accumulator;
    }, {}),
    settings: settingsDoc ? sanitizeDocument(settingsDoc) : {},
  };
}

async function replaceCollection(collection, items = []) {
  await collection.deleteMany({});
  if (!items.length) return;
  await collection.insertMany(items.map((item) => sanitizeDocument(item)));
}

async function writeMongo(data) {
  await seedMongoIfNeeded();

  const database = await getDatabase();

  await Promise.all([
    replaceCollection(database.collection('products'), data.products || []),
    replaceCollection(database.collection('orders'), data.orders || []),
    replaceCollection(database.collection('customers'), data.customers || []),
    replaceCollection(database.collection('walletTopups'), data.walletTopups || []),
    (async () => {
      const wallets = Object.entries(data.wallets || {}).map(([id, balance]) => ({
        _id: id,
        balance: Number(balance || 0),
      }));
      await database.collection('wallets').deleteMany({});
      if (wallets.length) {
        await database.collection('wallets').insertMany(wallets);
      }
    })(),
    database.collection('settings').replaceOne(
      { _id: SETTINGS_ID },
      { _id: SETTINGS_ID, ...(data.settings || {}) },
      { upsert: true }
    ),
  ]);

  return data;
}

export async function readDB() {
  if (!usingMongo()) {
    return readJsonFile();
  }

  return readMongo();
}

export async function writeDB(data) {
  if (!usingMongo()) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
    return data;
  }

  return writeMongo(data);
}

export async function getStorageMeta() {
  if (!usingMongo()) {
    return { driver: 'json', database: 'local-file' };
  }

  await seedMongoIfNeeded();
  return { driver: 'mongodb', database: MONGODB_DB_NAME };
}
