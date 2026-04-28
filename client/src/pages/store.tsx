import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import type { Project } from "@shared/schema";
import { getGameCover, getGamePrice, toGameCartItem, useGameCart } from "@/hooks/use-game-cart";
import { useToast } from "@/hooks/use-toast";

interface StorePageProps {
  sidebarCollapsed?: boolean;
}

interface GameLibraryItem {
  gameId: string;
}

interface UserPreview {
  id: string;
  displayName: string;
}

function getAuthorIds(game: Project) {
  return Array.from(new Set([game.ownerId, ...game.teamMembers].filter(Boolean)));
}

function formatAuthors(game: Project, usersById: Map<string, UserPreview>) {
  const names = getAuthorIds(game)
    .map((id) => usersById.get(id)?.displayName)
    .filter(Boolean);

  if (names.length > 0) {
    return names.join(", ");
  }

  return "GameForge Creator";
}

export default function StorePage({ sidebarCollapsed = false }: StorePageProps) {
  const { toast } = useToast();
  const gameCart = useGameCart();

  // Fetch live games
  const { data: liveGames = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: library = [] } = useQuery<GameLibraryItem[]>({
    queryKey: ["/api/library"],
  });

  // Filter to only show live games
  const availableGames = liveGames.filter(game => game.status === 'live');
  const ownedGameIds = new Set(library.map((item) => item.gameId));
  const authorIds = Array.from(new Set(availableGames.flatMap(getAuthorIds))).join(",");

  const { data: authors = [] } = useQuery<UserPreview[]>({
    queryKey: [`/api/users/public?ids=${authorIds}`],
    enabled: authorIds.length > 0,
  });

  const usersById = useMemo(() => {
    return new Map(authors.map((author) => [author.id, author]));
  }, [authors]);

  const handleAddToCart = (game: Project) => {
    if (ownedGameIds.has(game.id)) return;

    const added = gameCart.addItem(toGameCartItem(game));
    toast({
      title: added ? "Added to cart" : "Already in cart",
      description: added ? `${game.name} is ready for checkout.` : `${game.name} is already in your cart.`,
    });
  };

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Game Store
            </h1>
            <p className="text-muted-foreground">
              Discover and purchase amazing games from our community
            </p>
          </div>

          <Button asChild variant="outline" className="relative rounded-xl">
            <Link href="/store/cart">
              <ShoppingCart className="h-4 w-4" />
              Cart
              {gameCart.items.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                  {gameCart.items.length}
                </span>
              )}
            </Link>
          </Button>
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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {availableGames.map((game) => {
              const price = getGamePrice(game.name);
              const coverImage = getGameCover(game);
              const owned = ownedGameIds.has(game.id);
              const inCart = gameCart.isInCart(game.id);

              return (
                <div key={game.id} className="group">
                  <Link href={`/game/${game.id}`}>
                    <Card className="relative aspect-[3/4] cursor-pointer overflow-hidden border-border bg-muted transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl" data-testid={`card-game-${game.id}`}>
                      {coverImage ? (
                        <img src={coverImage} alt={game.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-400/10">
                          <span className="text-6xl">{game.icon}</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                      {owned && (
                        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
                          Owned
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="line-clamp-1 text-lg font-bold text-white">{game.name}</p>
                        <p className="line-clamp-1 text-xs text-white/75">{formatAuthors(game, usersById)}</p>
                      </div>
                    </Card>
                  </Link>

                  <div className="mt-3 space-y-3">
                    <h3 className="line-clamp-1 text-base font-semibold text-foreground" data-testid={`text-game-name-${game.id}`}>
                      {game.name}
                    </h3>

                    <div className="flex items-center justify-between gap-3">
                      <div className="text-lg font-bold text-primary" data-testid={`text-price-${game.id}`}>
                        ${price.toFixed(2)}
                      </div>

                      {owned ? (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="h-3.5 w-3.5" />
                          Owned
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant={inCart ? "secondary" : "outline"}
                          className="rounded-xl"
                          onClick={() => handleAddToCart(game)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {inCart ? "In Cart" : "Add"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
