/* =========================================
   NUVIA — DAILY WELLNESS TRACKER
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const goals = [
    ...document.querySelectorAll("[data-goal]")
];

const scoreElement =
    document.getElementById("score");

const mainProgress =
    document.getElementById("mainProgress");

const scoreMessage =
    document.getElementById("scoreMessage");

const sleepInput =
    document.getElementById("sleepInput");

const stepsInput =
    document.getElementById("stepsInput");

const waterInput =
    document.getElementById("waterInput");

const sleepDisplay =
    document.getElementById("sleepDisplay");

const stepsDisplay =
    document.getElementById("stepsDisplay");

const waterDisplay =
    document.getElementById("waterDisplay");

const completedCount =
    document.getElementById("completedCount");

const routinePercentage =
    document.getElementById("routinePercentage");

const routineProgress =
    document.getElementById("routineProgress");

const streakCount =
    document.getElementById("streakCount");

const bestStreak =
    document.getElementById("bestStreak");

const streakMessage =
    document.getElementById("streakMessage");

const heroStreak =
    document.getElementById("heroStreak");

const heroStreakMessage =
    document.getElementById("heroStreakMessage");


/* =========================================
   MOTIVATION POPUP ELEMENTS
========================================= */

const motivationOverlay =
    document.getElementById("motivationOverlay");

const motivationIcon =
    document.getElementById("motivationIcon");

const motivationTitle =
    document.getElementById("motivationTitle");

const motivationMessage =
    document.getElementById("motivationMessage");

const modalClose =
    document.getElementById("modalClose");

const modalButton =
    document.getElementById("modalButton");

let motivationTimer;


/* =========================================
   DEFAULT DAILY DATA
========================================= */

const defaultDay = {
    goals: [false, false, false, false],

    sleep: 9,

    steps: 14000,

    water: 5
};


/* =========================================
   DATE FUNCTIONS
========================================= */

function getDateKey(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getPreviousDate(date) {

    const previous =
        new Date(date);

    previous.setDate(
        previous.getDate() - 1
    );

    return previous;
}


function dateKeyToUTC(key) {

    const [
        year,
        month,
        day
    ] = key.split("-").map(Number);

    return Date.UTC(
        year,
        month - 1,
        day
    );
}


/* =========================================
   STORAGE KEYS
========================================= */

function getTodayStorageKey() {

    return `Nuvia-day-${getDateKey()}`;
}


function getCompletedDays() {

    const saved =
        localStorage.getItem(
            "Nuvia-completed-days"
        );

    if (!saved) {
        return [];
    }

    try {

        return JSON.parse(saved);

    } catch {

        return [];
    }
}


function saveCompletedDays(days) {

    localStorage.setItem(
        "Nuvia-completed-days",
        JSON.stringify(days)
    );
}


/* =========================================
   LOAD TODAY'S DATA
========================================= */

function loadTodayData() {

    const saved =
        localStorage.getItem(
            getTodayStorageKey()
        );

    if (!saved) {

        return {
            ...defaultDay,
            goals: [...defaultDay.goals]
        };
    }

    try {

        const data =
            JSON.parse(saved);

        return {
            ...defaultDay,
            ...data,
            goals: Array.isArray(data.goals)
                ? data.goals
                : [...defaultDay.goals]
        };

    } catch {

        return {
            ...defaultDay,
            goals: [...defaultDay.goals]
        };
    }
}


/* =========================================
   SAVE TODAY'S DATA
========================================= */

function saveTodayData() {

    const data = {

        goals: goals.map(
            goal => goal.checked
        ),

        sleep:
            Number(sleepInput.value) || 0,

        steps:
            Number(stepsInput.value) || 0,

        water:
            Number(waterInput.value) || 0
    };


    localStorage.setItem(
        getTodayStorageKey(),
        JSON.stringify(data)
    );


    return data;
}


/* =========================================
   LOAD DATA INTO PAGE
========================================= */

function applyTodayData() {

    const data =
        loadTodayData();


    sleepInput.value =
        data.sleep;

    stepsInput.value =
        data.steps;

    waterInput.value =
        data.water;


    goals.forEach((goal, index) => {

        goal.checked =
            Boolean(data.goals[index]);

        updateGoalVisual(
            goal
        );
    });
}


/* =========================================
   GOAL VISUAL STATE
========================================= */

function updateGoalVisual(goal) {

    const label =
        goal.closest(".goal");

    if (!label) {
        return;
    }

    label.classList.toggle(
        "done",
        goal.checked
    );
}


/* =========================================
   WELLNESS SCORE
========================================= */

/*
    Score breakdown:

    Daily routine = 40%
    Sleep         = 20%
    Steps         = 20%
    Water         = 20%

    Each category is capped at 100%.
*/


function calculateWellnessScore() {

    const completed =
        goals.filter(
            goal => goal.checked
        ).length;


    const sleep =
        Number(sleepInput.value) || 0;


    const steps =
        Number(stepsInput.value) || 0;


    const water =
        Number(waterInput.value) || 0;


    /* Routine score */

    const routineScore =
        (completed / goals.length) * 40;


    /* Sleep score */

    const sleepPercentage =
        Math.min(
            sleep / 8,
            1
        );

    const sleepScore =
        sleepPercentage * 20;


    /* Steps score */

    const stepPercentage =
        Math.min(
            steps / 8000,
            1
        );

    const stepScore =
        stepPercentage * 20;


    /* Water score */

    const waterPercentage =
        Math.min(
            water / 8,
            1
        );

    const waterScore =
        waterPercentage * 20;


    const total =
        routineScore +
        sleepScore +
        stepScore +
        waterScore;


    return Math.round(
        Math.min(total, 100)
    );
}


/* =========================================
   UPDATE WELLNESS SCORE
========================================= */

function updateScore() {

    const score =
        calculateWellnessScore();


    scoreElement.textContent =
        `${score}%`;


    mainProgress.style.width =
        `${score}%`;


    /* Score message */

    if (score >= 90) {

        scoreMessage.textContent =
            "Outstanding! You're taking great care of yourself.";

    } else if (score >= 75) {

        scoreMessage.textContent =
            "Great job! You're having a strong wellness day.";

    } else if (score >= 60) {

        scoreMessage.textContent =
            "Good progress! Keep building your healthy habits.";

    } else if (score >= 40) {

        scoreMessage.textContent =
            "You're getting there. Keep going!";

    } else {

        scoreMessage.textContent =
            "Let's get started. Every small step counts.";
    }


    /* Update stats */

    updateStats();


    /* Update routine */

    updateRoutineProgress();
}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

    const sleep =
        Number(sleepInput.value) || 0;


    const steps =
        Number(stepsInput.value) || 0;


    const water =
        Number(waterInput.value) || 0;


    /* Sleep */

    const hours =
        Math.floor(sleep);

    const minutes =
        Math.round(
            (sleep - hours) * 60
        );


    if (minutes === 60) {

        sleepDisplay.textContent =
            `${hours + 1}h`;

    } else if (minutes === 0) {

        sleepDisplay.textContent =
            `${hours}h`;

    } else {

        sleepDisplay.textContent =
            `${hours}h ${minutes}m`;
    }


    /* Steps */

    stepsDisplay.textContent =
        steps.toLocaleString();


    /* Water */

    waterDisplay.textContent =
        `${water} / 8`;
}


