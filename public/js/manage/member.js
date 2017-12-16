const table = document.querySelector('.member-table')
table.addEventListener('mousewheel', eventControl.preventOuterWheel)
table.addEventListener('dblclick', eventControl.selectText)

