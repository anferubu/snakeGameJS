document.addEventListener('DOMContentLoaded', function() {

  // Canvas variables
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Other variables
  const scoreLabel = document.querySelector('#score span');

  const appleSound = new Audio('./gulp.mp3');
  const gameOverSound = new Audio('./gameOver.wav');

  let cellSize = 20;
  let speed = 5;
  let score = 0;
  let gameOver = false;



  // Represent each snake's part
  class Cell {

    constructor(x, y) {
      this.size = cellSize;
      this.x = x;
      this.y = y;
    }
  }


  // Represent a snake like a cells array
  class Snake {

    constructor() {
      this.body = [new Cell(0, 0)];
      this.xdir = 0;
      this.ydir = 0;
    }

    update() {
      this.body.unshift(new Cell(this.body[0].x, this.body[0].y));
      this.body[0].x += this.xdir;
      this.body[0].y += this.ydir;
      this.body.pop();
    }

    grow() {
      let lastIndex = this.body.length - 1;
      this.body.push(new Cell(this.body[lastIndex].x, this.body[lastIndex].y))
    }

    setDir(x, y) {
      this.xdir = x;
      this.ydir = y;
    }
  }

  const snake = new Snake();
  const apple = new Apple();


  // Execution of the app
  alert(
    'use the arrow to move the snake along the board\n' +
    'You can also use mouse or your finger'
  );
  mainLoop();


  // Execute the application each n milliseconds
  function mainLoop() {
    if (!gameOver) {
      paintCanvas();
      paintSnake();
      paintApple();
      snake.update();
      checkCollision(snake.body[0], apple);
      isGameOver();

      scoreLabel.textContent = score;

      if (score > 25) {
        speed = 12;
      }
      else if (score > 10) {
        speed = 9;
      }
      setTimeout(mainLoop, 1000 / speed);
    }
    else {
      paintGameOver();
    }
  }


  // Paint the board and grid
  function paintCanvas() {
    ctx.fillStyle = '#C9E4C5';
    ctx.strokeStyle = '#B5CDA3'
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < canvas.width; x += cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
  }


  // Paint the 'game over' text
  function paintGameOver() {
    ctx.font = '30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('game over', canvas.width/2, canvas.height/2);
  }


  // Paint the snake array
  function paintSnake() {
    ctx.fillStyle = '#ff6347';
    ctx.strokeStyle = '#2d2d2d';
    for (let cell of snake.body) {
      ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
      ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);
    }
  }


  // Create a Apple object
  function Apple() {
    this.size = cellSize;
    this.x = Math.floor(Math.random() * canvas.width/this.size) * this.size;
    this.y = Math.floor(Math.random() * canvas.height/this.size) * this.size;
  }


  // Locate the apple in a random position
  function appleRandomPos() {
    apple.x = Math.floor(Math.random() * canvas.width/apple.size) * apple.size;
    apple.y = Math.floor(Math.random() * canvas.height/apple.size) * apple.size;

    for (let cell of snake.body) {
      if (cell.x === apple.x && cell.y === apple.y) {
        appleRandomPos();
      }
    }
  }


  // Paint the apple
  function paintApple() {
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(apple.x, apple.y, apple.size, apple.size);
  }


  // Check if the snake eats the apple
  function checkCollision(elemA, elemB) {
    let rectA = getRectangle(elemA);
    let rectB = getRectangle(elemB);

    if (
      (rectA.right > rectB.left && rectA.left < rectB.right) &&
      (rectA.top < rectB.bottom && rectA.bottom > rectB.top)
    ) {
      snake.grow();
      appleRandomPos();
      appleSound.play();
      score += 2;
    }
  }


  // Check if the snake crashes against the walls or against itself
  function isGameOver() {
    let head = getRectangle(snake.body[0]);

    if (
      head.top < 0 ||
      head.bottom > canvas.height ||
      head.left < 0 ||
      head.right > canvas.width
    ) {
      gameOver = true;
      gameOverSound.play();
      return;
    }

    for (let i = 2; i < snake.body.length; i++) {
      let cell = snake.body[i];
      if (cell.x === snake.body[0].x && cell.y === snake.body[0].y) {
        gameOver = true;
        gameOverSound.play();
        return;
      }
    }
  }


  // Return a rectangle object
  function getRectangle(elem) {
    return {
      top: elem.y,
      right: elem.x + elem.size,
      bottom: elem.y + elem.size,
      left: elem.x
    };
  }


  // Move the snake array by means of a key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp' && !snake.ydir) {
      snake.setDir(0, -snake.body[0].size);
    }
    else if (e.key === 'ArrowRight' && !snake.xdir) {
      snake.setDir(snake.body[0].size, 0);
    }
    else if (e.key === 'ArrowDown' && !snake.ydir) {
      snake.setDir(0, snake.body[0].size);
    }
    else if (e.key === 'ArrowLeft' && !snake.xdir) {
      snake.setDir(-snake.body[0].size, 0);
    }
  });

  // Move the snake array by means of a mouse
  canvas.addEventListener('click', function(e) {
    const coord = canvas.getBoundingClientRect();
    let mouseX = e.clientX - coord.x;
    let mouseY = e.clientY - coord.y;

    if (  // Up
      mouseX > 0 &&
      mouseX < canvas.width &&
      mouseY < snake.body[0].y &&
      snake.ydir === 0
    ) {
      snake.setDir(0, -snake.body[0].size);
    }
    else if (  // Right
      mouseY > 0 &&
      mouseY < canvas.height &&
      mouseX > snake.body[0].x &&
      snake.xdir === 0
    ) {
      snake.setDir(snake.body[0].size, 0);
    }
    else if (  // Down
      mouseX > 0 &&
      mouseX < canvas.width &&
      mouseY > snake.body[0].y &&
      snake.ydir === 0
    ) {
      snake.setDir(0, snake.body[0].size);
    }
    else if (  // Left
      mouseY > 0 &&
      mouseY < canvas.height &&
      mouseX < snake.body[0].x &&
      snake.xdir === 0
    ) {
      snake.setDir(-snake.body[0].size, 0);
    }
  });

});