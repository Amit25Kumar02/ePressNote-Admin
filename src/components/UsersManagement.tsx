"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Check, X, Eye, Mail, Trash2 } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);


  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/api/v1/auth/getAllUser?page=${currentPage}&limit=${itemsPerPage}&sort=-createdAt`);
      console.log('API Response:', res.data); // Debug log
      
      // Handle different possible response structures
      const usersData = res.data.users || res.data.data || res.data || [];
      // Sort users by creation date (latest first) on client side as fallback
      const sortedUsers = usersData.sort((a: User, b: User) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUsers(sortedUsers);
      
      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalCount);
      } else {
        // Fallback if no pagination data
        setTotalPages(1);
        setTotalItems(usersData.length);
      }
    } catch (error) {
      toast.error("Error fetching users");
      console.log('Fetch error:', error);
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
        {/* <TabsList className="bg-muted">
          <TabsTrigger value="registered">Registered Users</TabsTrigger>
          <TabsTrigger value="awaiting">
            Awaiting Approval
            <Badge className="ml-1 bg-primary text-primary-foreground">0</Badge>
          </TabsTrigger>
        </TabsList> */}

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
              {/* <Button variant="outline" className="border-border">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button> */}
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
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No users available
                      </TableCell>
                    </TableRow>
                  ) : (
                    users
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setViewModalOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteUser(user._id)}
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

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {totalItems > 0 ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0} to {totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0} of {totalItems} users
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

      {/* VIEW MODAL */}
      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-x-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
              <div>
                <h2 className="text-xl font-semibold text-foreground">User Details</h2>
                <p className="text-sm text-muted-foreground mt-1">Complete information about this user</p>
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
              <div className="space-y-4">
                {/* User Information */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    User Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-sm font-medium text-muted-foreground min-w-[100px]">Full Name:</span>
                      <span className="text-sm text-foreground font-medium">{selectedUser.fullName}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-sm font-medium text-muted-foreground min-w-[100px]">Email:</span>
                      <span className="text-sm text-primary">{selectedUser.email}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-sm font-medium text-muted-foreground min-w-[100px]">Auth Provider:</span>
                      <Badge variant="secondary" className="w-fit">{selectedUser.authProvider}</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-sm font-medium text-muted-foreground min-w-[100px]">Joined Date:</span>
                      <span className="text-sm text-foreground">{new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Account Status</span>
                  </div>
                  <p className="text-xs text-muted-foreground">This user account is currently active and in good standing.</p>
                </div>

                {/* Account Statistics */}
                <div className="bg-muted/20 rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Account Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-card border border-border rounded-lg">
                      <div className="text-lg font-semibold text-primary">Active</div>
                      <div className="text-xs text-muted-foreground">Status</div>
                    </div>
                    <div className="text-center p-3 bg-card border border-border rounded-lg">
                      <div className="text-lg font-semibold text-foreground">
                        {Math.floor((Date.now() - new Date(selectedUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                      <div className="text-xs text-muted-foreground">Member Since</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
             
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
                  onClick={() => window.open(`mailto:${selectedUser.email}`)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
