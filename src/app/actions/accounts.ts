'use server';

import clientPromise, { getDb } from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { Account } from '@/lib/types';

const accountSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  industry: z.string().min(2, 'Industry must be at least 2 characters.'),
  businessModel: z.string().min(1, 'Business model is required.'),
  website: z.string().url('Please enter a valid website URL.').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  address: z.object({
    street: z.string().min(2, 'Street address is required.'),
    city: z.string().min(2, 'City is required.'),
    state: z.string().min(2, 'State is required.'),
    zipCode: z.string().min(5, 'ZIP code must be at least 5 characters.'),
    country: z.string().min(2, 'Country is required.'),
  }),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Prospect', 'Customer']),
  customFields: z.record(z.string(), z.any()).optional(),
});

export async function createAccount(formData: FormData) {
  try {
    const db = await getDb();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse address object
    const addressData = {
      street: rawFormData['address.street'] as string,
      city: rawFormData['address.city'] as string,
      state: rawFormData['address.state'] as string,
      zipCode: rawFormData['address.zipCode'] as string,
      country: rawFormData['address.country'] as string,
    };

    const validation = accountSchema.safeParse({
      ...rawFormData,
      address: addressData,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    // Extract custom fields from form data
    // Custom fields are any fields that are not part of the standard schema
    const standardFields = [
      'companyName', 'industry', 'website', 'phone', 'email', 
      'businessModel', 'address.street', 'address.city', 'address.state', 'address.zipCode', 'address.country',
      'description', 'status'
    ];
    
    const customFieldValues: Record<string, any> = {};
    
    Object.keys(rawFormData).forEach(key => {
      // Skip standard fields and nested address fields
      if (!standardFields.includes(key) && !key.startsWith('address.')) {
        customFieldValues[key] = rawFormData[key];
      }
    });

    const accountData = {
      ...validation.data,
      ...customFieldValues, // Spread custom fields as top-level fields
      owner: { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1' },
      logo: `https://picsum.photos/80/80?random=${Math.floor(Math.random() * 100)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('accounts').insertOne(accountData);

    revalidatePath('/accounts');
    return { success: true, message: 'Account created successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to create account.' };
  }
}

export async function getAccounts() {
  try {
    const db = await getDb();
    const accounts = await db.collection('accounts').find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(accounts));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getAccount(id: string) {
  try {
    const db = await getDb();
    const account = await db.collection('accounts').findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(account));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateAccount(id: string, formData: FormData) {
  try {
    if (!id) {
      return { success: false, message: 'Account ID is required.' };
    }
    const db = await getDb();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse address object
    const addressData = {
      street: rawFormData['address.street'] as string,
      city: rawFormData['address.city'] as string,
      state: rawFormData['address.state'] as string,
      zipCode: rawFormData['address.zipCode'] as string,
      country: rawFormData['address.country'] as string,
    };

    const validation = accountSchema.safeParse({
      ...rawFormData,
      address: addressData,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    // Extract custom fields from form data
    // Custom fields are any fields that are not part of the standard schema
    const standardFields = [
      'companyName', 'industry', 'website', 'phone', 'email', 
      'businessModel', 'address.street', 'address.city', 'address.state', 'address.zipCode', 'address.country',
      'description', 'status'
    ];
    
    const customFieldValues: Record<string, any> = {};
    
    Object.keys(rawFormData).forEach(key => {
      // Skip standard fields and nested address fields
      if (!standardFields.includes(key) && !key.startsWith('address.')) {
        customFieldValues[key] = rawFormData[key];
      }
    });

    await db.collection('accounts').updateOne(
      { _id: new ObjectId(id) }, 
      { 
        $set: { 
          ...validation.data, 
          ...customFieldValues, // Spread custom fields as top-level fields
          updatedAt: new Date() 
        } 
      }
    );

    revalidatePath('/accounts');
    return { success: true, message: 'Account updated successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to update account.' };
  }
}

export async function deleteAccount(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'Account ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    await db.collection('accounts').deleteOne({ _id: new ObjectId(id) });
    
    revalidatePath('/accounts');
    return { success: true, message: 'Account deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to delete account.' };
  }
}
