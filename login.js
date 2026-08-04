"use strict";

/* =========================================================
   رحلة مشروع - Project Journey
   ملف تسجيل الدخول وإنشاء الحساب
   js/login.js
========================================================= */

const LoginState = {
    users: [],
    currentMode: "login",
    rememberUser: false,
    isSubmitting: false,
    loginAttempts: 0,
    maximumLoginAttempts: 5
};

/* =========================================================
   مفاتيح التخزين
========================================================= */

const LoginStorageKeys = {
    users: "projectJourneyUsers",
    currentUser: "projectJourneyCurrentUser",
    rememberedEmail: "projectJourneyRememberedEmail",
    loginHistory: "projectJourneyLoginHistory",
    passwordResets: "projectJourneyPasswordResets"
};

/* =========================================================
   أدوات العناصر
========================================================= */

function loginGetElement(id) {
    return document.getElementById(id);
}

function loginSelect(selector, parent = document) {
    return parent.querySelector(selector);
}

function loginSelectAll(selector, parent = document) {
    return Array.from(
        parent.querySelectorAll(selector)
    );
}

/* =========================================================
   التعامل مع التخزين
========================================================= */

function loginReadStorage(
    key,
    fallback = null
) {
    try {
        const value =
            localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error(
            "تعذر قراءة بيانات تسجيل الدخول:",
            error
        );

        return fallback;
    }
}

function loginSaveStorage(
    key,
    value
) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;
    } catch (error) {
        console.error(
            "تعذر حفظ بيانات تسجيل الدخول:",
            error
        );

        return false;
    }
}

/* =========================================================
   إنشاء معرف
========================================================= */

function loginCreateId(prefix = "USER") {
    return (
        prefix +
        "-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    ).toUpperCase();
}

/* =========================================================
   تنظيف النصوص
========================================================= */

function loginNormalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function loginEscapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   التحقق من البيانات
========================================================= */

function loginIsValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            String(email || "").trim()
        );
}

function loginIsValidPhone(phone) {
    const value =
        String(phone || "")
            .replace(/\s+/g, "");

    return /^[+]?[0-9]{7,15}$/
        .test(value);
}

function loginIsStrongPassword(password) {
    const value =
        String(password || "");

    return (
        value.length >= 8 &&
        /[A-Za-z]/.test(value) &&
        /[0-9]/.test(value)
    );
}

function loginPasswordsMatch(
    password,
    confirmation
) {
    return password === confirmation;
}

/* =========================================================
   عرض الأخطاء
========================================================= */

function clearLoginFieldError(field) {
    if (!field) {
        return;
    }

    field.classList.remove(
        "input-error"
    );

    const errorElement =
        field.parentElement
            ?.querySelector(
                ".field-error"
            );

    if (errorElement) {
        errorElement.textContent = "";
    }

    const describedBy =
        field.getAttribute(
            "aria-describedby"
        );

    if (describedBy) {
        const describedElement =
            loginGetElement(
                describedBy
            );

        if (describedElement) {
            describedElement.textContent = "";
        }
    }
}

function showLoginFieldError(
    field,
    message
) {
    if (!field) {
        return;
    }

    field.classList.add(
        "input-error"
    );

    const errorElement =
        field.parentElement
            ?.querySelector(
                ".field-error"
            );

    if (errorElement) {
        errorElement.textContent =
            message;

        return;
    }

    const describedBy =
        field.getAttribute(
            "aria-describedby"
        );

    if (describedBy) {
        const describedElement =
            loginGetElement(
                describedBy
            );

        if (describedElement) {
            describedElement.textContent =
                message;
        }
    }
}

function clearAllLoginErrors() {
    loginSelectAll(
        ".input-error"
    ).forEach(
        (field) => {
            clearLoginFieldError(
                field
            );
        }
    );

    loginSelectAll(
        ".field-error"
    ).forEach(
        (element) => {
            element.textContent = "";
        }
    );

    const generalError =
        loginGetElement(
            "loginGeneralError"
        );

    if (generalError) {
        generalError.hidden = true;
        generalError.textContent = "";
    }

    const signupGeneralError =
        loginGetElement(
            "signupGeneralError"
        );

    if (signupGeneralError) {
        signupGeneralError.hidden = true;
        signupGeneralError.textContent = "";
    }
}

function showGeneralLoginError(message) {
    const element =
        loginGetElement(
            "loginGeneralError"
        );

    if (!element) {
        if (
            typeof window.showToast ===
            "function"
        ) {
            window.showToast(
                message,
                "error"
            );
        } else {
            window.alert(message);
        }

        return;
    }

    element.textContent =
        message;

    element.hidden =
        false;
}

