// node dictionary-randomizer.js

let wordList = require('./dictionary.json').wordList;
shuffleArray(wordList);
let numberedWordsList = {};
console.log(wordList[0]);

// start at 1, since that's where smart contract starts
for (let i = 0; i < wordList.length; i++) {
  numberedWordsList[i + 1] = wordList[i].toUpperCase();
}

// Stolen from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

console.log(JSON.stringify(numberedWordsList));
// copy, paste, json doc type, right click format, save
