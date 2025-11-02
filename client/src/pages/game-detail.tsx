import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Home, ChevronRight, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

interface GameDetailPageProps {
  sidebarCollapsed?: boolean;
}

// Helper function to get mock price
const getGamePrice = (gameName: string): number => {
  const hash = gameName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const prices = [9.99, 14.99, 19.99, 24.99, 29.99, 39.99, 49.99];
  return prices[hash % prices.length];
};

export default function GameDetailPage({ sidebarCollapsed = false }: GameDetailPageProps) {
  const { gameId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch all games and find the specific one
  const { data: allGames = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const game = allGames.find(g => g.id === gameId);
  const price = game ? getGamePrice(game.name) : 0;

  // Buy Now mutation (immediate purchase)
  const buyNowMutation = useMutation({
    mutationFn: async () => {
      if (!game) throw new Error("Game not found");
      return apiRequest("POST", "/api/library", {
        game_id: game.id,
        game_name: game.name,
        game_icon: game.icon,
        game_description: game.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      toast({
        title: "Game purchased!",
        description: "Game has been added to your library.",
      });
      navigate("/library");
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleBuyNow = () => {
    buyNowMutation.mutate();
  };

  const handleAddToCart = () => {
    toast({
      title: "Coming soon!",
      description: "Shopping cart feature will be available soon.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="container mx-auto px-6 py-8">
            <div className="text-center text-muted-foreground">Loading game details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="container mx-auto px-6 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
              <Link href="/store">
                <Button>Back to Store</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Breadcrumb Navigation */}
        <div className="p-6 border-b border-border">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/store" className="hover:text-foreground">
              Game Store
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{game.name}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link href="/store">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Game Details */}
              <div className="lg:col-span-2">
                {/* Game Icon Large */}
                <div className="flex items-center justify-center mb-6 p-12 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl">
                  <span className="text-9xl">{game.icon}</span>
                </div>

                {/* Game Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">{game.name}</h1>
                    <p className="text-lg text-muted-foreground">
                      {game.description || "No description available for this game."}
                    </p>
                  </div>

                  <Separator />

                  {/* Game Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Engine</h3>
                      <Badge variant="secondary">{game.engine}</Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Platform</h3>
                      <Badge variant="outline">{game.platform}</Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Status</h3>
                      <Badge className="bg-green-500 hover:bg-green-600">{game.status}</Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Team</h3>
                      <p className="text-foreground">{game.teamMembers.length} members</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Purchase Panel */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-8">
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                      ${price.toFixed(2)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <Button 
                      onClick={handleBuyNow}
                      disabled={buyNowMutation.isPending}
                      className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                      size="lg"
                      data-testid="button-buy-now"
                    >
                      {buyNowMutation.isPending ? "Processing..." : "Buy Now"}
                    </Button>

                    <Button 
                      onClick={handleAddToCart}
                      variant="outline"
                      className="w-full"
                      size="lg"
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>

                  <Separator className="mb-6" />

                  {/* Additional Info */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Release Type</span>
                      <span className="font-medium">{game.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Platform</span>
                      <span className="font-medium">{game.platform}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Engine</span>
                      <span className="font-medium">{game.engine}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
