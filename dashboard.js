let currentStep = 1;
const totalSteps = 5;
let currentQuestion = 1;
let selectedGuess = null;
let finalSequenceStarted = false;
let candlesRemaining = 3;

const birthdayMusic =
    document.getElementById("birthdayMusic");

const musicToggle =
    document.getElementById("musicToggle");


function updateMusicButton() {

    if (!musicToggle || !birthdayMusic) {
        return;
    }

    if (birthdayMusic.muted) {
        musicToggle.innerText = "🔇";
    }
    else {
        musicToggle.innerText = "🔊";
    }

}


function startBirthdayMusic() {

    if (!birthdayMusic) {
        return;
    }

    const savedTime =
        Number(
            sessionStorage.getItem(
                "birthdayMusicTime"
            ) || 0
        );

    const restoreMusicPosition =
        function () {

            if (
                savedTime > 0 &&
                Number.isFinite(
                    birthdayMusic.duration
                ) &&
                savedTime <
                birthdayMusic.duration
            ) {

                birthdayMusic.currentTime =
                    savedTime;

            }

        };


    if (
        birthdayMusic.readyState >= 1
    ) {

        restoreMusicPosition();

    }
    else {

        birthdayMusic.addEventListener(
            "loadedmetadata",
            restoreMusicPosition,
            {
                once: true
            }
        );

    }


    birthdayMusic
        .play()
        .then(
            function () {

                sessionStorage.setItem(
                    "birthdayMusicPlaying",
                    "true"
                );

            }
        )
        .catch(
            function () {
            }
        );

}


function saveMusicState() {

    if (!birthdayMusic) {
        return;
    }

    sessionStorage.setItem(
        "birthdayMusicTime",
        String(
            birthdayMusic.currentTime || 0
        )
    );

}


if (birthdayMusic) {

    birthdayMusic.muted =
        sessionStorage.getItem(
            "birthdayMusicMuted"
        ) === "true";

}


updateMusicButton();


window.addEventListener(
    "load",
    function () {

        startBirthdayMusic();

        updateMusicButton();

    }
);


if (musicToggle) {

    musicToggle.addEventListener(
        "click",
        function () {

            if (!birthdayMusic) {
                return;
            }

            birthdayMusic.muted =
                !birthdayMusic.muted;

            sessionStorage.setItem(
                "birthdayMusicMuted",
                birthdayMusic.muted
                    ? "true"
                    : "false"
            );

            if (
                !birthdayMusic.muted
            ) {

                birthdayMusic
                    .play()
                    .catch(
                        function () {}
                    );

            }

            updateMusicButton();

        }
    );

}


window.addEventListener(
    "pagehide",
    saveMusicState
);


function get(id) {

    return document.getElementById(id);

}


