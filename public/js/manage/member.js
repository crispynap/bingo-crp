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
    url: "../api/members",
    type: 'get',
    success: (json) => setTables(tablesInfo, json),
    error: console.log
  });

  const xlsButton = document.querySelector('.xls-upload>input');
  xlsButton.addEventListener('change', function (e) { commonEvent.readXlsx(e, getXlsx, tableContent) });

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
    tableContent = json;
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

  function getXlsx(sheet, tableContent) {
    console.dir(sheet)

    const valid = sheetValidCheck(sheet, tableContent);

    if (!valid.err) {
      console.log('no error')
    } else {
      console.log(valid.message)
    }
  }

  function sheetValidCheck(sheet, tableContent) {

    if (!formValid(sheet)) return { err: true, message: messages.incorrectSheet };

    const aTagRows = _.pick(sheet, ({ 표시 }) => { return 표시 === "a" || 표시 === "A" });
    const sTagRows = _.pick(sheet, ({ 표시 }) => { return 표시 === "s" || 표시 === "S" });

    //'a' / 'A' 에 코드와 이름 둘 다 빈 줄이 있는지
    if (_.find(aTagRows, (row) => { return (_.isEmpty(row['이름']) && _.isEmpty(row['조합원 코드'])) }))
      return { err: true, message: messages.emptyAtagRow };

    //'a' / 'A'에 이름 중복 행이 있는지
    const sheetNamesCount = getFieldCounts(aTagRows, "이름");
    const duplSheetNames = getDuplicatesField(sheetNamesCount);
    if (!_.isEmpty(duplSheetNames)) return { err: true, message: messages.duplicatedNames(duplSheetNames) }

    //'a' / 'A'와 현재 테이블에 중복되는 이름 있는지
    const tableNamesCount = getFieldCounts(tableContent, "name");
    duplTableName = _.findKey(sheetNamesCount, (count, name) => { return _.has(tableNamesCount, name) })
    if (duplTableName) return { err: true, message: messages.duplicatedNames(duplTableName) }

    //'a' / 'A'에 조합원 코드 중복 행이 있는지
    const sheetCodesCount = getFieldCounts(aTagRows, "조합원 코드");
    const duplSheetCodes = getDuplicatesField(sheetCodesCount);
    if (!_.isEmpty(duplSheetCodes)) return { err: true, message: messages.duplicatedCodes(duplSheetCodes) }

    //'a' / 'A'와 현재 테이블에 중복되는 조합원 코드가 있는지
    const tableCodesCount = getFieldCounts(tableContent, "member_code");
    duplTableCode = _.findKey(sheetCodesCount, (count, code) => { return _.has(tableCodesCount, code) })
    if (duplTableCode) return { err: true, message: messages.duplicatedCodes(duplTableCode) }


    //'s' / 'S' 에 코드 혹은 이름이 있는지
    //'s' / 'S' 가 지정하는 코드 혹은 이름이 현재 테이블 내용에 있는지
    //'d' / 'D' 에 코드 혹은 이름이 있는지
    //'s' / 'S' 가 지정하는 코드 혹은 이름이 현재 테이블 내용에 있는지


    return { err: false };
  }

  function formValid(sheet) { return (_.isArray(sheet)); }

  function getDuplicatesField(counts) {
    return _.keys(_.pick(counts, (value) => { return value > 1; }));
  }

  function getFieldCounts(sheet, name, counts = {}) {
    _.each(_.map(sheet, _.val(name)), col => {
      if (!_.isNumber(counts[col])) {
        counts[col] = 1;
      } else {
        counts[col]++;
      }
    });
    return counts;
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