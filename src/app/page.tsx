"use client";

import { useState, useEffect } from "react";
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

// Define the type for target coordinates
interface Target {
  x: number;
  y: number;
  radius: number;
  found: boolean;
}

const images = [
  {
    src: "https://picsum.photos/800/600",
    targets: [
      { x: 100, y: 150, radius: 20, found: false },
      { x: 250, y: 300, radius: 20, found: false },
      { x: 400, y: 450, radius: 20, found: false },
      { x: 550, y: 150, radius: 20, found: false },
      { x: 700, y: 300, radius: 20, found: false },
    ],
  },
  {
    src: "https://picsum.photos/800/601",
    targets: [
      { x: 120, y: 170, radius: 20, found: false },
      { x: 270, y: 320, radius: 20, found: false },
      { x: 420, y: 470, radius: 20, found: false },
      { x: 570, y: 170, radius: 20, found: false },
      { x: 720, y: 320, radius: 20, found: false },
    ],
  },
];

export default function SpotQuest() {
  const [imageIndex, setImageIndex] = useState(0);
  const [targets, setTargets] = useState<Target[]>(images[imageIndex].targets);
  const [wrongClickCooldown, setWrongClickCooldown] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (gameOver) {
      toast({
        title: "Congratulations!",
        description: "You found all the spots!",
      });
    }
  }, [gameOver, toast]);

  // Function to handle clicks on the image
  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (wrongClickCooldown) return;

    const offsetX = event.nativeEvent.offsetX;
    const offsetY = event.nativeEvent.offsetY;

    const targetIndex = targets.findIndex((target) => {
      const distance = Math.sqrt(
        Math.pow(offsetX - target.x, 2) + Math.pow(offsetY - target.y, 2)
      );
      return distance <= target.radius && !target.found;
    });

    if (targetIndex !== -1) {
      // Correct click
      const newTargets = [...targets];
      newTargets[targetIndex] = { ...newTargets[targetIndex], found: true };
      setTargets(newTargets);
    } else {
      // Wrong click
      setWrongClickCooldown(true);
      toast({
        title: "Wrong Spot!",
        description: "Try again in 10 seconds.",
        variant: "destructive",
      });
      setTimeout(() => {
        setWrongClickCooldown(false);
      }, 10000);
    }
  };

  // Function to advance to the next image
  const nextImage = () => {
    if (imageIndex < images.length - 1) {
      setImageIndex(imageIndex + 1);
      setTargets(images[imageIndex + 1].targets); // Reset targets for the new image
    } else {
      // Game Over
      setGameOver(true);
    }
  };

  // Check if all targets are found
  useEffect(() => {
    if (targets.every((target) => target.found)) {
      if (imageIndex < images.length - 1) {
        toast({
          title: "All spots found!",
          description: "Proceeding to the next image...",
        });
        setTimeout(() => {
          nextImage();
        }, 2000); // Delay before showing next image
      } else {
        setGameOver(true);
      }
    }
  }, [targets, imageIndex, nextImage, toast]);

  const currentImage = images[imageIndex];

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-beige">
        <Sidebar variant="inset" side="left" collapsible="icon">
          <SidebarHeader>
            <SidebarTrigger className="md:hidden" />
          </SidebarHeader>
          <SidebarContent>
            <p className="text-sm">Find all spots to continue!</p>
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs text-muted-foreground">
              Firebase Studio - SpotQuest
            </p>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-4 md:p-8">
          {!gameOver ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">
                Image {imageIndex + 1}
              </h1>
              <div className="relative">
                <Image
                  src={currentImage.src}
                  alt={`Spot ${imageIndex + 1}`}
                  width={800}
                  height={600}
                  className="rounded-lg shadow-md"
                  onClick={handleClick}
                  style={{ cursor: wrongClickCooldown ? "not-allowed" : "crosshair" }}
                />
                {targets.map(
                  (target, index) =>
                    target.found && (
                      <div
                        key={index}
                        style={{
                          position: "absolute",
                          left: target.x - target.radius,
                          top: target.y - target.radius,
                          width: target.radius * 2,
                          height: target.radius * 2,
                          borderRadius: "50%",
                          border: "2px solid #A7D1AB",
                          pointerEvents: "none", // Prevent interference with clicks
                        }}
                      />
                    )
                )}
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
                    <p>Wait...</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
              <p className="text-gray-700">You found all the spots!</p>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
