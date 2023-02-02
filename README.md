# SOPIA

SOPIA is an all-in-one live streaming program that DJ's who broadcast from a computer should use.

- Lighter performance than App Player
- Sound effects close to DAW
- Various contents not supported by existing spooncast
- Live streaming performance analysis and optimal streaming support
- Live streaming with higher sound quality than web streaming


## Install
Currently, it is supported as a Windows-only program. (Windows 10 and above)

Download the installer from https://sopia.dev.


## Development Setup

NodeJS 18, Rust 1.65 must be installed.

Install all dependencies of the cloned repository.

```sh
$ npm install
```

### Rendering structure

Most Electron programs integrate rendering resources into program memory and asar files.
Because of this, it is inconvenient to update the entire program even with small UI changes.


![image](https://user-images.githubusercontent.com/28672888/216256800-3d5fcd69-3fc1-4159-8e94-9fa1834ad348.png)


So, we managed resources in separate archives and refined user experience by segmenting updates.


![image](https://user-images.githubusercontent.com/28672888/216259837-d64023c8-5943-4934-902a-efeb427d7379.png)

[Backend](https://github.com/sopia-bot/SOPIA/tree/sopia-v4/packages/app) / [Frontend](https://github.com/sopia-bot/SOPIA/tree/sopia-v4/packages/view-novalt)


During development, we need to run two processes the render server and Electron.

**Renderer**
```sh
$ npm run view:dev
```

**Electron**
```sh
$ npm run app:dev
```

### Packages dependencies

```
context-bridge
└── core

app
├── archive
├── context-bridge
└── core

view-novalt
├── context-bridge
└── core
```

## Build

**Full build**
```sh
$ npm run build
```

**Specific build**
```sh
$ npm run core:build # packages/core
$ npm run bridge:build # packages/context-bridge
$ npm run archive:build # packages/archive
$ npm run view:build # packages/view-novalt
$ npm run app:build # packages/app
```


## Release

**Core package**
```sh
$ npm run core:publish
```

**Electron App**
```sh
$ node tools/version-patch/index.js && node tools/upload-app/index.js
```

**Resources**
```sh
$ node tools/upload-view/index.js
```