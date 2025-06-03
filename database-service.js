import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    getDocs,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

class DatabaseService {
    // Store a new class definition with tags
    async storeClass(className, classData, tags) {
        try {
            // Ensure tags is an array and has max 5 tags
            const validTags = Array.isArray(tags) ? tags.slice(0, 5) : [];
            
            await setDoc(doc(db, "classes", className), {
                ...classData,
                tags: validTags,
                lastUpdated: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error("Error storing class:", error);
            return false;
        }
    }

    // Get a class definition
    async getClass(className) {
        try {
            const docRef = doc(db, "classes", className);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                console.log(`Class ${className} not found`);
                return null;
            }
        } catch (error) {
            console.error("Error getting class:", error);
            return null;
        }
    }

    // Update a class definition
    async updateClass(className, updates, newTags = null) {
        try {
            const updateData = {
                ...updates,
                lastUpdated: new Date().toISOString()
            };

            if (newTags !== null) {
                updateData.tags = Array.isArray(newTags) ? newTags.slice(0, 5) : [];
            }

            const docRef = doc(db, "classes", className);
            await updateDoc(docRef, updateData);
            return true;
        } catch (error) {
            console.error("Error updating class:", error);
            return false;
        }
    }

    // Delete a class definition
    async deleteClass(className) {
        try {
            await deleteDoc(doc(db, "classes", className));
            return true;
        } catch (error) {
            console.error("Error deleting class:", error);
            return false;
        }
    }

    // Get all classes
    async getAllClasses() {
        try {
            const classesRef = collection(db, "classes");
            const querySnapshot = await getDocs(classesRef);
            const classes = {};
            
            querySnapshot.forEach((doc) => {
                classes[doc.id] = doc.data();
            });
            
            return classes;
        } catch (error) {
            console.error("Error getting all classes:", error);
            return null;
        }
    }

    // Find classes by tags (up to 5 tags, order doesn't matter)
    async findClassesByTags(searchTags) {
        try {
            // Ensure we have valid tags and limit to 5
            const validTags = Array.isArray(searchTags) ? searchTags.slice(0, 5) : [];
            
            // Get all classes
            const classesRef = collection(db, "classes");
            const querySnapshot = await getDocs(classesRef);
            const matchingClasses = {};
            
            querySnapshot.forEach((doc) => {
                const classData = doc.data();
                const classTags = classData.tags || [];
                
                // Check if all search tags are present in the class tags
                const hasAllTags = validTags.every(tag => classTags.includes(tag));
                
                if (hasAllTags) {
                    matchingClasses[doc.id] = classData;
                }
            });
            
            return matchingClasses;
        } catch (error) {
            console.error("Error finding classes by tags:", error);
            return null;
        }
    }

    // Add a tag to a class
    async addTag(className, tag) {
        try {
            const docRef = doc(db, "classes", className);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const classData = docSnap.data();
                const currentTags = classData.tags || [];
                
                // Only add if we have less than 5 tags and the tag isn't already present
                if (currentTags.length < 5 && !currentTags.includes(tag)) {
                    await updateDoc(docRef, {
                        tags: arrayUnion(tag),
                        lastUpdated: new Date().toISOString()
                    });
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error adding tag:", error);
            return false;
        }
    }

    // Remove a tag from a class
    async removeTag(className, tag) {
        try {
            const docRef = doc(db, "classes", className);
            await updateDoc(docRef, {
                tags: arrayRemove(tag),
                lastUpdated: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error("Error removing tag:", error);
            return false;
        }
    }
}

export const databaseService = new DatabaseService(); 