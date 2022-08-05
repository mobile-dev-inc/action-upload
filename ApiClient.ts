import fetch, { Blob, BodyInit, fileFromSync, FormData } from 'node-fetch';

export type UploadRequest = {
  benchmarkName: string
  repoOwner?: string
  repoName?: string
  pullRequestId?: string
  branch?: string
}

export default class ApiClient {

  constructor(
    private apiKey: string,
    private apiUrl: string
  ) { }

  async uploadRequest(
    request: UploadRequest,
    appFile: string,
    workspaceFile: string,
    mappingFile: string | null,
  ): Promise<any> {
    const formData = new FormData()

    formData.set('request', JSON.stringify(request))
    formData.set(
      'app_binary', 
      fileFromSync(appFile)
    )
    formData.set(
      'workspace',
      fileFromSync(workspaceFile)
    )
    
    if (mappingFile) {
      formData.set(
        'mapping',
        fileFromSync(mappingFile)
      )
    }

    const res = await fetch(`${this.apiUrl}/v2/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Request to ${res.url} failed (${res.status}): ${body}`);
    }
    return await res.json();
  }
}
