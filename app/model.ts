import { firebase_db } from "@/FirebaseConfig";
import { collection, doc, DocumentData, getDoc, getDocs, Query, query, setDoc, where } from "firebase/firestore";
import { getUniqueInvoiceNo, getUniquePaymentInfoID, getUniquePetClinicID } from "./utils";

export interface Filter {
    filterType: string;
    value: string;
}

export interface ListEntry {
    label: string;
    value: string;
}



export enum PaymentMethod {
    "cash",
    "bank_transfer",
    "payment"
}

export class Bill {
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    vendorId: string;
    petClinicId: string;
    amount: number;
    paymentInfoIds: string[];

    private constructor(
        invoiceNumber: string,
        invoiceDate: Date,
        dueDate: Date,
        vendorID: string,
        petClinicId: string,
        amount: number,
        paymentInfoIds: string[]
    ) {
        this.invoiceNumber = invoiceNumber;
        this.invoiceDate = invoiceDate;
        this.dueDate = dueDate;
        this.vendorId = vendorID;
        this.petClinicId = petClinicId;
        this.amount = amount;
        this.paymentInfoIds = paymentInfoIds;
    }

    static async createBill(
        invoiceDate: Date,
        dueDate: Date,
        vendorID: string,
        petClinic: PetClinic,
        amount: number,
        paymentInfo: PaymentInfo[]
    ): Promise<Bill> {
        const newInvoiceNumber = await getUniqueInvoiceNo();
        const paymentInfoIds = paymentInfo.map(info => info._id);
        const bill = new Bill(newInvoiceNumber, invoiceDate, dueDate, vendorID, petClinic.id,amount,paymentInfoIds);
        await bill.save();
        return bill;
    }

    static async getBill(invoiceNumber: string): Promise<Bill> {
        try {
            const billDocRef = doc(firebase_db, "bill", invoiceNumber);
            const billSnapshot = await getDoc(billDocRef);

            if (!billSnapshot.exists()) {
                console.error(`Bill with invoiceNumber ${invoiceNumber} does not exist.`);
                throw Error(`Bill with invoiceNumber ${invoiceNumber} does not exist.`);
            }
            const billData = billSnapshot.data();
            const invoiceDate = new Date(billData.invoiceDate);
            const dueDate = new Date(billData.dueDate);
            return new Bill(
                billData.invoiceNumber,
                invoiceDate,
                dueDate,
                billData.vendorId,
                billData.petClinicId,
                billData.amount,
                billData.paymentInfoIds
            );
        } catch (error: any) {
            console.error("Error getting bill data: ", error);
            throw Error(error.message);
        }
    }

    static async getAllBills(filters: Filter[]): Promise<Bill[]> {
        const billCollectionRef = collection(firebase_db, "bill");
    
        const queryRef = filters.reduce<Query<DocumentData>>((currentQuery, filter) => {
            return query(currentQuery, where(filter.filterType,"==", filter.value));
        }, query(billCollectionRef));
    
        const billCollection = await getDocs(queryRef);
    
        const bills: Bill[] = billCollection.docs.map((doc) => {
            const billData = doc.data();
            return new Bill(
                billData.invoiceNumber,
                billData.invoiceDate,
                billData.dueDate,
                billData.vendorId,
                billData.petClinicId,
                billData.amount,
                billData.paymentInfoIds
            );
        });
    
        return bills;
    }
    async getPaymentInfo(): Promise<PaymentInfo[]> {
        let paymentInfoList:PaymentInfo[] = [];
        this.paymentInfoIds.map(async (paymentInfoId) => {
            paymentInfoList = [...paymentInfoList, await PaymentInfo.getPaymentInfo(paymentInfoId)];
        });
        return paymentInfoList;
    }

    async addPaymentInfo(paymentInfo: PaymentInfo) {
        this.paymentInfoIds = [...this.paymentInfoIds, paymentInfo._id];
        await this.save();
    }

    // helper functions

    toFirestoreObject(): Record<string, any> {
        return {
            invoiceNumber: this.invoiceNumber,
            invoiceDate: this.invoiceDate.toISOString(),
            dueDate: this.dueDate.toISOString(),
            vendorId: this.vendorId,
            petClinicId: this.petClinicId,
            amount: this.amount,
            paymentInfoIds: this.paymentInfoIds
        };
    }

    async save() {
        try {
            const docRef = doc(firebase_db, "bill", this.invoiceNumber);
            await setDoc(docRef, this.toFirestoreObject());
            console.log("Bill information successfully saved!");
        } catch (error) {
            console.error("Error saving bill information: ", error);
        }
    }
}

export class Vendor {
    id: string;
    name: string;

