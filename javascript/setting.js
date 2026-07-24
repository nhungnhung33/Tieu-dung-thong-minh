// settings.js - File riêng quản lý Bảng Cài Đặt

document.addEventListener("DOMContentLoaded", function () {
    const settingsModal = document.getElementById("settingsModal");
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");
    const saveAccountBtn = document.getElementById("saveAccountBtn");
    const usernameInput = document.getElementById("usernameInput");
    const avatarItems = document.querySelectorAll(".avatar-item");
    const darkModeToggle = document.getElementById("darkModeToggle");

    // Lấy thông tin từ HTML
    const headerUserName = document.getElementById("headerUserName");
    const headerAvatar = document.getElementById("headerAvatar");

    // 1. TỰ ĐỘNG NẠP DỮ LIỆU ĐÃ LƯU KHI MỞ TRANG
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

    // Biến lưu Avatar đang chọn
    let selectedAvatarUrl = savedAvatar || (headerAvatar ? headerAvatar.src : "");

    // 2. CHỌN AVATAR KHI CLICK VÀO HÌNH
    avatarItems.forEach(function (item) {
        item.addEventListener("click", function () {
            avatarItems.forEach(a => a.classList.remove("selected"));
            item.classList.add("selected");
            // Lấy link ảnh từ thuộc tính src hoặc data-avatar
            selectedAvatarUrl = item.dataset.avatar || item.src;
        });
    });

    // 3. MỞ MODAL CÀI ĐẶT
    const navSettings = document.getElementById("navSettings") || document.getElementById("navSetting");
    if (navSettings && settingsModal) {
        navSettings.addEventListener("click", function (e) {
            e.preventDefault();
            settingsModal.classList.add("active");
        });
    }

    // 4. ĐÓNG MODAL
    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener("click", function () {
            settingsModal.classList.remove("active");
        });
    }

    // Click ra ngoài vùng xám để đóng modal
    if (settingsModal) {
        settingsModal.addEventListener("click", function (e) {
            if (e.target === settingsModal) {
                settingsModal.classList.remove("active");
            }
        });
    }

    // 5. XỬ LÝ KHI BẤM NÚT LƯU
    // XỬ LÝ KHI BẤM NÚT LƯU
    if (saveAccountBtn) {
        saveAccountBtn.addEventListener("click", function () {
            const newName = usernameInput ? usernameInput.value.trim() : "";

            if (newName !== "") {
                // 1. Cập nhật Tên & Avatar trên Header ngay lập tức
                if (headerUserName) headerUserName.innerText = newName;
                if (headerAvatar && selectedAvatarUrl) headerAvatar.src = selectedAvatarUrl;

                // 2. Lưu vào bộ nhớ máy
                localStorage.setItem("userName", newName);
                if (selectedAvatarUrl) localStorage.setItem("userAvatar", selectedAvatarUrl);

                // 3. ĐÓNG BẢNG LUÔN - KHÔNG HIỆN THÔNG BÁO BÁO GÌ CẢ
                settingsModal.classList.remove("active");
            }
        });
    }
    // 6. BẬT / TẮT DARK MODE
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