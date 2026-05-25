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

  // ADD THESE STATES
  const [manualState, setManualState] = useState("");
  const [manualDistrict, setManualDistrict] = useState("");

  // Indian States and Districts (All States & UTs)
  const statesData: { [key: string]: string[] } = {
    "Andhra Pradesh": [
      "Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa",
      "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam",
      "Visakhapatnam", "Vizianagaram", "West Godavari"
    ],

    "Arunachal Pradesh": [
      "Tawang", "West Kameng", "East Kameng", "Papum Pare",
      "Kurung Kumey", "Kra Daadi", "Lower Subansiri",
      "Upper Subansiri", "West Siang", "East Siang"
    ],

    "Assam": [
      "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar",
      "Charaideo", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh",
      "Goalpara", "Golaghat", "Hailakandi", "Jorhat", "Kamrup",
      "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon",
      "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia"
    ],

    "Bihar": [
      "Araria", "Aurangabad", "Banka", "Begusarai", "Bhagalpur",
      "Bhojpur", "Buxar", "Darbhanga", "Gaya", "Katihar",
      "Madhubani", "Muzaffarpur", "Nalanda", "Patna", "Purnia",
      "Rohtas", "Samastipur", "Saran", "Siwan", "Vaishali"
    ],

    "Chhattisgarh": [
      "Balod", "Baloda Bazar", "Bastar", "Bilaspur", "Dantewada",
      "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur",
      "Kabirdham", "Korba", "Koriya", "Mahasamund", "Raigarh",
      "Raipur", "Rajnandgaon", "Surajpur", "Surguja"
    ],

    "Goa": [
      "North Goa", "South Goa"
    ],

    "Gujarat": [
      "Ahmedabad", "Amreli", "Anand", "Banaskantha", "Bharuch",
      "Bhavnagar", "Botad", "Dahod", "Gandhinagar", "Jamnagar",
      "Junagadh", "Kachchh", "Kheda", "Mehsana", "Morbi",
      "Rajkot", "Surat", "Vadodara", "Valsad"
    ],

    "Haryana": [
      "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad",
      "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal",
      "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal",
      "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa",
      "Sonipat", "Yamunanagar"
    ],

    "Himachal Pradesh": [
      "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur",
      "Kullu", "Lahaul and Spiti", "Mandi", "Shimla",
      "Sirmaur", "Solan", "Una"
    ],

    "Jharkhand": [
      "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka",
      "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla",
      "Hazaribagh", "Jamshedpur", "Khunti", "Koderma", "Latehar",
      "Pakur", "Palamu", "Ranchi", "Sahibganj", "West Singhbhum"
    ],

    "Karnataka": [
      "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural",
      "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur",
      "Chikkamagaluru", "Davanagere", "Dharwad", "Gadag",
      "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar",
      "Koppal", "Mandya", "Mangaluru", "Mysuru", "Raichur",
      "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada",
      "Vijayapura", "Yadgir"
    ],

    "Kerala": [
      "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
      "Kollam", "Kottayam", "Kozhikode", "Malappuram",
      "Palakkad", "Pathanamthitta", "Thiruvananthapuram",
      "Thrissur", "Wayanad"
    ],

    "Madhya Pradesh": [
      "Bhopal", "Burhanpur", "Chhindwara", "Dewas", "Dhar",
      "Gwalior", "Indore", "Jabalpur", "Khandwa", "Mandsaur",
      "Morena", "Ratlam", "Rewa", "Sagar", "Satna",
      "Sehore", "Shivpuri", "Ujjain", "Vidisha"
    ],

    "Maharashtra": [
      "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed",
      "Bhandara", "Chandrapur", "Dhule", "Jalgaon", "Kolhapur",
      "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur",
      "Nanded", "Nashik", "Osmanabad", "Palghar", "Pune",
      "Raigad", "Ratnagiri", "Sangli", "Satara", "Solapur",
      "Thane", "Wardha", "Yavatmal"
    ],

    "Manipur": [
      "Bishnupur", "Chandel", "Churachandpur", "Imphal East",
      "Imphal West", "Kakching", "Senapati", "Tamenglong",
      "Thoubal", "Ukhrul"
    ],

    "Meghalaya": [
      "East Garo Hills", "East Khasi Hills", "Jaintia Hills",
      "Ri-Bhoi", "South Garo Hills", "West Garo Hills",
      "West Khasi Hills"
    ],

    "Mizoram": [
      "Aizawl", "Champhai", "Kolasib", "Lawngtlai",
      "Lunglei", "Mamit", "Saiha", "Serchhip"
    ],

    "Nagaland": [
      "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung",
      "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"
    ],

    "Odisha": [
      "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak",
      "Cuttack", "Dhenkanal", "Ganjam", "Jagatsinghpur",
      "Jajpur", "Jharsuguda", "Kalahandi", "Kendrapara",
      "Khordha", "Koraput", "Mayurbhanj", "Puri", "Sambalpur",
      "Sundargarh"
    ],

    "Punjab": [
      "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib",
      "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar",
      "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali",
      "Muktsar", "Nawanshahr", "Pathankot", "Patiala", "Rupnagar",
      "Sangrur", "Tarn Taran"
    ],

    "Rajasthan": [
      "Ajmer", "Alwar", "Baran", "Barmer", "Bharatpur",
      "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu",
      "Dausa", "Ganganagar", "Hanumangarh", "Jaipur", "Jaisalmer",
      "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Kota",
      "Nagaur", "Pali", "Sikar", "Sirohi", "Tonk", "Udaipur"
    ],

    "Sikkim": [
      "East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"
    ],

    "Tamil Nadu": [
      "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
      "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Madurai",
      "Nagapattinam", "Namakkal", "Nilgiris", "Salem",
      "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli",
      "Tirunelveli", "Tiruppur", "Vellore"
    ],

    "Telangana": [
      "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial",
      "Karimnagar", "Khammam", "Mahabubnagar", "Medak",
      "Nalgonda", "Nizamabad", "Rangareddy", "Warangal"
    ],

    "Tripura": [
      "Dhalai", "Gomati", "Khowai", "North Tripura",
      "Sepahijala", "South Tripura", "Unakoti", "West Tripura"
    ],

    "Uttar Pradesh": [
      "Agra", "Aligarh", "Allahabad", "Amethi", "Azamgarh",
      "Bareilly", "Basti", "Firozabad", "Ghaziabad", "Gorakhpur",
      "Jhansi", "Kanpur", "Lucknow", "Mathura", "Meerut",
      "Moradabad", "Noida", "Prayagraj", "Raebareli", "Saharanpur",
      "Sitapur", "Varanasi"
    ],

    "Uttarakhand": [
      "Almora", "Chamoli", "Dehradun", "Haridwar", "Nainital",
      "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal",
      "Udham Singh Nagar", "Uttarkashi"
    ],

    "West Bengal": [
      "Alipurduar", "Bankura", "Birbhum", "Cooch Behar",
      "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri",
      "Kolkata", "Malda", "Murshidabad", "Nadia",
      "North 24 Parganas", "Purulia", "South 24 Parganas"
    ],

    // Union Territories
    "Delhi": [
      "Central Delhi", "East Delhi", "New Delhi", "North Delhi",
      "North East Delhi", "North West Delhi", "Shahdara",
      "South Delhi", "South East Delhi", "South West Delhi",
      "West Delhi"
    ],

    "Jammu and Kashmir": [
      "Anantnag", "Baramulla", "Budgam", "Doda", "Jammu",
      "Kathua", "Kupwara", "Pulwama", "Rajouri", "Srinagar", "Udhampur"
    ],

    "Ladakh": [
      "Kargil", "Leh"
    ],

    "Chandigarh": [
      "Chandigarh"
    ],

    "Puducherry": [
      "Karaikal", "Mahe", "Puducherry", "Yanam"
    ],

    "Andaman and Nicobar Islands": [
      "Nicobar", "North and Middle Andaman", "South Andaman"
    ],

    "Dadra and Nagar Haveli and Daman and Diu": [
      "Dadra and Nagar Haveli", "Daman", "Diu"
    ],

    "Lakshadweep": [
      "Kavaratti"
    ]
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

    // FINAL STATE & DISTRICT
    const finalState =
      selectedState === "other"
        ? manualState.trim()
        : selectedState;

    const finalDistrict =
      selectedDistrict === "other"
        ? manualDistrict.trim()
        : selectedDistrict;

    // CLEAN EMAILS
    const uniqueEmails = [
      ...new Set(
        email
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];

    if (isEPress) {
      if (!finalState || !finalDistrict || uniqueEmails.length === 0) {
        toast.error(
          "For ePress: State, District, and Email are required"
        );
        return;
      }
    } else {
      if (!locations) {
        toast.error("Locations are required");
        return;
      }
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (isEPress) {
        // ePress JSON PAYLOAD
        const payload = {
          state: finalState,
          district: finalDistrict,
          language,
          email: uniqueEmails,
        };

        if (editId) {
          await api.put(
            `/api/v1/admin/epressNewspapers/updateEpressNewspaper?id=${editId}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json",
              },
            }
          );
        } else {
          await api.post(
            "/api/v1/admin/epressNewspapers/createEpressNewspaper",
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json",
              },
            }
          );
        }
      } else {
        // Advertisement mode
        const formData = new FormData();

        formData.append("name", name);
        formData.append("language", language);

        locations
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
          .forEach((loc) => {
            formData.append("locations[]", loc);
          });

        // UNIQUE EMAILS
        uniqueEmails.forEach((emailItem) => {
          formData.append("email[]", emailItem);
        });

        adTypes.forEach((item, index) => {
          formData.append(
            `adType[${index}][addType]`,
            item.addType
          );

          formData.append(
            `adType[${index}][addPrice]`,
            String(Number(item.addPrice))
          );
        });

        if (imageFile) {
          formData.append("image", imageFile);
        }

        if (editId) {
          await api.put(
            `/api/v1/admin/newspapers/${editId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Content-Type": undefined,
              },
            }
          );
        } else {
          await api.post(
            "/api/v1/admin/newspapers",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                "Content-Type": undefined,
              },
            }
          );
        }
      }

      toast.success(
        editId
          ? "Newspaper updated"
          : "Newspaper added"
      );

      fetchNewspapers(currentPage);
      closeModal();
    } catch (err: any) {
      console.error("API ERROR:", err.response?.data);

      toast.error(
        err.response?.data?.message || "Action failed"
      );
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
            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === "adv"
              ? " bg-primary text-primary-foreground rounded-lg"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Advertisement
          </button>
          <button
            onClick={() => setActiveTab("epress")}
            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === "epress"
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
                              src={`${paper.image}`}
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
                        <TableCell className="max-w-[300px]">
                          {paper.email?.length ? (
                            <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto">
                              {paper.email.map((item, index) => (
                                <div
                                  key={index}
                                  className="break-all whitespace-pre-wrap text-sm bg-muted/40 px-2 py-1 rounded "
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
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
                    {/* STATE */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        State
                      </label>

                      <div className="space-y-2">
                        <select
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setSelectedDistrict("");
                          }}
                          className="w-full bg-input-background border border-border px-3 py-2 rounded"
                        >
                          <option value="">Select State</option>
                          <option value="other">Other (Manual Entry)</option>

                          {Object.keys(statesData).map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}

                        </select>

                        {selectedState === "other" && (
                          <input
                            type="text"
                            value={manualState}
                            onChange={(e) => setManualState(e.target.value)}
                            placeholder="Enter State Name"
                            className="w-full bg-input-background border border-border px-3 py-2 rounded"
                          />
                        )}
                      </div>
                    </div>

                    {/* DISTRICT */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        District
                      </label>

                      <div className="space-y-2">
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          disabled={!selectedState}
                          className="w-full bg-input-background border border-border px-3 py-2 rounded disabled:opacity-50"
                        >
                          <option value="">Select District</option>
                          <option value="other">Other (Manual Entry)</option>

                          {statesData[selectedState]?.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}

                        </select>

                        {selectedDistrict === "other" && (
                          <input
                            type="text"
                            value={manualDistrict}
                            onChange={(e) => setManualDistrict(e.target.value)}
                            placeholder="Enter District Name"
                            className="w-full bg-input-background border border-border px-3 py-2 rounded"
                          />
                        )}
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Emails
                      </label>

                      <textarea
                        value={email}
                        onChange={(e) => {
                          const value = e.target.value;

                          // split by comma
                          const emailList = value.split(",");

                          // remove duplicate emails only
                          const uniqueEmails = emailList.filter((item, index, self) => {
                            const cleanEmail = item.trim().toLowerCase();

                            return (
                              cleanEmail === "" ||
                              index ===
                              self.findIndex(
                                (e) => e.trim().toLowerCase() === cleanEmail
                              )
                            );
                          });

                          setEmail(uniqueEmails.join(","));
                        }}
                        placeholder={`Enter multiple emails
abc@gmail.com,
xyz@gmail.com`}
                        rows={3}
                        className="
    w-full
    min-h-[100px]
    resize-none
    overflow-hidden
    bg-input-background
    border
    border-border
    px-3
    py-2
    rounded
  "
                        onInput={(e: any) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                      />

                      <p className="text-xs text-muted-foreground mt-1">
                        Separate multiple emails with commas
                      </p>
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
