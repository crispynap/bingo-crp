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
      tableContent = addChoseong(json);
      //주의! addChoseong()으로 json 오염됨
    },
    error: function (error) {
      console.log(error);
    }
  });


  function setTHead(tableInfo) {
    const table = document.querySelector('#member-table');
    const tHead = table.querySelector('thead');
    const th = _.reduce(tableInfo, (memo, { columnName, width }) => memo + `<th style="width:${width};">${columnName}</th>`, '');
    const head = `<thead><tr>${th}</tr></thead>`;
    tHead.innerHTML = head;
  }

  function setTBody(tableData) {
    const table = document.querySelector('#member-table');
    const tBody = table.querySelector('tbody');
    let body = '';
    _.each(tableData, (row) => {
      const tdTemplate = _.partial(template, '<td contenteditable="true"><div>', _, '</div></td>');
      const trTemplate = _.partial(template, '<tr>', _, '</tr>');

      const td = _.reduce(tableInfo, (memo, column) => {
        return memo + tdTemplate(row[column.dbName]);
      }, '');
      body += trTemplate(td);
    });
    tBody.innerHTML = body;
  }

  //TODO: 순수함수로 바꿀 것
  function addChoseong(tableData) {
    _.each(tableData, row => {
      _.each(row, field => {
        if (common.isContainHangul(field)) {
          row[field + "Choseong"] = Hangul.disassemble(field);
        }
      })
    });
    return tableData;
  }


  function template(first, content, end) {
    return first + content + end;
  }
})();