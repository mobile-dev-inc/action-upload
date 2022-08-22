import * as core from '@actions/core'
import { existsSync, lstatSync } from 'fs';
import ApiClient from './ApiClient'
import { validateAppFile } from './app_file';
import { zipFolder, zipIfFolder } from './archive_utils';
import { getParameters } from './params';

const knownAppTypes = ['ANDROID_APK', 'IOS_BUNDLE']

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
    env
  } = await getParameters()

  const appFile = await validateAppFile(
    await zipIfFolder(appFilePath)
  );
  if (!knownAppTypes.includes(appFile.type)) {
    throw new Error(`Unsupported app file type: ${appFile.type}`)
  }

  console.log("Packaging .mobiledev folder")
  var actualWorkspaceFolder;
  if (workspaceFolder) {
    actualWorkspaceFolder = workspaceFolder;
  } else {
    actualWorkspaceFolder = '.mobiledev';
  }

  if (!existsSync(actualWorkspaceFolder)) {
    throw new Error(`Workspace folder does not exist: ${workspaceFolder}`);
  }

  await zipFolder(actualWorkspaceFolder, 'workspace.zip');

  const client = new ApiClient(apiKey, apiUrl)

  console.log("Uploading to mobile.dev")
  const request = {
    benchmarkName: name,
    branch: branchName,
    repoOwner: repoOwner,
    repoName: repoName,
    pullRequestId: pullRequestId,
    env: env
  }
  await client.uploadRequest(
    request,
    appFile.path,
    'workspace.zip',
    mappingFile && await zipIfFolder(mappingFile),
  )
}

run().catch(e => {
  core.setFailed(`Error running mobile.dev Upload Action: ${e.message}`)
})
