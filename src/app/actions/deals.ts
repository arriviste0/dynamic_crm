'use server';

import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

export async function createDeal(formData: FormData) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const dealData = {
            dealName: formData.get('dealName') as string,
            companyName: formData.get('companyName') as string,
            amount: formData.get('amount') as string,
            stage: formData.get('stage') as string,
            owner: { name: 'Admin User', avatar: 'https://picsum.photos/40/40?random=1' },
            companyLogo: 'https://picsum.photos/40/40?random=15',
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