function showStep(stepNumber) {

    const steps =
        document.querySelectorAll(
            ".investigation-step"
        );


    steps.forEach(
        function (step) {

            step.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.querySelector(
            `.investigation-step[data-step="${stepNumber}"]`
        );


    if (!target) {
        return;
    }


    target.classList.add(
        "active"
    );


    currentStep =
        stepNumber;


    document.body.classList.remove(
        "birthday-stage-1",
        "birthday-stage-2",
        "birthday-stage-3",
        "birthday-stage-4",
        "birthday-stage-5"
    );


    document.body.classList.add(
        "birthday-stage-"
        + stepNumber
    );


    const progress =
        get("journeyProgress");


    if (progress) {

        const percentage =
            (
                stepNumber /
                totalSteps
            ) * 100;

        progress.style.width =
            percentage + "%";

    }


    const counter =
        get("stepCounter");


    if (counter) {

        counter.innerText =
            "STEP "
            +
            String(
                stepNumber
            ).padStart(
                2,
                "0"
            )
            +
            " / 05";

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    if (
        stepNumber === 5
    ) {

        startFinalBirthdaySequence();

    }

}


const guessOptions =
    document.querySelectorAll(
        ".guess-option"
    );


guessOptions.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                if (

                    get(
                        "analysisLoading"
                    )

                    &&

                    !get(
                        "analysisLoading"
                    )
                    .classList
                    .contains(
                        "hidden"
                    )

                ) {

                    return;

                }


                selectedGuess =
                    Number(
                        button.dataset.value
                    );


                document
                    .querySelectorAll(
                        `.guess-option[data-question="${button.dataset.question}"]`
                    )
                    .forEach(
                        function (item) {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                button.classList.add(
                    "selected"
                );


                runGuessAnalysis(

                    button.dataset.question,

                    selectedGuess

                );

            }
        );

    }
);


const questionData = {

    cute: {

        actual: 99,

        label: "CUTENESS",

        messages: {

            high:
                "Okay... at least you know yourself. 😂",

            medium:
                "Not bad... but you underestimated yourself.",

            low:
                "That answer was WAY too humble. 😂"

        }

    },


    chaos: {

        actual: 94,

        label: "CHAOS",

        messages: {

            high:
                "You know exactly how dangerous you are. 😈",

            medium:
                "You underestimated the chaos.",

            low:
                "Scientists are concerned about this answer. 💀"

        }

    },


    drama: {

        actual: 91,

        label: "DRAMA",

        messages: {

            high:
                "Finally... an honest answer. 😂",

            medium:
                "The evidence says there is MUCH more drama.",

            low:
                "The investigation strongly disagrees. 🎭"

        }

    },


    confuse: {

        actual: 100,

        label: "CONFUSING SANJAY",

        messages: {

            high:
                "Correct. Unfortunately. 💀",

            medium:
                "You still don't realize the damage you cause. 😂",

            low:
                "Sanjay would like to formally disagree. 🤦"

        }

    }

};


function runGuessAnalysis(
    question,
    guess
) {

    const data =
        questionData[question];


    if (!data) {
        return;
    }


    document
        .querySelectorAll(
            ".guess-question"
        )
        .forEach(
            function (item) {

                item.style.pointerEvents =
                    "none";

            }
        );


    const loading =
        get("analysisLoading");

    const loadingFill =
        get("loadingFill");

    const loadingPercent =
        get("loadingPercent");

    const loadingText =
        get("loadingText");


    if (!loading) {
        return;
    }


    loading.classList.remove(
        "hidden"
    );


    loadingFill.style.width =
        "0%";


    loadingPercent.innerText =
        "0%";


    const messages = [

        "Reading personality data...",

        "Comparing your answer...",

        "Checking historical evidence...",

        "Consulting highly qualified scientists...",

        "Calculating Sravuu Index...",

        "Finalizing results..."

    ];


    let progress = 0;


    const interval =
        setInterval(
            function () {

                progress += 2;


                loadingFill.style.width =
                    progress + "%";


                loadingPercent.innerText =
                    progress + "%";


                const index =
                    Math.floor(

                        progress /

                        (
                            100 /
                            messages.length
                        )

                    );


                if (messages[index]) {

                    loadingText.innerText =
                        messages[index];

                }


                if (
                    progress >= 100
                ) {

                    clearInterval(
                        interval
                    );


                    revealGuessResult(

                        question,

                        guess,

                        data

                    );

                }

            },

            35

        );

}


function revealGuessResult(
    question,
    guess,
    data
) {

    const loading =
        get("analysisLoading");


    const result =
        get("guessResult");


    const resultText =
        get("guessResultText");


    const comparison =
        get("guessComparison");


    const nextButton =
        get("nextQuestion");


    loading.classList.add(
        "hidden"
    );


    result.classList.remove(
        "hidden"
    );


    resultText.innerHTML =

        data.label

        +

        ": <strong>"

        +

        data.actual

        +

        "%</strong>";


    const difference =
        Math.abs(
            guess -
            data.actual
        );


    if (
        difference === 0
    ) {

        comparison.innerHTML =

            "🎯 <strong>PERFECT GUESS!</strong><br>"

            +

            data.messages.high;

    }

    else if (
        difference <= 20
    ) {

        comparison.innerHTML =

            "😏 Your guess: "

            +

            guess

            +

            "%<br>"

            +

            data.messages.medium;

    }

    else {

        comparison.innerHTML =

            "😂 Your guess: "

            +

            guess

            +

            "%<br>"

            +

            data.messages.low;

    }


    document
        .querySelectorAll(
            `.guess-option[data-question="${question}"]`
        )
        .forEach(
            function (button) {

                button.disabled =
                    true;

            }
        );


    nextButton.classList.remove(
        "hidden"
    );


    nextButton.onclick =
        function () {

            goToNextQuestion();

        };

}


function goToNextQuestion() {

    const current =
        get(
            "question"
            +
            currentQuestion
        );


    if (current) {

        current.classList.add(
            "hidden"
        );

    }


    currentQuestion++;


    if (
        currentQuestion <= 4
    ) {

        const next =
            get(
                "question"
                +
                currentQuestion
            );


        if (next) {

            next.classList.remove(
                "hidden"
            );

        }


        get(
            "guessResult"
        )
        .classList
        .add(
            "hidden"
        );


        get(
            "nextQuestion"
        )
        .classList
        .add(
            "hidden"
        );


        document
            .querySelectorAll(
                ".guess-question"
            )
            .forEach(
                function (item) {

                    item.style.pointerEvents =
                        "auto";

                }
            );

    }

    else {

        finishAnalysis();

    }

}


function finishAnalysis() {

    const result =
        get("analysisResult");


    if (result) {

        result.classList.remove(
            "hidden"
        );


        result.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    const next =
        get("step1Next");


    if (next) {

        next.classList.remove(
            "hidden"
        );

    }

}


if (
    get("step1Next")
) {

    get(
        "step1Next"
    )
    .addEventListener(
        "click",
        function () {

            showStep(2);

        }
    );

}


const personalityOptions =
    document.querySelectorAll(
        ".personality-option"
    );


personalityOptions.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                personalityOptions.forEach(
                    function (item) {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                button.classList.add(
                    "selected"
                );


                runPersonalityAnalysis(

                    Number(
                        button.dataset.value
                    )

                );

            }
        );

    }
);


