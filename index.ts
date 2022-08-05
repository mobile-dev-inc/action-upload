import * as core from '@actions/core'
import ApiClient from './ApiClient'
import zipFolder from './archive_utils';
import { getParameters } from './params';

const knownAppTypes = ['ANDROID_APK', 'IOS_BUNDLE']

async function run() {
  const {
    apiKey,
    apiUrl,
    name,
    appFile,
    mappingFile,
    branchName,
    repoOwner,
    repoName,
    pullRequestId
  } = await getParameters()

  if (!knownAppTypes.includes(appFile.type)) {
    throw new Error(`Unsupported app file type: ${appFile.type}`)
  }

  zipFolder('.mobiledev', 'workspace.zip')

  const client = new ApiClient(apiKey, apiUrl)

  const request = {
    benchmarkName: name,
    branch: branchName,
    repoOwner: repoOwner,
    repoName: repoName,
    pullRequestId: pullRequestId
  }
  await client.uploadRequest(
    request,
    appFile.path,
    'workspace.zip',
    mappingFile,
  )
}

run().catch(e => {
  core.setFailed(`Error running mobile.dev Upload Action: ${e.message}`)
})
