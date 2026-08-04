"use strict";

/* =========================================================
   رحلة مشروع - Project Journey
   الملف العام المشترك بين جميع الصفحات
   js/main.js
========================================================= */

const ProjectJourney = {
    version: "1.0.0",

    storageKeys: {
        currentUser: "projectJourneyCurrentUser",
        users: "projectJourneyUsers",
        projects: "projectJourneyProjects",
        settings: "projectJourneySettings",
        adminSettings: "projectJourneyAdminSettings",
        notifications: "projectJourneyNotifications",
        theme: "projectJourneyTheme",
        language: "projectJourneyLanguage"
    },

    state: {
        currentUser: null,
        settings: {},
        notifications: []
    }
};

/* =========================================================
   أدوات الوصول إلى العناصر
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}

function selectElement(selector, parent = document) {
    return parent.querySelector(selector);
}

function selectElements(selector, parent = document) {
    return Array.from(
        parent.querySelectorAll(selector)
    );
}

/* =========================================================
   التعامل مع LocalStorage
========================================================= */

function readStorage(key, fallback = null) {
    try {
        const storedValue =
            localStorage.getItem(key);

        if (storedValue === null) {
            return fallback;
        }

        return JSON.parse(storedValue);
    } catch (error) {
        console.error(
            `تعذر قراءة البيانات من LocalStorage: ${key}`,
            error
        );

        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;
    } catch (error) {
        console.error(
            `تعذر حفظ البيانات في LocalStorage: ${key}`,
            error
        );

        showToast(
            "تعذر حفظ البيانات في المتصفح.",
            "error"
        );

        return false;
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(
            `تعذر حذف البيانات: ${key}`,
            error
        );

        return false;
    }
}

function clearProjectJourneyStorage() {
    const keysToDelete = [];

    for (
        let index = 0;
        index < localStorage.length;
        index += 1
    ) {
        const key = localStorage.key(index);

        if (
            key &&
            key.startsWith("projectJourney")
        ) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(
        (key) => {
            localStorage.removeItem(key);
        }
    );
}

/* =========================================================
   إنشاء المعرفات
========================================================= */

function createId(prefix = "ITEM") {
    const timePart =
        Date.now().toString(36);

    const randomPart =
        Math.random()
            .toString(36)
            .slice(2, 10);

    return `${prefix}-${timePart}-${randomPart}`.toUpperCase();
}

/* =========================================================
   حماية وعرض النصوص
========================================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function truncateText(
    value,
    maximumLength = 100
) {
    const text = String(value || "");

    if (
        text.length <= maximumLength
    ) {
        return text;
    }

    return (
        text.slice(
            0,
            maximumLength
        ) + "..."
    );
}

/* =========================================================
   التحقق من المدخلات
========================================================= */

function isValidEmail(email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
        String(email || "").trim()
    );
}

function isValidPhone(phone) {
    const cleanPhone =
        String(phone || "")
            .replace(/\s+/g, "");

    return /^[+]?[0-9]{7,15}$/.test(
        cleanPhone
    );
}

function isStrongPassword(password) {
    const value =
        String(password || "");

    return (
        value.length >= 8 &&
        /[A-Za-z]/.test(value) &&
        /[0-9]/.test(value)
    );
}

function validateRequired(value) {
    return String(value || "").trim().length > 0;
}

/* =========================================================
   تنسيق الأرقام والتواريخ
========================================================= */

function formatNumber(value) {
    return new Intl.NumberFormat(
        "ar"
    ).format(
        Number(value) || 0
    );
}

function formatCurrency(
    value,
    currency = "OMR"
) {
    const amount =
        Number(value) || 0;

    return (
        new Intl.NumberFormat(
            "ar",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        ).format(amount) +
        " " +
        currency
    );
}

function formatDate(
    value,
    options = {}
) {
    if (!value) {
        return "غير محدد";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "غير محدد";
    }

    const defaultOptions = {
        year: "numeric",
        month: "short",
        day: "numeric"
    };

    return new Intl.DateTimeFormat(
        "ar",
        {
            ...defaultOptions,
            ...options
        }
    ).format(date);
}

