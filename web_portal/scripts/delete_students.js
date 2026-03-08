const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check for service account file
const serviceAccountPath = path.join(__dirname, '../service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('ERROR: service-account.json not found in web_portal directory.');
    console.error('Please download your Firebase Service Account JSON key and save it as "service-account.json" in the c:\\projects\\testhub2\\web_portal directory.');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function deleteStudentUsers() {
    console.log('Starting deletion of student users...');

    try {
        // 1. Query Firestore for students
        // Assuming 'role' field exists and is set to 'student'
        console.log('Querying Firestore for users with role "student"...');
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'student')
            .get();

        if (usersSnapshot.empty) {
            console.log('No student users found in Firestore.');
            return;
        }

        console.log(`Found ${usersSnapshot.size} student users to delete.`);

        // Ask for confirmation (simulated here since we are running via agent, 
        // but the agent interaction already serves as confirmation. 
        // However, a 5 second delay is good safety).
        console.log('Waiting 5 seconds before starting deletion... (Ctrl+C to cancel)');
        await new Promise(resolve => setTimeout(resolve, 5000));

        let deletedCount = 0;
        let errorCount = 0;

        // 2. Iterate and delete
        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const uid = doc.id;
            const email = userData.email || 'No email';
            const name = userData.name || 'No name';

            console.log(`[${deletedCount + 1}/${usersSnapshot.size}] Processing: ${name} (${email}) - ${uid}`);

            try {
                // Delete from Auth first (if exists)
                try {
                    await auth.deleteUser(uid);
                    console.log(`  - Deleted from Auth.`);
                } catch (authError) {
                    if (authError.code === 'auth/user-not-found') {
                        console.log(`  - User not found in Auth (already deleted or desync).`);
                    } else {
                        console.error(`  - Error deleting from Auth: ${authError.message}`);
                    }
                }

                // Delete from Firestore
                await db.collection('users').doc(uid).delete();
                console.log(`  - Deleted from Firestore.`);

                deletedCount++;
            } catch (e) {
                console.error(`  - Failed to delete student ${uid}:`, e);
                errorCount++;
            }
        }

        console.log(`\nDeletion complete.`);
        console.log(`Successfully deleted: ${deletedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

deleteStudentUsers();
