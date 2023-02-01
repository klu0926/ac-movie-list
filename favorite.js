// -------------- 跟著老師一起做版本 ------------- //
const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/movies/"
const POSTER_URL = BASE_URL + "/posters/"

let movies = loadFavoriteList() 

const dataPanel = document.querySelector("#data-panel")


function renderMovieList(data) {
  let rawHTML = ""

  data.forEach(item => {
    rawHTML += `
         <div class="col-sm-3">
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
            <button class="btn btn-danger btn-remove-favorite" data-id=${item.id}>-</button>
          </div>
        </div>
      </div>`
  });

  // 顯示每一部電影在data panel 裡面
  dataPanel.innerHTML = rawHTML;

  // 顯示有幾部最愛電影在nav-favorite上面
  updateFavoriteNumberTip()

  // 更新最愛電影按鈕
  updateFavoriteButton()
  console.log("render page")
}

// 顯示有幾部最愛電影在nav-favorite上面
function updateFavoriteNumberTip() {
  if (loadFavoriteList().length !== 0) {
    document.querySelector("#nav-favorite").innerText = `Favorite (${loadFavoriteList().length})`
  } else {
    document.querySelector("#nav-favorite").innerText = `Favorite`
  }
}


// 更新最愛電影按鈕
function updateFavoriteButton(){
  const favoriteButtons = document.querySelectorAll(".btn-add-favorite")
  const favoriteMovieList = loadFavoriteList()
  // local storage 有存最愛電影的話
  if (favoriteMovieList.length !== 0) {

    favoriteButtons.forEach(button => {
      const id = Number(button.dataset.id) //這裡很重要，要轉成number，dataset存的是string

      if (favoriteMovieList.find(movie => movie.id === id)) {
        toggleFavoriteButton(button)
      }
    })
  }
}

// 顯示 Modal
function showMovieModal(movieId) {
  const id = Number(movieId)
  const title = document.querySelector("#movie-modal-title")
  const date = document.querySelector("#movie-modal-date")
  const description = document.querySelector("#movie-modal-description")
  const image = document.querySelector("#movie-modal-image")

  axios.get(INDEX_URL + id)
    .then(response => {
      console.log(response)
      const data = response.data.results
      title.innerText = data.title
      date.innerText = "release data: " + data.release_date
      description.innerText = data.description;
      image.innerHTML =
        `
      <img src="${POSTER_URL + data.image}" class="img-fluid" 
      alt="movie poster">
      `
    })

}


dataPanel.addEventListener("click", function onMoreButtonClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    const dataID = event.target.dataset.id
    showMovieModal(dataID)
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFavoriteMovie(Number(event.target.dataset.id))
  }
})


// remove 喜愛電影
function removeFavoriteMovie(id) {
  
  const index =  movies.findIndex(movie => movie.id === id)
  movies.splice(index, 1) // remove movie from movies
  saveFavoriteList(movies) // save to story
  renderMovieList(movies) // render page
  console.log("remove favorite movie")

}

// save to 喜愛清單
function saveFavoriteList(list) {
  localStorage.setItem("favoriteList", JSON.stringify(list)) //先把物件變成string，再存入local storage
}

// load from 喜愛清單
function loadFavoriteList() {
  // check for local storage and return an array of favorite movies
  const favoriteList = JSON.parse(localStorage.getItem("favoriteList")) || []
  return favoriteList
}

// log 喜愛清單出來看一下
function logFavoriteList() {
  console.log("favorite list length: ", loadFavoriteList().length)
  console.log(loadFavoriteList())
}

// toggle favorite btn 
function toggleFavoriteButton(target){
  const classList = target.classList

  if (classList.contains("btn-info")){
    classList.replace("btn-info", "btn-danger")
    target.innerText = "-"
  } else if (classList.contains("btn-danger")) {
    classList.replace("btn-danger", "btn-info")
    target.innerText = "+"
  }
}

// 顯示頁面
renderMovieList(movies)

