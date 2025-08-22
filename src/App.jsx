import "./App.css";
import { useState, useEffect, useMemo, useRef } from "react";

function App() {
  const [gameStatus, setGameStatus] = useState("idle"); // idle | playing | paused | win | lose
  const [points, setPoints] = useState(5); // number of balls
  const [time, setTime] = useState(0); // seconds
  const [autoPlay, setAutoPlay] = useState(false);

  // Ball model
  const [balls, setBalls] = useState([]);
  const [activeBallId, setActiveBallId] = useState(null); // which ball is currently
  // Tham chiếu để lưu trữ giá trị điểm trước đó
  const gameRef = useRef(null);

  const title = useMemo(() => {
    if (gameStatus === "win") return "All Cleared!";
    if (gameStatus === "lose") return "Game Over!";
    return "Let's Play!";
  }, [gameStatus]);

  // Tạo bóng mới dựa trên số points đã nhập vào input
  const generateBalls = (count) => {
    const arr = Array.from({ length: Math.max(0, count | 0) }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      clicked: false,
      countdown: 3,
    }));
    return arr;
  };

  // Controls
  const startGame = () => {
    setGameStatus("playing");
    setTime(0);
    setBalls(generateBalls(points));
    setActiveBallId(null); // Không đếm ngược cho đến khi được click vào quả bóng đầu tiên
  };

  const restartGame = () => {
    // Giữ nguyên cài đặt tự động chơi: Bóng được random lại trên màn hình và đặt lại thời gian
    setGameStatus("playing");
    setTime(0);
    setBalls(generateBalls(points));
    setActiveBallId(null);
  };

  const togglePause = () => {
    if (gameStatus === "playing") {
      setGameStatus("paused");
    } else if (gameStatus === "paused") {
      setGameStatus("playing");
    }
  }

  // Time ticker
  useEffect(() => {
    if (gameStatus !== "playing") return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);

    // Cleanup Function
    return () => clearInterval(t);
  }, [gameStatus]);

  // Đếm ngược bóng tiếp theo nhưng không đếm những quả còn lại
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

    // Cleanup Function
    return () => clearInterval(interval);
  }, [gameStatus, activeBallId]);

  // Autoplay: click vào mỗi quả bóng lần lượt sau mỗi 1 giây
  const toggleAuto = () => setAutoPlay((v) => !v);

  useEffect(() => {
    if (!autoPlay || gameStatus !== "playing") return;

    const timer = setInterval(() => {
      setBalls((prev) => {
        const next = prev.find((b) => !b.clicked);
        if (!next) return prev;
        handleBallClickInternal(next.id, prev);
        return prev; // trạng thái sẽ được cập nhật bên trong hàm handleBallClickInternal
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoPlay, gameStatus, balls]);

  // Tìm id của quả bóng chưa được click tiếp theo
  const getNextRequiredId = (arr) => arr.find((b) => !b.clicked)?.id ?? null;

  // Xử lý logic click vào bóng
  const handleBallClickInternal = (id, current = null) => {
    if (gameStatus !== "playing") return;

    setBalls((prev) => {
      const arr = current ?? prev;
      const requiredId = getNextRequiredId(arr);

      if (id !== requiredId) {
        // Xử lý nếu không click bóng theo thứ tự sẽ thua
        if (gameStatus === "playing") {
          setGameStatus("lose");
          setActiveBallId(null);
        }
        return arr;
      }

      // Đánh dấu các quả bóng đã được click
      const newArr = arr.map((b) =>
        b.id === id ? { ...b, clicked: true } : b
      );

      const nextRequired = getNextRequiredId(newArr);
      if (nextRequired === null) {
        setGameStatus("win");
        setActiveBallId(null);
        return newArr;
      }

      // Mỗi quả bóng sẽ được kích hoạt đếm ngược trong 3s
      setActiveBallId(nextRequired);
      return newArr.map((b) =>
        b.id === nextRequired ? { ...b, countdown: 3 } : b
      );
    });
  };

  // Khi Autoplay được bật, người chơi sẽ không được click vào bóng
  const handleClickBall = (id) => {
    if (autoPlay) return; 
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
                
                {gameStatus !== "win" && gameStatus !== "lose" && (
                  <button
                    className={`px-4 py-2 rounded-xl ${
                      gameStatus === "paused" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                    }`}
                    onClick={togglePause}
                  >
                    {gameStatus === "paused" ? "RESUME" : "PAUSE"}
                  </button>
                )}
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
              Click the balls in order to complete the game!
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
                    : "bg-orange-500 text-white"
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

        {/* Footnote Bar */}
        <div className="inline-flex w-full justify-between">
          <div className="mt-4 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              Balls left: {balls.filter((ball) => !ball.clicked).length}
            </span>
          </div>

          <div className="mt-4 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 inline-block rounded-full bg-sky-500"></span>{" "}
              normal
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 inline-block rounded-full bg-slate-400"></span>{" "}
              clicked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
