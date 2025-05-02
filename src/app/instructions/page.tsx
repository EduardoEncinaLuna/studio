'use client'
import React from 'react';
import { useState, useEffect } from "react";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Volume2, VolumeX } from "lucide-react";
import useSound from 'use-sound';

// Demo component to show how to play the game
export default function DemoPage() {
  const { toast } = useToast();
  const [zoom, setZoom] = useState(1);
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });

  // State to control mute/unmute
  const [isMuted, setIsMuted] = useState(false);
// Add background music to the game
  // Load the sound file
  const [play, { pause }] = useSound("/assets/bgmt.mp3", {
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

  // useEffect to mute/unmute the sound when isMuted changes
  useEffect(() => {
    if (isMuted) {
      pause();
    } else {
      play();
    }
  }, [isMuted, play, pause]);

  const handleWheel = (event: React.WheelEvent<HTMLImageElement>) => {
    event.preventDefault();
    const zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = zoom + zoomAmount;

    setZoom(Math.max(1, Math.min(4, newZoom)));
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    setZoomCenter({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
  };

  const handleImageClick = async (event: React.MouseEvent<HTMLImageElement>) => {
    const offsetX = event.nativeEvent.offsetX;
    const offsetY = event.nativeEvent.offsetY;
    console.log(offsetX, offsetY)

    const distance = Math.sqrt(
      Math.pow(886 - offsetX, 2) + Math.pow(354 - offsetY, 2)
    );
    let isCorrect = distance <= 30;

    if (isCorrect) {
      toast({
        title: "Character Found!",
        description: "Proceeding to the next image...",
      });
    } else {
      toast({
        title: "Wrong Spot!",
        description: "Try again in 5 seconds.",
        variant: "destructive",
      });
    }
  };
  return (
    <div
      className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center w-full h-[100vh] text-white font-bold"
      style={{
        backgroundImage: `url('/assets/Bg.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        overflow: 'none',
        overflowY: 'hidden',
      }}
    >
      <div
        className="absolute inset-0 bg-black opacity-70"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1, // Ensure it's below the game content
        }}
      />
      <div  
      style={{
          zIndex: 2, 
        }}>
        {/* Page heading */}
        <h1 className="text-3xl font-bold mb-6">Instructions</h1>

        <div className='flex w-[80vw] space-between'>
          <div>
             {/* Controls section */}
        <section className="mb-8" style={{marginRight:'20px'}}>
          <h2 className="text-xl font-semibold mb-2">Controls</h2>
          <ul className="list-disc pl-5">
            <li>Click on the image to find the hidden characters.</li>
            <li>Use the mouse wheel to zoom in/out.</li>
            <li>Use your mouse to move around the image.</li>
            <li>Hint button will help you to find the characters (see more below).</li>
            <li>Restart button will erase all your progress (careful!).</li>
          </ul>
        </section>
        
        {/* Back to Game button */}
        <Link href="/">
          <Button 
                  variant="secondary">Back to Game</Button>
        </Link>
          </div>
          <div>
             {/* Hints section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Hints</h2>
          <p>You can request 1 hint per character (except for the last character)</p>
          <p>Requesting a hint will add 30 seconds to your time, so be careful.</p>
        </section>

        {/* Wrong Clicks section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Wrong Clicks</h2>
          <p>Clicking in the wrong spot will add 5 seconds to your time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Characters</h2>
          <p>To finish the game you need to find all the 10 character (1 per image).</p>
        </section>
          </div>
        </div>
       

       

        {/* Demo image */}
        <section className="mb-8">
        <div className={"container-demo relative flex justify-center items-center w-[1000px] h-[550px] overflow-hidden rounded-lg border-[5px] border-solid border-light-beige"}>
            <Image
              src="/assets/Simpson.png"
              alt="Demo Image"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
              priority
              style={{
                objectFit: "contain",
                transform: `scale(${zoom})`,
                transition: "transform 0.3s ease-in-out border 0.3s ease-in-out",
                transformOrigin: `${zoomCenter.x}px ${zoomCenter.y}px`,
                cursor: "crosshair",
              }}
              onClick={handleImageClick}
              onWheel={handleWheel}
              onMouseMove={handleMouseMove}
            />
          </div>
        </section>

        
      </div>
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

    </div>
  );
}