"use strict";

/* =========================================================
   رحلة مشروع - Project Journey
   إدارة قصص المشاريع وتجارب رواد الأعمال
   js/stories.js
========================================================= */

const StoriesState = {
    currentUser: null,
    stories: [],
    filteredStories: [],
    selectedStoryId: "",
    search: "",
    category: "all",
    status: "all",
    sort: "newest",
    currentPage: 1,
    itemsPerPage: 6
};

const StoriesStorageKeys = {
    currentUser: "projectJourneyCurrentUser",
    stories: "projectJourneyStories",
    notifications: "projectJourneyNotifications"
};

/* =========================================================
   أدوات عامة
========================================================= */

function storiesGetElement(id) {
    return document.getElementById(id);
}

function storiesSelect(selector, parent = document) {
    return parent.querySelector(selector);
}

function storiesSelectAll(selector, parent = document) {
    return Array.from(
        parent.querySelectorAll(selector)
    );
}

function storiesReadStorage(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error(
            "تعذر قراءة بيانات القصص:",
            error
        );

        return fallback;
    }
}

function storiesSaveStorage(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;
    } catch (error) {
        console.error(
            "تعذر حفظ بيانات القصص:",
            error
        );

        showStoriesMessage(
            "تعذر حفظ بيانات القصص.",
            "error"
        );

        return false;
    }
}

