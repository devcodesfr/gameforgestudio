import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCartDetails, useRemoveFromCart, useClearCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-purchase";
import { ShoppingCart, Trash2, X } from "lucide-react";

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

interface CartViewProps {
  userId: string;
  onContinueShopping?: () => void;
  showContinueShoppingButton?: boolean;
  onCheckoutComplete?: () => void;
}

export function CartView({ 
  userId, 
  onContinueShopping, 
  showContinueShoppingButton = false,
  onCheckoutComplete
}: CartViewProps) {
  const { toast } = useToast();
  const cartDetails = useCartDetails(userId);
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const checkoutMutation = useCheckout();

  const handleRemoveFromCart = async (itemId: string) => {
    try {
      await removeFromCartMutation.mutateAsync({ userId, itemId });
      toast({ title: "Item removed from cart" });
    } catch (error) {
      toast({ title: "Failed to remove item", variant: "destructive" });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCartMutation.mutateAsync(userId);
      toast({ title: "Cart cleared" });
    } catch (error) {
      toast({ title: "Failed to clear cart", variant: "destructive" });
    }
  };

  const handleCheckout = async () => {
    if (!cartDetails.data || cartDetails.data.length === 0) return;
    
    try {
      await checkoutMutation.mutateAsync({
        userId,
        cartItems: cartDetails.data,
      });
      
      toast({ 
        title: "Checkout successful!", 
        description: "Your purchases have been completed.",
      });
      
      // Redirect back to Asset Store
      if (onCheckoutComplete) {
        onCheckoutComplete();
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast({ 
        title: "Checkout failed", 
        description: "Please try again or contact support.",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Shopping Cart ({cartDetails.itemCount} items)
        </h2>
        {!cartDetails.isEmpty && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearCart}
            disabled={clearCartMutation.isPending}
            data-testid="button-clear-cart"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        )}
      </div>

      {/* Cart Content */}
      <div className="flex-1 overflow-y-auto">
        {cartDetails.isEmpty ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add some assets or bundles to get started!</p>
            {showContinueShoppingButton && onContinueShopping && (
              <Button onClick={onContinueShopping} data-testid="button-continue-shopping-empty">
                Continue Shopping
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {cartDetails.data?.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-6 border rounded-lg bg-card" data-testid={`cart-item-${item.id}`}>
                <img 
                  src={item.thumbnail} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  data-testid={`img-cart-item-${item.id}`}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-cart-item-${item.id}-name`}>
                    {item.name}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="capitalize">
                      {item.type}
                    </Badge>
                    <span>Quantity: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground mb-2" data-testid={`text-cart-item-${item.id}-price`}>
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveFromCart(item.id)}
                    disabled={removeFromCartMutation.isPending}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Total & Actions */}
      {!cartDetails.isEmpty && (
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xl font-semibold text-foreground">Total:</span>
            <span className="text-2xl font-bold text-primary" data-testid="text-cart-total">
              {formatCurrency(cartDetails.totalPrice)}
            </span>
          </div>
          <div className="flex space-x-4">
            {showContinueShoppingButton && onContinueShopping && (
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={onContinueShopping}
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
            )}
            <Button 
              className={showContinueShoppingButton ? "flex-1" : "w-full"}
              data-testid="button-checkout"
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending || cartDetails.isEmpty}
            >
              {checkoutMutation.isPending ? "Processing..." : "Checkout"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}