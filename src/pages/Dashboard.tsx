import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Loader2, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Feature {
  id: string;
  title: string;
  description: string;
  feature_type: string;
  created_at: string;
  impressions: number;
}

const Dashboard = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      fetchFeatures();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "new": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "update": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "fix": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <Button variant="glass" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Create Feature Button */}
        <Button 
          variant="hero" 
          size="lg"
          onClick={() => navigate("/create")}
          className="mb-8"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Feature
        </Button>

        {/* Features Grid */}
        {features.length === 0 ? (
          <div className="text-center py-20 glass-hover rounded-2xl">
            <Rocket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No features yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first feature announcement to get started
            </p>
            <Button variant="hero" onClick={() => navigate("/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Feature
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card 
                key={feature.id} 
                className="glass-hover cursor-pointer"
                onClick={() => navigate(`/feature/${feature.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getTypeColor(feature.feature_type)}>
                      {feature.feature_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(feature.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    👁️ {feature.impressions} impressions
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
