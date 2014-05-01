function simulateScroll(driver, posX, posY, next) {
  driver
    .executeScript('window.scrollTo(' + posX + ',' + posY + ')')
    .then(next);
}

module.exports = simulateScroll;
