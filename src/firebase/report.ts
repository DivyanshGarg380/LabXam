import {db} from "./config";
import { collection, addDoc, serverTimestamp, query, getDocs, deleteDoc, doc, Timestamp, where } from "firebase/firestore";
import { toast } from "sonner";

export const deleteOldResolvedReports = async () => {
    try {
        const now = new Date();
        const day = new Date(now.setDate(now.getDate() - 30));

        const q = query(
            collection(db, "reports"),
            where("resolved" , "==", true),
            where("createdAt", "<", Timestamp.fromDate(day))
        );

        const snapshot = await getDocs(q);

        const deletes = snapshot.docs.map((d) => deleteDoc(doc(db, "reports", d.id)));

        await Promise.all(deletes);
    } catch (err) {
        toast.error("Error deleting old reports");
    }
}

export const sendReport = async (message: string) => {
    if(!message.trim()) return;

    try {
        await addDoc(collection(db, "reports"), {
            message,
            createdAt: serverTimestamp(),
        });
    } catch (err) {
        toast.error("Server Error while sending report... Please try again later");
    }
}