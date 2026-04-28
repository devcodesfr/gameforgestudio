import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Heart, Library, ShoppingCart, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useGameCart } from "@/hooks/use-game-cart";
import { useToast } from "@/hooks/use-toast";

interface GameCartPageProps {
  sidebarCollapsed?: boolean;
}

interface GameLibraryItem {
  gameId: string;
}

export default function GameCartPage({ sidebarCollapsed = false }: GameCartPageProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const gameCart = useGameCart();
  const [wishlistedGames, setWishlistedGames] = useState<Record<string, boolean>>({});

  const { data: library = [] } = useQuery<GameLibraryItem[]>({
    queryKey: ["/api/library"],
  });

  const ownedGameIds = useMemo(() => new Set(library.map((item) => item.gameId)), [library]);
  const purchasableItems = gameCart.items.filter((item) => !ownedGameIds.has(item.gameId));

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      for (const item of purchasableItems) {
        await apiRequest("POST", "/api/library", {
          game_id: item.gameId,
          game_name: item.gameName,
          game_icon: item.gameIcon,
          game_description: item.gameDescription || "",
        });
      }
    },
    onSuccess: () => {
      gameCart.clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      toast({
        title: "Purchase complete",
        description: "Your games have been added to your Library.",
      });
      navigate("/library");
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const addToWishlist = (gameId: string) => {
    setWishlistedGames((current) => ({ ...current, [gameId]: true }));
    gameCart.removeItem(gameId);
    toast({
      title: "Added to wishlist",
      description: "The game was moved out of your cart.",
    });
  };

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
      <div className="border-b border-border p-8">
        <Button asChild variant="ghost" className="mb-5">
          <Link href="/store">
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Game Cart</h1>
            <p className="text-muted-foreground">Configure your cart before completing your purchase.</p>
          </div>

          <Badge variant="secondary" className="w-fit gap-2 px-3 py-1.5">
            <ShoppingCart className="h-4 w-4" />
            {gameCart.items.length} {gameCart.items.length === 1 ? "item" : "items"}
          </Badge>
        </div>
      </div>

      <div className="p-8">
        {gameCart.items.length === 0 ? (
          <Card className="mx-auto max-w-2xl p-12 text-center">
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <h2 className="mb-2 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mb-6 text-muted-foreground">Add games from the Store when you are ready to buy.</p>
            <Button asChild>
              <Link href="/store">Browse Store</Link>
            </Button>
          </Card>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {gameCart.items.map((item) => {
                const owned = ownedGameIds.has(item.gameId);

                return (
                  <Card key={item.gameId} className="overflow-hidden p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="h-36 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-28">
                        {item.coverImage ? (
                          <img src={item.coverImage} alt={item.gameName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-400/10 text-4xl">
                            {item.gameIcon}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold">{item.gameName}</h3>
                          {owned && (
                            <Badge variant="secondary" className="gap-1">
                              <Check className="h-3.5 w-3.5" />
                              Owned
                            </Badge>
                          )}
                          {wishlistedGames[item.gameId] && (
                            <Badge variant="outline" className="gap-1">
                              <Heart className="h-3.5 w-3.5" />
                              Wishlisted
                            </Badge>
                          )}
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {item.gameDescription || "No description available."}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                        <p className="text-xl font-bold text-primary">${item.price.toFixed(2)}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => addToWishlist(item.gameId)}>
                            <Heart className="h-4 w-4" />
                            Wishlist
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => gameCart.removeItem(item.gameId)}>
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="h-fit p-6">
              <h2 className="mb-4 text-xl font-semibold">Purchase Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Purchasable games</span>
                  <span>{purchasableItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Already owned</span>
                  <span>{gameCart.items.length - purchasableItems.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ${purchasableItems.reduce((total, item) => total + item.price, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                className="mt-6 w-full"
                size="lg"
                disabled={purchasableItems.length === 0 || checkoutMutation.isPending}
                onClick={() => checkoutMutation.mutate()}
              >
                <Library className="h-5 w-5" />
                {checkoutMutation.isPending ? "Completing Purchase..." : "Complete Purchase"}
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
