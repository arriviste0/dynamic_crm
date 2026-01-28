'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { Contact } from '@/lib/types';

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters.'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters.'),
  company: z.string().min(2, 'Company must be at least 2 characters.'),
  department: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }),
  status: z.enum(['Active', 'Inactive', 'Lead', 'Customer']),
  notes: z.string().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});

export async function createContact(formData: FormData) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse address object
    const addressData = {
      street: rawFormData['address.street'] as string || '',
      city: rawFormData['address.city'] as string || '',
      state: rawFormData['address.state'] as string || '',
      zipCode: rawFormData['address.zipCode'] as string || '',
      country: rawFormData['address.country'] as string || '',
    };

    const validation = contactSchema.safeParse({
      ...rawFormData,
      address: addressData,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    // Extract custom fields from form data
    const standardFields = [
      'firstName', 'lastName', 'email', 'phone', 'jobTitle', 'company', 'department',
      'address.street', 'address.city', 'address.state', 'address.zipCode', 'address.country',
      'status', 'notes'
    ];
    
    const customFieldValues: Record<string, any> = {};
    
    Object.keys(rawFormData).forEach(key => {
      if (!standardFields.includes(key) && !key.startsWith('address.')) {
        customFieldValues[key] = rawFormData[key];
      }
    });

    const contactData = {
      ...validation.data,
      ...customFieldValues, // Spread custom fields as top-level fields
      owner: { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1' },
      avatar: `https://picsum.photos/80/80?random=${Math.floor(Math.random() * 100)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('contacts').insertOne(contactData);

    revalidatePath('/contacts');
    return { success: true, message: 'Contact created successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to create contact.' };
  }
}

export async function getContacts() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const contacts = await db.collection('contacts').find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(contacts));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getContact(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const contact = await db.collection('contacts').findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(contact));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateContact(id: string, formData: FormData) {
  try {
    if (!id) {
      return { success: false, message: 'Contact ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse address object
    const addressData = {
      street: rawFormData['address.street'] as string || '',
      city: rawFormData['address.city'] as string || '',
      state: rawFormData['address.state'] as string || '',
      zipCode: rawFormData['address.zipCode'] as string || '',
      country: rawFormData['address.country'] as string || '',
    };

    const validation = contactSchema.safeParse({
      ...rawFormData,
      address: addressData,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    // Extract custom fields from form data
    const standardFields = [
      'firstName', 'lastName', 'email', 'phone', 'jobTitle', 'company', 'department',
      'address.street', 'address.city', 'address.state', 'address.zipCode', 'address.country',
      'status', 'notes'
    ];
    
    const customFieldValues: Record<string, any> = {};
    
    Object.keys(rawFormData).forEach(key => {
      if (!standardFields.includes(key) && !key.startsWith('address.')) {
        customFieldValues[key] = rawFormData[key];
      }
    });

    await db.collection('contacts').updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...validation.data, ...customFieldValues, updatedAt: new Date() } }
    );

    revalidatePath('/contacts');
    return { success: true, message: 'Contact updated successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to update contact.' };
  }
}

export async function deleteContact(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'Contact ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    await db.collection('contacts').deleteOne({ _id: new ObjectId(id) });
    
    revalidatePath('/contacts');
    return { success: true, message: 'Contact deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to delete contact.' };
  }
}
