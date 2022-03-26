import * as core from '@actions/core'
import ApiClient from './ApiClient'
import { getParameters } from './params';

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

  const client = new ApiClient(apiKey, apiUrl)

  if (appFile.type === 'ANDROID_APK') {
    const { id: appId } = await client.uploadApp(appFile.path, 'apk');
    if (mappingFile) await client.uploadMapping(mappingFile, appId)
    await client.createAnalysisRequest({
      benchmarkName: name,
      apkId: appId,
      branch: branchName,
      repoOwner: repoOwner,
      repoName: repoName,
      pullRequestId: pullRequestId
    })
  } else if (appFile.type === 'IOS_BUNDLE') {
    const { id: appId } = await client.uploadApp(appFile.path, 'iosAppBinary');
    await client.createAnalysisRequest({
      benchmarkName: name,
      iosAppBinaryId: appId,
      branch: branchName,
      repoOwner: repoOwner,
      repoName: repoName,
      pullRequestId: pullRequestId
    })
  } else {
    throw new Error(`Unsupported app file type: ${appFile.type}`)
  }
}

run().catch(e => {
  core.setFailed(`Error running mobile.dev Upload Action: ${e.message}`)
})
