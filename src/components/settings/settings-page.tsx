
'use client';

import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from '../layout/user-nav';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

// --- Custom Fields Types and Component ---
type CustomField = { name: string; type: string; module: string };

function CustomFieldsManager() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [newField, setNewField] = useState<CustomField>({ name: '', type: 'text', module: 'deals' });

  // Load fields from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('customFields');
        if (saved) {
          setFields(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load custom fields:', error);
      }
    }
  }, []);

  // Save fields to localStorage whenever they change
  const saveToLocalStorage = (updatedFields: CustomField[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('customFields', JSON.stringify(updatedFields));
      } catch (error) {
        console.error('Failed to save custom fields:', error);
      }
    }
  };

  const addField = () => {
    if (!newField.name.trim()) return;
    const updated = [...fields, newField];
    setFields(updated);
    saveToLocalStorage(updated);
    setNewField({ name: '', type: 'text', module: 'deals' });
  };

  const removeField = (idx: number) => {
    const updated = fields.filter((_, i) => i !== idx);
    setFields(updated);
    saveToLocalStorage(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium block mb-1">Field Name</label>
          <Input
            placeholder="e.g., Priority, Department"
            value={newField.name}
            onChange={e => setNewField(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Type</label>
          <select
            className="border rounded px-2 py-2 h-10"
            value={newField.type}
            onChange={e => setNewField(f => ({ ...f, type: e.target.value }))}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Module</label>
          <select
            className="border rounded px-2 py-2 h-10"
            value={newField.module}
            onChange={e => setNewField(f => ({ ...f, module: e.target.value }))}
          >
            <option value="deals">Deals</option>
            <option value="contacts">Contacts</option>
            <option value="accounts">Accounts</option>
            <option value="projects">Projects</option>
            <option value="tickets">Tickets</option>
            <option value="invoices">Invoices</option>
            <option value="quotes">Quotes</option>
            <option value="services">Services</option>
          </select>
        </div>
        <Button onClick={addField} type="button">Add Field</Button>
      </div>
      <ul className="space-y-2">
        {fields.length === 0 && <li className="text-muted-foreground">No custom fields yet.</li>}
        {fields.map((field, idx) => (
          <li key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
            <div className="flex-1">
              <span className="font-mono font-medium">{field.name}</span>
              <span className="text-xs text-muted-foreground ml-2">({field.type}, {field.module})</span>
            </div>
            <Button variant="destructive" size="sm" onClick={() => removeField(idx)} type="button">Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}


import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function SettingsPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Settings</h1>
        <div className="relative ml-auto flex-1 md:grow-0"></div>
        <div className="hidden md:block">
          <UserNav />
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="fields">Custom Fields</TabsTrigger>
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@flexcrm.com" />
                </div>
                <Button>Save</Button>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>Manage user roles and what they can access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Role management coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="fields">
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>Add custom fields to your modules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CustomFieldsManager />
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="pipelines">
            <Card>
              <CardHeader>
                <CardTitle>Pipelines</CardTitle>
                <CardDescription>Customize stages for your sales and project pipelines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Pipeline customization coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Customize the look and feel of your CRM.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="appName">App Name</Label>
                  <Input id="appName" defaultValue="Dynamic CRM" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <Input id="logo" type="file" />
                </div>
                <Button>Save</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
