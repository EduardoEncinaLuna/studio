"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the type for target coordinates
interface Target {
  x: number;
  y: number;
  radius: number;
}

// Define the type for images
interface GameImage {
  src: string;
  characterRef: string;
  hint: string;
  target: Target;
}

const images: GameImage[] = [
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level1.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "He loves wearing red and white",
    target: { x: 685, y: 260, radius: 30 },
  },
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level2.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "You can find him near the sea",
    target: { x: 530, y: 760, radius: 30 },
  },
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level3.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "He is watching the planes",
    target: { x: 780, y: 640, radius: 30 },
  },
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level4.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "He loves music and is on the right side",
    target: { x: 220, y: 780, radius: 30 },
  },
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level5.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "Between the clowns and the tents",
    target: { x: 420, y: 700, radius: 30 },
  },
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level6.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "He is buying some melons",
    target: { x: 370, y: 390, radius: 30 },
  },
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level7.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "He is near a tower",
    target: { x: 340, y: 690, radius: 30 },
  },
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level8.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "You can find him on the top",
    target: { x: 510, y: 340, radius: 30 },
  },
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level9.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "He is enjoying a day at the beach with his family",
    target: { x: 800, y: 820, radius: 30 },
  },
  {
    src: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/level10.png",
    characterRef: "https://raw.githubusercontent.com/manuelod93/spotquest/main/assets/waldo.png",
    hint: "He is near the river on the left side of the image",
    target: { x: 150, y: 680, radius: 30 },
  },
];

export default function SpotQuest() {
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
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get the current cookie state of the game
  const [foundCharacters, setFoundCharacters] = useState<boolean[]>(() => {
    if (typeof window === 'undefined') {
      return Array(images.length).fill(false);
    }
    const storedCharacters = localStorage.getItem('foundCharacters');
    if (storedCharacters) {
      try {
        return JSON.parse(storedCharacters);
      } catch (e) {
        console.error('Error parsing foundCharacters from localStorage:', e);
        return Array(images.length).fill(false);
      }
    }
    return Array(images.length).fill(false);
  });

  // Handle username input at the beginning of the game
  const [showUsernameInput, setShowUsernameInput] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return !localStorage.getItem('username');
  });

  // Initialize username from localStorage on component mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Initialize the timer when the component mounts, if the game has started
  useEffect(() => {
    if (username) {
      setStartTime(Date.now());
    }
  }, [username]);

  // Set the localStorage value every time the currentImageIndex changes
  useEffect(() => {
    localStorage.setItem('currentImageIndex', String(currentImageIndex));
  }, [currentImageIndex]);

  // Set the localStorage value every time the foundCharacters changes
  useEffect(() => {
    localStorage.setItem('foundCharacters', JSON.stringify(foundCharacters));
  }, [foundCharacters]);

  // Function to handle clicks on the image
  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (wrongClickCooldown) return;

    const offsetX = event.nativeEvent.offsetX;
    const offsetY = event.nativeEvent.offsetY;

    const target = images[currentImageIndex].target;

    const distance = Math.sqrt(
      Math.pow(offsetX - target.x, 2) + Math.pow(offsetY - target.y, 2)
    );

    if (distance <= target.radius) {
      // Correct click
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
      setTimeout(() => {
        nextImage();
      }, 2000); // Delay before showing next image
    } else {
      // Set a timeout to show the hint after 60 seconds
      hintTimeout.current = setTimeout(() => {
        setShowHint(true);
      }, 60000);
    }

    return () => {
      clearTimeout(hintTimeout.current as NodeJS.Timeout);
    };
  }, [foundCharacters, currentImageIndex]);

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
    setShowUsernameInput(true);
    setFoundCharacters(Array(images.length).fill(false));
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-beige">
        <Sidebar variant="inset" side="left" collapsible="icon">
          <SidebarHeader>
            <SidebarTrigger className="md:hidden" />
          </SidebarHeader>
          <SidebarContent>
            {username ? (
              <p className="text-sm">Welcome, {username}!</p>
            ) : (
              <p className="text-sm">Enter your name to start!</p>
            )}
            {!gameOver && (
              <p className="text-sm">Find all characters to win!</p>
            )}
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs text-muted-foreground">
              Firebase Studio - SpotQuest
            </p>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center">
          {showUsernameInput ? (
            <div className="flex flex-col items-center justify-center">
              <Label htmlFor="username" className="text-lg font-semibold mb-2">
                Enter your name:
              </Label>
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
              <div className="relative">
                <Image
                  src={currentImage.src}
                  alt={`Spot ${currentImageIndex + 1}`}
                  width={800}
                  height={600}
                  className={cn("rounded-lg shadow-md transition-all duration-500", imageBlur ? "blur-lg" : "")}
                  onClick={handleClick}
                  style={{ cursor: wrongClickCooldown ? "not-allowed" : "crosshair" }}
                />
                {wrongClickCooldown && (
                  <div
                    style={{
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
                    <p>Image hidden...</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center">
                <div className="w-48 h-48 relative rounded-lg shadow-md mr-4">
                  <Image
                    src={currentImage.characterRef}
                    alt="Character Reference"
                    fill
                    style={{ objectFit: "contain" }}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-700">Hint: {showHint ? currentImage.hint : "Look carefully..."}</p>
                  {showHint ? null : <p className="text-xs text-muted-foreground">Hint will appear in 1 minute</p>}
                </div>
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
          <Button variant="outline" className="mt-4" onClick={handleRestartGame}>
            Restart Game
          </Button>
        </div>
      </div>
    </SidebarProvider>
  );
}