function runPersonalityAnalysis(
    guess
) {

    const loading =
        get("personalityLoading");


    const fill =
        get(
            "personalityLoadingFill"
        );


    const percent =
        get(
            "personalityLoadingPercent"
        );


    const text =
        get(
            "personalityLoadingText"
        );


    const result =
        get(
            "personalityResult"
        );


    loading.classList.remove(
        "hidden"
    );


    result.classList.add(
        "hidden"
    );


    fill.style.width =
        "0%";


    percent.innerText =
        "0%";


    const messages = [

        "Checking innocence levels...",

        "Scanning suspicious behavior...",

        "Reviewing chaos history...",

        "Searching for evidence...",

        "Calculating innocence percentage..."

    ];


    let progress = 0;


    const interval =
        setInterval(
            function () {

                progress += 2;


                fill.style.width =
                    progress + "%";


                percent.innerText =
                    progress + "%";


                const index =
                    Math.floor(
                        progress / 20
                    );


                if (messages[index]) {

                    text.innerText =
                        messages[index];

                }


                if (
                    progress >= 100
                ) {

                    clearInterval(
                        interval
                    );


                    loading.classList.add(
                        "hidden"
                    );


                    result.classList.remove(
                        "hidden"
                    );


                    const comparison =
                        get(
                            "personalityComparison"
                        );


                    const difference =
                        Math.abs(
                            guess - 12
                        );


                    if (
                        difference === 0
                    ) {

                        comparison.innerHTML =

                            "🎯 <strong>HOW DID YOU KNOW?!</strong><br>"

                            +

                            "You actually guessed it correctly.";

                    }

                    else if (
                        guess > 12
                    ) {

                        comparison.innerHTML =

                            "😂 You guessed "

                            +

                            guess

                            +

                            "% innocence.<br>"

                            +

                            "Actual result: <strong>12%</strong>.";

                    }

                    else {

                        comparison.innerHTML =

                            "💀 You somehow guessed lower than reality.<br>"

                            +

                            "Even the scientists are impressed.";

                    }

                }

            },

            40

        );

}


