"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  Check,
  X,
} from "lucide-react";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
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

/* ================= TYPES ================= */

type Advertisement = {
  _id: string;
  adDescription: string;
  contactInfo: string;
  publicationDate: string;
  language?: string;
  price?: string;
  image?: string;
  whatsAppNo?: number;
  DocImage?: string;
  views?: number;
  status?: boolean | null;
  category?: {
    _id: string;
    name: string;
  };
  newspapers?: {
    newspaper: string;
    adType: string;
    _id: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
};

type Newspaper = {
  _id: string;
  name: string;
};

/* ================= COMPONENT ================= */

export default function AdvertisementsManagement() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAds, setTotalAds] = useState(0);
  const itemsPerPage = 10;

  /* ================= FETCH ================= */

  const fetchAds = async (page = 1) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/api/v1/web/advertisements/getAllAdvertisment?page=${page}&limit=${itemsPerPage}&sort=-createdAt`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAds(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalAds(res.data?.pagination?.totalItems || res.data?.pagination?.total || res.data?.data?.length || 0);
    } catch {
      toast.error("Failed to load advertisements");
    }
  };

  const fetchNewspapers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/v1/admin/newspapers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewspapers(res.data?.newspapers || res.data?.data || []);
    } catch {
      console.error("Failed to load newspapers");
    }
  };

  useEffect(() => {
    fetchAds(currentPage);
    fetchNewspapers();
  }, [currentPage]);

  /* ================= DELETE ================= */

  const deleteAd = async (id: string) => {
    if (!confirm("Delete this advertisement?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/web/advertisements/deleteAdvertisement?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Advertisement deleted");
      fetchAds(currentPage);
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= APPROVE / REJECT ================= */

  const updateStatus = async (id: string, status: boolean) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/api/v1/web/advertisements/updatedvertisement?id=${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(status ? "Approved" : "Rejected");
      fetchAds(currentPage);
    } catch (err: any) {
      console.error("updateStatus failed:", err?.response?.status, err?.response?.data);
      toast.error(err?.response?.data?.message || "Status update failed");
    }
  };

  /* ================= STATUS RENDER ================= */

  const isPending = (status?: boolean | null) => status == null;

  const renderStatus = (status?: boolean | null) => {
    if (status === true) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-primary text-white">
          Approved
        </span>
      );
    }
    if (status === false) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-600">
          Rejected
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500 text-white">
        Pending
      </span>
    );
  };

  /* ================= FILTER ================= */

  const filteredAds = ads.filter((a) =>
    a.adDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Advertisements</h1>
        <p className="text-muted-foreground">View & manage advertisements</p>
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <Input
            placeholder="Search by description..."
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
                <TableHead>Sr. No</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No advertisements available
                  </TableCell>
                </TableRow>
              ) : (
                filteredAds.map((ad, index) => (
                  <TableRow key={ad._id}>
                  <TableCell className="font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {ad.adDescription?.length > 50 ? `${ad.adDescription.substring(0, 50)}...` : ad.adDescription}
                  </TableCell>
                  <TableCell>{ad.category?.name || "--"}</TableCell>
                  <TableCell>{ad.price ? `₹${ad.price}` : "--"}</TableCell>
                  <TableCell>{ad.views || 0}</TableCell>
                  <TableCell>{renderStatus(ad.status)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {isPending(ad.status) && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(ad._id, true)}>
                            <Check size={14} />
                          </Button>
                          <Button size="sm" onClick={() => updateStatus(ad._id, false)}>
                            <X size={14} />
                          </Button>
                        </>
                      )}
                      {ad.status === false && (
                        <Button size="sm" onClick={() => updateStatus(ad._id, true)}>
                          <Check size={14} />
                        </Button>
                      )}
                      {ad.status === true && (
                        <Button size="sm" onClick={() => updateStatus(ad._id, false)}>
                          <X size={14} />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAd(ad)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAd(ad._id)}
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
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalAds)} to {Math.min(currentPage * itemsPerPage, totalAds)} of {totalAds} advertisements
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

      {/* VIEW MODAL */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedAd(null)}
          />
          <div className="relative bg-card rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Advertisement Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAd(null)}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              {selectedAd.image && (
                <div className="flex justify-center">
                  <img
                    src={`https://prodapi.epressnote.com/uploads/${selectedAd.image}`}
                    className="max-w-xs h-32 object-contain rounded"
                    alt="Advertisement"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="font-medium">{selectedAd.adDescription}</p>
                </div> */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p>{selectedAd.category?.name || "--"}</p>
                </div>
                {/* <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <p>{selectedAd.city || "--"}</p>
                </div> */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Language</label>
                  <p>{selectedAd.language || "--"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p>{selectedAd.price ? `₹${selectedAd.price}` : "--"}</p>
                </div>
              
                <div>
                  <label className="text-sm font-medium text-muted-foreground">WhatsApp No</label>
                  <p>{selectedAd.whatsAppNo || "--"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1">{selectedAd.adDescription}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Info</label>
                <p className="mt-1">{selectedAd.contactInfo}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Publication Date</label>
                <p className="mt-1">{new Date(selectedAd.publicationDate).toDateString()}</p>
              </div>

              {selectedAd.newspapers && selectedAd.newspapers.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Newspapers & Ad Types</label>
                  <div className="mt-1 space-y-1">
                    {selectedAd.newspapers.map((item) => {
                      const newspaper = newspapers.find(n => n._id === item.newspaper);
                      return (
                        <div key={item._id} className="text-sm bg-muted p-2 rounded">
                          <span className="font-medium">Newspaper:</span> {newspaper?.name || item.newspaper} - 
                          <span className="font-medium"> Ad Type:</span> {item.adType}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedAd.DocImage && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Document Image</label>
                  <div className="mt-1">
                    <img
                      src={`https://prodapi.epressnote.com/uploads/${selectedAd.DocImage}`}
                      className="max-w-xs h-32 object-contain rounded border"
                      alt="Document"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="text-sm text-muted-foreground">Status: </span>
                  {renderStatus(selectedAd.status)}
                </div>
                <div className="flex gap-2">
                  {selectedAd.status !== true && (
                    <Button size="sm" onClick={() => {
                      updateStatus(selectedAd._id, true);
                      setSelectedAd(null);
                    }}>
                      <Check size={14} className="mr-1" /> Approve
                    </Button>
                  )}
                  {selectedAd.status !== false && (
                    <Button size="sm" variant="destructive" onClick={() => {
                      updateStatus(selectedAd._id, false);
                      setSelectedAd(null);
                    }}>
                      <X size={14} className="mr-1" /> Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
