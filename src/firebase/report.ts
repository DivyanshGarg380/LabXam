import {db} from "./config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

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