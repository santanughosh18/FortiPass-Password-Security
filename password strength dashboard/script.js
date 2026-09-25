/* =========================================================
   FORTIPASS PASSWORD SECURITY ENGINE
========================================================= */

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const themeButton =
    document.getElementById("themeButton");

const strengthProgress =
    document.getElementById("strengthProgress");

const strengthText =
    document.getElementById("strengthText");

const score =
    document.getElementById("score");

const scoreCircle =
    document.getElementById("scoreCircle");

const scoreTitle =
    document.getElementById("scoreTitle");

const scoreDescription =
    document.getElementById("scoreDescription");

const scoreBadge =
    document.getElementById("scoreBadge");

const completionText =
    document.getElementById("completionText");


// =========================================================
// PASSWORD VISIBILITY
// =========================================================

togglePassword.addEventListener(
    "click",
    () => {

        const hidden =
            passwordInput.type === "password";

        passwordInput.type =
            hidden
                ? "text"
                : "password";

        togglePassword.textContent =
            hidden
                ? "◉"
                : "◉";

    }
);


// =========================================================
// INPUT LISTENER
// =========================================================

passwordInput.addEventListener(
    "input",
    analyzePassword
);


// =========================================================
// MAIN ANALYZER
// =========================================================

function analyzePassword() {

    const password =
        passwordInput.value;


    if (!password) {

        resetDashboard();

        return;
    }


    // -----------------------------------------------------
    // CHARACTER TYPES
    // -----------------------------------------------------

    const lower =
        /[a-z]/.test(password);

    const upper =
        /[A-Z]/.test(password);

    const number =
        /[0-9]/.test(password);

    const special =
        /[^A-Za-z0-9]/.test(password);


    let types = 0;

    if (lower) types++;
    if (upper) types++;
    if (number) types++;
    if (special) types++;


    // -----------------------------------------------------
    // LENGTH
    // -----------------------------------------------------

    const length =
        password.length;

    const lengthGood =
        length >= 12;


    // -----------------------------------------------------
    // PATTERN CHECKS
    // -----------------------------------------------------

    const repeated =
        hasRepeatedCharacters(password);

    const sequentialNumbers =
        hasSequentialNumbers(password);

    const sequentialLetters =
        hasSequentialLetters(password);

    const keyboard =
        hasKeyboardPattern(password);

    const common =
        hasCommonPattern(password);


    const predictable =
        repeated ||
        sequentialNumbers ||
        sequentialLetters ||
        keyboard ||
        common;


    // -----------------------------------------------------
    // ENTROPY ESTIMATE
    // -----------------------------------------------------

    let pool = 0;

    if (lower)
        pool += 26;

    if (upper)
        pool += 26;

    if (number)
        pool += 10;

    if (special)
        pool += 32;


    let entropy = 0;


    if (pool > 0) {

        entropy = Math.round(
            length *
            Math.log2(pool)
        );

    }


    // -----------------------------------------------------
    // SECURITY SCORE
    // -----------------------------------------------------

    let securityScore = 0;


    /*
        Length
    */

    if (length >= 20) {

        securityScore += 35;

    } else if (length >= 16) {

        securityScore += 32;

    } else if (length >= 12) {

        securityScore += 27;

    } else if (length >= 8) {

        securityScore += 16;

    } else {

        securityScore += 5;
    }


    /*
        Character diversity
    */

    securityScore +=
        types * 9;


    /*
        Entropy
    */

    if (entropy >= 100) {

        securityScore += 25;

    } else if (entropy >= 80) {

        securityScore += 20;

    } else if (entropy >= 60) {

        securityScore += 14;

    } else if (entropy >= 40) {

        securityScore += 8;
    }


    /*
        Pattern penalties
    */

    if (repeated)
        securityScore -= 7;

    if (sequentialNumbers)
        securityScore -= 8;

    if (sequentialLetters)
        securityScore -= 8;

    if (keyboard)
        securityScore -= 10;

    if (common)
        securityScore -= 25;


    securityScore =
        Math.max(
            0,
            Math.min(
                100,
                securityScore
            )
        );


    // -----------------------------------------------------
    // ISSUES
    // -----------------------------------------------------

    let issues = 0;

    if (!lengthGood)
        issues++;

    if (types < 3)
        issues++;

    if (predictable)
        issues++;

    if (entropy < 60)
        issues++;


    // -----------------------------------------------------
    // UPDATE EVERYTHING
    // -----------------------------------------------------

    updateStrength(
        securityScore
    );


    updateScore(
        securityScore
    );


    updateRequirements({

        length:
            lengthGood,

        upper,

        lower,

        number,

        special,

        unique:
            !predictable

    });


    updateSecurityOverview({

        length,
        lengthGood,

        types,

        predictable,

        entropy

    });


    // -----------------------------------------------------
    // METRICS
    // -----------------------------------------------------

    animateNumber(
        "lengthMetric",
        length
    );


    animateNumber(
        "typesMetric",
        types
    );


    animateNumber(
        "entropyMetric",
        entropy
    );


    animateNumber(
        "issuesMetric",
        issues
    );

}


