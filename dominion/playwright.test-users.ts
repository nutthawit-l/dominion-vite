// Credentials in the format: username@gmail.com
const p1Username = process.env.P1_USERNAME || '';
const p1Password = process.env.P1_PASSWORD || '';
const p2Username = process.env.P2_USERNAME || '';
const p2Password = process.env.P2_PASSWORD || '';

type User = {
  login: string;
  password: string;
};

const player1: User = {
  login: p1Username,
  password: p1Password,
};

const player2: User = {
  login: p2Username,
  password: p2Password,
};

export { player1, player2 };