function showGeneralSignupError(message) {
    const element =
        loginGetElement(
            "signupGeneralError"
        );

    if (!element) {
        if (
            typeof window.showToast ===
            "function"
        ) {
            window.showToast(
                message,
                "error"
            );
        } else {
            window.alert(message);
        }

        return;
    }

    element.textContent =
        message;

    element.hidden =
        false;
}

/* =========================================================
   تحميل المستخدمين
========================================================= */

function loadLoginUsers() {
    const users =
        loginReadStorage(
            LoginStorageKeys.users,
            []
        );

    LoginState.users =
        Array.isArray(users)
            ? users
            : [];

    return LoginState.users;
}

function saveLoginUsers() {
    return loginSaveStorage(
        LoginStorageKeys.users,
        LoginState.users
    );
}

/* =========================================================
   إنشاء مستخدم افتراضي للإدارة
========================================================= */

function ensureDefaultAdmin() {
    const adminExists =
        LoginState.users.some(
            (user) =>
                user.role === "admin"
        );

    if (adminExists) {
        return;
    }

    const adminUser = {
        id: loginCreateId("ADMIN"),
        fullName: "مدير النظام",
        name: "مدير النظام",
        email: "admin@projectjourney.com",
        phone: "",
        password: "Admin123",
        role: "admin",
        status: "active",
        isActive: true,
        emailVerified: true,
        createdAt:
            new Date().toISOString(),
        updatedAt:
            new Date().toISOString()
    };

    LoginState.users.push(
        adminUser
    );

    saveLoginUsers();
}

/* =========================================================
   العثور على المستخدم
========================================================= */

function findUserByEmail(email) {
    const normalizedEmail =
        loginNormalizeText(email);

    return LoginState.users.find(
        (user) =>
            loginNormalizeText(
                user.email
            ) === normalizedEmail
    );
}

function findUserById(userId) {
    return LoginState.users.find(
        (user) =>
            user.id === userId
    );
}

/* =========================================================
   حفظ المستخدم الحالي
========================================================= */

function setLoggedInUser(user) {
    const safeUser = {
        ...user,
        lastLoginAt:
            new Date().toISOString()
    };

    const userIndex =
        LoginState.users.findIndex(
            (item) =>
                item.id === user.id
        );

    if (userIndex !== -1) {
        LoginState.users[userIndex] =
            safeUser;

        saveLoginUsers();
    }

    loginSaveStorage(
        LoginStorageKeys.currentUser,
        safeUser
    );

    if (
        typeof window.setCurrentUser ===
        "function"
    ) {
        window.setCurrentUser(
            safeUser
        );
    }

    return safeUser;
}

/* =========================================================
   سجل تسجيل الدخول
========================================================= */

function saveLoginHistory(
    user,
    success,
    reason = ""
) {
    const history =
        loginReadStorage(
            LoginStorageKeys.loginHistory,
            []
        );

    const records =
        Array.isArray(history)
            ? history
            : [];

    records.unshift({
        id:
            loginCreateId(
                "LOGIN"
            ),

        userId:
            user?.id || "",

        email:
            user?.email || "",

        success:
            Boolean(success),

        reason:
            reason,

        createdAt:
            new Date().toISOString(),

        userAgent:
            navigator.userAgent
    });

    loginSaveStorage(
        LoginStorageKeys.loginHistory,
        records.slice(0, 100)
    );
}

/* =========================================================
   التحقق من نموذج تسجيل الدخول
========================================================= */

function validateLoginForm() {
    clearAllLoginErrors();

    const emailField =
        loginGetElement(
            "loginEmail"
        ) ||
        loginGetElement(
            "email"
        );

    const passwordField =
        loginGetElement(
            "loginPassword"
        ) ||
        loginGetElement(
            "password"
        );

    let valid = true;

    if (
        !emailField ||
        !loginIsValidEmail(
            emailField.value
        )
    ) {
        showLoginFieldError(
            emailField,
            "اكتب بريدًا إلكترونيًا صحيحًا."
        );

        valid = false;
    }

    if (
        !passwordField ||
        String(
            passwordField.value
        ).length < 6
    ) {
        showLoginFieldError(
            passwordField,
            "اكتب كلمة المرور بشكل صحيح."
        );

        valid = false;
    }

    return {
        valid,
        email:
            emailField
                ?.value
                .trim() || "",
        password:
            passwordField
                ?.value || ""
    };
}

