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
    { dbName: 'birthday', columnName: '생일', width: 100 },
    { dbName: 'blog', columnName: '웹페이지', width: 100 },
    { dbName: 'address', columnName: '주소', width: 100 },
    { dbName: 'note', columnName: '비고', width: 100 },
    { dbName: 'current', columnName: '현황', width: 100 }
  ]

  const table = document.querySelector('#member-table');
  table.addEventListener('mousewheel', eventControl.preventOuterWheel);
  table.addEventListener('dblclick', eventControl.selectText);

  const tBody = table.querySelector('tbody');
  $.ajax({
    url: "../api/members",
    type: 'get',
    success: function (json) {
      const tHead = table.querySelector('thead');
      const th = _.reduce(tableInfo, (memo, { columnName, width }) => memo + `<th style="width:${width};">${columnName}</th>`, '');
      const head = `<thead><tr>${th}</tr></thead>`;
      tHead.innerHTML = head;

      let body = '';
      _.each(json, (row) => {
        const tdTemplate = _.partial(template, '<td contenteditable="true"><div>', _, '</div></td>');
        const trTemplate = _.partial(template, '<tr>', _, '</tr>');

        const td = _.reduce(row, (memo, field) => memo + tdTemplate(field), '');
        body += trTemplate(td);
      });
      tBody.innerHTML = body;

      var a = table.querySelectorAll('tr:nth-child(1) td');
      var b = table.querySelectorAll('th');
      // _.each(b, (c) => { console.log(c.clientWidth) });

      for (var d = 0; d < b.length; d++) {
        console.log(a[d].clientWidth);
        // console.log(b[d].clientWidth);
        // b[d].clientWidth = a[d].clientWidth;
        // console.log(b[d].clientWidth);
      }
      // _.each(b, (c) => { console.log(c.clientWidth) });
      // console.log(a)


    },
    error: function (error) {
      console.log(error);
    }
  });


  function template(first, content, end) {
    return first + content + end;
  };
})();