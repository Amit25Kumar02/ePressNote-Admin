"use client";

import { useState, useEffect } from "react";
import { Search, Eye, EyeOff, Trash2, Plus, Pencil, X, Mail } from "lucide-react";
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

type Role = {
  _id: string;
  fullName: string;
  email: string;
  role?: string;
  createdAt: string;
};

export default function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRoles();
  }, [currentPage]);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/v1/admin/auth/getaAllManager?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
      });
      setRoles(res.data?.users || res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalItems(res.data?.pagination?.totalItems || res.data?.pagination?.totalCount || 0);
    } catch {
      toast.error("Failed to load roles");
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setName("");
    setEmail("");
    setPassword("");
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditId(role._id);
    setName(role.fullName);
    setEmail(role.email);
    setPassword("");
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }
    if (!editId && !password) {
      toast.error("Password is required");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload: any = { fullName: name, email };
      if (password) payload.password = password;

      if (editId) {
        await api.patch(`/api/v1/admin/auth/updateManager/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
        });
        toast.success("Role updated");
      } else {
        await api.post("/api/v1/admin/auth/addManager", payload, {
          headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
        });
        toast.success("Role added");
      }
      setModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/v1/admin/auth/deleteManager/${id}`, {
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
      });
      toast.success("Role deleted");
      fetchRoles();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Roles Management</h1>
          <p className="text-muted-foreground">View & manage admin roles</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus size={16} /> Add Role
        </Button>
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
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
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No roles available
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell className="font-medium">{role.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{role.email}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(role.createdAt).toDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedRole(role); setViewModalOpen(true); }} className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(role)} className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                          <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(role._id)} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
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
          Showing {totalItems > 0 ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} roles
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border w-full max-w-md rounded-xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-medium">{editId ? "Edit Role" : "Add Role"}</h2>
              <button onClick={() => setModalOpen(false)} className="cursor-pointer"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" autoComplete="off" className="w-full bg-input-background border border-border px-3 py-2 rounded outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" type="email" autoComplete="off" className="w-full bg-input-background border border-border px-3 py-2 rounded outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password {editId && <span className="text-muted-foreground text-xs">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type={showPassword ? "text" : "password"} autoComplete="new-password" className="w-full bg-input-background border border-border px-3 py-2 pr-10 rounded outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="w-full bg-primary text-primary-foreground py-2 rounded cursor-pointer">
                {loading ? "Saving..." : editId ? "Update Role" : "Add Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModalOpen && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <div>
                <h2 className="text-xl font-semibold">Role Details</h2>
                <p className="text-sm text-muted-foreground mt-1">Complete information about this role</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewModalOpen(false)} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full">✕</Button>
            </div>
            <div className="p-6">
              <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-[80px]">Name:</span>
                  <span className="text-sm font-medium">{selectedRole.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-[80px]">Email:</span>
                  <span className="text-sm text-primary">{selectedRole.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground min-w-[80px]">Created:</span>
                  <span className="text-sm">{new Date(selectedRole.createdAt).toDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30">
              <Button variant="outline" size="sm" onClick={() => setViewModalOpen(false)}>Close</Button>
              <Button size="sm" onClick={() => { setViewModalOpen(false); openEditModal(selectedRole); }} className="bg-primary text-primary-foreground">
                <Pencil className="w-4 h-4 mr-2" /> Edit Role
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
