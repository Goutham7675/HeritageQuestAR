// user.js
const API_BASE = "http://localhost:5000/api"

// Mock functions - replace with actual implementations or imports
function getWallet() {
  return localStorage.getItem("walletAddress")
}

function promptForWallet() {
  return prompt("Enter your wallet address:")
}

function saveWallet(walletAddress) {
  localStorage.setItem("walletAddress", walletAddress)
}

function showLoading(elementId) {
  document.getElementById(elementId).innerHTML = `<p>Loading...</p>`
}

document.addEventListener("DOMContentLoaded", () => {
  // Setup wallet button
  const walletBtn = document.getElementById("walletBtn")
  let wallet = getWallet()

  if (!wallet) {
    wallet = promptForWallet()
  }

  if (wallet) {
    walletBtn.textContent = `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`
    loadUserInfo(wallet)
  } else {
    document.getElementById("userInfo").innerHTML = `
      <div class="card">
        <p>Please connect your wallet to view your profile.</p>
        <button class="btn" onclick="location.reload()">Connect Wallet</button>
      </div>
    `
  }

  walletBtn.addEventListener("click", () => {
    const newWallet = prompt("Enter your wallet address:", wallet || "")
    if (newWallet) {
      saveWallet(newWallet)
      walletBtn.textContent = `${newWallet.substring(0, 6)}...${newWallet.substring(newWallet.length - 4)}`
      loadUserInfo(newWallet)
    }
  })
})

async function loadUserInfo(wallet) {
  try {
    showLoading("userInfo")

    const res = await fetch(`${API_BASE}/user/${wallet}`)
    if (!res.ok) {
      document.getElementById("userInfo").innerHTML = `
        <div class="card">
          <p>User not found or an error occurred.</p>
          <button class="btn btn-sm" onclick="createNewUser('${wallet}')">Create Profile</button>
        </div>
      `
      return
    }

    const user = await res.json()

    // Get tokens data
    let userTokens = []
    if (user.collectedTokens && user.collectedTokens.length > 0) {
      const tokensRes = await fetch(`${API_BASE}/tokens`)
      const allTokens = await tokensRes.json()
      userTokens = allTokens.filter((token) => user.collectedTokens.includes(token.tokenId))
    }

    // Calculate stats
    const totalTokens = user.collectedTokens ? user.collectedTokens.length : 0
    const tokensInAuction = userTokens.filter((token) => token.forAuction).length
    const tokensSold = userTokens.filter((token) => token.sold).length

    let html = `
      <div class="profile-container">
        <div class="profile-header">
          <div class="profile-avatar">👤</div>
          <div class="profile-info">
            <h2>${user.name || "Heritage Collector"}</h2>
            <div class="profile-address">${user.walletAddress}</div>
            <button class="btn btn-sm" style="margin-top: 10px;" onclick="editProfile('${user.walletAddress}')">Edit Profile</button>
          </div>
        </div>
        
        <div class="profile-stats">
          <div class="stat-card">
            <div class="stat-label">Total Tokens</div>
            <div class="stat-value">${totalTokens}</div>
            <button class="btn btn-sm" onclick="window.location.href='gallery.html'">View Gallery</button>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">In Auction</div>
            <div class="stat-value">${tokensInAuction}</div>
            <button class="btn btn-sm" onclick="window.location.href='marketplace.html'">View Market</button>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Tokens Sold</div>
            <div class="stat-value">${tokensSold}</div>
          </div>
        </div>
    `

    if (totalTokens > 0) {
      html += `
        <div class="token-list">
          <h3>Your Collection</h3>
          <div class="token-grid">
      `

      user.collectedTokens.forEach((tokenId) => {
        html += `
          <div class="token-mini" onclick="window.location.href='gallery.html'">
            <div class="token-mini-icon">🏛️</div>
            <div class="token-mini-id">#${tokenId}</div>
          </div>
        `
      })

      html += `
          </div>
        </div>
      `
    }

    html += `</div>`
    document.getElementById("userInfo").innerHTML = html
  } catch (err) {
    console.error(err)
    document.getElementById("userInfo").innerHTML = `
      <div class="card">
        <p>Error loading user data. Please try again later.</p>
        <button class="btn btn-sm" onclick="location.reload()">Retry</button>
      </div>
    `
  }
}

async function editProfile(walletAddress) {
  const name = prompt("Enter your display name:")
  if (!name) return

  // In a real app, you would have an API endpoint to update the user profile
  alert(`Profile update functionality would be implemented here for ${name}`)

  // For now, just reload the page
  location.reload()
}

async function createNewUser(walletAddress) {
  // In a real app, you would have an API endpoint to create a new user
  alert(`User creation functionality would be implemented here for ${walletAddress}`)

  // For now, just reload the page
  location.reload()
}
