// (() => {
const dataTables = {};
const apiUrl = '../api/members';

let tableChecker = {};
let removedRows = [];

const tablesInfo = {
  primary: [
    { data: "member_code", inputName: "코드" },
    { data: "name", inputName: "이름" },
    { data: "rname", inputName: "실명" },
    { data: "region", inputName: "구분" },
    { data: "main_commune", inputName: "주 공동체" },
    { data: "total_fund", render: C.renderMoney, inputName: "출자금", className: "text-right" },
    { data: "total_util", render: C.renderMoney, inputName: "이용금", className: "text-right" },
    { data: "note", inputName: "비고" },
    { data: "current", inputName: "현황" }
  ],
  fund: [
    { data: "member_code", inputName: "코드" },
    { data: "name", inputName: "이름" },
    { data: "total_fund", render: C.renderMoney, inputName: "출자금", className: "text-right" }
  ],
  util: [
    { data: "member_code", inputName: "코드" },
    { data: "name", inputName: "이름" },
    { data: "total_util", render: C.renderMoney, inputName: "이용금", className: "text-right" }
  ],
  action: [
    { data: "member_code", inputName: "코드" },
    { data: "name", inputName: "이름" },
    { data: "main_commune", inputName: "주 공동체" }
  ],
  detail: [
    { data: "member_code", inputName: "코드" },
    { data: "name", inputName: "이름" },
    { data: "rname", inputName: "실명" },
    { data: "region", inputName: "지역" },
    { data: "join_way", inputName: "가입경로" },
    { data: "finance_account", inputName: "금융계좌" },
    { data: "join_date", render: C.renderDate, inputName: "가입일" },
    { data: "leave_date", render: C.renderDate, inputName: "탈퇴일" },
    { data: "celeb_date", render: C.renderDate, inputName: "기념일" },
    { data: "tel1", inputName: "전화1" },
    { data: "tel2", inputName: "전화2" },
    { data: "addr", inputName: "주소" },
    { data: "webpage", inputName: "웹페이지" },
    { data: "kakaotalk", inputName: "카카오톡" },
    { data: "facebook", inputName: "페이스북" }
  ]
};

const dataInfo = {
  row_id: {},
  member_code: { format: "number", readOnly: true, required: true, unique: true },
  total_fund: { format: "money", readOnly: true },
  total_util: { format: "money", readOnly: true },
  join_date: { format: "date" },
  leave_date: { format: "date" },
  celeb_date: { format: "date" },
  name: { required: true, unique: true },
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
  region: {},
  join_way: {}
};

shortCutButtons = {
  primary: [
    { text: '출자', link: '#' },
    { text: '출자 반환', link: '#' },
    { text: '이체', link: '#' },
    { text: '출자 내역', link: '#' },
    { text: '출자 계획', link: '#' },
  ],
  fund: [
    { text: '출자', link: '#' },
    { text: '출자 반환', link: '#' },
    { text: '이체', link: '#' },
    { text: '출자 내역', link: '#' },
    { text: '출자 계획', link: '#' },
  ],
  util: [
    { text: '이용', link: '#' },
    { text: '이용 반환', link: '#' },
    { text: '이용 내역', link: '#' },
    { text: '이용 계획', link: '#' },
  ],
  action: [
    { text: '소속 공동체', link: '#' },
    { text: '조합비 납부', link: '#' },
    { text: '조합비 내역', link: '#' },
  ],
  detail: [

  ],
}

$(() => {
  setEvents();
  getTableData();
});

