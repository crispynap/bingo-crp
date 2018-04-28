(() => {

  const dataTables = {};

  const tableValidChecker = {};

  const tableColumns = {
    primary: [
      { data: 'member_code', inputName: '코드', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'rname', inputName: '실명' },
      { data: 'category', inputName: '구분' },
      { data: 'main_commune', inputName: '주 공동체' },
      { data: 'total_fund', render: C.renderMoney, inputName: '출자금', className: 'text-right' },
      { data: 'total_util', render: C.renderMoney, inputName: '이용금', className: 'text-right' },
      { data: 'note', inputName: '비고' },
      { data: 'current', inputName: '현황' },
    ],
    fund: [
      { data: 'member_code', inputName: '코드', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'total_fund', render: C.renderMoney, inputName: '출자금', className: 'text-right' },
    ],
    util: [
      { data: 'member_code', inputName: '코드', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'total_util', render: C.renderMoney, inputName: '이용금', className: 'text-right' },
    ],
    action: [
      { data: 'member_code', inputName: '코드', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'main_commune', inputName: '주 공동체' },
    ],
    detail: [
      { data: 'member_code', inputName: '코드', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'rname', inputName: '실명' },
      { data: 'finance_account', inputName: '금융계좌' },
      { data: 'join_date', inputName: '가입일' },
      { data: 'leave_date', inputName: '탈퇴일' },
      { data: 'celeb_date', inputName: '기념일' },
      { data: 'tel1', inputName: '전화1' },
      { data: 'tel2', inputName: '전화2' },
      { data: 'addr', inputName: '주소' },
      { data: 'webpage', inputName: '웹페이지' },
      { data: 'kakaotalk', inputName: '카카오톡' },
      { data: 'facebook', inputName: '페이스북' },
    ],
  }

  const dataInfo = {
    member_code: { format: 'number', modifiable: false },
    total_fund: { format: 'money', modifiable: false, readOnly: true, },
    total_util: { format: 'money', modifiable: false, readOnly: true, },
    join_date: { format: 'date' },
    leave_date: { format: 'date' },
    celeb_date: { format: 'date' },
    doer_name: {},
    addr: {},
    category: {},
    current: {},
    email: {},
    facebook: {},
    finance_account: {},
    kakaotalk: {},
    main_commune: {},
    note: {},
    rname: {},
    tel1: {},
    tel2: {},
    webpage: {},
  }


  $(document).ready(() => {
    setEvents();
    getMembersAll();
  });

  function setEvents() {

    //서식 삽입 버튼 누를 시 xlsx 업로드 동작
    const xlsButton = document.querySelector('.xls-upload>input');
    xlsButton.addEventListener('change', function (e) { commonEvent.readXlsx(e, getXlsx, getActiveTable().data()) });

    //탭 전환시
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
      const prevRow = getActiveTable().row('.selected');

      const shownTabName = $(e.target).attr("href");
      const shownTableName = $(shownTabName)[0].dataset.tablename;
      const shownTable = dataTables[shownTableName];
      shownTable.row(prevRow).select();
      shownTable.data().draw();
    });

    //내용 수정시 데이터에 반영
    $('#editor').change(e => {
      const row = getActiveTable().row('.selected');
      const rowData = row.data();
      const editingCell = e.target.dataset.name;

      if (isDateFormat(editingCell)) e.target.value = C.renderDate(e.target.value); //날짜 서식에 맞추기

      rowData[editingCell] = e.target.value;

      eachTables(table => {
        table.row(row).data(rowData).draw();
      });

    });

    $('#add-btn').click(e => {
      const newMemberRow = _.mapObject(dataInfo, (val, key) => "");
      const newRowCode = _.go(
        _.max(dataTables.primary.data(), row => row.member_code),
        _.v('member_code')
      ) + 1;
      newMemberRow.member_code = newRowCode;

      eachTables(table => {
        table.data().row.add(newMemberRow).draw();
      });

      getActiveTable().row((idx, data) => data.member_code === newRowCode).select();
    });

    $('#removeModal').on('shown.bs.modal', (e => {
      $('#remove-confirm').focus();
    }));

    $('#remove-confirm').click(e => {
      const selectedRow = getActiveTable().row('.selected');

      eachTables(table => {
        table.row(selectedRow).remove().draw();
      });

      $('#editor').empty();
      $('#remove-btn').hide();
      $('#removeModal').modal('hide');
    });

  }


  function getMembersAll() {
    $.get("../api/members", (memberData) => {
      setTables(memberData);
      setValidData(memberData);
    });
  }

  function setValidData(data) {
    tableValidChecker.codeList = _.reduce(data, (memo, row) => {
      memo[row.member_code] = 1;
      return memo;
    }, {});
    tableValidChecker.nameList = _.reduce(data, (memo, row) => {
      memo[row.doer_name] = 1;
      return memo;
    }, {});
  }

  function getTableOptions(data, columns) {
    return {
      data: data,
      select: 'single',
      columns: columns,
      language: common.options.tableLang_kor
    }
  }

  function setTables(data) {
    const primaryTableOptions = getTableOptions(data, tableColumns.primary);
    const primaryTable = $('#table-primary').DataTable(primaryTableOptions);
    dataTables.primary = primaryTable;

    const fundTableOptions = getTableOptions(data, tableColumns.fund);
    const fundTable = $('#table-fund').DataTable(fundTableOptions);
    dataTables.fund = fundTable;

    const utilTableOptions = getTableOptions(data, tableColumns.util);
    const utilTable = $('#table-util').DataTable(utilTableOptions);
    dataTables.util = utilTable;

    const actionTableOptions = getTableOptions(data, tableColumns.action);
    const actionTable = $('#table-action').DataTable(actionTableOptions);
    dataTables.action = actionTable;

    const detailTableOptions = getTableOptions(data, tableColumns.detail);
    const detailTable = $('#table-detail').DataTable(detailTableOptions);
    dataTables.detail = detailTable;

    eachTables(table => {
      table.on('select', function (e, dt, type, indexes) {
        setFormSetting(e.target.dataset.tablename, indexes[0]);
        showRemoveBtn();
      });
    });
  }

  function setFormSetting(tableName, rowNumber) {
    const nowTableColumns = tableColumns[tableName];
    const selectedRow = getActiveTable().row(rowNumber).data();
    const inputs = $("<div></div>");

    _.each(nowTableColumns, column => {
      if (!column.inputName) return;

      const dataName = column.data;
      const selectedData = selectedRow[dataName];
      const inputData = selectedData === null ? "" :
        dataFormat(dataName) === 'money' ? C.renderMoney(selectedData) :
          selectedData;

      const readOnly = isDataReadOnly(dataName) ? 'readonly' : "";

      const inputWrapper = $(`<div class="col-xs-4"></div>`);
      const inputGroup = $(`<div class="input-group"></div>`);
      const inputName = $(`<span class="input-group-addon">${column.inputName}</span>`);
      const input = $(
        `<input type="text" class="form-control" data-name="${column.data}" data-format="${dataFormat(column.data)}" 
        class="input-group-addon" ${readOnly} value="${inputData}"></input>`
      );

      if (dataFormat(column.data) === 'date') {
        input.datepicker(common.options.datePicker);
      }

      inputs.append(inputWrapper.append(inputGroup.append(inputName, input)));

    });

    $('#editor').empty().append(inputs);
    $('#editor input[data-format="money"').focus(e => {
      if (!isDataReadOnly(e.target.dataset.name))
        e.target.value = C.renderNumber(e.target.value);
      e.target.select();
    });
    $('#editor input[data-format="money"').blur(e => e.target.value = C.renderMoney(e.target.value));
  }

  function showRemoveBtn() {
    $('#remove-btn').show()
  }

  function getXlsx(sheet, tableData) {
    _.removeByIndex(sheet, 0);
    const valid = sheetValidCheck(sheet, tableData);

    if (valid.err) {
      alert(valid.message);
      return;
    }
    console.log('sheet: ', sheet)
    console.log('tableData: ', tableData)

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

    console.log(sheet)

    if (!formFormatCheck(sheet)) return { err: true, message: messages.incorrectSheet };

    const everyRowsErr = everyRowsCheck(sheet);
    if (everyRowsErr.err) return everyRowsErr;

    const addingRowsErr = addingRowsCheck(sheet, tableData);
    if (addingRowsErr.err) return addingRowsErr;

    // const modifingRowsErr = modifingRowsCheck(sheet, tableData);
    // if (modifingRowsErr.err) return modifingRowsErr;

    // const deletingRowsErr = deletingRowsCheck(sheet, tableData);
    // if (deletingRowsErr.err) return deletingRowsErr;

    //'d' / 'D' 가 지정하는 코드 혹은 이름이 현재 테이블 내용에 있는지
    // const SDTagRows = _.pick(sheet, ({ 표시 }) => { return 표시 === "s" || 표시 === "S" || 표시 === "d" || 표시 === "D" });

    return { err: false };
  }

  function everyRowsCheck(sheet) {

    //코드와 이름 둘 다 누락된 줄이 있는지
    if (_.find(sheet, (row) => { return (_.isEmpty(row['doer_name']) && _.isEmpty(row['member_code'])) }))
      return { err: true, message: messages.emptyCodeRow };

    //포맷 체크
    for (const row of sheet) {
      for (const cellName in dataInfo) {
        const cellForamtErr = cellFormatCheck(row[cellName], dataInfo[cellName].format);
        if (cellForamtErr.err) return cellForamtErr;
      }
    }

    return { err: false };
  }

  function cellFormatCheck(cell, format) {
    if (cell === undefined) return { err: false };

    switch (format) {
      case "number":
      case "money":
        if (isNaN(parseInt(cell, 10)))
          return { err: true, message: messages.incorrectFormat(cell, format) };
        break;

      case "date":
        if (typeof cell !== "string")
          return { err: true, message: messages.incorrectFormat(cell, format) };
        if (!moment(cell).isValid() || cell.search(/^\d{4}\-\d{2}\-\d{2}$/) == -1)
          return { err: true, message: messages.incorrectFormat(cell, format) };
        break;
    }

    return { err: false };
  }


  function addingRowsCheck(sheet, tableData) {

    const addingRows = _.pick(sheet, ({ mark }) => { return mark === "a" || mark === "A" });
    //추가행에 이름 중복 행이 있는지
    const sheetNamesCount = getFieldCounts(addingRows, "doer_name");
    const duplSheetNames = getDuplicatesField(sheetNamesCount);
    if (!_.isEmpty(duplSheetNames)) return { err: true, message: messages.duplicatedNames(duplSheetNames) }

    //추가행와 현재 테이블에 중복되는 이름 있는지
    const tableNamesCount = getFieldCounts(tableData, "doer_name");
    duplTableName = _.findKey(sheetNamesCount, (count, name) => { return _.has(tableNamesCount, name) })
    if (duplTableName) return { err: true, message: messages.duplicatedNames(duplTableName) }

    //추가행에 조합원 코드 중복 행이 있는지
    const sheetCodesCount = getFieldCounts(addingRows, "member_code");
    const duplSheetCodes = getDuplicatesField(sheetCodesCount);
    if (!_.isEmpty(duplSheetCodes)) return { err: true, message: messages.duplicatedCodes(duplSheetCodes) }

    //추가행와 현재 테이블에 중복되는 조합원 코드가 있는지
    const tableCodesCount = getFieldCounts(tableData, "member_code");
    duplTableCode = _.findKey(sheetCodesCount, (count, code) => { return _.has(tableCodesCount, code) })
    if (duplTableCode) return { err: true, message: messages.duplicatedCodes(duplTableCode) }

    return { err: false };
  }


  function modifingRowsCheck(sheet, tableData) {

    const modifingRows = _.pick(sheet, ({ mark }) => { return mark === "s" || mark === "S" });

    //수정행의 코드 혹은 이름이 현재 테이블 내용에 있는지
    _.each(modifingRows, row => {
    });

    //s가 코드를 지정하고 이름이 있을 경우 테이블/ s코드 행들에 중복 이름이 있는지

    //추가행에 이름 중복 행이 있는지
    const sheetNamesCount = getFieldCounts(addingRows, "doer_name");
    const duplSheetNames = getDuplicatesField(sheetNamesCount);
    if (!_.isEmpty(duplSheetNames)) return { err: true, message: messages.duplicatedNames(duplSheetNames) }

    //추가행와 현재 테이블에 중복되는 이름 있는지
    const tableNamesCount = getFieldCounts(tableData, "doer_name");
    duplTableName = _.findKey(sheetNamesCount, (count, name) => { return _.has(tableNamesCount, name) })
    if (duplTableName) return { err: true, message: messages.duplicatedNames(duplTableName) }

    return { err: false };
  }


  function formFormatCheck(sheet) { return (_.isArray(sheet)); }

  function getDuplicatesField(counts) { return _.keys(_.pick(counts, (value) => { return value > 1; })); }

  function getFieldCounts(rows, name, counts = {}) {
    _.each(_.map(rows, _.val(name)), field => {
      _.isNumber(counts[field]) ? counts[field]++ : counts[field] = 1
    });
    return counts;
  }

  const getActiveTable = () => dataTables[$('.tab-content div.active')[0].dataset.tablename];
  const dataFormat = dataName => _.v(dataInfo[dataName], 'format');
  const isDataReadOnly = dataName => _.v(dataInfo[dataName], 'readOnly');
  const isDateFormat = dataName => dataFormat(dataName) === 'date';
  const eachTables = f => _.each(dataTables, f);
})();