function formatDateTime(value) {
    return formatDate(
        value,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function formatTime(value) {
    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "ar",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}

function getRelativeTime(value) {
    if (!value) {
        return "غير محدد";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "غير محدد";
    }

    const difference =
        Date.now() - date.getTime();

    const minute =
        60 * 1000;

    const hour =
        60 * minute;

    const day =
        24 * hour;

    if (difference < minute) {
        return "الآن";
    }

    if (difference < hour) {
        const minutes =
            Math.floor(
                difference / minute
            );

        return `منذ ${minutes} دقيقة`;
    }

    if (difference < day) {
        const hours =
            Math.floor(
                difference / hour
            );

        return `منذ ${hours} ساعة`;
    }

    if (difference < day * 7) {
        const days =
            Math.floor(
                difference / day
            );

        return `منذ ${days} يوم`;
    }

    return formatDate(date);
}

/* =========================================================
   معلومات المستخدم
========================================================= */

function loadCurrentUser() {
    ProjectJourney.state.currentUser =
        readStorage(
            ProjectJourney.storageKeys.currentUser,
            null
        );

    return ProjectJourney.state.currentUser;
}

function getCurrentUser() {
    if (
        !ProjectJourney.state.currentUser
    ) {
        loadCurrentUser();
    }

    return ProjectJourney.state.currentUser;
}

function setCurrentUser(user) {
    ProjectJourney.state.currentUser =
        user;

    saveStorage(
        ProjectJourney.storageKeys.currentUser,
        user
    );

    updateUserInterface();

    return user;
}

function removeCurrentUser() {
    ProjectJourney.state.currentUser =
        null;

    removeStorage(
        ProjectJourney.storageKeys.currentUser
    );
}

function getUserDisplayName(user) {
    return (
        user?.fullName ||
        user?.name ||
        user?.username ||
        "مستخدم"
    );
}

function getUserInitials(userOrName) {
    const name =
        typeof userOrName === "string"
            ? userOrName
            : getUserDisplayName(userOrName);

    return String(name || "م")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            (part) =>
                part.charAt(0)
        )
        .join("");
}

function getRoleLabel(role) {
    const roles = {
        admin: "مدير النظام",
        entrepreneur: "رائد أعمال",
        beginner: "صاحب فكرة",
        expert: "خبير",
        investor: "مستثمر",
        mentor: "مرشد",
        user: "مستخدم"
    };

    return roles[role] || "مستخدم";
}

function updateUserInterface() {
    const user =
        getCurrentUser();

    selectElements(
        "[data-user-name]"
    ).forEach(
        (element) => {
            element.textContent =
                user
                    ? getUserDisplayName(user)
                    : "زائر";
        }
    );

    selectElements(
        "[data-user-email]"
    ).forEach(
        (element) => {
            element.textContent =
                user?.email ||
                "لا يوجد بريد";
        }
    );

    selectElements(
        "[data-user-role]"
    ).forEach(
        (element) => {
            element.textContent =
                getRoleLabel(
                    user?.role
                );
        }
    );

    selectElements(
        "[data-user-initials]"
    ).forEach(
        (element) => {
            element.textContent =
                getUserInitials(
                    user
                );
        }
    );

    selectElements(
        "[data-authenticated-only]"
    ).forEach(
        (element) => {
            element.hidden =
                !user;
        }
    );

    selectElements(
        "[data-guest-only]"
    ).forEach(
        (element) => {
            element.hidden =
                Boolean(user);
        }
    );
}

/* =========================================================
   تسجيل الخروج
========================================================= */

function logoutUser(
    redirectPage = "login.html"
) {
    const confirmed =
        window.confirm(
            "هل تريد تسجيل الخروج؟"
        );

    if (!confirmed) {
        return;
    }

    removeCurrentUser();

    showToast(
        "تم تسجيل الخروج بنجاح.",
        "success"
    );

    window.setTimeout(
        () => {
            window.location.href =
                redirectPage;
        },
        700
    );
}

function initializeLogoutButtons() {
    selectElements(
        "[data-logout]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();

                    logoutUser(
                        button.dataset
                            .logoutRedirect ||
                        "login.html"
                    );
                }
            );
        }
    );
}

