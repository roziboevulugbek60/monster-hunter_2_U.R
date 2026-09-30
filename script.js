
"use strict";

/* =========================================================
   MONSTER HUNTER
   ULUG'BEK.R
   ========================================================= */

/* ================= ELEMENTLAR ================= */

const game = document.getElementById("game");
const world = document.getElementById("world");
const map = document.getElementById("map");
const playerEl = document.getElementById("player");

const hpBar = document.getElementById("hpBar");
const xpBar = document.getElementById("xpBar");

const hpText = document.getElementById("hpText");
const xpText = document.getElementById("xpText");

const levelEl = document.getElementById("level");
const coinsEl = document.getElementById("coins");

const damageEl = document.getElementById("damage");
const criticalEl = document.getElementById("critical");

const locationName =
    document.getElementById("locationName");

const locationLevel =
    document.getElementById("locationLevel");

const pausePanel =
    document.getElementById("pausePanel");

const gameOverPanel =
    document.getElementById("gameOver");

const bossEl =
    document.getElementById("boss");

const bossHud =
    document.getElementById("bossHud");

const bossEmoji =
    document.getElementById("bossEmoji");

const bossName =
    document.getElementById("bossName");

const bossBar =
    document.getElementById("bossBar");

const bossText =
    document.getElementById("bossText");


/* ================= MAP ================= */

const MAP_WIDTH = 2400;
const MAP_HEIGHT = 1700;


/* ================= O'YIN ================= */

let gamePaused = false;
let gameEnded = false;

let lastTime = performance.now();

let spawnTimer = 0;

let monsters = [];

let projectiles = [];

let boss = null;

let locationIndex = 0;


/* ================= PLAYER ================= */

let player = {

    x: 1200,
    y: 850,

    hp: 100,
    maxHP: 100,

    level: 1,

    xp: 0,
    xpNeed: 100,

    coins: 250,

    damage: 20,

    critical: 10,

    armor: 0,

    speed: 5,

    arrows: 50,

    potions: 2,

    kills: 0,

    damageLevel: 1,
    hpLevel: 1,
    criticalLevel: 1,
    speedLevel: 1
};


/* ================= LOCATSIYALAR ================= */

const locations = [

    {
        name: "DARK FOREST",
        icon: "🌲",
        level: 1
    },

    {
        name: "DESERT",
        icon: "🏜️",
        level: 5
    },

    {
        name: "ICE LAND",
        icon: "❄️",
        level: 10
    },

    {
        name: "DEAD CITY",
        icon: "🏚️",
        level: 15
    },

    {
        name: "VOLCANO",
        icon: "🔥",
        level: 20
    },

    {
        name: "BOSS CASTLE",
        icon: "👑",
        level: 25
    }

];


/* ================= MONSTERLAR ================= */

const monsterTypes = [

    {
        name: "Zombie",
        icon: "🧟",
        hp: 60,
        damage: 8,
        speed: 1
    },

    {
        name: "Skeleton",
        icon: "💀",
        hp: 80,
        damage: 10,
        speed: 1.1
    },

    {
        name: "Goblin",
        icon: "👺",
        hp: 100,
        damage: 12,
        speed: 1.2
    },

    {
        name: "Demon",
        icon: "👿",
        hp: 150,
        damage: 18,
        speed: 0.9
    }

];


/* ================= BOSS NOMLARI ================= */

const bossNames = [

    "Zombie King",
    "Sand Demon",
    "Ice Beast",
    "Death Lord",
    "Fire Demon",
    "Monster King"

];

const bossIcons = [

    "👑",
    "👹",
    "🐲",
    "💀",
    "😈",
    "👑"

];


/* =========================================================
   SAVE / LOAD
   ========================================================= */

function saveGame() {

    const data = {

        player: player,

        locationIndex: locationIndex

    };

    localStorage.setItem(
        "ULUGBEK_MONSTER_HUNTER",
        JSON.stringify(data)
    );
}


