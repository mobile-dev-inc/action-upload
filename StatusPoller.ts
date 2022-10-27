import * as core from '@actions/core'
import ApiClient, { BenchmarkStatus, UploadStatusError } from "./ApiClient";

const WAIT_TIMEOUT_MS = 1000 * 60 * 30 // 30 minutes
const INTERVAL_MS = 10000 // 10 seconds

export default class StatusPoller {
  timeout: NodeJS.Timeout | undefined

  constructor(
    private client: ApiClient,
    private uploadId: string,
    private viewUploadInConsoleStr: string
  ) { }

  markFailed(msg: string) {
    core.setFailed(msg)
  }

  async poll(
    sleep: number,
    prevErrorCount: number = 0
  ) {
    try {
      const { completed, status } = await this.client.getUploadStatus(this.uploadId)
      if (completed) {
        this.teardown()
        if (status === BenchmarkStatus.ERROR) {
          this.markFailed(`Upload failed. ${this.viewUploadInConsoleStr}`)
        } else {
          console.log(`Upload completed! ${this.viewUploadInConsoleStr}`)
        }
      } else {
        console.log(`Upload is ${status.toLowerCase()}, continuing to wait`)
        setTimeout(() => this.poll(sleep), sleep)
      }
    } catch (error) {
      if (error instanceof UploadStatusError) {
        if (error.status === 429) {
          // back off through extending sleep duration with 25%
          const newSleep = sleep * 1.25
          setTimeout(() => this.poll(newSleep, prevErrorCount), newSleep)
        } else if (error.status >= 500) {
          if (prevErrorCount < 3) {
            setTimeout(() => this.poll(sleep, prevErrorCount++), sleep)
          } else {
            this.markFailed(`Request to get status information failed with status code ${error.status}: ${error.text}`)
          }
        } else {
          this.markFailed(`Could not get Upload status. Received error ${error}. ${this.viewUploadInConsoleStr}`)
        }
      } else {
        this.markFailed(`Could not get Upload status. Received error ${error}. ${this.viewUploadInConsoleStr}`)
      }
    }
  }

  registerTimeout() {
    this.timeout = setTimeout(() => {
      this.markFailed(`Timed out waiting for Upload to complete. ${this.viewUploadInConsoleStr}`)
    }, WAIT_TIMEOUT_MS)
  }

  teardown() {
    this.timeout && clearTimeout(this.timeout)
  }

  startPolling() {
    try {
      this.poll(INTERVAL_MS)
    } catch (err) {
      this.markFailed(err instanceof Error ? err.message : `${err}`)
    }

    this.registerTimeout()
  }
}