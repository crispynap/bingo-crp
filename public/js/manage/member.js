(() => {
  const dbInfo = [
    { dbName: "member_code", colName: "조합원 코드" },
    { dbName: "name", colName: "이름" },
    { dbName: "rname", colName: "실명" },
    { dbName: "category", colName: "분류" },
    { dbName: "note", colName: "비고" },
    { dbName: "current", colName: "현황" },
    { dbName: "join_date", colName: "가입일" },
    { dbName: "leave_date", colName: "탈퇴일" },
    { dbName: "celeb_date", colName: "기념일" },
    { dbName: "tel1", colName: "전화1" },
    { dbName: "tel2", colName: "전화2" },
    { dbName: "addr", colName: "주소" },
    { dbName: "facebook", colName: "페이스북" },
    { dbName: "kakaotalk", colName: "카카오톡" },
    { dbName: "webpage", colName: "웹페이지" },
    { dbName: "finance_account", colName: "금융 계좌" },
  ]
  const tablesInfo = [
    [
      { dbName: "member_code", colName: "조합원 코드" },
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
  getMembersAll();
  setEvents();


  function getMembersAll() {
    $.get("../api/members", (data) => {
      setTables(tablesInfo, data);
    });
  }

  function setTables(tablesInfo, json) {
    console.log(json)
    console.log(tablesInfo)
    $('#sheets').DataTable({
      data: json,
      columns: [
        { data: 'member_code' },
        { data: 'category' },
        { data: 'rname' },
      ]
    });

    // let tableNum = 1;

    // _.each(tablesInfo, tableInfo => {
    //   setTable(tableInfo, json, tableNum);
    //   tableNum++;
    // });
    // tableContent = json;
  }

  function setTable(tableInfo, json, tableNum) {
    const table = document.querySelector('table#table' + tableNum);

    setTHead(table, tableInfo);
    setTBody(table, tableInfo, json);
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

  function getXlsx(sheet, tableContent, tablesInfo) {
    _.removeByIndex(sheet, 0);
    const valid = sheetValidCheck(sheet, tableContent);

    if (valid.err) {
      alert(valid.message)
      return;
    }

    console.dir(sheet)
    console.dir(tableContent)


    addMembers(getMarkedRows(sheet, "a", "A"));
    // updateMembers(_.pick(sheet, ({ mark }) => { return mark === "a" || mark === "A" }));
    // deleteMembers(_.pick(sheet, ({ mark }) => { return mark === "a" || mark === "A" }));
  }

  function getMarkedRows(sheet, ...selectedMarks) {
    return _.go(sheet,
      sheet => _.pick(sheet, ({ mark }) => { return _.some(selectedMarks, selMark => selMark === mark) }),
      aTageRows => _.map(aTageRows, row => _.omit(row, 'mark'))
    )
  }

  function getMembers(membersInfo) {
    const ids = _.map(membersInfo, ({ member_code }) => member_code);
    const idsQuery = _.reduce(ids, (memo, id) => {
      if (memo !== '') memo += '&';
      return memo + id
    }, '');

    $.get("../api/members/" + idsQuery, (data) => {
      setTables(tablesInfo, data)
    });
  }

  function addMembers(memberInfos) {
    $.post("../api/members", { memberInfos: memberInfos });
  }

  function sheetValidCheck(sheet, tableContent) {

    if (!formValid(sheet)) return { err: true, message: messages.incorrectSheet };

    //코드와 이름 둘 다 누락된 줄이 있는지
    if (_.find(sheet, (row) => { return (_.isEmpty(row['name']) && _.isEmpty(row['member_code'])) }))
      return { err: true, message: messages.emptyCodeRow };

    const aTagRows = _.pick(sheet, ({ mark }) => { return mark === "a" || mark === "A" });
    //'a' / 'A'에 이름 중복 행이 있는지
    const sheetNamesCount = getFieldCounts(aTagRows, "name");
    const duplSheetNames = getDuplicatesField(sheetNamesCount);
    if (!_.isEmpty(duplSheetNames)) return { err: true, message: messages.duplicatedNames(duplSheetNames) }

    //'a' / 'A'와 현재 테이블에 중복되는 이름 있는지
    const tableNamesCount = getFieldCounts(tableContent, "name");
    duplTableName = _.findKey(sheetNamesCount, (count, name) => { return _.has(tableNamesCount, name) })
    if (duplTableName) return { err: true, message: messages.duplicatedNames(duplTableName) }

    //'a' / 'A'에 조합원 코드 중복 행이 있는지
    const sheetCodesCount = getFieldCounts(aTagRows, "member_code");
    const duplSheetCodes = getDuplicatesField(sheetCodesCount);
    if (!_.isEmpty(duplSheetCodes)) return { err: true, message: messages.duplicatedCodes(duplSheetCodes) }

    //'a' / 'A'와 현재 테이블에 중복되는 조합원 코드가 있는지
    const tableCodesCount = getFieldCounts(tableContent, "member_code");
    duplTableCode = _.findKey(sheetCodesCount, (count, code) => { return _.has(tableCodesCount, code) })
    if (duplTableCode) return { err: true, message: messages.duplicatedCodes(duplTableCode) }

    //'s' / 'S' 가 지정하는 코드 혹은 이름이 현재 테이블 내용에 있는지
    //'d' / 'D' 가 지정하는 코드 혹은 이름이 현재 테이블 내용에 있는지
    // const SDTagRows = _.pick(sheet, ({ 표시 }) => { return 표시 === "s" || 표시 === "S" || 표시 === "d" || 표시 === "D" });

    return { err: false };
  }

  function formValid(sheet) { return (_.isArray(sheet)); }

  function getDuplicatesField(counts) { return _.keys(_.pick(counts, (value) => { return value > 1; })); }

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
    _.each(tabs, tab => tab.classList.remove("active"));
    selectedTab.classList.add("active");

    let selectedTable = selectedTab.attributes.rel.value;
    selectedTable = document.querySelector("table#" + selectedTable);

    const tables = document.querySelectorAll('.sheets table');
    _.each(tables, table => table.classList.remove("active"));
    selectedTable.classList.add("active");
  }

  function setEvents() {
    const xlsButton = document.querySelector('.xls-upload>input');
    xlsButton.addEventListener('change', function (e) { commonEvent.readXlsx(e, getXlsx, tableContent, tablesInfo) });
  }
})();