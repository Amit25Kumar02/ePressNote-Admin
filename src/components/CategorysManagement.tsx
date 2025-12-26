"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Image as ImageIcon, MoreVertical } from "lucide-react";
import api from "../../lib/axios";
import { toast, ToastContainer } from "react-toastify";

type Category = {
  _id: string;
  name: string;
  image?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/v1/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ FIXED KEY
      setCategories(res.data?.categories || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  /* ================= MODAL ================= */
  const openAddModal = () => {
    resetForm();
    setOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditId(cat._id);
    setName(cat.name);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setImageFile(null);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!name) {
      toast.error("Category name is required");
      return;
    }

    if (!editId && !imageFile) {
      toast.error("Please upload an image");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (editId) {
        await api.put(`/api/v1/admin/categories/${editId}`, formData, {
          headers,
        });
        toast.success("Category updated");
      } else {
        await api.post("/api/v1/admin/categories", formData, {
          headers,
        });
        toast.success("Category created");
      }

      fetchCategories();
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted");
      fetchCategories();
    } catch {
      toast.error("Delete failed");
    }
  };


  return (
    <>
      <ToastContainer />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-lg font-semibold">Category Management</h1>
          <button
            onClick={openAddModal}
            className="bg-primary text-primary-foreground cursor-pointer px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
        <div className="grid grid-cols-12">
          <div className="col-span-12 bg-card border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-muted-foreground">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id} className="border-b">
                      <td className="px-4 py-3">
                        {cat.image ? (
                          <img
                            src={`http://13.200.174.224:83/uploads/${cat.image}`}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <ImageIcon size={18} />
                        )}
                      </td>
                      <td className="px-4 py-3">{cat.name}</td>
                      <td className="px-4 py-3 relative dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === cat._id ? null : cat._id);
                          }}
                          className="p-1 hover:bg-muted rounded cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openDropdown === cat._id && (
                          <div className="absolute right-0 top-8 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(cat);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-primary rounded-t-lg cursor-pointer"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(cat._id);
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
            <div className="bg-card w-full max-w-md rounded-xl p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-medium">
                  {editId ? "Edit Category" : "Add Category"}
                </h2>
                <button onClick={closeModal} className="cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  className="w-full border px-3 py-2 rounded"
                />

                <label className="flex gap-2 items-center border px-3 py-2 rounded cursor-pointer">
                  <ImageIcon size={16} />
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && setImageFile(e.target.files[0])
                    }
                  />
                </label>

                {imageFile && (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    className="w-12 h-12 object-contain"
                  />
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2 rounded cursor-pointer"
                >
                  {loading ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
