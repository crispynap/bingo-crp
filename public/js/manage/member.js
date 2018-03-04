(() => {
  const tablesInfo = [
    [
      { dbName: "member_code", colName: "코드" },
      { dbName: "name", colName: "이름" },
      { dbName: "rname", colName: "실명" },
      { dbName: "none", colName: "주 공동체" },
      { dbName: "category", colName: "분류" },
      { dbName: "note", colName: "비고" },
      { dbName: "current", colName: "현황" },
      { dbName: "join_date", colName: "가입일" },
      { dbName: "celeb_date", colName: "기념일" },
      { dbName: "tel1", colName: "전화" },
      { dbName: "addr", colName: "주소" },
    ],
    [
      { dbName: "member_code", colName: "코드" },
      { dbName: "name", colName: "이름" },
    ],
    [
      { dbName: "member_code", colName: "코드" },
      { dbName: "name", colName: "이름" },
    ],
    [
      { dbName: "member_code", colName: "코드" },
      { dbName: "name", colName: "이름" },
    ],
  ]

  let tableContent = {};


  $.ajax({
    url: "../api/members/content",
    type: 'get',
    success: (json) => setTables(tablesInfo, json),
    error: console.log
  });

  const xlsButton = document.querySelector('.xls-upload>input');
  xlsButton.addEventListener('change', function (e) { commonEvent.readXlsx(e, getXlsx) });

  // const search = document.querySelector('.search');
  // search.addEventListener('keyup', function (e) { commonEvent.searchTable(e, table, tableContent) })

  const tabs = document.querySelector('.tabs');
  tabs.addEventListener('click', e => { selectTab(e) })


  function setTables(tablesInfo, json) {
    let tableNum = 1;

    _.each(tablesInfo, tableInfo => {
      setTable(tableInfo, json, tableNum);
      tableNum++;
    });
  }

  function setTable(tableInfo, json, tableNum) {
    const sheet = document.querySelector('section.sheet');
    let table = document.createElement('table');
    table.id = ("table" + tableNum);
    table = sheet.appendChild(table);

    setTHead(table, tableInfo);
    setTBody(table, tableInfo, json);
    // tableContent = addChoseong(json); //주의! json 오염됨
    // tableContent = addLineNum(tableContent);
  }

  function setTHead(table, tableInfo) {
    const th = _.reduce(tableInfo, (memo, { colName, width }) => {
      return memo + `<th>${colName}</th>`;
    }, '');
    const head = `<thead><tr>${th}</tr></thead>`;
    table.innerHTML += head;
  }

  function setTBody(table, tableInfo, tableData) {
    let body = '';

    _.each(tableData, row => {
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

  function getXlsx(sheet) {
    console.dir(sheet)

    const valid = sheetValidCheck(sheet);

    if (!valid.err) {
      console.log('no error')
    } else {
      console.log(valid.message)
    }
  }

  function sheetValidCheck(sheet) {

    if (!formValid(sheet)) return { err: true, message: messages.incorrectSheet };

    const duplNames = getDuplicates(sheet, "이름");
    if (!_.isEmpty(duplNames)) return { err: true, message: messages.duplicatedNames(duplNames) }

    const duplCodes = getDuplicates(sheet, "조합원 코드");
    if (!_.isEmpty(duplCodes)) return { err: true, message: messages.duplicatedCodes(duplCodes) }

    //조합원코드 중복 체크


    return { err: false };
  }

  function formValid(sheet) { return (_.isArray(sheet)); }
  // function containsEnd(sheet) { return _.contains(_.map(sheet, _.val("표시")), "끝") }

  function getDuplicates(sheet, name) {
    const memo = {};
    _.each(_.map(sheet, _.val(name)), col => {
      if (!_.isNumber(memo[col])) {
        memo[col] = 0;
      } else {
        memo[col]++;
      }
    });
    return _.keys(_.pick(memo, (value) => { return value > 0; }));
  }

  function selectTab(e) {
    const selectedTab = e.target;
    const tabs = document.querySelectorAll('.tabs li');
    _.each(tabs, tab => tab.classList.remove("active"))
    selectedTab.classList.add("active");

    let selectedTable = selectedTab.attributes.rel.value;
    selectedTable = document.querySelector("table#" + selectedTable);

    const tables = document.querySelectorAll('.sheets table');
    _.each(tables, table => table.classList.remove("active"))
    selectedTable.classList.add("active");
  }
})();