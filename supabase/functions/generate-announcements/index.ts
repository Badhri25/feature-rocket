import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, feature_type } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating announcements for:", title);

    // Generate announcements for different platforms
    const announcements = {
      twitter: "",
      linkedin: "",
      changelog: "",
      popup: "",
    };

    // X (Twitter) Post
    const twitterPrompt = `Create a short, engaging tweet to announce this ${feature_type}: "${title}". Description: ${description}. Make it punchy, use relevant emojis, and keep it under 280 characters.`;
    
    const twitterResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a social media expert who creates engaging, concise announcements." },
          { role: "user", content: twitterPrompt },
        ],
      }),
    });

    if (!twitterResponse.ok) {
      const errorText = await twitterResponse.text();
      console.error("Twitter generation error:", errorText);
      throw new Error("Failed to generate Twitter post");
    }

    const twitterData = await twitterResponse.json();
    announcements.twitter = twitterData.choices[0].message.content;

    // LinkedIn Post
    const linkedinPrompt = `Create a professional LinkedIn post to announce this ${feature_type}: "${title}". Description: ${description}. Make it story-driven, engaging, and around 150-200 words. Include relevant emojis.`;
    
    const linkedinResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional content writer who creates engaging LinkedIn posts." },
          { role: "user", content: linkedinPrompt },
        ],
      }),
    });

    if (!linkedinResponse.ok) {
      throw new Error("Failed to generate LinkedIn post");
    }

    const linkedinData = await linkedinResponse.json();
    announcements.linkedin = linkedinData.choices[0].message.content;

    // Changelog Entry
    const changelogPrompt = `Create a clear, structured changelog entry for this ${feature_type}: "${title}". Description: ${description}. Format it professionally with bullet points if needed.`;
    
    const changelogResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a technical writer who creates clear changelog entries." },
          { role: "user", content: changelogPrompt },
        ],
      }),
    });

    if (!changelogResponse.ok) {
      throw new Error("Failed to generate changelog");
    }

    const changelogData = await changelogResponse.json();
    announcements.changelog = changelogData.choices[0].message.content;

    // In-app Popup Text
    const popupPrompt = `Create a brief, exciting in-app popup message for this ${feature_type}: "${title}". Description: ${description}. Keep it under 100 characters, make it exciting and clear.`;
    
    const popupResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a UX copywriter who creates concise, exciting in-app notifications." },
          { role: "user", content: popupPrompt },
        ],
      }),
    });

    if (!popupResponse.ok) {
      throw new Error("Failed to generate popup text");
    }

    const popupData = await popupResponse.json();
    announcements.popup = popupData.choices[0].message.content;

    console.log("Successfully generated all announcements");

    return new Response(
      JSON.stringify(announcements),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-announcements:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