function storiesCreateId(prefix = "STORY") {
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

function storiesEscapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function storiesNormalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function storiesFormatDate(value) {
    if (!value) {
        return "غير محدد";
    }

    const date = new Date(value);

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

function storiesShowToast(
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

function showStoriesMessage(
    message,
    type = "info"
) {
    storiesShowToast(
        message,
        type
    );
}

/* =========================================================
   البيانات الافتراضية
========================================================= */

function getDefaultStories() {
    const now = new Date().toISOString();

    return [
        {
            id: storiesCreateId("STORY"),
            title: "يمي سويت",
            ownerName: "صاحبة المشروع",
            category: "food",
            summary:
                "مشروع متخصص في الحلويات الفاخرة مثل الكوكيز والكيك والشوكولاتة.",
            description:
                "بدأ مشروع يمي سويت في أغسطس 2024، وركز منذ البداية على جودة المنتجات والتغليف والهوية البصرية. ساعد التخصص في الحلويات وتقديمها بطريقة مناسبة للهدايا على زيادة الطلب وانتشار المشروع.",
            challenge:
                "الدخول إلى سوق مزدحم بالمنافسين والحاجة إلى بناء ثقة العملاء.",
            solution:
                "التركيز على الجودة، والتغليف الجذاب، والتصوير الاحترافي، وتقديم منتجات مناسبة للمناسبات والهدايا.",
            successFactors: [
                "التخصص الواضح",
                "جودة المنتجات",
                "التغليف والهوية البصرية",
                "الاستمرار في التطوير"
            ],
            lessons: [
                "الجودة تبني ثقة العميل",
                "التصميم والتغليف جزء من المنتج",
                "التخصص يجعل المشروع أكثر وضوحًا"
            ],
            startDate: "2024-08-01",
            status: "published",
            rating: 4.8,
            likes: 0,
            views: 0,
            createdAt: now,
            updatedAt: now
        },
        {
            id: storiesCreateId("STORY"),
            title: "دولتشي حلويات",
            ownerName: "صاحبة المشروع",
            category: "food",
            summary:
                "مشروع حلويات بدأ بدعم العائلة والأصدقاء ثم وصل إلى تزويد أحد المقاهي.",
            description:
                "بدأ المشروع من حب الطبخ وصناعة الحلويات، ووجد دعمًا من العائلة، خاصة الأم والأب والأخوات والعمة. خلال فترة قصيرة استطاعت صاحبة المشروع تزويد أحد المقاهي بمنتجاتها، واستمرت في تحسين الطعم والجودة.",
            challenge:
                "إثبات جودة المنتج في بداية المشروع والوصول إلى أول عميل تجاري.",
            solution:
                "الاعتماد على التوصيات من الأصدقاء والعائلة، وتحسين المنتجات، والتواصل المباشر مع المقاهي.",
            successFactors: [
                "دعم العائلة",
                "جودة الطعم",
                "التجربة المستمرة",
                "الوصول لأول مقهى"
            ],
            lessons: [
                "ابدأ من دائرة الثقة القريبة",
                "أول عميل تجاري يفتح فرصًا جديدة",
                "التحسين المستمر مهم"
            ],
            startDate: "",
            status: "published",
            rating: 4.5,
            likes: 0,
            views: 0,
            createdAt: now,
            updatedAt: now
        },
        {
            id: storiesCreateId("STORY"),
            title: "نقليات الرواحي",
            ownerName: "صاحب المشروع",
            category: "transport",
            summary:
                "مشروع نقل بدأ بحافلة مستعارة ثم توسع إلى امتلاك عدة حافلات.",
            description:
                "بدأ المشروع عام 2015 بخدمة نقل الطلاب، ثم تطور تدريجيًا من استخدام حافلة مستعارة إلى امتلاك عدة حافلات. أضيفت خدمات مثل الإنترنت والشاي، كما توسعت الخدمة إلى قرى قريبة وشارك أفراد الأسرة في العمل.",
            challenge:
                "قلة الموارد في البداية والحاجة إلى كسب ثقة الأسر والطلاب.",
            solution:
                "البدء بالإمكانات المتاحة، والالتزام بالمواعيد، وتحسين الخدمة، ثم إعادة استثمار الأرباح في شراء حافلات جديدة.",
            successFactors: [
                "الالتزام بالمواعيد",
                "تطوير الخدمة",
                "إعادة استثمار الأرباح",
                "مشاركة الأسرة"
            ],
            lessons: [
                "ابدأ بما تملك",
                "الخدمة الجيدة تزيد العملاء",
                "التوسع التدريجي أكثر أمانًا"
            ],
            startDate: "2015-01-01",
            status: "published",
            rating: 4.7,
            likes: 0,
            views: 0,
            createdAt: now,
            updatedAt: now
        },
        {
            id: storiesCreateId("STORY"),
            title: "تصوير المناسبات بالهاتف",
            ownerName: "صاحبة المشروع",
            category: "creative",
            summary:
                "هواية تصوير تحولت إلى مشروع لتصوير الأعراس والخطوبات بالهاتف.",
            description:
                "بدأت الفكرة كهواية شخصية، ثم تطورت إلى مشروع لتصوير المناسبات باستخدام الهاتف. اشترت صاحبة المشروع إضاءة وبعض المعدات، وقدمت عروضًا بأسعار منخفضة في البداية حتى اكتسبت عملاء وتجارب ناجحة.",
            challenge:
                "إقناع العملاء بجودة التصوير بالهاتف مقارنة بالمعدات الاحترافية.",
            solution:
                "تطوير المهارة، وتحسين الإضاءة، وعرض نماذج الأعمال، وتقديم أسعار مناسبة في البداية.",
            successFactors: [
                "المهارة",
                "الأسعار المناسبة",
                "نماذج الأعمال",
                "التصوير الإبداعي"
            ],
            lessons: [
                "الهواية يمكن أن تتحول إلى مشروع",
                "النموذج الجيد يقنع العميل",
                "التسعير الأولي يساعد على الانتشار"
            ],
            startDate: "",
            status: "published",
            rating: 4.4,
            likes: 0,
            views: 0,
            createdAt: now,
            updatedAt: now
        },
        {
            id: storiesCreateId("STORY"),
            title: "شركة الأمجاد للعناية بالسيارات",
            ownerName: "صاحب المشروع",
            category: "services",
            summary:
                "مشروع في صيانة السيارات بُني على الدراسة والخبرة العملية.",
            description:
                "درس صاحب المشروع الميكانيكا العامة، وتدرب في عدة جهات، ثم حصل على تمويل بقيمة 80 ألف ريال. بدأ بعقد امتياز لمدة عشر سنوات، وبعد اكتساب الخبرة أطلق علامته الخاصة باسم الأمجاد، وأصبح المشروع يشهد طلبًا قويًا.",
            challenge:
                "الحاجة إلى رأس مال كبير وبناء خبرة فنية وإدارية.",
            solution:
                "الدراسة والتدريب، ثم الحصول على تمويل، والاستفادة من عقد امتياز قبل إطلاق العلامة الخاصة.",
            successFactors: [
                "الدراسة",
                "التدريب",
                "التمويل",
                "الخبرة العملية"
            ],
            lessons: [
                "التعلم قبل التوسع يقلل الأخطاء",
                "التمويل يحتاج إلى خطة",
                "الخبرة تبني علامة قوية"
            ],
            startDate: "",
            status: "published",
            rating: 4.9,
            likes: 0,
            views: 0,
            createdAt: now,
            updatedAt: now
        },
        {
            id: storiesCreateId("STORY"),
            title: "أزياء الجوري",
            ownerName: "صاحبة المشروع",
            category: "fashion",
            summary:
                "مشروع أزياء استمر أكثر من عشر سنوات ونجح بالتجديد والترويج.",
            description:
                "بدأ مشروع أزياء الجوري قبل أكثر من عشر سنوات، وحقق نجاحًا جيدًا خاصة في مواسم الأعراس. اعتمد المشروع على التجديد المستمر والترويج وفهم اختلاف الأذواق والمقاسات، وبدأ بتمويل شخصي دون ديون.",
            challenge:
                "الموسمية واختلاف أذواق العملاء والمقاسات.",
            solution:
                "التجديد المستمر، وتنويع التصاميم، والترويج قبل مواسم الطلب.",
            successFactors: [
                "التجديد",
                "الترويج",
                "فهم العملاء",
                "التمويل الشخصي"
            ],
            lessons: [
                "لا تبدأ بدين كبير",
                "الموسمية تحتاج إلى تخطيط",
                "فهم الذوق مهم في الأزياء"
            ],
            startDate: "",
            status: "published",
            rating: 4.6,
            likes: 0,
            views: 0,
            createdAt: now,
            updatedAt: now
        },
        {
            id: storiesCreateId("STORY"),
            title: "سعيد الرواحي للنقل بالشاحنات",
            ownerName: "سعيد الرواحي",
            category: "transport",
            summary:
                "مشروع نقل بالشاحنات توسع من شاحنة واحدة إلى ست شاحنات.",
            description:
                "بدأ المشروع عام 2005 بعد التقاعد، وعمل في النقل بين عدة دول. واجه في البداية تأخرًا طويلًا عند الحدود، لكنه استمر وتوسع من شاحنة واحدة إلى ست شاحنات.",
            challenge:
                "التأخير عند الحدود وارتفاع مصاريف التشغيل والصيانة.",
            solution:
                "الصبر، وتنظيم الرحلات، وصيانة المركبات، وإعادة استثمار الأرباح.",
            successFactors: [
                "الصبر",
                "إدارة المصروفات",
                "الصيانة",
                "التوسع التدريجي"
            ],
            lessons: [
                "الخبرة تقلل الخسائر",
                "الصيانة أساسية",
                "التعليم والشهادة مفيدان"
            ],
            startDate: "2005-01-01",
            status: "published",
            rating: 4.5,
            likes: 0,
            views: 0,
            createdAt: now,
            updatedAt: now
        },
        {
            id: storiesCreateId("STORY"),
            title: "أبو مازن لمشاريع البناء",
            ownerName: "أبو مازن",
            category: "construction",
            summary:
                "مشروع بناء تعلّم من خسارة سببها ضعف الإشراف على العمال.",
            description:
                "بدأ المشروع عام 2014، وواجه خسارة بسبب الاعتماد الكبير على العمال دون متابعة مستمرة. كانت أهم نتيجة للتجربة هي أن الإشراف المباشر والمتابعة اليومية ضروريان في مشاريع البناء.",
            challenge:
                "ضعف المتابعة والاعتماد الكامل على العمال.",
            solution:
                "الإشراف المستمر، وتحديد المهام، ومراجعة الجودة والتكاليف.",
            successFactors: [
                "المتابعة",
                "الرقابة على الجودة",
                "تنظيم العمال",
                "مراجعة المصروفات"
            ],
            lessons: [
                "لا تترك المشروع دون متابعة",
                "الجودة تحتاج إلى رقابة",
                "تعلّم من الخسارة"
            ],
            startDate: "2014-01-01",
            status: "published",
            rating: 4.2,
            likes: 0,
            views: 0,
            createdAt: now,
            updatedAt: now
        },
        {
            id: storiesCreateId("STORY"),
            title: "Metastable Materials",
            ownerName:
                "Shubham Vishvakarma, Manikumar Uppala, Saurav Goyal",
            category: "technology",
            summary:
                "مشروع يعيد تدوير بطاريات المركبات الكهربائية لاستخراج المعادن الصناعية.",
            description:
                "تأسس المشروع عام 2021 على يد ثلاثة خريجين من IIT Roorkee. يركز على إعادة تدوير نفايات البطاريات واستخراج معادن مهمة مثل الليثيوم والكوبالت والنيكل والنحاس والألمنيوم.",
            challenge:
                "تزايد نفايات البطاريات والحاجة إلى معادن تدخل في الصناعات الحديثة.",
            solution:
                "تطوير تقنية لإعادة تدوير البطاريات واستخراج المعادن منها بكفاءة.",
            successFactors: [
                "حل مشكلة بيئية",
                "تقنية قابلة للتوسع",
                "طلب متزايد على المعادن",
                "فريق تقني"
            ],
            lessons: [
                "المشكلات البيئية فرص للمشاريع",
                "التقنية القوية تخلق قيمة",
                "اختيار سوق متنامٍ مهم"
            ],
            startDate: "2021-01-01",
            status: "published",
            rating: 4.9,
            likes: 0,
            views: 0,
            createdAt: now,
            updatedAt: now
        }
    ];
}

/* =========================================================
   تحميل القصص
========================================================= */

function loadStoriesData() {
    StoriesState.currentUser =
        storiesReadStorage(
            StoriesStorageKeys.currentUser,
            null
        );

    const storedStories =
        storiesReadStorage(
            StoriesStorageKeys.stories,
            []
        );

    StoriesState.stories =
        Array.isArray(storedStories)
            ? storedStories
            : [];

    if (
        StoriesState.stories.length === 0
    ) {
        StoriesState.stories =
            getDefaultStories();

        saveStories();
    }

    applyStoriesFilters();
    renderStoriesStatistics();
}

/* =========================================================
   حفظ القصص
========================================================= */

function saveStories() {
    return storiesSaveStorage(
        StoriesStorageKeys.stories,
        StoriesState.stories
    );
}

/* =========================================================
   التصنيفات والحالات
========================================================= */

function getStoryCategoryLabel(category) {
    const labels = {
        food: "الأغذية والحلويات",
        transport: "النقل",
        creative: "المشاريع الإبداعية",
        services: "الخدمات",
        fashion: "الأزياء",
        construction: "البناء",
        technology: "التقنية",
        commerce: "التجارة",
        education: "التعليم",
        general: "عام"
    };

    return labels[category] ||
        "عام";
}

function getStoryCategoryIcon(category) {
    const icons = {
        food: "🍰",
        transport: "🚌",
        creative: "📷",
        services: "🔧",
        fashion: "👗",
        construction: "🏗️",
        technology: "🔋",
        commerce: "🛍️",
        education: "🎓",
        general: "🚀"
    };

    return icons[category] ||
        "🚀";
}

function getStoryStatusLabel(status) {
    const labels = {
        published: "منشورة",
        draft: "مسودة",
        pending: "قيد المراجعة",
        archived: "مؤرشفة"
    };

    return labels[status] ||
        "منشورة";
}

/* =========================================================
   البحث والفلترة
========================================================= */

function applyStoriesFilters() {
    let stories = [
        ...StoriesState.stories
    ];

    const query =
        storiesNormalizeText(
            StoriesState.search
        );

    if (query) {
        stories =
            stories.filter(
                (story) =>
                    storiesNormalizeText(
                        [
                            story.title,
                            story.ownerName,
                            story.summary,
                            story.description,
                            story.challenge,
                            story.solution,
                            getStoryCategoryLabel(
                                story.category
                            )
                        ].join(" ")
                    ).includes(query)
            );
    }

    if (
        StoriesState.category !==
        "all"
    ) {
        stories =
            stories.filter(
                (story) =>
                    story.category ===
                    StoriesState.category
            );
    }

    if (
        StoriesState.status !==
        "all"
    ) {
        stories =
            stories.filter(
                (story) =>
                    story.status ===
                    StoriesState.status
            );
    }

    if (
        StoriesState.sort ===
        "oldest"
    ) {
        stories.sort(
            (first, second) =>
                new Date(
                    first.createdAt
                ) -
                new Date(
                    second.createdAt
                )
        );
    } else if (
        StoriesState.sort ===
        "rating"
    ) {
        stories.sort(
            (first, second) =>
                Number(second.rating || 0) -
                Number(first.rating || 0)
        );
    } else if (
        StoriesState.sort ===
        "popular"
    ) {
        stories.sort(
            (first, second) =>
                (
                    Number(second.likes || 0) +
                    Number(second.views || 0)
                ) -
                (
                    Number(first.likes || 0) +
                    Number(first.views || 0)
                )
        );
    } else if (
        StoriesState.sort ===
        "title"
    ) {
        stories.sort(
            (first, second) =>
                String(first.title || "")
                    .localeCompare(
                        String(second.title || ""),
                        "ar"
                    )
        );
    } else {
        stories.sort(
            (first, second) =>
                new Date(
                    second.createdAt
                ) -
                new Date(
                    first.createdAt
                )
        );
    }

    StoriesState.filteredStories =
        stories;

    StoriesState.currentPage = 1;

    renderStories();
    renderStoriesPagination();
}

/* =========================================================
   عرض القصص
========================================================= */

function renderStories() {
    const container =
        storiesGetElement(
            "storiesGrid"
        ) ||
        storiesGetElement(
            "storiesContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const start =
        (
            StoriesState.currentPage - 1
        ) *
        StoriesState.itemsPerPage;

    const end =
        start +
        StoriesState.itemsPerPage;

    const pageItems =
        StoriesState.filteredStories.slice(
            start,
            end
        );

    const emptyState =
        storiesGetElement(
            "storiesEmptyState"
        );

    if (
        pageItems.length === 0
    ) {
        if (emptyState) {
            emptyState.hidden = false;
        } else {
            container.innerHTML = `
                <div class="stories-empty-state">
                    لا توجد قصص مطابقة للبحث أو الفلاتر.
                </div>
            `;
        }

        return;
    }

    if (emptyState) {
        emptyState.hidden = true;
    }

    pageItems.forEach(
        (story) => {
            container.appendChild(
                createStoryCard(story)
            );
        }
    );

    updateStoriesCount();
}

function createStoryCard(story) {
    const article =
        document.createElement(
            "article"
        );

    article.className =
        "story-card";

    article.dataset.storyId =
        story.id;

    article.innerHTML = `
        <div class="story-card-cover">

            <div class="story-card-icon">
                ${getStoryCategoryIcon(
                    story.category
                )}
            </div>

            <span class="story-status-badge">
                ${storiesEscapeHTML(
                    getStoryStatusLabel(
                        story.status
                    )
                )}
            </span>

        </div>

        <div class="story-card-body">

            <span class="story-category">
                ${storiesEscapeHTML(
                    getStoryCategoryLabel(
                        story.category
                    )
                )}
            </span>

            <h3>
                ${storiesEscapeHTML(
                    story.title
                )}
            </h3>

            <p class="story-owner">
                ${storiesEscapeHTML(
                    story.ownerName ||
                    "صاحب المشروع"
                )}
            </p>

            <p class="story-summary">
                ${storiesEscapeHTML(
                    story.summary ||
                    story.description ||
                    ""
                )}
            </p>

            <div class="story-meta">

                <span>
                    ⭐
                    ${Number(
                        story.rating || 0
                    ).toFixed(1)}
                </span>

                <span>
                    👁
                    ${Number(
                        story.views || 0
                    )}
                </span>

                <span>
                    ❤
                    ${Number(
                        story.likes || 0
                    )}
                </span>

            </div>

            <div class="story-actions">

                <button
                    type="button"
                    class="story-action view-story-button"
                >
                    قراءة القصة
                </button>

                <button
                    type="button"
                    class="story-action like-story-button"
                >
                    إعجاب
                </button>

            </div>

        </div>
    `;

    article
        .querySelector(
            ".view-story-button"
        )
        .addEventListener(
            "click",
            () => {
                openStory(story.id);
            }
        );

    article
        .querySelector(
            ".like-story-button"
        )
        .addEventListener(
            "click",
            () => {
                likeStory(story.id);
            }
        );

    return article;
}

/* =========================================================
   فتح القصة
========================================================= */

function openStory(storyId) {
    const story =
        StoriesState.stories.find(
            (item) =>
                item.id === storyId
        );

    if (!story) {
        return;
    }

    story.views =
        Number(story.views || 0) +
        1;

    story.updatedAt =
        new Date().toISOString();

    saveStories();

    StoriesState.selectedStoryId =
        story.id;

    const modal =
        storiesGetElement(
            "storyDetailsModal"
        );

    if (!modal) {
        window.location.href =
            `story details.html?id=${encodeURIComponent(
                story.id
            )}`;

        return;
    }

    renderStoryDetails(story);

    if (
        typeof window.openModal ===
        "function"
    ) {
        window.openModal(modal);
    } else {
        modal.hidden = false;
        document.body.classList.add(
            "modal-open"
        );
    }

    renderStories();
}

/* =========================================================
   تفاصيل القصة
========================================================= */

function renderStoryDetails(story) {
    setStoryDetailsText(
        "storyDetailsTitle",
        story.title
    );

    setStoryDetailsText(
        "storyDetailsOwner",
        story.ownerName ||
        "صاحب المشروع"
    );

    setStoryDetailsText(
        "storyDetailsCategory",
        getStoryCategoryLabel(
            story.category
        )
    );

    setStoryDetailsText(
        "storyDetailsDescription",
        story.description ||
        "لا يوجد وصف."
    );

    setStoryDetailsText(
        "storyDetailsChallenge",
        story.challenge ||
        "غير محدد."
    );

    setStoryDetailsText(
        "storyDetailsSolution",
        story.solution ||
        "غير محدد."
    );

    setStoryDetailsText(
        "storyDetailsDate",
        story.startDate
            ? storiesFormatDate(
                story.startDate
            )
            : "غير محدد"
    );

    setStoryDetailsText(
        "storyDetailsRating",
        Number(
            story.rating || 0
        ).toFixed(1)
    );

    setStoryDetailsText(
        "storyDetailsViews",
        Number(
            story.views || 0
        )
    );

    setStoryDetailsText(
        "storyDetailsLikes",
        Number(
            story.likes || 0
        )
    );

    const icon =
        storiesGetElement(
            "storyDetailsIcon"
        );

    if (icon) {
        icon.textContent =
            getStoryCategoryIcon(
                story.category
            );
    }

    renderStoryList(
        "storySuccessFactorsList",
        story.successFactors
    );

    renderStoryList(
        "storyLessonsList",
        story.lessons
    );
}

function setStoryDetailsText(
    elementId,
    value
) {
    const element =
        storiesGetElement(
            elementId
        );

    if (element) {
        element.textContent =
            value;
    }
}

function renderStoryList(
    elementId,
    items
) {
    const container =
        storiesGetElement(
            elementId
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const safeItems =
        Array.isArray(items)
            ? items
            : [];

    if (
        safeItems.length === 0
    ) {
        const item =
            document.createElement(
                "li"
            );

        item.textContent =
            "لا توجد معلومات.";

        container.appendChild(item);

        return;
    }

    safeItems.forEach(
        (value) => {
            const item =
                document.createElement(
                    "li"
                );

            item.textContent =
                value;

            container.appendChild(item);
        }
    );
}

/* =========================================================
   الإعجاب
========================================================= */

function likeStory(storyId) {
    const story =
        StoriesState.stories.find(
            (item) =>
                item.id === storyId
        );

    if (!story) {
        return;
    }

    const likedStories =
        storiesReadStorage(
            "projectJourneyLikedStories",
            []
        );

    const likedIds =
        Array.isArray(likedStories)
            ? likedStories
            : [];

    if (
        likedIds.includes(story.id)
    ) {
        showStoriesMessage(
            "سبق أن أعجبت بهذه القصة.",
            "info"
        );

        return;
    }

    story.likes =
        Number(story.likes || 0) +
        1;

    story.updatedAt =
        new Date().toISOString();

    likedIds.push(story.id);

    storiesSaveStorage(
        "projectJourneyLikedStories",
        likedIds
    );

    saveStories();

    renderStories();
    renderStoriesStatistics();

    showStoriesMessage(
        "تم تسجيل إعجابك بالقصة.",
        "success"
    );
}

/* =========================================================
   الإحصائيات
========================================================= */

function renderStoriesStatistics() {
    const total =
        StoriesState.stories.length;

    const published =
        StoriesState.stories.filter(
            (story) =>
                story.status ===
                "published"
        ).length;

    const totalViews =
        StoriesState.stories.reduce(
            (sum, story) =>
                sum +
                Number(
                    story.views || 0
                ),
            0
        );

    const totalLikes =
        StoriesState.stories.reduce(
            (sum, story) =>
                sum +
                Number(
                    story.likes || 0
                ),
            0
        );

    const values = {
        totalStoriesCount:
            total,

        publishedStoriesCount:
            published,

        totalStoriesViews:
            totalViews,

        totalStoriesLikes:
            totalLikes
    };

    Object.entries(values).forEach(
        ([id, value]) => {
            const element =
                storiesGetElement(id);

            if (element) {
                element.textContent =
                    new Intl.NumberFormat(
                        "ar"
                    ).format(value);
            }
        }
    );
}

function updateStoriesCount() {
    const badge =
        storiesGetElement(
            "storiesCountBadge"
        );

    if (badge) {
        badge.textContent =
            `${StoriesState.filteredStories.length} قصة`;
    }
}

/* =========================================================
   الصفحات
========================================================= */

function renderStoriesPagination() {
    const container =
        storiesGetElement(
            "storiesPagination"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const pages =
        Math.ceil(
            StoriesState.filteredStories.length /
            StoriesState.itemsPerPage
        );

    if (pages <= 1) {
        return;
    }

    const previousButton =
        document.createElement(
            "button"
        );

    previousButton.type =
        "button";

    previousButton.textContent =
        "السابق";

    previousButton.disabled =
        StoriesState.currentPage === 1;

    previousButton.addEventListener(
        "click",
        () => {
            StoriesState.currentPage -= 1;
            renderStories();
            renderStoriesPagination();
        }
    );

    container.appendChild(
        previousButton
    );

    for (
        let page = 1;
        page <= pages;
        page += 1
    ) {
        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.textContent =
            page;

        button.classList.toggle(
            "active",
            page ===
            StoriesState.currentPage
        );

        button.addEventListener(
            "click",
            () => {
                StoriesState.currentPage =
                    page;

                renderStories();
                renderStoriesPagination();
            }
        );

        container.appendChild(button);
    }

    const nextButton =
        document.createElement(
            "button"
        );

    nextButton.type =
        "button";

    nextButton.textContent =
        "التالي";

    nextButton.disabled =
        StoriesState.currentPage ===
        pages;

    nextButton.addEventListener(
        "click",
        () => {
            StoriesState.currentPage += 1;
            renderStories();
            renderStoriesPagination();
        }
    );

    container.appendChild(
        nextButton
    );
}

/* =========================================================
   إضافة قصة
========================================================= */

function openAddStoryModal() {
    const modal =
        storiesGetElement(
            "addStoryModal"
        );

    if (!modal) {
        window.location.href =
            "publish.html";

        return;
    }

    const form =
        storiesGetElement(
            "addStoryForm"
        );

    form?.reset();

    if (
        typeof window.openModal ===
        "function"
    ) {
        window.openModal(modal);
    } else {
        modal.hidden = false;
        document.body.classList.add(
            "modal-open"
        );
    }
}

function collectStoryFormData() {
    return {
        title:
            storiesGetElement(
                "storyTitle"
            )?.value.trim() ||
            "",

        ownerName:
            storiesGetElement(
                "storyOwnerName"
            )?.value.trim() ||
            "",

        category:
            storiesGetElement(
                "storyCategory"
            )?.value ||
            "general",

        summary:
            storiesGetElement(
                "storySummary"
            )?.value.trim() ||
            "",

        description:
            storiesGetElement(
                "storyDescription"
            )?.value.trim() ||
            "",

        challenge:
            storiesGetElement(
                "storyChallenge"
            )?.value.trim() ||
            "",

        solution:
            storiesGetElement(
                "storySolution"
            )?.value.trim() ||
            "",

        successFactors:
            splitStoryLines(
                storiesGetElement(
                    "storySuccessFactors"
                )?.value
            ),

        lessons:
            splitStoryLines(
                storiesGetElement(
                    "storyLessons"
                )?.value
            ),

        startDate:
            storiesGetElement(
                "storyStartDate"
            )?.value ||
            "",

        status:
            storiesGetElement(
                "storyStatus"
            )?.value ||
            "pending"
    };
}

function splitStoryLines(value) {
    return String(value || "")
        .split(/\n|،|,/)
        .map(
            (item) =>
                item.trim()
        )
        .filter(Boolean);
}

function validateStoryForm(data) {
    if (
        data.title.length < 3
    ) {
        showStoriesMessage(
            "اكتب عنوانًا واضحًا للقصة.",
            "warning"
        );

        return false;
    }

    if (
        data.description.length < 30
    ) {
        showStoriesMessage(
            "اكتب وصفًا للقصة لا يقل عن 30 حرفًا.",
            "warning"
        );

        return false;
    }

    if (
        data.challenge.length < 10
    ) {
        showStoriesMessage(
            "اكتب التحدي الرئيسي.",
            "warning"
        );

        return false;
    }

    if (
        data.solution.length < 10
    ) {
        showStoriesMessage(
            "اكتب الحل الذي اتبعه صاحب المشروع.",
            "warning"
        );

        return false;
    }

    return true;
}

function submitStoryForm(event) {
    event.preventDefault();

    const data =
        collectStoryFormData();

    if (
        !validateStoryForm(data)
    ) {
        return;
    }

    const now =
        new Date().toISOString();

    const story = {
        id:
            storiesCreateId(
                "STORY"
            ),

        userId:
            StoriesState.currentUser
                ?.id ||
            "guest",

        title:
            data.title,

        ownerName:
            data.ownerName ||
            StoriesState.currentUser
                ?.fullName ||
            StoriesState.currentUser
                ?.name ||
            "صاحب المشروع",

        category:
            data.category,

        summary:
            data.summary ||
            data.description.slice(
                0,
                160
            ),

        description:
            data.description,

        challenge:
            data.challenge,

        solution:
            data.solution,

        successFactors:
            data.successFactors,

        lessons:
            data.lessons,

        startDate:
            data.startDate,

        status:
            data.status,

        rating:
            0,

        likes:
            0,

        views:
            0,

        createdAt:
            now,

        updatedAt:
            now
    };

    StoriesState.stories.unshift(
        story
    );

    saveStories();

    createStoryNotification(story);

    const modal =
        storiesGetElement(
            "addStoryModal"
        );

    if (
        modal &&
        typeof window.closeModal ===
        "function"
    ) {
        window.closeModal(modal);
    } else if (modal) {
        modal.hidden = true;
        document.body.classList.remove(
            "modal-open"
        );
    }

    applyStoriesFilters();
    renderStoriesStatistics();

    showStoriesMessage(
        story.status ===
        "published"
            ? "تم نشر القصة بنجاح."
            : "تم إرسال القصة للمراجعة.",
        "success"
    );
}

/* =========================================================
   الإشعارات
========================================================= */

function createStoryNotification(story) {
    if (
        typeof window.addNotification ===
        "function"
    ) {
        window.addNotification({
            title:
                "تمت إضافة قصة جديدة",

            message:
                `تمت إضافة قصة ${story.title}.`,

            type:
                "success",

            link:
                `stories.html?id=${story.id}`
        });

        return;
    }

    const notifications =
        storiesReadStorage(
            StoriesStorageKeys.notifications,
            []
        );

    const list =
        Array.isArray(notifications)
            ? notifications
            : [];

    list.unshift({
        id:
            storiesCreateId(
                "NOTIFICATION"
            ),

        title:
            "تمت إضافة قصة جديدة",

        message:
            `تمت إضافة قصة ${story.title}.`,

        type:
            "success",

        isRead:
            false,

        createdAt:
            new Date().toISOString()
    });

    storiesSaveStorage(
        StoriesStorageKeys.notifications,
        list
    );
}

/* =========================================================
   مشاركة القصة
========================================================= */

function shareSelectedStory() {
    const story =
        StoriesState.stories.find(
            (item) =>
                item.id ===
                StoriesState.selectedStoryId
        );

    if (!story) {
        return;
    }

    const shareText =
        `${story.title}\n\n${story.summary}`;

    if (
        navigator.share
    ) {
        navigator.share({
            title:
                story.title,

            text:
                shareText,

            url:
                window.location.href
        }).catch(
            () => {}
        );

        return;
    }

    if (
        typeof window.copyText ===
        "function"
    ) {
        window.copyText(
            shareText,
            "تم نسخ القصة للمشاركة."
        );

        return;
    }

    navigator.clipboard
        .writeText(shareText)
        .then(
            () => {
                showStoriesMessage(
                    "تم نسخ القصة للمشاركة.",
                    "success"
                );
            }
        )
        .catch(
            () => {
                showStoriesMessage(
                    "تعذر نسخ القصة.",
                    "error"
                );
            }
        );
}

/* =========================================================
   تصدير القصص
========================================================= */

function exportStories() {
    const data = {
        stories:
            StoriesState.filteredStories,

        total:
            StoriesState.filteredStories
                .length,

        exportedAt:
            new Date().toISOString()
    };

    if (
        typeof window.downloadJSON ===
        "function"
    ) {
        window.downloadJSON(
            data,
            "project-journey-stories.json"
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
        URL.createObjectURL(blob);

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        "project-journey-stories.json";

    document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

/* =========================================================
   تنسيقات إضافية
========================================================= */

function injectStoriesStyles() {
    if (
        storiesGetElement(
            "projectJourneyStoriesStyles"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "projectJourneyStoriesStyles";

    style.textContent = `
        .story-card {
            overflow: hidden;
            border-radius: 19px;
            background: #ffffff;
            border: 1px solid #dbe7f7;
            box-shadow:
                0 12px 28px
                rgba(24, 71, 139, 0.07);
            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
        }

        .story-card:hover {
            transform: translateY(-5px);
            box-shadow:
                0 20px 42px
                rgba(24, 71, 139, 0.12);
        }

        .story-card-cover {
            min-height: 115px;
            padding: 17px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            color: #ffffff;
            background:
                linear-gradient(
                    135deg,
                    #0d47b8,
                    #1565ff,
                    #6ba7ff
                );
        }

        .story-card-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: grid;
            place-items: center;
            background:
                rgba(255, 255, 255, 0.18);
            font-size: 23px;
        }

        .story-status-badge {
            padding: 6px 9px;
            border-radius: 999px;
            background:
                rgba(255, 255, 255, 0.18);
            font-size: 9px;
            font-weight: 800;
        }

        .story-card-body {
            padding: 18px;
        }

        .story-category {
            width: max-content;
            max-width: 100%;
            padding: 6px 9px;
            border-radius: 999px;
            color: #1565ff;
            background: #eaf2ff;
            font-size: 9px;
            font-weight: 800;
        }

        .story-card h3 {
            margin: 12px 0 0;
            font-size: 18px;
        }

        .story-owner {
            margin: 6px 0 0;
            color: #68758c;
            font-size: 10px;
        }

        .story-summary {
            min-height: 70px;
            margin: 10px 0 0;
            color: #68758c;
            font-size: 10px;
            line-height: 1.8;
        }

        .story-meta {
            margin-top: 13px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            color: #68758c;
            font-size: 9px;
        }

        .story-actions {
            margin-top: 14px;
            display: grid;
            grid-template-columns:
                repeat(2, minmax(0, 1fr));
            gap: 8px;
        }

        .story-action {
            min-height: 39px;
            border: 0;
            border-radius: 11px;
            color: #1565ff;
            background: #eaf2ff;
            cursor: pointer;
            font-size: 9px;
            font-weight: 800;
        }

        .story-action:last-child {
            color: #dc3545;
            background: #fff0f1;
        }

        .stories-empty-state {
            padding: 55px 20px;
            border-radius: 18px;
            text-align: center;
            color: #68758c;
            background: #ffffff;
            border: 1px solid #dbe7f7;
        }

        #storiesPagination {
            margin-top: 22px;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 7px;
        }

        #storiesPagination button {
            min-width: 38px;
            min-height: 38px;
            padding: 0 11px;
            border: 1px solid #dbe7f7;
            border-radius: 11px;
            color: #14213d;
            background: #ffffff;
            cursor: pointer;
        }

        #storiesPagination button.active {
            color: #ffffff;
            background: #1565ff;
            border-color: #1565ff;
        }

        #storiesPagination button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }
    `;

    document.head.appendChild(
        style
    );
}

/* =========================================================
   الأحداث
========================================================= */

function initializeStoriesEvents() {
    let searchTimer;

    const searchInput =
        storiesGetElement(
            "storiesSearchInput"
        ) ||
        storiesGetElement(
            "storySearch"
        );

    searchInput?.addEventListener(
        "input",
        () => {
            window.clearTimeout(
                searchTimer
            );

            searchTimer =
                window.setTimeout(
                    () => {
                        StoriesState.search =
                            searchInput.value;

                        applyStoriesFilters();
                    },
                    180
                );
        }
    );

    const categoryFilter =
        storiesGetElement(
            "storiesCategoryFilter"
        );

    categoryFilter?.addEventListener(
        "change",
        () => {
            StoriesState.category =
                categoryFilter.value;

            applyStoriesFilters();
        }
    );

    const statusFilter =
        storiesGetElement(
            "storiesStatusFilter"
        );

    statusFilter?.addEventListener(
        "change",
        () => {
            StoriesState.status =
                statusFilter.value;

            applyStoriesFilters();
        }
    );

    const sortFilter =
        storiesGetElement(
            "storiesSortFilter"
        );

    sortFilter?.addEventListener(
        "change",
        () => {
            StoriesState.sort =
                sortFilter.value;

            applyStoriesFilters();
        }
    );

    storiesGetElement(
        "resetStoriesFiltersButton"
    )?.addEventListener(
        "click",
        () => {
            StoriesState.search = "";
            StoriesState.category = "all";
            StoriesState.status = "all";
            StoriesState.sort = "newest";

            if (searchInput) {
                searchInput.value = "";
            }

            if (categoryFilter) {
                categoryFilter.value = "all";
            }

            if (statusFilter) {
                statusFilter.value = "all";
            }

            if (sortFilter) {
                sortFilter.value = "newest";
            }

            applyStoriesFilters();
        }
    );

    storiesGetElement(
        "addStoryButton"
    )?.addEventListener(
        "click",
        openAddStoryModal
    );

    storiesGetElement(
        "headerAddStoryButton"
    )?.addEventListener(
        "click",
        openAddStoryModal
    );

    storiesGetElement(
        "addStoryForm"
    )?.addEventListener(
        "submit",
        submitStoryForm
    );

    storiesGetElement(
        "shareStoryButton"
    )?.addEventListener(
        "click",
        shareSelectedStory
    );

    storiesGetElement(
        "exportStoriesButton"
    )?.addEventListener(
        "click",
        exportStories
    );

    window.addEventListener(
        "storage",
        (event) => {
            if (
                event.key ===
                StoriesStorageKeys.stories
            ) {
                const stories =
                    storiesReadStorage(
                        StoriesStorageKeys.stories,
                        []
                    );

                StoriesState.stories =
                    Array.isArray(stories)
                        ? stories
                        : [];

                applyStoriesFilters();
                renderStoriesStatistics();
            }
        }
    );
}

/* =========================================================
   التشغيل
========================================================= */

function initializeStoriesPage() {
    injectStoriesStyles();
    loadStoriesData();
    initializeStoriesEvents();

    document.body.classList.add(
        "stories-page-ready"
    );

    document.dispatchEvent(
        new CustomEvent(
            "projectJourneyStoriesReady",
            {
                detail: {
                    storiesCount:
                        StoriesState.stories.length
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
        initializeStoriesPage
    );
} else {
    initializeStoriesPage();
}

/* =========================================================
   إتاحة الوظائف
========================================================= */

window.StoriesState =
    StoriesState;

window.openStory =
    openStory;

window.likeStory =
    likeStory;

window.openAddStoryModal =
    openAddStoryModal;

window.submitStoryForm =
    submitStoryForm;

window.exportStories =
    exportStories;

window.shareSelectedStory =
    shareSelectedStory;