'use server';

import { CustomFieldsMap, CustomFieldValue, FieldOrder } from '@/lib/types';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Update field order for an entity
 */
export async function updateFieldOrder(
  module: string,
  entityId: string,
  fieldOrder: string[]
): Promise<boolean> {
  try {
    const db = await getDb();

    // Update field order in the entity
    await db.collection(module).updateOne(
      { _id: new ObjectId(entityId) },
      { $set: { fieldOrder } }
    );

    // Also store in a separate collection for tracking
    await db.collection('fieldOrders').updateOne(
      { 
        module,
        entityId: new ObjectId(entityId)
      },
      { 
        $set: {
          fieldOrder,
          lastModified: new Date()
        }
      },
      { upsert: true }
    );

    return true;
  } catch (error) {
    console.error('Error updating field order:', error);
    return false;
  }
}

/**
 * Get field order for an entity
 */
export async function getFieldOrder(
  module: string,
  entityId: string
): Promise<string[]> {
  try {
    const db = await getDb();

    // First try to get from the entity itself
    const entity = await db.collection(module).findOne(
      { _id: new ObjectId(entityId) },
      { projection: { fieldOrder: 1 } }
    );

    if (entity?.fieldOrder) {
      return entity.fieldOrder;
    }

    // Fallback to fieldOrders collection
    const orderDoc = await db.collection('fieldOrders').findOne({
      module,
      entityId: new ObjectId(entityId)
    });

    return orderDoc?.fieldOrder || [];
  } catch (error) {
    console.error('Error getting field order:', error);
    return [];
  }
}

/**
 * Update custom fields with order
 */
export async function updateCustomFields(
  module: string,
  entityId: string,
  customFields: CustomFieldsMap,
  fieldOrder?: string[]
): Promise<boolean> {
  try {
    const db = await getDb();

    // Prepare custom fields with order if provided
    const processedFields: CustomFieldsMap = {};
    const order = fieldOrder || Object.keys(customFields);

    order.forEach((fieldName, index) => {
      if (customFields[fieldName]) {
        processedFields[fieldName] = {
          ...customFields[fieldName],
          order: index,
          lastModified: new Date()
        };
      }
    });

    // Update the entity
    await db.collection(module).updateOne(
      { _id: new ObjectId(entityId) },
      { 
        $set: { 
          customFields: processedFields,
          fieldOrder: order,
          updatedAt: new Date()
        } 
      }
    );

    return true;
  } catch (error) {
    console.error('Error updating custom fields:', error);
    return false;
  }
}

/**
 * Add a new custom field to an entity
 */
export async function addCustomField(
  module: string,
  entityId: string,
  fieldName: string,
  value: string | number | boolean,
  label: string,
  position?: number
): Promise<boolean> {
  try {
    const db = await getDb();

    // Get current field order
    const currentOrder = await getFieldOrder(module, entityId);
    let newOrder = [...currentOrder];

    // Get current custom fields
    const entity = await db.collection(module).findOne({ _id: new ObjectId(entityId) });
    const customFields = entity?.customFields || {};

    // Create new field value
    const fieldValue: CustomFieldValue = {
      value,
      label,
      order: position ?? currentOrder.length,
      lastModified: new Date()
    };

    // Update order array
    if (typeof position === 'number') {
      newOrder = newOrder.filter(f => f !== fieldName);
      newOrder.splice(position, 0, fieldName);
    } else if (!newOrder.includes(fieldName)) {
      newOrder.push(fieldName);
    }

    // Update entity with new field and order
    await db.collection(module).updateOne(
      { _id: new ObjectId(entityId) },
      {
        $set: {
          [`customFields.${fieldName}`]: fieldValue,
          fieldOrder: newOrder,
          updatedAt: new Date()
        }
      }
    );

    return true;
  } catch (error) {
    console.error('Error adding custom field:', error);
    return false;
  }
}
