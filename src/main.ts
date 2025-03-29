import './style.css'
import p5 from 'p5'

const WIDTH = 800
const HEIGHT = 800
//const total_tiles = 8
//const tile_width = WIDTH / total_tiles



interface State {
  first_pokemon: string
  second_pokemon: string
  is_correct: boolean
  pokemon_list: Pokemon[]
}

interface Pokemon {
  id: number
  name: string
  sprite: string
  types: TypeSlot[]
  is_guessed: boolean
  is_being_guess: boolean
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
    const id_fetch = Math.trunc(Math.random() * 100 + 1)
    const url = `https://pokeapi.co/api/v2/pokemon/${id_fetch}`
    const response = await fetch(url)
    const { sprites, name, id, types } = await response.json()
    const img_link = sprites.front_default
    const pokemon: Pokemon = {
      name: name,
      id: id,
      types: types,
      sprite: sprites.front_default,
      is_being_guess: false,
      is_guessed: false
    }
    pokemon_array.push(pokemon);
  }
  return pokemon_array
}

async function init_game_state(state: State) {
  const pokemon_list = await get_pokemon_list(10)
  state.pokemon_list = pokemon_list
}


const sketch = (p: p5): any => {


  const game_state: State = {
    pokemon_list: []
  }

  interface Vector2 {
    x: number;
    y: number;
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

  p.draw = function() {
    p.background(255)
    for (let i = 0; i < game_state.pokemon_list.length; i++) {
      const pokemon = game_state.pokemon_list[i];
      console.log(pokemon);
      p.image(pokemon.image, i * WIDTH / 10, 10)
    }
  }


  p.mouseClicked = function() { }
}
new p5(sketch);
