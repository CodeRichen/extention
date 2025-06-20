const style = document.createElement('style'); 
document.head.appendChild(style);

// 定義默認設置
const defaultSettings = {
  fontFamily: '微軟正黑體',
  enableBackground: true,
  backgroundScope: 'gpt',
  imageFolder: 'miku',
  selectionColor: 'purple'
};
const imageCounts = {
  miku: 15,
  pho: 10,
  beauty: 3700
};

// 用於儲存一致的背景圖片編號
let consistentImageNumber = null;

// 設置樣式
function setCustomStyles(settings) {
  const isGPTPage = window.location.hostname.includes('gpt') || window.location.hostname.includes('openai');
  const isGrokPage = window.location.hostname.includes('grok');
  const applyToAll = settings.backgroundScope === 'all';
  let cssRules = '';

  // 如果關閉背景與所有樣式，自動還原為預設字體與樣式
if (!settings.enableBackground) {
  style.textContent = `
    /* 還原背景 */
    body {
      background: none !important;
    }

    /* 還原字體 */
    * {
      font-family: default,-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", "Liberation Sans", Arial, sans-serif !important;
    }

    /* 移除你注入的選取樣式，不要強制背景色 */
    ::selection,
    ::-moz-selection {
      background-color: initial !important;
    }
  `;
  return;
}


  // ----------- 以下是開啟背景時的處理 --------------

// 套用文字顏色（如果開啟了）
if (settings.enableFontColor) {
  cssRules += `
    * {
      color: ${settings.fontColor} !important;
    }
  `;
}

  // 字體設置（除非是 default）
  if (settings.fontFamily && settings.fontFamily !== 'default') {
    cssRules += `
      * {
        font-family: '${settings.fontFamily}', sans-serif !important;
      }
    `;
  }

  // 選取文字樣式
  cssRules += `
    ::selection {
      background-color: ${settings.selectionColor || defaultSettings.selectionColor} !important;
    }
    ::-moz-selection {
      background-color: ${settings.selectionColor || defaultSettings.selectionColor} !important;
    }
  `;

  // 背景圖片設置
  if (applyToAll || isGPTPage || isGrokPage) {
    const folder = settings.imageFolder || defaultSettings.imageFolder;
    const maxImages = imageCounts[folder];
    let randomImageNumber;

    if (applyToAll) {
      if (consistentImageNumber === null) {
        consistentImageNumber = folder === 'beauty' 
          ? Math.floor(Math.random() * maxImages) + 400 
          : Math.floor(Math.random() * maxImages) + 1;
      }
      randomImageNumber = consistentImageNumber;
    } else {
      randomImageNumber = folder === 'beauty' 
        ? Math.floor(Math.random() * maxImages) + 400 
        : Math.floor(Math.random() * maxImages) + 1;
    }

    const extension = folder === 'pho' ? 'png' : 'jpg';
    cssRules += `
      body {
        background-image: url('chrome-extension://${chrome.runtime.id}/${folder}/wallpaper_${randomImageNumber}.${extension}') !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      }
    `;
  }

  style.textContent = cssRules;
}

// 從儲存中獲取設置並應用
function loadAndApplyStyles() {
chrome.storage.sync.get([
  'fontFamily',
  'enableBackground',
  'backgroundScope',
  'imageFolder',
  'selectionColor',
  'enableFontColor',
  'fontColor'
], (result) => {
  const settings = {
    fontFamily: result.fontFamily || defaultSettings.fontFamily,
    enableBackground: result.enableBackground !== undefined ? result.enableBackground : defaultSettings.enableBackground,
    backgroundScope: result.backgroundScope || defaultSettings.backgroundScope,
    imageFolder: result.imageFolder || defaultSettings.imageFolder,
    selectionColor: result.selectionColor || defaultSettings.selectionColor,
    enableFontColor: result.enableFontColor || false,
    fontColor: result.fontColor || '#ffffff'
  };
  setCustomStyles(settings);
});

}

// 初始載入樣式
loadAndApplyStyles();

// 監聽儲存變化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.backgroundScope || changes.imageFolder) {
    consistentImageNumber = null; // 重置一致性編號
  }
  loadAndApplyStyles();
});