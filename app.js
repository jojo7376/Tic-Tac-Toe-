const gameBoard = (() => {
    let board  = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let xBoxes = [];
    let oBoxes = [];
  
    let winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
  
    let whichPlayer = (sign) => { return sign === 'X' ? xBoxes : oBoxes; };
  
    let valid = (box) => { return board.includes(box); };
  
    let reset = () => {
      xBoxes.length = 0;
      oBoxes.length = 0;
      board.length  = 0;
  
      for (let i = 0; i < 9; i++) { board.push(i); }
  
      return true;
    };
  
    let claim = (sign, box) => {
      if (valid(box)) {
        whichPlayer(sign).push(box);
  
        board.splice(board.indexOf(box), 1);
  
        return true;
      }
  
      return false;
    };
  
    let checkIfOver = (players) => {
      return won(players[1]) || tie(players[0]);
    };
  
    let won = (player) => {
      let playerBoxes = whichPlayer(player.sign);
  
      if (playerBoxes .length < 3) { return false; }
  
      for (let i = 0; i < winningCombos.length; i++) {
        let combo = winningCombos[i];
  
        combo = combo.filter(b => !playerBoxes.includes(b));
  
        if (combo.length === 0) {
          board = [];
  
          interactor.notify(`${player.name} has won!`);
          interactor.highlight(winningCombos[i]);
  
          return true;
        }
      }
  
      return false;
    };
  
    let tie = (player) => {
      let tie = true;
  
      if (board.length > 1) { return false; }
      if (board.length == 0) { return true; }
  
      let playerBoxes = whichPlayer(player.sign);
      let otherBoxes  = playerBoxes.slice(0);
  
      otherBoxes.push(board[0]);
  
      for (let i = 0; i < winningCombos.length; i++) {
        let combo = winningCombos[i];
  
        combo = combo.filter(b => !otherBoxes.includes(b));
  
        if (combo.length === 0) { return false; }
      }
  
      board = [];
  
      interactor.notify("It's a tie");
  
      return true;
    };
  
    let render = () => {
      interactor.renderBoard(board);
    };
  
    return { valid, reset, render, claim, checkIfOver };
  })();
  
  class Player {
    constructor(sign, name) {
      this.sign = sign;
      this.name = name;
    }
  
    static new(params) {
      return new this(params);
    }
  };
  
  const controller = (() => {
    let gameOver = false;
    let players;
    let board;
  
    let setup = (params) => {
      players = params['players'];
      board   = params['board'];
    };
  
    let play = (square) => {
      let player = players.shift();
      let sign   = player.sign;
  
      if (!gameBoard.claim(sign, square)) {
        players.unshift(player);
  
        return false;
      }
  
      interactor.notify(`${players[0].name}'s turn`);
  
      players.push(player);
  
      gameOver = gameBoard.checkIfOver(players);
  
      return sign;
    };
  
    return { setup, play, players };
  })();
  
  const interactor = (() => {
    let boardHolder = document.querySelector('.board-holder');
    let board       = document.querySelector('.board');
    let noticeArea  = document.querySelector('.notice');
    let buttonGroup = document.querySelector('.button-group');
  
    let renderBoard = (boxes) => {
      clearBoard();
  
      board = document.createElement('div');
      board.classList.add('board');
  
      for (let i = 0; i < boxes.length; i++) { board.appendChild(buildBox(boxes[i])); }
  
      boardHolder.appendChild(board);
  
      notify(`${players[0].name}'s turn`);
    };
  
    let notify = (msg) => { noticeArea.textContent = msg; };
  
    let clearBoard = () => { if (board) { boardHolder.removeChild(board); } };
  
    let buildBox = (val) => {
      let box = document.createElement('div');
  
      box.addEventListener('click', play);
      box.addEventListener('mouseover', checkBox);
      box.addEventListener('mouseout', restoreBox);
  
      box.dataset.value = val;
  
      return box;
    };
  
    let highlight = (boxes) => {
      for (let i = 0; i < boxes.length; i++) { board.children[boxes[i]].classList.add('highlight'); }
    };
  
    function checkBox() {
      let box = parseInt(this.getAttribute('data-value'));
  
      gameBoard.valid(box) ? this.classList.add('free') : this.classList.add('occupied');
    }
  
    function play() {
      let box = parseInt(this.getAttribute('data-value'));
  
      let sign = controller.play(box);
  
      if (sign) {
        this.textContent = sign;
        this.dataset.value = sign;
      }
    };
  
    function reset() { gameBoard.reset() && gameBoard.render(); };
  
    function set() {
      let inputFields = document.querySelector('.input-fields');
  
      x.name = document.querySelector('input[name=name-0]').value || "Player X";
      o.name = document.querySelector('input[name=name-1]').value || "Player O";
  
      buttonGroup.removeChild(newButton) && buttonGroup.parentElement.removeChild(inputFields);
  
      let resetButton = document.createElement('button');
      resetButton.classList.add('reset');
      resetButton.textContent = 'Reset';
      resetButton.addEventListener('click', reset);
  
      buttonGroup.appendChild(resetButton);
  
      gameBoard.render();
    }
  
    function restoreBox() {
      this.classList.remove('free', 'occupied');
    };
  
    return { set, reset, renderBoard, notify, highlight };
  })();
  
  let newButton = document.querySelector('.button-group .new');
  let x = Player.new('X');
  let o = Player.new('O');
  let players = [x, o];
  
  controller.setup({ 'players': players, 'board': gameBoard });
  
  newButton.addEventListener('click', interactor.set);