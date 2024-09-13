import { fetchGenres } from './genres.js';
import { fetchMoviesByGenre, fetchMovieDetails, fetchCrimeMovies, fetchWarMovies } from './movieDetails.js';
import { fetchMysteryMovies } from './mysteryMovies.js';

// Ensure functions are defined
if (typeof fetchMovieDetails !== 'function') {
    console.error('fetchMovieDetails is not defined or imported correctly.');
}

if (typeof fetchCrimeMovies !== 'function') {
    console.error('fetchCrimeMovies is not defined or imported correctly.');
}

if (typeof fetchWarMovies !== 'function') {
    console.error('fetchWarMovies is not defined or imported correctly.');
}

document.addEventListener('DOMContentLoaded', () => {
    const categorySelects = document.querySelectorAll('.other-category select');
    const mysteryCategoryContainer = document.querySelector('.category .images'); // Make sure this matches the container
    const crimeCategoryContainer = document.querySelector('.crime-images'); // Make sure this matches the container
    const warCategoryContainer = document.querySelector('.war-images'); // Make sure this matches the container

    // Close popup functionality
    document.querySelector('.close-button').addEventListener('click', () => {
        document.getElementById('movie-popup').style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('movie-popup')) {
            document.getElementById('movie-popup').style.display = 'none';
        }
    });

    // Event listener for genre selection
    categorySelects.forEach((select, index) => {
        select.addEventListener('change', (event) => {
            const selectedGenreId = event.target.value;
            const selectedCategoryContainer = document.querySelectorAll('.selected-category-movies')[index];
            fetchMoviesByGenre(selectedGenreId, selectedCategoryContainer);
        });
    });

    // Fetch movie details, genres, and movies for each category on page load
    fetchMovieDetails(); // Ensure this function is correctly imported
    fetchGenres();       // Ensure this function is correctly imported
    fetchMysteryMovies();
    fetchCrimeMovies();
    fetchWarMovies();
});
