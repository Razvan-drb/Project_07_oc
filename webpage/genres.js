const genresApiUrl = 'http://localhost:8000/api/v1/genres/';
let genres = [];

async function fetchGenres() {
    let allGenres = [];
    let nextUrl = genresApiUrl;

    async function fetchPage(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.results) {
                allGenres = allGenres.concat(data.results);
                if (data.next) {
                    await fetchPage(data.next);
                } else {
                    genres = allGenres; // Update global genres
                    updateDropdowns(allGenres); // Populate dropdowns with genres
                }
            } else {
                console.error('No genres data available.');
            }
        } catch (error) {
            console.error('Error fetching genres:', error.message);
        }
    }

    await fetchPage(nextUrl);
}

function updateDropdowns(genres) {
    const categorySelects = document.querySelectorAll('.other-category select');
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

export { fetchGenres, updateDropdowns, genres };
