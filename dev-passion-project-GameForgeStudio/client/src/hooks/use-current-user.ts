import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['/api/user/current'],
    retry: false, // Don't retry on error so we get immediate 401 error state for dev-login
  });
}