if (
    get("step2Next")
) {

    get(
        "step2Next"
    )
    .addEventListener(
        "click",
        function () {

            showStep(3);

        }
    );

}


if (
    get("step3Next")
) {

    get(
        "step3Next"
    )
    .addEventListener(
        "click",
        function () {

            showStep(4);

        }
    );

}


if (
    get("step4Next")
) {

    get(
        "step4Next"
    )
    .addEventListener(
        "click",
        function () {

            showStep(5);

        }
    );

}


function startFinalBirthdaySequence() {

    if (
        finalSequenceStarted
    ) {

        return;

    }


    finalSequenceStarted =
        true;


    const unlockButton =
        get("unlockBirthday");


    if (unlockButton) {

        unlockButton.addEventListener(
            "click",
            startBirthdayTerminal
        );

    }

}


function startBirthdayTerminal() {

    const lock =
        get("finalLockScreen");


    const terminal =
        get("birthdayTerminal");


    if (lock) {

        lock.classList.add(
            "hidden"
        );

    }


    if (terminal) {

        terminal.classList.remove(
            "hidden"
        );

    }


    const terminalLines =
        get("terminalLines");


    const progressFill =
        get(
            "terminalProgressFill"
        );


    const progressText =
        get(
            "terminalPercent"
        );


    const lines = [

        ">> Initializing birthday.exe",

        ">> Connecting to Sravuu database...",

        ">> Searching for birthday evidence...",

        ">> Sravuu detected.",

        ">> WARNING: AWESOMENESS LEVEL = 100%",

        ">> WARNING: CHAOS LEVEL = UNSTABLE",

        ">> Friendship value = ∞",

        ">> Unlocking final birthday surprise..."

    ];


    let index = 0;


    const lineInterval =
        setInterval(
            function () {

                if (
                    index >=
                    lines.length
                ) {

                    clearInterval(
                        lineInterval
                    );


                    runTerminalProgress();


                    return;

                }


                const line =
                    document.createElement(
                        "div"
                    );


                line.className =
                    "terminal-line";


                line.innerText =
                    lines[index];


                terminalLines.appendChild(
                    line
                );


                index++;

            },

            650

        );

}


function runTerminalProgress() {

    const fill =
        get(
            "terminalProgressFill"
        );


    const percent =
        get(
            "terminalPercent"
        );


    let value = 0;


    const interval =
        setInterval(
            function () {

                value++;


                fill.style.width =
                    value + "%";


                percent.innerText =
                    value + "%";


                if (
                    value >= 100
                ) {

                    clearInterval(
                        interval
                    );


                    setTimeout(
                        revealCake,
                        700
                    );

                }

            },

            25

        );

}


