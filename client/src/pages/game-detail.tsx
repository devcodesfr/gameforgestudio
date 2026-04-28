import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Home, ChevronRight, ArrowLeft, Check, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";
import { getGameCover, getGamePrice, toGameCartItem, useGameCart } from "@/hooks/use-game-cart";

interface GameDetailPageProps {
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

export default function GameDetailPage({ sidebarCollapsed = false }: GameDetailPageProps) {
  const { gameId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const gameCart = useGameCart();

  // Fetch all games and find the specific one
  const { data: allGames = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: library = [] } = useQuery<GameLibraryItem[]>({
    queryKey: ["/api/library"],
  });

  const game = allGames.find(g => g.id === gameId);
  const price = game ? getGamePrice(game.name) : 0;
  const owned = Boolean(game && library.some((item) => item.gameId === game.id));
  const inCart = Boolean(game && gameCart.isInCart(game.id));
  const coverImage = game ? getGameCover(game) : undefined;
  const authorIds = game ? getAuthorIds(game).join(",") : "";

  const { data: authors = [] } = useQuery<UserPreview[]>({
    queryKey: [`/api/users/public?ids=${authorIds}`],
    enabled: authorIds.length > 0,
  });

  const usersById = useMemo(() => {
    return new Map(authors.map((author) => [author.id, author]));
  }, [authors]);

  const handleBuyNow = () => {
    if (!game || owned) return;
    gameCart.addItem(toGameCartItem(game));
    navigate("/store/cart");
  };

  const handleAddToCart = () => {
    if (!game || owned) return;
    const added = gameCart.addItem(toGameCartItem(game));
    toast({
      title: added ? "Added to cart" : "Already in cart",
      description: added ? `${game.name} is ready for checkout.` : `${game.name} is already in your cart.`,
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
                {/* Game Cover Large */}
                <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10">
                  {coverImage ? (
                    <img src={coverImage} alt={game.name} className="h-80 w-full object-cover" />
                  ) : (
                    <div className="flex h-80 items-center justify-center">
                      <span className="text-9xl">{game.icon}</span>
                    </div>
                  )}
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
                    <div className="col-span-2">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Author</h3>
                      <div className="flex items-center gap-2 text-foreground">
                        <UserRound className="h-4 w-4 text-primary" />
                        <span>{formatAuthors(game, usersById)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Engine</h3>
                      <Badge variant="secondary">{game.engine}</Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">Platform</h3>
                      <Badge variant="outline">{game.platform}</Badge>
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
                    {owned ? (
                      <Button disabled className="w-full" size="lg" data-testid="button-owned">
                        <Check className="w-5 h-5 mr-2" />
                        Owned
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleBuyNow}
                          className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                          size="lg"
                          data-testid="button-buy-now"
                        >
                          Buy Now
                        </Button>

                        <Button
                          onClick={handleAddToCart}
                          variant="outline"
                          className="w-full"
                          size="lg"
                          data-testid="button-add-to-cart"
                        >
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {inCart ? "In Cart" : "Add to Cart"}
                        </Button>
                      </>
                    )}
                  </div>

                  <Separator className="mb-6" />

                  {/* Additional Info */}
                  <div className="space-y-3 text-sm">
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