function loadGame() {

    const saved =
        localStorage.getItem(
            "ULUGBEK_MONSTER_HUNTER"
        );

    if (!saved) {
        return;
    }

    try {

        const data =
            JSON.parse(saved);

        if (data.player) {

            player = {
                ...player,
                ...data.player
            };

        }

        if (
            typeof data.locationIndex ===
            "number"
        ) {

            locationIndex =
                data.locationIndex;

        }

    } catch (error) {

        console.error(
            "Save yuklashda xato:",
            error
        );

    }

}


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

    const hpPercent =
        Math.max(
            0,
            player.hp / player.maxHP * 100
        );

    hpBar.style.width =
        hpPercent + "%";

    hpText.textContent =
        Math.ceil(player.hp) +
        " / " +
        player.maxHP;


    const xpPercent =
        Math.min(
            100,
            player.xp /
            player.xpNeed *
            100
        );

    xpBar.style.width =
        xpPercent + "%";

    xpText.textContent =
        player.xp +
        " / " +
        player.xpNeed;


    levelEl.textContent =
        player.level;

    coinsEl.textContent =
        player.coins;

    damageEl.textContent =
        player.damage;

    criticalEl.textContent =
        player.critical;


    locationName.textContent =
        locations[locationIndex].icon +
        " " +
        locations[locationIndex].name;

    locationLevel.textContent =
        locations[locationIndex].level;


    const damageLevel =
        document.getElementById(
            "damageLevel"
        );

    const hpLevel =
        document.getElementById(
            "hpLevel"
        );

    const criticalLevel =
        document.getElementById(
            "criticalLevel"
        );

    const speedLevel =
        document.getElementById(
            "speedLevel"
        );


    if (damageLevel) {
        damageLevel.textContent =
            player.damageLevel;
    }

    if (hpLevel) {
        hpLevel.textContent =
            player.hpLevel;
    }

    if (criticalLevel) {
        criticalLevel.textContent =
            player.criticalLevel;
    }

    if (speedLevel) {
        speedLevel.textContent =
            player.speedLevel;
    }

}


/* =========================================================
   PLAYER DRAW
   ========================================================= */

function drawPlayer() {

    playerEl.style.left =
        player.x + "px";

    playerEl.style.top =
        player.y + "px";

}


/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera() {

    const screenWidth =
        world.clientWidth;

    const screenHeight =
        world.clientHeight;


    let cameraX =
        player.x -
        screenWidth / 2;

    let cameraY =
        player.y -
        screenHeight / 2;


    cameraX =
        Math.max(
            0,
            Math.min(
                MAP_WIDTH -
                screenWidth,
                cameraX
            )
        );


    cameraY =
        Math.max(
            0,
            Math.min(
                MAP_HEIGHT -
                screenHeight,
                cameraY
            )
        );


    map.style.left =
        -cameraX + "px";

    map.style.top =
        -cameraY + "px";

}


/* =========================================================
   KEYBOARD
   ========================================================= */

const keys = {};


document.addEventListener(
    "keydown",
    function(event) {

        keys[event.key] = true;


        if (
            event.key ===
            "Escape"
        ) {

            togglePause();

        }


        if (
            event.code ===
            "Space"
        ) {

            meleeAttack();

        }


        if (
            event.key.toLowerCase() ===
            "e"
        ) {

            usePotion();

        }

    }
);


document.addEventListener(
    "keyup",
    function(event) {

        keys[event.key] = false;

    }
);


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function updatePlayer(delta) {

    if (
        gamePaused ||
        gameEnded
    ) {
        return;
    }


    let dx = 0;
    let dy = 0;


    if (
        keys["w"] ||
        keys["W"] ||
        keys["ArrowUp"]
    ) {

        dy--;

    }


    if (
        keys["s"] ||
        keys["S"] ||
        keys["ArrowDown"]
    ) {

        dy++;

    }


    if (
        keys["a"] ||
        keys["A"] ||
        keys["ArrowLeft"]
    ) {

        dx--;

    }


    if (
        keys["d"] ||
        keys["D"] ||
        keys["ArrowRight"]
    ) {

        dx++;

    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        dx /= length;
        dy /= length;


        player.x +=
            dx *
            player.speed *
            delta /
            16;

        player.y +=
            dy *
            player.speed *
            delta /
            16;

    }


    player.x =
        Math.max(
            40,
            Math.min(
                MAP_WIDTH - 40,
                player.x
            )
        );


    player.y =
        Math.max(
            40,
            Math.min(
                MAP_HEIGHT - 40,
                player.y
            )
        );


    drawPlayer();

}


/* =========================================================
   MOUSE
   ========================================================= */

let mouseX = 0;
let mouseY = 0;