/* =========================================
   ROUTINE PROGRESS
========================================= */

function updateRoutineProgress() {

    const completed =
        goals.filter(
            goal => goal.checked
        ).length;


    const percentage =
        Math.round(
            (completed / goals.length) * 100
        );


    completedCount.textContent =
        completed;


    routinePercentage.textContent =
        `${percentage}%`;


    routineProgress.style.width =
        `${percentage}%`;
}


/* =========================================
   UPDATE STREAK
========================================= */

function updateStreak() {

    const completedDays =
        getCompletedDays();


    const completedSet =
        new Set(completedDays);


    const today =
        new Date();


    const todayKey =
        getDateKey(today);


    /*
        If today isn't complete yet,
        we check from yesterday.

        This means the user can still see
        their current streak during the day.
    */

    let cursor;

    if (completedSet.has(todayKey)) {

        cursor = today;

    } else {

        cursor =
            getPreviousDate(today);
    }


    let streak = 0;


    while (
        completedSet.has(
            getDateKey(cursor)
        )
    ) {

        streak++;

        cursor =
            getPreviousDate(cursor);
    }


    /* Best streak */

    const best =
        calculateBestStreak(
            completedDays
        );


    streakCount.textContent =
        streak;


    heroStreak.textContent =
        streak;


    bestStreak.textContent =
        best;


    /* Messages */

    if (completedSet.has(todayKey)) {

        streakMessage.textContent =
            "You completed today's routine!";

        heroStreakMessage.textContent =
            "Amazing! Keep the streak alive.";

    } else if (streak > 0) {

        streakMessage.textContent =
            "Complete today's goals to keep it going.";

        heroStreakMessage.textContent =
            "Complete today to keep your streak.";

    } else {

        streakMessage.textContent =
            "Complete all 4 goals today.";

        heroStreakMessage.textContent =
            "Complete today's routine to build your streak.";
    }
}


/* =========================================
   BEST STREAK CALCULATION
========================================= */

