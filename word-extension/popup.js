document.addEventListener('DOMContentLoaded', () => {
    const fontFamilySelect = document.getElementById('fontFamily');
    const backgroundImageSelect = document.getElementById('backgroundImage');
    const imageFolderSelect = document.getElementById('imageFolder');
    const backgroundScopeSelect = document.getElementById('backgroundScope');
    const selectionColorInput = document.getElementById('selectionColor');
    const applyButton = document.getElementById('apply');
    const currentImageEl = document.getElementById('currentImage');
    const enableFontColor = document.getElementById('enableFontColor').value === 'on';
    const fontColorPicker = document.getElementById('fontColorPicker');
    const heartButton = document.getElementById('heartButton');
    // 加載保存的設置
chrome.storage.sync.get([
    'fontFamily',
    'enableBackground',
    'imageFolder',
    'backgroundScope',
    'selectionColor',
    'enableFontColor',
    'fontColor',
    'currentBackgroundName'
], (result) => {
    fontFamilySelect.value = result.fontFamily || 'default';
    backgroundImageSelect.value = result.enableBackground ? 'on' : 'none';
    imageFolderSelect.value = result.imageFolder || 'miku';
    backgroundScopeSelect.value = result.backgroundScope || 'ai';
    selectionColorInput.value = result.selectionColor || '#800080';

    document.getElementById('enableFontColor').value = result.enableFontColor ? 'on' : 'off';
    fontColorPicker.style.display = result.enableFontColor ? 'block' : 'none';
    fontColorPicker.value = result.fontColor || '#ffffff';

    if (currentImageEl) {
        const name = result.currentBackgroundName || '';
        currentImageEl.textContent = name ? `目前背景：${name}` : '目前背景：無';
    }
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

    // 愛心按鈕事件監聽器
    heartButton.addEventListener('click', () => {
        chrome.storage.sync.get(['currentBackgroundName'], (result) => {
            const backgroundName = result.currentBackgroundName || '';
            
            if (backgroundName) {
                // 獲取當前時間
                const now = new Date();
                const timestamp = now.toISOString().replace(/[:.]/g, '-');
                const dateString = now.toLocaleDateString('zh-TW') + ' ' + now.toLocaleTimeString('zh-TW');
                
                // 創建記錄內容
                const record = `${dateString} - ${backgroundName}\n`;
                
                // 將記錄添加到本地文件
                chrome.storage.local.get(['favoriteBackgrounds'], (result) => {
                    const favorites = result.favoriteBackgrounds || '';
                    const updatedFavorites = favorites + record;
                    
                    chrome.storage.local.set({
                        favoriteBackgrounds: updatedFavorites
                    }, () => {
                        console.log('背景已收藏:', backgroundName);
                        
                        // 下載文件到本地
                        const blob = new Blob([updatedFavorites], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        
                        chrome.downloads.download({
                            url: url,
                            filename: 'favorite_backgrounds.txt',
                            conflictAction: 'overwrite'
                        }, () => {
                            URL.revokeObjectURL(url);
                            alert('背景已收藏！');
                        });
                    });
                });
            } else {
                alert('目前沒有背景可以收藏');
            }
        });
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (!currentImageEl || !changes.currentBackgroundName) return;
        const name = changes.currentBackgroundName.newValue || '';
        currentImageEl.textContent = name ? `目前背景：${name}` : '目前背景：無';
    });
});