function setEvents() {
  //서식 삽입 버튼 누를 시 xlsx 업로드 동작
  $(".xls-upload>input").on("change", function (e) {
    const file = e.target.files[0];
    e.target.value = '';

    commonEvent.readXlsx(file, getXlsx, getActiveTable().data());
  });

  $("button.xls-download").click(e => {
    window.location.assign('/files/조합원 기입 서식.xlsx');
  });

  //탭 전환시
  $('a[data-toggle="tab"]').on("show.bs.tab", function (e) {
    const prevRow = getActiveTable().row(".selected");
    const prevTableName = getActiveTableName();

    const shownTabName = $(e.target).attr("href");
    const shownTableName = $(shownTabName)[0].dataset.tablename;
    const shownTable = dataTables[shownTableName];
    shownTable.row(prevRow).select();

    const prevSearching = $(`[data-tablename=${prevTableName}] .dataTables_filter input`)[0].value;
    $(`[data-tablename=${shownTableName}] .dataTables_filter input`)[0].value = prevSearching;

    shownTable.search(prevSearching).data().draw();
  });

  //내용 수정시 데이터에 반영
  $("#editor").change(e => {
    const row = getActiveTable().row(".selected").data();

    const fieldName = e.target.dataset.name;
    const value = e.target.value;
    const oldValue = row[fieldName];

    if (isDateFormat(fieldName)) {
      value = C.formatDate(e.target.value);
      e.target.value = value;
    }

    const modifiedRow = _.mapObject(row, (val, key) => fieldName === key ? value : val);

    try {
      modifyRow(modifiedRow);
    }
    catch (error) {
      alert(error.message);
      e.target.value = oldValue;
    }
  });

  $("#add-btn").click(e => {
    const addedRow = addRow();
    selectRow(addedRow);
    pageTable('last');
  });

  $("#removeModal").on("shown.bs.modal", e => {
    $("#remove-confirm").focus();
  });

  $("#remove-confirm").click(e => {
    const selectedRow = getActiveTable()
      .row(".selected")
      .data();

    removeTableRow(selectedRow.member_code);

    $("#editor").empty();
    $("#shortcut-buttons>div").empty();
    $("#remove-btn").hide();
    $("#removeModal").modal("hide");
  });

  const removeEdited = data => _.map(data, row => _.omit(row, "edited"));
  const removeReadOnly = data =>
    _.map(data, row => _.omit(row, (val, key) => isFieldReadOnly(key)));
  const getEditedRows = (rows, object) =>
    _.go(
      rows,
      _.filter(row => row.edited === object),
      removeEdited,
      removeReadOnly
    );
  const setRowsField = (data, field, val) => _.map(data, row => {
    row[field] = val;
    return row;
  });

  const alertIfError = msg => msg.indexOf('error') !== -1 ? alert(msg) : '';

  $("#save-btn").click(e => {
    const tableData = dataTables.primary.data();
    const added = getEditedRows(tableData, "added");
    const modified = getEditedRows(tableData, "modified");
    const removed = removeEdited(removedRows);

    if (!_.isEmpty(removed))
      $.ajax({
        url: apiUrl,
        type: 'DELETE',
        data: { data: removed }
      }).done(alertIfError);

    if (!_.isEmpty(modified))
      $.ajax({
        url: apiUrl,
        type: 'PUT',
        data: { memberInfos: modified }
      }).done(alertIfError);

    if (!_.isEmpty(added))
      $.post(apiUrl, { memberInfos: added }, alertIfError);

    setRowsField(tableData, 'edited', undefined);
    removedRows = [];
  });
}

function getTableData() {
  $.get(apiUrl, rows => {
    console.log(rows)

    let rowNumber = 0;
    const newRows = _.map(rows, row => {
      row.row_id = rowNumber++;
      return _.mapObject(dataInfo, (v, key) => row[key] === undefined ? '' : row[key]);
    });

    setTables(newRows);
    setValidChecker(newRows);
  });
}

function setValidChecker(rows) {
  tableChecker = _.mapObject(dataInfo, (fieldInfo, fieldName) => {
    if (!_.v(fieldInfo, 'required') && !_.v(fieldInfo, 'unique')) return;

    return getExistList(rows, fieldName);
  });

}

function getTableOptions(data, columns) {
  return {
    data: data,
    select: "single",
    columns: columns,
    language: common.options.tableLang_kor
  };
}

function setTables(data) {
  for (tableName in tablesInfo) {
    const tableInfo = tablesInfo[tableName];
    const tableOptions = getTableOptions(data, tableInfo);
    const table = $('#table-' + tableName).DataTable(tableOptions);
    dataTables[tableName] = table;
  }

  eachTables(table => {
    table.on("select", function (e, dt, type, indexes) {
      setFormSetting(e.target.dataset.tablename, indexes[0]);
      showRemoveBtn();
      showShortcutButtons(e.target.dataset.tablename);
    });
  });
}