world.addEventListener(
    "mousemove",
    function(event) {

        const rect =
            world.getBoundingClientRect();


        mouseX =
            event.clientX -
            rect.left;

        mouseY =
            event.clientY -
            rect.top;

    }
);


world.addEventListener(
    "mousedown",
    function(event) {

        if (
            event.target.closest(
                "button"
            )
        ) {

            return;

        }


        shoot();

    }
);


/* =========================================================
   MONSTER YARATISH
   ========================================================= */

function createMonster() {

    const type =
        monsterTypes[
            Math.floor(
                Math.random() *
                monsterTypes.length
            )
        ];


    const difficulty =
        1 +
        locationIndex *
        0.45;


    const monster = {

        name: type.name,

        icon: type.icon,

        x:
            Math.random() *
            (MAP_WIDTH - 200) +
            100,

        y:
            Math.random() *
            (MAP_HEIGHT - 200) +
            100,

        hp:
            Math.floor(
                type.hp *
                difficulty
            ),

        maxHP:
            Math.floor(
                type.hp *
                difficulty
            ),

        damage:
            Math.floor(
                type.damage *
                difficulty
            ),

        speed:
            type.speed,

        attackTimer: 0,

        element: null

    };


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "monster";


    element.innerHTML = `

        <div class="monsterName">
            ${monster.name}
        </div>

        <div class="monsterBar">
            <div class="monsterHP"></div>
        </div>

        <div class="monsterEmoji">
            ${monster.icon}
        </div>

    `;


    map.appendChild(element);


    monster.element =
        element;


    monsters.push(monster);


    drawMonster(monster);

}


/* =========================================================
   MONSTER DRAW
   ========================================================= */

function drawMonster(monster) {

    if (!monster.element) {
        return;
    }


    monster.element.style.left =
        monster.x + "px";

    monster.element.style.top =
        monster.y + "px";


    const hpElement =
        monster.element.querySelector(
            ".monsterHP"
        );


    if (hpElement) {

        hpElement.style.width =
            Math.max(
                0,
                monster.hp /
                monster.maxHP *
                100
            ) + "%";

    }

}


/* =========================================================
   MONSTER AI
   ========================================================= */

function updateMonsters(delta) {

    if (
        gamePaused ||
        gameEnded
    ) {

        return;

    }


    for (
        const monster of monsters
    ) {

        const dx =
            player.x -
            monster.x;

        const dy =
            player.y -
            monster.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance > 75
        ) {

            monster.x +=
                dx /
                distance *
                monster.speed *
                delta /
                16;

            monster.y +=
                dy /
                distance *
                monster.speed *
                delta /
                16;

        } else {

            monster.attackTimer -=
                delta;


            if (
                monster.attackTimer <=
                0
            ) {

                damagePlayer(
                    monster.damage
                );

                monster.attackTimer =
                    1000;

            }

        }


        drawMonster(monster);

    }

}


/* =========================================================
   OTISH
   ========================================================= */

function shoot() {

    if (
        gamePaused ||
        gameEnded
    ) {

        return;

    }


    if (
        player.arrows <= 0
    ) {

        showMessage(
            "🏹 O'q qolmadi!"
        );

        return;

    }


    player.arrows--;


    const targetX =
        mouseX -
        world.clientWidth / 2 +
        player.x;


    const targetY =
        mouseY -
        world.clientHeight / 2 +
        player.y;


    const dx =
        targetX -
        player.x;

    const dy =
        targetY -
        player.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance === 0) {
        return;
    }


    const projectile = {

        x: player.x,

        y: player.y,

        dx:
            dx / distance,

        dy:
            dy / distance,

        speed: 16,

        element: null

    };


    const element =
        document.createElement(
            "div"
        );


    element.style.position =
        "absolute";

    element.style.width =
        "20px";

    element.style.height =
        "5px";

    element.style.background =
        "#ffe26a";

    element.style.borderRadius =
        "5px";

    element.style.boxShadow =
        "0 0 8px #ffe26a";

    element.style.zIndex =
        "50";


    map.appendChild(element);


    projectile.element =
        element;


    projectiles.push(
        projectile
    );


    updateHUD();

}


/* =========================================================
   PROJECTILE UPDATE
   ========================================================= */

