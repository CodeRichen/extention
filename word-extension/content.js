// content.js
// 添加CSS規則到頁面
const style = document.createElement('style');
document.head.appendChild(style);

// 定義默認設置
const defaultSettings = {
  fontFamily: '微軟正黑體',
  enableBackground: true
};

// 定義函數來設置樣式
function setCustomStyles(settings) {
  // 獲取當前頁面信息
  const isYouTube = window.location.hostname === 'www.youtube.com';
  const isGPTPage = window.location.hostname.includes('gpt') || window.location.hostname.includes('openai');

  // 初始化CSS規則
  let cssRules = `
    * {
      font-family: '${settings.fontFamily || defaultSettings.fontFamily}' !important;
    }
  `;

  // YouTube頁面特殊樣式
  if (isYouTube) {
    cssRules += `
      * {
        // color: #41BFB3 !important;
        // font-size: 16px !important;
      }
    `;
  }

  // GPT相關頁面樣式
  if (isGPTPage && settings.enableBackground) {
    const randomImageNumber = Math.floor(Math.random() * 15) + 1;
    cssRules += `
      body {
        background-image: url('chrome-extension://${chrome.runtime.id}/miku/wallpaper_${randomImageNumber}.jpg') !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      }
      * {
        color: rgb(255, 255, 255) !important;
      }
    `;
  } else if (isGPTPage && !settings.enableBackground) {
    cssRules += `
      body {
        background-image: none !important;
      }
    `;
  }

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

  // 應用CSS規則
  style.textContent = cssRules;
}

// 從儲存中獲取設置並應用
function loadAndApplyStyles() {
  chrome.storage.sync.get(['fontFamily', 'enableBackground'], (result) => {
    const settings = {
      fontFamily: result.fontFamily || defaultSettings.fontFamily,
      enableBackground: result.enableBackground !== undefined ? result.enableBackground : defaultSettings.enableBackground
    };
    setCustomStyles(settings);
  });
}

// 初始載入樣式
loadAndApplyStyles();

// 監聽儲存變化
chrome.storage.onChanged.addListener((changes, namespace) => {
  chrome.storage.sync.get(['fontFamily', 'enableBackground'], (result) => {
    const settings = {
      fontFamily: result.fontFamily || defaultSettings.fontFamily,
      enableBackground: result.enableBackground !== undefined ? result.enableBackground : defaultSettings.enableBackground
    };
    setCustomStyles(settings);
  });
});