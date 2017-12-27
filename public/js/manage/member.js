(() => {
  const tableInfo = [
    { dbName: 'SN', columnName: 'SN', width: 44 },
    { dbName: 'nick_name', columnName: '별명', width: 82 },
    { dbName: 'community', columnName: '공동체', width: 100 },
    { dbName: 'group', columnName: '분류', width: 100 },
    { dbName: 'join_date', columnName: '가입일', width: 95 },
    { dbName: 'real_name', columnName: '실명', width: 100 },
    { dbName: 'phone_1', columnName: '전화 1', width: 100 },
    { dbName: 'phone_2', columnName: '전화 2', width: 100 },
    { dbName: 'email', columnName: 'email', width: 100 },
    { dbName: 'birth', columnName: '생일', width: 100 },
    { dbName: 'blog', columnName: '웹페이지', width: 100 },
    { dbName: 'address', columnName: '주소', width: 100 },
    { dbName: 'note', columnName: '비고', width: 100 },
    { dbName: 'current', columnName: '현황', width: 100 }
  ]

  const table = document.querySelector('#member-table');
  table.addEventListener('mousewheel', eventControl.preventOuterWheel);
  table.addEventListener('dblclick', eventControl.selectText);

  const search = document.querySelector('.search');
  let tableContent = {};
  search.addEventListener('keyup', function (e) { eventControl.searchTable(e, table, tableContent) })

  $.ajax({
    url: "../api/members",
    type: 'get',
    success: function (json) {
      setTHead(tableInfo);
      setTBody(json);
      setTBodyCSS(tableInfo);
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
      return memo + `<th style="width:${width};">${columnName}</th>`;
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
        return memo + `<td contenteditable="true" class="column_${dbName}"><span>${field}</span></td>`;
      }, '');

      body += trTemplate(tr);
    });

    tBody.innerHTML = body;
  }

  function setTBodyCSS(tableInfo) {
    _.each(tableInfo, ({ dbName, width }) => {
      common.cssInsert(`.column_${dbName}>div{width:${width - 17};}`);
    });
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
})();