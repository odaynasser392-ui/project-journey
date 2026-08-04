"use strict";

/* =========================================================
   رحلة مشروع - Project Journey
   إدارة لوحة التحكم والمستخدمين والمشاريع والرسائل
   js/admin.js
========================================================= */

const AdminState = {
    currentUser: null,

    users: [],
    projects: [],
    analyses: [],
    messages: [],
    stories: [],
    groups: [],
    notifications: [],

    filteredUsers: [],
    filteredProjects: [],
    filteredMessages: [],

    selectedUserId: "",
    selectedProjectId: "",
    selectedMessageId: "",

    userFilters: {
        search: "",
        role: "all",
        status: "all"
    },

    projectFilters: {
        search: "",
        status: "all",
        category: "all"
    },

    messageFilters: {
        search: "",
        status: "all",
        category: "all",
        priority: "all"
    }
};

/* =========================================================
   مفاتيح التخزين
========================================================= */

const AdminStorageKeys = {
    currentUser:
        "projectJourneyCurrentUser",

    users:
        "projectJourneyUsers",

    projects:
        "projectJourneyProjects",

    analyses:
        "projectJourneyAnalyses",

    messages:
        "projectJourneyContactMessages",

    supportMessages:
        "projectJourneySupportRequests",

    stories:
        "projectJourneyStories",

    groups:
        "projectJourneyGroups",

    notifications:
        "projectJourneyNotifications",

    auditLog:
        "projectJourneyAdminAuditLog",

    adminSettings:
        "projectJourneyAdminSettings"
};

/* =========================================================
   أدوات الصفحة
========================================================= */

function adminGetElement(id) {
    return document.getElementById(id);
}

function adminSelect(
    selector,
    parent = document
) {
    return parent.querySelector(selector);
}

function adminSelectAll(
    selector,
    parent = document
) {
    return Array.from(
        parent.querySelectorAll(selector)
    );
}

/* =========================================================
   التخزين
========================================================= */

function adminReadStorage(
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
            `Admin storage read error: ${key}`,
            error
        );

        return fallback;
    }
}

function adminSaveStorage(
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
            `Admin storage save error: ${key}`,
            error
        );

        adminShowMessage(
            "تعذر حفظ البيانات.",
            "error"
        );

        return false;
    }
}

/* =========================================================
   إنشاء المعرفات
========================================================= */

