"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X, Search, Image as ImageIcon } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import api from "../../lib/axios";

type Offer = {
  _id: string;
  image: string;
  status: boolean;
};

export default function OfferManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/v1/admin/offer/getAllOffers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(res.data?.data || []);
    } catch {
      toast.error("Failed to load offers");
    }
  };

  const openAddModal = () => {
    resetForm();
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", imageFile);

      await api.post("/api/v1/admin/offer/createOffer", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Offer created");

      fetchOffers();
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this offer?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/admin/offer/deleteOffer?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Offer deleted");
      fetchOffers();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/api/v1/admin/offer/updateOffer?id=${id}`, 
        { status: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOffers(prev => prev.map(offer => 
        offer._id === id ? { ...offer, status: !currentStatus } : offer
      ));
      
      toast.success(`Offer ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error("Status update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Offers Management</h1>
          <p className="text-muted-foreground">Create and manage offers</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus size={16} /> Add Offer
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No offers available
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => (
                <TableRow key={offer._id}>
                  <TableCell>
                    <img
                      src={`https://prodapi.epressnote.com/uploads/${offer.image}`}
                      className="w-20 h-12 object-contain"
                      alt="Offer"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => toggleStatus(offer._id, offer.status)}
                      className={offer.status ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"}
                    >
                      {offer.status ? "Active" : "Inactive"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(offer._id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border w-full max-w-md rounded-xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">Add Offer</h2>
              <button onClick={closeModal} className="cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex gap-2 items-center border border-border px-3 py-2 rounded cursor-pointer bg-input-background">
                <ImageIcon size={16} />
                Upload Offer Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                />
              </label>

              {imageFile && (
                <img
                  src={URL.createObjectURL(imageFile)}
                  className="w-full h-32 object-contain border rounded"
                  alt="Preview"
                />
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Saving..." : "Create Offer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
