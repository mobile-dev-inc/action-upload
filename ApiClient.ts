import fetch, { fileFromSync, FormData } from 'node-fetch';

export type UploadRequest = {
  benchmarkName?: string
  repoOwner?: string
  repoName?: string
  pullRequestId?: string
  branch?: string,
  env?: { [key: string]: string }
}

export default class ApiClient {

  constructor(
    private apiKey: string,
    private apiUrl: string
  ) { }

  async uploadRequest(
    request: UploadRequest,
    appFile: string,
    workspaceZip: string | null,
    mappingFile: string | null,
  ): Promise<any> {
    const formData = new FormData()

    formData.set('request', JSON.stringify(request))
    formData.set(
      'app_binary',
      fileFromSync(appFile)
    )

    if (workspaceZip) {
      formData.set(
        'workspace',
        fileFromSync(workspaceZip)
      );
    }

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
