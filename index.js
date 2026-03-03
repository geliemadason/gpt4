app.get('/gpt4-convo', async (req, res) => {
  const { prompt, uid } = req.query;

  if (!prompt || !uid) {
    return res.status(400).json({
      status: false,
      error: 'prompt and uid are required',
      example: '/gpt4-convo?prompt=hello&uid=123'
    });
  }

  try {
    const lowerPrompt = prompt.toLowerCase();

    // CLEAR
    if (lowerPrompt === 'clear') {
      clearConversation(uid);
      return res.json({
        status: true,
        message: 'Conversation history cleared'
      });
    }

    // HELLO keyword
    if (lowerPrompt.includes('hello')) {
      return res.json({
        status: true,
        response: "Hello need ka'g ka chat? adto chat sa owner kay e treat ka niyag right promise"
      });
    }

    // OWNER keyword
    if (lowerPrompt.includes('owner')) {
      return res.json({
        status: true,
        response: "nganong nangita man kas owner, totoy ka?"
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
