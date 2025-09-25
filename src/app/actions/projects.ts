'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { Project } from '@/lib/types';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().min(1, 'End date is required.'),
  progress: z.number().min(0).max(100, 'Progress must be between 0 and 100.'),
  budget: z.number().min(0, 'Budget must be positive.'),
  actualCost: z.number().min(0, 'Actual cost must be positive.'),
  tags: z.string().optional(),
});

export async function createProject(formData: FormData) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse tags
    const tags = rawFormData.tags ? (rawFormData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const validation = projectSchema.safeParse({
      ...rawFormData,
      progress: Number(rawFormData.progress),
      budget: Number(rawFormData.budget),
      actualCost: Number(rawFormData.actualCost),
      tags,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    const projectData = {
      ...validation.data,
      owner: { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1' },
      team: [
        { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1', role: 'Project Manager' },
        { name: 'John Doe', avatar: 'https://picsum.photos/40/40?random=2', role: 'Developer' },
        { name: 'Jane Smith', avatar: 'https://picsum.photos/40/40?random=3', role: 'Designer' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('projects').insertOne(projectData);

    revalidatePath('/projects');
    return { success: true, message: 'Project created successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to create project.' };
  }
}

export async function getProjects() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const projects = await db.collection('projects').find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(projects));
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getProject(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });
    return JSON.parse(JSON.stringify(project));
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateProject(id: string, formData: FormData) {
  try {
    if (!id) {
      return { success: false, message: 'Project ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    const rawFormData = Object.fromEntries(formData.entries());
    
    // Parse tags
    const tags = rawFormData.tags ? (rawFormData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const validation = projectSchema.safeParse({
      ...rawFormData,
      progress: Number(rawFormData.progress),
      budget: Number(rawFormData.budget),
      actualCost: Number(rawFormData.actualCost),
      tags,
    });

    if (!validation.success) {
      return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
    }

    await db.collection('projects').updateOne(
      { _id: new ObjectId(id) }, 
      { $set: { ...validation.data, updatedAt: new Date() } }
    );

    revalidatePath('/projects');
    return { success: true, message: 'Project updated successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to update project.' };
  }
}

export async function deleteProject(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'Project ID is required.' };
    }
    const client = await clientPromise;
    const db = client.db();

    await db.collection('projects').deleteOne({ _id: new ObjectId(id) });
    
    revalidatePath('/projects');
    return { success: true, message: 'Project deleted successfully.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to delete project.' };
  }
}
