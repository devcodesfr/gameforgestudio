import { useQuery } from "@tanstack/react-query";
import { type Metrics } from "@shared/schema";

export function useMetrics(userId: string) {
  return useQuery<Metrics>({
    queryKey: ['/api/metrics', userId],
    enabled: !!userId,
  });
}
