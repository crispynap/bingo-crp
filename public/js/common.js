(() => {
  const currentMenu = location.pathname.split('/')[1];
  const menuItem = document.querySelector(`.menu-${currentMenu}`);
  menuItem.classList.add('highlight');
})();

const eventControl = {
  preventOuterWheel(e) {
    var delta = e.wheelDelta;
    this.scrollTop += (delta < 0 ? 1 : -1) * 30;
    e.preventDefault();
  }
}