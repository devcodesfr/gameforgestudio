import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Purchase, InsertPurchase } from '@shared/schema';

export function usePurchases(userId: string) {
  return useQuery<Purchase[]>({
    queryKey: ['/api/purchases', userId],
    enabled: !!userId,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (purchase: InsertPurchase) => {
      const response = await apiRequest('POST', '/api/purchases', purchase);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases', variables.userId] });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, cartItems }: { userId: string; cartItems: any[] }) => {
      // Create purchase records for each cart item
      const purchases = [];
      
      for (const item of cartItems) {
        const purchaseData: InsertPurchase = {
          userId,
          assetId: item.assetId || null,
          bundleId: item.bundleId || null,
          amount: item.price * item.quantity, // Price is already in cents
          status: "completed",
        };
        
        const response = await apiRequest('POST', '/api/purchases', purchaseData);
        const purchase = await response.json();
        purchases.push(purchase);
      }
      
      // Clear cart after successful purchases
      await apiRequest('DELETE', `/api/cart/${userId}`);
      
      return purchases;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/cart', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchases', variables.userId] });
    },
  });
}