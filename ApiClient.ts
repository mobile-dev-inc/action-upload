import fs from 'fs';
import fetch, { BodyInit } from 'node-fetch';

export type AnalysisRequestRequest = {
  benchmarkName: string
  apkId?: string
  instrumentationApkId?: string
  iosAppBinaryId?: string
  repoOwner?: string
  repoName?: string
  pullRequestId?: string
  branch?: string
  analysisIds?: string[]
  targetId?: string
}

export default class ApiClient {

  constructor(
    private apiKey: string,
    private apiUrl: string
  ) { }

  async uploadApp(appFile: string, path: string) {
    return await this.uploadFile(appFile, path)
  }

  async uploadMapping(mappingFile: string, apkId: string) {
    return await this.uploadFile(mappingFile, `mapping/${apkId}`)
  }

  async createAnalysisRequest(body: AnalysisRequestRequest) {
    return await this.apiRequest({
      method: 'POST',
      path: 'analysis',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  }

  private async uploadFile(file: string, path: string) {
    const fileStream = fs.createReadStream(file);
    const fileSize = fs.statSync(file).size;
    return await this.apiRequest({
      method: 'POST',
      path,
      headers: { 'Content-Length': `${fileSize}` },
      body: fileStream
    });
  }

  private async apiRequest({ method, path, headers, body }: {
    method: string,
    path: string,
    headers?: HeadersInit,
    body?: BodyInit | null
  }): Promise<any> {
    const res = await fetch(`${this.apiUrl}/${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        ...headers
      },
      body
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Request to ${res.url} failed (${res.status}): ${body}`);
    }
    return await res.json();
  }
}
