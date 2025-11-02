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
  ArrowLeft, 
  Calendar,
  Home,
  ChevronRight,
  Package,
  Heart,
  Share2,
  ExternalLink
} from "lucide-react";
import { type AssetBundle, type Asset } from "@shared/schema";

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

interface RelatedBundleCardProps {
  bundle: AssetBundle;
}

function RelatedBundleCard({ bundle }: RelatedBundleCardProps) {
  const hasDiscount = bundle.originalPrice && bundle.originalPrice > bundle.price;
  
  return (
    <Link href={`/bundle/${bundle.id}`}>
      <Card className="bundle-related-card p-4 hover:shadow-md transition-all cursor-pointer" data-testid={`card-related-bundle-${bundle.id}`}>
        <div className="relative mb-3">
          <img 
            src={bundle.thumbnail} 
            alt={bundle.name}
            className="w-full h-32 object-cover rounded"
            data-testid={`img-related-bundle-${bundle.id}`}
          />
          {hasDiscount && (
            <Badge className="absolute top-1 right-1 text-xs bg-primary text-primary-foreground">
              {bundle.discount}% OFF
            </Badge>
          )}
          <Badge className="absolute top-1 left-1 text-xs bg-primary text-primary-foreground">
            Bundle
          </Badge>
        </div>
        
        <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-2" data-testid={`text-related-bundle-${bundle.id}-name`}>
          {bundle.name}
        </h4>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{formatRating(bundle.rating)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="w-3 h-3" />
            <span>{bundle.downloads.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-foreground" data-testid={`text-related-bundle-${bundle.id}-price`}>
              {formatCurrency(bundle.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(bundle.originalPrice!)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

interface BundleDetailPageProps {
  sidebarCollapsed?: boolean;
}

export default function BundleDetailPage({ sidebarCollapsed = false }: BundleDetailPageProps) {
  const { bundleId } = useParams();
  const [, navigate] = useLocation();
  const { data: user } = useCurrentUser();
  const { toast } = useToast();
  
  // For now, use mock user data since authentication is disabled
  const mockUserId = "mock-user-1";
  const addToCartMutation = useAddToCart();

  // Fetch the specific bundle
  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useQuery<AssetBundle>({
    queryKey: ['/api/bundles', bundleId],
    queryFn: () => fetch(`/api/bundles/${bundleId}`).then(res => {
      if (!res.ok) {
        throw new Error('Bundle not found');
      }
      return res.json();
    }),
    enabled: !!bundleId,
  });

  // Fetch all bundles for related suggestions
  const { data: allBundles = [] } = useQuery<AssetBundle[]>({
    queryKey: ['/api/bundles'],
  });

  const handleAddToCart = async () => {
    if (!bundle) return;
    
    try {
      await addToCartMutation.mutateAsync({
        userId: mockUserId,
        bundleId: bundle.id,
        quantity: 1,
      });
      
      toast({ title: `${bundle.name} bundle added to cart!` });
    } catch (error) {
      toast({ title: "Failed to add bundle to cart", variant: "destructive" });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: bundle?.name,
        text: bundle?.description,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (bundleLoading) {
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

  if (bundleError || !bundle) {
    return (
      <div className="min-h-screen bg-background">
        <div className={`transition-all duration-300 p-8 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Bundle Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The bundle you're looking for doesn't exist or may have been removed.
              </p>
              <Button onClick={() => navigate('/asset-store')} data-testid="button-back-to-store-bundle">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Asset Store
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = bundle.originalPrice && bundle.originalPrice > bundle.price;
  const savingsAmount = hasDiscount ? bundle.originalPrice! - bundle.price : 0;

  const filteredRelatedBundles = allBundles
    .filter(relatedBundle => relatedBundle.id !== bundle.id)
    .slice(0, 3); // Show max 3 related bundles

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Breadcrumb Navigation */}
        <div className="p-6 border-b border-border">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground" data-testid="nav-breadcrumb-bundle">
            <Link href="/" className="hover:text-foreground">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/asset-store" className="hover:text-foreground" data-testid="link-asset-store-bundle">
              Asset Store
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/asset-store?view=bundles" className="hover:text-foreground" data-testid="link-bundles">
              Bundles
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium" data-testid="text-current-bundle">
              {bundle.name}
            </span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Bundle Details */}
              <div className="lg:col-span-2">
                {/* Bundle Image */}
                <div className="relative mb-6">
                  <img 
                    src={bundle.thumbnail} 
                    alt={bundle.name}
                    className="w-full h-96 object-cover rounded-lg shadow-lg"
                    data-testid="img-bundle-main"
                  />
                  {hasDiscount && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-lg px-3 py-1">
                      {bundle.discount}% OFF
                    </Badge>
                  )}
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-lg px-3 py-1">
                    <Package className="w-4 h-4 mr-1" />
                    Bundle
                  </Badge>
                </div>

                {/* Bundle Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-3" data-testid="text-bundle-title">
                      {bundle.name}
                    </h1>
                    
                    <div className="flex items-center space-x-6 text-muted-foreground mb-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold" data-testid="text-bundle-rating">
                          {formatRating(bundle.rating)}
                        </span>
                        <span>({bundle.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span data-testid="text-bundle-downloads">{bundle.downloads.toLocaleString()} downloads</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>{formatDate(bundle.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">About This Bundle</h2>
                    <p className="text-muted-foreground leading-relaxed" data-testid="text-bundle-description">
                      {bundle.description}
                    </p>
                  </div>

                  <Separator />

                  {/* Bundle Contents */}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Bundle Contents</h2>
                    <div className="bg-muted/50 rounded-lg p-4" data-testid="container-bundle-contents">
                      <p className="text-muted-foreground">
                        This bundle contains {bundle.assetIds.length || "multiple"} carefully selected assets 
                        to provide everything you need for your project.
                      </p>
                      {/* In a real implementation, this would show the actual assets in the bundle */}
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p>• High-quality assets from verified creators</p>
                        <p>• Compatible formats for major game engines</p>
                        <p>• Commercial licensing included</p>
                        <p>• Regular updates and support</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Bundle Stats */}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">Bundle Statistics</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Total Downloads:</span>
                        <span className="text-muted-foreground ml-2">
                          {bundle.downloads.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Customer Rating:</span>
                        <span className="text-muted-foreground ml-2">
                          {formatRating(bundle.rating)} stars
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Discount:</span>
                        <span className="text-muted-foreground ml-2">
                          {bundle.discount}% off regular price
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Assets Included:</span>
                        <span className="text-muted-foreground ml-2">
                          {bundle.assetIds.length || "Multiple"} items
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
                      <span className="text-3xl font-bold text-foreground" data-testid="text-bundle-price">
                        {formatCurrency(bundle.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-lg text-muted-foreground line-through">
                          {formatCurrency(bundle.originalPrice!)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <div className="space-y-1">
                        <p className="text-green-600 font-medium">
                          Save {formatCurrency(savingsAmount)} ({bundle.discount}% off)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Limited time bundle offer
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <Button 
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                      className="w-full"
                      size="lg"
                      data-testid="button-add-to-cart-bundle-detail"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {addToCartMutation.isPending ? "Adding..." : "Add Bundle to Cart"}
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={handleShare}
                      className="w-full"
                      data-testid="button-share-bundle"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Bundle
                    </Button>
                  </div>

                  <Separator className="mb-6" />

                  {/* Bundle Benefits */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Complete asset collection</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <ExternalLink className="w-4 h-4" />
                      <span>Compatible with all major engines</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <Star className="w-4 h-4" />
                      <span>Best value - save {bundle.discount}%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Related Bundles */}
            {filteredRelatedBundles.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-related-bundles-title">
                  Other Popular Bundles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="grid-related-bundles">
                  {filteredRelatedBundles.map((relatedBundle) => (
                    <RelatedBundleCard key={relatedBundle.id} bundle={relatedBundle} />
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