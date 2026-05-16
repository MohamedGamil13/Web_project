import { apiClient, unwrap } from "@/lib/apiClient";

export async function getOccupancyInsights(params) {
  const res = await apiClient.get("/analytics/occupancy-insights", { params });
  return unwrap(res);
}
