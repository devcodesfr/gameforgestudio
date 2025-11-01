import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToast } from "@/hooks/use-toast";
import { useCartDetails, useAddToCart } from "@/hooks/use-cart";
import { ShoppingCart, Search, Star, Download, Play, Filter } from "lucide-react";
import { type Asset, type AssetBundle } from "@shared/schema";

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const formatRating = (rating: number) => {
  return (rating / 100).toFixed(1);
};

const categoryColors = {
  music: "bg-purple-600 text-white",
  graphics: "bg-blue-600 text-white", 
  sounds: "bg-green-600 text-white",
  tools: "bg-orange-600 text-white",
  scripts: "bg-red-600 text-white",
};

interface AssetCardProps {
  asset: Asset;
  onAddToCart: (asset: Asset) => void;
}

function AssetCard({ asset, onAddToCart }: AssetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [isImageProofed, setIsImageProofed] = useState(false);
  
  const hasDiscount = asset.originalPrice && asset.originalPrice > asset.price;
  const discountPercent = hasDiscount 
    ? Math.round(((asset.originalPrice! - asset.price) / asset.originalPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking add to cart
    e.stopPropagation();
    onAddToCart(asset);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking preview
    e.stopPropagation();
    // Preview functionality would go here
  };

  // Enhanced image error handling with proof code
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    
    // Proof code: Prevent infinite retry loops
    if (imageRetryCount < 2 && !img.src.includes('data:image/svg+xml')) {
      // Retry loading original image up to 2 times
      setImageRetryCount(prev => prev + 1);
      setTimeout(() => {
        img.src = asset.thumbnail + '?retry=' + (imageRetryCount + 1);
      }, 500 * (imageRetryCount + 1)); // Exponential backoff
      return;
    }
    
    // Final fallback to placeholder
    setImageError(true);
    setImageLoading(false);
    setIsImageProofed(true);
    img.src = getPlaceholderImage();
  };

  // Enhanced image load handler with proof verification
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    
    // Proof code: Verify image actually loaded with valid dimensions
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setImageLoading(false);
      setImageError(false);
      setIsImageProofed(true);
    } else {
      // Image claims to be loaded but has no dimensions - treat as error
      handleImageError(e);
    }
  };

  const getPlaceholderImage = () => {
    // Generate a placeholder based on asset category
    const categoryIcons: Record<string, string> = {
      music: '🎵',
      graphics: '🎨',
      sounds: '🔊',
      models: '🎲',
      textures: '🖼️',
      scripts: '⚡',
      tools: '🔧'
    };
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f3f4f6"/>
        <text x="200" y="130" text-anchor="middle" font-size="48" fill="#6b7280">
          ${categoryIcons[asset.category] || '📦'}
        </text>
        <text x="200" y="180" text-anchor="middle" font-size="16" fill="#9ca3af" font-family="Arial, sans-serif">
          ${asset.category.charAt(0).toUpperCase() + asset.category.slice(1)} Asset
        </text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  return (
    <Link href={`/asset/${asset.id}`} className="block">
      <Card className="asset-card p-6 hover:shadow-lg transition-all cursor-pointer" data-testid={`card-asset-${asset.id}`}>
        <div className="relative mb-4">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}
          <img 
            src={imageError ? getPlaceholderImage() : asset.thumbnail} 
            alt={asset.name}
            className={`w-full h-48 object-cover rounded-lg transition-opacity duration-300 ${
              imageLoading || !isImageProofed ? 'opacity-50' : 'opacity-100'
            }`}
            data-testid={`img-asset-${asset.id}`}
            data-image-proof={isImageProofed ? 'verified' : 'pending'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white" data-testid={`badge-discount-${asset.id}`}>
            -{discountPercent}%
          </Badge>
        )}
        <Badge 
          className={`absolute top-2 left-2 ${categoryColors[asset.category as keyof typeof categoryColors]}`}
          data-testid={`badge-category-${asset.id}`}
        >
          {asset.category}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground" data-testid={`text-asset-${asset.id}-name`}>
          {asset.name}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-asset-${asset.id}-description`}>
          {asset.description}
        </p>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span data-testid={`text-asset-${asset.id}-rating`}>{formatRating(asset.rating)}</span>
            <span>({asset.reviewCount})</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span data-testid={`text-asset-${asset.id}-downloads`}>{asset.downloads.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-foreground" data-testid={`text-asset-${asset.id}-price`}>
              {formatCurrency(asset.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(asset.originalPrice!)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {asset.previewUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-shrink-0" 
                onClick={handlePreview}
                data-testid={`button-preview-${asset.id}`}
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            <Button 
              onClick={handleAddToCart}
              className="flex-1"
              size="sm"
              data-testid={`button-add-to-cart-${asset.id}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {asset.fileSize} • {asset.format}
        </div>
      </div>
      </Card>
    </Link>
  );
}

