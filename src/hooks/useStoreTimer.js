import { useState, useEffect } from "react";

function useStoreTimer() {
  const [isOpen, setIsOpen] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const day = now.getDay();

      const open = day >= 1 && day <= 4;
      setIsOpen(open);

      let target = new Date(now);

      if (open) {
        if (day === 4) {
          target.setHours(23, 59, 59, 999);
        } else {
          const daysUntilThursday = 4 - day;
          target.setDate(now.getDate() + daysUntilThursday);
          target.setHours(23, 59, 59, 999);
        }
      } else {
        const daysUntilMonday = (1 - day + 7) % 7;
        target.setDate(now.getDate() + daysUntilMonday);
        target.setHours(0, 0, 0, 0);
      }

      const diff = target - now;

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setTimeRemaining(`${hrs}:${mins}:${secs}`);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  return { isOpen, timeRemaining };
}

export default useStoreTimer;