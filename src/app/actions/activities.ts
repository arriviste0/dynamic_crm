'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { Activity } from '@/lib/types';

const activitySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  type: z.enum(['Call', 'Email', 'Meeting', 'Task', 'Note']),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  dueDate: z.string().min(1, 'Due date is required.'),
  status: z.enum(['Pending', 'Completed', 'Cancelled']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  relatedTo: z.object({
    type: z.enum(['Deal', 'Contact', 'Account', 'Project']),
    id: z.string().min(1, 'Related entity ID is required.'),
    name: z.string().min(2, 'Related entity name is required.'),
  }),
});

export async function createActivity(formData: FormData) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse relatedTo object
    const relatedToData = {
      type: rawFormData['relatedTo.type'] as 'Deal' | 'Contact' | 'Account' | 'Project',
      id: rawFormData['relatedTo.id'] as string,
      name: rawFormData['relatedTo.name'] as string,
    };

    const validation = activitySchema.safeParse({
      ...rawFormData,
      relatedTo: relatedToData,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    const activityData = {
      ...validation.data,
      owner: { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('activities').insertOne(activityData);

    revalidatePath('/activities');
    return { success: true, message: 'Activity created successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to create activity.' };
  }
}

export async function getActivities() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const activities = await db.collection('activities').find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(activities));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getActivity(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const activity = await db.collection('activities').findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(activity));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateActivity(id: string, formData: FormData) {
  try {
    if (!id) {
      return { success: false, message: 'Activity ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse relatedTo object
    const relatedToData = {
      type: rawFormData['relatedTo.type'] as 'Deal' | 'Contact' | 'Account' | 'Project',
      id: rawFormData['relatedTo.id'] as string,
      name: rawFormData['relatedTo.name'] as string,
    };

    const validation = activitySchema.safeParse({
      ...rawFormData,
      relatedTo: relatedToData,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    await db.collection('activities').updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...validation.data, updatedAt: new Date() } }
    );

    revalidatePath('/activities');
    return { success: true, message: 'Activity updated successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to update activity.' };
  }
}

export async function deleteActivity(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'Activity ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    await db.collection('activities').deleteOne({ _id: new ObjectId(id) });
    
    revalidatePath('/activities');
    return { success: true, message: 'Activity deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to delete activity.' };
  }
}

