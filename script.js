document.addEventListener("DOMContentLoaded", function() {
    // Pegando os botões principais
    const startButton = document.getElementById("start-button");
    const settingsButton = document.getElementById("settings-button");
    const aboutButton = document.getElementById("about-button");
    const level1Button = document.getElementById("level-1-button");
    const gameContainer = document.getElementById("game-container");
    const level2Button = document.getElementById("level-2-button");

    
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");






    // Pegando as seções
    const mainMenu = document.querySelector("main");
    const gameSection = document.getElementById("game-section");
    const settingsSection = document.getElementById("settings-section");
    const aboutSection = document.getElementById("about-section");

    // Botões de voltar
    const gameBackButton = document.getElementById("game-back-button");
    const settingsBackButton = document.getElementById("settings-back-button");
    const aboutBackButton = document.getElementById("about-back-button");
    const backToMenu = document.getElementById("back-to-menu");

    // Função para mostrar seção e ocultar menu
    function showSection(section) {
        mainMenu.classList.add("hidden");
        section.classList.remove("hidden");
    }

    // Função para voltar ao menu principal
    function goBack() {
        gameSection.classList.add("hidden");
        settingsSection.classList.add("hidden");
        aboutSection.classList.add("hidden");
        mainMenu.classList.remove("hidden");
    }

    // Eventos de clique
    startButton.addEventListener("click", () => showSection(gameSection));
    settingsButton.addEventListener("click", () => showSection(settingsSection));
    aboutButton.addEventListener("click", () => showSection(aboutSection));

    gameBackButton.addEventListener("click", goBack);
    settingsBackButton.addEventListener("click", goBack);
    aboutBackButton.addEventListener("click", goBack);



    // 1 "Iniciar Jogo" exibe o menu de fases
    startButton.addEventListener("click", function () {
        mainMenu.classList.add("hidden");
        gameSection.classList.remove("hidden");
    });

    // 2 "Fase 1" inicia o jogo e esconde os menus
    level1Button.addEventListener("click", function () {
        gameSection.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        startGame();
    });
 

    // 3 "Voltar" retorna ao menu inicial
    gameBackButton.addEventListener("click", function () {
        gameSection.classList.add("hidden");
        mainMenu.classList.remove("hidden");
    });

    level2Button.addEventListener("click", function () {
        gameSection.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        startLevel2();
    });




    

   
     

    let currentLevel = 1; // Variável para controlar o nível atual
    let transitioning = false;
    let platforms = []; 
    let questionActive = false; // flag de controle 
    let enemies = []; // Array para armazenar inimigos
    let spawnTimer = 0; // Timer para controle de spawn de inimigos
    let score = 0; // Pontuação inicial do jogador
    let lives = 3; // Vidas iniciais do jogador

    let hitTime = 0;
    let isHit = false;

    
    let offsetX = 0;
    let offsetY = 0;
    let animationId; // ID da animação para cancelamento
    let gameLoop = null;
    

    let platformEnemiesFase1 = [];
    let platformEnemiesFase2 = [];

    let shootingEnemies = [];
    let enemyProjectiles = [];
    let physicsReady = false;

    let player = {
     x: 0,
     y: 0,
     width: 50,
     height: 50,
     velocityX: 0,
     velocityY: 0,
     onGround: false,

  
    };

  let portal = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    color: "golden",
    active: false
  };

   function stopGameLoop() {
        if (animationId) {
            cancelAnimationFrame(animationId); // Cancela o loop atual
            animationId = null; // Reseta o ID da animação
        }
    }





 


// Imagem de fundo da fase 1
const backgroundImage1 = new Image();
backgroundImage1.src = "assets/background.png";

// Imagem de fundo da fase 2
const backgroundImage2 = new Image();
backgroundImage2.src = "assets/background2.png";

window.goToMainMenu = function () {
    window.location.href = "index.html"; // ou o caminho do seu menu principal
};

function perderVida() {
    lives--;
    if (lives <= 0) {
        gameOver = true;
        const gameOverScreen = document.getElementById("game-over-screen");
        gameOverScreen.classList.remove("hidden");
        cancelAnimationFrame(animationId); // Para o loop do jogo
    }
}



function startLevel2() {
    stopGameLoop(); // Para o loop atual
    currentLevel = 2; // Muda para a fase 2

    if(portal) portal = null;

    startGame();

    

    document.body.classList.remove("fase1"); // Remove o fundo da fase 1
    document.body.classList.add("fase2"); // Adiciona o fundo da fase 2

    // Limpa tudo da fase 1
    platforms = [];
    enemies = [];
    
     // Reposiciona jogador
    player.x = 50;
    player.y = 50;

    
        // Cria plataformas da fase 2
    platforms = [
            //{ x: 100, y: 100, width: 150, height: 10, color: "darkgreen"},
            { x: 100, y: 300, width: 150, height: 10, color: "darkgreen", question: "Quanto é 10 ÷ 2?", options: ["3", "5", "8"], correctIndex: 1, answered: false },
            { x: 300, y: 250, width: 150, height: 10, color: "darkgreen" },
            { x: 500, y: 200, width: 150, height: 10, color: "darkgreen", question: "Qual o oposto de quente?", options:["calor", "Frio","amargo"],correctIndex: 1, answered: false },
            { x: 700, y: 150, width: 150, height: 10, color: "darkgreen" },
            { x: 900, y: 200, width: 150, height: 10, color: "darkgreen", question: "Qual a área de um retângulo que tem 5 metros de largura e 3 metros de altura?", options:["15 m²", "18 m²","10 m²"],correctIndex: 0, answered: false },
            { x: 1100, y: 250, width: 150, height: 10, color: "darkgreen" },
            { x: 1300, y: 300, width: 150, height: 10, color: "darkgreen", question: "Quem descobriu o Brasil?", options:["Princesa Isabel", "Pedro Àlvares Cabral", "Dom Pedro 1"], correctIndex: 1, answered: false },

            { x: 100, y: canvas.height - 150, width: 200, height: 10, color: "darkgreen", question: "Qual destes é um animal mamìfero?", options:["Jacaré", "Golfinho", "Galinha"], correctIndex: 1, answered: false },
            { x: 350, y: canvas.height - 180, width: 150, height: 10, color: "darkgreen" },
            { x: 550, y: canvas.height - 210, width: 150, height: 10, color: "darkgreen", question: "Qual é a capital da França?", options:["Montreal", "Berlim", "Paris"], correctIndex: 2, answered: false },
            { x: 750, y: canvas.height - 240, width: 150, height: 10, color: "darkgreen" },
            { x: 950, y: canvas.height - 270, width: 150, height: 10, color: "darkgreen", question: "Quanto é 8 ÷ 2?", options:["6", "4","8"], correctIndex: 1, answered: false },
            { x: 1150, y: canvas.height - 240, width: 150, height: 10, color: "darkgreen" },
            { x: 1350, y: canvas.height - 210, width: 150, height: 10, color: "darkgreen", question: "Qual o plural de papel?", options:["Papéis", "Papels","papelz"], correctIndex: 0, answered: false },
            { x: 1550, y: canvas.height - 180, width: 150, height: 10, color: "darkgreen" },
            { x: 600, y: canvas.height - 250, width: 120, height: 10, color: "darkgreen" },
            { x: 800, y: canvas.height - 400, width: 150, height: 10, color: "darkgreen" },
            { x: 970, y: canvas.height - 200, width: 150, height: 10, color: "darkgreen" },
            { x: 200, y: canvas.height - 200, width: 150, height: 10, color: "darkgreen" , question: "Qual desses é um recurso natural renovável?", options:["Carvão", "Petróleo","Energia Solar"], correctIndex: 2, answered: false},
            { x: 700, y: canvas.height - 100, width: 150, height: 10, color: "darkgreen" },
            { x: 850, y: canvas.height - 200, width: 150, height: 10, color: "darkgreen" },
            { x: 300, y: canvas.height - 300, width: 150, height: 10, color: "darkgreen" },
            { x: 750, y: canvas.height - 200, width: 150, height: 10, color: "darkgreen" },
            { x: 900, y: canvas.height - 150, width: 150, height: 10, color: "darkgreen" },
            { x: 100, y: canvas.height - 270, width: 200, height: 10, color: "darkgreen"},
            { x: 100, y: canvas.height - 380, width: 200, height: 10, color: "darkgreen"},
            { x: 1300, y: canvas.height - 300, width: 150, height: 10, color: "darkgreen"},
            { x: 1300, y: canvas.height - 380, width: 150, height: 10, color: "darkgreen"},


        ];

        shootingEnemies = [
            {
                x: 200,
                y: canvas.height - 300,
                width: 30,
                height: 30,
                color: "red",
                speed: 3,
                direction: 1, // Direção inicial
                shootInterval: 90, // Intervalo de tiro em frames
                shootTimer: 0 // Timer para controle de tiro
            },
            {
                x: 800,
                y: canvas.height - 200 - 30,
                width: 30,
                height: 30,
                color: "red",
                speed: 3,
                direction: -1, // Direção inicial
                shootInterval: 90, // Intervalo de tiro em frames
                shootTimer: 0 // Timer para controle de tiro
            },
            {
                x: 800,
                y: canvas.height - 200 - 30,
                width: 30,
                height: 30,
                color: "red",
                speed: 3,
                direction: 1, // Direção inicial
                shootInterval: 90, // Intervalo de tiro em frames
                shootTimer: 0 // Timer para controle de tiro
            },
            {
                x: 1250,
                y: canvas.height - 250 - 20,
                width: 30,
                height: 30,
                color: "red",
                speed: 3,
                direction: -1,// Direção inicial
                shootInterval: 90, // Intervalo de tiro em frames
                shootTimer: 0 // Timer para controle de tiro
            },
            {
                x: 1300,
                y: canvas.height - 380 - 30,
                width: 30,
                height: 30,
                color: "red",
                speed: 3,
                direction: -1, // Direção inicial
                shootInterval: 90, // Intervalo de tiro em frames
                shootTimer: 0 // Timer para controle de tiro
            },
            {
                x: 1100,
                y: canvas.height - 530 - 30,
                width: 30,
                height: 30,
                color: "red",
                speed: 3,
                direction: -1, // Direção inicial
                shootInterval: 90, // Intervalo de tiro em frames
                shootTimer: 0 // Timer para controle de tiro
            },
            {
                x: 300,
                y: canvas.height - 530 - 30,
                width: 30,
                height: 30,
                color: "red",
                speed: 3,
                direction: 1, // Direção inicial
                shootInterval: 90, // Intervalo de tiro em frames
                shootTimer: 0 // Timer para controle de tiro
            }
        ];

        

        // Pode adicionar novos inimigos ou lógica de fase 2 aqui
        portal.active = false; // Desativa portal até fase 2 estar pronta pra transição
        portal.x = 1450;
        portal.y = 250;
       
}


    








function startGame() {

    
    canvas.width = 800;
    canvas.height = 600;

    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Configuração do jogador
    const player = {
        x: 100, y: canvas.height - 150, width: 14, height: 14,
        color: "red", speed: 5, velY: 0, gravity: 0.5, jumpPower: -15,
        onGround: false
    };

    
    
    // Configuração do chão
    const ground = { x: 0, y: canvas.height - 30, width: canvas.width, height: 50, color: "blue" };



     // Criando plataformas
      platforms = [
        { x: 100, y: canvas.height - 500, width: 200, height: 10, color: "blue", question: "Qual a função dos glóbulos brancos no sangue ?", options:["transportar sangue", "atacar microrganismos invasores","coagular o sangue"],correctIndex: 1,  answered: false},
        { x: 250, y: canvas.height - 450, width: 110, height: 10, color: "blue" },
        { x: 400, y: canvas.height - 350, width: 140, height: 10, color: "blue", question: "Em que ano o Brasil foi descoberto pelos portugueses?", options:["1822", "1700","1500"],correctIndex: 2, answered: false },
        { x: 600, y: canvas.height - 250, width: 120, height: 10, color: "blue" },
        { x: 800, y: canvas.height - 400, width: 150, height: 10, color: "blue" , question: "Qual é a principal linha imaginária que divide a Terra em hemisferio norte e sul?", options:["meridiano de Greenwich", "trópico de Câncer","Linha do Equador"],correctIndex: 2, answered: false },
        { x: 950, y: canvas.height - 300, width: 150, height: 10, color: "blue" },
        { x: 200, y: canvas.height - 200, width: 150, height: 10, color: "blue" },
        { x: 500, y: canvas.height - 150, width: 150, height: 10, color: "blue" ,question: "Qual é o menor planeta do sistema solar?", options:["Netuno", "Mercurio","Plutão"], correctIndex: 1, answered: false},
        { x: 700, y: canvas.height - 100, width: 150, height: 10, color: "blue" },
        { x: 850, y: canvas.height - 200, width: 150, height: 10, color: "blue" },
        { x: 300, y: canvas.height - 300, width: 150, height: 10, color: "blue" ,question: "Qual parte do corpo humano é responsável por bombear o sangue?", options:["coração", "pulmão","fígado"], correctIndex: 0, answered: false},
        { x: 750, y: canvas.height - 200, width: 150, height: 10, color: "blue" },
        { x: 900, y: canvas.height - 150, width: 150, height: 10, color: "blue" },
        { x: 1100, y: canvas.height - 100, width: 150, height: 10, color: "blue" },
        { x: 1000, y: canvas.height - 350, width: 150, height: 10, color: "blue", question: "Qual é o mínimo multiplo comum entre 12 e 18?", options:["12", "36","24"], correctIndex: 1, answered: false },
        { x: 1200, y: canvas.height - 250, width: 150, height: 10, color: "blue" },
        { x: 1100, y: canvas.height - 100, width: 150, height: 10, color: "blue" },
        { x: 1300, y: canvas.height - 400, width: 150, height: 10, color: "blue" },
        { x: 1400, y: canvas.height - 200, width: 150, height: 10, color: "blue", question: "Quantos que é 5 x 6?", options:["25", "30","15"], correctIndex: 1, answered: false },
        { x: 1250, y: canvas.height - 100, width: 150, height: 10, color: "blue" },
        { x: 1500, y: canvas.height - 100, width: 150, height: 10, color: "blue" },
    ];

    platformEnemiesFase1 = [
        {
        x: 950, // início do movimento (dentro da plataforma)
        y: canvas.height - 330, // um pouco acima da plataforma
        width: 30,
        height: 30,
        color: "red",
        speed: 2,
        direction: 1,
        minX: 950,                 // borda esquerda da plataforma
        maxX: 950 + 150 - 30       // borda direita da plataforma (plataforma largura 150 - largura do inimigo)
    },

    { 
        x: 200,
        y: canvas.height - 230,
        width: 30,
        height: 30,
        color: "red",
        speed: 2,
        direction: 1,
        minX: 200,
        maxX: 200 + 150 - 30
    },

    {
        x: 700,
        y: canvas.height - 100 - 30,
        width: 30,
        height: 30,
        color: "red",
        speed: 2,
        direction: 1,
        minX: 700,
        maxX: 700 + 150 - 30
    },

    {
        x: 750,
        y: canvas.height - 200 - 30,
        width: 30,
        height: 30,
        color: "red",
        speed: 2,
        direction: 1,
        minX: 750,
        maxX: 750 + 150 - 30
    },

    {
        x: 600,
        y: canvas.height - 250 - 30,
        width: 30,
        height: 30,
        color: "red",
        speed: 2,
        direction: 1,
        minX: 600,
        maxX: 600 + 150 - 30
    }
        

    ]
    
    // Controle de teclas
    const keys = { left: false, right: false };


    
    window.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();

        if (event.key === "ArrowLeft" || key === "a") keys.left = true;
        if (event.key === "ArrowRight" || key === "d") keys.right = true;
        if ((event.key === "ArrowUp" || key === "w") && player.onGround) {
                player.velY = player.jumpPower;
                player.onGround = false;
        }
    });
    
    window.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase();

        if (event.key === "ArrowLeft" || key === "a") keys.left = false;
        if (event.key === "ArrowRight" || key === "d") keys.right = false;
    });

    function drawPlatforms(ctx) {
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
    
        platforms.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.width, p.height);
    
            if (p.question) {
                ctx.fillStyle = "black";
                if (p.answered) {
                    ctx.fillText("✔️", p.x + p.width / 2, p.y - 5); // Marca como respondida
                } else {
                ctx.fillText("❓", p.x + p.width / 2, p.y - 5);
            }
            
        }
        
    });
    }

    function checkQuestionCollision(player) {
        platforms.forEach(p => {
            if (
                p.question && !p.answered &&
                player.y + player.height >= p.y &&
                player.y + player.height - player.velY < p.y &&
                player.x + player.width > p.x &&
                player.x < p.x + p.width
                
            ) {
                console.log("Colidiu com a pergunta: " + p.question); //teste
                showQuestion(p.question, p.options, p.correctIndex, p); // Troque por pergunta real
                //p.answered = true; // marcar como ja respondida
                
            }
        });
    }
   
    function showQuestion(question, options, correctIndex, plataformaReferencia) {
        // Exibir a caixa de pergunta

        const container = document.getElementById('question-container');
        const questionText = document.getElementById('question-text');
        const answerInput = document.getElementById('answer-input');
        const optionsContainer = document.getElementById('options-container');
        const submitButton = document.getElementById("submit-answer");
        const feedback = document.getElementById('feedback-message');

        
         // Limpa conteúdo antigo
        optionsContainer.innerHTML = "";
        feedback.classList.add('hidden'); // Esconde feedback
        container.classList.remove('hidden');
        if (answerInput) answerInput.style.display = 'none'; // Esconde o campo de resposta
        submitButton.style.display = 'inline-block'; // Esconde o botão de enviar
        questionText.textContent = question;
        questionActive = true; //ativa a flag

        let selectedOption = null; // Variável para armazenar a opção selecionada
        let currentAttempts = 2; // Tentativas atuais do jogador


        options.forEach((option, index) => {
          const button = document.createElement("button");
          button.textContent = option;
          button.classList.add("option-button");

          // Quando clicar, marca a opção escolhida
          button.onclick = function () {
            // Desmarca os outros
            optionsContainer.querySelectorAll('.option-button').forEach(btn => {
                btn.classList.remove('selected');
            });

            button.classList.add('selected');
            selectedOption = index; 
            
        };

            optionsContainer.appendChild(button); 
        
        
    });

        if (answerInput) answerInput.style.display = 'none';
        
    
        // Função para verificar a resposta do jogador
        submitButton.style.display = 'inline-block'; // Mostra o botão de enviar
        submitButton.onclick = function() {
            if (selectedOption === null) {
                alert('Por favor, selecione uma opção.');
                return;
           
            }


            
            if (Number(selectedOption) === Number(correctIndex)) {
                const feedback = document.getElementById('feedback-message');

                feedback.style.backgroundColor = "#d4edda"; // verde claro
                feedback.style.color = "#155724"; // texto verde escuro

                feedback.textContent = "Você acertou!";
                feedback.classList.remove('hidden');
               

                    // Confete animado 🎉
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.3 }
                });

                score++; // Aumenta a pontuação
                setTimeout(() => {
                    if (plataformaReferencia) plataformaReferencia.answered = true; // Marca a plataforma como respondida
                    feedback.classList.add('hidden');
                    container.classList.add('hidden'); // Esconder a caixa de pergunta
                    questionActive = false; // Desativa a flag
                    startGameLoop();
                }, 3000);


            } else {
                currentAttempts--; // Diminui as tentativas

                if (currentAttempts <= 0) {
                    //perde uma vida
                    perderVida();



                    const feedback = document.getElementById('feedback-message');
                    feedback.textContent = "Você errou e perdeu uma vida! vidas restantes: ";
                    feedback.style.backgroundColor = "#f8d7da"; // vermelho claro
                    feedback.style.color = "#721c24"; // texto vermelho escuro
                    feedback.classList.remove('hidden');

                    // Esconde depois de 3 segundos
                    setTimeout(() => {
                       container.classList.add('hidden'); // Esconder a caixa de pergunta
                       feedback.classList.add('hidden');
                       questionActive = false; // Desativa a flag

                       if (lives <= 0) {
                            showGameOver(); // Chama a função de game over

                            const gameOverScreen = document.getElementById("game-over-screen");
                            gameOverScreen.classList.remove("hidden");

                            cancelAnimationFrame(animationId); // Para o loop do jogo
                            return;
                        }                       

                       startGameLoop();
                    }, 3000);

                }else {
                    feedback.textContent = "Você errou! Tentativas restantes: " + currentAttempts;
                    feedback.style.backgroundColor = "#fff3cd"; // amarelo claro
                    feedback.style.color = "#856404"; // texto amarelo escuro
                    feedback.classList.remove('hidden');

                    setTimeout(() => {
                        feedback.classList.add('hidden');
                    }, 3000);    
                }

            }
            
        };
    }

    // spawna um novo inimigo 
    function spawnEnemy() {
        enemies.push({
            x: Math.random() * canvas.width,
            y: -30,
            width: 30,
            height: 30,
            speed: 8,
            color: "green"
        });
    }
    
    // Health inicial do jogador
    player.health = 3; 


    function checkenemyCollision(player) {
        enemies.forEach(enemy  => {
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                // Colisão com o inimigo
                if (!isHit) {
                    isHit = true;
                    hitTime = 20; // Marca o tempo do hit
                    console.log("Colidiu com o inimigo!"); // teste

                }
            }
            
        });

    }

    const portal = {
        x: 500,
        y: 540,
        width: 50,
        height: 60,
        color: "purple",
        active: false 
        
        
    };

   

    function showGameOver() {
     // Para o loop do jogo
       cancelAnimationFrame(animationId);
       starSkullRain(); // Chama a função de chuva de caveiras


        const gameOverScreen = document.getElementById("game-over-screen");
        gameOverScreen.classList.remove("hidden");
    }

    function goToMainMenu() {
         // Redireciona para a tela inicial
        window.location.href = "index.html"; // Troca se teu menu estiver em outro lugar
    }

    function starSkullRain() {
        const canvas = document.createElement('canvas');
        canvas.id = 'skullCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);


        const ctx = canvas.getContext('2d');
        const skulls = [];


        for (let i = 0; i < 30; i++) {
            skulls.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 20 + Math.random() * 20,
                speed: 1 + Math.random() * 2,
            });

        }

        function animateSkulls() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "bold 24px Arial";
            ctx.fillStyle = "white";

            skulls.forEach(skull => {
                ctx.fillText("💀", skull.x, skull.y);
                skull.y += skull.speed;

                if (skull.y > canvas.height) {
                    skull.y = -20;
                    skull.x = Math.random() * canvas.width;
                }
            });

            requestAnimationFrame(animateSkulls);
        }

        animateSkulls();
    }

    const portalFinal = {
        x: 300,
        y: 200,
        width: 50,
        height: 50,
        color: "gold",
        active: false 
    }

    const pontuacaoNecessaria = 16; // Pontuação necessária para passar de fase

    function showVictoryScreen() {
        cancelAnimationFrame(animationId); // Para o loop do jogo
        const victoryScreen = document.getElementById("victory-screen");
        victoryScreen.classList.remove("hidden");

        confetti({
            particleCount: 100,
            spread: 50,
            origin: { y: 0.3 }
        });
    }

    function startGameLoop() {
        if (animationId) cancelAnimationFrame(animationId); // Cancela o loop atual
        animationId = requestAnimationFrame(gameLoop); // Inicia o loop do jogo
    }



    function updatePLayer() {
        if (player.x < 0) player.x = 0; // Limita a posição do jogador à esquerda
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width; // Limita a posição do jogador à direita
        if (player.y < 0) player.y = 0; // Limita a posição do jogador ao topo
        if (player.y + player.height > canvas.height) player.y = canvas.height - player.height; // Limita a posição do jogador à parte inferior
    }

    function drawPortal() {
        if (portal.active) {
            ctx.fillStyle = portal.color;
            ctx.fillRect(portal.x, portal.y, portal.width, portal.height);

            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.strokeRect(portal.x, portal.y, portal.width, portal.height);
        }
    }

    function spawnPlatformEnemies (x, y, plataformWidth) {
        const enemy = {
            x: x,
            y: y - 30, // Coloca o inimigo acima da plataforma
            width: 30,
            height: 30,
            speed: 2,
            direction: 1,
            minX: x,
            maxX: x + plataformWidth - 30, // Limita o movimento do inimigo à plataforma
            color: "green"
        };
        platformEnemies.push(enemy);

    }    

    function gameStart() {
        if (animationId) {
            cancelAnimationFrame(animationId); // Cancela o loop atual
            animationId = null; // Reseta o ID da animação
        }
    }

    

        
    
    function gameLoop() {
      

        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        updatePLayer();

        if (currentLevel === 1) {
            ctx.drawImage(backgroundImage1, 0, 0, canvas.width, canvas.height); 
        } else if (currentLevel === 2) {
        ctx.drawImage(backgroundImage2, 0, 0, canvas.width, canvas.height);

        }



        if (questionActive) {
           
            return; // Pausa o jogo enquanto a pergunta está ativa
        }
    
        if (keys.left) player.x -= player.speed;
        if (keys.right) player.x += player.speed;
        player.y += player.velY;
        player.velY += player.gravity;

        checkenemyCollision(player); // Verifica colisão com inimigos

        checkQuestionCollision(player);

        
        if (player.y + player.height >= ground.y) {
                player.y = ground.y - player.height;
                player.velY = 0;
                player.onGround = true;
        }
        else {
            player.onGround = false;
        }

      
      
        // Checando colisão com plataformas
        platforms.forEach(platform => {
            if (
                player.y + player.height >= platform.y && // Colisão vertical
                player.y + player.height - player.velY < platform.y && // Está descendo
                player.x + player.width > platform.x && // Dentro da largura da plataforma
                player.x < platform.x + platform.width
            ) {
                player.y = platform.y - player.height;
                player.velY = 0;
                player.onGround = true;
            }
        });
    



        ctx.fillStyle = ground.color;
        ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

        

    
        drawPlatforms(ctx);
        drawPortal();

        if (currentLevel === 1) {
            platformEnemiesFase1.forEach((enemy) => {
                updateAndDrawPlatformEnemy(enemy);
            });
        }

        if (currentLevel === 2) {
            platformEnemiesFase2.forEach((enemy) => {
                updateAndDrawPlatformEnemy(enemy);
            });
        }

        if (currentLevel === 2) {
            shootingEnemies.forEach((enemy) => {

                ctx.fillStyle = enemy.color;
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

                enemy.shootTimer++;
                if (enemy.shootTimer >= enemy.shootInterval) {
                    enemyProjectiles.push({
                        x: enemy.direction === 1 ? enemy.x + enemy.width: enemy.x - 10,
                        y: enemy.y + enemy.height /2 - 5,
                        width: 10,
                        height: 10,
                        speed: 4,
                        color: "red",
                        direction: enemy.direction
                    });
                    enemy.shootTimer = 0; // Reseta o timer de tiro
                }
            });

            enemyProjectiles.forEach((bullet, i) => {
                bullet.x += bullet.speed * bullet.direction;

                ctx.fillStyle = bullet.color;
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

                if (
                    bullet.x < player.x + player.width &&
                    bullet.x + bullet.width > player.x &&
                    bullet.y < player.y + player.height &&
                    bullet.y + bullet.height > player.y
                ){
                    if (!isHit) {
                        perderVida();
                        player.health -= 1; // Diminui a vida do jogador
                        isHit = true;
                        hitTime = 60; // Marca o tempo do hit

                        if (player.health <= 0) {
                            showGameOver(); 
                        }
                    }
                    enemyProjectiles.splice(i, 1); // Remove a bala após a colisão
                }

                if (bullet.x < 0 || bullet.x > canvas.width) {
                    enemyProjectiles.splice(i, 1); // Remove a bala se sair da tela
                }
            });
        }




        function updateAndDrawPlatformEnemy(enemy) {

            enemy.x += enemy.speed * enemy.direction; // Move o inimigo para a direita ou esquerda

            if (enemy.x < enemy.minX || enemy.x > enemy.maxX) {
                enemy.direction *= -1; // Inverte a direção
            }

            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                if (!isHit){ 
                    perderVida(); // Diminui a vida do jogador
                    player.health -= 1; // Diminui a vida do jogador
                    isHit = true;
                    hitTime = 60; // Marca o tempo do hit


                    if (player.health <= 0) {
                        showGameOver(); 
                    }    
               
                }
            
            }
        }   

        // spawning baseado em tempo
        spawnTimer++;
        if (spawnTimer > 20) { // Spawn a cada 100 frames
            for (let i = 0; i < 2; i++) { // Spawn 1 inimigo por vez
                spawnEnemy();
            }
            spawnTimer = 0;
        }

        enemies.forEach((enemy, index) => {
            enemy.y += enemy.speed; // Move o inimigo para baixo

            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                // Colisão com o inimigo
                player.health -= 1; // Diminui a vida do jogador
                enemies.splice(index, 1); // Remove o inimigo após a colisão
                perderVida(); // Diminui a vida do jogador
                if (player.health <= 0) {
                    showGameOver(); 
                }
    

            // se sair da tela,remove
            if (enemy.y > canvas.height) {
                enemies.splice(index, 1); // Remove o inimigo se sair da tela
            }

        }

        });    

        function drawHUD(ctx) {
            ctx.fillStyle = "black";
            ctx.font = "20px Arial";
            ctx.textAlign = "left";
            ctx.fillText("✔️ Acertos: " + score, 10, 30);
            ctx.fillText("❤️ Vidas: " + lives, 10, 60);
        }

    

        if (hitTime > 0) {
            offsetX = Math.random() * 10 - 5; // Deslocamento aleatório
            offsetY = Math.random() * 10 - 5; // Deslocamento aleatório
            hitTime--;
            if(hitTime <= 0) {
                isHit = false; // Reseta a flag de hit
                offsetX = 0; // Reseta o deslocamento
                offsetY = 0; // Reseta o deslocamento

            }
              
               
        }


        ctx.fillStyle = player.color;
        ctx.fillRect(player.x + offsetX, player.y + offsetY, player.width, player.height);


        const allAnswered = platforms.every(p => !p.question || p.answered); // Verifica se todas as perguntas foram respondidas
        if (allAnswered && currentLevel === 1) {
            portal.active = true; // Ativa o portal
        }

        if (portal.active && currentLevel === 1) {
            ctx.fillStyle = portal.color;
            ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
        }

        if (
            portal.active &&
            player.x < portal.x + portal.width &&
            player.x + player.width > portal.x &&
            player.y < portal.y + portal.height &&
            player.y + player.height > portal.y
        ) {
            console.log("indo para a proxima fase "); // teste 
            transitioning = true; 
            startLevel2(); // Chama a função para iniciar a próxima fase

        }


        if (currentLevel === 2 && score >= pontuacaoNecessaria) {
            portalFinal.active = true; // Ativa o portal final
        }

        if (portalFinal.active) {
            ctx.fillStyle = portalFinal.color;
            ctx.fillRect(portalFinal.x, portalFinal.y, portalFinal.width, portalFinal.height);
        }

        if (
            portalFinal.active &&
            player.x < portalFinal.x + portalFinal.width &&
            player.x + player.width > portalFinal.x &&
            player.y < portalFinal.y + portalFinal.height &&
            player.y + player.height > portalFinal.y
        ) {
            console.log("Você venceu!"); // teste
            showVictoryScreen(); // Chama a função para mostrar a tela de vitória
        }

        
           



    

        drawHUD(ctx); // Desenha o HUD com pontuação e vidas
        animationId = requestAnimationFrame(gameLoop); // Chama o loop de animação novamente
        
           
        
    }

   

    
    gameLoop();
}
});




document.getElementById("level-1-button").addEventListener("click", function() {
    document.body.classList.add("fase1"); // Adiciona o fundo
    document.getElementById("game-section").classList.add("hidden"); // Esconde menu
    
});

document.getElementById("game-back-button").addEventListener("click", function() {
    document.body.classList.remove("fase1"); // Remove o fundo
    document.getElementById("game-section").classList.remove("hidden"); // Volta ao menu
    document.getElementById("fase1").classList.add("hidden"); // Esconde fase
});


//document.getElementById("level-2-button").addEventListener("click", function() {
   // document.body.classList.add("fase2"); // Adiciona o fundo
    //document.getElementById("game-section").classList.add("hidden"); // Esconde menu
    //document.getElementById("fase1").classList.add("hidden"); // Esconde fase 1
    //startLevel2(); // Inicia a fase 2
//});








