import json

def get_effect_ids_from_skills(skills_data):
    effect_ids = set()
    
    for skill in skills_data.values():
        if skill.get('effects'):
            for effect in skill['effects']:
                if isinstance(effect, dict) and 'id' in effect:
                    effect_ids.add(effect['id'])
    
    return effect_ids

def get_effect_ids_from_effects(effects_data):
    return set(effects_data.keys())

def main():
    # Read skills.json
    with open('../Data/skills.json', 'r') as f:
        skills_data = json.load(f)
    
    # Read effects.json
    with open('../Data/effects.json', 'r') as f:
        effects_data = json.load(f)
    
    # Get all effect IDs from skills
    skill_effect_ids = get_effect_ids_from_skills(skills_data)
    
    # Get all effect IDs from effects
    defined_effect_ids = get_effect_ids_from_effects(effects_data)
    
    # Find missing effects (effects used in skills but not defined in effects.json)
    missing_effects = skill_effect_ids - defined_effect_ids
    
    # Print results
    print("Effects used in skills but not defined in effects.json:")
    for effect_id in sorted(missing_effects):
        print(f"- {effect_id}")

if __name__ == "__main__":
    main() 