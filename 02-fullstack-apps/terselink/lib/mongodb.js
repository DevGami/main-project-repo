import { MongoClient } from 'mongodb'

const databaseName = process.env.MONGODB_DB || 'bitlinks'
const collectionName = 'url'

function createClientPromise() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI is not configured')
  }

  return new MongoClient(uri).connect()
}

export function getMongoClient() {
  if (process.env.NODE_ENV === 'development') {
    if (!global._terseLinkMongoClientPromise) {
      global._terseLinkMongoClientPromise = createClientPromise()
    }

    return global._terseLinkMongoClientPromise
  }

  if (!global._terseLinkMongoClientPromise) {
    global._terseLinkMongoClientPromise = createClientPromise()
  }

  return global._terseLinkMongoClientPromise
}

export async function getLinksCollection() {
  const client = await getMongoClient()
  const collection = client.db(databaseName).collection(collectionName)

  if (!global._terseLinkIndexPromise) {
    global._terseLinkIndexPromise = collection.createIndex(
      { shorturl: 1 },
      { unique: true, name: 'shorturl_unique' }
    )
  }

  await global._terseLinkIndexPromise
  return collection
}
