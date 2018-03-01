(() => {
  tableInfo = [
    [
      { dbName: member_code, colName: "코드" },
      { dbName: name, colName: "이름" },
      { dbName: rname, colName: "실명" },
      { dbName: none, colName: "주 공동체" },
      { dbName: category, colName: "분류" },
      { dbName: note, colName: "비고" },
      { dbName: current, colName: "현황" },
      { dbName: join_date, colName: "가입일" },
      { dbName: celeb_date, colName: "기념일" },
      { dbName: tel1, colName: "전화" },
      { dbName: addr, colName: "주소" },
    ],
    [
      { dbName: member_code, colName: "코드" },
      { dbName: name, colName: "이름" },
    ],
    [
      { dbName: member_code, colName: "코드" },
      { dbName: name, colName: "이름" },
    ],
    [
      { dbName: member_code, colName: "코드" },
      { dbName: name, colName: "이름" },
    ],
  ]

  $.ajax({
    url: "../api/members/content",
    type: 'get',
    success: (json) => setTable(tableInfo, json),
    error: console.log
  });

  const xlsButton = document.querySelector('.xls-upload>input');
  xlsButton.addEventListener('change', function (e) { commonEvent.readXlsx(e, getXlsx) });

  const search = document.querySelector('.search');
  let tableContent = {};
  search.addEventListener('keyup', function (e) { commonEvent.searchTable(e, table, tableContent) })

  function setTable(tableInfo, json) {
    _.each(tableInfo, (table) => {

    })
  }

  function setData(tableInfo, json) {
    setTHead(tableInfo);
    setTBody(tableInfo, json);
    tableContent = addChoseong(json); //주의! json 오염됨
    tableContent = addLineNum(tableContent);
  }

  function setTHead(tableInfo) {
    const table = document.querySelector('section.sheet table');
    const th = _.reduce(tableInfo, (memo, { columnName, width }) => {
      return memo + `<th>${columnName}</th>`;
    }, '');
    const head = `<thead><tr>${th}</tr></thead>`;
    table.innerHTML += head;
  }

  function setTBody(tableInfo, tableData) {
    const table = document.querySelector('section.sheet table');
    let body = '';

    _.each(tableData, (row) => {
      const trTemplate = _.partial(template, '<tr>', _, '</tr>');

      const tr = _.reduce(tableInfo, (memo, { dbName }) => {
        let field = row[dbName];
        if (field === undefined) field = "";
        return memo + `<td>${field}</td>`;
      }, '');

      body += trTemplate(tr);
    });

    table.innerHTML += "<tbody>" + body + "</tbody>";
  }

  //TODO: 순수함수로 바꿀 것
  function addChoseong(tableData) {
    _.each(tableData, row => {
      _.each(row, field => {
        if (common.isContainHangul(field)) {
          row[field + "Choseong"] = Hangul.disassembleOnlyCho(field);
        }
      });
    });
    return tableData;
  }

  function addLineNum(tableData) {
    let numCount = 1;

    _.each(tableData, row => {
      row.lineNum = numCount++;
    });

    return tableData;
  }

  function template(first, content, end) {
    return first + content + end;
  }

  function getXlsx(rows) {
    setTBody(rows);
    rows = addChoseong(rows);
    rows = addLineNum(rows);
    console.log(rows)
  }
})();