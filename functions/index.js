/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const axios = require("axios");

// Initialize Firebase Admin with production database
admin.initializeApp({
    databaseURL: "https://classes-ec2da-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "classes-ec2da"
});

// Disable database emulator
process.env.FIREBASE_DATABASE_EMULATOR_HOST = "";

// Daily call limit configuration
const DAILY_CALL_LIMIT = 1000; // Adjust this number as needed

// OpenAI configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Valid tags list - you can modify this as needed
const VALID_TAGS_TIER1 = [
    "Rogue","Warrior","Mage","Priest"
];
const VALID_TAGS_TIER2 = [
    "Dagger","Bow","Dual Wielding",
    "One Handed","One Handed + Shield","Two Handed","Fire","Earth","Water","Air"
    ,"Summoner","Arcane","Smite","Heal","Utility"
];
const VALID_TAGS_TIER3 = [
    "Critical Hits","Speed","Bleed"
    ,"Poison","Evasion","Berserk","Durability","Single Target","Power","Rally",
    "Multiple Target","Lava","Stone","Ice","Lightning","Steam","Runestone","Blood",
    "Necromancy","Nature","Lifesteal","Elementalist","Blessing","Chant","Purge","Exorcism",
    "Soulbind","Shield"
];

/**
 * Checks and updates the daily call count
 * @return {Promise<boolean>} Returns true if under limit, false if limit reached
 */
async function checkDailyLimit() {
    const db = admin.database();
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const counterRef = db.ref(`callLimits/${today}`);
    
    try {
        // Use transaction to safely increment counter
        const result = await counterRef.transaction((currentCount) => {
            if (currentCount === null) {
                return 1; // First call of the day
            }
            if (currentCount >= DAILY_CALL_LIMIT) {
                return currentCount; // Don't increment if limit reached
            }
            return currentCount + 1;
        });

        // Check if transaction was committed and if we're under limit
        if (result.committed && result.snapshot.val() <= DAILY_CALL_LIMIT) {
            return true;
        }
        return false;
    } catch (error) {
        logger.error("Error checking daily limit", error);
        throw error;
    }
}

/**
 * Fetches all skill IDs from the Skills/ path in the database
 * @return {Promise<Array<string>>} Returns an array of skill IDs
 */
async function getAllSkillIds() {
    const db = admin.database();
    const skillsRef = db.ref('Skills/');
    
    try {
        const snapshot = await skillsRef.once('value');
        const skills = snapshot.val();
        
        if (!skills) {
            logger.info('No skills found in database');
            return [];
        }
        
        // Convert the object to an array of skill IDs
        const skillIds = Object.keys(skills);
        logger.info('Retrieved skill IDs', { count: skillIds.length });
        return skillIds;
    } catch (error) {
        logger.error('Error fetching skill IDs', error);
        throw error;
    }
}

