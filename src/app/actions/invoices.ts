'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { Invoice } from '@/lib/types';

const invoiceSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters.'),
  customerEmail: z.string().email('Valid email is required.'),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']),
  dueDate: z.string().min(1, 'Due date is required.'),
  notes: z.string().optional(),
  items: z.array(z.object({
    type: z.enum(['Product', 'Service']),
    name: z.string().min(2, 'Item name is required.'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1.'),
    unitPrice: z.number().min(0, 'Unit price must be positive.'),
  })).min(1, 'At least one item is required.'),
});

export async function createInvoice(formData: FormData) {
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

    const validation = invoiceSchema.safeParse({
      ...rawFormData,
      items,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    const invoiceData = {
      ...validation.data,
      invoiceNumber: `INV-${Date.now()}`,
      totalAmount,
      owner: { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('invoices').insertOne(invoiceData);

    revalidatePath('/invoices');
    return { success: true, message: 'Invoice created successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to create invoice.' };
  }
}

export async function getInvoices() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const invoices = await db.collection('invoices').find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(invoices));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getInvoice(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const invoice = await db.collection('invoices').findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(invoice));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateInvoice(id: string, formData: FormData) {
  try {
    if (!id) {
      return { success: false, message: 'Invoice ID is required.' };
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

    const validation = invoiceSchema.safeParse({
      ...rawFormData,
      items,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    await db.collection('invoices').updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...validation.data, totalAmount, updatedAt: new Date() } }
    );

    revalidatePath('/invoices');
    return { success: true, message: 'Invoice updated successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to update invoice.' };
  }
}

export async function deleteInvoice(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'Invoice ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    await db.collection('invoices').deleteOne({ _id: new ObjectId(id) });
    
    revalidatePath('/invoices');
    return { success: true, message: 'Invoice deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to delete invoice.' };
  }
}

