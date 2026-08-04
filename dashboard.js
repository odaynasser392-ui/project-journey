"use strict";

/* ==========================================================
   Project Journey
   Dashboard Controller
   js/dashboard.js
========================================================== */

const DashboardState = {

    currentUser: null,

    projects: [],
    analyses: [],
    stories: [],
    notifications: [],
    tasks: [],

    currentProject: null,

    statistics: {

        totalProjects: 0,
        completedProjects: 0,
        runningProjects: 0,
        averageScore: 0,
        totalStories: 0,
        totalNotifications: 0

    },

    charts: {},

    filters: {

        search: "",
        status: "all",
        category: "all"

    }

};

/* ==========================================================
   Local Storage Keys
========================================================== */

const DashboardStorage = {

    user: "projectJourneyCurrentUser",
    projects: "projectJourneyProjects",
    analyses: "projectJourneyAnalyses",
    stories: "projectJourneyStories",
    notifications: "projectJourneyNotifications",
    tasks: "projectJourneyTasks"

};

/* ==========================================================
   Helpers
========================================================== */

function dashboardGet(id){

    return document.getElementById(id);

}

function dashboardSelect(selector){

    return document.querySelector(selector);

}

function dashboardAll(selector){

    return Array.from(
        document.querySelectorAll(selector)
    );

}

function dashboardRead(key,fallback=[]){

    try{

        const value=localStorage.getItem(key);

        if(value===null){

            return fallback;

        }

        return JSON.parse(value);

    }catch(error){

        console.error(error);

        return fallback;

    }

}

function dashboardSave(key,data){

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}

/* ==========================================================
   Load Data
========================================================== */

function dashboardLoadData(){

    DashboardState.currentUser=
    dashboardRead(
        DashboardStorage.user,
        null
    );

    DashboardState.projects=
    dashboardRead(
        DashboardStorage.projects,
        []
    );

    DashboardState.analyses=
    dashboardRead(
        DashboardStorage.analyses,
        []
    );

    DashboardState.stories=
    dashboardRead(
        DashboardStorage.stories,
        []
    );

    DashboardState.notifications=
    dashboardRead(
        DashboardStorage.notifications,
        []
    );

    DashboardState.tasks=
    dashboardRead(
        DashboardStorage.tasks,
        []
    );

}

/* ==========================================================
   Statistics
========================================================== */

function dashboardCalculateStatistics(){

    const totalProjects=
    DashboardState.projects.length;

    const completed=
    DashboardState.projects.filter(
        project=>project.status==="completed"
    ).length;

    const running=
    DashboardState.projects.filter(
        project=>project.status==="running"
    ).length;

    let average=0;

    if(
        DashboardState.analyses.length
    ){

        average=Math.round(

            DashboardState.analyses.reduce(

                (sum,item)=>

                sum+(item.overallScore||0),

                0

            )/

            DashboardState.analyses.length

        );

    }

    DashboardState.statistics.totalProjects=
    totalProjects;

    DashboardState.statistics.completedProjects=
    completed;

    DashboardState.statistics.runningProjects=
    running;

    DashboardState.statistics.averageScore=
    average;

    DashboardState.statistics.totalStories=
    DashboardState.stories.length;

    DashboardState.statistics.totalNotifications=
    DashboardState.notifications.length;

}

/* ==========================================================
   Cards
========================================================== */

function dashboardUpdateCards(){

    const map={

        dashboardProjects:
        DashboardState.statistics.totalProjects,

        dashboardCompleted:
        DashboardState.statistics.completedProjects,

        dashboardRunning:
        DashboardState.statistics.runningProjects,

        dashboardScore:
        DashboardState.statistics.averageScore+"%",

        dashboardStories:
        DashboardState.statistics.totalStories,

        dashboardNotifications:
        DashboardState.statistics.totalNotifications

    };

    Object.entries(map).forEach(

        ([id,value])=>{

            const element=
            dashboardGet(id);

            if(element){

                element.textContent=value;

            }

        }

    );

}

/* ==========================================================
   Welcome
========================================================== */

function dashboardWelcome(){

    const title=
    dashboardGet(
        "dashboardWelcome"
    );

    if(!title){

        return;

    }

    if(DashboardState.currentUser){

        title.textContent=

        "مرحباً "

        +(DashboardState.currentUser.fullName||

        DashboardState.currentUser.name||

        "مستخدم");

    }

}

/* ==========================================================
   Recent Projects
========================================================== */

