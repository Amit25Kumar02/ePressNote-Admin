"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Image as ImageIcon, MoreVertical } from "lucide-react";
import api from "../../lib/axios";
import { toast, ToastContainer } from "react-toastify";

type Newspaper = {
  _id: string;
  name: string;
  price: number;
  language: string;
  locations: string[];
  image?: string;
};

const BACKEND_URL = "https://epressnoteapi.testenvapp.com";

export default function NewspapersPage() {
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [language, setLanguage] = useState("");
  const [locations, setLocations] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNewspapers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const fetchNewspapers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/v1/admin/newspapers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewspapers(res.data?.newspapers || []);
    } catch {
      toast.error("Failed to load newspapers");
    }
  };

  const openAddModal = () => {
    resetForm();
    setOpen(true);
  };

  const openEditModal = (paper: Newspaper) => {
    setEditId(paper._id);
    setName(paper.name);
    setPrice(String(paper.price));
    setLanguage(paper.language);
    setLocations(paper.locations.join(","));
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setPrice("");
    setLanguage("");
    setLocations("");
    setCategoryId("");
    setImageFile(null);
  };

  const handleSubmit = async () => {
    if (!name || !price || !language || !locations || !categoryId) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", String(Number(price)));
      formData.append("language", language);
      formData.append("categoryId", categoryId);

      locations
        .split(",")
        .map((l) => l.trim())
        .forEach((loc) => {
          formData.append("locations[]", loc);
        });


      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editId) {
        await api.put(`/api/v1/admin/newspapers/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Newspaper updated");
      } else {
        await api.post("/api/v1/admin/newspapers", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Newspaper added");
      }

      fetchNewspapers();
      closeModal();
    } catch (err: any) {
      console.error("API ERROR:", err.response?.data);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Delete this newspaper?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/admin/newspapers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Newspaper deleted");
      fetchNewspapers();
    } catch {
      toast.error("Delete failed");
    }
  };


  return (
    <>
      <ToastContainer />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-lg font-semibold">Newspaper Management</h1>
          <button
            onClick={openAddModal}
            className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Add Newspaper
          </button>
        </div>
        <div className="grid grid-cols-1">
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Language</th>
                  <th className="px-4 py-3 text-left">Locations</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {newspapers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted-foreground">
                      No newspapers found
                    </td>
                  </tr>
                ) : (
                  newspapers.map((paper) => (
                    <tr key={paper._id} className="border-b">
                      <td className="px-4 py-3">
                        {paper.image ? (
                          <img
                            src={`${BACKEND_URL}/uploads/${paper.image}`}
                            className="w-14 h-8 object-contain"
                          />
                        ) : (
                          <ImageIcon size={18} />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{paper.name}</td>
                      <td className="px-4 py-3">{paper.language}</td>
                      <td className="px-4 py-3">{paper.locations.join(", ")}</td>
                      <td className="px-4 py-3">₹{paper.price}</td>
                      <td className="px-4 py-3 relative dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === paper._id ? null : paper._id);
                          }}
                          className="p-1 hover:bg-muted rounded cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openDropdown === paper._id && (
                          <div className="absolute right-0 top-8 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(paper);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-primary rounded-t-lg cursor-pointer"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(paper._id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive rounded-b-lg cursor-pointer"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card border border-border w-full max-w-md rounded-xl p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-medium">
                  {editId ? "Edit Newspaper" : "Add Newspaper"}
                </h2>
                <button onClick={closeModal} className="cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Newspaper name" className="w-full bg-input-background border border-border px-3 py-2 rounded" />
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price" className="w-full bg-input-background border border-border px-3 py-2 rounded" />
                <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language" className="w-full bg-input-background border border-border px-3 py-2 rounded" />
                <input value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="Locations (comma separated)" className="w-full bg-input-background border border-border px-3 py-2 rounded" />
                <input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="Category ID" className="w-full bg-input-background border border-border px-3 py-2 rounded" />

                <label className="flex gap-2 items-center border border-border px-3 py-2 rounded cursor-pointer">
                  <ImageIcon size={16} />
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} />
                </label>

                {imageFile && <img src={URL.createObjectURL(imageFile)} className="w-16 h-10 object-contain" />}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2 rounded cursor-pointer"
                >
                  {loading ? "Saving..." : editId ? "Update Newspaper" : "Add Newspaper"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
