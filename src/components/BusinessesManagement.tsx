"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Eye, MapPin, Mail, Calendar, Newspaper, Trash2, MoreVertical } from "lucide-react";

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

type Advertisement = {
  _id: string;
  adType: string;
  adTitle: string;
  adDescription: string;
  contactInfo: string;
  publicationDate: string;
  price?: number;
  city?: string;
  language?: string;
  category?: string;
  newspaper?: string;
};

export default function AdvertisementsManagement() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const API_BASE = "http://13.200.174.224:83/api/v1/web/advertisements";

  useEffect(() => {
    fetchAds();
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

  const fetchAds = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/v1/web/advertisements/getAllAdvertisment`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAds(res.data.advertisements);
    } catch (error) {
      toast.error("Error loading ads");
      console.log(error);
    }
  };

  const deleteAd = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this advertisement?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/web/advertisements/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Advertisement deleted");
      fetchAds()
      if (selectedAd?._id === id) setSelectedAd(null);
    } catch (error) {
      toast.error("Failed to delete");
      console.log(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl">Advertisements</h1>
          <p className="text-muted-foreground mt-1">
            View & manage user advertisements
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ads by title, type or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Table */}
        <div className="lg:col-span-3">
          <Card className="bg-card border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ads
                  .filter((a) =>
                    a.adTitle.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((ad) => (
                    <TableRow
                      key={ad._id}
                      className="border-border hover:bg-muted/50"
                    >
                      <TableCell
                        className="cursor-pointer"
                        onClick={() => setSelectedAd(ad)}
                      >
                        {ad.adTitle}
                      </TableCell>
                      <TableCell><Badge variant="secondary">{ad.adType}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{ad.city || "--"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{ad.language || "--"}</TableCell>
                      <TableCell className="text-primary font-semibold">{ad.price ? `₹${ad.price}` : "--"}</TableCell>

                      <TableCell className="text-right relative dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === ad._id ? null : ad._id);
                          }}
                          className="p-1 hover:bg-muted rounded cursor-pointer"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openDropdown === ad._id && (
                          <div className="absolute right-0 top-8 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAd(ad);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-primary rounded-t-lg cursor-pointer"
                            >
                              <Eye size={14} /> View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAd(ad._id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive rounded-b-lg cursor-pointer"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {ads.length} results
            </p>
          </div>
        </div>

        {/* Details Side Panel */}
        {/* <div>
          <Card className="p-6 bg-card border-border sticky top-6">
            {selectedAd ? (
              <div className="space-y-4">
                <h3 className="font-semibold">{selectedAd.adTitle}</h3>
                <Badge variant="secondary" className="mt-1">
                  {selectedAd.adType}
                </Badge>

                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex gap-3">
                    <Newspaper className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{selectedAd.newspaper || "--"}</p>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{selectedAd.city || "--"}</p>
                  </div>

                  <div className="flex gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{selectedAd.contactInfo}</p>
                  </div>

                  <div className="flex gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">
                      {new Date(selectedAd.publicationDate).toDateString()}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {selectedAd.adDescription}
                  </p>

                  {selectedAd.price && (
                    <p className="font-semibold text-primary">
                      Price: ₹{selectedAd.price}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Select an advertisement to view details
                </p>
              </div>
            )}
          </Card>
        </div> */}
      </div>
    </div>
  );
}
