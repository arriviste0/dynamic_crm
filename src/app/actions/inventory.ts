'use server';

import clientPromise, { getDb } from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const inventorySchema = z.object({
  sku: z.string().min(2, 'SKU must be at least 2 characters.'),
  name: z.string().min(2, 'Item name must be at least 2 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be non-negative.'),
  reorderLevel: z.number().min(0, 'Reorder level must be non-negative.'),
  unitPrice: z.number().min(0, 'Unit price must be positive.'),
  supplier: z.string().min(2, 'Supplier must be at least 2 characters.'),
  location: z.string().min(2, 'Location must be at least 2 characters.'),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued']),
  customFields: z.record(z.string(), z.any()).optional(),
});

export async function createInventoryItem(formData: FormData) {
  try {
    const db = await getDb();

    const rawFormData = Object.fromEntries(formData.entries());

    // Parse numeric fields
    const parsedData = {
      ...rawFormData,
      quantity: parseInt(rawFormData.quantity as string) || 0,
      reorderLevel: parseInt(rawFormData.reorderLevel as string) || 0,
      unitPrice: parseFloat(rawFormData.unitPrice as string) || 0,
    };

    const validation = inventorySchema.safeParse(parsedData);

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    // Extract custom fields
    const standardFields = [
      'sku', 'name', 'category', 'description', 'quantity', 'reorderLevel',
      'unitPrice', 'supplier', 'location', 'status'
    ];

    const customFieldValues: Record<string, any> = {};

    Object.keys(rawFormData).forEach(key => {
      if (!standardFields.includes(key)) {
        customFieldValues[key] = rawFormData[key];
      }
    });

    const itemData = {
      ...validation.data,
      ...customFieldValues,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('inventory').insertOne(itemData);

    revalidatePath('/inventory');
    return { success: true, message: 'Inventory item created successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to create inventory item.' };
  }
}

export async function getInventoryItems() {
  try {
    const db = await getDb();
    const items = await db.collection('inventory').find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(items));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getInventoryItem(id: string) {
  try {
    const db = await getDb();
    const item = await db.collection('inventory').findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(item));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateInventoryItem(id: string, formData: FormData) {
  try {
    const db = await getDb();

    const rawFormData = Object.fromEntries(formData.entries());

    // Parse numeric fields
    const parsedData = {
      ...rawFormData,
      quantity: parseInt(rawFormData.quantity as string) || 0,
      reorderLevel: parseInt(rawFormData.reorderLevel as string) || 0,
      unitPrice: parseFloat(rawFormData.unitPrice as string) || 0,
    };

    const validation = inventorySchema.safeParse(parsedData);

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    // Extract custom fields
    const standardFields = [
      'sku', 'name', 'category', 'description', 'quantity', 'reorderLevel',
      'unitPrice', 'supplier', 'location', 'status'
    ];

    const customFieldValues: Record<string, any> = {};

    Object.keys(rawFormData).forEach(key => {
      if (!standardFields.includes(key)) {
        customFieldValues[key] = rawFormData[key];
      }
    });

    const updateData = {
      ...validation.data,
      ...customFieldValues,
      updatedAt: new Date(),
    };

    await db.collection('inventory').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    revalidatePath('/inventory');
    return { success: true, message: 'Inventory item updated successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to update inventory item.' };
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    const db = await getDb();
    await db.collection('inventory').deleteOne({ _id: new ObjectId(id) });

    revalidatePath('/inventory');
    return { success: true, message: 'Inventory item deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to delete inventory item.' };
  }
}
