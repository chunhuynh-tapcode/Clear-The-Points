import "./App.css";
import { useState, useEffect, useMemo, useRef } from "react";

function App() {
  const [gameStatus, setGameStatus] = useState("idle"); // idle | playing | win | lose
  const [points, setPoints] = useState(5); // number of balls
  const [time, setTime] = useState(0); // seconds
  const [autoPlay, setAutoPlay] = useState(false);

  /** Ball model
   * { id: number, x: number (%), y: number (%), clicked: boolean, countdown: number }
   */
  const [balls, setBalls] = useState([]);
  const [activeBallId, setActiveBallId] = useState(null); // which ball is currently
  // Ref to store the previous points value
  const gameRef = useRef(null);

  const title = useMemo(() => {
    if (gameStatus === "win") return "All Cleared!";
    if (gameStatus === "lose") return "Game Over!";
    return "Let's Play!";
  }, [gameStatus]);

  // Generate balls based on points
  const generateBalls = (count) => {
    const arr = Array.from({ length: Math.max(0, count | 0) }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84, // keep inside the box (percent)
      y: 8 + Math.random() * 84,
      clicked: false,
      countdown: 3,
    }));
    return arr;
  };

  // --- Controls
  const startGame = () => {
    setGameStatus("playing");
    setTime(0);
    setBalls(generateBalls(points));
    setActiveBallId(null); // 👉 No countdown until the first click
  };

  const restartGame = () => {
    // Keep autoplay setting as-is; regenerate balls & reset time
    setGameStatus("playing");
    setTime(0);
    setBalls(generateBalls(points));
    setActiveBallId(null); // again, no countdown until next manual (or auto) click
  };

  const toggleAuto = () => setAutoPlay((v) => !v);

  // --- Time ticker
  useEffect(() => {
    if (gameStatus !== "playing") return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [gameStatus]);

  // --- Countdown only for the ACTIVE (next) ball
  useEffect(() => {
    if (gameStatus !== "playing" || activeBallId === null) return;

    let expired = false;
    const interval = setInterval(() => {
      setBalls((prev) =>
        prev.map((b) => {
          if (b.id === activeBallId && !b.clicked) {
            const next = { ...b, countdown: b.countdown - 1 };
            if (next.countdown <= 0) expired = true;
            return next;
          }
          return b;
        })
      );
      if (expired) {
        setGameStatus("lose");
        setActiveBallId(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus, activeBallId]);

  // --- Autoplay: click next required ball every 1s while ON
  useEffect(() => {
    if (!autoPlay || gameStatus !== "playing") return;

    const timer = setInterval(() => {
      setBalls((prev) => {
        const next = prev.find((b) => !b.clicked);
        if (!next) return prev;
        // simulate user click on the correct next ball
        handleBallClickInternal(next.id, prev);
        return prev; // state will be updated inside handleBallClickInternal
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, gameStatus, balls]);

  // Find id of the next required ball (first not clicked)
  const getNextRequiredId = (arr) => arr.find((b) => !b.clicked)?.id ?? null;

  // Core click handler (pure logic). Accepts optional current array to avoid double reads
  const handleBallClickInternal = (id, current = null) => {
    if (gameStatus !== "playing") return;

    setBalls((prev) => {
      const arr = current ?? prev;
      const requiredId = getNextRequiredId(arr);

      if (id !== requiredId) {
        // wrong order ⇒ lose
        if (gameStatus === "playing") {
          setGameStatus("lose");
          setActiveBallId(null);
        }
        return arr;
      }

      // mark clicked
      const newArr = arr.map((b) =>
        b.id === id ? { ...b, clicked: true } : b
      );

      // Are we done?
      const nextRequired = getNextRequiredId(newArr);
      if (nextRequired === null) {
        setGameStatus("win");
        setActiveBallId(null);
        return newArr;
      }

      // Activate next ball's countdown (reset it to full 3s)
      setActiveBallId(nextRequired);
      return newArr.map((b) =>
        b.id === nextRequired ? { ...b, countdown: 3 } : b
      );
    });
  };

  const handleClickBall = (id) => {
    if (autoPlay) return; // while Auto is ON, block manual clicks
    handleBallClickInternal(id);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xl rounded-2xl shadow-lg bg-white p-5">
        {/* Title */}
        <h1
          className={`text-2xl font-bold text-center ${
            gameStatus === "win"
              ? "text-green-600"
              : gameStatus === "lose"
              ? "text-red-600"
              : "text-slate-800"
          }`}
        >
          {title}
        </h1>

        {/* Controls */}
        <div className="mt-4 grid grid-cols-2 gap-3 items-end">
          <label className="flex items-center gap-2">
            <span className="font-medium">Points:</span>
            <input
              type="number"
              min={1}
              className="border rounded-md px-2 py-1 w-24"
              value={points}
              onChange={(e) => setPoints(Math.max(1, Number(e.target.value)))}
              disabled={gameStatus === "playing"}
            />
          </label>

          <div className="flex items-center justify-end gap-2">
            <span className="font-medium">Time:</span>
            <div className="px-2 py-1 rounded-md bg-slate-200 min-w-[60px] text-center">
              {time}s
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-3 justify-center mt-1">
            {gameStatus === "idle" ? (
              <button
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
                onClick={startGame}
              >
                Start
              </button>
            ) : (
              <>
                <button
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
                  onClick={restartGame}
                >
                  Restart
                </button>
                <button
                  className={`px-4 py-2 rounded-xl border hover:bg-slate-50 ${
                    autoPlay ? "border-green-600" : "border-slate-300"
                  }`}
                  onClick={toggleAuto}
                >
                  Auto Play: {autoPlay ? "ON" : "OFF"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Game Screen */}
        <div
          ref={gameRef}
          className="relative mt-5 w-full aspect-square border-2 border-slate-800 rounded-xl overflow-hidden bg-slate-50"
          style={{
            // Fallback inline styles for users not using Tailwind
            position: "relative",
          }}
        >
          {/* Hint when idle */}
          {balls.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 select-none">
              Game will be here
            </div>
          )}

          {balls.map((ball) => {
            const isActive = activeBallId === ball.id;
            return (
              <div
                key={ball.id}
                onClick={() => handleClickBall(ball.id)}
                className={`absolute flex items-center justify-center rounded-full select-none cursor-pointer shadow-md transition-transform hover:scale-105 ${
                  ball.clicked
                    ? "bg-slate-400 text-white"
                    : isActive
                    ? "bg-emerald-500 text-white"
                    : "bg-sky-500 text-white"
                }`}
                style={{
                  width: 48,
                  height: 48,
                  left: `${ball.x}%`,
                  top: `${ball.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                title={
                  ball.clicked
                    ? "Clicked"
                    : isActive
                    ? `Countdown: ${ball.countdown}s`
                    : ""
                }
              >
                <span className="text-sm font-bold">
                  {ball.id + 1}
                  {isActive && !ball.clicked ? ` (${ball.countdown})` : ""}
                </span>
              </div>
            );
          })}
        </div>

        {/* Small legend */}
        <div className="mt-4 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 inline-block rounded-full bg-sky-500"></span>{" "}
            normal
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 inline-block rounded-full bg-emerald-500"></span>{" "}
            active (counting)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 inline-block rounded-full bg-slate-400"></span>{" "}
            clicked
          </span>
        </div>
      </div>
    </div>
  );
}
export default App;