function setFormSetting(tableName, rowNumber) {
  const nowtablesInfo = tablesInfo[tableName];
  const selectedRow = getActiveTable()
    .row(rowNumber)
    .data();
  const inputs = $("<div></div>");

  _.each(nowtablesInfo, column => {
    if (!column.inputName) return;

    const dataName = column.data;
    const selectedData = selectedRow[dataName];
    let inputData = '';
    if (selectedData === null) inputData = '';
    else if (isMoneyFormat(dataName)) inputData = C.renderMoney(selectedData);
    else if (isDateFormat(dataName)) inputData = C.renderDate(selectedData);
    else inputData = selectedData;

    const readOnly = isFieldReadOnly(dataName) ? "readonly" : "";

    const inputWrapper = $(`<div class="col-xs-4"></div>`);
    const inputGroup = $(`<div class="input-group"></div>`);
    const inputName = $(
      `<span class="input-group-addon">${column.inputName}</span>`
    );
    const input = $(
      `<input type="text" class="form-control" data-name="${column.data}"
      data-format="${dataFormat(column.data)}" 
        class="input-group-addon" ${readOnly} value="${inputData}"></input>`
    );

    if (dataFormat(column.data) === "date") {
      input.datepicker(common.options.datePicker);
    }

    inputs.append(inputWrapper.append(inputGroup.append(inputName, input)));
  });

  $("#editor")
    .empty()
    .append(inputs);
  $('#editor input[data-format="money"').focus(e => {
    if (!isFieldReadOnly(e.target.dataset.name))
      e.target.value = C.renderNumber(e.target.value);
    e.target.select();
  });
  $('#editor input[data-format="money"').blur(
    e => (e.target.value = C.renderMoney(e.target.value))
  );
}

function showRemoveBtn() {
  $("#remove-btn").show();
}

function getXlsx(sheet, tableData) {
  _.removeByIndex(sheet, 0);

  const sheetError = sheetValidCheck(sheet);

  if (sheetError) {
    alert(sheetError.message);
    return;
  }

  try {
    addRows(getMarkedRows(sheet, "a", "A"));
    modifyRows(getMarkedRows(sheet, "s", "S"));
    deleteRows(getMarkedRows(sheet, "d", "D"));
  }
  catch (e) {
    alert(e.message);
  }
}

function getMarkedRows(sheet, ...selectedMarks) {
  return _.go(
    sheet,
    sheet =>
      _.pick(sheet, ({ mark }) =>
        _.some(selectedMarks, selMark => selMark === mark)
      ),
    tagedRows => _.map(tagedRows, row => _.omit(row, "mark"))
  );
}

function addRows(rows) {
  const addedRows = _.map(rows, row => addRow(row));
  if (!_.isEmpty(addedRows)) selectRow(_.last(addedRows));
}

function addRow(row = {}) {
  checkUniqueFields(row);

  if (!row.member_code) {
    row.member_code =
      _.go(
        _.max(dataTables.primary.data(), tableRow => C.toNum(tableRow.member_code)),
        _.v("member_code"),
        C.toNum
      ) + 1;
  }

  const emptyMemberRow = _.mapObject(dataInfo, (val, key) => "");
  const newMemberRow = _.mapObject(
    emptyMemberRow,
    (val, key) => (row[key] ? row[key] : "")
  );

  addTableRow(newMemberRow);

  setRowExist(row);

  return newMemberRow;
}

function modifyRows(rows) {
  const modifiedRows = _.map(rows, row => modifyRow(row));
  if (!_.isEmpty(modifiedRows)) selectRow(_.last(modifiedRows));
}

function modifyRow(row) {
  if (row.member_code) return modifyRowFromCode(row);
  else return modifyRowFromName(row);
}

function modifyRowFromCode(row) {
  checkCodeExist(row.member_code);

  if (!row.name)
    throw new Error(messages.noEmptyName(row.member_code));

  const oldMemberRow = getActiveTable()
    .row(findByCode(row.member_code))
    .data();
  const newMemberRow = _.mapObject(
    oldMemberRow,
    (val, key) => (row[key] ? row[key] : "")
  );

  if (oldMemberRow.name != newMemberRow.name && isFieldExist('name', newMemberRow.name))
    throw new Error(messages.duplicatedField('이름', row.name));

  modifyTableRow(newMemberRow);

  if (oldMemberRow.name !== newMemberRow) {
    setRowExist(oldMemberRow, false);
    setRowExist(newMemberRow);
  }

  return newMemberRow;
}

function modifyRowFromName(row) {
  checkNameExist(row.name);

  const oldMemberRow = getActiveTable()
    .row(findByName(row.name))
    .data();
  const newMemberRow = _.mapObject(
    oldMemberRow,
    (val, key) => (row[key] ? row[key] : "")
  );
  newMemberRow.member_code = oldMemberRow.member_code;

  modifyTableRow(newMemberRow);

  return newMemberRow;
}

function deleteRows(rows) {
  _.each(rows, row => deleteRow(row));
}

function deleteRow(row) {
  if (row.member_code) return deleteRowFromCode(row);
  else return deleteRowFromName(row);
}

