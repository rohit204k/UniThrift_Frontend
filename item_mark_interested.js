// Get the necessary DOM elements
// const markInterestedButton = document.getElementById('mark-interested-button');

// Handle the Mark as Interested button click event
markInterestedButton.addEventListener('click', async () => {
  const currentItemId = localStorage.getItem('currentItemId');
  const userComment = document.getElementById('user-comment').value; // Get user comment

  if (!currentItemId) {
    console.error('Current item ID not found in local storage.');
    return;
  }

  try {
    const apiUrl = 'http://18.117.164.164:4001/api/v1/queueing/mark_interested';
    const requestBody = {
      listing_id: currentItemId,
      comments: userComment || 'I am Interested' // Default comment if none provided
    };

    const response = await makeApiRequest(apiUrl, 'POST', requestBody, accessToken());

    if (response && response.status === 'SUCCESS') {
      // Change button color to green and disable it
      markInterestedButton.style.backgroundColor = 'green';
      markInterestedButton.disabled = true;
      markInterestedButton.innerText = 'Marked as Interested';
      alert(response.data.message); // Notify the user
    } else if (response && response.status === 'FAIL' && response.errorCode === 403) {
      // Handle 403 Forbidden error
      alert('User already added to the interested list.');
    } else {
      console.error('Unexpected response:', response);
      alert('An unexpected error occurred. Please try again later.');
    }
  } catch (error) {
    console.error('Error marking item as interested:', error);
    alert('Failed to mark item as interested. Please try again later.');
  }
});

// Function to make API requests (ensure this function is included or imported from item_utils.js)
async function makeApiRequest(url, method, data = null, accessToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`
  };

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null
  });

  if (!response.ok) {
    console.error('API request failed with status code:', response.status);
    throw new Error(`API request failed with status code ${response.status}`);
  }

  return await response.json();
}


// // // Handle the Mark as Interested button click event
// // markInterestedButton.addEventListener('click', async () => {
// //   const currentItemId = localStorage.getItem('currentItemId');
// //   const userComment = document.getElementById('user-comment').value; // Get user comment

// //   if (!currentItemId) {
// //     console.error('Current item ID not found in local storage.');
// //     return;
// //   }

// //   try {
// //     const apiUrl = 'http://18.117.164.164:4001/api/v1/queueing/mark_interested';
// //     const requestBody = {
// //       listing_id: currentItemId,
// //       comments: userComment || 'I am Interested' // Default comment if none provided
// //     };

// //     const response = await makeApiRequest(apiUrl, 'POST', requestBody, accessToken());

// //     if (response && response.status === 'SUCCESS') {
// //       // Change button color to green and disable it
// //       markInterestedButton.style.backgroundColor = 'green';
// //       markInterestedButton.disabled = true;
// //       markInterestedButton.innerText = 'Marked as Interested';
// //       alert(response.data.message); // Notify the user
// //     } else {
// //       console.error('Unexpected response:', response);
// //       alert('An unexpected error occurred. Please try again later.');
// //     }
// //   } catch (error) {
// //     console.error('Error marking item as interested:', error);
// //     alert('Failed to mark item as interested. Please try again later.');
// //   }
// // });

// // // Function to make API requests (ensure this function is included or imported from item_utils.js)
// // async function makeApiRequest(url, method, data = null, accessToken = null) {
// //   const headers = {
// //     'Content-Type': 'application/json',
// //     Authorization: `Bearer ${accessToken}`
// //   };

// //   const response = await fetch(url, {
// //     method,
// //     headers,
// //     body: data ? JSON.stringify(data) : null
// //   });

// //   if (!response.ok) {
// //     console.error('API request failed with status code:', response.status);
// //     throw new Error(`API request failed with status code ${response.status}`);
// //   }

// //   return await response.json();
// // }
