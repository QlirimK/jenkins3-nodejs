const http = require('http'); // Include Node's built-in HTTP module

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.end('Hello World'); // Respond with Hello World to every request
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
