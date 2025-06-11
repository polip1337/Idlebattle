import json
import os

def reorder_effects():
    # Read the effects.json file
    with open('Data/effects.json', 'r') as f:
        effects = json.load(f)
    
    # Create a new dictionary with sorted keys
    sorted_effects = {}
    for key in sorted(effects.keys()):
        sorted_effects[key] = effects[key]
    
    # Write the sorted effects back to the file
    with open('Data/effects.json', 'w') as f:
        json.dump(sorted_effects, f, indent=2)

if __name__ == "__main__":
    reorder_effects() 