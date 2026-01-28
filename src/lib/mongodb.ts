import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

function sanitizeMongoUri(originalUri: string): string {
  try {
    const parsed = new URL(originalUri)
    parsed.search = ''
    return parsed.toString()
  } catch {
    return originalUri.replace(/\?.*$/, '')
  }
}

const uri = sanitizeMongoUri(process.env.MONGODB_URI)

if (process.env.NODE_ENV === 'development') {
  try {
    const redacted = uri.replace(/:\/\/.+@/, '://<redacted>@')
    const hasUnsupported = /disabledriverbsonsizecheck/i.test(uri)
    // eslint-disable-next-line no-console
    console.log('[MongoDB] Using sanitized URI:', redacted, 'unsupportedPresent=', hasUnsupported)
  } catch {}
}

let client: MongoClient | undefined
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    // Attach a catch to prevent unhandledRejection during dev when DNS or options fail
    globalWithMongo._mongoClientPromise = client.connect().catch(err => {
      // eslint-disable-next-line no-console
      console.error('MongoDB connection error (dev):', err)
      // Re-throw so awaiting callers receive the rejection
      throw err
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise!
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect().catch(err => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err)
    throw err
  })
}

export default clientPromise

export async function getDb(dbName?: string) {
  const clientOrDb: any = await clientPromise
  if (clientOrDb && typeof clientOrDb.db === 'function') {
    return clientOrDb.db(dbName)
  }
  return clientOrDb
}

 