CREATE DATABASE tictactoe_db;

USE tictactoe_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player1_id INT,
  player2_id INT,
  board VARCHAR(9),
  status ENUM('ongoing', 'completed') DEFAULT 'ongoing',
  winner_id INT,
  FOREIGN KEY (player1_id) REFERENCES users(id),
  FOREIGN KEY (player2_id) REFERENCES users(id),
  FOREIGN KEY (winner_id) REFERENCES users(id)
);