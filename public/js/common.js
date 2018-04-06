(() => {

})();

const commonEvent = {
  readXlsx(e, callback, tableData) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      let buffers = e.target.result;
      buffers = new Uint8Array(buffers);

      const workbook = XLSX.read(buffers, { type: "array" });
      const sheet_name_list = workbook.SheetNames;
      callback(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]), tableData);
    }

    reader.readAsArrayBuffer(file);
  },

}

const common = {
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
  emptyCodeRow: "코드와 이름 둘 다 누락된 줄이 있습니다.",
  duplicatedNames(names) {
    return `이름이 중복되었습니다: ${names}`
  },
  duplicatedCodes(codes) {
    return `조합원 코드가 중복되었습니다: ${codes}`
  }
}

_.fill = (list, filling = '') => {
  return _.map(list, element => {
    if (_.isUndefined(element)) return filling;
    return element;
  })
}