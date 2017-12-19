(() => {
  const currentMenu = location.pathname.split('/')[1];
  const menuItem = document.querySelector(`.menu-${currentMenu}`);
  menuItem.classList.add('highlight');
})();

const eventControl = {
  preventOuterWheel(e) {
    const deltaX = e.wheelDeltaX;
    const deltaY = e.wheelDeltaY;
    this.scrollLeft += (deltaX < 0 ? 1 : -1) * 30;
    this.scrollTop += (deltaY < 0 ? 1 : -1) * 30;
    e.preventDefault();
  },

  selectText(e) {
    {
      e.preventDefault();
      common.selectRange(e.target)
    }
  },

  searchTable(e, table, tableContent) {
    keyword = e.target.value;

  }
}

const common = {

  //긁어옴. 출처: http://rootbox.co.kr/p/384
  selectRange(obj) {
    if (window.getSelection) {
      var selected = window.getSelection();
      selected.selectAllChildren(obj);
    } else if (document.body.createTextRange) {
      var range = document.body.createTextRange();
      range.moveToElementText(obj);
      range.select();
    }
  },

  isContainHangul(str) {
    check = /[가-힣]/;
    return check.test(str);
  }
}