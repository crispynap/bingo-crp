(() => {
  const currentMenu = location.pathname.split('/')[1];
  const menuItem = document.querySelector(`.menu-${currentMenu}`);
  menuItem.classList.add('highlight');
})();