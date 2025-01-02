function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    console.log("document.cookie", document.cookie);
    return cookieValue;
}

function submitForm() {
    const form = document.getElementById('postForm');
    const formData = new FormData(form);
    const imageFile = document.getElementById('image').files[0];
    const title = formData.get('title');
    const content = formData.get('content');

    if (!imageFile) {
        alert('Please upload an image');
        return;
    }

    const imageData = new FormData();
    imageData.append('image', imageFile);

    const token = getCookie('token'); // Get token from cookies
    console.log("token", token);
    // Upload image
    fetch('http://localhost:3000/images/upload', {
        method: 'POST',
        body: imageData
    })
        .then(response => response.json())
        .then(data => {
            if (data.url) {
                const imageUrl = data.url;

                // Submit the post form
                return fetch('http://localhost:3000/post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Send token in header
                    },
                    body: JSON.stringify({
                        title: title,
                        content: content,
                        imageUrl: imageUrl
                    })
                });
            } else {
                throw new Error(data.message || 'Image upload failed');
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('data', data);
            if (data.status) {
                alert('Post added successfully');
                window.location.href = '/post'; // Redirect to posts page
            } else {
                alert('Failed to add post: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}