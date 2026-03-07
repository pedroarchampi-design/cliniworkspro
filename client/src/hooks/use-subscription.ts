import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useCheckout() {
  return useMutation({
    mutationFn: async ({ plan, doctorId }: { plan: string; doctorId: string }) => {
      const res = await fetch(api.subscription.checkout.path, {
        method: api.subscription.checkout.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, doctorId }),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to initiate checkout");
      }
      
      return api.subscription.checkout.responses[200].parse(await res.json());
    },
  });
}
