// site-detail.js
const API_BASE = "http://localhost:5000/api"

// Mock functions (replace with actual implementations or imports)
function initParticles() {
  console.warn("initParticles() is a mock function. Implement or import it.")
}

function getWallet() {
  console.warn("getWallet() is a mock function. Implement or import it.")
  return localStorage.getItem("walletAddress")
}

function saveWallet(wallet) {
  console.warn("saveWallet() is a mock function. Implement or import it.")
  localStorage.setItem("walletAddress", wallet)
}

function getUrlParam(param) {
  console.warn("getUrlParam() is a mock function. Implement or import it.")
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

function showLoading(elementId) {
  console.warn("showLoading() is a mock function. Implement or import it.")
  document.getElementById(elementId).innerHTML = `<div class="card"><p>Loading...</p></div>`
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize particles
  initParticles()

  // Setup wallet button
  const walletBtn = document.getElementById("walletBtn")
  const savedWallet = getWallet()

  if (savedWallet) {
    walletBtn.textContent = `${savedWallet.substring(0, 6)}...${savedWallet.substring(savedWallet.length - 4)}`
  }

  walletBtn.addEventListener("click", () => {
    const wallet = prompt("Enter your wallet address:", savedWallet || "")
    if (wallet) {
      saveWallet(wallet)
      walletBtn.textContent = `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`
    }
  })

  // Get site ID from URL
  const siteId = getUrlParam("siteId")
  if (siteId) {
    loadSiteDetails(siteId)
  } else {
    document.getElementById("siteDetail").innerHTML = `
      <div class="card">
        <p>No site specified. Please select a site from the map.</p>
        <button class="btn" onclick="window.location.href='index.html'">Back to Map</button>
      </div>
    `
  }
})

async function loadSiteDetails(siteId) {
  try {
    showLoading("siteDetail")

    // Fetch all sites
    const sitesRes = await fetch(`${API_BASE}/sites`)
    const sites = await sitesRes.json()

    // Find the specific site
    const site = sites.find((s) => s.siteId === siteId)

    if (!site) {
      document.getElementById("siteDetail").innerHTML = `
        <div class="card">
          <p>Site not found. Please select a valid site from the map.</p>
          <button class="btn" onclick="window.location.href='index.html'">Back to Map</button>
        </div>
      `
      return
    }

    // Check if user already has a token for this site
    const userWallet = getWallet()
    let hasToken = false

    if (userWallet) {
      const userRes = await fetch(`${API_BASE}/user/${userWallet}`)
      if (userRes.ok) {
        const user = await userRes.json()

        if (user.collectedTokens && user.collectedTokens.length > 0) {
          const tokensRes = await fetch(`${API_BASE}/tokens`)
          const allTokens = await tokensRes.json()

          hasToken = allTokens.some((token) => user.collectedTokens.includes(token.tokenId) && token.siteId === siteId)
        }
      }
    }

    const html = `
      <div class="site-container">
        <button class="btn btn-sm" style="align-self: flex-start;" onclick="window.location.href='index.html'">
          ← Back to Map
        </button>
        
        <div class="site-header">
          🏛️
        </div>
        
        <div class="page-header" style="margin: 0;">
          <h1>${site.name}</h1>
        </div>
        
        <div class="site-content">
          <div class="site-description">
            <h3 style="margin-bottom: 15px; color: var(--accent);">About this Site</h3>
            <p>${site.description || "No description available for this heritage site."}</p>
            
            <div class="site-map" id="siteMap"></div>
          </div>
          
          <div class="site-actions">
            <h3 style="margin-bottom: 15px; color: var(--accent);">Actions</h3>
            
            ${
              hasToken
                ? `<div class="card" style="background-color: var(--bg-secondary);">
                <p>You already own a token for this site!</p>
                <button class="btn btn-sm" style="margin-top: 10px;" onclick="window.location.href='gallery.html'">View in Gallery</button>
              </div>`
                : `<button class="btn" onclick="mintToken('${siteId}')">Mint Token</button>
              <p style="font-size: 0.9rem; color: var(--text-secondary);">
                Collect a digital token representing this heritage site.
              </p>`
            }
            
            <button class="btn btn-outline" onclick="window.location.href='marketplace.html'">Check Marketplace</button>
          </div>
        </div>
      </div>
    `

    document.getElementById("siteDetail").innerHTML = html

    // Initialize the mini map
    setTimeout(() => {
      // Check if L is defined, if not, try to load Leaflet CSS and JS
      if (typeof L === "undefined") {
        console.warn("Leaflet is not defined. Attempting to load it dynamically.")
        const leafletCSS = document.createElement("link")
        leafletCSS.rel = "stylesheet"
        leafletCSS.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        leafletCSS.integrity =
          "sha512-xodZBNTC5n17Xt2atTPvknnq6zQiJYuUqsLg5W+yrDdn/JjZyvLj6CJh/3LCULn8ol6mdM86YizeZ3PTNJYIww=="
        leafletCSS.crossOrigin = ""
        document.head.appendChild(leafletCSS)

        const leafletJS = document.createElement("script")
        leafletJS.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
        leafletJS.integrity =
          "sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
        leafletJS.crossOrigin = ""
        leafletJS.onload = () => {
          console.log("Leaflet loaded successfully.")
          initializeMiniMap(site)
        }
        document.head.appendChild(leafletJS)
      } else {
        initializeMiniMap(site)
      }

      function initializeMiniMap(site) {
        const miniMap = L.map("siteMap").setView([site.lat, site.lng], 15)

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(miniMap)

        L.marker([site.lat, site.lng]).addTo(miniMap)

        // Disable zoom and pan for the mini map
        miniMap.dragging.disable()
        miniMap.touchZoom.disable()
        miniMap.doubleClickZoom.disable()
        miniMap.scrollWheelZoom.disable()
        miniMap.boxZoom.disable()
        miniMap.keyboard.disable()
        if (miniMap.tap) miniMap.tap.disable()
      }
    }, 100)
  } catch (err) {
    console.error(err)
    document.getElementById("siteDetail").innerHTML = `
      <div class="card">
        <p>Error loading site details. Please try again later.</p>
        <button class="btn" onclick="window.location.href='index.html'">Back to Map</button>
      </div>
    `
  }
}

async function mintToken(siteId) {
  const wallet = getWallet()

  if (!wallet) {
    alert("Please connect your wallet first.")
    return
  }

  try {
    const metadataURI = `ipfs://heritage/${siteId}`

    const res = await fetch(`${API_BASE}/simulate-mint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, metadataURI, owner: wallet }),
    })

    if (!res.ok) {
      const data = await res.json()
      alert("Error: " + data.error)
      return
    }

    const data = await res.json()

    alert(`Successfully minted token #${data.token.tokenId} for ${siteId}!`)

    // Reload the page to update the UI
    location.reload()
  } catch (err) {
    console.error(err)
    alert("An error occurred while minting the token.")
  }
}
