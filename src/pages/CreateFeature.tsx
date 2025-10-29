import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

const featureSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  feature_type: z.enum(["new", "update", "fix"], { errorMap: () => ({ message: "Please select a valid feature type" }) }),
});

const CreateFeature = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input using zod schema
    const validation = featureSchema.safeParse({
      title,
      description,
      feature_type: type,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("features")
        .insert([
          {
            title: validation.data.title,
            description: validation.data.description,
            feature_type: validation.data.feature_type,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Feature created!",
        description: "Generating announcements...",
      });

      navigate(`/feature/${data.id}`);
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

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="glass" 
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="glass-hover p-8 rounded-2xl">
          <h1 className="text-3xl font-bold mb-6">
            Create <span className="text-gradient">Feature</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Feature Title</Label>
              <Input
                id="title"
                placeholder="e.g., Dark Mode Support"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                maxLength={100}
                className="glass mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your feature in a few sentences..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                maxLength={1000}
                rows={5}
                className="glass mt-2"
              />
            </div>

            <div>
              <Label htmlFor="type">Feature Type</Label>
              <Select value={type} onValueChange={setType} disabled={loading}>
                <SelectTrigger className="glass mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">🎉 New Feature</SelectItem>
                  <SelectItem value="update">🔄 Update</SelectItem>
                  <SelectItem value="fix">🔧 Bug Fix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Generate Announcements"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFeature;
