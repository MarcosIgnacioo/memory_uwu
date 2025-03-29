import './style.css'
import p5 from 'p5'

const WIDTH = 1200
const HEIGHT = 800
const PAIRS = 10
const PADDING = 10
const CARD_W = (WIDTH) / (PAIRS) - PADDING
const CARD_H = HEIGHT / 5
//const total_tiles = 8
//const tile_width = WIDTH / total_tiles


interface Vector2 {
  x: number;
  y: number;
}

interface State {
  prev_selection: number
  current_selection: number
  is_correct: boolean
  click_position: Vector2
  pokemon_list: Pokemon[]
}

interface Pokemon {
  id: number
  name: string
  sprite: string
  types: TypeSlot[]
  is_guessed: boolean
  is_hidden: boolean
  image: p5.Image
}

interface TypeSlot {
  slot: number
  type: Type
}
interface Type {

  name: string
  url: string
}


async function get_pokemon_list(limit: number): Promise<Pokemon[]> {
  const pokemon_array: Pokemon[] = [];
  for (let i = 0; i < limit; i++) {
    const id_fetch = Math.trunc(Math.random() * 800 + 1)
    const url = `https://pokeapi.co/api/v2/pokemon/${id_fetch}`
    const response = await fetch(url)
    const { sprites, name, id, types } = await response.json()
    const img_link = sprites.front_default
    const pokemon: Pokemon = {
      name: name,
      id: id,
      types: types,
      sprite: sprites.front_default,
      is_hidden: true,
      is_guessed: false
    }
    pokemon_array.push(pokemon);
  }
  return pokemon_array
}

async function init_game_state(state: State) {
  const pokemon_list = await get_pokemon_list(PAIRS)
  state.pokemon_list = pokemon_list
}


const sketch = (p: p5): any => {


  const game_state: State = {
    prev_selection: 0,
    current_selection: 0,
    click_position: { x: 0, y: 0 },
    is_correct: false,
    pokemon_list: []
  }


  p.preload = async function() {
    //const img = p.loadImage('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png')
    await init_game_state(game_state)
    for (let i = 0; i < game_state.pokemon_list.length; i++) {
      const pokemon = game_state.pokemon_list[i];
      game_state.pokemon_list[i].image = p.loadImage(pokemon.sprite);
    }
  }

  p.setup = function() {
    p.createCanvas(WIDTH, HEIGHT);
  }

  function get_random_rgb(): number[] {
    return [Math.random() * 255, Math.random() * 255, Math.random() * 255]
  }
  p.draw = function() {
    p.background(255)
    draw_text(`Clicked on: (${game_state.click_position.x} , ${game_state.click_position.y}) `, WIDTH / 3, HEIGHT / 2)
    const y = 10
    if (game_state.pokemon_list.length) {
      for (let x = 0; x < game_state.pokemon_list.length; x++) {
        const pokemon = game_state.pokemon_list[x];
        if (pokemon.is_hidden) {
          p.fill("#ff2756");
          p.stroke("#ccffff")
          p.strokeWeight(4);
          p.rect((x * CARD_W) + (PADDING * x), y, CARD_W, CARD_H)
        } else {
          p.image(pokemon.image, x * CARD_W, CARD_H)
        }
      }
    } else {
      draw_text("LOADING...", WIDTH / 2, HEIGHT / 2);
    }
  }

  function draw_text(text: string, x: number, y: number) {
    const og_stroke = p.STROKE
    const og_weight = 0
    p.textSize(24)
    p.stroke(5)
    p.strokeWeight(1)
    p.fill(0)
    p.text(text, x, y);
    p.stroke(og_stroke)
    p.strokeWeight(og_weight)
  }

  p.mouseClicked = function() {
    game_state.click_position = { x: p.mouseX, y: p.mouseY };
    const { x, y } = game_state.click_position;
    for (let i = 0; i < game_state.pokemon_list.length; i++) {
      const pokemon = game_state.pokemon_list[i];
    }
  }
}
new p5(sketch);
