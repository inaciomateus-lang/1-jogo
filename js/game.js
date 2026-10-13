const canvas = document.querySelector("canvas");

const ctx = canvas.getContext('2d');

const canvaswidth = 1024
const canvasheigth = 578

canvas.width = canvaswidth 
canvasheihth = canvasheigth

let prevTime = 0 

animate()

function animate() {
    window.requestAnimationFrame(animate)

    //prencher todo o canvas com a cor padrão
    ctx.fillStyle = "black"
    ctx.fillRect(0,0, canvaswidth, canvasheigth)

    //Chamando a função player 
    player.update()
    
    let delta = (performance.now() - prevTime) / 1000
    let fps = 1 / delta

    prevTime = performance.now()
    //console.log('FPS: ${fps}')

}
