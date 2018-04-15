(() => {

  const dataTables = {};

  const tableColumns = {
    primary: [
      { data: 'member_code', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'rname', inputName: '실명' },
      { data: 'category', inputName: '구분' },
      { data: 'main_commune', inputName: '주 공동체' },
      { data: 'total_fund', },
      { data: 'total_util', },
      { data: 'note', inputName: '비고' },
      { data: 'current', inputName: '현황' },
    ],
    fund: [
      { data: 'member_code', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'total_fund' },
    ],
    util: [
      { data: 'member_code', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'total_util' },
    ],
    action: [
      { data: 'member_code', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'main_commune', inputName: '주 공동체' },
    ],
    detail: [
      { data: 'member_code', },
      { data: 'doer_name', inputName: '이름' },
      { data: 'rname', inputName: '실명' },
      { data: 'join_date', format: 'date', inputName: '가입일' },
      { data: 'leave_date', format: 'date', inputName: '탈퇴일' },
      { data: 'celeb_date', format: 'date', inputName: '기념일' },
    ],
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
    });


    //내용 수정시 데이터에 반영
    $('#editor').change(e => {
      const table = getActiveTable();
      const row = table.row('.selected').data();
      const editingCell = e.target.dataset.name;
      row[editingCell] = e.target.value;

      table.row('.selected').data(row).draw();
    });

  }


  function getMembersAll() {
    $.get("../api/members", (data) => {
      setTables(data);
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

    _.each(dataTables, (table) => {
      table.on('select', function (e, dt, type, indexes) {
        setFormSetting(indexes[0]);
      });
    });

  }

  function setFormSetting(rowNumber) {
    const nowTab = $('.tab-content>.active')[0].dataset.tablename;
    const selectedData = getActiveTable().row(rowNumber).data();

    const getInput = columnInfo => {
      if (columnInfo.inputName) {
        const inputData = selectedData[columnInfo.data] !== null ? selectedData[columnInfo.data] : "";
        return `
        <div class="col-xs-4">
          <div class="input-group">
            <span class="input-group-addon" id="basic-addon1">${columnInfo.inputName}</span>
            <input type="text" class="form-control" data-name="${columnInfo.data}" value="${inputData}">
          </div>
        </div>`;
      } else {
        return "";
      }
    }
    const inputs = _.reduce(tableColumns[nowTab], (memo, column) => memo + getInput(column), "");

    $('#editor').empty().append(inputs);
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

    try {
      const formatedSheet = xlsxFormating(sheet);
    }
    catch (e) {
      alert(e.message);
    }

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

  function xlsxFormating(sheet) {
    return _.map(sheet, row => {
      return _.map(row, cell => {


        return cell;
      })
    })
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

  function getActiveTable() {
    return dataTables[$('.tab-content div.active')[0].dataset.tablename];
  }

})();