document.addEventListener('DOMContentLoaded', function() {
    FilePond.registerPlugin(FilePondPluginImagePreview);
    FilePond.registerPlugin(FilePondPluginImageResize);
    FilePond.registerPlugin(FilePondPluginFileEncode);
    const inputElement = document.querySelector('input[type="file"]');
    const pond = FilePond.create(inputElement);
    FilePond.setOptions({
        stylePanelAspectRatio: 1 / 1,
        imageResizeTargetWidth: 150,
        imageResizeTargetHeight: 150,
    });
    FilePond.parse(document.body);
  });  