function updateProjectiles(delta) {

    if (
        gamePaused ||
        gameEnded
    ) {

        return;

    }


    for (
        let i =
            projectiles.length - 1;

        i >= 0;

        i--
    ) {

        const projectile =
            projectiles[i];


        projectile.x +=
            projectile.dx *
            projectile.speed *
            delta /
            16;


        projectile.y +=
            projectile.dy *
            projectile.speed *
            delta /
            16;


        projectile.element.style.left =
            projectile.x + "px";

        projectile.element.style.top =
            projectile.y + "px";


        let hit =
            false;


        /* MONSTER */

        for (
            const monster of monsters
        ) {

            const dx =
                projectile.x -
                monster.x;

            const dy =
                projectile.y -
                monster.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance < 45
            ) {

                damageMonster(
                    monster,
                    player.damage
                );

                hit = true;

                break;

            }

        }


        /* BOSS */

        if (
            !hit &&
            boss
        ) {

            const dx =
                projectile.x -
                boss.x;

            const dy =
                projectile.y -
                boss.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance < 90
            ) {

                damageBoss(
                    player.damage
                );

                hit = true;

            }

        }


        if (
            hit ||
            projectile.x < 0 ||
            projectile.y < 0 ||
            projectile.x > MAP_WIDTH ||
            projectile.y > MAP_HEIGHT
        ) {

            projectile.element.remove();

            projectiles.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   MONSTER DAMAGE
   ========================================================= */

function damageMonster(
    monster,
    baseDamage
) {

    let damage =
        baseDamage;


    const critical =
        Math.random() * 100 <
        player.critical;


    if (critical) {

        damage *= 2;

    }


    damage =
        Math.floor(damage);


    monster.hp -=
        damage;


    createDamageText(
        monster.x,
        monster.y - 40,
        damage,
        critical
    );


    createHitEffect(
        monster.x,
        monster.y
    );


    if (
        monster.hp <= 0
    ) {

        killMonster(monster);

    } else {

        drawMonster(monster);

    }

}


/* =========================================================
   MONSTER O'LIMI
   ========================================================= */

function killMonster(monster) {

    const index =
        monsters.indexOf(
            monster
        );


    if (index === -1) {
        return;
    }


    if (monster.element) {

        monster.element.remove();

    }


    monsters.splice(
        index,
        1
    );


    player.kills++;


    const reward =
        10 +
        locationIndex * 5;


    player.coins +=
        reward;


    addXP(
        20 +
        locationIndex * 10
    );


    updateHUD();


    const requiredKills =
        5 +
        locationIndex * 2;


    if (
        player.kills >=
        requiredKills &&
        !boss
    ) {

        createBoss();

    }


    saveGame();

}


/* =========================================================
   XP / LEVEL
   ========================================================= */

function addXP(amount) {

    player.xp +=
        amount;


    while (
        player.xp >=
        player.xpNeed
    ) {

        player.xp -=
            player.xpNeed;


        player.level++;


        player.xpNeed =
            Math.floor(
                player.xpNeed *
                1.35
            );


        player.maxHP +=
            15;


        player.hp =
            player.maxHP;


        player.damage +=
            4;


        player.critical =
            Math.min(
                50,
                player.critical + 1
            );


        showMessage(
            "⭐ LEVEL UP! " +
            player.level
        );

    }


    updateHUD();

}


/* =========================================================
   PLAYER DAMAGE
   ========================================================= */

function damagePlayer(amount) {

    if (
        gameEnded
    ) {

        return;

    }


    const finalDamage =
        Math.max(
            1,
            amount -
            player.armor
        );


    player.hp -=
        finalDamage;


    createDamageText(
        player.x,
        player.y - 30,
        finalDamage,
        false
    );


    updateHUD();


    if (
        player.hp <= 0
    ) {

        player.hp = 0;

        gameOver();

    }

}


/* =========================================================
   BOSS
   ========================================================= */

function createBoss() {

    if (boss) {
        return;
    }


    const bossHP =
        700 +
        locationIndex *
        500;


    boss = {

        x:
            MAP_WIDTH - 350,

        y:
            MAP_HEIGHT - 300,

        hp:
            bossHP,

        maxHP:
            bossHP,

        damage:
            20 +
            locationIndex * 8,

        speed:
            0.7,

        attackTimer: 0

    };


    bossEmoji.textContent =
        bossIcons[
            locationIndex
        ];


    bossName.textContent =
        "👑 " +
        bossNames[
            locationIndex
        ];


    bossEl.classList.remove(
        "hidden"
    );


    bossHud.classList.remove(
        "hidden"
    );


    drawBoss();


    showMessage(
        "👑 BOSS PAYDO BO'LDI!"
    );

}


/* =========================================================
   BOSS DRAW
   ========================================================= */

function drawBoss() {

    if (!boss) {
        return;
    }


    bossEl.style.left =
        boss.x + "px";

    bossEl.style.top =
        boss.y + "px";


    const percent =
        Math.max(
            0,
            boss.hp /
            boss.maxHP *
            100
        );


    bossBar.style.width =
        percent + "%";


    bossText.textContent =
        Math.max(
            0,
            Math.ceil(
                boss.hp
            )
        ) +
        " / " +
        boss.maxHP;

}


/* =========================================================
   BOSS AI
   ========================================================= */

function updateBoss(delta) {

    if (
        !boss ||
        gamePaused ||
        gameEnded
    ) {

        return;

    }


    const dx =
        player.x -
        boss.x;

    const dy =
        player.y -
        boss.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance > 130
    ) {

        boss.x +=
            dx /
            distance *
            boss.speed *
            delta /
            16;


        boss.y +=
            dy /
            distance *
            boss.speed *
            delta /
            16;

    } else {

        boss.attackTimer -=
            delta;


        if (
            boss.attackTimer <=
            0
        ) {

            damagePlayer(
                boss.damage
            );

            boss.attackTimer =
                1200;

        }

    }


    drawBoss();

}