// =========================================================
// STRENGTH
// =========================================================

function updateStrength(value) {

    strengthProgress.style.width =
        `${value}%`;


    if (value < 40) {

        strengthText.textContent =
            "Weak";

        strengthText.style.color =
            "#fb7185";

    }

    else if (value < 70) {

        strengthText.textContent =
            "Moderate";

        strengthText.style.color =
            "#fbbf24";

    }

    else if (value < 90) {

        strengthText.textContent =
            "Strong";

        strengthText.style.color =
            "#38bdf8";

    }

    else {

        strengthText.textContent =
            "Excellent";

        strengthText.style.color =
            "#34d399";
    }

}


// =========================================================
// SCORE
// =========================================================

function updateScore(value) {

    score.textContent =
        value;


    scoreCircle.style.background =
        `conic-gradient(
            #8b5cf6 ${value}%,
            #1c2434 ${value}%
        )`;


    if (value < 40) {

        scoreTitle.textContent =
            "High risk password";

        scoreTitle.style.color =
            "#fb7185";

        scoreBadge.textContent =
            "HIGH RISK";

        scoreBadge.style.color =
            "#fb7185";

        scoreBadge.style.background =
            "rgba(251,113,133,.08)";

        scoreDescription.textContent =
            "Several characteristics make this password easier to guess. Consider replacing it with a longer, unique password.";


    } else if (value < 70) {

        scoreTitle.textContent =
            "Needs improvement";

        scoreTitle.style.color =
            "#fbbf24";

        scoreBadge.textContent =
            "MODERATE";

        scoreBadge.style.color =
            "#fbbf24";

        scoreBadge.style.background =
            "rgba(251,191,36,.08)";

        scoreDescription.textContent =
            "The password has useful characteristics, but predictable patterns or insufficient length may reduce its resistance to guessing.";


    } else if (value < 90) {

        scoreTitle.textContent =
            "Strong characteristics";

        scoreTitle.style.color =
            "#38bdf8";

        scoreBadge.textContent =
            "STRONG";

        scoreBadge.style.color =
            "#38bdf8";

        scoreBadge.style.background =
            "rgba(56,189,248,.08)";

        scoreDescription.textContent =
            "This password has good length and complexity characteristics. Keep it unique and enable MFA.";


    } else {

        scoreTitle.textContent =
            "Excellent characteristics";

        scoreTitle.style.color =
            "#34d399";

        scoreBadge.textContent =
            "EXCELLENT";

        scoreBadge.style.color =
            "#34d399";

        scoreBadge.style.background =
            "rgba(52,211,153,.08)";

        scoreDescription.textContent =
            "This password meets many strong-password characteristics. Use it only for one account and protect the account with MFA.";
    }

}


// =========================================================
// REQUIREMENTS
// =========================================================

