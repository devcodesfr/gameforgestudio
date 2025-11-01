import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Library as LibraryIcon, Clock, Calendar } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

interface LibraryPageProps {
  sidebarCollapsed: boolean;
}

interface GameLibraryItem {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  gameImage?: string;
  purchaseDate: string;
  lastPlayed?: string;
  playtime: number;
}

export default function LibraryPage({ sidebarCollapsed }: LibraryPageProps) {
  const userQuery = useCurrentUser();
  
  // Fetch user's game library
  const { data: library, isLoading } = useQuery<GameLibraryItem[]>({
    queryKey: ['/api/library'],
    enabled: !!userQuery.data?.id,
  });

  // Format playtime in hours
  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <LibraryIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-library-title">My Library</h1>
          </div>
          <p className="text-muted-foreground" data-testid="text-library-subtitle">Your game collection</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="w-full h-48 bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          ) : !library || library.length === 0 ? (
            <Card className="p-12 text-center" data-testid="card-empty-library">
              <LibraryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Your library is empty</h2>
              <p className="text-muted-foreground">
                Games you purchase or play will appear here
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {library.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:border-primary transition-colors cursor-pointer group"
                  data-testid={`card-game-${item.gameId}`}
                >
                  {/* Game Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {item.gameImage ? (
                      <img 
                        src={item.gameImage} 
                        alt={item.gameName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LibraryIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Game Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-3 line-clamp-1" data-testid={`text-game-name-${item.gameId}`}>
                      {item.gameName}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      {/* Purchase Date */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Purchased {formatDate(item.purchaseDate)}</span>
                      </div>

                      {/* Last Played */}
                      {item.lastPlayed && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Played {formatDate(item.lastPlayed)}</span>
                        </div>
                      )}

                      {/* Playtime */}
                      {item.playtime > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatPlaytime(item.playtime)} played</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
