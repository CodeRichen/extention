// content.js
const style = document.createElement('style');
document.head.appendChild(style);

// 定義默認設置
const defaultSettings = {
  fontFamily: '微軟正黑體',
  enableBackground: true,
  backgroundScope: 'gpt', // 'gpt' 或 'all'
  imageFolder: 'miku' // 'miku' 或 'pho'
};
const imageCounts = {
  miku: 15,
  pho: 10
};

// 定義函數來設置樣式
function setCustomStyles(settings) {
  const isGPTPage = window.location.hostname.includes('gpt') || window.location.hostname.includes('openai');
  const applyToAll = settings.backgroundScope === 'all';
  let cssRules = `
    * {
      font-family: '${settings.fontFamily || defaultSettings.fontFamily}' !important;
    }
  `;

  // 選取文字樣式
  cssRules += `
    ::selection {
      background-color: purple !important;
      color: white !important;
    }
    ::-moz-selection {
      background-color: purple !important;
      color: white !important;
    }
  `;

  // 背景圖片設置
  if (settings.enableBackground && (applyToAll || isGPTPage)) {
    const folder = settings.imageFolder || defaultSettings.imageFolder;
    const maxImages = imageCounts[folder];
    const randomImageNumber = Math.floor(Math.random() * maxImages) + 1;
    const extension = folder === 'miku' ? 'jpg' : 'png'; // miku 用 jpg，pho 用 png
    cssRules += `
      body {
        background-image: url('chrome-extension://${chrome.runtime.id}/${folder}/wallpaper_${randomImageNumber}.${extension}') !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      }
      * {
        color: rgb(255, 255, 255) !important;
      }
    `;
  } else if (!settings.enableBackground && (applyToAll || isGPTPage)) {
    cssRules += `
      body {
        background-image: none !important;
      }
    `;
  }

  style.textContent = cssRules;
}

// 從儲存中獲取設置並應用
function loadAndApplyStyles() {
  chrome.storage.sync.get(['fontFamily', 'enableBackground', 'backgroundScope', 'imageFolder'], (result) => {
    const settings = {
      fontFamily: result.fontFamily || defaultSettings.fontFamily,
      enableBackground: result.enableBackground !== undefined ? result.enableBackground : defaultSettings.enableBackground,
      backgroundScope: result.backgroundScope || defaultSettings.backgroundScope,
      imageFolder: result.imageFolder || defaultSettings.imageFolder
    };
    setCustomStyles(settings);
  });
}

// 初始載入樣式
loadAndApplyStyles();

// 監聽儲存變化
chrome.storage.onChanged.addListener((changes, namespace) => {
  chrome.storage.sync.get(['fontFamily', 'enableBackground', 'backgroundScope', 'imageFolder'], (result) => {
    const settings = {
      fontFamily: result.fontFamily || defaultSettings.fontFamily,
      enableBackground: result.enableBackground !== undefined ? result.enableBackground : defaultSettings.enableBackground,
      backgroundScope: result.backgroundScope || defaultSettings.backgroundScope,
      imageFolder: result.imageFolder || defaultSettings.imageFolder
    };
    setCustomStyles(settings);
  });
});