/* =========================================================
   حماية الصفحات
========================================================= */

function requireAuthentication() {
    const body =
        document.body;

    const authenticationRequired =
        body.dataset.authRequired === "true";

    if (!authenticationRequired) {
        return true;
    }

    const user =
        getCurrentUser();

    if (!user) {
        window.location.replace(
            "login.html"
        );

        return false;
    }

    return true;
}

function requireAdminRole() {
    const body =
        document.body;

    const adminRequired =
        body.dataset.adminRequired === "true";

    if (!adminRequired) {
        return true;
    }

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "admin"
    ) {
        showToast(
            "هذه الصفحة متاحة للمدير فقط.",
            "error"
        );

        window.setTimeout(
            () => {
                window.location.replace(
                    "dashboard.html"
                );
            },
            700
        );

        return false;
    }

    return true;
}

/* =========================================================
   القائمة المتجاوبة
========================================================= */

function initializeMobileNavigation() {
    const menuButtons =
        selectElements(
            "#menuButton, [data-menu-button]"
        );

    menuButtons.forEach(
        (button) => {
            const navigationId =
                button.getAttribute(
                    "aria-controls"
                ) ||
                button.dataset
                    .menuTarget ||
                "mainNavigation";

            const navigation =
                getElement(navigationId);

            if (!navigation) {
                return;
            }

            button.addEventListener(
                "click",
                () => {
                    const open =
                        navigation.classList
                            .toggle("open");

                    button.textContent =
                        open
                            ? "×"
                            : "☰";

                    button.setAttribute(
                        "aria-expanded",
                        String(open)
                    );
                }
            );

            selectElements(
                "a",
                navigation
            ).forEach(
                (link) => {
                    link.addEventListener(
                        "click",
                        () => {
                            navigation.classList
                                .remove("open");

                            button.textContent =
                                "☰";

                            button.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    );
                }
            );

            document.addEventListener(
                "click",
                (event) => {
                    if (
                        !navigation.classList
                            .contains("open")
                    ) {
                        return;
                    }

                    if (
                        navigation.contains(
                            event.target
                        ) ||
                        button.contains(
                            event.target
                        )
                    ) {
                        return;
                    }

                    navigation.classList
                        .remove("open");

                    button.textContent =
                        "☰";

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        }
    );
}

/* =========================================================
   تحديد رابط الصفحة الحالية
========================================================= */

function highlightCurrentNavigation() {
    const currentFile =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase() ||
        "index.html";

    selectElements(
        ".navigation a, [data-navigation] a"
    ).forEach(
        (link) => {
            const linkFile =
                link.getAttribute("href")
                    ?.split("/")
                    .pop()
                    .toLowerCase();

            if (
                linkFile === currentFile
            ) {
                link.classList.add(
                    "active"
                );

                link.setAttribute(
                    "aria-current",
                    "page"
                );
            }
        }
    );
}

/* =========================================================
   الرسائل المنبثقة Toast
========================================================= */

function ensureToastContainer() {
    let container =
        getElement(
            "projectJourneyToastContainer"
        );

    if (container) {
        return container;
    }

    container =
        document.createElement("div");

    container.id =
        "projectJourneyToastContainer";

    container.className =
        "project-journey-toast-container";

    document.body.appendChild(
        container
    );

    return container;
}

function showToast(
    message,
    type = "info",
    duration = 3500
) {
    const container =
        ensureToastContainer();

    const toast =
        document.createElement("div");

    toast.className =
        `project-journey-toast toast-${type}`;

    const icons = {
        success: "✓",
        error: "!",
        warning: "⚠",
        info: "i"
    };

    toast.innerHTML = `
        <span class="project-journey-toast-icon">
            ${icons[type] || icons.info}
        </span>

        <span class="project-journey-toast-message">
            ${escapeHTML(message)}
        </span>

        <button
            type="button"
            class="project-journey-toast-close"
            aria-label="إغلاق الرسالة"
        >
            ×
        </button>
    `;

    container.appendChild(toast);

    const closeToast = () => {
        toast.classList.add(
            "toast-hiding"
        );

        window.setTimeout(
            () => {
                toast.remove();
            },
            250
        );
    };

    toast
        .querySelector(
            ".project-journey-toast-close"
        )
        .addEventListener(
            "click",
            closeToast
        );

    window.setTimeout(
        closeToast,
        duration
    );
}

/* =========================================================
   إضافة تنسيق Toast تلقائيًا
========================================================= */

function injectGlobalStyles() {
    if (
        getElement(
            "projectJourneyGlobalStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "projectJourneyGlobalStyles";

    style.textContent = `
        .project-journey-toast-container {
            position: fixed;
            left: 22px;
            bottom: 22px;
            z-index: 9999;
            width: min(370px, calc(100% - 44px));
            display: grid;
            gap: 10px;
            pointer-events: none;
        }

        .project-journey-toast {
            min-height: 58px;
            padding: 12px 13px;
            border-radius: 15px;
            display: grid;
            grid-template-columns: auto minmax(0, 1fr) auto;
            align-items: center;
            gap: 10px;
            color: #14213d;
            background: #ffffff;
            border: 1px solid #dbe7f7;
            box-shadow:
                0 18px 45px
                rgba(24, 71, 139, 0.16);
            animation:
                projectJourneyToastShow
                0.3s ease;
            pointer-events: auto;
        }

        .project-journey-toast.toast-hiding {
            opacity: 0;
            transform: translateY(12px);
            transition:
                opacity 0.25s ease,
                transform 0.25s ease;
        }

        .project-journey-toast-icon {
            width: 34px;
            height: 34px;
            border-radius: 11px;
            display: grid;
            place-items: center;
            color: #1565ff;
            background: #eaf2ff;
            font-weight: 900;
        }

        .toast-success
        .project-journey-toast-icon {
            color: #179b5f;
            background: #e9fff3;
        }

        .toast-error
        .project-journey-toast-icon {
            color: #dc3545;
            background: #fff0f1;
        }

        .toast-warning
        .project-journey-toast-icon {
            color: #f59e0b;
            background: #fff8e7;
        }

        .project-journey-toast-message {
            font-size: 12px;
            line-height: 1.7;
        }

        .project-journey-toast-close {
            width: 30px;
            height: 30px;
            padding: 0;
            border: 0;
            border-radius: 9px;
            color: #68758c;
            background: #f1f5fb;
            cursor: pointer;
        }

        .project-journey-loading-overlay {
            position: fixed;
            inset: 0;
            z-index: 9998;
            display: grid;
            place-items: center;
            background:
                rgba(15, 34, 63, 0.60);
            backdrop-filter: blur(5px);
        }

        .project-journey-loading-card {
            min-width: 240px;
            padding: 24px;
            border-radius: 21px;
            text-align: center;
            background: #ffffff;
            box-shadow:
                0 30px 80px
                rgba(5, 26, 59, 0.30);
        }

        .project-journey-spinner {
            width: 44px;
            height: 44px;
            margin: 0 auto 14px;
            border-radius: 50%;
            border:
                4px solid
                #eaf2ff;
            border-top-color:
                #1565ff;
            animation:
                projectJourneySpin
                0.8s linear infinite;
        }

        .project-journey-loading-card strong {
            display: block;
            font-size: 13px;
        }

        .project-journey-loading-card span {
            display: block;
            margin-top: 6px;
            color: #68758c;
            font-size: 10px;
        }

        @keyframes projectJourneyToastShow {
            from {
                opacity: 0;
                transform: translateY(15px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes projectJourneySpin {
            to {
                transform: rotate(360deg);
            }
        }

        @media (max-width: 600px) {
            .project-journey-toast-container {
                right: 16px;
                left: 16px;
                bottom: 16px;
                width: auto;
            }
        }
    `;

    document.head.appendChild(style);
}

/* =========================================================
   شاشة التحميل
========================================================= */

function showLoading(
    message = "جاري تحميل البيانات..."
) {
    let overlay =
        getElement(
            "projectJourneyLoadingOverlay"
        );

    if (!overlay) {
        overlay =
            document.createElement("div");

        overlay.id =
            "projectJourneyLoadingOverlay";

        overlay.className =
            "project-journey-loading-overlay";

        overlay.innerHTML = `
            <div class="project-journey-loading-card">

                <div class="project-journey-spinner"></div>

                <strong>
                    يرجى الانتظار
                </strong>

                <span
                    data-loading-message
                >
                    ${escapeHTML(message)}
                </span>

            </div>
        `;

        document.body.appendChild(
            overlay
        );
    } else {
        const text =
            selectElement(
                "[data-loading-message]",
                overlay
            );

        if (text) {
            text.textContent =
                message;
        }

        overlay.hidden =
            false;
    }
}

function hideLoading() {
    const overlay =
        getElement(
            "projectJourneyLoadingOverlay"
        );

    if (overlay) {
        overlay.hidden =
            true;
    }
}

/* =========================================================
   النوافذ المنبثقة
========================================================= */

function openModal(modal) {
    const element =
        typeof modal === "string"
            ? getElement(modal)
            : modal;

    if (!element) {
        return;
    }

    element.hidden =
        false;

    document.body.classList.add(
        "modal-open"
    );

    const focusable =
        selectElement(
            "input, textarea, select, button",
            element
        );

    window.setTimeout(
        () => {
            focusable?.focus();
        },
        50
    );
}

function closeModal(modal) {
    const element =
        typeof modal === "string"
            ? getElement(modal)
            : modal;

    if (!element) {
        return;
    }

    element.hidden =
        true;

    const openedModal =
        selectElement(
            ".modal:not([hidden])"
        );

    if (!openedModal) {
        document.body.classList.remove(
            "modal-open"
        );
    }
}

function initializeModals() {
    selectElements(
        "[data-open-modal]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    openModal(
                        button.dataset
                            .openModal
                    );
                }
            );
        }
    );

    selectElements(
        "[data-close-modal]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    closeModal(
                        button.closest(
                            ".modal"
                        )
                    );
                }
            );
        }
    );

    selectElements(
        ".modal"
    ).forEach(
        (modal) => {
            modal.addEventListener(
                "click",
                (event) => {
                    if (
                        event.target ===
                        modal
                    ) {
                        closeModal(modal);
                    }
                }
            );
        }
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key !== "Escape"
            ) {
                return;
            }

            const openedModal =
                selectElement(
                    ".modal:not([hidden])"
                );

            if (openedModal) {
                closeModal(
                    openedModal
                );
            }
        }
    );
}

