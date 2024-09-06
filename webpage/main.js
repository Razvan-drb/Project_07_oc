import { fetchGenres } from './genres.js';
import { fetchMoviesByGenre, fetchMovieDetails } from './movieDetails.js';
import { fetchMysteryMovies } from './mysteryMovies.js';

// Ensure functions are defined
if (typeof fetchMovieDetails !== 'function') {
    console.error('fetchMovieDetails is not defined or imported correctly.');
}

document.addEventListener('DOMContentLoaded', () => {
    const categorySelects = document.querySelectorAll('.other-category select');
    const mysteryCategoryContainer = document.querySelector('.category .images');

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

    // Fetch movie details, genres, and Mystery movies on page load
    fetchMovieDetails(); // Ensure this function is correctly imported
    fetchGenres();       // Ensure this function is correctly imported
    fetchMysteryMovies(); // Ensure this function is correctly imported
});