function updateRequirements(data) {

    const results = [

        [
            "requirementLength",
            data.length
        ],

        [
            "requirementUpper",
            data.upper
        ],

        [
            "requirementLower",
            data.lower
        ],

        [
            "requirementNumber",
            data.number
        ],

        [
            "requirementSpecial",
            data.special
        ],

        [
            "requirementUnique",
            data.unique
        ]

    ];


    let passed = 0;


    results.forEach(
        ([id, valid]) => {

            setRequirement(
                id,
                valid
            );

            if (valid)
                passed++;

        }
    );


    completionText.textContent =
        `${passed} / 6`;
}


function setRequirement(
    id,
    valid
) {

    const element =
        document.getElementById(id);

    if (!element)
        return;


    if (valid) {

        element.classList.add(
            "valid"
        );

    } else {

        element.classList.remove(
            "valid"
        );

    }
}


// =========================================================
// SECURITY OVERVIEW
// =========================================================

function updateSecurityOverview(data) {


    setSecurityCheck(

        "lengthIcon",
        "lengthResult",
        "lengthStatus",

        data.lengthGood,

        data.lengthGood
            ? "Good length"
            : "Use 12+ characters"

    );


    setSecurityCheck(

        "complexityIcon",
        "complexityResult",
        "complexityStatus",

        data.types >= 3,

        `${data.types}/4 character types detected`

    );


    setSecurityCheck(

        "patternIcon",
        "patternResult",
        "patternStatus",

        !data.predictable,

        data.predictable
            ? "Pattern detected"
            : "No obvious pattern"

    );


    setSecurityCheck(

        "entropyIcon",
        "entropyResult",
        "entropyStatus",

        data.entropy >= 60,

        `${data.entropy} bits estimated`

    );

}


function setSecurityCheck(
    iconId,
    resultId,
    statusId,
    good,
    message
) {

    const icon =
        document.getElementById(
            iconId
        );

    const result =
        document.getElementById(
            resultId
        );

    const status =
        document.getElementById(
            statusId
        );


    icon.classList.remove(
        "good",
        "bad"
    );


    status.classList.remove(
        "good",
        "bad"
    );


    if (good) {

        icon.classList.add(
            "good"
        );

        status.classList.add(
            "good"
        );

        icon.textContent =
            "✓";

        status.textContent =
            "PASS";

    } else {

        icon.classList.add(
            "bad"
        );

        status.classList.add(
            "bad"
        );

        icon.textContent =
            "!";

        status.textContent =
            "REVIEW";
    }


    result.textContent =
        message;
}


// =========================================================
// REPEATED CHARACTERS
// =========================================================

function hasRepeatedCharacters(
    password
) {

    return /(.)\1{2,}/.test(
        password
    );
}


// =========================================================
// NUMBER SEQUENCES
// =========================================================

function hasSequentialNumbers(
    password
) {

    const value =
        password.toLowerCase();


    const sequences = [

        "0123",
        "1234",
        "2345",
        "3456",
        "4567",
        "5678",
        "6789",

        "9876",
        "8765",
        "7654",
        "6543",
        "5432",
        "4321",
        "3210"

    ];


    return sequences.some(
        sequence =>
            value.includes(sequence)
    );
}


// =========================================================
// LETTER SEQUENCES
// =========================================================

function hasSequentialLetters(
    password
) {

    const value =
        password.toLowerCase();


    const sequences = [

        "abcd",
        "bcde",
        "cdef",
        "defg",
        "efgh",
        "fghi",
        "ghij",
        "hijk",
        "ijkl",
        "jklm",
        "klmn",
        "lmno",
        "mnop",
        "nopq",
        "opqr",
        "pqrs",
        "qrst",
        "rstu",
        "stuv",
        "tuvw",
        "uvwx",
        "vwxy",
        "wxyz"

    ];


    return sequences.some(
        sequence =>
            value.includes(sequence)
    );
}


// =========================================================
// KEYBOARD PATTERNS
// =========================================================

