"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import useSound from 'use-sound';
import Confetti from "react-confetti";
import { useWindowSize } from "usehooks-ts";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkTarget } from "@/lib/api";
import { Volume2, VolumeX } from "lucide-react";
import { Loader2 } from "lucide-react";

// Define the type for target coordinates
interface Target {
  x: number;
  y: number;
  radius: number;
}

// Define the type for images
interface GameImage { src: string; hint: string; id: number; }

const images: GameImage[] = [
  {
    src: "/assets/Danny2.png",
    id: 1,
    hint: "Seeling something 🤔",
  },
  {
    src: "/assets/Maykol2.png",
    id: 2,
    hint: "Search for doors 🚪",
  },
  {
    src: "/assets/Eduardo2.png",
    id: 3,
    hint: "Find the fish! 🐟",
  },
  {
    src: "/assets/Alvaro2.png",
    id: 4,
    hint: "Enjoying the show 🪓",
  },
  {
    src: "/assets/Lucas2.png",
    id: 5,
    hint: "He was thirsty 🍺",
  },
  {
    src: "/assets/Jose2.png",
    id: 6,
    hint: "Near the shore ☁",
  },
  {
    src: "/assets/Maria2.png",
    id: 7,
    hint: "Trees 🌳",
  },
  {
    src: "/assets/Adriana2.png",
    id: 8,
    hint: "Having fun :) 🎢",
  },
  {
    src: "/assets/Clara2.png",
    id: 9,
    hint: "Hippo 🦛",
  },
  {
    src: "/assets/Steven2.png",
    id: 10,
    hint: "❓",
  },
];


export default function Game() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wrongClickCooldown, setWrongClickCooldown] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();
  const [username, setUsername] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const hintTimeout = useRef<NodeJS.Timeout | null>(null);
  const [imageBlur, setImageBlur] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });
  // Get the current cookie state of the game
  // code validation
  const [code, setCode] = useState<string>(""); // New state for the code input
  const [codeError, setCodeError] = useState<boolean>(false); // New state for the code error message

  const [foundCharacters, setFoundCharacters] = useState<boolean[]>(Array(images.length).fill(false));
  const { width, height } = useWindowSize();
  const [music, setMusic] = useState("/assets/bgmh.mp3");

  // State to control mute/unmute
  const [isMuted, setIsMuted] = useState(false);
