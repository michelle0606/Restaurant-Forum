const endpoint = '/api/restaurants'
const restaurants = []

const searchInput = document.querySelector('.search-field')
const suggestions = document.querySelector('.suggestions')

fetch(endpoint)
  .then(blob => blob.json())
  .then(data => {
    restaurants.push(...data)
  })

function findMatches(wordToMatch, restaurants) {
  return restaurants.filter(r => {
    const regex = new RegExp(wordToMatch, 'gi')
    return r.name.match(regex)
  })
}

function displayMatches() {
  const matchArray = findMatches(this.value, restaurants)
  suggestions.innerHTML = matchArray
    .map(r => {
      const regex = new RegExp(this.value, 'gi')
      const restName = r.name.replace(
        regex,
        `<span class="match">${this.value}</span>`
      )
      return `
      <li>
        <a href="/restaurants/${r.id}">${restName}</a>
      </li>
      `
    })
    .join('')
}

searchInput.addEventListener('change', displayMatches)
searchInput.addEventListener('keyup', displayMatches)
