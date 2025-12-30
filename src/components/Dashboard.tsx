"use client";

import { useEffect, useState } from "react";
import { Users, Newspaper, LayoutList, Tags, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import api from "../../lib/axios";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    ads: 0,
    newspapers: 0,
    categories: 0,
  });

  const [growth, setGrowth] = useState({
    users: 0,
    ads: 0,
    newspapers: 0,
    categories: 0,
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const usr = localStorage.getItem("user");
    if (usr) setUser(JSON.parse(usr));
    fetchStats();
  }, []);

  const calcGrowthPercent = (current: number, last: number) => {
    if (last === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - last) / last) * 100);
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [usersRes, adsRes, newsRes, catRes] = await Promise.all([
        api.get("/api/v1/auth/getAllUser", { headers }),
        api.get("/api/v1/web/advertisements/getAllAdvertisment", { headers }),
        api.get("/api/v1/admin/newspapers", { headers }),
        api.get("/api/v1/admin/categories", { headers }),
      ]);

      const now = new Date();
      const currMonth = now.getMonth();
      const lastMonth = currMonth === 0 ? 11 : currMonth - 1;

      const usersArr = usersRes.data?.users ?? [];
      const adsArr = adsRes.data?.advertisements ?? [];
      const newsArr = newsRes.data?.newspapers ?? [];
      const catArr = catRes.data?.categories ?? [];

      const pending = adsArr.filter(
        (a: any) =>
          a?.status?.toLowerCase() === "pending" ||
          a?.approved === false ||
          a?.isApproved === false
      );

      const currentUsers = usersArr.filter(
        (u: any) => new Date(u.createdAt).getMonth() === currMonth
      ).length;
      const lastUsers = usersArr.filter(
        (u: any) => new Date(u.createdAt).getMonth() === lastMonth
      ).length;

      const currentAds = adsArr.filter(
        (a: any) => new Date(a.createdAt).getMonth() === currMonth
      ).length;
      const lastAds = adsArr.filter(
        (a: any) => new Date(a.createdAt).getMonth() === lastMonth
      ).length;

      const currentNews = newsArr.filter(
        (n: any) => new Date(n.createdAt).getMonth() === currMonth
      ).length;
      const lastNews = newsArr.filter(
        (n: any) => new Date(n.createdAt).getMonth() === lastMonth
      ).length;

      const currentCategory = catArr.filter(
        (c: any) => new Date(c.createdAt).getMonth() === currMonth
      ).length;
      const lastCategory = catArr.filter(
        (c: any) => new Date(c.createdAt).getMonth() === lastMonth
      ).length;

      setStats({
        users: usersArr.length,
        ads: adsArr.length,
        newspapers: newsArr.length,
        categories: catArr.length,
      });

      setGrowth({
        users: calcGrowthPercent(currentUsers, lastUsers),
        ads: calcGrowthPercent(currentAds, lastAds),
        newspapers: calcGrowthPercent(currentNews, lastNews),
        categories: calcGrowthPercent(currentCategory, lastCategory),
      });

      setRecentUsers(usersArr.slice(0, 5));
      setPendingAds(pending.slice(0, 5));
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveAd = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.patch(`/api/v1/admin/advertisements/approve/${id}`, {}, { headers });
      setPendingAds((prev) => prev.filter((ad) => ad._id !== id && ad.id !== id));
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  const statCards = [
    { label: "Total Users", value: stats.users, change: growth.users, icon: Users },
    { label: "Advertisements", value: stats.ads, change: growth.ads, icon: LayoutList },
    { label: "Newspapers", value: stats.newspapers, change: growth.newspapers, icon: Newspaper },
    { label: "Categories", value: stats.categories, change: growth.categories, icon: Tags },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your platform's key metrics and activity</p>
      </div>

      {/* STATS UI LIKE SAMPLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <Card key={index} className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {loading ? "..." : stat.value}
                  </h2>
                  <p className={`text-sm mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? `+${stat.change}%` : `${stat.change}%`} from last month
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 2 SIDE SECTION LIKE SAMPLE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="p-6 bg-card border-border">
          <h3 className="mb-4 font-semibold">Recent Registered Users</h3>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : recentUsers.length === 0 ? (
            <p className="text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((u: any, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-none">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1">
                    <p>{u.fullName || u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending ads like "pending approvals" */}
        <Card className="p-6 bg-card border-border">
          <h3 className="mb-4 font-semibold">Pending Advertisements</h3>
          {pendingAds.length === 0 ? (
            <p className="text-muted-foreground">No pending ads</p>
          ) : (
            <div className="space-y-4">
              {pendingAds.map((ad: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p>{ad.adTitle || ad.title || "Ad Title"}</p>
                    <p className="text-sm text-muted-foreground">{ad.contactInfo || ad.email || ""}</p>
                  </div>
                  <Button className="text-xs" onClick={() => approveAd(ad._id || ad.id)}>
                    Approve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
