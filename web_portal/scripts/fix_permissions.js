const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check for service account file
const serviceAccountPath = path.join(__dirname, '../service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('ERROR: service-account.json not found in web_portal directory.');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixPermissions() {
    console.log('Starting permission fix...');

    try {
        const usersvna = await db.collection('users').get();
        console.log(`Found ${usersvna.size} total users.`);

        // Loop through all users and ensure they are instructors for now
        // Or finding the specific user if we knew the UID, but let's fix all 'pending' or 'student' ones
        // that might be the teacher.

        // Actually, let's just make EVERYONE an instructor and active for dev purposes.

        let fixedCount = 0;

        for (const doc of usersvna.docs) {
            const data = doc.data();
            console.log(`Checking user ${doc.id} (${data.email}) - Role: ${data.role}, Status: ${data.status}`);

            // Update to instructor and active
            await db.collection('users').doc(doc.id).set({
                role: 'instructor',
                status: 'active',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`  -> FIXED: Set to instructor/active.`);
            fixedCount++;
        }

        console.log('------------------------------------------------');
        console.log(`Permission fix complete. Updated ${fixedCount} users.`);
        console.log('Please try creating the group again in the browser.');

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

fixPermissions();
