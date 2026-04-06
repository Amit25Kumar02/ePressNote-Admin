"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import api from "../../lib/axios";
import { toast, ToastContainer } from "react-toastify";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import "react-toastify/dist/ReactToastify.css";

type AdType = {
  addType: string;
  addPrice: number | string;
};

type Newspaper = {
  _id: string;
  name: string;
  email?: string[];
  language: string;
  locations: string[];
  image?: string;
  adType: AdType[];
  // isEPress?: boolean;
  state?: string;
  district?: string;
};

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://prodapi.epressnote.com";

export default function NewspapersPage() {
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNewspapers, setTotalNewspapers] = useState(0);

  const itemsPerPage = 10;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("");
  const [locations, setLocations] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEPress, setIsEPress] = useState(false);
  const [activeTab, setActiveTab] = useState<"adv" | "epress">("adv");

  // Indian States and Districts
  const statesData: { [key: string]: string[] } = {
    "Haryana": ["Hisar", "Sirsa", "Fatehabad", "Jind", "Rohtak", "Sonipat", "Panipat", "Karnal", "Ambala", "Kurukshetra"],
    "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur"],
    "Delhi": ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Allahabad"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
  };

  //  adType dynamic state
  const DEFAULT_ADTYPES: AdType[] = [
    { addType: "classified", addPrice: "" },
    { addType: "classifiedDisplay", addPrice: "" },
  ];

  const [adTypes, setAdTypes] = useState<AdType[]>(DEFAULT_ADTYPES);


  useEffect(() => {
    fetchNewspapers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab]);

  const fetchNewspapers = async (page = 1) => {
    try {
      const endpoint = activeTab === "adv" 
        ? `/api/v1/admin/newspapers?page=${page}&limit=${itemsPerPage}&sort=-createdAt&isEPress=false`
        : `/api/v1/admin/epressNewspapers/getEpressNewspaper?page=${page}&limit=${itemsPerPage}`;
      
      const res = await api.get(endpoint, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
      });

      const list = res.data?.newspapers || res.data?.data || [];
      setNewspapers(list);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalNewspapers(res.data?.pagination?.totalItems || list.length || 0);
    } catch (err: any) {
      console.log("GET ERROR =>", err?.response?.data || err.message);
      toast.error("Failed to load newspapers");
    }
  };

  /* ================= MODAL OPEN/CLOSE ================= */
  const openAddModal = () => {
    resetForm();
    setIsEPress(activeTab === "epress");
    setOpen(true);
  };

  const openEditModal = (paper: Newspaper) => {
    setEditId(paper._id);
    setName(paper.name);
    setEmail(Array.isArray(paper.email) ? paper.email.join(",") : paper.email || "");
    setLanguage(paper.language);
    
    const isEPressNewspaper = paper.isEPress || activeTab === "epress";
    setIsEPress(isEPressNewspaper);
    
    if (isEPressNewspaper) {
      setSelectedState(paper.state || paper.locations?.[0] || "");
      setSelectedDistrict(paper.district || paper.locations?.[1] || "");
    } else {
      setLocations(paper.locations?.join(",") || "");
      
      //  merge default types with existing prices
      const updated = DEFAULT_ADTYPES.map((d) => {
        const found = paper.adType?.find(
          (x) => x.addType.toLowerCase() === d.addType.toLowerCase()
        );
        return {
          addType: d.addType,
          addPrice: found?.addPrice ?? "",
        };
      });
      setAdTypes(updated);
    }

    setImageFile(null);
    setOpen(true);
  };


  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setEmail("");
    setLanguage("");
    setLocations("");
    setSelectedState("");
    setSelectedDistrict("");
    setImageFile(null);
    setAdTypes(DEFAULT_ADTYPES);
    setIsEPress(false);
  };


  const updateAdTypeRow = (
    index: number,
    field: "addType" | "addPrice",
    value: any
  ) => {
    setAdTypes((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!language) {
      toast.error("Language is required");
      return;
    }

    if (!isEPress && !name) {
      toast.error("Name is required for Advertisement newspapers");
      return;
    }

    if (isEPress) {
      if (!selectedState || !selectedDistrict || !email) {
        toast.error("For ePress: State, District, and Email are required");
        return;
      }
    } else {
      if (!locations) {
        toast.error("Locations are required");
        return;
      }
    }

    if (!isEPress) {
      const hasInvalidAdType = adTypes.some(
        (a) => !a.addType || a.addPrice === "" || Number(a.addPrice) <= 0
      );

      // if (hasInvalidAdType) {
      //   toast.error("Please fill all Ad Types with valid price");
      //   return;
      // }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (isEPress) {
        // ePress mode: send as JSON
        const payload = {
          state: selectedState,
          district: selectedDistrict,
          language: language,
          email: email
        };

        if (editId) {
          await api.put(`/api/v1/admin/epressNewspapers/updateEpressNewspaper?id=${editId}`, payload, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json"
            },
          });
        } else {
          await api.post("/api/v1/admin/epressNewspapers/createEpressNewspaper", payload, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json"
            },
          });
        }
      } else {
        // Advertisement mode: send as FormData
        const formData = new FormData();
        formData.append("name", name);
        formData.append("language", language);
        
        locations.split(",").map((l) => l.trim()).filter(Boolean).forEach((loc) => {
          formData.append("locations[]", loc);
        });
        
        if (email) {
          email.split(",").map((e) => e.trim()).filter(Boolean).forEach((emailItem) => {
            formData.append("email[]", emailItem);
          });
        }

        adTypes.forEach((item, index) => {
          formData.append(`adType[${index}][addType]`, item.addType);
          formData.append(
            `adType[${index}][addPrice]`,
            String(Number(item.addPrice))
          );
        });

        if (imageFile) {
          formData.append("image", imageFile);
        }

        if (editId) {
          await api.put(`/api/v1/admin/newspapers/${editId}`, formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
              "Content-Type": undefined
            },
          });
        } else {
          await api.post("/api/v1/admin/newspapers", formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
              "Content-Type": undefined
            },
          });
        }
      }
      
      toast.success(editId ? "Newspaper updated" : "Newspaper added");

      fetchNewspapers(currentPage);
      closeModal();
    } catch (err: any) {
      console.error("API ERROR:", err.response?.data);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this newspaper?")) return;

    try {
      const token = localStorage.getItem("token");
      const endpoint = activeTab === "epress"
        ? `/api/v1/admin/epressNewspapers/deleteEpressNewspaper?id=${id}`
        : `/api/v1/admin/newspapers/${id}`;
      
      await api.delete(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        },
      });
      toast.success("Newspaper deleted");
      fetchNewspapers(currentPage);
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= FILTER (SEARCH) ================= */
  const filteredNewspapers = newspapers.filter((paper) => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === "epress") {
      return (
        paper.state?.toLowerCase().includes(searchLower) ||
        paper.district?.toLowerCase().includes(searchLower) ||
        paper.language?.toLowerCase().includes(searchLower) ||
        paper.email?.some(e => e.toLowerCase().includes(searchLower))
      );
    } else {
      return paper.name?.toLowerCase().includes(searchLower);
    }
  });

  const displayNewspapers = filteredNewspapers;

  return (
    <>
      <ToastContainer />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Newspapers</h1>
            <p className="text-muted-foreground">View & manage newspapers</p>
          </div>

          <Button onClick={openAddModal} className="flex items-center gap-2">
            <Plus size={16} /> Add Newspaper
          </Button>
        </div>

        {/* SEARCH */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* TABS */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("adv")}
            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
              activeTab === "adv"
                ? " bg-primary text-primary-foreground rounded-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Advertisement
          </button>
          <button
            onClick={() => setActiveTab("epress")}
            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
              activeTab === "epress"
                ? "bg-primary text-primary-foreground rounded-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            PressNote
          </button>
        </div>

        {/* TABLE */}
        <div className="grid grid-cols-1">
          <Card>
            {activeTab === "adv" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Ad Types</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayNewspapers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No advertisement newspapers available
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayNewspapers.map((paper) => (
                      <TableRow key={paper._id}>
                        <TableCell>
                          {paper.image ? (
                            <img
                              src={`${BACKEND_URL}/uploads/${paper.image}`}
                              className="w-14 h-8 object-contain"
                              alt={paper.name}
                            />
                          ) : (
                            <ImageIcon size={18} />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{paper.name}</TableCell>
                        <TableCell>{paper.language}</TableCell>
                        <TableCell>{paper.locations?.join(", ")}</TableCell>
                        <TableCell>
                          {paper.adType?.length
                            ? paper.adType.map((a) => `${a.addType} (₹${Number(a.addPrice) || 0})`).join(", ")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(paper)}
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(paper._id)}
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead>Name</TableHead> */}
                    <TableHead>State</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayNewspapers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No ePress newspapers available
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayNewspapers.map((paper) => (
                      <TableRow key={paper._id}>
                        {/* <TableCell className="font-medium">{paper.name}</TableCell> */}
                        <TableCell>{paper.state || paper.locations?.[0] || "-"}</TableCell>
                        <TableCell>{paper.district || paper.locations?.[1] || "-"}</TableCell>
                        <TableCell>{paper.language}</TableCell>
                        <TableCell>{paper.email?.join(", ") || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(paper)}
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(paper._id)}
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
            )}
          </Card>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              totalNewspapers
            )}{" "}
            to {Math.min(currentPage * itemsPerPage, totalNewspapers)} of{" "}
            {totalNewspapers} newspapers
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
                <h2 className="text-lg font-medium">
                  {editId ? "Edit Newspaper" : "Add Newspaper"}
                </h2>

                <button onClick={closeModal} className="cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {!isEPress && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Newspaper Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Newspaper name"
                      className="w-full bg-input-background border border-border px-3 py-2 rounded"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="Language"
                    className="w-full bg-input-background border border-border px-3 py-2 rounded"
                  />
                </div>

                {isEPress ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setSelectedDistrict("");
                        }}
                        className="w-full bg-input-background border border-border px-3 py-2 rounded"
                      >
                        <option value="">Select State</option>
                        {Object.keys(statesData).map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">District</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        disabled={!selectedState}
                        className="w-full bg-input-background border border-border px-3 py-2 rounded disabled:opacity-50"
                      >
                        <option value="">Select District</option>
                        {selectedState && statesData[selectedState]?.map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="w-full bg-input-background border border-border px-3 py-2 rounded"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">Locations</label>
                    <input
                      value={locations}
                      onChange={(e) => setLocations(e.target.value)}
                      placeholder="Locations (comma separated)"
                      className="w-full bg-input-background border border-border px-3 py-2 rounded"
                    />
                  </div>
                )}

                {!isEPress && (
                  <>
                    {/* AD TYPE */}
                    <div className="border border-border rounded p-3 space-y-3">
                      <p className="font-medium text-sm">Ad Types (Fixed)</p>

                      {adTypes.map((row, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2">
                          {/* Fixed type */}
                          <input
                            value={row.addType}
                            readOnly
                            className="w-full bg-muted border border-border px-3 py-2 rounded text-muted-foreground"
                          />

                          {/* ✅ Custom price */}
                          <input
                            value={row.addPrice}
                            type="number"
                            onChange={(e) =>
                              updateAdTypeRow(index, "addPrice", e.target.value)
                            }
                            placeholder="Price"
                            className="w-full bg-input-background border border-border px-3 py-2 rounded"
                          />
                        </div>
                      ))}
                    </div>

                    {/* IMAGE UPLOAD */}
                    <label className="flex gap-2 items-center border border-border px-3 py-2 rounded cursor-pointer">
                      <ImageIcon size={16} />
                      Upload Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files && setImageFile(e.target.files[0])
                        }
                      />
                    </label>

                    {imageFile && (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        className="w-16 h-10 object-contain"
                      />
                    )}
                  </>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2 rounded cursor-pointer"
                >
                  {loading
                    ? "Saving..."
                    : editId
                      ? "Update Newspaper"
                      : "Add Newspaper"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
