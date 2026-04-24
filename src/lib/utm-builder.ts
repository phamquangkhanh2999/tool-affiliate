export interface UTMParams {
  url: string;
  source: string;       // facebook | tiktok | youtube
  medium: string;       // social | video | shorts | post
  campaign: string;     // campaign name
  content?: string;     // A/B variant
  term?: string;        // keyword
}

export interface UTMResult {
  originalUrl: string;
  utmUrl: string;
  params: UTMParams;
  shortDisplay: string;
}

const PLATFORM_DEFAULTS: Record<string, { source: string; medium: string }> = {
  facebook: { source: 'facebook', medium: 'social' },
  tiktok: { source: 'tiktok', medium: 'video' },
  youtube: { source: 'youtube', medium: 'video' },
  zalo: { source: 'zalo', medium: 'social' },
  instagram: { source: 'instagram', medium: 'social' },
};

/**
 * Build a full UTM-tagged URL
 */
export function buildUTMUrl(params: UTMParams): UTMResult {
  const url = new URL(params.url);
  
  url.searchParams.set('utm_source', params.source);
  url.searchParams.set('utm_medium', params.medium);
  url.searchParams.set('utm_campaign', slugify(params.campaign));
  
  if (params.content) {
    url.searchParams.set('utm_content', slugify(params.content));
  }
  if (params.term) {
    url.searchParams.set('utm_term', slugify(params.term));
  }

  const utmUrl = url.toString();

  return {
    originalUrl: params.url,
    utmUrl,
    params,
    shortDisplay: utmUrl.length > 80 ? utmUrl.substring(0, 77) + '...' : utmUrl,
  };
}

/**
 * Quick build with platform defaults
 */
export function buildPlatformUTM(
  baseUrl: string,
  platform: string,
  campaignName: string,
  variant?: string
): UTMResult {
  const defaults = PLATFORM_DEFAULTS[platform] || { source: platform, medium: 'referral' };
  
  return buildUTMUrl({
    url: baseUrl,
    source: defaults.source,
    medium: defaults.medium,
    campaign: campaignName,
    content: variant,
  });
}

/**
 * Build UTM links for ALL platforms at once
 */
export function buildMultiPlatformUTM(
  baseUrl: string,
  campaignName: string
): Record<string, UTMResult> {
  const result: Record<string, UTMResult> = {};
  
  for (const [platform] of Object.entries(PLATFORM_DEFAULTS)) {
    result[platform] = buildPlatformUTM(baseUrl, platform, campaignName);
  }
  
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
