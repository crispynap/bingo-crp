(() => {
  navHighlighting();

  function navHighlighting() {
    const currentMenu = location.pathname.split('/')[1];
    const menuItem = document.querySelector(`.menu-${currentMenu}`);

    if (menuItem) {
      menuItem.classList.add('highlight');
    }
  }

})();

const commonEvent = {
  preventOuterWheel(e) {
    const deltaX = e.wheelDeltaX;
    const deltaY = e.wheelDeltaY;
    this.scrollLeft += (deltaX < 0 ? 1 : -1) * 30;
    this.scrollTop += (deltaY < 0 ? 1 : -1) * 30;
    e.preventDefault();
  },

  readXlsx(e, callback) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      let buffers = e.target.result;
      buffers = new Uint8Array(buffers);

      const workbook = XLSX.read(buffers, { type: "array" });
      const sheet_name_list = workbook.SheetNames;
      callback(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]));
    }

    reader.readAsArrayBuffer(file);
  },


  searchTable(e, table, tableContent) {
    let a = setTimeout(() => { this.excuteTableSearch(e, table, tableContent) }, 600);
  },

  excuteTableSearch(e, table, tableContent) {
    const keyword = e.target.value;

    if (keyword === "") {
      const tableRows = table.querySelectorAll('tr');
      _.each(tableRows, tableRow => {
        tableRow.style.display = "table-row";
      })
      return;
    }

    const tBody = table.querySelector('tbody');

    _.each(tableContent, row => {
      if (_.some(row, field => {
        if (typeof field === 'string') {
          return field.match(keyword);
        } else {
          return field.toString().match(keyword);
        }
      })) {
        const tableRow = tBody.querySelector(`tr:nth-child(${row.lineNum})`);
        tableRow.style.display = "table-row";
      } else {
        const tableRow = tBody.querySelector(`tr:nth-child(${row.lineNum})`);
        tableRow.style.display = "none";
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

const messages = {
  incorrectSheet: "서식이 맞지 않습니다.",
  duplicatedNames(names) {
    return `이름이 중복되었습니다: ${names}`
  },
  duplicatedCodes(codes) {
    return `조합원 코드가 중복되었습니다: ${codes}`
  }
}