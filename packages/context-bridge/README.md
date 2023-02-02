# Context bridge

The context bridge brings the resources (or IPC communication) shared by packages/app and packages/view-novalt.

## Entity
Entity of typeorm sqlite used by app.

## DTO
This is the type of value transmitted when ipc communication is performed from view to app.

## Preload
View stores IPC/Node function functions separately in the SOPIA object. The declaration is made in [preload](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload).

## Renderer
The function declared in preload is extracted into one function. The preload is the declaration of Electron, and the renderer is the use of the view.