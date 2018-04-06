(() => {

  let tableData = [];
  const tableColumns = {
    primary: [
      { data: 'member_code' },
      { data: 'doer_name' },
      { data: 'rname' },
      { data: 'category' },
      { data: 'main_commune' },
      { data: 'total_fund' },
      { data: 'total_util' },
      { data: 'note' },
      { data: 'current' },
    ],
    fund: [
      { data: 'doer_name' },
      { data: 'total_fund' },
    ],
    util: [
      { data: 'doer_name' },
      { data: 'total_util' },
    ],
    action: [
      { data: 'doer_name' },
      { data: 'main_commune' },
    ],
    detail: [
      { data: 'doer_name' },
      { data: 'rname' },
    ],
  }

  $(document).ready(() => {
    setEvents();
    getMembersAll();
  });

  function setEvents() {
    const xlsButton = document.querySelector('.xls-upload>input');
    xlsButton.addEventListener('change', function (e) { commonEvent.readXlsx(e, getXlsx, tableData) });
  }

  function getMembersAll() {
    $.get("../api/members", (data) => {
      setTables(data);
      tableData = data;
    });
  }

  function getTableOptions(data, columns) {
    return {
      data: data,
      select: 'single',
      columns: columns
    }
  }

  function setTables(data) {
    const tables = [];

    const primaryTableOptions = getTableOptions(data, tableColumns.primary);
    const primaryTable = $('#table-primary').DataTable(primaryTableOptions);
    tables.push(primaryTable);

    const fundTableOptions = getTableOptions(data, tableColumns.fund);
    const fundTable = $('#table-fund').DataTable(fundTableOptions);
    tables.push(fundTable);

    const utilTableOptions = getTableOptions(data, tableColumns.util);
    const utilTable = $('#table-util').DataTable(utilTableOptions);
    tables.push(utilTable);

    const actionTableOptions = getTableOptions(data, tableColumns.action);
    const actionTable = $('#table-action').DataTable(actionTableOptions);
    tables.push(actionTable);

    const detailTableOptions = getTableOptions(data, tableColumns.detail);
    const detailTable = $('#table-detail').DataTable(detailTableOptions);
    tables.push(detailTable);

    _.each(tables, (table) => {
      table.on('select', function (e, dt, type, indexes) {
        console.log(tableData[indexes[0]])
        const nowTab = $('.tab-content>.active');
        console.log(nowTab)

      });
    })
  }

  function getXlsx(sheet, tableData) {
    _.removeByIndex(sheet, 0);
    const valid = sheetValidCheck(sheet, tableData);

    if (valid.err) {
      alert(valid.message);
      return;
    }

    console.dir(sheet)
    console.dir(tableData)


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

  function sheetValidCheck(sheet, tableData) {

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
    const tableNamesCount = getFieldCounts(tableData, "name");
    duplTableName = _.findKey(sheetNamesCount, (count, name) => { return _.has(tableNamesCount, name) })
    if (duplTableName) return { err: true, message: messages.duplicatedNames(duplTableName) }

    //'a' / 'A'에 조합원 코드 중복 행이 있는지
    const sheetCodesCount = getFieldCounts(aTagRows, "member_code");
    const duplSheetCodes = getDuplicatesField(sheetCodesCount);
    if (!_.isEmpty(duplSheetCodes)) return { err: true, message: messages.duplicatedCodes(duplSheetCodes) }

    //'a' / 'A'와 현재 테이블에 중복되는 조합원 코드가 있는지
    const tableCodesCount = getFieldCounts(tableData, "member_code");
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

})();