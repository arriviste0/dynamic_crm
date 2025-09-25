'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { Service } from '@/lib/types';

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  price: z.number().min(0, 'Price must be positive.'),
  duration: z.number().min(1, 'Duration must be at least 1 hour.'),
  status: z.enum(['Active', 'Inactive']),
  tags: z.string().optional(),
});

export async function createService(formData: FormData) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse tags
    const tags = rawFormData.tags ? (rawFormData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const validation = serviceSchema.safeParse({
      ...rawFormData,
      price: Number(rawFormData.price),
      duration: Number(rawFormData.duration),
      tags,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    const serviceData = {
      ...validation.data,
      image: 'https://picsum.photos/200/200?random=' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('services').insertOne(serviceData);

    revalidatePath('/services');
    return { success: true, message: 'Service created successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to create service.' };
  }
}

export async function getServices() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const services = await db.collection('services').find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(services));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getService(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const service = await db.collection('services').findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(service));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateService(id: string, formData: FormData) {
  try {
    if (!id) {
      return { success: false, message: 'Service ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse tags
    const tags = rawFormData.tags ? (rawFormData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const validation = serviceSchema.safeParse({
      ...rawFormData,
      price: Number(rawFormData.price),
      duration: Number(rawFormData.duration),
      tags,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    await db.collection('services').updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...validation.data, updatedAt: new Date() } }
    );

    revalidatePath('/services');
    return { success: true, message: 'Service updated successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to update service.' };
  }
}

export async function deleteService(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'Service ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    await db.collection('services').deleteOne({ _id: new ObjectId(id) });
    
    revalidatePath('/services');
    return { success: true, message: 'Service deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to delete service.' };
  }
}

