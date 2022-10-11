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
    name: Upload build to mobile.dev
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.pull_request.head.sha }} # Checkout PR HEAD
```

# Android

```yaml
- uses: mobile-dev-inc/action-upload@v2.3.1
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    app-file: app/build/outputs/apk/debug/app-debug.apk
    # `name` is optional
    name: ${{ github.sha }} 
```

`app-file` should point to an x86 compatible APK file

### Proguard Deobfuscation

Include the Proguard mapping file to deobfuscate Android performance traces:

```yaml
- uses: mobile-dev-inc/action-upload@v2.3.1
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    app-file: app/build/outputs/apk/release/app-release.apk
    mapping-file: app/build/outputs/mapping/release/mapping.txt
    # `name` is optional
    name: ${{ github.sha }} 
```

# iOS

```yaml
- uses: mobile-dev-inc/action-upload@v2.3.1
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    app-file: <app_name>.app
    mapping-file: <app_name>.app.dSYM
    # `name` is optional
    name: ${{ github.sha }} 
```

`app-file` should point to an x86 compatible Simulator build packaged in a `zip` archive

`mapping-file` should point to generated .dSYM file (unique per build). more info [here](https://developer.apple.com/documentation/xcode/building-your-app-to-include-debugging-information). 

# Custom workspace location

By default, the action is looking for a `.mobiledev` folder with Maestro flows in the root directory of the project. If you would like to customize this behaviour, you can override it with a `workspace` argument:

```yaml
- uses: mobile-dev-inc/action-upload@v2.3.1
  with:
    api-key: ${{ secrets.MOBILE_DEV_API_KEY }}
    app-file: app.zip
    workspace: myApp/.mobiledev
    # `name` is optional
    name: ${{ github.sha }} 
```
