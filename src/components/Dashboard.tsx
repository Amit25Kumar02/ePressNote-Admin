import { Users, Building2, Gift, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";

export function Dashboard() {
  const stats = [
    { 
      label: "Total Users", 
      value: "2,847", 
      change: "+12%", 
      icon: Users,
      color: "text-primary" 
    },
    { 
      label: "Active Businesses", 
      value: "156", 
      change: "+8%", 
      icon: Building2,
      color: "text-primary" 
    },
    { 
      label: "Available Perks", 
      value: "423", 
      change: "+23%", 
      icon: Gift,
      color: "text-primary" 
    },
    { 
      label: "Monthly Growth", 
      value: "18.5%", 
      change: "+4.2%", 
      icon: TrendingUp,
      color: "text-primary" 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1>Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your platform's key metrics and activity</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                  <h2 className="mt-2">{stat.value}</h2>
                  <p className="text-sm text-primary mt-1">{stat.change} from last month</p>
                </div>
                <div className={`p-3 bg-primary/10 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border">
          <h3 className="mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: "New user registered", name: "Ahmed Al-Rashid", time: "2 minutes ago" },
              { action: "Business approved", name: "Riyadh Coffee House", time: "15 minutes ago" },
              { action: "Perk added", name: "25% off all beverages", time: "1 hour ago" },
              { action: "Invite code generated", name: "SAUDI2025", time: "3 hours ago" },
              { action: "User awaiting approval", name: "Fatima Al-Otaibi", time: "5 hours ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p>{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.name}</p>
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-4 bg-card border-border">
          <h3 className="mb-4">Pending Approvals</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p>Users Awaiting Approval</p>
                <p className="text-sm text-muted-foreground">Pending verification</p>
              </div>
              <div className="text-primary">
                <p className="text-right">12</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p>Business Applications</p>
                <p className="text-sm text-muted-foreground">Pending review</p>
              </div>
              <div className="text-primary">
                <p className="text-right">5</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p>Perk Submissions</p>
                <p className="text-sm text-muted-foreground">Awaiting moderation</p>
              </div>
              <div className="text-primary">
                <p className="text-right">8</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