function revealCake() {

    const terminal =
        get(
            "birthdayTerminal"
        );


    const cake =
        get(
            "birthdayCakeArea"
        );


    if (terminal) {

        terminal.classList.add(
            "hidden"
        );

    }


    if (cake) {

        cake.classList.remove(
            "hidden"
        );


        cake.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    updateCandleCounter();

}


const candles =
    document.querySelectorAll(
        ".candle-wrapper"
    );


candles.forEach(
    function (candle) {

        candle.addEventListener(
            "click",
            function () {

                extinguishCandle(
                    candle
                );

            }
        );

    }
);


function extinguishCandle(
    candle
) {

    if (
        candle.classList.contains(
            "off"
        )
    ) {

        return;

    }


    const candleNumber =
        Number(
            candle.dataset.candle
        );


    candle.classList.add(
        "off"
    );


    candlesRemaining--;


    const message =
        get(
            "candleMessage"
        );


    if (message) {

        if (
            candleNumber === 1
        ) {

            message.innerText =
                "🔥 Cuteness candle extinguished!";

        }

        else if (
            candleNumber === 2
        ) {

            message.innerText =
                "🔥 Chaos candle extinguished!";

        }

        else {

            message.innerText =
                "🔥 Final mystery candle extinguished!";

        }

    }


    const status =
        get(
            "micStatus"
        );


    if (status) {

        if (
            candlesRemaining > 0
        ) {

            status.innerText =
                "Keep going... "
                +
                candlesRemaining
                +
                " candle"
                +
                (
                    candlesRemaining === 1
                        ? ""
                        : "s"
                )
                +
                " remaining. 👀";

        }

        else {

            status.innerText =
                "All candles are out! 🎉";

        }

    }


    updateCandleCounter();


    if (
        candlesRemaining === 0
    ) {

        setTimeout(
            finishBirthday,
            800
        );

    }

}


function updateCandleCounter() {

    const counter =
        get(
            "candleCounter"
        );


    if (!counter) {
        return;
    }


    counter.innerHTML =
        "Candles remaining: <strong>"
        +
        candlesRemaining
        +
        "</strong>";

}


function finishBirthday() {

    const cake =
        get(
            "birthdayCakeArea"
        );


    const wish =
        get(
            "birthdayWish"
        );


    if (cake) {

        cake.classList.add(
            "hidden"
        );

    }


    if (wish) {

        wish.classList.remove(
            "hidden"
        );


        wish.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    document.body.classList.add(
        "birthday-final-reveal"
    );


    createConfetti();


    createFinalCelebrationParticles();


    setTimeout(
        typeBirthdayMessage,
        700
    );

}


function typeBirthdayMessage() {

    const element =
        get(
            "wishText"
        );


    if (!element) {
        return;
    }


    const message =
        "Happy Birthday, Sravuu! 💗 "
        +
        "I hope your day is filled with happiness, "
        +
        "laughter and all the little things that "
        +
        "make you smile. Stay the same crazy, "
        +
        "funny and amazing person you are. 😂 "
        +
        "Wishing you an amazing year ahead! 🎂✨";


    let index = 0;


    element.innerHTML =
        "";


    const interval =
        setInterval(
            function () {

                element.innerHTML +=
                    message[index];


                index++;


                if (
                    index >=
                    message.length
                ) {

                    clearInterval(
                        interval
                    );


                    setTimeout(
                        function () {

                            const secret =
                                get(
                                    "secretArea"
                                );


                            if (secret) {

                                secret.classList.remove(
                                    "hidden"
                                );

                            }

                        },

                        800

                    );

                }

            },

            35

        );

}


function createConfetti() {

    const emojis = [

        "🎉",
        "🎊",
        "💗",
        "💕",
        "✨",
        "🎈",
        "⭐",
        "🥳"

    ];


    for (
        let i = 0;
        i < 60;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        piece.innerText =
            emojis[
                Math.floor(
                    Math.random()
                    *
                    emojis.length
                )
            ];


        piece.style.position =
            "fixed";


        piece.style.left =
            Math.random() * 100
            + "%";


        piece.style.top =
            "-30px";


        piece.style.fontSize =
            (
                18
                +
                Math.random() * 22
            )
            +
            "px";


        piece.style.zIndex =
            "9999";


        piece.style.pointerEvents =
            "none";


        document.body.appendChild(
            piece
        );


        const duration =
            2500
            +
            Math.random() * 3000;


        const rotation =
            Math.random() * 720
            -
            360;


        piece.animate(

            [

                {

                    transform:
                        "translateY(0) rotate(0deg)",

                    opacity: 1

                },

                {

                    transform:
                        "translateY(110vh) rotate("
                        +
                        rotation
                        +
                        "deg)",

                    opacity: 0.8

                }

            ],

            {

                duration:
                    duration,

                easing:
                    "cubic-bezier(.2,.7,.3,1)",

                fill:
                    "forwards"

            }

        );


        setTimeout(

            function () {

                piece.remove();

            },

            duration + 100

        );

    }

}


function createFinalCelebrationParticles() {

    const items = [

        "🎉",
        "🎊",
        "💗",
        "💕",
        "✨",
        "🎈",
        "⭐",
        "🥳"

    ];


    for (
        let i = 0;
        i < 24;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );


        particle.className =
            "birthday-particle";


        particle.innerText =
            items[
                Math.floor(
                    Math.random()
                    *
                    items.length
                )
            ];


        particle.style.left =
            (
                5
                +
                Math.random() * 90
            )
            +
            "%";


        particle.style.top =
            (
                20
                +
                Math.random() * 55
            )
            +
            "%";


        particle.style.animationDelay =
            (
                Math.random() * 1.2
            )
            +
            "s";


        document.body.appendChild(
            particle
        );


        setTimeout(

            function () {

                particle.remove();

            },

            3500

        );

    }

}


const secretButton =
    get(
        "secretButton"
    );


if (secretButton) {

    secretButton.addEventListener(
        "click",
        function () {

            const message =
                get(
                    "secretMessage"
                );


            if (message) {

                message.classList.remove(
                    "hidden"
                );

            }


            secretButton.innerText =
                "Okay I clicked it 😭";


            createConfetti();

        }
    );

}


const celebrateAgain =
    get(
        "celebrateAgain"
    );


if (celebrateAgain) {

    celebrateAgain.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "birthdayMusicTime"
            );


            sessionStorage.removeItem(
                "birthdayMusicPlaying"
            );


            sessionStorage.removeItem(
                "birthdayMusicMuted"
            );


            window.location.href =
                "index.html";

        }
    );

}


