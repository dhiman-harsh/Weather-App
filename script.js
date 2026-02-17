const searchBox = document.querySelector('input[type="search"]')
const suggestions = document.querySelector('.suggestions')
const tempValue = document.querySelector('.temp-value')
const feelsLike = document.querySelector('.temp-2')
const labelCont = document.querySelector('.label-list')
const currentCity = document.querySelector('.city-name')

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const GC_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
let lat = null
let lon = null
let feelsLikeTemp = null
let openIndex = null

// const cities = [
//     "Kurukshetra",
//     "Ambala",
//     "Indri",
//     "Ladwa",
//     "Jyotisar",
//     "Babain",
//     "Ismailabad"
// ]

hideSuggestions = () => {
    suggestions.classList.add('hide')
}

showSuggestions = () => {
    suggestions.classList.remove('hide')
}

const suggest = (city) => {
    let li = document.createElement('li')
    li.innerHTML = `${city}`
    suggestions.append(li)
}

searchBox.addEventListener('input', (e) => {
    let searchInput = e.target.value.toLowerCase()
    if (searchInput === "") {
        hideSuggestions()
    } else {
        suggestions.innerHTML = ""
        cities.forEach((city) => {
            cityLowerCase = city.toLowerCase()
            if (cityLowerCase.includes(searchInput) && searchInput != "") {
                suggest(city)
            }
        })
        showSuggestions()
    }
})

window.addEventListener('click', (e) => {
    if (!e.target.matches('input[type="search"]')) {
        hideSuggestions()
    }
})

const makeLabel = (name, value, unit) => {
    let li = document.createElement('li')
    li.classList.add('item')
    if (unit == '&deg;') {
        li.innerHTML = `
            <div class="item-label">${name}</div>
            <div class="item-value">${value}${unit}</div>
        `
    } else {
        li.innerHTML = `
            <div class="item-label">${name}</div>
            <div class="item-value">${value}
                <span class="unit">${unit}</span>
            </div>
        `
    }
    labelCont.append(li)
}

const getCurrentDate = () => {
    let date = new Date()
    let day = (date.getDay() + 1).toString().padStart(2, '0')
    let month = (date.getMonth() + 1).toString().padStart(2, '0')
    let year = date.getFullYear()
    let hour = date.getHours().toString().padStart(2, '0')

    let formatDate = `${year}-${month}-${day}T${hour}:00`
    return formatDate
}

const geoCodingResult = async (city) => {
    let response = await fetch(`${GC_BASE_URL}?name=${city}`)
    let data = await response.json()
    result = data.results[0]

    lat = result.latitude
    lon = result.longitude

    // if(!lat || !lon) {


    //     alert('API is not in working state! try again later.')
    // }
}

const getTemp = async (city) => {
    // if (!lat || !lon) {
    //     return
    // }
    await geoCodingResult(city)
    let response = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,surface_pressure,wind_speed_10m,wind_direction_10m,is_day,weather_code`)
    let data = await response.json()

    let hourly = data.hourly
    let temp = hourly.temperature_2m
    let time = hourly.time
    let apparentTemp = hourly.apparent_temperature

    let date = getCurrentDate()

    let index = time.indexOf(date)
    let currentTemp = Math.floor(temp[index])

    let surfacePressure = hourly.surface_pressure[index]
    let windSpeed = hourly.wind_speed_10m[index]
    let windDirect = hourly.wind_direction_10m[index]
    let relHumidity = hourly.relative_humidity_2m[index]

    feelsLikeTemp = Math.floor(apparentTemp[index])

    labelCont.innerHTML = ""
    makeLabel('Surface Pressure', surfacePressure, 'hPa')
    makeLabel('Wind Speed', windSpeed, 'km/h')
    makeLabel('Wind Direction', windDirect, '&deg;')
    makeLabel('Relative Humidity', relHumidity, '&#37')

    return currentTemp
}

showWeatherData = async (cityName) => {
    const temp = await getTemp(cityName)
    if (temp) {
        currentCity.innerHTML = `${cityName}`
        tempValue.innerHTML = `${temp}&deg;`
    } else {
        tempValue.innerHTML = `...`
        alert('Something broken! try again later')
    }

    if (feelsLikeTemp) {
        feelsLike.innerHTML = `Feels like ${feelsLikeTemp}&deg;`
    }
}

suggestions.addEventListener('click', (e) => {
    if (e.target.matches('li')) {
        let cityName = e.target.innerHTML.toLowerCase()
        searchBox.value = `${e.target.innerHTML}`
        showWeatherData(e.target.innerHTML)
    }
})