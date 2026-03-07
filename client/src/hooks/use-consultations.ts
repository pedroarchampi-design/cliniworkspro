import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ConsultationInput } from "@shared/routes";

export function useConsultations(doctorId: string = "demo_doctor") {
  return useQuery({
    queryKey: [api.consultations.list.path, doctorId],
    queryFn: async () => {
      const url = `${api.consultations.list.path}?doctorId=${encodeURIComponent(doctorId)}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch consultations");
      return api.consultations.list.responses[200].parse(await res.json());
    },
  });
}

export function useConsultation(id: number | null) {
  return useQuery({
    queryKey: [api.consultations.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.consultations.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch consultation");
      return api.consultations.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ConsultationInput) => {
      const res = await fetch(api.consultations.create.path, {
        method: api.consultations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to process consultation");
      }
      
      return api.consultations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.consultations.list.path] });
    },
  });
}
