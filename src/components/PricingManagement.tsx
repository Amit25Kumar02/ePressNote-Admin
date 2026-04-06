'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import api from '../../lib/axios';

type Plan = {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
};

export default function PricingManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/api/v1/admin/prices/getPrice', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(res.data?.data || []);
    } catch {
      toast.error('Failed to load pricing plans');
    }
  };

  const openAddModal = () => {
    resetForm();
    setOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditId(plan._id);
    setTitle(plan.title);
    setDescription(plan.description || '');
    setPrice(plan.price);
    setDuration(plan.duration);
    setFeatureInput(plan.features?.join(', ') || '');
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setPrice(0);
    setDuration('');
    setFeatureInput('');
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures([...features, featureInput]);
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !price || !duration) {
      toast.error('Title, price, and duration are required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const featuresArray = featureInput.split(',').map(f => f.trim()).filter(f => f);
      const payload = { title, description, price, duration, features: featuresArray };

      if (editId) {
        await api.put(`/api/v1/admin/prices/updatePrice/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Plan updated');
      } else {
        await api.post('/api/v1/admin/prices/createPrice', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Plan created');
      }

      fetchPlans();
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pricing plan?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/v1/admin/prices/deletePrice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Plan deleted');
      fetchPlans();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Pricing Management</h1>
          <p className="text-muted-foreground">Create and manage pricing plans</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus size={16} /> Add Plan
        </Button>
      </div>

      {/* TABLE */}
      <div className='grid grid-cols-1'>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Features</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No pricing plans available
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell className="font-medium">{plan.title}</TableCell>
                  <TableCell>₹{plan.price}</TableCell>
                  <TableCell>{plan.duration}</TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {plan.features?.map((feature, idx) => (
                        <div key={idx}>• {feature}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(plan)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plan._id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">
                {editId ? 'Edit Plan' : 'Add Plan'}
              </h2>
              <button onClick={closeModal} className="cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Plan Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Plan title"
                  className="bg-input-background border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plan description"
                  className="bg-input-background border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Price</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Price (₹)"
                  className="bg-input-background border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Duration (e.g., Per Day, Per Month)"
                  className="bg-input-background border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Features (comma separated)</label>
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Feature 1, Feature 2, Feature 3"
                  className="bg-input-background border-border"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Saving...' : editId ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
