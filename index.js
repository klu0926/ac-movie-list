// ---------- MODEL ---------- //

const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIE_PER_PAGE = 12;
let currentPage = 1;

const movies = [];
let filteredMovies = [];

let displayMode = "card";

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#pagination");
const displayButtons = document.querySelector("#display-mode");

// 資料分頁
function getMovieByPage(page) {
  const startIndex = (page - 1) * MOVIE_PER_PAGE;
  const endIndex = startIndex + MOVIE_PER_PAGE;

  // 偵測有沒有filteredMovies 有的話就使用filteredMovies，沒有就用movies
  return (filteredMovies.length ? filteredMovies : movies).slice(
    startIndex,
    endIndex
  );
}

// toggle 喜愛電影 存入localStorage
function toggleFavoriteMovie(target) {
  const id = Number(target.dataset.id);
  const favoriteList = loadFavoriteList();

  // 改變按鈕顏色
  toggleFavoriteButton(target);

  // 已經是喜愛電影就把它remove掉
  if (favoriteList.some((movie) => movie.id === id)) {
    // 這邊等於是要傳送一個新的清單進去，這邊是把其他的電影抓回來，filter掉這部電影本身
    const newList = favoriteList.filter((movie) => {
      return movie.id !== id;
    });
    saveFavoriteList(newList); // 存入 local storage
    return console.log("Favorite movie remove");
  }

  // 還不是喜愛電影的話就加入local storage 裡面
  const movie = movies.find((movie) => movie.id === id); // 用ID找到電影
  favoriteList.push(movie); // 放到陣列裡面
  saveFavoriteList(favoriteList); // 存入local storage

  return console.log("Favorite movie added");
}

// save to 喜愛清單
function saveFavoriteList(list) {
  localStorage.setItem("favoriteList", JSON.stringify(list)); //先把物件變成string，再存入local storage
}

// load from 喜愛清單
function loadFavoriteList() {
  // check for local storage and return an array of favorite movies
  const favoriteList = JSON.parse(localStorage.getItem("favoriteList")) || [];
  return favoriteList;
}

// ---------- VIEW ---------- //
// render 電影頁面
function renderMovieList(data) {
  function cardMode() {
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
         <div class="col-sm-3 my-1">
        <div class="card">
          <img
            src=${POSTER_URL + item.image}
            class="card-img-top" alt="movie poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
              data-bs-target="#movie-modal" data-id=${item.id}>More</button>
            <button class="btn btn-info btn-add-favorite" data-id=${item.id
        }>+</button>
          </div>
        </div>
      </div>`;
    });
    return rawHTML;
  }

  function listMode() {
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
    <div class="row py-2 px-0 m-0 col-12 border-top">
    
      <div class="col-8">
        <p>${item.title}</p>
      </div>
      
      <div class="col-4">
         <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
              data-bs-target="#movie-modal" data-id=${item.id}>More</button>
        <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
      </div>
      
    </div>
    `;
    });
    return rawHTML;
  }
  // 依據display mode 顯示頁面
  if (displayMode === "card") {
    console.log("card mode");
    dataPanel.innerHTML = cardMode();
  } else if (displayMode === "list") {
    dataPanel.innerHTML = listMode();
  }
  // 顯示有幾部最愛電影在nav-favorite上面
  updateFavoriteNumberTip();

  // 更新最愛電影按鈕
  updateFavoriteButton();
}

// highlight 目前頁面的分頁器link
function highlightCurrentPageLink(currentPage) {
  const allLinks = document.querySelectorAll(".page-link");
  const currentLink = document.querySelector(`#page-link-${currentPage}`);
  // 其他頁面不highlight
  allLinks.forEach((link) => link.classList.remove("bg-primary", "text-light"));
  // 目前頁面highlight
  currentLink.classList.add("bg-primary", "text-light");
}

