(() => {
  const tableInfo = [];

  $.ajax({
    url: "../api/members/scheme",
    type: 'get',
    success: function (json) {
      _.each(json, row => {
        let newRow = {};
        newRow.dbName = row.COLUMN_NAME;
        newRow.columnName = row.COLUMN_COMMENT;
        tableInfo.push(newRow);
      });
    },
    error: function (error) {
      console.log(error);
    }
  });

  const table = document.querySelector('section.sheet');
  table.addEventListener('mousewheel', commonEvent.preventOuterWheel);

  const xlsButton = document.querySelector('.xls-upload>input');
  xlsButton.addEventListener('change', function (e) { commonEvent.readXlsx(e, getXlsx) });

  const search = document.querySelector('.search');
  let tableContent = {};
  search.addEventListener('keyup', function (e) { commonEvent.searchTable(e, table, tableContent) })

  $.ajax({
    url: "../api/members/content",
    type: 'get',
    success: function (json) {
      setTHead(tableInfo);
      setTBody(json);
      tableContent = addChoseong(json); //주의! json 오염됨
      tableContent = addLineNum(tableContent);
    },
    error: function (error) {
      console.log(error);
    }
  });


  function setTHead(tableInfo) {
    const table = document.querySelector('section.sheet');
    const tHead = table.querySelector('thead');
    const th = _.reduce(tableInfo, (memo, { columnName, width }) => {
      return memo + `<th>${columnName}</th>`;
    }, '');
    const head = `<tr>${th}</tr>`;
    tHead.innerHTML = head;
  }

  function setTBody(tableData) {
    const table = document.querySelector('section.sheet');
    const tBody = table.querySelector('tbody');
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

    tBody.innerHTML += body;
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