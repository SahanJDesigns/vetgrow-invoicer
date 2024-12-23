import { firebase_db } from "@/FirebaseConfig";
import { doc, runTransaction, Transaction } from "firebase/firestore";

export async function getUniqueInvoiceNo():Promise<string> {
    const invoiceDocRef = doc(firebase_db,"system","tracker");
    try{
        const newInvoiceNo = await runTransaction(firebase_db,async (transaction)=> {
            const invoiceDoc = await transaction.get(invoiceDocRef);

            let currentNo = 0;

            if (invoiceDoc.exists()){
                currentNo = invoiceDoc.data().latestInvoiceNo || 0;
            }

            const nextNo = currentNo + 1;

            transaction.set(invoiceDocRef,{latestInvoiceNo:nextNo},{merge:true});

            return nextNo;
        });
        const formatedNo = `INV-${newInvoiceNo.toString().padStart(6,'0')}`
        return formatedNo;
    }catch (error) {
        console.log("Failed to generate a invoiceNo", error)
        throw new Error("Faild to generate an invoice number. Please try again")
    }
}

export async function getUniquePetClinicID():Promise<string> {
    const petClinicDocRef = doc(firebase_db,"system","tracker");

    try{
        const newPetClinicID = await runTransaction(firebase_db,async (transaction) => {
            const petClinicDoc = await transaction.get(petClinicDocRef);
    
            let currentID = 0;
    
            if (petClinicDoc.exists()){
                const currentID = petClinicDoc.data().latestPetClinicID || 0
            }
    
            const nextID = currentID + 1
    
            transaction.set(petClinicDocRef,{latestPetClinicID: nextID},{merge:true});
            return nextID;
        });

        const formatedID = `PC-${newPetClinicID.toString().padStart(6,'0')}`;
        return formatedID;

    }catch (error) {
        console.log("Failed to generate pet clinic ID",error);
        throw Error("Failed to generate pet clinic ID. Please try again");
    }

}

export async function getUniquePaymentInfoID():Promise<string> {
    const paymentInfoDocRef = doc(firebase_db,"system","tracker");

    try{
        const newPaymentInfoID = await runTransaction(firebase_db,async (transaction) => {
            const paymentInfoDoc = await transaction.get(paymentInfoDocRef);
    
            let currentID = 0;
            
            if (paymentInfoDoc.exists()){
                console.log(paymentInfoDoc.data().latestPaymentInfoID)
                currentID = paymentInfoDoc.data().latestPaymentInfoID || 0
            }
            console.log(currentID)
            const nextID = currentID + 1
            
            transaction.set(paymentInfoDocRef,{latestPaymentInfoID: nextID},{merge:true});
            return nextID;
        });
        console.log(newPaymentInfoID)
        const formatedID = `PI-${newPaymentInfoID.toString().padStart(6,'0')}`;
        return formatedID;

    }catch (error) {
        console.log("Failed to generate payment info ID",error);
        throw Error("Failed to generate payment info ID. Please try again");
    }
    
}
