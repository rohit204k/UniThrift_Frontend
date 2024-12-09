// Function to get the access token
// function getAccessToken() {
//     return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjc0MTQ4NGRlZDYyNmYxMTM3MjhmYmZhIiwidXNlcl90eXBlIjoiQURNSU4iLCJ0b2tlbl90eXBlIjoiYmVhcmVyIiwiaWF0IjoxNzMyOTIzMjIzLCJleHAiOjE3MzMwMDk2MjN9.swZj7hzvj1qR1pD5sKx_-fcEk9s67GFn58CWShmXocQ";
// }
const getAccessToken = () => localStorage.getItem('accessToken');
// API URL
const apiUrl = 'http://18.117.164.164:4001/api/v1/student/get_all_students';

// Function to fetch and display students
function fetchStudents() {
    fetch(apiUrl, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const students = data.data.data; // Adjust path as per API response
        const tableBody = document.querySelector('#student-table tbody');
        tableBody.innerHTML = ''; // Clear existing content

        students.forEach(student => {
            const row = document.createElement('tr');

            // First Name
            const firstNameCell = document.createElement('td');
            firstNameCell.textContent = student.first_name || 'N/A';
            row.appendChild(firstNameCell);

            // Last Name
            const lastNameCell = document.createElement('td');
            lastNameCell.textContent = student.last_name || 'N/A';
            row.appendChild(lastNameCell);

            // Email
            const emailCell = document.createElement('td');
            emailCell.textContent = student.email || 'N/A';
            row.appendChild(emailCell);

            // University ID
            const universityIdCell = document.createElement('td');
            universityIdCell.textContent = student.university_id || 'N/A';
            row.appendChild(universityIdCell);

            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching students:', error);
    });
}
function logout() {
    // Clear all items from local storage
    localStorage.clear();

    // Redirect to index.html
    window.location.href = '../HTML/index.html';
}

// Event listener for the logout link
document.getElementById('logout-link').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default link behavior
    logout(); // Call the logout function
});
document.getElementById('profileid').addEventListener('click', () => {
    const dropdown = document.querySelector('.dropdown');
    dropdown.classList.toggle('show'); // Toggle the dropdown visibility
  });
  
// Fetch and display students when the page loads
fetchStudents();