/* =========================================================
   تنفيذ تسجيل الدخول
========================================================= */

function handleLoginSubmit(event) {
    event.preventDefault();

    if (
        LoginState.isSubmitting
    ) {
        return;
    }

    const result =
        validateLoginForm();

    if (!result.valid) {
        return;
    }

    if (
        LoginState.loginAttempts >=
        LoginState.maximumLoginAttempts
    ) {
        showGeneralLoginError(
            "تم تجاوز عدد المحاولات المسموح بها. حاول بعد قليل."
        );

        return;
    }

    LoginState.isSubmitting = true;

    setLoginButtonLoading(true);

    window.setTimeout(
        () => {
            const user =
                findUserByEmail(
                    result.email
                );

            if (!user) {
                LoginState.loginAttempts += 1;

                saveLoginHistory(
                    {
                        email:
                            result.email
                    },
                    false,
                    "user-not-found"
                );

                showGeneralLoginError(
                    "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                );

                LoginState.isSubmitting = false;

                setLoginButtonLoading(false);

                return;
            }

            if (
                user.status === "inactive" ||
                user.isActive === false
            ) {
                saveLoginHistory(
                    user,
                    false,
                    "inactive-account"
                );

                showGeneralLoginError(
                    "هذا الحساب غير نشط. تواصل مع الإدارة."
                );

                LoginState.isSubmitting = false;

                setLoginButtonLoading(false);

                return;
            }

            if (
                user.status === "pending"
            ) {
                saveLoginHistory(
                    user,
                    false,
                    "pending-account"
                );

                showGeneralLoginError(
                    "الحساب ما زال قيد المراجعة."
                );

                LoginState.isSubmitting = false;

                setLoginButtonLoading(false);

                return;
            }

            if (
                String(user.password) !==
                result.password
            ) {
                LoginState.loginAttempts += 1;

                saveLoginHistory(
                    user,
                    false,
                    "incorrect-password"
                );

                const remaining =
                    LoginState
                        .maximumLoginAttempts -
                    LoginState
                        .loginAttempts;

                showGeneralLoginError(
                    remaining > 0
                        ? `كلمة المرور غير صحيحة. تبقى ${remaining} محاولات.`
                        : "تم تجاوز عدد المحاولات المسموح بها."
                );

                LoginState.isSubmitting = false;

                setLoginButtonLoading(false);

                return;
            }

            LoginState.loginAttempts = 0;

            const loggedInUser =
                setLoggedInUser(user);

            saveLoginHistory(
                loggedInUser,
                true,
                "login-success"
            );

            handleRememberEmail(
                result.email
            );

            if (
                typeof window.showToast ===
                "function"
            ) {
                window.showToast(
                    `مرحبًا ${loggedInUser.fullName || loggedInUser.name}`,
                    "success"
                );
            }

            const redirectPage =
                getRedirectPage(
                    loggedInUser
                );

            window.setTimeout(
                () => {
                    window.location.href =
                        redirectPage;
                },
                700
            );
        },
        650
    );
}

/* =========================================================
   الصفحة التي ينتقل إليها المستخدم
========================================================= */

function getRedirectPage(user) {
    const urlParameters =
        new URLSearchParams(
            window.location.search
        );

    const redirect =
        urlParameters.get(
            "redirect"
        );

    if (redirect) {
        return redirect;
    }

    if (
        user.role === "admin"
    ) {
        return "admin statistick.html";
    }

    return "dashboard.html";
}

/* =========================================================
   تذكر البريد
========================================================= */

function handleRememberEmail(email) {
    const checkbox =
        loginGetElement(
            "rememberMe"
        ) ||
        loginGetElement(
            "remember"
        );

    const remember =
        Boolean(
            checkbox?.checked
        );

    LoginState.rememberUser =
        remember;

    if (remember) {
        localStorage.setItem(
            LoginStorageKeys
                .rememberedEmail,
            email
        );
    } else {
        localStorage.removeItem(
            LoginStorageKeys
                .rememberedEmail
        );
    }
}

function loadRememberedEmail() {
    const rememberedEmail =
        localStorage.getItem(
            LoginStorageKeys
                .rememberedEmail
        );

    if (!rememberedEmail) {
        return;
    }

    const emailField =
        loginGetElement(
            "loginEmail"
        ) ||
        loginGetElement(
            "email"
        );

    const rememberCheckbox =
        loginGetElement(
            "rememberMe"
        ) ||
        loginGetElement(
            "remember"
        );

    if (emailField) {
        emailField.value =
            rememberedEmail;
    }

    if (rememberCheckbox) {
        rememberCheckbox.checked =
            true;
    }
}

/* =========================================================
   زر تحميل تسجيل الدخول
========================================================= */

function setLoginButtonLoading(loading) {
    const button =
        loginGetElement(
            "loginButton"
        ) ||
        loginSelect(
            "#loginForm button[type='submit']"
        );

    if (!button) {
        return;
    }

    if (loading) {
        button.dataset
            .originalText =
            button.innerHTML;

        button.disabled =
            true;

        button.innerHTML = `
            <span class="login-spinner"></span>
            جاري تسجيل الدخول...
        `;
    } else {
        button.disabled =
            false;

        button.innerHTML =
            button.dataset
                .originalText ||
            "تسجيل الدخول";
    }
}

/* =========================================================
   التحقق من نموذج إنشاء الحساب
========================================================= */

function validateSignupForm() {
    clearAllLoginErrors();

    const nameField =
        loginGetElement(
            "signupName"
        ) ||
        loginGetElement(
            "fullName"
        );

    const emailField =
        loginGetElement(
            "signupEmail"
        );

    const phoneField =
        loginGetElement(
            "signupPhone"
        );

    const passwordField =
        loginGetElement(
            "signupPassword"
        );

    const confirmationField =
        loginGetElement(
            "confirmPassword"
        );

    const roleField =
        loginGetElement(
            "signupRole"
        );

    const termsField =
        loginGetElement(
            "acceptTerms"
        );

    let valid = true;

    const fullName =
        nameField
            ?.value
            .trim() || "";

    const email =
        emailField
            ?.value
            .trim() || "";

    const phone =
        phoneField
            ?.value
            .trim() || "";

    const password =
        passwordField
            ?.value || "";

    const confirmation =
        confirmationField
            ?.value || "";

    if (
        fullName.length < 3
    ) {
        showLoginFieldError(
            nameField,
            "اكتب الاسم الكامل."
        );

        valid = false;
    }

    if (
        !loginIsValidEmail(email)
    ) {
        showLoginFieldError(
            emailField,
            "اكتب بريدًا إلكترونيًا صحيحًا."
        );

        valid = false;
    }

    if (
        findUserByEmail(email)
    ) {
        showLoginFieldError(
            emailField,
            "البريد الإلكتروني مستخدم بالفعل."
        );

        valid = false;
    }

    if (
        phone &&
        !loginIsValidPhone(phone)
    ) {
        showLoginFieldError(
            phoneField,
            "اكتب رقم هاتف صحيحًا."
        );

        valid = false;
    }

    if (
        !loginIsStrongPassword(
            password
        )
    ) {
        showLoginFieldError(
            passwordField,
            "يجب أن تكون كلمة المرور 8 أحرف وتحتوي على حرف ورقم."
        );

        valid = false;
    }

    if (
        !loginPasswordsMatch(
            password,
            confirmation
        )
    ) {
        showLoginFieldError(
            confirmationField,
            "كلمتا المرور غير متطابقتين."
        );

        valid = false;
    }

    if (
        termsField &&
        !termsField.checked
    ) {
        showLoginFieldError(
            termsField,
            "يجب الموافقة على الشروط."
        );

        valid = false;
    }

    return {
        valid,
        fullName,
        email,
        phone,
        password,
        role:
            roleField?.value ||
            "beginner"
    };
}

/* =========================================================
   إنشاء الحساب
========================================================= */

function handleSignupSubmit(event) {
    event.preventDefault();

    if (
        LoginState.isSubmitting
    ) {
        return;
    }

    const result =
        validateSignupForm();

    if (!result.valid) {
        return;
    }

    LoginState.isSubmitting =
        true;

    setSignupButtonLoading(
        true
    );

    window.setTimeout(
        () => {
            const now =
                new Date()
                    .toISOString();

            const user = {
                id:
                    loginCreateId(
                        "USER"
                    ),

                fullName:
                    result.fullName,

                name:
                    result.fullName,

                email:
                    result.email,

                phone:
                    result.phone,

                password:
                    result.password,

                role:
                    result.role,

                status:
                    "active",

                isActive:
                    true,

                emailVerified:
                    false,

                bio:
                    "",

                avatar:
                    "",

                createdAt:
                    now,

                updatedAt:
                    now,

                lastLoginAt:
                    now
            };

            LoginState.users.unshift(
                user
            );

            const saved =
                saveLoginUsers();

            if (!saved) {
                showGeneralSignupError(
                    "تعذر إنشاء الحساب. حاول مرة أخرى."
                );

                LoginState.isSubmitting =
                    false;

                setSignupButtonLoading(
                    false
                );

                return;
            }

            setLoggedInUser(user);

            saveLoginHistory(
                user,
                true,
                "signup-success"
            );

            if (
                typeof window.showToast ===
                "function"
            ) {
                window.showToast(
                    "تم إنشاء الحساب بنجاح.",
                    "success"
                );
            }

            window.setTimeout(
                () => {
                    window.location.href =
                        "dashboard.html";
                },
                750
            );
        },
        700
    );
}

/* =========================================================
   زر تحميل إنشاء الحساب
========================================================= */

function setSignupButtonLoading(
    loading
) {
    const button =
        loginGetElement(
            "signupButton"
        ) ||
        loginSelect(
            "#signupForm button[type='submit']"
        );

    if (!button) {
        return;
    }

    if (loading) {
        button.dataset
            .originalText =
            button.innerHTML;

        button.disabled =
            true;

        button.innerHTML = `
            <span class="login-spinner"></span>
            جاري إنشاء الحساب...
        `;
    } else {
        button.disabled =
            false;

        button.innerHTML =
            button.dataset
                .originalText ||
            "إنشاء الحساب";
    }
}

/* =========================================================
   إظهار وإخفاء كلمة المرور
========================================================= */

function initializeLoginPasswordToggles() {
    loginSelectAll(
        "[data-login-password-toggle]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    const targetId =
                        button.dataset
                            .loginPasswordToggle;

                    const input =
                        loginGetElement(
                            targetId
                        );

                    if (!input) {
                        return;
                    }

                    const isPassword =
                        input.type ===
                        "password";

                    input.type =
                        isPassword
                            ? "text"
                            : "password";

                    button.textContent =
                        isPassword
                            ? "🙈"
                            : "👁";
                }
            );
        }
    );

    loginSelectAll(
        "[data-password-toggle]"
    ).forEach(
        (button) => {
            if (
                button.dataset
                    .loginInitialized ===
                "true"
            ) {
                return;
            }

            button.dataset
                .loginInitialized =
                "true";

            button.addEventListener(
                "click",
                () => {
                    const input =
                        loginGetElement(
                            button.dataset
                                .passwordToggle
                        );

                    if (!input) {
                        return;
                    }

                    const visible =
                        input.type ===
                        "text";

                    input.type =
                        visible
                            ? "password"
                            : "text";

                    button.textContent =
                        visible
                            ? "👁"
                            : "🙈";
                }
            );
        }
    );
}