/* =========================================================
   BOSS DAMAGE
   ========================================================= */

function damageBoss(
    baseDamage
) {

    if (!boss) {
        return;
    }


    let damage =
        baseDamage;


    const critical =
        Math.random() * 100 <
        player.critical;


    if (critical) {

        damage *= 2;

    }


    damage =
        Math.floor(damage);


    boss.hp -=
        damage;


    createDamageText(
        boss.x,
        boss.y - 90,
        damage,
        critical
    );


    createHitEffect(
        boss.x,
        boss.y
    );


    if (
        boss.hp <= 0
    ) {

        defeatBoss();

    } else {

        drawBoss();

    }

}


/* =========================================================
   BOSS MAG'LUB
   ========================================================= */

function defeatBoss() {

    const reward =
        500 +
        locationIndex *
        250;


    player.coins +=
        reward;


    addXP(
        500 +
        locationIndex *
        300
    );


    if (bossEl) {

        bossEl.classList.add(
            "hidden"
        );

    }


    if (bossHud) {

        bossHud.classList.add(
            "hidden"
        );

    }


    boss = null;


    showMessage(
        "🏆 BOSS MAG'LUB!\n" +
        "💰 +" +
        reward +
        " COIN"
    );


    if (
        locationIndex <
        locations.length - 1
    ) {

        locationIndex++;


        showMessage(
            "🗺️ Yangi lokatsiya: " +
            locations[
                locationIndex
            ].name
        );

    } else {

        showMessage(
            "🏆 BARCHA BOSS MAG'LUB!"
        );

    }


    updateHUD();

    saveGame();

}


/* =========================================================
   MELEE
   ========================================================= */

function meleeAttack() {

    if (
        gamePaused ||
        gameEnded
    ) {

        return;

    }


    const meleeRange =
        120;


    for (
        const monster of [...monsters]
    ) {

        const dx =
            monster.x -
            player.x;

        const dy =
            monster.y -
            player.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <=
            meleeRange
        ) {

            damageMonster(
                monster,
                player.damage * 1.4
            );

        }

    }


    if (boss) {

        const dx =
            boss.x -
            player.x;

        const dy =
            boss.y -
            player.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <=
            150
        ) {

            damageBoss(
                player.damage * 1.5
            );

        }

    }

}


/* =========================================================
   DAMAGE TEXT
   ========================================================= */

function createDamageText(
    x,
    y,
    value,
    critical
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        critical
            ? "damage critical"
            : "damage";


    element.textContent =
        critical
            ? "🎯 " +
              value +
              "!"
            : value;


    element.style.left =
        x + "px";

    element.style.top =
        y + "px";


    map.appendChild(
        element
    );


    setTimeout(
        function() {

            element.remove();

        },
        700
    );

}


/* =========================================================
   HIT EFFECT
   ========================================================= */

