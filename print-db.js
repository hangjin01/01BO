import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function inspectData() {
  console.log('--- FETCHING TRIPS ---');
  const tripsSnapshot = await getDocs(collection(db, 'trips'));
  tripsSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Trip ID: ${doc.id} | Title: ${data.title} | Destination: ${data.destination} | Dates: ${data.startDate} to ${data.endDate}`);
    if (data.itinerary) {
      console.log('  Itinerary Items:');
      data.itinerary.forEach((item, index) => {
        console.log(`    [${index}] ID: ${item.id} | Title: ${item.title} | Time: ${item.scheduledTime} | Date: ${item.date || 'NOT SET'}`);
      });
    }
  });

  console.log('\n--- FETCHING CHECK-INS ---');
  const checkInsSnapshot = await getDocs(collection(db, 'checkIns'));
  checkInsSnapshot.forEach(doc => {
    const data = doc.data();
    const dateStr = new Date(data.timestamp).toISOString();
    console.log(`Check-In ID: ${doc.id} | Location: ${data.locationName} | Type: ${data.type} | Time: ${dateStr} | User: ${data.userId} | Trip: ${data.tripId}`);
  });

  console.log('\n--- FETCHING EXPENSES ---');
  const expensesSnapshot = await getDocs(collection(db, 'expenses'));
  expensesSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Expense ID: ${doc.id} | Merchant: ${data.merchant} | Amount: ${data.amount} | Date: ${data.date} | User: ${data.userId} | Trip: ${data.tripId}`);
  });
}

inspectData().catch(console.error);