/* =========================================================
   قوة كلمة المرور
========================================================= */

function calculatePasswordStrength(
    password
) {
    const value =
        String(password || "");

    let score = 0;

    if (
        value.length >= 8
    ) {
        score += 1;
    }

    if (
        value.length >= 12
    ) {
        score += 1;
    }

    if (
        /[A-Z]/.test(value)
    ) {
        score += 1;
    }

    if (
        /[a-z]/.test(value)
    ) {
        score += 1;
    }

    if (
        /[0-9]/.test(value)
    ) {
        score += 1;
    }

    if (
        /[^A-Za-z0-9]/.test(value)
    ) {
        score += 1;
    }

    return score;
}

function updatePasswordStrength() {
    const field =
        loginGetElement(
            "signupPassword"
        );

    const bar =
        loginGetElement(
            "passwordStrengthBar"
        );

    const text =
        loginGetElement(
            "passwordStrengthText"
        );

    if (
        !field ||
        !bar ||
        !text
    ) {
        return;
    }

    const score =
        calculatePasswordStrength(
            field.value
        );

    const levels = [
        {
            label:
                "ضعيفة جدًا",
            width:
                "15%",
            className:
                "very-weak"
        },
        {
            label:
                "ضعيفة",
            width:
                "30%",
            className:
                "weak"
        },
        {
            label:
                "متوسطة",
            width:
                "50%",
            className:
                "medium"
        },
        {
            label:
                "جيدة",
            width:
                "70%",
            className:
                "good"
        },
        {
            label:
                "قوية",
            width:
                "85%",
            className:
                "strong"
        },
        {
            label:
                "قوية جدًا",
            width:
                "100%",
            className:
                "very-strong"
        }
    ];

    const level =
        levels[
            Math.max(
                0,
                Math.min(
                    score - 1,
                    levels.length - 1
                )
            )
        ] || levels[0];

    bar.style.width =
        field.value
            ? level.width
            : "0%";

    bar.className =
        `password-strength-progress ${level.className}`;

    text.textContent =
        field.value
            ? level.label
            : "";
}

