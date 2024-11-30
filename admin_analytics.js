// Function to get the access token
function getAccessToken() {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc0MTQ4NGRlZDYyNmYxMTM3MjhmYmZhIiwidXNlcl90eXBlIjoiQURNSU4iLCJ0b2tlbl90eXBlIjoiYmVhcmVyIiwiaWF0IjoxNzMyOTIzMjIzLCJleHAiOjE3MzMwMDk2MjN9.swZj7hzvj1qR1pD5sKx_-fcEk9s67GFn58CWShmXocQ";
    // Alternatively, you can get the access token from localStorage:
    // return localStorage.getItem('accessToken');
  } 
  function renderBarChart(ctx, labels, data, label) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  function renderDoughnutChart(ctx, label, data) {
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [label, 'Remaining'],
        datasets: [{
          data: data,
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(211, 211, 211, 0.6)']
        }]
      },
      options: {
        responsive: true
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
      renderBarChart(document.getElementById('mostListedItemsChart'), labels, values, 'Count');
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
      renderBarChart(document.getElementById('mostInquiredItemsChart'), labels, values, 'Inquiries');
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
  