import { z } from 'zod';

export const destinationPlaceSchema = z.object({
  label: z.string().min(1).max(160),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  countryCode: z.string().length(2).optional(),
});

export type DestinationPlace = z.infer<typeof destinationPlaceSchema>;

export const destinationSuggestionSchema = z.object({
  label: z.string().min(1).max(160),
  primary: z.string().min(1).max(120),
  context: z.string().max(160),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  countryCode: z.string().length(2).optional(),
});

export type DestinationSuggestion = z.infer<typeof destinationSuggestionSchema>;

export const destinationSuggestionsQuerySchema = z.object({
  q: z.string().trim().min(2).max(120),
});

export type DestinationSuggestionsQuery = z.infer<
  typeof destinationSuggestionsQuerySchema
>;

export const destinationSuggestionsResponseSchema = z.object({
  suggestions: z.array(destinationSuggestionSchema),
});

export type DestinationSuggestionsResponse = z.infer<
  typeof destinationSuggestionsResponseSchema
>;
