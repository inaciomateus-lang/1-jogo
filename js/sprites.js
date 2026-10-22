const gravidade = 0.3

// Caminhos relativos ao index.html
const backgroundSpriteCenario = "./img/img-cenario/BG.png"

// --- CLASSE PLATAFORMA ---
class Plataforma {
    constructor({ posicao, largura = 200, altura = 20, imagemSrc }) {
        this.posicao = posicao
        this.width = largura
        this.height = altura
        this.imagem = null

        if (imagemSrc) {
            this.imagem = new Image()
            this.imagem.src = imagemSrc
        }
    }

    draw() {
        if (this.imagem && this.imagem.complete) {
            ctx.drawImage(this.imagem, Math.round(this.posicao.x), Math.round(this.posicao.y), this.width, this.height)
        } else {
            ctx.fillStyle = "#8B4513"
            ctx.fillRect(Math.round(this.posicao.x), Math.round(this.posicao.y), this.width, this.height)
        }
    }

    update() {
        this.draw()
    }
}

// --- CLASSE BASE SPRITE ---
class Sprite {
    constructor({
        posicao,
        velocidade = { x: 0, y: 0 },
        dimencao,
        source,
        escala = 1,
        desvio = { x: 0, y: 0 },
        sprites,
        gravidadeAtiva = true
    }) {
        this.posicao = posicao
        this.velocidade = velocidade
        this.gravidadeAtiva = gravidadeAtiva
        this.estaNoChao = false
        this.escala = escala
        this.desvio = desvio

        this.sprites = sprites || {
            idle: {
                src: source || backgroundSpriteCenario,
                totalSpriteFrames: 1,
                framesperSpriteFrame: 1
            }
        }

        this.atualSprite = this.sprites.idle
        this.frameAtualSprite = 0
        this.tempoPassado = 0

        this.totalSpriteFrames = this.atualSprite.totalSpriteFrames || 1
        this.framesperSpriteFrame = this.atualSprite.framesperSpriteFrame || 1

        this.imagem = new Image()
        this.imagem.src = this.atualSprite.src

        this.width = dimencao?.width || 100
        this.height = dimencao?.height || 100

        this.olhandoParaEsquerda = false 
    }

    setSprite(nomeSprite) {
        let proximoSprite = this.sprites[nomeSprite]

        if (!proximoSprite) {
            proximoSprite = this.sprites.idle
        }

        if (this.atualSprite !== proximoSprite) {
            this.atualSprite = proximoSprite
            this.carregandoSprite()
        }
    }

    carregandoSprite() {
        let spriteAnteriorSrc = this.imagem.src
        let novoSpriteSrc = this.atualSprite.src

        if (spriteAnteriorSrc !== novoSpriteSrc) {
            this.imagem = new Image()
            this.imagem.src = novoSpriteSrc

            this.totalSpriteFrames = this.atualSprite.totalSpriteFrames || 1
            this.framesperSpriteFrame = this.atualSprite.framesperSpriteFrame || 1
            this.frameAtualSprite = 0
        }
    }

    draw() {
        if (!this.imagem.complete || this.imagem.width === 0) return

        let larguraFrame = this.imagem.width / this.totalSpriteFrames
        let alturaFrame = this.imagem.height

        this.height = alturaFrame * this.escala
        this.width = larguraFrame * this.escala

        let renderX = Math.round(this.posicao.x - this.desvio.x)
        let renderY = Math.round(this.posicao.y - this.desvio.y)

        ctx.save()

        if (this.olhandoParaEsquerda) {
            ctx.scale(-1, 1)
            ctx.drawImage(
                this.imagem,
                this.frameAtualSprite * larguraFrame,
                0,
                larguraFrame,
                alturaFrame,
                - renderX - Math.round(larguraFrame * this.escala),
                renderY,
                Math.round(larguraFrame * this.escala),
                Math.round(alturaFrame * this.escala)
            )
        } else {
            ctx.drawImage(
                this.imagem,
                this.frameAtualSprite * larguraFrame,
                0,
                larguraFrame,
                alturaFrame,
                renderX,
                renderY,
                Math.round(larguraFrame * this.escala),
                Math.round(alturaFrame * this.escala)
            )
        }

        ctx.restore()
    }

