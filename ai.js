"use strict";

/* =========================================================
   رحلة مشروع - Project Journey
   محرك المساعد الذكي والتحليل المحلي
   js/ai.js
========================================================= */

const AIState = {
    currentUser: null,
    conversations: [],
    projects: [],
    analyses: [],
    selectedConversationId: "",
    selectedProjectId: "",
    responseStyle: "simple",
    projectStage: "idea",
    language: "ar",
    isGenerating: false,
    selectedFile: null
};

const AIStorageKeys = {
    currentUser:
        "projectJourneyCurrentUser",

    conversations:
        "projectJourneyAssistantConversations",

    projects:
        "projectJourneyProjects",

    analyses:
        "projectJourneyAnalyses",

    settings:
        "projectJourneyAISettings",

    usage:
        "projectJourneyAIUsage",

    latestResponse:
        "projectJourneyLatestAIResponse"
};

/* =========================================================
   أدوات الوصول إلى العناصر
========================================================= */

function aiGetElement(id) {
    return document.getElementById(id);
}

function aiSelect(
    selector,
    parent
) {
    const root =
        parent || document;

    return root.querySelector(
        selector
    );
}

function aiSelectAll(
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
   التعامل مع LocalStorage
========================================================= */

function aiReadStorage(
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
            "AI storage read error:",
            error
        );

        return fallback;
    }
}

function aiSaveStorage(
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
            "AI storage save error:",
            error
        );

        aiShowMessage(
            "تعذر حفظ بيانات المساعد.",
            "error"
        );

        return false;
    }
}

/* =========================================================
   إنشاء المعرفات
========================================================= */