// render 分頁器
function renderPaginator(moviesData) {
  const totalPage = Math.ceil(moviesData.length / MOVIE_PER_PAGE);
  let rawHTML = ``;

  for (let page = 1; page <= totalPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page} id="page-link-${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

// 顯示有幾部最愛電影在nav-favorite上面
function updateFavoriteNumberTip() {
  if (loadFavoriteList().length !== 0) {
    document.querySelector("#nav-favorite").innerText = `Favorite (${loadFavoriteList().length
      })`;
  } else {
    document.querySelector("#nav-favorite").innerText = `Favorite`;
  }
}

// 顯示 Modal
function showMovieModal(movieId) {
  const id = Number(movieId);
  const title = document.querySelector("#movie-modal-title");
  const date = document.querySelector("#movie-modal-date");
  const description = document.querySelector("#movie-modal-description");
  const image = document.querySelector("#movie-modal-image");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    title.innerText = data.title;
    date.innerText = "release data: " + data.release_date;
    description.innerText = data.description;
    image.innerHTML = `
      <img src="${POSTER_URL + data.image}" class="img-fluid" 
      alt="movie poster">
      `;
  });
}

// update 最愛電影按鈕 顯示
function updateFavoriteButton() {
  const favoriteButtons = document.querySelectorAll(".btn-add-favorite");
  const favoriteMovieList = loadFavoriteList();
  // local storage 有存最愛電影的話
  if (favoriteMovieList.length !== 0) {
    favoriteButtons.forEach((button) => {
      const id = Number(button.dataset.id); //這裡很重要，要轉成number，dataset存的是string

      if (favoriteMovieList.find((movie) => movie.id === id)) {
        toggleFavoriteButton(button);
      }
    });
  }
}

// toggle 最愛電影按鈕 顯示
function toggleFavoriteButton(target) {
  const classList = target.classList;

  if (classList.contains("btn-info")) {
    classList.replace("btn-info", "btn-danger");
    target.innerText = "-";
  } else if (classList.contains("btn-danger")) {
    classList.replace("btn-danger", "btn-info");
    target.innerText = "+";
  }
}

// update mode button disoplay
function updateModeBtnDisplay() {
  const cardBtn = document.querySelector("#card-mode-btn");
  const listBtn = document.querySelector("#list-mode-btn");
  if (displayMode === "card") {
    cardBtn.classList.add("text-primary");
    listBtn.classList.remove("text-primary");
  } else {
    listBtn.classList.add("text-primary");
    cardBtn.classList.remove("text-primary");
  }
}

// ------- CONTROL ------- //

// 點擊電影卡片
dataPanel.addEventListener("click", function onMoreButtonClicked(event) {
  // More button
  if (event.target.matches(".btn-show-movie")) {
    const dataID = event.target.dataset.id;
    showMovieModal(dataID);
    // Favorite button
  } else if (event.target.matches(".btn-add-favorite")) {
    toggleFavoriteMovie(event.target);
    updateFavoriteNumberTip();
  }
});

// 點擊search submit
searchForm.addEventListener("submit", function onFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) => {
    return movie.title.toLowerCase().includes(keyword);
  });

  if (filteredMovies.length !== 0) {
    renderMovieList(getMovieByPage(1)); // render movie 使用filteredMovies
    renderPaginator(filteredMovies); // render paginator
    console.log("search movie");
  } else {
    alert(`Can't find movies key keyword: ` + keyword);
  }
  searchInput.value = "";
});

// 點擊分頁器
paginator.addEventListener("click", function onPageLinkClicked(event) {
  if (event.target.tagName === "A") {
    const page = event.target.dataset.page;
    renderMovieList(getMovieByPage(page));
    highlightCurrentPageLink(page);
    currentPage = page;
  }
});

// 點擊display mode buttons
displayButtons.addEventListener("click", function onModeBtnClicked(event) {
  const target = event.target;
  // card mode
  if (target.matches("#card-mode-btn")) {
    console.log("card mode");
    displayMode = "card";
    renderMovieList(getMovieByPage(currentPage));
    updateModeBtnDisplay();
  }
  // list mode
  if (target.matches("#list-mode-btn")) {
    console.log("list mode");
    displayMode = "list";
    renderMovieList(getMovieByPage(currentPage));
    updateModeBtnDisplay();
  }
});

// Start
axios
  .get(INDEX_URL)
  .then((response) => {
    for (const movie of response.data.results) {
      movies.push(movie);
    }
    renderPaginator(movies); // 顯示 分頁器
    highlightCurrentPageLink(1);
    renderMovieList(getMovieByPage(1)); //顯示第一頁分頁電影
    updateModeBtnDisplay(); // display mode button highlight
  })
  .catch((error) => {
    console.log(error);
  });