/* =========================================================
   تبديل تسجيل الدخول وإنشاء الحساب
========================================================= */

function switchAuthenticationMode(
    mode
) {
    LoginState.currentMode =
        mode;

    const loginForm =
        loginGetElement(
            "loginForm"
        );

    const signupForm =
        loginGetElement(
            "signupForm"
        );

    const loginTab =
        loginGetElement(
            "loginTab"
        );

    const signupTab =
        loginGetElement(
            "signupTab"
        );

    if (loginForm) {
        loginForm.hidden =
            mode !== "login";
    }

    if (signupForm) {
        signupForm.hidden =
            mode !== "signup";
    }

    loginTab?.classList.toggle(
        "active",
        mode === "login"
    );

    signupTab?.classList.toggle(
        "active",
        mode === "signup"
    );

    clearAllLoginErrors();

    const url =
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "mode",
        mode
    );

    window.history.replaceState(
        {},
        "",
        url
    );
}

function initializeAuthenticationTabs() {
    const loginTab =
        loginGetElement(
            "loginTab"
        );

    const signupTab =
        loginGetElement(
            "signupTab"
        );

    loginTab?.addEventListener(
        "click",
        () => {
            switchAuthenticationMode(
                "login"
            );
        }
    );

    signupTab?.addEventListener(
        "click",
        () => {
            switchAuthenticationMode(
                "signup"
            );
        }
    );

    loginSelectAll(
        "[data-auth-mode]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    switchAuthenticationMode(
                        button.dataset
                            .authMode
                    );
                }
            );
        }
    );

    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const mode =
        parameters.get("mode");

    if (
        mode === "signup" ||
        window.location.pathname
            .toLowerCase()
            .includes("signup")
    ) {
        switchAuthenticationMode(
            "signup"
        );
    } else {
        switchAuthenticationMode(
            "login"
        );
    }
}

