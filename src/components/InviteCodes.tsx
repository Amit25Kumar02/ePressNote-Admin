"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Trash2, Eye, Mail } from "lucide-react";

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

import api from "../../lib/axios";

/* ================= TYPES ================= */

type MediaAgency = {
  _id: string;
  mediaType: string;
  organization: string;
  organizationType: string;
  websiteUrl: string;
  country: string;
  state: string;
  city: string;
  address: string;
  personName: string;
  designation: string;
  phone: string;
  email: string;
  createdAt: string;
};

/* ================= COMPONENT ================= */

export default function MediaOrganizations() {
  const [data, setData] = useState<MediaAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [openView, setOpenView] = useState(false);
  const [selectedAgency, setSelectedAgency] =
    useState<MediaAgency | null>(null);

  const itemsPerPage = 10;

  /* ================= FETCH ================= */

  const fetchMediaAgencies = async () => {
    try {
      const res = await api.get(
        "/api/v1/web/mediaAgency/getMediaAgency"
      );
      setData(res.data?.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaAgencies();
  }, []);

  /* ================= FILTER ================= */

  const filteredData = data.filter(
    (item) =>
      item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media agency?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(
        `/api/v1/web/mediaAgency/deleteMediaAgency?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // toast.success("Advertisement deleted");
      setData((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      alert("Delete failed");
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading...</p>;
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Media Organizations</h1>
        <p className="text-muted-foreground">
          Manage registered media agencies
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Agencies</p>
          <h2 className="text-2xl font-bold">{data.length}</h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Media Types</p>
          <h2 className="text-2xl font-bold">
            {[...new Set(data.map((d) => d.mediaType))].length}
          </h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">States</p>
          <h2 className="text-2xl font-bold">
            {[...new Set(data.map((d) => d.state))].length}
          </h2>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Cities</p>
          <h2 className="text-2xl font-bold">
            {[...new Set(data.map((d) => d.city))].length}
          </h2>
        </Card>
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <Input
            placeholder="Search by organization, email or city"
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
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No media organizations available
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((item) => (
                    <TableRow key={item._id}>
                    <TableCell>
                      <p className="font-medium">{item.organization}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.websiteUrl}
                      </p>
                    </TableCell>

                    <TableCell>{item.organizationType}</TableCell>
                    <TableCell>
                      <Badge className="capitalize">{item.mediaType}</Badge>
                    </TableCell>

                    <TableCell>
                      {item.city}, {item.state}
                    </TableCell>

                    <TableCell>
                      <p>{item.personName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.email}
                      </p>
                    </TableCell>

                    <TableCell>
                      {new Date(item.createdAt).toDateString()}
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-primary text-primary-foreground">
                        Active
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAgency(item);
                            setOpenView(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item._id)}
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
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
          {filteredData.length}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={
              currentPage >=
              Math.ceil(filteredData.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* VIEW MODAL */}
      {openView && selectedAgency && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[90vh] overflow-x-auto shadow-2xl mx-2 sm:mx-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-muted/30">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">Media Organization Details</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Complete information about this organization</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setOpenView(false)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full flex-shrink-0 ml-2"
              >
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-muted/20 rounded-lg p-3 sm:p-4">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Organization Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Organization:</span>
                        <span className="text-sm sm:text-base text-foreground font-medium">{selectedAgency.organization}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Type:</span>
                        <span className="text-sm sm:text-base text-foreground">{selectedAgency.organizationType}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Media Type:</span>
                        <Badge className="capitalize w-fit text-xs">{selectedAgency.mediaType}</Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Website:</span>
                        <a href={selectedAgency.websiteUrl} target="_blank" className="text-sm sm:text-base text-primary underline break-all">
                          {selectedAgency.websiteUrl}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-3 sm:p-4">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Location
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Country:</span>
                        <span className="text-sm sm:text-base text-foreground">{selectedAgency.country}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">State:</span>
                        <span className="text-sm sm:text-base text-foreground">{selectedAgency.state}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">City:</span>
                        <span className="text-sm sm:text-base text-foreground">{selectedAgency.city}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Address:</span>
                        <span className="text-sm sm:text-base text-foreground">{selectedAgency.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-muted/20 rounded-lg p-3 sm:p-4">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Contact Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Contact Person:</span>
                        <span className="text-sm sm:text-base text-foreground font-medium">{selectedAgency.personName}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Designation:</span>
                        <span className="text-sm sm:text-base text-foreground">{selectedAgency.designation}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Phone:</span>
                        <span className="text-sm sm:text-base text-foreground">{selectedAgency.phone}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Email:</span>
                        <span className="text-sm sm:text-base text-primary break-all">{selectedAgency.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Registration Status</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">This organization is currently active and verified.</p>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">Created At:</span>
                      <span className="text-sm sm:text-base text-foreground">{new Date(selectedAgency.createdAt).toDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 border-t border-border bg-muted/30 gap-3 sm:gap-0">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setOpenView(false)}
                  className="border-border"
                >
                  Close
                </Button>
                <Button 
                  size="sm"
                  onClick={() => window.open(`mailto:${selectedAgency.email}`)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground "
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
