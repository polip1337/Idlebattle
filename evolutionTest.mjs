import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load evolutions data
const evolutionsData = JSON.parse(fs.readFileSync(path.join(__dirname, './Data/evolutions.json'), 'utf-8'));

describe('Evolutions Achievability Tests', function () {
  // Helper function to create a stats object with high values for testing
  function createMaxStats(previousClass = null) {
    return {
      meleeDamage: 10000,
      rangedDamage: 10000,
      spellsCast: 1000,
      areasExplored: 1000,
      physicalDamageTaken: 10000,
      hpHealed: 10000,
      itemsStolen: 1000,
      itemsCrafted: 1000,
      creaturesTracked: 1000,
      meditationHours: 1000,
      songsPerformed: 1000,
      potionsBrewed: 1000,
      animalsBonded: 1000,
      spiritsCommuned: 1000,
      undeadDefeated: 1000,
      fireDamage: 10000,
      iceDamage: 10000,
      lightningDamage: 10000,
      earthDamage: 10000,
      enemiesDefeated: 1000,
      stamina: 1000,
      honor: 1000,
      questsCompleted: 1000,
      criticalHits: 1000,
      accuracy: 1000,
      arrowsCrafted: 1000,
      rangedKills: 1000,
      manaUsed: 1000,
      spellsLearned: 1000,
      arcaneKnowledge: 1000,
      magicDuelsWon: 1000,
      secretsFound: 1000,
      stealth: 1000,
      mapsDrawn: 1000,
      hiddenPathsDiscovered: 1000,
      fightsWon: 1000,
      strength: 1000,
      brawlsSurvived: 1000,
      tournamentsWon: 1000,
      alliesSaved: 1000,
      healingSpells: 1000,
      empathy: 1000,
      livesRestored: 1000,
      locksPicked: 1000,
      treasuresFound: 1000,
      heistsCompleted: 1000,
      itemsRepaired: 1000,
      craftingSkill: 1000,
      blueprintsCreated: 1000,
      inventionsMade: 1000,
      beastsTamed: 1000,
      wildernessLore: 1000,
      pathsBlazed: 1000,
      legendaryBeastsTamed: 1000,
      innerPeace: 1000,
      insightsGained: 1000,
      discipline: 1000,
      spiritualQuests: 1000,
      alliesInspired: 1000,
      charisma: 1000,
      talesTold: 1000,
      legendaryPerformances: 1000,
      recipesDiscovered: 1000,
      alchemySkill: 1000,
      rareIngredientsUsed: 1000,
      legendaryPotions: 1000,
      grovesProtected: 1000,
      natureLore: 1000,
      natureRituals: 1000,
      sacredGrovesRestored: 1000,
      evilSpiritsBanished: 1000,
      spiritualPower: 1000,
      ritualsPerformed: 1000,
      ancientSpiritsSummoned: 1000,
      undeadRaised: 1000,
      necromanticPower: 1000,
      gravesDesecrated: 1000,
      lichRituals: 1000,
      enemiesIgnited: 1000,
      fireMastery: 1000,
      fireSpellsCast: 1000,
      infernosCreated: 1000,
      enemiesFrozen: 1000,
      iceMastery: 1000,
      iceSpellsCast: 1000,
      blizzardsSummoned: 1000,
      enemiesShocked: 1000,
      lightningMastery: 1000,
      lightningSpellsCast: 1000,
      thunderstormsSummoned: 1000,
      barriersCreated: 1000,
      earthMastery: 1000,
      earthSpellsCast: 1000,
      earthquakesCaused: 1000,
      alliesDefended: 1000,
      foesSlain: 1000,
      oathsSworn: 1000,
      rangedKills: 1000,
      specialArrowsCrafted: 1000,
      legendaryShots: 1000,
      spellTypesLearned: 1000,
      arcaneMastery: 1000,
      magicArtifactsFound: 1000,
      locationsDiscovered: 1000,
      artifactsFound: 1000,
      regionsMapped: 1000,
      lostCitiesFound: 1000,
      duelsWon: 1000,
      championsDefeated: 1000,
      battlesSurvived: 1000,
      legendaryFoesSlain: 1000,
      divineFavor: 1000,
      holyRituals: 1000,
      miraclesPerformed: 1000,
      trapsDisarmed: 1000,
      masterHeists: 1000,
      machinesRepaired: 1000,
      engineeringSkill: 1000,
      automatonsBuilt: 1000,
      masterInventions: 1000,
      animalBond: 1000,
      rareBeastsTamed: 1000,
      mythicalBeastsTamed: 1000,
      luxuriesAbstained: 1000,
      wisdomGained: 1000,
      enlightenmentMoments: 1000,
      performanceSkill: 1000,
      crowdsEnchanted: 1000,
      epicBallads: 1000,
      forestsProtected: 1000,
      natureMastery: 1000,
      undeadControlled: 1000,
      necromanticMastery: 1000,
      cryptsRaided: 1000,
      darkRituals: 1000,
      areasIgnited: 1000,
      fireElementalsSummoned: 1000,
      infernalPacts: 1000,
      areasFrozen: 1000,
      iceElementalsSummoned: 1000,
      glacialRituals: 1000,
      stormsSummoned: 1000,
      thunderboltsCalled: 1000,
      tempestRituals: 1000,
      terrainsShaped: 1000,
      earthElementalsSummoned: 1000,
      tectonicRituals: 1000,
      evilCreaturesSlain: 1000,
      holyPower: 1000,
      sacredRelicsFound: 1000,
      precision: 1000,
      spellSchoolsMastered: 1000,
      arcanePower: 1000,
      spellsCreated: 1000,
      arcaneRelicsFound: 1000,
      trapsSurvived: 1000,
      explorationSkill: 1000,
      hiddenPathsFound: 1000,
      lostRealmsDiscovered: 1000,
      rageUses: 1000,
      warriorSpirit: 1000,
      battlesWon: 1000,
      warTrophies: 1000,
      alliesResurrected: 1000,
      divineMastery: 1000,
      holyRelics: 1000,
      divineMiracles: 1000,
      targetsKilledUndetected: 1000,
      sabotagesCompleted: 1000,
      assassinationContracts: 1000,
      legendaryMarks: 1000,
      mechanicalMastery: 1000,
      devicesInvented: 1000,
      masterContraptions: 1000,
      creaturesProtected: 1000,
      wildernessMastery: 1000,
      mythicalCreaturesBound: 1000,
      studentsTaught: 1000,
      treatisesWritten: 1000,
      wisdomMastery: 1000,
      enlightenedTeachings: 1000,
      epicSongsPerformed: 1000,
      bardicMastery: 1000,
      legendaryTalesTold: 1000,
      mythicPerformances: 1000,
      diseasesCured: 1000,
      alchemicalMastery: 1000,
      rareElixirsCrafted: 1000,
      panaceasCreated: 1000,
      ecosystemsRestored: 1000,
      sacredGrovesProtected: 1000,
      primalForcesHarnessed: 1000,
      spiritsSummoned: 1000,
      ethericMastery: 1000,
      ghostlyPacts: 1000,
      phantomLegions: 1000,
      undeadArmiesControlled: 1000,
      cryptsConquered: 1000,
      deathRealmsTouched: 1000,
      infernalMastery: 1000,
      hellfireCast: 1000,
      demonicPacts: 1000,
      battlefieldsFrozen: 1000,
      glacialMastery: 1000,
      eternalFrostRituals: 1000,
      tempestMastery: 1000,
      thunderboltsStruck: 1000,
      stormGodPacts: 1000,
      terrainsReshaped: 1000,
      terraMastery: 1000,
      geologicalRituals: 1000,
      holyQuestsCompleted: 1000,
      divineMight: 1000,
      sacredRelicsRecovered: 1000,
      holyWarsWon: 1000,
      marksmanship: 1000,
      legendaryKills: 1000,
      explorationMastery: 1000,
      hiddenRealmsFound: 1000,
      forgottenKingdomsDiscovered: 1000,
      leadership: 1000,
      armiesLed: 1000,
      conquestsAchieved: 1000,
      sacredRituals: 1000,
      divineVisions: 1000,
      pursuitsEvaded: 1000,
      shadowMastery: 1000,
      masterAssassinations: 1000,
      artificeMastery: 1000,
      mechanicalWonders: 1000,
      legendaryContraptions: 1000,
      guardianMastery: 1000,
      mythicalGuardians: 1000,
      philosophicalDebatesWon: 1000,
      universalTruthsDiscovered: 1000,
      templarMastery: 1000,
      holyRelicsGuarded: 1000,
      divineCrusadesLed: 1000,
      previousClass: previousClass
    };
  }

  // Helper function to extract stats used in a requirement
    function extractRelevantStats(requirement, stats) {
      const statKeys = [];
      const regex = /stats\.([a-zA-Z0-9]+)/g;
      let match;
      while ((match = regex.exec(requirement)) !== null) {
        statKeys.push(match[1]);
      }
      const relevantStats = {};
      statKeys.forEach(key => {
        if (stats.hasOwnProperty(key)) {
          relevantStats[key] = stats[key];
        }
      });
      return relevantStats;
    }

    // Helper function to safely evaluate requirement string
    function evaluateRequirement(requirement, stats) {
      console.log('[DEBUG] Evaluating requirement:', requirement);
      try {
        // Remove the function wrapper and evaluate the condition
        const condition = requirement.match(/^\(stats\) => (.*)$/);
        if (!condition || !condition[1]) {
          console.error('[ERROR] Invalid requirement format:', requirement);
          throw new Error('Invalid requirement format');
        }
        console.log('[DEBUG] Parsed condition:', condition[1]);

        // Log relevant stats
        const relevantStats = extractRelevantStats(requirement, stats);
        console.log('[DEBUG] Relevant stats for evaluation:', JSON.stringify(relevantStats, null, 2));

        // Use Function constructor to avoid eval risks
        const fn = new Function('stats', `return ${condition[1]}`);
        const result = fn(stats);
        console.log('[DEBUG] Evaluation result:', result);
        return result;
      } catch (error) {
        console.error('[ERROR] Requirement evaluation failed:', error.message);
        console.error('[ERROR] Stack trace:', error.stack);
        return { error: error.message };
      }
    }

    // Test each tier
    evolutionsData.tiers.forEach((tier, tierIndex) => {
      describe(`Tier ${tierIndex + 1}: ${tier.name}`, function () {
        before(function () {
          console.log(`[SETUP] Testing Tier ${tierIndex + 1}: ${tier.name}`);
          console.log(`[SETUP] Number of classes: ${tier.classes.length}`);
        });

        tier.classes.forEach((classDef) => {
          describe(`Class: ${classDef.name}`, function () {
            before(function () {
              console.log(`[SETUP] Testing Class: ${classDef.name}`);
              console.log(`[SETUP] From class (if any): ${classDef.from || 'None'}`);
            });

            // Test each rarity level
            ['common', 'uncommon', 'rare', 'epic', 'legendary'].forEach((rarity) => {
              it(`should have achievable ${rarity} requirements`, function () {
                console.log(`[TEST] Testing ${rarity} requirements for ${classDef.name}`);
                const requirement = classDef.requirements[rarity];
                console.log('[TEST] Requirement string:', requirement);

                // Set previousClass for Tier 2 and 3 classes
                console.log('[TEST] Creating stats with previousClass:', classDef.from || 'None');
                const stats = createMaxStats(classDef.from || null);

                const result = evaluateRequirement(requirement, stats);

                // Check if evaluation resulted in an error
                if (result && typeof result === 'object' && result.error) {
                  console.error(`[TEST] Failed: Requirement evaluation error for ${classDef.name} (${rarity})`);
                  expect.fail(`Requirement evaluation failed: ${result.error}`);
                }

                // Check if requirement is achievable
                console.log(`[TEST] Result for ${classDef.name} (${rarity}):`, result);
                if (result !== true) {
                  console.warn(`[TEST] Requirement not met for ${classDef.name} (${rarity})`);
                  console.warn('[TEST] Relevant stats:', JSON.stringify(extractRelevantStats(requirement, stats), null, 2));
                }
                expect(result).to.be.true;
              });

              afterEach(function () {
                console.log(`[CLEANUP] Completed test for ${classDef.name} (${rarity})`);
              });
            });
          });
        });
      });
    });

    after(function () {
      console.log('[CLEANUP] All Evolutions Achievability Tests completed');
    });
});