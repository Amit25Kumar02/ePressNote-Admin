"use client";

import { useEffect, useState } from "react";
import { Users, Newspaper, LayoutList, Tags } from "lucide-react";
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
      // const token = localStorage.getItem("token");
      
      // If using demo token, show mock data
     

      // const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [usersRes, adsRes, newsRes, catRes] = await Promise.all([
        api.get("/api/v1/auth/getAllUser").catch(() => ({ data: { users: [] } })),
        api.get("/api/v1/web/advertisements/getAllAdvertisment?limit=1000").catch(() => ({ data: { data: [] } })),
        api.get("/api/v1/admin/newspapers?limit=1000").catch(() => ({ data: { newspapers: [] } })),
        api.get("/api/v1/admin/categories?limit=1000").catch(() => ({ data: { categories: [] } })),
      ]);

      /*  SAFELY EXTRACT ARRAYS */
      const usersArr = usersRes.data?.users || usersRes.data?.data || [];
      const adsArr = adsRes.data?.advertisements || adsRes.data?.data || [];
      const newsArr = newsRes.data?.newspapers || newsRes.data?.data || [];
      const catArr = catRes.data?.categories || catRes.data?.data || [];

      /*  DATE CALCULATION */
      const now = new Date();
      const currMonth = now.getMonth();
      const lastMonth = currMonth === 0 ? 11 : currMonth - 1;

      /*  PENDING ADS (SAFE) */
      const pending = adsArr.filter(
        (a: any) => !a?.status || a?.status === "pending" || a?.status === false || a?.approved === false
      );

      /* ✅ MONTHLY COUNTS */
      const currentUsers = usersArr.filter(
        (u: any) => u.createdAt && new Date(u.createdAt).getMonth() === currMonth
      ).length;

      const lastUsers = usersArr.filter(
        (u: any) => u.createdAt && new Date(u.createdAt).getMonth() === lastMonth
      ).length;

      const currentAds = adsArr.filter(
        (a: any) => (a.createdAt || a.publicationDate) && new Date(a.createdAt || a.publicationDate).getMonth() === currMonth
      ).length;

      const lastAds = adsArr.filter(
        (a: any) => (a.createdAt || a.publicationDate) && new Date(a.createdAt || a.publicationDate).getMonth() === lastMonth
      ).length;

      const currentNews = newsArr.filter(
        (n: any) => n.createdAt && new Date(n.createdAt).getMonth() === currMonth
      ).length;

      const lastNews = newsArr.filter(
        (n: any) => n.createdAt && new Date(n.createdAt).getMonth() === lastMonth
      ).length;

      const currentCategory = catArr.filter(
        (c: any) => c.createdAt && new Date(c.createdAt).getMonth() === currMonth
      ).length;

      const lastCategory = catArr.filter(
        (c: any) => c.createdAt && new Date(c.createdAt).getMonth() === lastMonth
      ).length;

      /* ✅ SET STATE */
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

      setRecentUsers(usersArr.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
      setPendingAds(pending.sort((a: any, b: any) => new Date(b.createdAt || b.publicationDate).getTime() - new Date(a.createdAt || a.publicationDate).getTime()).slice(0, 5));
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // const approveAd = async (id: string) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     await api.put(`/api/v1/web/advertisements/updatedvertisement/${id}`, {}, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     setPendingAds((prev) => prev.filter((ad) => ad._id !== id));
  //   } catch (err) {
  //     console.error("Approve error:", err);
  //   }
  // };

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
        <p className="text-muted-foreground mt-1">
          Monitor your platform's key metrics and activity
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <Card key={index} className="p-6 bg-card border-border">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {loading ? "..." : stat.value}
                  </h2>
                  <p
                    className={`text-sm mt-1 text-green-600`}
                  >
                    +{Math.abs(stat.change)}% from last month
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

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Recent Registered Users</h3>
          {recentUsers.length === 0 ? (
            <p className="text-muted-foreground">No users available</p>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((u, i) => (
                <div key={i} className="border-b pb-3 last:border-none">
                  <p>{u.fullName || u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Ads */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Pending Advertisements</h3>
          {pendingAds.length === 0 ? (
            <p className="text-muted-foreground">No pending advertisements available</p>
          ) : (
            <div className="space-y-3">
              {pendingAds.map((ad, i) => (
                <div key={i} className="flex justify-between bg-muted p-3 rounded">
                  <div>
                    <p>{ad.adTitle || "Advertisement"}</p>
                    <p className="text-sm text-muted-foreground">{ad.contactInfo}</p>
                  </div>
                  {/* <Button size="sm" onClick={() => approveAd(ad._id)}>
                    Approve
                  </Button> */}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
