// Get the necessary DOM elements
const markInterestedButton = document.getElementById('mark-interested-button');
const commentInput = document.getElementById('user-comment');

// Function to mark an item as interested
async function markItemAsInterested() {
  const itemId = localStorage.getItem('currentItemId');
  const userComment = commentInput.value;

  if (!itemId) {
    console.error('Item ID not found.');
    alert('Failed to mark as interested. Item ID is missing.');
    return;
  }

  const apiUrl = 'http://18.117.164.164:4001/api/v1/queueing/mark_interested';
  const requestBody = {
    listing_id: itemId,
    comments: userComment || '' // Optional comment
  };

  try {
    const response = await makeApiRequest(apiUrl, 'POST', requestBody, accessToken());

    if (response && response.status === 'SUCCESS') {
      console.log('Marked as interested successfully:', response);
      alert('Item marked as interested!');
      // Change button color to green
      markInterestedButton.style.backgroundColor = 'green';
      markInterestedButton.textContent = 'Interested';
      markInterestedButton.disabled = true; // Disable the button to prevent multiple clicks
    } else {
      console.error('Failed to mark as interested:', response);
      alert('Failed to mark as interested. Please try again.');
    }
  } catch (error) {
    console.error('Error marking item as interested:', error);
    alert('An error occurred. Please try again later.');
  }
}

// Attach click event to the button
if (markInterestedButton) {
  markInterestedButton.addEventListener('click', markItemAsInterested);
} else {
  console.warn('Mark Interested button not found.');
}
