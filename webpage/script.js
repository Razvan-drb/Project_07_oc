
document.addEventListener('DOMContentLoaded', () => {
    const movieDetailsContainer = document.querySelector('.best-movie .details');
    const categorySelects = document.querySelectorAll('.other-category select'); // Fixed variable name
    const placeholderTexts = document.querySelectorAll('.placeholder');
    const mysteryCategoryContainer = document.querySelector('.category .images');

    const moviesApiUrl = 'http://localhost:8000/api/v1/titles/';
    const genresApiUrl = 'http://localhost:8000/api/v1/genres/';

   // Function to fetch movie details and update HTML
function fetchMovieDetails() {
    fetch(moviesApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.results && data.results.length > 0) {
                // Find the movie with the highest IMDb score
                const bestMovie = data.results.reduce((max, movie) =>
                    movie.imdb_score > max.imdb_score ? movie : max
                );

                // Log the movie details for debugging
                console.log('Best Movie *****************************:', bestMovie);

                // Correct the URL pattern to match Django's API pattern without a trailing slash
                const detailUrl = `http://localhost:8000/api/v1/titles/${bestMovie.id}`;

                // Log the constructed detail URL for debugging
                console.log('Constructed Detail URL:', detailUrl);

                // Construct the HTML for the best movie
                const movieHtml = `
                    <div class="movie-content">
                        <img src="${bestMovie.image_url}" alt="${bestMovie.title}" class="best-movie-poster">
                        <div class="movie-details">
                            <p class="movie-title"><strong>${bestMovie.title}</strong></p>
                            <p class="movie-description">${bestMovie.description || 'No description available.'}</p>
                            <p class="movie-score">IMDb Score: ${bestMovie.imdb_score}</p>
                            <button id="details-button">Details</button>
                        </div>
                    </div>
                `;
                movieDetailsContainer.innerHTML = movieHtml;

                // Add event listener to the "Details" button to show popup
                document.getElementById('details-button').addEventListener('click', () => {
                    // Simplified popup content
                    const popupHtml = `
                        <h2>${bestMovie.title} (${bestMovie.year})</h2>
                        <p><strong>Description:</strong> ${bestMovie.description || 'No description available.'}</p>
                        <p><strong>Plot:</strong> ${bestMovie.long_description || 'No plot available.'}</p>
                        <p><strong>IMDb Score:</strong> ${bestMovie.imdb_score}</p>
                        <p><strong>Votes:</strong> ${bestMovie.votes || 'N/A'}</p>
                        <p><strong>Directors:</strong> ${bestMovie.directors ? bestMovie.directors.join(', ') : 'N/A'}</p>
                        <p><strong>Writers:</strong> ${bestMovie.writers ? bestMovie.writers.join(', ') : 'N/A'}</p>
                        <p><strong>Actors:</strong> ${bestMovie.actors ? bestMovie.actors.join(', ') : 'N/A'}</p>
                        <p><strong>Genres:</strong> ${bestMovie.genres ? bestMovie.genres.join(', ') : 'N/A'}</p>
                        <p><strong>Languages:</strong> ${bestMovie.languages ? bestMovie.languages.join(', ') : 'N/A'}</p>
                        <p><strong>Country:</strong> ${bestMovie.countries ? bestMovie.countries.join(', ') : 'N/A'}</p>
                        <p><strong>Rating:</strong> ${bestMovie.rated || 'N/A'}</p>
                    `;
                    document.getElementById('popup-movie-details').innerHTML = popupHtml;
                    document.getElementById('movie-popup').style.display = 'block';
                });

            } else {
                movieDetailsContainer.innerHTML = '<p>No movie details available.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
            movieDetailsContainer.innerHTML = '<p>Error loading movie details.</p>';
        });
}

// Close popup when the close button is clicked
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('movie-popup').style.display = 'none';
});

// Close popup when clicking outside the popup content
window.addEventListener('click', (event) => {
    if (event.target == document.getElementById('movie-popup')) {
        document.getElementById('movie-popup').style.display = 'none';
    }
});






    // Global array to store all genres
    let genres = [];
    // Function to fetch all genres with pagination
function fetchGenres() {
    let allGenres = [];
    let nextUrl = genresApiUrl;

    function fetchPage(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched genres data:', data); // Debugging line
                if (data && data.results) {
                    allGenres = allGenres.concat(data.results);

                    if (data.next) {
                        fetchPage(data.next);
                    } else {
                        // Update the global genres array
                        genres = allGenres;
                        // Call a function to update the dropdowns or UI with genres
                        updateDropdowns(allGenres);
                    }
                } else {
                    console.error('No genres data available.');
                }
            })
            .catch(error => {
                console.error('Error fetching genres:', error.message);
            });
    }

    fetchPage(nextUrl);
}

// Function to update dropdowns with all genres
function updateDropdowns(genres) {
    console.log('Updating dropdowns with genres:', genres); // Debugging line

    categorySelects.forEach(select => {
        select.innerHTML = '<option value="">Select a genre</option>';
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id; // Ensure this is the correct genre ID
            option.textContent = genre.name;
            select.appendChild(option);
        });
    });
}


    // Function to fetch and display movies for a selected genre
function fetchMoviesByGenre(genreId, container) {
    if (!genreId) {
        container.innerHTML = '<p>Please select a genre.</p>';
        return;
    }

    // Find the genre name using the genreId
    const selectedGenre = genres.find(genre => genre.id === parseInt(genreId));
    const genreName = selectedGenre ? selectedGenre.name : null;

    if (!genreName) {
        console.error('Genre name not found for ID:', genreId);
        container.innerHTML = '<p>Error: Genre not found.</p>';
        return;
    }

    console.log('Selected Genre Name:', genreName);

    // Construct the API URL with the genre name
    const apiUrl = `${moviesApiUrl}?genre=${encodeURIComponent(genreName)}&page_size=6`;
    console.log('API URL for movies:', apiUrl); // Debugging line

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Movies data for genre:', data);

            if (data && data.results && data.results.length > 0) {
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


    // Function to fetch and display movies in the Mystery category
    function fetchMysteryMovies() {
        fetch(moviesApiUrl + '?genre=mystery&page_size=6')
            .then(response => response.json())
            .then(data => {
                if (data && data.results) {
                    mysteryCategoryContainer.innerHTML = ''; // Clear any existing content
                    data.results.forEach(movie => {
                        const movieImage = document.createElement('img');
                        movieImage.src = movie.image_url; // Assuming the API returns an image URL
                        movieImage.alt = movie.title;
                        mysteryCategoryContainer.appendChild(movieImage);
                    });
                } else {
                    mysteryCategoryContainer.innerHTML = '<p>No Mystery movies available.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching Mystery movies:', error.message);
                mysteryCategoryContainer.innerHTML = '<p>Error loading Mystery movies.</p>';
            });
    }

    // Event listener for genre selection
categorySelects.forEach((select, index) => {
    select.addEventListener('change', (event) => {
        const selectedGenreId = event.target.value;
        console.log('Genre selected:', selectedGenreId); // Debugging line
        const selectedCategoryContainer = document.querySelectorAll('.selected-category-movies')[index];
        fetchMoviesByGenre(selectedGenreId, selectedCategoryContainer);
    });
});


    // Fetch movie details, genres, and Mystery movies on page load
    fetchMovieDetails();
    fetchGenres();
    fetchMysteryMovies();
});

// Function to handle "Watch Now" button click
function watchNow(url) {
    if (url) {
        window.open(url, '_blank');
    } else {
        alert('No video URL available.');
    }
}