/* =========================================================
   نسيت كلمة المرور
========================================================= */

function openForgotPassword() {
    const modal =
        loginGetElement(
            "forgotPasswordModal"
        );

    if (modal) {
        if (
            typeof window.openModal ===
            "function"
        ) {
            window.openModal(
                modal
            );
        } else {
            modal.hidden = false;
            document.body.classList.add(
                "modal-open"
            );
        }

        return;
    }

    const email =
        window.prompt(
            "اكتب بريدك الإلكتروني:"
        );

    if (!email) {
        return;
    }

    processPasswordReset(
        email
    );
}

function processPasswordReset(email) {
    if (
        !loginIsValidEmail(email)
    ) {
        if (
            typeof window.showToast ===
            "function"
        ) {
            window.showToast(
                "اكتب بريدًا إلكترونيًا صحيحًا.",
                "error"
            );
        }

        return;
    }

    const user =
        findUserByEmail(email);

    if (!user) {
        if (
            typeof window.showToast ===
            "function"
        ) {
            window.showToast(
                "لا يوجد حساب مرتبط بهذا البريد.",
                "error"
            );
        }

        return;
    }

    const resetCode =
        String(
            Math.floor(
                100000 +
                Math.random() *
                900000
            )
        );

    const resets =
        loginReadStorage(
            LoginStorageKeys.passwordResets,
            []
        );

    const records =
        Array.isArray(resets)
            ? resets
            : [];

    records.unshift({
        id:
            loginCreateId(
                "RESET"
            ),

        userId:
            user.id,

        email:
            user.email,

        code:
            resetCode,

        used:
            false,

        createdAt:
            new Date().toISOString(),

        expiresAt:
            new Date(
                Date.now() +
                15 *
                60 *
                1000
            ).toISOString()
    });

    loginSaveStorage(
        LoginStorageKeys.passwordResets,
        records
    );

    if (
        typeof window.showToast ===
        "function"
    ) {
        window.showToast(
            `تم إنشاء رمز استعادة تجريبي: ${resetCode}`,
            "success",
            7000
        );
    } else {
        window.alert(
            `رمز الاستعادة التجريبي: ${resetCode}`
        );
    }
}

