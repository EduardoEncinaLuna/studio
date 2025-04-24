"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkTarget } from "@/lib/api";
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
    src: "/assets/d12.png",
    id: 1,
    hint: "He loves wearing red and white",
  },
  {
    src: "/assets/level2.png",
    id: 2,
    hint: "You can find him near the sea",
  },
  {
    src: "/assets/level3.png",
    id: 3,
    hint: "He is watching the planes",
  },
  {
    src: "/assets/level4.png",
    id: 4,
    hint: "He loves music and is on the right side",
  },
  {
    src: "/assets/level5.png",
    id: 5,
    hint: "Between the clowns and the tents",
  },
  {
    src: "/assets/level6.png",
    id: 6,
    hint: "He is buying some melons",
  },
  {
    src: "/assets/level7.png",
    id: 7,
    hint: "He is near a tower",
  },
  {
    src: "/assets/level8.png",
    id: 8,
    hint: "You can find him on the top",
  },
  {
    src: "/assets/level9.png",
    id: 9,
    hint: "He is enjoying a day at the beach with his family",
  },
  {
    src: "/assets/level10.png",
    id: 10,
    hint: "He is near the river on the left side of the image",
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

  const [zoom, setZoom] = useState(1);
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });
  // Get the current cookie state of the game
  const [foundCharacters, setFoundCharacters] = useState<boolean[]>(Array(images.length).fill(false));

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
    if (username) {
      setStartTime(Date.now());
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
    if (wrongClickCooldown || gameOver || isLoading) return;

    setIsLoading(true);

    const offsetX = event.nativeEvent.offsetX;
    const offsetY = event.nativeEvent.offsetY;

    if (!event.ctrlKey) {
      // Zoom in on click
      const imageRect = event.currentTarget.getBoundingClientRect();
      const zoomPointX = offsetX;
      const zoomPointY = offsetY;

      setZoomCenter({ x: zoomPointX, y: zoomPointY });
      const zoomClick = zoom + 0.4;
      setZoom(zoomClick > 4 ? 1 : zoomClick);
      return;
    }

    let isCorrect = false;
    try {
        isCorrect = await checkTarget(images[currentImageIndex].id, offsetX, offsetY);
    } finally {
        setIsLoading(false);
    }


    console.log(isCorrect)

    if (isCorrect) {

      setFoundCharacters((prev) => {
        const newFoundCharacters = [...prev];
        newFoundCharacters[currentImageIndex] = true;
        return newFoundCharacters;
      });
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
    clearTimeout(hintTimeout.current as NodeJS.Timeout);
    setShowHint(false);
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Game Over
      setEndTime(Date.now());
      setGameOver(true);
    }
  };

  // Check if all targets are found
  useEffect(() => {
    if (foundCharacters.every((found) => found)) {
      setEndTime(Date.now());
      setGameOver(true);
    } else if (foundCharacters[currentImageIndex]) {
      nextImage(); // Delay before showing next image
    } else {
      // Set a timeout to show the hint after 60 seconds
      hintTimeout.current = setTimeout(() => {
        setShowHint(true);
      }, 60000);
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

  const handleStartGame = (name: string) => {
    setUsername(name);
    localStorage.setItem('username', name);
    setShowUsernameInput(false);
    setStartTime(Date.now());
  };

  const handleRestartGame = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('foundCharacters');
    localStorage.removeItem('currentImageIndex');

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
    <div className="flex h-screen bg-beige justify-center">
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center w-full">


        {showUsernameInput ? (
          <div className="flex flex-col items-center justify-center">
            <Label htmlFor="username" className="text-lg font-semibold mb-2">
              Enter your name:
            </Label>

            <p className="text-xs text-muted-foreground">
              Use Ctrl + left click to select the character
            </p>

            <Input
              id="username"
              placeholder="Your Name"
              className="w-64 mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const name = (e.target as HTMLInputElement).value;
                  if (name.trim() !== '') {
                    handleStartGame(name);
                  } else {
                    toast({
                      title: "Please enter a valid name",
                      variant: "destructive",
                    });
                  }
                }
              }}
            />
            <Button onClick={() => {
              const name = document.getElementById("username") as HTMLInputElement | null;
              if (name && name.value.trim() !== '') {
                handleStartGame(name.value);
              } else {
                toast({
                  title: "Please enter a valid name",
                  variant: "destructive",
                });
              }
            }}>Start Game</Button>
          </div>
        ) : !gameOver ? (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">
              Level {currentImageIndex + 1}/10
            </h1>
            <div className="mt-4 flex flex-col items-center">
              <p className="text-gray-700">Hint: {showHint ? currentImage.hint : "Look carefully..."}</p>
              <p className="">Request a hint before! - 30 sec penalty or wait a whole minute :) </p>
              <Button variant="outline" className="mt-2" onClick={() => {
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
                }, 30000);
                setTimeout(() => {
                  setWrongClickCooldown(false);
                  setShowHint(true)
                }, 30000);
              }}>
                Show Hint
              </Button>
            </div>
            <div className="relative flex justify-center items-center w-[90vw] h-[80vh] overflow-hidden">
              <Image
                src={currentImage.src}
                alt={`Spot ${currentImageIndex + 1}`}
                fill
                priority
                style={{
                  objectFit: "contain",
                  transform: `scale(${zoom})`,
                  transition: "transform 0.3s ease-in-out",
                  transformOrigin: `${zoomCenter.x}px ${zoomCenter.y}px`,
                  cursor: wrongClickCooldown ? "not-allowed" : "crosshair",
                }}
                className={cn("rounded-lg shadow-md transition-all duration-500", imageBlur ? "blur-lg" : "")}

                onClick={handleImageClick}
                onDoubleClick={resetZoom}
                onWheel={handleWheel}
                onMouseMove={handleMouseMove}
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
                  <p>"Waiting... :("</p>
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
            <h2 className="text-3xl font-bold mb-4">Congratulations {username}!</h2>
            <p className="text-gray-700">You found all the characters!</p>
            {startTime && endTime && (
              <p className="text-gray-700">
                Your time: {formatTime(endTime - startTime)}
              </p>
            )}
          </div>
        )}
       {!showUsernameInput && <Button variant="outline" className="mt-4" onClick={handleRestartGame}>Restart Game</Button>}
      </div>
    </div>

  );
}


