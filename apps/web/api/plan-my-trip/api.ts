import { apiClient } from '@/api/_common/client';
import {
  planTripResponseSchema,
  type PlanTripResponse,
  type PlanTripBody,
} from '@mood-trip/validators';

export async function planTrip(body: PlanTripBody): Promise<PlanTripResponse> {
  const response = await apiClient<unknown>('/trips/plan', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return planTripResponseSchema.parse(response);
}
