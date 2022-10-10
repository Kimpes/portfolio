exports.retrievePageInfo = function (currentPageNr, table, entriesPerPage) {
  const prevPageNr = currentPageNr - 1;
  const nextPageNr = currentPageNr + 1;
  let isFinalPage = false;
  let firstPageNumberIsNeeded = false;
  let finalPageNumberIsNeeded = false;
  let pagesNeeded = 0; //0 is falsy and therefore useful. we will of course need at least one page

  if (table.length > entriesPerPage) {
    pagesNeeded = table.length / entriesPerPage;
    pagesNeeded = Math.ceil(pagesNeeded);
    if (nextPageNr < pagesNeeded) {
      finalPageNumberIsNeeded = true;
    }
    if (prevPageNr > 1) {
      firstPageNumberIsNeeded = true;
    }
    if (currentPageNr >= pagesNeeded) {
      isFinalPage = true;
    }
  }
  if (currentPageNr > pagesNeeded) {
    currentPageNr = 1;
  }

  return {
    currentPageNr,
    prevPageNr,
    nextPageNr,
    isFinalPage,
    firstPageNumberIsNeeded,
    finalPageNumberIsNeeded,
    pagesNeeded,
  };
};
