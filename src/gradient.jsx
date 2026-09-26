import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import { MeshGradient } from "@paper-design/shaders-react";

const colors = ["#ffffff", "#d7e8ff", "#bad8ff", "#eef7ff"];

class GradientFallback extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFallback();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function mountGradient(host, onFallback) {
  const root = createRoot(host);
  let previous = null;
  function setActive(active) {
    if (active === previous) return;
    previous = active;
    root.render(
      <GradientFallback onFallback={onFallback}>
        <MeshGradient
          colors={colors}
          distortion={0.45}
          swirl={0.2}
          grainMixer={0}
          grainOverlay={0}
          speed={active ? 0.3 : 0}
          frame={100000}
          minPixelRatio={1}
          maxPixelCount={600000}
          width="100%"
          height="100%"
          data-gradient-state={active ? "running" : "paused"}
        />
      </GradientFallback>,
    );
  }
  setActive(true);
  return { setActive };
}