interface BundleCardProps {
  bundle: AssetBundle;
  onAddToCart: (bundle: AssetBundle) => void;
}

function BundleCard({ bundle, onAddToCart }: BundleCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [isImageProofed, setIsImageProofed] = useState(false);
  
  const hasDiscount = bundle.originalPrice && bundle.originalPrice > bundle.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking add to cart
    e.stopPropagation();
    onAddToCart(bundle);
  };

  // Enhanced image error handling with proof code
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    
    // Proof code: Prevent infinite retry loops
    if (imageRetryCount < 2 && !img.src.includes('data:image/svg+xml')) {
      // Retry loading original image up to 2 times
      setImageRetryCount(prev => prev + 1);
      setTimeout(() => {
        img.src = bundle.thumbnail + '?retry=' + (imageRetryCount + 1);
      }, 500 * (imageRetryCount + 1)); // Exponential backoff
      return;
    }
    
    // Final fallback to placeholder
    setImageError(true);
    setImageLoading(false);
    setIsImageProofed(true);
    img.src = getBundlePlaceholderImage();
  };

  // Enhanced image load handler with proof verification
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    
    // Proof code: Verify image actually loaded with valid dimensions
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setImageLoading(false);
      if (img.src.startsWith('data:image/svg+xml')) {
        // This is placeholder loading - keep error state
        setImageError(true);
      } else {
        // This is actual image loading successfully
        setImageError(false);
      }
      setIsImageProofed(true);
    } else {
      // Image claims to be loaded but has no dimensions - treat as error
      handleImageError(e);
    }
  };

  const getBundlePlaceholderImage = () => {
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#e11d48" opacity="0.1"/>
        <text x="200" y="130" text-anchor="middle" font-size="48" fill="#e11d48">
          📦
        </text>
        <text x="200" y="180" text-anchor="middle" font-size="16" fill="#e11d48" font-family="Arial, sans-serif">
          Asset Bundle
        </text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  return (
    <Link href={`/bundle/${bundle.id}`} className="block">
      <Card className="bundle-card p-6 border-2 border-primary/20 hover:shadow-lg transition-all cursor-pointer" data-testid={`card-bundle-${bundle.id}`}>
        <div className="relative mb-4">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}
          <img 
            src={imageError ? getBundlePlaceholderImage() : bundle.thumbnail} 
            alt={bundle.name}
            className={`w-full h-48 object-cover rounded-lg transition-opacity duration-300 ${
              imageLoading || !isImageProofed ? 'opacity-50' : 'opacity-100'
            }`}
            data-testid={`img-bundle-${bundle.id}`}
            data-image-proof={isImageProofed ? 'verified' : 'pending'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground" data-testid={`badge-bundle-discount-${bundle.id}`}>
            {bundle.discount}% OFF
          </Badge>
        )}
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
          Bundle
        </Badge>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground" data-testid={`text-bundle-${bundle.id}-name`}>
          {bundle.name}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-bundle-${bundle.id}-description`}>
          {bundle.description}
        </p>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span data-testid={`text-bundle-${bundle.id}-rating`}>{formatRating(bundle.rating)}</span>
            <span>({bundle.reviewCount})</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span data-testid={`text-bundle-${bundle.id}-downloads`}>{bundle.downloads.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-foreground" data-testid={`text-bundle-${bundle.id}-price`}>
              {formatCurrency(bundle.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(bundle.originalPrice!)}
              </span>
            )}
          </div>
          
          <Button 
            onClick={handleAddToCart}
            data-testid={`button-add-to-cart-bundle-${bundle.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add Bundle
          </Button>
        </div>
      </div>
      </Card>
    </Link>
  );
}

