import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import styled, { ThemeProvider } from 'styled-components';

const themes = {
  light: {
    background: 'white',
    color: 'blue',
    button: 'blue',
    buttonText: 'white',
  },
  dark: {
    background: 'gray',
    color: 'blue',
    button: 'blue',
    buttonText: 'white',
  },
};

const Container = styled.div`
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.button};
  color: ${(props) => props.theme.buttonText};
  margin: 10px;
  padding: 10px;
  border: none;
  cursor: pointer;
  font-size: 16px;
`;

const App = () => {
  const [theme, setTheme] = useState('light');
  const [imageSrc, setImageSrc] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const webcamRef = useRef(null);

  const capture = () => {
    const image = webcamRef.current.getScreenshot();
    setImageSrc(image);
  };

  const retake = () => {
    setImageSrc(null);
    setEmotion(null);
  };

  const analyze = async () => {
    if (!imageSrc) return;

    const base64Data = imageSrc.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', imageBlob);

    try {
      const response = await axios.post('http://localhost:3000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEmotion(response.data.emotion_index);
    } catch (error) {
      console.error('Error analyzing the image', error);
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeProvider theme={themes[theme]}>
      <Container>
        <h1>Emotion Detector</h1>
        <Button onClick={toggleTheme}>Toggle Theme</Button>
        {imageSrc ? (
          <>
            <img src={imageSrc} alt="Captured" style={{ width: '50%' }} />
            <Button onClick={retake}>Retake</Button>
            <Button onClick={analyze}>Analyze</Button>
            {emotion !== null && <div>Detected Emotion Index: {emotion}</div>}
          </>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={{ width: '50%' }}
            />
            <Button onClick={capture}>Capture</Button>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;
