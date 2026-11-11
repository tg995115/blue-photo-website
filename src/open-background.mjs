// A decorative background of supporter slogans repeated in drifting rows behind the icon. The rows
// brighten near the pointer or finger, and tapping the icon makes them pulse. It is hidden from
// assistive technology, carries no links and does nothing without JavaScript.

/** Rows of slogans, each rotated so neighbouring rows do not repeat the same shout in the same place. */
export function buildRows(slogans, rowCount, repeat) {
  return Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: repeat }, (_, index) => slogans[(row + index) % slogans.length]),
  );
}

/** 0 to 1: how strongly a row at `rowY` glows for a pointer at `pointerY`; zero beyond `radius`. */
export function glowFor(rowY, pointerY, radius) {
  if (pointerY === null || radius <= 0) return 0;
  const distance = Math.abs(rowY - pointerY);
  if (distance >= radius) return 0;
  const closeness = 1 - distance / radius;
  return closeness * closeness * (3 - 2 * closeness);
}

/** A different slogan from the current one, so a tap always visibly changes it. */
export function pickDifferent(slogans, current, random = Math.random()) {
  const others = slogans.filter((slogan) => slogan !== current);
  const pool = others.length > 0 ? others : slogans;
  return pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random * pool.length)))];
}

/** Builds the rows and wires the pointer and the icon tap. Returns a function that removes it all. */
export function mountBackground({ document, window, slogans, icon, onChant, rowCount = 9, repeat = 6 }) {
  const layer = document.createElement("div");
  layer.className = "open-bg";
  layer.setAttribute("aria-hidden", "true");
  const rows = buildRows(slogans, rowCount, repeat).map((words, index) => {
    const row = document.createElement("div");
    row.className = "open-bg-row";
    row.style.setProperty("--duration", `${34 + ((index * 7) % 19)}s`);
    if (index % 2 === 1) row.style.setProperty("--direction", "reverse");
    // The same half twice, so sliding by exactly half is seamless.
    const half = words.map((word) => `<span>${word}</span>`).join("");
    row.innerHTML = half + half;
    layer.append(row);
    return row;
  });
  document.body.prepend(layer);

  let pointerY = null;
  let frame = 0;
  const paint = () => {
    frame = 0;
    const radius = window.innerHeight * 0.3;
    for (const row of rows) {
      const box = row.getBoundingClientRect();
      row.style.setProperty("--glow", glowFor(box.top + box.height / 2, pointerY, radius).toFixed(3));
    }
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(paint);
  };
  const move = (event) => {
    pointerY = event.clientY;
    schedule();
  };
  const leave = () => {
    pointerY = null;
    schedule();
  };
  const tap = () => {
    layer.classList.remove("is-chant");
    // Restart the pulse even on a quick second tap.
    void layer.offsetWidth;
    layer.classList.add("is-chant");
    onChant?.();
  };
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerleave", leave);
  window.addEventListener("blur", leave);
  icon?.addEventListener("click", tap);
  return () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerleave", leave);
    window.removeEventListener("blur", leave);
    icon?.removeEventListener("click", tap);
    layer.remove();
  };
}