function handleForgotPasswordForm(
    event
) {
    event.preventDefault();

    const emailField =
        loginGetElement(
            "forgotPasswordEmail"
        );

    if (!emailField) {
        return;
    }

    processPasswordReset(
        emailField.value.trim()
    );

    const modal =
        loginGetElement(
            "forgotPasswordModal"
        );

    if (
        modal &&
        typeof window.closeModal ===
        "function"
    ) {
        window.closeModal(
            modal
        );
    }
}

/* =========================================================
   تسجيل الدخول التجريبي
========================================================= */

function fillDemoAccount(role) {
    const accounts = {
        admin: {
            email:
                "admin@projectjourney.com",
            password:
                "Admin123"
        },

        user: {
            email:
                "user@projectjourney.com",
            password:
                "User1234"
        }
    };

    const account =
        accounts[role] ||
        accounts.user;

    const emailField =
        loginGetElement(
            "loginEmail"
        ) ||
        loginGetElement(
            "email"
        );

    const passwordField =
        loginGetElement(
            "loginPassword"
        ) ||
        loginGetElement(
            "password"
        );

    if (emailField) {
        emailField.value =
            account.email;
    }

    if (passwordField) {
        passwordField.value =
            account.password;
    }
}

function ensureDemoUser() {
    const existing =
        findUserByEmail(
            "user@projectjourney.com"
        );

    if (existing) {
        return;
    }

    LoginState.users.push({
        id:
            loginCreateId(
                "USER"
            ),

        fullName:
            "مستخدم تجريبي",

        name:
            "مستخدم تجريبي",

        email:
            "user@projectjourney.com",

        phone:
            "",

        password:
            "User1234",

        role:
            "beginner",

        status:
            "active",

        isActive:
            true,

        emailVerified:
            true,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    });

    saveLoginUsers();
}

/* =========================================================
   منع الدخول لصفحة تسجيل الدخول بعد تسجيل الدخول
========================================================= */

function redirectAuthenticatedUser() {
    const currentUser =
        loginReadStorage(
            LoginStorageKeys.currentUser,
            null
        );

    const body =
        document.body;

    if (
        !currentUser ||
        body.dataset
            .allowAuthenticated ===
        "true"
    ) {
        return;
    }

    const pageName =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    const authenticationPages = [
        "login.html",
        "signup.html",
        "register.html"
    ];

    if (
        authenticationPages.includes(
            pageName
        )
    ) {
        window.location.replace(
            getRedirectPage(
                currentUser
            )
        );
    }
}

/* =========================================================
   تأثيرات المدخلات
========================================================= */

function initializeLoginFields() {
    loginSelectAll(
        "input, select, textarea"
    ).forEach(
        (field) => {
            field.addEventListener(
                "input",
                () => {
                    clearLoginFieldError(
                        field
                    );
                }
            );

            field.addEventListener(
                "change",
                () => {
                    clearLoginFieldError(
                        field
                    );
                }
            );

            field.addEventListener(
                "focus",
                () => {
                    field.parentElement
                        ?.classList
                        .add(
                            "field-focused"
                        );
                }
            );

            field.addEventListener(
                "blur",
                () => {
                    field.parentElement
                        ?.classList
                        .remove(
                            "field-focused"
                        );
                }
            );
        }
    );
}

/* =========================================================
   إدخال البريد من صفحة إنشاء الحساب
========================================================= */

function copySignupEmailToLogin() {
    const signupEmail =
        loginGetElement(
            "signupEmail"
        );

    const loginEmail =
        loginGetElement(
            "loginEmail"
        );

    if (
        signupEmail &&
        loginEmail
    ) {
        loginEmail.value =
            signupEmail.value;
    }
}

/* =========================================================
   إضافة تنسيقات الملف
========================================================= */

