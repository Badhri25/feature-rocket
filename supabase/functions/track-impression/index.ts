import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { featureId, uid, type } = await req.json();

    if (!featureId || !uid || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate impression type
    if (type !== "view" && type !== "click") {
      return new Response(
        JSON.stringify({ error: "Invalid impression type. Must be 'view' or 'click'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate that feature exists and belongs to the claimed user
    const { data: feature, error: featureError } = await supabase
      .from("features")
      .select("user_id")
      .eq("id", featureId)
      .eq("user_id", uid)
      .single();

    if (featureError || !feature) {
      console.error("Invalid feature or unauthorized:", featureError);
      return new Response(
        JSON.stringify({ error: "Invalid feature or unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert impression
    const { error: insertError } = await supabase
      .from("impressions")
      .insert({
        feature_id: featureId,
        user_id: uid,
        impression_type: type,
      });

    if (insertError) {
      console.error("Error inserting impression:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to track impression" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update feature impressions count
    if (type === "view") {
      await supabase.rpc("increment", {
        row_id: featureId,
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
