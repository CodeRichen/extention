// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const fontFamilySelect = document.getElementById('fontFamily');
    const backgroundImageSelect = document.getElementById('backgroundImage');
    const applyButton = document.getElementById('apply');

    // 加載保存的設置
    chrome.storage.sync.get(['fontFamily', 'enableBackground'], (result) => {
        if (result.fontFamily) {
            fontFamilySelect.value = result.fontFamily;
        }
        if (result.enableBackground !== undefined) {
            backgroundImageSelect.value = result.enableBackground ? 'url("https://picsum.photos/1920/1080")' : 'none';
        }
    });

    // 更新字體大小顯示
    fontSizeInput.addEventListener('input', () => {
        fontSizeValue.textContent = `${fontSizeInput.value}px`;
    });

    // 套用設定
    applyButton.addEventListener('click', () => {
        const fontSize = fontSizeInput.value;
        const fontFamily = fontFamilySelect.value === 'default' ? '' : fontFamilySelect.value;
        const enableBackground = backgroundImageSelect.value !== 'none';

        // 保存設置到 chrome.storage
        chrome.storage.sync.set({
            fontFamily: fontFamily,
            enableBackground: enableBackground
        });

        // 對當前標籤應用字體大小（即時效果）
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.executeScript(tabs[0].id, {
                code: `
                    document.body.style.fontSize = '${fontSize}px';
                `
            });
        });
    });
});