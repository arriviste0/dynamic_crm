'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { Quote } from '@/lib/types';

const quoteSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters.'),
  customerEmail: z.string().email('Valid email is required.'),
  status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']),
  validUntil: z.string().min(1, 'Valid until date is required.'),
  notes: z.string().optional(),
  items: z.array(z.object({
    type: z.enum(['Product', 'Service']),
    name: z.string().min(2, 'Item name is required.'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1.'),
    unitPrice: z.number().min(0, 'Unit price must be positive.'),
  })).min(1, 'At least one item is required.'),
});

export async function createQuote(formData: FormData) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse items array
    const items = [];
    let itemIndex = 0;
    while (rawFormData[`items.${itemIndex}.name`]) {
      items.push({
        id: `item-${itemIndex}`,
        type: rawFormData[`items.${itemIndex}.type`] as 'Product' | 'Service',
        name: rawFormData[`items.${itemIndex}.name`] as string,
        description: rawFormData[`items.${itemIndex}.description`] as string || '',
        quantity: Number(rawFormData[`items.${itemIndex}.quantity`]),
        unitPrice: Number(rawFormData[`items.${itemIndex}.unitPrice`]),
        total: Number(rawFormData[`items.${itemIndex}.quantity`]) * Number(rawFormData[`items.${itemIndex}.unitPrice`]),
      });
      itemIndex++;
    }

    const validation = quoteSchema.safeParse({
      ...rawFormData,
      items,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    const quoteData = {
      ...validation.data,
      quoteNumber: `QUO-${Date.now()}`,
      totalAmount,
      owner: { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('quotes').insertOne(quoteData);

    revalidatePath('/quotes');
    return { success: true, message: 'Quote created successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to create quote.' };
  }
}

export async function getQuotes() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const quotes = await db.collection('quotes').find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(quotes));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getQuote(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const quote = await db.collection('quotes').findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(quote));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateQuote(id: string, formData: FormData) {
  try {
    if (!id) {
      return { success: false, message: 'Quote ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse items array
    const items = [];
    let itemIndex = 0;
    while (rawFormData[`items.${itemIndex}.name`]) {
      items.push({
        id: `item-${itemIndex}`,
        type: rawFormData[`items.${itemIndex}.type`] as 'Product' | 'Service',
        name: rawFormData[`items.${itemIndex}.name`] as string,
        description: rawFormData[`items.${itemIndex}.description`] as string || '',
        quantity: Number(rawFormData[`items.${itemIndex}.quantity`]),
        unitPrice: Number(rawFormData[`items.${itemIndex}.unitPrice`]),
        total: Number(rawFormData[`items.${itemIndex}.quantity`]) * Number(rawFormData[`items.${itemIndex}.unitPrice`]),
      });
      itemIndex++;
    }

    const validation = quoteSchema.safeParse({
      ...rawFormData,
      items,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    await db.collection('quotes').updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...validation.data, totalAmount, updatedAt: new Date() } }
    );

    revalidatePath('/quotes');
    return { success: true, message: 'Quote updated successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to update quote.' };
  }
}

export async function deleteQuote(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'Quote ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    await db.collection('quotes').deleteOne({ _id: new ObjectId(id) });
    
    revalidatePath('/quotes');
    return { success: true, message: 'Quote deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to delete quote.' };
  }
}
