# mobile.dev Upload Action

Upload your app to mobile.dev for analysis.

# Triggers

Trigger this action on (1) pushes to your main branch and (2) pull requests opened against your main branch:


```yaml
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
```

If you need to use the `pull_request_target` trigger to support repo forks, check out the HEAD of the pull request to ensure that you're running the mobile.dev analysis against the changed code:

```yaml
on:
  push:
    branches: [ master ]
  pull_request_target:
    branches: [ master ]
jobs:
  upload-to-mobile-dev:
    runs-on: ubuntu-latest
    name: Upload artifact to mobile.dev
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.pull_request.head.sha }} # Checkout PR HEAD
```

# Android

```yaml
- uses: mobile-dev-inc/action-upload@v1.0.0
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    name: ${{ github.sha }}
    app-file: app/build/outputs/apk/debug/app-debug.apk
```

`app-file` should point to an x86 compatible APK file

### Proguard Deobfuscation

Include the Proguard mapping file to deobfuscate Android performance traces:

```yaml
- uses: mobile-dev-inc/action-upload@v1.0.0
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    name: ${{ github.sha }}
    app-file: app/build/outputs/apk/release/app-release.apk
    mapping-file: app/build/outputs/mapping/release/mapping.txt
```

# iOS

```yaml
- uses: mobile-dev-inc/action-upload@v1.0.0
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    name: ${{ github.sha }}
    app-file: app.zip
```

`app-file` should point to an x86 compatible Simulator build packaged in a `zip` archive
