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
      const totalPrice = data.data[0].total_price;
      document.getElementById('total-revenue').textContent = `Total Price: $${totalPrice}`;
    } else {
      document.getElementById('total-revenue').textContent = "No revenue data available.";
    }
  })
  .catch(error => {
    console.error(error);
    document.getElementById('total-revenue').textContent = "Error fetching revenue data.";
  });
}

getMostListedItems();
getMostInquiredItems();
getTotalRevenue();