function aiCreateId(
    prefix
) {
    const selectedPrefix =
        prefix || "AI";

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
   معالجة النصوص
========================================================= */

function aiNormalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function aiEscapeHTML(value) {
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

function aiTruncateText(
    value,
    maximumLength
) {
    const text =
        String(value || "");

    const limit =
        Number(maximumLength) || 80;

    if (text.length <= limit) {
        return text;
    }

    return (
        text.slice(0, limit) +
        "..."
    );
}

function aiContainsAny(
    text,
    words
) {
    const normalizedText =
        aiNormalizeText(text);

    return words.some(
        function (word) {
            return normalizedText.includes(
                aiNormalizeText(word)
            );
        }
    );
}

function aiFormatText(value) {
    return aiEscapeHTML(value)
        .replace(/\n/g, "<br>");
}

/* =========================================================
   تنسيق الوقت والتاريخ
========================================================= */

function aiFormatTime(value) {
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

function aiFormatDate(value) {
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
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(date);
}

/* =========================================================
   عرض الرسائل
========================================================= */

function aiShowMessage(
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
   تحميل بيانات المساعد
========================================================= */

function loadAIData() {
    AIState.currentUser =
        aiReadStorage(
            AIStorageKeys.currentUser,
            null
        );

    const conversations =
        aiReadStorage(
            AIStorageKeys.conversations,
            []
        );

    const projects =
        aiReadStorage(
            AIStorageKeys.projects,
            []
        );

    const analyses =
        aiReadStorage(
            AIStorageKeys.analyses,
            []
        );

    const settings =
        aiReadStorage(
            AIStorageKeys.settings,
            {}
        );

    AIState.conversations =
        Array.isArray(conversations)
            ? conversations
            : [];

    AIState.projects =
        Array.isArray(projects)
            ? projects
            : [];

    AIState.analyses =
        Array.isArray(analyses)
            ? analyses
            : [];

    AIState.responseStyle =
        settings &&
        settings.responseStyle
            ? settings.responseStyle
            : "simple";

    AIState.projectStage =
        settings &&
        settings.projectStage
            ? settings.projectStage
            : "idea";

    AIState.language =
        settings &&
        settings.language
            ? settings.language
            : "ar";

    if (
        AIState.conversations.length ===
        0
    ) {
        createAIConversation(false);
    } else {
        AIState.selectedConversationId =
            AIState.conversations[0].id;

        AIState.selectedProjectId =
            AIState.conversations[0]
                .projectId ||
            "";
    }

    fillAISettings();
    renderAIProjects();
    renderAIConversations();
    renderAIMessages();
    updateAIUsage();
}

/* =========================================================
   إعدادات المساعد
========================================================= */

function fillAISettings() {
    const responseStyle =
        aiGetElement(
            "responseStyle"
        );

    const projectStage =
        aiGetElement(
            "projectStage"
        );

    const language =
        aiGetElement(
            "assistantLanguage"
        );

    if (responseStyle) {
        responseStyle.value =
            AIState.responseStyle;
    }

    if (projectStage) {
        projectStage.value =
            AIState.projectStage;
    }

    if (language) {
        language.value =
            AIState.language;
    }
}

function saveAISettings() {
    aiSaveStorage(
        AIStorageKeys.settings,
        {
            responseStyle:
                AIState.responseStyle,

            projectStage:
                AIState.projectStage,

            language:
                AIState.language,

            updatedAt:
                new Date()
                    .toISOString()
        }
    );
}

/* =========================================================
   إنشاء محادثة
========================================================= */

function createAIConversation(
    focusInput
) {
    const shouldFocus =
        focusInput !== false;

    const now =
        new Date()
            .toISOString();

    const conversation = {
        id:
            aiCreateId(
                "AI-CONVERSATION"
            ),

        userId:
            AIState.currentUser &&
            AIState.currentUser.id
                ? AIState.currentUser.id
                : "guest",

        title:
            "محادثة جديدة",

        messages:
            [],

        projectId:
            AIState.selectedProjectId ||
            "",

        createdAt:
            now,

        updatedAt:
            now
    };

    AIState.conversations.unshift(
        conversation
    );

    AIState.selectedConversationId =
        conversation.id;

    saveAIConversations();
    renderAIConversations();
    renderAIMessages();

    const layout =
        aiGetElement(
            "assistantLayout"
        );

    if (layout) {
        layout.classList.add(
            "chat-open"
        );
    }

    if (shouldFocus) {
        window.setTimeout(
            function () {
                const input =
                    aiGetElement(
                        "messageInput"
                    );

                if (input) {
                    input.focus();
                }
            },
            80
        );
    }

    return conversation;
}

function saveAIConversations() {
    return aiSaveStorage(
        AIStorageKeys.conversations,
        AIState.conversations
    );
}

function getSelectedAIConversation() {
    return AIState.conversations.find(
        function (conversation) {
            return (
                conversation.id ===
                AIState.selectedConversationId
            );
        }
    );
}

function selectAIConversation(
    conversationId
) {
    const conversation =
        AIState.conversations.find(
            function (item) {
                return (
                    item.id ===
                    conversationId
                );
            }
        );

    if (!conversation) {
        return;
    }

    AIState.selectedConversationId =
        conversation.id;

    AIState.selectedProjectId =
        conversation.projectId ||
        "";

    renderAIConversations();
    renderAIMessages();
    updateSelectedProjectField();

    const layout =
        aiGetElement(
            "assistantLayout"
        );

    if (layout) {
        layout.classList.add(
            "chat-open"
        );
    }
}

/* =========================================================
   حذف المحادثات
========================================================= */

function deleteAIConversation(
    conversationId
) {
    const conversation =
        AIState.conversations.find(
            function (item) {
                return (
                    item.id ===
                    conversationId
                );
            }
        );

    if (!conversation) {
        return;
    }

    const confirmed =
        window.confirm(
            'هل تريد حذف المحادثة "' +
            conversation.title +
            '"؟'
        );

    if (!confirmed) {
        return;
    }

    AIState.conversations =
        AIState.conversations.filter(
            function (item) {
                return (
                    item.id !==
                    conversationId
                );
            }
        );

    if (
        AIState.selectedConversationId ===
        conversationId
    ) {
        if (
            AIState.conversations.length >
            0
        ) {
            AIState.selectedConversationId =
                AIState.conversations[0].id;
        } else {
            AIState.selectedConversationId =
                "";
        }
    }

    if (
        AIState.conversations.length ===
        0
    ) {
        createAIConversation(false);
    } else {
        saveAIConversations();
        renderAIConversations();
        renderAIMessages();
    }

    aiShowMessage(
        "تم حذف المحادثة.",
        "success"
    );
}

function clearCurrentAIConversation() {
    const conversation =
        getSelectedAIConversation();

    if (!conversation) {
        return;
    }

    const confirmed =
        window.confirm(
            "هل تريد مسح جميع رسائل المحادثة الحالية؟"
        );

    if (!confirmed) {
        return;
    }

    conversation.messages = [];

    conversation.title =
        "محادثة جديدة";

    conversation.updatedAt =
        new Date()
            .toISOString();

    saveAIConversations();
    renderAIConversations();
    renderAIMessages();

    aiShowMessage(
        "تم مسح المحادثة.",
        "success"
    );
}

function deleteAllAIConversations() {
    const confirmed =
        window.confirm(
            "هل تريد حذف جميع المحادثات؟"
        );

    if (!confirmed) {
        return;
    }

    AIState.conversations = [];

    AIState.selectedConversationId =
        "";

    saveAIConversations();

    createAIConversation(false);

    aiShowMessage(
        "تم حذف جميع المحادثات.",
        "success"
    );
}

/* =========================================================
   عرض قائمة المحادثات
========================================================= */

function renderAIConversations() {
    const container =
        aiGetElement(
            "conversationsList"
        );

    if (!container) {
        return;
    }

    const searchInput =
        aiGetElement(
            "conversationSearchInput"
        );

    const searchValue =
        searchInput
            ? aiNormalizeText(
                searchInput.value
            )
            : "";

    const conversations =
        AIState.conversations
            .filter(
                function (conversation) {
                    const messages =
                        Array.isArray(
                            conversation.messages
                        )
                            ? conversation.messages
                            : [];

                    const content =
                        aiNormalizeText(
                            [
                                conversation.title,
                                messages
                                    .map(
                                        function (
                                            message
                                        ) {
                                            return (
                                                message.text ||
                                                ""
                                            );
                                        }
                                    )
                                    .join(" ")
                            ].join(" ")
                        );

                    return content.includes(
                        searchValue
                    );
                }
            )
            .sort(
                function (
                    first,
                    second
                ) {
                    return (
                        new Date(
                            second.updatedAt
                        ) -
                        new Date(
                            first.updatedAt
                        )
                    );
                }
            );

    container.innerHTML = "";

    if (
        conversations.length ===
        0
    ) {
        container.innerHTML = `
            <div class="ai-empty-conversations">
                لا توجد محادثات مطابقة.
            </div>
        `;

        return;
    }

    conversations.forEach(
        function (conversation) {
            const messages =
                Array.isArray(
                    conversation.messages
                )
                    ? conversation.messages
                    : [];

            const lastMessage =
                messages.length > 0
                    ? messages[
                        messages.length - 1
                    ]
                    : null;

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "conversation-item";

            if (
                conversation.id ===
                AIState.selectedConversationId
            ) {
                button.classList.add(
                    "active"
                );
            }

            const lastMessageText =
                lastMessage &&
                lastMessage.text
                    ? aiTruncateText(
                        lastMessage.text,
                        45
                    )
                    : "لا توجد رسائل";

            button.innerHTML = `
                <span class="conversation-icon">
                    💬
                </span>

                <span class="conversation-content">

                    <strong>
                        ${aiEscapeHTML(
                            conversation.title
                        )}
                    </strong>

                    <small>
                        ${aiEscapeHTML(
                            lastMessageText
                        )}
                    </small>

                </span>

                <span
                    class="conversation-delete"
                    data-delete-conversation="${aiEscapeHTML(
                        conversation.id
                    )}"
                    title="حذف المحادثة"
                >
                    ×
                </span>
            `;

            button.addEventListener(
                "click",
                function (event) {
                    const deleteButton =
                        event.target.closest(
                            "[data-delete-conversation]"
                        );

                    if (deleteButton) {
                        event.stopPropagation();

                        deleteAIConversation(
                            conversation.id
                        );

                        return;
                    }

                    selectAIConversation(
                        conversation.id
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
   إنشاء الرسائل
========================================================= */

function createAIMessage(
    role,
    text,
    extra
) {
    const options =
        extra || {};

    return {
        id:
            aiCreateId(
                "AI-MESSAGE"
            ),

        role:
            role,

        text:
            text,

        analysis:
            options.analysis ||
            null,

        suggestions:
            Array.isArray(
                options.suggestions
            )
                ? options.suggestions
                : [],

        fileName:
            options.fileName ||
            "",

        createdAt:
            new Date()
                .toISOString()
    };
}

function addAIMessage(
    role,
    text,
    extra
) {
    let conversation =
        getSelectedAIConversation();

    if (!conversation) {
        conversation =
            createAIConversation(false);
    }

    if (
        !Array.isArray(
            conversation.messages
        )
    ) {
        conversation.messages = [];
    }

    const message =
        createAIMessage(
            role,
            text,
            extra
        );

    conversation.messages.push(
        message
    );

    if (
        conversation.title ===
            "محادثة جديدة" &&
        role === "user"
    ) {
        conversation.title =
            aiTruncateText(
                text,
                45
            );
    }

    conversation.updatedAt =
        new Date()
            .toISOString();

    saveAIConversations();

    return message;
}

/* =========================================================
   عرض الرسائل
========================================================= */

function renderAIMessages() {
    const container =
        aiGetElement(
            "messagesArea"
        );

    if (!container) {
        return;
    }

    const conversation =
        getSelectedAIConversation();

    container.innerHTML = "";

    if (
        !conversation ||
        !Array.isArray(
            conversation.messages
        ) ||
        conversation.messages.length ===
            0
    ) {
        renderAIWelcome(
            container
        );

        return;
    }

    conversation.messages.forEach(
        function (message) {
            container.appendChild(
                createAIMessageElement(
                    message
                )
            );
        }
    );

    container.scrollTop =
        container.scrollHeight;
}

function renderAIWelcome(container) {
    const welcome =
        document.createElement(
            "section"
        );

    welcome.className =
        "ai-welcome-card";

    welcome.innerHTML = `
        <div class="ai-welcome-icon">
            🤖
        </div>

        <h2>
            كيف يمكنني مساعدتك؟
        </h2>

        <p>
            اكتب سؤالك عن فكرة المشروع أو السوق
            أو العملاء أو الخطة أو المخاطر.
        </p>

        <div class="ai-welcome-options">

            <button
                type="button"
                data-ai-prompt="حلل فكرة مشروعي وحدد نقاط القوة والضعف."
            >
                💡 تحليل فكرة المشروع
            </button>

            <button
                type="button"
                data-ai-prompt="ساعدني في تحديد العملاء المستهدفين."
            >
                🎯 تحديد العملاء
            </button>

            <button
                type="button"
                data-ai-prompt="أنشئ خطة أولية لتنفيذ المشروع."
            >
                📋 إنشاء خطة تنفيذ
            </button>

            <button
                type="button"
                data-ai-prompt="حدد مخاطر المشروع واقترح حلولًا لها."
            >
                ⚠️ تحليل المخاطر
            </button>

        </div>
    `;

    container.appendChild(
        welcome
    );

    bindAIPromptButtons(
        welcome
    );
}

function createAIMessageElement(
    message
) {
    const element =
        document.createElement(
            "article"
        );

    element.className =
        "ai-message ai-message-" +
        message.role;

    const avatar =
        message.role === "user"
            ? getAIUserInitials()
            : "🤖";

    element.innerHTML = `
        <div class="ai-message-avatar">
            ${aiEscapeHTML(avatar)}
        </div>

        <div class="ai-message-content">

            <div class="ai-message-bubble">

                <p>
                    ${aiFormatText(
                        message.text
                    )}
                </p>

                ${
                    message.fileName
                        ? `
                            <div class="ai-message-file">
                                📎
                                ${aiEscapeHTML(
                                    message.fileName
                                )}
                            </div>
                        `
                        : ""
                }

                ${
                    message.analysis
                        ? createAIAnalysisHTML(
                            message.analysis
                        )
                        : ""
                }

                ${
                    Array.isArray(
                        message.suggestions
                    ) &&
                    message.suggestions.length >
                        0
                        ? createAISuggestionsHTML(
                            message.suggestions
                        )
                        : ""
                }

            </div>

            <div class="ai-message-meta">

                <span>
                    ${aiFormatTime(
                        message.createdAt
                    )}
                </span>

                <button
                    type="button"
                    data-copy-ai-message="${aiEscapeHTML(
                        message.id
                    )}"
                >
                    نسخ
                </button>

            </div>

        </div>
    `;

    const copyButton =
        element.querySelector(
            "[data-copy-ai-message]"
        );

    if (copyButton) {
        copyButton.addEventListener(
            "click",
            function () {
                copyAIText(
                    message.text
                );
            }
        );
    }

    bindAIPromptButtons(
        element
    );

    return element;
}

function createAIAnalysisHTML(
    analysis
) {
    if (!analysis) {
        return "";
    }

    const items =
        Array.isArray(
            analysis.items
        )
            ? analysis.items
            : [];

    return `
        <div class="ai-analysis-box">

            <strong>
                ${aiEscapeHTML(
                    analysis.title ||
                    "ملخص التحليل"
                )}
            </strong>

            <ul>
                ${items
                    .map(
                        function (item) {
                            return `
                                <li>
                                    ${aiEscapeHTML(
                                        item
                                    )}
                                </li>
                            `;
                        }
                    )
                    .join("")}
            </ul>

        </div>
    `;
}

function createAISuggestionsHTML(
    suggestions
) {
    return `
        <div class="ai-response-suggestions">

            ${suggestions
                .map(
                    function (suggestion) {
                        return `
                            <button
                                type="button"
                                data-ai-prompt="${aiEscapeHTML(
                                    suggestion
                                )}"
                            >
                                ${aiEscapeHTML(
                                    suggestion
                                )}
                            </button>
                        `;
                    }
                )
                .join("")}

        </div>
    `;
}

/* =========================================================
   معلومات المستخدم
========================================================= */

function getAIUserInitials() {
    let name = "أنا";

    if (AIState.currentUser) {
        name =
            AIState.currentUser.fullName ||
            AIState.currentUser.name ||
            "أنا";
    }

    return String(name)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            function (part) {
                return part.charAt(0);
            }
        )
        .join("");
}

/* =========================================================
   إرسال الرسالة
========================================================= */

function sendAIMessage() {
    if (
        AIState.isGenerating ===
        true
    ) {
        return;
    }

    const input =
        aiGetElement(
            "messageInput"
        );

    if (!input) {
        aiShowMessage(
            "لم يتم العثور على حقل الرسالة.",
            "error"
        );

        return;
    }

    const text =
        String(
            input.value || ""
        ).trim();

    if (text.length === 0) {
        aiShowMessage(
            "اكتب سؤالك أولًا.",
            "warning"
        );

        input.focus();

        return;
    }

    let selectedFileName = "";

    if (
        AIState.selectedFile &&
        AIState.selectedFile.name
    ) {
        selectedFileName =
            AIState.selectedFile.name;
    }

    addAIMessage(
        "user",
        text,
        {
            fileName:
                selectedFileName
        }
    );

    input.value = "";

    input.style.height =
        "auto";

    clearAISelectedFile();

    updateAIMessageCounter();

    renderAIConversations();

    renderAIMessages();

    generateAIResponse(text);
}

/* =========================================================
   توليد رد المساعد
========================================================= */

function generateAIResponse(
    userText
) {
    AIState.isGenerating =
        true;

    setAISendState(true);

    showAITypingIndicator();

    const delay =
        AIState.responseStyle ===
        "detailed"
            ? 1300
            : 850;

    window.setTimeout(
        function () {
            const response =
                buildAIResponse(
                    userText
                );

            removeAITypingIndicator();

            addAIMessage(
                "assistant",
                response.text,
                {
                    analysis:
                        response.analysis,

                    suggestions:
                        response.suggestions
                }
            );

            aiSaveStorage(
                AIStorageKeys.latestResponse,
                response
            );

            AIState.isGenerating =
                false;

            setAISendState(false);

            recordAIUsage();

            renderAIConversations();

            renderAIMessages();
        },
        delay
    );
}

/* =========================================================
   تحديد نوع السؤال
========================================================= */

function buildAIResponse(
    userText
) {
    const text =
        aiNormalizeText(
            userText
        );

    const project =
        getSelectedAIProject();

    if (
        aiContainsAny(
            text,
            [
                "swot",
                "نقاط القوة",
                "نقاط الضعف",
                "تحليل رباعي"
            ]
        )
    ) {
        return generateSWOTResponse(
            project,
            userText
        );
    }

    if (
        aiContainsAny(
            text,
            [
                "عملاء",
                "العميل",
                "الجمهور",
                "مستهدف"
            ]
        )
    ) {
        return generateCustomerResponse(
            project
        );
    }

    if (
        aiContainsAny(
            text,
            [
                "سوق",
                "منافس",
                "المنافسين"
            ]
        )
    ) {
        return generateMarketResponse(
            project
        );
    }

    if (
        aiContainsAny(
            text,
            [
                "خطة",
                "تنفيذ",
                "خطوات",
                "مراحل"
            ]
        )
    ) {
        return generatePlanResponse(
            project
        );
    }

    if (
        aiContainsAny(
            text,
            [
                "مخاطر",
                "خطر",
                "فشل",
                "تهديد"
            ]
        )
    ) {
        return generateRiskResponse(
            project
        );
    }

    if (
        aiContainsAny(
            text,
            [
                "تكلفة",
                "ميزانية",
                "مال",
                "ربح",
                "إيراد"
            ]
        )
    ) {
        return generateFinanceResponse(
            project
        );
    }

    if (
        aiContainsAny(
            text,
            [
                "اسم",
                "تسمية",
                "شعار"
            ]
        )
    ) {
        return generateBrandResponse(
            project
        );
    }

    if (
        aiContainsAny(
            text,
            [
                "حلل",
                "فكرة",
                "مشروعي"
            ]
        )
    ) {
        return generateIdeaResponse(
            project,
            userText
        );
    }

    return generateGeneralResponse(
        project,
        userText
    );
}

/* =========================================================
   رد تحليل الفكرة
========================================================= */

function generateIdeaResponse(
    project,
    userText
) {
    let projectName =
        extractProjectName(
            userText
        ) ||
        "المشروع";

    let description =
        userText;

    if (project) {
        projectName =
            project.name ||
            project.title ||
            projectName;

        description =
            project.description ||
            project.idea ||
            userText;
    }

    const clarity =
        calculateTextClarity(
            description
        );

    return {
        text:
            "التحليل الأولي لفكرة " +
            projectName +
            ": الفكرة قابلة للتطوير، لكن نجاحها يعتمد على وضوح المشكلة والعميل والقيمة التي تقدمها. درجة وضوح الوصف الحالية تقريبًا " +
            clarity +
            " من 100.",

        analysis: {
            title:
                "العناصر التي يجب تثبيتها",

            items: [
                "المشكلة التي يعاني منها العميل.",
                "الحل الذي يقدمه المشروع.",
                "العميل الأكثر احتياجًا للحل.",
                "الميزة التي تميز المشروع عن المنافسين.",
                "طريقة تحقيق الإيرادات."
            ]
        },

        suggestions: [
            "ساعدني في تحديد العملاء المستهدفين.",
            "حلل المنافسين المحتملين.",
            "أنشئ خطة أولية للمشروع."
        ]
    };
}

function extractProjectName(text) {
    const match =
        String(text || "")
            .match(
                /(?:اسم المشروع|مشروعي هو|فكرتي هي)\s*[:\-]?\s*([^\n،,.]{3,40})/i
            );

    if (match && match[1]) {
        return match[1].trim();
    }

    return "";
}

function calculateTextClarity(text) {
    const value =
        String(text || "")
            .trim();

    let score = 30;

    if (value.length >= 30) {
        score += 15;
    }

    if (value.length >= 80) {
        score += 15;
    }

    if (value.length >= 150) {
        score += 10;
    }

    if (
        aiContainsAny(
            value,
            [
                "مشكلة",
                "حل",
                "عميل",
                "سوق",
                "خدمة",
                "منتج"
            ]
        )
    ) {
        score += 20;
    }

    return Math.min(
        score,
        100
    );
}

/* =========================================================
   رد العملاء
========================================================= */

function generateCustomerResponse(
    project
) {
    let knownCustomers = "";

    if (project) {
        knownCustomers =
            project.targetCustomers ||
            project.customers ||
            "";
    }

    let responseText =
        "لتحديد العملاء المستهدفين، ابدأ بمن يعاني من المشكلة أكثر من غيره، ثم صف عمره وموقعه ودخله وسلوكه وسبب شرائه.";

    if (knownCustomers) {
        responseText =
            "العملاء المحددون حاليًا هم: " +
            knownCustomers +
            ". أنصح بتقسيمهم إلى شريحة رئيسية وشريحة ثانوية، ثم اختبار المشروع أولًا مع الشريحة الأكثر احتياجًا.";
    }

    return {
        text:
            responseText,

        analysis: {
            title:
                "بطاقة العميل المستهدف",

            items: [
                "العمر والفئة.",
                "الموقع الجغرافي.",
                "المشكلة الأساسية.",
                "القدرة على الدفع.",
                "مكان البحث عن الحل.",
                "سبب اختيار مشروعك."
            ]
        },

        suggestions: [
            "أنشئ لي شخصية عميل نموذجية.",
            "كيف أختبر حاجة العملاء؟",
            "ما أفضل قناة للوصول إلى العملاء؟"
        ]
    };
}

/* =========================================================
   رد السوق
========================================================= */

function generateMarketResponse(
    project
) {
    let market =
        "السوق المستهدف";

    if (project) {
        market =
            project.targetMarket ||
            project.market ||
            market;
    }

    return {
        text:
            "لدراسة " +
            market +
            "، قارن بين حجم الطلب والمنافسين والأسعار وسهولة الوصول إلى العملاء. لا تعتمد على عدد المنافسين فقط؛ وجود المنافسين قد يعني وجود طلب حقيقي.",

        analysis: {
            title:
                "خطوات دراسة السوق",

            items: [
                "تحديد حجم المشكلة وعدد العملاء المحتملين.",
                "اختيار ثلاثة منافسين مباشرين.",
                "مقارنة الأسعار والمميزات.",
                "تحديد الفجوة الموجودة في السوق.",
                "اختبار الفكرة مع عملاء حقيقيين."
            ]
        },

        suggestions: [
            "أنشئ جدول مقارنة للمنافسين.",
            "كيف أحدد حجم السوق؟",
            "ما الميزة التنافسية المناسبة؟"
        ]
    };
}

/* =========================================================
   رد الخطة
========================================================= */

function generatePlanResponse(
    project
) {
    let name =
        "المشروع";

    if (project) {
        name =
            project.name ||
            project.title ||
            name;
    }

    const stage =
        getAIStageLabel(
            AIState.projectStage
        );

    return {
        text:
            "بما أن " +
            name +
            " في مرحلة " +
            stage +
            "، ابدأ بخطة قصيرة قابلة للقياس بدل خطة كبيرة. قسّم العمل إلى مهام أسبوعية، وحدد نتيجة واضحة لكل مهمة.",

        analysis: {
            title:
                "خطة تنفيذ أولية",

            items: [
                "الأسبوع الأول: التحقق من المشكلة.",
                "الأسبوع الثاني: دراسة العملاء والمنافسين.",
                "الأسبوع الثالث: إعداد نموذج أولي.",
                "الأسبوع الرابع: تجربة النموذج مع العملاء.",
                "الأسبوع الخامس: التحسين والاستعداد للإطلاق."
            ]
        },

        suggestions: [
            "قسّم الخطة إلى مهام يومية.",
            "حدد ميزانية كل مرحلة.",
            "أنشئ مؤشرات لقياس التقدم."
        ]
    };
}

/* =========================================================
   رد المخاطر
========================================================= */

function generateRiskResponse(
    project
) {
    let category =
        "general";

    if (project) {
        category =
            project.category ||
            project.type ||
            category;
    }

    return {
        text:
            "يجب ترتيب المخاطر حسب الاحتمال والتأثير. لا تحاول إزالة جميع المخاطر، بل ضع إجراءً وقائيًا وخطة بديلة لكل خطر مهم.",

        analysis: {
            title:
                "المخاطر الرئيسية للمجال: " +
                getAICategoryLabel(
                    category
                ),

            items: [
                "ضعف الطلب على المنتج أو الخدمة.",
                "ارتفاع التكاليف عن الميزانية.",
                "ظهور منافسين أقوى.",
                "تأخر التنفيذ أو ضعف الفريق.",
                "عدم رضا العملاء عن النسخة الأولى."
            ]
        },

        suggestions: [
            "أنشئ سجل مخاطر كامل.",
            "كيف أقلل المخاطر المالية؟",
            "رتب المخاطر حسب الأولوية."
        ]
    };
}

/* =========================================================
   الرد المالي
========================================================= */

function generateFinanceResponse(
    project
) {
    let budget = 0;

    if (project) {
        budget =
            Number(
                project.budget ||
                project.estimatedBudget ||
                0
            );
    }

    let responseText =
        "ابدأ بتقدير تكاليف التأسيس والتشغيل والتسويق. بعد ذلك حدد سعر البيع وهامش الربح ونقطة التعادل.";

    if (budget > 0) {
        responseText =
            "الميزانية الحالية المسجلة هي " +
            budget +
            ". قسّمها إلى تأسيس وتشغيل وتسويق واحتياطي، ثم احسب عدد المبيعات اللازمة لتغطية المصروفات.";
    }

    return {
        text:
            responseText,

        analysis: {
            title:
                "عناصر التقدير المالي",

            items: [
                "تكاليف التأسيس.",
                "المصروفات الشهرية.",
                "سعر المنتج أو الخدمة.",
                "عدد المبيعات المتوقع.",
                "هامش الربح.",
                "نقطة التعادل.",
                "احتياطي الطوارئ."
            ]
        },

        suggestions: [
            "احسب لي نقطة التعادل.",
            "أنشئ ميزانية شهرية.",
            "كيف أحدد سعر البيع؟"
        ]
    };
}

/* =========================================================
   رد الاسم والهوية
========================================================= */

function generateBrandResponse(
    project
) {
    let name = "";

    if (project) {
        name =
            project.name ||
            project.title ||
            "";
    }

    let responseText =
        "اختر اسمًا قصيرًا وسهل النطق ويرتبط بالمشكلة أو النتيجة التي يقدمها المشروع.";

    if (name) {
        responseText =
            'اسم "' +
            name +
            '" يجب أن يكون سهل النطق والتذكر، ويرتبط بقيمة المشروع. اختبره مع عدة أشخاص وتأكد من وضوح معناه.';
    }

    return {
        text:
            responseText,

        analysis: {
            title:
                "معايير اختيار الاسم",

            items: [
                "قصير وسهل التذكر.",
                "واضح في النطق والكتابة.",
                "غير مشابه لمنافس معروف.",
                "قابل للاستخدام في الشعار.",
                "يناسب التوسع مستقبلًا."
            ]
        },

        suggestions: [
            "اقترح أسماء لمشروعي.",
            "اكتب شعارًا تسويقيًا.",
            "حدد دلالات الهوية البصرية."
        ]
    };
}

/* =========================================================
   تحليل SWOT
========================================================= */

function generateSWOTResponse(
    project,
    userText
) {
    let description =
        userText;

    if (project) {
        description =
            project.description ||
            project.idea ||
            userText;
    }

    const strengthText =
        description.length > 60
            ? "الفكرة موضحة بصورة جيدة."
            : "يمكن تطوير الفكرة تدريجيًا.";

    return {
        text:
            "هذا تحليل SWOT أولي. يجب تعديله بعد إجراء مقابلات مع العملاء ودراسة المنافسين الحقيقيين.",

        analysis: {
            title:
                "تحليل SWOT",

            items: [
                "القوة: " +
                strengthText,

                "الضعف: الحاجة إلى معلومات أكثر عن السوق والتكاليف.",

                "الفرصة: اختبار نموذج أولي والوصول للعملاء عبر القنوات الرقمية.",

                "التهديد: المنافسة وارتفاع التكاليف وتغير احتياجات العملاء."
            ]
        },

        suggestions: [
            "وسع نقاط القوة والضعف.",
            "أنشئ خطة لمعالجة نقاط الضعف.",
            "رتب الفرص حسب أهميتها."
        ]
    };
}

/* =========================================================
   الرد العام
========================================================= */

function generateGeneralResponse(
    project,
    userText
) {
    const stage =
        getAIStageLabel(
            AIState.projectStage
        );

    const style =
        getAIStyleLabel(
            AIState.responseStyle
        );

    return {
        text:
            'فهمت سؤالك: "' +
            aiTruncateText(
                userText,
                100
            ) +
            '". سأتعامل معه ' +
            style +
            " وبما يناسب مرحلة " +
            stage +
            ". للحصول على إجابة أدق، اكتب المشكلة والحل والعميل والسوق والميزانية.",

        analysis: {
            title:
                "المعلومات المطلوبة",

            items: [
                "وصف مختصر لفكرة المشروع.",
                "المشكلة التي يحلها.",
                "العملاء المستهدفون.",
                "طريقة تحقيق الإيرادات.",
                "المرحلة الحالية للمشروع."
            ]
        },

        suggestions: [
            "حلل فكرة المشروع.",
            "حدد العملاء المستهدفين.",
            "أنشئ خطة تنفيذ."
        ]
    };
}

/* =========================================================
   أسماء الأنماط والمراحل
========================================================= */

function getAIStyleLabel(style) {
    const labels = {
        simple:
            "بشكل مبسط",

        detailed:
            "بتفصيل أكبر",

        professional:
            "بأسلوب احترافي"
    };

    return labels[style] ||
        labels.simple;
}

function getAIStageLabel(stage) {
    const labels = {
        idea:
            "الفكرة",

        analysis:
            "التحليل",

        planning:
            "التخطيط",

        execution:
            "التنفيذ",

        growth:
            "التطوير"
    };

    return labels[stage] ||
        labels.idea;
}

function getAICategoryLabel(category) {
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
            "الإبداع",

        food:
            "الأغذية",

        transport:
            "النقل",

        construction:
            "البناء",

        education:
            "التعليم",

        general:
            "عام"
    };

    return labels[category] ||
        labels.general;
}

/* =========================================================
   مؤشر الكتابة
========================================================= */

function showAITypingIndicator() {
    const container =
        aiGetElement(
            "messagesArea"
        );

    if (!container) {
        return;
    }

    removeAITypingIndicator();

    const typing =
        document.createElement(
            "div"
        );

    typing.id =
        "aiTypingIndicator";

    typing.className =
        "ai-typing-indicator";

    typing.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    container.appendChild(
        typing
    );

    container.scrollTop =
        container.scrollHeight;
}

function removeAITypingIndicator() {
    const typing =
        aiGetElement(
            "aiTypingIndicator"
        );

    if (typing) {
        typing.remove();
    }
}

function setAISendState(loading) {
    const button =
        aiGetElement(
            "sendMessageButton"
        );

    if (!button) {
        return;
    }

    button.disabled =
        Boolean(loading);

    button.textContent =
        loading
            ? "…"
            : "➤";
}

/* =========================================================
   قائمة المشاريع
========================================================= */

function renderAIProjects() {
    const select =
        aiGetElement(
            "assistantProjectSelect"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            بدون مشروع محدد
        </option>
    `;

    AIState.projects.forEach(
        function (project) {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                project.id ||
                "";

            option.textContent =
                project.name ||
                project.title ||
                "مشروع بدون اسم";

            select.appendChild(
                option
            );
        }
    );

    updateSelectedProjectField();
}

function updateSelectedProjectField() {
    const select =
        aiGetElement(
            "assistantProjectSelect"
        );

    if (select) {
        select.value =
            AIState.selectedProjectId ||
            "";
    }
}

function getSelectedAIProject() {
    return (
        AIState.projects.find(
            function (project) {
                return (
                    project.id ===
                    AIState.selectedProjectId
                );
            }
        ) ||
        null
    );
}

function changeAIProject(
    projectId
) {
    AIState.selectedProjectId =
        projectId || "";

    const conversation =
        getSelectedAIConversation();

    if (conversation) {
        conversation.projectId =
            AIState.selectedProjectId;

        conversation.updatedAt =
            new Date()
                .toISOString();

        saveAIConversations();
    }
}

/* =========================================================
   التعامل مع الملفات
========================================================= */

function handleAIFile(file) {
    if (!file) {
        return;
    }

    const maximumSize =
        10 *
        1024 *
        1024;

    if (
        file.size >
        maximumSize
    ) {
        aiShowMessage(
            "يجب ألا يتجاوز حجم الملف 10 ميجابايت.",
            "warning"
        );

        return;
    }

    AIState.selectedFile =
        file;

    const preview =
        aiGetElement(
            "selectedFilePreview"
        );

    const nameElement =
        aiGetElement(
            "selectedFileName"
        );

    if (nameElement) {
        nameElement.textContent =
            "📎 " +
            String(
                file.name || "ملف"
            );
    }

    if (preview) {
        preview.hidden =
            false;
    }

    const fileName =
        String(file.name || "")
            .toLowerCase();

    const isTextFile =
        file.type ===
            "text/plain" ||
        fileName.endsWith(
            ".txt"
        );

    if (!isTextFile) {
        return;
    }

    const reader =
        new FileReader();

    reader.onload =
        function () {
            const input =
                aiGetElement(
                    "messageInput"
                );

            if (!input) {
                return;
            }

            const fileContent =
                String(
                    reader.result || ""
                ).slice(
                    0,
                    5000
                );

            const currentText =
                String(
                    input.value || ""
                ).trim();

            if (currentText) {
                input.value =
                    currentText +
                    "\n\nمحتوى الملف:\n" +
                    fileContent;
            } else {
                input.value =
                    "محتوى الملف:\n" +
                    fileContent;
            }

            resizeAITextarea();

            updateAIMessageCounter();
        };

    reader.onerror =
        function () {
            aiShowMessage(
                "تعذر قراءة الملف.",
                "error"
            );
        };

    reader.readAsText(file);
}

function clearAISelectedFile() {
    AIState.selectedFile =
        null;

    const attachmentInput =
        aiGetElement(
            "attachmentInput"
        );

    const selectedFilePreview =
        aiGetElement(
            "selectedFilePreview"
        );

    const selectedFileName =
        aiGetElement(
            "selectedFileName"
        );

    if (attachmentInput) {
        attachmentInput.value =
            "";
    }

    if (selectedFilePreview) {
        selectedFilePreview.hidden =
            true;
    }

    if (selectedFileName) {
        selectedFileName.textContent =
            "";
    }
}

/* =========================================================
   حقل الرسالة
========================================================= */

function resizeAITextarea() {
    const input =
        aiGetElement(
            "messageInput"
        );

    if (!input) {
        return;
    }

    input.style.height =
        "auto";

    input.style.height =
        Math.min(
            input.scrollHeight,
            140
        ) +
        "px";
}

function updateAIMessageCounter() {
    const input =
        aiGetElement(
            "messageInput"
        );

    const counter =
        aiGetElement(
            "messageCounter"
        );

    if (
        !input ||
        !counter
    ) {
        return;
    }

    const maximum =
        Number(
            input.maxLength
        ) || 3000;

    counter.textContent =
        input.value.length +
        " / " +
        maximum;
}

/* =========================================================
   الاقتراحات الجاهزة
========================================================= */

function bindAIPromptButtons(
    root
) {
    const parent =
        root || document;

    aiSelectAll(
        "[data-ai-prompt]",
        parent
    ).forEach(
        function (button) {
            if (
                button.getAttribute(
                    "data-ai-bound"
                ) === "true"
            ) {
                return;
            }

            button.setAttribute(
                "data-ai-bound",
                "true"
            );

            button.addEventListener(
                "click",
                function () {
                    const input =
                        aiGetElement(
                            "messageInput"
                        );

                    if (!input) {
                        return;
                    }

                    input.value =
                        button.getAttribute(
                            "data-ai-prompt"
                        ) || "";

                    resizeAITextarea();

                    updateAIMessageCounter();

                    input.focus();
                }
            );
        }
    );
}

/* =========================================================
   النسخ والتصدير
========================================================= */

function copyAIText(text) {
    if (
        typeof window.copyText ===
        "function"
    ) {
        window.copyText(
            text,
            "تم نسخ الرد."
        );

        return;
    }

    if (
        !navigator.clipboard
    ) {
        aiShowMessage(
            "ميزة النسخ غير مدعومة.",
            "error"
        );

        return;
    }

    navigator.clipboard
        .writeText(
            String(text || "")
        )
        .then(
            function () {
                aiShowMessage(
                    "تم نسخ الرد.",
                    "success"
                );
            }
        )
        .catch(
            function () {
                aiShowMessage(
                    "تعذر نسخ الرد.",
                    "error"
                );
            }
        );
}

function copyAIConversation() {
    const conversation =
        getSelectedAIConversation();

    if (!conversation) {
        aiShowMessage(
            "لا توجد محادثة للنسخ.",
            "warning"
        );

        return;
    }

    const messages =
        Array.isArray(
            conversation.messages
        )
            ? conversation.messages
            : [];

    const text =
        messages
            .map(
                function (message) {
                    const sender =
                        message.role ===
                        "user"
                            ? "المستخدم"
                            : "المساعد";

                    return (
                        sender +
                        ":\n" +
                        String(
                            message.text ||
                            ""
                        )
                    );
                }
            )
            .join("\n\n");

    copyAIText(text);
}

function exportAIConversation() {
    const conversation =
        getSelectedAIConversation();

    if (!conversation) {
        aiShowMessage(
            "لا توجد محادثة للتصدير.",
            "warning"
        );

        return;
    }

    const data = {
        conversation:
            conversation,

        project:
            getSelectedAIProject(),

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
            "ai-conversation-" +
            conversation.id +
            ".json"
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
        "ai-conversation-" +
        conversation.id +
        ".json";

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}

/* =========================================================
   سجل الاستخدام
========================================================= */

function recordAIUsage() {
    const usage =
        aiReadStorage(
            AIStorageKeys.usage,
            {
                totalRequests: 0,
                daily: {}
            }
        );

    const safeUsage =
        usage &&
        typeof usage === "object"
            ? usage
            : {
                totalRequests: 0,
                daily: {}
            };

    const dateKey =
        new Date()
            .toISOString()
            .slice(0, 10);

    safeUsage.totalRequests =
        Number(
            safeUsage.totalRequests ||
            0
        ) + 1;

    if (
        !safeUsage.daily ||
        typeof safeUsage.daily !==
            "object"
    ) {
        safeUsage.daily = {};
    }

    safeUsage.daily[dateKey] =
        Number(
            safeUsage.daily[
                dateKey
            ] || 0
        ) + 1;

    safeUsage.lastUsedAt =
        new Date()
            .toISOString();

    aiSaveStorage(
        AIStorageKeys.usage,
        safeUsage
    );

    updateAIUsage();
}

function updateAIUsage() {
    const usage =
        aiReadStorage(
            AIStorageKeys.usage,
            {
                totalRequests: 0,
                daily: {}
            }
        );

    const dateKey =
        new Date()
            .toISOString()
            .slice(0, 10);

    const totalElement =
        aiGetElement(
            "aiTotalRequests"
        );

    const todayElement =
        aiGetElement(
            "aiTodayRequests"
        );

    if (totalElement) {
        totalElement.textContent =
            Number(
                usage &&
                usage.totalRequests
                    ? usage.totalRequests
                    : 0
            );
    }

    if (todayElement) {
        let todayRequests = 0;

        if (
            usage &&
            usage.daily &&
            usage.daily[dateKey]
        ) {
            todayRequests =
                Number(
                    usage.daily[
                        dateKey
                    ]
                );
        }

        todayElement.textContent =
            todayRequests;
    }
}

/* =========================================================
   تنسيقات المساعد
========================================================= */

function injectAIStyles() {
    if (
        aiGetElement(
            "projectJourneyAIStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "projectJourneyAIStyles";

    style.textContent = `
        .ai-empty-conversations {
            padding: 35px 14px;
            text-align: center;
            color: #68758c;
            font-size: 10px;
        }

        .conversation-item {
            position: relative;
        }

        .conversation-delete {
            width: 26px;
            height: 26px;
            border-radius: 8px;
            display: grid;
            place-items: center;
            color: #dc3545;
            background: #fff0f1;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .conversation-item:hover
        .conversation-delete {
            opacity: 1;
        }

        .ai-welcome-card {
            max-width: 680px;
            margin: 25px auto;
            padding: 28px;
            border-radius: 24px;
            text-align: center;
            background: #ffffff;
            border: 1px solid #dbe7f7;
            box-shadow:
                0 14px 35px
                rgba(24, 71, 139, 0.08);
        }

        .ai-welcome-icon {
            width: 72px;
            height: 72px;
            margin: 0 auto;
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
            font-size: 31px;
        }

        .ai-welcome-card h2 {
            margin: 16px 0 0;
            font-size: 23px;
        }

        .ai-welcome-card p {
            margin: 9px 0 0;
            color: #68758c;
            font-size: 11px;
            line-height: 1.8;
        }

        .ai-welcome-options {
            margin-top: 19px;
            display: grid;
            grid-template-columns:
                repeat(2, minmax(0, 1fr));
            gap: 9px;
        }

        .ai-welcome-options button {
            min-height: 52px;
            padding: 11px;
            border: 1px solid #dbe7f7;
            border-radius: 13px;
            color: #14213d;
            background: #f8faff;
            cursor: pointer;
            font-size: 9px;
            line-height: 1.6;
        }

        .ai-message {
            display: flex;
            align-items: flex-end;
            gap: 9px;
        }

        .ai-message + .ai-message {
            margin-top: 15px;
        }

        .ai-message-user {
            flex-direction: row-reverse;
        }

        .ai-message-avatar {
            width: 33px;
            height: 33px;
            flex: 0 0 auto;
            border-radius: 10px;
            display: grid;
            place-items: center;
            color: #ffffff;
            background:
                linear-gradient(
                    135deg,
                    #1565ff,
                    #7357db
                );
            font-size: 10px;
            font-weight: 900;
        }

        .ai-message-content {
            max-width: 78%;
        }

        .ai-message-bubble {
            padding: 13px 15px;
            border-radius:
                17px 17px
                17px 5px;
            color: #14213d;
            background: #ffffff;
            border: 1px solid #dbe7f7;
            box-shadow:
                0 8px 20px
                rgba(24, 71, 139, 0.05);
        }

        .ai-message-user
        .ai-message-bubble {
            color: #ffffff;
            background: #1565ff;
            border-color: #1565ff;
            border-radius:
                17px 17px
                5px 17px;
        }

        .ai-message-bubble p {
            margin: 0;
            font-size: 11px;
            line-height: 1.9;
            word-break: break-word;
        }

        .ai-message-meta {
            margin-top: 6px;
            display: flex;
            justify-content: flex-end;
            gap: 9px;
            color: #68758c;
            font-size: 8px;
        }

        .ai-message-meta button {
            padding: 0;
            border: 0;
            color: inherit;
            background: transparent;
            cursor: pointer;
            font-size: 8px;
        }

        .ai-message-file {
            margin-top: 9px;
            padding: 9px 10px;
            border-radius: 10px;
            color: #1565ff;
            background: #eaf2ff;
            font-size: 9px;
        }

        .ai-analysis-box {
            margin-top: 11px;
            padding: 12px;
            border-radius: 12px;
            color: #14213d;
            background: #f8faff;
            border: 1px solid #dbe7f7;
        }

        .ai-analysis-box strong {
            display: block;
            color: #1565ff;
            font-size: 10px;
        }

        .ai-analysis-box ul {
            margin: 8px 0 0;
            padding-right: 18px;
            font-size: 9px;
            line-height: 1.8;
        }

        .ai-response-suggestions {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .ai-response-suggestions button {
            min-height: 31px;
            padding: 0 10px;
            border: 1px solid #cfe0ff;
            border-radius: 999px;
            color: #1565ff;
            background: #ffffff;
            cursor: pointer;
            font-size: 8px;
        }

        .ai-typing-indicator {
            width: max-content;
            margin-top: 14px;
            padding: 11px 14px;
            display: flex;
            gap: 5px;
            border-radius: 14px;
            background: #ffffff;
            border: 1px solid #dbe7f7;
        }

        .ai-typing-indicator span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #68758c;
            animation:
                aiTypingAnimation
                1.2s infinite ease-in-out;
        }

        .ai-typing-indicator span:nth-child(2) {
            animation-delay: 0.15s;
        }

        .ai-typing-indicator span:nth-child(3) {
            animation-delay: 0.30s;
        }

        @keyframes aiTypingAnimation {
            0%,
            60%,
            100% {
                transform: translateY(0);
                opacity: 0.4;
            }

            30% {
                transform: translateY(-4px);
                opacity: 1;
            }
        }

        @media (max-width: 640px) {
            .ai-welcome-options {
                grid-template-columns: 1fr;
            }

            .ai-message-content {
                max-width: 86%;
            }

            .conversation-delete {
                opacity: 1;
            }
        }
    `;

    document.head.appendChild(
        style
    );
}

/* =========================================================
   ربط أحداث الصفحة
========================================================= */

function initializeAIEvents() {
    const newConversationIds = [
        "headerNewConversationButton",
        "pageNewConversationButton",
        "sidebarNewConversationButton"
    ];

    newConversationIds.forEach(
        function (id) {
            const button =
                aiGetElement(id);

            if (button) {
                button.addEventListener(
                    "click",
                    function () {
                        createAIConversation(
                            true
                        );
                    }
                );
            }
        }
    );

    const sendButton =
        aiGetElement(
            "sendMessageButton"
        );

    if (sendButton) {
        sendButton.addEventListener(
            "click",
            sendAIMessage
        );
    }

    const messageInput =
        aiGetElement(
            "messageInput"
        );

    if (messageInput) {
        messageInput.addEventListener(
            "input",
            function () {
                resizeAITextarea();

                updateAIMessageCounter();
            }
        );

        messageInput.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key ===
                        "Enter" &&
                    event.shiftKey ===
                        false
                ) {
                    event.preventDefault();

                    sendAIMessage();
                }
            }
        );
    }

    const clearButton =
        aiGetElement(
            "clearCurrentConversationButton"
        );

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearCurrentAIConversation
        );
    }

    const deleteAllButton =
        aiGetElement(
            "deleteAllConversationsButton"
        );

    if (deleteAllButton) {
        deleteAllButton.addEventListener(
            "click",
            deleteAllAIConversations
        );
    }

    const copyConversationButton =
        aiGetElement(
            "copyConversationButton"
        );

    if (copyConversationButton) {
        copyConversationButton.addEventListener(
            "click",
            copyAIConversation
        );
    }

    const exportConversationButton =
        aiGetElement(
            "exportConversationButton"
        );

    if (exportConversationButton) {
        exportConversationButton.addEventListener(
            "click",
            exportAIConversation
        );
    }

    const conversationSearchInput =
        aiGetElement(
            "conversationSearchInput"
        );

    if (conversationSearchInput) {
        conversationSearchInput.addEventListener(
            "input",
            renderAIConversations
        );
    }

    const responseStyle =
        aiGetElement(
            "responseStyle"
        );

    if (responseStyle) {
        responseStyle.addEventListener(
            "change",
            function (event) {
                AIState.responseStyle =
                    event.target.value;

                saveAISettings();
            }
        );
    }

    const projectStage =
        aiGetElement(
            "projectStage"
        );

    if (projectStage) {
        projectStage.addEventListener(
            "change",
            function (event) {
                AIState.projectStage =
                    event.target.value;

                saveAISettings();
            }
        );
    }

    const assistantLanguage =
        aiGetElement(
            "assistantLanguage"
        );

    if (assistantLanguage) {
        assistantLanguage.addEventListener(
            "change",
            function (event) {
                AIState.language =
                    event.target.value;

                saveAISettings();
            }
        );
    }

    const projectSelect =
        aiGetElement(
            "assistantProjectSelect"
        );

    if (projectSelect) {
        projectSelect.addEventListener(
            "change",
            function (event) {
                changeAIProject(
                    event.target.value
                );
            }
        );
    }

    const attachmentButton =
        aiGetElement(
            "attachmentButton"
        );

    const attachmentInput =
        aiGetElement(
            "attachmentInput"
        );

    const removeSelectedFileButton =
        aiGetElement(
            "removeSelectedFileButton"
        );

    if (attachmentButton) {
        attachmentButton.addEventListener(
            "click",
            function () {
                if (attachmentInput) {
                    attachmentInput.click();
                }
            }
        );
    }

    if (attachmentInput) {
        attachmentInput.addEventListener(
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

                handleAIFile(
                    files[0]
                );
            }
        );
    }

    if (removeSelectedFileButton) {
        removeSelectedFileButton.addEventListener(
            "click",
            function () {
                clearAISelectedFile();
            }
        );
    }

    const ideaButton =
        aiGetElement(
            "ideaButton"
        );

    if (ideaButton) {
        ideaButton.addEventListener(
            "click",
            function () {
                if (!messageInput) {
                    return;
                }

                messageInput.value =
                    "فكرة مشروعي هي: ";

                messageInput.focus();

                resizeAITextarea();

                updateAIMessageCounter();
            }
        );
    }

    const mobileBackButton =
        aiGetElement(
            "mobileBackButton"
        );

    if (mobileBackButton) {
        mobileBackButton.addEventListener(
            "click",
            function () {
                const layout =
                    aiGetElement(
                        "assistantLayout"
                    );

                if (layout) {
                    layout.classList.remove(
                        "chat-open"
                    );
                }
            }
        );
    }

    bindAIPromptButtons(
        document
    );

    window.addEventListener(
        "storage",
        function (event) {
            if (
                event.key ===
                AIStorageKeys.conversations
            ) {
                const conversations =
                    aiReadStorage(
                        AIStorageKeys.conversations,
                        []
                    );

                AIState.conversations =
                    Array.isArray(
                        conversations
                    )
                        ? conversations
                        : [];

                if (
                    AIState.conversations.length >
                        0 &&
                    !getSelectedAIConversation()
                ) {
                    AIState.selectedConversationId =
                        AIState.conversations[0].id;
                }

                renderAIConversations();

                renderAIMessages();
            }

            if (
                event.key ===
                AIStorageKeys.projects
            ) {
                const projects =
                    aiReadStorage(
                        AIStorageKeys.projects,
                        []
                    );

                AIState.projects =
                    Array.isArray(projects)
                        ? projects
                        : [];

                renderAIProjects();
            }
        }
    );
}

/* =========================================================
   تشغيل الملف
========================================================= */

function initializeAIPage() {
    injectAIStyles();

    loadAIData();

    initializeAIEvents();

    updateAIMessageCounter();

    document.body.classList.add(
        "ai-page-ready"
    );

    document.dispatchEvent(
        new CustomEvent(
            "projectJourneyAIReady",
            {
                detail: {
                    conversations:
                        AIState
                            .conversations
                            .length,

                    projects:
                        AIState
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
        initializeAIPage
    );
} else {
    initializeAIPage();
}

/* =========================================================
   إتاحة الوظائف لبقية الملفات
========================================================= */

window.AIState =
    AIState;

window.sendAIMessage =
    sendAIMessage;

window.createAIConversation =
    createAIConversation;

window.selectAIConversation =
    selectAIConversation;

window.deleteAIConversation =
    deleteAIConversation;

window.clearCurrentAIConversation =
    clearCurrentAIConversation;

window.deleteAllAIConversations =
    deleteAllAIConversations;

window.generateAIResponse =
    generateAIResponse;

window.buildAIResponse =
    buildAIResponse;

window.copyAIConversation =
    copyAIConversation;

window.exportAIConversation =
    exportAIConversation;

window.handleAIFile =
    handleAIFile;

window.clearAISelectedFile =
    clearAISelectedFile;