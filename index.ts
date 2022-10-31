import * as core from '@actions/core'
import ApiClient, { BenchmarkStatus, UploadStatusError, UploadRequest } from './ApiClient'
import { validateAppFile } from './app_file';
import { zipFolder, zipIfFolder } from './archive_utils';
import { getParameters } from './params';
import { existsSync } from 'fs';
import StatusPoller from './StatusPoller';

const knownAppTypes = ['ANDROID_APK', 'IOS_BUNDLE']

async function createWorkspaceZip(workspaceFolder: string | null): Promise<string | null> {
  const resolvedWorkspaceFolder = workspaceFolder || '.mobiledev'
  if (!existsSync(resolvedWorkspaceFolder)) {
    console.log(`Workspace directory does not exist: ${resolvedWorkspaceFolder}`)
    return null
  }
  console.log("Packaging .mobiledev folder")
  await zipFolder(resolvedWorkspaceFolder, 'workspace.zip');
  return 'workspace.zip'
}

export function getViewUploadInConsoleStr(uploadId: string, teamId: string, appId: string): string {
  return `Visit the web console for more details about the upload: https://console.mobile.dev/uploads/${uploadId}?teamId=${teamId}&appId=${appId}`
}


async function run() {
  const {
    apiKey,
    apiUrl,
    name,
    appFilePath,
    mappingFile,
    workspaceFolder,
    branchName,
    repoOwner,
    repoName,
    pullRequestId,
    env,
    async
  } = await getParameters()

  const appFile = await validateAppFile(
    await zipIfFolder(appFilePath)
  );
  if (!knownAppTypes.includes(appFile.type)) {
    throw new Error(`Unsupported app file type: ${appFile.type}`)
  }

  const workspaceZip = await createWorkspaceZip(workspaceFolder)

  const client = new ApiClient(apiKey, apiUrl)

  console.log("Uploading to mobile.dev")
  const request: UploadRequest = {
    benchmarkName: name,
    branch: branchName,
    repoOwner: repoOwner,
    repoName: repoName,
    pullRequestId: pullRequestId,
    env: env,
    agent: 'ci'
  }

  const { uploadId, teamId, targetId: appId } = await client.uploadRequest(
    request,
    appFile.path,
    workspaceZip,
    mappingFile && await zipIfFolder(mappingFile),
  )
  const viewUploadStr = getViewUploadInConsoleStr(uploadId, teamId, appId)
  console.log(viewUploadStr)

  !async && new StatusPoller(client, uploadId, viewUploadStr).startPolling()
}

run().catch(e => {
  core.setFailed(`Error running mobile.dev Upload Action: ${e.message}`)
})
