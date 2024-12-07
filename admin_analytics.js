function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function renderPieChart(ctx, labels, data, title) {
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: data,
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title
        }
      }
    }
  });
}
function renderTimeSeriesChart(ctx, labels, data, title) {
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month-Year'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Revenue ($)'
          },
          beginAtZero: true
        }
      }
    }
  });
}

function getMostListedItems() {
  fetch('http://18.117.164.164:4001/api/v1/admin/most_listed_items', {
    headers: { 'Authorization': `Bearer ${getAccessToken()}` }
  })
  .then(response => response.json())
  .then(data => {
    const labels = data.data.map(item => item.item_name);
    const values = data.data.map(item => item.count);
    renderPieChart(document.getElementById('mostListedItemsChart'), labels, values, 'Most Listed Items');
  })
  .catch(error => console.error(error));
}

function getMostInquiredItems() {
  fetch('http://18.117.164.164:4001/api/v1/admin/most_inquired_items', {
    headers: { 'Authorization': `Bearer ${getAccessToken()}` }
  })
  .then(response => response.json())
  .then(data => {
    const labels = data.data.map(item => item._id);
    const values = data.data.map(item => item.count);
    renderPieChart(document.getElementById('mostInquiredItemsChart'), labels, values, 'Most Inquired Items');
  })
  .catch(error => console.error(error));
}

function getTotalRevenue() {
  fetch('http://18.117.164.164:4001/api/v1/admin/total_revenue', {
    headers: { 'Authorization': `Bearer ${getAccessToken()}` }
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === "SUCCESS" && data.data.length > 0) {
      const totalRevenue = data.data.reduce((sum, item) => sum + item.revenue, 0);
      console.log(totalRevenue)
      document.getElementById('total-revenue').textContent = `Total Revenue: $${totalRevenue}`;
    } else {
      document.getElementById('total-revenue').textContent = "No revenue data available.";
    }
  })
  .catch(error => {
    console.error(error);
    document.getElementById('total-revenue').textContent = "Error fetching revenue data.";
  });
}
function renderRevenueTimeSeries() {
  fetch('http://18.117.164.164:4001/api/v1/admin/total_revenue', {
    headers: { 'Authorization': `Bearer ${getAccessToken()}` }
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === "SUCCESS" && data.data.length > 0) {
      const timeSeriesData = data.data; // Response data containing year, month, and revenue

      // Create labels in 'Month-Year' format
      const labels = timeSeriesData.map(item => `${item.month}-${item.year}`);
      
      // Extract revenue data
      const revenueData = timeSeriesData.map(item => item.revenue);

      // Render the time-series chart
      renderTimeSeriesChart(document.getElementById('revenueTimeSeriesChart'), labels, revenueData, 'Revenue Over Time');
    } else {
      console.error('No revenue time series data available.');
      document.getElementById('revenueTimeSeriesChart').textContent = "No revenue time series data available.";
    }
  })
  .catch(error => {
    console.error(error);
    document.getElementById('revenueTimeSeriesChart').textContent = "Error fetching revenue time series data.";
  });
}
// Logout function
function logout() {
  // Clear all items from local storage
  localStorage.clear();

  // Redirect to index.html
  window.location.href = 'index.html';
}

// Event listener for the logout link
document.getElementById('logout-link').addEventListener('click', (event) => {
  event.preventDefault(); // Prevent the default link behavior
  logout(); // Call the logout function
});

getMostListedItems();
getMostInquiredItems();
getTotalRevenue();
renderRevenueTimeSeries();