(() => {
  const dataTables = {};

  const tableChecker = {};

  const tableColumns = {
    primary: [
      { data: "member_code", inputName: "코드" },
      { data: "doer_name", inputName: "이름" },
      { data: "rname", inputName: "실명" },
      { data: "category", inputName: "구분" },
      { data: "main_commune", inputName: "주 공동체" },
      {
        data: "total_fund",
        render: C.renderMoney,
        inputName: "출자금",
        className: "text-right"
      },
      {
        data: "total_util",
        render: C.renderMoney,
        inputName: "이용금",
        className: "text-right"
      },
      { data: "note", inputName: "비고" },
      { data: "current", inputName: "현황" }
    ],
    fund: [
      { data: "member_code", inputName: "코드" },
      { data: "doer_name", inputName: "이름" },
      {
        data: "total_fund",
        render: C.renderMoney,
        inputName: "출자금",
        className: "text-right"
      }
    ],
    util: [
      { data: "member_code", inputName: "코드" },
      { data: "doer_name", inputName: "이름" },
      {
        data: "total_util",
        render: C.renderMoney,
        inputName: "이용금",
        className: "text-right"
      }
    ],
    action: [
      { data: "member_code", inputName: "코드" },
      { data: "doer_name", inputName: "이름" },
      { data: "main_commune", inputName: "주 공동체" }
    ],
    detail: [
      { data: "member_code", inputName: "코드" },
      { data: "doer_name", inputName: "이름" },
      { data: "rname", inputName: "실명" },
      { data: "finance_account", inputName: "금융계좌" },
      { data: "join_date", inputName: "가입일" },
      { data: "leave_date", inputName: "탈퇴일" },
      { data: "celeb_date", inputName: "기념일" },
      { data: "tel1", inputName: "전화1" },
      { data: "tel2", inputName: "전화2" },
      { data: "addr", inputName: "주소" },
      { data: "webpage", inputName: "웹페이지" },
      { data: "kakaotalk", inputName: "카카오톡" },
      { data: "facebook", inputName: "페이스북" },
      { data: "region", inputName: "지역" },
      { data: "join_way", inputName: "가입경로" }
    ]
  };

  const dataInfo = {
    member_code: { format: "number", modifiable: false },
    total_fund: { format: "money", modifiable: false, readOnly: true },
    total_util: { format: "money", modifiable: false, readOnly: true },
    join_date: { format: "date" },
    leave_date: { format: "date" },
    celeb_date: { format: "date" },
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
    region: {},
    join_way: {}
  };

  $(document).ready(() => {
    setEvents();
    getMembersAll();
  });

  function setEvents() {
    //서식 삽입 버튼 누를 시 xlsx 업로드 동작
    const xlsButton = document.querySelector(".xls-upload>input");
    xlsButton.addEventListener("change", function(e) {
      commonEvent.readXlsx(e, getXlsx, getActiveTable().data());
    });

    //탭 전환시
    $('a[data-toggle="tab"]').on("show.bs.tab", function(e) {
      const prevRow = getActiveTable().row(".selected");

      const shownTabName = $(e.target).attr("href");
      const shownTableName = $(shownTabName)[0].dataset.tablename;
      const shownTable = dataTables[shownTableName];
      shownTable.row(prevRow).select();
      shownTable.data().draw();
    });

    //내용 수정시 데이터에 반영
    $("#editor").change(e => {
      const row = getActiveTable().row(".selected");
      const rowData = row.data();
      const editingCell = e.target.dataset.name;

      if (isDateFormat(editingCell))
        e.target.value = C.renderDate(e.target.value); //날짜 서식에 맞추기

      rowData[editingCell] = e.target.value;

      eachTables(table => {
        table.row(row).data(rowData);
      });
    });

    $("#add-btn").click(e => {
      const addedRow = addMember();
      selectRow(addedRow);
    });

    $("#removeModal").on("shown.bs.modal", e => {
      $("#remove-confirm").focus();
    });

    $("#remove-confirm").click(e => {
      const selectedRow = getActiveTable().row(".selected");

      eachTables(table => {
        table
          .row(selectedRow)
          .remove()
          .draw();
      });

      $("#editor").empty();
      $("#remove-btn").hide();
      $("#removeModal").modal("hide");
    });
  }

  function getMembersAll() {
    $.get("../api/members", memberData => {
      setTables(memberData);
      setValidChecker(memberData);
    });
  }

  function setValidChecker(data) {
    tableChecker.existCodes = getExistList(data, "member_code");
    tableChecker.existNames = getExistList(data, "doer_name");
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
    const primaryTableOptions = getTableOptions(data, tableColumns.primary);
    const primaryTable = $("#table-primary").DataTable(primaryTableOptions);
    dataTables.primary = primaryTable;

    const fundTableOptions = getTableOptions(data, tableColumns.fund);
    const fundTable = $("#table-fund").DataTable(fundTableOptions);
    dataTables.fund = fundTable;

    const utilTableOptions = getTableOptions(data, tableColumns.util);
    const utilTable = $("#table-util").DataTable(utilTableOptions);
    dataTables.util = utilTable;

    const actionTableOptions = getTableOptions(data, tableColumns.action);
    const actionTable = $("#table-action").DataTable(actionTableOptions);
    dataTables.action = actionTable;

    const detailTableOptions = getTableOptions(data, tableColumns.detail);
    const detailTable = $("#table-detail").DataTable(detailTableOptions);
    dataTables.detail = detailTable;

    eachTables(table => {
      table.on("select", function(e, dt, type, indexes) {
        setFormSetting(e.target.dataset.tablename, indexes[0]);
        showRemoveBtn();
      });
    });
  }

  function setFormSetting(tableName, rowNumber) {
    const nowTableColumns = tableColumns[tableName];
    const selectedRow = getActiveTable()
      .row(rowNumber)
      .data();
    const inputs = $("<div></div>");

    _.each(nowTableColumns, column => {
      if (!column.inputName) return;

      const dataName = column.data;
      const selectedData = selectedRow[dataName];
      const inputData =
        selectedData === null
          ? ""
          : dataFormat(dataName) === "money"
            ? C.renderMoney(selectedData)
            : selectedData;

      const readOnly = isDataReadOnly(dataName) ? "readonly" : "";

      const inputWrapper = $(`<div class="col-xs-4"></div>`);
      const inputGroup = $(`<div class="input-group"></div>`);
      const inputName = $(
        `<span class="input-group-addon">${column.inputName}</span>`
      );
      const input = $(
        `<input type="text" class="form-control" data-name="${
          column.data
        }" data-format="${dataFormat(column.data)}" 
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
      if (!isDataReadOnly(e.target.dataset.name))
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
    console.log("sheet: ", sheet);
    console.log("tableData: ", tableData);

    // try {
    addMembers(getMarkedRows(sheet, "a", "A"));
    modifyMembers(getMarkedRows(sheet, "s", "S"));
    deleteMembers(getMarkedRows(sheet, "d", "D"));
    // }
    // catch (e) {
    //   alert(e.message);
    // }
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

  function getMembers(membersInfo) {
    const ids = _.map(membersInfo, ({ member_code }) => member_code);
    const idsQuery = _.reduce(
      ids,
      (memo, id) => {
        if (memo !== "") memo += "&";
        return memo + id;
      },
      ""
    );

    $.get("../api/members/" + idsQuery, data => {
      setTables(tablesInfo, data);
    });
  }

  function addMembers(members) {
    const addedMembers = _.map(members, member => addMember(member));
    if (!_.isEmpty(addedMembers)) selectRow(_.last(addedMembers));
  }

  function addMember(member = {}) {
    checkCodeDuplicates(member.member_code);
    checkNameDuplicates(member.doer_name);

    if (!member.member_code) {
      member.member_code =
        _.go(
          _.max(dataTables.primary.data(), row => row.member_code),
          _.v("member_code")
        ) + 1;
    }

    const emptyMemberRow = _.mapObject(dataInfo, (val, key) => "");
    const newMemberRow = _.mapObject(
      emptyMemberRow,
      (val, key) => (member[key] ? member[key] : "")
    );

    eachTables(table => {
      table.data().row.add(newMemberRow);
    });

    setCodeExist(member.member_code);
    setNameExist(member.doer_name);

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

    if (!member.doer_name)
      throw new Error(messages.noEmptyName(member.member_code));

    const oldMemberRow = getActiveTable()
      .row(findByCode(member))
      .data();
    const newMemberRow = _.mapObject(
      oldMemberRow,
      (val, key) => (member[key] ? member[key] : "")
    );

    if (
      oldMemberRow.doer_name != newMemberRow.doer_name &&
      isNameExist(newMemberRow.doer_name)
    )
      throw new Error(messages.duplicatedNames(member.doer_name));

    eachTables(table => {
      table.row(findByCode(newMemberRow)).data(newMemberRow);
    });

    if (oldMemberRow.doer_name !== newMemberRow) {
      setNameExist(oldMemberRow.doer_name, false);
      setNameExist(newMemberRow.doer_name);
    }

    return newMemberRow;
  }

  function modifyMemberFromName(member) {
    checkNameExist(member.doer_name);

    const oldMemberRow = getActiveTable()
      .row(findByName(member))
      .data();
    const newMemberRow = _.mapObject(
      oldMemberRow,
      (val, key) => (member[key] ? member[key] : "")
    );
    newMemberRow.member_code = oldMemberRow.member_code;

    eachTables(table => {
      table.row(findByName(newMemberRow)).data(newMemberRow);
    });

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
      .row(findByCode(member))
      .data();

    eachTables(table => {
      table
        .row(findByCode(member))
        .remove()
        .draw();
    });

    setCodeExist(oldRow.member_code, false);
    setNameExist(oldRow.doer_name, false);
  }

  function deleteMemberFromName(member) {
    checkNameExist(member.doer_name);

    const oldRow = getActiveTable()
      .row(findByName(member))
      .data();

    eachTables(table => {
      table
        .row(findByName(member))
        .remove()
        .draw();
    });

    setCodeExist(oldRow.member_code, false);
    setNameExist(oldRow.doer_name, false);
  }

  function sheetValidCheck(sheet) {
    if (!_.isArray(sheet))
      return { err: true, message: messages.incorrectSheet };

    //코드와 이름 둘 다 누락된 줄이 있는지
    if (
      _.find(sheet, row => {
        return _.isEmpty(row["doer_name"]) && _.isEmpty(row["member_code"]);
      })
    )
      return { err: true, message: messages.emptyCodeRow };

    //포맷 체크
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
        if (
          !moment(cell).isValid() ||
          cell.search(/^\d{4}\-\d{2}\-\d{2}$/) == -1
        )
          return { err: true, message: messages.incorrectFormat(cell, format) };
        break;
    }

    return { err: false };
  }

  const selectRow = row => {
    getActiveTable()
      .row(findByCode(row))
      .draw()
      .select();
  };

  const findByCode = row => (idx, data) => data.member_code == row.member_code;
  const findByName = row => (idx, data) => data.doer_name == row.doer_name;

  const getExistList = (rows, field) =>
    _.reduce(
      rows,
      (memo, row) => {
        if (_.v(row, field)) memo[_.v(row, field)] = true;
        return memo;
      },
      {}
    );

  const isCodeExist = code => _.v(tableChecker.existCodes, code);
  const isNameExist = name => _.v(tableChecker.existNames, name);
  const setCodeExist = (code, bool = true) =>
    (tableChecker.existCodes[code] = bool);
  const setNameExist = (name, bool = true) =>
    (tableChecker.existNames[name] = bool);

  const checkCodeDuplicates = code => {
    if (isCodeExist(code)) throw new Error(messages.duplicatedCodes(code));
  };

  const checkNameDuplicates = name => {
    if (isNameExist(name)) throw new Error(messages.duplicatedNames(name));
  };

  const checkCodeExist = code => {
    if (!isCodeExist(code)) throw new Error(messages.noCode(code));
  };
  const checkNameExist = name => {
    if (!isNameExist(name)) throw new Error(messages.noName(name));
  };

  const getActiveTable = () =>
    dataTables[$(".tab-content div.active")[0].dataset.tablename];
  const dataFormat = dataName => _.v(dataInfo[dataName], "format");
  const isDataReadOnly = dataName => _.v(dataInfo[dataName], "readOnly");
  const isDateFormat = dataName => dataFormat(dataName) === "date";
  const eachTables = f => _.each(dataTables, f);
})();
