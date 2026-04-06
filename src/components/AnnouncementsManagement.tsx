"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Check,
  X,
  Eye,
} from "lucide-react";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import api from "../../lib/axios";
import { toast } from "sonner";

/* ================= TYPES ================= */

type Advertisement = {
  _id: string;
  adType: string;
  adTitle: string;
  adDescription: string;
  contactInfo: string;
  publicationDate: string;
  price: number;
  city: string;
  language: string;
  views: number;
  status?: boolean;
  category?: {
    _id: string;
    name: string;
  };
};

/* ================= COMPONENT ================= */

export default function AdvertisementsManagement() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  /* ================= FETCH ================= */

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        "/api/v1/web/advertisements/getAllAdvertisment",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAds(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load advertisements");
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  /* ================= APPROVE / REJECT ================= */

  const updateStatus = async (id: string, status: boolean) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.put(
        "/api/v1/web/advertisements/updatedvertisement",
        { status },
        {
          params: { id },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success === false) {
        toast.error(res.data.message || "Status update failed");
        return;
      }

      toast.success(
        status ? "Advertisement approved" : "Advertisement rejected"
      );

      fetchAds();
    } catch (error: any) {
      console.error("UPDATE STATUS ERROR:", error);
      toast.error(
        error?.response?.data?.message || "Status update failed"
      );
    }
  };


  /* ================= FILTER ================= */

  const filteredAds = ads.filter(
    (ad) =>
      ad.adTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Advertisements</h1>
        <p className="text-muted-foreground">
          Review & approve advertisements
        </p>
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <Input
          placeholder="Search by title or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* TABLE */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAds.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No advertisements available
                </TableCell>
              </TableRow>
            ) : (
              filteredAds.map((ad) => (
                <TableRow key={ad._id}>
                  <TableCell>
                    <p className="font-medium">{ad.adTitle}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {ad.adDescription}
                    </p>
                  </TableCell>

                  <TableCell>
                    {ad.category?.name || "--"}
                  </TableCell>

                  <TableCell className="capitalize">{ad.adType}</TableCell>

                  <TableCell>{ad.city}</TableCell>

                  <TableCell>₹{ad.price}</TableCell>

                  <TableCell>
                    {ad.status === true ? (
                      <Badge
                        onClick={() => updateStatus(ad._id, true)}
                        className="cursor-pointer bg-green-600 text-white"
                      >
                        Approved
                      </Badge>
                    ) : ad.status === false ? (
                      <Badge className="bg-red-600 text-white">
                        Rejected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAd(ad);
                        setViewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateStatus(ad._id, true)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => updateStatus(ad._id, false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* VIEW MODAL */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advertisement Details</DialogTitle>
          </DialogHeader>

          {selectedAd && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="font-medium mb-2">Basic Information</p>
                  <div className="space-y-2">
                    <p><span className="font-medium">Title:</span> {selectedAd.adTitle}</p>
                    <p><span className="font-medium">Category:</span> {selectedAd.category?.name || "--"}</p>
                    <p><span className="font-medium">Type:</span> {selectedAd.adType}</p>
                  </div>
                </div>
                
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="font-medium mb-2">Location & Language</p>
                  <div className="space-y-2">
                    <p><span className="font-medium">City:</span> {selectedAd.city}</p>
                    <p><span className="font-medium">Language:</span> {selectedAd.language}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="font-medium mb-2">Pricing & Contact</p>
                  <div className="space-y-2">
                    <p><span className="font-medium">Price:</span> ₹{selectedAd.price}</p>
                    <p><span className="font-medium">Contact:</span> {selectedAd.contactInfo}</p>
                    <p><span className="font-medium">Publish Date:</span> {new Date(selectedAd.publicationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-muted/20 rounded-lg p-3">
                <p className="font-medium mb-2">Description</p>
                <p className="text-sm leading-relaxed">{selectedAd.adDescription}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setViewOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
