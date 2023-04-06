import AnsiToHtml from 'ansi-to-html';
import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Container, Divider, Heading, VStack } from '@chakra-ui/react';

const ansiToHtml = new AnsiToHtml();

const exeActions = ['ls -la', `pip install -r requirements.txt`, `python scripts/main.py`];

interface GUIProps {
  socket: WebSocket;
}

interface FetchWrapperBody {
  command?: string;
  input?: string;
  key?: string;
  value?: string;
}

export function GUI({ socket }: GUIProps) {
  const [output, setOutput] = useState<string>('');

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      console.log('WebSocket message received: ', event.data);
      const rawOutput = String(event.data)
        .replace(/.+Thinking\.\.\..*/gm, '')
        .replace(/^\s*$[\n\r]{1,}/gm, '🧠 -- Thinking --\n');
      const htmlOutput = ansiToHtml.toHtml(rawOutput);
      setOutput(htmlOutput);
    }

    socket.addEventListener('message', onMessage);

    return () => {
      socket.removeEventListener('message', onMessage);
    };
  }, [socket]);

  async function fetchWrapper(url: string, method: 'POST', body?: FetchWrapperBody) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(`Error during fetch for ${url}:`, error);
    }
  }

  function execc(command: string) {
    fetchWrapper('http://localhost:2200/execute', 'POST', { command });
  }

  function sendInput(input: string) {
    fetchWrapper('http://localhost:2200/input', 'POST', { input });
  }

  function killProcess() {
    fetchWrapper('http://localhost:2200/kill', 'POST');
  }

  async function setEnvVariable(key: string, value: string) {
    await fetchWrapper('http://localhost:2200/setenv', 'POST', { key, value });
  }

  async function updateEnvVariable(key: string) {
    const value = prompt(`Enter value for ${key}:`);
    if (value) {
      await setEnvVariable(key, value);
    }
  }

  return (
    <Container maxW='full'>
      <VStack spacing={6} w='full'>
        {/* ... (rest of the code) */}
      </VStack>
    </Container>
  );
}