/* =========================================================
   المظهر
========================================================= */

function loadTheme() {
    const savedTheme =
        localStorage.getItem(
            ProjectJourney.storageKeys.theme
        ) || "light";

    applyTheme(savedTheme);

    return savedTheme;
}

function applyTheme(theme) {
    const selectedTheme =
        theme === "dark"
            ? "dark"
            : "light";

    document.documentElement
        .setAttribute(
            "data-theme",
            selectedTheme
        );

    document.body.classList.toggle(
        "dark-theme",
        selectedTheme === "dark"
    );

    localStorage.setItem(
        ProjectJourney.storageKeys.theme,
        selectedTheme
    );

    selectElements(
        "[data-theme-icon]"
    ).forEach(
        (element) => {
            element.textContent =
                selectedTheme === "dark"
                    ? "☀️"
                    : "🌙";
        }
    );
}

function toggleTheme() {
    const currentTheme =
        document.documentElement
            .getAttribute(
                "data-theme"
            ) || "light";

    applyTheme(
        currentTheme === "dark"
            ? "light"
            : "dark"
    );
}

function initializeThemeButtons() {
    selectElements(
        "[data-theme-toggle]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                toggleTheme
            );
        }
    );
}

/* =========================================================
   النماذج
========================================================= */

function clearFieldError(field) {
    if (!field) {
        return;
    }

    field.classList.remove(
        "input-error"
    );

    const errorId =
        field.getAttribute(
            "aria-describedby"
        );

    if (errorId) {
        const errorElement =
            getElement(errorId);

        if (errorElement) {
            errorElement.textContent =
                "";
        }
    }

    const nearbyError =
        field.parentElement
            ?.querySelector(
                ".field-error"
            );

    if (nearbyError) {
        nearbyError.textContent =
            "";
    }
}

