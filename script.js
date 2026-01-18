class GameState {
    constructor() {
        this.circle = 1;
        this.xp = 0;
        this.maxXp = 100;
        this.mana = 100;
        this.maxMana = 100;
        this.hp = 100;
        this.maxHp = 100;
        this.magicType = 'arcane'; // arcane, lightning, ice
        this.monster = null;
        this.location = 'home'; // home, training, dungeon
    }

    setLocation(loc) {
        this.location = loc;
        if (this.ui) this.ui.updateLocationUI(loc);

        // Pause/Resume 3D animation? (Handled by visibility mostly)
        // If Dungeon, spawn check
        if (loc === 'dungeon' && !this.monster) {
            this.spawnMonster();
        }
    }

    rest() {
        this.hp = this.maxHp;
        this.mana = this.maxMana;
        if (this.ui) {
            this.ui.updateStats();
            alert("Rested well! HP/Mana fully recovered.");
        }
    }

    gainXp(amount) {
        // Reduced XP in training?
        if (this.location === 'training') amount = Math.floor(amount * 0.5);

        this.xp += amount;
        if (this.xp >= this.maxXp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.circle++;
        this.xp = 0;
        this.maxXp = Math.floor(this.maxXp * 1.5);
        this.mana = this.maxMana; // Restore Mana
        this.hp = this.maxHp;     // Restore HP
        return true;
    }

    spawnMonster() {
        const monsters = [
            { name: "Slime", hp: 50, emoji: "🦠" },
            { name: "Goblin", hp: 80, emoji: "👺" },
            { name: "Orc", hp: 120, emoji: "👹" },
            { name: "Troll", hp: 200, emoji: "🧟" },
            { name: "Golem", hp: 300, emoji: "🗿" },
            { name: "Dragon", hp: 1000, emoji: "🐲" } // Boss
        ];
        // Simple scaling: pick monster roughly based on circle
        let index = Math.min(Math.floor((this.circle - 1) / 2), monsters.length - 1);
        let template = monsters[index];

        this.monster = {
            name: template.name,
            maxHp: template.hp * this.circle, // Scale HP with circle
            currentHp: template.hp * this.circle,
            emoji: template.emoji
        };
    }

    damageMonster(amount) {
        if (this.location !== 'dungeon' || !this.monster) return false; // Can't hurt monster if not in dungeon

        this.monster.currentHp -= amount;
        if (this.monster.currentHp <= 0) {
            this.monster.currentHp = 0;
            return true; // killed
        }
        return false;
    }

    useMana(amount) {
        if (this.mana >= amount) {
            this.mana -= amount;
            return true;
        }
        return false;
    }
}

class ProblemGenerator {
    constructor() {
        this.currentProblem = null;
    }

    generate(circle, type) {
        let problem = {};

        switch (type) {
            case 'lightning':
                problem = this.generateLightning(circle);
                break;
            case 'ice':
                problem = this.generateIce(circle);
                break;
            default:
                problem = this.generateArcane(circle);
        }

        this.currentProblem = problem;
        return problem;
    }

    generateLightning(circle) {
        // V=IR, P=VI
        // Harder Tiering
        const tier = Math.ceil(circle / 3);

        if (tier === 1) {
            // Ohm's Law: V = I * R
            // Harder: 2-digit R, maybe decimal I
            let i = this.rand(2, 20); // 2-20A
            let r = this.rand(10, 100); // 10-100 Ohm
            let v = i * r;
            // Solve for V or I or R? Keep finding V for flow, but numbers are bigger
            return {
                text: `Ohm's Law (V=IR)<br>I=${i}A, R=${r}Ω. Find V.`,
                answer: v,
                hint: "Multiply Current (I) by Resistance (R)."
            };
        } else if (tier === 2) {
            // Power: P = V * I
            // Harder: High voltage
            let v = this.rand(100, 240); // Mains voltage range
            let i = this.rand(5, 50);
            let p = v * i;
            return {
                text: `Electric Power (P=VI)<br>V=${v}V, I=${i}A. Find P (Watts).`,
                answer: p,
                hint: "Multiply Voltage (V) by Current (I)."
            };
        } else {
            // Maxwell / Wave
            // c = f * lambda
            // Use Scientific Notation-ish numbers? Or just big.
            let f = this.rand(1, 50) * 1000; // kHz
            let lambda = this.rand(1, 100); // m
            let c = f * lambda;
            return {
                text: `Wave Speed (v=fλ)<br>f=${f / 1000}kHz, λ=${lambda}m. Find v (m/s).`,
                answer: c,
                hint: "Multiply Frequency (Hz) by Wavelength (λ). Remember 1kHz = 1000Hz."
            };
        }
    }

    generateIce(circle) {
        const tier = Math.ceil(circle / 3);

        if (tier === 1) {
            // C to F
            // Harder: Random C, requires decimal mult or precision
            let c = this.rand(10, 100);
            let f = Math.round((c * 1.8 + 32) * 10) / 10; // Keep 1 decimal
            return {
                text: `Convert to Fahrenheit<br>${c}°C`,
                answer: f,
                hint: "Multiply by 1.8 and add 32. 1 decimal place."
            };
        } else if (tier === 2) {
            // Heat: Q = mcT
            // Real specific heats? Water = 4186? Too hard. Use 4.2
            let m = this.rand(5, 50); // kg
            let c = 4.2; // Water approx
            let dt = this.rand(10, 50);
            let q = Math.round(m * c * dt * 10) / 10;
            return {
                text: `Heat Energy (Q=mcΔT)<br>m=${m}kg, c=${c}, ΔT=${dt}. Find Q.`,
                answer: q,
                hint: "Multiply m * c * ΔT."
            };
        } else {
            // Ideal Gas PV = nRT
            // Harder numbers
            let n = this.rand(2, 10);
            let r = 8.3;
            let t = this.rand(273, 373); // 0-100C in Kelvin
            let v = this.rand(10, 50); // Liters?
            // P = nRT/V
            let p = Math.round(((n * r * t) / v) * 10) / 10;
            return {
                text: `Ideal Gas (PV=nRT)<br>V=${v}, n=${n}, R=${r}, T=${t}. Find P.`,
                answer: p,
                hint: "P = (nRT) / V. Round to 1 decimal."
            };
        }
    }

    generateArcane(circle) {
        let problem = {};
        switch (circle) {
            case 1: // Novice (Add/Sub) -> 3-digit
                {
                    const op = Math.random() > 0.5 ? '+' : '-';
                    let a = this.rand(100, 999);
                    let b = this.rand(50, 500);
                    if (op === '-' && a < b) [a, b] = [b, a];
                    problem = {
                        text: `${a} ${op} ${b}`,
                        answer: op === '+' ? a + b : a - b,
                        hint: `Simply ${op === '+' ? 'add' : 'subtract'} using column method.`
                    };
                }
                break;
            case 2: // Apprentice (Mul/Div) -> 2-digit * 2-digit
                {
                    const op = Math.random() > 0.5 ? '*' : '/';
                    if (op === '*') {
                        let a = this.rand(11, 50); // Harder 2-digit
                        let b = this.rand(11, 20); // 11-20
                        problem = {
                            text: `${a} × ${b}`,
                            answer: a * b,
                            hint: `Multiply ${a} by ${b}.`
                        };
                    } else {
                        // Div: Result is 2-digit
                        let b = this.rand(5, 20);
                        let ans = this.rand(15, 50);
                        let a = b * ans;
                        problem = {
                            text: `${a} ÷ ${b}`,
                            answer: ans,
                            hint: `${b} times what equals ${a}?`
                        };
                    }
                }
                break;
            case 3: // Adept (Linear Eq) -> Larger coeff
                {
                    let x = this.rand(5, 20);
                    let a = this.rand(3, 15);
                    let b = this.rand(10, 100);
                    let c = a * x + b;
                    problem = {
                        text: `Solve x: <br>${a}x + ${b} = ${c}`,
                        answer: x,
                        hint: `First subtract ${b} from ${c}, then divide the result by ${a}.`
                    };
                }
                break;
            case 4: // Expert (Quadratics/Func) -> Coefficients != 1
                {
                    let x = this.rand(3, 10);
                    let a = this.rand(2, 5);
                    let b = this.rand(10, 50);
                    let ans = a * x * x + b;
                    problem = {
                        text: `f(x) = ${a}x² + ${b}<br>Find f(${x})`,
                        answer: ans,
                        hint: `Square ${x} first, multiply by ${a}, then add ${b}.`
                    };
                }
                break;
            case 5: // Master (Deriv) -> Chain rule simple? or just higher pow
                {
                    // d/dx(a*x^n)
                    let a = this.rand(2, 10);
                    let n = this.rand(3, 5);
                    let x_val = this.rand(2, 3);
                    // ans = a * n * x^(n-1)
                    let ans = a * n * Math.pow(x_val, n - 1);
                    problem = {
                        text: `d/dx(${a}x<sup>${n}</sup>) at x=${x_val}`,
                        answer: ans,
                        hint: `Calculate ${a} * ${n} * ${x_val}^(${n}-1).`
                    };
                }
                break;
            case 6: // Grandmaster (Integrals) -> Coeffs
                {
                    let a = this.rand(2, 4);
                    let n = this.rand(1, 2);
                    let upper = this.rand(2, 4);
                    // int(a*x^n) = a * x^(n+1)/(n+1)
                    // Make sure it divides clean? No, float is fine now
                    let ans = a * Math.pow(upper, n + 1) / (n + 1);
                    ans = Math.round(ans * 100) / 100;
                    problem = {
                        text: `∫<sub>0</sub><sup>${upper}</sup> ${a}x<sup>${n}</sup> dx`,
                        answer: ans,
                        hint: `Antiderivative is ${a}x^${n + 1}/${n + 1}. Evaluate at ${upper}.`
                    };
                }
                break;
            case 7: // Archmage (Determinants) -> Larger numbers
                {
                    let a = this.rand(1, 10), b = this.rand(1, 10);
                    let c = this.rand(1, 10), d = this.rand(1, 10);
                    let det = a * d - b * c;
                    problem = {
                        text: `| ${a}  ${b} |<br>| ${c}  ${d} |`,
                        answer: det,
                        hint: `(${a}*${d}) - (${b}*${c}). Watch the signs!`
                    };
                }
                break;
            case 8: // Legend (Log) -> Same logic, higher base
                {
                    let base = this.rand(3, 8);
                    let exp = this.rand(2, 4);
                    let val = Math.pow(base, exp);
                    problem = {
                        text: `log<sub>${base}</sub>(${val})`,
                        answer: exp,
                        hint: `${base} to what power equals ${val}?`
                    };
                }
                break;
            case 9: // Demigod (Complex) -> No change (triples hard enough)
                {
                    let triples = [[5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]; // Harder triples
                    let t = triples[Math.floor(Math.random() * triples.length)];
                    problem = {
                        text: `|${t[0]} + ${t[1]}i|`,
                        answer: t[2],
                        hint: `Sqrt(${t[0]}² + ${t[1]}²). Pythagorean triple.`
                    };
                }
                break;
            default: // God Tier
                problem = {
                    text: "Propove the Riemann Hypothesis<br>(ζ(s) = 0 ⇒ Re(s) = ?)",
                    answer: 0.5,
                    hint: "The critical line. Re(s) = 1/2."
                };
        }
        return problem;
    }

    rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

class UIManager {
    constructor(game) {
        this.game = game;
        this.game.ui = this; // Important: Link back so GameState can update UI
        this.consecutiveFailures = 0; // Track failures

        this.els = {
            circle: document.getElementById('circle-level'),
            xpBar: document.getElementById('xp-bar'),
            manaBar: document.getElementById('mana-bar'),
            hpBar: document.getElementById('hp-bar'),
            monsterHpBar: document.getElementById('monster-hp-bar'),
            monsterName: document.getElementById('monster-name'),
            // monsterVisual removed
            problem: document.getElementById('problem-display'),
            input: document.getElementById('spell-input'),
            feedback: document.getElementById('feedback-area'),
            castBtn: document.getElementById('cast-btn'),
            hint: document.getElementById('hint-area'),
            magicBtns: document.querySelectorAll('.magic-btn'),
            prevBtn: document.getElementById('prev-circle'),
            nextBtn: document.getElementById('next-circle'),
            // Location Views
            viewHome: document.getElementById('view-home'),
            viewTraining: document.getElementById('view-training'),
            viewDungeon: document.getElementById('view-dungeon'),
            sharedArea: document.getElementById('shared-gameplay-area'),
            navTabs: document.querySelectorAll('.nav-tab')
        };

        this.els.castBtn.addEventListener('click', () => this.handleCast());
        this.els.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleCast();
        });

        // Circle Navigation
        this.els.prevBtn.addEventListener('click', () => this.changeCircle(-1));
        this.els.nextBtn.addEventListener('click', () => this.changeCircle(1));

        this.fx = new ParticleSystem(document.getElementById('fx-container'));

        // Init 3D Scene
        this.sceneManager = new SceneManager('three-container');

        // Init first monster
        this.game.spawnMonster();
        this.updateStats();

        // Sync 3D scene
        this.sceneManager.spawnMonster(this.game.monster.name, this.game.circle);
        this.sceneManager.updateMagicEnvironment(this.game.magicType);
    }

    // Assuming setLocation is a method of UIManager or GameState that UIManager calls
    // This block is inserted into a hypothetical setLocation method.
    // Since setLocation is not in the provided content, I'll place it where it logically
    // would be if it were part of the UIManager, or assume it's a new method.
    // Given the context of `this.els.viewDungeon` and `this.els.sharedArea`,
    // it's likely a method that controls UI visibility based on location.
    // I will create a placeholder `setLocation` method in UIManager for this.
    updateLocationUI(loc) {
        // Update Tabs
        this.els.navTabs.forEach(tab => {
            if (tab.innerText.toLowerCase().includes(loc)) tab.classList.add('active');
            else tab.classList.remove('active');
        });

        // Hide all views first
        this.els.viewHome.style.display = 'none';
        this.els.viewTraining.style.display = 'none';
        this.els.viewDungeon.style.display = 'none';
        this.els.sharedArea.style.display = 'none';

        if (loc === 'home') {
            this.els.viewHome.style.display = 'block';
        } else if (loc === 'training') {
            this.els.viewTraining.style.display = 'block';
            this.els.sharedArea.style.display = 'block';
        } else if (loc === 'dungeon') {
            this.els.viewDungeon.style.display = 'block';
            this.els.sharedArea.style.display = 'block';

            // Ensure 3D monster follows resizing
            if (this.game.monster) {
                window.dispatchEvent(new Event('resize'));
                this.sceneManager.spawnMonster(this.game.monster.name, this.game.circle);
                this.sceneManager.updateMagicEnvironment(this.game.magicType);
            }
        }
    }

    changeCircle(delta) {
        const newCircle = this.game.circle + delta;
        if (newCircle < 1 || newCircle > 10) return; // Bounds check (1-10)

        this.game.circle = newCircle;

        // Reset Monster for the new circle
        this.game.spawnMonster();
        this.sceneManager.spawnMonster(this.game.monster.name, this.game.circle);

        // Refresh Problem
        const nextProb = generator.generate(this.game.circle, this.game.magicType);
        this.displayProblem(nextProb);

        this.updateStats();
    }

    updateStats() {
        this.els.circle.textContent = this.game.circle;

        const xpPct = (this.game.xp / this.game.maxXp) * 100;
        this.els.xpBar.style.width = `${xpPct}%`;

        const manaPct = (this.game.mana / this.game.maxMana) * 100;
        this.els.manaBar.style.width = `${manaPct}%`;

        const hpPct = (this.game.hp / this.game.maxHp) * 100;
        this.els.hpBar.style.width = `${hpPct}%`;

        if (this.game.monster) {
            const mHpPct = (this.game.monster.currentHp / this.game.monster.maxHp) * 100;
            this.els.monsterHpBar.style.width = `${mHpPct}%`;
            this.els.monsterName.textContent = `${this.game.monster.name} (Lvl ${this.game.circle})`;
            // 3D visual handled by SceneManager, no 2D update needed
        }
    }

    displayProblem(problem) {
        this.els.problem.innerHTML = problem.text;
        this.els.input.value = '';
        this.els.input.focus();
        this.els.feedback.textContent = '';

        this.consecutiveFailures = 0;
        this.hideHint();
    }

    handleCast() {
        const val = parseFloat(this.els.input.value);
        if (isNaN(val)) return;

        // Check answer with some tolerance for floats
        const correct = Math.abs(val - generator.currentProblem.answer) < 0.1; // Increased tolerance for physics

        if (correct) {
            this.onSuccess();
        } else {
            this.onFailure();
        }
    }

    onSuccess() {
        this.els.feedback.textContent = "SPELL CAST SUCCESS!";
        this.els.feedback.className = "feedback-text success";

        // Spawn particles
        const rect = this.els.input.getBoundingClientRect();
        const demoCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        this.fx.spawnExplosion(demoCenter.x, demoCenter.y, this.game.circle);

        // Spell Damage
        const damage = 20 + (this.game.circle * 5);
        const killed = this.game.damageMonster(damage);

        this.sceneManager.playDamageEffect();

        if (killed) {
            this.els.feedback.textContent = `VICTORY! ${this.game.monster.name} Defeated!`;
            this.game.gainXp(50); // Bonus XP

            // Respawn delay
            setTimeout(() => {
                this.game.spawnMonster();
                this.sceneManager.spawnMonster(this.game.monster.name, this.game.circle);
                this.updateStats();
            }, 1500);
        } else {
            this.game.gainXp(10);
        }

        this.updateStats();

        setTimeout(() => {
            const nextProb = generator.generate(this.game.circle, this.game.magicType);
            this.displayProblem(nextProb);
        }, 1200);
    }

    onFailure() {
        this.consecutiveFailures++;
        this.els.feedback.textContent = "MANA BURN! (HP DRAINED)";
        this.els.feedback.className = "feedback-text fail";
        this.game.hp = Math.max(0, this.game.hp - 10);

        this.updateStats();

        // Check hint condition
        if (this.consecutiveFailures >= 5) {
            this.showHint();
        }
    }

    showHint() {
        const hintText = generator.currentProblem.hint || "Concentrate on the arcane symbols...";
        this.els.hint.textContent = `Guide: ${hintText}`;
        this.els.hint.style.display = 'block';
    }

    hideHint() {
        this.els.hint.style.display = 'none';
        this.els.hint.textContent = '';
    }
}

class ParticleSystem {
    constructor(container) {
        this.container = container;
    }

    spawnExplosion(x, y, tier) {
        const count = 20 + (tier * 5); // More particles for higher tiers
        const colors = [
            '#a855f7', // Novice Purple
            '#3b82f6', // Blue
            '#fbbf24', // Gold
            '#ef4444', // Red
            '#ffffff'  // White/God
        ];

        // Pick color based on tier (loop if > colors len)
        const color = colors[(tier - 1) % colors.length];

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            p.style.backgroundColor = color;
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;

            const size = Math.random() * 8 + 4;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;

            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 100 + 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            p.style.setProperty('--tx', `${tx}px`);
            p.style.setProperty('--ty', `${ty}px`);

            this.container.appendChild(p);

            // Cleanup
            setTimeout(() => p.remove(), 1000);
        }
    }
}

// Global functions need to be before usage or attached to window if module
function selectMagic(type) {
    game.magicType = type;

    document.querySelectorAll('.magic-btn').forEach(btn => {
        if (btn.dataset.type === type) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Environment update
    ui.sceneManager.updateMagicEnvironment(type);

    // Regenerate
    const nextProb = generator.generate(game.circle, game.magicType);
    ui.displayProblem(nextProb);
}

function changeLocation(loc) {
    game.setLocation(loc);
}

// Init
const game = new GameState();
const generator = new ProblemGenerator();
const ui = new UIManager(game);

// Start (Default to Home logic)
game.setLocation('home');
ui.updateStats();
ui.displayProblem(generator.generate(game.circle, game.magicType));
