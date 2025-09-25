'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { Ticket } from '@/lib/types';

const ticketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  customer: z.object({
    name: z.string().min(2, 'Customer name is required.'),
    email: z.string().email('Valid email is required.'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters.'),
  }),
  tags: z.string().optional(),
});

export async function createTicket(formData: FormData) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse customer object
    const customerData = {
      name: rawFormData['customer.name'] as string,
      email: rawFormData['customer.email'] as string,
      phone: rawFormData['customer.phone'] as string,
    };

    // Parse tags
    const tags = rawFormData.tags ? (rawFormData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const validation = ticketSchema.safeParse({
      ...rawFormData,
      customer: customerData,
      tags,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    const ticketData = {
      ...validation.data,
      ticketNumber: `TKT-${Date.now()}`,
      assignedTo: { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('tickets').insertOne(ticketData);

    revalidatePath('/tickets');
    return { success: true, message: 'Ticket created successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to create ticket.' };
  }
}

export async function getTickets() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const tickets = await db.collection('tickets').find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(tickets));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getTicket(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const ticket = await db.collection('tickets').findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(ticket));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateTicket(id: string, formData: FormData) {
  try {
    if (!id) {
      return { success: false, message: 'Ticket ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse customer object
    const customerData = {
      name: rawFormData['customer.name'] as string,
      email: rawFormData['customer.email'] as string,
      phone: rawFormData['customer.phone'] as string,
    };

    // Parse tags
    const tags = rawFormData.tags ? (rawFormData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const validation = ticketSchema.safeParse({
      ...rawFormData,
      customer: customerData,
      tags,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    await db.collection('tickets').updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...validation.data, updatedAt: new Date() } }
    );

    revalidatePath('/tickets');
    return { success: true, message: 'Ticket updated successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to update ticket.' };
  }
}

export async function deleteTicket(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'Ticket ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    await db.collection('tickets').deleteOne({ _id: new ObjectId(id) });
    
    revalidatePath('/tickets');
    return { success: true, message: 'Ticket deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to delete ticket.' };
  }
}
