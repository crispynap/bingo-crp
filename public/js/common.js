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

    if (keyword === "") return;

    _.each(tableContent, row => {
      if (_.some(row, field => {
        if (typeof field === 'string') {
          return field.match(keyword);
        } else {
          return field.toString().match(keyword);
        }
      })) {
        console.log('yes');
      } else {
        console.log('no');
      }
    });
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
  },

  isEveryChoseong(str) {
    check = /[ㄱ-ㅎ]/;
    return _.every(str, letter => check.test(letter));
  },

  /* 선택자를 매개변수로 넘겨서 해당 cssRule을 찾아서 리턴하는 함수 */
  cssSelector(selector) {
    for (i = 0; i < document.styleSheets.length; i++) {
      for (j = 0; j < document.styleSheets[i].cssRules.length; j++) {
        if (document.styleSheets[i].cssRules[j].selectorText == selector) {
          return document.styleSheets[i].cssRules[j];
        }
      }
    }
  },
  /* 위 함수만 정의해 놓으면 아래 방식으로 접근 & 사용 */
  // var chgStyle=cssSelector("div#d2"); /*원하는 선택자만 매개변수로 넘김 */
  // chgStyle.style["background-color"]="blue" /* jQuery처럼 짧게 접근^^ */

  cssInsert(style) {
    const sheet = document.styleSheets[0];
    sheet.insertRule(style, 1);
  }
}