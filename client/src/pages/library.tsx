import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Archive, Download, Filter, Library as LibraryIcon, MoreHorizontal, Play, RefreshCw, Settings, Star, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/use-current-user";

interface LibraryPageProps {
  sidebarCollapsed: boolean;
}

interface GameLibraryItem {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  gameIcon: string;
  gameDescription?: string | null;
  purchasedAt: string;
  lastPlayed?: string | null;
  playTime: number;
  favorite: number;
}

interface ProjectPreview {
  id: string;
  icon: string;
  screenshots: string[];
}

type SortOption = "recent" | "title" | "playtime" | "favorites";

export default function LibraryPage({ sidebarCollapsed }: LibraryPageProps) {
  const userQuery = useCurrentUser();
  const [installedGames, setInstalledGames] = useState<Record<string, boolean>>({});
  const [favoriteGames, setFavoriteGames] = useState<Record<string, boolean>>({});
  const [archivedGames, setArchivedGames] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  
  // Fetch user's game library
  const { data: library, isLoading } = useQuery<GameLibraryItem[]>({
    queryKey: ['/api/library'],
    enabled: !!userQuery.data?.id,
  });

  const { data: projects = [] } = useQuery<ProjectPreview[]>({
    queryKey: ['/api/projects'],
  });

  const projectsById = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project]));
  }, [projects]);

  const isImageUrl = (value?: string | null) => {
    if (!value) return false;
    return value.startsWith("http") || value.startsWith("/") || value.startsWith("data:image");
  };

  const getGameCover = (item: GameLibraryItem) => {
    const project = projectsById.get(item.gameId);
    return project?.screenshots?.[0] || (isImageUrl(item.gameIcon) ? item.gameIcon : undefined);
  };

  const isGameInstalled = (item: GameLibraryItem) => {
    return installedGames[item.gameId] ?? Boolean(item.lastPlayed || item.playTime > 0);
  };

  const isGameFavorite = (item: GameLibraryItem) => {
    return favoriteGames[item.gameId] ?? item.favorite === 1;
  };

  const sortLibraryItems = (items: GameLibraryItem[]) => {
    return [...items].sort((a, b) => {
      const favoriteDifference = Number(isGameFavorite(b)) - Number(isGameFavorite(a));
      if (favoriteDifference !== 0) return favoriteDifference;

      switch (sortBy) {
        case "title":
          return a.gameName.localeCompare(b.gameName);
        case "playtime":
          return b.playTime - a.playTime;
        case "favorites":
          return Number(isGameFavorite(b)) - Number(isGameFavorite(a));
        case "recent":
        default:
          return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime();
      }
    });
  };

  const visibleLibrary = useMemo(() => {
    return sortLibraryItems((library || []).filter((item) => !archivedGames[item.gameId]));
  }, [archivedGames, favoriteGames, library, sortBy]);

  const archivedLibrary = useMemo(() => {
    return sortLibraryItems((library || []).filter((item) => archivedGames[item.gameId]));
  }, [archivedGames, favoriteGames, library, sortBy]);

  const setGameInstalled = (gameId: string, installed: boolean) => {
    setInstalledGames((current) => ({ ...current, [gameId]: installed }));
  };

  const toggleFavorite = (gameId: string) => {
    setFavoriteGames((current) => ({ ...current, [gameId]: !current[gameId] }));
  };

  const toggleArchive = (gameId: string) => {
    setArchivedGames((current) => ({ ...current, [gameId]: !current[gameId] }));
  };

  const renderGameCard = (item: GameLibraryItem, isArchived = false) => {
    const coverImage = getGameCover(item);
    const installed = isGameInstalled(item);
    const favorite = isGameFavorite(item);

    return (
      <div key={item.id} className="group" data-testid={`card-game-${item.gameId}`}>
        <Card className={`relative aspect-[3/4] overflow-hidden border-border bg-muted transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl ${isArchived ? "opacity-70" : ""}`}>
          {coverImage ? (
            <img
              src={coverImage}
              alt={item.gameName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-400/10">
              <span className="text-6xl">{item.gameIcon || "🎮"}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          {favorite && (
            <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-yellow-300 backdrop-blur">
              <Star className="h-5 w-5 fill-current" />
            </div>
          )}

          {isArchived && (
            <div className={`absolute top-3 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur ${favorite ? "left-14" : "left-3"}`}>
              Archived
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-3 top-3 h-9 w-9 rounded-full bg-zinc-700/80 text-white hover:bg-zinc-600 hover:text-white"
                aria-label={`Open ${item.gameName} options`}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isArchived ? (
                <>
                  <DropdownMenuItem onClick={() => toggleArchive(item.gameId)}>
                    <Archive className="h-4 w-4" />
                    Unarchive
                  </DropdownMenuItem>
                </>
              ) : installed ? (
                <>
                  <DropdownMenuItem onClick={() => setGameInstalled(item.gameId, false)}>
                    <Trash2 className="h-4 w-4" />
                    Uninstall
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleArchive(item.gameId)}>
                    <Archive className="h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RefreshCw className="h-4 w-4" />
                    Check for Updates
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4" />
                    Manage
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => toggleArchive(item.gameId)}>
                    <Archive className="h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleFavorite(item.gameId)}>
                    <Star className="h-4 w-4" />
                    {favorite ? "Unfavorite" : "Favorite"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isArchived && (
            <div className="absolute bottom-3 left-3 right-3">
              {installed ? (
                <Button className="w-full rounded-xl bg-white text-black hover:bg-white/90">
                  <Play className="h-4 w-4 fill-current" />
                  Launch
                </Button>
              ) : (
                <Button
                  className="w-full rounded-xl bg-white text-black hover:bg-white/90"
                  onClick={() => setGameInstalled(item.gameId, true)}
                >
                  <Download className="h-4 w-4" />
                  Install
                </Button>
              )}
            </div>
          )}
        </Card>

        <h3 className="mt-3 line-clamp-1 text-base font-semibold text-foreground" data-testid={`text-game-name-${item.gameId}`}>
          {item.gameName}
        </h3>
      </div>
    );
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
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse p-4">
                  <div className="mb-4 aspect-[3/4] w-full rounded-lg bg-muted" />
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
            <div className="space-y-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">All Games</h2>
                  <p className="text-sm text-muted-foreground">
                    {visibleLibrary.length} active {visibleLibrary.length === 1 ? "game" : "games"}
                  </p>
                </div>

                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-library-sort">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                    <SelectItem value="playtime">Most Played</SelectItem>
                    <SelectItem value="favorites">Favorites First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {visibleLibrary.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {visibleLibrary.map((item) => renderGameCard(item))}
                </div>
              ) : (
                <Card className="border-dashed p-8 text-center">
                  <LibraryIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No active games</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Archived games will not appear in your active library list.
                  </p>
                </Card>
              )}

              {archivedLibrary.length > 0 && (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Archived</h2>
                    <p className="text-sm text-muted-foreground">
                      Archived games stay out of your main library and cannot be installed or launched until restored.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {archivedLibrary.map((item) => renderGameCard(item, true))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
