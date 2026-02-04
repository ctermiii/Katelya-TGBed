// 获取文件元数据 API（包括原始文件名）
export async function onRequest(context) {
  const { request, env, params } = context;
  
  // 处理 CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }
    });
  }
  
  const fileId = params.id;
  
  if (!fileId) {
    return new Response(JSON.stringify({ error: 'Missing file ID' }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  if (!env.img_url) {
    return new Response(JSON.stringify({ error: 'KV storage not available' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  try {
    // 尝试多种前缀查找（兼容新旧 Key 格式）
    const prefixes = ['img:', 'vid:', 'aud:', 'doc:', 'r2:', ''];
    let record = null;
    let foundKey = null;
    
    for (const prefix of prefixes) {
      const key = `${prefix}${fileId}`;
      record = await env.img_url.getWithMetadata(key);
      if (record && record.metadata) {
        foundKey = key;
        break;
      }
    }
    
    if (!record || !record.metadata) {
      // 文件不存在或没有元数据
      return new Response(JSON.stringify({ 
        error: 'File not found',
        fileId: fileId,
        // 返回基本信息（从 fileId 解析）
        fileName: fileId,
        originalName: null
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const metadata = record.metadata;
    
    // 返回文件元数据
    return new Response(JSON.stringify({
      success: true,
      fileId: fileId,
      key: foundKey,
      // 原始文件名（上传时保存的）
      fileName: metadata.fileName || fileId,
      originalName: metadata.fileName || null,
      // 其他元数据
      fileSize: metadata.fileSize || 0,
      uploadTime: metadata.TimeStamp || null,
      storageType: metadata.storageType || metadata.storage || 'telegram',
      listType: metadata.ListType || 'None',
      label: metadata.Label || 'None',
      liked: metadata.liked || false
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error fetching file info:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
