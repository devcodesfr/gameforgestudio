import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type CartItem, type InsertCartItem, type Asset, type AssetBundle } from "@shared/schema";

export function useCart(userId: string) {
  return useQuery<CartItem[]>({
    queryKey: ['/api/cart', userId],
    enabled: !!userId,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cartItem: InsertCartItem) => {
      const response = await apiRequest('POST', '/api/cart', cartItem);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the cart query for the user who added the item
      queryClient.invalidateQueries({ queryKey: ['/api/cart', variables.userId] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, itemId }: { userId: string; itemId: string }) => {
      const response = await apiRequest('DELETE', `/api/cart/${userId}/${itemId}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', variables.userId] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('DELETE', `/api/cart/${userId}`);
      return response.json();
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', userId] });
    },
  });
}

// Hook to get cart details with calculated values
export function useCartDetails(userId: string) {
  const cartQuery = useCart(userId);
  
  // Query for assets to get full details
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });
  
  // Query for bundles to get full details
  const { data: bundles = [] } = useQuery<AssetBundle[]>({
    queryKey: ['/api/bundles'],
  });
  
  const cartItems = cartQuery.data || [];
  
  // Calculate enhanced cart items with full asset/bundle details
  const enhancedCartItems = cartItems.map(item => {
    if (item.assetId) {
      const asset = assets.find(a => a.id === item.assetId);
      return {
        ...item,
        asset,
        type: 'asset' as const,
        name: asset?.name || 'Unknown Asset',
        price: asset?.price || 0,
        thumbnail: asset?.thumbnail || '',
      };
    } else if (item.bundleId) {
      const bundle = bundles.find(b => b.id === item.bundleId);
      return {
        ...item,
        bundle,
        type: 'bundle' as const,
        name: bundle?.name || 'Unknown Bundle',
        price: bundle?.price || 0,
        thumbnail: bundle?.thumbnail || '',
      };
    }
    return {
      ...item,
      type: 'unknown' as const,
      name: 'Unknown Item',
      price: 0,
      thumbnail: '',
    };
  });
  
  // Calculate totals
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = enhancedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    ...cartQuery,
    data: enhancedCartItems,
    itemCount,
    totalPrice,
    isEmpty: cartItems.length === 0,
  };
}