function showFieldError(
    field,
    message
) {
    if (!field) {
        return;
    }

    field.classList.add(
        "input-error"
    );

    const errorId =
        field.getAttribute(
            "aria-describedby"
        );

    if (errorId) {
        const errorElement =
            getElement(errorId);

        if (errorElement) {
            errorElement.textContent =
                message;

            return;
        }
    }

    const nearbyError =
        field.parentElement
            ?.querySelector(
                ".field-error"
            );

    if (nearbyError) {
        nearbyError.textContent =
            message;
    }
}

function initializeFormFields() {
    selectElements(
        "input, textarea, select"
    ).forEach(
        (field) => {
            field.addEventListener(
                "input",
                () => {
                    clearFieldError(
                        field
                    );
                }
            );

            field.addEventListener(
                "change",
                () => {
                    clearFieldError(
                        field
                    );
                }
            );
        }
    );
}

/* =========================================================
   إظهار وإخفاء كلمة المرور
========================================================= */

function initializePasswordToggles() {
    selectElements(
        "[data-password-toggle]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    const targetId =
                        button.dataset
                            .passwordToggle;

                    const input =
                        getElement(targetId);

                    if (!input) {
                        return;
                    }

                    const visible =
                        input.type === "text";

                    input.type =
                        visible
                            ? "password"
                            : "text";

                    button.textContent =
                        visible
                            ? "👁"
                            : "🙈";

                    button.setAttribute(
                        "aria-label",
                        visible
                            ? "إظهار كلمة المرور"
                            : "إخفاء كلمة المرور"
                    );
                }
            );
        }
    );
}

