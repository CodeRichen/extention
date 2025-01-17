// 等待页面加载完成
window.addEventListener('load', function() {
  // 使用name属性定位搜索框
  const searchBox = document.querySelector('input[name="search_query"]');
  if (searchBox) {
    // 监听键盘事件
    searchBox.addEventListener('keydown', function(event) {
      // 检查是否按下了Enter键
      if (event.key === 'Enter') {
        // 阻止原生的Enter键行为
        event.preventDefault();

        // 在原本内容后加上" 中文"
        this.value += ' 中文';

        // 延迟一小段时间后触发搜索
        setTimeout(() => {
          // 尝试找到搜索按钮，这里假设按钮在同一个表单内或者附近
          const searchButton = document.querySelector('button[aria-label="搜尋"], button[aria-label="Search"]');
          if (searchButton) {
            searchButton.click(); // 点击搜索按钮
          } else {
            // 如果找不到按钮，尝试直接提交表单
            const form = this.closest('form');
            if (form) {
              form.submit();
            }
          }
        }, 100); // 延迟100毫秒
      }
    });
  }
});