function adminCreateId(
    prefix = "ADMIN"
) {
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
   النصوص والتنسيق
========================================================= */

function adminNormalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function adminEscapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function adminTruncateText(
    value,
    maximumLength = 100
) {
    const text =
        String(value || "");

    if (
        text.length <=
        maximumLength
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

function adminFormatDate(value) {
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

    return new Intl.DateTimeFormat(
        "ar",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(date);
}

function adminFormatDateTime(value) {
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

    return new Intl.DateTimeFormat(
        "ar",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}

function adminFormatNumber(value) {
    return new Intl.NumberFormat(
        "ar"
    ).format(
        Number(value) || 0
    );
}

/* =========================================================
   الرسائل
========================================================= */

function adminShowMessage(
    message,
    type = "info"
) {
    if (
        typeof window.showToast ===
        "function"
    ) {
        window.showToast(
            message,
            type
        );

        return;
    }

    window.alert(message);
}

/* =========================================================
   التحقق من صلاحية المدير
========================================================= */

function ensureAdminAccess() {
    AdminState.currentUser =
        adminReadStorage(
            AdminStorageKeys.currentUser,
            null
        );

    if (
        !AdminState.currentUser ||
        AdminState.currentUser.role !==
            "admin"
    ) {
        adminShowMessage(
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
   تحميل البيانات
========================================================= */

function loadAdminData() {
    if (
        !ensureAdminAccess()
    ) {
        return;
    }

    const users =
        adminReadStorage(
            AdminStorageKeys.users,
            []
        );

    const projects =
        adminReadStorage(
            AdminStorageKeys.projects,
            []
        );

    const analyses =
        adminReadStorage(
            AdminStorageKeys.analyses,
            []
        );

    const contactMessages =
        adminReadStorage(
            AdminStorageKeys.messages,
            []
        );

    const supportMessages =
        adminReadStorage(
            AdminStorageKeys.supportMessages,
            []
        );

    const stories =
        adminReadStorage(
            AdminStorageKeys.stories,
            []
        );

    const groups =
        adminReadStorage(
            AdminStorageKeys.groups,
            []
        );

    const notifications =
        adminReadStorage(
            AdminStorageKeys.notifications,
            []
        );

    AdminState.users =
        Array.isArray(users)
            ? users
            : [];

    AdminState.projects =
        Array.isArray(projects)
            ? projects
            : [];

    AdminState.analyses =
        Array.isArray(analyses)
            ? analyses
            : [];

    AdminState.messages = [
        ...(Array.isArray(contactMessages)
            ? contactMessages
            : []),

        ...(Array.isArray(supportMessages)
            ? supportMessages
            : [])
    ];

    AdminState.stories =
        Array.isArray(stories)
            ? stories
            : [];

    AdminState.groups =
        Array.isArray(groups)
            ? groups
            : [];

    AdminState.notifications =
        Array.isArray(notifications)
            ? notifications
            : [];

    normalizeAdminData();
    applyAllAdminFilters();
    renderAdminStatistics();
}

/* =========================================================
   توحيد البيانات
========================================================= */

function normalizeAdminData() {
    AdminState.users =
        AdminState.users.map(
            (user) =>
                normalizeAdminUser(
                    user
                )
        );

    AdminState.projects =
        AdminState.projects.map(
            (project) =>
                normalizeAdminProject(
                    project
                )
        );

    AdminState.messages =
        AdminState.messages.map(
            (message) =>
                normalizeAdminMessage(
                    message
                )
        );
}

function normalizeAdminUser(user) {
    return {
        id:
            user.id ||
            adminCreateId("USER"),

        fullName:
            user.fullName ||
            user.name ||
            user.username ||
            "مستخدم",

        name:
            user.name ||
            user.fullName ||
            "مستخدم",

        email:
            user.email ||
            "",

        phone:
            user.phone ||
            "",

        role:
            user.role ||
            "user",

        status:
            user.status ||
            (
                user.isActive === false
                    ? "inactive"
                    : "active"
            ),

        isActive:
            user.isActive !== false,

        emailVerified:
            Boolean(
                user.emailVerified
            ),

        createdAt:
            user.createdAt ||
            new Date().toISOString(),

        updatedAt:
            user.updatedAt ||
            user.createdAt ||
            new Date().toISOString(),

        lastLoginAt:
            user.lastLoginAt ||
            ""
    };
}

function normalizeAdminProject(project) {
    return {
        id:
            project.id ||
            adminCreateId("PROJECT"),

        name:
            project.name ||
            project.title ||
            project.projectName ||
            "مشروع بدون اسم",

        ownerId:
            project.ownerId ||
            project.userId ||
            "",

        ownerName:
            project.ownerName ||
            "",

        category:
            project.category ||
            project.type ||
            "general",

        description:
            project.description ||
            project.idea ||
            "",

        status:
            project.reviewStatus ||
            project.status ||
            "pending",

        score:
            Number(
                project.score ||
                project.analysisScore ||
                0
            ),

        rejectionReason:
            project.rejectionReason ||
            "",

        adminNotes:
            project.adminNotes ||
            "",

        createdAt:
            project.createdAt ||
            new Date().toISOString(),

        updatedAt:
            project.updatedAt ||
            project.createdAt ||
            new Date().toISOString()
    };
}

function normalizeAdminMessage(message) {
    return {
        id:
            message.id ||
            adminCreateId("MESSAGE"),

        senderName:
            message.senderName ||
            message.name ||
            "مستخدم",

        senderEmail:
            message.senderEmail ||
            message.email ||
            "",

        senderPhone:
            message.senderPhone ||
            message.phone ||
            "",

        subject:
            message.subject ||
            "رسالة بدون عنوان",

        message:
            message.message ||
            message.description ||
            "",

        category:
            message.category ||
            "general",

        priority:
            message.priority ||
            "medium",

        status:
            message.status ||
            "pending",

        adminReply:
            message.adminReply ||
            "",

        createdAt:
            message.createdAt ||
            new Date().toISOString(),

        updatedAt:
            message.updatedAt ||
            message.createdAt ||
            new Date().toISOString()
    };
}

/* =========================================================
   الحفظ
========================================================= */

function saveAdminUsers() {
    return adminSaveStorage(
        AdminStorageKeys.users,
        AdminState.users
    );
}

function saveAdminProjects() {
    return adminSaveStorage(
        AdminStorageKeys.projects,
        AdminState.projects
    );
}

function saveAdminMessages() {
    return adminSaveStorage(
        AdminStorageKeys.messages,
        AdminState.messages
    );
}

/* =========================================================
   سجل الإدارة
========================================================= */

function addAdminAuditLog(
    action,
    details = {}
) {
    const log =
        adminReadStorage(
            AdminStorageKeys.auditLog,
            []
        );

    const records =
        Array.isArray(log)
            ? log
            : [];

    records.unshift({
        id:
            adminCreateId(
                "AUDIT"
            ),

        adminId:
            AdminState.currentUser
                ?.id ||
            "",

        adminName:
            AdminState.currentUser
                ?.fullName ||
            AdminState.currentUser
                ?.name ||
            "مدير النظام",

        action:
            action,

        details:
            details,

        createdAt:
            new Date().toISOString()
    });

    adminSaveStorage(
        AdminStorageKeys.auditLog,
        records.slice(0, 500)
    );
}

/* =========================================================
   تصنيفات المستخدمين
========================================================= */

function getAdminRoleLabel(role) {
    const labels = {
        admin:
            "مدير النظام",

        entrepreneur:
            "رائد أعمال",

        beginner:
            "صاحب فكرة",

        expert:
            "خبير",

        investor:
            "مستثمر",

        mentor:
            "مرشد",

        user:
            "مستخدم"
    };

    return labels[role] ||
        "مستخدم";
}

function getAdminUserStatusLabel(status) {
    const labels = {
        active:
            "نشط",

        inactive:
            "غير نشط",

        pending:
            "قيد المراجعة",

        blocked:
            "محظور"
    };

    return labels[status] ||
        "نشط";
}

function getAdminProjectStatusLabel(status) {
    const labels = {
        pending:
            "قيد المراجعة",

        reviewing:
            "قيد المراجعة",

        approved:
            "مقبول",

        rejected:
            "مرفوض",

        changes:
            "يحتاج تعديل",

        draft:
            "مسودة",

        active:
            "نشط",

        completed:
            "مكتمل"
    };

    return labels[status] ||
        status;
}

function getAdminMessageStatusLabel(status) {
    const labels = {
        pending:
            "جديدة",

        reviewing:
            "قيد المراجعة",

        closed:
            "مغلقة"
    };

    return labels[status] ||
        "جديدة";
}

function getAdminPriorityLabel(priority) {
    const labels = {
        low:
            "منخفضة",

        medium:
            "متوسطة",

        high:
            "عالية",

        urgent:
            "عاجلة"
    };

    return labels[priority] ||
        "متوسطة";
}

/* =========================================================
   الإحصائيات
========================================================= */

function renderAdminStatistics() {
    const totalUsers =
        AdminState.users.length;

    const activeUsers =
        AdminState.users.filter(
            (user) =>
                user.status ===
                "active"
        ).length;

    const totalProjects =
        AdminState.projects.length;

    const pendingProjects =
        AdminState.projects.filter(
            (project) =>
                [
                    "pending",
                    "reviewing"
                ].includes(
                    project.status
                )
        ).length;

    const approvedProjects =
        AdminState.projects.filter(
            (project) =>
                project.status ===
                "approved"
        ).length;

    const rejectedProjects =
        AdminState.projects.filter(
            (project) =>
                project.status ===
                "rejected"
        ).length;

    const totalMessages =
        AdminState.messages.length;

    const pendingMessages =
        AdminState.messages.filter(
            (message) =>
                message.status ===
                "pending"
        ).length;

    const totalStories =
        AdminState.stories.length;

    const totalGroups =
        AdminState.groups.length;

    const values = {
        adminTotalUsers:
            totalUsers,

        adminActiveUsers:
            activeUsers,

        adminTotalProjects:
            totalProjects,

        adminPendingProjects:
            pendingProjects,

        adminApprovedProjects:
            approvedProjects,

        adminRejectedProjects:
            rejectedProjects,

        adminTotalMessages:
            totalMessages,

        adminPendingMessages:
            pendingMessages,

        adminTotalStories:
            totalStories,

        adminTotalGroups:
            totalGroups
    };

    Object.entries(values).forEach(
        ([id, value]) => {
            const element =
                adminGetElement(id);

            if (element) {
                element.textContent =
                    adminFormatNumber(
                        value
                    );
            }
        }
    );
}

/* =========================================================
   فلترة المستخدمين
========================================================= */

function applyUserFilters() {
    let users = [
        ...AdminState.users
    ];

    const query =
        adminNormalizeText(
            AdminState
                .userFilters
                .search
        );

    if (query) {
        users =
            users.filter(
                (user) =>
                    adminNormalizeText(
                        [
                            user.fullName,
                            user.email,
                            user.phone,
                            getAdminRoleLabel(
                                user.role
                            )
                        ].join(" ")
                    ).includes(query)
            );
    }

    if (
        AdminState.userFilters.role !==
        "all"
    ) {
        users =
            users.filter(
                (user) =>
                    user.role ===
                    AdminState
                        .userFilters
                        .role
            );
    }

    if (
        AdminState.userFilters.status !==
        "all"
    ) {
        users =
            users.filter(
                (user) =>
                    user.status ===
                    AdminState
                        .userFilters
                        .status
            );
    }

    users.sort(
        (first, second) =>
            new Date(
                second.createdAt
            ) -
            new Date(
                first.createdAt
            )
    );

    AdminState.filteredUsers =
        users;

    renderAdminUsers();
}

/* =========================================================
   عرض المستخدمين
========================================================= */

function renderAdminUsers() {
    const tableBody =
        adminGetElement(
            "adminUsersTableBody"
        );

    const list =
        adminGetElement(
            "adminUsersList"
        );

    if (
        !tableBody &&
        !list
    ) {
        return;
    }

    if (tableBody) {
        tableBody.innerHTML = "";

        if (
            AdminState.filteredUsers.length ===
            0
        ) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="admin-empty-state">
                            لا توجد حسابات مطابقة.
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        AdminState.filteredUsers.forEach(
            (user) => {
                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `
                    <td>
                        <div class="admin-user-cell">

                            <div class="admin-avatar">
                                ${adminEscapeHTML(
                                    getAdminInitials(
                                        user.fullName
                                    )
                                )}
                            </div>

                            <div>

                                <strong>
                                    ${adminEscapeHTML(
                                        user.fullName
                                    )}
                                </strong>

                                <span>
                                    ${adminEscapeHTML(
                                        user.email ||
                                        "لا يوجد بريد"
                                    )}
                                </span>

                            </div>

                        </div>
                    </td>

                    <td>
                        ${adminEscapeHTML(
                            getAdminRoleLabel(
                                user.role
                            )
                        )}
                    </td>

                    <td>
                        <span class="admin-status ${user.status}">
                            ${adminEscapeHTML(
                                getAdminUserStatusLabel(
                                    user.status
                                )
                            )}
                        </span>
                    </td>

                    <td>
                        ${adminEscapeHTML(
                            adminFormatDate(
                                user.createdAt
                            )
                        )}
                    </td>

                    <td>
                        ${adminEscapeHTML(
                            user.lastLoginAt
                                ? adminFormatDateTime(
                                    user.lastLoginAt
                                )
                                : "لم يسجل الدخول"
                        )}
                    </td>

                    <td>
                        <div class="admin-table-actions">

                            <button
                                type="button"
                                data-view-user="${user.id}"
                            >
                                عرض
                            </button>

                            <button
                                type="button"
                                data-toggle-user="${user.id}"
                            >
                                ${
                                    user.status ===
                                    "active"
                                        ? "تعطيل"
                                        : "تفعيل"
                                }
                            </button>

                            <button
                                type="button"
                                data-delete-user="${user.id}"
                            >
                                حذف
                            </button>

                        </div>
                    </td>
                `;

                tableBody.appendChild(
                    row
                );
            }
        );

        bindAdminUserActions();
    }

    if (list) {
        list.innerHTML = "";

        AdminState.filteredUsers.forEach(
            (user) => {
                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "admin-user-card";

                card.innerHTML = `
                    <div class="admin-avatar">
                        ${adminEscapeHTML(
                            getAdminInitials(
                                user.fullName
                            )
                        )}
                    </div>

                    <div>
                        <h3>
                            ${adminEscapeHTML(
                                user.fullName
                            )}
                        </h3>

                        <p>
                            ${adminEscapeHTML(
                                user.email
                            )}
                        </p>

                        <span>
                            ${adminEscapeHTML(
                                getAdminRoleLabel(
                                    user.role
                                )
                            )}
                        </span>
                    </div>
                `;

                list.appendChild(
                    card
                );
            }
        );
    }
}

function getAdminInitials(name) {
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

/* =========================================================
   إجراءات المستخدمين
========================================================= */

function bindAdminUserActions() {
    adminSelectAll(
        "[data-view-user]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    openAdminUser(
                        button.dataset
                            .viewUser
                    );
                }
            );
        }
    );

    adminSelectAll(
        "[data-toggle-user]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    toggleAdminUser(
                        button.dataset
                            .toggleUser
                    );
                }
            );
        }
    );

    adminSelectAll(
        "[data-delete-user]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    deleteAdminUser(
                        button.dataset
                            .deleteUser
                    );
                }
            );
        }
    );
}

function openAdminUser(userId) {
    const user =
        AdminState.users.find(
            (item) =>
                item.id === userId
        );

    if (!user) {
        return;
    }

    AdminState.selectedUserId =
        user.id;

    setAdminText(
        "adminUserDetailsName",
        user.fullName
    );

    setAdminText(
        "adminUserDetailsEmail",
        user.email ||
        "لا يوجد بريد"
    );

    setAdminText(
        "adminUserDetailsPhone",
        user.phone ||
        "غير محدد"
    );

    setAdminText(
        "adminUserDetailsRole",
        getAdminRoleLabel(
            user.role
        )
    );

    setAdminText(
        "adminUserDetailsStatus",
        getAdminUserStatusLabel(
            user.status
        )
    );

    setAdminText(
        "adminUserDetailsCreatedAt",
        adminFormatDateTime(
            user.createdAt
        )
    );

    const modal =
        adminGetElement(
            "adminUserDetailsModal"
        );

    if (modal) {
        if (
            typeof window.openModal ===
            "function"
        ) {
            window.openModal(modal);
        } else {
            modal.hidden = false;
        }
    }
}

function toggleAdminUser(userId) {
    const user =
        AdminState.users.find(
            (item) =>
                item.id === userId
        );

    if (!user) {
        return;
    }

    if (
        user.role === "admin" &&
        user.id ===
        AdminState.currentUser.id
    ) {
        adminShowMessage(
            "لا يمكنك تعطيل حساب المدير الحالي.",
            "warning"
        );

        return;
    }

    user.status =
        user.status === "active"
            ? "inactive"
            : "active";

    user.isActive =
        user.status === "active";

    user.updatedAt =
        new Date().toISOString();

    saveAdminUsers();

    addAdminAuditLog(
        "toggle-user-status",
        {
            userId:
                user.id,

            status:
                user.status
        }
    );

    applyUserFilters();
    renderAdminStatistics();

    adminShowMessage(
        user.status === "active"
            ? "تم تفعيل الحساب."
            : "تم تعطيل الحساب.",
        "success"
    );
}

function deleteAdminUser(userId) {
    const user =
        AdminState.users.find(
            (item) =>
                item.id === userId
        );

    if (!user) {
        return;
    }

    if (
        user.id ===
        AdminState.currentUser.id
    ) {
        adminShowMessage(
            "لا يمكنك حذف حسابك الحالي.",
            "warning"
        );

        return;
    }

    const confirmed =
        window.confirm(
            `هل تريد حذف حساب "${user.fullName}"؟`
        );

    if (!confirmed) {
        return;
    }

    AdminState.users =
        AdminState.users.filter(
            (item) =>
                item.id !== userId
        );

    saveAdminUsers();

    addAdminAuditLog(
        "delete-user",
        {
            userId:
                user.id,

            email:
                user.email
        }
    );

    applyUserFilters();
    renderAdminStatistics();

    adminShowMessage(
        "تم حذف الحساب.",
        "success"
    );
}

/* =========================================================
   فلترة المشاريع
========================================================= */

function applyProjectFilters() {
    let projects = [
        ...AdminState.projects
    ];

    const query =
        adminNormalizeText(
            AdminState
                .projectFilters
                .search
        );

    if (query) {
        projects =
            projects.filter(
                (project) =>
                    adminNormalizeText(
                        [
                            project.name,
                            project.description,
                            project.ownerName,
                            getAdminProjectOwner(
                                project
                            ),
                            project.category
                        ].join(" ")
                    ).includes(query)
            );
    }

    if (
        AdminState.projectFilters.status !==
        "all"
    ) {
        projects =
            projects.filter(
                (project) =>
                    project.status ===
                    AdminState
                        .projectFilters
                        .status
            );
    }

    if (
        AdminState.projectFilters.category !==
        "all"
    ) {
        projects =
            projects.filter(
                (project) =>
                    project.category ===
                    AdminState
                        .projectFilters
                        .category
            );
    }

    projects.sort(
        (first, second) =>
            new Date(
                second.createdAt
            ) -
            new Date(
                first.createdAt
            )
    );

    AdminState.filteredProjects =
        projects;

    renderAdminProjects();
}

/* =========================================================
   عرض المشاريع
========================================================= */

function renderAdminProjects() {
    const tableBody =
        adminGetElement(
            "adminProjectsTableBody"
        );

    const list =
        adminGetElement(
            "adminProjectsList"
        );

    if (
        !tableBody &&
        !list
    ) {
        return;
    }

    if (tableBody) {
        tableBody.innerHTML = "";

        if (
            AdminState.filteredProjects.length ===
            0
        ) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="admin-empty-state">
                            لا توجد مشاريع مطابقة.
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        AdminState.filteredProjects.forEach(
            (project) => {
                const row =
                    document.createElement(
                        "tr"
                    );

                row.innerHTML = `
                    <td>
                        <div class="admin-project-cell">

                            <div class="admin-project-icon">
                                🚀
                            </div>

                            <div>

                                <strong>
                                    ${adminEscapeHTML(
                                        project.name
                                    )}
                                </strong>

                                <span>
                                    ${adminEscapeHTML(
                                        adminTruncateText(
                                            project.description,
                                            60
                                        )
                                    )}
                                </span>

                            </div>

                        </div>
                    </td>

                    <td>
                        ${adminEscapeHTML(
                            getAdminProjectOwner(
                                project
                            )
                        )}
                    </td>

                    <td>
                        ${adminEscapeHTML(
                            project.category ||
                            "عام"
                        )}
                    </td>

                    <td>
                        <span class="admin-status ${project.status}">
                            ${adminEscapeHTML(
                                getAdminProjectStatusLabel(
                                    project.status
                                )
                            )}
                        </span>
                    </td>

                    <td>
                        ${adminEscapeHTML(
                            String(
                                project.score || 0
                            )
                        )}/100
                    </td>

                    <td>
                        ${adminEscapeHTML(
                            adminFormatDate(
                                project.createdAt
                            )
                        )}
                    </td>

                    <td>
                        <div class="admin-table-actions">

                            <button
                                type="button"
                                data-view-project="${project.id}"
                            >
                                عرض
                            </button>

                            <button
                                type="button"
                                data-approve-project="${project.id}"
                            >
                                قبول
                            </button>

                            <button
                                type="button"
                                data-reject-project="${project.id}"
                            >
                                رفض
                            </button>

                        </div>
                    </td>
                `;

                tableBody.appendChild(
                    row
                );
            }
        );

        bindAdminProjectActions();
    }

    if (list) {
        list.innerHTML = "";

        AdminState.filteredProjects.forEach(
            (project) => {
                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "admin-project-card";

                card.innerHTML = `
                    <h3>
                        ${adminEscapeHTML(
                            project.name
                        )}
                    </h3>

                    <p>
                        ${adminEscapeHTML(
                            adminTruncateText(
                                project.description,
                                110
                            )
                        )}
                    </p>

                    <span>
                        ${adminEscapeHTML(
                            getAdminProjectStatusLabel(
                                project.status
                            )
                        )}
                    </span>
                `;

                list.appendChild(
                    card
                );
            }
        );
    }
}

function getAdminProjectOwner(project) {
    const user =
        AdminState.users.find(
            (item) =>
                item.id ===
                project.ownerId
        );

    return (
        user?.fullName ||
        user?.name ||
        project.ownerName ||
        "غير محدد"
    );
}

/* =========================================================
   إجراءات المشاريع
========================================================= */

function bindAdminProjectActions() {
    adminSelectAll(
        "[data-view-project]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    openAdminProject(
                        button.dataset
                            .viewProject
                    );
                }
            );
        }
    );

    adminSelectAll(
        "[data-approve-project]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    approveAdminProject(
                        button.dataset
                            .approveProject
                    );
                }
            );
        }
    );

    adminSelectAll(
        "[data-reject-project]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    rejectAdminProject(
                        button.dataset
                            .rejectProject
                    );
                }
            );
        }
    );
}

function openAdminProject(projectId) {
    const project =
        AdminState.projects.find(
            (item) =>
                item.id ===
                projectId
        );

    if (!project) {
        return;
    }

    AdminState.selectedProjectId =
        project.id;

    setAdminText(
        "adminProjectDetailsName",
        project.name
    );

    setAdminText(
        "adminProjectDetailsOwner",
        getAdminProjectOwner(
            project
        )
    );

    setAdminText(
        "adminProjectDetailsCategory",
        project.category ||
        "عام"
    );

    setAdminText(
        "adminProjectDetailsStatus",
        getAdminProjectStatusLabel(
            project.status
        )
    );

    setAdminText(
        "adminProjectDetailsScore",
        `${project.score || 0}/100`
    );

    setAdminText(
        "adminProjectDetailsDescription",
        project.description ||
        "لا يوجد وصف."
    );

    const notes =
        adminGetElement(
            "adminProjectNotes"
        );

    if (notes) {
        notes.value =
            project.adminNotes ||
            "";
    }

    const modal =
        adminGetElement(
            "adminProjectDetailsModal"
        );

    if (modal) {
        if (
            typeof window.openModal ===
            "function"
        ) {
            window.openModal(modal);
        } else {
            modal.hidden = false;
        }
    }
}

function approveAdminProject(projectId) {
    const project =
        AdminState.projects.find(
            (item) =>
                item.id === projectId
        );

    if (!project) {
        return;
    }

    project.status =
        "approved";

    project.rejectionReason =
        "";

    project.updatedAt =
        new Date().toISOString();

    saveAdminProjects();

    createAdminNotification({
        title:
            "تم قبول المشروع",

        message:
            `تم قبول مشروع ${project.name}.`,

        userId:
            project.ownerId,

        link:
            `dashboard.html?project=${project.id}`
    });

    addAdminAuditLog(
        "approve-project",
        {
            projectId:
                project.id,

            name:
                project.name
        }
    );

    applyProjectFilters();
    renderAdminStatistics();

    adminShowMessage(
        "تم قبول المشروع.",
        "success"
    );
}

function rejectAdminProject(projectId) {
    const project =
        AdminState.projects.find(
            (item) =>
                item.id === projectId
        );

    if (!project) {
        return;
    }

    const reason =
        window.prompt(
            "اكتب سبب رفض المشروع:"
        );

    if (
        reason === null
    ) {
        return;
    }

    if (
        reason.trim().length < 5
    ) {
        adminShowMessage(
            "اكتب سببًا واضحًا للرفض.",
            "warning"
        );

        return;
    }

    project.status =
        "rejected";

    project.rejectionReason =
        reason.trim();

    project.updatedAt =
        new Date().toISOString();

    saveAdminProjects();

    createAdminNotification({
        title:
            "تم رفض المشروع",

        message:
            `تم رفض مشروع ${project.name}. السبب: ${reason.trim()}`,

        userId:
            project.ownerId,

        link:
            `dashboard.html?project=${project.id}`
    });

    addAdminAuditLog(
        "reject-project",
        {
            projectId:
                project.id,

            reason:
                reason.trim()
        }
    );

    applyProjectFilters();
    renderAdminStatistics();

    adminShowMessage(
        "تم رفض المشروع.",
        "success"
    );
}

function saveAdminProjectNotes() {
    const project =
        AdminState.projects.find(
            (item) =>
                item.id ===
                AdminState.selectedProjectId
        );

    if (!project) {
        return;
    }

    const notes =
        adminGetElement(
            "adminProjectNotes"
        )?.value.trim() ||
        "";

    project.adminNotes =
        notes;

    project.updatedAt =
        new Date().toISOString();

    saveAdminProjects();

    addAdminAuditLog(
        "save-project-notes",
        {
            projectId:
                project.id
        }
    );

    adminShowMessage(
        "تم حفظ ملاحظات المشروع.",
        "success"
    );
}

/* =========================================================
   فلترة الرسائل
========================================================= */

function applyMessageFilters() {
    let messages = [
        ...AdminState.messages
    ];

    const query =
        adminNormalizeText(
            AdminState
                .messageFilters
                .search
        );

    if (query) {
        messages =
            messages.filter(
                (message) =>
                    adminNormalizeText(
                        [
                            message.subject,
                            message.message,
                            message.senderName,
                            message.senderEmail
                        ].join(" ")
                    ).includes(query)
            );
    }

    if (
        AdminState.messageFilters.status !==
        "all"
    ) {
        messages =
            messages.filter(
                (message) =>
                    message.status ===
                    AdminState
                        .messageFilters
                        .status
            );
    }

    if (
        AdminState.messageFilters.category !==
        "all"
    ) {
        messages =
            messages.filter(
                (message) =>
                    message.category ===
                    AdminState
                        .messageFilters
                        .category
            );
    }

    if (
        AdminState.messageFilters.priority !==
        "all"
    ) {
        messages =
            messages.filter(
                (message) =>
                    message.priority ===
                    AdminState
                        .messageFilters
                        .priority
            );
    }

    messages.sort(
        (first, second) =>
            new Date(
                second.createdAt
            ) -
            new Date(
                first.createdAt
            )
    );

    AdminState.filteredMessages =
        messages;

    renderAdminMessages();
}

/* =========================================================
   عرض الرسائل
========================================================= */

function renderAdminMessages() {
    const container =
        adminGetElement(
            "adminMessagesList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        AdminState.filteredMessages.length ===
        0
    ) {
        container.innerHTML = `
            <div class="admin-empty-state">
                لا توجد رسائل مطابقة.
            </div>
        `;

        return;
    }

    AdminState.filteredMessages.forEach(
        (message) => {
            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                `admin-message-item ${
                    message.id ===
                    AdminState.selectedMessageId
                        ? "active"
                        : ""
                }`;

            button.innerHTML = `
                <div class="admin-avatar">
                    ${adminEscapeHTML(
                        getAdminInitials(
                            message.senderName
                        )
                    )}
                </div>

                <div class="admin-message-content">

                    <strong>
                        ${adminEscapeHTML(
                            message.subject
                        )}
                    </strong>

                    <span>
                        ${adminEscapeHTML(
                            message.senderName
                        )}
                    </span>

                    <p>
                        ${adminEscapeHTML(
                            adminTruncateText(
                                message.message,
                                90
                            )
                        )}
                    </p>

                </div>

                <div class="admin-message-meta">

                    <span>
                        ${adminEscapeHTML(
                            adminFormatDate(
                                message.createdAt
                            )
                        )}
                    </span>

                    <small class="${message.status}">
                        ${adminEscapeHTML(
                            getAdminMessageStatusLabel(
                                message.status
                            )
                        )}
                    </small>

                </div>
            `;

            button.addEventListener(
                "click",
                () => {
                    openAdminMessage(
                        message.id
                    );
                }
            );

            container.appendChild(
                button
            );
        }
    );
}

/* =========================================================
   تفاصيل الرسائل
========================================================= */

function openAdminMessage(messageId) {
    const message =
        AdminState.messages.find(
            (item) =>
                item.id ===
                messageId
        );

    if (!message) {
        return;
    }

    AdminState.selectedMessageId =
        message.id;

    setAdminText(
        "adminMessageSenderName",
        message.senderName
    );

    setAdminText(
        "adminMessageSenderEmail",
        message.senderEmail ||
        "لا يوجد بريد"
    );

    setAdminText(
        "adminMessageSubject",
        message.subject
    );

    setAdminText(
        "adminMessageBody",
        message.message ||
        "لا يوجد محتوى."
    );

    setAdminText(
        "adminMessageStatus",
        getAdminMessageStatusLabel(
            message.status
        )
    );

    setAdminText(
        "adminMessagePriority",
        getAdminPriorityLabel(
            message.priority
        )
    );

    const reply =
        adminGetElement(
            "adminMessageReply"
        );

    if (reply) {
        reply.value =
            message.adminReply ||
            "";
    }

    renderAdminMessages();
}

function saveAdminMessageReply() {
    const message =
        AdminState.messages.find(
            (item) =>
                item.id ===
                AdminState.selectedMessageId
        );

    if (!message) {
        adminShowMessage(
            "اختر رسالة أولًا.",
            "warning"
        );

        return;
    }

    const reply =
        adminGetElement(
            "adminMessageReply"
        )?.value.trim() ||
        "";

    const status =
        adminGetElement(
            "adminMessageReplyStatus"
        )?.value ||
        "closed";

    if (
        reply.length < 5
    ) {
        adminShowMessage(
            "اكتب ردًا واضحًا.",
            "warning"
        );

        return;
    }

    message.adminReply =
        reply;

    message.status =
        status;

    message.updatedAt =
        new Date().toISOString();

    saveAdminMessages();

    addAdminAuditLog(
        "reply-message",
        {
            messageId:
                message.id,

            status:
                status
        }
    );

    applyMessageFilters();
    renderAdminStatistics();

    adminShowMessage(
        "تم حفظ الرد.",
        "success"
    );
}

function updateAdminMessageStatus(
    status
) {
    const message =
        AdminState.messages.find(
            (item) =>
                item.id ===
                AdminState.selectedMessageId
        );

    if (!message) {
        return;
    }

    message.status =
        status;

    message.updatedAt =
        new Date().toISOString();

    saveAdminMessages();

    addAdminAuditLog(
        "update-message-status",
        {
            messageId:
                message.id,

            status:
                status
        }
    );

    applyMessageFilters();
    renderAdminStatistics();
}

function deleteAdminMessage() {
    const message =
        AdminState.messages.find(
            (item) =>
                item.id ===
                AdminState.selectedMessageId
        );

    if (!message) {
        return;
    }

    const confirmed =
        window.confirm(
            `هل تريد حذف الرسالة "${message.subject}"؟`
        );

    if (!confirmed) {
        return;
    }

    AdminState.messages =
        AdminState.messages.filter(
            (item) =>
                item.id !==
                message.id
        );

    AdminState.selectedMessageId =
        "";

    saveAdminMessages();

    addAdminAuditLog(
        "delete-message",
        {
            messageId:
                message.id
        }
    );

    applyMessageFilters();
    renderAdminStatistics();

    adminShowMessage(
        "تم حذف الرسالة.",
        "success"
    );
}

/* =========================================================
   الإشعارات
========================================================= */

function createAdminNotification({
    title,
    message,
    userId = "",
    link = ""
}) {
    const notification = {
        id:
            adminCreateId(
                "NOTIFICATION"
            ),

        userId:
            userId,

        title:
            title,

        message:
            message,

        type:
            "info",

        link:
            link,

        isRead:
            false,

        createdAt:
            new Date().toISOString()
    };

    AdminState.notifications.unshift(
        notification
    );

    adminSaveStorage(
        AdminStorageKeys.notifications,
        AdminState.notifications
    );

    return notification;
}

/* =========================================================
   مساعدات الواجهة
========================================================= */

function setAdminText(
    elementId,
    value
) {
    const element =
        adminGetElement(
            elementId
        );

    if (element) {
        element.textContent =
            value;
    }
}

function applyAllAdminFilters() {
    applyUserFilters();
    applyProjectFilters();
    applyMessageFilters();
}

/* =========================================================
   التصدير
========================================================= */

function exportAdminData() {
    const data = {
        users:
            AdminState.users,

        projects:
            AdminState.projects,

        analyses:
            AdminState.analyses,

        messages:
            AdminState.messages,

        stories:
            AdminState.stories,

        groups:
            AdminState.groups,

        exportedAt:
            new Date().toISOString()
    };

    if (
        typeof window.downloadJSON ===
        "function"
    ) {
        window.downloadJSON(
            data,
            `project-journey-admin-export-${Date.now()}.json`
        );

        return;
    }

    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        `project-journey-admin-export-${Date.now()}.json`;

    document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

/* =========================================================
   إعدادات الإدارة
========================================================= */

function saveAdminSettings() {
    const settings = {
        applicationName:
            adminGetElement(
                "adminApplicationName"
            )?.value.trim() ||
            "رحلة مشروع",

        allowRegistration:
            Boolean(
                adminGetElement(
                    "adminAllowRegistration"
                )?.checked
            ),

        requireProjectReview:
            Boolean(
                adminGetElement(
                    "adminRequireProjectReview"
                )?.checked
            ),

        enableNotifications:
            Boolean(
                adminGetElement(
                    "adminEnableNotifications"
                )?.checked
            ),

        maintenanceMode:
            Boolean(
                adminGetElement(
                    "adminMaintenanceMode"
                )?.checked
            ),

        updatedAt:
            new Date().toISOString(),

        updatedBy:
            AdminState.currentUser
                ?.id ||
            ""
    };

    adminSaveStorage(
        AdminStorageKeys.adminSettings,
        settings
    );

    addAdminAuditLog(
        "save-admin-settings",
        settings
    );

    adminShowMessage(
        "تم حفظ إعدادات الإدارة.",
        "success"
    );
}

function loadAdminSettings() {
    const settings =
        adminReadStorage(
            AdminStorageKeys.adminSettings,
            {}
        );

    const nameField =
        adminGetElement(
            "adminApplicationName"
        );

    if (nameField) {
        nameField.value =
            settings.applicationName ||
            "رحلة مشروع";
    }

    setAdminCheckbox(
        "adminAllowRegistration",
        settings.allowRegistration !==
            false
    );

    setAdminCheckbox(
        "adminRequireProjectReview",
        settings.requireProjectReview !==
            false
    );

    setAdminCheckbox(
        "adminEnableNotifications",
        settings.enableNotifications !==
            false
    );

    setAdminCheckbox(
        "adminMaintenanceMode",
        Boolean(
            settings.maintenanceMode
        )
    );
}

function setAdminCheckbox(
    elementId,
    checked
) {
    const element =
        adminGetElement(
            elementId
        );

    if (element) {
        element.checked =
            checked;
    }
}

/* =========================================================
   النسخ الاحتياطي
========================================================= */

function createAdminBackup() {
    exportAdminData();

    addAdminAuditLog(
        "create-backup"
    );

    adminShowMessage(
        "تم إنشاء نسخة احتياطية.",
        "success"
    );
}

function restoreAdminBackup(file) {
    if (!file) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload = () => {
        try {
            const data =
                JSON.parse(
                    String(
                        reader.result
                    )
                );

            if (
                Array.isArray(
                    data.users
                )
            ) {
                AdminState.users =
                    data.users;

                saveAdminUsers();
            }

            if (
                Array.isArray(
                    data.projects
                )
            ) {
                AdminState.projects =
                    data.projects;

                saveAdminProjects();
            }

            if (
                Array.isArray(
                    data.messages
                )
            ) {
                AdminState.messages =
                    data.messages;

                saveAdminMessages();
            }

            if (
                Array.isArray(
                    data.analyses
                )
            ) {
                AdminState.analyses =
                    data.analyses;

                adminSaveStorage(
                    AdminStorageKeys.analyses,
                    data.analyses
                );
            }

            if (
                Array.isArray(
                    data.stories
                )
            ) {
                AdminState.stories =
                    data.stories;

                adminSaveStorage(
                    AdminStorageKeys.stories,
                    data.stories
                );
            }

            if (
                Array.isArray(
                    data.groups
                )
            ) {
                AdminState.groups =
                    data.groups;

                adminSaveStorage(
                    AdminStorageKeys.groups,
                    data.groups
                );
            }

            addAdminAuditLog(
                "restore-backup",
                {
                    fileName:
                        file.name
                }
            );

            loadAdminData();

            adminShowMessage(
                "تمت استعادة النسخة الاحتياطية.",
                "success"
            );
        } catch (error) {
            console.error(error);

            adminShowMessage(
                "الملف غير صالح للاستعادة.",
                "error"
            );
        }
    };

    reader.readAsText(file);
}

/* =========================================================
   التنسيقات
========================================================= */

function injectAdminStyles() {
    if (
        adminGetElement(
            "projectJourneyAdminStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "projectJourneyAdminStyles";

    style.textContent = `
        .admin-empty-state {
            padding: 38px 16px;
            text-align: center;
            color: #68758c;
            font-size: 10px;
        }

        .admin-user-cell,
        .admin-project-cell {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .admin-avatar,
        .admin-project-icon {
            width: 39px;
            height: 39px;
            flex: 0 0 auto;
            border-radius: 12px;
            display: grid;
            place-items: center;
            color: #ffffff;
            background:
                linear-gradient(
                    135deg,
                    #1565ff,
                    #6ba7ff
                );
            font-size: 11px;
            font-weight: 900;
        }

        .admin-project-icon {
            font-size: 16px;
        }

        .admin-user-cell strong,
        .admin-project-cell strong {
            display: block;
            font-size: 10px;
        }

        .admin-user-cell span,
        .admin-project-cell span {
            display: block;
            margin-top: 4px;
            color: #68758c;
            font-size: 8px;
        }

        .admin-status {
            width: max-content;
            padding: 5px 8px;
            border-radius: 999px;
            color: #179b5f;
            background: #e9fff3;
            font-size: 8px;
            font-weight: 900;
        }

        .admin-status.pending,
        .admin-status.reviewing,
        .admin-status.changes {
            color: #f59e0b;
            background: #fff8e7;
        }

        .admin-status.rejected,
        .admin-status.inactive,
        .admin-status.blocked {
            color: #dc3545;
            background: #fff0f1;
        }

        .admin-table-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }

        .admin-table-actions button {
            min-height: 29px;
            padding: 0 9px;
            border: 0;
            border-radius: 8px;
            color: #1565ff;
            background: #eaf2ff;
            cursor: pointer;
            font-size: 8px;
            font-weight: 800;
        }

        .admin-table-actions button:last-child {
            color: #dc3545;
            background: #fff0f1;
        }

        .admin-message-item {
            width: 100%;
            padding: 13px;
            border: 1px solid transparent;
            border-radius: 14px;
            display: grid;
            grid-template-columns:
                auto minmax(0, 1fr) auto;
            align-items: start;
            gap: 10px;
            text-align: right;
            background: transparent;
            cursor: pointer;
        }

        .admin-message-item:hover,
        .admin-message-item.active {
            background: #eaf2ff;
            border-color: #cfe0ff;
        }

        .admin-message-content {
            min-width: 0;
        }

        .admin-message-content strong {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 10px;
        }

        .admin-message-content span {
            display: block;
            margin-top: 4px;
            color: #68758c;
            font-size: 8px;
        }

        .admin-message-content p {
            margin: 5px 0 0;
            color: #68758c;
            font-size: 8px;
            line-height: 1.6;
        }

        .admin-message-meta {
            display: grid;
            justify-items: end;
            gap: 7px;
            color: #68758c;
            font-size: 8px;
        }

        .admin-message-meta small {
            padding: 5px 7px;
            border-radius: 999px;
            color: #f59e0b;
            background: #fff8e7;
        }

        .admin-message-meta small.closed {
            color: #179b5f;
            background: #e9fff3;
        }

        .admin-user-card,
        .admin-project-card {
            padding: 15px;
            border-radius: 15px;
            background: #ffffff;
            border: 1px solid #dbe7f7;
            box-shadow:
                0 10px 25px
                rgba(24, 71, 139, 0.07);
        }

        .admin-project-card h3,
        .admin-user-card h3 {
            margin: 0;
            font-size: 14px;
        }

        .admin-project-card p,
        .admin-user-card p {
            margin: 7px 0 0;
            color: #68758c;
            font-size: 9px;
            line-height: 1.7;
        }
    `;

    document.head.appendChild(
        style
    );
}

/* =========================================================
   ربط الفلاتر
========================================================= */

function initializeAdminFilters() {
    let userTimer;
    let projectTimer;
    let messageTimer;

    adminGetElement(
        "adminUserSearch"
    )?.addEventListener(
        "input",
        (event) => {
            window.clearTimeout(
                userTimer
            );

            userTimer =
                window.setTimeout(
                    () => {
                        AdminState
                            .userFilters
                            .search =
                            event.target.value;

                        applyUserFilters();
                    },
                    180
                );
        }
    );

    adminGetElement(
        "adminUserRoleFilter"
    )?.addEventListener(
        "change",
        (event) => {
            AdminState
                .userFilters
                .role =
                event.target.value;

            applyUserFilters();
        }
    );

    adminGetElement(
        "adminUserStatusFilter"
    )?.addEventListener(
        "change",
        (event) => {
            AdminState
                .userFilters
                .status =
                event.target.value;

            applyUserFilters();
        }
    );

    adminGetElement(
        "adminProjectSearch"
    )?.addEventListener(
        "input",
        (event) => {
            window.clearTimeout(
                projectTimer
            );

            projectTimer =
                window.setTimeout(
                    () => {
                        AdminState
                            .projectFilters
                            .search =
                            event.target.value;

                        applyProjectFilters();
                    },
                    180
                );
        }
    );

    adminGetElement(
        "adminProjectStatusFilter"
    )?.addEventListener(
        "change",
        (event) => {
            AdminState
                .projectFilters
                .status =
                event.target.value;

            applyProjectFilters();
        }
    );

    adminGetElement(
        "adminProjectCategoryFilter"
    )?.addEventListener(
        "change",
        (event) => {
            AdminState
                .projectFilters
                .category =
                event.target.value;

            applyProjectFilters();
        }
    );

    adminGetElement(
        "adminMessageSearch"
    )?.addEventListener(
        "input",
        (event) => {
            window.clearTimeout(
                messageTimer
            );

            messageTimer =
                window.setTimeout(
                    () => {
                        AdminState
                            .messageFilters
                            .search =
                            event.target.value;

                        applyMessageFilters();
                    },
                    180
                );
        }
    );

    adminGetElement(
        "adminMessageStatusFilter"
    )?.addEventListener(
        "change",
        (event) => {
            AdminState
                .messageFilters
                .status =
                event.target.value;

            applyMessageFilters();
        }
    );

    adminGetElement(
        "adminMessageCategoryFilter"
    )?.addEventListener(
        "change",
        (event) => {
            AdminState
                .messageFilters
                .category =
                event.target.value;

            applyMessageFilters();
        }
    );

    adminGetElement(
        "adminMessagePriorityFilter"
    )?.addEventListener(
        "change",
        (event) => {
            AdminState
                .messageFilters
                .priority =
                event.target.value;

            applyMessageFilters();
        }
    );
}

/* =========================================================
   ربط الأحداث
========================================================= */

function initializeAdminEvents() {
    initializeAdminFilters();

    [
        "adminRefreshButton",
        "headerRefreshButton",
        "refreshStatisticsButton"
    ].forEach(
        (id) => {
            adminGetElement(id)
                ?.addEventListener(
                    "click",
                    loadAdminData
                );
        }
    );

    adminGetElement(
        "adminSaveProjectNotesButton"
    )?.addEventListener(
        "click",
        saveAdminProjectNotes
    );

    adminGetElement(
        "adminSaveMessageReplyButton"
    )?.addEventListener(
        "click",
        saveAdminMessageReply
    );

    adminGetElement(
        "adminMarkMessageReviewingButton"
    )?.addEventListener(
        "click",
        () => {
            updateAdminMessageStatus(
                "reviewing"
            );
        }
    );

    adminGetElement(
        "adminCloseMessageButton"
    )?.addEventListener(
        "click",
        () => {
            updateAdminMessageStatus(
                "closed"
            );
        }
    );

    adminGetElement(
        "adminDeleteMessageButton"
    )?.addEventListener(
        "click",
        deleteAdminMessage
    );

    adminGetElement(
        "adminExportButton"
    )?.addEventListener(
        "click",
        exportAdminData
    );

    adminGetElement(
        "adminSaveSettingsButton"
    )?.addEventListener(
        "click",
        saveAdminSettings
    );

    adminGetElement(
        "adminBackupButton"
    )?.addEventListener(
        "click",
        createAdminBackup
    );

    adminGetElement(
        "adminRestoreButton"
    )?.addEventListener(
        "click",
        () => {
            adminGetElement(
                "adminRestoreInput"
            )?.click();
        }
    );

    adminGetElement(
        "adminRestoreInput"
    )?.addEventListener(
        "change",
        (event) => {
            restoreAdminBackup(
                event.target.files[0]
            );
        }
    );

    window.addEventListener(
        "storage",
        (event) => {
            const watchedKeys = [
                AdminStorageKeys.users,
                AdminStorageKeys.projects,
                AdminStorageKeys.analyses,
                AdminStorageKeys.messages,
                AdminStorageKeys.supportMessages,
                AdminStorageKeys.stories,
                AdminStorageKeys.groups,
                AdminStorageKeys.notifications
            ];

            if (
                watchedKeys.includes(
                    event.key
                )
            ) {
                loadAdminData();
            }
        }
    );
}

/* =========================================================
   التشغيل
========================================================= */

function initializeAdminPage() {
    injectAdminStyles();

    if (
        !ensureAdminAccess()
    ) {
        return;
    }

    loadAdminData();
    loadAdminSettings();
    initializeAdminEvents();

    document.body.classList.add(
        "admin-page-ready"
    );

    hidePageLoader();

    document.dispatchEvent(
        new CustomEvent(
            "projectJourneyAdminReady",
            {
                detail: {
                    users:
                        AdminState.users.length,

                    projects:
                        AdminState.projects.length,

                    messages:
                        AdminState.messages.length
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
        initializeAdminPage
    );
} else {
    initializeAdminPage();
}

/* =========================================================
   إتاحة الوظائف
========================================================= */

window.AdminState =
    AdminState;

window.loadAdminData =
    loadAdminData;

window.openAdminUser =
    openAdminUser;

window.toggleAdminUser =
    toggleAdminUser;

window.deleteAdminUser =
    deleteAdminUser;

window.openAdminProject =
    openAdminProject;

window.approveAdminProject =
    approveAdminProject;

window.rejectAdminProject =
    rejectAdminProject;

window.openAdminMessage =
    openAdminMessage;

window.saveAdminMessageReply =
    saveAdminMessageReply;

window.exportAdminData =
    exportAdminData;

window.saveAdminSettings =
    saveAdminSettings;

window.createAdminBackup =
    createAdminBackup;

window.restoreAdminBackup =
    restoreAdminBackup;  