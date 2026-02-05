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
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     const body = await req.json();
     console.log("Webhook received:", JSON.stringify(body));
 
     // Mercado Pago sends notifications with action "payment.updated" or "payment.created"
     if (body.type !== "payment" && body.action !== "payment.updated") {
       return new Response(JSON.stringify({ received: true }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const paymentId = body.data?.id;
     if (!paymentId) {
       console.log("No payment ID in webhook");
       return new Response(JSON.stringify({ received: true }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Get payment details from Mercado Pago
     const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
     if (!MERCADO_PAGO_ACCESS_TOKEN) {
       throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
     }
 
     const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
       headers: {
         "Authorization": `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
       },
     });
 
     if (!mpResponse.ok) {
       console.error("Failed to fetch payment from MP");
       return new Response(JSON.stringify({ error: "Failed to fetch payment" }), {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const payment = await mpResponse.json();
     console.log("Payment status:", payment.status);
 
     if (payment.status !== "approved") {
       // Update purchase status if not approved
       await supabase
         .from("vip_purchases")
         .update({ status: payment.status })
         .eq("payment_id", String(paymentId));
 
       return new Response(JSON.stringify({ received: true, status: payment.status }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Payment approved - find purchase and grant item
     const { data: purchase, error: purchaseError } = await supabase
       .from("vip_purchases")
       .select("*")
       .eq("payment_id", String(paymentId))
       .single();
 
     if (purchaseError || !purchase) {
       console.error("Purchase not found:", purchaseError);
       return new Response(JSON.stringify({ error: "Purchase not found" }), {
         status: 404,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     if (purchase.status === "paid") {
       console.log("Purchase already processed");
       return new Response(JSON.stringify({ received: true, already_processed: true }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Grant the VIP item to player
     const { error: insertError } = await supabase
       .from("player_vip_clothing")
       .insert({
         user_id: purchase.user_id,
         clothing_id: purchase.clothing_id,
       });
 
     if (insertError) {
       console.error("Failed to grant item:", insertError);
       // Don't throw - we still want to mark as paid
     }
 
     // Update purchase status
     await supabase
       .from("vip_purchases")
       .update({ status: "paid", paid_at: new Date().toISOString() })
       .eq("id", purchase.id);
 
     console.log("Item granted successfully to user:", purchase.user_id);
 
     return new Response(
       JSON.stringify({ success: true, item_granted: true }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error: unknown) {
     console.error("Webhook error:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(
       JSON.stringify({ error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });