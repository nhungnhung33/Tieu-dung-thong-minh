

document.addEventListener("DOMContentLoaded", function () {
    const settingsModal = document.getElementById("settingsModal");
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");
    const saveAccountBtn = document.getElementById("saveAccountBtn");
    const usernameInput = document.getElementById("usernameInput");
    const avatarItems = document.querySelectorAll(".avatar-item");
    const darkModeToggle = document.getElementById("darkModeToggle");

   
    const headerUserName = document.getElementById("headerUserName");
    const headerAvatar = document.getElementById("headerAvatar");

   
    const savedName = localStorage.getItem("userName");
    const savedAvatar = localStorage.getItem("userAvatar");
    const savedDarkMode = localStorage.getItem("darkMode") === "true";

    if (savedName) {
        if (usernameInput) usernameInput.value = savedName;
        if (headerUserName) headerUserName.innerText = savedName;
    }
    if (savedAvatar) {
        if (headerAvatar) headerAvatar.src = savedAvatar;
    }
    if (savedDarkMode && darkModeToggle) {
        darkModeToggle.checked = true;
        document.body.classList.add("dark-mode");
    }

    
    let selectedAvatarUrl = savedAvatar || (headerAvatar ? headerAvatar.src : "");


    avatarItems.forEach(function (item) {
        item.addEventListener("click", function () {
            avatarItems.forEach(a => a.classList.remove("selected"));
            item.classList.add("selected");
            
            selectedAvatarUrl = item.dataset.avatar || item.src;
        });
    });

  
    const navSettings = document.getElementById("navSettings") || document.getElementById("navSetting");
    if (navSettings && settingsModal) {
        navSettings.addEventListener("click", function (e) {
            e.preventDefault();
            settingsModal.classList.add("active");
        });
    }

  
    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener("click", function () {
            settingsModal.classList.remove("active");
        });
    }

   
    if (settingsModal) {
        settingsModal.addEventListener("click", function (e) {
            if (e.target === settingsModal) {
                settingsModal.classList.remove("active");
            }
        });
    }

    
    if (saveAccountBtn) {
        saveAccountBtn.addEventListener("click", function () {
            const newName = usernameInput ? usernameInput.value.trim() : "";

            if (newName !== "") {
              
                if (headerUserName) headerUserName.innerText = newName;
                if (headerAvatar && selectedAvatarUrl) headerAvatar.src = selectedAvatarUrl;

               
                localStorage.setItem("userName", newName);
                if (selectedAvatarUrl) localStorage.setItem("userAvatar", selectedAvatarUrl);

          
                settingsModal.classList.remove("active");
            }
        });
    }
  
    if (darkModeToggle) {
        darkModeToggle.addEventListener("change", function (e) {
            const isDark = e.target.checked;
            localStorage.setItem("darkMode", isDark);
            
            if (isDark) {
                document.body.classList.add("dark-mode");
            } else {
                document.body.classList.remove("dark-mode");
            }
        });
    }
});
