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
    { dbName: 'birthday', columnName: '생일' },
    { dbName: 'blog', columnName: '웹페이지' },
    { dbName: 'address', columnName: '주소' },
    { dbName: 'note', columnName: '비고' },
    { dbName: 'current', columnName: '현황' }
  ]

  const table = document.querySelector('#member-table');
  table.addEventListener('mousewheel', eventControl.preventOuterWheel);
  table.addEventListener('dblclick', eventControl.selectText);

  var options = {
    valueNames: ['name', 'city'],
    item: '<li><h3 class="name"></h3><p class="city"></p></li>'
  };

  var values = [
    { name: 'Jonny', city: 'Stockholm' }
    , { name: 'Jonas', city: 'Berlin' }
  ];

  var hackerList = new List('member-table', options, values);
})();

// $.ajax({
//   url: "../api/members",
//   type: 'get',
//   success: function (json) {
//     const table = document.querySelector('.member-table');
//     table.innerHTML = JSON.stringify(json);
//   },
//   error: function (error) {
//     console.log(error);
//   }
// });