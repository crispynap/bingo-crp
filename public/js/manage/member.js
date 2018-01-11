(() => {
  const tableInfo = [
    { dbName: 'SN', columnName: 'SN' },
    { dbName: 'nick_name', columnName: '별명' },
    { dbName: 'community', columnName: '공동체' },
    { dbName: 'group', columnName: '분류' },
    { dbName: 'join_date', columnName: '가입일' },
    { dbName: 'real_name', columnName: '실명' },
    { dbName: 'phone_1', columnName: '전화 1' },
    { dbName: 'phone_2', columnName: '전화 2' },
    { dbName: 'email', columnName: 'email' },
    { dbName: 'birth', columnName: '생일' },
    { dbName: 'blog', columnName: '웹페이지' },
    { dbName: 'address', columnName: '주소' },
    { dbName: 'note', columnName: '비고' },
    { dbName: 'current', columnName: '현황' }
  ]

  const table = document.querySelector('#member-table');
  table.addEventListener('mousewheel', commonEvent.preventOuterWheel);
  table.addEventListener('dblclick', commonEvent.selectText);

  const xlsButton = document.querySelector('.xls-upload>input');
  xlsButton.addEventListener('change', function (e) { commonEvent.readFile(e, getXlsx) });

  const search = document.querySelector('.search');
  let tableContent = {};
  search.addEventListener('keyup', function (e) { commonEvent.searchTable(e, table, tableContent) })

  $.ajax({
    url: "../api/members",
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
    const table = document.querySelector('#member-table');
    const tHead = table.querySelector('thead');
    const th = _.reduce(tableInfo, (memo, { columnName, width }) => {
      return memo + `<th>${columnName}</th>`;
    }, '');
    const head = `<tr>${th}</tr>`;
    tHead.innerHTML = head;
  }

  function setTBody(tableData) {
    const table = document.querySelector('#member-table');
    const tBody = table.querySelector('tbody');
    let body = '';

    _.each(tableData, (row) => {
      const trTemplate = _.partial(template, '<tr>', _, '</tr>');

      const tr = _.reduce(tableInfo, (memo, { dbName }) => {
        const field = row[dbName];
        return memo + `<td contenteditable="true""><span>${field}</span></td>`;
      }, '');

      body += trTemplate(tr);
    });

    tBody.innerHTML = body;
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

  function getXlsx(file) {

  }
})();