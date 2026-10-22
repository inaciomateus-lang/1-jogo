const canvas = document.querySelector("canvas")
const ctx = canvas.getContext('2d')

// Define uma resolução fixa para o jogo (Proporção 16:9)
const GAME_WIDTH = 1280
const GAME_HEIGHT = 720

canvas.width = GAME_WIDTH
canvas.height = GAME_HEIGHT

window.addEventListener('resize', () => {
    canvasWidth = window.innerWidth
    canvasHeight = window.innerHeight
    canvas.width = canvasWidth
    canvas.height = canvasHeight
})

// --- INSTÂNCIAS DAS PLATAFORMAS ---
const plataformas = [
    new Plataforma({ posicao: { x: 15, y: 450 }, largura: 250, altura: 20 }),
    new Plataforma({ posicao: { x: 400, y: 650 }, largura: 250, altura: 20 }),
    new Plataforma({ posicao: { x: 1000, y: 580}, largura: 250, altura: 20 }),
    new Plataforma({ posicao: { x: 950, y: 340 }, largura: 250, altura: 20 }),
    new Plataforma({ posicao: { x: 400 , y:280 }, largura: 250, altura: 20 })
]

// --- INSTÂNCIA DO JOGADOR ---
const player = new Fighter({
    posicao: { x: 10, y: 0 },
    velocidade: { x: 0, y: 0 },
    escala: 0.18,
    desvio: { x: 0, y: -10 },
    sprites: { 
        idle: { 
            src: "./img/player/idle.png",
            totalSpriteFrames: 16, 
            framesperSpriteFrame: 6 
        },
        run: { 
            src: "./img/player/run.png",
            totalSpriteFrames: 11,
            framesperSpriteFrame: 5 
        },
        jump: {
            src: "./img/player/jump.png",
            totalSpriteFrames: 16,
            framesperSpriteFrame:1
      }
    }
})

// --- INSTÂNCIA DO CENÁRIO ---
const background = new Sprite({
    posicao: { x: 0, y: 0 },
    source: backgroundSpriteCenario,
    gravidadeAtiva: false
})

// --- INSTÂNCIAS DOS INIMIGOS ---
const inimigos = [
    new Inimigo({
        posicao: { x: 300, y: 300 },
        velocidade: { x: -1.2, y: 0 },
        escala: 0.18,
        desvio: { x: 0, y: 0 },
        limitePatrulha: { esquerda: 100, direita: 1000 },
        tipo: 'patrulha',
        sprites: {
            idle: { src: "./img/viloes/01.png", totalSpriteFrames: 15, framesperSpriteFrame: 6 },
            run: { src: "./img/viloes/01.png", totalSpriteFrames: 15, framesperSpriteFrame: 6 }
        }
    }),
    new Inimigo({
        posicao: { x: 420, y: 250 },
        velocidade: { x: 1.5, y: 0 },
        escala: 0.18,
        desvio: { x: 0, y: 0 },
        limitePatrulha: { esquerda: 410, direita: 600 },
        tipo: 'patrulha',
        sprites: {
            idle: { src: "./img/viloes/02.png", totalSpriteFrames: 15, framesperSpriteFrame: 6 },
            run: { src: "./img/viloes/02.png", totalSpriteFrames: 15, framesperSpriteFrame: 6 }
        }
    }),
    new Inimigo({
        posicao: { x: 1000, y: 100 },
        velocidade: { x: -1.5, y: 0 },
        escala: 0.18,
        desvio: { x: 0, y: 0 },
        limitePatrulha: { esquerda: 950, direita: 1400 },
        tipo: 'saltador',
        sprites: {
            idle: { src: "./img/viloes/03.png", totalSpriteFrames: 8, framesperSpriteFrame: 6 },
            run: { src: "./img/viloes/03.png", totalSpriteFrames: 8, framesperSpriteFrame: 6 }
        }
    })
]

function verificarColisao(retangulo1, retangulo2) {
    return (
        retangulo1.posicao.x < retangulo2.posicao.x + retangulo2.width &&
        retangulo1.posicao.x + retangulo1.width > retangulo2.posicao.x &&
        retangulo1.posicao.y < retangulo2.posicao.y + retangulo2.height &&
        retangulo1.posicao.y + retangulo1.height > retangulo2.posicao.y
    )
}

function desenharHUD() {
    ctx.fillStyle = "white"
    ctx.font = "bold 20px Arial"
    ctx.fillText(`VIDAS: ${player.vida}`, 20, 40)

    // Mensagem de Game Over
    if (player.vida <= 0) {
        ctx.fillStyle = "red"
        ctx.font = "bold 50px Arial"
        ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2)
    } 
    // Mensagem de Vitória ao derrotar todos os vilões
    else if (typeof inimigos !== 'undefined' && inimigos.length === 0) {
        ctx.fillStyle = "#00FF00" // 
        ctx.font = "bold 50px Arial"
        ctx.fillText("VOCÊ VENCEU!", canvas.width / 2 - 180, canvas.height / 2)
    }
}

// LOOP PRINCIPAL
function animate() {
    window.requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Só permite mover se tiver vida E se ainda houver inimigos
    if (player.vida > 0 && inimigos.length > 0) {
        atualizarcontroles()
    } else {
        player.velocidade.x = 0
        player.setSprite("idle")
    }


    // 2. Desenha o fundo
    background.update()

    // 3. Desenha plataformas
    plataformas.forEach(plataforma => plataforma.update())

    // 4. Atualiza o jogador (aplica gravidade e resolve colisões com as plataformas)
    player.update()

    // 5. Inimigos e projéteis...
    if (typeof inimigos !== 'undefined') {
        inimigos.forEach(inimigo => {
            inimigo.update()
            if (player.vida > 0 && verificarColisao(player, inimigo)) {
                player.tomarDano()
            }
        })
    }

    player.projeteis.forEach((projetil, pIndex) => {
        projetil.update()

        inimigos.forEach((inimigo, iIndex) => {
            if (verificarColisao(projetil, inimigo)) {
                player.projeteis.splice(pIndex, 1)
                inimigos.splice(iIndex, 1)
            }
        })

        if (projetil.markedForDeletion) {
            player.projeteis.splice(pIndex, 1)
        }
    })

    desenharHUD()
}
animate()