import * as github from '@actions/github';
import * as core from '@actions/core';
import { AppFile, validateMappingFile } from './app_file';

export type Params = {
  apiKey: string,
  apiUrl: string,
  name: string,
  appFilePath: string,
  mappingFile: string | null,
  workspaceFolder: string | null,
  branchName: string
  repoName: string
  repoOwner: string
  pullRequestId?: string,
  env?: { [key:string]: string },
}

function getBranchName(): string {
  const pullRequest = github.context.payload.pull_request
  if (pullRequest) {
    const branchName = pullRequest?.head?.ref;
    if (!branchName) {
      throw new Error(`Unable find pull request ref: ${JSON.stringify(pullRequest, undefined, 2)}`)
    }
    return branchName
  }

  const regex = /refs\/heads\/(.*)/
  const ref = github.context.ref
  let result = regex.exec(ref);
  if (!result) {
    throw new Error(`Failed to parse GitHub ref: ${ref}`)
  }
  return result[1]
}

function getRepoName(): string {
  return github.context.repo.repo
}

function getRepoOwner(): string {
  return github.context.repo.owner
}

function getPullRequestId(): string | undefined {
  const pullRequestId = github.context.payload.pull_request?.number
  if (pullRequestId === undefined) return undefined
  return `${pullRequestId}`
}

export async function getParameters(): Promise<Params> {
  const apiUrl = core.getInput('api-url', { required: false }) || 'https://api.mobile.dev'
  const name = core.getInput('name', { required: true })
  const apiKey = core.getInput('api-key', { required: true })
  const appFilePath = core.getInput('app-file', { required: true })
  const mappingFileInput = core.getInput('mapping-file', { required: false })
  const workspaceFolder = core.getInput('workspace', { required: false })
  const mappingFile = mappingFileInput && validateMappingFile(mappingFileInput)

  var env: { [key:string]:string } = {}
  env = core.getMultilineInput('env', { required: false })
    .map(it => {
      const pair = it.split("=", 1)

      if (pair.length != 2) {
        throw `Invalid env parameter: ${it}`
      }

      return { key: it[0], value: it[1] }
    })
    .reduce((map, entry) => {
      map[entry.key] = map[entry.value]
      return map
    }, env)

  const branchName = getBranchName()
  const repoOwner = getRepoOwner();
  const repoName = getRepoName();
  const pullRequestId = getPullRequestId()
  return { apiUrl, name, apiKey, appFilePath, mappingFile, workspaceFolder, branchName, repoOwner, repoName, pullRequestId, env }
}