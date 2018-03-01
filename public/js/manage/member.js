(() => {
  $.ajax({
    url: "../api/members/scheme",
    type: 'get',
    success: getScheme,
    error: console.log
  });

  const xlsButton = document.querySelector('.xls-upload>input');
  xlsButton.addEventListener('change', function (e) { commonEvent.readXlsx(e, getXlsx) });

  const search = document.querySelector('.search');
  let tableContent = {};
  search.addEventListener('keyup', function (e) { commonEvent.searchTable(e, table, tableContent) })

  function getScheme(json) {
    const tableInfo = [];

    _.each(json, row => {
      let newRow = {};
      newRow.dbName = row.COLUMN_NAME;
      newRow.columnName = row.COLUMN_COMMENT;
      tableInfo.push(newRow);
    });

    $.ajax({
      url: "../api/members/content",
      type: 'get',
      success: (json) => setData(tableInfo, json),
      error: console.log
    });
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