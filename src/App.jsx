import { useRef, useState, useEffect } from "react";
import "./App.css";

const phrases = [
  "Resonix",
  "Your Music Visualizer",
  "Feel the Beat",
  "Turn Sound into Light",
  "Where Sound Becomes Sight",
  "Experience the Vibes",
  "Let the Rhythm Speak",
  "Bass in Your Face",
  "Sound, Seen",
  "Music You Can Watch",
  "Echoes in Motion",
  "Beats in Motion",
  "Visualize Your Vibes",
  "From Silence to Storm",
  "Your Frequency. Your Flow.",
  "Sync With the Sound",
  "Watch the Music Flow",
  "The Pulse of Sound",
  "Sonic Soulscape",
  "Visual Beats, Real Feels",
  "Let Your Music Shine",
  "Shape the Sound",
  "Drop the Beat, See the Flow",
  "When Music Moves",
  "Feel Every Frequency",
  "Glow with the Flow",
  "Pure Audio Energy",
  "Waveform Wonderland",
  "Mood in Motion",
  "Catch the Pulse",
  "Turn Up the Vision",
  "Feel It. See It.",
  "Dream in Decibels",
  "See the Soundtrack of You",
  "Soundscapes Reimagined",
  "This Is What You Feel",
  "The Sound You Can See",
  "Live Your Loop",
  "Infinite Vibes, One Visual",
  "Spectra of Sound",
  "Frequency Foundry",
  "Vibe Engine Activated",
  "Color Your Rhythm",
  "One Track, Many Waves",
  "Hear it. See it. Live it.",
];

function useTypewriter(words, delay = 10000) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[index % words.length]; // Do not randomize, pick the next phrase sequentially

    const type = () => {
      setText((prev) => {
        return isDeleting
          ? currentWord.substring(0, prev.length - 1)
          : currentWord.substring(0, prev.length + 1);
      });

      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), delay / 2);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length); // Go to next phrase
      }
    };

    const typingSpeed = isDeleting ? 50 : 100;
    const timer = setTimeout(type, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, words, delay]);

  return text;
}

function App() {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [fileURL, setFileURL] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // for upload state

  const typedText = useTypewriter(phrases, 10000);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "audio/mpeg") {
      // Simulating upload delay (4-5 seconds)
      setIsUploading(true);
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        setFileURL(url);
        setFileName(file.name);
        setCurrentTime(0);
        setDuration(0);
        setIsUploading(false);
      }, Math.random() * (5000 - 4000) + 4000); // Random delay between 4 and 5 seconds
    } else {
      alert("Please upload an MP3 file.");
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleLoop = () => {
    const audio = audioRef.current;
    audio.loop = !audio.loop;
    setLoop(audio.loop);
  };

  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };

    if (audio) {
      audio.addEventListener("timeupdate", updateTime);
      return () => {
        audio.removeEventListener("timeupdate", updateTime);
      };
    }
  }, []);

  useEffect(() => {
    if (fileURL) {
      const audio = audioRef.current;
      audio.src = fileURL;
      audio.play();
      setIsPlaying(true);
    }
  }, [fileURL]);

  useEffect(() => {
    const audio = audioRef.current;

    // Listen for the 'ended' event to reset play button after music ends
    const handleMusicEnd = () => {
      setIsPlaying(false); // Set to "Play" after it ends
    };

    if (audio) {
      audio.addEventListener("ended", handleMusicEnd);
      return () => {
        audio.removeEventListener("ended", handleMusicEnd);
      };
    }
  }, [fileURL]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = context.createAnalyser();
    const source = context.createMediaElementSource(audio);

    source.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const drawVisualizer = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let barX = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = "#4fc3f7";
        ctx.fillRect(barX, canvas.height - barHeight, barWidth, barHeight);
        barX += barWidth + 1;
      }

      requestAnimationFrame(drawVisualizer);
    };

    drawVisualizer();
  }, [fileURL]);

  // New function to go back to the upload screen
  const handleBack = () => {
    setFileURL(null);
    setFileName("");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setLoop(false);
  };

  return (
    <div className={`app ${isUploading ? "loading" : ""}`}>
      <div className="resonix-header">
        <h1 className="resonix-title">Resonix</h1>
        <p className="typewriter">{typedText}</p>
      </div>

      {!fileURL && !isUploading && (
        <div className="upload-container">
          <label htmlFor="upload-btn" className="upload-label">
            🎵 Upload Your Music
          </label>
          <input
            id="upload-btn"
            type="file"
            accept=".mp3"
            onChange={handleFileChange}
            className="file-input-hidden"
          />
        </div>
      )}

      {isUploading && (
        <div className="loader">
          <div className="spinner"></div>
          <p>Uploading...</p>
        </div>
      )}

      {fileURL && (
        <>
          <audio ref={audioRef} loop={loop} />
          <p className="file-name">Now Playing: {fileName}</p>

          <div className="controls">
            <button onClick={togglePlay}>
              {isPlaying ? "❚❚ Pause" : "▷ Play"}
            </button>
            <button onClick={toggleLoop} className={loop ? "loop-on" : ""}>
              ⇆ {loop ? "Loop On" : "Loop Off"}
            </button>
            {/* Add a "Back" button */}
            <button onClick={handleBack}>❮❮ Back</button>
          </div>

          <div className="visualizer-container">
            <canvas
              ref={canvasRef}
              width="600"
              height="200"
              className="visualizer"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
