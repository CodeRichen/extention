document.addEventListener('DOMContentLoaded', () => {
    const fontFamilySelect = document.getElementById('fontFamily');
    const backgroundImageSelect = document.getElementById('backgroundImage');
    const imageFolderSelect = document.getElementById('imageFolder');
    const backgroundScopeSelect = document.getElementById('backgroundScope');
    const selectionColorInput = document.getElementById('selectionColor');
    const applyButton = document.getElementById('apply');
    const enableFontColor = document.getElementById('enableFontColor').value === 'on';
    const fontColorPicker = document.getElementById('fontColorPicker');
    // 加載保存的設置
chrome.storage.sync.get([
    'fontFamily',
    'enableBackground',
    'imageFolder',
    'backgroundScope',
    'selectionColor',
    'enableFontColor',
    'fontColor'
], (result) => {
    fontFamilySelect.value = result.fontFamily || 'default';
    backgroundImageSelect.value = result.enableBackground ? 'on' : 'none';
    imageFolderSelect.value = result.imageFolder || 'miku';
    backgroundScopeSelect.value = result.backgroundScope || 'ai';
    selectionColorInput.value = result.selectionColor || '#800080';

    document.getElementById('enableFontColor').value = result.enableFontColor ? 'on' : 'off';
    fontColorPicker.style.display = result.enableFontColor ? 'block' : 'none';
    fontColorPicker.value = result.fontColor || '#ffffff';
});


    // 套用設定
    applyButton.addEventListener('click', () => {
        const fontFamily = fontFamilySelect.value;
        const enableBackground = backgroundImageSelect.value === 'on';
        const imageFolder = imageFolderSelect.value;
        const backgroundScope = backgroundScopeSelect.value;
        const selectionColor = selectionColorInput.value;
        const enableFontColor = document.getElementById('enableFontColor').value === 'on';
        const fontColor = fontColorPicker.value;
        
        // 添加時間戳，確保每次套用都會觸發更新
        chrome.storage.sync.set({
            fontFamily: fontFamily,
            enableBackground: enableBackground,
            imageFolder: imageFolder,
            backgroundScope: backgroundScope,
            selectionColor: selectionColor,
            enableFontColor: enableFontColor,
            fontColor: fontColor,
            updateTimestamp: Date.now() // 每次套用都更新時間戳
        }, () => {
            console.log('設置已保存');
        });
    });
});