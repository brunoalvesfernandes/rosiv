 import { useState } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 import { toast } from "sonner";
 import { useQueryClient } from "@tanstack/react-query";
 
 interface PixPaymentResult {
   success: boolean;
   purchase_id?: string;
   payment_id?: string;
   qr_code?: string;
   qr_code_base64?: string;
   amount?: number;
   expires_at?: string;
   error?: string;
 }
 
 export function usePixPayment() {
   const { session } = useAuth();
   const queryClient = useQueryClient();
   const [isLoading, setIsLoading] = useState(false);
   const [pixData, setPixData] = useState<PixPaymentResult | null>(null);
 
   const createPixPayment = async (clothingId: string): Promise<PixPaymentResult | null> => {
     if (!session?.access_token) {
       toast.error("Você precisa estar logado!");
       return null;
     }
 
     setIsLoading(true);
     try {
       const { data, error } = await supabase.functions.invoke("create-pix", {
         body: { clothing_id: clothingId },
       });
 
       if (error) {
         toast.error(error.message || "Erro ao gerar PIX");
         return null;
       }
 
       if (!data.success) {
         toast.error(data.error || "Erro ao gerar PIX");
         return null;
       }
 
       setPixData(data);
       return data;
     } catch (err) {
       console.error("PIX error:", err);
       toast.error("Erro ao processar pagamento");
       return null;
     } finally {
       setIsLoading(false);
     }
   };
 
   const copyPixCode = () => {
     if (pixData?.qr_code) {
       navigator.clipboard.writeText(pixData.qr_code);
       toast.success("Código PIX copiado!");
     }
   };
 
   const clearPixData = () => {
     setPixData(null);
   };
 
   const checkPaymentStatus = async (purchaseId: string): Promise<boolean> => {
     try {
       const { data, error } = await supabase
         .from("vip_purchases")
         .select("status")
         .eq("id", purchaseId)
         .single();
 
       if (error) return false;
       
       if (data.status === "paid") {
         queryClient.invalidateQueries({ queryKey: ["my-vip-clothing"] });
         toast.success("Pagamento confirmado! Item adicionado ao inventário.");
         clearPixData();
         return true;
       }
       
       return false;
     } catch {
       return false;
     }
   };
 
   return {
     isLoading,
     pixData,
     createPixPayment,
     copyPixCode,
     clearPixData,
     checkPaymentStatus,
   };
 }