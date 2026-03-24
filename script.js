const { Engine, Render, Runner, World, Bodies, Constraint, Composite } = Matter;

// 1. Dvigatelni sozlash
const engine = Engine.create();
const world = engine.world;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, // Rangli ko'rinish uchun
        background: 'linear-gradient(0deg, #2c3e50, #000000)'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// 2. Velosiped yaratish (Professional Suspension bilan)
function createBike(x, y) {
    const group = Matter.Body.nextGroup(true);
    
    // Ramka
    const body = Bodies.rectangle(x, y, 60, 20, { 
        collisionFilter: { group: group },
        chamfer: { radius: 10 },
        render: { fillStyle: '#e74c3c' }
    });

    // G'ildiraklar
    const wheelOptions = { 
        friction: 0.9, 
        restitution: 0.5, 
        collisionFilter: { group: group },
        render: { fillStyle: '#222' }
    };
    const wheelA = Bodies.circle(x - 35, y + 25, 25, wheelOptions);
    const wheelB = Bodies.circle(x + 35, y + 25, 25, wheelOptions);

    // Amortizatorlar (Soft Suspension)
    const axelA = Constraint.create({
        bodyA: body, pointA: { x: -35, y: 15 },
        bodyB: wheelA, length: 15,
        stiffness: 0.1, damping: 0.5
    });
    const axelB = Constraint.create({
        bodyA: body, pointA: { x: 35, y: 15 },
        bodyB: wheelB, length: 15,
        stiffness: 0.1, damping: 0.5
    });

    World.add(world, [body, wheelA, wheelB, axelA, axelB]);
    return { body, wheelA, wheelB };
}

const playerBike = createBike(200, 100);

// 3. Tog'li yo'l yaratish (Tepaliklar)
const terrain = [];
for (let i = 0; i < 20; i++) {
    const x = i * 200;
    const y = 500 + Math.sin(i * 0.5) * 80; // Sinus orqali tepaliklar
    terrain.push(Bodies.rectangle(x, y, 205, 100, { 
        isStatic: true, 
        angle: Math.sin(i * 0.5) * 0.3,
        render: { fillStyle: '#27ae60' } 
    }));
}
World.add(world, terrain);

// 4. Boshqaruv
window.addEventListener('keydown', (e) => {
    const power = 0.05;
    if (e.key === 'ArrowRight') { // Gaz
        Matter.Body.setAngularVelocity(playerBike.wheelB, power);
    }
    if (e.key === 'ArrowLeft') { // Orqaga/Tormoz
        Matter.Body.setAngularVelocity(playerBike.wheelB, -power);
    }
    if (e.key === 'a') { // Havoda muvozanat (chapga)
        Matter.Body.rotate(playerBike.body, -0.1);
    }
    if (e.key === 'd') { // Havoda muvozanat (o'ngga)
        Matter.Body.rotate(playerBike.body, 0.1);
    }
});
