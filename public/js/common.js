(() => {

})();

window.commonEvent = {
  readXlsx(e, callback, tableData) {
    console.log(tableData)

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      let buffers = e.target.result;
      buffers = new Uint8Array(buffers);
      let workbook = [];

      try {
        workbook = XLSX.read(buffers, { type: "array" });
      }
      catch (error) {
        alert(messages.incorrectFile);
        return;
      }

      callback(XLSX.utils.sheet_to_row_object_array(workbook.Sheets.content), tableData, {});
    }

    reader.readAsArrayBuffer(file);
  },

}

window.common = {
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
  },

  options: {
    datePicker: {
      dateFormat: "yy-mm-dd",
      changeMonth: true,
      changeYear: true,
      dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
      monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
      monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    }
  }
}

window.messages = {
  incorrectFile: "파일이 형식에 맞지 않습니다.",
  incorrectSheet: "서식이 맞지 않습니다.",
  emptyCodeRow: "코드와 이름 둘 다 누락된 줄이 있습니다.",
  duplicatedNames(names) {
    return `이름이 중복되었습니다: 중복 이름: ${names}`;
  },
  duplicatedCodes(codes) {
    return `조합원 코드가 중복되었습니다. 중복 코드: ${codes}`;
  },
  incorrectFormat(cell, format) {
    let formatExplain;

    switch (format) {
      case "number":
      case "money":
        formatExplain = "숫자"; break;
      case "date":
        formatExplain = "날짜(yyyy-mm-dd)"; break;
      default:
        formatExplain = format;
    }
    return `입력값이 형식과 다릅니다.\n입력값: ${cell}\n맞는 형식: ` + formatExplain;
  }
}

window.C = {
  renderMoney: money => {
    return money.toString()
      .replace(/[^0-9]/g, "") //숫자만 남김
      .replace(/^0+/, "") //앞자리에 0 있으면 제거
      .replace(/^$/, "0") //빈칸만 남았다면 0 넣음
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' 빈'; //3자리마다 , 추가하고 마지막에 빈 붙임
  },

  bin2Number: bin => {
    return bin
      .replace(/\,|빈|\ /g, '') //',', 빈 제거
  }
}

_.fill = (list, filling = '') => {
  return _.map(list, element => {
    if (_.isUndefined(element)) return filling;
    return element;
  })
}