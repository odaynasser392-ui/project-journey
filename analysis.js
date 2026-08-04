"use strict";

/* =========================================================
   رحلة مشروع - Project Journey
   ملف تحليل فكرة المشروع
   js/analysis.js
========================================================= */

const AnalysisState = {
    currentUser: null,

    projects: [],
    analyses: [],
    ideas: [],

    selectedProjectId: "",
    selectedAnalysisId: "",

    currentStep: 1,
    totalSteps: 5,

    isAnalyzing: false,

    draft: {
        projectName: "",
        ideaDescription: "",
        problem: "",
        solution: "",
        category: "general",
        targetCustomers: "",
        targetMarket: "",
        competitors: "",
        budget: 0,
        experience: "",
        goals: "",
        strengths: "",
        weaknesses: "",
        opportunities: "",
        threats: ""
    }
};

/* =========================================================
   مفاتيح التخزين
========================================================= */

const AnalysisStorageKeys = {
    currentUser:
        "projectJourneyCurrentUser",

    projects:
        "projectJourneyProjects",

    analyses:
        "projectJourneyAnalyses",

    ideas:
        "projectJourneySavedIdeas",

    currentDraft:
        "projectJourneyAnalysisDraft",

    latestResult:
        "projectJourneyLatestAnalysis",

    notifications:
        "projectJourneyNotifications"
};

/* =========================================================
   أدوات العناصر
========================================================= */

function analysisGetElement(id) {
    return document.getElementById(id);
}

function analysisSelect(
    selector,
    parent = document
) {
    return parent.querySelector(
        selector
    );
}

function analysisSelectAll(
    selector,
    parent = document
) {
    return Array.from(
        parent.querySelectorAll(
            selector
        )
    );
}

/* =========================================================
   التخزين
========================================================= */

function analysisReadStorage(
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
            "خطأ في قراءة بيانات التحليل:",
            error
        );

        return fallback;
    }
}

function analysisSaveStorage(
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
            "خطأ في حفظ بيانات التحليل:",
            error
        );

        showAnalysisMessage(
            "تعذر حفظ بيانات التحليل.",
            "error"
        );

        return false;
    }
}

/* =========================================================
   إنشاء معرف
========================================================= */

