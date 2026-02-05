 import { useState, useEffect } from "react";
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Copy, CheckCircle, Clock, Loader2, QrCode } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface PixPaymentModalProps {
   isOpen: boolean;
   onClose: () => void;
   pixData: {
     qr_code?: string;
     qr_code_base64?: string;
     amount?: number;
     expires_at?: string;
     purchase_id?: string;
   } | null;
   itemName: string;
   onCopy: () => void;
   onCheckStatus: (purchaseId: string) => Promise<boolean>;
 }
 
 export function PixPaymentModal({ 
   isOpen, 
   onClose, 
   pixData, 
   itemName, 
   onCopy,
   onCheckStatus 
 }: PixPaymentModalProps) {
   const [copied, setCopied] = useState(false);
   const [checking, setChecking] = useState(false);
   const [timeLeft, setTimeLeft] = useState<string>("");
 
   useEffect(() => {
     if (!pixData?.expires_at) return;
 
     const updateTimer = () => {
       const now = new Date();
       const expires = new Date(pixData.expires_at!);
       const diff = expires.getTime() - now.getTime();
 
       if (diff <= 0) {
         setTimeLeft("Expirado");
         return;
       }
 
       const minutes = Math.floor(diff / 60000);
       const seconds = Math.floor((diff % 60000) / 1000);
       setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
     };
 
     updateTimer();
     const interval = setInterval(updateTimer, 1000);
     return () => clearInterval(interval);
   }, [pixData?.expires_at]);
 
   // Auto-check payment status every 5 seconds
   useEffect(() => {
     if (!isOpen || !pixData?.purchase_id) return;
 
     const checkInterval = setInterval(async () => {
       const paid = await onCheckStatus(pixData.purchase_id!);
       if (paid) {
         onClose();
       }
     }, 5000);
 
     return () => clearInterval(checkInterval);
   }, [isOpen, pixData?.purchase_id, onCheckStatus, onClose]);
 
   const handleCopy = () => {
     onCopy();
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
   };
 
   const handleManualCheck = async () => {
     if (!pixData?.purchase_id) return;
     setChecking(true);
     const paid = await onCheckStatus(pixData.purchase_id);
     setChecking(false);
     if (paid) {
       onClose();
     }
   };
 
   return (
     <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <QrCode className="w-5 h-5 text-primary" />
             Pagamento PIX
           </DialogTitle>
         </DialogHeader>
 
         <div className="space-y-4">
           {/* Item info */}
           <div className="bg-muted/50 rounded-lg p-3 text-center">
             <p className="text-sm text-muted-foreground">Comprando</p>
             <p className="font-bold text-lg">{itemName}</p>
             <Badge variant="outline" className="mt-1 text-primary border-primary">
               R$ {pixData?.amount?.toFixed(2)}
             </Badge>
           </div>
 
           {/* QR Code */}
           {pixData?.qr_code_base64 && (
             <div className="flex justify-center">
               <div className="bg-white p-4 rounded-lg">
                 <img 
                   src={`data:image/png;base64,${pixData.qr_code_base64}`} 
                   alt="QR Code PIX"
                   className="w-48 h-48"
                 />
               </div>
             </div>
           )}
 
           {/* Timer */}
           <div className="flex items-center justify-center gap-2 text-sm">
             <Clock className="w-4 h-4 text-muted-foreground" />
             <span className={cn(
               timeLeft === "Expirado" ? "text-destructive" : "text-muted-foreground"
             )}>
               Expira em: {timeLeft}
             </span>
           </div>
 
           {/* Copy button */}
           <Button 
             onClick={handleCopy} 
             variant="outline" 
             className="w-full gap-2"
           >
             {copied ? (
               <>
                 <CheckCircle className="w-4 h-4 text-green-500" />
                 Copiado!
               </>
             ) : (
               <>
                 <Copy className="w-4 h-4" />
                 Copiar código PIX
               </>
             )}
           </Button>
 
           {/* Check status */}
           <Button
             onClick={handleManualCheck}
             disabled={checking}
             className="w-full gap-2"
           >
             {checking ? (
               <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Verificando...
               </>
             ) : (
               <>
                 <CheckCircle className="w-4 h-4" />
                 Já paguei
               </>
             )}
           </Button>
 
           <p className="text-xs text-muted-foreground text-center">
             O item será adicionado automaticamente após a confirmação do pagamento.
           </p>
         </div>
       </DialogContent>
     </Dialog>
   );
 }