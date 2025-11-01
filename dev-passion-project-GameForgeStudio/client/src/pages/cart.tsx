import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CartView } from "@/components/cart-view";
import { ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

interface CartPageProps {
  sidebarCollapsed?: boolean;
}

export default function CartPage({ sidebarCollapsed = false }: CartPageProps) {
  const { data: user } = useCurrentUser();
  
  // For now, use mock user data since authentication is disabled
  const mockUserId = "mock-user-1";

  return (
    <div className="min-h-screen bg-background">
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/asset-store">
              <Button variant="ghost" size="sm" data-testid="button-back-to-store">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-cart-page-title">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground" data-testid="text-cart-page-subtitle">
              Review your selected items and proceed to checkout
            </p>
          </div>
        </div>

        {/* Cart Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <CartView 
              userId={mockUserId}
              onContinueShopping={() => window.location.href = "/asset-store"}
              showContinueShoppingButton={true}
              onCheckoutComplete={() => window.location.href = "/asset-store"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}