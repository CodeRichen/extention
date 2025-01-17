// content.js
// 添加CSS规则到页面
const style = document.createElement('style');
document.head.appendChild(style);

// 定义函数来设置样式
function setCustomStyles() {
  // 检查当前页面是否为YouTube
  const isYouTube = window.location.hostname === 'www.youtube.com';
  // 检查当前页面是否为GPT相关页面
  const isGPTPage = window.location.hostname.includes('gpt') || window.location.hostname.includes('openai');

  // 初始化CSS规则
  let cssRules = `
    * {
      font-family: '851tegakizatsu', 'serif' !important;
      font-weight: bold !important;
      line-height: 1.5 !important; /* 调整行间距 */
      letter-spacing: 0.5px !important; /* 调整字间距 */
    }
  `;

  // 如果是YouTube页面，设置文本颜色为浅蓝色
  if (isYouTube) {
    cssRules += `
      * {
        color: #41BFB3 !important;
        // font-size: 16px !important; /* 你可以根据需要调整字体大小 */
      }
    `;
  }

  // 如果是GPT相关页面，设置背景图片
  if (isGPTPage) {
    cssRules += `
      body {
        background-image: url('chrome-extension://${chrome.runtime.id}/2.jpg') !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      }
    `;
  }

  // 如果是GPT或YouTube页面，设置选区背景颜色为紫色
  if (isGPTPage || isYouTube) {
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
  }

  // 应用CSS规则
  style.textContent = cssRules;
}

// 初始调用一次
setCustomStyles();