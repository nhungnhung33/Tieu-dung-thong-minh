// spending-chart.js

let spendingChartInstance = null;



/**

 * Khởi tạo biểu đồ đường Thu/Chi

 * @param {string} canvasId

 * @param {Array} transactions - Mảng các giao dịch từ hệ thống

 */

function initSpendingChart(canvasId, transactions = []) {

  const ctx = document.getElementById(canvasId).getContext('2d');

  const labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];



  const { incomeData, expenseData } = processMonthlyData(transactions);



  spendingChartInstance = new Chart(ctx, {

    type: 'line',

    data: {

      labels: labels,

      datasets: [

        {

          label: 'Thu nhập',

          data: incomeData, // Tính bằng triệu VND

          borderColor: '#10B981',

          backgroundColor: 'rgba(16, 185, 129, 0.1)',

          tension: 0.4,

          pointRadius: 3,

          pointHoverRadius: 6,

          fill: true

        },

        {

          label: 'Chi tiêu',

          data: expenseData, // Tính bằng triệu VND

          borderColor: '#EF4444',

          backgroundColor: 'rgba(239, 68, 68, 0.1)',

          tension: 0.4,

          pointRadius: 3,

          pointHoverRadius: 6,

          fill: true

        }

      ]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {

          position: 'top',

          align: 'start',

          labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8 }

        },

        tooltip: {

          backgroundColor: '#FFFFFF',

          titleColor: '#1F2937',

          bodyColor: '#1F2937',

          borderColor: '#E5E7EB',

          borderWidth: 1,

          padding: 12,

          callbacks: {

            label: function(context) {

              let val = context.parsed.y * 1000000;

              return `${context.dataset.label}: ${val.toLocaleString('vi-VN')} đ`;

            }

          }

        }

      },

      scales: {

        y: {

          beginAtZero: true,

          ticks: { callback: (value) => value + 'M' },

          grid: { color: '#F3F4F6' }

        },

        x: { grid: { display: false } }

      }

    }

  });

}



/**

 * Xử lý tính tổng Thu/Chi theo từng tháng từ danh sách giao dịch

 */

function processMonthlyData(transactions) {

  const income = Array(12).fill(0);

  const expense = Array(12).fill(0);



  transactions.forEach(t => {

    if (!t.date || !t.amount) return;

    const month = new Date(t.date).getMonth(); // 0 -> 11

    const amountInMillions = parseFloat(t.amount) / 1000000;



    if (t.type === 'Thu') {

      income[month] += amountInMillions;

    } else if (t.type === 'Chi') {

      expense[month] += amountInMillions;

    }

  });



  return { incomeData: income, expenseData: expense };

}



/**

 * Gọi hàm này khi người dùng thêm/xóa/sửa giao dịch

 */

function updateSpendingChart(transactions) {

  if (!spendingChartInstance) return;

  const { incomeData, expenseData } = processMonthlyData(transactions);

  spendingChartInstance.data.datasets[0].data = incomeData;

  spendingChartInstance.data.datasets[1].data = expenseData;

  spendingChartInstance.update();

}