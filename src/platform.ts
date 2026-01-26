export const initializePlatform = async () => {
  await fin.Platform.init({});
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
                  url: "http://192.168.68.58:5173",
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
                  url: "http://192.168.68.58:5173",
                },
              },
            ],
          },
        ],
      },
    }),
  ]);
};
