import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToast } from "@/hooks/use-toast";
import { useAddToCart } from "@/hooks/use-cart";
import { 
  ShoppingCart, 
  Star, 
  Download, 
  Play, 
  ArrowLeft, 
  FileText, 
  Calendar,
  Home,
  ChevronRight,
  Heart,
  Share2,
  ExternalLink
} from "lucide-react";
import { type Asset } from "@shared/schema";

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const formatRating = (rating: number) => {
  return (rating / 100).toFixed(1);
};

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'Unknown date';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Unknown date';
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Unknown date';
  }
};

const categoryColors = {
  music: "bg-purple-500/20 text-purple-400",
  graphics: "bg-blue-500/20 text-blue-400", 
  sounds: "bg-green-500/20 text-green-400",
  tools: "bg-orange-500/20 text-orange-400",
  scripts: "bg-red-500/20 text-red-400",
};

const categoryLabels = {
  music: "Music",
  graphics: "Graphics", 
  sounds: "Sound Effects",
  tools: "Tools",
  scripts: "Scripts",
};

interface RelatedAssetCardProps {
  asset: Asset;
}

function RelatedAssetCard({ asset }: RelatedAssetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isImageProofed, setIsImageProofed] = useState(false);
  
  const hasDiscount = asset.originalPrice && asset.originalPrice > asset.price;
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    setImageLoading(false);
    setIsImageProofed(true);
    const img = e.currentTarget;
    img.src = getRelatedAssetPlaceholder(asset.category);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setImageLoading(false);
      setImageError(false);
      setIsImageProofed(true);
    } else {
      handleImageError(e);
    }
  };

  const getRelatedAssetPlaceholder = (category: string) => {
    const categoryIcons: Record<string, string> = {
      music: '🎵',
      graphics: '🎨',
      sounds: '🔊',
      tools: '🔧',
      scripts: '⚡'
    };
    const svg = `
      <svg width="200" height="128" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="128" fill="#f3f4f6"/>
        <text x="100" y="70" text-anchor="middle" font-size="24" fill="#6b7280">
          ${categoryIcons[category] || '📦'}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };
  
  return (
    <Link href={`/asset/${asset.id}`}>
      <Card className="asset-related-card p-4 hover:shadow-md transition-all cursor-pointer" data-testid={`card-related-asset-${asset.id}`}>
        <div className="relative mb-3">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
              <div className="text-gray-400 text-xs">Loading...</div>
            </div>
          )}
          <img 
            src={imageError ? getRelatedAssetPlaceholder(asset.category) : asset.thumbnail} 
            alt={asset.name}
            className={`w-full h-32 object-cover rounded transition-opacity duration-300 ${
              imageLoading || !isImageProofed ? 'opacity-50' : 'opacity-100'
            }`}
            data-testid={`img-related-asset-${asset.id}`}
            data-image-proof={isImageProofed ? 'verified' : 'pending'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
          {hasDiscount && (
            <Badge className="absolute top-1 right-1 text-xs bg-red-500 text-white">
              Sale
            </Badge>
          )}
        </div>
        
        <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-2" data-testid={`text-related-asset-${asset.id}-name`}>
          {asset.name}
        </h4>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{formatRating(asset.rating)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="w-3 h-3" />
            <span>{asset.downloads.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-foreground" data-testid={`text-related-asset-${asset.id}-price`}>
              {formatCurrency(asset.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(asset.originalPrice!)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

interface AssetDetailPageProps {
  sidebarCollapsed?: boolean;
}

export default function AssetDetailPage({ sidebarCollapsed = false }: AssetDetailPageProps) {
  const { assetId } = useParams();
  const [, navigate] = useLocation();
  const { data: user } = useCurrentUser();
  const { toast } = useToast();
  
  // For now, use mock user data since authentication is disabled
  const mockUserId = "mock-user-1";
  const addToCartMutation = useAddToCart();

  // Fetch the specific asset with enhanced error handling
  const { data: asset, isLoading: assetLoading, error: assetError } = useQuery<Asset>({
    queryKey: ['/api/assets', assetId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/assets/${assetId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Asset not found');
          }
          throw new Error(`Failed to load asset: ${response.status}`);
        }
        const data = await response.json();
        // Validate required fields to prevent crashes
        if (!data.id || !data.name || !data.thumbnail) {
          throw new Error('Invalid asset data');
        }
        return data;
      } catch (error) {
        console.error('Asset loading error:', error);
        throw error;
      }
    },
    enabled: !!assetId,
    retry: 2,
    retryDelay: 1000,
  });

  // Fetch related assets with enhanced error handling
  const { data: relatedAssets = [] } = useQuery<Asset[]>({
    queryKey: ['/api/assets', asset?.category],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/assets?category=${asset?.category}`);
        if (!response.ok) {
          console.warn('Failed to load related assets');
          return [];
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Related assets loading error:', error);
        return [];
      }
    },
    enabled: !!asset?.category,
    retry: 1,
  });

  const handleAddToCart = async () => {
    if (!asset) return;
    
    try {
      await addToCartMutation.mutateAsync({
        userId: mockUserId,
        assetId: asset.id,
        quantity: 1,
      });
      
      toast({ title: `${asset.name} added to cart!` });
    } catch (error) {
      toast({ title: "Failed to add to cart", variant: "destructive" });
    }
  };

  const handlePreview = () => {
    if (asset?.previewUrl) {
      // In a real implementation, this would open a preview modal or play the audio
      toast({ title: "Preview functionality coming soon!" });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: asset?.name,
        text: asset?.description,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (assetLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className={`transition-all duration-300 p-8 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-lg mb-6" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-80 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (assetError || !asset) {
    return (
      <div className="min-h-screen bg-background">
        <div className={`transition-all duration-300 p-8 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Asset Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The asset you're looking for doesn't exist or may have been removed.
              </p>
              <Button onClick={() => navigate('/asset-store')} data-testid="button-back-to-store">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Asset Store
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = asset.originalPrice && asset.originalPrice > asset.price;
  const discountPercent = hasDiscount 
    ? Math.round(((asset.originalPrice! - asset.price) / asset.originalPrice!) * 100)
    : 0;

  const filteredRelatedAssets = relatedAssets
    .filter(relatedAsset => relatedAsset.id !== asset.id)
    .slice(0, 4); // Show max 4 related assets

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Breadcrumb Navigation */}
        <div className="p-6 border-b border-border">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground" data-testid="nav-breadcrumb">
            <Link href="/" className="hover:text-foreground">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/asset-store" className="hover:text-foreground" data-testid="link-asset-store">
              Asset Store
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link 
              href={`/asset-store?category=${asset.category}`} 
              className="hover:text-foreground capitalize" 
              data-testid={`link-category-${asset.category}`}
            >
              {categoryLabels[asset.category as keyof typeof categoryLabels]}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium" data-testid="text-current-asset">
              {asset.name}
            </span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Asset Details */}
              <div className="lg:col-span-2">
                {/* Asset Image with enhanced loading */}
                <div className="relative mb-6">
                  <img 
                    src={asset.thumbnail} 
                    alt={asset.name}
                    className="w-full h-96 object-cover rounded-lg shadow-lg"
                    data-testid="img-asset-main"
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.src = `data:image/svg+xml;utf8,${encodeURIComponent(`
                        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                          <rect width="800" height="600" fill="#f3f4f6"/>
                          <text x="400" y="280" text-anchor="middle" font-size="48" fill="#6b7280">🎮</text>
                          <text x="400" y="340" text-anchor="middle" font-size="20" fill="#9ca3af" font-family="Arial, sans-serif">
                            ${asset.name || 'Game Asset'}
                          </text>
                        </svg>
                      `)}`;
                    }}
                  />
                  {hasDiscount && (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white text-lg px-3 py-1">
                      -{discountPercent}% OFF
                    </Badge>
                  )}
                  <Badge 
                    className={`absolute top-4 left-4 text-lg px-3 py-1 ${categoryColors[asset.category as keyof typeof categoryColors]}`}
                  >
                    {categoryLabels[asset.category as keyof typeof categoryLabels]}
                  </Badge>
                </div>

                {/* Asset Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-3" data-testid="text-asset-title">
                      {asset.name}
                    </h1>
                    
                    <div className="flex items-center space-x-6 text-muted-foreground mb-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold" data-testid="text-asset-rating">
                          {formatRating(asset.rating)}
                        </span>
                        <span>({asset.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span data-testid="text-asset-downloads">{asset.downloads.toLocaleString()} downloads</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>{formatDate(asset.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Description</h2>
                    <p className="text-muted-foreground leading-relaxed" data-testid="text-asset-description">
                      {asset.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Tags */}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Tags</h2>
                    <div className="flex flex-wrap gap-2" data-testid="container-asset-tags">
                      {asset.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" data-testid={`tag-${tag}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Technical Details */}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Technical Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">File Size:</span>
                        <span className="text-muted-foreground ml-2" data-testid="text-asset-file-size">
                          {asset.fileSize}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Format:</span>
                        <span className="text-muted-foreground ml-2" data-testid="text-asset-format">
                          {asset.format}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Category:</span>
                        <span className="text-muted-foreground ml-2">
                          {categoryLabels[asset.category as keyof typeof categoryLabels]}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Downloads:</span>
                        <span className="text-muted-foreground ml-2">
                          {asset.downloads.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Purchase & Actions */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-8">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-3xl font-bold text-foreground" data-testid="text-asset-price">
                        {formatCurrency(asset.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-lg text-muted-foreground line-through">
                          {formatCurrency(asset.originalPrice!)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <p className="text-green-600 font-medium">
                        Save {formatCurrency(asset.originalPrice! - asset.price)} ({discountPercent}% off)
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <Button 
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                      className="w-full"
                      size="lg"
                      data-testid="button-add-to-cart-detail"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      {asset.previewUrl && (
                        <Button 
                          variant="outline" 
                          onClick={handlePreview}
                          data-testid="button-preview-detail"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={handleShare}
                        data-testid="button-share"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  {/* Additional Info */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>Instant download after purchase</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <ExternalLink className="w-4 h-4" />
                      <span>Compatible with {asset.format}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Related Assets */}
            {filteredRelatedAssets.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-related-assets-title">
                  Related Assets
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="grid-related-assets">
                  {filteredRelatedAssets.map((relatedAsset) => (
                    <RelatedAssetCard key={relatedAsset.id} asset={relatedAsset} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}