function hasKeyboardPattern(
    password
) {

    const value =
        password.toLowerCase();


    const patterns = [

        "qwerty",
        "qwert",
        "asdf",
        "asdfgh",
        "zxcv",
        "qaz",
        "wsx",
        "edc",
        "rfv",
        "1qaz",
        "2wsx",
        "3edc"

    ];


    return patterns.some(
        pattern =>
            value.includes(pattern)
    );
}


// =========================================================
// COMMON PATTERNS
// =========================================================

function hasCommonPattern(
    password
) {

    const value =
        password.toLowerCase();


    const common = [

        "password",
        "passw0rd",
        "admin",
        "administrator",
        "letmein",
        "welcome",
        "login",
        "guest",
        "changeme",
        "iloveyou",
        "monkey",
        "dragon",
        "football",
        "sunshine",
        "princess",
        "qwerty",
        "secret"

    ];


    return common.some(
        word =>
            value.includes(word)
    );
}


// =========================================================
// ANIMATED NUMBERS
// =========================================================

function animateNumber(
    elementId,
    target
) {

    const element =
        document.getElementById(
            elementId
        );


    const current =
        Number(
            element.textContent
        ) || 0;


    if (current === target)
        return;


    const duration = 300;

    const startTime =
        performance.now();


    function update(
        currentTime
    ) {

        const progress =
            Math.min(
                (currentTime - startTime)
                / duration,
                1
            );


        const value =
            Math.round(
                current +
                (target - current) *
                progress
            );


        element.textContent =
            value;


        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(
        update
    );
}


// =========================================================
// RESET
// =========================================================

function resetDashboard() {

    strengthProgress.style.width =
        "0%";


    strengthText.textContent =
        "Waiting";

    strengthText.style.color =
        "#34d399";


    score.textContent =
        "0";


    scoreCircle.style.background =
        `conic-gradient(
            #8b5cf6 0%,
            #1c2434 0%
        )`;


    scoreBadge.textContent =
        "ANALYSIS REQUIRED";

    scoreBadge.style.color =
        "#9aa5b8";

    scoreBadge.style.background =
        "rgba(255,255,255,.045)";


    scoreTitle.textContent =
        "Enter your password";

    scoreTitle.style.color =
        "";


    scoreDescription.textContent =
        "Your security score will appear here after analysis.";


    completionText.textContent =
        "0 / 6";


    const requirements = [

        "requirementLength",
        "requirementUpper",
        "requirementLower",
        "requirementNumber",
        "requirementSpecial",
        "requirementUnique"

    ];


    requirements.forEach(
        id => {

            document
                .getElementById(id)
                .classList.remove(
                    "valid"
                );

        }
    );


    document.getElementById(
        "lengthMetric"
    ).textContent = "0";


    document.getElementById(
        "typesMetric"
    ).textContent = "0";


    document.getElementById(
        "entropyMetric"
    ).textContent = "0";


    document.getElementById(
        "issuesMetric"
    ).textContent = "0";


    const checks = [

        [
            "lengthIcon",
            "lengthResult",
            "lengthStatus"
        ],

        [
            "complexityIcon",
            "complexityResult",
            "complexityStatus"
        ],

        [
            "patternIcon",
            "patternResult",
            "patternStatus"
        ],

        [
            "entropyIcon",
            "entropyResult",
            "entropyStatus"
        ]

    ];


    checks.forEach(
        ([iconId, resultId, statusId]) => {

            const icon =
                document.getElementById(
                    iconId
                );

            const result =
                document.getElementById(
                    resultId
                );

            const status =
                document.getElementById(
                    statusId
                );


            icon.classList.remove(
                "good",
                "bad"
            );

            status.classList.remove(
                "good",
                "bad"
            );


            icon.textContent =
                "—";

            status.textContent =
                "—";

            result.textContent =
                "Waiting for analysis";
        }
    );
}


// =========================================================
// THEME
// =========================================================

themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );


        const light =
            document.body.classList.contains(
                "light"
            );


        themeButton.textContent =
            light
                ? "☀"
                : "☾";

    }
);