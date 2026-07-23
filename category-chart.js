// category-chart.js
let categoryChartInstance = null;

// Khai báo bảng màu cho cả danh mục Thu và Chi
const CATEGORY_COLORS = {
  // Danh mục Chi
  'Ăn uống': '#F87171',
  'Đi lại': '#FBBF24',
  'Mua sắm': '#818CF8',
  'Hóa đơn': '#38BDF8',
  'Giải trí': '#F43F5E',
  // Danh mục Thu
  'Lương': '#10B981',
  'Thưởng': '#34D399',
  'Thu nhập khác': '#059669',
  // Mặc định
  'Khác': '#9CA3AF'
};

/**
 * Khởi tạo biểu đồ tròn phân bổ danh mục (Thu & Chi)
 */
function initCategoryChart(canvasId, transactions = []) {
  const canvasEl = document.getElementById(canvasId);
  if (!canvasEl) return;

  const ctx = canvasEl.getContext('2d');
  const categoryData = processCategoryData(transactions);

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const isEmpty = categoryData.totalAmount === 0;
  const chartLabels = isEmpty ? ['Chưa có dữ liệu'] : categoryData.labels;
  const chartAmounts = isEmpty ? [1] : categoryData.amounts;
  const chartColors = isEmpty ? ['#E5E7EB'] : categoryData.colors;

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartAmounts,
        backgroundColor: chartColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        cutout: '70%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: !isEmpty,
          callbacks: {
            label: (context) => ` ${context.label}: ${Number(context.raw).toLocaleString('vi-VN')} đ`
          }
        }
      }
    }
  });

  renderCategoryLegendUI(categoryData);
}

/**
 * Lọc và tính tổng tiền theo danh mục cho CẢ THU VÀ CHI
 */
function processCategoryData(transactions) {
  const categoriesMap = {};
  let totalAmount = 0;
  let hasIncome = false;
  let hasExpense = false;

  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (amt > 0) {
      const cat = t.category || 'Khác';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + amt;
      totalAmount += amt;

      if (t.type === 'Thu') hasIncome = true;
      if (t.type === 'Chi') hasExpense = true;
    }
  });

  // Tự động xác định nhãn hiển thị ở tâm biểu đồ
  let subText = 'Tổng giao dịch';
  if (hasIncome && !hasExpense) {
    subText = 'Tổng thu nhập';
  } else if (!hasIncome && hasExpense) {
    subText = 'Tổng chi tiêu';
  }

  const labels = Object.keys(categoriesMap);
  const amounts = Object.values(categoriesMap);
  const colors = labels.map(cat => CATEGORY_COLORS[cat] || '#9CA3AF');

  const breakdown = labels.map(cat => {
    const amt = categoriesMap[cat];
    const percent = totalAmount > 0 ? Math.round((amt / totalAmount) * 100) : 0;
    return { name: cat, amount: amt, percent };
  });

  return { labels, amounts, colors, totalAmount, breakdown, subText };
}

/**
 * Cập nhật giao diện con số và danh sách danh mục bên dưới
 */
function renderCategoryLegendUI(categoryData) {
  // 1. Cập nhật số tiền và nhãn ở tâm vòng tròn
  const totalTextEl = document.getElementById('totalCategoryExpenseText');
  const subTextEl = document.getElementById('totalCategorySubText');

  if (totalTextEl) {
    totalTextEl.innerText = `${categoryData.totalAmount.toLocaleString('vi-VN')} đ`;
  }
  if (subTextEl) {
    subTextEl.innerText = categoryData.subText;
  }

  // 2. Cập nhật danh sách các danh mục phát sinh
  const legendListEl = document.getElementById('categoryLegendList');
  if (legendListEl) {
    if (categoryData.totalAmount === 0 || categoryData.breakdown.length === 0) {
      legendListEl.innerHTML = `
        <div class="text-center text-gray-400 py-6 text-sm">
          Chưa có giao dịch (Thu/Chi)
        </div>`;
    } else {
      legendListEl.innerHTML = categoryData.breakdown.map(item => `
        <div class="flex justify-between items-center py-1">
          <span class="text-gray-600">${item.name}</span>
          <span class="font-medium text-gray-800">${item.amount.toLocaleString('vi-VN')} đ (${item.percent}%)</span>
        </div>
      `).join('');
    }
  }
}

/**
 * Cập nhật biểu đồ khi thêm/xóa/sửa giao dịch
 */
function updateCategoryChart(transactions) {
  if (!categoryChartInstance) return;

  const categoryData = processCategoryData(transactions);
  const isEmpty = categoryData.totalAmount === 0;

  categoryChartInstance.data.labels = isEmpty ? ['Chưa có dữ liệu'] : categoryData.labels;
  categoryChartInstance.data.datasets[0].data = isEmpty ? [1] : categoryData.amounts;
  categoryChartInstance.data.datasets[0].backgroundColor = isEmpty ? ['#E5E7EB'] : categoryData.colors;
  categoryChartInstance.options.plugins.tooltip.enabled = !isEmpty;

  categoryChartInstance.update();
  renderCategoryLegendUI(categoryData);
}