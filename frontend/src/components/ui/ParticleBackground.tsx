import React, { useEffect, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { RecursivePartial, IOptions } from "@tsparticles/engine";

interface ParticleBackgroundProps {
  variant?: "default" | "dense" | "minimal";
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ variant = "default" }) => {
  // Load the slim tsParticles bundle once
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, []);

  // Memoize the config so it only recalculates when `variant` changes
  const options = useMemo<RecursivePartial<IOptions>>(() => {
    const base: RecursivePartial<IOptions> = {
      fpsLimit: 60,
      detectRetina: true,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
          resize: { enable: true },
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.5 } },
        },
      },
      particles: {
        color: { value: "#ffffff" },
        links: { enable: true, distance: 150, opacity: 0.2, width: 1 },
        move: {
          enable: true,
          speed: 1,
          random: true,
          outModes: { default: "bounce" },
        },
        number: { value: 80, density: { enable: true } },
        opacity: { value: 0.2 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
    };

    switch (variant) {
      case "dense":
        return {
          ...base,
          particles: {
            ...base.particles!,
            number: { ...base.particles!.number!, value: 160 },
            opacity: { value: 0.3 },
          },
        };
      case "minimal":
        return {
          ...base,
          particles: {
            ...base.particles!,
            number: { ...base.particles!.number!, value: 40 },
            opacity: { value: 0.1 },
            move: { ...base.particles!.move!, speed: 0.5 },
          },
        };
      default:
        return base;
    }
  }, [variant]);

  return (
    <Particles
      id="tsparticles"
      options={options}
      className="absolute inset-0"
    />
  );
};

export default ParticleBackground;
