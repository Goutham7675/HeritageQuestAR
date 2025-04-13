// gallery.js
const API_BASE = "http://localhost:5000/api"

// Mock functions - replace with actual implementations or imports
function promptForWallet() {
  return prompt("Enter your wallet address:")
}

function saveWallet(wallet) {
  localStorage.setItem("wallet", wallet)
}

function showLoading(elementId) {
  document.getElementById(elementId).innerHTML = `<p>Loading...</p>`
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function getWallet() {
  return localStorage.getItem("wallet")
}

document.addEventListener("DOMContentLoaded", () => {
  // Setup wallet button
  const walletBtn = document.getElementById("walletBtn")
  const userWallet = promptForWallet()

  if (userWallet) {
    walletBtn.textContent = `${userWallet.substring(0, 6)}...${userWallet.substring(userWallet.length - 4)}`
    loadGallery(userWallet)
  } else {
    document.getElementById("gallery").innerHTML = `
      <div class="empty-gallery">
        <p>Please connect your wallet to view your tokens.</p>
        <button class="btn" onclick="location.reload()">Connect Wallet</button>
      </div>
    `
  }

  walletBtn.addEventListener("click", () => {
    const wallet = prompt("Enter your wallet address:", userWallet || "")
    if (wallet) {
      saveWallet(wallet)
      walletBtn.textContent = `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`
      loadGallery(wallet)
    }
  })
})

async function loadGallery(userWallet) {
  try {
    showLoading("gallery")

    const res = await fetch(`${API_BASE}/user/${userWallet}`)
    if (!res.ok) {
      document.getElementById("gallery").innerHTML = `
        <div class="card">
          <p>User not found or an error occurred.</p>
          <button class="btn btn-sm" onclick="location.reload()">Try Again</button>
        </div>
      `
      return
    }

    const user = await res.json()

    if (!user.collectedTokens || user.collectedTokens.length === 0) {
      document.getElementById("gallery").innerHTML = `
        <div class="empty-gallery">
          <p>You don't have any tokens yet. Explore the map to find heritage sites and collect tokens!</p>
          <button class="btn" onclick="window.location.href='index.html'">Explore Map</button>
        </div>
      `
      return
    }

    // Fetch all tokens to get details
    const tokensRes = await fetch(`${API_BASE}/tokens`)
    const allTokens = await tokensRes.json()

    // Filter tokens owned by the user
    const userTokens = allTokens.filter((token) => user.collectedTokens.includes(token.tokenId))

    let html = `<div class="gallery-grid">`

    userTokens.forEach((token) => {
      html += `
        <div class="token-card">
          <div class="token-image">🏛️</div>
          <div class="token-details">
            <div class="token-title">Token #${token.tokenId}</div>
            <div class="token-info">Site: ${token.siteId}</div>
            <div class="token-info">Minted: ${formatDate(token.mintedAt)}</div>
            <div class="token-actions">
              <button class="btn btn-sm" onclick="viewTokenDetails(${token.tokenId})">View Details</button>
              ${
                !token.forAuction
                  ? `<button class="btn btn-sm btn-outline" onclick="startTokenAuction(${token.tokenId})">Sell Token</button>`
                  : `<span class="badge badge-warning">In Auction</span>`
              }
            </div>
          </div>
        </div>
      `
    })

    html += `</div>`
    document.getElementById("gallery").innerHTML = html
  } catch (err) {
    console.error(err)
    document.getElementById("gallery").innerHTML = `
      <div class="card">
        <p>Error loading gallery. Please try again later.</p>
        <button class="btn btn-sm" onclick="location.reload()">Retry</button>
      </div>
    `
  }
}

async function viewTokenDetails(tokenId) {
  // In a real app, this would navigate to a token detail page
  alert(`View details for token #${tokenId}`)
}

async function startTokenAuction(tokenId) {
  const duration = prompt("Enter auction duration in minutes:", "60")
  if (!duration) return

  const durationMinutes = Number.parseInt(duration)
  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    alert("Please enter a valid duration")
    return
  }

  try {
    const res = await fetch(`${API_BASE}/tokens/${tokenId}/auction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationMinutes }),
    })

    if (!res.ok) {
      const data = await res.json()
      alert("Error: " + data.error)
      return
    }

    alert("Auction started successfully!")
    // Reload gallery to reflect changes
    loadGallery(getWallet())
  } catch (err) {
    console.error(err)
    alert("An error occurred while starting the auction.")
  }
}
