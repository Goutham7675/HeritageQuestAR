// Initialize particles.js
function initParticles() {
    if (typeof particlesJS !== "undefined") {
      particlesJS("particles-js", {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              value_area: 800,
            },
          },
          color: {
            value: "#3f51b5",
          },
          shape: {
            type: "circle",
            stroke: {
              width: 0,
              color: "#000000",
            },
          },
          opacity: {
            value: 0.3,
            random: false,
            anim: {
              enable: false,
              speed: 1,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: false,
              speed: 40,
              size_min: 0.1,
              sync: false,
            },
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#3f51b5",
            opacity: 0.3,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200,
            },
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab",
            },
            onclick: {
              enable: true,
              mode: "push",
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 1,
              },
            },
            bubble: {
              distance: 400,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
            push: {
              particles_nb: 4,
            },
            remove: {
              particles_nb: 2,
            },
          },
        },
        retina_detect: true,
      })
    }
  }
  
  // Show loading spinner
  function showLoading(elementId) {
    const element = document.getElementById(elementId)
    if (element) {
      element.innerHTML = '<div class="loading"></div>'
    }
  }
  
  // Show error message
  function showError(elementId, message) {
    const element = document.getElementById(elementId)
    if (element) {
      element.innerHTML = `<div class="card"><p class="text-danger">${message}</p></div>`
    }
  }
  
  // Format date
  function formatDate(dateString) {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString()
  }
  
  // Get URL parameters
  function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
  }
  
  // Store user wallet in localStorage
  function saveWallet(wallet) {
    localStorage.setItem("userWallet", wallet)
  }
  
  // Get user wallet from localStorage
  function getWallet() {
    return localStorage.getItem("userWallet")
  }
  
  // Ask for wallet if not stored
  function promptForWallet() {
    const savedWallet = getWallet()
    if (savedWallet) {
      return savedWallet
    }
  
    const wallet = prompt("Enter your wallet address:")
    if (wallet) {
      saveWallet(wallet)
    }
    return wallet
  }
  
  // Initialize common elements
  document.addEventListener("DOMContentLoaded", () => {
    // Add particles container if it doesn't exist
    if (!document.getElementById("particles-js")) {
      const particlesContainer = document.createElement("div")
      particlesContainer.id = "particles-js"
      document.body.prepend(particlesContainer)
    }
  
    // Initialize particles
    initParticles()
  })
  