function calculateBestStreak(days) {

    if (!days.length) {
        return 0;
    }


    const sorted =
        [...new Set(days)]
            .sort();


    let best = 1;

    let current = 1;


    for (
        let i = 1;
        i < sorted.length;
        i++
    ) {

        const previous =
            dateKeyToUTC(
                sorted[i - 1]
            );

        const currentDate =
            dateKeyToUTC(
                sorted[i]
            );


        const difference =
            Math.round(
                (currentDate - previous) /
                86400000
            );


        if (difference === 1) {

            current++;

            best =
                Math.max(
                    best,
                    current
                );

        } else {

            current = 1;
        }
    }


    return best;
}


/* =========================================
   CHECK DAILY COMPLETION
========================================= */

function checkDailyCompletion() {

    const allComplete =
        goals.every(
            goal => goal.checked
        );


    const todayKey =
        getDateKey();


    let completedDays =
        getCompletedDays();


    if (allComplete) {

        if (
            !completedDays.includes(
                todayKey
            )
        ) {

            completedDays.push(
                todayKey
            );
        }

    } else {

        completedDays =
            completedDays.filter(
                day => day !== todayKey
            );
    }


    saveCompletedDays(
        completedDays
    );


    updateStreak();
}


/* =========================================
   MOTIVATIONAL POPUP
========================================= */

function showMotivation(
    icon,
    title,
    message,
    buttonText = "Keep going"
) {

    clearTimeout(
        motivationTimer
    );


    motivationIcon.textContent =
        icon;

    motivationTitle.textContent =
        title;

    motivationMessage.textContent =
        message;

    modalButton.textContent =
        buttonText;


    motivationOverlay.classList.add(
        "show"
    );


    motivationTimer =
        setTimeout(
            hideMotivation,
            3500
        );
}


function hideMotivation() {

    motivationOverlay.classList.remove(
        "show"
    );
}


/* =========================================
   GOAL MOTIVATION
========================================= */

function getGoalMotivation(
    completed
) {

    switch (completed) {

        case 1:

            return {
                icon: "🌱",
                title: "Great start!",
                message:
                    "You've completed your first goal. Keep going and build some momentum!",
                button: "Keep going"
            };


        case 2:

            return {
                icon: "🔥",
                title: "You're halfway there!",
                message:
                    "Two goals down. Keep the momentum going and finish your routine!",
                button: "Let's go"
            };


        case 3:

            return {
                icon: "💪",
                title: "Almost there!",
                message:
                    "You've got just one more goal. Finish strong!",
                button: "Finish strong"
            };


        case 4:

            return {
                icon: "🎉",
                title: "Let's go!",
                message:
                    `You completed your daily routine! Your streak is now ${calculateCurrentStreak()} days.`,
                button: "Amazing"
            };


        default:

            return {
                icon: "🌱",
                title: "Keep going!",
                message:
                    "You can still finish your routine today.",
                button: "Keep going"
            };
    }
}


/* =========================================
   CURRENT STREAK FOR POPUP
========================================= */

function calculateCurrentStreak() {

    const completedDays =
        new Set(
            getCompletedDays()
        );


    const today =
        new Date();


    let cursor =
        completedDays.has(
            getDateKey(today)
        )
            ? today
            : getPreviousDate(today);


    let streak = 0;


    while (
        completedDays.has(
            getDateKey(cursor)
        )
    ) {

        streak++;

        cursor =
            getPreviousDate(cursor);
    }


    return streak;
}


/* =========================================
   GOAL CHECKBOX EVENTS
========================================= */

goals.forEach(goal => {

    goal.addEventListener(
        "change",
        () => {

            updateGoalVisual(
                goal
            );


            saveTodayData();


            updateScore();


            checkDailyCompletion();


            const completed =
                goals.filter(
                    goal => goal.checked
                ).length;


            const motivation =
                goal.checked
                    ? getGoalMotivation(
                        completed
                    )
                    : {
                        icon: "🌱",
                        title: "No worries!",
                        message:
                            "You can still finish your routine today. Keep going!",
                        button:
                            "I'll keep going"
                    };


            showMotivation(
                motivation.icon,
                motivation.title,
                motivation.message,
                motivation.button
            );

        }
    );
});


/* =========================================
   INPUT EVENTS
========================================= */

[
    sleepInput,
    stepsInput,
    waterInput
].forEach(input => {

    input.addEventListener(
        "input",
        () => {

            saveTodayData();

            updateScore();
        }
    );
});


/* =========================================
   POPUP EVENTS
========================================= */

modalClose.addEventListener(
    "click",
    hideMotivation
);


modalButton.addEventListener(
    "click",
    hideMotivation
);


motivationOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            motivationOverlay
        ) {

            hideMotivation();
        }
    }
);


/* =========================================
   SCROLL TO TRACKER
========================================= */

function scrollToTracker() {

    const tracker =
        document.getElementById(
            "tracker"
        );


    tracker.scrollIntoView({
        behavior: "smooth"
    });
}


/* =========================================
   INITIALIZE
========================================= */

function initializeNuvia() {

    applyTodayData();

    updateScore();

    updateStreak();
}


initializeNuvia();