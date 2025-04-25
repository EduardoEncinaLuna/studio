
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Demo component to show how to play the game
export default function DemoPage() {
  return (
    <div
      className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center w-full text-white font-bold"
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

        {/* Controls section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Controls</h2>
          <ul className="list-disc pl-5">
            <li>Click on the image to find the hidden characters.</li>
            <li>Use the mouse wheel to zoom in/out.</li>
            <li>Use your mouse to move around the image.</li>
            <li>Hint button will help you to find the characters (see more below).</li>
            <li>Restart button will erase all your progress (careful!).</li>
          </ul>
        </section>

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

        {/* Demo image */}
        <section className="mb-8">
          <div className="max-w-3xl mx-auto">
            <Image
              src="/assets/d12.png"
              alt="Demo Image"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg border-[5px] border-solid border-light-beige"
              priority
            />
          </div>
        </section>

        {/* Back to Game button */}
        <Link href="/">
          <Button 
                  variant="secondary">Back to Game</Button>
        </Link>
      </div>

    </div>
  );
}