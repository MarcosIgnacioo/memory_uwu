import './style.css'
import p5 from 'p5'

const WIDTH = 1200
const HEIGHT = 800
const PAIRS = 10
const PAIRS_TO_WIN = 2
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
  selections: Pokemon[]
  pairs_discovered: number
  has_won: boolean
  click_position: Vector2
  pokemon_list: Pokemon[][]
  row_number: number
  last_update: number
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

function get_random(max: number) {
  const old_ids: number[] = []
  return function randuwu(id?: number) {
    if (id === undefined) {
      id = Math.trunc(Math.random() * 800 + 1)
    }
    if (old_ids.length == 0) return id;
    let already = false;
    for (let i = 0; i < old_ids.length; i++) {
      if (old_ids[i] == id) {
        already
        break
      }
    }
    if (already) {
      return randuwu(Math.trunc(Math.random() * max + 1))
    } else {
      old_ids.push(id)
      return id;
    }
  }
}


async function get_pokemon_list(limit: number): Promise<Pokemon[]> {
  const pokemon_array: Pokemon[] = [];
  const get_unique_pokemon_id = get_random(800);
  for (let i = 0; i < limit; i++) {
    const id_fetch = get_unique_pokemon_id();
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
    const pkmn_arr = JSON.parse(xd)
    const shuffled = pkmn_arr.sort((_a: Pokemon, _b: Pokemon) => 0.5 - Math.random());
    state.pokemon_list.push(shuffled)
  }
}

const sketch = (p: p5): any => {

  const game_state: State = {
    row_number: 0,
    last_update: p.millis(),
    selections: [],
    click_position: { x: 0, y: 0 },
    has_won: false,
    pokemon_list: [],
    pairs_discovered: 0
  }

  function suc(p1: p5.Image) {
  }

  function fail(p1: Event) {
    console.log("error with");
    console.log(p1);
  }


  p.preload = async function() {
    await init_game_state(game_state)
    for (let row = 0; row < game_state.pokemon_list.length; row++) {
      for (let col = 0; col < game_state.pokemon_list[row].length; col++) {
        const pokemon = game_state.pokemon_list[row][col];
        game_state.pokemon_list[row][col].image = p.loadImage(pokemon.sprite, undefined, fail);
      }
    }
  }

  p.setup = function() {
    p.createCanvas(WIDTH, HEIGHT);
  }

  // case player has selected the amount of cards to check if he is correct
  // if the player has the correct pairs,
  //    we set the is_guessed flag in the pokemon within the selections array
  //    we do the game_state.pairs_discovered++
  // if the player is not correct
  //    we toggle the is_hidden to true so the cards are hidden
  //    and reset the selections array game_state.selections = []
  // if the player has pairs_discovered === PAIRS they win cause they cool i guess
  function check_game_state(game_state: State) {
    if (game_state.selections.length != PAIRS_TO_WIN) {
      return
    }
    const first_selection = game_state.selections[0]
    const is_correct = game_state.selections.every((selection) => selection.id == first_selection.id);
    console.log(is_correct);
    if (is_correct) {
      game_state.pairs_discovered++
      for (let i = 0; i < game_state.selections.length; i++) {
        const selection = game_state.selections[i];
        selection.is_guessed = true;
      }
    } else {
      for (let i = 0; i < game_state.selections.length; i++) {
        const selection = game_state.selections[i];
        selection.is_hidden = true;
      }
    }
    if (game_state.pairs_discovered == PAIRS) {
      game_state.has_won = true;
    }
    game_state.selections = []
  }

  function delay(wait: number) {
    if (p.millis() - game_state.last_update < wait) {
      return false;
    }
    // this caused a nasty error haha i would look it deeper but im kinda tired
    //game_state.last_update = p.millis()
    return true;
  }

  p.draw = function() {
    p.background(255)
    if (game_state.pokemon_list.length) {
      for (let row = 0; row < game_state.pokemon_list.length; row++) {
        for (let col = 0; game_state.pokemon_list[row] && col < game_state.pokemon_list[row].length; col++) {
          const pokemon = game_state.pokemon_list[row][col];
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
      if (delay(500)) {
        check_game_state(game_state)
      }
    } else {
      draw_text("LOADING...", WIDTH / 2, HEIGHT);
    }
    if (game_state.has_won) {
      draw_text("what a loser u have memory or something like that", WIDTH / 2, HEIGHT);
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
    if (game_state.selections.length == PAIRS_TO_WIN) {
      return
    }
    game_state.click_position = { x: p.mouseX, y: p.mouseY };
    const { x, y } = game_state.click_position;
    // TODO: make this actually work when there are a lot of cards cause this is just lazy uwu
    let row = undefined;
    let col = Math.trunc(10 * (x / WIDTH));
    for (let i = 0; i < game_state.pokemon_list.length; i++) {
      if (y >= CARD_H * i && y <= CARD_H * (i + 1)) {
        row = i;
        break;
      }
    }
    if (row != undefined && 0 <= col && game_state.pokemon_list[row].length > col) {
      const pokemon = game_state.pokemon_list[row][col]
      if (!pokemon.is_guessed) {
        game_state.last_update = p.millis()
        pokemon.is_hidden = !pokemon.is_hidden;
        game_state.selections.push(pokemon)
      }
    }
  }
}
new p5(sketch);