interface AssetStorePageProps {
  sidebarCollapsed?: boolean;
}

export default function AssetStorePage({ sidebarCollapsed = false }: AssetStorePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showBundles, setShowBundles] = useState(false);
  const { data: user } = useCurrentUser();
  const { toast } = useToast();
  
  // For now, use mock user data since authentication is disabled
  const mockUserId = "mock-user-1";
  const cartDetails = useCartDetails(mockUserId);
  const addToCartMutation = useAddToCart();

  // Fetch assets
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['/api/assets', selectedCategory === 'all' ? null : selectedCategory],
    queryFn: () => fetch(`/api/assets${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`).then(res => res.json()),
  });

  // Fetch bundles
  const { data: bundles = [], isLoading: bundlesLoading } = useQuery({
    queryKey: ['/api/bundles'],
    queryFn: () => fetch('/api/bundles').then(res => res.json()),
  });

  const handleAddAssetToCart = async (asset: Asset) => {
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

  const handleAddBundleToCart = async (bundle: AssetBundle) => {
    try {
      await addToCartMutation.mutateAsync({
        userId: mockUserId,
        bundleId: bundle.id,
        quantity: 1,
      });
      
      toast({ title: `${bundle.name} bundle added to cart!` });
    } catch (error) {
      toast({ title: "Failed to add to cart", variant: "destructive" });
    }
  };

  // Filter assets based on search
  const filteredAssets = assets.filter((asset: Asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredBundles = bundles.filter((bundle: AssetBundle) =>
    bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bundle.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-asset-store-title">
                Asset Store
              </h1>
              <p className="text-muted-foreground" data-testid="text-asset-store-subtitle">
                Discover premium game development assets for your projects
              </p>
            </div>
            
            {/* Cart Icon */}
            <Link href="/cart">
              <Button 
                variant="outline" 
                size="lg" 
                className="relative"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartDetails.itemCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center text-xs bg-primary text-primary-foreground rounded-full"
                    data-testid="badge-cart-count"
                  >
                    {cartDetails.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search assets, bundles, and tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 h-10 px-3 py-2" data-testid="select-category">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="p-1">
                <SelectItem value="all" className="px-3 py-2">All Categories</SelectItem>
                <SelectItem value="music" className="px-3 py-2">Music</SelectItem>
                <SelectItem value="graphics" className="px-3 py-2">Graphics</SelectItem>
                <SelectItem value="sounds" className="px-3 py-2">Sound Effects</SelectItem>
                <SelectItem value="tools" className="px-3 py-2">Tools</SelectItem>
                <SelectItem value="scripts" className="px-3 py-2">Scripts</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={!showBundles ? "default" : "outline"}
                onClick={() => setShowBundles(false)}
                data-testid="button-show-assets"
              >
                Assets
              </Button>
              <Button 
                variant={showBundles ? "default" : "outline"}
                onClick={() => setShowBundles(true)}
                data-testid="button-show-bundles"
              >
                Bundles
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {!showBundles ? (
            // Assets Grid
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Assets ({filteredAssets.length})
                </h2>
              </div>
              
              {assetsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-xl h-80"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="grid-assets">
                  {filteredAssets.map((asset: Asset) => (
                    <AssetCard key={asset.id} asset={asset} onAddToCart={handleAddAssetToCart} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Bundles Grid
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Asset Bundles ({filteredBundles.length})
                </h2>
              </div>
              
              {bundlesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-xl h-80"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-bundles">
                  {filteredBundles.map((bundle: AssetBundle) => (
                    <BundleCard key={bundle.id} bundle={bundle} onAddToCart={handleAddBundleToCart} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}