function createHitEffect(
    x,
    y
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "hit";


    element.textContent =
        "💥";


    element.style.left =
        x + "px";

    element.style.top =
        y + "px";


    map.appendChild(
        element
    );


    setTimeout(
        function() {

            element.remove();

        },
        400
    );

}


/* =========================================================
   MESSAGE
   ========================================================= */

let messageTimer = null;


function showMessage(text) {

    let message =
        document.getElementById(
            "gameMessage"
        );


    if (!message) {

        message =
            document.createElement(
                "div"
            );


        message.id =
            "gameMessage";


        message.style.position =
            "absolute";

        message.style.zIndex =
            "2000";

        message.style.left =
            "50%";

        message.style.top =
            "50%";

        message.style.transform =
            "translate(-50%, -50%)";

        message.style.padding =
            "15px 25px";

        message.style.background =
            "rgba(0,0,0,.85)";

        message.style.border =
            "1px solid #ffd83d";

        message.style.borderRadius =
            "12px";

        message.style.color =
            "white";

        message.style.fontSize =
            "18px";

        message.style.fontWeight =
            "bold";

        message.style.textAlign =
            "center";

        message.style.whiteSpace =
            "pre-line";


        game.appendChild(
            message
        );

    }


    message.textContent =
        text;


    message.style.display =
        "block";


    clearTimeout(
        messageTimer
    );


    messageTimer =
        setTimeout(
            function() {

                message.style.display =
                    "none";

            },
            1300
        );

}


/* =========================================================
   POTION
   ========================================================= */

function usePotion() {

    if (
        player.potions <= 0
    ) {

        showMessage(
            "🧪 OQ DORI QOLMAGAN!"
        );

        return;

    }


    if (
        player.hp >=
        player.maxHP
    ) {

        showMessage(
            "❤️ HP TO'LIQ!"
        );

        return;

    }


    player.potions--;


    player.hp =
        Math.min(
            player.maxHP,
            player.hp + 50
        );


    updateHUD();

    saveGame();

}


/* =========================================================
   SHOP
   ========================================================= */

function buyPotion() {

    if (
        player.coins < 50
    ) {

        showMessage(
            "💰 COIN YETARLI EMAS!"
        );

        return;

    }


    player.coins -= 50;

    player.potions++;


    updateHUD();

    saveGame();


    showMessage(
        "🧪 OQ DORI OLINDI!"
    );

}


function buyArrows() {

    if (
        player.coins < 30
    ) {

        showMessage(
            "💰 COIN YETARLI EMAS!"
        );

        return;

    }


    player.coins -= 30;

    player.arrows += 20;


    updateHUD();

    saveGame();


    showMessage(
        "🏹 +20 O'Q OLINDI!"
    );

}


function buyWeapon() {

    if (
        player.coins < 200
    ) {

        showMessage(
            "💰 COIN YETARLI EMAS!"
        );

        return;

    }


    player.coins -= 200;

    player.damage += 10;


    updateHUD();

    saveGame();


    showMessage(
        "⚔️ QUROL KUCHAYDI!"
    );

}


function buyArmor() {

    if (
        player.coins < 300
    ) {

        showMessage(
            "💰 COIN YETARLI EMAS!"
        );

        return;

    }


    player.coins -= 300;

    player.armor += 10;


    updateHUD();

    saveGame();


    showMessage(
        "🛡️ ARMOR KUCHAYDI!"
    );

}


/* =========================================================
   UPGRADE
   ========================================================= */

function upgradeDamage() {

    const price =
        player.damageLevel *
        100;


    if (
        player.coins < price
    ) {

        showMessage(
            "💰 " +
            price +
            " COIN KERAK!"
        );

        return;

    }


    player.coins -= price;

    player.damageLevel++;

    player.damage += 5;


    updateHUD();

    saveGame();

}


function upgradeHP() {

    const price =
        player.hpLevel *
        120;


    if (
        player.coins < price
    ) {

        showMessage(
            "💰 " +
            price +
            " COIN KERAK!"
        );

        return;

    }


    player.coins -= price;

    player.hpLevel++;

    player.maxHP += 25;

    player.hp =
        player.maxHP;


    updateHUD();

    saveGame();

}


function upgradeCritical() {

    const price =
        player.criticalLevel *
        150;


    if (
        player.coins < price
    ) {

        showMessage(
            "💰 " +
            price +
            " COIN KERAK!"
        );

        return;

    }


    player.coins -= price;

    player.criticalLevel++;

    player.critical =
        Math.min(
            50,
            player.critical + 3
        );


    updateHUD();

    saveGame();

}


