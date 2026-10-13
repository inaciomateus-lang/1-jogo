const gravidade = 0.1

class Sprite {
constructor({posicao, velocidade, dimencao}) {
    this.posicao = posicao
    this.velocidade = velocidade
    this.width = dimencao.width
    this.heigth = dimencao.heigth

    }

    draw() {
        ctx.fillStyle = "white"
        ctx.fillRect(this.posicao.x, this.posicao.y, this.width, this.heigth, )

    }

    update() {
        //Player vai cair a todo instante 
        this.velocidade.y += gravidade
        //adcionando a posição de y a sua velocidade 
        this.posicao.x += this.velocidade.x
        this.posicao.y += this.velocidade.y
        
        this.draw()
    }
}

const player = new Sprite({
    posicao: { 
        x:100,
        y:100

    },
    //velocidade do eixo x e y 
    velocidade: {
        x:0,
        y:0

    },

    dimencao: {
        width:50,
        heigth: 100
    },

})