/* =========================================================
   العدادات النصية
========================================================= */

function initializeCharacterCounters() {
    selectElements(
        "[data-character-counter]"
    ).forEach(
        (field) => {
            const counterId =
                field.dataset
                    .characterCounter;

            const counter =
                getElement(counterId);

            if (!counter) {
                return;
            }

            const maximum =
                Number(
                    field.maxLength
                ) || 0;

            const updateCounter =
                () => {
                    counter.textContent =
                        maximum
                            ? `${field.value.length} / ${maximum}`
                            : String(
                                field.value.length
                            );
                };

            field.addEventListener(
                "input",
                updateCounter
            );

            updateCounter();
        }
    );
}

/* =========================================================
   ضبط ارتفاع textarea
========================================================= */

function resizeTextarea(textarea) {
    if (!textarea) {
        return;
    }

    textarea.style.height =
        "auto";

    textarea.style.height =
        `${Math.min(
            textarea.scrollHeight,
            220
        )}px`;
}

function initializeAutoResizeTextareas() {
    selectElements(
        "textarea[data-auto-resize]"
    ).forEach(
        (textarea) => {
            textarea.addEventListener(
                "input",
                () => {
                    resizeTextarea(
                        textarea
                    );
                }
            );

            resizeTextarea(
                textarea
            );
        }
    );
}

/* =========================================================
   النسخ
========================================================= */

async function copyText(
    text,
    successMessage = "تم نسخ النص."
) {
    try {
        await navigator.clipboard.writeText(
            String(text || "")
        );

        showToast(
            successMessage,
            "success"
        );

        return true;
    } catch (error) {
        console.error(
            "Clipboard error:",
            error
        );

        showToast(
            "تعذر نسخ النص.",
            "error"
        );

        return false;
    }
}

function initializeCopyButtons() {
    selectElements(
        "[data-copy-target]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    const target =
                        getElement(
                            button.dataset
                                .copyTarget
                        );

                    if (!target) {
                        return;
                    }

                    copyText(
                        target.value ||
                        target.textContent
                    );
                }
            );
        }
    );
}

/* =========================================================
   التنزيل والتصدير
========================================================= */