updateCandleCounter();


showStep(1);


/* =====================================================
   DRAGGABLE BIRTHDAY PHOTOS
===================================================== */

(function () {

    const photos =
        document.querySelectorAll(
            ".birthday-photo-card"
        );


    photos.forEach(
        function (photo) {

            let dragging = false;

            let startX = 0;
            let startY = 0;

            let originalX = 0;
            let originalY = 0;

            let activePointerId = null;


            function getCurrentPosition() {

                originalX =
                    parseFloat(
                        getComputedStyle(photo)
                            .getPropertyValue(
                                "--drag-x"
                            )
                    ) || 0;


                originalY =
                    parseFloat(
                        getComputedStyle(photo)
                            .getPropertyValue(
                                "--drag-y"
                            )
                    ) || 0;

            }


            photo.addEventListener(
                "pointerdown",
                function (event) {

                    dragging = true;

                    activePointerId =
                        event.pointerId;


                    startX =
                        event.clientX;


                    startY =
                        event.clientY;


                    getCurrentPosition();


                    photo.setPointerCapture(
                        event.pointerId
                    );


                    photo.style.zIndex =
                        "20";


                    photo.style.cursor =
                        "grabbing";


                    event.preventDefault();

                }
            );


            photo.addEventListener(
                "pointermove",
                function (event) {

                    if (
                        !dragging ||
                        event.pointerId !==
                        activePointerId
                    ) {

                        return;

                    }


                    const moveX =
                        event.clientX -
                        startX;


                    const moveY =
                        event.clientY -
                        startY;


                    photo.style.setProperty(
                        "--drag-x",
                        (
                            originalX +
                            moveX
                        ) +
                        "px"
                    );


                    photo.style.setProperty(
                        "--drag-y",
                        (
                            originalY +
                            moveY
                        ) +
                        "px"
                    );


                    event.preventDefault();

                }
            );


            function stopDragging(
                event
            ) {

                if (!dragging) {

                    return;

                }


                if (

                    event &&

                    activePointerId !==
                    null &&

                    event.pointerId !==
                    activePointerId

                ) {

                    return;

                }


                dragging = false;


                activePointerId =
                    null;


                photo.style.cursor =
                    "grab";

            }


            photo.addEventListener(
                "pointerup",
                stopDragging
            );


            photo.addEventListener(
                "pointercancel",
                stopDragging
            );

        }
    );

})();