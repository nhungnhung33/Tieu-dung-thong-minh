var tongThu = 0;
var tongChi = 0;
var tien="";
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

    var table = document.getElementById("transactionTable");

    

    if (type === "Thu") {
        tongThu += amount;
      tien= "<td style='color:green'>+" + amount + " VND</td>"
        
          
    } else {
        tongChi += amount;
             tien= "<td style='color:red'>-" + amount + " VND</td>"

    }
    table.innerHTML +=
        "<tr>"
        + "<td>" + date + "</td>"
        + "<td>" + content + "</td>"
        + "<td>" + category + "</td>"
        + "<td>" + type + "</td>"
        + tien
        + "</tr>";

    document.getElementById("tongThu").innerHTML =
        tongThu.toLocaleString('vi-VN') + " VND";

    document.getElementById("tongChi").innerHTML =
        tongChi.toLocaleString('vi-VN') + " VND";

    document.getElementById("soDu").innerHTML =
        (tongThu - tongChi).toLocaleString('vi-VN') + " VND";

    document.getElementById("date").value = "";
    document.getElementById("content").value = "";
    document.getElementById("amount").value = "";

    
}
function toggleMenu() {
    document.getElementById("ham").classList.toggle("show");
}
var tongThu = 0;
var tongChi = 0;
var tien="";
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

    var table = document.getElementById("transactionTable");

    

    if (type === "Thu") {
        tongThu += amount;
      tien= "<td style='color:green'>+" + amount + " VND</td>"
        
          
    } else {
        tongChi += amount;
             tien= "<td style='color:red'>-" + amount + " VND</td>"

    }
    table.innerHTML +=
        "<tr>"
        + "<td>" + date + "</td>"
        + "<td>" + content + "</td>"
        + "<td>" + category + "</td>"
        + "<td>" + type + "</td>"
        + tien
        + "</tr>";

    document.getElementById("tongThu").innerHTML =
        tongThu.toLocaleString('vi-VN') + " VND";

    document.getElementById("tongChi").innerHTML =
        tongChi.toLocaleString('vi-VN') + " VND";

    document.getElementById("soDu").innerHTML =
        (tongThu - tongChi).toLocaleString('vi-VN') + " VND";

    document.getElementById("date").value = "";
    document.getElementById("content").value = "";
    document.getElementById("amount").value = "";

    
}
function toggleMenu() {
    document.getElementById("ham").classList.toggle("show");
}
//Toggle Menu User
function toggleDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}