'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const dealSchema = z.object({
  dealName: z.string().min(2, 'Deal name must be at least 2 characters.'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  amount: z.string().regex(/^\$?\d+(,\d{3})*(\.\d{2})?$/, 'Please enter a valid amount.'),
  stage: z.enum(['Prospect', 'Qualifying', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
});

export async function createDeal(formData: FormData) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const rawFormData = Object.fromEntries(formData.entries());
        const validation = dealSchema.safeParse(rawFormData);

        if (!validation.success) {
            return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
        }

        const dealData = {
            ...validation.data,
            owner: { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1' },
            companyLogo: `https://picsum.photos/40/40?random=${Math.floor(Math.random() * 100)}`,
            createdAt: new Date(),
        };

        await db.collection('deals').insertOne(dealData);

        revalidatePath('/deals');

        return { success: true, message: 'Deal created successfully.' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to create deal.' };
    }
}

export async function getDeals() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const deals = await db.collection('deals').find({}).sort({ createdAt: -1 }).toArray();
        return JSON.parse(JSON.stringify(deals));
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function updateDeal(id: string, formData: FormData) {
    try {
        if (!id) {
            return { success: false, message: 'Deal ID is required.' };
        }
        const client = await clientPromise;
        const db = client.db();

        const rawFormData = Object.fromEntries(formData.entries());
        const validation = dealSchema.safeParse(rawFormData);

        if (!validation.success) {
            return { success: false, message: 'Invalid data.', errors: validation.error.flatten().fieldErrors };
        }

        await db.collection('deals').updateOne({ _id: new ObjectId(id) }, { $set: validation.data });

        revalidatePath('/deals');
        return { success: true, message: 'Deal updated successfully.' };

    } catch(e) {
        console.error(e);
        return { success: false, message: 'Failed to update deal.' };
    }
}

export async function deleteDeal(id: string) {
    try {
        if (!id) {
            return { success: false, message: 'Deal ID is required.' };
        }
        const client = await clientPromise;
        const db = client.db();

        await db.collection('deals').deleteOne({ _id: new ObjectId(id) });
        
        revalidatePath('/deals');
        return { success: true, message: 'Deal deleted successfully.' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to delete deal.' };
    }
}
