// 1. Mảng lưu trữ tất cả các mục tiêu
let goals = JSON.parse(localStorage.getItem("savings_goals")) || [];
let transactions =
  JSON.parse(localStorage.getItem("savings_transactions")) || [];
//HÀM LƯU DỮ LIỆU NÈ
function saveDataToStorage() {
  localStorage.setItem("savings_goals", JSON.stringify(goals));
  localStorage.setItem("savings_transactions", JSON.stringify(transactions));
}
//===CÁC HÀM RENDER VÀ CẬP NHẬT GIAO DIỆN( tụi nó phải nằm ngoài này!! ko đc quan lun tung nha mi)
// --- HÀM RENDER DANH SÁCH MỤC TIÊU RA MÀN HÌNH ---
function renderGoalsList() {
  const goalsList = document.getElementById("goalsList");
  goalsList.innerHTML = "";

  if (goals.length === 0) {
    goalsList.innerHTML = `<p style="color: #888; font-style: italic;">Chưa có mục tiêu nào được tạo.</p>`;
    return;
  }

  goals.forEach((goal) => {
    const dateParts = goal.targetDate.split("-");
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    // Tính % tiến độ
    const percent = Math.min(
      100,
      Math.round((goal.currentSaved / goal.targetAmount) * 100),
    );
    const freqLabel = goal.frequency === "monthly" ? "tháng" : "tuần";

    const card = document.createElement("div");
    card.className = "card goal-card";
    card.style.cssText =
      "background: #ffe3f5; padding: 16px; border-radius: 12px; border: 1px solid #ffe3f5; margin-bottom: 12px;";

    // Dùng dấu phẩy ngược (backtick `) ở đầu và cuối chuỗi HTML:
    card.innerHTML = `
        <div class="goal-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; font-weight: bold;">🎯 ${goal.goalName}</h4>
          <span class="goal-percent" style="font-weight: bold; color: #bb6eff;">${percent}%</span>
        </div>
        
        <div class="goal-amounts" style="display: flex; justify-content: space-between; font-size: 14px; margin: 10px 0;">
          <span>Đã tích lũy: <strong style="color: #2563eb;">${goal.currentSaved.toLocaleString("vi-VN")} đ</strong></span>
          <span>Mục tiêu: <strong>${goal.targetAmount.toLocaleString("vi-VN")} đ</strong></span>
        </div>

        <!-- Thanh tiến độ -->
        <div class="progress-bar" style="background: #e9e5eb; border-radius: 10px; height: 10px; width: 100%; overflow: hidden;">
          <div class="progress" style="width: ${percent}%; background: #bb6eff; height: 100%; transition: width 0.3s;"></div>
        </div>

        <div class="goal-footer" style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-top: 12px; color: #6b7280;">
          <div>
            <div>Hạn: <strong>${formattedDate}</strong></div>
            <div>Đóng: <strong>${goal.monthlyAmount.toLocaleString("vi-VN")} đ/${freqLabel}</strong></div>
          </div>
          
          <button class="btn-deposit" onclick="depositMoney(${goal.id})">
            <i class="fa-solid fa-plus-circle"></i> Nạp tiền
          </button>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
  <span class="goal-percent" style="font-weight: bold; color: #B28DFF;">${percent}%</span>
  <button onclick="cancelGoal('${goal.goalName}')" style="background: none; border: none; font-size: 16px; cursor: pointer; color: #9ca3af;" title="Xóa mục tiêu">✖</button>
</div>

      `; // <-- Đóng chuỗi HTML bằng dấu backtick ở đây

    goalsList.appendChild(card);
  }); // <-- Đóng hàm forEach
  initChart();
} // <-- Đóng hàm renderGoalsList
window.cancelGoal = function (goalName) {
  alert(
    `Vì tôi là một người nỏi loạn nên tôi sẽ không cho phép em từ bỏ mục tiêu ${goalName} Hãy tiếp tục cố gắng nhé! 💪🎯`,
  );
};
document.addEventListener("DOMContentLoaded", function () {
  // Các xử lý sự kiện form, render UI
});
// --- HÀM CẬP NHẬT 3 THẺ TỔNG QUAN ---
function updateSummaryCards() {
  let totalSaved = 0;
  let totalTarget = 0;
  let totalMonthly = 0;

  goals.forEach((g) => {
    totalSaved += g.currentSaved;
    totalTarget += g.targetAmount;
    totalMonthly += g.monthlyAmount;
  });

  document.getElementById("totalSavedText").innerText =
    totalSaved.toLocaleString("vi-VN") + " đ";
  document.getElementById("totalTargetText").innerText =
    totalTarget.toLocaleString("vi-VN") + " đ";
  document.getElementById("totalMonthlyText").innerText =
    totalMonthly.toLocaleString("vi-VN") + " đ";
}
// Biến lưu trữ đối tượng Chart
let savingsChart = null;

