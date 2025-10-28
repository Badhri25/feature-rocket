import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Announcements {
  twitter: string;
  linkedin: string;
  changelog: string;
  popup: string;
}

const FeatureDetail = () => {
  const { id } = useParams();
  const [feature, setFeature] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcements | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchFeature();
  }, [id]);

  const fetchFeature = async () => {
    try {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setFeature(data);
      
      // Generate announcements
      await generateAnnouncements(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const generateAnnouncements = async (featureData: any) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-announcements", {
        body: {
          title: featureData.title,
          description: featureData.description,
          feature_type: featureData.feature_type,
        },
      });

      if (error) throw error;
      setAnnouncements(data);
    } catch (error: any) {
      toast({
        title: "Error generating announcements",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
    setTimeout(() => setCopiedField(null), 2000);
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
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="glass" 
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Feature Header */}
        <div className="glass-hover p-8 rounded-2xl mb-8">
          <div className="flex items-start justify-between mb-4">
            <Badge className={getTypeColor(feature.feature_type)}>
              {feature.feature_type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(feature.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{feature.title}</h1>
          <p className="text-lg text-muted-foreground">{feature.description}</p>
        </div>

        {/* Announcements */}
        {generating ? (
          <div className="glass-hover p-12 rounded-2xl text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Generating your announcements with AI...
            </p>
          </div>
        ) : announcements && (
          <div className="space-y-6">
            {[
              { key: "twitter", label: "X (Twitter) Post", icon: "𝕏" },
              { key: "linkedin", label: "LinkedIn Post", icon: "💼" },
              { key: "changelog", label: "Changelog Entry", icon: "📝" },
              { key: "popup", label: "In-App Popup", icon: "🔔" },
            ].map((platform) => (
              <div key={platform.key} className="glass-hover p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <span>{platform.icon}</span>
                    {platform.label}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(announcements[platform.key as keyof Announcements], platform.key)}
                  >
                    {copiedField === platform.key ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Textarea
                  value={announcements[platform.key as keyof Announcements]}
                  readOnly
                  rows={platform.key === "popup" ? 3 : 6}
                  className="glass font-mono text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* Embed Code Section */}
        <div className="glass-hover p-6 rounded-xl mt-8">
          <Label className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>⚡</span>
            Embed Script (Coming Soon)
          </Label>
          <p className="text-muted-foreground mb-4">
            Add this snippet to your website to show feature popups and changelogs
          </p>
          <Textarea
            value={`<script src="https://featureblast.app/embed.js" data-feature-id="${id}"></script>`}
            readOnly
            rows={2}
            className="glass font-mono text-sm opacity-50"
          />
        </div>
      </div>
    </div>
  );
};

export default FeatureDetail;