function dashboardRecentProjects(){

    const container=
    dashboardGet(
        "dashboardProjectsList"
    );

    if(!container){

        return;

    }

    container.innerHTML="";

    if(
        DashboardState.projects.length===0
    ){

        container.innerHTML=`

        <div class="empty-box">

        لا توجد مشاريع بعد

        </div>

        `;

        return;

    }

    DashboardState.projects

    .slice(0,5)

    .forEach(project=>{

        const card=document.createElement(
            "div"
        );

        card.className=
        "dashboard-project";

        card.innerHTML=`

        <h3>${project.name||project.title}</h3>

        <p>${project.category||""}</p>

        <span>

        ${project.status||"new"}

        </span>

        `;

        container.appendChild(card);

    });

}

/* ==========================================================
   Recent Analysis
========================================================== */

function dashboardRecentAnalysis(){

    const container=
    dashboardGet(
        "dashboardAnalysisList"
    );

    if(!container){

        return;

    }

    container.innerHTML="";

    DashboardState.analyses

    .slice(0,5)

    .forEach(item=>{

        const card=document.createElement(
            "div"
        );

        card.className="analysis-card";

        card.innerHTML=`

        <strong>

        ${item.projectName}

        </strong>

        <small>

        ${item.overallScore}/100

        </small>

        `;

        container.appendChild(card);

    });

}

/* ==========================================================
   Notifications
========================================================== */

function dashboardNotifications(){

    const container=
    dashboardGet(
        "dashboardNotificationsList"
    );

    if(!container){

        return;

    }

    container.innerHTML="";

    DashboardState.notifications

    .slice(0,6)

    .forEach(notification=>{

        const div=document.createElement(
            "div"
        );

        div.className="notification-item";

        div.innerHTML=`

        <h4>

        ${notification.title}

        </h4>

        <p>

        ${notification.message}

        </p>

        `;

        container.appendChild(div);

    });

}

/* ==========================================================
   Tasks
========================================================== */

function dashboardTasks(){

    const container=
    dashboardGet(
        "dashboardTasks"
    );

    if(!container){

        return;

    }

    container.innerHTML="";

    DashboardState.tasks.forEach(task=>{

        const item=document.createElement(
            "label"
        );

        item.className="task-item";

        item.innerHTML=`

        <input
        type="checkbox"
        ${task.done?"checked":""}
        >

        <span>

        ${task.title}

        </span>

        `;

        container.appendChild(item);

    });

}

/* ==========================================================
   Search
========================================================== */

function dashboardSearch(){

    const input=
    dashboardGet(
        "dashboardSearch"
    );

    if(!input){

        return;

    }

    input.addEventListener(

        "input",

        ()=>{

            DashboardState.filters.search=

            input.value
            .toLowerCase();

            dashboardFilterProjects();

        }

    );

}

function dashboardFilterProjects(){

    const cards=

    dashboardAll(
        ".dashboard-project"
    );

    cards.forEach(card=>{

        const text=

        card.textContent
        .toLowerCase();

        card.style.display=

        text.includes(

            DashboardState.filters.search

        )

        ?"block"

        :"none";

    });

}

/* ==========================================================
   Quick Buttons
========================================================== */

function dashboardQuickButtons(){

    dashboardGet(
        "btnNewProject"
    )?.addEventListener(

        "click",

        ()=>{

            location.href="idea.html";

        }

    );

    dashboardGet(
        "btnAnalysis"
    )?.addEventListener(

        "click",

        ()=>{

            location.href="analysis.html";

        }

    );

    dashboardGet(
        "btnStories"
    )?.addEventListener(

        "click",

        ()=>{

            location.href="stories.html";

        }

    );

    dashboardGet(
        "btnProfile"
    )?.addEventListener(

        "click",

        ()=>{

            location.href="profile.html";

        }

    );

}

/* ==========================================================
   Auto Refresh
========================================================== */

function dashboardRefresh(){

    dashboardLoadData();

    dashboardCalculateStatistics();

    dashboardUpdateCards();

    dashboardRecentProjects();

    dashboardRecentAnalysis();

    dashboardNotifications();

    dashboardTasks();

}

function dashboardAutoRefresh(){

    setInterval(

        dashboardRefresh,

        30000

    );

}

/* ==========================================================
   Init
========================================================== */

function dashboardInit(){

    dashboardLoadData();

    dashboardCalculateStatistics();

    dashboardWelcome();

    dashboardUpdateCards();

    dashboardRecentProjects();

    dashboardRecentAnalysis();

    dashboardNotifications();

    dashboardTasks();

    dashboardSearch();

    dashboardQuickButtons();

    dashboardAutoRefresh();

}

document.addEventListener(

    "DOMContentLoaded",

    dashboardInit

);