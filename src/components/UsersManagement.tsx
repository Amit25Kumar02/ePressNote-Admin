"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Check, X, Eye, Mail, Trash2, MoreVertical } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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

type User = {
  _id: string;
  fullName: string;
  email: string;
  authProvider: string;
  createdAt: string;
};

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("registered");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);


  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/v1/auth/getAllUser");
      setUsers(res.data.users);
    } catch (error) {
      toast.error("Error fetching users");
      console.log(error);
    }
  };

  const deleteUser = async (id: string) => {
    const confirm = window.confirm("Delete this user?");
    if (!confirm) return;

    try {
      await api.delete(`/api/v1/auth/deleteUser/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete");
      console.log(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Users Management</h1>
        <p className="text-muted-foreground mt-1">Manage registered users and approval requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="registered">Registered Users</TabsTrigger>
          <TabsTrigger value="awaiting">
            Awaiting Approval
            <Badge className="ml-1 bg-primary text-primary-foreground">0</Badge>
          </TabsTrigger>
        </TabsList>

        {/* === REGISTERED USERS TAB === */}
        <TabsContent value="registered" className="mt-6 space-y-4">
          {/* SEARCH BAR */}
          <Card className="p-3 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>
              <Button variant="outline" className="border-border">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-card border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users
                    .filter(
                      u =>
                        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                      <TableRow key={user._id} className="border-border">
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.createdAt).toDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.authProvider}</Badge>
                        </TableCell>
                        <TableCell className="text-right relative dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === user._id ? null : user._id);
                            }}
                            className="p-1 hover:bg-muted rounded cursor-pointer"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {openDropdown === user._id && (
                            <div className="absolute right-0 top-8 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[140px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add view functionality here
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-primary rounded-t-lg cursor-pointer"
                              >
                                <Eye size={14} /> View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add contact functionality here
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 text-primary cursor-pointer"
                              >
                                <Mail size={14} /> Contact
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteUser(user._id);
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
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {users.length} of {users.length} users
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="border-border">
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled className="border-border">
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* === AWAITING APPROVAL TAB (Placeholder) === */}
        <TabsContent value="awaiting" className="mt-6 space-y-4">
          <Card className="p-4 bg-card border-border">
            <p className="text-muted-foreground text-sm">
              No pending user approval requests found.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
