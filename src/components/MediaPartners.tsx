"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X, Image as ImageIcon } from "lucide-react";
import api from "../../lib/axios";
import { toast, ToastContainer } from "react-toastify";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import "react-toastify/dist/ReactToastify.css";

type MediaPartner = {
  _id: string;
  image: string;
};

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://prodapi.epressnote.com";

export default function MediaPartners() {
  const [partners, setPartners] = useState<MediaPartner[]>([]);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPartners, setTotalPartners] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchPartners(currentPage);
  }, [currentPage]);

  const fetchPartners = async (page = 1) => {
    try {
      const res = await api.get(`/api/v1/admin/homeNewspaper/getHomeNewspaper?page=${page}&limit=${itemsPerPage}`, {
        // headers: { "ngrok-skip-browser-warning": "true" },
      });
      const list = res.data?.partners || res.data?.data || [];
      setPartners(list);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalPartners(res.data?.pagination?.totalItems || list.length || 0);
    } catch (err: any) {
      console.log("GET ERROR =>", err?.response?.data || err.message);
      toast.error("Failed to load media partners");
    }
  };

  const openAddModal = () => {
    setImageFile(null);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", imageFile);

      await api.post("/api/v1/admin/homeNewspaper/createHomeNewspaper", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        //   "ngrok-skip-browser-warning": "true",
          "Content-Type": undefined,
        },
      });
      toast.success("Media partner added");
      fetchPartners(currentPage);
      closeModal();
    } catch (err: any) {
      console.error("API ERROR:", err.response?.data);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media partner?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/admin/homeNewspaper/deleteHomeNewspaper?id=${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        //   "ngrok-skip-browser-warning": "true"
        },
      });
      toast.success("Media partner deleted");
      fetchPartners(currentPage);
    } catch (err: any) {
      console.error("DELETE ERROR:", err.response?.data);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Media Partners</h1>
            <p className="text-muted-foreground">View & manage media partners</p>
          </div>

          <Button onClick={openAddModal} className="flex items-center gap-2">
            <Plus size={16} /> Add Media Partner
          </Button>
        </div>

        {/* TABLE */}
        <div className="grid grid-cols-1">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                      No media partners available
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner._id}>
                      <TableCell>
                        {partner.image ? (
                          <img
                            src={`${BACKEND_URL}/uploads/${partner.image}`}
                            className="w-14 h-8 object-contain"
                            alt="Media Partner"
                          />
                        ) : (
                          <ImageIcon size={18} />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(partner._id)}
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalPartners)} to{" "}
            {Math.min(currentPage * itemsPerPage, totalPartners)} of {totalPartners} media partners
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        {/* MODAL */}
        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border w-full max-w-md rounded-xl p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-medium">Add Media Partner</h2>
                <button onClick={closeModal} className="cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="flex gap-2 items-center border border-border px-3 py-2 rounded cursor-pointer">
                  <ImageIcon size={16} />
                  Upload Image
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
                    className="w-16 h-10 object-contain"
                  />
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2 rounded cursor-pointer"
                >
                  {loading ? "Saving..." : "Add Media Partner"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
