import "./style.css"

import * as PIXI from "pixi.js"
import { Container, Sprite, Text } from "pixi.js"
import gsap, { Quad, Sine } from "gsap"
import PixiPlugin from "gsap/PixiPlugin"

gsap.registerPlugin(PixiPlugin)

const root = document.querySelector<HTMLDivElement>("#app")!

const app = new PIXI.Application()

PixiPlugin.registerPIXI(PIXI)

root.appendChild(app.view)

const loadingText = new PIXI.Text("Loading...", { fill: "#fff" })

loadingText.anchor.x = 0.5
loadingText.anchor.y = 0.5

loadingText.x = app.renderer.width / 2
loadingText.y = app.renderer.height / 2

app.stage.addChild(loadingText)

const myas = PIXI.Texture.from(
  "https://media.discordapp.net/attachments/888733163138990091/979321302382964767/unknown.png"
)

const circle = PIXI.Texture.from(
  "https://media.discordapp.net/attachments/888733163138990091/979723569623871518/unknown.png"
)

const ws = new WebSocket(
  import.meta.env.VITE_WS.replace(
    "{host}",
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}`
  )
)

let count = {
  value: 0,
}

ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data)

  if (type === "count") {
    while (!text || !playerSprite) {
      continue
    }

    gsap.to(count, {
      duration: 1,
      value: data,
      onUpdate: () => {
        text.text = Math.round(count.value).toString()

        text.x = app.renderer.width / 2

        text.y = app.renderer.height / 2 + 100

        playerSprite.angle = count.value
      },
      ease: Quad.easeOut,
    })
  }
}

const gameGroup = new Container()

let text: Text
let playerSprite: Sprite

ws.onopen = () => {
  app.stage.removeChild(loadingText)

  const mask = new PIXI.Sprite(circle)

  mask.x = app.renderer.width / 2

  mask.y = app.renderer.height / 2 - 50

  mask.anchor.x = 0.5

  mask.anchor.y = 0.5

  mask.width = 200

  mask.height = 200

  const player = new PIXI.Sprite(myas)

  player.x = app.renderer.width / 2

  player.y = app.renderer.height / 2 - 50

  player.anchor.x = 0.5

  player.anchor.y = 0.5

  player.width = 200

  player.height = 200

  player.mask = mask

  player.addListener("mouseover", () => {
    gsap.to([mask, player], {
      pixi: {
        width: 200 * 1.2,
        height: 200 * 1.2,
      },
      duration: 0.6,
      ease: Sine.easeOut,
    })
  })

  player.addListener("mouseout", () => {
    gsap.to([mask, player], {
      pixi: {
        width: 200,
        height: 200,
      },
      duration: 0.6,
      ease: Sine.easeOut,
    })
  })

  player.addListener("click", () => {
    ws.send(JSON.stringify({ type: "Up" }))
  })

  text = new PIXI.Text(count.toString(), { fill: "#fff" })

  text.anchor.x = 0.5

  text.anchor.y = 0.5

  text.x = app.renderer.width / 2

  text.y = app.renderer.height / 2 + 100
  playerSprite = player

  player.interactive = true

  gameGroup.addChild(mask)

  gameGroup.addChild(player)

  gameGroup.addChild(text)

  app.stage.addChild(gameGroup)

  console.log("connected")
}

ws.onclose = () => {
  app.stage.removeChild(loadingText, gameGroup)
  const disconnectedText = new PIXI.Text("Disconnected", { fill: "#fff" })

  disconnectedText.anchor.x = 0.5
  disconnectedText.anchor.y = 0.5

  disconnectedText.x = app.renderer.width / 2
  disconnectedText.y = app.renderer.height / 2

  app.stage.addChild(disconnectedText)
}
