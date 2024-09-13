document.addEventListener('DOMContentLoaded', () => {
    const movieDetailsContainer = document.querySelector('.best-movie .details');
    const categorySelects = document.querySelectorAll('.other-category select');
    const placeholderTexts = document.querySelectorAll('.placeholder');
    const mysteryCategoryContainer = document.querySelector('.category .images');
    const crimeCategoryContainer = document.querySelector('.category .crime-images');
    const warCategoryContainer = document.querySelector('.category .war-images');

    const moviesApiUrl = 'http://localhost:8000/api/v1/titles/';
    const genresApiUrl = 'http://localhost:8000/api/v1/genres/';
    let genres = [];


    // Fetch movie details and progressively display the best movie
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

    // Function to find the best movie progressively
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

    // Function to display the best movie in the UI
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

    // Fetch detailed movie information for the popup
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

    // Close popup functionality
    document.querySelector('.close-button').addEventListener('click', () => {
        document.getElementById('movie-popup').style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == document.getElementById('movie-popup')) {
            document.getElementById('movie-popup').style.display = 'none';
        }
    });

    // Generate content for the movie popup
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

    // Fetch all genres and update the dropdown
    function fetchGenres() {
        let allGenres = [];
        let nextUrl = genresApiUrl;

        function fetchPage(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data && data.results) {
                        allGenres = allGenres.concat(data.results);
                        if (data.next) {
                            fetchPage(data.next);
                        } else {
                            genres = allGenres; // Update global genres
                            updateDropdowns(allGenres); // Populate dropdowns with genres
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

    // Populate genre dropdowns
    function updateDropdowns(genres) {
        categorySelects.forEach(select => {
            select.innerHTML = '<option value="">Select a genre</option>';
            genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                select.appendChild(option);
            });
        });
    }

    // Fetch and display movies for a selected genre
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

    // Fetch and display Mystery movies
    function fetchMysteryMovies() {
        fetch(moviesApiUrl + '?genre=mystery&page_size=6')
            .then(response => response.json())
            .then(data => {
                if (data && data.results) {
                    mysteryCategoryContainer.innerHTML = ''; // Clear existing content
                    data.results.forEach(movie => {
                        const movieImage = document.createElement('img');
                        movieImage.src = movie.image_url;
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
    console.log('================================')
    function fetchCrimeMovies() {
    fetch(moviesApiUrl + '?genre=crime&page_size=4')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched Crime movies data:', data.results); // Log fetched data
            if (data && data.results) {
                crimeCategoryContainer.innerHTML = ''; // Clear existing content
                data.results.forEach(movie => {
                    const movieImage = document.createElement('img');
                    movieImage.src = movie.image_url;
                    movieImage.alt = movie.title;
                    console.log('Crime movie image URL:', movie.image_url); // Log image URL
                    crimeCategoryContainer.appendChild(movieImage);
                });
            } else {
                crimeCategoryContainer.innerHTML = '<p>No Crime movies available.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching Crime movies:', error.message);
            crimeCategoryContainer.innerHTML = '<p>Error loading Crime movies.</p>';
        });
}

function fetchWarMovies() {
    fetch(moviesApiUrl + '?genre=war&page_size=8')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched War movies data:', data.results); // Log fetched data
            if (data && data.results) {
                warCategoryContainer.innerHTML = ''; // Clear existing content
                data.results.forEach(movie => {
                    const movieImage = document.createElement('img');
                    movieImage.src = movie.image_url;
                    movieImage.alt = movie.title;
                    console.log('War movie image URL:', movie.image_url); // Log image URL
                    warCategoryContainer.appendChild(movieImage);
                });
            } else {
                warCategoryContainer.innerHTML = '<p>No War movies available.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching War movies:', error.message);
            warCategoryContainer.innerHTML = '<p>Error loading War movies.</p>';
        });
}





    // Event listener for genre selection
    categorySelects.forEach((select, index) => {
        select.addEventListener('change', (event) => {
            const selectedGenreId = event.target.value;
            const selectedCategoryContainer = document.querySelectorAll('.selected-category-movies')[index];
            fetchMoviesByGenre(selectedGenreId, selectedCategoryContainer);
        });
    });

    // Fetch movie details, genres, and Mystery movies on page load
    fetchMovieDetails();
    fetchGenres();
    fetchMysteryMovies();
    fetchCrimeMovies();
    fetchWarMovies();

});
