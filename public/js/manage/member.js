(() => {

  const dataTables = {};

  const tableChecker = {};

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
      const addedRow = addMember();
      selectRow(addedRow);
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
      setValidChecker(memberData);
    });
  }

  function setValidChecker(data) {
    tableChecker.codeList = getFieldCounts(data, 'member_code');
    tableChecker.nameList = getFieldCounts(data, 'doer_name');
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
    const sheetError = sheetValidCheck(sheet);

    if (sheetError) {
      alert(sheetError.message);
      return;
    }
    console.log('sheet: ', sheet)
    console.log('tableData: ', tableData)

    try {
      addMembers(getMarkedRows(sheet, "a", "A"));
      // updateMembers(_.pick(sheet, ({ mark }) => { return mark === "a" || mark === "A" }));
      // deleteMembers(_.pick(sheet, ({ mark }) => { return mark === "a" || mark === "A" }));
    }
    catch (e) {

    }
  }

  function getMarkedRows(sheet, ...selectedMarks) {
    return _.go(sheet,
      sheet => _.pick(sheet, ({ mark }) => _.some(selectedMarks, selMark => selMark === mark)),
      tagedRows => _.map(tagedRows, row => _.omit(row, 'mark'))
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

  function addMembers(members) {
    const addedMembers = _.map(member => addMember(member));
    selectRow(_.last(addedMembers));
  }

  function addMember(member = {}) {
    if (member.member_code && _.isNumber(tableChecker.codeList[member.member_code]))
      throw new Error(messages.duplicatedCodes(member.member_code));

    if (member.doer_name && _.isNumber(tableChecker.nameList[member.doer_name]))
      throw new Error(messages.duplicatedNames(member.doer_name));

    if (!member.member_code) {
      member.member_code = _.go(
        _.max(dataTables.primary.data(), row => row.member_code),
        _.v('member_code')
      ) + 1;
    }

    const emptyMemberRow = _.mapObject(dataInfo, (val, key) => "");
    const newMemberRow = _.mapObject(emptyMemberRow, (val, key) => member[key] ? member[key] : "");

    eachTables(table => {
      table.data().row.add(newMemberRow);
      table.data().row.add(newMemberRow);
    });

    return newMemberRow;
  }

  function sheetValidCheck(sheet) {

    if (!_.isArray(sheet))
      return { err: true, message: messages.incorrectSheet };

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

  const getFieldCounts = (rows, fieldName, counts = {}) => {
    _.go(
      _.map(rows, _.val(fieldName)),
      _.each(field => _.isNumber(counts[field]) ? counts[field]++ : counts[field] = 1)
    )
    return counts;
  }

  const selectRow = (row) => {
    getActiveTable()
      .row((idx, data) => data.member_code === row.member_code)
      .draw()
      .select()
  };

  const getActiveTable = () => dataTables[$('.tab-content div.active')[0].dataset.tablename];
  const dataFormat = dataName => _.v(dataInfo[dataName], 'format');
  const isDataReadOnly = dataName => _.v(dataInfo[dataName], 'readOnly');
  const isDateFormat = dataName => dataFormat(dataName) === 'date';
  const eachTables = f => _.each(dataTables, f);
})();