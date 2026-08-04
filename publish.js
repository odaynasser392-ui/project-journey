"use strict";

/* =========================================================
   رحلة مشروع - Project Journey
   إدارة نشر المشاريع والقصص والأفكار
   js/publish.js
========================================================= */

const PublishState = {
    currentUser: null,

    projects: [],
    stories: [],
    ideas: [],
    publications: [],
    notifications: [],

    selectedType: "project",
    selectedStatus: "pending",
    selectedImage: null,

    isSubmitting: false,
    isSavingDraft: false,

    draft: {
        type: "project",
        title: "",
        summary: "",
        description: "",
        category: "general",
        ownerName: "",
        projectStage: "idea",
        problem: "",
        solution: "",
        targetCustomers: "",
        targetMarket: "",
        achievements: "",
        challenges: "",
        lessons: "",
        website: "",
        contactEmail: "",
        contactPhone: "",
        status: "pending"
    }
};

/* =========================================================
   مفاتيح التخزين
========================================================= */

const PublishStorageKeys = {
    currentUser:
        "projectJourneyCurrentUser",

    projects:
        "projectJourneyProjects",

    stories:
        "projectJourneyStories",

    ideas:
        "projectJourneySavedIdeas",

    publications:
        "projectJourneyPublications",

    notifications:
        "projectJourneyNotifications",

    draft:
        "projectJourneyPublishDraft",

    adminSettings:
        "projectJourneyAdminSettings"
};

/* =========================================================
   أدوات العناصر
========================================================= */

function publishGetElement(id) {
    return document.getElementById(id);
}

function publishSelect(
    selector,
    parent
) {
    const root =
        parent || document;

    return root.querySelector(
        selector
    );
}

function publishSelectAll(
    selector,
    parent
) {
    const root =
        parent || document;

    return Array.from(
        root.querySelectorAll(
            selector
        )
    );
}

/* =========================================================
   التخزين
========================================================= */

function publishReadStorage(
    key,
    fallback
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
            "Publish storage read error:",
            error
        );

        return fallback;
    }
}

function publishSaveStorage(
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
            "Publish storage save error:",
            error
        );

        publishShowMessage(
            "تعذر حفظ البيانات.",
            "error"
        );

        return false;
    }
}

/* =========================================================
   إنشاء المعرفات
========================================================= */

function publishCreateId(
    prefix
) {
    const selectedPrefix =
        prefix || "PUBLISH";

    return (
        selectedPrefix +
        "-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 9)
    ).toUpperCase();
}

/* =========================================================
   النصوص
========================================================= */

function publishNormalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function publishEscapeHTML(value) {
    return String(
        value === undefined ||
        value === null
            ? ""
            : value
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function publishTruncateText(
    value,
    maximumLength
) {
    const text =
        String(value || "");

    const limit =
        Number(maximumLength) ||
        120;

    if (text.length <= limit) {
        return text;
    }

    return (
        text.slice(
            0,
            limit
        ) + "..."
    );
}

function publishSplitLines(value) {
    return String(value || "")
        .split(/\n|،|,/)
        .map(
            function (item) {
                return item.trim();
            }
        )
        .filter(Boolean);
}

/* =========================================================
   التاريخ
========================================================= */

function publishFormatDate(value) {
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

/* =========================================================
   الرسائل
========================================================= */

function publishShowMessage(
    message,
    type
) {
    const messageType =
        type || "info";

    if (
        typeof window.showToast ===
        "function"
    ) {
        window.showToast(
            message,
            messageType
        );

        return;
    }

    window.alert(message);
}

/* =========================================================
   التحقق من البريد والهاتف
========================================================= */

function publishIsValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            String(email || "")
                .trim()
        );
}

function publishIsValidPhone(phone) {
    const value =
        String(phone || "")
            .replace(/\s+/g, "");

    if (!value) {
        return true;
    }

    return /^[+]?[0-9]{7,15}$/
        .test(value);
}

/* =========================================================
   تحميل البيانات
========================================================= */

function loadPublishData() {
    PublishState.currentUser =
        publishReadStorage(
            PublishStorageKeys.currentUser,
            null
        );

    const projects =
        publishReadStorage(
            PublishStorageKeys.projects,
            []
        );

    const stories =
        publishReadStorage(
            PublishStorageKeys.stories,
            []
        );

    const ideas =
        publishReadStorage(
            PublishStorageKeys.ideas,
            []
        );

    const publications =
        publishReadStorage(
            PublishStorageKeys.publications,
            []
        );

    const notifications =
        publishReadStorage(
            PublishStorageKeys.notifications,
            []
        );

    const draft =
        publishReadStorage(
            PublishStorageKeys.draft,
            null
        );

    PublishState.projects =
        Array.isArray(projects)
            ? projects
            : [];

    PublishState.stories =
        Array.isArray(stories)
            ? stories
            : [];

    PublishState.ideas =
        Array.isArray(ideas)
            ? ideas
            : [];

    PublishState.publications =
        Array.isArray(publications)
            ? publications
            : [];

    PublishState.notifications =
        Array.isArray(notifications)
            ? notifications
            : [];

    if (
        draft &&
        typeof draft === "object"
    ) {
        PublishState.draft =
            Object.assign(
                {},
                PublishState.draft,
                draft
            );

        PublishState.selectedType =
            draft.type ||
            "project";

        PublishState.selectedStatus =
            draft.status ||
            "pending";
    }

    fillPublishUserData();
    fillPublishForm();
    setPublishType(
        PublishState.selectedType
    );
    renderPublicationHistory();
    updatePublishStatistics();
}

/* =========================================================
   بيانات المستخدم
========================================================= */

function fillPublishUserData() {
    if (!PublishState.currentUser) {
        return;
    }

    const ownerName =
        publishGetElement(
            "publishOwnerName"
        );

    const email =
        publishGetElement(
            "publishContactEmail"
        );

    const phone =
        publishGetElement(
            "publishContactPhone"
        );

    if (
        ownerName &&
        !ownerName.value
    ) {
        ownerName.value =
            PublishState.currentUser.fullName ||
            PublishState.currentUser.name ||
            "";
    }

    if (
        email &&
        !email.value
    ) {
        email.value =
            PublishState.currentUser.email ||
            "";
    }

    if (
        phone &&
        !phone.value
    ) {
        phone.value =
            PublishState.currentUser.phone ||
            "";
    }
}

/* =========================================================
   تعبئة النموذج
========================================================= */

function fillPublishForm() {
    const fields = {
        publishTitle:
            PublishState.draft.title,

        publishSummary:
            PublishState.draft.summary,

        publishDescription:
            PublishState.draft.description,

        publishCategory:
            PublishState.draft.category,

        publishOwnerName:
            PublishState.draft.ownerName,

        publishProjectStage:
            PublishState.draft.projectStage,

        publishProblem:
            PublishState.draft.problem,

        publishSolution:
            PublishState.draft.solution,

        publishTargetCustomers:
            PublishState.draft.targetCustomers,

        publishTargetMarket:
            PublishState.draft.targetMarket,

        publishAchievements:
            PublishState.draft.achievements,

        publishChallenges:
            PublishState.draft.challenges,

        publishLessons:
            PublishState.draft.lessons,

        publishWebsite:
            PublishState.draft.website,

        publishContactEmail:
            PublishState.draft.contactEmail,

        publishContactPhone:
            PublishState.draft.contactPhone
    };

    Object.keys(fields).forEach(
        function (id) {
            const element =
                publishGetElement(id);

            if (!element) {
                return;
            }

            if (
                fields[id] !==
                    undefined &&
                fields[id] !==
                    null
            ) {
                element.value =
                    fields[id];
            }
        }
    );

    const statusField =
        publishGetElement(
            "publishStatus"
        );

    if (statusField) {
        statusField.value =
            PublishState.selectedStatus;
    }

    updatePublishCounters();
    updatePublishPreview();
}

/* =========================================================
   جمع بيانات النموذج
========================================================= */

function collectPublishFormData() {
    return {
        type:
            PublishState.selectedType,

        title:
            getPublishFieldValue(
                "publishTitle"
            ),

        summary:
            getPublishFieldValue(
                "publishSummary"
            ),

        description:
            getPublishFieldValue(
                "publishDescription"
            ),

        category:
            getPublishFieldValue(
                "publishCategory"
            ) ||
            "general",

        ownerName:
            getPublishFieldValue(
                "publishOwnerName"
            ),

        projectStage:
            getPublishFieldValue(
                "publishProjectStage"
            ) ||
            "idea",

        problem:
            getPublishFieldValue(
                "publishProblem"
            ),

        solution:
            getPublishFieldValue(
                "publishSolution"
            ),

        targetCustomers:
            getPublishFieldValue(
                "publishTargetCustomers"
            ),

        targetMarket:
            getPublishFieldValue(
                "publishTargetMarket"
            ),

        achievements:
            getPublishFieldValue(
                "publishAchievements"
            ),

        challenges:
            getPublishFieldValue(
                "publishChallenges"
            ),

        lessons:
            getPublishFieldValue(
                "publishLessons"
            ),

        website:
            getPublishFieldValue(
                "publishWebsite"
            ),

        contactEmail:
            getPublishFieldValue(
                "publishContactEmail"
            ),

        contactPhone:
            getPublishFieldValue(
                "publishContactPhone"
            ),

        status:
            getPublishFieldValue(
                "publishStatus"
            ) ||
            "pending"
    };
}

function getPublishFieldValue(id) {
    const element =
        publishGetElement(id);

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();
}

/* =========================================================
   أنواع النشر
========================================================= */

function setPublishType(type) {
    const validTypes = [
        "project",
        "story",
        "idea"
    ];

    const selectedType =
        validTypes.includes(type)
            ? type
            : "project";

    PublishState.selectedType =
        selectedType;

    publishSelectAll(
        "[data-publish-type]"
    ).forEach(
        function (button) {
            const buttonType =
                button.getAttribute(
                    "data-publish-type"
                );

            button.classList.toggle(
                "active",
                buttonType ===
                    selectedType
            );

            button.setAttribute(
                "aria-pressed",
                String(
                    buttonType ===
                    selectedType
                )
            );
        }
    );

    publishSelectAll(
        "[data-type-section]"
    ).forEach(
        function (section) {
            const allowedTypes =
                String(
                    section.getAttribute(
                        "data-type-section"
                    ) || ""
                )
                    .split(",")
                    .map(
                        function (item) {
                            return item.trim();
                        }
                    );

            section.hidden =
                !allowedTypes.includes(
                    selectedType
                );
        }
    );

    const heading =
        publishGetElement(
            "publishFormHeading"
        );

    if (heading) {
        heading.textContent =
            getPublishTypeHeading(
                selectedType
            );
    }

    const submitButton =
        publishGetElement(
            "publishSubmitButton"
        );

    if (submitButton) {
        submitButton.textContent =
            getPublishSubmitLabel(
                selectedType
            );
    }

    updatePublishPreview();
    savePublishDraft(false);
}

function getPublishTypeHeading(type) {
    const headings = {
        project:
            "نشر مشروع",

        story:
            "إضافة قصة نجاح",

        idea:
            "مشاركة فكرة مشروع"
    };

    return headings[type] ||
        headings.project;
}

function getPublishSubmitLabel(type) {
    const labels = {
        project:
            "إرسال المشروع للنشر",

        story:
            "إرسال القصة للنشر",

        idea:
            "مشاركة الفكرة"
    };

    return labels[type] ||
        labels.project;
}

function getPublishTypeLabel(type) {
    const labels = {
        project:
            "مشروع",

        story:
            "قصة نجاح",

        idea:
            "فكرة"
    };

    return labels[type] ||
        "منشور";
}

function getPublishTypeIcon(type) {
    const icons = {
        project:
            "🚀",

        story:
            "📖",

        idea:
            "💡"
    };

    return icons[type] ||
        "📄";
}

/* =========================================================
   التصنيفات
========================================================= */

function getPublishCategoryLabel(
    category
) {
    const labels = {
        technology:
            "التقنية",

        commerce:
            "التجارة",

        services:
            "الخدمات",

        marketing:
            "التسويق",

        finance:
            "التمويل",

        creative:
            "المشاريع الإبداعية",

        education:
            "التعليم",

        food:
            "الأغذية",

        transport:
            "النقل",

        construction:
            "البناء",

        fashion:
            "الأزياء",

        health:
            "الصحة",

        general:
            "عام"
    };

    return labels[category] ||
        labels.general;
}

function getPublishStatusLabel(status) {
    const labels = {
        draft:
            "مسودة",

        pending:
            "قيد المراجعة",

        published:
            "منشور",

        approved:
            "مقبول",

        rejected:
            "مرفوض"
    };

    return labels[status] ||
        status;
}

/* =========================================================
   التحقق من الحقول
========================================================= */

function clearPublishErrors() {
    publishSelectAll(
        ".publish-input-error"
    ).forEach(
        function (field) {
            field.classList.remove(
                "publish-input-error"
            );
        }
    );

    publishSelectAll(
        ".publish-field-error"
    ).forEach(
        function (element) {
            element.textContent = "";
        }
    );

    const generalError =
        publishGetElement(
            "publishGeneralError"
        );

    if (generalError) {
        generalError.hidden = true;
        generalError.textContent = "";
    }
}

function showPublishFieldError(
    field,
    message
) {
    if (!field) {
        return;
    }

    field.classList.add(
        "publish-input-error"
    );

    const parent =
        field.parentElement;

    let errorElement = null;

    if (parent) {
        errorElement =
            parent.querySelector(
                ".publish-field-error, .field-error"
            );
    }

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}

function showPublishGeneralError(
    message
) {
    const element =
        publishGetElement(
            "publishGeneralError"
        );

    if (!element) {
        publishShowMessage(
            message,
            "error"
        );

        return;
    }

    element.textContent =
        message;

    element.hidden =
        false;
}

function validatePublishForm(data) {
    clearPublishErrors();

    let valid = true;

    const titleField =
        publishGetElement(
            "publishTitle"
        );

    const summaryField =
        publishGetElement(
            "publishSummary"
        );

    const descriptionField =
        publishGetElement(
            "publishDescription"
        );

    const ownerNameField =
        publishGetElement(
            "publishOwnerName"
        );

    const problemField =
        publishGetElement(
            "publishProblem"
        );

    const solutionField =
        publishGetElement(
            "publishSolution"
        );

    const emailField =
        publishGetElement(
            "publishContactEmail"
        );

    const phoneField =
        publishGetElement(
            "publishContactPhone"
        );

    const termsField =
        publishGetElement(
            "publishAcceptTerms"
        );

    if (data.title.length < 3) {
        showPublishFieldError(
            titleField,
            "اكتب عنوانًا واضحًا."
        );

        valid = false;
    }

    if (data.summary.length < 15) {
        showPublishFieldError(
            summaryField,
            "اكتب ملخصًا لا يقل عن 15 حرفًا."
        );

        valid = false;
    }

    if (
        data.description.length <
        40
    ) {
        showPublishFieldError(
            descriptionField,
            "اكتب وصفًا لا يقل عن 40 حرفًا."
        );

        valid = false;
    }

    if (
        data.ownerName.length <
        2
    ) {
        showPublishFieldError(
            ownerNameField,
            "اكتب اسم صاحب المشروع."
        );

        valid = false;
    }

    if (
        data.type === "project" ||
        data.type === "idea"
    ) {
        if (
            data.problem.length <
            10
        ) {
            showPublishFieldError(
                problemField,
                "اشرح المشكلة بشكل أوضح."
            );

            valid = false;
        }

        if (
            data.solution.length <
            10
        ) {
            showPublishFieldError(
                solutionField,
                "اشرح الحل بشكل أوضح."
            );

            valid = false;
        }
    }

    if (
        data.contactEmail &&
        !publishIsValidEmail(
            data.contactEmail
        )
    ) {
        showPublishFieldError(
            emailField,
            "اكتب بريدًا إلكترونيًا صحيحًا."
        );

        valid = false;
    }

    if (
        !publishIsValidPhone(
            data.contactPhone
        )
    ) {
        showPublishFieldError(
            phoneField,
            "اكتب رقم هاتف صحيحًا."
        );

        valid = false;
    }

    if (
        termsField &&
        !termsField.checked
    ) {
        showPublishFieldError(
            termsField,
            "يجب الموافقة على شروط النشر."
        );

        valid = false;
    }

    if (!valid) {
        showPublishGeneralError(
            "أكمل الحقول المطلوبة قبل الإرسال."
        );

        const firstError =
            publishSelect(
                ".publish-input-error"
            );

        if (firstError) {
            firstError.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "center"
            });

            firstError.focus();
        }
    }

    return valid;
}

