import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

const WEEKLY_MAX_PAID = 90;

function useCapacity() {
  const [remainingPies, setRemainingPies] = useState(WEEKLY_MAX_PAID);

  useEffect(() => {
    const capacityRef = doc(db, "config", "capacity");

    let unsubscribe;

    const initAndListen = async () => {
      const docSnap = await getDoc(capacityRef);

      if (!docSnap.exists()) {
        await setDoc(capacityRef, {
          remainingPies: WEEKLY_MAX_PAID,
        });
      }

      unsubscribe = onSnapshot(capacityRef, (docSnap) => {
        if (docSnap.exists()) {
          setRemainingPies(docSnap.data().remainingPies);
        }
      });
    };

    initAndListen();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return remainingPies;
}

export default useCapacity;