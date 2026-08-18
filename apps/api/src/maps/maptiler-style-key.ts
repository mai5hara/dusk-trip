import { ConfigService } from '@nestjs/config';

/**
 * Client-facing map styles should use a MapTiler key that is origin/domain
 * restricted and has no account or management API permissions. Prefer
 * MAPTILER_MAP_API_KEY when set; otherwise fall back to MAPTILER_API_KEY so
 * existing restricted-key deployments keep working.
 */
export function getMapTilerStyleApiKey(configService: ConfigService): string {
  const dedicated = configService.get<string>('MAPTILER_MAP_API_KEY')?.trim();
  if (dedicated) {
    return dedicated;
  }
  return configService.getOrThrow<string>('MAPTILER_API_KEY');
}