function injectLoginStyles() {
    if (
        loginGetElement(
            "projectJourneyLoginStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "projectJourneyLoginStyles";

    style.textContent = `
        .input-error {
            border-color: #dc3545 !important;
            box-shadow:
                0 0 0 4px
                rgba(220, 53, 69, 0.10) !important;
        }

        .field-error {
            min-height: 16px;
            color: #dc3545;
            font-size: 10px;
            line-height: 1.5;
        }

        .login-general-error {
            margin-bottom: 14px;
            padding: 12px 14px;
            border-radius: 12px;
            color: #b52835;
            background: #fff0f1;
            border: 1px solid #f3c8cd;
            font-size: 11px;
            line-height: 1.7;
        }

        .login-spinner {
            width: 17px;
            height: 17px;
            display: inline-block;
            border-radius: 50%;
            border:
                2px solid
                rgba(255, 255, 255, 0.40);
            border-top-color: #ffffff;
            animation:
                loginSpinnerAnimation
                0.7s linear infinite;
        }

        .password-strength-track {
            width: 100%;
            height: 7px;
            margin-top: 8px;
            overflow: hidden;
            border-radius: 999px;
            background: #e1e8f2;
        }

        .password-strength-progress {
            width: 0;
            height: 100%;
            border-radius: inherit;
            transition:
                width 0.25s ease,
                background 0.25s ease;
        }

        .password-strength-progress.very-weak,
        .password-strength-progress.weak {
            background: #dc3545;
        }

        .password-strength-progress.medium {
            background: #f59e0b;
        }

        .password-strength-progress.good {
            background: #0ea5e9;
        }

        .password-strength-progress.strong,
        .password-strength-progress.very-strong {
            background: #179b5f;
        }

        #passwordStrengthText {
            display: block;
            margin-top: 5px;
            color: #68758c;
            font-size: 9px;
        }

        @keyframes loginSpinnerAnimation {
            to {
                transform: rotate(360deg);
            }
        }
    `;

    document.head.appendChild(
        style
    );
}

/* =========================================================
   ربط الأحداث
========================================================= */

function initializeLoginEvents() {
    const loginForm =
        loginGetElement(
            "loginForm"
        );

    const signupForm =
        loginGetElement(
            "signupForm"
        );

    const forgotPasswordForm =
        loginGetElement(
            "forgotPasswordForm"
        );

    loginForm?.addEventListener(
        "submit",
        handleLoginSubmit
    );

    signupForm?.addEventListener(
        "submit",
        handleSignupSubmit
    );

    forgotPasswordForm
        ?.addEventListener(
            "submit",
            handleForgotPasswordForm
        );

    loginSelectAll(
        "[data-forgot-password]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();

                    openForgotPassword();
                }
            );
        }
    );

    loginSelectAll(
        "[data-demo-account]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    fillDemoAccount(
                        button.dataset
                            .demoAccount
                    );
                }
            );
        }
    );

    const signupPassword =
        loginGetElement(
            "signupPassword"
        );

    signupPassword?.addEventListener(
        "input",
        updatePasswordStrength
    );

    const loginEmail =
        loginGetElement(
            "loginEmail"
        );

    loginEmail?.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key ===
                "Enter"
            ) {
                loginGetElement(
                    "loginPassword"
                )?.focus();
            }
        }
    );

    const loginPassword =
        loginGetElement(
            "loginPassword"
        );

    loginPassword?.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key ===
                "Enter"
            ) {
                loginForm?.requestSubmit();
            }
        }
    );

    window.addEventListener(
        "storage",
        (event) => {
            if (
                event.key ===
                LoginStorageKeys.users
            ) {
                loadLoginUsers();
            }

            if (
                event.key ===
                LoginStorageKeys.currentUser &&
                event.newValue
            ) {
                redirectAuthenticatedUser();
            }
        }
    );
}

/* =========================================================
   تشغيل الصفحة
========================================================= */

function initializeLoginPage() {
    injectLoginStyles();

    loadLoginUsers();
    ensureDefaultAdmin();
    ensureDemoUser();

    redirectAuthenticatedUser();

    initializeAuthenticationTabs();
    initializeLoginPasswordToggles();
    initializeLoginFields();
    initializeLoginEvents();

    loadRememberedEmail();
    updatePasswordStrength();

    document.body.classList.add(
        "login-page-ready"
    );

    document.dispatchEvent(
        new CustomEvent(
            "projectJourneyLoginReady",
            {
                detail: {
                    usersCount:
                        LoginState
                            .users
                            .length
                }
            }
        )
    );
}

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeLoginPage
    );
} else {
    initializeLoginPage();
}

/* =========================================================
   إتاحة الوظائف
========================================================= */

window.LoginState =
    LoginState;

window.handleLoginSubmit =
    handleLoginSubmit;

window.handleSignupSubmit =
    handleSignupSubmit;

window.switchAuthenticationMode =
    switchAuthenticationMode;

window.openForgotPassword =
    openForgotPassword;

window.processPasswordReset =
    processPasswordReset;

window.fillDemoAccount =
    fillDemoAccount;

window.findUserByEmail =
    findUserByEmail;

window.loadLoginUsers =
    loadLoginUsers;

window.copySignupEmailToLogin =
    copySignupEmailToLogin;
    