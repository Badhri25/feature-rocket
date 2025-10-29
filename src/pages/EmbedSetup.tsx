import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Check, Palette } from "lucide-react";
import { toast } from "sonner";

const EmbedSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [copied, setCopied] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [hideBranding, setHideBranding] = useState(false);
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);
    
    const { data: settings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (settings) {
      setPrimaryColor(settings.primary_color || "#3b82f6");
      setHideBranding(settings.hide_branding || false);
      setPlan(settings.plan || "free");
    }

    setLoading(false);
  };

  const embedCode = `<script src="${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-script" data-uid="${userId}" data-color="${primaryColor}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_settings")
      .update({
        primary_color: primaryColor,
        hide_branding: hideBranding,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save settings");
      return;
    }

    toast.success("Settings saved!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-8">⚡ Embed Setup</h1>

        <Card className="p-6 glass mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Embed Code</h2>
          <p className="text-muted-foreground mb-4">
            Copy this code and paste it in the &lt;head&gt; section of your website:
          </p>
          <div className="relative">
            <pre className="bg-background/50 p-4 rounded-lg overflow-x-auto border border-border">
              <code className="text-sm text-foreground">{embedCode}</code>
            </pre>
            <Button
              onClick={handleCopy}
              className="absolute top-2 right-2"
              size="sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </Card>

        <Card className="p-6 glass mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Customize Appearance
            {plan === "free" && (
              <span className="text-sm font-normal text-yellow-500">(PRO Feature)</span>
            )}
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-4 mt-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={plan === "free"}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={plan === "free"}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hideBranding"
                checked={hideBranding}
                onChange={(e) => setHideBranding(e.target.checked)}
                disabled={plan === "free"}
                className="w-4 h-4"
              />
              <Label htmlFor="hideBranding">Hide "Made with Feature Blast" branding</Label>
            </div>
            {plan === "free" && (
              <p className="text-sm text-muted-foreground">
                Upgrade to PRO to unlock custom branding →{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate("/pricing")}
                >
                  View Plans
                </Button>
              </p>
            )}
            {plan !== "free" && (
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            )}
          </div>
        </Card>

        <Card className="p-6 glass">
          <h2 className="text-2xl font-bold text-foreground mb-4">How It Works</h2>
          <div className="space-y-4 text-muted-foreground">
            <div className="flex gap-4">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-semibold text-foreground">Add the script to your website</p>
                <p>Paste the embed code in your site's &lt;head&gt; section</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-semibold text-foreground">Create features</p>
                <p>Use the dashboard to create new feature announcements</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-semibold text-foreground">Track results</p>
                <p>View impressions and clicks in your Analytics dashboard</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmbedSetup;