function deleteRowFromCode(row) {
  checkCodeExist(row.member_code);

  const oldRow = getActiveTable()
    .row(findByCode(row.member_code))
    .data();

  removeTableRow(row.member_code);
}

function deleteRowFromName(row) {
  checkNameExist(row.name);

  const oldRow = getActiveTable()
    .row(findByName(row.name))
    .data();

  removeTableRow(oldRow.member_code);
}

function sheetValidCheck(sheet) {
  if (!_.isArray(sheet)) return { err: true, message: messages.incorrectSheet };

  //코드와 이름 둘 다 누락된 줄이 있는지
  if (_.find(sheet, row => {
    return _.isEmpty(row["name"]) && _.isEmpty(row["member_code"]);
  }))
    return { err: true, message: messages.emptyCodeRow };

  for (const row of sheet) {
    for (const cellName in dataInfo) {
      const cellForamtErr = cellFormatCheck(
        row[cellName],
        dataInfo[cellName].format
      );
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
      if (!moment(cell).isValid() || cell.search(/^\d{4}\-\d{2}\-\d{2}$/) == -1)
        return { err: true, message: messages.incorrectFormat(cell, format) };
      break;
  }

  return { err: false };
}

function showShortcutButtons(tableName) {
  const buttonsBox = $('#shortcut-buttons>div');
  buttonsBox.empty();

  _.each(shortCutButtons[tableName], buttonInfo => {
    buttonsBox.append(`
      <button type="button" class="btn btn-default">${buttonInfo.text}</button>`
    );
  });
}

const selectRow = row => {
  getActiveTable()
    .row(findByCode(row.member_code))
    .draw()
    .select();
};
const pageTable = page => getActiveTable().page(page).draw('page');

const findByCode = code => (idx, data) => code == data.member_code;
const findByName = name => (idx, data) => name == data.name;

const getExistList = (rows, field) =>
  _.reduce(
    rows,
    (memo, row) => {
      if (_.v(row, field)) memo[_.v(row, field)] = true;
      return memo;
    },
    {}
  );

const isFieldRequired = fieldName => _.v(dataInfo[fieldName], "required");
const isFieldUnique = fieldName => _.v(dataInfo[fieldName], "unique");
const isFieldReadOnly = fieldName => _.v(dataInfo[fieldName], "readOnly");
const isDateFormat = fieldName => dataFormat(fieldName) === "date";
const isMoneyFormat = fieldName => dataFormat(fieldName) === "money";
const isFieldExist = (fieldName, field) => _.v(tableChecker[fieldName], field);
const setFieldExist = (fieldName, field, bool = true) => tableChecker[fieldName][field] = bool;
const setRowExist = (row, bool = true) => {
  for (fieldName in row) {
    if (isFieldUnique(fieldName)) {
      console.log(fieldName)
      console.log(row[fieldName])
      setFieldExist(fieldName, row[fieldName], bool);
    }
  }
}
const findInputName = fieldName => {
  let inputName;
  _.each(tablesInfo, tableInfo => {
    const fieldInfo = _.find(tableInfo, fieldInfo => fieldInfo.data === fieldName)
    inputName = fieldInfo.inputName || inputName;
  })
  return inputName;
}

const checkUniqueFields = row => {
  for (fieldName in dataInfo) {
    if (isFieldUnique(fieldName) && isFieldExist(fieldName, row[fieldName])) {
      const inputName = findInputName(fieldName);
      throw new Error(messages.duplicatedField(inputName, row[fieldName]));
    }
  }
}


const checkCodeExist = code => {
  if (!isFieldExist('member_code', code)) throw new Error(messages.noCode(code));
};
const checkNameExist = name => {
  if (!isFieldExist('name', name)) throw new Error(messages.noName(name));
};

const getActiveTableName = () => $(".tab-content div.active")[0].dataset.tablename;
const getActiveTable = () => dataTables[getActiveTableName()];
const dataFormat = dataName => _.v(dataInfo[dataName], "format");
const eachTables = f => _.each(dataTables, f);

const addTableRow = row => {
  row.edited = "added";
  eachTables(table => table.data().row.add(row));
};

const modifyTableRow = row => {
  if (!row.edited) row.edited = "modified";

  eachTables(table => {
    table.row(findByCode(row.member_code)).data(row);
  });
};

const removeTableRow = rowCode => {
  removingRow = dataTables.primary.row(findByCode(rowCode)).data();
  if (removingRow.edited !== "added") { removedRows.push(removingRow) };

  setRowExist(removingRow, false);

  eachTables(table => {
    table
      .row(findByCode(removingRow.member_code))
      .remove()
      .draw();
  });
};
