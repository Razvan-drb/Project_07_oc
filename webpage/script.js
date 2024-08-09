document.addEventListener('DOMContentLoaded', () => {
    const movieDetailsContainer = document.querySelector('.best-movie .details');
    const categorySelect = document.querySelectorAll('.other-category select');
    const placeholderTexts = document.querySelectorAll('.placeholder');

    // Replace these URLs with your actual API endpoints
    const moviesApiUrl = 'http://localhost:8000/api/v1/titles/';
    const genresApiUrl = 'http://localhost:8000/api/v1/genres/';

    // Function to fetch movie details and update HTML
    function fetchMovieDetails() {
        fetch(moviesApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.results && data.results.length > 0) {
                    const movie = data.results[0]; // Assuming we want the first movie
                    const movieHtml = `
                        <p>${movie.title || 'No title available'}</p>
                        <p>${movie.description || 'No description available'}</p>
                        <button onclick="watchNow('${movie.videoUrl || '#'}')">Watch Now</button>
                    `;
                    movieDetailsContainer.innerHTML = movieHtml;
                } else {
                    movieDetailsContainer.innerHTML = '<p>No movie details available.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching movie details:', error);
                movieDetailsContainer.innerHTML = '<p>Error loading movie details.</p>';
            });
    }

    // Function to fetch genres and update HTML
    function fetchGenres() {
        fetch(genresApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.results) {
                    const genres = data.results;
                    categorySelect.forEach(select => {
                        select.innerHTML = '<option>Select a genre</option>'; // Add default option
                        genres.forEach(genre => {
                            const option = document.createElement('option');
                            option.value = genre.id;
                            option.textContent = genre.name;
                            select.appendChild(option);
                        });
                    });
                    placeholderTexts.forEach(placeholder => {
                        placeholder.textContent = 'Select a genre from the dropdown';
                    });
                } else {
                    placeholderTexts.forEach(placeholder => {
                        placeholder.textContent = 'No genres available.';
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching genres:', error.message);
                placeholderTexts.forEach(placeholder => {
                    placeholder.textContent = 'Error loading genres.';
                });
            });
    }

    // Fetch movie details and genres on page load
    fetchMovieDetails();
    fetchGenres();
});

// Function to handle "Watch Now" button click
function watchNow(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    } else {
        alert('No video URL available.');
    }
}