function upgradeSpeed() {

    const price =
        player.speedLevel *
        100;


    if (
        player.coins < price
    ) {

        showMessage(
            "💰 " +
            price +
            " COIN KERAK!"
        );

        return;

    }


    player.coins -= price;

    player.speedLevel++;

    player.speed += 0.7;


    updateHUD();

    saveGame();

}


/* =========================================================
   PAUSE
   ========================================================= */

function togglePause() {

    if (gameEnded) {
        return;
    }


    gamePaused =
        !gamePaused;


    if (gamePaused) {

        pausePanel.classList.remove(
            "hidden"
        );

    } else {

        pausePanel.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   RESTART
   ========================================================= */

function restartGame() {

    localStorage.removeItem(
        "ULUGBEK_MONSTER_HUNTER"
    );


    location.reload();

}


/* =========================================================
   GAME OVER
   ========================================================= */

function gameOver() {

    gameEnded = true;


    document.getElementById(
        "finalLevel"
    ).textContent =
        player.level;


    document.getElementById(
        "finalCoins"
    ).textContent =
        player.coins;


    document.getElementById(
        "finalKills"
    ).textContent =
        player.kills;


    gameOverPanel.classList.remove(
        "hidden"
    );

}


/* =========================================================
   PANELLAR
   ========================================================= */

function openPanel(id) {

    const panel =
        document.getElementById(id);


    if (panel) {

        panel.classList.remove(
            "hidden"
        );

    }

}


function closePanel(id) {

    const panel =
        document.getElementById(id);


    if (panel) {

        panel.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   BUTTONLAR
   ========================================================= */

const shopButton =
    document.getElementById("shop");

if (shopButton) {

    shopButton.onclick =
        function() {

            openPanel(
                "shopPanel"
            );

        };

}


const upgradeButton =
    document.getElementById("upgrade");

if (upgradeButton) {

    upgradeButton.onclick =
        function() {

            openPanel(
                "upgradePanel"
            );

        };

}


const mapButton =
    document.getElementById("mapButton");

if (mapButton) {

    mapButton.onclick =
        function() {

            openPanel(
                "mapPanel"
            );

        };

}


const shootButton =
    document.getElementById("shoot");

if (shootButton) {

    shootButton.onclick =
        shoot;

}


const meleeButton =
    document.getElementById("melee");

if (meleeButton) {

    meleeButton.onclick =
        meleeAttack;

}


const potionButton =
    document.getElementById("potion");

if (potionButton) {

    potionButton.onclick =
        usePotion;

}


const pauseButton =
    document.getElementById("pause");

if (pauseButton) {

    pauseButton.onclick =
        togglePause;

}


const continueButton =
    document.getElementById("continue");

if (continueButton) {

    continueButton.onclick =
        togglePause;

}


const restartButton =
    document.getElementById("restart");

if (restartButton) {

    restartButton.onclick =
        restartGame;

}


const gameRestartButton =
    document.getElementById(
        "gameRestart"
    );

if (gameRestartButton) {

    gameRestartButton.onclick =
        restartGame;

}


/* =========================================================
   CLOSE BUTTONS
   ========================================================= */

document.querySelectorAll(
    "[data-close]"
).forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                closePanel(
                    button.dataset.close
                );

            }
        );

    }
);


/* =========================================================
   SHOP BUTTONLARI
   ========================================================= */

const buyPotionButton =
    document.getElementById(
        "buyPotion"
    );

if (buyPotionButton) {

    buyPotionButton.onclick =
        buyPotion;

}


const buyArrowsButton =
    document.getElementById(
        "buyArrows"
    );

if (buyArrowsButton) {

    buyArrowsButton.onclick =
        buyArrows;

}


const buyWeaponButton =
    document.getElementById(
        "buyWeapon"
    );

if (buyWeaponButton) {

    buyWeaponButton.onclick =
        buyWeapon;

}


const buyArmorButton =
    document.getElementById(
        "buyArmor"
    );

if (buyArmorButton) {

    buyArmorButton.onclick =
        buyArmor;

}


/* =========================================================
   UPGRADE BUTTONLARI
   ========================================================= */

const upDamageButton =
    document.getElementById(
        "upDamage"
    );

if (upDamageButton) {

    upDamageButton.onclick =
        upgradeDamage;

}


