const rootStyles = window.getComputedStyle(document.documentElement)

if (rootStyles.getPropertyValue('--vinyl-cover-width-large') != null && rootStyles.getPropertyValue('--vinyl-cover-width-large') !== '') {
  ready()
} else {
  document.getElementById('main-css').addEventListener('load', ready)
}

function ready() {
  const coverWidth = parseFloat(rootStyles.getPropertyValue('--vinyl-cover-width-large'))
  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
  )

  FilePond.setOptions({
    imageResizeTargetWidth: coverWidth,
    imageResizeTargetHeight: coverWidth,
  })
  
  FilePond.parse(document.body)
}