document.addEventListener('DOMContentLoaded', async () => {
  if (typeof fin !== 'undefined') {
    await fin.Platform.Layout.init()

    const closeButton = document.getElementById('close-button')
    if (closeButton) {
      closeButton.addEventListener('click', async () => {
        const currentWindow = await fin.Window.getCurrent()
        await currentWindow.close()
      })
    }
  }
})
