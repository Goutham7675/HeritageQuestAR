// marketplace.js
const API_BASE = "http://localhost:5000/api"

// Mock functions for getWallet, saveWallet, and showLoading
// In a real application, these would be implemented properly
function getWallet() {
  return localStorage.getItem("walletAddress")
}

function saveWallet(walletAddress) {
  localStorage.setItem("walletAddress", walletAddress)
}

function showLoading(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.innerHTML = `<div class="loading">Loading...</div>`
  }
}

document.addEventListener("DOMContentLoaded", () => {
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

  loadMarketplace()

  // Set up interval to update countdown timers
  setInterval(updateCountdowns, 1000)
})

async function loadMarketplace() {
  try {
    showLoading("marketplace")

    // Try to fetch tokens using the dedicated marketplace endpoint.
    const res = await fetch(`${API_BASE}/tokens/marketplace`)
    let tokens = []

    if (res.ok) {
      tokens = await res.json()
    } else {
      // Fallback: fetch all tokens and filter those with forAuction true.
      const allRes = await fetch(`${API_BASE}/tokens`)
      const allTokens = await allRes.json()
      tokens = allTokens.filter((token) => token.forAuction)
    }

    if (tokens.length === 0) {
      document.getElementById("marketplace").innerHTML = `
        <div class="empty-marketplace">
          <p>No tokens currently listed in the marketplace.</p>
          <button class="btn" onclick="window.location.href='gallery.html'">Check Your Gallery</button>
        </div>
      `
      return
    }

    let html = `<div class="marketplace-grid">`

    tokens.forEach((token) => {
      const timeLeft = getTimeLeft(token.auctionEnds)
      const timeLeftClass = timeLeft.includes("Ended") ? "text-danger" : ""

      html += `
        <div class="auction-card" data-token-id="${token.tokenId}" data-ends="${token.auctionEnds}">
          <div class="auction-image">🏛️</div>
          <div class="auction-details">
            <div class="auction-title">Token #${token.tokenId}</div>
            <div class="auction-info">Site: ${token.siteId}</div>
            
            <div class="auction-bid">
              <div>Current Bid:</div>
              <div class="auction-bid-amount">${token.highestBid || 0} ETH</div>
              <div class="auction-info">${token.highestBidder ? `by ${formatAddress(token.highestBidder)}` : "No bids yet"}</div>
            </div>
            
            <div class="auction-time ${timeLeftClass}">
              <span>⏱️</span>
              <span class="countdown" data-ends="${token.auctionEnds}">${timeLeft}</span>
            </div>
            
            <div class="auction-actions" style="margin-top: 15px;">
              <button class="btn btn-sm" onclick="bidToken(${token.tokenId})">Place Bid</button>
              ${
                timeLeft.includes("Ended")
                  ? `<button class="btn btn-sm btn-outline" onclick="closeAuction(${token.tokenId})">Close Auction</button>`
                  : ""
              }
            </div>
          </div>
        </div>
      `
    })

    html += `</div>`
    document.getElementById("marketplace").innerHTML = html
  } catch (err) {
    console.error(err)
    document.getElementById("marketplace").innerHTML = `
      <div class="card">
        <p>Error loading marketplace. Please try again later.</p>
        <button class="btn btn-sm" onclick="location.reload()">Retry</button>
      </div>
    `
  }
}

function formatAddress(address) {
  if (!address) return "Unknown"
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

function getTimeLeft(endTimeStr) {
  if (!endTimeStr) return "N/A"

  const endTime = new Date(endTimeStr)
  const now = new Date()

  if (now > endTime) return "Auction Ended"

  const diff = endTime - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else {
    return `${minutes}m ${seconds}s`
  }
}

function updateCountdowns() {
  const countdowns = document.querySelectorAll(".countdown")
  countdowns.forEach((el) => {
    const endTime = el.getAttribute("data-ends")
    el.textContent = getTimeLeft(endTime)

    // Update the class if auction ended
    if (el.textContent.includes("Ended")) {
      el.parentElement.classList.add("text-danger")

      // Add close auction button if not present
      const tokenId = el.closest(".auction-card").getAttribute("data-token-id")
      const actionsDiv = el.closest(".auction-card").querySelector(".auction-actions")

      if (!actionsDiv.querySelector("button:nth-child(2)")) {
        const closeBtn = document.createElement("button")
        closeBtn.className = "btn btn-sm btn-outline"
        closeBtn.textContent = "Close Auction"
        closeBtn.onclick = () => closeAuction(tokenId)
        actionsDiv.appendChild(closeBtn)
      }
    }
  })
}

async function bidToken(tokenId) {
  const bidder = getWallet() || prompt("Enter your wallet address:")
  if (!bidder) return

  const amountStr = prompt("Enter your bid amount (ETH):")
  const amount = Number.parseFloat(amountStr)

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid bid amount")
    return
  }

  try {
    const res = await fetch(`${API_BASE}/tokens/${tokenId}/bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidder, amount }),
    })

    if (!res.ok) {
      const data = await res.json()
      alert("Error: " + data.error)
      return
    }

    alert("Bid placed successfully!")
    loadMarketplace()
  } catch (err) {
    console.error(err)
    alert("An error occurred while placing the bid.")
  }
}

async function closeAuction(tokenId) {
  try {
    const res = await fetch(`${API_BASE}/tokens/${tokenId}/close-auction`, {
      method: "POST",
    })

    if (!res.ok) {
      const data = await res.json()
      alert("Error: " + data.error)
      return
    }

    const data = await res.json()

    if (data.token.sold) {
      alert(
        `Auction closed successfully! Token sold to ${formatAddress(data.token.owner)} for ${data.token.salePrice} ETH`,
      )
    } else {
      alert("Auction closed. No bids were placed.")
    }

    loadMarketplace()
  } catch (err) {
    console.error(err)
    alert("An error occurred while closing the auction.")
  }
}