const upHPButton =
    document.getElementById(
        "upHP"
    );

if (upHPButton) {

    upHPButton.onclick =
        upgradeHP;

}


const upCriticalButton =
    document.getElementById(
        "upCritical"
    );

if (upCriticalButton) {

    upCriticalButton.onclick =
        upgradeCritical;

}


const upSpeedButton =
    document.getElementById(
        "upSpeed"
    );

if (upSpeedButton) {

    upSpeedButton.onclick =
        upgradeSpeed;

}


/* =========================================================
   LOKATSIYA
   ========================================================= */

document.querySelectorAll(
    ".locationBtn"
).forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const index =
                    Number(
                        button.dataset.location
                    );


                if (
                    player.level <
                    locations[index].level
                ) {

                    showMessage(
                        "🔒 LEVEL " +
                        locations[index].level +
                        " KERAK!"
                    );

                    return;

                }


                locationIndex =
                    index;


                /* eski monsterlarni o'chirish */

                monsters.forEach(
                    function(monster) {

                        if (
                            monster.element
                        ) {

                            monster.element.remove();

                        }

                    }
                );


                monsters = [];


                /* eski boss */

                if (boss) {

                    boss = null;

                    bossEl.classList.add(
                        "hidden"
                    );

                    bossHud.classList.add(
                        "hidden"
                    );

                }


                closePanel(
                    "mapPanel"
                );


                updateHUD();

                saveGame();


                showMessage(
                    "🗺️ " +
                    locations[index].name
                );

            }
        );

    }
);


/* =========================================================
   MOBILE CONTROLS
   ========================================================= */

document.querySelectorAll(
    ".moveBtn"
).forEach(
    function(button) {

        const direction =
            button.dataset.key;


        function press(event) {

            event.preventDefault();


            if (
                direction === "up"
            ) {

                keys.ArrowUp = true;

            }


            if (
                direction === "down"
            ) {

                keys.ArrowDown = true;

            }


            if (
                direction === "left"
            ) {

                keys.ArrowLeft = true;

            }


            if (
                direction === "right"
            ) {

                keys.ArrowRight = true;

            }

        }


        function release(event) {

            event.preventDefault();


            if (
                direction === "up"
            ) {

                keys.ArrowUp = false;

            }


            if (
                direction === "down"
            ) {

                keys.ArrowDown = false;

            }


            if (
                direction === "left"
            ) {

                keys.ArrowLeft = false;

            }


            if (
                direction === "right"
            ) {

                keys.ArrowRight = false;

            }

        }


        button.addEventListener(
            "touchstart",
            press,
            {
                passive: false
            }
        );


        button.addEventListener(
            "touchend",
            release,
            {
                passive: false
            }
        );


        button.addEventListener(
            "mousedown",
            press
        );


        button.addEventListener(
            "mouseup",
            release
        );


        button.addEventListener(
            "mouseleave",
            release
        );

    }
);


const mobileShoot =
    document.getElementById(
        "mobileShoot"
    );

if (mobileShoot) {

    mobileShoot.onclick =
        shoot;

}


const mobileMelee =
    document.getElementById(
        "mobileMelee"
    );

if (mobileMelee) {

    mobileMelee.onclick =
        meleeAttack;

}


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(currentTime) {

    const delta =
        Math.min(
            40,
            currentTime -
            lastTime
        );


    lastTime =
        currentTime;


    if (
        !gamePaused &&
        !gameEnded
    ) {

        updatePlayer(delta);

        updateMonsters(delta);

        updateProjectiles(delta);

        updateBoss(delta);


        spawnTimer +=
            delta;


        const maxMonsters =
            5 +
            locationIndex *
            2;


        if (
            spawnTimer >= 1400 &&
            monsters.length <
            maxMonsters
        ) {

            createMonster();

            spawnTimer = 0;

        }


        updateCamera();

    }


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   START
   ========================================================= */

loadGame();

updateHUD();

drawPlayer();

updateCamera();


/* Boshlang'ich monsterlar */

for (
    let i = 0;
    i < 6;
    i++
) {

    createMonster();

}


/* GAME LOOP */

requestAnimationFrame(
    gameLoop
);


/* AUTO SAVE */

setInterval(
    saveGame,
    5000
);


/* Sahifa yopilishidan oldin */

window.addEventListener(
    "beforeunload",
    saveGame
);
