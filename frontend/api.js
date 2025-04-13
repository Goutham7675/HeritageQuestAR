const API_BASE = "http://localhost:5000/api"

// async function simulateMint(siteId, metadataURI, owner) {
//   const res = await fetch(`${API_BASE}/simulate-mint`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ siteId, metadataURI, owner }),
//   })
//   if (!res.ok) throw new Error((await res.json()).error)
//   return (await res.json()).token
// }

// async function startAuction(tokenId, durationMinutes) {
//   const res = await fetch(`${API_BASE}/tokens/${tokenId}/auction`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ durationMinutes }),
//   })
//   if (!res.ok) throw new Error((await res.json()).error)
//   return (await res.json()).token
// }

// api.js

async function simulateMint(siteId, metaUrl, user) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ tokenId: "token-" + siteId });
    }, 1000);
  });
}

async function startAuction(tokenId, price) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ tokenId: tokenId, startingPrice: price });
    }, 1000);
  });
}

async function placeBid(tokenId, bidder, amount) {
  const res = await fetch(`${API_BASE}/tokens/${tokenId}/bid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bidder, amount }),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).token
}

async function closeAuction(tokenId) {
  const res = await fetch(`${API_BASE}/tokens/${tokenId}/close-auction`, {
    method: "POST",
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).token
}
