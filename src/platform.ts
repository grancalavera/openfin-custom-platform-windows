import * as WorkspacePlatform from '@openfin/workspace-platform'

export const initializePlatform = async () => {
  await WorkspacePlatform.init({ browser: null })
  const platform = fin.Platform.getCurrentSync();
  const windowWidth = 640;

  await Promise.all([
    platform.createWindow({
      defaultLeft: 100,
      defaultTop: 100,
      layout: {
        content: [
          {
            type: "stack",
            content: [
              {
                type: "component",
                componentName: "view",
                componentState: {
                  name: "main-view-1",
                  url: "http://192.168.68.64:5173",
                },
              },
            ],
          },
        ],
      },
    }),
    platform.createWindow({
      defaultLeft: 100 + windowWidth + 20,
      defaultTop: 100,
      layout: {
        content: [
          {
            type: "stack",
            content: [
              {
                type: "component",
                componentName: "view",
                componentState: {
                  name: "main-view-2",
                  url: "http://192.168.68.64:5173",
                },
              },
            ],
          },
        ],
      },
    }),
  ]);
};
