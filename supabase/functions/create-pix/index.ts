 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
     if (!MERCADO_PAGO_ACCESS_TOKEN) {
       throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
     }
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     // Get auth header
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       throw new Error("No authorization header");
     }
 
     // Verify user
     const token = authHeader.replace("Bearer ", "");
     const { data: { user }, error: authError } = await supabase.auth.getUser(token);
     if (authError || !user) {
       throw new Error("Unauthorized");
     }
 
     const { clothing_id } = await req.json();
     if (!clothing_id) {
       throw new Error("clothing_id is required");
     }
 
     // Get clothing info
     const { data: clothing, error: clothingError } = await supabase
       .from("vip_clothing")
       .select("*")
       .eq("id", clothing_id)
       .single();
 
     if (clothingError || !clothing) {
       throw new Error("Clothing not found");
     }
 
     // Check if already owned
     const { data: existing } = await supabase
       .from("player_vip_clothing")
       .select("id")
       .eq("user_id", user.id)
       .eq("clothing_id", clothing_id)
       .single();
 
     if (existing) {
       throw new Error("Você já possui este item!");
     }
 
     // Get character name for description
     const { data: character } = await supabase
       .from("characters")
       .select("name")
       .eq("user_id", user.id)
       .single();
 
     const amountCents = clothing.price_brl_cents || 500;
     const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
 
     // Create PIX payment in Mercado Pago
     const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
         "Content-Type": "application/json",
         "X-Idempotency-Key": `${user.id}-${clothing_id}-${Date.now()}`,
       },
       body: JSON.stringify({
         transaction_amount: amountCents / 100,
         description: `VIP: ${clothing.name} - ${character?.name || "Jogador"}`,
         payment_method_id: "pix",
         payer: {
           email: user.email,
         },
         notification_url: `${supabaseUrl}/functions/v1/pix-webhook`,
       }),
     });
 
     if (!mpResponse.ok) {
       const errorData = await mpResponse.text();
       console.error("Mercado Pago error:", errorData);
       throw new Error("Failed to create PIX payment");
     }
 
     const mpData = await mpResponse.json();
 
     // Save purchase record
     const { data: purchase, error: purchaseError } = await supabase
       .from("vip_purchases")
       .insert({
         user_id: user.id,
         clothing_id: clothing_id,
         amount_cents: amountCents,
         payment_id: String(mpData.id),
         qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
         qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
         pix_copy_paste: mpData.point_of_interaction?.transaction_data?.qr_code,
         status: "pending",
         expires_at: expiresAt.toISOString(),
       })
       .select()
       .single();
 
     if (purchaseError) {
       console.error("Purchase save error:", purchaseError);
       throw new Error("Failed to save purchase");
     }
 
     return new Response(
       JSON.stringify({
         success: true,
         purchase_id: purchase.id,
         payment_id: mpData.id,
         qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
         qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
         amount: amountCents / 100,
         expires_at: expiresAt.toISOString(),
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error: unknown) {
     console.error("Error:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(
       JSON.stringify({ success: false, error: errorMessage }),
       { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });