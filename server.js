const express = require('express');
const cors = require('cors');

const app = express();
const RAPIDAPI_KEY = '3ad8dbee1emshb1de8abb7120ab3p1896a8jsn63e4223f5695'; // Replace with your real RapidAPI key

app.use(cors());
app.use(express.json());

// Serve frontend files from "public" folder
app.use(express.static('public'));

// Test route (optional)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Judge0 Compiler API route
app.post('/run', async (req, res) => {
  const { source_code, language_id, stdin } = req.body;

  try {
    const submissionRes = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
      body: JSON.stringify({ source_code, language_id, stdin }),
    });

    const submissionData = await submissionRes.json();
    const token = submissionData.token;

    // Polling for result
    let result;
    while (true) {
      const resultRes = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          'x-rapidapi-key': '3ad8dbee1emshb1de8abb7120ab3p1896a8jsn63e4223f5695',
        },
      });

      result = await resultRes.json();

      if (result.status.id >= 3) break;
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1 second
    }

    res.json(result);
  } catch (error) {
    console.error("Error in /run:", error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

// Start server
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
