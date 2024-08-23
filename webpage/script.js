
document.addEventListener('DOMContentLoaded', () => {
    const movieDetailsContainer = document.querySelector('.best-movie .details');
    const categorySelects = document.querySelectorAll('.other-category select');
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
                const bestMovie = data.results.reduce((max, movie) =>
                    movie.imdb_score > max.imdb_score ? movie : max
                );

                console.log('API Response Data:', data);
                console.log('Best Movie:', bestMovie);

                // Generate the movie details HTML content
                const movieHtml = `
                    <div class="movie-content">
                        <img src="${bestMovie.image_url}" alt="${bestMovie.title}" class="best-movie-poster">
                        <div class="movie-details">
                            <p class="movie-title"><strong>${bestMovie.title}</strong></p>
                            <p class="movie-description">${bestMovie.description || 'No description available.'}</p>
                            <p class="movie-score">IMDb Score: ${bestMovie.imdb_score}</p>
                            <button id="details-button" data-url="${bestMovie.url}">Details</button>
                        </div>
                    </div>
                `;
                movieDetailsContainer.innerHTML = movieHtml;

                // Add event listener to the "Details" button to open the popup
                document.getElementById('details-button').addEventListener('click', () => {
                    const movieDetailUrl = bestMovie.url; // Use the URL to fetch detailed data
                    fetchMovieDetail(movieDetailUrl);
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

// Function to fetch detailed movie information
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

// Function to create the content displayed in the modal
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
