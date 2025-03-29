import './style.css'
import p5 from 'p5'

const WIDTH = 1200
const HEIGHT = 800
const PAIRS = 10
const PAIRS_TO_WIN = 4
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
  pokemon_list: Pokemon[][]
  row_number: number
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
      sprite: img_link,
      is_hidden: true,
      is_guessed: false,
      image: null
    }
    pokemon_array.push(pokemon);
  }
  return pokemon_array
}

async function init_game_state(state: State) {
  const pokemon_list = await get_pokemon_list(PAIRS)
  state.row_number = PAIRS_TO_WIN
  const xd = (JSON.stringify(pokemon_list));
  for (let i = 0; i < state.row_number; i++) {
    state.pokemon_list.push(JSON.parse(xd))
  }
}

const x = [1, 2, 3];
const y = x.map(n => n);


const sketch = (p: p5): any => {


  const game_state: State = {
    prev_selection: 0,
    current_selection: 0,
    click_position: { x: 0, y: 0 },
    is_correct: false,
    pokemon_list: []
  }

  function suc(p1: p5.Image) {
    console.log("todo bien", p1);
  }

  function fail(p1: Event) {
    console.log("error with");
    console.log(p1);
  }


  p.preload = async function() {
    //const img = p.loadImage('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png')
    await init_game_state(game_state)
    for (let row = 0; row < game_state.pokemon_list.length; row++) {
      for (let col = 0; col < game_state.pokemon_list[row].length; col++) {
        const pokemon = game_state.pokemon_list[row][col];
        game_state.pokemon_list[row][col].image = p.loadImage(pokemon.sprite, suc, fail);
      }
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
    if (game_state.pokemon_list.length) {
      for (let row = 0; row < game_state.pokemon_list.length; row++) {
        for (let col = 0; game_state.pokemon_list[row] && col < game_state.pokemon_list[row].length; col++) {
          const pokemon = game_state.pokemon_list[row][col];
          //
          if (pokemon.is_hidden) {
            p.fill("#ff2756");
            p.stroke("#ccffff")
            p.strokeWeight(4);
            p.rect((col * CARD_W) + (PADDING * col), (row * CARD_H), CARD_W, CARD_H)
          } else {
            p.image(pokemon.image, (col * CARD_W) + (PADDING * col), (row * CARD_H))
          }

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
    let row = undefined;
    let col = Math.trunc(10 * (x / WIDTH));
    for (let i = 0; i < game_state.pokemon_list.length; i++) {
      if (y >= CARD_H * i && y <= CARD_H * (i + 1)) {
        row = i;
        break;
      }
    }
    console.log(row, col);
    game_state.pokemon_list[row][col].is_hidden = !game_state.pokemon_list[row][col].is_hidden;
    //if (row && 0 <= col && game_state.pokemon_list[row].length > col) {
    //}
  }
}
new p5(sketch);
