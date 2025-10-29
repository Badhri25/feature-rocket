import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/javascript",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const uid = url.searchParams.get("uid") || url.searchParams.get("data-uid");
    const color = url.searchParams.get("color") || url.searchParams.get("data-color") || "#3b82f6";

    if (!uid) {
      return new Response("Missing user ID", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch latest feature for this user
    const { data: features, error } = await supabase
      .from("features")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching features:", error);
      return new Response("Error fetching features", { status: 500, headers: corsHeaders });
    }

    const script = `
(function() {
  const FEATURE_BLAST_UID = "${uid}";
  const PRIMARY_COLOR = "${color}";
  const FEATURES = ${JSON.stringify(features || [])};

  // Sanitize HTML to prevent XSS
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // Create popup modal
  function createPopup(feature) {
    const popup = document.createElement('div');
    popup.id = 'feature-blast-popup';
    popup.innerHTML = \`
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 999999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s;">
        <div style="background: white; border-radius: 16px; padding: 32px; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
            <span style="background: \${PRIMARY_COLOR}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">\${escapeHtml(feature.feature_type)}</span>
            <button onclick="document.getElementById('feature-blast-popup').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
          </div>
          <h2 style="color: #1a1a1a; font-size: 24px; font-weight: bold; margin: 16px 0;">\${escapeHtml(feature.title)}</h2>
          <p style="color: #666; line-height: 1.6;">\${escapeHtml(feature.description)}</p>
          <button onclick="trackClick('\${feature.id}'); document.getElementById('feature-blast-popup').remove();" style="background: \${PRIMARY_COLOR}; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 20px; width: 100%;">Got it!</button>
        </div>
      </div>
    \`;
    document.body.appendChild(popup);
    trackView(feature.id);
  }

  // Create mini changelog
  function createChangelog() {
    const changelog = document.createElement('div');
    changelog.id = 'feature-blast-changelog';
    changelog.innerHTML = \`
      <div style="position: fixed; bottom: 20px; right: 20px; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); width: 320px; max-height: 400px; overflow: hidden; z-index: 999998;">
        <div style="background: \${PRIMARY_COLOR}; color: white; padding: 16px; font-weight: 600;">
          ✨ What's New
        </div>
        <div style="padding: 16px; max-height: 300px; overflow-y: auto;">
          \${FEATURES.map(f => \`
            <div style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="trackClick('\${f.id}')">
              <div style="font-size: 12px; color: \${PRIMARY_COLOR}; font-weight: 600; margin-bottom: 4px;">\${escapeHtml(f.feature_type)}</div>
              <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">\${escapeHtml(f.title)}</div>
              <div style="font-size: 14px; color: #666;">\${escapeHtml(f.description.substring(0, 80))}...</div>
            </div>
          \`).join('')}
        </div>
      </div>
    \`;
    document.body.appendChild(changelog);
  }

  // Track impression
  async function trackView(featureId) {
    await fetch('${supabaseUrl}/functions/v1/track-impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureId, uid: FEATURE_BLAST_UID, type: 'view' })
    });
  }

  async function trackClick(featureId) {
    await fetch('${supabaseUrl}/functions/v1/track-impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureId, uid: FEATURE_BLAST_UID, type: 'click' })
    });
  }

  // Initialize
  if (FEATURES.length > 0) {
    // Show latest feature popup
    const latestFeature = FEATURES[0];
    const lastSeen = localStorage.getItem('fb_last_seen');
    if (!lastSeen || lastSeen !== latestFeature.id) {
      setTimeout(() => {
        createPopup(latestFeature);
        localStorage.setItem('fb_last_seen', latestFeature.id);
      }, 2000);
    }

    // Show changelog
    createChangelog();
  }

  // Add animations
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  \`;
  document.head.appendChild(style);
})();
`;

    return new Response(script, { headers: corsHeaders });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
