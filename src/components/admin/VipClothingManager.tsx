 import { useState } from "react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { Textarea } from "@/components/ui/textarea";
 import { Switch } from "@/components/ui/switch";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Loader2, Plus, Pencil, Trash2, Crown } from "lucide-react";
 import { PixelArtEditor } from "./PixelArtEditor";
 import { toast } from "sonner";
 
 // Available pixel art styles for each type
 const PIXEL_ART_STYLES: Record<string, { value: string; label: string }[]> = {
   hair: [
     { value: "vip-goku-ssj", label: "Goku SSJ (Dourado)" },
     { value: "vip-sasuke", label: "Sasuke Shippuden" },
     { value: "vip-akatsuki", label: "Akatsuki (Longo)" },
     { value: "vip-ssj", label: "Super Saiyajin Clássico" },
   ],
   shirt: [
     { value: "vip-naruto", label: "Jaqueta Naruto" },
     { value: "vip-onepiece", label: "Colete One Piece" },
     { value: "vip-dragonball", label: "Gi Dragon Ball" },
   ],
   pants: [
     { value: "vip-ninja", label: "Calça Ninja" },
     { value: "vip-martial", label: "Calça Gi Martial" },
     { value: "vip-hakama", label: "Hakama" },
   ],
   accessory: [
     { value: "vip-headband", label: "Bandana Ninja" },
     { value: "vip-scouter", label: "Scouter DBZ" },
     { value: "vip-strawhat", label: "Chapéu de Palha" },
     { value: "vip-sharingan", label: "Sharingan (Olhos)" },
   ],
 };
 
 interface VipClothing {
   id: string;
   name: string;
   description: string | null;
   type: string;
   image_url: string | null;
   rarity: string;
   price_gold: number | null;
   price_premium: number | null;
   price_brl_cents: number | null;
   min_level: number | null;
   is_available: boolean | null;
   created_at: string;
 }
 
 const CLOTHING_TYPES = [
   { value: "hair", label: "Cabelo", icon: "💇" },
   { value: "shirt", label: "Camisa", icon: "👕" },
   { value: "pants", label: "Calça", icon: "👖" },
   { value: "accessory", label: "Acessório", icon: "✨" },
 ];
 
 const RARITY_OPTIONS = [
   { value: "vip", label: "VIP", color: "bg-amber-500" },
   { value: "legendary", label: "Lendário", color: "bg-purple-500" },
   { value: "mythic", label: "Mítico", color: "bg-pink-500" },
 ];
 
 const defaultFormData = {
   name: "",
   description: "",
   type: "hair",
   rarity: "vip",
   price_brl_cents: 590,
   min_level: 1,
   is_available: true,
   pixel_style: "vip-goku-ssj",
   custom_pixel_data: "",
   use_custom_art: false,
 };
 
 export function VipClothingManager() {
   const queryClient = useQueryClient();
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<VipClothing | null>(null);
   const [formData, setFormData] = useState(defaultFormData);
   const [filterType, setFilterType] = useState<string>("all");
 
   // Fetch all VIP clothing
   const { data: clothing, isLoading } = useQuery({
     queryKey: ["admin_vip_clothing"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("vip_clothing")
         .select("*")
         .order("type")
         .order("rarity");
 
       if (error) throw error;
       return data as VipClothing[];
     },
   });
 
   // Create mutation
   const createMutation = useMutation({
     mutationFn: async (data: typeof formData) => {
       const imageUrl = data.use_custom_art && data.custom_pixel_data ? data.custom_pixel_data : data.pixel_style;
       const { error } = await supabase.from("vip_clothing").insert({
         name: data.name,
         description: data.description || null,
         type: data.type,
         rarity: data.rarity,
         price_brl_cents: data.price_brl_cents,
         min_level: data.min_level,
         is_available: data.is_available,
         image_url: imageUrl,
       });
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin_vip_clothing"] });
       queryClient.invalidateQueries({ queryKey: ["vip-clothing-catalog"] });
       toast.success("Item VIP criado com sucesso!");
       handleCloseDialog();
     },
     onError: (error) => {
       toast.error("Erro ao criar item: " + error.message);
     },
   });
 
   // Update mutation
   const updateMutation = useMutation({
     mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
       const imageUrl = data.use_custom_art && data.custom_pixel_data ? data.custom_pixel_data : data.pixel_style;
       const { error } = await supabase
         .from("vip_clothing")
         .update({
           name: data.name,
           description: data.description || null,
           type: data.type,
           rarity: data.rarity,
           price_brl_cents: data.price_brl_cents,
           min_level: data.min_level,
           is_available: data.is_available,
           image_url: imageUrl,
         })
         .eq("id", id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin_vip_clothing"] });
       queryClient.invalidateQueries({ queryKey: ["vip-clothing-catalog"] });
       toast.success("Item VIP atualizado!");
       handleCloseDialog();
     },
     onError: (error) => {
       toast.error("Erro ao atualizar: " + error.message);
     },
   });
 
   // Delete mutation
   const deleteMutation = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from("vip_clothing").delete().eq("id", id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["admin_vip_clothing"] });
       queryClient.invalidateQueries({ queryKey: ["vip-clothing-catalog"] });
       toast.success("Item deletado!");
     },
     onError: (error) => {
       toast.error("Erro ao deletar: " + error.message);
     },
   });
 
   const handleOpenCreate = () => {
     setEditingItem(null);
     setFormData({ ...defaultFormData, use_custom_art: false, custom_pixel_data: "" });
     setIsDialogOpen(true);
   };
 
   const handleOpenEdit = (item: VipClothing) => {
     setEditingItem(item);
     const styles = PIXEL_ART_STYLES[item.type] || [];
     let detectedStyle = styles[0]?.value || "vip-ssj";
     const isCustomArt = item.image_url?.startsWith("[") || false;
     
     if (!isCustomArt && item.image_url?.startsWith("vip-")) {
       detectedStyle = item.image_url;
     }
     
     setFormData({
       name: item.name,
       description: item.description || "",
       type: item.type,
       rarity: item.rarity,
       price_brl_cents: item.price_brl_cents || 590,
       min_level: item.min_level || 1,
       is_available: item.is_available ?? true,
       pixel_style: detectedStyle,
       custom_pixel_data: isCustomArt ? item.image_url || "" : "",
       use_custom_art: isCustomArt,
     });
     setIsDialogOpen(true);
   };
 
   const handleCloseDialog = () => {
     setIsDialogOpen(false);
     setEditingItem(null);
     setFormData({ ...defaultFormData, use_custom_art: false, custom_pixel_data: "" });
   };
 
   const handleSubmit = () => {
     if (!formData.name.trim()) {
       toast.error("Nome é obrigatório");
       return;
     }
 
     if (formData.use_custom_art && !formData.custom_pixel_data) {
       toast.error("Desenhe e salve a pixel art primeiro");
       return;
     }
 
     if (editingItem) {
       updateMutation.mutate({ id: editingItem.id, data: formData });
     } else {
       createMutation.mutate(formData);
     }
   };
 
   const getRarityBadge = (rarity: string) => {
     const config = RARITY_OPTIONS.find((r) => r.value === rarity);
     return (
       <Badge className={`${config?.color || "bg-gray-500"} text-white`}>
         {config?.label || rarity}
       </Badge>
     );
   };
 
   const getTypeIcon = (type: string) => {
     const config = CLOTHING_TYPES.find((t) => t.value === type);
     return config?.icon || "❓";
   };
 
   const formatPrice = (cents: number | null) => {
     if (!cents) return "—";
     return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
   };
 
   const renderItemPreview = (item: VipClothing) => {
     const isCustomArt = item.image_url?.startsWith("[");
     if (isCustomArt && item.image_url) {
       try {
         const pixels = JSON.parse(item.image_url);
         return (
           <svg viewBox="0 0 16 24" className="w-full h-full">
             {pixels.map((row: (string | null)[], rowIndex: number) =>
               row.map((color: string | null, colIndex: number) =>
                 color ? (
                   <rect
                     key={`${rowIndex}-${colIndex}`}
                     x={colIndex}
                     y={rowIndex}
                     width={1}
                     height={1}
                     fill={color}
                   />
                 ) : null
               )
             )}
           </svg>
         );
       } catch {
         return <span className="text-xs text-muted-foreground">Custom</span>;
       }
     }
     return <span className="text-xs text-muted-foreground">{item.image_url || "—"}</span>;
   };
 
   const filteredClothing = filterType === "all" 
     ? clothing 
     : clothing?.filter((item) => item.type === filterType);
 
   return (
     <div className="space-y-4">
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Crown className="w-5 h-5 text-primary" />
               Gerenciar Itens VIP
             </div>
             <div className="flex items-center gap-2">
               <Select value={filterType} onValueChange={setFilterType}>
                 <SelectTrigger className="w-40">
                   <SelectValue placeholder="Filtrar por tipo" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Todos</SelectItem>
                   {CLOTHING_TYPES.map((type) => (
                     <SelectItem key={type.value} value={type.value}>
                       {type.icon} {type.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <Button onClick={handleOpenCreate}>
                 <Plus className="w-4 h-4 mr-2" />
                 Novo Item
               </Button>
             </div>
           </CardTitle>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="flex justify-center py-8">
               <Loader2 className="w-8 h-8 animate-spin" />
             </div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Preview</TableHead>
                   <TableHead>Nome</TableHead>
                   <TableHead>Tipo</TableHead>
                   <TableHead>Raridade</TableHead>
                   <TableHead>Preço</TableHead>
                   <TableHead>Nível Mín.</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Ações</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredClothing?.map((item) => (
                   <TableRow key={item.id}>
                     <TableCell>
                       <div className="w-12 h-16 bg-muted rounded overflow-hidden flex items-center justify-center">
                         {renderItemPreview(item)}
                       </div>
                     </TableCell>
                     <TableCell className="font-medium">{item.name}</TableCell>
                     <TableCell>
                       <span className="flex items-center gap-1">
                         {getTypeIcon(item.type)}
                         {CLOTHING_TYPES.find((t) => t.value === item.type)?.label || item.type}
                       </span>
                     </TableCell>
                     <TableCell>{getRarityBadge(item.rarity)}</TableCell>
                     <TableCell>{formatPrice(item.price_brl_cents)}</TableCell>
                     <TableCell>{item.min_level || 1}</TableCell>
                     <TableCell>
                       {item.is_available ? (
                         <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                           Ativo
                         </Badge>
                       ) : (
                         <Badge variant="destructive">
                           Inativo
                         </Badge>
                       )}
                     </TableCell>
                     <TableCell>
                       <div className="flex gap-2">
                         <Button size="sm" variant="outline" onClick={() => handleOpenEdit(item)}>
                           <Pencil className="w-4 h-4" />
                         </Button>
                         <Button
                           size="sm"
                           variant="destructive"
                           onClick={() => {
                             if (confirm(`Deletar "${item.name}"?`)) {
                               deleteMutation.mutate(item.id);
                             }
                           }}
                           disabled={deleteMutation.isPending}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
                 {(!filteredClothing || filteredClothing.length === 0) && (
                   <TableRow>
                     <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                       Nenhum item VIP encontrado.
                     </TableCell>
                   </TableRow>
                 )}
               </TableBody>
             </Table>
           )}
         </CardContent>
       </Card>
 
       {/* Create/Edit Dialog */}
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               {editingItem ? (
                 <>
                   <Pencil className="w-5 h-5" />
                   Editar Item VIP
                 </>
               ) : (
                 <>
                   <Plus className="w-5 h-5" />
                   Criar Item VIP
                 </>
               )}
             </DialogTitle>
           </DialogHeader>
 
           <div className="space-y-4">
             {/* Toggle: Preset vs Custom */}
             <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
               <Label className="flex items-center gap-2 cursor-pointer">
                 <input
                   type="radio"
                   name="art_mode"
                   checked={!formData.use_custom_art}
                   onChange={() => setFormData({ ...formData, use_custom_art: false })}
                   className="accent-primary"
                 />
                 Usar Estilo Pré-definido
               </Label>
               <Label className="flex items-center gap-2 cursor-pointer">
                 <input
                   type="radio"
                   name="art_mode"
                   checked={formData.use_custom_art}
                   onChange={() => setFormData({ ...formData, use_custom_art: true })}
                   className="accent-primary"
                 />
                 Desenhar Pixel Art
               </Label>
             </div>
 
             {/* Custom Pixel Art Editor */}
             {formData.use_custom_art && (
               <div className="border border-border rounded-lg p-4 bg-card">
                 <PixelArtEditor
                   width={16}
                   height={24}
                   initialData={formData.custom_pixel_data}
                   onSave={(data) => setFormData({ ...formData, custom_pixel_data: data })}
                 />
                 {formData.custom_pixel_data && (
                   <p className="text-xs text-accent mt-2">✓ Pixel art salva</p>
                 )}
               </div>
             )}
 
             {/* Preset Style Selection */}
             {!formData.use_custom_art && (
               <div>
                 <Label>Estilo Pixel Art *</Label>
                 <Select
                   value={formData.pixel_style}
                   onValueChange={(value) => setFormData({ ...formData, pixel_style: value })}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Selecione o estilo" />
                   </SelectTrigger>
                   <SelectContent>
                     {(PIXEL_ART_STYLES[formData.type] || []).map((style) => (
                       <SelectItem key={style.value} value={style.value}>
                         {style.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             )}
 
             <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <Label>Nome *</Label>
                 <Input
                   placeholder="Ex: Cabelo Goku SSJ"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 />
               </div>
 
               <div>
                 <Label>Tipo</Label>
                 <Select
                   value={formData.type}
                   onValueChange={(value) => {
                     const newStyles = PIXEL_ART_STYLES[value] || [];
                     setFormData({ 
                       ...formData, 
                       type: value,
                       pixel_style: newStyles[0]?.value || "vip-ssj"
                     });
                   }}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {CLOTHING_TYPES.map((type) => (
                       <SelectItem key={type.value} value={type.value}>
                         {type.icon} {type.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               <div>
                 <Label>Raridade</Label>
                 <Select
                   value={formData.rarity}
                   onValueChange={(value) => setFormData({ ...formData, rarity: value })}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {RARITY_OPTIONS.map((rarity) => (
                       <SelectItem key={rarity.value} value={rarity.value}>
                         {rarity.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               <div>
                 <Label>Preço (R$)</Label>
                 <Input
                   type="number"
                   step="0.01"
                   min="0"
                   placeholder="5.90"
                   value={(formData.price_brl_cents / 100).toFixed(2)}
                   onChange={(e) =>
                     setFormData({
                       ...formData,
                       price_brl_cents: Math.round(parseFloat(e.target.value || "0") * 100),
                     })
                   }
                 />
               </div>
 
               <div>
                 <Label>Nível Mínimo</Label>
                 <Input
                   type="number"
                   min="1"
                   max="100"
                   value={formData.min_level}
                   onChange={(e) =>
                     setFormData({ ...formData, min_level: parseInt(e.target.value) || 1 })
                   }
                 />
               </div>
 
               <div className="col-span-2">
                 <Label>Descrição</Label>
                 <Textarea
                   placeholder="Descrição opcional do item..."
                   value={formData.description}
                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                   rows={2}
                 />
               </div>
 
               <div className="col-span-2 flex items-center gap-2">
                 <Switch
                   checked={formData.is_available}
                   onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                 />
                 <Label>Disponível na loja</Label>
               </div>
             </div>
           </div>
 
           <DialogFooter>
             <Button variant="outline" onClick={handleCloseDialog}>
               Cancelar
             </Button>
             <Button
               onClick={handleSubmit}
               disabled={createMutation.isPending || updateMutation.isPending}
             >
               {(createMutation.isPending || updateMutation.isPending) && (
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
               )}
               {editingItem ? "Salvar" : "Criar"}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 }