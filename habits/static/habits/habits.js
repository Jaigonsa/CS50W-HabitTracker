document.addEventListener('DOMContentLoaded', (event) => {

    // Define HTML blocks/containers
    let leftCol = document.getElementById('left-col');
    let rightCol = document.getElementById('right-col');

    let searchMain = document.getElementById('search-block');

    let mainImage = document.getElementById("main-images-block");

    let noResultsDiv = document.getElementById('noResults-block');

    let resultsBlock = document.getElementById("results-block");
    let resultsContainer = document.getElementById("results-container");

    let registerBlock = document.getElementById("register-habit-block");
    let registerContainer = document.getElementById("register-habit-container");

    let registeredBlock = document.getElementById("registered-habit-block");
    let registeredContainer = document.getElementById("registered-habit-container");

    let activityBlock = document.getElementById("activity-block");

    let calendarBlock = document.getElementById("calendar-block");


    // Default hide/show blocks
    noResultsDiv.style.display = "none";
    calendarBlock.style.display = "block";
    activityBlock.style.display = "none";
    registerBlock.style.display = "none";
    registeredBlock.style.display = "none";
    mainImage.style.display = "block";


    // Define length review preview
    let longPostText = document.querySelectorAll(".long-post-text");
    let shortPostText = document.querySelectorAll(".short-post-text");

    if (window.innerWidth > 1200) {
        longPostText.forEach(element => {
            element.style.display = "block";
        });
        shortPostText.forEach(element => {
            element.style.display = "none";
        });
    } else {
        longPostText.forEach(element => {
            element.style.display = "none";
        });
        shortPostText.forEach(element => {
            element.style.display = "block";
        });
    }


    // Define other HTML elements
    // Navbar buttons
    let calendarButton = document.getElementById("calendar-button");
    let postsButton = document.getElementById("posts-button");
    let homeButton = document.getElementById("home-button");
    let logoutButton = document.getElementById("logout-button");
    // Search input
    let searchField = document.getElementById("search-field");
    //Main images
    let filmsImage = document.getElementById("films-image");
    let booksImage = document.getElementById("books-image");
    filmsImage.style.display = "none";
    booksImage.style.opacity = 1;
    // Switch movies/books
    let searchToggle = document.getElementById("toggle-input");
    let toggleState = searchToggle.checked;
    let btnToggle = document.getElementById('btn-toggle')
    let toggleBtn = document.querySelectorAll('.toggle-btn');
    // Carousel buttons
    let leftButton = document.getElementById("left-button");
    let rightButton = document.getElementById("right-button");



    // Define TMDB API KEY
    const TMDB_KEY = '123456789'

    let lastSearch = "";
    let lastToggleState = searchToggle.checked;
    let debounceTimer;

    // Define results counter
    let resultsCounter;


    // Movies API
    const getMovies = async (TMDB_KEY, movie) => {
        const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${movie}`
        );
        const data = await response.json();
        return data;
    };

    const getOneMovie = async (TMDB_KEY, movieId) => {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_KEY}&append_to_response=credits`
        );
        const data = await response.json();
        return data;
    };


    // Books API
    const getBooks = async (book) => {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${book}&orderBy=relevance&printType=BOOKS&maxResults=9`
        );
        const data = await response.json();
        return data;
    };

    const getOneBook = async (bookId) => {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}`
        );
        const data = await response.json();
        return data;
    };

    // NavBar buttons
    calendarButton.addEventListener('click', () => {
        activityBlock.style.display = "none";
        calendarBlock.style.display = "block";
    })

    postsButton.addEventListener('click', () => {
        calendarBlock.style.display = "none";
        activityBlock.style.display = "block";
    })

    homeButton.addEventListener('click', () => {
        registeredBlock.classList.remove('active');
        setTimeout(() => {
            registeredBlock.style.display = "none";
            searchMain.style.display = "block";
            mainImage.style.display = "block";
        }, 900);
    })

    logoutButton.addEventListener('click', () => {
        fetch('/logout', {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            }
        });
    })

    // Posts -> display habit
    let posts = document.querySelectorAll('.post');
    posts.forEach(post => {
        post.addEventListener('click', function() {
            displayHabit(this.dataset.title, this.dataset.user);
        });
    });

    // Show search results
    const showResults = async () => {
        //Hide results container if search input is empty
        if (searchField.value == '') {
            resultsContainer.classList.remove('active');
            noResultsDiv.style.display = "none";
            setTimeout(() => {
                mainImage.style.display = "block";
                setTimeout(() => {
                    mainImage.style.opacity = 1;
                }, 1);
            }, 800);
        }
        // Make search every time the input changes
        else if (searchField.value !== lastSearch || toggleState !== lastToggleState) {

            let data;
            let habitData;
            let resultsHTML = '';

            resultsContainer.classList.add('active');
            noResultsDiv.style.display = "none";

            // Set results counter to 0
            resultsCounter = 0;

            // Return carousel to initial position
            resultsContainer.style.left = 0 + 'px';

            // Movie search
            if (searchToggle.checked) {
                data = await getMovies(TMDB_KEY,`${searchField.value}`);

                if (data['total_results'] == 0) {
                    resultsContainer.classList.remove('active');
                    noResultsDiv.style.display = "block";
                } else {

                    // Create blanck space for displace results
                    if (window.innerWidth < 1200) {
                        resultsHTML += `
                            <div class="col">
                                <div id="blank-results"></div>
                            </div>`;
                    }

                    // Show results
                    for ( i = 0; i < 9; i++){
                        // Exclude results without image or null results
                        if (data['results'][i] != undefined && data['results'][i]['poster_path']) {

                            habitData = data['results'][i]
                            resultsHTML += previewMovie(habitData)

                            resultsCounter += 1
                        }
                    }
                }

            // Book search
            } else {
                data = await getBooks(`${searchField.value}`);

                if (data['totalItems'] == 0) {
                    resultsContainer.classList.remove('active');
                    noResultsDiv.style.display = "block";
                } else {

                    // Create blanck space for displace results
                    if (window.innerWidth < 1200) {
                        resultsHTML += `
                            <div class="col">
                                <div id="blank-results"></div>
                            </div>`;
                    }

                    // Show results
                    for (i = 0; i < 9; i++){
                        // Exclude results without image or null results
                        if (data['items'][i] != undefined && data['items'][i]['volumeInfo']['imageLinks'] != undefined) {
                            habitData = data['items'][i]
                            resultsHTML += previewBook(habitData)

                            resultsCounter += 1
                        }
                    }
                }
            }


            resultsContainer.innerHTML = resultsHTML;

            resizeResultsContainer(resultsCounter);

            lastSearch = searchField.value;
            lastToggleState = toggleState;

            // Define movie event listener
            const movie_images = document.querySelectorAll('.preview-movie-image');
            movie_images.forEach(movie_image => {
                movie_image.addEventListener('click', async () => {
                    let movieId = movie_image.dataset.movieId;
                    registerMovie(TMDB_KEY, movieId);
                });
            });

            // Define book event listener
            const book_images = document.querySelectorAll('.preview-book-image');
            book_images.forEach(book_image => {
                book_image.addEventListener('click', () => {
                    let bookId = book_image.dataset.bookId;
                    registerBook(bookId);
                });
            });
        }
    };

    // Detect when input changes
    searchField.addEventListener("keyup", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            mainImage.style.opacity = 0;
            setTimeout(() => {
                mainImage.style.display = "none";
                showResults();
            }, 600);
        }, 600);
    });

    // Toggle books/movie search
    searchToggle.addEventListener("change", () => {
        toggleState = searchToggle.checked;
        if (toggleState == true) {
            btnToggle.style.left = '35px';
            toggleBtn.forEach((btn) => {
                btn.style.paddingLeft = "9px";
            });
            booksImage.style.opacity = 0;
            setTimeout(() => {
                booksImage.style.display = "none";
                filmsImage.style.display = "block";
                setTimeout(() => {
                    filmsImage.style.opacity = 1;
                }, 1);
            }, 500);
        } else {
            btnToggle.style.left = '0';
            toggleBtn.forEach((btn) => {
                btn.style.paddingLeft = "18px";
            });
            filmsImage.style.opacity = 0;
            setTimeout(() => {
                filmsImage.style.display = "none";
                booksImage.style.display = "block";
                setTimeout(() => {
                    booksImage.style.opacity = 1;
                }, 1);
            }, 500);
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(showResults, 400);
    });


    // Create div for movie / books preview
    function previewMovie(habitData){
        const moviePreview = document.createElement('div');
        moviePreview.innerHTML = `
        <div class="col">
            <img class="preview-movie-image" data-movie-id="${habitData['id']}" src="https://image.tmdb.org/t/p/w500${habitData['poster_path']}" alt="${habitData['original_title']}">
        </div>`;
        return moviePreview.innerHTML;
    }

    function previewBook(habitData){
        const bookPreview = document.createElement('div');
        bookPreview.innerHTML = `
        <div class="col">
            <img class="preview-book-image" data-book-id="${habitData['id']}" src="http://books.google.com/books/content?id=${habitData['id']}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api" alt="${habitData['original_title']}">
        </div>`;
        return bookPreview.innerHTML;
    }

    async function registerMovie(TMDB_KEY, movieId) {

        // Hide results container & clear search field
        setTimeout(endResults,100);

        // Get values from JSON
        const data = await getOneMovie(TMDB_KEY, movieId);

        let title = data['title'];
        let director = data.credits.crew.find(person => person.job == 'Director').name
        let image = `https://image.tmdb.org/t/p/w500${data['poster_path']}`
        let genre_names = [];
        data.genres.forEach(genre_data => {
        genre_names.push(genre_data.name);
        });
        let publishedDate = data['release_date'];
        let year = publishedDate.split('-')[0];

        // Send JSON to create_habit view
        const jsonData = {
            title: title,
            author: director,
            genre_names: genre_names,
            image: image,
            year: year,
        };

        const csrftoken = getCookie('csrftoken');

        const response = await fetch('/create_habit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(jsonData)
        });

        // Call fuction to fill habit data
        fillHabit(title, image, year);
    }


    async function registerBook(BookId) {

        // Hide results container & clear search field
        setTimeout(endResults,100);

        // Get values from JSON
        const data = await getOneBook(BookId);

        let title = data['volumeInfo']['title'];
        let author = data['volumeInfo']['authors'][0]
        let image = `https://books.google.com/books/content?id=${data['id']}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`
        let genre_names = [];
        // Check if 'categories' exists
        if (data['volumeInfo'].hasOwnProperty('categories')) {
            data['volumeInfo']['categories'].forEach(genre_data => {
            genre_names.push(genre_data);
            });
        }
        let publishedDate = data['volumeInfo']['publishedDate'];
        let year = publishedDate.split('-')[0];

        // Send JSON to create_habit view
        const jsonData = {
            title: title,
            author: author,
            genre_names: genre_names,
            image: image,
            year: year,
        };

        const csrftoken = getCookie('csrftoken');

        const response = await fetch('/create_habit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(jsonData)
        });

            // Call fuction to fill habit data
            fillHabit(title, image, year);
    }


    function fillHabit(title, image, year){

        // Hide search bar
        searchMain.style.display = "none";

        // Fill habit container
        if (window.innerWidth > 1200) {
            registerContainer.innerHTML = `
            <div id="left-column" class="col-4">
                <img class="preview-image" src="${image}" alt="${title}">
            </div>
            <div id="right-column" class="col-8">
                <p id='register-title' data-title="${title}" data-year="${year}">${title} (${year})</p>
                <div class="rating">
                    <span data-rating="5" class ="star">&#9733;</span>
                    <span data-rating="4" class ="star">&#9733;</span>
                    <span data-rating="3" class ="star">&#9733;</span>
                    <span data-rating="2" class ="star">&#9733;</span>
                    <span data-rating="1" class ="star">&#9733;</span>
                </div>

                <svg id="single-range-date" class="bi navbar-icon" fill="#c9c9c9"><use xlink:href="#calendar-range"></use></svg>
                <input type="date" id="activity-date" placeholder="Chose date..." name="activity-date">
                <div id="habit-color-picker" tabindex="0">
                    <div id="selected-color" style="background-color: #F36B7F;" data-color="#F36B7F"></div>
                    <div id="color-options" style="display: none;">
                        <div class="color-option" style="background-color: #F36B7F;" data-color="#F36B7F"></div>
                        <div class="color-option" style="background-color: #F8CF61;" data-color="#F8CF61"></div>
                        <div class="color-option" style="background-color: #82B5A5;" data-color="#82B5A5"></div>
                        <div class="color-option" style="background-color: #9FBFFF;" data-color="#9FBFFF"></div>
                        <div class="color-option" style="background-color: #FA9A85;" data-color="#fbae9d"></div>
                    </div>
                </div>

                <form action="#" id="register-form" method="post">
                    <textarea class="form-control" id="register-textarea" rows="3" name="content" placeholder="Review..." maxlength="250"></textarea>
                    <input id="register-habit-button" class="own-button" type="submit" value="Done" style="display: inline-block;">
                    <p id="counter" style="display: inline-block; margin: 0; float: right; font-size: 14px;"></p>
                </form>
            </div>`;
        } else {
            registerContainer.innerHTML = `
            <div class="block-div">
                <img class="preview-image" src="${image}" alt="${title}">
            </div>
            <div class="block-div">
                <p id='register-title' data-title="${title}" data-year="${year}">${title} (${year})</p>
                <div class="rating">
                    <span data-rating="5" class ="star">&#9733;</span>
                    <span data-rating="4" class ="star">&#9733;</span>
                    <span data-rating="3" class ="star">&#9733;</span>
                    <span data-rating="2" class ="star">&#9733;</span>
                    <span data-rating="1" class ="star">&#9733;</span>
                </div>
                <svg id="single-range-date" class="bi navbar-icon" fill="#c9c9c9"><use xlink:href="#calendar-range"></use></svg>
                <input type="date" id="activity-date" placeholder="Chose date..." name="activity-date">

                <div id="habit-color-picker" tabindex="0">
                    <div id="selected-color" class="color-option" style="background-color: #F36B7F;" data-color="#F36B7F"></div>
                    <div id="color-options" style="display: none;">
                        <div class="color-option" style="background-color: #F36B7F;" data-color="#F36B7F"></div>
                        <div class="color-option" style="background-color: #F8CF61;" data-color="#F8CF61"></div>
                        <div class="color-option" style="background-color: #82B5A5;" data-color="#82B5A5"></div>
                        <div class="color-option" style="background-color: #9FBFFF;" data-color="#9FBFFF"></div>
                        <div class="color-option" style="background-color: #FA9A85;" data-color="#fbae9d"></div>
                    </div>
                </div>

                <form action="#" id="register-form" method="post">
                    <textarea class="form-control" id="register-textarea" rows="4" name="content" placeholder="Review..." maxlength="250"></textarea>
                    <p id="counter" style=" margin-bottom: 10px; font-size: 15px;"></p>
                    <input id="register-habit-button" class="own-button" type="submit" value="Done" style="display: inline-block;">
                </form>
            </div>`;
        }

        let textarea = document.getElementById('register-textarea');

        function updateCount() {
            let counter = document.getElementById('counter');
            counter.innerHTML = 'Characters left: ' + (250 - textarea.value.length);
        }

        textarea.addEventListener('input', updateCount);

        // Show habit container
        registerBlock.style.display = "block";
        registerBlock.classList.remove('active');
        setTimeout(() => {
            registerBlock.classList.add('active');
            // Scroll to form if mobile device
            if (window.innerWidth < 1200)  {
                setTimeout(() => {
                    registerBlock.scrollIntoView({behavior: "smooth"});
                }, 1100);
            }
        }, 500);


        // Define HTML elements
        let stars = document.querySelectorAll(".rating span");
        let dateSwitch = document.getElementById("single-range-date");
        let registerButton = document.getElementById("register-habit-button");
        let dateSwitchState;
        let pickrDates;
        let rating;

        // Define star-rating
        stars.forEach(star => {
            star.addEventListener('click', () => {

                // Remove color from previus selection
                let children = Array.from(star.parentElement.children);
                children.forEach(child => {
                    child.setAttribute("data-clicked", "false");
                });

                // Color stars
                star.setAttribute("data-clicked", "true");
                rating = star.dataset.rating;
            });
        });


        // Define date picker
        // Define date picker switch
        checkFlatpickrMode();

        dateSwitch.addEventListener('click', () => {
            let isClicked = dateSwitch.getAttribute("data-clicked") === "true";
            dateSwitch.setAttribute("data-clicked", !isClicked);
            dateSwitchState = dateSwitch.getAttribute("data-clicked") === "true";

            if (dateSwitchState) {
                dateSwitch.style.fill = '#212529';
            } else {
                dateSwitch.style.fill = '#c9c9c9';
            }

            checkFlatpickrMode();
        })


        // Convert the date input to a flatpickr date picker
        async function checkFlatpickrMode() {

            //Obtain dates from model
            let data = await getDates();

            let registeredDates = [];
            let registeredRanges = [];

            data.forEach(item => {
                let startDate = new Date(item.startDate);
                let endDate = item.endDate ? new Date(item.endDate) : null;
                if (endDate) {
                    registeredRanges.push([startDate, endDate]);
                } else {
                    registeredDates.push(startDate);
                }
            });

            let disabledDates = [...registeredDates];
            registeredRanges.forEach((range) => {
                for (let d = new Date(range[0]); d <= new Date(range[1]); d.setDate(d.getDate() + 1)) {
                    disabledDates.push(new Date(d));
                }
            });

            if (dateSwitchState) {
                pickrDates = flatpickr("#activity-date", {
                    mode: "range",
                    dateFormat: "d/m",
                    disable: disabledDates,
                });
            } else {
                pickrDates = flatpickr("#activity-date", {
                    mode: "single",
                    dateFormat: "d/m",
                    disable: disabledDates
                });
            };
        }

        // Define color picker
        let color = document.getElementById("selected-color").dataset.color;

        // Define color picker
        let colorPicker = document.getElementById("habit-color-picker");
        let colorOptions = document.querySelectorAll("#color-options .color-option");
        let selectedColor = document.getElementById("selected-color");

        colorPicker.addEventListener('click', () => {
            let colorOptionsDiv = document.getElementById("color-options");
            if (colorOptionsDiv.style.display === "none") {
                colorOptionsDiv.style.display = "block";
            } else {
                colorOptionsDiv.style.display = "none";
            }
        });

        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                // Change the color of the selected color div
                selectedColor.style.backgroundColor = option.style.backgroundColor;
                selectedColor.dataset.color = option.dataset.color;

                // Save selected color
                color = option.dataset.color;

                // Hide color options
                document.getElementById("color-options").style.display = "none";
            });
        });

        // Close the dropdown when clicking outside of it
        document.addEventListener('click', (e) => {
            let colorOptionsDiv = document.getElementById("color-options");
            if (e.target.id !== "habit-color-picker" && !colorPicker.contains(e.target)) {
                colorOptionsDiv.style.display = "none";
            }
        });



        // Read form data when submit
        document.getElementById('register-form').addEventListener('submit', function(e){

            e.preventDefault();

            let title = document.getElementById("register-title").dataset.title;

            let year = document.getElementById("register-title").dataset.year;

            let startDate, endDate;

            if (pickrDates.selectedDates.length == 1) {
                startDate = flatpickr.formatDate(pickrDates.selectedDates [0], 'Y-m-d');
            } else if (pickrDates.selectedDates.length == 2) {
                startDate = flatpickr.formatDate(pickrDates.selectedDates [0], 'Y-m-d');
                endDate = flatpickr.formatDate(pickrDates.selectedDates [1], 'Y-m-d');
            }

            let review = document.getElementById("register-textarea").value;

            // Display alert message if form is not complete
            if (!startDate || !rating || !review) {
                alert("Por favor completa todos los campos del formulario");
                return;
            }

            // Send JSON to register_habit view
            const jsonData = {
                title: title,
                year: year,
                rating: rating,
                review: review,
                startDate: startDate,
                color: color,
                image: image,
            };

            // Check if endDate exists
            if (pickrDates.selectedDates.length == 2) {
                jsonData.endDate = endDate;
            }

            const csrftoken = getCookie('csrftoken');

            registerHabitFunction(jsonData, csrftoken).then(response => {
                if (response.status === 200) {
                    addPost(user, title, rating, review, image, year);
                    markDatesDefault();
                    let posts = document.querySelectorAll('.post');
                    posts.forEach(post => {
                        post.addEventListener('click', function() {
                            displayHabit(this.dataset.title, this.dataset.user);
                        });
                    });
                }
            });

            // Hide register block and remove results
            setTimeout(() => {
                registerBlock.classList.remove('active');
            }, 500);
            setTimeout(() => {
                registerBlock.style.display = "none";
                searchMain.style.display = "block";
                mainImage.style.display = "block";
                setTimeout(() => {
                    mainImage.style.opacity = 1;
                }, 1);
            }, 1500);

        });
    }

    async function registerHabitFunction(jsonData, csrftoken) {

        const response = await fetch('/register_habit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(jsonData)
        });

        return response;
    }

    function addPost(user, title, rating, review, image, year) {
        let allActivity = document.getElementById("all-activity");

        let starRating = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starRating += "<span>&#9733;</span>";
            } else {
                starRating += "<span>&#9734;</span>";
            }
        }


        let newPostHTML;

        if (window.innerWidth > 1200) {

            // Set maximun characters
            if (review.length + user.length + title.length > 155) {
                review = review.substring(0, 152 - (user.length + title.length)) + '...';
            }

            // Create post HTML
            newPostHTML = `
            <div class="post" data-title="${title}" data-user="${user}">
                <div class="row">
                    <div class="col-md-2"style="padding: 0 0 0 3px;">
                        <div class="image-container">
                            <img src="${image}" alt="Profile pic">
                        </div>
                    </div>
                    <div class="col-md-10" style="padding: 0 20px 0 35px;">
                        <p class="long-post-text">
                            <span class="post-title">${user} on ${title} (${year}):</span>
                            <span style="font-style: italic; margin-left: 10px; font-size: 15px;">"${review}"</span>
                        </p>
                        <div class="post-rating">${starRating}</div>
                    </div>
                </div>
            </div>`;
        } else {

            // Set maximun characters
            if (review.length + user.length + title.length > 85) {
                review = review.substring(0, 82 - (user.length + title.length)) + '...';
            }

            // Create post HTML
            newPostHTML = `
            <div class="post" data-title="${title}" data-user="${user}">
                <div class="row">
                    <div class="col-md-2"style="padding: 0 0 0 3px;">
                        <div class="image-container">
                            <img src="${image}" alt="Profile pic">
                        </div>
                    </div>
                    <div class="col-md-10" style="padding: 0 20px 0 35px;">
                        <p class="short-post-text">
                            <span class="post-title">${user} on ${title} (${year}):</span>
                            <span style="font-style: italic; margin-left: 10px; font-size: 15px;">"${review}"</span>
                        </p>
                        <div class="post-rating">${starRating}</div>
                    </div>
                </div>
            </div>`;
        }

        // Add the post at first place
        allActivity.insertAdjacentHTML('afterbegin', newPostHTML);
    }

    // Obtain cookie
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
        return cookieValue;
    }

    function endResults() {
        // Hide results container
        resultsContainer.classList.remove('active');

        // Clear search field
        document.getElementById("search-field").value = "";
    }


    // Define buttons behavior on results-container
    function displayCarouselButtons() {

        let currentLeft = parseInt(resultsContainer.style.left, 10) || 0;
        let maxLeft;

        if (resultsCounter > 5) {
            maxLeft = ((resultsCounter - 5) * 180) * -1;
        } else {
            maxLeft = 0;
        }

        if (currentLeft >= 0 && currentLeft <= maxLeft) {
            leftButton.style.display = "none";
            rightButton.style.display = "none";
        } else if (currentLeft <= maxLeft) {
            leftButton.style.display = "block";
            rightButton.style.display = "none";
        } else if (currentLeft >= 0) {
            leftButton.style.display = "none";
            rightButton.style.display = "block";
        } else {
            leftButton.style.display = "block";
            rightButton.style.display = "block";
        }
    }

    displayCarouselButtons();

    leftButton.addEventListener('click', () => {
        let currentLeft = parseInt(resultsContainer.style.left, 10) || 0;
        resultsContainer.style.left = (currentLeft + 180) + 'px';
        displayCarouselButtons()
    });

    rightButton.addEventListener('click', () => {
        let currentLeft = parseInt(resultsContainer.style.left, 10) || 0;
        resultsContainer.style.left = (currentLeft - 180) + 'px';
        displayCarouselButtons()
    });


    // Resize results-container depending on number of results
    function resizeResultsContainer(resultsCounter) {

        if (window.innerWidth >= 1200) {
            if (resultsCounter >= 5) {
                resultsContainer.style.width = 910 + 'px';
                resultsBlock.style.width = 915 + 'px';
            }
            else if (resultsCounter == 4) {
                resultsContainer.style.width = 720 + 'px';
                resultsBlock.style.width = 720 + 'px';
            }
            else if (resultsCounter == 3){
                resultsContainer.style.width = 540 + 'px';
                resultsBlock.style.width = 540 + 'px';
            }
            else if (resultsCounter == 2){
                resultsContainer.style.width = 360 + 'px';
                resultsBlock.style.width = 360 + 'px';
            }
            else if (resultsCounter == 1){
                resultsContainer.style.width = 180 + 'px';
                resultsBlock.style.width = 180 + 'px';
            }
        } else {
            if (resultsCounter >= 2){
                resultsContainer.style.width = 360 + 'px';
                resultsBlock.style.width = 100 + '%';
            }
            else if (resultsCounter == 1){
                resultsContainer.style.width = 180 + 'px';
                resultsBlock.style.width = 180 + 'px';
            }
        }

        displayCarouselButtons();
    }


    // CALENDAR
    // --------

    const currentDate = document.querySelector(".current-date"),
    daysTag = document.querySelector(".days"),
    prevNextIcon = document.querySelectorAll(".icons span");


    // Get current date
    let date = new Date(),
    currentYear = date.getFullYear(),
    currentMonth = date.getMonth(),
    startDate = null,
    endDate = null;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


    // Display days
    const renderCalendar = () => {
        let firstDayofMonth = new Date(currentYear, currentMonth, 1).getDay(),
        lastDateofMonth = new Date(currentYear, currentMonth + 1, 0).getDate(),
        lastDayofMonth = new Date(currentYear, currentMonth + 1, 0).getDay(),
        lastDateofLastMonth = new Date(currentYear, currentMonth, 0).getDate();

        if (firstDayofMonth == 0){
            firstDayofMonth = 7
        }

        let liTag = "";

        // Display previus month days
        for (let i = firstDayofMonth - 1; i > 0; i--){
            liTag += `<li class="inactive prev-month">${lastDateofLastMonth - i + 1}</li>`;
        }

        // Display actual month days
        for (let i = 1; i <= lastDateofMonth; i++){
            liTag += `<li>${i}</li>`;
        }

        // Display next month days
        if (lastDayofMonth > 0){
            for (let i = 1; i <= 7 - lastDayofMonth; i++){
                liTag += `<li class="inactive next-month">${i}</li>`;
            }
        }

        currentDate.innerText = `${months[currentMonth]} ${currentYear}`;
        daysTag.innerHTML = liTag;
    }
    renderCalendar();


    // Define previous and next month buttons
    prevNextIcon.forEach(icon => {
        icon.addEventListener("click", () => {
            currentMonth = icon.id === "prev" ? currentMonth -1 : currentMonth +1;

            if (currentMonth < 0 || currentMonth > 11){
                date = new Date(currentYear, currentMonth);
                currentYear = date.getFullYear();
                currentMonth = date.getMonth();
            } else {
                date = new Date();
            }

            renderCalendar();
            markDatesDefault();
        });
    });


    // Obtain register dates from model
    async function getDates() {
        const response = await fetch('/get_habits_dates', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data;
    };


    async function displayHabit(title, username) {

        const jsonData = {
            title: title,
            username: username,
        };

        const csrftoken = getCookie('csrftoken');

        const response = await fetch (`/display_habit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(jsonData)
        });

        const registered = (await response.json())[0];

        let starRating = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= registered.rating) {
                starRating += "<span>&#9733;</span>";
            } else {
                starRating += "<span>&#9734;</span>";
            }
        }

        // Fill review data

        function changeDateFormat(date) {
            let splitDate = date.split('-');
            return `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`;
        }

        let startDateString = registered.startDate ? changeDateFormat(registered.startDate) : '';
        let endDateString = registered.endDate ? changeDateFormat(registered.endDate) : '';

        let dateString = endDateString
            ? `Seen by <u>${registered.user}</u> between ${startDateString} and ${endDateString}.`
            : `Seen by <u>${registered.user}</u> on ${startDateString}.`;

        if (window.innerWidth > 1200) {
            registeredContainer.innerHTML = `
            <div id="left-column" class="col-4">
                <img class="preview-image" src="${registered.image}" alt="${registered.title}">
            </div>
            <div id="right-column" class="col-8">
                <p id='register-title'style="margin-bottom: 20px;">${registered.title} (${registered.year})</p>
                <p style="font-size: 15px;">${dateString}</p>
                <p style="font-style: italic; margin-bottom: 0; font-size: 15px; margin-bottom: 20px; text-align: justify;">"${registered.review}"</p>
                <div style="float: right; margin: -2px 15px 0 0">${starRating}</div>
            </div>`;
        } else {
            registeredContainer.innerHTML = `
            <div class="block-div">
                <img class="preview-image" src="${registered.image}" alt="${registered.title}">
            </div>
            <div class="block-div">
                <p id='register-title'style="margin-bottom: 20px;">${registered.title} (${registered.year})</p>
                <p style="font-size: 15px;">${dateString}</p>
                <p style="font-style: italic; margin-bottom: 0; font-size: 15px; margin-bottom: 20px; text-align: justify;">"${registered.review}"</p>
                <div style="font-size: 25px;">${starRating}</div>
            </div>`;
        }

        // Hide/show blocks
        searchMain.style.display = "none";
        mainImage.style.display = "none";
        registeredBlock.style.display = "block";
        setTimeout(() => {
            registeredBlock.classList.add('active');
            // Scroll to form if mobile device
            if (window.innerWidth < 1200)  {
                setTimeout(() => {
                    registeredBlock.scrollIntoView({behavior: "smooth"});
                }, 1100);
            }
        }, 1);
    }


    // Mark registers on calendar
    const markDatesDefault = async () => {

        // Obtain dates
        const dates = await getDates();

        // Select month dates
        const days = document.querySelectorAll(".days li");

        dates.forEach(({startDate, endDate, color, title}) => {

            // Parse dates
            const startDay = new Date(startDate).getDate();
            const startMonth = new Date(startDate).getMonth();
            const startYear = new Date(startDate).getFullYear();
            const endDay = endDate ? new Date(endDate).getDate() : null;
            const endMonth = endDate ? new Date(endDate).getMonth() : null;
            const endYear = endDate ? new Date(endDate).getFullYear() : null;

            days.forEach(day => {
                const dayNumber = parseInt(day.innerText);
                const dayMonth = day.classList.contains('prev-month') ? currentMonth - 1 : (day.classList.contains('next-month') ? currentMonth + 1 : currentMonth);
                const dayYear = currentYear;

                // Set dates in time (ms)
                const startDateTime = new Date(startYear, startMonth, startDay).getTime();
                const endDateTime = new Date(endYear, endMonth, endDay).getTime();
                const currentDateTime = new Date(dayYear, dayMonth, dayNumber).getTime();

                // Mark days
                if (startDate && endDate) {
                    if (currentDateTime >= startDateTime && currentDateTime <= endDateTime) {
                        if (currentDateTime === startDateTime) {
                            day.classList.add('marked_start');
                            day.style.backgroundColor = color;
                            day.title = title;
                            day.dataset.user = user;
                        } else if (currentDateTime === endDateTime) {
                            day.classList.add('marked_end');
                            day.style.backgroundColor = color;
                            day.title = title;
                            day.dataset.user = user;
                        } else {
                            day.classList.add('marked_middle');
                            day.style.backgroundColor = color;
                            day.title = title;
                            day.dataset.user = user;
                        }
                    }
                } else if (startDate) {
                    if (currentDateTime === startDateTime) {
                        day.classList.add('marked');
                        day.style.backgroundColor = color;
                        day.title = title;
                        day.dataset.user = user;
                    }
                }
            });
        });

        // Add event listeners to days
        days.forEach(day => {
            day.addEventListener('click', function() {
                displayHabit(this.title, this.dataset.user);
            });
        });
    }

    // Call function
    markDatesDefault();

});