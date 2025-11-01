import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";

interface StorePageProps {
  sidebarCollapsed?: boolean;
}

// Helper function to get mock price for a game based on its name hash
const getGamePrice = (gameName: string): number => {
  const hash = gameName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const prices = [9.99, 14.99, 19.99, 24.99, 29.99, 39.99, 49.99];
  return prices[hash % prices.length];
};

export default function StorePage({ sidebarCollapsed = false }: StorePageProps) {
  // Fetch live games
  const { data: liveGames = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Filter to only show live games
  const availableGames = liveGames.filter(game => game.status === 'live');

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-background transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">Loading games...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Game Store
          </h1>
          <p className="text-muted-foreground">
            Discover and purchase amazing games from our community
          </p>
        </div>

        {/* Games Grid */}
        {availableGames.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No games available yet</h3>
            <p className="text-muted-foreground">
              Check back later for exciting new releases!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGames.map((game) => {
              const price = getGamePrice(game.name);
              return (
                <Link key={game.id} href={`/game/${game.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105" data-testid={`card-game-${game.id}`}>
                    <div className="p-6">
                      {/* Game Icon */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <span className="text-4xl">{game.icon}</span>
                        </div>
                      </div>

                      {/* Game Info */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold mb-2" data-testid={`text-game-name-${game.id}`}>
                          {game.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {game.description || "No description available"}
                        </p>
                        
                        {/* Game Details */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {game.engine}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {game.platform}
                          </Badge>
                          <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                            {game.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Price Display */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent" data-testid={`text-price-${game.id}`}>
                          ${price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
