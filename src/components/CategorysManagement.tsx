"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Search } from "lucide-react";
import api from "../../lib/axios";
import { toast, ToastContainer } from "react-toastify";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://prodapi.epressnote.com";

type Category = {
  _id: string;
  name: string;
  image?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const itemsPerPage = 10;

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const fetchCategories = async (page = 1) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/v1/admin/categories?page=${page}&limit=${itemsPerPage}&sort=-createdAt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(res.data?.categories || res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalCategories(res.data?.pagination?.totalItems || 0);
    } catch {
      toast.error("Failed to load categories");
    }
  };

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

      fetchCategories(currentPage);
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted");
      fetchCategories(currentPage);
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= FILTER ================= */
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <>
      <ToastContainer />
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Categories</h1>
            <p className="text-muted-foreground">View & manage categories</p>
          </div>
          <Button onClick={openAddModal} className="flex items-center gap-2">
            <Plus size={16} /> Add Category
          </Button>
        </div>

        {/* SEARCH */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* TABLE */}
        <div className="grid grid-cols-1">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      No categories available
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => (
                    <TableRow key={cat._id}>
                      <TableCell>
                        {cat.image ? (
                          <img
                            src={`${BACKEND_URL}/uploads/${cat.image}`}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <ImageIcon size={18} />
                        )}
                      </TableCell>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(cat)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cat._id)}
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
        
        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {totalCategories > 0 ? Math.min((currentPage - 1) * itemsPerPage + 1, totalCategories) : 0} to {totalCategories > 0 ? Math.min(currentPage * itemsPerPage, totalCategories) : 0} of {totalCategories} categories
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="border-border"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="border-border"
            >
              Next
            </Button>
          </div>
        </div>

        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card w-full max-w-md border-border rounded-xl p-6">
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