    animacao() {
        this.tempoPassado++

        if (this.tempoPassado >= this.framesperSpriteFrame) {
            this.frameAtualSprite++

            if (this.frameAtualSprite >= this.totalSpriteFrames) {
                this.frameAtualSprite = 0
            }

            this.tempoPassado = 0
        }
    }
update() {
    // 1. Atualiza o tamanho do sprite com base na imagem
    if (this.imagem.complete && this.imagem.width > 0) {
        this.width = (this.imagem.width / this.totalSpriteFrames) * this.escala
        this.height = this.imagem.height * this.escala
    }

    // Se a gravidade não estiver ativa (ex: fundo), desenha e anima sem física
    if (!this.gravidadeAtiva) {
        this.draw()
        this.animacao()
        return
    }

    // 2. Guarda a posição da base anterior antes de aplicar movimento
    const baseAnterior = this.posicao.y + this.height
    const estavaNoChao = this.estaNoChao

    // 3. Aplica gravidade e movimentação
    this.velocidade.y += gravidade
    this.posicao.x += this.velocidade.x
    this.posicao.y += this.velocidade.y

    this.estaNoChao = false

    // 4. Verificação das Plataformas
    if (typeof plataformas !== "undefined") {
        plataformas.forEach(plataforma => {
            const baseAtual = this.posicao.y + this.height

            const estaSobrePlataforma =
                this.posicao.x + this.width > plataforma.posicao.x &&
                this.posicao.x < plataforma.posicao.x + plataforma.width

            const estavaAcima = baseAnterior <= plataforma.posicao.y + 5
            const chegouAoTopo = baseAtual >= plataforma.posicao.y

            const aterrissou = estavaAcima && chegouAoTopo && this.velocidade.y >= 0
            const continuaApoiado =
                estavaNoChao &&
                Math.abs(baseAtual - plataforma.posicao.y) <= 8 &&
                this.velocidade.y >= 0

            if (estaSobrePlataforma && (aterrissou || continuaApoiado)) {
                this.posicao.y = plataforma.posicao.y - this.height
                this.velocidade.y = 0
                this.estaNoChao = true
            }
        })
    }

    // 5. Verificação do Chão do Canvas (Ajustada para travar o jogador corretamente)
    if (this.posicao.y + this.height >= canvas.height) {
        this.posicao.y = canvas.height - this.height
        this.velocidade.y = 0
        this.estaNoChao = true
    }

    // 6. Desenha e avança a animação
    this.draw()
    this.animacao()
}
}
// --- CLASSE PROJÉTIL ---
class Projetil {
    constructor({ posicao, velocidade, olhandoParaEsquerda }) {
        this.posicao = { x: posicao.x, y: posicao.y }
        this.velocidade = {
            x: olhandoParaEsquerda ? -10 : 10,
            y: 0
        }
        this.width = 15
        this.height = 8
        this.markedForDeletion = false
    }

    draw() {
        ctx.fillStyle = '#FFD'
        ctx.fillRect(Math.round(this.posicao.x), Math.round(this.posicao.y), this.width, this.height)
    }

    update() {
        this.posicao.x += this.velocidade.x
        this.draw()

        if (this.posicao.x > canvas.width || this.posicao.x < 0) {
            this.markedForDeletion = true
        }
    }
}

// --- CLASSE FIGHTER (JOGADOR) ---
class Fighter extends Sprite {
    constructor({ posicao, velocidade, dimencao, source, escala, desvio, sprites }) {
        super({ posicao, velocidade, dimencao, source, escala, desvio, sprites })

        this.projeteis = []
        this.atacando = false
        
        this.vida = 3
        this.possoTomarDano = true
        this.tempoPisca = 0
    }

    update() {
        // Executa a física básica de movimento e plataformas herdada da classe Sprite
        super.update()

        // 1. Limite do Teto (Não deixa subir além da borda superior)
        if (this.posicao.y <= 0) {
            this.posicao.y = 0
            if (this.velocidade.y < 0) {
                this.velocidade.y = 0 // Cancela a força do pulo para não "grudar"
            }
        }

        // 2. Limite da Esquerda (Parede esquerda)
        if (this.posicao.x <= 0) {
            this.posicao.x = 0
        }

        // 3. Limite da Direita (Parede direita)
        if (this.posicao.x + this.width >= canvas.width) {
            this.posicao.x = canvas.width - this.width
        }
    }

    tomarDano() {
        if (!this.possoTomarDano || this.vida <= 0) return

        this.vida--
        this.possoTomarDano = false

        this.velocidade.y = -5
        this.velocidade.x = this.olhandoParaEsquerda ? 5 : -5

        setTimeout(() => {
            this.possoTomarDano = true
        }, 1500)
    }

    draw() {
        if (!this.possoTomarDano) {
            this.tempoPisca++
            if (Math.floor(this.tempoPisca / 5) % 2 === 0) {
                ctx.globalAlpha = 0.3
            } else {
                ctx.globalAlpha = 1.0
            }
        } else {
            ctx.globalAlpha = 1.0
            this.tempoPisca = 0
        }

        super.draw()
        ctx.globalAlpha = 1.0
    }

    atirar() {
        this.projeteis.push(new Projetil({
            posicao: { 
                x: this.olhandoParaEsquerda ? this.posicao.x : this.posicao.x + this.width, 
                y: this.posicao.y + (this.height / 2) 
            },
            olhandoParaEsquerda: this.olhandoParaEsquerda
        }))
    }
}

// --- CLASSE INIMIGO ---
class Inimigo extends Sprite {
    constructor({ posicao, velocidade = { x: -1, y: 0 }, escala = 0.2, desvio = { x: 0, y: 0 }, sprites, limitePatrulha, tipo = 'patrulha' }) {
        super({ posicao, velocidade, escala, desvio, sprites })

        this.tipo = tipo
        this.limiteEsquerda = limitePatrulha.esquerda
        this.limiteDireita = limitePatrulha.direita
        this.velocidadePatrulha = Math.abs(velocidade.x) || 1
        
        this.tempoParaPulo = 0
    }

    update() {
        if (this.posicao.x <= this.limiteEsquerda) {
            this.velocidade.x = this.velocidadePatrulha
            this.olhandoParaEsquerda = false
            this.setSprite('run')
        } else if (this.posicao.x >= this.limiteDireita) {
            this.velocidade.x = -this.velocidadePatrulha
            this.olhandoParaEsquerda = true
            this.setSprite('run')
        }

        if (this.tipo === 'saltador') {
            this.tempoParaPulo++
            if (this.tempoParaPulo >= 120 && Math.abs(this.velocidade.y) < 0.5) {
                this.velocidade.y = -10
                this.tempoParaPulo = 0
            }
        }

        super.update()
    }
}