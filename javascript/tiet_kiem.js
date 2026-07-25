// 1. Mảng lưu trữ tất cả các mục tiêu và giao dịch
let goals = JSON.parse(localStorage.getItem("savings_goals")) || [];
let transactions =
  JSON.parse(localStorage.getItem("savings_transactions")) || [];

// HÀM LƯU DỮ LIỆU VÀO LOCALSTORAGE
function saveDataToStorage() {
  localStorage.setItem("savings_goals", JSON.stringify(goals));
  localStorage.setItem("savings_transactions", JSON.stringify(transactions));
}

// CÁC HÀM XỬ LÝ GIAO DIỆN & DROPDOWN

// --- HÀM ẨN/HIỆN DROPDOWN USER ---
window.toggleDropdown = function () {
  const dropdown = document.getElementById("myDropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
};

// Tự động đóng dropdown nếu người dùng click ra ngoài màn hình
window.onclick = function (event) {
  if (!event.target.closest(".user-dropdown")) {
    const dropdowns = document.getElementsByClassName("dropdown-menu");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

// --- HÀM RENDER DANH SÁCH MỤC TIÊU (ĐANG THỰC HIỆN & ĐÃ HOÀN THÀNH) ---
function renderGoalsList() {
  const activeContainer = document.getElementById("goalsList");
  const completedContainer = document.getElementById("completedGoalsList");

  if (activeContainer) activeContainer.innerHTML = "";
  if (completedContainer) completedContainer.innerHTML = "";

  // 1. Lọc danh sách theo status
  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  // 2. Render danh sách đang thực hiện
  if (activeGoals.length === 0 && activeContainer) {
    activeContainer.innerHTML = `<p style="color: #888; font-style: italic;">Chưa có mục tiêu nào đang thực hiện.</p>`;
  } else if (activeContainer) {
    activeGoals.forEach((goal) => {
      activeContainer.appendChild(createGoalCardHTML(goal, false));
    });
  }

  // 3. Render danh sách đã hoàn thành
  if (completedGoals.length === 0 && completedContainer) {
    completedContainer.innerHTML = `<p style="color: #888; font-style: italic;">Chưa có mục tiêu nào hoàn thành.</p>`;
  } else if (completedContainer) {
    completedGoals.forEach((goal) => {
      completedContainer.appendChild(createGoalCardHTML(goal, true));
    });
  }

  // Cập nhật lại biểu đồ
  initChart();
}

// --- HÀM TẠO THẺ CARD CHO MỤC TIÊU ---
function createGoalCardHTML(goal, isCompleted) {
  const card = document.createElement("div");
  card.className = "card goal-card";
  card.style.cssText =
    "background: #f1eef0; padding: 16px; border-radius: 12px; margin-bottom: 12px;";

  const percent = Math.min(
    100,
    Math.round((goal.currentSaved / goal.targetAmount) * 100),
  );

  const actionButtonHTML = isCompleted
    ? `<button class="btn-renew" onclick="reuseGoal(${goal.id})" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
        <i class="fa-solid fa-rotate-right"></i> Tái sử dụng
       </button>`
    : `<button class="btn-deposit" onclick="depositMoney(${goal.id})">
        <i class="fa-solid fa-plus-circle"></i> Nạp tiền
       </button>`;

  // Format lại ngày hiển thị DD/MM/YYYY
  let formattedDate = goal.targetDate;
  if (goal.targetDate && goal.targetDate.includes("-")) {
    const parts = goal.targetDate.split("-");
    formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  card.innerHTML = `
    <div class="goal-header" style="display: flex; justify-content: space-between; align-items: center;">
      <h4 style="margin: 0;">🎯 ${goal.goalName} ${isCompleted ? "🏆" : ""}</h4>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: bold; color: #bb6eff;">${percent}%</span>
        <button onclick="cancelGoal('${goal.goalName}')" style="background: none; border: none; font-size: 16px; cursor: pointer; color: #9ca3af;" title="Xóa mục tiêu">✖</button>
      </div>
    </div>
    <div style="margin: 10px 0; font-size: 14px;">
      <span>Tích lũy: <strong style="color: #2563eb;">${goal.currentSaved.toLocaleString("vi-VN")} đ</strong> / ${goal.targetAmount.toLocaleString("vi-VN")} đ</span>
    </div>
    <div class="progress-bar" style="background: #e9e5eb; border-radius: 10px; height: 10px; width: 100%; overflow: hidden; margin-bottom: 10px;">
      <div class="progress" style="width: ${percent}%; background: #bb6eff; height: 100%; transition: width 0.3s;"></div>
    </div>
    <div class="goal-footer" style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
      <span>Hạn: <strong>${formattedDate}</strong></span>
      ${actionButtonHTML}
    </div>
  `;

  return card;
}

// --- HÀM HỦY XÓA MỤC TIÊU ---
window.cancelGoal = function (goalName) {
  alert(
    `Vì tôi là một người nổi loạn nên tôi sẽ không cho phép em từ bỏ mục tiêu ${goalName}. Hãy tiếp tục cố gắng nhé! 💪🎯`,
  );
};

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

  const totalSavedEl = document.getElementById("totalSavedText");
  const totalTargetEl = document.getElementById("totalTargetText");
  const totalMonthlyEl = document.getElementById("totalMonthlyText");

  if (totalSavedEl)
    totalSavedEl.innerText = totalSaved.toLocaleString("vi-VN") + " đ";
  if (totalTargetEl)
    totalTargetEl.innerText = totalTarget.toLocaleString("vi-VN") + " đ";
  if (totalMonthlyEl)
    totalMonthlyEl.innerText = totalMonthly.toLocaleString("vi-VN") + " đ";
}

// --- HÀM KHỞI TẠO BIỂU ĐỒ ---
let savingsChart = null;
function initChart() {
  const canvas = document.getElementById("savingsChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (savingsChart) {
    savingsChart.destroy();
  }

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
          backgroundColor: "#e5e7eb",
          borderRadius: 6,
        },
        {
          label: "Thực tế đã nạp (VNĐ)",
          data: savedData,
          backgroundColor: "#2563eb",
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

  const isEndOfMonth = currentDay >= 25;
  const alertBox = document.getElementById("monthlyAlert");

  if (!alertBox) return;

  if (isEndOfMonth) {
    const currentMonthKey = `${currentMonth < 10 ? "0" + currentMonth : currentMonth}/${currentYear}`;

    const hasDepositedThisMonth = transactions.some(
      (item) => item.monthYear === currentMonthKey && item.amount > 0,
    );

    if (!hasDepositedThisMonth) {
      alertBox.style.display = "flex";
    } else {
      alertBox.style.display = "none";
    }
  } else {
    alertBox.style.display = "none";
  }
}

// --- HÀM RENDER LỊCH SỬ GIAO DỊCH ---
function renderTransactionHistory() {
  const historyContainer = document.getElementById("transactionHistoryList");
  if (!historyContainer) return;

  historyContainer.innerHTML = "";

  if (transactions.length === 0) {
    historyContainer.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; padding: 15px; color: #888; font-style: italic;">
          Chưa có giao dịch nạp tiền nào.
        </td>
      </tr>`;
    return;
  }

  // Sắp xếp giao dịch mới nhất lên đầu
  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach((item) => {
    // Tìm tên mục tiêu tương ứng dựa vào goalId
    const parentGoal = goals.find((g) => g.id === item.goalId);
    const goalName = parentGoal ? parentGoal.goalName : "Mục tiêu đã xóa";

    // Format ngày giờ
    const dateObj = new Date(item.date);
    const formattedDateTime = dateObj.toLocaleString("vi-VN");

    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #f3f4f6";
    row.innerHTML = `
      <td style="padding: 10px; font-weight: 500;">🎯 ${goalName}</td>
      <td style="padding: 10px; color: #10b981; font-weight: bold;">+${item.amount.toLocaleString("vi-VN")} đ</td>
      <td style="padding: 10px; color: #6b7280;">${formattedDateTime}</td>
    `;
    historyContainer.appendChild(row);
  });
}

// --- HÀM NẠP TIỀN ---
window.depositMoney = function (id) {
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  const amountInput = prompt(
    `Nạp tiền cho mục tiêu "${goal.goalName}":\nNhập số tiền bạn muốn thêm vào (VNĐ):`,
    "100000",
  );

  if (amountInput === null) return;

  const addAmount = parseFloat(amountInput);

  if (isNaN(addAmount) || addAmount <= 0) {
    alert("Số tiền nhập vào không hợp lệ!");
    return;
  }

  // 1. Cộng tiền
  goal.currentSaved += addAmount;

  // 2. Tự động chuyển sang completed nếu đạt hoặc vượt mục tiêu
  if (goal.currentSaved >= goal.targetAmount) {
    goal.status = "completed";
    alert(
      `🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc mục tiêu "${goal.goalName}"!`,
    );
  }

  // 3. Ghi nhận giao dịch
  const today = new Date();
  const month = today.getMonth() + 1;
  const currentMonthKey = `${month < 10 ? "0" + month : month}/${today.getFullYear()}`;

  transactions.push({
    goalId: id,
    amount: addAmount,
    date: today.toISOString(),
    monthYear: currentMonthKey,
  });

  // 4. Lưu và cập nhật lại giao diện
  saveDataToStorage();
  renderGoalsList();
  updateSummaryCards();
  checkMonthlyReminder();
  renderTransactionHistory();
};

// --- HÀM TÁI SỬ DỤNG MỤC TIÊU ---
window.reuseGoal = function (id) {
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  const goalNameInput = document.getElementById("goalName");
  const targetAmountInput = document.getElementById("targetAmount");
  const targetDateInput = document.getElementById("targetDate");

  if (goalNameInput) goalNameInput.value = goal.goalName;
  if (targetAmountInput) targetAmountInput.value = goal.targetAmount;

  if (targetDateInput) {
    targetDateInput.value = "";
    targetDateInput.focus();
  }

  const formCard =
    document.querySelector(".form-card") || document.getElementById("goalForm");
  if (formCard) {
    formCard.scrollIntoView({ behavior: "smooth" });
  }
};

// KHỞI TẠO ỨNG DỤNG VÀ SỰ KIỆN FORM

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
    if (!targetAmountInput || !targetDateInput || !frequencySelect) return;

    const target = parseFloat(targetAmountInput.value) || 0;
    const dateVal = targetDateInput.value;
    const freq = frequencySelect.value;

    if (target > 0 && dateVal) {
      const today = new Date();
      const targetDate = new Date(dateVal);

      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        if (calcResult) calcResult.style.display = "none";
        return;
      }

      let periods = 1;
      if (freq === "monthly") {
        periods = Math.max(1, Math.round(diffDays / 30));
        if (freqText) freqText.innerText = "tháng";
      } else {
        periods = Math.max(1, Math.round(diffDays / 7));
        if (freqText) freqText.innerText = "tuần";
      }

      calculatedMonthly = Math.round(target / periods);
      if (suggestedAmount) {
        suggestedAmount.innerText =
          calculatedMonthly.toLocaleString("vi-VN") + " đ";
      }
      if (calcResult) calcResult.style.display = "block";
    } else {
      if (calcResult) calcResult.style.display = "none";
    }
  }

  if (targetAmountInput)
    targetAmountInput.addEventListener("input", calculateContribution);
  if (targetDateInput)
    targetDateInput.addEventListener("change", calculateContribution);
  if (frequencySelect)
    frequencySelect.addEventListener("change", calculateContribution);

  // --- LẮNG NGHE SỰ KIỆN TẠO MỤC TIÊU ---
  if (goalForm) {
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
        currentSaved: 0,
        targetDate: targetDate,
        frequency: freq,
        monthlyAmount: calculatedMonthly || target,
        status: "active",
      };

      goals.push(newGoal);
      saveDataToStorage();
      renderGoalsList();
      updateSummaryCards();

      goalForm.reset();
      if (calcResult) calcResult.style.display = "none";
      calculatedMonthly = 0;
    });
  }

  // Khởi tạo trạng thái ban đầu khi load trang
  saveDataToStorage();
  renderGoalsList();
  updateSummaryCards();
  checkMonthlyReminder();
  renderTransactionHistory();
});
