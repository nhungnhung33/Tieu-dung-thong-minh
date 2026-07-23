// Đọc dữ liệu đã lưu từ Dashboard
var transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

window.onload = function () {

    initCategoryChart("categoryCanvas", transactions);

    initSpendingChart("spendingCanvas", transactions);

    updateCategoryChart(transactions);

    updateSpendingChart(transactions);

};