/* =========================================================
   حفظ المسودة
========================================================= */

function savePublishDraft(
    showMessage
) {
    if (
        PublishState.isSavingDraft
    ) {
        return false;
    }

    PublishState.isSavingDraft =
        true;

    const data =
        collectPublishFormData();

    PublishState.draft =
        Object.assign(
            {},
            PublishState.draft,
            data
        );

    const saved =
        publishSaveStorage(
            PublishStorageKeys.draft,
            PublishState.draft
        );

    PublishState.isSavingDraft =
        false;

    if (
        saved &&
        showMessage !== false
    ) {
        publishShowMessage(
            "تم حفظ المسودة.",
            "success"
        );
    }

    return saved;
}

function clearPublishDraft() {
    const confirmed =
        window.confirm(
            "هل تريد مسح جميع بيانات النموذج؟"
        );

    if (!confirmed) {
        return;
    }

    PublishState.draft = {
        type:
            "project",

        title:
            "",

        summary:
            "",

        description:
            "",

        category:
            "general",

        ownerName:
            "",

        projectStage:
            "idea",

        problem:
            "",

        solution:
            "",

        targetCustomers:
            "",

        targetMarket:
            "",

        achievements:
            "",

        challenges:
            "",

        lessons:
            "",

        website:
            "",

        contactEmail:
            "",

        contactPhone:
            "",

        status:
            "pending"
    };

    PublishState.selectedType =
        "project";

    PublishState.selectedStatus =
        "pending";

    PublishState.selectedImage =
        null;

    localStorage.removeItem(
        PublishStorageKeys.draft
    );

    const form =
        publishGetElement(
            "publishForm"
        );

    if (form) {
        form.reset();
    }

    clearPublishImage();

    setPublishType(
        "project"
    );

    fillPublishUserData();

    updatePublishCounters();

    updatePublishPreview();

    publishShowMessage(
        "تم مسح النموذج.",
        "success"
    );
}

/* =========================================================
   إنشاء سجل النشر
========================================================= */

function createPublicationRecord(data) {
    const now =
        new Date()
            .toISOString();

    const adminSettings =
        publishReadStorage(
            PublishStorageKeys.adminSettings,
            {}
        );

    let status =
        data.status ||
        "pending";

    if (
        status !== "draft"
    ) {
        const requiresReview =
            !adminSettings ||
            adminSettings
                .requireProjectReview !==
                false;

        status =
            requiresReview
                ? "pending"
                : "published";
    }

    let imageData = "";

    if (
        PublishState.selectedImage &&
        PublishState.selectedImage.data
    ) {
        imageData =
            PublishState.selectedImage.data;
    }

    return {
        id:
            publishCreateId(
                "PUBLICATION"
            ),

        userId:
            PublishState.currentUser &&
            PublishState.currentUser.id
                ? PublishState.currentUser.id
                : "guest",

        type:
            data.type,

        title:
            data.title,

        summary:
            data.summary,

        description:
            data.description,

        category:
            data.category,

        ownerName:
            data.ownerName,

        projectStage:
            data.projectStage,

        problem:
            data.problem,

        solution:
            data.solution,

        targetCustomers:
            data.targetCustomers,

        targetMarket:
            data.targetMarket,

        achievements:
            publishSplitLines(
                data.achievements
            ),

        challenges:
            publishSplitLines(
                data.challenges
            ),

        lessons:
            publishSplitLines(
                data.lessons
            ),

        website:
            data.website,

        contactEmail:
            data.contactEmail,

        contactPhone:
            data.contactPhone,

        image:
            imageData,

        imageName:
            PublishState.selectedImage
                ? PublishState
                    .selectedImage
                    .name || ""
                : "",

        status:
            status,

        views:
            0,

        likes:
            0,

        adminNotes:
            "",

        rejectionReason:
            "",

        createdAt:
            now,

        updatedAt:
            now
    };
}

/* =========================================================
   إرسال النموذج
========================================================= */

function submitPublishForm(event) {
    if (event) {
        event.preventDefault();
    }

    if (
        PublishState.isSubmitting
    ) {
        return;
    }

    const data =
        collectPublishFormData();

    if (
        !validatePublishForm(data)
    ) {
        return;
    }

    PublishState.isSubmitting =
        true;

    setPublishButtonLoading(true);

    window.setTimeout(
        function () {
            const publication =
                createPublicationRecord(
                    data
                );

            PublishState.publications
                .unshift(
                    publication
                );

            publishSaveStorage(
                PublishStorageKeys.publications,
                PublishState.publications
            );

            savePublicationByType(
                publication
            );

            createPublishNotification(
                publication
            );

            localStorage.removeItem(
                PublishStorageKeys.draft
            );

            PublishState.isSubmitting =
                false;

            setPublishButtonLoading(false);

            renderPublicationHistory();

            updatePublishStatistics();

            showPublishSuccess(
                publication
            );
        },
        700
    );
}

/* =========================================================
   حفظ حسب النوع
========================================================= */

function savePublicationByType(
    publication
) {
    if (
        publication.type ===
        "project"
    ) {
        savePublishedProject(
            publication
        );

        return;
    }

    if (
        publication.type ===
        "story"
    ) {
        savePublishedStory(
            publication
        );

        return;
    }

    savePublishedIdea(
        publication
    );
}

function savePublishedProject(
    publication
) {
    const project = {
        id:
            publishCreateId(
                "PROJECT"
            ),

        publicationId:
            publication.id,

        userId:
            publication.userId,

        ownerId:
            publication.userId,

        ownerName:
            publication.ownerName,

        name:
            publication.title,

        title:
            publication.title,

        summary:
            publication.summary,

        description:
            publication.description,

        category:
            publication.category,

        stage:
            publication.projectStage,

        problem:
            publication.problem,

        solution:
            publication.solution,

        targetCustomers:
            publication.targetCustomers,

        targetMarket:
            publication.targetMarket,

        achievements:
            publication.achievements,

        challenges:
            publication.challenges,

        website:
            publication.website,

        contactEmail:
            publication.contactEmail,

        contactPhone:
            publication.contactPhone,

        image:
            publication.image,

        status:
            publication.status,

        reviewStatus:
            publication.status,

        score:
            0,

        createdAt:
            publication.createdAt,

        updatedAt:
            publication.updatedAt
    };

    PublishState.projects.unshift(
        project
    );

    publishSaveStorage(
        PublishStorageKeys.projects,
        PublishState.projects
    );
}

function savePublishedStory(
    publication
) {
    const story = {
        id:
            publishCreateId(
                "STORY"
            ),

        publicationId:
            publication.id,

        userId:
            publication.userId,

        title:
            publication.title,

        ownerName:
            publication.ownerName,

        category:
            publication.category,

        summary:
            publication.summary,

        description:
            publication.description,

        challenge:
            publication.challenges.length >
                0
                ? publication
                    .challenges
                    .join("، ")
                : publication.problem,

        solution:
            publication.solution,

        successFactors:
            publication.achievements,

        lessons:
            publication.lessons,

        status:
            publication.status,

        image:
            publication.image,

        rating:
            0,

        views:
            0,

        likes:
            0,

        createdAt:
            publication.createdAt,

        updatedAt:
            publication.updatedAt
    };

    PublishState.stories.unshift(
        story
    );

    publishSaveStorage(
        PublishStorageKeys.stories,
        PublishState.stories
    );
}

function savePublishedIdea(
    publication
) {
    const idea = {
        id:
            publishCreateId(
                "IDEA"
            ),

        publicationId:
            publication.id,

        userId:
            publication.userId,

        name:
            publication.title,

        title:
            publication.title,

        summary:
            publication.summary,

        description:
            publication.description,

        category:
            publication.category,

        problem:
            publication.problem,

        solution:
            publication.solution,

        targetCustomers:
            publication.targetCustomers,

        targetMarket:
            publication.targetMarket,

        ownerName:
            publication.ownerName,

        status:
            publication.status,

        image:
            publication.image,

        createdAt:
            publication.createdAt,

        updatedAt:
            publication.updatedAt
    };

    PublishState.ideas.unshift(
        idea
    );

    publishSaveStorage(
        PublishStorageKeys.ideas,
        PublishState.ideas
    );
}

/* =========================================================
   الإشعارات
========================================================= */

function createPublishNotification(
    publication
) {
    let title =
        "تم إرسال المحتوى";

    let message =
        "تم إرسال المحتوى بنجاح.";

    if (
        publication.status ===
        "pending"
    ) {
        title =
            "تم الإرسال للمراجعة";

        message =
            "تم إرسال " +
            getPublishTypeLabel(
                publication.type
            ) +
            ' "' +
            publication.title +
            '" إلى الإدارة للمراجعة.';
    }

    if (
        publication.status ===
        "published"
    ) {
        title =
            "تم النشر";

        message =
            "تم نشر " +
            getPublishTypeLabel(
                publication.type
            ) +
            ' "' +
            publication.title +
            '" بنجاح.';
    }

    if (
        typeof window.addNotification ===
        "function"
    ) {
        window.addNotification({
            title:
                title,

            message:
                message,

            type:
                publication.status ===
                    "published"
                    ? "success"
                    : "info",

            link:
                "publish.html"
        });

        return;
    }

    const notification = {
        id:
            publishCreateId(
                "NOTIFICATION"
            ),

        userId:
            publication.userId,

        title:
            title,

        message:
            message,

        type:
            publication.status ===
                "published"
                ? "success"
                : "info",

        link:
            "publish.html",

        isRead:
            false,

        createdAt:
            new Date()
                .toISOString()
    };

    PublishState.notifications
        .unshift(
            notification
        );

    publishSaveStorage(
        PublishStorageKeys.notifications,
        PublishState.notifications
    );
}

/* =========================================================
   زر التحميل
========================================================= */

function setPublishButtonLoading(
    loading
) {
    const button =
        publishGetElement(
            "publishSubmitButton"
        );

    if (!button) {
        return;
    }

    if (loading) {
        button.setAttribute(
            "data-original-text",
            button.innerHTML
        );

        button.disabled =
            true;

        button.innerHTML = `
            <span class="publish-spinner"></span>
            جاري الإرسال...
        `;
    } else {
        button.disabled =
            false;

        const originalText =
            button.getAttribute(
                "data-original-text"
            );

        button.innerHTML =
            originalText ||
            getPublishSubmitLabel(
                PublishState.selectedType
            );
    }
}

/* =========================================================
   رسالة النجاح
========================================================= */

function showPublishSuccess(
    publication
) {
    const modal =
        publishGetElement(
            "publishSuccessModal"
        );

    const title =
        publishGetElement(
            "publishSuccessTitle"
        );

    const message =
        publishGetElement(
            "publishSuccessMessage"
        );

    const reference =
        publishGetElement(
            "publishReferenceNumber"
        );

    if (title) {
        title.textContent =
            publication.status ===
            "published"
                ? "تم النشر بنجاح"
                : "تم الإرسال للمراجعة";
    }

    if (message) {
        message.textContent =
            publication.status ===
            "published"
                ? "أصبح المحتوى ظاهرًا للمستخدمين."
                : "ستقوم الإدارة بمراجعة المحتوى قبل نشره.";
    }

    if (reference) {
        reference.textContent =
            publication.id;
    }

    if (modal) {
        if (
            typeof window.openModal ===
            "function"
        ) {
            window.openModal(
                modal
            );
        } else {
            modal.hidden =
                false;

            document.body.classList.add(
                "modal-open"
            );
        }
    } else {
        publishShowMessage(
            publication.status ===
            "published"
                ? "تم النشر بنجاح."
                : "تم الإرسال للمراجعة.",
            "success"
        );
    }
}

/* =========================================================
   الصورة
========================================================= */

function handlePublishImage(file) {
    if (!file) {
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (
        !allowedTypes.includes(
            file.type
        )
    ) {
        publishShowMessage(
            "اختر صورة بصيغة JPG أو PNG أو WEBP.",
            "warning"
        );

        return;
    }

    const maximumSize =
        3 *
        1024 *
        1024;

    if (
        file.size >
        maximumSize
    ) {
        publishShowMessage(
            "حجم الصورة يجب ألا يتجاوز 3 ميجابايت.",
            "warning"
        );

        return;
    }

    const reader =
        new FileReader();

    reader.onload =
        function () {
            PublishState.selectedImage = {
                name:
                    file.name,

                type:
                    file.type,

                size:
                    file.size,

                data:
                    String(
                        reader.result ||
                        ""
                    )
            };

            renderPublishImage();
            updatePublishPreview();
        };

    reader.onerror =
        function () {
            publishShowMessage(
                "تعذر قراءة الصورة.",
                "error"
            );
        };

    reader.readAsDataURL(
        file
    );
}

function renderPublishImage() {
    const preview =
        publishGetElement(
            "publishImagePreview"
        );

    const placeholder =
        publishGetElement(
            "publishImagePlaceholder"
        );

    const removeButton =
        publishGetElement(
            "removePublishImageButton"
        );

    if (
        !PublishState.selectedImage ||
        !PublishState.selectedImage.data
    ) {
        if (preview) {
            preview.hidden =
                true;

            preview.removeAttribute(
                "src"
            );
        }

        if (placeholder) {
            placeholder.hidden =
                false;
        }

        if (removeButton) {
            removeButton.hidden =
                true;
        }

        return;
    }

    if (preview) {
        preview.src =
            PublishState
                .selectedImage
                .data;

        preview.alt =
            PublishState
                .selectedImage
                .name ||
            "صورة المحتوى";

        preview.hidden =
            false;
    }

    if (placeholder) {
        placeholder.hidden =
            true;
    }

    if (removeButton) {
        removeButton.hidden =
            false;
    }
}

function clearPublishImage() {
    PublishState.selectedImage =
        null;

    const input =
        publishGetElement(
            "publishImageInput"
        );

    if (input) {
        input.value = "";
    }

    renderPublishImage();
    updatePublishPreview();
}

/* =========================================================
   المعاينة
========================================================= */

function updatePublishPreview() {
    const data =
        collectPublishFormData();

    setPublishPreviewText(
        "publishPreviewType",
        getPublishTypeLabel(
            data.type
        )
    );

    setPublishPreviewText(
        "publishPreviewTitle",
        data.title ||
        "عنوان المحتوى"
    );

    setPublishPreviewText(
        "publishPreviewSummary",
        data.summary ||
        "سيظهر ملخص المحتوى هنا."
    );

    setPublishPreviewText(
        "publishPreviewOwner",
        data.ownerName ||
        "صاحب المشروع"
    );

    setPublishPreviewText(
        "publishPreviewCategory",
        getPublishCategoryLabel(
            data.category
        )
    );

    setPublishPreviewText(
        "publishPreviewIcon",
        getPublishTypeIcon(
            data.type
        )
    );

    const previewImage =
        publishGetElement(
            "publishPreviewImage"
        );

    const previewIcon =
        publishGetElement(
            "publishPreviewImageIcon"
        );

    if (
        PublishState.selectedImage &&
        PublishState.selectedImage.data
    ) {
        if (previewImage) {
            previewImage.src =
                PublishState
                    .selectedImage
                    .data;

            previewImage.hidden =
                false;
        }

        if (previewIcon) {
            previewIcon.hidden =
                true;
        }
    } else {
        if (previewImage) {
            previewImage.hidden =
                true;

            previewImage.removeAttribute(
                "src"
            );
        }

        if (previewIcon) {
            previewIcon.hidden =
                false;

            previewIcon.textContent =
                getPublishTypeIcon(
                    data.type
                );
        }
    }
}

function setPublishPreviewText(
    id,
    value
) {
    const element =
        publishGetElement(id);

    if (element) {
        element.textContent =
            value;
    }
}

/* =========================================================
   سجل النشر
========================================================= */

function renderPublicationHistory() {
    const container =
        publishGetElement(
            "publicationHistoryList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    let publications = [
        ...PublishState.publications
    ];

    if (
        PublishState.currentUser &&
        PublishState.currentUser.role !==
            "admin"
    ) {
        publications =
            publications.filter(
                function (
                    publication
                ) {
                    return (
                        publication.userId ===
                        PublishState
                            .currentUser
                            .id
                    );
                }
            );
    }

    publications.sort(
        function (
            first,
            second
        ) {
            return (
                new Date(
                    second.createdAt
                ) -
                new Date(
                    first.createdAt
                )
            );
        }
    );

    publications =
        publications.slice(
            0,
            8
        );

    if (
        publications.length ===
        0
    ) {
        container.innerHTML = `
            <div class="publish-empty-state">
                لا توجد عمليات نشر سابقة.
            </div>
        `;

        return;
    }

    publications.forEach(
        function (publication) {
            const item =
                document.createElement(
                    "article"
                );

            item.className =
                "publication-history-item";

            item.innerHTML = `
                <div class="publication-history-icon">
                    ${getPublishTypeIcon(
                        publication.type
                    )}
                </div>

                <div class="publication-history-content">

                    <h4>
                        ${publishEscapeHTML(
                            publication.title
                        )}
                    </h4>

                    <p>
                        ${publishEscapeHTML(
                            publishTruncateText(
                                publication.summary,
                                85
                            )
                        )}
                    </p>

                    <span>
                        ${publishEscapeHTML(
                            publishFormatDate(
                                publication.createdAt
                            )
                        )}
                    </span>

                </div>

                <div class="publication-history-actions">

                    <span class="publish-status ${publishEscapeHTML(
                        publication.status
                    )}">
                        ${publishEscapeHTML(
                            getPublishStatusLabel(
                                publication.status
                            )
                        )}
                    </span>

                    <button
                        type="button"
                        data-load-publication="${publishEscapeHTML(
                            publication.id
                        )}"
                    >
                        تحميل
                    </button>

                    <button
                        type="button"
                        data-delete-publication="${publishEscapeHTML(
                            publication.id
                        )}"
                    >
                        حذف
                    </button>

                </div>
            `;

            container.appendChild(
                item
            );
        }
    );

    bindPublicationHistoryActions();
}

/* =========================================================
   تحميل منشور سابق
========================================================= */

function bindPublicationHistoryActions() {
    publishSelectAll(
        "[data-load-publication]"
    ).forEach(
        function (button) {
            button.addEventListener(
                "click",
                function () {
                    loadPublicationIntoForm(
                        button.getAttribute(
                            "data-load-publication"
                        )
                    );
                }
            );
        }
    );

    publishSelectAll(
        "[data-delete-publication]"
    ).forEach(
        function (button) {
            button.addEventListener(
                "click",
                function () {
                    deletePublication(
                        button.getAttribute(
                            "data-delete-publication"
                        )
                    );
                }
            );
        }
    );
}

function loadPublicationIntoForm(
    publicationId
) {
    const publication =
        PublishState.publications.find(
            function (item) {
                return (
                    item.id ===
                    publicationId
                );
            }
        );

    if (!publication) {
        return;
    }

    PublishState.draft = {
        type:
            publication.type,

        title:
            publication.title,

        summary:
            publication.summary,

        description:
            publication.description,

        category:
            publication.category,

        ownerName:
            publication.ownerName,

        projectStage:
            publication.projectStage,

        problem:
            publication.problem,

        solution:
            publication.solution,

        targetCustomers:
            publication.targetCustomers,

        targetMarket:
            publication.targetMarket,

        achievements:
            Array.isArray(
                publication.achievements
            )
                ? publication
                    .achievements
                    .join("\n")
                : "",

        challenges:
            Array.isArray(
                publication.challenges
            )
                ? publication
                    .challenges
                    .join("\n")
                : "",

        lessons:
            Array.isArray(
                publication.lessons
            )
                ? publication
                    .lessons
                    .join("\n")
                : "",

        website:
            publication.website,

        contactEmail:
            publication.contactEmail,

        contactPhone:
            publication.contactPhone,

        status:
            publication.status
    };

    PublishState.selectedType =
        publication.type;

    PublishState.selectedStatus =
        publication.status;

    if (publication.image) {
        PublishState.selectedImage = {
            name:
                publication.imageName ||
                "image",

            data:
                publication.image
        };
    } else {
        PublishState.selectedImage =
            null;
    }

    fillPublishForm();

    setPublishType(
        publication.type
    );

    renderPublishImage();

    window.scrollTo({
        top:
            0,

        behavior:
            "smooth"
    });

    publishShowMessage(
        "تم تحميل المحتوى داخل النموذج.",
        "success"
    );
}

/* =========================================================
   حذف منشور
========================================================= */

function deletePublication(
    publicationId
) {
    const publication =
        PublishState.publications.find(
            function (item) {
                return (
                    item.id ===
                    publicationId
                );
            }
        );

    if (!publication) {
        return;
    }

    const confirmed =
        window.confirm(
            'هل تريد حذف "' +
            publication.title +
            '"؟'
        );

    if (!confirmed) {
        return;
    }

    PublishState.publications =
        PublishState.publications.filter(
            function (item) {
                return (
                    item.id !==
                    publicationId
                );
            }
        );

    removePublicationFromType(
        publication
    );

    publishSaveStorage(
        PublishStorageKeys.publications,
        PublishState.publications
    );

    renderPublicationHistory();
    updatePublishStatistics();

    publishShowMessage(
        "تم حذف المحتوى.",
        "success"
    );
}

function removePublicationFromType(
    publication
) {
    if (
        publication.type ===
        "project"
    ) {
        PublishState.projects =
            PublishState.projects.filter(
                function (project) {
                    return (
                        project.publicationId !==
                        publication.id
                    );
                }
            );

        publishSaveStorage(
            PublishStorageKeys.projects,
            PublishState.projects
        );

        return;
    }

    if (
        publication.type ===
        "story"
    ) {
        PublishState.stories =
            PublishState.stories.filter(
                function (story) {
                    return (
                        story.publicationId !==
                        publication.id
                    );
                }
            );

        publishSaveStorage(
            PublishStorageKeys.stories,
            PublishState.stories
        );

        return;
    }

    PublishState.ideas =
        PublishState.ideas.filter(
            function (idea) {
                return (
                    idea.publicationId !==
                    publication.id
                );
            }
        );

    publishSaveStorage(
        PublishStorageKeys.ideas,
        PublishState.ideas
    );
}

/* =========================================================
   الإحصائيات
========================================================= */

function updatePublishStatistics() {
    const total =
        PublishState.publications.length;

    const pending =
        PublishState.publications.filter(
            function (item) {
                return (
                    item.status ===
                    "pending"
                );
            }
        ).length;

    const published =
        PublishState.publications.filter(
            function (item) {
                return (
                    item.status ===
                        "published" ||
                    item.status ===
                        "approved"
                );
            }
        ).length;

    const drafts =
        PublishState.publications.filter(
            function (item) {
                return (
                    item.status ===
                    "draft"
                );
            }
        ).length;

    const values = {
        publishTotalCount:
            total,

        publishPendingCount:
            pending,

        publishPublishedCount:
            published,

        publishDraftCount:
            drafts
    };

    Object.keys(values).forEach(
        function (id) {
            const element =
                publishGetElement(id);

            if (element) {
                element.textContent =
                    new Intl.NumberFormat(
                        "ar"
                    ).format(
                        values[id]
                    );
            }
        }
    );
}

/* =========================================================
   عدادات الحروف
========================================================= */

function updatePublishCounters() {
    publishSelectAll(
        "[data-publish-counter]"
    ).forEach(
        function (field) {
            const counterId =
                field.getAttribute(
                    "data-publish-counter"
                );

            const counter =
                publishGetElement(
                    counterId
                );

            if (!counter) {
                return;
            }

            const maximum =
                Number(
                    field.maxLength
                ) || 0;

            if (maximum > 0) {
                counter.textContent =
                    field.value.length +
                    " / " +
                    maximum;
            } else {
                counter.textContent =
                    field.value.length;
            }
        }
    );
}

/* =========================================================
   مربعات النص
========================================================= */

function resizePublishTextarea(
    textarea
) {
    if (!textarea) {
        return;
    }

    textarea.style.height =
        "auto";

    textarea.style.height =
        Math.min(
            textarea.scrollHeight,
            260
        ) +
        "px";
}

/* =========================================================
   استيراد مشروع محفوظ
========================================================= */

function renderSavedProjectsSelect() {
    const select =
        publishGetElement(
            "savedProjectSelect"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            اختر مشروعًا محفوظًا
        </option>
    `;

    PublishState.projects.forEach(
        function (project) {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                project.id;

            option.textContent =
                project.name ||
                project.title ||
                "مشروع بدون اسم";

            select.appendChild(
                option
            );
        }
    );
}

function importSavedProject(
    projectId
) {
    const project =
        PublishState.projects.find(
            function (item) {
                return (
                    item.id ===
                    projectId
                );
            }
        );

    if (!project) {
        return;
    }

    setPublishFieldValue(
        "publishTitle",
        project.name ||
        project.title
    );

    setPublishFieldValue(
        "publishSummary",
        project.summary ||
        ""
    );

    setPublishFieldValue(
        "publishDescription",
        project.description ||
        project.idea ||
        ""
    );

    setPublishFieldValue(
        "publishCategory",
        project.category ||
        project.type ||
        "general"
    );

    setPublishFieldValue(
        "publishOwnerName",
        project.ownerName ||
        ""
    );

    setPublishFieldValue(
        "publishProjectStage",
        project.stage ||
        "idea"
    );

    setPublishFieldValue(
        "publishProblem",
        project.problem ||
        ""
    );

    setPublishFieldValue(
        "publishSolution",
        project.solution ||
        ""
    );

    setPublishFieldValue(
        "publishTargetCustomers",
        project.targetCustomers ||
        project.customers ||
        ""
    );

    setPublishFieldValue(
        "publishTargetMarket",
        project.targetMarket ||
        project.market ||
        ""
    );

    setPublishType(
        "project"
    );

    updatePublishCounters();
    updatePublishPreview();

    publishShowMessage(
        "تم استيراد بيانات المشروع.",
        "success"
    );
}

function setPublishFieldValue(
    id,
    value
) {
    const element =
        publishGetElement(id);

    if (element) {
        element.value =
            value || "";
    }
}

/* =========================================================
   التصدير
========================================================= */

function exportPublicationHistory() {
    const data = {
        publications:
            PublishState.publications,

        total:
            PublishState
                .publications
                .length,

        exportedAt:
            new Date()
                .toISOString()
    };

    if (
        typeof window.downloadJSON ===
        "function"
    ) {
        window.downloadJSON(
            data,
            "project-journey-publications.json"
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
        "project-journey-publications.json";

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}

/* =========================================================
   التنسيقات
========================================================= */

function injectPublishStyles() {
    if (
        publishGetElement(
            "projectJourneyPublishStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "projectJourneyPublishStyles";

    style.textContent = `
        .publish-input-error {
            border-color: #dc3545 !important;
            box-shadow:
                0 0 0 4px
                rgba(220, 53, 69, 0.10) !important;
        }

        .publish-field-error {
            min-height: 15px;
            color: #dc3545;
            font-size: 9px;
            line-height: 1.6;
        }

        .publish-general-error {
            margin-bottom: 15px;
            padding: 12px 14px;
            border-radius: 12px;
            color: #b52835;
            background: #fff0f1;
            border: 1px solid #f3c8cd;
            font-size: 10px;
            line-height: 1.7;
        }

        .publish-spinner {
            width: 17px;
            height: 17px;
            display: inline-block;
            border-radius: 50%;
            border:
                2px solid
                rgba(255, 255, 255, 0.40);
            border-top-color: #ffffff;
            animation:
                publishSpinnerAnimation
                0.7s linear infinite;
        }

        .publish-type-button.active {
            color: #ffffff !important;
            background: #1565ff !important;
            border-color: #1565ff !important;
        }

        .publish-empty-state {
            padding: 35px 16px;
            border-radius: 15px;
            text-align: center;
            color: #68758c;
            background: #f8faff;
            border: 1px solid #dbe7f7;
            font-size: 10px;
        }

        .publication-history-item {
            padding: 14px;
            border-radius: 15px;
            display: grid;
            grid-template-columns:
                auto
                minmax(0, 1fr)
                auto;
            align-items: center;
            gap: 11px;
            background: #ffffff;
            border: 1px solid #dbe7f7;
        }

        .publication-history-item +
        .publication-history-item {
            margin-top: 9px;
        }

        .publication-history-icon {
            width: 45px;
            height: 45px;
            border-radius: 14px;
            display: grid;
            place-items: center;
            color: #1565ff;
            background: #eaf2ff;
            font-size: 19px;
        }

        .publication-history-content {
            min-width: 0;
        }

        .publication-history-content h4 {
            margin: 0;
            font-size: 11px;
        }

        .publication-history-content p {
            margin: 5px 0 0;
            overflow: hidden;
            color: #68758c;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 8px;
        }

        .publication-history-content span {
            display: block;
            margin-top: 5px;
            color: #68758c;
            font-size: 8px;
        }

        .publication-history-actions {
            display: grid;
            gap: 5px;
            justify-items: end;
        }

        .publication-history-actions button {
            min-width: 48px;
            min-height: 27px;
            border: 0;
            border-radius: 8px;
            color: #1565ff;
            background: #eaf2ff;
            cursor: pointer;
            font-size: 8px;
            font-weight: 800;
        }

        .publication-history-actions button:last-child {
            color: #dc3545;
            background: #fff0f1;
        }

        .publish-status {
            padding: 5px 8px;
            border-radius: 999px;
            color: #f59e0b;
            background: #fff8e7;
            font-size: 8px;
            font-weight: 900;
        }

        .publish-status.published,
        .publish-status.approved {
            color: #179b5f;
            background: #e9fff3;
        }

        .publish-status.rejected {
            color: #dc3545;
            background: #fff0f1;
        }

        .publish-status.draft {
            color: #68758c;
            background: #eef2f7;
        }

        @keyframes publishSpinnerAnimation {
            to {
                transform: rotate(360deg);
            }
        }

        @media (max-width: 650px) {
            .publication-history-item {
                grid-template-columns:
                    auto minmax(0, 1fr);
            }

            .publication-history-actions {
                grid-column: 1 / -1;
                grid-template-columns:
                    repeat(3, minmax(0, 1fr));
                width: 100%;
            }
        }
    `;

    document.head.appendChild(
        style
    );
}

/* =========================================================
   ربط الحقول
========================================================= */

function initializePublishFields() {
    publishSelectAll(
        "#publishForm input, #publishForm textarea, #publishForm select"
    ).forEach(
        function (field) {
            field.addEventListener(
                "input",
                function () {
                    field.classList.remove(
                        "publish-input-error"
                    );

                    const parent =
                        field.parentElement;

                    if (parent) {
                        const error =
                            parent.querySelector(
                                ".publish-field-error, .field-error"
                            );

                        if (error) {
                            error.textContent =
                                "";
                        }
                    }

                    if (
                        field.tagName
                            .toLowerCase() ===
                        "textarea"
                    ) {
                        resizePublishTextarea(
                            field
                        );
                    }

                    updatePublishCounters();
                    updatePublishPreview();
                }
            );

            field.addEventListener(
                "change",
                function () {
                    updatePublishPreview();
                    savePublishDraft(false);
                }
            );
        }
    );
}

/* =========================================================
   ربط الأحداث
========================================================= */

function initializePublishEvents() {
    const form =
        publishGetElement(
            "publishForm"
        );

    if (form) {
        form.addEventListener(
            "submit",
            submitPublishForm
        );
    }

    publishSelectAll(
        "[data-publish-type]"
    ).forEach(
        function (button) {
            button.addEventListener(
                "click",
                function () {
                    setPublishType(
                        button.getAttribute(
                            "data-publish-type"
                        )
                    );
                }
            );
        }
    );

    const saveDraftButton =
        publishGetElement(
            "savePublishDraftButton"
        );

    if (saveDraftButton) {
        saveDraftButton.addEventListener(
            "click",
            function () {
                savePublishDraft(true);
            }
        );
    }

    const clearDraftButton =
        publishGetElement(
            "clearPublishDraftButton"
        );

    if (clearDraftButton) {
        clearDraftButton.addEventListener(
            "click",
            clearPublishDraft
        );
    }

    const imageButton =
        publishGetElement(
            "selectPublishImageButton"
        );

    const imageInput =
        publishGetElement(
            "publishImageInput"
        );

    if (imageButton) {
        imageButton.addEventListener(
            "click",
            function () {
                if (imageInput) {
                    imageInput.click();
                }
            }
        );
    }

    if (imageInput) {
        imageInput.addEventListener(
            "change",
            function (event) {
                const files =
                    event.target.files;

                if (
                    !files ||
                    files.length === 0
                ) {
                    return;
                }

                handlePublishImage(
                    files[0]
                );
            }
        );
    }

    const removeImageButton =
        publishGetElement(
            "removePublishImageButton"
        );

    if (removeImageButton) {
        removeImageButton.addEventListener(
            "click",
            clearPublishImage
        );
    }

    const savedProjectSelect =
        publishGetElement(
            "savedProjectSelect"
        );

    if (savedProjectSelect) {
        savedProjectSelect.addEventListener(
            "change",
            function (event) {
                if (
                    event.target.value
                ) {
                    importSavedProject(
                        event.target.value
                    );
                }
            }
        );
    }

    const exportButton =
        publishGetElement(
            "exportPublicationsButton"
        );

    if (exportButton) {
        exportButton.addEventListener(
            "click",
            exportPublicationHistory
        );
    }

    const statusField =
        publishGetElement(
            "publishStatus"
        );

    if (statusField) {
        statusField.addEventListener(
            "change",
            function () {
                PublishState.selectedStatus =
                    statusField.value;

                savePublishDraft(false);
            }
        );
    }

    window.addEventListener(
        "beforeunload",
        function () {
            savePublishDraft(false);
        }
    );

    window.addEventListener(
        "storage",
        function (event) {
            if (
                event.key ===
                PublishStorageKeys.projects
            ) {
                const projects =
                    publishReadStorage(
                        PublishStorageKeys.projects,
                        []
                    );

                PublishState.projects =
                    Array.isArray(projects)
                        ? projects
                        : [];

                renderSavedProjectsSelect();
            }

            if (
                event.key ===
                PublishStorageKeys.publications
            ) {
                const publications =
                    publishReadStorage(
                        PublishStorageKeys.publications,
                        []
                    );

                PublishState.publications =
                    Array.isArray(
                        publications
                    )
                        ? publications
                        : [];

                renderPublicationHistory();
                updatePublishStatistics();
            }
        }
    );
}

/* =========================================================
   تشغيل الملف
========================================================= */

function initializePublishPage() {
    injectPublishStyles();

    loadPublishData();

    renderSavedProjectsSelect();

    initializePublishFields();

    initializePublishEvents();

    publishSelectAll(
        "#publishForm textarea"
    ).forEach(
        function (textarea) {
            resizePublishTextarea(
                textarea
            );
        }
    );

    renderPublishImage();

    document.body.classList.add(
        "publish-page-ready"
    );

    document.dispatchEvent(
        new CustomEvent(
            "projectJourneyPublishReady",
            {
                detail: {
                    publications:
                        PublishState
                            .publications
                            .length,

                    projects:
                        PublishState
                            .projects
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
        initializePublishPage
    );
} else {
    initializePublishPage();
}

/* =========================================================
   إتاحة الوظائف
========================================================= */

window.PublishState =
    PublishState;

window.setPublishType =
    setPublishType;

window.savePublishDraft =
    savePublishDraft;

window.clearPublishDraft =
    clearPublishDraft;

window.submitPublishForm =
    submitPublishForm;

window.handlePublishImage =
    handlePublishImage;

window.clearPublishImage =
    clearPublishImage;

window.importSavedProject =
    importSavedProject;

window.deletePublication =
    deletePublication;

window.exportPublicationHistory =
    exportPublicationHistory;