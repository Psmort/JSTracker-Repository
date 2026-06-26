import { useEffect, useState } from 'react';
import { fetchContacts, createContact, updateContact, deleteContact } from '../lib/api';
import type { Contact } from '../types';
import { Plus, Trash2, Pencil, Mail, Phone, Building2 } from 'lucide-react';

interface ContactPanelProps {
  jobId: string;
}

export function ContactPanel({ jobId }: ContactPanelProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => {
    const c = await fetchContacts(jobId);
    setContacts(c);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setNotes('');
    setAdding(false);
    setEditing(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createContact({ name, email, phone, company, notes, job_id: jobId });
    resetForm();
    await load();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !name.trim()) return;
    await updateContact(editing, { name, email, phone, company, notes });
    resetForm();
    await load();
  };

  const startEdit = (c: Contact) => {
    setName(c.name);
    setEmail(c.email || '');
    setPhone(c.phone || '');
    setCompany(c.company || '');
    setNotes(c.notes || '');
    setEditing(c.id);
    setAdding(true);
  };

  const handleDelete = async (id: string) => {
    await deleteContact(id);
    await load();
  };

  if (loading) {
    return <div className="py-6 text-center text-sm text-gray-400">Loading contacts...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contacts</h3>
        <button
          onClick={() => { if (adding) resetForm(); else setAdding(true); }}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          {adding ? 'Cancel' : 'Add Contact'}
        </button>
      </div>

      {adding && (
        <form onSubmit={editing ? handleEdit : handleAdd} className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Contact name"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone"
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Company"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{editing ? 'Save' : 'Add'}</button>
          </div>
        </form>
      )}

      {contacts.length === 0 && !adding && (
        <div className="text-sm text-gray-400 py-2">No contacts yet. Add a recruiter or hiring manager.</div>
      )}

      <div className="space-y-2">
        {contacts.map(c => (
          <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{c.name}</div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                {c.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {c.email}
                  </span>
                )}
                {c.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {c.phone}
                  </span>
                )}
                {c.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {c.company}
                  </span>
                )}
              </div>
              {c.notes && <div className="text-xs text-gray-500 mt-1">{c.notes}</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => startEdit(c)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
