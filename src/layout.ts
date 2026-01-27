async function initializeLayout(): Promise<void> {
  await fin.Platform.Layout.init()
}

export { initializeLayout }
