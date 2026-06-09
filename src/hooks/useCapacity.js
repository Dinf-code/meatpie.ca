import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

function useCapacity() {
  const [remainingPies, setRemainingPies] = useState(null);

  useEffect(() => {
    const capacityRef = doc(db, "config", "capacity");

    const unsubscribe = onSnapshot(capacityRef, (docSnap) => {
      if (docSnap.exists()) {
        setRemainingPies(docSnap.data().remainingPies);
      } else {
        setRemainingPies(0);
      }
    });

    return () => unsubscribe();
  }, []);

  return remainingPies;
}

export default useCapacity;