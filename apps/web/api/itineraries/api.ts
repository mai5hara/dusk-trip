import { apiClient } from '@/api/_common/client';
import {
  generateItineraryResponseSchema,
  itineraryDetailSchema,
  itineraryListItemSchema,
  z,
  type CreateItineraryBody,
  type GenerateItineraryBody,
  type GenerateItineraryResponse,
  type ItineraryDetail,
  type ItineraryListItem,
} from '@mood-trip/validators';

export async function getItineraries(): Promise<ItineraryListItem[]> {
  const response = await apiClient<unknown>('/itineraries');
  return z.array(itineraryListItemSchema).parse(response);
}

export async function getItinerary(id: string): Promise<ItineraryDetail> {
  const response = await apiClient<unknown>(`/itineraries/${id}`);
  return itineraryDetailSchema.parse(response);
}

export async function createItinerary(
  body: CreateItineraryBody,
): Promise<ItineraryListItem> {
  const response = await apiClient<unknown>('/itineraries', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return itineraryListItemSchema.parse(response);
}

export async function generateItinerary(
  body: GenerateItineraryBody,
): Promise<GenerateItineraryResponse> {
  const response = await apiClient<unknown>('/itineraries/plan', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return generateItineraryResponseSchema.parse(response);
}