/**
 * Cloud Function to process tags and return or generate class data
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
exports.processTags = onRequest({
    maxInstances: 10, // Maximum number of concurrent instances
    memory: "256MiB", // Memory allocation
    timeoutSeconds: 60, // Maximum execution time
    minInstances: 0, // Minimum number of instances to keep warm
    concurrency: 80, // Maximum number of concurrent requests per instance
    region: "us-central1", // Region where the function runs
}, async (req, res) => {
    logger.info("processTags function started", { query: req.query });
    
    try {
        // Check daily call limit first
        const isUnderLimit = await checkDailyLimit();
        if (!isUnderLimit) {
            logger.warn("Daily call limit reached");
            res.status(429).json({
                error: "Daily call limit reached. Please try again tomorrow.",
                limit: DAILY_CALL_LIMIT
            });
            return;
        }

        // 1. Get and validate tags
        const tags = req.query.tags ? req.query.tags.split(",") : [];
        logger.info("Received tags", { tags });
        
        if (!Array.isArray(tags) || tags.length === 0 || tags.length > 5) {
            logger.warn("Invalid tags array", { tags, length: tags.length });
            res.status(400).json({error: "Invalid tags array. Must contain 1-5 tags."});
            return;
        }

        // Check for duplicate tags
        const uniqueTags = new Set(tags);
        if (uniqueTags.size !== tags.length) {
            const duplicates = tags.filter((tag, index) => tags.indexOf(tag) !== index);
            logger.warn("Duplicate tags found", { duplicates });
            res.status(400).json({
                error: `Duplicate tags are not allowed: ${[...new Set(duplicates)].join(", ")}`
            });
            return;
        }

        // 2. Verify tags against valid list and tier requirements
        const invalidTags = tags.filter((tag) => 
            !VALID_TAGS_TIER1.includes(tag) && 
            !VALID_TAGS_TIER2.includes(tag) && 
            !VALID_TAGS_TIER3.includes(tag)
        );
        
        if (invalidTags.length > 0) {
            logger.warn("Invalid tags found", { invalidTags });
            res.status(400).json({error: `Invalid tags found: ${invalidTags.join(", ")}`});
            return;
        }

        // Check tier requirements
        const tier1Tags = tags.filter(tag => VALID_TAGS_TIER1.includes(tag));
        const tier2Tags = tags.filter(tag => VALID_TAGS_TIER2.includes(tag));
        const tier3Tags = tags.filter(tag => VALID_TAGS_TIER3.includes(tag));

        // Must have exactly 1 tier 1 tag
        if (tier1Tags.length !== 1) {
            logger.warn("Invalid tier 1 tag count", { tier1Tags });
            res.status(400).json({
                error: "Must include exactly one tier 1 tag (Rogue, Warrior, or Mage)"
            });
            return;
        }

        // For 2+ tags, must have exactly 1 tier 2 tag
        if (tags.length >= 2 && tier2Tags.length !== 1) {
            logger.warn("Invalid tier 2 tag count", { tier2Tags });
            res.status(400).json({
                error: "Must include exactly one tier 2 tag when using 2 or more tags"
            });
            return;
        }

        // Log the tier distribution
        logger.info("Tag tier distribution", {
            tier1: tier1Tags,
            tier2: tier2Tags,
            tier3: tier3Tags
        });

        // 3. Order tags alphabetically and create combination key
        const orderedTags = [...tags].sort();
        const combination = orderedTags.join("_");
        logger.info("Created combination", { orderedTags, combination });

        // 4. Determine tier based on number of tags
        const tier = `tier${tags.length}`;
        logger.info("Determined tier", { tier });
        
        // 5. Query Firebase Realtime Database
        const db = admin.database();
        const ref = db.ref(`tiers/${tier}/classes`);
        logger.info("Database reference details", { 
            ref: ref.toString(),
            url: ref.toString() + '.json',
            query: {
                orderBy: 'combination',
                equalTo: combination
            }
        });
        
        const snapshot = await ref.orderByChild("combination")
            .equalTo(combination)
            .once("value");
        const data = snapshot.val();
        logger.info("Database query result", { found: !!data });

        // 6. Check if we found a response
        if (data) {
            // Get the first (and should be only) matching object
            const response = Object.values(data)[0];
            if (response && response.name) {
                logger.info("Returning existing class data", { name: response.name });
                res.json(response);
                return;
            }
        }

        // 7. If no response found, call LLM API
        logger.info("No existing data found, calling LLM API");
        const skillIds = await getAllSkillIds();

        const llmResponse = await getOpenAIResponse(tags, skillIds);
        logger.info("Received LLM response", { name: llmResponse.name });

        // 8. Save response to database
        const responseData = {
            name: llmResponse.name,
            description: llmResponse.description,
            combination: combination,
            tags: tags,
            timestamp: admin.database.ServerValue.TIMESTAMP,
        };
        logger.info("Saving new class data to database", { name: responseData.name });

        // Create a new reference with a unique key
        const newRef = ref.push();
        await newRef.set(responseData);
        logger.info("Successfully saved new class data");

        // 9. Return response
        res.json(responseData);

    } catch (error) {
        logger.error("Error in processTags function", {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({error: "Internal server error"});
    }
});

async function getOpenAIResponse(tags, skillIds) {
    // Get API key from Firebase environment configuration
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
        logger.error("OpenAI API key not configured");
        throw new Error("OpenAI API key not configured. Please set it in Firebase environment variables.");
    }

    const openaiPayload = {
        model: "gpt-4.1-nano",
        messages: [
            {
                role: "system",
                content: "Based on the tags, generate a class name and description. Generate the requirements for the class. The description should be a short and flavorful description of the class." +
                " The description should be 2-3 sentences. Format the response as a JSON object with the following properties: name, description, requirements." +
                "Use this class as a reference for the requirements: " + JSON.stringify(skillIds)
            },
            {
                role: "user",
                content: questionText
            }
        ]
    };

    try {
        const openaiResponse = await axios.post(OPENAI_API_URL, openaiPayload, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return openaiResponse.data.choices[0].message.content;
    } catch (err) {
        logger.error("OpenAI API error", {
            status: err.response?.status,
            message: err.message
        });
        
        if (err.response?.status === 401) {
            throw new Error('OpenAI API authentication failed');
        }
        throw new Error('Failed to get response from OpenAI');
    }
}
