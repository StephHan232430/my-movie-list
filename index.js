(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  const typeList = document.getElementById('display-typing')
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  let paginationData = []
  let displayType = 1  // 宣告顯示模式變數，並初始化
  let currentPage = 1  // 宣告當前頁面變數，並初始化

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data)
    getPageData(1, data, displayType)
  }).catch((err) => console.log(err))

  function displayDataList(data, displayType) {  // 增加displayType參數
    let htmlContent = ''

    if (displayType === 1) {
      data.forEach(function (item) {
        htmlContent += `
          <div class="col-sm-3 mb-3">
            <div class="card mb-2 h-100">
              <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
              <div class="card-body movie-item-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <!-- "More" button -->
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
                <!-- favorite button -->
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        `
      })
    } else if (displayType === 2) {
      data.forEach(function (item) {
        htmlContent += `
          <li class="list-group-item col-12 border-right-0 border-left-0 justify-content-between">
            <div class="title d-inline-flex col-10">
              <h5>${item.title}</h5>
            </div>
            <div class="button-group d-inline-flex">
              <button class="btn btn-primary btn-show-movie ml-1" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite ml-1" data-id="${item.id}">+</button>
            </div>
          </li>
        `
      })
    }

    dataPanel.innerHTML = htmlContent
  }

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData(pageNum, data, displayType) {  // 增加displayType參數
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData, displayType)
  }

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })


  searchForm.addEventListener('submit', event => {
    event.preventDefault()

    let results = []
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    getTotalPages(results)
    getPageData(1, results, displayType)
  })

  // 以當下頁數(與pagination監聽器共用當下頁數，所以將當下頁數抽取出來並存入currentPage變數中)及顯示模式為引數，調用getPageData函式取得pageData後，再調用displayDataList渲染頁面
  typeList.addEventListener('click', event => {
    if (event.target.className === 'fa fa-th') {
      displayType = 1
      getPageData(currentPage, paginationData, displayType)
    } else if (event.target.className === 'fa fa-bars') {
      displayType = 2
      getPageData(currentPage, paginationData, displayType)
    }
  })

  // 以當下頁數(與typeList監聽器共用當下頁數，所以將當下頁數抽取出來並存入currentPage變數中)及顯示模式為引數，調用getPageData函式取得pageData後，再調用displayDataList渲染頁面
  pagination.addEventListener('click', event => {
    if (event.target.tagName === 'A') {
      currentPage = event.target.dataset.page  // 更新currentPage值
      getPageData(currentPage, paginationData, displayType)
    }
  })
})()