// Guarda quais teclas estão pressionadas.
const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    space: { pressed: false }
}
// iniciando musica 
let musicaIniciada = false

window.addEventListener("keydown", () => {
    if (!musicaIniciada) {
        const audio = document.getElementById("musica")
        if (audio) {
            audio.volume = 0.1 // Ajusta o volume conforme preferires (0.0 a 1.0)
            audio.play().catch(err => console.log("Aguardando interação:", err))
        }
        musicaIniciada = true
    }
})



// Identifica as teclas pressionadas.
window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase()

    if (["arrowleft", "arrowright", "arrowup", " "].includes(key)) {
        e.preventDefault()
    }

    if (e.repeat) return

    switch (key) {
        case "arrowleft":
        case "a":
            keys.a.pressed = true
            break

        case "arrowright":
        case "d":
            keys.d.pressed = true
            break

        case "arrowup":
        case "w":
            keys.w.pressed = true

            if (
                typeof player !== "undefined" &&
                player.vida > 0 &&
                player.estaNoChao
            ) {
                player.velocidade.y = -13
                player.estaNoChao = false
            }
            break

        case "z":
        case " ":
            keys.space.pressed = true

            if (
                typeof player !== "undefined" &&
                player.vida > 0
            ) {
                player.atirar()
            }
            break
    }
})

// Identifica quando as teclas são soltas.
window.addEventListener("keyup", e => {
    const key = e.key.toLowerCase()

    switch (key) {
        case "arrowleft":
        case "a":
            keys.a.pressed = false
            break

        case "arrowright":
        case "d":
            keys.d.pressed = false
            break

        case "arrowup":
        case "w":
            keys.w.pressed = false
            break

        case "z":
        case " ":
            keys.space.pressed = false
            break
    }
})

// Atualiza o movimento horizontal do jogador.
function atualizarcontroles() {
    if (typeof player === "undefined" || player.vida <= 0) {
        return
    }

    if (keys.d.pressed && !keys.a.pressed) {
        player.velocidade.x = 5
        player.olhandoParaEsquerda = false
        player.setSprite("run")
    } else if (keys.a.pressed && !keys.d.pressed) {
        player.velocidade.x = -5
        player.olhandoParaEsquerda = true
        player.setSprite("run")
    } else {
        player.velocidade.x = 0
        player.setSprite("idle")
    }

    if (!player.estaNoChao) {
        player.setSprite("jump")
    }
}