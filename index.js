const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const convoFile = path.join(__dirname, 'convo.json');
const apiUrl = 'https://www.pinoygpt.com/api/chat_response.php';

// Ensure convo file exists
if (!fs.existsSync(convoFile)) {
  fs.writeFileSync(convoFile, JSON.stringify({}), 'utf-8');
}

function loadConversation(uid) {
  const convos = JSON.parse(fs.readFileSync(convoFile, 'utf-8'));
  return convos[uid] || [];
}

function saveConversation(uid, messages) {
  const convos = JSON.parse(fs.readFileSync(convoFile, 'utf-8'));
  convos[uid] = messages;
  fs.writeFileSync(convoFile, JSON.stringify(convos, null, 2), 'utf-8');
}

function clearConversation(uid) {
  const convos = JSON.parse(fs.readFileSync(convoFile, 'utf-8'));
  delete convos[uid];
  fs.writeFileSync(convoFile, JSON.stringify(convos, null, 2), 'utf-8');
}

/**
 * API Endpoint
 * GET /gpt4-convo?prompt=&uid=
 */
app.get('/gpt4-convo', async (req, res) => {
  const { prompt, uid } = req.query;

  if (!prompt || !uid) {
    return res.status(400).json({
      status: false,
      error: 'prompt and uid are required',
      example: '/gpt4-convo?prompt=hello&uid=123'
    });
  }

  const lowerPrompt = prompt.toLowerCase();

// Clear
if (lowerPrompt === 'clear') {
  clearConversation(uid);
  return res.json({
    status: true,
    message: 'Conversation history cleared'
  });
}

// 👉 Detect HELLO kahit saan
if (lowerPrompt.includes('hello')) {
  return res.json({
    status: true,
    response: "Hello need ka'g ka chat? adto chat sa owner kay e treat ka niyag right promise"
  });
}

// 👉 Detect POWDER kahit saan
if (lowerPrompt.includes('owner')) {
  return res.json({
    status: true,
    response: "nganong nangita man kas owner, totoy ka? "
  });
}


    let conversation = loadConversation(uid);

    conversation.push({
      role: 'user',
      content: prompt
    });

    const messageText = conversation
      .map(m => m.content)
      .join('\n');

    const response = await axios.post(
      apiUrl,
      new URLSearchParams({ message: messageText }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    const reply = response.data?.response || 'No response received.';

    conversation.push({
      role: 'assistant',
      content: reply
    });

    saveConversation(uid, conversation);

    res.json({
      status: true,
      response: reply
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: false,
      error: 'Failed to connect to GPT API'
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ GPT-4 Conversational API running on port ${PORT}`);
});
