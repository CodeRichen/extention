// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const fontFamilySelect = document.getElementById('fontFamily');
    const backgroundImageSelect = document.getElementById('backgroundImage');
    const imageFolderSelect = document.getElementById('imageFolder');
    const backgroundScopeSelect = document.getElementById('backgroundScope');
    const applyButton = document.getElementById('apply');

    // 加載保存的設置
    chrome.storage.sync.get(['fontFamily', 'enableBackground', 'imageFolder', 'backgroundScope'], (result) => {
        if (result.fontFamily) fontFamilySelect.value = result.fontFamily;
        if (result.enableBackground !== undefined) backgroundImageSelect.value = result.enableBackground ? 'on' : 'none';
        if (result.imageFolder) imageFolderSelect.value = result.imageFolder;
        if (result.backgroundScope) backgroundScopeSelect.value = result.backgroundScope;
    });

    // 套用設定
    applyButton.addEventListener('click', () => {
        const fontFamily = fontFamilySelect.value === 'default' ? '' : fontFamilySelect.value;
        const enableBackground = backgroundImageSelect.value !== 'none';
        const imageFolder = imageFolderSelect.value;
        const backgroundScope = backgroundScopeSelect.value;

        // 保存設置到 chrome.storage
        chrome.storage.sync.set({
            fontFamily: fontFamily,
            enableBackground: enableBackground,
            imageFolder: imageFolder,
            backgroundScope: backgroundScope
        });
    });
});