CREATE DATABASE IF NOT EXISTS bank;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    accountType ENUM('current', 'savings', 'basicSavings'),
    balance INT(6) UNSIGNED NOT NULL
);

INSERT INTO users (name, accountType, balance)
VALUES ('Vito Corleone', 'current', 90000000),
       ('Michael Corleone', 'current', 50000000),
       ('Sonny Corleone', 'savings', 50000000),
       ('Fredo Corleone', 'savings', 10000000),
       ('Tom Hagen', 'savings', 5000000),
       ('Salvatore Tessio', 'basicSavings', 4000000),
       ('Luca Brasi', 'basicSavings', 4000000),
       ('Virgil Sollozzo', 'basicSavings', 4000000),
       ('Johnny Fontane', 'savings', 3000000),
       ('Peter Clemenza', 'savings', 1000000);

CREATE TABLE transactions
(
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source      INT NOT NULL,
    destination INT NOT NULL,
    amount      INT(6) UNSIGNED NOT NULL,
    date        DATETIME
);
