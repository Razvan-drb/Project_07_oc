import { genres } from './genres.js'; // Ensure genres is exported correctly from genres.js

const movieDetailsContainer = document.querySelector('.best-movie .details');
const moviesApiUrl = 'http://localhost:8000/api/v1/titles/';

async function fetchMovieDetails() {
    let bestMovie = null;
    let nextUrl = moviesApiUrl;

    try {
        while (nextUrl) {
            const response = await fetch(nextUrl);
            const data = await response.json();
            console.log('Fetched movies data:', data);

            if (data && data.results) {
                // Update the best movie progressively
                bestMovie = updateBestMovie(bestMovie, data.results);

                nextUrl = data.next; // Move to the next page if available
            } else {
                console.error('No movies data available.');
                movieDetailsContainer.innerHTML = '<p>No movies data available.</p>';
                return;
            }
        }

        // Final display after all pages have been fetched
        displayBestMovie(bestMovie);

    } catch (error) {
        console.error('Error fetching movies:', error);
        movieDetailsContainer.innerHTML = '<p>Error loading movie details.</p>';
    }
}

function updateBestMovie(currentBest, movies) {
    let newBest = currentBest;
    movies.forEach(movie => {
        if (!newBest || parseFloat(movie.imdb_score) > parseFloat(newBest.imdb_score)) {
            newBest = movie;
            displayBestMovie(newBest); // Update UI whenever a new best movie is found
        }
    });
    return newBest;
}

function displayBestMovie(movie) {
    if (!movie) return;

    const movieDescription = movie.description || movie.long_description || 'No description available.';
    const movieHtml = `
        <div class="movie-content">
            <img src="${movie.image_url}" alt="${movie.title}" class="best-movie-poster">
            <div class="movie-details">
                <p class="movie-title"><strong>${movie.title}</strong></p>
                <p class="movie-description">${movieDescription}</p>
                <p class="movie-score">IMDb Score: ${movie.imdb_score}</p>
                <button id="details-button" data-url="${movie.url}">Details</button>
            </div>
        </div>
    `;
    movieDetailsContainer.innerHTML = movieHtml;

    document.getElementById('details-button').addEventListener('click', () => {
        fetchMovieDetail(movie.url);
    });
}

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

function fetchMoviesByGenre(genreId, container) {
    if (!genreId) {
        container.innerHTML = '<p>Please select a genre.</p>';
        return;
    }

    const selectedGenre = genres.find(genre => genre.id === parseInt(genreId));
    const genreName = selectedGenre ? selectedGenre.name : null;

    if (!genreName) {
        console.error('Genre name not found for ID:', genreId);
        container.innerHTML = '<p>Error: Genre not found.</p>';
        return;
    }

    const apiUrl = `${moviesApiUrl}?genre=${encodeURIComponent(genreName)}&page_size=6`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.results) {
                container.innerHTML = ''; // Clear existing content
                data.results.forEach(movie => {
                    const movieElement = document.createElement('div');
                    movieElement.classList.add('movie');
                    movieElement.innerHTML = `
                        <img src="${movie.image_url}" alt="${movie.title}">
                        <p>${movie.title}</p>
                    `;
                    container.appendChild(movieElement);
                });
            } else {
                container.innerHTML = '<p>No movies available for this genre.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching movies:', error.message);
            container.innerHTML = '<p>Error loading movies.</p>';
        });
}

// Export functions
export { fetchMovieDetails, fetchMoviesByGenre };
