const FB_API_VERSION = 'v21.0';
const FB_GRAPH_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

export interface FBPublishResult {
  postId: string;
  postUrl: string;
}

export interface FBCommentResult {
  commentId: string;
}

export interface FBPageInfo {
  id: string;
  name: string;
  access_token: string;
  picture?: { data?: { url?: string } };
}

/**
 * Validate a Facebook Access Token
 */
export async function validateFBToken(accessToken: string): Promise<{ valid: boolean; name?: string; id?: string; error?: string }> {
  try {
    const res = await fetch(`${FB_GRAPH_URL}/me?access_token=${accessToken}&fields=id,name`);
    const data = await res.json();
    if (data.error) {
      return { valid: false, error: data.error.message };
    }
    return { valid: true, name: data.name, id: data.id };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}

/**
 * Get list of Facebook Pages managed by the token owner
 */
export async function getFBPages(userAccessToken: string): Promise<FBPageInfo[]> {
  const res = await fetch(
    `${FB_GRAPH_URL}/me/accounts?fields=id,name,access_token,picture&access_token=${userAccessToken}`
  );
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.data || [];
}

/**
 * Publish a text post to a Facebook Page
 */
export async function publishToPage(
  pageId: string,
  accessToken: string,
  message: string
): Promise<FBPublishResult> {
  const res = await fetch(`${FB_GRAPH_URL}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, access_token: accessToken }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'Lỗi khi đăng bài lên Facebook');
  }

  const postId = data.id; // format: "pageId_postId"
  const postUrl = `https://www.facebook.com/${postId.replace('_', '/posts/')}`;
  return { postId, postUrl };
}

/**
 * Post a comment on a Facebook post
 */
export async function commentOnPost(
  postId: string,
  accessToken: string,
  message: string
): Promise<FBCommentResult> {
  const res = await fetch(`${FB_GRAPH_URL}/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, access_token: accessToken }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'Lỗi khi comment');
  }

  return { commentId: data.id };
}

/**
 * Auto seed comments with delay between each comment
 * Returns the number of successfully posted comments
 */
export async function autoSeedComments(
  postId: string,
  accessToken: string,
  comments: string[],
  delayMs: number = 45000 // default 45 seconds
): Promise<{ posted: number; total: number; errors: string[] }> {
  const errors: string[] = [];
  let posted = 0;

  for (let i = 0; i < comments.length; i++) {
    try {
      // Wait before posting (skip delay for the first comment)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      await commentOnPost(postId, accessToken, comments[i]);
      posted++;
    } catch (err: any) {
      errors.push(`Comment ${i + 1}: ${err.message}`);
    }
  }

  return { posted, total: comments.length, errors };
}

/**
 * Full publish flow: Post + Auto-comment seedings
 */
export async function publishWithSeedings(
  pageId: string,
  accessToken: string,
  content: string,
  commentSeedings: string[],
  commentDelay: number = 45000
): Promise<{
  postId: string;
  postUrl: string;
  commentsPosted: number;
  totalComments: number;
  errors: string[];
}> {
  // Step 1: Publish post
  const { postId, postUrl } = await publishToPage(pageId, accessToken, content);

  // Step 2: Wait a bit before starting comments
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Step 3: Auto seed comments
  const seedResult = await autoSeedComments(postId, accessToken, commentSeedings, commentDelay);

  return {
    postId,
    postUrl,
    commentsPosted: seedResult.posted,
    totalComments: seedResult.total,
    errors: seedResult.errors,
  };
}

/**
 * REELS: Step 1 - Initialize Reels Upload Session
 */
export async function initReelUpload(
  pageId: string,
  accessToken: string
): Promise<{ video_id: string; upload_url: string }> {
  const res = await fetch(`${FB_GRAPH_URL}/${pageId}/video_reels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_phase: 'start', access_token: accessToken }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'Lỗi khởi tạo Reels');
  }

  return {
    video_id: data.video_id,
    upload_url: data.upload_url
  };
}

/**
 * REELS: Step 2 - Upload Video Binary
 * @param uploadUrl The URL from step 1
 * @param accessToken Page access token
 * @param videoData Buffer or Blob of the video
 */
export async function uploadReelVideo(
  uploadUrl: string,
  accessToken: string,
  videoBuffer: Buffer | ArrayBuffer
): Promise<any> {
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `OAuth ${accessToken}`,
      'offset': '0',
      'file_size': videoBuffer.byteLength.toString(),
      'Content-Type': 'application/octet-stream'
    },
    body: videoBuffer as any,
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'Lỗi upload video Reels');
  }

  return data;
}

/**
 * REELS: Step 3 - Finalize Reels Publication
 */
export async function finishReelUpload(
  pageId: string,
  accessToken: string,
  videoId: string,
  description: string = ''
): Promise<{ id: string }> {
  const res = await fetch(`${FB_GRAPH_URL}/${pageId}/video_reels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      upload_phase: 'finish',
      video_id: videoId,
      access_token: accessToken,
      description: description,
      video_state: 'PUBLISHED'
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'Lỗi hoàn tất Reels');
  }

  return data;
}