function analysisCreateId(
    prefix = "ANALYSIS"
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
   أدوات النصوص
========================================================= */

function analysisNormalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function analysisEscapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function analysisTruncate(
    value,
    maximumLength = 120
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

/* =========================================================
   تنسيق البيانات
========================================================= */

function analysisFormatDate(value) {
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

function analysisFormatNumber(value) {
    return new Intl.NumberFormat(
        "ar"
    ).format(
        Number(value) || 0
    );
}

function analysisFormatCurrency(
    value,
    currency = "OMR"
) {
    return (
        new Intl.NumberFormat(
            "ar",
            {
                maximumFractionDigits: 2
            }
        ).format(
            Number(value) || 0
        ) +
        " " +
        currency
    );
}

/* =========================================================
   رسائل الصفحة
========================================================= */

function showAnalysisMessage(
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
   تحميل البيانات
========================================================= */

function loadAnalysisData() {
    AnalysisState.currentUser =
        analysisReadStorage(
            AnalysisStorageKeys.currentUser,
            null
        );

    const projects =
        analysisReadStorage(
            AnalysisStorageKeys.projects,
            []
        );

    const analyses =
        analysisReadStorage(
            AnalysisStorageKeys.analyses,
            []
        );

    const ideas =
        analysisReadStorage(
            AnalysisStorageKeys.ideas,
            []
        );

    const draft =
        analysisReadStorage(
            AnalysisStorageKeys.currentDraft,
            null
        );

    AnalysisState.projects =
        Array.isArray(projects)
            ? projects
            : [];

    AnalysisState.analyses =
        Array.isArray(analyses)
            ? analyses
            : [];

    AnalysisState.ideas =
        Array.isArray(ideas)
            ? ideas
            : [];

    if (
        draft &&
        typeof draft === "object"
    ) {
        AnalysisState.draft = {
            ...AnalysisState.draft,
            ...draft
        };
    }

    loadProjectFromURL();
    fillAnalysisForm();
    renderSavedAnalyses();
    updateAnalysisStatistics();
}

/* =========================================================
   قراءة المشروع من الرابط
========================================================= */

function loadProjectFromURL() {
    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const projectId =
        parameters.get(
            "project"
        );

    const ideaId =
        parameters.get(
            "idea"
        );

    if (projectId) {
        const project =
            AnalysisState.projects.find(
                (item) =>
                    item.id ===
                    projectId
            );

        if (project) {
            AnalysisState.selectedProjectId =
                project.id;

            importProjectIntoDraft(
                project
            );
        }
    }

    if (ideaId) {
        const idea =
            AnalysisState.ideas.find(
                (item) =>
                    item.id ===
                    ideaId
            );

        if (idea) {
            importIdeaIntoDraft(
                idea
            );
        }
    }
}

/* =========================================================
   استيراد البيانات
========================================================= */

function importProjectIntoDraft(project) {
    AnalysisState.draft = {
        ...AnalysisState.draft,

        projectName:
            project.name ||
            project.title ||
            "",

        ideaDescription:
            project.description ||
            project.idea ||
            "",

        problem:
            project.problem ||
            "",

        solution:
            project.solution ||
            "",

        category:
            project.category ||
            project.type ||
            "general",

        targetCustomers:
            project.targetCustomers ||
            project.customers ||
            "",

        targetMarket:
            project.targetMarket ||
            project.market ||
            "",

        competitors:
            project.competitors ||
            "",

        budget:
            Number(
                project.budget ||
                project.estimatedBudget ||
                0
            ),

        experience:
            project.experience ||
            "",

        goals:
            project.goals ||
            ""
    };
}

function importIdeaIntoDraft(idea) {
    AnalysisState.draft = {
        ...AnalysisState.draft,

        projectName:
            idea.name ||
            idea.title ||
            AnalysisState
                .draft
                .projectName,

        ideaDescription:
            idea.description ||
            idea.idea ||
            idea.content ||
            "",

        problem:
            idea.problem ||
            "",

        solution:
            idea.solution ||
            "",

        category:
            idea.category ||
            "general",

        targetCustomers:
            idea.targetCustomers ||
            "",

        targetMarket:
            idea.targetMarket ||
            ""
    };
}

/* =========================================================
   تعبئة النموذج
========================================================= */

function fillAnalysisForm() {
    const fieldMap = {
        projectName:
            "analysisProjectName",

        ideaDescription:
            "analysisIdeaDescription",

        problem:
            "analysisProblem",

        solution:
            "analysisSolution",

        category:
            "analysisCategory",

        targetCustomers:
            "analysisTargetCustomers",

        targetMarket:
            "analysisTargetMarket",

        competitors:
            "analysisCompetitors",

        budget:
            "analysisBudget",

        experience:
            "analysisExperience",

        goals:
            "analysisGoals",

        strengths:
            "analysisStrengths",

        weaknesses:
            "analysisWeaknesses",

        opportunities:
            "analysisOpportunities",

        threats:
            "analysisThreats"
    };

    Object.entries(
        fieldMap
    ).forEach(
        ([
            property,
            elementId
        ]) => {
            const field =
                analysisGetElement(
                    elementId
                );

            if (!field) {
                return;
            }

            field.value =
                AnalysisState
                    .draft[
                        property
                    ] ?? "";
        }
    );

    updateCharacterCounters();
}

/* =========================================================
   جمع بيانات النموذج
========================================================= */

function collectAnalysisFormData() {
    return {
        projectName:
            analysisGetElement(
                "analysisProjectName"
            )?.value.trim() ||
            "",

        ideaDescription:
            analysisGetElement(
                "analysisIdeaDescription"
            )?.value.trim() ||
            "",

        problem:
            analysisGetElement(
                "analysisProblem"
            )?.value.trim() ||
            "",

        solution:
            analysisGetElement(
                "analysisSolution"
            )?.value.trim() ||
            "",

        category:
            analysisGetElement(
                "analysisCategory"
            )?.value ||
            "general",

        targetCustomers:
            analysisGetElement(
                "analysisTargetCustomers"
            )?.value.trim() ||
            "",

        targetMarket:
            analysisGetElement(
                "analysisTargetMarket"
            )?.value.trim() ||
            "",

        competitors:
            analysisGetElement(
                "analysisCompetitors"
            )?.value.trim() ||
            "",

        budget:
            Number(
                analysisGetElement(
                    "analysisBudget"
                )?.value
            ) || 0,

        experience:
            analysisGetElement(
                "analysisExperience"
            )?.value.trim() ||
            "",

        goals:
            analysisGetElement(
                "analysisGoals"
            )?.value.trim() ||
            "",

        strengths:
            analysisGetElement(
                "analysisStrengths"
            )?.value.trim() ||
            "",

        weaknesses:
            analysisGetElement(
                "analysisWeaknesses"
            )?.value.trim() ||
            "",

        opportunities:
            analysisGetElement(
                "analysisOpportunities"
            )?.value.trim() ||
            "",

        threats:
            analysisGetElement(
                "analysisThreats"
            )?.value.trim() ||
            ""
    };
}

/* =========================================================
   حفظ المسودة
========================================================= */

function saveAnalysisDraft(
    showMessage = true
) {
    AnalysisState.draft =
        collectAnalysisFormData();

    const saved =
        analysisSaveStorage(
            AnalysisStorageKeys.currentDraft,
            AnalysisState.draft
        );

    if (
        saved &&
        showMessage
    ) {
        showAnalysisMessage(
            "تم حفظ مسودة التحليل.",
            "success"
        );
    }

    return saved;
}

function clearAnalysisDraft() {
    const confirmed =
        window.confirm(
            "هل تريد مسح جميع بيانات التحليل الحالية؟"
        );

    if (!confirmed) {
        return;
    }

    AnalysisState.draft = {
        projectName: "",
        ideaDescription: "",
        problem: "",
        solution: "",
        category: "general",
        targetCustomers: "",
        targetMarket: "",
        competitors: "",
        budget: 0,
        experience: "",
        goals: "",
        strengths: "",
        weaknesses: "",
        opportunities: "",
        threats: ""
    };

    localStorage.removeItem(
        AnalysisStorageKeys.currentDraft
    );

    fillAnalysisForm();
    setAnalysisStep(1);

    showAnalysisMessage(
        "تم مسح بيانات التحليل.",
        "success"
    );
}

/* =========================================================
   التحقق من الحقول
========================================================= */

function clearAnalysisErrors() {
    analysisSelectAll(
        ".analysis-input-error"
    ).forEach(
        (field) => {
            field.classList.remove(
                "analysis-input-error"
            );
        }
    );

    analysisSelectAll(
        ".analysis-field-error"
    ).forEach(
        (element) => {
            element.textContent = "";
        }
    );
}

function showAnalysisFieldError(
    field,
    message
) {
    if (!field) {
        return;
    }

    field.classList.add(
        "analysis-input-error"
    );

    const errorElement =
        field.parentElement
            ?.querySelector(
                ".analysis-field-error, .field-error"
            );

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}

function validateAnalysisStep(step) {
    clearAnalysisErrors();

    let valid = true;

    if (step === 1) {
        const projectName =
            analysisGetElement(
                "analysisProjectName"
            );

        const ideaDescription =
            analysisGetElement(
                "analysisIdeaDescription"
            );

        if (
            !projectName ||
            projectName.value
                .trim()
                .length < 3
        ) {
            showAnalysisFieldError(
                projectName,
                "اكتب اسمًا واضحًا للمشروع."
            );

            valid = false;
        }

        if (
            !ideaDescription ||
            ideaDescription.value
                .trim()
                .length < 20
        ) {
            showAnalysisFieldError(
                ideaDescription,
                "اشرح فكرة المشروع في 20 حرفًا على الأقل."
            );

            valid = false;
        }
    }

    if (step === 2) {
        const problem =
            analysisGetElement(
                "analysisProblem"
            );

        const solution =
            analysisGetElement(
                "analysisSolution"
            );

        if (
            !problem ||
            problem.value
                .trim()
                .length < 15
        ) {
            showAnalysisFieldError(
                problem,
                "اشرح المشكلة بشكل أوضح."
            );

            valid = false;
        }

        if (
            !solution ||
            solution.value
                .trim()
                .length < 15
        ) {
            showAnalysisFieldError(
                solution,
                "اشرح الحل المقترح بشكل أوضح."
            );

            valid = false;
        }
    }

    if (step === 3) {
        const customers =
            analysisGetElement(
                "analysisTargetCustomers"
            );

        const market =
            analysisGetElement(
                "analysisTargetMarket"
            );

        if (
            !customers ||
            customers.value
                .trim()
                .length < 5
        ) {
            showAnalysisFieldError(
                customers,
                "حدد العملاء المستهدفين."
            );

            valid = false;
        }

        if (
            !market ||
            market.value
                .trim()
                .length < 5
        ) {
            showAnalysisFieldError(
                market,
                "حدد السوق المستهدف."
            );

            valid = false;
        }
    }

    if (step === 4) {
        const budget =
            analysisGetElement(
                "analysisBudget"
            );

        if (
            budget &&
            Number(
                budget.value
            ) < 0
        ) {
            showAnalysisFieldError(
                budget,
                "الميزانية لا يمكن أن تكون سالبة."
            );

            valid = false;
        }
    }

    return valid;
}

/* =========================================================
   خطوات النموذج
========================================================= */

function setAnalysisStep(step) {
    const safeStep =
        Math.max(
            1,
            Math.min(
                step,
                AnalysisState.totalSteps
            )
        );

    AnalysisState.currentStep =
        safeStep;

    analysisSelectAll(
        "[data-analysis-step]"
    ).forEach(
        (section) => {
            const sectionStep =
                Number(
                    section.dataset
                        .analysisStep
                );

            section.hidden =
                sectionStep !==
                safeStep;
        }
    );

    analysisSelectAll(
        "[data-step-indicator]"
    ).forEach(
        (indicator) => {
            const indicatorStep =
                Number(
                    indicator.dataset
                        .stepIndicator
                );

            indicator.classList.toggle(
                "active",
                indicatorStep ===
                    safeStep
            );

            indicator.classList.toggle(
                "completed",
                indicatorStep <
                    safeStep
            );
        }
    );

    const previousButton =
        analysisGetElement(
            "previousAnalysisStep"
        );

    const nextButton =
        analysisGetElement(
            "nextAnalysisStep"
        );

    const analyzeButton =
        analysisGetElement(
            "startAnalysisButton"
        );

    if (previousButton) {
        previousButton.hidden =
            safeStep === 1;
    }

    if (nextButton) {
        nextButton.hidden =
            safeStep ===
            AnalysisState.totalSteps;
    }

    if (analyzeButton) {
        analyzeButton.hidden =
            safeStep !==
            AnalysisState.totalSteps;
    }

    const progress =
        analysisGetElement(
            "analysisProgressBar"
        );

    if (progress) {
        progress.style.width =
            `${
                safeStep /
                AnalysisState.totalSteps *
                100
            }%`;
    }

    const stepText =
        analysisGetElement(
            "analysisStepText"
        );

    if (stepText) {
        stepText.textContent =
            `الخطوة ${safeStep} من ${AnalysisState.totalSteps}`;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function nextAnalysisStep() {
    if (
        !validateAnalysisStep(
            AnalysisState.currentStep
        )
    ) {
        return;
    }

    saveAnalysisDraft(false);

    setAnalysisStep(
        AnalysisState.currentStep +
        1
    );
}

function previousAnalysisStep() {
    saveAnalysisDraft(false);

    setAnalysisStep(
        AnalysisState.currentStep -
        1
    );
}

/* =========================================================
   تقييم اكتمال الفكرة
========================================================= */

function calculateCompleteness(data) {
    const fields = [
        data.projectName,
        data.ideaDescription,
        data.problem,
        data.solution,
        data.targetCustomers,
        data.targetMarket,
        data.competitors,
        data.experience,
        data.goals
    ];

    const completed =
        fields.filter(
            (value) =>
                String(value || "")
                    .trim()
                    .length > 0
        ).length;

    return Math.round(
        completed /
        fields.length *
        100
    );
}

/* =========================================================
   توليد درجات التحليل
========================================================= */

function calculateIdeaClarity(data) {
    let score = 35;

    if (
        data.ideaDescription.length >
        80
    ) {
        score += 20;
    }

    if (
        data.problem.length >
        40
    ) {
        score += 15;
    }

    if (
        data.solution.length >
        40
    ) {
        score += 15;
    }

    if (
        data.projectName.length >
        3
    ) {
        score += 10;
    }

    return Math.min(
        score,
        100
    );
}

function calculateMarketScore(data) {
    let score = 25;

    if (
        data.targetCustomers.length >
        10
    ) {
        score += 25;
    }

    if (
        data.targetMarket.length >
        10
    ) {
        score += 20;
    }

    if (
        data.competitors.length >
        10
    ) {
        score += 15;
    }

    if (
        data.category !==
        "general"
    ) {
        score += 10;
    }

    return Math.min(
        score,
        100
    );
}

function calculateExecutionScore(data) {
    let score = 30;

    if (
        data.budget > 0
    ) {
        score += 20;
    }

    if (
        data.experience.length >
        10
    ) {
        score += 20;
    }

    if (
        data.goals.length >
        10
    ) {
        score += 20;
    }

    if (
        data.solution.length >
        30
    ) {
        score += 10;
    }

    return Math.min(
        score,
        100
    );
}

function calculateInnovationScore(data) {
    const combinedText =
        analysisNormalizeText(
            [
                data.ideaDescription,
                data.problem,
                data.solution
            ].join(" ")
        );

    const innovationWords = [
        "ذكي",
        "تقنية",
        "ابتكار",
        "جديد",
        "رقمي",
        "تطبيق",
        "منصة",
        "ذكاء",
        "تلقائي",
        "تحليل",
        "مستدام"
    ];

    let score = 45;

    innovationWords.forEach(
        (word) => {
            if (
                combinedText.includes(
                    word
                )
            ) {
                score += 5;
            }
        }
    );

    return Math.min(
        score,
        100
    );
}

function calculateRiskScore(data) {
    let risk = 60;

    if (
        data.competitors.length >
        15
    ) {
        risk -= 10;
    }

    if (
        data.experience.length >
        15
    ) {
        risk -= 10;
    }

    if (
        data.budget > 0
    ) {
        risk -= 10;
    }

    if (
        data.targetCustomers.length >
        15
    ) {
        risk -= 10;
    }

    if (
        data.threats.length >
        10
    ) {
        risk -= 5;
    }

    return Math.max(
        15,
        Math.min(
            risk,
            100
        )
    );
}

/* =========================================================
   استخراج الكلمات
========================================================= */

function containsAny(
    text,
    words
) {
    const normalized =
        analysisNormalizeText(text);

    return words.some(
        (word) =>
            normalized.includes(
                analysisNormalizeText(
                    word
                )
            )
    );
}

/* =========================================================
   تحليل SWOT
========================================================= */

function generateStrengths(data) {
    const strengths = [];

    if (
        data.solution.length >
        35
    ) {
        strengths.push(
            "الحل المقترح موضح بصورة جيدة ويمكن شرحه للعملاء."
        );
    }

    if (
        data.targetCustomers.length >
        15
    ) {
        strengths.push(
            "هناك تحديد أولي واضح لشريحة العملاء المستهدفة."
        );
    }

    if (
        data.experience.length >
        15
    ) {
        strengths.push(
            "وجود خبرة أو معرفة سابقة تساعد على تنفيذ المشروع."
        );
    }

    if (
        data.budget > 0
    ) {
        strengths.push(
            "تم التفكير في الميزانية الأولية للمشروع."
        );
    }

    if (
        containsAny(
            data.ideaDescription,
            [
                "ذكي",
                "تقني",
                "رقمي",
                "تطبيق",
                "منصة"
            ]
        )
    ) {
        strengths.push(
            "الفكرة تستفيد من التقنية لتقديم تجربة أكثر سهولة."
        );
    }

    if (
        data.strengths
    ) {
        strengths.push(
            data.strengths
        );
    }

    if (!strengths.length) {
        strengths.push(
            "الفكرة تستهدف حل مشكلة محددة ويمكن تطويرها تدريجيًا."
        );
    }

    return strengths.slice(
        0,
        5
    );
}

function generateWeaknesses(data) {
    const weaknesses = [];

    if (
        data.competitors.length <
        10
    ) {
        weaknesses.push(
            "المنافسون غير محددين بشكل كافٍ."
        );
    }

    if (
        data.budget <= 0
    ) {
        weaknesses.push(
            "لم يتم تحديد ميزانية أو تكلفة أولية."
        );
    }

    if (
        data.experience.length <
        10
    ) {
        weaknesses.push(
            "الخبرة أو المهارات المطلوبة للتنفيذ غير واضحة."
        );
    }

    if (
        data.goals.length <
        10
    ) {
        weaknesses.push(
            "الأهداف الحالية عامة وتحتاج إلى قياس زمني ورقمي."
        );
    }

    if (
        data.targetMarket.length <
        15
    ) {
        weaknesses.push(
            "السوق المستهدف يحتاج إلى وصف أكثر دقة."
        );
    }

    if (
        data.weaknesses
    ) {
        weaknesses.push(
            data.weaknesses
        );
    }

    return weaknesses.slice(
        0,
        5
    );
}

function generateOpportunities(data) {
    const opportunities = [];

    opportunities.push(
        "اختبار الفكرة بنموذج أولي بسيط قبل الاستثمار الكامل."
    );

    opportunities.push(
        "استخدام التسويق الرقمي للوصول إلى العملاء المستهدفين."
    );

    if (
        containsAny(
            data.ideaDescription,
            [
                "تطبيق",
                "منصة",
                "رقمي",
                "تقني"
            ]
        )
    ) {
        opportunities.push(
            "إمكانية التوسع إلى أسواق ومناطق جديدة دون زيادة كبيرة في التكاليف."
        );
    }

    if (
        data.category ===
        "services"
    ) {
        opportunities.push(
            "إمكانية تقديم باقات وخدمات شهرية متكررة."
        );
    }

    if (
        data.category ===
        "commerce"
    ) {
        opportunities.push(
            "إمكانية توسيع المنتجات وإنشاء متجر إلكتروني."
        );
    }

    if (
        data.opportunities
    ) {
        opportunities.push(
            data.opportunities
        );
    }

    return opportunities.slice(
        0,
        5
    );
}

function generateThreats(data) {
    const threats = [];

    threats.push(
        "احتمال دخول منافسين يقدمون حلولًا مشابهة."
    );

    if (
        data.budget <= 0
    ) {
        threats.push(
            "صعوبة معرفة القدرة على الاستمرار دون تقدير مالي."
        );
    }

    if (
        data.competitors.length <
        10
    ) {
        threats.push(
            "عدم دراسة المنافسين قد يؤدي إلى تكرار حلول موجودة."
        );
    }

    threats.push(
        "تغير احتياجات العملاء أو ضعف الإقبال على الحل."
    );

    threats.push(
        "ارتفاع تكاليف التسويق أو التشغيل أثناء النمو."
    );

    if (
        data.threats
    ) {
        threats.push(
            data.threats
        );
    }

    return threats.slice(
        0,
        5
    );
}

/* =========================================================
   التوصيات
========================================================= */

function generateRecommendations(
    data,
    scores
) {
    const recommendations = [];

    if (
        scores.market < 65
    ) {
        recommendations.push({
            title:
                "تطوير دراسة السوق",

            description:
                "أجرِ مقابلات مع 10 إلى 20 عميلًا محتملًا وتعرف على احتياجاتهم وسلوكهم الشرائي.",

            priority:
                "high"
        });
    }

    if (
        data.competitors.length <
        10
    ) {
        recommendations.push({
            title:
                "تحليل المنافسين",

            description:
                "حدد ثلاثة منافسين على الأقل وقارن السعر والجودة والقيمة التي يقدمها كل منهم.",

            priority:
                "high"
        });
    }

    if (
        data.budget <= 0
    ) {
        recommendations.push({
            title:
                "إعداد ميزانية أولية",

            description:
                "قسّم التكاليف إلى تأسيس وتشغيل وتسويق واحتياطي للطوارئ.",

            priority:
                "medium"
        });
    }

    if (
        scores.execution < 65
    ) {
        recommendations.push({
            title:
                "إنشاء خطة تنفيذ",

            description:
                "قسّم المشروع إلى مراحل أسبوعية مع تحديد المسؤول والموعد والنتيجة المطلوبة.",

            priority:
                "high"
        });
    }

    if (
        scores.innovation < 60
    ) {
        recommendations.push({
            title:
                "تعزيز القيمة المميزة",

            description:
                "حدد لماذا سيختار العميل مشروعك بدل الحلول الأخرى الموجودة.",

            priority:
                "medium"
        });
    }

    recommendations.push({
        title:
            "اختبار نموذج أولي",

        description:
            "ابدأ بنسخة بسيطة من المنتج أو الخدمة واختبرها مع عدد محدود من العملاء.",

        priority:
            "high"
    });

    recommendations.push({
        title:
            "تحديد مؤشرات النجاح",

        description:
            "اختر مؤشرات قابلة للقياس مثل عدد العملاء والمبيعات ونسبة رضا المستخدمين.",

        priority:
            "medium"
    });

    return recommendations.slice(
        0,
        6
    );
}

/* =========================================================
   خطة أولية
========================================================= */

function generateInitialPlan(data) {
    return [
        {
            order: 1,
            title:
                "التحقق من المشكلة",
            description:
                "مقابلة العملاء المحتملين والتأكد من أهمية المشكلة.",
            duration:
                "أسبوع"
        },
        {
            order: 2,
            title:
                "تحليل المنافسين",
            description:
                "دراسة البدائل الموجودة وتحديد الميزة التنافسية.",
            duration:
                "3 أيام"
        },
        {
            order: 3,
            title:
                "إنشاء نموذج أولي",
            description:
                "بناء نسخة أولية بسيطة من المنتج أو الخدمة.",
            duration:
                "أسبوعان"
        },
        {
            order: 4,
            title:
                "اختبار السوق",
            description:
                `تجربة النموذج مع ${
                    data.targetCustomers ||
                    "العملاء المستهدفين"
                }.`,
            duration:
                "أسبوع"
        },
        {
            order: 5,
            title:
                "تحسين وإطلاق",
            description:
                "تعديل المنتج بناءً على الملاحظات ثم إطلاقه تدريجيًا.",
            duration:
                "أسبوعان"
        }
    ];
}

/* =========================================================
   إنشاء التحليل
========================================================= */

function createAnalysisResult(data) {
    const scores = {
        clarity:
            calculateIdeaClarity(
                data
            ),

        market:
            calculateMarketScore(
                data
            ),

        execution:
            calculateExecutionScore(
                data
            ),

        innovation:
            calculateInnovationScore(
                data
            ),

        risk:
            calculateRiskScore(
                data
            ),

        completeness:
            calculateCompleteness(
                data
            )
    };

    const overallScore =
        Math.round(
            (
                scores.clarity *
                    0.25 +
                scores.market *
                    0.25 +
                scores.execution *
                    0.20 +
                scores.innovation *
                    0.20 +
                (
                    100 -
                    scores.risk
                ) *
                    0.10
            )
        );

    const now =
        new Date()
            .toISOString();

    return {
        id:
            analysisCreateId(
                "ANALYSIS"
            ),

        userId:
            AnalysisState.currentUser
                ?.id ||
            "guest",

        projectId:
            AnalysisState
                .selectedProjectId ||
            "",

        projectName:
            data.projectName,

        ideaDescription:
            data.ideaDescription,

        problem:
            data.problem,

        solution:
            data.solution,

        category:
            data.category,

        targetCustomers:
            data.targetCustomers,

        targetMarket:
            data.targetMarket,

        competitors:
            data.competitors,

        budget:
            data.budget,

        experience:
            data.experience,

        goals:
            data.goals,

        scores:
            scores,

        overallScore:
            overallScore,

        swot: {
            strengths:
                generateStrengths(
                    data
                ),

            weaknesses:
                generateWeaknesses(
                    data
                ),

            opportunities:
                generateOpportunities(
                    data
                ),

            threats:
                generateThreats(
                    data
                )
        },

        recommendations:
            generateRecommendations(
                data,
                scores
            ),

        initialPlan:
            generateInitialPlan(
                data
            ),

        status:
            "completed",

        createdAt:
            now,

        updatedAt:
            now
    };
}

/* =========================================================
   بدء التحليل
========================================================= */

function startIdeaAnalysis() {
    for (
        let step = 1;
        step <=
        AnalysisState.totalSteps;
        step += 1
    ) {
        if (
            !validateAnalysisStep(
                step
            )
        ) {
            setAnalysisStep(step);

            showAnalysisMessage(
                "أكمل البيانات المطلوبة قبل بدء التحليل.",
                "warning"
            );

            return;
        }
    }

    if (
        AnalysisState.isAnalyzing
    ) {
        return;
    }

    AnalysisState.isAnalyzing =
        true;

    AnalysisState.draft =
        collectAnalysisFormData();

    saveAnalysisDraft(false);

    setAnalysisLoading(true);

    updateAnalysisLoadingText(
        "جاري فهم فكرة المشروع..."
    );

    window.setTimeout(
        () => {
            updateAnalysisLoadingText(
                "جاري تحليل السوق والعملاء..."
            );
        },
        700
    );

    window.setTimeout(
        () => {
            updateAnalysisLoadingText(
                "جاري تحديد نقاط القوة والمخاطر..."
            );
        },
        1400
    );

    window.setTimeout(
        () => {
            updateAnalysisLoadingText(
                "جاري إعداد التوصيات..."
            );
        },
        2100
    );

    window.setTimeout(
        () => {
            const result =
                createAnalysisResult(
                    AnalysisState.draft
                );

            AnalysisState.analyses.unshift(
                result
            );

            AnalysisState.selectedAnalysisId =
                result.id;

            analysisSaveStorage(
                AnalysisStorageKeys.analyses,
                AnalysisState.analyses
            );

            analysisSaveStorage(
                AnalysisStorageKeys.latestResult,
                result
            );

            saveResultToProject(
                result
            );

            createAnalysisNotification(
                result
            );

            localStorage.removeItem(
                AnalysisStorageKeys.currentDraft
            );

            setAnalysisLoading(false);

            AnalysisState.isAnalyzing =
                false;

            renderAnalysisResult(
                result
            );

            renderSavedAnalyses();
            updateAnalysisStatistics();

            showAnalysisMessage(
                "تم تحليل فكرة المشروع بنجاح.",
                "success"
            );
        },
        2900
    );
}

/* =========================================================
   تحديث المشروع
========================================================= */

function saveResultToProject(result) {
    if (
        !result.projectId
    ) {
        return;
    }

    const project =
        AnalysisState.projects.find(
            (item) =>
                item.id ===
                result.projectId
        );

    if (!project) {
        return;
    }

    project.analysisId =
        result.id;

    project.analysisScore =
        result.overallScore;

    project.score =
        result.overallScore;

    project.analysisStatus =
        "completed";

    project.updatedAt =
        new Date()
            .toISOString();

    analysisSaveStorage(
        AnalysisStorageKeys.projects,
        AnalysisState.projects
    );
}

/* =========================================================
   إشعار انتهاء التحليل
========================================================= */

function createAnalysisNotification(result) {
    if (
        typeof window.addNotification ===
        "function"
    ) {
        window.addNotification({
            title:
                "اكتمل تحليل المشروع",

            message:
                `تم تحليل مشروع ${result.projectName} وحصل على تقييم ${result.overallScore} من 100.`,

            type:
                "success",

            link:
                `idea result.html?id=${result.id}`
        });

        return;
    }

    const notifications =
        analysisReadStorage(
            AnalysisStorageKeys.notifications,
            []
        );

    const list =
        Array.isArray(
            notifications
        )
            ? notifications
            : [];

    list.unshift({
        id:
            analysisCreateId(
                "NOTIFICATION"
            ),

        title:
            "اكتمل تحليل المشروع",

        message:
            `تم تحليل مشروع ${result.projectName}.`,

        type:
            "success",

        link:
            `idea result.html?id=${result.id}`,

        isRead:
            false,

        createdAt:
            new Date()
                .toISOString()
    });

    analysisSaveStorage(
        AnalysisStorageKeys.notifications,
        list
    );
}

/* =========================================================
   حالة التحميل
========================================================= */

function setAnalysisLoading(loading) {
    const overlay =
        analysisGetElement(
            "analysisLoadingOverlay"
        );

    const button =
        analysisGetElement(
            "startAnalysisButton"
        );

    if (overlay) {
        overlay.hidden =
            !loading;
    }

    if (button) {
        button.disabled =
            loading;
    }

    document.body.classList.toggle(
        "analysis-loading",
        loading
    );
}

function updateAnalysisLoadingText(text) {
    const element =
        analysisGetElement(
            "analysisLoadingText"
        );

    if (element) {
        element.textContent =
            text;
    }
}

/* =========================================================
   عرض النتيجة
========================================================= */

function renderAnalysisResult(result) {
    const section =
        analysisGetElement(
            "analysisResultSection"
        );

    if (!section) {
        window.location.href =
            `idea result.html?id=${result.id}`;

        return;
    }

    section.hidden =
        false;

    const name =
        analysisGetElement(
            "resultProjectName"
        );

    const score =
        analysisGetElement(
            "resultOverallScore"
        );

    const description =
        analysisGetElement(
            "resultSummary"
        );

    if (name) {
        name.textContent =
            result.projectName;
    }

    if (score) {
        animateAnalysisScore(
            score,
            result.overallScore
        );
    }

    if (description) {
        description.textContent =
            getAnalysisSummary(
                result
            );
    }

    updateScoreElement(
        "resultClarityScore",
        result.scores.clarity
    );

    updateScoreElement(
        "resultMarketScore",
        result.scores.market
    );

    updateScoreElement(
        "resultExecutionScore",
        result.scores.execution
    );

    updateScoreElement(
        "resultInnovationScore",
        result.scores.innovation
    );

    updateScoreElement(
        "resultRiskScore",
        result.scores.risk
    );

    renderSWOTResult(
        result.swot
    );

    renderRecommendations(
        result.recommendations
    );

    renderInitialPlan(
        result.initialPlan
    );

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function getAnalysisSummary(result) {
    if (
        result.overallScore >= 80
    ) {
        return "الفكرة قوية وواضحة، ولديها أساس جيد للانتقال إلى مرحلة التخطيط والتنفيذ.";
    }

    if (
        result.overallScore >= 65
    ) {
        return "الفكرة جيدة، لكنها تحتاج إلى تحسين دراسة السوق والخطة التنفيذية قبل الإطلاق.";
    }

    if (
        result.overallScore >= 50
    ) {
        return "الفكرة قابلة للتطوير، ولكنها تحتاج إلى توضيح القيمة المميزة والعملاء والميزانية.";
    }

    return "الفكرة تحتاج إلى إعادة صياغة واختبار المشكلة والحل مع العملاء قبل بدء التنفيذ.";
}

function updateScoreElement(
    elementId,
    value
) {
    const element =
        analysisGetElement(
            elementId
        );

    if (!element) {
        return;
    }

    element.textContent =
        `${value}%`;

    const progressId =
        element.dataset
            .progressTarget;

    if (progressId) {
        const progress =
            analysisGetElement(
                progressId
            );

        if (progress) {
            progress.style.width =
                `${value}%`;
        }
    }
}

function animateAnalysisScore(
    element,
    target
) {
    const duration =
        1000;

    const start =
        performance.now();

    function update(time) {
        const progress =
            Math.min(
                (
                    time -
                    start
                ) /
                duration,
                1
            );

        const value =
            Math.round(
                target *
                progress
            );

        element.textContent =
            value;

        if (
            progress < 1
        ) {
            requestAnimationFrame(
                update
            );
        }
    }

    requestAnimationFrame(
        update
    );
}

/* =========================================================
   عرض SWOT
========================================================= */

function renderSWOTResult(swot) {
    renderAnalysisList(
        "strengthsResultList",
        swot.strengths
    );

    renderAnalysisList(
        "weaknessesResultList",
        swot.weaknesses
    );

    renderAnalysisList(
        "opportunitiesResultList",
        swot.opportunities
    );

    renderAnalysisList(
        "threatsResultList",
        swot.threats
    );
}

function renderAnalysisList(
    elementId,
    items
) {
    const container =
        analysisGetElement(
            elementId
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "";

    items.forEach(
        (item) => {
            const element =
                document.createElement(
                    "li"
                );

            element.textContent =
                item;

            container.appendChild(
                element
            );
        }
    );
}

/* =========================================================
   عرض التوصيات
========================================================= */

function renderRecommendations(
    recommendations
) {
    const container =
        analysisGetElement(
            "analysisRecommendations"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "";

    recommendations.forEach(
        (recommendation) => {
            const article =
                document.createElement(
                    "article"
                );

            article.className =
                `recommendation-card priority-${recommendation.priority}`;

            article.innerHTML = `
                <div class="recommendation-icon">
                    ${
                        recommendation.priority ===
                        "high"
                            ? "!"
                            : "✓"
                    }
                </div>

                <div>

                    <h4>
                        ${analysisEscapeHTML(
                            recommendation.title
                        )}
                    </h4>

                    <p>
                        ${analysisEscapeHTML(
                            recommendation.description
                        )}
                    </p>

                </div>
            `;

            container.appendChild(
                article
            );
        }
    );
}

/* =========================================================
   عرض الخطة
========================================================= */

function renderInitialPlan(plan) {
    const container =
        analysisGetElement(
            "analysisInitialPlan"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "";

    plan.forEach(
        (step) => {
            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "analysis-plan-step";

            article.innerHTML = `
                <div class="analysis-plan-number">
                    ${step.order}
                </div>

                <div>

                    <h4>
                        ${analysisEscapeHTML(
                            step.title
                        )}
                    </h4>

                    <p>
                        ${analysisEscapeHTML(
                            step.description
                        )}
                    </p>

                    <span>
                        المدة المقترحة:
                        ${analysisEscapeHTML(
                            step.duration
                        )}
                    </span>

                </div>
            `;

            container.appendChild(
                article
            );
        }
    );
}

/* =========================================================
   التحليلات المحفوظة
========================================================= */

function renderSavedAnalyses() {
    const container =
        analysisGetElement(
            "savedAnalysesList"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "";

    const userId =
        AnalysisState.currentUser
            ?.id;

    const analyses =
        AnalysisState.analyses
            .filter(
                (analysis) =>
                    !userId ||
                    analysis.userId ===
                        userId ||
                    AnalysisState
                        .currentUser
                        ?.role ===
                        "admin"
            )
            .slice(
                0,
                6
            );

    if (!analyses.length) {
        container.innerHTML = `
            <div class="analysis-empty-state">
                لا توجد تحليلات محفوظة حتى الآن.
            </div>
        `;

        return;
    }

    analyses.forEach(
        (analysis) => {
            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "saved-analysis-card";

            article.innerHTML = `
                <div class="saved-analysis-score">
                    ${analysis.overallScore || 0}
                </div>

                <div class="saved-analysis-content">

                    <h4>
                        ${analysisEscapeHTML(
                            analysis.projectName
                        )}
                    </h4>

                    <p>
                        ${analysisEscapeHTML(
                            analysisTruncate(
                                analysis.ideaDescription,
                                90
                            )
                        )}
                    </p>

                    <span>
                        ${analysisEscapeHTML(
                            analysisFormatDate(
                                analysis.createdAt
                            )
                        )}
                    </span>

                </div>

                <div class="saved-analysis-actions">

                    <button
                        type="button"
                        data-view-analysis="${analysis.id}"
                    >
                        عرض
                    </button>

                    <button
                        type="button"
                        data-delete-analysis="${analysis.id}"
                    >
                        حذف
                    </button>

                </div>
            `;

            container.appendChild(
                article
            );
        }
    );

    bindSavedAnalysisActions();
}

function bindSavedAnalysisActions() {
    analysisSelectAll(
        "[data-view-analysis]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    const id =
                        button.dataset
                            .viewAnalysis;

                    const result =
                        AnalysisState
                            .analyses
                            .find(
                                (item) =>
                                    item.id === id
                            );

                    if (!result) {
                        return;
                    }

                    AnalysisState.selectedAnalysisId =
                        result.id;

                    renderAnalysisResult(
                        result
                    );
                }
            );
        }
    );

    analysisSelectAll(
        "[data-delete-analysis]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    deleteSavedAnalysis(
                        button.dataset
                            .deleteAnalysis
                    );
                }
            );
        }
    );
}

function deleteSavedAnalysis(id) {
    const analysis =
        AnalysisState.analyses.find(
            (item) =>
                item.id === id
        );

    if (!analysis) {
        return;
    }

    const confirmed =
        window.confirm(
            `هل تريد حذف تحليل مشروع "${analysis.projectName}"؟`
        );

    if (!confirmed) {
        return;
    }

    AnalysisState.analyses =
        AnalysisState.analyses.filter(
            (item) =>
                item.id !== id
        );

    analysisSaveStorage(
        AnalysisStorageKeys.analyses,
        AnalysisState.analyses
    );

    renderSavedAnalyses();
    updateAnalysisStatistics();

    showAnalysisMessage(
        "تم حذف التحليل.",
        "success"
    );
}

/* =========================================================
   الإحصائيات
========================================================= */

function updateAnalysisStatistics() {
    const total =
        AnalysisState.analyses.length;

    const average =
        total
            ? Math.round(
                AnalysisState.analyses.reduce(
                    (
                        sum,
                        analysis
                    ) =>
                        sum +
                        (
                            Number(
                                analysis.overallScore
                            ) ||
                            0
                        ),
                    0
                ) /
                total
            )
            : 0;

    const highScores =
        AnalysisState.analyses.filter(
            (analysis) =>
                Number(
                    analysis.overallScore
                ) >= 75
        ).length;

    const totalElement =
        analysisGetElement(
            "totalAnalysesCount"
        );

    const averageElement =
        analysisGetElement(
            "averageAnalysisScore"
        );

    const strongElement =
        analysisGetElement(
            "strongIdeasCount"
        );

    if (totalElement) {
        totalElement.textContent =
            analysisFormatNumber(
                total
            );
    }

    if (averageElement) {
        averageElement.textContent =
            `${average}%`;
    }

    if (strongElement) {
        strongElement.textContent =
            analysisFormatNumber(
                highScores
            );
    }
}

/* =========================================================
   تصدير النتيجة
========================================================= */

function exportCurrentAnalysis() {
    const result =
        AnalysisState.analyses.find(
            (analysis) =>
                analysis.id ===
                AnalysisState
                    .selectedAnalysisId
        ) ||
        analysisReadStorage(
            AnalysisStorageKeys.latestResult,
            null
        );

    if (!result) {
        showAnalysisMessage(
            "لا توجد نتيجة تحليل لتصديرها.",
            "warning"
        );

        return;
    }

    if (
        typeof window.downloadJSON ===
        "function"
    ) {
        window.downloadJSON(
            result,
            `analysis-${result.id}.json`
        );

        return;
    }

    const blob =
        new Blob(
            [
                JSON.stringify(
                    result,
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
        `analysis-${result.id}.json`;

    document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(
        url
    );
}

/* =========================================================
   الانتقال إلى النتيجة
========================================================= */

function openFullAnalysisResult() {
    const id =
        AnalysisState
            .selectedAnalysisId ||
        analysisReadStorage(
            AnalysisStorageKeys.latestResult,
            {}
        )?.id;

    if (!id) {
        showAnalysisMessage(
            "ابدأ التحليل أولًا.",
            "warning"
        );

        return;
    }

    window.location.href =
        `idea result.html?id=${encodeURIComponent(
            id
        )}`;
}

/* =========================================================
   عدادات الحروف
========================================================= */

function updateCharacterCounters() {
    analysisSelectAll(
        "[data-analysis-counter]"
    ).forEach(
        (field) => {
            const counter =
                analysisGetElement(
                    field.dataset
                        .analysisCounter
                );

            if (!counter) {
                return;
            }

            const maximum =
                Number(
                    field.maxLength
                ) || 0;

            counter.textContent =
                maximum
                    ? `${field.value.length} / ${maximum}`
                    : field.value.length;
        }
    );
}

/* =========================================================
   ارتفاع مربعات النص
========================================================= */

function resizeAnalysisTextarea(field) {
    if (!field) {
        return;
    }

    field.style.height =
        "auto";

    field.style.height =
        `${Math.min(
            field.scrollHeight,
            240
        )}px`;
}

/* =========================================================
   إضافة التنسيقات
========================================================= */

function injectAnalysisStyles() {
    if (
        analysisGetElement(
            "projectJourneyAnalysisStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "projectJourneyAnalysisStyles";

    style.textContent = `
        .analysis-input-error {
            border-color: #dc3545 !important;
            box-shadow:
                0 0 0 4px
                rgba(220, 53, 69, 0.10) !important;
        }

        .analysis-field-error {
            min-height: 15px;
            color: #dc3545;
            font-size: 9px;
            line-height: 1.6;
        }

        .analysis-loading-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: grid;
            place-items: center;
            background:
                rgba(12, 28, 52, 0.72);
            backdrop-filter: blur(7px);
        }

        .analysis-loading-card {
            width:
                min(390px, calc(100% - 40px));
            padding: 32px;
            border-radius: 25px;
            text-align: center;
            background: #ffffff;
            box-shadow:
                0 30px 80px
                rgba(5, 26, 59, 0.34);
        }

        .analysis-loading-icon {
            width: 75px;
            height: 75px;
            margin:
                0 auto 17px;
            border-radius: 23px;
            display: grid;
            place-items: center;
            color: #ffffff;
            background:
                linear-gradient(
                    135deg,
                    #1565ff,
                    #7357db
                );
            font-size: 32px;
            animation:
                analysisFloatAnimation
                2s ease-in-out infinite;
        }

        .analysis-loading-card h3 {
            margin: 0;
            font-size: 20px;
        }

        .analysis-loading-card p {
            margin: 9px 0 0;
            color: #68758c;
            font-size: 11px;
            line-height: 1.8;
        }

        .analysis-loading-progress {
            height: 8px;
            margin-top: 20px;
            overflow: hidden;
            border-radius: 999px;
            background: #e6edf7;
        }

        .analysis-loading-progress::before {
            content: "";
            display: block;
            width: 45%;
            height: 100%;
            border-radius: inherit;
            background:
                linear-gradient(
                    90deg,
                    #1565ff,
                    #7357db
                );
            animation:
                analysisLoadingAnimation
                1.3s linear infinite;
        }

        .analysis-empty-state {
            padding: 35px 15px;
            border-radius: 15px;
            text-align: center;
            color: #68758c;
            background: #f8faff;
            border: 1px solid #dbe7f7;
            font-size: 10px;
        }

        .saved-analysis-card {
            padding: 14px;
            border-radius: 15px;
            display: grid;
            grid-template-columns:
                auto minmax(0, 1fr) auto;
            align-items: center;
            gap: 11px;
            background: #f8faff;
            border: 1px solid #dbe7f7;
        }

        .saved-analysis-card +
        .saved-analysis-card {
            margin-top: 9px;
        }

        .saved-analysis-score {
            width: 47px;
            height: 47px;
            border-radius: 15px;
            display: grid;
            place-items: center;
            color: #1565ff;
            background: #eaf2ff;
            font-size: 15px;
            font-weight: 900;
        }

        .saved-analysis-content {
            min-width: 0;
        }

        .saved-analysis-content h4 {
            margin: 0;
            font-size: 11px;
        }

        .saved-analysis-content p {
            margin: 5px 0 0;
            overflow: hidden;
            color: #68758c;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 8px;
        }

        .saved-analysis-content span {
            display: block;
            margin-top: 5px;
            color: #68758c;
            font-size: 8px;
        }

        .saved-analysis-actions {
            display: grid;
            gap: 5px;
        }

        .saved-analysis-actions button {
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

        .saved-analysis-actions button:last-child {
            color: #dc3545;
            background: #fff0f1;
        }

        .recommendation-card {
            padding: 14px;
            border-radius: 14px;
            display: grid;
            grid-template-columns:
                auto minmax(0, 1fr);
            gap: 10px;
            background: #f8faff;
            border: 1px solid #dbe7f7;
        }

        .recommendation-card +
        .recommendation-card {
            margin-top: 9px;
        }

        .recommendation-icon {
            width: 37px;
            height: 37px;
            border-radius: 12px;
            display: grid;
            place-items: center;
            color: #1565ff;
            background: #eaf2ff;
            font-weight: 900;
        }

        .priority-high
        .recommendation-icon {
            color: #dc3545;
            background: #fff0f1;
        }

        .recommendation-card h4 {
            margin: 0;
            font-size: 11px;
        }

        .recommendation-card p {
            margin: 5px 0 0;
            color: #68758c;
            font-size: 9px;
            line-height: 1.8;
        }

        .analysis-plan-step {
            padding: 14px;
            border-radius: 14px;
            display: grid;
            grid-template-columns:
                auto minmax(0, 1fr);
            gap: 11px;
            background: #f8faff;
            border: 1px solid #dbe7f7;
        }

        .analysis-plan-step +
        .analysis-plan-step {
            margin-top: 9px;
        }

        .analysis-plan-number {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            display: grid;
            place-items: center;
            color: #ffffff;
            background: #1565ff;
            font-size: 11px;
            font-weight: 900;
        }

        .analysis-plan-step h4 {
            margin: 0;
            font-size: 11px;
        }

        .analysis-plan-step p {
            margin: 5px 0 0;
            color: #68758c;
            font-size: 9px;
            line-height: 1.7;
        }

        .analysis-plan-step span {
            display: block;
            margin-top: 6px;
            color: #1565ff;
            font-size: 8px;
            font-weight: 800;
        }

        @keyframes analysisFloatAnimation {
            0%,
            100% {
                transform: translateY(0);
            }

            50% {
                transform: translateY(-9px);
            }
        }

        @keyframes analysisLoadingAnimation {
            from {
                transform: translateX(130%);
            }

            to {
                transform: translateX(-230%);
            }
        }

        @media (max-width: 600px) {
            .saved-analysis-card {
                grid-template-columns:
                    auto minmax(0, 1fr);
            }

            .saved-analysis-actions {
                grid-column: 1 / -1;
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
            }
        }
    `;

    document.head.appendChild(
        style
    );
}

/* =========================================================
   أحداث النموذج
========================================================= */

function initializeAnalysisFields() {
    analysisSelectAll(
        "input, textarea, select"
    ).forEach(
        (field) => {
            field.addEventListener(
                "input",
                () => {
                    field.classList.remove(
                        "analysis-input-error"
                    );

                    const error =
                        field.parentElement
                            ?.querySelector(
                                ".analysis-field-error, .field-error"
                            );

                    if (error) {
                        error.textContent =
                            "";
                    }

                    if (
                        field.matches(
                            "textarea"
                        )
                    ) {
                        resizeAnalysisTextarea(
                            field
                        );
                    }

                    updateCharacterCounters();
                }
            );

            field.addEventListener(
                "change",
                () => {
                    saveAnalysisDraft(false);
                }
            );
        }
    );
}

/* =========================================================
   ربط الأزرار
========================================================= */

function initializeAnalysisEvents() {
    analysisGetElement(
        "nextAnalysisStep"
    )?.addEventListener(
        "click",
        nextAnalysisStep
    );

    analysisGetElement(
        "previousAnalysisStep"
    )?.addEventListener(
        "click",
        previousAnalysisStep
    );

    analysisGetElement(
        "startAnalysisButton"
    )?.addEventListener(
        "click",
        startIdeaAnalysis
    );

    analysisGetElement(
        "saveAnalysisDraftButton"
    )?.addEventListener(
        "click",
        () => {
            saveAnalysisDraft(true);
        }
    );

    analysisGetElement(
        "clearAnalysisDraftButton"
    )?.addEventListener(
        "click",
        clearAnalysisDraft
    );

    analysisGetElement(
        "exportAnalysisButton"
    )?.addEventListener(
        "click",
        exportCurrentAnalysis
    );

    analysisGetElement(
        "openFullResultButton"
    )?.addEventListener(
        "click",
        openFullAnalysisResult
    );

    analysisSelectAll(
        "[data-go-to-analysis-step]"
    ).forEach(
        (button) => {
            button.addEventListener(
                "click",
                () => {
                    const targetStep =
                        Number(
                            button.dataset
                                .goToAnalysisStep
                        );

                    if (
                        targetStep <
                        AnalysisState.currentStep
                    ) {
                        setAnalysisStep(
                            targetStep
                        );

                        return;
                    }

                    for (
                        let step =
                            AnalysisState.currentStep;
                        step <
                            targetStep;
                        step += 1
                    ) {
                        if (
                            !validateAnalysisStep(
                                step
                            )
                        ) {
                            setAnalysisStep(
                                step
                            );

                            return;
                        }
                    }

                    setAnalysisStep(
                        targetStep
                    );
                }
            );
        }
    );

    window.addEventListener(
        "beforeunload",
        () => {
            saveAnalysisDraft(false);
        }
    );

    window.addEventListener(
        "storage",
        (event) => {
            if (
                event.key ===
                AnalysisStorageKeys.analyses
            ) {
                const analyses =
                    analysisReadStorage(
                        AnalysisStorageKeys.analyses,
                        []
                    );

                AnalysisState.analyses =
                    Array.isArray(
                        analyses
                    )
                        ? analyses
                        : [];

                renderSavedAnalyses();
                updateAnalysisStatistics();
            }

            if (
                event.key ===
                AnalysisStorageKeys.projects
            ) {
                const projects =
                    analysisReadStorage(
                        AnalysisStorageKeys.projects,
                        []
                    );

                AnalysisState.projects =
                    Array.isArray(
                        projects
                    )
                        ? projects
                        : [];
            }
        }
    );
}

/* =========================================================
   تشغيل الصفحة
========================================================= */

function initializeAnalysisPage() {
    injectAnalysisStyles();
    loadAnalysisData();
    initializeAnalysisFields();
    initializeAnalysisEvents();

    setAnalysisStep(
        AnalysisState.currentStep
    );

    analysisSelectAll(
        "textarea"
    ).forEach(
        (textarea) => {
            resizeAnalysisTextarea(
                textarea
            );
        }
    );

    document.body.classList.add(
        "analysis-page-ready"
    );

    document.dispatchEvent(
        new CustomEvent(
            "projectJourneyAnalysisReady",
            {
                detail: {
                    analysesCount:
                        AnalysisState
                            .analyses
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
        initializeAnalysisPage
    );
} else {
    initializeAnalysisPage();
}

/* =========================================================
   إتاحة الوظائف
========================================================= */

window.AnalysisState =
    AnalysisState;

window.startIdeaAnalysis =
    startIdeaAnalysis;

window.saveAnalysisDraft =
    saveAnalysisDraft;

window.clearAnalysisDraft =
    clearAnalysisDraft;

window.setAnalysisStep =
    setAnalysisStep;

window.nextAnalysisStep =
    nextAnalysisStep;

window.previousAnalysisStep =
    previousAnalysisStep;

window.createAnalysisResult =
    createAnalysisResult;

window.renderAnalysisResult =
    renderAnalysisResult;

window.exportCurrentAnalysis =
    exportCurrentAnalysis;

window.openFullAnalysisResult =
    openFullAnalysisResult;