"use client";

import { useEffect, useState } from "react";
import { Search, Eye, Trash2 } from "lucide-react";

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


type PressNote = {
  _id: string;
  fullName: string;
  CompanyName: string;
  role?: string;
  email: string;
  phone?: number;
  state?: string;
  district?: string;
  city?: string;
  address?: string;
  content: string | {
    contentText?: string;
    contentImage?: { url: string; description?: string; _id?: string }[];
    _id?: string;
  }[];
  publishInState?: string;
  publishInDistrict?: string;
  publishInCity?: string;
  view?: number;
  addImage?: string;
  createdAt: string;
};



export function PressNoteManagement() {
  const [notes, setNotes] = useState<PressNote[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<PressNote | null>(null);

  const handlePrint = () => {
    if (!selectedNote) return;
    
    const printContent = `
      <html>
        <head>
          <title>Press Note - ${selectedNote.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #333; }
            .content { margin-top: 20px; padding: 15px; border: 1px solid #ddd; background: #f9f9f9; }
            .two-column { display: flex; gap: 30px; }
            .column { flex: 1; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Press Note</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="two-column">
            <div class="column">
              <div class="section">
                <h3>Personal Information</h3>
                <p><span class="label">Name:</span> ${selectedNote.fullName}</p>
                <p><span class="label">Company:</span> ${selectedNote.CompanyName}</p>
                <p><span class="label">Email:</span> ${selectedNote.email}</p>
                <p><span class="label">Phone:</span> ${selectedNote.phone || 'N/A'}</p>
              </div>
              
              <div class="section">
                <h3>Location Details</h3>
                <p><span class="label">State:</span> ${selectedNote.state || 'N/A'}</p>
                <p><span class="label">District:</span> ${selectedNote.district || 'N/A'}</p>
                <p><span class="label">City:</span> ${selectedNote.city || 'N/A'}</p>
                <p><span class="label">Address:</span> ${selectedNote.address || 'N/A'}</p>
              </div>
            </div>
            
            <div class="column">
              <div class="section">
                <h3>Publishing Information</h3>
                <p><span class="label">Publish State:</span> ${selectedNote.publishInState || 'N/A'}</p>
                <p><span class="label">Publish District:</span> ${selectedNote.publishInDistrict || 'N/A'}</p>
                <p><span class="label">Publish City:</span> ${selectedNote.publishInCity || 'N/A'}</p>
                <p><span class="label">Created:</span> ${new Date(selectedNote.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3>Press Note Content</h3>
            <div class="content">
              ${typeof selectedNote.content === 'string'
                ? selectedNote.content.replace(/style="[^"]*"/g, '')
                : Array.isArray(selectedNote.content)
                  ? selectedNote.content.map(item => item.contentText || '').join('<br/>')
                  : ''
              }
            </div>
          </div>
          
          ${selectedNote.addImage ? `
          <div class="section">
            <h3>Attached Image</h3>
            <img src="https://prodapi.epressnote.com/uploads/${selectedNote.addImage}" style="max-width: 100%; height: auto; border: 1px solid #ddd; margin-top: 10px;" />
          </div>
          ` : ''}
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

 

  const fetchPressNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/v1/web/pressNotes/getAllPressNote?page=${currentPage}&limit=${itemsPerPage}&sort=-createdAt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes(res.data?.pressNotes ?? []);
      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalItems);
      }
    } catch (error) {
      toast.error("Failed to load press notes");
      console.error(error);
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchPressNotes();
  }, [currentPage]);

 

  const deletePressNote = async (id: string) => {
    if (!confirm("Delete this press note?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/web/pressNotes/deletePressNote?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Press note deleted");
      fetchPressNotes();
      setSelectedNote(null);
    } catch {
      toast.error("Delete failed");
    }
  };

 

  const filteredNotes = notes.filter((n) => {
    const s = searchTerm.toLowerCase();
    return (
      n.fullName?.toLowerCase().includes(s) ||
      n.CompanyName?.toLowerCase().includes(s) ||
      n.email?.toLowerCase().includes(s)
    );
  });

 

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="font-semibold text-xl">Press Notes</h1>
        <p className="text-muted-foreground mt-1">
          View & manage user press notes
        </p>
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* TABLE */}
      <div className="grid grid-cols-1">
      <Card className="overflow-hidden">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Name</TableHead>
              <TableHead className="w-[120px]">Company</TableHead>
              <TableHead className="w-[150px]">Email</TableHead>
              <TableHead className="w-[100px]">Publish State</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No press notes available
                </TableCell>
              </TableRow>
            ) : (
              filteredNotes.map((note) => (
                <TableRow key={note._id}>
                  <TableCell>{note.fullName}</TableCell>
                  <TableCell>{note.CompanyName}</TableCell>
                  <TableCell>{note.email}</TableCell>
                  <TableCell>{note.publishInState || "--"}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedNote(note);
                          setViewModalOpen(true);
                        }}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePressNote(note._id)}
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
          Showing {totalItems > 0 ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0} to {totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0} of {totalItems} press notes
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
      {viewModalOpen && selectedNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-x-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Press Note Details</h2>
                <p className="text-sm text-muted-foreground mt-1">Complete information about this press note</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewModalOpen(false)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
              >
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Personal Info */}
                <div className="space-y-4">
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Name:</span>
                        <span className="text-sm text-foreground">{selectedNote.fullName}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Company:</span>
                        <span className="text-sm text-foreground">{selectedNote.CompanyName}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Email:</span>
                        <span className="text-sm text-primary">{selectedNote.email}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Phone:</span>
                        <span className="text-sm text-foreground">{selectedNote.phone || "--"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Location Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">State:</span>
                        <span className="text-sm text-foreground">{selectedNote.state || "--"}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">District:</span>
                        <span className="text-sm text-foreground">{selectedNote.district || "--"}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">City:</span>
                        <span className="text-sm text-foreground">{selectedNote.city || "--"}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[80px]">Address:</span>
                        <span className="text-sm text-foreground">{selectedNote.address || "--"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Publishing Info & Image */}
                <div className="space-y-4">
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Publishing Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[100px]">Publish State:</span>
                        <span className="text-sm text-foreground">{selectedNote.publishInState || "--"}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[100px]">Publish District:</span>
                        <span className="text-sm text-foreground">{selectedNote.publishInDistrict || "--"}</span>
                      </div>
                      {/* <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[100px]">Publish City:</span>
                        <span className="text-sm text-foreground">{selectedNote.publishInCity || "--"}</span>
                      </div> */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[100px]">Created:</span>
                        <span className="text-sm text-foreground">{new Date(selectedNote.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedNote.addImage && (
                    <div className="bg-muted/20 rounded-lg p-4">
                      <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Attached Image
                      </h3>
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img 
                          src={`${selectedNote.addImage}`}
                          alt="Press Note Image"
                          className="w-full h-auto object-cover"
                          style={{ maxHeight: '250px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section - Full Width */}
              <div className="mt-6 bg-muted/20 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Press Note Content
                </h3>
                <div className="bg-card border border-border rounded-lg p-4">
                  {typeof selectedNote.content === 'string' ? (
                    <div
                      className="text-sm text-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: selectedNote.content.replace(/style="[^"]*"/g, '')
                      }}
                    />
                  ) : Array.isArray(selectedNote.content) ? (
                    <div className="space-y-4">
                      {selectedNote.content.map((item, index) => (
                        <div key={item._id || index} className="border-b border-border pb-4 last:border-b-0">
                          {item.contentText && (
                            <div
                              className="text-sm text-foreground leading-relaxed mb-2"
                              dangerouslySetInnerHTML={{
                                __html: item.contentText
                                  .replace(/style="[^"]*"/g, '')
                                  .replace(/\n/g, '<br/>')
                              }}
                            />
                          )}
                          {item.contentImage && Array.isArray(item.contentImage) && item.contentImage.length > 0 && (
                            <div className="space-y-2 mt-2">
                              {item.contentImage.map((img) => (
                                <div key={img._id}>
                                  <img
                                    src={`${img.url}`}
                                    alt={img.description || "Content Image"}
                                    className="max-w-full h-auto rounded border"
                                    style={{ maxHeight: '200px' }}
                                  />
                                  {img.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{img.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No content available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
              {/* <div className="text-xs text-muted-foreground">
                Press Note ID: {selectedNote._id}
              </div> */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewModalOpen(false)}
                  className="border-border"
                >
                  Close
                </Button>
                <Button 
                  size="sm"
                  onClick={handlePrint}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Print
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