function downloadFile(
    content,
    fileName,
    mimeType =
        "application/json"
) {
    const blob =
        new Blob(
            [content],
            {
                type: mimeType
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href =
        url;

    link.download =
        fileName;

    document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function downloadJSON(
    data,
    fileName =
        "project-journey-data.json"
) {
    downloadFile(
        JSON.stringify(
            data,
            null,
            2
        ),
        fileName,
        "application/json"
    );
}

/* =========================================================
   الإشعارات
========================================================= */

function loadNotifications() {
    const notifications =
        readStorage(
            ProjectJourney.storageKeys.notifications,
            []
        );

    ProjectJourney.state.notifications =
        Array.isArray(notifications)
            ? notifications
            : [];

    updateNotificationBadges();

    return ProjectJourney.state.notifications;
}

function addNotification({
    title,
    message,
    type = "info",
    link = ""
}) {
    const notification = {
        id: createId("NOTIFICATION"),
        title:
            title || "إشعار جديد",
        message:
            message || "",
        type,
        link,
        isRead: false,
        createdAt:
            new Date().toISOString()
    };

    ProjectJourney.state.notifications
        .unshift(notification);

    saveStorage(
        ProjectJourney.storageKeys.notifications,
        ProjectJourney.state.notifications
    );

    updateNotificationBadges();

    return notification;
}

function markNotificationAsRead(
    notificationId
) {
    const notification =
        ProjectJourney.state.notifications
            .find(
                (item) =>
                    item.id ===
                    notificationId
            );

    if (!notification) {
        return;
    }

    notification.isRead =
        true;

    saveStorage(
        ProjectJourney.storageKeys.notifications,
        ProjectJourney.state.notifications
    );

    updateNotificationBadges();
}

function markAllNotificationsAsRead() {
    ProjectJourney.state.notifications
        .forEach(
            (notification) => {
                notification.isRead =
                    true;
            }
        );

    saveStorage(
        ProjectJourney.storageKeys.notifications,
        ProjectJourney.state.notifications
    );

    updateNotificationBadges();
}

function updateNotificationBadges() {
    const unreadCount =
        ProjectJourney.state.notifications
            .filter(
                (notification) =>
                    !notification.isRead
            )
            .length;

    selectElements(
        "[data-notification-count]"
    ).forEach(
        (element) => {
            element.textContent =
                unreadCount;

            element.hidden =
                unreadCount === 0;
        }
    );
}

/* =========================================================
   التمرير إلى الأقسام
========================================================= */

function initializeSmoothLinks() {
    selectElements(
        'a[href^="#"]'
    ).forEach(
        (link) => {
            link.addEventListener(
                "click",
                (event) => {
                    const targetId =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            );
        }
    );
}

/* =========================================================
   زر العودة إلى الأعلى
========================================================= */

function initializeBackToTop() {
    let button =
        getElement(
            "backToTopButton"
        );

    if (!button) {
        button =
            document.createElement(
                "button"
            );

        button.id =
            "backToTopButton";

        button.type =
            "button";

        button.setAttribute(
            "aria-label",
            "العودة إلى أعلى الصفحة"
        );

        button.textContent =
            "↑";

        button.style.cssText = `
            width: 44px;
            height: 44px;
            position: fixed;
            right: 22px;
            bottom: 22px;
            z-index: 500;
            display: none;
            place-items: center;
            border: 0;
            border-radius: 14px;
            color: #ffffff;
            background: #1565ff;
            box-shadow:
                0 12px 28px
                rgba(21, 101, 255, 0.28);
            cursor: pointer;
            font-size: 20px;
            font-weight: 900;
        `;

        document.body.appendChild(
            button
        );
    }

    window.addEventListener(
        "scroll",
        () => {
            button.style.display =
                window.scrollY > 500
                    ? "grid"
                    : "none";
        },
        {
            passive: true
        }
    );

    button.addEventListener(
        "click",
        () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );
}

/* =========================================================
   تهيئة السنة في التذييل
========================================================= */

function updateCurrentYear() {
    const currentYear =
        new Date().getFullYear();

    selectElements(
        "[data-current-year]"
    ).forEach(
        (element) => {
            element.textContent =
                currentYear;
        }
    );
}

/* =========================================================
   متابعة تغييرات LocalStorage
========================================================= */

function initializeStorageListener() {
    window.addEventListener(
        "storage",
        (event) => {
            if (
                event.key ===
                ProjectJourney.storageKeys.currentUser
            ) {
                loadCurrentUser();
                updateUserInterface();
            }

            if (
                event.key ===
                ProjectJourney.storageKeys.notifications
            ) {
                loadNotifications();
            }

            if (
                event.key ===
                ProjectJourney.storageKeys.theme
            ) {
                loadTheme();
            }

            document.dispatchEvent(
                new CustomEvent(
                    "projectJourneyStorageChanged",
                    {
                        detail: {
                            key: event.key,
                            newValue:
                                event.newValue,
                            oldValue:
                                event.oldValue
                        }
                    }
                )
            );
        }
    );
}

/* =========================================================
   معالجة الأخطاء العامة
========================================================= */

function initializeGlobalErrorHandling() {
    window.addEventListener(
        "error",
        (event) => {
            console.error(
                "Global JavaScript error:",
                event.error ||
                event.message
            );
        }
    );

    window.addEventListener(
        "unhandledrejection",
        (event) => {
            console.error(
                "Unhandled Promise rejection:",
                event.reason
            );
        }
    );
}

/* =========================================================
   الوظائف العامة للتطبيق
========================================================= */

function hidePageLoader() {
    const pageLoader = getElement("pageLoader");
    if (pageLoader) {
        pageLoader.classList.add("hide-loader");
        setTimeout(() => {
            pageLoader.style.display = "none";
        }, 300);
    }
}

function initializeMainApplication() {
    injectGlobalStyles();

    loadTheme();
    loadCurrentUser();
    loadNotifications();

    if (
        !requireAuthentication()
    ) {
        return;
    }

    if (
        !requireAdminRole()
    ) {
        return;
    }

    updateUserInterface();
    updateCurrentYear();

    initializeMobileNavigation();
    highlightCurrentNavigation();
    initializeLogoutButtons();
    initializeThemeButtons();
    initializeModals();
    initializeFormFields();
    initializePasswordToggles();
    initializeCharacterCounters();
    initializeAutoResizeTextareas();
    initializeCopyButtons();
    initializeSmoothLinks();
    initializeBackToTop();
    initializeStorageListener();
    initializeGlobalErrorHandling();

    document.body.classList.add(
        "application-ready"
    );

    hidePageLoader();

    document.dispatchEvent(
        new CustomEvent(
            "projectJourneyReady",
            {
                detail: {
                    currentUser:
                        getCurrentUser(),
                    version:
                        ProjectJourney.version
                }
            }
        )
    );
}

/* =========================================================
   تشغيل الملف
========================================================= */

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeMainApplication
    );
} else {
    initializeMainApplication();
}

/* =========================================================
   إتاحة الوظائف لبقية ملفات JavaScript
========================================================= */

window.ProjectJourney =
    ProjectJourney;

window.getElement =
    getElement;

window.selectElement =
    selectElement;

window.selectElements =
    selectElements;

window.readStorage =
    readStorage;

window.saveStorage =
    saveStorage;

window.removeStorage =
    removeStorage;

window.createId =
    createId;

window.escapeHTML =
    escapeHTML;

window.normalizeText =
    normalizeText;

window.truncateText =
    truncateText;

window.isValidEmail =
    isValidEmail;

window.isValidPhone =
    isValidPhone;

window.isStrongPassword =
    isStrongPassword;

window.formatNumber =
    formatNumber;

window.formatCurrency =
    formatCurrency;

window.formatDate =
    formatDate;

window.formatDateTime =
    formatDateTime;

window.formatTime =
    formatTime;

window.getRelativeTime =
    getRelativeTime;

window.getCurrentUser =
    getCurrentUser;

window.setCurrentUser =
    setCurrentUser;

window.getUserDisplayName =
    getUserDisplayName;

window.getUserInitials =
    getUserInitials;

window.getRoleLabel =
    getRoleLabel;

window.showToast =
    showToast;

window.showLoading =
    showLoading;

window.hideLoading =
    hideLoading;

window.hidePageLoader =
    hidePageLoader;

window.openModal =
    openModal;

window.closeModal =
    closeModal;

window.copyText =
    copyText;

window.downloadFile =
    downloadFile;

window.downloadJSON =
    downloadJSON;

window.addNotification =
    addNotification;

window.markNotificationAsRead =
    markNotificationAsRead;

window.markAllNotificationsAsRead =
    markAllNotificationsAsRead;

window.logoutUser =
    logoutUser;