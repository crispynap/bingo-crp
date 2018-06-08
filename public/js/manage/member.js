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
  row_code: {},
  member_code: { format: "number", modifiable: false, required: true, unique: true },
  total_fund: { format: "money", modifiable: false, readOnly: true },
  total_util: { format: "money", modifiable: false, readOnly: true },
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
    const fieldName = e.target.dataset.name;
    const value = e.target.value;
    const row = getActiveTable().row(".selected").data();

    if (isFieldRequired(fieldName) && value === '') {
      e.target.value = row[fieldName];
      alert(messages.requiredField(fieldName));
      return;
    }

    if (isFieldUnique(fieldName) && isFieldExist(fieldName, value)) {
      e.target.value = '';
      alert(messages.duplicatedField(fieldName));
      return;
    }

    if (isDateFormat(fieldName)) {
      e.target.value = C.formatDate(e.target.value); //날짜 서식에 맞추기
    }

    row[fieldName] = e.target.value;

    modifyRow(row);
  });

  $("#add-btn").click(e => {
    const addedRow = addMember();
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

    removeRow(selectedRow.member_code);

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
    let rowNumber = 0;
    const newRows = _.map(rows, row => {
      row.row_code = rowNumber++;
      return _.mapObject(dataInfo, (v, key) => row[key] === undefined ? '' : row[key]);
    });

    setTables(newRows);
    setValidChecker(newRows);
  });
}

function setValidChecker(rows) {
  tableChecker = _.mapObject(dataInfo, (fieldInfo, fieldName) => {
    if (!_.v(fieldInfo, 'required') && !_.v(fieldInfo, 'unique'))
      return;

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
    addMembers(getMarkedRows(sheet, "a", "A"));
    modifyMembers(getMarkedRows(sheet, "s", "S"));
    deleteMembers(getMarkedRows(sheet, "d", "D"));
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

function addMembers(members) {
  const addedMembers = _.map(members, member => addMember(member));
  if (!_.isEmpty(addedMembers)) selectRow(_.last(addedMembers));
}

function addMember(member = {}) {
  checkCodeDuplicates(member.member_code);
  checkNameDuplicates(member.name);

  if (!member.member_code) {
    member.member_code =
      _.go(
        _.max(dataTables.primary.data(), row => C.toNum(row.member_code)),
        _.v("member_code"),
        C.toNum
      ) + 1;
  }

  const emptyMemberRow = _.mapObject(dataInfo, (val, key) => "");
  const newMemberRow = _.mapObject(
    emptyMemberRow,
    (val, key) => (member[key] ? member[key] : "")
  );

  addRow(newMemberRow);

  setFieldExist('member_code', member.member_code);
  setFieldExist('name', member.name);

  return newMemberRow;
}

function modifyMembers(members) {
  const modifiedMembers = _.map(members, member => modifyMember(member));
  if (!_.isEmpty(modifiedMembers)) selectRow(_.last(modifiedMembers));
}

function modifyMember(member) {
  if (member.member_code) return modifyMemberFromCode(member);
  else return modifyMemberFromName(member);
}

function modifyMemberFromCode(member) {
  checkCodeExist(member.member_code);

  if (!member.name)
    throw new Error(messages.noEmptyName(member.member_code));

  const oldMemberRow = getActiveTable()
    .row(findByCode(member.member_code))
    .data();
  const newMemberRow = _.mapObject(
    oldMemberRow,
    (val, key) => (member[key] ? member[key] : "")
  );

  if (oldMemberRow.name != newMemberRow.name && isFieldExist('name', newMemberRow.name))
    throw new Error(messages.duplicatedField('이름', member.name));

  modifyRow(newMemberRow);

  if (oldMemberRow.name !== newMemberRow) {
    setFieldExist('name', oldMemberRow.name, false);
    setFieldExist('name', newMemberRow.name);
  }

  return newMemberRow;
}

function modifyMemberFromName(member) {
  checkNameExist(member.name);

  const oldMemberRow = getActiveTable()
    .row(findByName(member.name))
    .data();
  const newMemberRow = _.mapObject(
    oldMemberRow,
    (val, key) => (member[key] ? member[key] : "")
  );
  newMemberRow.member_code = oldMemberRow.member_code;

  modifyRow(newMemberRow);

  return newMemberRow;
}

function deleteMembers(members) {
  _.each(members, member => deleteMember(member));
}

function deleteMember(member) {
  if (member.member_code) return deleteMemberFromCode(member);
  else return deleteMemberFromName(member);
}

function deleteMemberFromCode(member) {
  checkCodeExist(member.member_code);

  const oldRow = getActiveTable()
    .row(findByCode(member.member_code))
    .data();

  removeRow(member.member_code);
}

function deleteMemberFromName(member) {
  checkNameExist(member.name);

  const oldRow = getActiveTable()
    .row(findByName(member.name))
    .data();

  removeRow(oldRow.member_code);
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

const checkCodeDuplicates = code => {
  if (isFieldExist('member_code', code)) throw new Error(messages.duplicatedField('조합원 코드', code));
};

const checkNameDuplicates = name => {
  if (isFieldExist('name', name)) throw new Error(messages.duplicatedField('이름', name));
};

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

const addRow = row => {
  row.edited = "added";
  eachTables(table => table.data().row.add(row));
};

const modifyRow = row => {
  if (!row.edited) row.edited = "modified";

  eachTables(table => {
    table.row(findByCode(row.member_code)).data(row);
  });
};

const removeRow = rowCode => {
  removingRow = dataTables.primary.row(findByCode(rowCode)).data();
  if (removingRow.edited !== "added") { removedRows.push(removingRow) };

  setFieldExist('member_code', removingRow.member_code, false);
  setFieldExist('name', removingRow.name, false);

  eachTables(table => {
    table
      .row(findByCode(removingRow.member_code))
      .remove()
      .draw();
  });
};
