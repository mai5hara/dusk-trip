import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type ItineraryPlanDraft,
  type GenerateItineraryBody,
  itineraryPlanDraftSchema,
} from '@mood-trip/validators';
import type { ItineraryPlanner } from './itinerary-planner';

const REQUEST_TIMEOUT_MS = 30_000;

@Injectable()
export class GeminiItineraryPlannerService implements ItineraryPlanner {
  private readonly logger = new Logger(GeminiItineraryPlannerService.name);
  private readonly models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite',
  ] as const;

  constructor(private readonly configService: ConfigService) {}

  async generateItinerary(
    body: GenerateItineraryBody,
  ): Promise<ItineraryPlanDraft> {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    const ai = await this.createClient(apiKey);
    const prompt = this.buildPrompt(body);

    let lastError: unknown;

    for (const model of this.models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          REQUEST_TIMEOUT_MS,
        );

        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              abortSignal: controller.signal,
            },
          });

          const parsedJson = this.parseJsonResponse(response.text ?? '');
          const parsedPlan = itineraryPlanDraftSchema.safeParse(parsedJson);

          if (!parsedPlan.success) {
            throw new BadGatewayException(
              'Gemini returned an invalid itinerary',
            );
          }

          return parsedPlan.data;
        } catch (error) {
          lastError = error;

          if (error instanceof BadGatewayException) {
            throw error;
          }

          if (!this.isRetryableError(error)) {
            throw new BadGatewayException('Gemini itinerary planning failed');
          }

          const delayMs = 1000 * (attempt + 1);
          this.logger.warn(
            `Gemini ${model} unavailable (attempt ${attempt + 1}). Retrying in ${delayMs}ms.`,
          );
          await this.sleep(delayMs);
        } finally {
          clearTimeout(timeout);
        }
      }

      this.logger.warn(`Falling back from Gemini model ${model}.`);
    }

    this.logger.error('Gemini itinerary planning exhausted retries', lastError);
    throw new ServiceUnavailableException(
      'The AI planner is busy right now. Please try again in a moment.',
    );
  }

  private isRetryableError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const status =
      'status' in error ? (error as { status: unknown }).status : undefined;
    if (status === 429 || status === 500 || status === 503) {
      return true;
    }

    const name =
      'name' in error ? String((error as { name: unknown }).name) : '';
    const message =
      'message' in error ? String((error as { message: unknown }).message) : '';
    const code =
      'code' in error ? String((error as { code: unknown }).code) : '';
    const cause =
      'cause' in error && (error as { cause: unknown }).cause
        ? (
            error as {
              cause: { name?: unknown; code?: unknown; message?: unknown };
            }
          ).cause
        : undefined;

    if (name === 'AbortError' || name === 'TimeoutError') {
      return true;
    }

    if (
      code === 'ECONNRESET' ||
      cause?.code === 'ECONNRESET' ||
      /fetch failed|ECONNRESET/i.test(message) ||
      (typeof cause?.message === 'string' && /ECONNRESET/i.test(cause.message))
    ) {
      return true;
    }

    return false;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async createClient(apiKey: string) {
    const { GoogleGenAI } = await import('@google/genai');
    return new GoogleGenAI({ apiKey });
  }

  private buildPrompt(body: GenerateItineraryBody): string {
    const constraints = body.constraints?.trim() || 'No special constraints.';

    return `
You are a thoughtful travel planner for Dusk Trip.
Generate a practical itinerary as JSON only. Do not include markdown.

Input:
- Destination: ${body.destination}
- Mood: ${body.mood}
- Pace: ${body.pace}
- Start date: ${body.startDate.toISOString().slice(0, 10)}
- End date: ${body.endDate.toISOString().slice(0, 10)}
- Budget: ${body.budget}
- Travelers: ${body.travelers}
- Interests: ${body.interests.join(', ')}
- Constraints: ${constraints}

Return exactly this JSON shape:
{
  "title": "string",
  "location": "string",
  "summary": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "days": [
    {
      "dayLabel": "Day 1",
      "theme": "string",
      "items": [
        {
          "timeOfDay": "morning",
          "title": "string",
          "description": "string",
          "location": "string",
          "placeName": "string",
          "lat": 0,
          "lng": 0
        }
      ]
    }
  ]
}

Rules:
- Include one day object per itinerary day.
- Include exactly three items per day: morning, afternoon, and evening.
- Keep recommendations specific to the destination and aligned with the mood.
- Use specific, geocodable place names in placeName (real landmarks, neighborhoods, venues).
- location should be a short area label; placeName should be the precise POI name.
- Do not invent booking confirmations, prices, or exact opening hours.
- For lat and lng, give your best estimate of the place's real decimal coordinates (WGS84). Use 4-6 decimal places. These are approximate hints that will be refined, so do not omit them, but never fabricate precision you do not have.
`.trim();
  }

  private parseJsonResponse(text: string): unknown {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '');

    try {
      return JSON.parse(cleaned);
    } catch {
      throw new BadGatewayException('Gemini returned invalid JSON');
    }
  }
}