// --- HÀM KHỞI TẠO BIỂU ĐỒ ---
function initChart() {
  const canvas = document.getElementById("savingsChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Nếu biểu đồ đã tồn tại thì hủy (destroy) để vẽ lại dữ liệu mới
  if (savingsChart) {
    savingsChart.destroy();
  }

  // Lấy dữ liệu từ mảng goals thực tế
  const labels = goals.map((g) => g.goalName);
  const targetData = goals.map((g) => g.targetAmount);
  const savedData = goals.map((g) => g.currentSaved);

  savingsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Mục tiêu (VNĐ)",
          data: targetData,
          backgroundColor: "#e5e7eb", // Màu xám nhạt cho mục tiêu
          borderRadius: 6,
        },
        {
          label: "Thực tế đã nạp (VNĐ)",
          data: savedData,
          backgroundColor: "#2563eb", // Màu xanh biển cho số tiền đã tích lũy
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// --- HÀM KIỂM TRA VÀ HIỂN THỊ THÔNG BÁO CUỐI THÁNG ---
function checkMonthlyReminder() {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Xác định ngày cuối tháng (ví dụ từ ngày 25 trở đi)
  const isEndOfMonth = currentDay >= 25;

  if (isEndOfMonth) {
    // Kiểm tra xem trong tháng này đã có tiền nạp chưa
    const currentMonthKey = `${currentMonth < 10 ? "0" + currentMonth : currentMonth}/${currentYear}`;
    const hasDepositedThisMonth = depositHistory.some(
      (item) => item.monthYear === currentMonthKey && item.amount > 0,
    );

    if (!hasDepositedThisMonth) {
      const alertBox = document.getElementById("monthlyAlert");
      if (alertBox) alertBox.style.display = "flex";
    }
  }
}
// --- HÀM NẠP TIỀN / CẬP NHẬT TÍCH LŨY ---
window.depositMoney = function (id) {
  // Tìm mục tiêu theo ID
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  // Cho người dùng nhập số tiền muốn nạp thêm
  const amountInput = prompt(
    `Nạp tiền cho mục tiêu "${goal.goalName}":\nNhập số tiền bạn muốn thêm vào (VNĐ):`,
    "100000",
  );

  if (amountInput === null) return; // Người dùng bấm Hủy (Cancel)

  const addAmount = parseFloat(amountInput);

  if (isNaN(addAmount) || addAmount <= 0) {
    alert("Số tiền nhập vào không hợp lệ!");
    return;
  }

  // Cộng dồn vào số tiền đã tích lũy
  goal.currentSaved += addAmount;
  saveDataToStorage();
  // Giới hạn không cho tích lũy vượt quá mục tiêu (nếu muốn)
  if (goal.currentSaved >= goal.targetAmount) {
    alert(`🎉 Chúc mừng! Bạn đã hoàn thành mục tiêu "${goal.goalName}"!`);
  }
  if (savingsChart) {
    savingsChart.destroy(); // Xóa biểu đồ cũ
    initChart(); // Vẽ lại biểu đồ mới với số liệu vừa cộng
  }

  // Cập nhật lại màn hình và các thẻ thống kê
  renderGoalsList();
  updateSummaryCards();
  initChart();
};
document.addEventListener("DOMContentLoaded", function () {
  const goalForm = document.getElementById("goalForm");
  const targetAmountInput = document.getElementById("targetAmount");
  const targetDateInput = document.getElementById("targetDate");
  const frequencySelect = document.getElementById("frequency");

  const calcResult = document.getElementById("calcResult");
  const suggestedAmount = document.getElementById("suggestedAmount");
  const freqText = document.getElementById("freqText");

  let calculatedMonthly = 0;

  // --- HÀM TÍNH TOÁN GỢI Ý ĐÓNG GÓP TỰ ĐỘNG ---
  function calculateContribution() {
    const target = parseFloat(targetAmountInput.value) || 0;
    const dateVal = targetDateInput.value;
    const freq = frequencySelect.value;

    if (target > 0 && dateVal) {
      const today = new Date();
      const targetDate = new Date(dateVal);

      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        calcResult.style.display = "none";
        return;
      }

      let periods = 1;
      if (freq === "monthly") {
        periods = Math.max(1, Math.round(diffDays / 30));
        freqText.innerText = "tháng";
      } else {
        periods = Math.max(1, Math.round(diffDays / 7));
        freqText.innerText = "tuần";
      }

      calculatedMonthly = Math.round(target / periods);
      suggestedAmount.innerText =
        calculatedMonthly.toLocaleString("vi-VN") + " đ";
      calcResult.style.display = "block";
    } else {
      calcResult.style.display = "none";
    }
  }

  targetAmountInput.addEventListener("input", calculateContribution);
  targetDateInput.addEventListener("change", calculateContribution);
  frequencySelect.addEventListener("change", calculateContribution);

  // --- LẮNG NGHE SỰ KIỆN TẠO MỤC TIÊU ---
  goalForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("goalName").value;
    const target = parseFloat(targetAmountInput.value) || 0;
    const targetDate = targetDateInput.value;
    const freq = frequencySelect.value;

    if (!name || target <= 0 || !targetDate) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const newGoal = {
      id: Date.now(),
      goalName: name,
      targetAmount: target,
      currentSaved: 0, // Mới tạo chưa nạp tiền
      targetDate: targetDate,
      frequency: freq,
      monthlyAmount: calculatedMonthly || target,
    };

    goals.push(newGoal);
    saveDataToStorage();
    renderGoalsList();
    updateSummaryCards();

    goalForm.reset();
    calcResult.style.display = "none";
    calculatedMonthly = 0;
  });
});
// Gọi các hàm khởi tạo khi trang tải xong
document.addEventListener("DOMContentLoaded", function () {
  renderGoalsList();
  updateSummaryCards();
  initChart();
  checkMonthlyReminder();
});
