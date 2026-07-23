var tongThu = 0;
var tongChi = 0;
var transactions = JSON.parse(localStorage.getItem("transactions")) || [];

document.addEventListener("DOMContentLoaded", function () {
    // Kiểm tra xem trang hiện tại có thẻ Canvas vẽ biểu đồ không
    if (document.getElementById("categoryCanvas") && document.getElementById("spendingCanvas")) {
        initCategoryChart("categoryCanvas", transactions);
        initSpendingChart("spendingCanvas", transactions);
        updateCategoryChart(transactions);
        updateSpendingChart(transactions);
    }
});
window.onload = function () {
    displayTransactions();
};
function addTransaction() {

    var date = document.getElementById("date").value;
    var content = document.getElementById("content").value;
    var category = document.getElementById("category").value;
    var type = document.getElementById("type").value;
    var amount = Number(document.getElementById("amount").value);

    if (date === "" || content === "" || amount <= 0) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // Tạo giao dịch
    var transaction = {
        date: date,
        content: content,
        category: category,
        type: type,
        amount: amount
    };

    // Lưu vào mảng
    transactions.push(transaction);

    // Lưu localStorage
    localStorage.setItem("transactions", JSON.stringify(transactions));

    // Hiển thị lại
    displayTransactions();

    // Xóa ô nhập
    document.getElementById("date").value = "";
    document.getElementById("content").value = "";
    document.getElementById("amount").value = "";
}

// Hiển thị bảng
function displayTransactions() {

    var table = document.getElementById("transactionTable");

    table.innerHTML = `
        <tr>
            <th>Ngày</th>
            <th>Nội dung</th>
            <th>Danh mục</th>
            <th>Loại</th>
            <th>Số tiền</th>
        </tr>
    `;

    tongThu = 0;
    tongChi = 0;

    transactions.forEach(function (item) {

        if (item.type === "Thu") {
            tongThu += item.amount;
        } else {
            tongChi += item.amount;
        }

        var tien = item.type === "Thu"
            ? "<td style='color:green'>+" + item.amount.toLocaleString('vi-VN') + " VND</td>"
            : "<td style='color:red'>-" + item.amount.toLocaleString('vi-VN') + " VND</td>";

        table.innerHTML +=
            "<tr>" +
            "<td>" + item.date + "</td>" +
            "<td>" + item.content + "</td>" +
            "<td>" + item.category + "</td>" +
            "<td>" + item.type + "</td>" +
            tien +
            "</tr>";
    });

    document.getElementById("tongThu").innerHTML =
        tongThu.toLocaleString('vi-VN') + " VND";

    document.getElementById("tongChi").innerHTML =
        tongChi.toLocaleString('vi-VN') + " VND";

    document.getElementById("soDu").innerHTML =
        (tongThu - tongChi).toLocaleString('vi-VN') + " VND";
}
function clearDataAndReload() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu giao dịch không?")) {
        // 1. Xóa dữ liệu trong LocalStorage
        localStorage.removeItem("transactions"); 
        
        // Hoặc xóa toàn bộ LocalStorage nếu muốn reset sạch hoàn toàn:
        // localStorage.clear();

        // 2. Tải lại trang
        location.reload();
    }
}
function toggleMenu() {
    document.getElementById("ham").classList.toggle("show");
}

function toggleDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function logout(event) {
    event.preventDefault();

    const toast = document.getElementById("logoutToast");
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2000);
}