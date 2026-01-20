document.addEventListener('DOMContentLoaded', async () => {
  if (typeof fin !== 'undefined') {
    await fin.Platform.Layout.init()
  }
})
