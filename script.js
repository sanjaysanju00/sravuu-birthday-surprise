/* =========================================
   LANDING PAGE
========================================= */

const startButton =
    document.getElementById("startButton");

const surpriseButton =
    document.getElementById("surpriseButton");

const birthdayScreen =
    document.getElementById("birthdayScreen");

const waitScreen =
    document.getElementById("waitScreen");


/* =========================================
   BIRTHDAY MUSIC
========================================= */

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

                /*
                    Some browsers block audible
                    autoplay.

                    The Start Celebration button
                    is a user interaction, so it
                    will start the music reliably.
                */

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


/* =========================================
   RESTORE MUTE STATE
========================================= */

if (birthdayMusic) {

    birthdayMusic.muted =
        sessionStorage.getItem(
            "birthdayMusicMuted"
        ) === "true";

}


updateMusicButton();


/* =========================================
   TRY AUTOMATIC MUSIC
========================================= */

window.addEventListener(
    "load",
    function () {

        startBirthdayMusic();

        updateMusicButton();

    }
);


/* =========================================
   MUSIC TOGGLE
========================================= */

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


/* =========================================
   SAVE MUSIC WHEN LEAVING
========================================= */

window.addEventListener(
    "pagehide",
    saveMusicState
);


/* =========================================
   START BUTTON
========================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        function () {

            /*
                User interaction allows the
                browser to start the music.
            */

            startBirthdayMusic();


            /*
                Extra celebration effect.
            */

            createLandingCelebration();


            birthdayScreen.classList.remove(
                "active"
            );


            waitScreen.classList.add(
                "active"
            );

        }
    );

}


/* =========================================
   SURPRISE BUTTON
========================================= */

if (surpriseButton) {

    surpriseButton.addEventListener(
        "click",
        function () {

            startBirthdayMusic();

            saveMusicState();


            window.location.href =
                "dashboard.html";

        }
    );

}


/* =========================================
   LANDING CELEBRATION PARTICLES
========================================= */

function createLandingCelebration() {

    const items = [

        "🎉",
        "💗",
        "✨",
        "🎈",
        "💕",
        "⭐",
        "🎀"

    ];


    for (
        let i = 0;
        i < 16;
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
                    * items.length
                )
            ];


        particle.style.left =
            (
                10 +
                Math.random() * 80
            )
            + "%";


        particle.style.top =
            (
                55 +
                Math.random() * 20
            )
            + "%";


        particle.style.animationDelay =
            (
                Math.random() * 0.5
            )
            + "s";


        document.body.appendChild(
            particle
        );


        setTimeout(
            function () {

                particle.remove();

            },
            2600
        );

    }

}