import json
import os

def format_json_file(file_path):
    # Read the JSON file
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Process each skill
    for skill_id, skill in data.items():
        # Format and sort tags if they exist
        if 'tags' in skill:
            skill['tags'] = sorted(skill['tags'])
        
        # Format and sort targeting modes if they exist
        if 'targetingModes' in skill:
            skill['targetingModes'] = sorted(skill['targetingModes'])
    
    # Write back to file with proper formatting
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def main():
    # Process all JSON files in the Data directory
    data_dir = 'Data'
    for filename in os.listdir(data_dir):
        if filename.endswith('.json'):
            file_path = os.path.join(data_dir, filename)
            print(f"Processing {file_path}...")
            format_json_file(file_path)
            print(f"Finished processing {file_path}")

if __name__ == "__main__":
    main() 