// Add background music to the game
  // Load the sound file
  const [play, { pause }] = useSound(music, {
    loop: true,
    volume: 0.02, // Lower volume
  });
  // useEffect to play the sound when the component loads
  useEffect(() => {
    play();
    return () => {
      pause();
    };
  }, [play, pause]);

  const handleImageLoad = () => setImageLoaded(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCharacters = localStorage.getItem('foundCharacters');
      if (storedCharacters) {
        try {
          setFoundCharacters(JSON.parse(storedCharacters));
        } catch (e) {
          console.error('Error parsing foundCharacters from localStorage:', e);
        }
      }
    }
  }, []);

  // useEffect to mute/unmute the sound when isMuted changes
  useEffect(() => {
    if (isMuted) {
      pause();
    } else {
      play();
    }
  }, [isMuted, play, pause]);


  // Load startTime from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Retrieve startTime from localStorage
      const storedStartTime = localStorage.getItem('startTime');
      if (storedStartTime) {
        // Parse and set startTime from localStorage
        setStartTime(parseInt(storedStartTime, 10));
      }
    }
  }, []);
  // Load the currentImageIndex from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCurrentImageIndex = localStorage.getItem('currentImageIndex');
      if (storedCurrentImageIndex) setCurrentImageIndex(parseInt(storedCurrentImageIndex, 10));
    }
  }, []);

  // Handle username input at the beginning of the game
  const [showUsernameInput, setShowUsernameInput] = useState(true);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShowUsernameInput(!localStorage.getItem('username'));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    //If there is a username we set the start time
    if (username) {
      const storedStartTime = localStorage.getItem('startTime');
      if (!storedStartTime) {
        setStartTime(Date.now());
        localStorage.setItem('startTime', String(startTime));
      }
    }

  }, [username]);

  useEffect(() => {
    localStorage.setItem('currentImageIndex', String(currentImageIndex));
  }, [currentImageIndex]);

  // Set the localStorage value every time the foundCharacters changes
  useEffect(() => {
    localStorage.setItem('foundCharacters', JSON.stringify(foundCharacters));
  }, [foundCharacters]);

  const handleImageClick = async (event: React.MouseEvent<HTMLImageElement>) => {
    // Get the width of the image container to use it in the API call
    const imageWidth = event.currentTarget.offsetWidth;

    if (wrongClickCooldown || gameOver || isLoading) return;
    const offsetX = event.nativeEvent.offsetX;
    const offsetY = event.nativeEvent.offsetY;
    setIsLoading(true);
    let isCorrect = false;


    try {
      isCorrect = await checkTarget(images[currentImageIndex].id, offsetX, offsetY, imageWidth);
    } finally {
      setIsLoading(false);
    }

    if (isCorrect) {

      setFoundCharacters((prev) => {
        const newFoundCharacters = [...prev];
        newFoundCharacters[currentImageIndex] = true;
        return newFoundCharacters;
      });
      resetZoom();
      toast({
        title: "Character Found!",
        description: "Proceeding to the next image...",
      });
    } else {
      // Wrong click
      setWrongClickCooldown(true);
      setImageBlur(true);
      toast({
        title: "Wrong Spot!",
        description: "Try again in 5 seconds.",
        variant: "destructive",
      });
      blurTimeout.current = setTimeout(() => {
        setImageBlur(false);
      }, 5000);
      setTimeout(() => {
        setWrongClickCooldown(false);
      }, 5000);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLImageElement>) => {
    event.preventDefault();
    const zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = zoom + zoomAmount;

    setZoom(Math.max(1, Math.min(4, newZoom)));
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    setZoomCenter({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
  };


  // Function to advance to the next image
  const nextImage = () => {
    setImageBlur(true)
    clearTimeout(hintTimeout.current as NodeJS.Timeout);
    setShowHint(false);
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else {
      // Game Over
      setEndTime(Date.now());
      setGameOver(true);
      setMusic("/assets/bgmv.mp3");
    }
  };

  // Check if all targets are found
  useEffect(() => {
    if (foundCharacters.every((found) => found)) {
      setEndTime(Date.now());
      setGameOver(true);
      setMusic("/assets/bgmv.mp3");
    } else if (foundCharacters[currentImageIndex]) {
      nextImage(); // Delay before showing next image
    } else {
      setTimeout(() => {
        setImageBlur(false);
       }, 2000);

      // // Set a timeout to show the hint after 60 seconds
      // hintTimeout.current = setTimeout(() => {
      //   setShowHint(true);
      // }, 60000);
    }

    return () => {
      clearTimeout(hintTimeout.current as NodeJS.Timeout);
    };
  }, [foundCharacters, currentImageIndex, gameOver]);

  const currentImage = images[currentImageIndex];
  const formatTime = (milliseconds: number | null): string => {
    if (!milliseconds) return "00:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartGame = async (name: string, code: string) => {
    // API call to validate the code
    const response = await fetch("/api/validate-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    // Get response
    const data = await response.json();

    // Validate if it was success
    if (response.ok && data.valid) {
      // Start the game
      setUsername(name);
      localStorage.setItem('username', name);
      setShowUsernameInput(false);
      setStartTime(Date.now());
      setMusic("/assets/bgm.mp3");
      setCodeError(false)
    } else {
      // Show error
      setCodeError(true);
    }
  };



  const handleRestartGame = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('foundCharacters');
    localStorage.removeItem('currentImageIndex');
    localStorage.removeItem('startTime');
    setMusic("/assets/bgmh.mp3");

    setCurrentImageIndex(0);
    setWrongClickCooldown(false);
    setGameOver(false);
    setUsername(null);
    setStartTime(null);
    setEndTime(null);
    setShowHint(false);
    clearTimeout(hintTimeout.current as NodeJS.Timeout);
    setShowUsernameInput(true); setFoundCharacters(Array(images.length).fill(false));
  };

  const resetZoom = () => setZoom(1);

  return (
    <div
      className="flex h-screen justify-center"
      style={{
        backgroundImage: `url('/assets/Bg.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        overflow: 'none',
        overflowY: 'hidden',
      }}
    >
      <div
        className="absolute inset-0 bg-black opacity-50"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1, // Ensure it's below the game content
        }}
      />

      <div className="game-container flex-1 p-4 md:p-8 flex flex-col items-center justify-center w-full text-white font-bold" style={{ zIndex: 2 }}>
        {/* Mute/Unmute button */}
        <Button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-4 right-4 z-50 rounded-full p-2"
          variant="ghost"
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </Button>
        {showUsernameInput ? (
          // Button to redirect to /demo, only visible when the game has not started
          // The game is started if startTime is not null
          <div className="flex flex-col items-center justify-center">
            <Label htmlFor="username" className="text-lg font-semibold mb-2">
              Enter your name:
            </Label>
            <Input
              id="username"
              placeholder="Your Name"
              className="w-64 mb-4 font-semibold text-black"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const name = (e.target as HTMLInputElement).value;
                  if (name.trim() !== '') {
                    handleStartGame(name, code);
                  } else {
                    toast({
                      title: "Please enter a valid name",
                      variant: "destructive",
                    });
                  }
                }
              }}
            />
            
            {/* New input for the code */}
            <Label htmlFor="code" className="text-lg font-semibold mb-2">
              Enter the code:
            </Label>
            <Input
              id="code"
              type="text"
              placeholder="Code"
              className="w-64 mb-4 font-semibold text-black"
              value={code}
              onChange={(e) => setCode(e.target.value)} // Update the code state
            />
            {!startTime && (
                 // If there is a code error, show it
                codeError && <p className="text-red-500">Invalid code</p>
              )}
            <div className="flex flex-row w-full justify-between mb-4">
              <Button onClick={() => {
                const name = document.getElementById("username") as HTMLInputElement | null;
                if (name && name.value.trim() !== '') {
                  handleStartGame(name.value, code);
                } else {
                  toast({
                    title: "Please enter a valid name",
                    variant: "destructive",
                  });
                }
              }} variant="secondary">Start Game</Button> {/* New start game button */}
              
              {/* Button to redirect to /demo, only visible when the game has not started */}
              {!startTime && (
                <Button asChild className="text-black">
                  <Link href="/instructions">See how to play</Link>
                </Button>)}
            </div>
          </div>
        ) : !gameOver ? (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl mb-4">
              Level {currentImageIndex + 1}/10
            </h1>
            <div className="mt-4 flex flex-col items-center w-full">
              <div className="flex flex-row w-full justify-between mb-4">
                <Button
                  variant="secondary"
                  className="mr-2 p-4"
                  onClick={() => {
                    if (currentImageIndex != 9) {
                      setWrongClickCooldown(true);
                      setImageBlur(true);
                      toast({
                        title: "Desperate?",
                        description: "Wait 30sec :)",
                        variant: "destructive",
                      });
                      blurTimeout.current = setTimeout(() => {
                        setImageBlur(false);
                      }, 30000);
                      setTimeout(() => {
                        setWrongClickCooldown(false);
                        setShowHint(true);
                      }, 30000);
                    }
                    else {
                      setShowHint(true);
                    }
                  }}
                >
                  Show Hint
                </Button>
                {showHint && <p className="mb-4">Hint: {currentImage.hint}</p>}
                {!showUsernameInput && <Button variant="secondary" className="p-4" onClick={handleRestartGame}>Restart Game</Button>}
              </div>

            </div>
            <div className={"container relative flex justify-center items-center w-[1500px] overflow-hidden rounded-lg border-[5px] border-solid border-light-beige" + ((currentImageIndex) < 5 ? "" : " second-image")}>
              <Image
                src={currentImage.src}
                alt={`Spot ${currentImageIndex + 1}`}
                fill
                priority
                style={{
                  objectFit: "contain",
                  transform: `scale(${zoom})`,
                  transition: "transform 0.3s ease-in-out border 0.3s ease-in-out",
                  transformOrigin: `${zoomCenter.x}px ${zoomCenter.y}px`,
                  cursor: wrongClickCooldown ? "not-allowed" : "crosshair",
                }}
                className={cn("rounded-lg shadow-md transition-all duration-500", imageBlur ? "blur-xl" : "")}

                onClick={handleImageClick}
                onDoubleClick={resetZoom}
                onWheel={handleWheel}
                onMouseMove={handleMouseMove}
                onLoad={handleImageLoad}
              />
              {wrongClickCooldown && (
                <div
                  style={{
                    zIndex: 10,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "20px",
                    borderRadius: "0.5rem",
                    cursor: "not-allowed",
                  }}
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </div>
              )}
              {isLoading && (
                <div
                  style={{
                    zIndex: 10,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "20px",
                    borderRadius: "0.5rem",
                    cursor: "not-allowed",
                  }}
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl mb-4">Congratulations {username}!</h2>
            <p className="">You found all the characters!</p>
            {startTime && endTime && (
              <p className="">
                Your time: {formatTime(endTime - startTime)}
              </p>
            )}
            <Button variant="secondary" className="p-4" onClick={handleRestartGame}>Restart Game</Button>
          </div>
        )}
        {gameOver && (
          <Confetti width={width} height={height} />
        )}
      </div>
    </div>

  );
}


