'use server';

import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { CustomField } from '@/lib/types';

export async function getCustomFields(module?: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('customFields');

    let query = module ? { module } : {};
    const fields = await collection.find(query).toArray();
    
    // Serialize MongoDB documents to plain objects
    const serializedFields = fields.map(field => ({
      _id: field._id.toString(),
      name: field.name,
      type: field.type,
      module: field.module,
      label: field.label || field.name,
      order: field.order || 0,
      createdAt: field.createdAt.toISOString(),
      updatedAt: field.updatedAt.toISOString()
    }));
    
    return { success: true, data: serializedFields };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createCustomField(data: Partial<CustomField>) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('customFields');

    // Check if field already exists
    const existing = await collection.findOne({ 
      name: data.name,
      module: data.module 
    });

    if (existing) {
      return { success: false, message: 'Custom field with this name already exists for this module' };
    }

    // Remove any existing _id from the data
    const { _id, ...dataWithoutId } = data;
    
    const doc = {
      ...dataWithoutId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(doc);

    // Return serialized result
    const serializedResult = {
      _id: result.insertedId.toString(),
      ...dataWithoutId,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    };

    return { success: true, data: serializedResult };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateCustomField(id: string, data: Partial<CustomField>) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('customFields');

    // Convert string ID to ObjectId
    const objectId = new ObjectId(id);

    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: {
          ...data,
          updatedAt: new Date()
        }
      }
    );

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteCustomField(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('customFields');

    // Convert string ID to ObjectId
    const objectId = new ObjectId(id);

    const result = await collection.deleteOne({ _id: objectId });
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
