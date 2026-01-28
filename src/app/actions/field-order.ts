'use server';

import { addCustomField as libAddCustomField, getFieldOrder as libGetFieldOrder, updateCustomFields as libUpdateCustomFields, updateFieldOrder as libUpdateFieldOrder } from '@/lib/field-order'

export async function updateFieldOrder(module: string, entityId: string, fieldOrder: string[]) {
  return libUpdateFieldOrder(module, entityId, fieldOrder)
}

export async function getFieldOrder(module: string, entityId: string) {
  return libGetFieldOrder(module, entityId)
}

export async function updateCustomFields(module: string, entityId: string, customFields: any, fieldOrder?: string[]) {
  return libUpdateCustomFields(module, entityId, customFields, fieldOrder)
}

export async function addCustomField(params: any) {
  return libAddCustomField(params.module, params.entityId, params.fieldName, params.value, params.label, params.position)
}


