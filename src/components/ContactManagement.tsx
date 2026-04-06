"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Eye } from "lucide-react";
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

/* ================= TYPES ================= */

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
};

/* ================= COMPONENT ================= */

export function ContactManagement() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  /* ================= FETCH ================= */

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/v1/web/contactUs?page=${currentPage}&limit=${itemsPerPage}&sort=-createdAt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setContacts(res.data?.contact ?? []);
      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalCount);
      }
    } catch (error) {
      toast.error("Failed to load contacts");
      console.error(error);
      setContacts([]);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  /* ================= DELETE ================= */

  const deleteContact = async (id: string) => {
    if (!confirm("Delete this contact message?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/web/contactUs/deleteContact?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Contact deleted");
      fetchContacts();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  /* ================= FILTER ================= */

  const filteredContacts = contacts.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.subject?.toLowerCase().includes(s) ||
      c.message?.toLowerCase().includes(s)
    );
  });

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="font-semibold text-xl">Contact Us</h1>
        <p className="text-muted-foreground mt-1">
          View & manage contact requests
        </p>
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* TABLE */}
    <div className="grid grid-cols-1">
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  No contact messages available
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone || "--"}</TableCell>
                  <TableCell>{c.subject || "--"}</TableCell>
                  <TableCell style={{maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                    {c.message}
                  </TableCell>
                  <TableCell>
                    {new Date(c.createdAt).toDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedContact(c); setViewModalOpen(true); }}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContact(c._id)}
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
          Showing {totalItems > 0 ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0} to {totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0} of {totalItems} contacts
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
      {/* VIEW MODAL */}
      {viewModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <div>
                <h2 className="text-xl font-semibold">Contact Details</h2>
                <p className="text-sm text-muted-foreground mt-1">Full contact message information</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewModalOpen(false)} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full">
                ✕
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="text-sm font-medium">{selectedContact.name}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium">{selectedContact.email}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm font-medium">{selectedContact.phone || "--"}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <p className="text-sm font-medium">{new Date(selectedContact.createdAt).toDateString()}</p>
                </div>
              </div>
              <div className="bg-muted/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium">{selectedContact.subject || "--"}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-border bg-muted/30">
              <Button variant="outline" size="sm" onClick={() => setViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
