import { useState, useEffect } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import './App.css';
import { Keyboard } from './Components/Keyboard';
import { ReLoadButton } from './Components/ReLoadButton';
import { HideWord } from './Components/HideWord';
import { PokemonSprite } from './Components/PokemonSprite';
import { SettingsButton } from './Components/SettingsButton';
import { Lifes } from './Components/Lifes';
import { SettingsModal } from './Components/SettingsModal';
import { EndGameModal } from './Components/EndGameModal';
import { getPokemonRandom } from './services/getRandomPokemon';
import { LIFES_MAX, LIFES_MIN } from './Constants';
import { espanol } from './languages/languages';
import { IPokemon } from './interfaces/IPokemon';
import { Footer } from './Components/Footer';

function App() {
  //need refactor
  const [pokemon, setPokemon] = useState<IPokemon>({} as IPokemon);
  const [isLoading, setIsLoading] = useState(true);
  const [guesses, setGuesses] = useState<Array<string>>([]);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [won, setWon] = useState(false);
  const [esDark, setEsDark] = useState(!true);
  const [lifes, setLifes] = useState(LIFES_MAX);
  const { width, height } = useWindowSize();
  const [isHardMode, setIsHardMode] = useState<boolean>(false);
  const [language, setLanguage] = useState(espanol);

  function handleGuess(guess: string) {
    if (guesses.includes(guess)) return;
    if (pokemon.name.includes(guess)) {
      setGuesses([...guesses, guess]);
    } else {
      if (lifes - 1 == 0) {
        (document.getElementById('lost-dialog') as HTMLDialogElement).showModal();
        return;
      }
      setLifes(lifes - 1);
    }
  }

  useEffect(() => {
    if (!pokemon.name) return;
    if (pokemon.name.split('').every((letter) => guesses.includes(letter))) {
      setWon(true);
      setCorrectGuesses(correctGuesses + 1);
      setTimeout(() => {
        hasWon();
        setWon(false);
      }, 2700);
    }
  }, [guesses]);

  async function llamarApi() {
    const res = await getPokemonRandom();
    var obj = {
      img: res.sprites,
      name: res.name.replace(/([^\w ]|_)/g, '').replace(" ", ''),
    };
    setPokemon(obj);
    setIsLoading(false);
  }
  useEffect(() => {
    llamarApi();
  }, []);
  function reset() {
    setIsLoading(true);
    setLifes(isHardMode ? LIFES_MIN : LIFES_MAX);
    setPokemon({} as IPokemon);
    setGuesses([]);
    llamarApi();
  }
  function reload() {
    setIsLoading(true);
    setPokemon({} as IPokemon);
    setGuesses([]);
    llamarApi();
  }
  function resetGame() {
    reset();
    setCorrectGuesses(0);
  }

  function hasWon() {
    setIsLoading(true);
    setPokemon({} as IPokemon);
    setGuesses([]);
    llamarApi();
  }

  function levantarmodal() {
    (document.getElementById('settings-dialog') as HTMLDialogElement).showModal();
  }

  function modoNormal() {
    setIsHardMode(false);
    setLifes(LIFES_MAX);
    reload();
    setCorrectGuesses(0);
  }
  function modoDificil() {
    setIsHardMode(true);
    setLifes(LIFES_MIN);
    reload();
    setCorrectGuesses(0);
  }

  return (
    <>
      <SettingsButton width={width} levantarModal={levantarmodal} />
      <div
        className={
          esDark
            ? 'mx is-centered nes-container with-title is-dark min-h'
            : 'is-centered nes-container with-title white-container min-h'
        }>
        <Lifes esDark={esDark} lifes={lifes} width={width} />

        {won && <Confetti width={width} height={height} />}
        <p className="title">Pokeguess</p>
        {isLoading ? (
          <p>{language.cargando}</p>
        ) : (
          <>
            <p>{language.aciertos}: {correctGuesses}</p>
            <PokemonSprite esDark={esDark} isHardMode={isHardMode} won={won} pokemon={pokemon} />
            <HideWord guesses={guesses} pokemon={pokemon} />
            <Keyboard guesses={guesses} handleGuess={handleGuess} keyboardRow='qwertyuiop'/>
            <Keyboard guesses={guesses} handleGuess={handleGuess} keyboardRow='asdfghjklñ'/>
            <Keyboard guesses={guesses} handleGuess={handleGuess} keyboardRow='zxcvbnm'/>
            <div className="container-buttons">
              <p className="buttons">
                <ReLoadButton resetGame={resetGame} />
              </p>
            </div>
          </>
        )}

        <SettingsModal
          esDark={esDark}
          isHardMode={isHardMode}
          language={language}
          modoDificil={modoDificil}
          modoNormal={modoNormal}
          setEsDark={setEsDark}
          setLanguage={setLanguage}
        />
        <EndGameModal language={language} resetGame={resetGame} pokemon={pokemon} />
        <Footer/>
      </div>
    </>
  );
}

export default App;