    private constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    static async getVendor(vendorId: string) {
        const vendorDocRef = doc(firebase_db, 'vendor', vendorId);

        try {
            const vendorDoc = await getDoc(vendorDocRef);

            if (!vendorDoc.exists()) {
                console.error(`Vendor with ID ${vendorId} does not exist.`);
                throw Error(`Vendor with ID ${vendorId} does not exist.`);
            }

            const { id, name } = vendorDoc.data();

            return new Vendor(id, name);
        } catch (error: any) {
            console.error("Error getting vendor data: ", error);
            throw Error(error.message);
        }
    }
}

export class PetClinic {
    id: string;
    clinicName: string;
    doctorName: string;
    location: string;

    private constructor(
        id: string,
        clinicName: string,
        doctorName: string,
        location: string,
    ) {
        this.id = id;
        this.clinicName = clinicName;
        this.doctorName = doctorName;
        this.location = location;
    }

    static async createPetClinic(clinicName: string, doctorName: string, location: string):
        Promise<PetClinic> {
        const newPetClinicID = await getUniquePetClinicID();
        const petClinic = new PetClinic(newPetClinicID, clinicName, doctorName, location);
        await petClinic.save();
        return petClinic;
    }

    static async getPetClinic(id: string): Promise<PetClinic> {
        const petClinicDocRef = doc(firebase_db, 'petClinic', id);
        try {
            const petClinicSnapshot = await getDoc(petClinicDocRef);

            if (!petClinicSnapshot.exists()) {
                console.error(`PetClinic with ID ${id} does not exist.`);
                throw Error(`PetClinic with ID ${id} does not exist.`);
            }

            const petClinicData = petClinicSnapshot.data();

            return new PetClinic(
                petClinicData.id,
                petClinicData.clinicName,
                petClinicData.doctorName,
                petClinicData.location,
            );
        } catch (error: any) {
            console.error("Error getting pet clinic data: ", error);
            throw Error(error.message);
        }
    }
    static async getAllPetClinics(): Promise<PetClinic[]> {
        const petClinicCollectionRef = collection(firebase_db, "petClinic");
        const petClinicCollection = await getDocs(petClinicCollectionRef);
        const petClinics: PetClinic[] = petClinicCollection.docs.map((doc) => {
            const petClinicData = doc.data();
            return new PetClinic(
                petClinicData.id,
                petClinicData.clinicName,
                petClinicData.doctorName,
                petClinicData.location,
            );
        });
        return petClinics;
    }

    // helper functions
    toFirestoreObject(): Record<string, any> {
        return {
            id: this.id,
            clinicName: this.clinicName,
            doctorName: this.doctorName,
            location: this.location,
        };
    }

    async save() {
        try {
            const docRef = doc(firebase_db, "petClinic", this.id);
            await setDoc(docRef, this.toFirestoreObject());
            console.log("Pet clinic information successfully saved!");
        } catch (error) {
            console.error("Error saving pet clinic information: ", error);
        }
    }
}

export class PaymentInfo{
    _id: string;
    date: Date;
    paymentMethod: PaymentMethod;
    amount: number;

    private constructor(id: string, date: Date, paymentMethod: PaymentMethod, amount: number) {
        this._id = id;
        this.date = date;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
    }

    static async createPaymentInfo(date: Date, paymentMethod: PaymentMethod, amount: number): Promise<PaymentInfo> {
        const newPaymentInfoId = await getUniquePaymentInfoID();
        const paymentInfo = new PaymentInfo(newPaymentInfoId, date, paymentMethod, amount);
        await paymentInfo.save();
        return paymentInfo;
    }

    static async getPaymentInfo(_id: string): Promise<PaymentInfo> {
        const paymentInfoDocRef = doc(firebase_db, 'paymentInfo', _id);

        try {
            const paymentInfoDoc = await getDoc(paymentInfoDocRef);

            if (!paymentInfoDoc.exists()) {
                console.error(`PaymentInfo with ID ${_id} does not exist.`);
                throw Error(`PaymentInfo with ID ${_id} does not exist.`);
            }

            const { id, date, paymentMethod, amount } = paymentInfoDoc.data();

            return new PaymentInfo(id, date, paymentMethod, amount);

        } catch (error: any) {
            console.error("Error getting paymentInfo data: ", error);
            throw Error(error.message);
        }
    }

    // helper functions
    toFirestoreObject(): Record<string, any> {
        return {
            id: this._id,
            date: this.date.toISOString(),
            paymentMethod: this.paymentMethod,
            amount: this.amount
        };
    }

    async save() {
        try {
            const docRef = doc(firebase_db, "paymentInfo", this._id);
            await setDoc(docRef, this.toFirestoreObject());
            console.log("Payment information successfully saved!");
        } catch (error) {
            console.error("Error saving payment information: ", error);
        }
    }
}
    