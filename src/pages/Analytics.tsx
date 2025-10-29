import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, MousePointer, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface AnalyticsData {
  featureTitle: string;
  views: number;
  clicks: number;
  ctr: number;
}

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAnalytics();
    }
  }, [dateRange, loading]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - dateRange);

    const { data: features } = await supabase
      .from("features")
      .select("id, title")
      .eq("user_id", user.id);

    if (!features) return;

    const analyticsData: AnalyticsData[] = [];
    let totalV = 0;
    let totalC = 0;

    for (const feature of features) {
      const { data: views } = await supabase
        .from("impressions")
        .select("*")
        .eq("feature_id", feature.id)
        .eq("impression_type", "view")
        .gte("created_at", dateFrom.toISOString());

      const { data: clicks } = await supabase
        .from("impressions")
        .select("*")
        .eq("feature_id", feature.id)
        .eq("impression_type", "click")
        .gte("created_at", dateFrom.toISOString());

      const viewCount = views?.length || 0;
      const clickCount = clicks?.length || 0;
      const ctr = viewCount > 0 ? (clickCount / viewCount) * 100 : 0;

      totalV += viewCount;
      totalC += clickCount;

      analyticsData.push({
        featureTitle: feature.title,
        views: viewCount,
        clicks: clickCount,
        ctr: parseFloat(ctr.toFixed(2)),
      });
    }

    setAnalytics(analyticsData);
    setTotalViews(totalV);
    setTotalClicks(totalC);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const overallCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">📊 Analytics</h1>
          <div className="flex gap-2">
            <Button
              variant={dateRange === 7 ? "default" : "outline"}
              onClick={() => setDateRange(7)}
            >
              7 Days
            </Button>
            <Button
              variant={dateRange === 30 ? "default" : "outline"}
              onClick={() => setDateRange(30)}
            >
              30 Days
            </Button>
            <Button
              variant={dateRange === 90 ? "default" : "outline"}
              onClick={() => setDateRange(90)}
            >
              90 Days
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 glass">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold text-foreground">{totalViews}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <MousePointer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-3xl font-bold text-foreground">{totalClicks}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall CTR</p>
                <p className="text-3xl font-bold text-foreground">{overallCTR}%</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 glass mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Views by Feature</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="featureTitle" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="views" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 glass">
          <h2 className="text-2xl font-bold text-foreground mb-6">Click-Through Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="featureTitle" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: "8px",
                }}
              />
              <Line type="monotone" dataKey="ctr" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
