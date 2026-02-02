import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FloatingChat } from "@/components/game/FloatingChat";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Character from "./pages/Character";
import Missions from "./pages/Missions";
import Training from "./pages/Training";
import Arena from "./pages/Arena";
import Ranking from "./pages/Ranking";
import Shop from "./pages/Shop";
import Inventory from "./pages/Inventory";
import Guilds from "./pages/Guilds";
import GuildWars from "./pages/GuildWars";
import Classes from "./pages/Classes";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <FloatingChat />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/character" element={
              <ProtectedRoute><Character /></ProtectedRoute>
            } />
            <Route path="/missions" element={
              <ProtectedRoute><Missions /></ProtectedRoute>
            } />
            <Route path="/training" element={
              <ProtectedRoute><Training /></ProtectedRoute>
            } />
            <Route path="/arena" element={
              <ProtectedRoute><Arena /></ProtectedRoute>
            } />
            <Route path="/ranking" element={
              <ProtectedRoute><Ranking /></ProtectedRoute>
            } />
            <Route path="/shop" element={
              <ProtectedRoute><Shop /></ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute><Inventory /></ProtectedRoute>
            } />
            <Route path="/guilds" element={
              <ProtectedRoute><Guilds /></ProtectedRoute>
            } />
            <Route path="/guild-wars" element={
              <ProtectedRoute><GuildWars /></ProtectedRoute>
            } />
            <Route path="/classes" element={
              <ProtectedRoute><Classes /></ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
