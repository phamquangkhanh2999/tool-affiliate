import crypto from 'crypto';

/**
 * CÁCH 1: SHOPEE OPEN API (Chính thống dùng cho hệ thống lớn/SaaS)
 * Dùng AppID và Secret để tạo chữ ký (Signature) rồi lấy Link Rút gọn
 */
export async function generateShopeeLinkOpenAPI(
  originalUrl: string, 
  subIds: string[] = []
): Promise<string> {
  const APP_ID = process.env.SHOPEE_APP_ID || '';
  const SECRET_KEY = process.env.SHOPEE_SECRET_KEY || '';
  const TIMESTAMP = Math.floor(Date.now() / 1000).toString();

  // 1. Tạo Signature: HMAC-SHA256(appId + timestamp, secretKey)
  const baseString = APP_ID + TIMESTAMP;
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(baseString)
    .digest('hex');

  // 2. Fetch API
  const url = `https://partner.shopeemobile.com/api/v2/affiliate/generate_short_link?app_id=${APP_ID}&timestamp=${TIMESTAMP}&sign=${signature}`;
  
  const payload = {
    originUrl: originalUrl,
    subIds: subIds // Gắn tham số tracking (subId1, subId2...)
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    // Shopee sẽ trả về data.shortLink (ví dụ: https://shope.ee/xxxxx)
    if (data && data.shortLink) {
      return data.shortLink;
    }
    
    throw new Error(data.message || 'Lỗi API Shopee');
  } catch (error) {
    console.error('OpenAPI Error:', error);
    throw error;
  }
}

/**
 * CÁCH 2: INTERNAL GRAPHQL API (Cách hack nhanh giống Shortcuts, Cookie-based)
 * Cần truyền session cookie "SPC_F" hoặc các cookie affiliate từ trình duyệt.
 */
export async function generateShopeeLinkGraphQL(
  originalUrl: string,
  cookieString: string
): Promise<string> {
  const url = 'https://affiliate.shopee.vn/api/v3/gql';
  
  // Custom Mutation lấy từ dev tools Shopee Affiliate Web
  const graphqlPayload = {
    query: `mutation generateShortLink($url: String!, $subId1: String) { 
      generateShortLink(url: $url, subId1: $subId1) { 
        shortLink 
        originalLink
      } 
    }`,
    variables: {
      url: originalUrl,
      subId1: "automation_tool" // Tham số theo dõi nguồn click
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieString, // Nhét cookie bắt được vào đây
      },
      body: JSON.stringify(graphqlPayload)
    });

    const data = await res.json();
    
    // Nếu Cookie sống, Shopee sẽ trả về shortLink
    if (data?.data?.generateShortLink?.shortLink) {
      return data.data.generateShortLink.shortLink;
    }
    
    throw new Error('Cookie có thể đã hết hạn hoặc định dạng chưa đúng');
  } catch (error) {
    console.error('GraphQL API Error:', error);
    throw error;
  }
}
