// Custom field definition
export interface CustomField extends BaseEntity {
  name: string;
  type: string;
  module: string;
  order: number;  // Field to track position
  label: string;  // Display label
  isVisible?: boolean;  // Whether field is visible in the UI
}

// Custom field value with metadata
export interface CustomFieldValue {
  value: string | number | boolean;
  order: number;  // Field to track position
  label: string;  // Display label
  lastModified: Date;
}

// Custom fields map with order
export interface CustomFieldsMap {
  [key: string]: CustomFieldValue;
}

// Entity field order tracking
export interface FieldOrder {
  module: string;  // e.g., 'contacts', 'accounts'
  entityId: string;  // ID of the entity
  fieldOrder: string[];  // Array of field names in order
  lastModified: Date;
}

// Base types for all entities
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  customFields?: CustomFieldsMap;
  fieldOrder?: string[];  // Store field order at entity level
}

// Account types
export interface Account extends BaseEntity {
  companyName: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  description: string;
  status: 'Active' | 'Inactive' | 'Prospect' | 'Customer';
  owner: {
    name: string;
    avatar: string;
  };
  logo: string;
}

// Contact types
export interface Contact extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  department: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'Active' | 'Inactive' | 'Lead' | 'Customer';
  owner: {
    name: string;
    avatar: string;
  };
  avatar: string;
  notes: string;
}

// Deal types
export interface Deal extends BaseEntity {
  dealName: string;
  companyName: string;
  companyLogo: string;
  amount: string;
  stage: 'Prospect' | 'Qualifying' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  owner: {
    name: string;
    avatar: string;
  };
  expectedCloseDate: Date;
  probability: number;
  description: string;
  contactId?: string;
  accountId?: string;
}

// Activity types
export interface Activity extends BaseEntity {
  title: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note';
  description: string;
  dueDate: Date;
  status: 'Pending' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  owner: {
    name: string;
    avatar: string;
  };
  relatedTo: {
    type: 'Deal' | 'Contact' | 'Account' | 'Project';
    id: string;
    name: string;
  };
}

// Inventory/Product types
export interface Product extends BaseEntity {
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  status: 'Active' | 'Inactive' | 'Discontinued';
  image: string;
  tags: string[];
  supplier: string;
}

// Service types
export interface Service extends BaseEntity {
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number; // in hours
  status: 'Active' | 'Inactive';
  image: string;
  tags: string[];
}

// Quote types
export interface Quote extends BaseEntity {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  totalAmount: number;
  validUntil: Date;
  items: QuoteItem[];
  notes: string;
  owner: {
    name: string;
    avatar: string;
  };
}

export interface QuoteItem {
  id: string;
  type: 'Product' | 'Service';
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Invoice types
export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  totalAmount: number;
  dueDate: Date;
  items: InvoiceItem[];
  notes: string;
  owner: {
    name: string;
    avatar: string;
  };
}

export interface InvoiceItem {
  id: string;
  type: 'Product' | 'Service';
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Ticket types
export interface Ticket extends BaseEntity {
  ticketNumber: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  assignedTo: {
    name: string;
    avatar: string;
  };
  tags: string[];
}

// Project types
export interface Project extends BaseEntity {
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  budget: number;
  actualCost: number;
  owner: {
    name: string;
    avatar: string;
  };
  team: Array<{
    name: string;
    avatar: string;
    role: string;
  }>;
  tags: string[];
}

// Billing types
export interface BillingRecord extends BaseEntity {
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentMethod: string;
  transactionId: string;
  description: string;
  dueDate: Date;
  paidDate?: Date;
}

// Support types
export interface SupportArticle extends BaseEntity {
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: 'Draft' | 'Published' | 'Archived';
  author: {
    name: string;
    avatar: string;
  };
  views: number;
  helpful: number;
}

// Profile types
export interface UserProfile extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  department: string;
  bio: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
}

// Settings types
export interface SystemSettings extends BaseEntity {
  companyName: string;
  companyLogo: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  features: {
    deals: boolean;
    contacts: boolean;
    projects: boolean;
    inventory: boolean;
    billing: boolean;
  };
}

// Undo/Redo types
export interface HistoryAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  data: any;
  timestamp: Date;
}

export interface HistoryState {
  actions: HistoryAction[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}
