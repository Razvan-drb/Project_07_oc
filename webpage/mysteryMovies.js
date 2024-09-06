const moviesApiUrl = 'http://localhost:8000/api/v1/titles/';
const mysteryCategoryContainerSelector = '.category .images';

// Function to fetch and display mystery movies
async function fetchMysteryMovies() {
    // Check if the container exists before proceeding
    const mysteryCategoryContainer = document.querySelector(mysteryCategoryContainerSelector);
    if (!mysteryCategoryContainer) {
        console.error('Mystery category container not found.');
        return;
    }

    try {
        const response = await fetch(`${moviesApiUrl}?genre=mystery&page_size=6`);
        const data = await response.json();

        if (data && data.results) {
            mysteryCategoryContainer.innerHTML = ''; // Clear existing content
            data.results.forEach(movie => {
                // Create a container for the movie
                const movieContainer = document.createElement('div');
                movieContainer.classList.add('movie-container');

                // Create the movie image
                const movieImage = document.createElement('img');
                movieImage.src = movie.image_url;
                movieImage.alt = movie.title;

                // Create the overlay with the movie title and details button
                const overlay = document.createElement('div');
                overlay.classList.add('overlay');

                // Add the movie title to the overlay
                const movieTitle = document.createElement('p');
                movieTitle.classList.add('movie-title');
                movieTitle.textContent = movie.title;

                // Create the details button
                const detailsButton = document.createElement('button');
                detailsButton.textContent = 'Details';
                detailsButton.classList.add('details-button');
                detailsButton.addEventListener('click', () => {
                    fetchMovieDetail(movie.url);
                });

                // Append the title and button to the overlay
                overlay.appendChild(movieTitle);
                overlay.appendChild(detailsButton);

                // Append the image and overlay to the movie container
                movieContainer.appendChild(movieImage);
                movieContainer.appendChild(overlay);

                // Append the movie container to the category container
                mysteryCategoryContainer.appendChild(movieContainer);
            });
        } else {
            mysteryCategoryContainer.innerHTML = '<p>No Mystery movies available.</p>';
        }
    } catch (error) {
        console.error('Error fetching Mystery movies:', error.message);
        mysteryCategoryContainer.innerHTML = '<p>Error loading Mystery movies.</p>';
    }
}

// Function to fetch movie details and display them in a popup
function fetchMovieDetail(movieDetailUrl) {
    fetch(movieDetailUrl)
        .then(response => response.json())
        .then(movie => {
            const popupHtml = getContent(movie);
            document.getElementById('popup-movie-details').innerHTML = popupHtml;
            document.getElementById('movie-popup').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching detailed movie information:', error);
            document.getElementById('popup-movie-details').innerHTML = '<p>Error loading movie details.</p>';
        });
}

// Helper function to generate HTML content for the movie details popup
function getContent(movie) {
    const title = movie.title;
    const year = movie.year;
    const genres = movie.genres ? movie.genres.join(', ') : 'N/A';
    const rating = movie.rated || 'N/A';
    const duration = movie.duration ? `${movie.duration} minutes` : 'Unknown duration';
    const imdbScore = movie.imdb_score ? `${movie.imdb_score}/10` : 'N/A';
    const directors = movie.directors ? movie.directors.join(', ') : 'N/A';
    const description = movie.long_description || movie.description || 'No description available.';
    const actors = movie.actors ? movie.actors.join(', ') : 'N/A';
    const imageUrl = movie.image_url;

    return `
        <div class="popup-content">
            <img src="${imageUrl}" alt="${title}" class="popup-movie-poster">
            <h2>${title}</h2>
            <p>${year} - ${genres}</p>
            <p>${rating} - ${duration}</p>
            <p>IMDB score: ${imdbScore}</p>
            <p><strong>Directed by:</strong><br>${directors}</p>
            <p>${description}</p>
            <p><strong>Starring:</strong><br>${actors}</p>
        </div>
    `;
}


export { fetchMysteryMovies };
